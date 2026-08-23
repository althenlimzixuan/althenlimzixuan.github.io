import { describe, expect, it } from 'vitest';
import {
  PIPELINE_NODE_IDS,
  processSteps,
  type PipelineNodeId,
} from '../src/data/process';

describe('processSteps', () => {
  it('has exactly five steps', () => {
    expect(processSteps).toHaveLength(5);
  });

  it('gives every step a unique id', () => {
    const ids = processSteps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every step non-empty copy', () => {
    for (const s of processSteps) {
      expect(s.heading.length).toBeGreaterThan(0);
      expect(s.body.length).toBeGreaterThan(0);
    }
  });

  it('numbers steps 01..05 in order', () => {
    expect(processSteps.map((s) => s.numeral)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
    ]);
  });

  it('references only known pipeline nodes', () => {
    const known = new Set<string>(PIPELINE_NODE_IDS);
    for (const s of processSteps) {
      for (const n of s.nodes) {
        expect(known.has(n)).toBe(true);
      }
    }
  });

  // The failure mode this whole design turns on. An unclaimed node can never
  // light up; a doubly-claimed node flickers between tiers as you scroll.
  it('claims every pipeline node exactly once across all steps', () => {
    const claims = new Map<PipelineNodeId, number>();
    for (const s of processSteps) {
      for (const n of s.nodes) {
        claims.set(n, (claims.get(n) ?? 0) + 1);
      }
    }
    for (const id of PIPELINE_NODE_IDS) {
      expect(claims.get(id) ?? 0).toBe(1);
    }
  });
});
