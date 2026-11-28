// The pure parts of `npm run reports`: summarising a Vitest run, rendering
// report pages, guarding the output folder, and running the report commands
// through injected effects so a failed command can be tested without running it.
import { isAbsolute, join, relative, resolve } from 'node:path';

/**
 * The commands the report runs, in order, each as the arguments to `node`:
 * a script path, then its own arguments. They run with no shell, so the out
 * dir always reaches the test runner as one argument.
 * @type {{name: string, args: (out: string) => string[], needsBuild?: boolean}[]}
 */
export const REPORT_COMMANDS = [
  {
    name: 'Unit tests',
    args: (out) => ['node_modules/vitest/vitest.mjs', 'run', '--reporter=json', `--outputFile=${out}/vitest.json`],
  },
  { name: 'Type and content check', args: () => ['node_modules/astro/bin/astro.mjs', 'check'] },
  { name: 'Build', args: () => ['node_modules/astro/bin/astro.mjs', 'build'] },
  { name: 'Built CSS check', args: () => ['scripts/verify-built-css.mjs'], needsBuild: true },
];

const SKIPPED = new Set(['skipped', 'pending', 'todo']);

/**
 * @param {{testResults?: {name: string, status: string, assertionResults: {status: string}[]}[]}} json
 *   the output of `vitest --reporter=json`
 * @returns {{passed: number, failed: number, skipped: number,
 *   files: {name: string, passed: number, failed: number, skipped: number}[]}}
 */
export function summariseVitest(json) {
  const files = (json.testResults ?? []).map((file) => {
    const count = (match) => file.assertionResults.filter((a) => match(a.status)).length;
    const failed = count((s) => s === 'failed');
    return {
      name: file.name,
      passed: count((s) => s === 'passed'),
      // A file that failed to load has no test results at all; it still failed.
      failed: file.status === 'failed' && failed === 0 ? 1 : failed,
      skipped: count((s) => SKIPPED.has(s)),
    };
  });
  const total = (key) => files.reduce((n, f) => n + f[key], 0);
  return { passed: total('passed'), failed: total('failed'), skipped: total('skipped'), files };
}

/** @param {unknown} value */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * A whole HTML page holding one table. Every heading and cell is escaped.
 * @param {string} title
 * @param {string[]} headers
 * @param {(string | number)[][]} rows
 * @param {string} [note] one line shown above the table
 */
export function renderTable(title, headers, rows, note = '') {
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const body = rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
    .join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>body{font:14px/1.5 system-ui,sans-serif;margin:2rem}table{border-collapse:collapse}th,td{border:1px solid #ccc;padding:.3rem .6rem;text-align:left}</style>
</head><body><h1>${escapeHtml(title)}</h1>${note ? `<p>${escapeHtml(note)}</p>` : ''}
<table><thead><tr>${head}</tr></thead><tbody>
${body}
</tbody></table></body></html>
`;
}

/**
 * Resolves the report folder and refuses any path that is not strictly
 * inside `<repoRoot>/_test_reports/`, after `..` segments are resolved.
 * @param {string} outDir
 * @param {string} repoRoot
 * @returns {string} the absolute folder
 */
export function resolveOutDir(outDir, repoRoot) {
  const base = resolve(repoRoot, '_test_reports');
  const target = resolve(repoRoot, outDir);
  const rel = relative(base, target);
  if (rel === '' || rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error(`the out dir must be inside _test_reports/ (got ${outDir})`);
  }
  return target;
}

/** @param {number | null} status */
function statusText(status) {
  return status === null ? 'killed' : String(status);
}

/**
 * Runs every report command, writes the three report pages, and returns the
 * exit code: 1 when any command did not exit 0 or no Vitest result was
 * written, else 0. A failed command never stops the others or the pages.
 * @param {{
 *   outDir: string,
 *   run: (args: string[]) => {status: number | null, ms: number, error?: string},
 *   readVitest: () => object | null,
 *   listPages: () => {path: string, kb: number, cssKb: number}[],
 *   writeFile: (path: string, html: string) => void,
 * }} deps
 * @returns {number}
 */
export function runReports({ outDir, run, readVitest, listPages, writeFile }) {
  /** @type {{name: string, line: string, status: number | null, ms: number, error?: string, skipped?: string}[]} */
  const results = [];
  for (const { name, args, needsBuild } of REPORT_COMMANDS) {
    const argv = args(outDir);
    const line = ['node', ...argv].join(' ');
    // The built CSS check reads dist/, which a failed build may have left
    // from an earlier run: a pass there would describe old CSS.
    const buildFailed = results.some((r) => r.name === 'Build' && r.status !== 0);
    if (needsBuild && buildFailed) {
      results.push({ name, line, status: null, ms: 0, skipped: 'skipped: the build failed' });
    } else {
      results.push({ name, line, ...run(argv) });
    }
  }

  const vitest = readVitest();
  const summary = vitest ? summariseVitest(vitest) : null;
  writeFile(
    join(outDir, 'unit_test.html'),
    renderTable(
      'Unit tests',
      ['File', 'Passed', 'Failed', 'Skipped'],
      summary ? summary.files.map((f) => [f.name, f.passed, f.failed, f.skipped]) : [],
      summary
        ? `${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped`
        : 'No Vitest result: the unit test command did not write one.',
    ),
  );

  writeFile(
    join(outDir, 'regression.html'),
    renderTable(
      'Regression',
      ['Check', 'Command', 'Exit code', 'Seconds', 'Error'],
      results.map((r) => [
        r.name,
        r.line,
        r.skipped ?? statusText(r.status),
        (r.ms / 1000).toFixed(1),
        r.error ?? '',
      ]),
    ),
  );

  // After a failed build, dist/ may hold an earlier build's pages, so none
  // are listed rather than old sizes shown as this run's.
  const build = results.find((r) => r.name === 'Build');
  const built = build?.status === 0;
  writeFile(
    join(outDir, 'profiling.html'),
    renderTable(
      'Profiling',
      ['Built page', 'HTML (KB)', 'Linked CSS (KB)'],
      built ? listPages().map((p) => [p.path, p.kb.toFixed(1), p.cssKb.toFixed(1)]) : [],
      built
        ? `Build: ${(build.ms / 1000).toFixed(1)} s`
        : `Build failed: no pages listed (exit code ${build ? statusText(build.status) : '?'})`,
    ),
  );

  return summary && results.every((r) => r.status === 0) ? 0 : 1;
}
