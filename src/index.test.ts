import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { FileWriter, FileWriterError, getTempFilename } from './index';

describe('Path Utils', () => {
  test('should generate temporary filename from string path and URL', () => {
    expect(getTempFilename('/tmp/data.json')).toBe(join('/tmp', '.data.json.tmp'));

    const url = pathToFileURL('/tmp/data.json');
    expect(getTempFilename(url)).toBe(join('/tmp', '.data.json.tmp'));
  });
});

describe('FileWriter', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'file-writer-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('should handle concurrent writes safely without race conditions', async () => {
    const max = 1000;
    const file = join(tempDir, 'file.txt');
    const fileURL = pathToFileURL(join(tempDir, 'fileURL.txt'));

    for (const target of [file, fileURL]) {
      const writer = new FileWriter(target);
      const promises: Promise<void>[] = [];

      for (let i = 1; i <= max; i++) {
        promises.push(writer.write(String(i)));
      }

      await Promise.all(promises);
      expect(Number.parseInt(readFileSync(target, 'utf-8'), 10)).toBe(max);
    }
  });

  test('should write binary Uint8Array buffers', async () => {
    const file = join(tempDir, 'binary.bin');
    const writer = new FileWriter(file);
    const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);

    await writer.write(data);
    expect(Array.from(readFileSync(file))).toEqual([1, 2, 3, 4]);
  });

  test('should throw FileWriterError when writing to a non-existent directory', async () => {
    const invalidPath = join(tempDir, 'non-existent', 'file.txt');
    const writer = new FileWriter(invalidPath, {
      retry: { maxRetries: 1, delayMs: 10 },
    });

    await expect(writer.write('hello')).rejects.toThrow(FileWriterError);
  });
});
