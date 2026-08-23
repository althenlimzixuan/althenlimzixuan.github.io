/**
 * The landing page's compressed pipeline story. The long form lives at
 * /how-i-build/; this is the trailer that links to it.
 *
 * Single source of truth: ProcessScrolly renders the steps column from this
 * array, and PipelineDiagram derives each node's step index from it. The two
 * therefore cannot disagree about how many steps exist or which node belongs
 * to which. tests/process.test.ts enforces that every node is claimed exactly
 * once — an unclaimed node can never light up, a doubly-claimed one flickers.
 */

export const PIPELINE_NODE_IDS = [
  'spec',
  'contract',
  'api',
  'web',
  'mobile',
  'tests',
  'ci',
] as const;

export type PipelineNodeId = (typeof PIPELINE_NODE_IDS)[number];

export interface ProcessStep {
  id: string;
  /** Display only — the steps are an ordered list, not numbered content. */
  numeral: string;
  heading: string;
  body: string;
  nodes: readonly PipelineNodeId[];
}

export const processSteps: readonly ProcessStep[] = [
  {
    id: 'spec',
    numeral: '01',
    heading: 'Every phase starts from a written spec',
    body: 'No phase begins from a chat message. The problem, the decisions taken and the reasons for them are committed to the repository before any implementation starts.',
    nodes: ['spec'],
  },
  {
    id: 'contract',
    numeral: '02',
    heading: 'The contract is generated, never hand-maintained',
    body: 'The OpenAPI specification is generated from the source and the typed client from that specification, so no surface ever writes a response shape down independently — and none can hold a stale one.',
    nodes: ['contract'],
  },
  {
    id: 'parallel',
    numeral: '03',
    heading: 'Surfaces are built in parallel, against that contract',
    body: 'Once a phase’s contract is settled, API, web and mobile are dispatched concurrently against the generated client rather than against each other’s assumptions. This is where the speed comes from.',
    nodes: ['api', 'web', 'mobile'],
  },
  {
    id: 'regression',
    numeral: '04',
    heading: 'Tests remember what broke before',
    body: 'Standing risks carry forward between phases: when a class of bug appears once, it becomes a permanent check that every later phase is tested against.',
    nodes: ['tests'],
  },
  {
    id: 'ci',
    numeral: '05',
    heading: 'CI is gated and cost-controlled',
    body: 'Every pull request runs the tests, regenerates the contract and verifies the build — and is kept cheap enough to run that nobody is tempted to skip it under deadline.',
    nodes: ['ci'],
  },
];
