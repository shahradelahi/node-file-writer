import type { PathLike } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Generates a hidden temporary file path in the same directory as the target file.
 * Example: `/some/file.txt` -> `/some/.file.txt.tmp`
 */
export function getTempFilename(file: PathLike): string {
  const filePath = file instanceof URL ? fileURLToPath(file) : file.toString();
  return join(dirname(filePath), `.${basename(filePath)}.tmp`);
}
