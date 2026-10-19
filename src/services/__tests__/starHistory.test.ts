import { describe, it, expect } from 'vitest';
import { calculateStarHistory, renderStarHistorySvg } from '../starHistory';
import type { RepoMetadata } from '../../types';

const base: RepoMetadata = {
  stars: 0,
  forks: 0,
  openIssues: 0,
  license: null,
  description: '',
  topics: [],
  defaultBranch: 'main',
  repoUrl: 'https://github.com/a/b',
  owner: 'a',
  name: 'b',
  language: null,
  homepage: null,
};

describe('calculateStarHistory', () => {
  it('returns single point for zero stars', () => {
    const pts = calculateStarHistory({ ...base, stars: 0 });
    expect(pts).toEqual([{ date: 'Launch', stars: 0 }]);
  });

  it('produces 5 monotonically increasing points for positive stars', () => {
    const pts = calculateStarHistory({ ...base, stars: 1000, createdAt: '2020-01-01' });
    expect(pts).toHaveLength(5);
    expect(pts[4].stars).toBe(1000);
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].stars).toBeGreaterThanOrEqual(pts[i - 1].stars);
    }
  });

  it('labels last point as Today', () => {
    const pts = calculateStarHistory({ ...base, stars: 100 });
    expect(pts[pts.length - 1].date).toBe('Today');
  });
});

describe('renderStarHistorySvg', () => {
  const pts = [
    { date: 'A', stars: 10 },
    { date: 'B', stars: 50 },
    { date: 'Today', stars: 100 },
  ];

  it('returns an svg string', () => {
    const svg = renderStarHistorySvg(pts, '#818cf8');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('uses terminal colors when isTerminal', () => {
    const svg = renderStarHistorySvg(pts, '#818cf8', true);
    expect(svg).toContain('#4ade80');
  });
});
