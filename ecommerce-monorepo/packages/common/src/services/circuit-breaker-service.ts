import { EventEmitter } from "events";
import { CircuitBreakerOpenError } from "../errors/circuit-breaker-error";

export enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerStateChange {
  from: CircuitBreakerState;
  to: CircuitBreakerState;
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenRequests?: number;
  fallback?: (error: Error) => any;
  onStateChange?: (state: CircuitBreakerStateChange) => void;
}

export class CircuitBreaker extends EventEmitter {
  private halfOpenCount = 0; // Tracks active probes
  private failures = 0;
  private consecutiveSuccesses = 0;
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private nextAttemptTime = 0;

  constructor(private options: CircuitBreakerOptions) {
    super();
    if (options.onStateChange) {
      this.on("stateChanged", options.onStateChange);
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // 1. OPEN STATE Check
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() > this.nextAttemptTime) {
        this.transition(CircuitBreakerState.HALF_OPEN);
      } else {
        const error = new CircuitBreakerOpenError();
        if (this.options.fallback) return this.options.fallback(error);
        throw error;
      }
    }

    // 2. HALF-OPEN Concurrency Limit
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.halfOpenCount >= (this.options.halfOpenRequests || 1)) {
        const error = new CircuitBreakerOpenError(
          "Circuit is testing connection (Half-Open Limit)"
        );
        if (this.options.fallback) return this.options.fallback(error);
        throw error;
      }
      this.halfOpenCount++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error: any) {
      // 3. SYSTEM FAILURE (500, Network) -> Trip Breaker
      if (this.shouldTripBreaker(error)) {
        this.onFailure();
      }
      // 4. CLIENT ERROR (400, 401, 404) -> Treat as Success (Service is alive)
      else {
        this.onSuccess();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    // If we were testing the connection, release the "slot"
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.halfOpenCount--;
    }

    this.failures = 0;
    this.consecutiveSuccesses++;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      const threshold = this.options.halfOpenRequests || 1;
      if (this.consecutiveSuccesses >= threshold) {
        this.transition(CircuitBreakerState.CLOSED);
        console.log("✅ Circuit Breaker CLOSED (recovered)");
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.consecutiveSuccesses = 0;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.transition(CircuitBreakerState.OPEN);
      this.scheduleReset(); // 👈 Here it is called
    } else if (this.failures >= this.options.failureThreshold) {
      this.transition(CircuitBreakerState.OPEN);
      this.scheduleReset(); // 👈 Here it is called
    }
  }

  private scheduleReset(): void {
    this.nextAttemptTime = Date.now() + this.options.resetTimeout;
  }

  private transition(newState: CircuitBreakerState): void {
    const oldState = this.state;
    this.state = newState;

    if (
      newState === CircuitBreakerState.OPEN ||
      newState === CircuitBreakerState.CLOSED
    ) {
      this.halfOpenCount = 0;
      this.consecutiveSuccesses = 0;
    }

    this.emit("stateChanged", { from: oldState, to: newState });

    if (newState === CircuitBreakerState.OPEN) {
      console.warn(`⚠️ Circuit Breaker OPENED (failures: ${this.failures})`);
    }
  }

  private shouldTripBreaker(error: any): boolean {
    if (error.response?.status) {
      const status = error.response.status;
      if (status >= 400 && status < 500) {
        return false;
      }
    }
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
      halfOpenCount: this.halfOpenCount,
    };
  }

  reset(): void {
    this.failures = 0;
    this.consecutiveSuccesses = 0;
    this.transition(CircuitBreakerState.CLOSED);
  }

  forceOpen(): void {
    this.transition(CircuitBreakerState.OPEN);
    this.scheduleReset();
  }
}
