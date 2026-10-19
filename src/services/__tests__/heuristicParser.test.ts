import { describe, it, expect } from 'vitest';
import { buildHeuristicContent } from '../heuristicParser';
import type { RepoMetadata } from '../../types';

const meta: RepoMetadata = {
  stars: 1234,
  forks: 56,
  openIssues: 7,
  license: 'MIT',
  description: 'A test repo',
  topics: ['testing', 'demo'],
  defaultBranch: 'main',
  repoUrl: 'https://github.com/test/demo',
  owner: 'test',
  name: 'demo',
  language: 'TypeScript',
  homepage: 'https://demo.dev',
  createdAt: '2020-01-01',
};

const readme = `
# Demo

A test repo for unit tests.

## Features

* Fast — blazing fast
* Secure — hardened by default
* Simple — zero config

## Installation

\`\`\`bash
npm install demo
\`\`\`

## FAQ

### Is it free?
Yes, completely free.
`;

describe('buildHeuristicContent', () => {
  it('builds hero content with metadata badges', () => {
    const c = buildHeuristicContent(meta, readme);
    expect(c.hero.headline).toBeTruthy();
    expect(c.hero.badges.some((b) => b.label === 'Stars')).toBe(true);
    expect(c.hero.badges.some((b) => b.label === 'License' && b.value === 'MIT')).toBe(true);
  });

  it('extracts features from README', () => {
    const c = buildHeuristicContent(meta, readme);
    expect(c.features.length).toBeGreaterThanOrEqual(3);
    expect(c.features[0].title).toBeTruthy();
  });

  it('extracts quickstart npm tab', () => {
    const c = buildHeuristicContent(meta, readme);
    expect(c.quickstart.some((t) => t.id === 'npm')).toBe(true);
  });

  it('extracts FAQ items', () => {
    const c = buildHeuristicContent(meta, readme);
    expect(c.faq.length).toBeGreaterThanOrEqual(1);
    expect(c.faq[0].question).toContain('free');
  });

  it('includes tech stack with language and topics', () => {
    const c = buildHeuristicContent(meta, readme);
    const labels = c.techStack.map((t) => t.label);
    expect(labels).toContain('TypeScript');
  });

  it('falls back to clone tab when no code blocks', () => {
    const c = buildHeuristicContent(meta, '# Demo\n\nNo code here.');
    expect(c.quickstart[0].id).toBe('clone');
  });

  it('provides default FAQ when readme has none', () => {
    const c = buildHeuristicContent(meta, '# Demo');
    expect(c.faq.length).toBeGreaterThan(0);
  });

  it('produces changelog from releases', () => {
    const c = buildHeuristicContent(meta, readme, [
      { tagName: 'v1.0.0', name: 'v1', publishedAt: '2024-01-01', body: 'First release' },
    ]);
    expect(c.changelog?.[0].tagName).toBe('v1.0.0');
  });

  it('always returns star history with 5+ points', () => {
    const c = buildHeuristicContent(meta, readme);
    expect(c.starHistory!.length).toBeGreaterThanOrEqual(5);
  });
});
