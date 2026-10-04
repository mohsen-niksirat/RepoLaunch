import type { AIConfig, LandingPageContent, RepoMetadata } from '../types';

// ─── BYOK AI enhancement: OpenAI / Gemini / Groq / custom OpenAI-compatible ──

const ENDPOINTS: Record<Exclude<AIConfig['provider'], 'custom'>, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
};

const DEFAULT_MODEL: Record<AIConfig['provider'], string> = {
  openai: 'gpt-4o-mini',
  groq: 'llama-3.3-70b-versatile',
  gemini: 'gemini-1.5-flash',
  custom: 'gpt-4o-mini',
};

function buildPrompt(meta: RepoMetadata, readme: string, customPrompt?: string): string {
  const excerpt = (readme || '').slice(0, 6000);
  const extra = customPrompt?.trim()
    ? `\nSPECIAL USER INSTRUCTIONS / TONE / TARGET AUDIENCE:\n"${customPrompt.trim()}"\n`
    : '';
  return `You are a senior product marketer. Rewrite marketing copy for a developer landing page for the GitHub repo "${meta.owner}/${meta.name}".
${extra}
Repo metadata:
- Description: ${meta.description}
- Language: ${meta.language ?? 'unknown'}
- Stars: ${meta.stars}, Forks: ${meta.forks}, License: ${meta.license ?? 'unknown'}
- Topics: ${(meta.topics || []).join(', ')}

README excerpt:
"""
${excerpt}
"""

Return STRICT JSON only (no markdown fences) with this exact shape:
{
  "hero": { "eyebrow": string, "headline": string, "subheadline": string, "ctaPrimary": string, "ctaSecondary": string },
  "features": [ { "title": string, "desc": string } ],
  "faq": [ { "question": string, "answer": string } ]
}
Rules:
- headline: punchy, under 66 chars, no trailing period.
- subheadline: 1-2 sentences of concrete value, under 180 chars.
- features: 4 to 6 items, benefit-led (not just restating the README).
- faq: 4 to 5 items developers actually ask.
- Respect the special user instructions if provided.`;
}

function extractJson(text: string): any {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('AI response was not valid JSON.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function enhanceWithAI(
  config: AIConfig,
  meta: RepoMetadata,
  readme: string,
  current: LandingPageContent,
): Promise<LandingPageContent> {
  if (!config.apiKey) throw new Error('Missing API key. Add one in Settings.');
  const model = config.model || DEFAULT_MODEL[config.provider];
  const prompt = buildPrompt(meta, readme, config.customPrompt);

  let text = '';

  if (config.provider === 'gemini') {
    const url = `${ENDPOINTS.gemini}/${model}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini request failed (HTTP ${res.status}). Check your key/model.`);
    const data = await res.json();
    text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } else {
    const url = config.provider === 'custom' && config.baseUrl
      ? config.baseUrl.replace(/\/$/, '') + '/chat/completions'
      : ENDPOINTS[config.provider as 'openai' | 'groq'];
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a concise product marketing copywriter. Reply with strict JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) throw new Error(`AI request failed (HTTP ${res.status}). Check your key, provider, and model name.`);
    const data = await res.json();
    text = data?.choices?.[0]?.message?.content ?? '';
  }

  const parsed = extractJson(text);

  // Merge AI output over the heuristic baseline, preserving structure.
  const next: LandingPageContent = JSON.parse(JSON.stringify(current));
  if (parsed.hero) {
    next.hero.eyebrow = parsed.hero.eyebrow ?? next.hero.eyebrow;
    next.hero.headline = parsed.hero.headline ?? next.hero.headline;
    next.hero.subheadline = parsed.hero.subheadline ?? next.hero.subheadline;
    next.hero.ctaPrimary = parsed.hero.ctaPrimary ?? next.hero.ctaPrimary;
    next.hero.ctaSecondary = parsed.hero.ctaSecondary ?? next.hero.ctaSecondary;
  }
  if (Array.isArray(parsed.features) && parsed.features.length) {
    const icons = current.features.map((f) => f.icon);
    next.features = parsed.features.slice(0, 6).map((f: any, i: number) => ({
      title: String(f.title ?? '').slice(0, 80),
      desc: String(f.desc ?? '').slice(0, 220),
      icon: icons[i % Math.max(icons.length, 1)] || 'Zap',
    }));
  }
  if (Array.isArray(parsed.faq) && parsed.faq.length) {
    next.faq = parsed.faq.slice(0, 6).map((f: any) => ({
      question: String(f.question ?? ''),
      answer: String(f.answer ?? ''),
    }));
  }
  return next;
}
