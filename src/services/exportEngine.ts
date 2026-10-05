import type { LandingPageContent, RepoMetadata, ThemeConfig } from '../types';
import { renderStarHistorySvg } from './starHistory';

// ─── Export engine: standalone HTML / React JSX / ZIP bundle ─────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const LUCIDE_PATHS: Record<string, string> = {
  Zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  ShieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  Rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  Layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  Gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  Globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  Plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  Boxes: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>',
  Sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  Wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  Copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  ChevronDown: '<path d="m6 9 6 6 6-6"/>',
  Terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  Github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  ArrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  Check: '<polyline points="20 6 9 17 4 12"/>',
  Heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  Quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>',
};

function iconSvg(name: string, cls: string): string {
  const p = LUCIDE_PATHS[name] || LUCIDE_PATHS['Zap'];
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
}

function themeTokens(theme: ThemeConfig): { css: string; bodyCls: string } {
  const accent = theme.accentColor;
  if (theme.themeId === 'bento-modern') {
    return {
      bodyCls: 'rl-bento',
      css: `
.rl-bento{--bg:#0b0d14;--fg:#f1f5f9;--muted:#94a3b8;--card:rgba(18,22,34,.75);--border:rgba(255,255,255,.08);--accent:${accent};
 background:radial-gradient(ellipse 80% 50% at 50% -20%,${accent}26,transparent),#0b0d14;color:var(--fg);font-family:Inter,ui-sans-serif,system-ui,sans-serif;}
.rl-card{background:var(--card);border:1px solid var(--border);border-radius:20px;backdrop-filter:blur(16px);box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 20px 40px -15px rgba(0,0,0,.5);transition:all .3s cubic-bezier(0.16,1,0.3,1)}
.rl-card:hover{border-color:${accent}88;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 20px 40px -10px ${accent}33;transform:translateY(-3px)}
.rl-eyebrow{border:1px solid ${accent}40;background:linear-gradient(135deg,${accent}22,${accent}08);color:${accent};border-radius:9999px}
.rl-btn-primary{background:linear-gradient(135deg,${accent},#4f46e5);color:#fff;border-radius:12px;font-weight:600;box-shadow:0 4px 20px -2px ${accent}66;transition:all .2s}
.rl-btn-primary:hover{filter:brightness(1.15);transform:translateY(-1px);box-shadow:0 6px 24px -2px ${accent}88}
.rl-btn-ghost{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);backdrop-filter:blur(8px);border-radius:12px}
.rl-btn-ghost:hover{border-color:${accent}88;background:${accent}15}
.rl-code{background:#06070a;border:1px solid rgba(255,255,255,.08);border-radius:16px;box-shadow:inset 0 2px 4px rgba(0,0,0,.6)}
.rl-tab-active{color:#fff;background:${accent}22;border:1px solid ${accent}66;border-radius:8px}
.rl-bento-hero{background:linear-gradient(180deg,rgba(255,255,255,.03) 0%,rgba(255,255,255,0) 100%)}
.rl-bento-span-2{grid-column:span 2 / span 2}
@media (max-width:768px){.rl-bento-span-2{grid-column:span 1 / span 1}}`,
    };
  }
  if (theme.themeId === 'midnight-linear') {
    return {
      bodyCls: 'rl-midnight',
      css: `
.rl-midnight{--bg:#0a0a12;--fg:#e7e7ef;--muted:#9aa;--card:rgba(255,255,255,.04);--border:rgba(255,255,255,.09);--accent:${accent};
 background:radial-gradient(1000px 500px at 50% -10%,${accent}22,transparent 60%),var(--bg);color:var(--fg);font-family:Inter,ui-sans-serif,system-ui,sans-serif;}
.rl-card{background:var(--card);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(8px);transition:border-color .2s,transform .2s}
.rl-card:hover{border-color:${accent}66;transform:translateY(-2px)}
.rl-eyebrow{border:1px solid ${accent}55;background:${accent}14;color:${accent}}
.rl-btn-primary{background:${accent};color:#0a0a12}
.rl-btn-primary:hover{filter:brightness(1.12)}
.rl-btn-ghost{border:1px solid var(--border);background:transparent}
.rl-btn-ghost:hover{border-color:${accent}88;background:${accent}12}
.rl-code{background:rgba(0,0,0,.45);border:1px solid var(--border);border-radius:12px}
.rl-tab-active{color:${accent};border-color:${accent}}
.rl-glow{position:absolute;inset:-1px;border-radius:16px;background:linear-gradient(120deg,${accent}55,transparent 40%,${accent}33);filter:blur(14px);opacity:.35;z-index:-1;animation:rl-glow 4s ease-in-out infinite}
@keyframes rl-glow{0%,100%{opacity:.25}50%{opacity:.5}}`,
    };
  }
  if (theme.themeId === 'neo-brutalist') {
    return {
      bodyCls: 'rl-brutal',
      css: `
.rl-brutal{--bg:#fff8e7;--fg:#111;--muted:#444;--card:#fff;--border:#111;--accent:${accent};
 background:var(--bg);color:var(--fg);font-family:ui-sans-serif,system-ui,sans-serif;}
.rl-card{background:var(--card);border:2px solid #111;border-radius:10px;box-shadow:6px 6px 0 #111;transition:transform .15s,box-shadow .15s}
.rl-card:hover{transform:translate(-2px,-2px);box-shadow:9px 9px 0 #111}
.rl-eyebrow{border:2px solid #111;background:${accent};color:#111;box-shadow:3px 3px 0 #111}
.rl-btn-primary{background:#111;color:#fff;border:2px solid #111;box-shadow:4px 4px 0 ${accent}}
.rl-btn-primary:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 ${accent}}
.rl-btn-ghost{border:2px solid #111;background:#fff;box-shadow:4px 4px 0 #111}
.rl-btn-ghost:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 #111}
.rl-code{background:#111;color:#d8ffb0;border:2px solid #111;border-radius:10px;box-shadow:6px 6px 0 ${accent}}
.rl-tab-active{background:${accent};border:2px solid #111;box-shadow:2px 2px 0 #111}`,
    };
  }
  if (theme.themeId === 'matrix-terminal') {
    return {
      bodyCls: 'rl-terminal',
      css: `
.rl-terminal{--bg:#050d08;--fg:#4ade80;--muted:#22c55e99;--card:#091b10;--border:#15803d;--accent:${accent || '#22c55e'};
 background:#050d08;color:var(--fg);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;}
.rl-card{background:var(--card);border:1px solid var(--border);border-radius:6px;box-shadow:0 0 15px rgba(34,197,94,.12);transition:border-color .2s,box-shadow .2s}
.rl-card:hover{border-color:var(--accent);box-shadow:0 0 25px rgba(34,197,94,.25)}
.rl-eyebrow{border:1px solid var(--border);background:#092e16;color:var(--accent);border-radius:4px}
.rl-btn-primary{background:var(--accent);color:#050d08;border:1px solid var(--accent);border-radius:4px;font-weight:700}
.rl-btn-primary:hover{box-shadow:0 0 15px var(--accent);filter:brightness(1.15)}
.rl-btn-ghost{border:1px solid var(--border);background:#07140a;color:var(--fg);border-radius:4px}
.rl-btn-ghost:hover{border-color:var(--accent);background:#0d2614}
.rl-code{background:#020604;border:1px solid var(--border);border-radius:6px;color:#86efac}
.rl-tab-active{color:#050d08;background:var(--accent);border-color:var(--accent)}`,
    };
  }
  return {
    bodyCls: 'rl-minimal',
    css: `
.rl-minimal{--bg:#fafafa;--fg:#111827;--muted:#6b7280;--card:#fff;--border:#e5e7eb;--accent:${accent};
 background:var(--bg);color:var(--fg);font-family:Inter,ui-sans-serif,system-ui,sans-serif;}
.rl-card{background:var(--card);border:1px solid var(--border);border-radius:16px;box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px -12px rgba(0,0,0,.12);transition:box-shadow .2s,transform .2s}
.rl-card:hover{box-shadow:0 2px 4px rgba(0,0,0,.05),0 16px 32px -12px rgba(0,0,0,.16);transform:translateY(-2px)}
.rl-eyebrow{background:${accent}14;color:${accent}}
.rl-btn-primary{background:#111827;color:#fff}
.rl-btn-primary:hover{background:#000}
.rl-btn-ghost{border:1px solid var(--border);background:#fff}
.rl-btn-ghost:hover{border-color:#9ca3af}
.rl-code{background:#111827;color:#e5e7eb;border-radius:14px}
.rl-tab-active{color:#111827;border-color:#111827;background:#fff}`,
  };
}

