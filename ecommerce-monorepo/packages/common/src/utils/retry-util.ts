import { LoggerFactory } from "../services/logger-service";

const logger = LoggerFactory.create("RetryUtil");

export interface RetryOptions {
  retries?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

export class RetryUtil {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<T> {
    const {
      retries = 3,
      delay = 200,
      backoff = true,
      onRetry,
      shouldRetry,
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (shouldRetry && !shouldRetry(lastError)) {
          throw lastError;
        }

        const isLastAttempt = attempt === retries;

        if (isLastAttempt) {
          throw lastError;
        }

        const waitTime = backoff ? delay * attempt : delay;

        logger.info("Retrying operation", {
          attempt,
          totalRetries: retries,
          waitTime,
        });

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        await this.sleep(waitTime);
      }
    }

    throw lastError!;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static calculateBackoff(
    attempt: number,
    baseDelay: number = 100,
    maxDelay: number = 10000,
  ): number {
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, attempt),
      maxDelay,
    );
    const jitter = Math.random() * 0.3 * exponentialDelay;
    return Math.floor(exponentialDelay + jitter);
  }
}

// Backward compatibility
export const withRetry = RetryUtil.withRetry.bind(RetryUtil);
