import { describe, it, expect } from 'vitest';
import { parseGitHubUrl, GitHubError, fetchRepoMetadata } from '../github';

describe('parseGitHubUrl', () => {
  it('parses full https url', () => {
    expect(parseGitHubUrl('https://github.com/owner/repo')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('parses url without protocol', () => {
    expect(parseGitHubUrl('github.com/owner/repo')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('parses owner/repo shorthand', () => {
    expect(parseGitHubUrl('owner/repo')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('parses ssh git@ form', () => {
    expect(parseGitHubUrl('git@github.com:owner/repo.git')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('strips trailing .git and slashes', () => {
    expect(parseGitHubUrl('https://github.com/owner/repo.git/')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('handles extra path segments by taking first two after host', () => {
    expect(parseGitHubUrl('https://github.com/owner/repo/tree/main')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('returns null for empty or invalid input', () => {
    expect(parseGitHubUrl('')).toBeNull();
    expect(parseGitHubUrl('   ')).toBeNull();
    expect(parseGitHubUrl('owner')).toBeNull();
    expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull();
  });

  it('handles repos with dots and dashes', () => {
    expect(parseGitHubUrl('owner/my.repo-name')).toEqual({ owner: 'owner', repo: 'my.repo-name' });
  });
});

describe('fetchRepoMetadata', () => {
  it('throws GitHubError for invalid url', async () => {
    await expect(fetchRepoMetadata('not-a-url')).rejects.toThrow(GitHubError);
    await expect(fetchRepoMetadata('not-a-url')).rejects.toMatchObject({ kind: 'not-found' });
  });

  it('maps 404 to not-found error', async () => {
    globalThis.fetch = async () => new Response('{}', { status: 404 });
    await expect(fetchRepoMetadata('a/b')).rejects.toMatchObject({ kind: 'not-found' });
  });

  it('maps 403 to rate-limit error', async () => {
    globalThis.fetch = async () => new Response('{}', { status: 403 });
    await expect(fetchRepoMetadata('a/b')).rejects.toMatchObject({ kind: 'rate-limit' });
  });

  it('maps 500 to network error', async () => {
    globalThis.fetch = async () => new Response('{}', { status: 500 });
    await expect(fetchRepoMetadata('a/b')).rejects.toMatchObject({ kind: 'network' });
  });
});