function quickstartScript(): string {
  return `
document.querySelectorAll('.rl-tabs').forEach(function(wrap){
  wrap.addEventListener('click', function(e){
    var b = e.target.closest('button[data-tab]'); if(!b) return;
    var box = wrap.closest('.rl-quickstart');
    var tabId = b.getAttribute('data-tab');
    box.querySelectorAll('[data-panel]').forEach(function(p){p.hidden = p.getAttribute('data-panel')!==tabId;});
    wrap.querySelectorAll('button[data-tab]').forEach(function(x){x.classList.toggle('rl-tab-active', x===b);});
  });
});
document.addEventListener('click', function(e){
  var btn = e.target.closest('[data-copy]'); if(!btn) return;
  var box = btn.closest('.rl-quickstart');
  var pre = box ? box.querySelector('[data-panel]:not([hidden]) code') : document.querySelector('.rl-quickstart [data-panel]:not([hidden]) code');
  if(!pre) return;
  navigator.clipboard.writeText(pre.textContent.trim()).then(function(){
    var lbl = btn.querySelector('span');
    if(lbl){
      var old = lbl.textContent;
      lbl.textContent='Copied!';
      setTimeout(function(){lbl.textContent=old;},1400);
    }
  });
});
document.querySelectorAll('.rl-faq-item > button').forEach(function(b){
  b.addEventListener('click', function(){
    var a = b.nextElementSibling; var open = !a.hidden; a.hidden = open;
    b.querySelector('.rl-chev').style.transform = open ? '' : 'rotate(180deg)';
  });
});`;
}

