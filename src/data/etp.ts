/**
 * The ETP case study's architecture module.
 *
 * Every line of copy here is a compression of prose that already exists in
 * `src/content/projects/etp.mdx` — nothing is invented. In particular the
 * generated TypeScript client is deliberately NOT drawn or described as a
 * fifth surface, because the case study explicitly says it is "infrastructure
 * the surfaces share, not a fifth surface in its own right".
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
  'admin',
  'gaps',
] as const;

export type SurfaceNodeId = (typeof SURFACE_NODE_IDS)[number];

export interface EtpStep extends ScrollyStep {
  nodes: readonly SurfaceNodeId[];
}

export interface SurfaceNode {
  id: SurfaceNodeId;
  x: number;
  y: number;
  w: number;
  label: string;
}

/** Where SurfaceDiagram draws each box, in its 240 x 220 viewBox. */
export const SURFACE_LAYOUT: readonly SurfaceNode[] = [
  { id: 'api',      x: 40,  y: 20,  w: 110, label: 'Go API' },
  { id: 'contract', x: 30,  y: 86,  w: 130, label: 'generated' },
  { id: 'gaps',     x: 178, y: 86,  w: 58,  label: 'gaps' },
  { id: 'web',      x: 10,  y: 170, w: 60,  label: 'web' },
  { id: 'mobile',   x: 90,  y: 170, w: 60,  label: 'mobile' },
  { id: 'admin',    x: 170, y: 170, w: 60,  label: 'admin' },
];

export const etpSteps: readonly EtpStep[] = [
  {
    id: 'api',
    numeral: '01',
    heading: 'One Go API behind everything',
    body: 'Gin for routing, Wire for dependency injection, GORM over MySQL on Cloud SQL, and Redis only where it earns its place. Deployed to Cloud Run.',
    nodes: ['api'],
  },
  {
    id: 'contract',
    numeral: '02',
    heading: 'The client is generated, not written',
    body: 'The OpenAPI spec is generated from annotations on the Go source, the TypeScript client from that spec, and both regenerate in the same pull request as the change. It is shared infrastructure, not a fifth surface.',
    nodes: ['contract'],
  },
  {
    id: 'clients',
    numeral: '03',
    heading: 'Three clients consume one definition',
    body: 'Next.js on Vercel, React Native on Expo, and the admin dashboard. None hand-writes a fetch layer, so none can be wrong about the shape of a response; they did not write it down independently.',
    nodes: ['web', 'mobile', 'admin'],
  },
  {
    id: 'gaps',
    numeral: '04',
    heading: 'What the contract cannot carry',
    body: 'The generated spec is silent on anything the annotations never declared. Conflict-rule severity and trip-member roles are load-bearing concepts that exist only in Go types, and two such gaps reached production before being caught.',
    nodes: ['gaps'],
  },
];
