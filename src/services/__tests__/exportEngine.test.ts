import { describe, it, expect } from 'vitest';
import {
  generateFaviconSvg,
  generateManifestJson,
  generateStandaloneHTML,
  generateReactComponent,
  generateNextJsAppRouter,
  generateAstroPage,
  generateDeployReadme,
} from '../exportEngine';
import { buildHeuristicContent } from '../heuristicParser';
import type { RepoMetadata, ThemeConfig } from '../../types';

const meta: RepoMetadata = {
  stars: 42,
  forks: 7,
  openIssues: 1,
  license: 'MIT',
  description: 'Test project',
  topics: ['testing'],
  defaultBranch: 'main',
  repoUrl: 'https://github.com/a/b',
  owner: 'a',
  name: 'b',
  language: 'TypeScript',
  homepage: null,
};

const theme: ThemeConfig = {
  themeId: 'midnight-linear',
  accentColor: '#818cf8',
  fontStyle: 'sans',
  language: 'en',
  showTerminal: true,
  showScreenshots: true,
  showFaq: true,
  showTechStack: true,
  sectionOrder: ['showcase', 'features', 'quickstart', 'techStack', 'faq', 'newsletter'],
};

const content = buildHeuristicContent(meta, '# B\n\nDesc.\n\n```bash\nnpm i b\n```');

describe('generateFaviconSvg', () => {
  it('returns svg with first letter of repo name', () => {
    const svg = generateFaviconSvg(meta, theme);
    expect(svg).toContain('<svg');
    expect(svg).toContain('>B<');
  });
});

describe('generateManifestJson', () => {
  it('produces parseable JSON with required fields', () => {
    const m = JSON.parse(generateManifestJson(meta, content, theme));
    expect(m.short_name).toBe('b');
    expect(m.theme_color).toBe('#818cf8');
  });
});

describe('generateStandaloneHTML', () => {
  const html = generateStandaloneHTML(meta, content, theme);

  it('produces a full html document', () => {
    expect(html).toContain('<!doctype html');
    expect(html).toContain('</html>');
  });

  it('embeds schema.org json-ld', () => {
    expect(html).toContain('application/ld+json');
    expect(html).toContain('SoftwareApplication');
  });

  it('includes og meta tags', () => {
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:url"');
  });

  it('escapes user content', () => {
    const evil = { ...meta, description: '<script>alert(1)</script>' };
    const evilContent = { ...content, hero: { ...content.hero, headline: '<img onerror="x">' } };
    const h = generateStandaloneHTML(evil, evilContent, theme);
    expect(h).not.toContain('<img onerror');
    expect(h).toContain('&lt;img');
  });

  it('injects ga4 snippet when configured', () => {
    const t = { ...theme, analytics: { provider: 'ga4' as const, trackingId: 'G-ABC' } };
    const h = generateStandaloneHTML(meta, content, t);
    expect(h).toContain('G-ABC');
    expect(h).toContain('googletagmanager');
  });

  it('writes cname tag when custom domain set', () => {
    const t = { ...theme, customDomain: 'example.com' };
    const h = generateStandaloneHTML(meta, content, t);
    expect(h).toContain('https://example.com/');
  });
});

describe('generateReactComponent', () => {
  const jsx = generateReactComponent(meta, content, theme);

  it('returns a react component string', () => {
    expect(jsx).toContain('export default function');
    expect(jsx).toContain('return');
  });
});

describe('generateNextJsAppRouter & Astro', () => {
  it('generates nextjs page with metadata', () => {
    const p = generateNextJsAppRouter(meta, content, theme);
    expect(p).toContain('Metadata');
  });

  it('generates astro page', () => {
    const p = generateAstroPage(meta, content, theme);
    expect(p).toContain('---');
  });
});

describe('generateDeployReadme', () => {
  it('includes repo url and custom domain', () => {
    const r = generateDeployReadme(meta, 'docs.example.com');
    expect(r).toContain('docs.example.com');
  });
});
