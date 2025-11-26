import { EventEmitter } from "events";
import { EventBusService } from "./event-bus-service";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenRequests?: number; // How many requests to try in HALF_OPEN state
  fallback?: (error: Error) => any;
  onStateChange?: (state: CircuitBreakerState) => void;
}

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export class CircuitBreaker extends EventEmitter {
  private failures = 0;
  private consecutiveSuccesses = 0;
  private state: CircuitBreakerState = "CLOSED";
  private nextAttemptTime = 0;

  constructor(private options: CircuitBreakerOptions) {
    super();

    // Attach listener for monitoring
    if (options.onStateChange) {
      this.on("stateChanged", options.onStateChange);
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextAttemptTime) {
        this.transition("HALF_OPEN");
      } else {
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
      if (this.shouldTripBreaker(error)) {
        this.onFailure();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.consecutiveSuccesses++;

    if (this.state === "HALF_OPEN") {
      const threshold = this.options.halfOpenRequests || 1;
      if (this.consecutiveSuccesses >= threshold) {
        this.transition("CLOSED");
        this.consecutiveSuccesses = 0;
        console.log("✅ Circuit Breaker CLOSED (recovered)");
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.consecutiveSuccesses = 0;

    if (this.state === "HALF_OPEN") {
      this.transition("OPEN");
      this.scheduleReset();
    } else if (this.failures >= this.options.failureThreshold) {
      this.transition("OPEN");
      this.scheduleReset();
    }
  }

  private scheduleReset(): void {
    this.nextAttemptTime = Date.now() + this.options.resetTimeout;
  }

  private transition(newState: CircuitBreakerState): void {
    const oldState = this.state;
    this.state = newState;
    this.emit("stateChanged", { from: oldState, to: newState });

    if (newState === "OPEN") {
      console.warn(`⚠️ Circuit Breaker OPENED (failures: ${this.failures})`);
    }
  }

  private shouldTripBreaker(error: any): boolean {
    // Axios error with status code
    if (error.response?.status) {
      const status = error.response.status;
      // 4xx errors are client errors, don't trip breaker
      if (status >= 400 && status < 500) {
        return false;
      }
    }

    // Network errors, timeouts, 5xx errors should trip
    return true;
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getMetrics() {
    return {
      state: this.state,
      failures: this.failures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      nextAttemptTime: this.nextAttemptTime,
    };
  }

  // Manual control (for testing or emergency)
  reset(): void {
    this.failures = 0;
    this.consecutiveSuccesses = 0;
    this.transition("CLOSED");
  }

  forceOpen(): void {
    this.transition("OPEN");
    this.scheduleReset();
  }
}
