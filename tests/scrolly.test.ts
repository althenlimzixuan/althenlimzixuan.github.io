import { describe, expect, it } from 'vitest';
import { MAX_SCROLLY_STEPS } from '../src/data/scrolly';
import { PIPELINE_NODE_IDS, processSteps } from '../src/data/process';
import { SURFACE_NODE_IDS, etpSteps } from '../src/data/etp';

// Every scrollytelling module on the site, checked by the same rules. Adding
// a module means adding a row here.
const modules = [
  { name: 'process', steps: processSteps, nodeIds: PIPELINE_NODE_IDS },
  { name: 'etp', steps: etpSteps, nodeIds: SURFACE_NODE_IDS },
] as const;

describe.each(modules)('$name scrolly', ({ steps, nodeIds }) => {
  // Scrolly.astro enumerates data-active states 1..MAX by hand because CSS
  // cannot compare numbers. A longer list scrolls past the last enumerated
  // state and silently stops updating emphasis — no error, just a figure that
  // quietly stops tracking.
  it('stays within the tier CSS step cap', () => {
    expect(steps.length).toBeLessThanOrEqual(MAX_SCROLLY_STEPS);
  });

  it('gives every step a unique id', () => {
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('numbers steps sequentially from 01', () => {
    expect(steps.map((s) => s.numeral)).toEqual(
      steps.map((_, i) => String(i + 1).padStart(2, '0')),
    );
  });

  it('gives every step non-empty copy', () => {
    for (const s of steps) {
      expect(s.heading.length).toBeGreaterThan(0);
      expect(s.body.length).toBeGreaterThan(0);
    }
  });

  it('references only known figure nodes', () => {
    const known = new Set<string>(nodeIds);
    for (const s of steps) {
      for (const n of s.nodes) expect(known.has(n)).toBe(true);
    }
  });

  // The failure mode these designs turn on. An unclaimed node can never light
  // up; a doubly-claimed node flickers between tiers as you scroll.
  it('claims every figure node exactly once', () => {
    const claims = new Map<string, number>();
    for (const s of steps) {
      for (const n of s.nodes) claims.set(n, (claims.get(n) ?? 0) + 1);
    }
    for (const id of nodeIds) expect(claims.get(id) ?? 0).toBe(1);
  });
});
