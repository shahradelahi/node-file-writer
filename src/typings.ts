import type { PathLike } from 'node:fs';
import type { writeFile } from 'node:fs/promises';

export type WriteData = Parameters<typeof writeFile>[1];

export interface RetryOptions {
  /** Maximum number of attempts before failing. Default: `10`. */
  maxRetries?: number;
  /** Delay in milliseconds between retry attempts. Default: `100`. */
  delayMs?: number;
}

export interface FileWriterOptions {
  /** Character encoding used when writing string data. Default: `'utf-8'`. */
  encoding?: BufferEncoding;
  /** Custom temporary file path used for atomic writes. */
  tempFilename?: PathLike;
  /** Retry configuration for atomic rename operations. */
  retry?: RetryOptions;
}
