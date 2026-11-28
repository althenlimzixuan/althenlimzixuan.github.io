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
    runs: { command: string; status: number | null }[];
  };
  expected: {
    passed: number;
    failed: number;
    files: { name: string; passed: number; failed: number }[];
    exitCode: number;
    pages: string[];
  };
}

const { input, expected } = loadFixture<ReportsFixture>('tests/unit_test/vitest_summary.json');
const repoRoot = fileURLToPath(new URL('../', import.meta.url));

describe('report command', () => {
  it('summarises passed and failed tests per file', () => {
    const summary = summariseVitest(input.vitest);
    expect(summary.passed).toBe(expected.passed);
    expect(summary.failed).toBe(expected.failed);
    expect(summary.files).toEqual(expected.files);
  });

  it('escapes HTML in table cells', () => {
    const html = renderTable('t', ['h'], [['<b>&</b>']]);
    expect(html).toContain('&lt;b&gt;&amp;&lt;/b&gt;');
    expect(html).not.toContain('<b>&</b>');
  });

  it('still writes reports and returns 1 when a command fails', () => {
    const written: string[] = [];
    let call = 0;
    const exitCode = runReports({
      outDir: 'out',
      run: () => ({ status: input.runs[call++].status, ms: 10 }),
      readVitest: () => input.vitest,
      listPages: () => [{ path: 'index.html', kb: 12.5, cssKb: 3 }],
      writeFile: (path: string) => written.push(path.replace(/\\/g, '/')),
    });
    expect(call).toBe(input.runs.length);
    expect(exitCode).toBe(expected.exitCode);
    expect(written).toEqual(expected.pages.map((p) => `out/${p}`));
  });

  it('refuses an out dir outside _test_reports', () => {
    expect(() => resolveOutDir('_test_reports/../x', repoRoot)).toThrow();
    expect(() => resolveOutDir('_test_reports', repoRoot)).toThrow();
    expect(resolveOutDir('_test_reports/site/a', repoRoot)).toContain('_test_reports');
  });
});
