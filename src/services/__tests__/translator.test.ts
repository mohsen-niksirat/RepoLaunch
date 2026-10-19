import { describe, it, expect, vi } from 'vitest';
import { applyOfflineTranslation, translateWithAI } from '../translator';
import { buildHeuristicContent } from '../heuristicParser';
import type { AIConfig, RepoMetadata } from '../../types';

const meta: RepoMetadata = {
  stars: 1, forks: 0, openIssues: 0, license: 'MIT', description: 'Tool', topics: [],
  defaultBranch: 'main', repoUrl: 'https://github.com/a/tool', owner: 'a', name: 'tool',
  language: 'TypeScript', homepage: null,
};
const content = buildHeuristicContent(meta, '# Tool\n\nA tool.');

describe('applyOfflineTranslation', () => {
  it('translates template copy without mutating source', () => {
    const original = structuredClone(content);
    const result = applyOfflineTranslation(content, 'fa');
    expect(result).not.toBe(content);
    expect(content).toEqual(original);
    expect(result.hero.ctaPrimary).not.toBe(content.hero.ctaPrimary);
    expect(result.features).toEqual(content.features);
  });

  it('supports all advertised languages', () => {
    for (const lang of ['en', 'fa', 'es', 'zh', 'ja', 'de', 'fr'] as const) {
      const result = applyOfflineTranslation(content, lang);
      expect(result.hero.eyebrow).toBeTruthy();
      expect(result.newsletter?.buttonText).toBeTruthy();
    }
  });

  it('preserves content without optional sections', () => {
    const minimal = { ...content, newsletter: undefined, pricing: undefined, testimonials: undefined };
    const result = applyOfflineTranslation(minimal, 'de');
    expect(result.newsletter).toBeUndefined();
    expect(result.pricing).toBeUndefined();
    expect(result.testimonials).toBeUndefined();
  });
});

describe('translateWithAI', () => {
  it('falls back offline when API key is absent', async () => {
    const result = await translateWithAI({ provider: 'openai', apiKey: '' }, content, 'es');
    expect(result.hero.ctaPrimary).toBe('Comenzar');
  });

  it('throws a useful error for failed OpenAI response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })));
    const config: AIConfig = { provider: 'openai', apiKey: 'test-key' };
    await expect(translateWithAI(config, content, 'fr')).rejects.toThrow('Translation API failed (HTTP 401)');
  });

  it('merges valid OpenAI translation while preserving links and code', async () => {
    const translated = { hero: { eyebrow: 'Outil', headline: 'Un outil', subheadline: 'Description', ctaPrimary: 'Commencer', ctaSecondary: 'Étoiler' }, features: [], howItWorks: [], faq: [] };
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(translated) } }] }), { status: 200 })));
    const result = await translateWithAI({ provider: 'openai', apiKey: 'test-key' }, content, 'fr');
    expect(result.hero.headline).toBe('Un outil');
    expect(result.hero.ctaPrimaryLink).toBe(content.hero.ctaPrimaryLink);
    expect(result.quickstart).toEqual(content.quickstart);
  });

  it('supports Gemini response shape', async () => {
    const translated = { hero: { headline: 'Herramienta' } };
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(translated) }] } }] }), { status: 200 })));
    const result = await translateWithAI({ provider: 'gemini', apiKey: 'test-key' }, content, 'es');
    expect(result.hero.headline).toBe('Herramienta');
  });

  it('rejects malformed AI JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: 'not json' } }] }), { status: 200 })));
    await expect(translateWithAI({ provider: 'groq', apiKey: 'test-key' }, content, 'de')).rejects.toThrow('AI response was not valid JSON');
  });
});
