import { z } from 'astro/zod';

export const projectSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  stack: z.array(z.string()).min(1),
  liveUrl: z.string().url().nullable(),
  /** Whether liveUrl is explorable without signing in. Drives CTA copy. */
  livePubliclyBrowsable: z.boolean(),
  status: z.enum(['active', 'shipped', 'paused', 'archived']),
  metrics: z
    .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
    .default([]),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
});

export const serviceSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  detail: z.array(z.string().min(1)).min(1),
  order: z.number().int(),
});

export const experienceSchema = z.object({
  organisation: z.string().min(1),
  title: z.string().min(1),
  start: z.string().regex(/^\d{4}-\d{2}$/, 'Expected YYYY-MM'),
  /** null means current role. */
  end: z.string().regex(/^\d{4}-\d{2}$/, 'Expected YYYY-MM').nullable(),
  summary: z.string().min(1),
  highlights: z.array(z.string().min(1)).default([]),
  stack: z.array(z.string()).default([]),
});

export const writingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  draft: z.boolean().default(false),
});

export type Project = z.infer<typeof projectSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Experience = z.infer<typeof experienceSchema>;