export function generateFaviconSvg(meta: RepoMetadata, theme: ThemeConfig): string {
  const initial = (meta.name || 'R').charAt(0).toUpperCase();
  const accent = theme.accentColor || '#818cf8';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="rl-fav-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#rl-fav-grad)" />
  <text x="32" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${initial}</text>
</svg>`;
}

export function generateManifestJson(meta: RepoMetadata, content: LandingPageContent, theme: ThemeConfig): string {
  return JSON.stringify({
    name: `${meta.name} — ${content.hero.headline}`,
    short_name: meta.name,
    description: content.hero.subheadline,
    start_url: './',
    display: 'standalone',
    background_color: theme.themeId === 'bento-modern' ? '#0b0d14' : theme.themeId === 'midnight-linear' ? '#0a0a12' : theme.themeId === 'matrix-terminal' ? '#050d08' : '#ffffff',
    theme_color: theme.accentColor || '#818cf8',
    icons: [
      {
        src: './favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ]
  }, null, 2);
}

/** Generate a complete, self-contained standalone HTML page. */
export function generateStandaloneHTML(meta: RepoMetadata, content: LandingPageContent, theme: ThemeConfig): string {
  const { css, bodyCls } = themeTokens(theme);
  const h = content.hero;
  const isRtl = theme.language === 'fa';
  const langCode = theme.language || 'en';
  const faviconSvg = generateFaviconSvg(meta, theme);
  const faviconDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(faviconSvg)}`;

  const tabs = content.quickstart
    .map((t, i) => `<button data-tab="t${i}" class="rl-tab px-4 py-2 text-sm border-b-2 border-transparent font-medium ${i === 0 ? 'rl-tab-active' : ''}">${esc(t.label)}</button>`)
    .join('');
  const panels = content.quickstart
    .map(
      (t, i) => `<div data-panel="t${i}" ${i ? 'hidden' : ''}><pre class="overflow-x-auto"><code>${esc(t.command)}</code></pre></div>`
    )
    .join('');

  const features = content.features
    .map(
      (f, i) => {
        const spanCls = theme.themeId === 'bento-modern' && (i === 0 || i === 3) ? ' rl-bento-span-2' : '';
        return `<div class="rl-card p-6${spanCls}"><div class="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style="background:var(--accent);color:${theme.themeId === 'midnight-linear' ? '#0a0a12' : '#fff'}">${iconSvg(f.icon, 'w-5 h-5')}</div>
<h3 class="text-lg font-semibold mb-1">${esc(f.title)}</h3><p class="text-sm" style="color:var(--muted)">${esc(f.desc)}</p></div>`;
      }
    )
    .join('');

  const tech = content.techStack.map((t) => `<span class="rl-card px-3 py-1 text-xs font-medium">${esc(t.label)}</span>`).join('');

  const faq = content.faq
    .map(
      (f) => `<div class="rl-faq-item rl-card mb-3 overflow-hidden"><button class="w-full flex items-center justify-between px-5 py-4 ${isRtl ? 'text-right' : 'text-left'} font-medium">${esc(f.question)}${iconSvg('ChevronDown', 'w-4 h-4 rl-chev transition-transform shrink-0 ml-3')}</button><div hidden class="px-5 pb-4 text-sm" style="color:var(--muted)">${esc(f.answer)}</div></div>`
    )
    .join('');

  const badges = h.badges
    .map((b) => `<span class="rl-card px-3 py-1 text-xs"><b>${esc(b.value)}</b> <span style="color:var(--muted)">${esc(b.label)}</span></span>`)
    .join('');

  const quickstartSection = theme.showTerminal
    ? `<section class="rl-quickstart max-w-3xl mx-auto px-6 py-16">
    <h2 class="text-2xl md:text-3xl font-bold text-center mb-8">Get started in seconds</h2>
    <div class="rl-code overflow-hidden">
      <div class="flex items-center justify-between px-4 pt-2">
        <div class="flex rl-tabs" role="tablist">${tabs}</div>
        <button data-copy="t0" class="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md opacity-70 hover:opacity-100">${iconSvg('Copy', 'w-3.5 h-3.5')}<span>Copy</span></button>
      </div>
      <div class="px-4 pb-4 pt-2 text-sm font-mono">${panels}</div>
    </div>
  </section>`
    : '';

  const screenshotsSection = theme.showScreenshots && content.screenshots && content.screenshots.length
    ? `<section class="container px-6 -mt-4 mb-16">
    <div class="rl-card overflow-hidden">
      <div style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border)">
        <span style="width:10px;height:10px;border-radius:50%;background:#ef4444;display:inline-block"></span>
        <span style="width:10px;height:10px;border-radius:50%;background:#eab308;display:inline-block"></span>
        <span style="width:10px;height:10px;border-radius:50%;background:#22c55e;display:inline-block"></span>
        <span style="font-family:monospace;font-size:12px;margin:0 auto;color:var(--muted)">${esc(meta.name)} / preview</span>
      </div>
      <div style="padding:16px;background:rgba(0,0,0,0.15);text-align:center">
        <img src="${esc(content.screenshots[0].url)}" alt="${esc(content.screenshots[0].caption || meta.name)}" style="max-height:520px;max-width:100%;border-radius:8px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.3);margin:0 auto;display:block" onerror="this.parentElement.parentElement.style.display='none'"/>
        ${content.screenshots[0].caption ? `<p style="font-size:12px;margin-top:10px;color:var(--muted)">${esc(content.screenshots[0].caption)}</p>` : ''}
      </div>
    </div>
  </section>`
    : '';

  const howItWorksSection = content.howItWorks && content.howItWorks.length
    ? `<section class="container px-6 py-16">
    <h2 class="section-title">How it works</h2>
    <div class="grid">${content.howItWorks.map((step, i) => `
      <div class="rl-card p-6">
        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-4" style="background:${theme.themeId === 'neo-brutalist' ? 'var(--accent)' : 'rgba(255,255,255,0.08)'};color:var(--accent);${theme.themeId === 'neo-brutalist' ? 'border:2px solid #111;color:#111' : ''}">${i + 1}</div>
        <h3 class="text-lg font-semibold mb-2">${esc(step.title)}</h3>
        <p class="text-sm" style="color:var(--muted)">${esc(step.desc)}</p>
      </div>`).join('')}
    </div>
  </section>`
    : '';

  const faqSection = theme.showFaq && content.faq.length
    ? `<section class="max-w-3xl mx-auto px-6 py-16"><h2 class="text-2xl md:text-3xl font-bold text-center mb-8">Frequently asked questions</h2>${faq}</section>`
    : '';

  const techSection = theme.showTechStack && content.techStack.length
    ? `<section class="max-w-4xl mx-auto px-6 py-12 text-center"><h3 class="text-sm font-semibold uppercase tracking-widest mb-4" style="color:var(--muted)">Built with</h3><div class="flex flex-wrap justify-center gap-2">${tech}</div></section>`
    : '';

  const starHistorySection = theme.showStarHistory !== false && content.starHistory && content.starHistory.length > 0
    ? `<section class="max-w-3xl mx-auto px-6 py-14">
    <div class="rl-card p-6 md:p-8">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
        <div>
          <h2 style="font-size:20px;font-weight:700;letter-spacing:-0.02em">Community Growth & Star Velocity</h2>
          <p style="font-size:13px;color:var(--muted);margin-top:2px">Trajectory across releases and milestones</p>
        </div>
        <span class="rl-card px-3 py-1 text-xs font-mono font-semibold" style="display:inline-flex;align-items:center;gap:6px">
          ${iconSvg('Star', 'w-3.5 h-3.5')} ${meta.stars.toLocaleString()} Stars
        </span>
      </div>
      <div style="padding:10px 0">${renderStarHistorySvg(content.starHistory, theme.accentColor, theme.themeId === 'matrix-terminal', theme.themeId === 'clean-minimal' || theme.themeId === 'neo-brutalist')}</div>
    </div>
  </section>`
    : '';

  const changelogSection = theme.showChangelog !== false && content.changelog && content.changelog.length > 0
    ? `<section class="max-w-3xl mx-auto px-6 py-14">
    <h2 class="text-2xl md:text-3xl font-bold text-center mb-8">Recent Releases & Changelog</h2>
    <div style="display:flex;flex-direction:column;gap:16px">
      ${content.changelog.map((rel) => `
        <div class="rl-card p-6">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">
            <div style="display:flex;align-items:center;gap:8px">
              <span class="rl-eyebrow px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">${esc(rel.tagName)}</span>
              <h3 style="font-weight:600;font-size:16px">${esc(rel.name)}</h3>
            </div>
            <span style="font-size:12px;color:var(--muted);font-family:monospace">${esc(rel.publishedAt)}</span>
          </div>
          ${rel.body ? `<p style="font-size:13px;color:var(--muted);line-height:1.6;margin-top:8px">${esc(rel.body)}</p>` : ''}
        </div>
      `).join('')}
    </div>
  </section>`
    : '';

  const newsletterSection = theme.showNewsletter !== false
    ? `<section class="max-w-2xl mx-auto px-6 py-16 text-center">
    <div class="rl-card p-8 md:p-10 relative overflow-hidden">
      <h2 class="text-2xl md:text-3xl font-bold mb-3">${esc(content.newsletter?.heading || `Stay updated on ${meta.name}`)}</h2>
      <p class="text-sm mb-6 max-w-md mx-auto" style="color:var(--muted)">${esc(content.newsletter?.description || 'Get notified about new releases, documentation updates, and development progress.')}</p>
      <form class="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto" action="${esc(theme.newsletterEndpoint || '#')}" method="POST" onsubmit="event.preventDefault(); var btn=this.querySelector('button'); var inp=this.querySelector('input'); btn.textContent='Subscribed! ✓'; btn.disabled=true; inp.disabled=true;">
        <input type="email" required placeholder="${esc(content.newsletter?.placeholder || 'Enter your email...')}" class="flex-1 px-4 py-3 rounded-xl border text-sm outline-none bg-black/20 focus:border-indigo-400" style="border-color:var(--border);color:inherit"/>
        <button type="submit" class="rl-btn-primary px-6 py-3 rounded-xl font-semibold text-sm shrink-0 transition">${esc(content.newsletter?.buttonText || 'Subscribe')}</button>
      </form>
    </div>
  </section>`
    : '';

  const testimonialsSection = theme.showTestimonials !== false && content.testimonials && content.testimonials.items?.length
    ? `<section class="container px-6 py-16">
    <div style="text-align:center;margin-bottom:40px">
      <h2 class="section-title" style="margin-bottom:8px">${esc(content.testimonials.heading)}</h2>
      <p style="font-size:14px;color:var(--muted);max-width:540px;margin:0 auto">${esc(content.testimonials.description)}</p>
    </div>
    <div class="grid">${content.testimonials.items.map((item) => `
      <div class="rl-card p-6" style="display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div style="margin-bottom:12px;opacity:0.6;color:var(--accent)">${iconSvg('Quote', 'w-6 h-6')}</div>
          <p style="font-size:14px;line-height:1.6;font-style:italic;margin-bottom:20px">${esc(item.quote)}</p>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06)">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;text-transform:uppercase">
            ${esc(item.author.split(' ').map((n: string) => n[0]).join('').slice(0, 2))}
          </div>
          <div>
            <div style="font-weight:600;font-size:14px">${esc(item.author)}</div>
            <div style="font-size:12px;color:var(--muted)">${esc(item.role)}${item.handle ? ` <span style="opacity:0.7">${esc(item.handle)}</span>` : ''}</div>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </section>`
    : '';

  const pricingSection = theme.showPricing !== false && content.pricing && content.pricing.tiers?.length
    ? `<section class="container px-6 py-16">
    <div style="text-align:center;margin-bottom:40px">
      <h2 class="section-title" style="margin-bottom:8px">${esc(content.pricing.heading)}</h2>
      <p style="font-size:14px;color:var(--muted);max-width:540px;margin:0 auto">${esc(content.pricing.description)}</p>
    </div>
    <div class="grid" style="align-items:stretch">${content.pricing.tiers.map((tier) => `
      <div class="rl-card p-6" style="display:flex;flex-direction:column;justify-content:space-between;position:relative;${tier.popular ? 'border-color:var(--accent);box-shadow:0 0 25px rgba(129,140,248,0.2)' : ''}">
        ${tier.popular ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--accent);color:#0a0a12;font-size:10px;font-weight:700;text-transform:uppercase;padding:3px 12px;border-radius:999px;letter-spacing:0.05em">${esc(tier.badge || 'Most Popular')}</div>` : ''}
        <div>
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px">${esc(tier.name)}</h3>
          <div style="display:flex;align-items:baseline;gap:4px;margin:16px 0">
            <span style="font-size:36px;font-weight:800;letter-spacing:-0.03em">${esc(tier.price)}</span>
            ${tier.period ? `<span style="font-size:13px;color:var(--muted)">${esc(tier.period)}</span>` : ''}
          </div>
          <p style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:20px">${esc(tier.description)}</p>
          <ul style="list-style:none;padding:0;margin:0 0 28px 0;display:flex;flex-direction:column;gap:10px">
            ${tier.features.map((feat) => `<li style="display:flex;align-items:flex-start;gap:8px;font-size:13px"><span style="color:var(--accent);flex-shrink:0;margin-top:2px">${iconSvg('Check', 'w-3.5 h-3.5')}</span><span>${esc(feat)}</span></li>`).join('')}
          </ul>
        </div>
        <a class="btn ${tier.popular ? 'rl-btn-primary' : 'rl-btn-ghost'}" href="${esc(tier.ctaLink)}" target="_blank" rel="noopener" style="width:100%;text-align:center;justify-content:center">
          ${tier.ctaText.toLowerCase().includes('sponsor') ? iconSvg('Heart', 'w-4 h-4') + ' ' : ''}${esc(tier.ctaText)} ${iconSvg('ArrowRight', 'w-3.5 h-3.5')}
        </a>
      </div>`).join('')}
    </div>
  </section>`
    : '';

  const videoEmbedSection = theme.showVideoEmbed !== false && content.videoEmbed?.videoUrl
    ? `<section class="max-w-4xl mx-auto px-6 py-12">
    <div style="text-align:center;margin-bottom:28px">
      <h2 class="text-2xl md:text-3xl font-bold mb-2">${esc(content.videoEmbed.heading)}</h2>
      <p style="font-size:14px;color:var(--muted);max-width:540px;margin:0 auto">${esc(content.videoEmbed.description)}</p>
    </div>
    <div class="rl-card overflow-hidden" style="border-radius:16px">
      <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;background:rgba(0,0,0,0.5)">
        <iframe src="${esc(content.videoEmbed.videoUrl)}" title="${esc(content.videoEmbed.heading)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  </section>`
    : '';

  const roadmapSection = theme.showRoadmap !== false && content.roadmap && content.roadmap.items?.length
    ? `<section class="container px-6 py-16">
    <div style="text-align:center;margin-bottom:40px">
      <h2 class="section-title" style="margin-bottom:8px">${esc(content.roadmap.heading)}</h2>
      <p style="font-size:14px;color:var(--muted);max-width:540px;margin:0 auto">${esc(content.roadmap.description)}</p>
    </div>
    <div class="grid">${content.roadmap.items.map((item) => `
      <div class="rl-card p-6" style="display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <span class="rl-eyebrow px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">${esc(item.phase)}</span>
            <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:${item.status === 'completed' ? 'rgba(34,197,94,0.15);color:#22c55e' : item.status === 'in-progress' ? 'rgba(234,179,8,0.15);color:#eab308' : 'rgba(156,163,175,0.15);color:#9ca3af'}">${item.status === 'completed' ? 'Completed' : item.status === 'in-progress' ? 'In Progress' : 'Planned'}</span>
          </div>
          <h3 style="font-weight:600;font-size:16px;margin-bottom:8px">${esc(item.title)}</h3>
          <p style="font-size:13px;color:var(--muted);line-height:1.6">${esc(item.desc)}</p>
        </div>
      </div>`).join('')}
    </div>
  </section>`
    : '';

  const giscusRepo = theme.giscus?.repo || `${meta.owner}/${meta.name}`;
  const commentsSection = theme.showComments !== false
    ? `<section class="max-w-4xl mx-auto px-6 py-14">
    <div class="rl-card p-6 md:p-8">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
        <div>
          <h2 style="font-size:20px;font-weight:700">Community Discussions & Feedback</h2>
          <p style="font-size:13px;color:var(--muted)">Join the discussion or leave feedback via GitHub Discussions</p>
        </div>
        <a class="btn rl-btn-ghost !py-1.5 !px-3 !text-xs" href="${esc(meta.repoUrl)}/discussions" target="_blank" rel="noopener">${iconSvg('Github', 'w-3.5 h-3.5')} Open Discussions</a>
      </div>
      <div class="giscus"></div>
      <script src="https://giscus.app/client.js"
        data-repo="${esc(giscusRepo)}"
        ${theme.giscus?.repoId ? `data-repo-id="${esc(theme.giscus.repoId)}"` : ''}
        data-category="${esc(theme.giscus?.category || 'General')}"
        ${theme.giscus?.categoryId ? `data-category-id="${esc(theme.giscus.categoryId)}"` : ''}
        data-mapping="${esc(theme.giscus?.mapping || 'pathname')}"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="${theme.themeId === 'midnight-linear' ? 'transparent_dark' : theme.themeId === 'matrix-terminal' ? 'dark' : 'light'}"
        data-lang="${esc(theme.language || 'en')}"
        crossorigin="anonymous"
        async>
      </script>
    </div>
  </section>`
    : '';

  const sectionMap: Record<string, string> = {
    showcase: screenshotsSection,
    videoEmbed: videoEmbedSection,
    features: `<section class="container px-6 py-16"><h2 class="section-title">Why ${esc(meta.name)}?</h2><div class="grid">${features}</div></section>`,
    howItWorks: howItWorksSection,
    quickstart: quickstartSection,
    starHistory: starHistorySection,
    changelog: changelogSection,
    roadmap: roadmapSection,
    techStack: techSection,
    testimonials: testimonialsSection,
    pricing: pricingSection,
    faq: faqSection,
    newsletter: newsletterSection,
    comments: commentsSection,
  };

  const order = theme.sectionOrder && theme.sectionOrder.length
    ? theme.sectionOrder
    : ['showcase', 'videoEmbed', 'features', 'howItWorks', 'quickstart', 'starHistory', 'changelog', 'roadmap', 'techStack', 'testimonials', 'pricing', 'faq', 'newsletter', 'comments'];

  const renderedSections = order.map((k) => sectionMap[k] || '').filter(Boolean).join('\n\n');

  const analyticsScript = theme.analytics?.trackingId
    ? theme.analytics.provider === 'ga4'
      ? `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(theme.analytics.trackingId)}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${esc(theme.analytics.trackingId)}');
</script>`
      : theme.analytics.provider === 'plausible'
      ? `<script defer data-domain="${esc(theme.analytics.trackingId)}" src="https://plausible.io/js/script.js"></script>`
      : `<script async defer data-website-id="${esc(theme.analytics.trackingId)}" src="https://analytics.umami.is/script.js"></script>`
    : '';

  const footerLinksHtml = content.footerLinks && content.footerLinks.length > 0
    ? `<div style="display:flex;gap:16px;justify-content:center;margin-bottom:12px;flex-wrap:wrap">${content.footerLinks.map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div>`
    : '';

  return `<!doctype html>
<html lang="${esc(langCode)}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="theme-color" content="${esc(theme.accentColor || '#818cf8')}"/>
<link rel="icon" type="image/svg+xml" href="${faviconDataUri}"/>
<link rel="manifest" href="./site.webmanifest"/>
<title>${esc(meta.name)} — ${esc(h.headline)}</title>
<meta name="description" content="${esc(h.subheadline)}"/>
<link rel="canonical" href="${esc(meta.homepage || meta.repoUrl)}"/>
<meta property="og:title" content="${esc(meta.name)} — ${esc(h.headline)}"/>
<meta property="og:description" content="${esc(h.subheadline)}"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${esc(meta.homepage || meta.repoUrl)}"/>
<meta property="og:image" content="./og-image.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(meta.name)} — ${esc(h.headline)}"/>
<meta name="twitter:description" content="${esc(h.subheadline)}"/>
<meta name="twitter:image" content="./og-image.png"/>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": ${JSON.stringify(meta.name)},
  "headline": ${JSON.stringify(h.headline)},
  "description": ${JSON.stringify(h.subheadline)},
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Person",
    "name": ${JSON.stringify(meta.owner)}
  },
  "url": ${JSON.stringify(meta.homepage || meta.repoUrl)},
  "codeRepository": ${JSON.stringify(meta.repoUrl)}
}
</script>${analyticsScript ? '\n' + analyticsScript : ''}
<style>
* {box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{line-height:1.5;-webkit-font-smoothing:antialiased}
html[dir="rtl"] body{direction:rtl;text-align:right}
html[dir="rtl"] .hero,html[dir="rtl"] .section-title,html[dir="rtl"] .cta-banner{text-align:center}
a{color:inherit;text-decoration:none}
button{font:inherit;cursor:pointer;border:none;background:none;color:inherit}
pre{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre}
.container{max-width:1080px;margin:0 auto}
nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(10px)}
nav .inner{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;max-width:1080px;margin:0 auto}
.logo{font-weight:800;font-size:18px;letter-spacing:-.02em}
.hero{text-align:center;padding:90px 24px 40px;position:relative}
.hero h1{font-size:clamp(34px,6vw,58px);font-weight:800;letter-spacing:-.03em;line-height:1.08;max-width:820px;margin:18px auto 16px}
.hero p{font-size:clamp(16px,2vw,19px);max-width:640px;margin:0 auto;color:var(--muted)}
.eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:999px;font-size:13px;font-weight:600}
.cta-row{display:flex;gap:12px;justify-content:center;margin-top:32px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:600;font-size:15px;transition:all .18s}
.badge-row{display:flex;gap:10px;justify-content:center;margin-top:28px;flex-wrap:wrap}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}
.section-title{text-align:center;font-size:clamp(24px,4vw,32px);font-weight:800;letter-spacing:-.02em;margin-bottom:40px}
footer{border-top:1px solid var(--border);margin-top:60px;padding:28px 24px;text-align:center;font-size:14px;color:var(--muted)}
footer a{opacity:.8}footer a:hover{opacity:1;text-decoration:underline}
.cta-banner{max-width:880px;margin:0 auto;padding:48px 32px;text-align:center}
${css}
</style>
</head>
<body class="${bodyCls}">
<nav>
  <div class="inner">
    <a class="logo" href="#">${esc(meta.name)}</a>
    <a class="btn rl-btn-ghost !py-2 !px-4 !text-sm" href="${esc(meta.repoUrl)}" target="_blank" rel="noopener">${iconSvg('Github', 'w-4 h-4')} ${esc(meta.stars.toLocaleString())} ★</a>
  </div>
</nav>

<header class="hero">
  <span class="eyebrow rl-eyebrow">${iconSvg('Sparkles', 'w-3.5 h-3.5')}${esc(h.eyebrow)}</span>
  <h1>${esc(h.headline)}</h1>
  <p>${esc(h.subheadline)}</p>
  <div class="cta-row">
    <a class="btn rl-btn-primary" href="${esc(h.ctaPrimaryLink)}">${esc(h.ctaPrimary)} ${iconSvg('ArrowRight', 'w-4 h-4')}</a>
    <a class="btn rl-btn-ghost" href="${esc(h.ctaSecondaryLink)}" target="_blank" rel="noopener">${iconSvg('Star', 'w-4 h-4')} ${esc(h.ctaSecondary)}</a>
  </div>
  <div class="badge-row">${badges}</div>
</header>

${renderedSections}

<section class="container px-6 py-8">
  <div class="rl-card cta-banner">
    <h2 class="text-2xl md:text-3xl font-bold mb-3">Ready to build with ${esc(meta.name)}?</h2>
    <p class="mb-6" style="color:var(--muted)">Free, open source, and loved by ${esc(meta.stars.toLocaleString())}+ developers.</p>
    <a class="btn rl-btn-primary" href="${esc(meta.repoUrl)}" target="_blank" rel="noopener">${iconSvg('Github', 'w-4 h-4')} Star on GitHub</a>
  </div>
</section>

<footer>
  ${footerLinksHtml}
  <p>Built with <a href="${esc(meta.repoUrl)}">${esc(meta.owner)}/${esc(meta.name)}</a> · Landing page generated by RepoLaunch</p>
</footer>

<script>${quickstartScript()}</script>
</body>
</html>`;
}

