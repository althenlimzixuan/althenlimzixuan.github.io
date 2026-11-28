import { describe, expect, it } from 'vitest';
import { loadFixture, readRepoFile } from './helpers/loadFixture';

interface Claim {
  file: string;
  text: string;
}

interface FactsFixture {
  description: string;
  expected: { present: Claim[]; absent: Claim[] };
}

const fixture = loadFixture<FactsFixture>('tests/unit_test/etp_facts.json');

// Prose in .mdx and .astro files wraps mid-sentence, so a phrase is matched
// against the file with every run of whitespace collapsed to one space.
function flattened(file: string): string {
  return readRepoFile(file).replace(/\s+/g, ' ');
}

describe('ETP facts', () => {
  it.each(fixture.expected.present)('states "$text" in $file', ({ file, text }) => {
    expect(flattened(file)).toContain(text);
  });

  it.each(fixture.expected.absent)('no longer states "$text" in $file', ({ file, text }) => {
    expect(flattened(file)).not.toContain(text);
  });
});
