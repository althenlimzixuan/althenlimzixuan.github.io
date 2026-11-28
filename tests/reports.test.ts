import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import {
  renderTable,
  resolveOutDir,
  runReports,
  summariseVitest,
} from '../scripts/report-lib.mjs';
import { loadFixture } from './helpers/loadFixture';

interface ReportsFixture {
  description: string;
  input: {
    vitest: object;
    runs: { status: number | null }[];
    injectionOutDir: string;
  };
  expected: {
    passed: number;
    failed: number;
    skipped: number;
    files: { name: string; passed: number; failed: number; skipped: number }[];
    exitCode: number;
    pages: string[];
    buildFailedNote: string;
  };
}

const { input, expected } = loadFixture<ReportsFixture>('tests/unit_test/vitest_summary.json');
const repoRoot = fileURLToPath(new URL('../', import.meta.url));

/** Runs runReports with fakes; returns what it ran and wrote. */
function fakeRun(
  overrides: { outDir?: string; vitest?: object | null; statuses?: (number | null)[] } = {},
) {
  const statuses = overrides.statuses ?? input.runs.map((r) => r.status);
  const pages = new Map<string, string>();
  const commands: string[][] = [];
  const exitCode = runReports({
    outDir: overrides.outDir ?? 'out',
    run: (args: string[]) => {
      commands.push(args);
      return { status: statuses[commands.length - 1], ms: 10 };
    },
    readVitest: () => ('vitest' in overrides ? overrides.vitest ?? null : input.vitest),
    listPages: () => [{ path: 'index.html', kb: 12.5, cssKb: 3 }],
    writeFile: (path: string, html: string) => pages.set(path.replace(/\\/g, '/'), html),
  });
  return { exitCode, pages, commands };
}

describe('report command', () => {
  it('summarises passed, failed and skipped tests per file', () => {
    const summary = summariseVitest(input.vitest);
    expect(summary.passed).toBe(expected.passed);
    expect(summary.failed).toBe(expected.failed);
    expect(summary.skipped).toBe(expected.skipped);
    expect(summary.files).toEqual(expected.files);
  });

  it('counts a test file that failed to load as a failure', () => {
    const loadFailure = summariseVitest(input.vitest).files.find((f) => f.name === 'tests/c.test.js');
    expect(loadFailure?.failed).toBe(1);
  });

  it('escapes HTML in table cells', () => {
    const html = renderTable('t', ['h'], [['<b>&</b>']]);
    expect(html).toContain('&lt;b&gt;&amp;&lt;/b&gt;');
    expect(html).not.toContain('<b>&</b>');
  });

  it('still writes reports and returns 1 when a command fails', () => {
    const { exitCode, pages, commands } = fakeRun();
    expect(commands).toHaveLength(input.runs.length);
    expect(exitCode).toBe(expected.exitCode);
    expect([...pages.keys()]).toEqual(expected.pages.map((p) => `out/${p}`));
  });

  it('lists no pages after a failed build', () => {
    const profiling = fakeRun().pages.get('out/profiling.html') ?? '';
    expect(profiling).toContain(expected.buildFailedNote);
    expect(profiling).not.toContain('index.html');
  });

  it('returns 1 when no Vitest result was written', () => {
    const statuses = input.runs.map(() => 0);
    expect(fakeRun({ statuses, vitest: null }).exitCode).toBe(1);
    expect(fakeRun({ statuses }).exitCode).toBe(0);
  });

  // The out dir reaches the test runner as one argument, never through a
  // shell, so shell syntax in a folder name cannot run as a command.
  it('passes the out dir as one argument, with no shell', () => {
    const { commands } = fakeRun({ outDir: input.injectionOutDir });
    const outputArg = commands[0].find((a) => a.startsWith('--outputFile='));
    expect(outputArg).toBe(`--outputFile=${input.injectionOutDir}/vitest.json`);
    for (const args of commands) expect(Array.isArray(args)).toBe(true);
  });

  it('refuses an out dir outside _test_reports', () => {
    expect(() => resolveOutDir('_test_reports/../x', repoRoot)).toThrow();
    expect(() => resolveOutDir('_test_reports', repoRoot)).toThrow();
    expect(resolveOutDir('_test_reports/site/a', repoRoot)).toContain('_test_reports');
  });
});
