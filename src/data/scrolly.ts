/**
 * Shape of one step in a scrollytelling module.
 *
 * Lives in a plain .ts file rather than in Scrolly.astro for the same reason
 * the Zod schemas live in src/content/schemas.ts: Vitest cannot resolve .astro
 * imports, and the step data modules that use this type are unit-tested.
 */
export interface ScrollyStep {
  id: string;
  /** Display only — a scrolly is an ordered narrative, not numbered content. */
  numeral: string;
  heading: string;
  body: string;
}

/**
 * Scrolly.astro enumerates data-active states 1..5 by hand, because CSS cannot
 * compare two numbers. A longer step list would scroll past the last
 * enumerated state and silently stop updating emphasis.
 */
export const MAX_SCROLLY_STEPS = 5;
