import { DEFAULT_MAX_RETRIES, DEFAULT_RETRY_DELAY } from '../constants';
import type { RetryOptions } from '../typings';

export async function retryAsyncOperation(
  fn: () => Promise<void>,
  options: RetryOptions = {}
): Promise<void> {
  const maxRetries = Math.max(1, options.maxRetries ?? DEFAULT_MAX_RETRIES);
  const delayMs = options.delayMs ?? DEFAULT_RETRY_DELAY;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
}