/** Generate a clean React + Tailwind JSX component string. */
export function generateReactComponent(meta: RepoMetadata, content: LandingPageContent, theme: ThemeConfig): string {
  const data = JSON.stringify({ meta: { ...meta, stars: meta.stars }, content, theme }, null, 2);
  return `// ${meta.owner}/${meta.name} landing page — generated by RepoLaunch
// Drop into any React/Next.js project (Tailwind required).
import { useState } from 'react';

const DATA = ${data};

const ICONS = ${JSON.stringify(LUCIDE_PATHS, null, 2).replace(/\n/g, '\n')};

function Icon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {ICONS[name] ?? ICONS.Zap}
    </svg>
  );
}

export default function LandingPage() {
  const { meta, content, theme } = DATA;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const h = content.hero;

  const copyCmd = () => {
    navigator.clipboard.writeText(content.quickstart[tab]?.command ?? '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'radial-gradient(1000px 500px at 50% -10%, ${'${'}theme.accentColor${'}'}22, transparent 60%), #0a0a12' }}>
      <nav className="sticky top-0 z-50 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="font-extrabold text-lg tracking-tight">{meta.name}</span>
          <a className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-white/15 hover:border-white/40 transition" href={meta.repoUrl} target="_blank" rel="noreferrer">
            <Icon name="Github" className="w-4 h-4" /> {meta.stars.toLocaleString()} ★
          </a>
        </div>
      </nav>

      <header className="text-center px-6 pt-24 pb-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border" style={{ borderColor: '${'${'}theme.accentColor${'}'}55', color: theme.accentColor, background: '${'${'}theme.accentColor${'}'}14' }}>
          <Icon name="Sparkles" className="w-3.5 h-3.5" /> {h.eyebrow}
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-5 mb-4 max-w-3xl mx-auto leading-[1.08]">{h.headline}</h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto">{h.subheadline}</p>
        <div className="flex gap-3 justify-center mt-8 flex-wrap">
          <a className="px-6 py-3 rounded-xl font-semibold text-zinc-950 hover:brightness-110 transition" style={{ background: theme.accentColor }} href={h.ctaPrimaryLink}>{h.ctaPrimary}</a>
          <a className="px-6 py-3 rounded-xl font-semibold border border-white/15 hover:border-white/40 transition" href={h.ctaSecondaryLink} target="_blank" rel="noreferrer">{h.ctaSecondary}</a>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-extrabold text-center mb-10">Why {meta.name}?</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {content.features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-white/25 hover:-translate-y-0.5 transition">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: theme.accentColor }}>
                <Icon name={f.icon} className="w-5 h-5 text-zinc-950" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {DATA.theme.showTerminal && (
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-extrabold text-center mb-8">Get started in seconds</h2>
          <div className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden font-mono text-sm">
            <div className="flex items-center justify-between px-4 pt-3">
              <div className="flex gap-1">
                {content.quickstart.map((t, i) => (
                  <button key={i} onClick={() => setTab(i)} className={'px-4 py-2 rounded-lg ' + (i === tab ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300')}>{t.label}</button>
                ))}
              </div>
              <button onClick={copyCmd} className="text-xs px-2 py-1 rounded-md text-zinc-400 hover:text-white">{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <pre className="px-5 pb-5 pt-3 overflow-x-auto text-zinc-200">{content.quickstart[tab]?.command}</pre>
          </div>
        </section>
      )}

      {DATA.theme.showTestimonials !== false && content.testimonials && (
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">{content.testimonials.heading}</h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">{content.testimonials.description}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {content.testimonials.items.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 flex flex-col justify-between">
                <div>
                  <div className="mb-3 opacity-60" style={{ color: theme.accentColor }}>
                    <Icon name="Quote" className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-zinc-300 italic mb-6 leading-relaxed">{item.quote}</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs uppercase">
                    {item.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{item.author}</h4>
                    <p className="text-xs text-zinc-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {DATA.theme.showPricing !== false && content.pricing && (
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">{content.pricing.heading}</h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">{content.pricing.description}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {content.pricing.tiers.map((tier, i) => (
              <div key={i} className={'relative p-6 rounded-2xl border bg-white/5 flex flex-col justify-between ' + (tier.popular ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-white/10')}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full text-zinc-950" style={{ background: theme.accentColor }}>
                      {tier.badge || 'Popular'}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-3xl font-extrabold">{tier.price}</span>
                    {tier.period && <span className="text-xs text-zinc-500">{tier.period}</span>}
                  </div>
                  <p className="text-xs text-zinc-400 mb-6">{tier.description}</p>
                  <ul className="space-y-2 mb-8 text-xs text-zinc-300">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <Icon name="Check" className="w-3.5 h-3.5" style={{ color: theme.accentColor }} /> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href={tier.ctaLink} target="_blank" rel="noreferrer" className={'w-full py-2.5 rounded-xl font-semibold text-xs text-center inline-flex items-center justify-center gap-1.5 transition ' + (tier.popular ? 'text-zinc-950 font-bold' : 'border border-white/15 hover:border-white/40')} style={tier.popular ? { background: theme.accentColor } : undefined}>
                  {tier.ctaText}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {DATA.theme.showFaq && (
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-extrabold text-center mb-8">FAQ</h2>
          {content.faq.map((f, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 mb-3 overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left font-medium" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.question}
                <Icon name="ChevronDown" className={'w-4 h-4 transition-transform ' + (openFaq === i ? 'rotate-180' : '')} />
              </button>
              {openFaq === i && <div className="px-5 pb-4 text-sm text-zinc-400">{f.answer}</div>}
            </div>
          ))}
        </section>
      )}

      <footer className="border-t border-white/10 mt-16 py-8 text-center text-sm text-zinc-500">
        Built with <a className="underline" href={meta.repoUrl}>{meta.owner}/{meta.name}</a> · Generated by RepoLaunch
      </footer>
    </div>
  );
}
`;
}

