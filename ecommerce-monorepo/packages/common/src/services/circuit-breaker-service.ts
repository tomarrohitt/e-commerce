// src/services/circuit-breaker.service.ts

import { EventEmitter } from "events";
import { CircuitBreakerOpenError } from "../errors/circuit-breaker-error";
import { CIRCUIT_BREAKER_DEFAULTS } from "../constants";
import { ILogger, LoggerFactory } from "./logger-service";

export enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerStateChange {
  from: CircuitBreakerState;
  to: CircuitBreakerState;
  timestamp: number;
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  halfOpenRequests?: number;
  fallback?: (error: Error) => any;
  onStateChange?: (state: CircuitBreakerStateChange) => void;
  name?: string;
}

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failures: number;
  consecutiveSuccesses: number;
  nextAttemptTime: number;
  halfOpenCount: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}

export class CircuitBreaker extends EventEmitter {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures = 0;
  private consecutiveSuccesses = 0;
  private halfOpenCount = 0;
  private nextAttemptTime = 0;

  // Metrics
  private totalRequests = 0;
  private successfulRequests = 0;
  private failedRequests = 0;

  // ✅ FIX: Use a lock to prevent race conditions in half-open state
  private halfOpenLock = false;

  private readonly config: Required<
    Omit<CircuitBreakerOptions, "fallback" | "onStateChange">
  >;
  private readonly fallback?: (error: Error) => any;
  private readonly logger: ILogger;

  constructor(options: CircuitBreakerOptions = {}) {
    super();

    this.config = {
      name: options.name || "CircuitBreaker",
      failureThreshold:
        options.failureThreshold ?? CIRCUIT_BREAKER_DEFAULTS.FAILURE_THRESHOLD,
      resetTimeout:
        options.resetTimeout ?? CIRCUIT_BREAKER_DEFAULTS.RESET_TIMEOUT,
      halfOpenRequests:
        options.halfOpenRequests ?? CIRCUIT_BREAKER_DEFAULTS.HALF_OPEN_REQUESTS,
    };

    this.fallback = options.fallback;
    this.logger = LoggerFactory.create(this.config.name);

    if (options.onStateChange) {
      this.on("stateChanged", options.onStateChange);
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // OPEN STATE: Check if we can attempt recovery
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() >= this.nextAttemptTime) {
        this.transition(CircuitBreakerState.HALF_OPEN);
      } else {
        const error = new CircuitBreakerOpenError(
          `${this.config.name}: Circuit is OPEN`,
        );

        if (this.fallback) {
          return this.fallback(error);
        }

        throw error;
      }
    }

    // ✅ FIXED: Atomic half-open slot acquisition
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (!this.acquireHalfOpenSlot()) {
        const error = new CircuitBreakerOpenError(
          `${this.config.name}: Circuit is testing (Half-Open limit reached)`,
        );

        if (this.fallback) {
          return this.fallback(error);
        }

        throw error;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error: any) {
      if (this.shouldTripBreaker(error)) {
        this.onFailure();
      } else {
        // Client errors (4xx) don't trip the breaker
        this.onSuccess();
      }

      throw error;
    }
  }

  // ✅ FIXED: Atomic slot acquisition for half-open state
  private acquireHalfOpenSlot(): boolean {
    // Simple lock mechanism - not production-grade for multi-threaded scenarios
    // For Node.js single-threaded event loop, this is sufficient
    if (this.halfOpenLock) {
      return false;
    }

    this.halfOpenLock = true;

    const canAcquire = this.halfOpenCount < this.config.halfOpenRequests;

    if (canAcquire) {
      this.halfOpenCount++;
    }

    this.halfOpenLock = false;

    return canAcquire;
  }

  private onSuccess(): void {
    this.successfulRequests++;

    // Release half-open slot
    if (
      this.state === CircuitBreakerState.HALF_OPEN &&
      this.halfOpenCount > 0
    ) {
      this.halfOpenCount--;
    }

    this.failures = 0;
    this.consecutiveSuccesses++;

    // Recover from HALF_OPEN to CLOSED
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.consecutiveSuccesses >= this.config.halfOpenRequests) {
        this.transition(CircuitBreakerState.CLOSED);
        this.logger.info("Circuit recovered and closed");
      }
    }
  }

  private onFailure(): void {
    this.failedRequests++;
    this.failures++;
    this.consecutiveSuccesses = 0;

    // Immediate trip from HALF_OPEN
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.transition(CircuitBreakerState.OPEN);
      this.scheduleReset();
      this.logger.warn("Circuit opened during recovery attempt");
      return;
    }

    // Trip from CLOSED if threshold exceeded
    if (this.failures >= this.config.failureThreshold) {
      this.transition(CircuitBreakerState.OPEN);
      this.scheduleReset();
      this.logger.warn("Circuit opened due to failure threshold", {
        failures: this.failures,
        threshold: this.config.failureThreshold,
      });
    }
  }

  private scheduleReset(): void {
    this.nextAttemptTime = Date.now() + this.config.resetTimeout;
  }

  private transition(newState: CircuitBreakerState): void {
    const oldState = this.state;

    if (oldState === newState) return;

    this.state = newState;

    // Reset counters on state change
    if (
      newState === CircuitBreakerState.OPEN ||
      newState === CircuitBreakerState.CLOSED
    ) {
      this.halfOpenCount = 0;
      this.consecutiveSuccesses = 0;
    }

    const stateChange: CircuitBreakerStateChange = {
      from: oldState,
      to: newState,
      timestamp: Date.now(),
    };

    this.emit("stateChanged", stateChange);

    this.logger.info("Circuit state changed", {
      from: oldState,
      to: newState,
    });
  }

  private shouldTripBreaker(error: any): boolean {
    // Client errors (4xx) shouldn't trip the breaker
    const status = error.response?.status;

    if (status && status >= 400 && status < 500) {
      return false;
    }

    // Network errors, 5xx, timeouts should trip the breaker
    return true;
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      nextAttemptTime: this.nextAttemptTime,
      halfOpenCount: this.halfOpenCount,
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
    };
  }

  reset(): void {
    this.failures = 0;
    this.consecutiveSuccesses = 0;
    this.halfOpenCount = 0;
    this.transition(CircuitBreakerState.CLOSED);
    this.logger.info("Circuit breaker manually reset");
  }

  forceOpen(): void {
    this.transition(CircuitBreakerState.OPEN);
    this.scheduleReset();
    this.logger.warn("Circuit breaker manually opened");
  }
}
