import { useState } from 'react';
import {
  Zap, ShieldCheck, Rocket, Layers, Gauge, Globe, Plug, Boxes, Sparkles, Wrench,
  Copy, Star, ChevronDown, Github, ArrowRight, Check,
} from 'lucide-react';
import type { LandingPageContent, RepoMetadata, ThemeConfig } from '../types';

const ICONS: Record<string, any> = { Zap, ShieldCheck, Rocket, Layers, Gauge, Globe, Plug, Boxes, Sparkles, Wrench };

export function ThemeIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const I = ICONS[name] || Zap;
  return <I className={className} />;
}

interface Props {
  meta: RepoMetadata;
  content: LandingPageContent;
  theme: ThemeConfig;
  onEdit: (path: string, value: string) => void;
}

function Editable({ value, path, onEdit, className, as = 'span' }: { value: string; path: string; onEdit: Props['onEdit']; className?: string; as?: 'span' | 'p' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const Tag: any = as;
  if (editing) {
    return (
      <input
        autoFocus
        className={(className ?? '') + ' bg-black/20 outline-none ring-2 ring-indigo-400/60 rounded px-1'}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => { setEditing(false); if (draft.trim()) onEdit(path, draft.trim()); }}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
      />
    );
  }
  return (
    <Tag
      className={(className ?? '') + ' cursor-text hover:outline hover:outline-dashed hover:outline-1 hover:outline-indigo-400/40 rounded px-0.5'}
      title="Click to edit"
      onClick={() => { setDraft(value); setEditing(true); }}
    >
      {value}
    </Tag>
  );
}

