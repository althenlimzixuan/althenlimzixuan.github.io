import { describe, expect, it } from 'vitest';
import {
  experienceSchema,
  projectSchema,
  serviceSchema,
  writingSchema,
} from '../src/content/schemas';

const validProject = {
  title: 'ETP',
  tagline: 'Group-trip itinerary planner',
  role: 'Solo — product, API, web, mobile',
  period: '2026',
  stack: ['Go', 'Next.js'],
  liveUrl: 'https://etp-web.vercel.app/',
  livePubliclyBrowsable: false,
  status: 'active',
};

describe('projectSchema', () => {
  it('accepts a valid project and applies defaults', () => {
    const parsed = projectSchema.parse(validProject);
    expect(parsed.metrics).toEqual([]);
    expect(parsed.featured).toBe(false);
    expect(parsed.order).toBe(0);
  });

  it('rejects an empty stack', () => {
    expect(() => projectSchema.parse({ ...validProject, stack: [] })).toThrow();
  });

  it('rejects a non-URL liveUrl', () => {
    expect(() =>
      projectSchema.parse({ ...validProject, liveUrl: 'etp-web.vercel.app' }),
    ).toThrow();
  });

  it('allows a null liveUrl for projects with nothing deployed', () => {
    expect(projectSchema.parse({ ...validProject, liveUrl: null }).liveUrl).toBeNull();
  });

  it('rejects an unknown status', () => {
    expect(() =>
      projectSchema.parse({ ...validProject, status: 'in-progress' }),
    ).toThrow();
  });

  it('rejects a metric with an empty label', () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        metrics: [{ label: '', value: 'x' }],
      }),
    ).toThrow();
  });
});

describe('experienceSchema', () => {
  const valid = {
    organisation: 'Example Pte Ltd',
    title: 'Engineer',
    start: '2024-01',
    end: null,
    summary: 'Did the work.',
  };

  it('accepts a current role with a null end date', () => {
    expect(experienceSchema.parse(valid).end).toBeNull();
  });

  it('rejects a malformed start date', () => {
    expect(() => experienceSchema.parse({ ...valid, start: '2024' })).toThrow();
  });

  it('rejects a malformed end date', () => {
    expect(() => experienceSchema.parse({ ...valid, end: '2024' })).toThrow();
  });

  it('defaults highlights and stack to empty arrays', () => {
    const parsed = experienceSchema.parse(valid);
    expect(parsed.highlights).toEqual([]);
    expect(parsed.stack).toEqual([]);
  });
});

describe('serviceSchema', () => {
  it('requires at least one detail line', () => {
    expect(() =>
      serviceSchema.parse({
        title: 'API design',
        summary: 'Contract-first APIs.',
        detail: [],
        order: 1,
      }),
    ).toThrow();
  });
});

describe('writingSchema', () => {
  const valid = {
    title: 'Shipping a portfolio in a week',
    description: 'How the site was built.',
    pubDate: '2026-08-01',
  };

  it('accepts a valid entry', () => {
    expect(() => writingSchema.parse(valid)).not.toThrow();
  });

  it('coerces pubDate from a date string to a Date', () => {
    const parsed = writingSchema.parse(valid);
    expect(parsed.pubDate).toBeInstanceOf(Date);
  });

  it('defaults draft to false when omitted', () => {
    expect(writingSchema.parse(valid).draft).toBe(false);
  });

  it('rejects a pubDate that cannot coerce to a date', () => {
    expect(() =>
      writingSchema.parse({ ...valid, pubDate: 'not-a-date' }),
    ).toThrow();
  });
});
