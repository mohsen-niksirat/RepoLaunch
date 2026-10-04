import type { LandingPageContent, RepoMetadata, FeatureItem, QuickstartTab, FAQItem, ReleaseItem } from '../types';
import { calculateStarHistory } from './starHistory';

// ─── Heuristic README → landing content parser (works with zero AI) ──────────

const ICON_ROTATION = ['Zap', 'ShieldCheck', 'Rocket', 'Layers', 'Gauge', 'Globe', 'Plug', 'Boxes', 'Sparkles', 'Wrench'];

function titleCase(s: string): string {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function stripMd(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]+/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/** Remove badge lines and html blocks, keep prose. */
function cleanReadme(md: string): string {
  return md
    .split('\n')
    .filter((l) => !/^\s*\[!\[/.test(l)) // badge-only lines
    .filter((l) => !/^\s*<\s*(img|a|p|div|br|h\d)\b/i.test(l))
    .join('\n');
}

function extractFirstParagraph(md: string): string {
  const lines = cleanReadme(md).split('\n');
  let started = false;
  const buf: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!started) {
      if (t.startsWith('#')) { started = true; continue; }
      if (t && !t.startsWith('#')) { started = true; }
    }
    if (started) {
      if (!t) { if (buf.length) break; else continue; }
      if (t.startsWith('#')) break;
      buf.push(t);
    }
  }
  return stripMd(buf.join(' ')).slice(0, 220);
}

/** Collect markdown bullet lists under a heading matching /feature|highlight|why|capab/ */
function extractFeatures(md: string): FeatureItem[] {
  const lines = cleanReadme(md).split('\n');
  const out: FeatureItem[] = [];
  let capture = false;
  let i = 0;
  for (const line of lines) {
    const t = line.trim();
    const h = t.match(/^#{2,4}\s+(.*)$/);
    if (h) {
      capture = /feature|highlight|why|capab|what|benefit|key/i.test(h[1]);
      continue;
    }
    if (capture) {
      const b = t.match(/^[-*+]\s+(.*)$/) || t.match(/^\d+\.\s+(.*)$/);
      if (b) {
        const raw = b[1];
        const bold = raw.match(/^\*\*([^*]+)\*\*\s*[:—-]?\s*(.*)$/);
        let title: string;
        let desc: string;
        if (bold) {
          title = stripMd(bold[1]);
          desc = stripMd(bold[2]);
        } else {
          const parts = raw.split(/\s[—–:]\s/);
          title = stripMd(parts[0]);
          desc = stripMd(parts.slice(1).join(' — '));
        }
        if (title.length > 2 && title.length < 80) {
          out.push({ title, desc: desc || `Built-in ${title.toLowerCase()} for production workloads.`, icon: ICON_ROTATION[i % ICON_ROTATION.length] });
          i++;
        }
      } else if (t && !t.startsWith('#')) {
        // prose ends the list
        if (out.length) capture = false;
      }
    }
    if (out.length >= 6) break;
  }
  return out;
}

/** Pull fenced code blocks and infer their tab label. */
function extractQuickstart(md: string): QuickstartTab[] {
  const tabs: QuickstartTab[] = [];
  const seen = new Set<string>();
  const re = /```(\w+)?\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    const lang = (m[1] || '').toLowerCase();
    const code = m[2].trim();
    if (!code || code.split('\n').length > 6) continue;
    let id = '';
    let label = '';
    if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === '') {
      if (/npm install|npm i\b|npx /.test(code)) { id = 'npm'; label = 'npm'; }
      else if (/pnpm /.test(code)) { id = 'pnpm'; label = 'pnpm'; }
      else if (/yarn /.test(code)) { id = 'yarn'; label = 'yarn'; }
      else if (/pip install/.test(code)) { id = 'pip'; label = 'pip'; }
      else if (/docker (run|pull)/.test(code)) { id = 'docker'; label = 'docker'; }
      else if (/git clone/.test(code)) { id = 'clone'; label = 'git clone'; }
      else { id = 'shell'; label = 'shell'; }
    } else if (lang === 'dockerfile' || lang === 'docker') { id = 'docker'; label = 'docker'; }
    else if (lang === 'python') { id = 'python'; label = 'python'; }
    else continue;

    if (id && !seen.has(id)) {
      seen.add(id);
      tabs.push({ id, label, command: code });
    }
    if (tabs.length >= 4) break;
  }
  return tabs;
}

/** FAQs: look for "### question" immediately followed by prose, in an FAQ section. */
function extractFaq(md: string): FAQItem[] {
  const lines = cleanReadme(md).split('\n');
  const out: FAQItem[] = [];
  let inFaq = false;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    const h = t.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      if (/faq|frequently asked|question/i.test(h[2])) { inFaq = true; continue; }
      if (inFaq && level <= 2) { inFaq = false; continue; }
      if (inFaq && level >= 3) {
        const q = stripMd(h[2]);
        const buf: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          const nt = lines[j].trim();
          if (!nt) { if (buf.length) break; else continue; }
          if (nt.startsWith('#')) break;
          buf.push(stripMd(nt));
        }
        if (q && buf.length) out.push({ question: q, answer: buf.join(' ') });
      }
    }
    if (out.length >= 6) break;
  }
  return out;
}

function extractTechStack(meta: RepoMetadata, md: string): string[] {
  const pills = new Set<string>();
  if (meta.language) pills.add(meta.language);
  for (const t of meta.topics || []) pills.add(titleCase(t));
  const known = ['TypeScript', 'JavaScript', 'React', 'Vue', 'Svelte', 'Next.js', 'Node.js', 'Python', 'Django', 'FastAPI', 'Flask', 'Go', 'Rust', 'Docker', 'Kubernetes', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Tailwind', 'GraphQL', 'Vite', 'Webpack', 'Java', 'Kotlin', 'Swift'];
  for (const k of known) {
    if (new RegExp(`\\b${k.replace('.', '\\.')}\\b`, 'i').test(md)) pills.add(k);
  }
  return Array.from(pills).slice(0, 10);
}

function resolveImageUrl(url: string, meta: RepoMetadata): string {
  if (/^https?:\/\//i.test(url)) return url;
  const clean = url.replace(/^\.?\//, '').replace(/^\/+/, '');
  return `https://raw.githubusercontent.com/${meta.owner}/${meta.name}/${meta.defaultBranch}/${clean}`;
}

function extractScreenshots(rawMd: string, meta: RepoMetadata): { url: string; caption?: string }[] {
  const screenshots: { url: string; caption?: string }[] = [];
  const seen = new Set<string>();

  const isBadge = (url: string) =>
    /shields\.io|badge|travis-ci|codecov|github-action|workflow|githubassets|fury\.io|coveralls|david-dm|gitter\.im/i.test(url);

  // Markdown images: ![caption](url)
  const mdImgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = mdImgRegex.exec(rawMd)) !== null) {
    const caption = m[1].trim();
    let url = m[2].trim().split(/\s+/)[0];
    if (!url || isBadge(url)) continue;
    url = resolveImageUrl(url, meta);
    if (!seen.has(url)) {
      seen.add(url);
      screenshots.push({ url, caption: caption || `${meta.name} Preview` });
    }
  }

  // HTML images: <img src="..." alt="...">
  const htmlImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((m = htmlImgRegex.exec(rawMd)) !== null) {
    let url = m[1].trim();
    if (!url || isBadge(url)) continue;
    url = resolveImageUrl(url, meta);
    if (!seen.has(url)) {
      seen.add(url);
      screenshots.push({ url, caption: `${meta.name} Screenshot` });
    }
  }

  return screenshots.slice(0, 4);
}

