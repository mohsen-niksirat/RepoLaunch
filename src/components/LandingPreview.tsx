import { useState } from 'react';
import {
  Zap, ShieldCheck, Rocket, Layers, Gauge, Globe, Plug, Boxes, Sparkles, Wrench,
  Copy, Star, ChevronDown, Github, ArrowRight, Check, Quote, Heart, Milestone, Play, MessageSquare,
} from 'lucide-react';
import type { LandingPageContent, RepoMetadata, ThemeConfig } from '../types';
import { renderStarHistorySvg } from '../services/starHistory';

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
  const [subscribed, setSubscribed] = useState(false);
  const h = content.hero;

  const isMidnight = theme.themeId === 'midnight-linear';
  const isBrutal = theme.themeId === 'neo-brutalist';
  const isTerminal = theme.themeId === 'matrix-terminal';
  const isBento = theme.themeId === 'bento-modern';

  // theme class tokens (mirrors exportEngine)
  const shell =
    theme.themeId === 'bento-modern'
      ? { background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${theme.accentColor}26, transparent), #0b0d14`, color: '#f1f5f9' }
      : theme.themeId === 'midnight-linear'
      ? { background: `radial-gradient(1000px 500px at 50% -10%, ${theme.accentColor}22, transparent 60%), #0a0a12`, color: '#e7e7ef' }
      : theme.themeId === 'neo-brutalist'
      ? { background: '#fff8e7', color: '#111' }
      : theme.themeId === 'matrix-terminal'
      ? { background: '#050d08', color: '#4ade80' }
      : { background: '#fafafa', color: '#111827' };

  const cardCls = isBrutal
    ? 'bg-white border-2 border-black rounded-[10px] shadow-[6px_6px_0_#111] hover:-translate-y-0.5 hover:shadow-[9px_9px_0_#111] transition'
    : isTerminal
    ? 'bg-[#091b10] border border-green-800 rounded-md shadow-[0_0_15px_rgba(34,197,94,0.12)] hover:border-green-500 hover:shadow-[0_0_25px_rgba(34,197,94,0.25)] transition font-mono'
    : isBento
    ? 'bg-[#121622]/80 border border-white/[0.08] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-md hover:border-white/20 hover:-translate-y-1 transition-all duration-300'
    : isMidnight
    ? 'bg-white/[.04] border border-white/10 rounded-2xl backdrop-blur hover:border-indigo-400/40 hover:-translate-y-0.5 transition'
    : 'bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition';

  const btnPrimary = isBrutal
    ? 'bg-black text-white border-2 border-black shadow-[4px_4px_0_var(--acc)] hover:-translate-y-0.5'
    : isTerminal
    ? 'bg-green-500 text-black border border-green-400 font-bold hover:shadow-[0_0_15px_#22c55e] transition font-mono'
    : isBento
    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:brightness-110 rounded-xl transition hover:-translate-y-0.5'
    : isMidnight
    ? 'text-zinc-950 font-semibold hover:brightness-110 shadow-lg'
    : 'bg-gray-900 text-white hover:bg-black shadow-md';

  const btnGhost = isBrutal
    ? 'bg-white border-2 border-black shadow-[4px_4px_0_#111] hover:-translate-y-0.5 text-black'
    : isTerminal
    ? 'bg-[#07140a] border border-green-800 text-green-400 hover:border-green-500 hover:bg-[#0d2614] transition font-mono'
    : isBento
    ? 'border border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/10 hover:border-white/20 transition backdrop-blur rounded-xl'
    : isMidnight
    ? 'border border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10 transition'
    : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition shadow-sm';

  const accent = theme.accentColor;
  const iconChip = isBrutal ? 'bg-white' : '';
  const iconColor = isBrutal ? '#111' : isTerminal ? '#050d08' : '#fff';
  const muted = isBrutal
    ? 'text-neutral-600'
    : isTerminal
    ? 'text-green-500/70 font-mono'
    : isBento
    ? 'text-slate-400'
    : isMidnight
    ? 'text-zinc-400'
    : 'text-gray-500';

  const copyCmd = () => {
    navigator.clipboard.writeText(content.quickstart[tab]?.command ?? '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  const isRtl = theme.language === 'fa';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ ...shell, ['--acc' as any]: accent }}
      className={`font-sans ${isRtl ? 'rtl text-right' : ''}`}
    >
      <style>{`.rla-btn-primary{background:${accent}}`}</style>

      {/* Navbar */}
      <nav className={`sticky top-0 z-40 backdrop-blur border-b ${
        isBrutal
          ? 'border-black bg-[#fff8e7] text-black'
          : isTerminal
          ? 'border-green-800 bg-[#050d08]/85 text-green-400 font-mono'
          : isBento
          ? 'border-white/10 bg-[#0b0d14]/80 text-zinc-100'
          : isMidnight
          ? 'border-white/10 bg-[#0a0a12]/70 text-zinc-100'
          : 'border-gray-200 bg-white/80 text-gray-900'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="font-extrabold text-lg tracking-tight">{meta.name}</span>
          <a className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium ${btnGhost}`} href={meta.repoUrl} target="_blank" rel="noreferrer">
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
          <a
            className={`px-6 py-3 rounded-xl font-semibold transition ${btnPrimary}`}
            style={isMidnight ? { background: accent, color: '#0a0a12' } : undefined}
            href={h.ctaPrimaryLink}
          >
            {h.ctaPrimary} <ArrowRight className={`w-4 h-4 inline ${isRtl ? 'mr-1 rotate-180' : 'ml-1'}`} />
          </a>
          <a className={`px-6 py-3 rounded-xl font-semibold ${btnGhost}`} href={h.ctaSecondaryLink} target="_blank" rel="noreferrer">
            <Star className={`w-4 h-4 inline ${isRtl ? 'ml-1' : 'mr-1'}`} /> {h.ctaSecondary}
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

      {/* Dynamic Ordered Sections */}
      {(theme.sectionOrder || ['showcase', 'features', 'howItWorks', 'quickstart', 'starHistory', 'changelog', 'techStack', 'testimonials', 'pricing', 'faq', 'newsletter']).map((sectionId) => {
        if (sectionId === 'showcase') {
          return theme.showScreenshots && content.screenshots && content.screenshots.length > 0 ? (
            <section key="showcase" className="max-w-5xl mx-auto px-6 -mt-2 mb-16">
              <div className={`overflow-hidden ${cardCls}`}>
                <div className={`flex items-center gap-2 px-4 py-3 border-b ${isBrutal ? 'border-black bg-white' : isMidnight ? 'border-white/10 bg-white/[0.02]' : isTerminal ? 'border-green-800 bg-[#07140a]' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className={`text-xs mx-auto font-mono ${muted}`}>{meta.name} / preview</span>
                </div>
                <div className="p-3 md:p-6 bg-black/10 flex flex-col justify-center items-center">
                  <img
                    src={content.screenshots[0].url}
                    alt={content.screenshots[0].caption || meta.name}
                    className="rounded-lg shadow-2xl max-h-[520px] w-auto max-w-full object-contain mx-auto"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget.parentElement?.parentElement as HTMLElement)?.style.setProperty('display', 'none'); }}
                  />
                  {content.screenshots[0].caption && (
                    <p className={`text-center text-xs mt-3 ${muted}`}>{content.screenshots[0].caption}</p>
                  )}
                </div>
              </div>
            </section>
          ) : null;
        }

        if (sectionId === 'videoEmbed') {
          return theme.showVideoEmbed !== false && content.videoEmbed?.videoUrl ? (
            <section key="videoEmbed" className="max-w-4xl mx-auto px-6 py-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: isTerminal ? '#0d2614' : `${accent}18`, color: isTerminal ? '#4ade80' : accent }}>
                  <Play className="w-3.5 h-3.5" /> Product Demo
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                  <Editable value={content.videoEmbed.heading} path="videoEmbed.heading" onEdit={onEdit} />
                </h2>
                <p className={`text-sm max-w-xl mx-auto ${muted}`}>
                  <Editable value={content.videoEmbed.description} path="videoEmbed.description" onEdit={onEdit} as="span" />
                </p>
              </div>
              <div className={`overflow-hidden rounded-2xl ${cardCls}`}>
                <div className="aspect-video w-full bg-black/40 relative">
                  <iframe
                    src={content.videoEmbed.videoUrl}
                    title={content.videoEmbed.heading}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </section>
          ) : null;
        }

        if (sectionId === 'features') {
          return (
            <section key="features" className="max-w-5xl mx-auto px-6 py-16">
              <h2 className="text-3xl font-extrabold text-center mb-10 tracking-tight">Why {meta.name}?</h2>
              <div className="grid md:grid-cols-3 gap-5">
                {content.features.map((f, i) => (
                  <div key={i} className={`p-6 ${cardCls} ${isBento && (i === 0 || i === 3) ? 'md:col-span-2' : ''}`}>
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
          );
        }

        if (sectionId === 'howItWorks') {
          return content.howItWorks && content.howItWorks.length > 0 ? (
            <section key="howItWorks" className="max-w-5xl mx-auto px-6 py-12">
              <h2 className="text-3xl font-extrabold text-center mb-10 tracking-tight">How it works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {content.howItWorks.map((step, i) => (
                  <div key={i} className={`p-6 relative ${cardCls}`}>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-4"
                      style={{
                        background: isBrutal ? accent : isTerminal ? '#0d2614' : isMidnight || isBento ? `${accent}22` : '#f3f4f6',
                        color: isBrutal ? '#111' : accent,
                        border: isBrutal ? '2px solid #111' : isTerminal ? '1px solid #15803d' : undefined
                      }}
                    >
                      {i + 1}
                    </div>
                    <h3 className="font-bold text-lg mb-2">
                      <Editable value={step.title} path={`howItWorks.${i}.title`} onEdit={onEdit} />
                    </h3>
                    <p className={`text-sm ${muted}`}>
                      <Editable value={step.desc} path={`howItWorks.${i}.desc`} onEdit={onEdit} as="span" />
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null;
        }

        if (sectionId === 'quickstart') {
          return theme.showTerminal ? (
            <section key="quickstart" className="max-w-3xl mx-auto px-6 py-12">
              <h2 className="text-3xl font-extrabold text-center mb-8 tracking-tight">Get started in seconds</h2>
              <div className={isBrutal ? 'rounded-[10px] border-2 border-black bg-black shadow-[6px_6px_0_var(--acc)]' : isTerminal ? 'rounded-md border border-green-700 bg-[#020604] shadow-[0_0_20px_rgba(34,197,94,0.15)]' : isBento ? 'rounded-2xl border border-white/10 bg-[#06070a] shadow-2xl' : isMidnight ? 'rounded-2xl border border-white/10 bg-black/50' : 'rounded-2xl bg-gray-900'} style={isBrutal ? { ['--acc' as any]: accent } : undefined}>
                <div className="flex items-center justify-between px-4 pt-3">
                  <div className="flex gap-1 flex-wrap">
                    {content.quickstart.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => setTab(i)}
                        className={`px-4 py-2 rounded-lg text-sm font-mono ${i === tab ? (isBrutal ? `bg-[var(--acc)] border-2 border-black` : isTerminal ? 'bg-green-500 text-black font-bold' : 'bg-white/10 text-white') : 'text-zinc-500 hover:text-zinc-300'}`}
                        style={i === tab && isBrutal ? { ['--acc' as any]: accent, color: '#111' } : undefined}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={copyCmd} className="text-xs px-2 py-1 rounded-md text-zinc-400 hover:text-white flex items-center gap-1.5 font-mono">
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
                <pre className="px-5 pb-5 pt-3 overflow-x-auto text-sm font-mono text-zinc-200 whitespace-pre">{content.quickstart[tab]?.command}</pre>
              </div>
            </section>
          ) : null;
        }

        if (sectionId === 'starHistory') {
          return theme.showStarHistory !== false && content.starHistory && content.starHistory.length > 0 ? (
            <section key="starHistory" className="max-w-3xl mx-auto px-6 py-12">
              <div className={`p-6 md:p-8 ${cardCls}`}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Community Growth & Star Velocity</h2>
                    <p className={`text-xs ${muted}`}>Trajectory across releases and milestones</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-mono font-semibold flex items-center gap-1.5 ${cardCls}`}>
                    <Star className="w-3.5 h-3.5 fill-current" /> {meta.stars.toLocaleString()} Stars
                  </span>
                </div>
                <div
                  className="py-2"
                  dangerouslySetInnerHTML={{ __html: renderStarHistorySvg(content.starHistory, accent, isTerminal, !isMidnight && !isTerminal) }}
                />
              </div>
            </section>
          ) : null;
        }

        if (sectionId === 'changelog') {
          return theme.showChangelog !== false && content.changelog && content.changelog.length > 0 ? (
            <section key="changelog" className="max-w-3xl mx-auto px-6 py-12">
              <h2 className="text-3xl font-extrabold text-center mb-8 tracking-tight">Recent Releases & Changelog</h2>
              <div className="space-y-4">
                {content.changelog.map((rel, i) => (
                  <div key={i} className={`p-6 ${cardCls}`}>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${isTerminal ? 'bg-green-500/20 text-green-300 border border-green-700' : isBrutal ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>
                          <Editable value={rel.tagName} path={`changelog.${i}.tagName`} onEdit={onEdit} />
                        </span>
                        <h3 className="font-semibold text-base">
                          <Editable value={rel.name} path={`changelog.${i}.name`} onEdit={onEdit} />
                        </h3>
                      </div>
                      <span className={`text-xs font-mono ${muted}`}>{rel.publishedAt}</span>
                    </div>
                    {rel.body && (
                      <p className={`text-xs leading-relaxed mt-2 ${muted}`}>
                        <Editable value={rel.body} path={`changelog.${i}.body`} onEdit={onEdit} as="span" />
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : null;
        }

        if (sectionId === 'roadmap') {
          return theme.showRoadmap !== false && content.roadmap && content.roadmap.items?.length > 0 ? (
            <section key="roadmap" className="max-w-4xl mx-auto px-6 py-14">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: isTerminal ? '#0d2614' : `${accent}18`, color: isTerminal ? '#4ade80' : accent }}>
                  <Milestone className="w-3.5 h-3.5" /> Project Roadmap
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                  <Editable value={content.roadmap.heading} path="roadmap.heading" onEdit={onEdit} />
                </h2>
                <p className={`text-sm max-w-xl mx-auto ${muted}`}>
                  <Editable value={content.roadmap.description} path="roadmap.description" onEdit={onEdit} as="span" />
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {content.roadmap.items.map((item, i) => {
                  const isDone = item.status === 'completed';
                  const isInProgress = item.status === 'in-progress';
                  const badgeColor = isDone
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : isInProgress
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
                  const statusLabel = isDone ? 'Completed' : isInProgress ? 'In Progress' : 'Planned';
                  return (
                    <div key={i} className={`p-6 relative flex flex-col justify-between ${cardCls}`}>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${isTerminal ? 'bg-green-500/20 text-green-300' : isBrutal ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>
                            <Editable value={item.phase} path={`roadmap.items.${i}.phase`} onEdit={onEdit} />
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <h3 className="font-bold text-base mb-2">
                          <Editable value={item.title} path={`roadmap.items.${i}.title`} onEdit={onEdit} />
                        </h3>
                        <p className={`text-xs leading-relaxed ${muted}`}>
                          <Editable value={item.desc} path={`roadmap.items.${i}.desc`} onEdit={onEdit} as="span" />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null;
        }

        if (sectionId === 'techStack') {
          return theme.showTechStack && content.techStack.length > 0 ? (
            <section key="techStack" className="max-w-4xl mx-auto px-6 py-10 text-center">
              <h3 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${muted}`}>Built with</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {content.techStack.map((t, i) => (
                  <span key={i} className={`px-3 py-1 text-xs font-medium ${cardCls}`}>{t.label}</span>
                ))}
              </div>
            </section>
          ) : null;
        }

        if (sectionId === 'testimonials') {
          return theme.showTestimonials !== false && content.testimonials && content.testimonials.items?.length > 0 ? (
            <section key="testimonials" className="max-w-5xl mx-auto px-6 py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold tracking-tight mb-3">
                  <Editable value={content.testimonials.heading} path="testimonials.heading" onEdit={onEdit} />
                </h2>
                <p className={`text-sm max-w-xl mx-auto ${muted}`}>
                  <Editable value={content.testimonials.description} path="testimonials.description" onEdit={onEdit} as="span" />
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {content.testimonials.items.map((item, i) => (
                  <div key={i} className={`p-6 flex flex-col justify-between ${cardCls}`}>
                    <div>
                      <Quote className={`w-6 h-6 mb-4 opacity-50 ${isTerminal ? 'text-green-400' : ''}`} style={!isTerminal ? { color: accent } : undefined} />
                      <p className={`text-sm leading-relaxed mb-6 italic ${isTerminal ? 'text-green-300' : isBrutal ? 'text-black' : isMidnight ? 'text-zinc-200' : 'text-gray-700'}`}>
                        <Editable value={item.quote} path={`testimonials.items.${i}.quote`} onEdit={onEdit} as="span" />
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${isTerminal ? 'bg-green-500/20 text-green-300 border border-green-700' : isBrutal ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>
                        {item.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm leading-tight">
                          <Editable value={item.author} path={`testimonials.items.${i}.author`} onEdit={onEdit} />
                        </h4>
                        <p className={`text-xs ${muted}`}>
                          <Editable value={item.role} path={`testimonials.items.${i}.role`} onEdit={onEdit} />
                          {item.handle && <span className="ml-1 opacity-70">{item.handle}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null;
        }

        if (sectionId === 'pricing') {
          return theme.showPricing !== false && content.pricing && content.pricing.tiers?.length > 0 ? (
            <section key="pricing" className="max-w-5xl mx-auto px-6 py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold tracking-tight mb-3">
                  <Editable value={content.pricing.heading} path="pricing.heading" onEdit={onEdit} />
                </h2>
                <p className={`text-sm max-w-xl mx-auto ${muted}`}>
                  <Editable value={content.pricing.description} path="pricing.description" onEdit={onEdit} as="span" />
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 items-stretch">
                {content.pricing.tiers.map((tier, i) => {
                  const isPopular = tier.popular;
                  return (
                    <div
                      key={i}
                      className={`relative p-6 md:p-8 flex flex-col justify-between ${cardCls} ${isPopular ? (isBrutal ? 'ring-2 ring-black shadow-[8px_8px_0_var(--acc)]' : isTerminal ? 'ring-1 ring-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : isMidnight ? 'ring-2 ring-indigo-500/60 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'ring-2 ring-indigo-600 shadow-xl') : ''}`}
                      style={isBrutal && isPopular ? { ['--acc' as any]: accent } : undefined}
                    >
                      {isPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full ${isBrutal ? 'bg-black text-white border-2 border-black' : isTerminal ? 'bg-green-500 text-black font-mono font-bold' : 'text-white'}`} style={!isBrutal && !isTerminal ? { background: accent } : undefined}>
                            {tier.badge || 'Most Popular'}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">
                            <Editable value={tier.name} path={`pricing.tiers.${i}.name`} onEdit={onEdit} />
                          </h3>
                        </div>
                        <div className="flex items-baseline gap-1 my-4">
                          <span className="text-4xl font-extrabold tracking-tight">
                            <Editable value={tier.price} path={`pricing.tiers.${i}.price`} onEdit={onEdit} />
                          </span>
                          {tier.period && (
                            <span className={`text-xs ${muted}`}>
                              <Editable value={tier.period} path={`pricing.tiers.${i}.period`} onEdit={onEdit} />
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mb-6 leading-relaxed ${muted}`}>
                          <Editable value={tier.description} path={`pricing.tiers.${i}.description`} onEdit={onEdit} as="span" />
                        </p>
                        <ul className="space-y-2.5 mb-8">
                          {tier.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2 text-xs">
                              <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isTerminal ? 'text-green-400' : ''}`} style={!isTerminal ? { color: accent } : undefined} />
                              <Editable value={feat} path={`pricing.tiers.${i}.features.${fIdx}`} onEdit={onEdit} as="span" />
                            </li>
                          ))}
                        </ul>
                      </div>
                      <a
                        href={tier.ctaLink}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full py-2.5 rounded-xl font-semibold text-xs text-center inline-flex items-center justify-center gap-1.5 transition ${isPopular ? btnPrimary : btnGhost}`}
                        style={isPopular && isMidnight ? { background: accent, color: '#0a0a12' } : undefined}
                      >
                        {tier.ctaText.toLowerCase().includes('sponsor') && <Heart className="w-3.5 h-3.5 fill-current" />}
                        <Editable value={tier.ctaText} path={`pricing.tiers.${i}.ctaText`} onEdit={onEdit} />
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null;
        }

        if (sectionId === 'faq') {
          return theme.showFaq && content.faq.length > 0 ? (
            <section key="faq" className="max-w-3xl mx-auto px-6 py-12">
              <h2 className="text-3xl font-extrabold text-center mb-8 tracking-tight">FAQ</h2>
              {content.faq.map((f, i) => (
                <div key={i} className={`rounded-xl mb-3 overflow-hidden ${cardCls}`}>
                  <button
                    className={`w-full flex items-center justify-between px-5 py-4 font-semibold text-sm ${isRtl ? 'text-right' : 'text-left'} ${isTerminal ? 'font-mono text-green-300' : isBrutal ? 'text-black' : isMidnight ? 'text-zinc-100' : 'text-gray-900'}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{f.question}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && <div className={`px-5 pb-4 text-sm leading-relaxed ${muted}`}>{f.answer}</div>}
                </div>
              ))}
            </section>
          ) : null;
        }

        if (sectionId === 'newsletter') {
          return theme.showNewsletter !== false ? (
            <section key="newsletter" className="max-w-2xl mx-auto px-6 py-14 text-center">
              <div className={`p-8 md:p-10 relative overflow-hidden ${cardCls}`}>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">
                  <Editable value={content.newsletter?.heading || `Stay updated on ${meta.name}`} path="newsletter.heading" onEdit={onEdit} />
                </h2>
                <p className={`text-sm mb-6 max-w-md mx-auto ${muted}`}>
                  <Editable value={content.newsletter?.description || 'Get notified about new releases, documentation updates, and development progress.'} path="newsletter.description" onEdit={onEdit} as="span" />
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubscribed(true);
                    setTimeout(() => setSubscribed(false), 3000);
                  }}
                  className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    required
                    placeholder={content.newsletter?.placeholder || 'Enter your email...'}
                    className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition ${isBrutal ? 'bg-white border-black text-black' : isTerminal ? 'bg-[#06150a] border-green-800 text-green-300' : isMidnight ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                  <button
                    type="submit"
                    className={`px-6 py-3 rounded-xl font-semibold text-sm transition ${btnPrimary}`}
                    style={isMidnight ? { background: accent, color: '#0a0a12' } : undefined}
                  >
                    {subscribed ? 'Subscribed! ✓' : (content.newsletter?.buttonText || 'Subscribe')}
                  </button>
                </form>
              </div>
            </section>
          ) : null;
        }

        if (sectionId === 'comments') {
          return theme.showComments !== false ? (
            <section key="comments" className="max-w-4xl mx-auto px-6 py-14">
              <div className={`p-6 md:p-8 ${cardCls}`}>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isTerminal ? '#0d2614' : `${accent}20`, color: isTerminal ? '#4ade80' : accent }}>
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Community Discussions & Feedback</h3>
                      <p className={`text-xs ${muted}`}>Powered by GitHub Discussions (Giscus)</p>
                    </div>
                  </div>
                  <a
                    href={`${meta.repoUrl}/discussions`}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border inline-flex items-center gap-1.5 transition ${btnGhost}`}
                  >
                    <Github className="w-3.5 h-3.5" /> View Discussions on GitHub
                  </a>
                </div>
                <div className="border border-dashed border-white/15 rounded-xl p-6 text-center bg-black/10">
                  <p className="text-xs mb-2 text-zinc-300 font-medium">
                    Live interactive comments powered by GitHub Discussions
                  </p>
                  <p className={`text-xs mb-3 ${muted}`}>
                    Visitors can leave feedback, ask questions, and upvote with their GitHub accounts.
                  </p>
                  <span className="text-[11px] font-mono px-3 py-1 rounded bg-white/5 text-zinc-400">
                    Repository target: {theme.giscus?.repo || `${meta.owner}/${meta.name}`}
                  </span>
                </div>
              </div>
            </section>
          ) : null;
        }

        return null;
      })}

      {/* CTA banner */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className={`p-12 text-center ${cardCls}`}>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Ready to build with {meta.name}?</h2>
          <p className={`mb-6 ${muted}`}>Free, open source, and loved by {meta.stars.toLocaleString()}+ developers.</p>
          <a
            className={`px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition ${btnPrimary}`}
            style={isMidnight ? { background: accent, color: '#0a0a12' } : undefined}
            href={meta.repoUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Github className="w-4 h-4" /> Star on GitHub
          </a>
        </div>
      </section>

      <footer className={`border-t mt-12 py-8 text-center text-sm ${
        isBrutal
          ? 'border-black bg-[#fff8e7] text-black font-semibold'
          : isTerminal
          ? 'border-green-800 bg-[#050d08] text-green-500 font-mono'
          : isMidnight
          ? 'border-white/10 text-zinc-400 bg-white/[0.01]'
          : 'border-gray-200 text-gray-500 bg-gray-50/80'
      }`}>
        Built with <a className="underline hover:opacity-80 font-medium" href={meta.repoUrl}>{meta.owner}/{meta.name}</a> · Generated by <b>RepoLaunch</b>
      </footer>
    </div>
  );
}