export default function LandingPreview({ meta, content, theme, onEdit }: Props) {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const h = content.hero;

  const isMidnight = theme.themeId === 'midnight-linear';
  const isBrutal = theme.themeId === 'neo-brutalist';

  // theme class tokens (mirrors exportEngine)
  const shell =
    theme.themeId === 'midnight-linear'
      ? { background: `radial-gradient(1000px 500px at 50% -10%, ${theme.accentColor}22, transparent 60%), #0a0a12`, color: '#e7e7ef' }
      : theme.themeId === 'neo-brutalist'
      ? { background: '#fff8e7', color: '#111' }
      : { background: '#fafafa', color: '#111827' };

  const cardCls = isBrutal
    ? 'bg-white border-2 border-black rounded-[10px] shadow-[6px_6px_0_#111] hover:-translate-y-0.5 hover:shadow-[9px_9px_0_#111] transition'
    : isMidnight
    ? 'bg-white/[.04] border border-white/10 rounded-2xl backdrop-blur hover:border-indigo-400/40 hover:-translate-y-0.5 transition'
    : 'bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition';

  const btnPrimary = isBrutal
    ? 'bg-black text-white border-2 border-black shadow-[4px_4px_0_var(--acc)] hover:-translate-y-0.5'
    : isMidnight
    ? 'text-zinc-950 hover:brightness-110'
    : 'bg-gray-900 text-white hover:bg-black';

  const btnGhost = isBrutal
    ? 'bg-white border-2 border-black shadow-[4px_4px_0_#111] hover:-translate-y-0.5'
    : 'border hover:bg-black/5 transition';

  const accent = theme.accentColor;
  const iconChip = isBrutal ? 'bg-white' : '';
  const iconColor = isBrutal ? '#111' : '#fff';
  const muted = isBrutal ? 'text-neutral-600' : isMidnight ? 'text-zinc-400' : 'text-gray-500';

  const copyCmd = () => {
    navigator.clipboard.writeText(content.quickstart[tab]?.command ?? '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <div style={{ ...shell, ['--acc' as any]: accent }} className="font-sans">
      <style>{`.rla-btn-primary{background:${accent}}`}</style>

      {/* Navbar */}
      <nav className={`sticky top-0 z-40 backdrop-blur border-b ${isBrutal ? 'border-black bg-[#fff8e7]' : isMidnight ? 'border-white/10 bg-[#0a0a12]/70' : 'border-gray-200 bg-white/80'}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="font-extrabold text-lg tracking-tight">{meta.name}</span>
          <a className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${btnGhost}`} href={meta.repoUrl} target="_blank" rel="noreferrer">
            <Github className="w-4 h-4" /> {meta.stars.toLocaleString()} ★
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header className="text-center px-6 pt-24 pb-10 relative">
        {isMidnight && (
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}88, transparent)` }} />
        )}
        <span
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${isBrutal ? 'border-2 border-black shadow-[3px_3px_0_#111]' : 'border'}`}
          style={{ borderColor: isBrutal ? '#111' : `${accent}55`, color: isBrutal ? '#111' : accent, background: isBrutal ? accent : `${accent}14` }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <Editable value={h.eyebrow} path="hero.eyebrow" onEdit={onEdit} />
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-5 mb-4 max-w-3xl mx-auto leading-[1.08]">
          <Editable value={h.headline} path="hero.headline" onEdit={onEdit} as="span" />
        </h1>
        <p className={`text-lg max-w-xl mx-auto ${muted}`}>
          <Editable value={h.subheadline} path="hero.subheadline" onEdit={onEdit} as="span" />
        </p>
        <div className="flex gap-3 justify-center mt-8 flex-wrap">
          <a className={`rla-btn-primary px-6 py-3 rounded-xl font-semibold ${btnPrimary}`} href={h.ctaPrimaryLink}>
            {h.ctaPrimary} <ArrowRight className="w-4 h-4 inline ml-1" />
          </a>
          <a className={`px-6 py-3 rounded-xl font-semibold ${btnGhost}`} href={h.ctaSecondaryLink} target="_blank" rel="noreferrer">
            <Star className="w-4 h-4 inline mr-1" /> {h.ctaSecondary}
          </a>
        </div>
        <div className="flex gap-2.5 justify-center mt-7 flex-wrap">
          {h.badges.map((b, i) => (
            <span key={i} className={`px-3 py-1 text-xs ${cardCls}`}>
              <b>{b.value}</b> <span className={muted}>{b.label}</span>
            </span>
          ))}
        </div>
      </header>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-extrabold text-center mb-10 tracking-tight">Why {meta.name}?</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {content.features.map((f, i) => (
            <div key={i} className={`p-6 ${cardCls}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: accent, color: iconColor }}>
                <ThemeIcon name={f.icon} className={iconChip} />
              </div>
              <h3 className="font-semibold mb-1">
                <Editable value={f.title} path={`features.${i}.title`} onEdit={onEdit} />
              </h3>
              <p className={`text-sm ${muted}`}>
                <Editable value={f.desc} path={`features.${i}.desc`} onEdit={onEdit} as="span" />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quickstart terminal */}
      {theme.showTerminal && (
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-extrabold text-center mb-8 tracking-tight">Get started in seconds</h2>
          <div className={isBrutal ? 'rounded-[10px] border-2 border-black bg-black shadow-[6px_6px_0_var(--acc)]' : isMidnight ? 'rounded-2xl border border-white/10 bg-black/50' : 'rounded-2xl bg-gray-900'} style={isBrutal ? { ['--acc' as any]: accent } : undefined}>
            <div className="flex items-center justify-between px-4 pt-3">
              <div className="flex gap-1 flex-wrap">
                {content.quickstart.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setTab(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-mono ${i === tab ? (isBrutal ? `bg-[var(--acc)] border-2 border-black` : 'bg-white/10 text-white') : 'text-zinc-500 hover:text-zinc-300'}`}
                    style={i === tab && isBrutal ? { ['--acc' as any]: accent, color: '#111' } : undefined}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button onClick={copyCmd} className="text-xs px-2 py-1 rounded-md text-zinc-400 hover:text-white flex items-center gap-1.5">
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <pre className="px-5 pb-5 pt-3 overflow-x-auto text-sm font-mono text-zinc-200 whitespace-pre">{content.quickstart[tab]?.command}</pre>
          </div>
        </section>
      )}

      {/* Tech stack */}
      {theme.showTechStack && content.techStack.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-10 text-center">
          <h3 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${muted}`}>Built with</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {content.techStack.map((t, i) => (
              <span key={i} className={`px-3 py-1 text-xs font-medium ${cardCls}`}>{t.label}</span>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {theme.showFaq && content.faq.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-extrabold text-center mb-8 tracking-tight">FAQ</h2>
          {content.faq.map((f, i) => (
            <div key={i} className={`rounded-xl mb-3 overflow-hidden ${cardCls}`}>
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left font-medium"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {f.question}
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <div className={`px-5 pb-4 text-sm ${muted}`}>{f.answer}</div>}
            </div>
          ))}
        </section>
      )}

      {/* CTA banner */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className={`p-12 text-center ${cardCls}`}>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Ready to build with {meta.name}?</h2>
          <p className={`mb-6 ${muted}`}>Free, open source, and loved by {meta.stars.toLocaleString()}+ developers.</p>
          <a className={`rla-btn-primary px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 ${btnPrimary}`} href={meta.repoUrl} target="_blank" rel="noreferrer">
            <Github className="w-4 h-4" /> Star on GitHub
          </a>
        </div>
      </section>

      <footer className={`border-t mt-10 py-8 text-center text-sm ${isBrutal ? 'border-black' : isMidnight ? 'border-white/10 text-zinc-500' : 'border-gray-200 text-gray-500'}`}>
        Built with <a className="underline hover:opacity-80" href={meta.repoUrl}>{meta.owner}/{meta.name}</a> · Generated by <b>RepoLaunch</b>
      </footer>
    </div>
  );
}
