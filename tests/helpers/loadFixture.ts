import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The repo root, found from this file's own location rather than from
// process.cwd(), so a test run from another folder still reads the right files.
const repoRoot = new URL('../../', import.meta.url);

function pathOf(relativePath: string): string {
  return fileURLToPath(new URL(relativePath, repoRoot));
}

/** Reads a file relative to the repo root as UTF-8 text. */
export function readRepoFile(relativePath: string): string {
  return readFileSync(pathOf(relativePath), 'utf8');
}

/** Loads a JSON test fixture relative to the repo root. */
export function loadFixture<T>(relativePath: string): T {
  return JSON.parse(readRepoFile(relativePath)) as T;
}
