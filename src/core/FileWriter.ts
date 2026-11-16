import type { PathLike } from 'node:fs';
import { rename, writeFile } from 'node:fs/promises';

import { DEFAULT_ENCODING, DEFAULT_MAX_RETRIES, DEFAULT_RETRY_DELAY } from '../constants';
import { FileWriterError } from '../errors';
import type { FileWriterOptions, RetryOptions, WriteData } from '../typings';
import { getTempFilename } from '../utils/path';
import { retryAsyncOperation } from '../utils/retry';

type Resolve = () => void;
type Reject = (error: Error) => void;

export class FileWriter {
  readonly #filename: PathLike;
  readonly #tempFilename: PathLike;
  readonly #encoding: BufferEncoding;
  readonly #retry: Required<RetryOptions>;
  #locked = false;
  #prev: [Resolve, Reject] | null = null;
  #next: [Resolve, Reject] | null = null;
  #nextPromise: Promise<void> | null = null;
  #nextData: WriteData | null = null;

  constructor(filename: PathLike, options: FileWriterOptions = {}) {
    this.#filename = filename;
    this.#tempFilename = options.tempFilename ?? getTempFilename(filename);
    this.#encoding = options.encoding ?? DEFAULT_ENCODING;
    this.#retry = {
      maxRetries: options.retry?.maxRetries ?? DEFAULT_MAX_RETRIES,
      delayMs: options.retry?.delayMs ?? DEFAULT_RETRY_DELAY,
    };
  }

  get filename(): PathLike {
    return this.#filename;
  }

  get tempFilename(): PathLike {
    return this.#tempFilename;
  }

  get isLocked(): boolean {
    return this.#locked;
  }

  async write(data: WriteData): Promise<void> {
    return this.#locked ? this.#enqueue(data) : this.#write(data);
  }

  #enqueue(data: WriteData): Promise<void> {
    // Coalesce pending writes by keeping only the most recent payload
    this.#nextData = data;

    this.#nextPromise ??= new Promise((resolve, reject) => {
      this.#next = [resolve, reject];
    });

    return new Promise((resolve, reject) => {
      this.#nextPromise?.then(resolve).catch(reject);
    });
  }

  async #write(data: WriteData): Promise<void> {
    this.#locked = true;
    const prev = this.#prev;

    try {
      await writeFile(this.#tempFilename, data, { encoding: this.#encoding });
      await retryAsyncOperation(async () => {
        await rename(this.#tempFilename, this.#filename);
      }, this.#retry);

      prev?.[0]();
    } catch (err) {
      const error =
        err instanceof Error
          ? new FileWriterError(`Failed to write file: ${err.message}`, { cause: err })
          : new FileWriterError('Failed to write file', { cause: err });

      prev?.[1](error);
      throw error;
    } finally {
      this.#locked = false;

      this.#prev = this.#next;
      this.#next = null;
      this.#nextPromise = null;

      if (this.#nextData !== null) {
        const nextData = this.#nextData;
        this.#nextData = null;
        await this.write(nextData).catch(() => {
          // Next write errors are already forwarded to the queued promise via #prev[1]
        });
      }
    }
  }
}
