// The pure parts of `npm run reports`: summarising a Vitest run, rendering
// report pages, guarding the output folder, and running the report commands
// through injected effects so a failed command can be tested without running it.
import { isAbsolute, join, relative, resolve } from 'node:path';

/** The commands the report runs, in order. `{out}` is the report folder. */
export const REPORT_COMMANDS = [
  { name: 'Unit tests', command: 'npx vitest run --reporter=json --outputFile="{out}/vitest.json"' },
  { name: 'Type and content check', command: 'npm run check' },
  { name: 'Build', command: 'npm run build' },
  { name: 'Built CSS check', command: 'npm run verify:css' },
];

/**
 * @param {{testResults?: {name: string, assertionResults: {status: string}[]}[]}} json
 *   the output of `vitest --reporter=json`
 * @returns {{passed: number, failed: number, files: {name: string, passed: number, failed: number}[]}}
 */
export function summariseVitest(json) {
  const files = (json.testResults ?? []).map((file) => ({
    name: file.name,
    passed: file.assertionResults.filter((a) => a.status === 'passed').length,
    failed: file.assertionResults.filter((a) => a.status === 'failed').length,
  }));
  return {
    passed: files.reduce((n, f) => n + f.passed, 0),
    failed: files.reduce((n, f) => n + f.failed, 0),
    files,
  };
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
 * exit code: 1 when any command did not exit 0, else 0. A failed command
 * never stops the others or the pages.
 * @param {{
 *   outDir: string,
 *   run: (command: string) => {status: number | null, ms: number},
 *   readVitest: () => object | null,
 *   listPages: () => {path: string, kb: number, cssKb: number}[],
 *   writeFile: (path: string, html: string) => void,
 * }} deps
 * @returns {number}
 */
export function runReports({ outDir, run, readVitest, listPages, writeFile }) {
  const results = REPORT_COMMANDS.map(({ name, command }) => {
    const line = command.replace('{out}', outDir);
    return { name, line, ...run(line) };
  });

  const vitest = readVitest();
  const summary = vitest ? summariseVitest(vitest) : null;
  writeFile(
    join(outDir, 'unit_test.html'),
    renderTable(
      'Unit tests',
      ['File', 'Passed', 'Failed'],
      summary ? summary.files.map((f) => [f.name, f.passed, f.failed]) : [],
      summary
        ? `${summary.passed} passed, ${summary.failed} failed`
        : 'No Vitest result: the unit test command did not write one.',
    ),
  );

  writeFile(
    join(outDir, 'regression.html'),
    renderTable(
      'Regression',
      ['Check', 'Command', 'Exit code', 'Seconds'],
      results.map((r) => [r.name, r.line, statusText(r.status), (r.ms / 1000).toFixed(1)]),
    ),
  );

  const build = results.find((r) => r.name === 'Build');
  writeFile(
    join(outDir, 'profiling.html'),
    renderTable(
      'Profiling',
      ['Built page', 'HTML (KB)', 'Linked CSS (KB)'],
      listPages().map((p) => [p.path, p.kb.toFixed(1), p.cssKb.toFixed(1)]),
      `Build: ${build ? (build.ms / 1000).toFixed(1) : '?'} s, exit code ${build ? statusText(build.status) : '?'}`,
    ),
  );

  return results.every((r) => r.status === 0) ? 0 : 1;
}
