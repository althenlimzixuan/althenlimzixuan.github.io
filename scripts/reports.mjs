// `npm run reports -- <out dir>`: the phase's one report command. Writes
// unit_test.html, regression.html and profiling.html into a folder under
// _test_reports/ and exits 1 when any check failed. The logic lives in
// report-lib.mjs; this file only wires it to the real processes and files.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveOutDir, runReports } from './report-lib.mjs';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));

function fail(message) {
  console.error(`reports: ${message}`);
  process.exit(1);
}

// Preflight: fail in seconds, with the fix in one line.
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 12)) fail('install Node 22.12 or later');
if (!existsSync(join(repoRoot, 'node_modules'))) fail('run npm ci');

const arg = process.argv[2];
if (!arg) fail('give the report folder, e.g. npm run reports -- _test_reports/site/2026-11-28-18-001-slug');
let outDir;
try {
  outDir = resolveOutDir(arg, repoRoot);
} catch (e) {
  fail(e.message);
}
mkdirSync(outDir, { recursive: true });

const dist = join(repoRoot, 'dist');

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? htmlFiles(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : [],
  );
}

function listPages() {
  if (!existsSync(dist)) return [];
  return htmlFiles(dist).map((file) => {
    const html = readFileSync(file, 'utf8');
    const css = [...html.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)]
      .map((m) => join(dist, m[1]))
      .filter((p) => existsSync(p))
      .reduce((n, p) => n + statSync(p).size, 0);
    return {
      path: relative(dist, file).replace(/\\/g, '/'),
      kb: statSync(file).size / 1024,
      cssKb: css / 1024,
    };
  });
}

const vitestJson = join(outDir, 'vitest.json');
const startedAt = Date.now();
// Ten minutes per command, so a hung command ends as "killed" instead of
// holding the report forever.
const COMMAND_TIMEOUT_MS = 600_000;
// Pages and command lines show repo-relative paths, never this machine's folders.
const shown = relative(repoRoot, outDir).replace(/\\/g, '/');
const toRepoPath = (name) => relative(repoRoot, name).replace(/\\/g, '/');

const code = runReports({
  outDir: shown,
  // Node runs each script directly, with no shell, so no argument is ever
  // read as shell syntax.
  run: (args) => {
    console.log(`reports: node ${args.join(' ')}`);
    const start = performance.now();
    const r = spawnSync(process.execPath, args, { cwd: repoRoot, stdio: 'inherit', timeout: COMMAND_TIMEOUT_MS });
    if (r.error) console.error(`reports: ${args[0]}: ${r.error.message}`);
    return { status: r.status, ms: performance.now() - start, error: r.error?.message };
  },
  // Only this run's result counts: a file left by an earlier run, or one that
  // is not valid JSON, is reported as no result.
  readVitest: () => {
    if (!existsSync(vitestJson) || statSync(vitestJson).mtimeMs < startedAt) return null;
    try {
      const json = JSON.parse(readFileSync(vitestJson, 'utf8'));
      for (const file of json.testResults ?? []) file.name = toRepoPath(file.name);
      return json;
    } catch (e) {
      console.error(`reports: vitest.json is not valid JSON: ${e.message}`);
      return null;
    }
  },
  listPages,
  writeFile: (path, html) => writeFileSync(join(repoRoot, path), html),
});

console.log(`reports: written to ${shown}; exit ${code}`);
process.exit(code);
