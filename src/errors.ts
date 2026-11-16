export class FileWriterError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message);
    this.name = 'FileWriterError';
    this.cause = options?.cause;
    Object.setPrototypeOf(this, FileWriterError.prototype);
  }
}
