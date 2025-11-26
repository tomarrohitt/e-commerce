interface RetryOptions {
  retries?: number;
  delay?: number;
  backoff?: boolean;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { retries = 3, delay = 200, backoff = true } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt === retries;

      if (isLastAttempt) {
        throw error;
      }

      const waitTime = backoff ? delay * attempt : delay;
      console.info(
        "Retry",
        `Operation failed (Attempt ${attempt}/${retries}). Retrying in ${waitTime}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error("Unreachable code");
}
