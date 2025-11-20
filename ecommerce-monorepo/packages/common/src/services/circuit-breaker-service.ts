import { EventEmitter } from "events";

interface CircuitBreakerOptions {
  failureThreshold: number; // How many failures before opening
  resetTimeout: number; // How long to wait before retrying (ms)
  fallback?: (error: Error) => any; // Optional global fallback
}

export class CircuitBreaker extends EventEmitter {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  private nextAttemptTime = 0;

  constructor(private options: CircuitBreakerOptions) {
    super();
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      // Check if we should try a probe request
      if (Date.now() > this.nextAttemptTime) {
        this.transition("HALF_OPEN");
      } else {
        // Circuit is strictly open, return failure or fallback
        const error = new Error("Circuit breaker is OPEN");
        if (this.options.fallback) {
          return this.options.fallback(error);
        }
        throw error;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error: any) {
      // CRITICAL: Only trip on 5xx errors or network failures
      // Ignore 4xx errors (Bad Request, Unauthorized) as they are not system failures
      if (this.shouldTripBreaker(error)) {
        this.onFailure();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === "HALF_OPEN") {
      this.transition("CLOSED");
      console.log("Circuit Breaker closed (recovered)");
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF_OPEN") {
      this.transition("OPEN");
      this.nextAttemptTime = Date.now() + this.options.resetTimeout;
    } else if (this.failures >= this.options.failureThreshold) {
      this.transition("OPEN");
      this.nextAttemptTime = Date.now() + this.options.resetTimeout;
    }
  }

  private transition(newState: "CLOSED" | "OPEN" | "HALF_OPEN"): void {
    this.state = newState;
    this.emit("stateChanged", newState);

    if (newState === "OPEN") {
      console.warn("Circuit Breaker OPENED");
    }
  }

  // Helper to distinguish System Errors vs User Errors
  private shouldTripBreaker(error: any): boolean {
    if (error.response && error.response.status) {
      const status = error.response.status;
      if (status >= 400 && status < 500) {
        return false;
      }
    }
    return true;
  }
}