export function generateNextJsAppRouter(meta: RepoMetadata, content: LandingPageContent, theme: ThemeConfig): string {
  const componentCode = generateReactComponent(meta, content, theme);
  const isRtl = theme.language === 'fa';
  return `// app/page.tsx — Next.js 14/15 App Router landing page for ${meta.owner}/${meta.name}
// Generated by RepoLaunch
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(`${meta.name} — ${content.hero.headline}`)},
  description: ${JSON.stringify(content.hero.subheadline)},
  openGraph: {
    title: ${JSON.stringify(`${meta.name} — ${content.hero.headline}`)},
    description: ${JSON.stringify(content.hero.subheadline)},
    url: ${JSON.stringify(meta.homepage || meta.repoUrl)},
    siteName: ${JSON.stringify(meta.name)},
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: ${JSON.stringify(meta.name)} }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: ${JSON.stringify(`${meta.name} — ${content.hero.headline}`)},
    description: ${JSON.stringify(content.hero.subheadline)},
    images: ['/og-image.png'],
  },
};

export default function Page() {
  return (
    <main dir="${isRtl ? 'rtl' : 'ltr'}" className="min-h-screen">
      <LandingPage />
    </main>
  );
}

// ─── Interactive Client Component ──────────────────────────────────────────
'use client';
${componentCode.replace(/\/\/[^\n]*\n/g, '')}
`;
}