export function buildHeuristicContent(meta: RepoMetadata, readme: string, releases?: ReleaseItem[]): LandingPageContent {
  const md = cleanReadme(readme || '');
  const excerpt = extractFirstParagraph(md) || meta.description || `A modern open-source project from ${meta.owner}.`;

  const eyebrow = meta.latestRelease?.tagName
    ? `Release ${meta.latestRelease.tagName}`
    : meta.topics?.[0] ? titleCase(meta.topics[0]) : (meta.language ? `${meta.language} project` : 'Open Source');
  const headline = meta.description && meta.description.length < 90
    ? meta.description
    : `${titleCase(meta.name)} — ${excerpt.split(/[.!?]/)[0].slice(0, 70)}`;

  let features = extractFeatures(md);
  if (features.length < 3) {
    const fallback: FeatureItem[] = [
      { title: 'Battle-tested', desc: `${meta.stars.toLocaleString()} developers rely on ${meta.name} in production.`, icon: 'ShieldCheck' },
      { title: 'Developer-first DX', desc: 'A clean, predictable API that gets out of your way.', icon: 'Zap' },
      { title: 'Open Source', desc: `Free and open under the ${meta.license ?? 'open'} license.`, icon: 'Globe' },
      { title: 'Well documented', desc: 'Comprehensive docs and examples to get you started fast.', icon: 'Layers' },
    ];
    features = [...features, ...fallback].slice(0, 6);
  }

  let quickstart = extractQuickstart(md);
  if (quickstart.length === 0) {
    quickstart = [{ id: 'clone', label: 'git clone', command: `git clone ${meta.repoUrl}.git\ncd ${meta.name}` }];
  }

  let faq = extractFaq(md);
  if (faq.length === 0) {
    faq = [
      { question: `Is ${meta.name} free to use?`, answer: `Yes. ${meta.name} is open source${meta.license ? ` under the ${meta.license} license` : ''}.` },
      { question: 'How do I contribute?', answer: `Open an issue or a pull request on GitHub at ${meta.repoUrl}.` },
      { question: 'Where can I get support?', answer: 'Check the documentation and open a discussion on the repository.' },
    ];
  }

  const techStack = extractTechStack(meta, md).map((label) => ({ label }));
  const screenshots = extractScreenshots(readme || '', meta);

  const changelog: ReleaseItem[] = releases && releases.length > 0
    ? releases
    : meta.latestRelease
    ? [{ tagName: meta.latestRelease.tagName, name: 'Latest Stable Release', publishedAt: meta.latestRelease.publishedAt || 'Recent', body: 'Production-ready build with new features, dependency upgrades, and performance optimizations.' }]
    : [];

  const starHistory = calculateStarHistory(meta);

  return {
    hero: {
      eyebrow,
      headline,
      subheadline: excerpt,
      ctaPrimary: 'Get Started',
      ctaPrimaryLink: meta.homepage || meta.repoUrl,
      ctaSecondary: 'Star on GitHub',
      ctaSecondaryLink: meta.repoUrl,
      badges: [
        { label: 'Stars', value: meta.stars.toLocaleString() },
        { label: 'Forks', value: meta.forks.toLocaleString() },
        ...(meta.latestRelease ? [{ label: 'Version', value: meta.latestRelease.tagName }] : []),
        ...(meta.license ? [{ label: 'License', value: meta.license }] : []),
      ],
    },
    features,
    screenshots,
    quickstart,
    techStack,
    faq,
    footerLinks: [
      { label: 'GitHub', href: meta.repoUrl },
      { label: 'Issues', href: `${meta.repoUrl}/issues` },
      ...(meta.homepage ? [{ label: 'Website', href: meta.homepage }] : []),
    ],
    howItWorks: [
      { title: 'Install', desc: `Add ${titleCase(meta.name)} to your project in seconds.` },
      { title: 'Configure', desc: 'Drop in your settings and import the API.' },
      { title: 'Ship', desc: 'Deploy to production with confidence.' },
    ],
    newsletter: {
      heading: `Stay updated on ${titleCase(meta.name)}`,
      description: 'Get notified about new releases, documentation updates, and development progress.',
      placeholder: 'Enter your email address...',
      buttonText: 'Subscribe',
    },
    changelog,
    starHistory,
  };
}
