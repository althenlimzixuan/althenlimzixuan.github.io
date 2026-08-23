/**
 * The ETP case study's architecture module.
 *
 * Every line of copy here is a compression of prose that already exists in
 * `src/content/projects/etp.mdx` — nothing is invented. In particular the
 * generated TypeScript client is deliberately NOT drawn or described as a
 * fourth surface, because the case study explicitly says it is "infrastructure
 * the surfaces share, not a fourth surface in its own right".
 *
 * Same single-source contract as src/data/process.ts: SurfaceDiagram derives
 * each node's step index from this array, and tests/scrolly.test.ts enforces
 * that every node is claimed exactly once.
 */

import type { ScrollyStep } from './scrolly';

export const SURFACE_NODE_IDS = [
  'api',
  'contract',
  'web',
  'mobile',
  'gaps',
] as const;

export type SurfaceNodeId = (typeof SURFACE_NODE_IDS)[number];

export interface EtpStep extends ScrollyStep {
  nodes: readonly SurfaceNodeId[];
}

export const etpSteps: readonly EtpStep[] = [
  {
    id: 'api',
    numeral: '01',
    heading: 'One Go API behind everything',
    body: 'Gin for routing, Wire for dependency injection, GORM over PostgreSQL, and Redis only where it earns its place. Deployed to Cloud Run.',
    nodes: ['api'],
  },
  {
    id: 'contract',
    numeral: '02',
    heading: 'The client is generated, not written',
    body: 'The OpenAPI spec is generated from annotations on the Go source, the TypeScript client from that spec, and both regenerate in the same pull request as the change. It is shared infrastructure, not a fourth surface.',
    nodes: ['contract'],
  },
  {
    id: 'clients',
    numeral: '03',
    heading: 'Two clients consume one definition',
    body: 'Next.js App Router on Vercel and React Native on Expo. Neither hand-writes a fetch layer, so neither can be wrong about the shape of a response — they did not write it down independently.',
    nodes: ['web', 'mobile'],
  },
  {
    id: 'gaps',
    numeral: '04',
    heading: 'What the contract cannot carry',
    body: 'The generated spec is silent on anything the annotations never declared. Conflict-rule severity and trip-member roles are load-bearing concepts that exist only in Go types, and two such gaps reached production before being caught.',
    nodes: ['gaps'],
  },
];