export function generateAstroPage(meta: RepoMetadata, content: LandingPageContent, theme: ThemeConfig): string {
  const html = generateStandaloneHTML(meta, content, theme);
  return `---
// src/pages/index.astro — Blazing Fast Astro Landing Page (100 Lighthouse)
// Generated by RepoLaunch for ${meta.owner}/${meta.name}
---
${html}
`;
}

export function generateDeployReadme(meta: RepoMetadata, customDomain?: string): string {
  const encRepo = encodeURIComponent(meta.repoUrl);
  const liveUrl = customDomain ? `https://${customDomain}` : `https://${meta.owner}.github.io/${meta.name}/`;
  return `# Landing page for ${meta.owner}/${meta.name}

Generated by **RepoLaunch**.

## 🚀 1-Click Instant Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=${encRepo})
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=${encRepo})

## 📁 Files Included
- \`index.html\` — standalone landing page (open it directly in any browser, zero build step required).
- \`LandingPage.tsx\` — React/Tailwind component ready to paste into any React/Vite codebase.
- \`page.tsx\` — Next.js 14/15 App Router page with SEO Metadata + Tailwind.
- \`index.astro\` — Astro component for 100/100 Lighthouse static performance.
- \`og-image.png\` — 1200×630px social card preview for Twitter/LinkedIn.
${customDomain ? `- \`CNAME\` — custom domain routing for ${customDomain}\n` : ''}
## 🌐 Deploy to GitHub Pages (10 seconds)
1. Create a new repository (or push to your existing one) on GitHub.
2. Upload \`index.html\` and \`og-image.png\` to the repository root.
3. Go to **Settings → Pages** → Source: *Deploy from a branch* → Branch: \`main\` / root.
4. Your landing page is live at \`${liveUrl}\`.

${customDomain ? `### ⚙️ Custom Domain DNS Setup (${customDomain})
Point your DNS provider to GitHub Pages:
- **Apex domain**: Add 4 \`A\` records pointing to:
  - \`185.199.108.153\`
  - \`185.199.109.153\`
  - \`185.199.110.153\`
  - \`185.199.111.153\`
- **Subdomain** (e.g. \`docs\` or \`app\`): Add a \`CNAME\` record pointing to \`${meta.owner}.github.io\`\n` : ''}
## ⚡ Other hosts
- **Netlify**: drag & drop the unzipped folder directly onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **Vercel**: import the repository or use the Vercel CLI (\`vercel deploy\`).
- **React / Next.js**: copy \`LandingPage.tsx\` into your project and render \`<LandingPage />\`.
`;
}
