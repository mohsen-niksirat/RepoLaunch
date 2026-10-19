import { describe, it, expect } from 'vitest';
import { generateLaunchKit } from '../launchKit';
import { buildHeuristicContent } from '../heuristicParser';
import type { RepoMetadata } from '../../types';

const meta: RepoMetadata = {
  stars: 500,
  forks: 20,
  openIssues: 3,
  license: 'MIT',
  description: 'A cool tool',
  topics: ['tool'],
  defaultBranch: 'main',
  repoUrl: 'https://github.com/acme/cool',
  owner: 'acme',
  name: 'cool',
  language: 'TypeScript',
  homepage: 'https://cool.dev',
};

const content = buildHeuristicContent(meta, '# Cool\n\nDoes things.\n\n```bash\nnpm i cool\n```');

describe('generateLaunchKit', () => {
  const kit = generateLaunchKit(meta, content);

  it('returns all four announcement channels', () => {
    expect(kit.twitterThread).toHaveLength(4);
    expect(kit.hackerNews.title).toContain('Show HN');
    expect(kit.reddit.title).toContain('[Open Source]');
    expect(kit.productHunt.tagline).toBeTruthy();
  });

  it('includes repo URL in tweets', () => {
    expect(kit.twitterThread[0]).toContain('https://github.com/acme/cool');
  });

  it('uses custom domain when provided', () => {
    const k = generateLaunchKit(meta, content, 'mysite.com');
    expect(k.twitterThread[0]).toContain('https://mysite.com/');
  });

  it('keeps http custom domains as-is', () => {
    const k = generateLaunchKit(meta, content, 'http://localhost:3000');
    expect(k.twitterThread[0]).toContain('http://localhost:3000');
  });

  it('falls back to gh-pages URL without homepage or domain', () => {
    const noHome = { ...meta, homepage: null };
    const c = buildHeuristicContent(noHome, '# Cool');
    const k = generateLaunchKit(noHome, c);
    expect(k.twitterThread[0]).toContain('https://acme.github.io/cool/');
  });

  it('uses npm quickstart in launch body', () => {
    const k = generateLaunchKit(meta, content);
    expect(k.twitterThread[2]).toContain('npm i cool');
  });

  it('suggests subreddits', () => {
    expect(kit.reddit.subreddits).toContain('r/opensource');
  });
});
