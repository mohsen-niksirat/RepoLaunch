import { useState } from 'react';
import { Settings, Monitor, Tablet, Smartphone, Download, Sparkles, X, Loader2, AlertTriangle, Wand2, FileCode2, FileArchive, Eye, Share2, ChevronUp, ChevronDown, Clipboard, ClipboardCheck, ExternalLink, Award, Check, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { useStudio } from '../store/useStudio';
import LandingPreview from './LandingPreview';
import { generateStandaloneHTML, generateReactComponent, generateDeployReadme } from '../services/exportEngine';
import { enhanceWithAI } from '../services/aiGenerator';
import { generateOgImageBlob } from '../services/ogGenerator';
import { publishToGitHubPages } from '../services/ghPagesPublisher';
import { MOCK_PRESETS } from '../services/github';
import type { ThemeId, SectionId } from '../types';

const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'midnight-linear', label: 'Midnight' },
  { id: 'neo-brutalist', label: 'Brutalist' },
  { id: 'clean-minimal', label: 'Minimal' },
  { id: 'matrix-terminal', label: 'Terminal' },
];

const ACCENTS = [
  { color: '#818cf8', label: 'Indigo' },
  { color: '#34d399', label: 'Emerald' },
  { color: '#fbbf24', label: 'Amber' },
  { color: '#fb7185', label: 'Rose' },
  { color: '#38bdf8', label: 'Cyan' },
  { color: '#a78bfa', label: 'Violet' },
];

const DEVICES = [
  { id: 'desktop', icon: Monitor, width: '100%', label: 'Desktop' },
  { id: 'tablet', icon: Tablet, width: '768px', label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, width: '375px', label: 'Mobile' },
] as const;

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function celebrate() {
  confetti({ particleCount: 140, spread: 75, origin: { y: 0.7 }, colors: ['#818cf8', '#a5b4fc', '#f472b6', '#34d399'] });
}

export default function Studio() {
  const s = useStudio();
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState('');
  const [publishUrl, setPublishUrl] = useState('');
  const [publishError, setPublishError] = useState('');
  const [copiedPublishUrl, setCopiedPublishUrl] = useState(false);

  const doPublish = async () => {
    if (!s.meta || !s.content) return;
    if (!s.githubToken) {
      setPublishError('Please enter a GitHub Personal Access Token with "repo" scope first.');
      return;
    }
    setPublishing(true);
    setPublishError('');
    setPublishUrl('');
    try {
      const html = generateStandaloneHTML(s.meta, s.content, s.theme);
      let ogBlob: Blob | undefined;
      try {
        ogBlob = await generateOgImageBlob(s.meta, s.content, s.theme);
      } catch {
        // optional
      }
      const res = await publishToGitHubPages(s.meta, html, s.githubToken, ogBlob, (step) => setPublishStep(step));
      setPublishUrl(res.url);
      celebrate();
    } catch (e: any) {
      setPublishError(e?.message || 'Publishing failed. Check token permissions and repository access.');
    } finally {
      setPublishing(false);
    }
  };

  const handleEdit = (path: string, value: string) => {
    s.updateContent((d) => {
      const parts = path.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let cur: any = d;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[isNaN(Number(parts[i])) ? parts[i] : Number(parts[i])];
      cur[isNaN(Number(parts.at(-1))) ? parts.at(-1)! : Number(parts.at(-1))] = value;
    });
  };

  const doEnhance = async () => {
    if (!s.meta || !s.content) return;
    setAiBusy(true);
    setAiMsg('');
    try {
      const next = await enhanceWithAI(s.aiConfig, s.meta, s.readme, s.content);
      s.updateContent((d) => Object.assign(d, next));
      setAiMsg('✨ Content enhanced with AI.');
    } catch (e: any) {
      setAiMsg(e?.message ?? 'AI enhancement failed.');
    } finally {
      setAiBusy(false);
    }
  };

  const doExportHTML = () => {
    if (!s.meta || !s.content) return;
    const html = generateStandaloneHTML(s.meta, s.content, s.theme);
    download('index.html', new Blob([html], { type: 'text/html' }));
    celebrate();
  };

  const doCopyHTML = () => {
    if (!s.meta || !s.content) return;
    const html = generateStandaloneHTML(s.meta, s.content, s.theme);
    navigator.clipboard.writeText(html).then(() => {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
      celebrate();
    });
  };

  const doExportJSX = () => {
    if (!s.meta || !s.content) return;
    const code = generateReactComponent(s.meta, s.content, s.theme);
    download('LandingPage.tsx', new Blob([code], { type: 'text/plain' }));
    celebrate();
  };

  const doExportOG = async () => {
    if (!s.meta || !s.content) return;
    try {
      const blob = await generateOgImageBlob(s.meta, s.content, s.theme);
      download(`${s.meta.name}-og-card.png`, blob);
      celebrate();
    } catch (e: any) {
      alert('Failed to generate social card: ' + (e?.message ?? 'Unknown error'));
    }
  };

  const doExportZip = async () => {
    if (!s.meta || !s.content) return;
    const zip = new JSZip();
    zip.file('index.html', generateStandaloneHTML(s.meta, s.content, s.theme));
    zip.file('LandingPage.tsx', generateReactComponent(s.meta, s.content, s.theme));
    zip.file('README.md', generateDeployReadme(s.meta));
    try {
      const ogBlob = await generateOgImageBlob(s.meta, s.content, s.theme);
      zip.file('og-image.png', ogBlob);
    } catch {
      // Optional OG image in zip
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    download(`${s.meta.name}-landing.zip`, blob);
    celebrate();
  };

  const status = s.status;

  return (
    <div className="min-h-screen bg-[#08080d] text-zinc-100 font-sans">
      {/* Toolbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08080d]/90 backdrop-blur">
        <div className="max-w-[1600px] mx-auto flex items-center gap-3 px-4 py-3 flex-wrap">
          <span className="font-extrabold tracking-tight text-lg mr-2">
            <span className="text-indigo-400">◆</span> Repo<span className="text-indigo-400">Launch</span>
          </span>

          <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-xl">
            <input
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400/60 placeholder:text-zinc-500"
              placeholder="github.com/owner/repo or owner/repo"
              value={s.urlInput}
              onChange={(e) => s.setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && s.generate(s.urlInput)}
            />
            <button
              onClick={() => s.generate(s.urlInput)}
              disabled={status === 'loading' || !s.urlInput.trim()}
              className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
            </button>
          </div>

          <select
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-sm"
            value=""
            onChange={(e) => e.target.value && s.loadMock(e.target.value)}
          >
            <option value="">Try a demo…</option>
            {Object.keys(MOCK_PRESETS).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>

          <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => s.setThemeId(t.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${s.theme.themeId === t.id ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Accent Color Palette */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5" title="Accent color">
            {ACCENTS.map((a) => (
              <button
                key={a.color}
                title={a.label}
                onClick={() => s.setAccent(a.color)}
                className={`w-4 h-4 rounded-full transition-all ${s.theme.accentColor === a.color ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-110'}`}
                style={{ backgroundColor: a.color }}
              />
            ))}
          </div>

          <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                title={d.label}
                onClick={() => s.setDevice(d.id)}
                className={`p-1.5 rounded-md transition ${s.device === d.id ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                <d.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {s.meta && (
            <button
              onClick={() => setBadgeModalOpen(true)}
              title="Get README Badges & Markdown"
              className="flex items-center gap-1.5 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10 text-sm font-medium px-3 py-2 rounded-lg transition"
            >
              <Award className="w-4 h-4" /> Badges
            </button>
          )}

          {s.meta && (
            <button
              onClick={doEnhance}
              disabled={aiBusy}
              title="Enhance copy with AI (BYOK)"
              className="flex items-center gap-1.5 border border-fuchsia-400/40 text-fuchsia-300 hover:bg-fuchsia-400/10 text-sm font-medium px-3 py-2 rounded-lg transition disabled:opacity-50"
            >
              {aiBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} AI
            </button>
          )}

          <button
            onClick={() => s.setSettingsOpen(true)}
            className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {s.meta && (
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          )}
        </div>

        {/* Export menu */}
        {exportOpen && s.meta && (
          <div className="absolute right-4 top-full mt-1 w-64 bg-[#101018] border border-white/10 rounded-xl shadow-2xl p-2 z-50">
            <button onClick={() => { doExportHTML(); setExportOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-left">
              <FileCode2 className="w-4 h-4 text-indigo-400" /> Standalone HTML <span className="text-xs text-zinc-500 ml-auto">index.html</span>
            </button>
            <button onClick={() => { doCopyHTML(); setExportOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-left">
              {copiedHtml ? <ClipboardCheck className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4 text-cyan-400" />}
              <span>{copiedHtml ? 'Copied to Clipboard!' : 'Copy HTML'}</span>
            </button>
            <button onClick={() => { setBadgeModalOpen(true); setExportOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-left">
              <Award className="w-4 h-4 text-cyan-400" /> README Badges <span className="text-xs text-zinc-500 ml-auto">.md</span>
            </button>
            <button onClick={() => { setPublishModalOpen(true); setExportOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-emerald-500/10 text-sm text-left text-emerald-300 font-medium">
              <Globe className="w-4 h-4 text-emerald-400" /> Publish to GitHub Pages <span className="text-xs text-emerald-400/80 ml-auto">1-Click</span>
            </button>
            <button onClick={() => { doExportJSX(); setExportOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-left">
              <Sparkles className="w-4 h-4 text-fuchsia-400" /> React component <span className="text-xs text-zinc-500 ml-auto">.tsx</span>
            </button>
            <button onClick={() => { doExportOG(); setExportOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-left">
              <Share2 className="w-4 h-4 text-amber-400" /> Social Card (OG Image) <span className="text-xs text-zinc-500 ml-auto">.png</span>
            </button>
            <button onClick={() => { doExportZip(); setExportOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-left border-t border-white/5">
              <FileArchive className="w-4 h-4 text-emerald-400" /> Full ZIP bundle <span className="text-xs text-zinc-500 ml-auto">.zip</span>
            </button>
            <a
              href={`https://vercel.com/new/git/external?repository-url=${encodeURIComponent(s.meta.repoUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-xs text-zinc-400 hover:text-white text-left border-t border-white/5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-violet-400" /> Deploy on Vercel
            </a>
            <a
              href={`https://app.netlify.com/start/deploy?repository=${encodeURIComponent(s.meta.repoUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-xs text-zinc-400 hover:text-white text-left"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-400" /> Deploy on Netlify
            </a>
          </div>
        )}
      </header>

      {/* Error / loading states */}
      {status === 'error' && (
        <div className="max-w-xl mx-auto mt-10 flex items-start gap-3 bg-amber-400/10 border border-amber-400/30 text-amber-200 rounded-xl p-4 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Couldn't load that repository</p>
            <p className="opacity-80 mt-1">{s.error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {status === 'idle' && !s.content && (
        <div className="text-center px-6 pt-24 pb-40">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Any GitHub repo → a landing page<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">in seconds.</span>
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto text-lg">
            Paste a repository URL above, or try one of the demo presets. No AI key needed — the heuristic parser works offline.
          </p>
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            {Object.keys(MOCK_PRESETS).map((k) => (
              <button key={k} onClick={() => s.loadMock(k)} className="border border-white/15 hover:border-indigo-400/60 hover:bg-white/5 px-4 py-2 rounded-lg text-sm transition">
                <Eye className="w-4 h-4 inline mr-1.5 opacity-60" />{k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview workspace */}
      {s.content && s.meta && (
        <div className="flex justify-center p-4 md:p-8">
          <div
            className="w-full transition-[max-width] duration-300 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ maxWidth: DEVICES.find((d) => d.id === s.device)!.width }}
          >
            <LandingPreview meta={s.meta} content={s.content} theme={s.theme} onEdit={handleEdit} />
          </div>
          <p className="sr-only">Click any text in the preview to edit it in place.</p>
        </div>
      )}

      {/* Section toggles (floating) */}
      {s.content && (
        <div className="fixed bottom-4 left-4 z-40 flex gap-2 flex-wrap max-w-2xl">
          {([['showScreenshots', 'Showcase'], ['showTerminal', 'Quickstart'], ['showStarHistory', 'Stars Chart'], ['showChangelog', 'Releases'], ['showTechStack', 'Tech Stack'], ['showTestimonials', 'Testimonials'], ['showPricing', 'Pricing'], ['showFaq', 'FAQ'], ['showNewsletter', 'Waitlist']] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => s.toggleSection(k)}
              className={`text-xs px-3 py-1.5 rounded-full border backdrop-blur transition ${s.theme[k] ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200' : 'bg-black/40 border-white/10 text-zinc-500 line-through'}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Settings drawer */}
      {s.settingsOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60" onClick={() => s.setSettingsOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0e0e16] border-l border-white/10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Settings</h2>
              <button onClick={() => s.setSettingsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>

            <label className="block text-sm font-medium mb-1.5">GitHub Personal Token <span className="text-zinc-500 font-normal">(optional, avoids 60 req/hr limits)</span></label>
            <input
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400/60 mb-5 font-mono"
              placeholder="ghp_…"
              value={s.githubToken}
              onChange={(e) => s.setGithubToken(e.target.value)}
            />

            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">AI Enhancement (BYOK)</h3>
            <label className="block text-sm mb-1.5">Provider</label>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm mb-3"
              value={s.aiConfig.provider}
              onChange={(e) => s.setAIConfig({ ...s.aiConfig, provider: e.target.value as any })}
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
              <option value="groq">Groq</option>
              <option value="custom">Custom (OpenAI-compatible)</option>
            </select>

            <label className="block text-sm mb-1.5">API Key</label>
            <input
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400/60 mb-3 font-mono"
              value={s.aiConfig.apiKey}
              onChange={(e) => s.setAIConfig({ ...s.aiConfig, apiKey: e.target.value })}
            />

            {s.aiConfig.provider === 'custom' && (
              <>
                <label className="block text-sm mb-1.5">Base URL</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400/60 mb-3 font-mono"
                  placeholder="https://host/v1"
                  value={s.aiConfig.baseUrl ?? ''}
                  onChange={(e) => s.setAIConfig({ ...s.aiConfig, baseUrl: e.target.value })}
                />
              </>
            )}

            <label className="block text-sm mb-1.5">Model <span className="text-zinc-500 font-normal">(optional)</span></label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400/60 mb-3 font-mono"
              placeholder={s.aiConfig.provider === 'gemini' ? 'gemini-1.5-flash' : s.aiConfig.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'}
              value={s.aiConfig.model ?? ''}
              onChange={(e) => s.setAIConfig({ ...s.aiConfig, model: e.target.value })}
            />

            <label className="block text-sm mb-1.5">Custom AI Instructions <span className="text-zinc-500 font-normal">(optional prompt)</span></label>
            <textarea
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400/60 mb-3 text-zinc-300 resize-none font-sans"
              placeholder="e.g. Focus on developer audience, highlight high performance benchmarks, use punchy copy..."
              value={s.aiConfig.customPrompt ?? ''}
              onChange={(e) => s.setAIConfig({ ...s.aiConfig, customPrompt: e.target.value })}
            />

            <p className="text-xs text-zinc-500 leading-relaxed mb-6">
              Keys are stored only in your browser's localStorage and sent directly from your device to the provider. Without an AI key, everything still works via the built-in heuristic parser.
            </p>

            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">Section Layout & Ordering</h3>
            <p className="text-xs text-zinc-500 mb-3">Reorder sections on your landing page. Changes apply instantly to preview and exports.</p>
            <div className="space-y-1.5 mb-6">
              {(s.theme.sectionOrder || ['showcase', 'features', 'howItWorks', 'quickstart', 'starHistory', 'changelog', 'techStack', 'testimonials', 'pricing', 'faq', 'newsletter']).map((sectionId, idx, arr) => {
                const labels: Record<SectionId, string> = {
                  showcase: 'Screenshot / Showcase',
                  features: 'Key Features Grid',
                  howItWorks: 'How It Works (Steps)',
                  quickstart: 'Quickstart & Terminal',
                  starHistory: 'Star Velocity & Growth Chart',
                  changelog: 'Recent Releases & Changelog',
                  techStack: 'Tech Stack & Ecosystem',
                  testimonials: 'Testimonials & Social Proof',
                  pricing: 'Pricing / GitHub Sponsors',
                  faq: 'Frequently Asked Questions',
                  newsletter: 'Waitlist / Lead Capture Form',
                };
                return (
                  <div key={sectionId} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
                    <span className="text-zinc-200 font-medium text-xs">{labels[sectionId] || sectionId}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => s.moveSection(sectionId, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => s.moveSection(sectionId, 'down')}
                        disabled={idx === arr.length - 1}
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">Waitlist & Lead Capture</h3>
            <label className="block text-sm mb-1.5">Form Action / Webhook URL <span className="text-zinc-500 font-normal">(optional Formspree/Make/Zapier)</span></label>
            <input
              type="url"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400/60 mb-5 font-mono text-zinc-300"
              placeholder="https://formspree.io/f/xyza..."
              value={s.theme.newsletterEndpoint ?? ''}
              onChange={(e) => s.setNewsletterEndpoint(e.target.value)}
            />

            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">Analytics & Visitor Tracking</h3>
            <label className="block text-sm mb-1.5">Provider</label>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm mb-3"
              value={s.theme.analytics?.provider || 'ga4'}
              onChange={(e) => s.setAnalytics({ provider: e.target.value as any, trackingId: s.theme.analytics?.trackingId || '' })}
            >
              <option value="ga4">Google Analytics 4 (GA4)</option>
              <option value="plausible">Plausible Analytics</option>
              <option value="umami">Umami Analytics</option>
            </select>
            <label className="block text-sm mb-1.5">Tracking ID / Domain <span className="text-zinc-500 font-normal">(e.g. G-XXXXX or mydomain.com)</span></label>
            <input
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400/60 mb-5 font-mono text-zinc-300"
              placeholder={s.theme.analytics?.provider === 'plausible' ? 'example.com' : 'G-XXXXXXXXXX'}
              value={s.theme.analytics?.trackingId || ''}
              onChange={(e) => s.setAnalytics({ provider: s.theme.analytics?.provider || 'ga4', trackingId: e.target.value })}
            />

            {aiMsg && <p className="text-sm mt-4 text-indigo-300">{aiMsg}</p>}
          </div>
        </div>
      )}

      {/* README Badges Modal */}
      {badgeModalOpen && s.meta && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setBadgeModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0e0e16] border border-white/10 rounded-2xl p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold">README Badges & Markdown</h3>
              </div>
              <button onClick={() => setBadgeModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Paste these shields into the top of your GitHub <code className="bg-white/10 px-1 py-0.5 rounded text-white">README.md</code> to drive traffic straight to your new landing page!
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 flex flex-wrap gap-2 items-center justify-center">
              <img src="https://img.shields.io/badge/Landing_Page-RepoLaunch-818cf8?style=for-the-badge&logo=rocket&logoColor=white" alt="Landing Page Badge" />
              <img src={`https://img.shields.io/github/stars/${s.meta.owner}/${s.meta.name}?style=for-the-badge&logo=github&color=34d399`} alt="GitHub Stars Badge" />
              {s.meta.latestRelease && (
                <img src={`https://img.shields.io/github/v/release/${s.meta.owner}/${s.meta.name}?style=for-the-badge&color=fbbf24`} alt="Release Badge" />
              )}
            </div>

            <div className="relative bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-xs text-zinc-300 overflow-x-auto whitespace-pre mb-5">
{`[![Landing Page](https://img.shields.io/badge/Landing_Page-RepoLaunch-818cf8?style=for-the-badge&logo=rocket&logoColor=white)](https://${s.meta.owner}.github.io/${s.meta.name}/)
[![GitHub Stars](https://img.shields.io/github/stars/${s.meta.owner}/${s.meta.name}?style=for-the-badge&logo=github&color=34d399)](https://github.com/${s.meta.owner}/${s.meta.name})
${s.meta.latestRelease ? `[![Release](https://img.shields.io/github/v/release/${s.meta.owner}/${s.meta.name}?style=for-the-badge&color=fbbf24)](https://github.com/${s.meta.owner}/${s.meta.name}/releases)` : ''}`}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  const snippet = `[![Landing Page](https://img.shields.io/badge/Landing_Page-RepoLaunch-818cf8?style=for-the-badge&logo=rocket&logoColor=white)](https://${s.meta?.owner}.github.io/${s.meta?.name}/)\n[![GitHub Stars](https://img.shields.io/github/stars/${s.meta?.owner}/${s.meta?.name}?style=for-the-badge&logo=github&color=34d399)](https://github.com/${s.meta?.owner}/${s.meta?.name})${s.meta?.latestRelease ? `\n[![Release](https://img.shields.io/github/v/release/${s.meta?.owner}/${s.meta?.name}?style=for-the-badge&color=fbbf24)](https://github.com/${s.meta?.owner}/${s.meta?.name}/releases)` : ''}`;
                  navigator.clipboard.writeText(snippet).then(() => {
                    setCopiedBadge(true);
                    celebrate();
                    setTimeout(() => setCopiedBadge(false), 2000);
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg text-sm transition"
              >
                {copiedBadge ? <><Check className="w-4 h-4" /> Copied!</> : <><Clipboard className="w-4 h-4" /> Copy Markdown</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Pages 1-Click Publish Modal */}
      {publishModalOpen && s.meta && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !publishing && setPublishModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0e0e16] border border-white/10 rounded-2xl p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold">1-Click Publish to GitHub Pages</h3>
              </div>
              <button
                disabled={publishing}
                onClick={() => setPublishModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!s.githubToken ? (
              <div>
                <p className="text-sm text-zinc-300 mb-3 leading-relaxed">
                  To publish directly to your repository's <code className="bg-white/10 px-1.5 py-0.5 rounded text-emerald-300">gh-pages</code> branch, please enter a GitHub Personal Access Token with <span className="font-semibold text-white">repo</span> scope.
                </p>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/60 mb-4 font-mono text-white"
                  value={s.githubToken}
                  onChange={(e) => s.setGithubToken(e.target.value)}
                />
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=RepoLaunch%20Publisher"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mb-5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Generate a token on GitHub (10 sec)
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-zinc-400">Target Repository:</span>
                    <span className="font-mono font-medium text-white">{s.meta.owner}/{s.meta.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Live Website URL:</span>
                    <span className="font-mono text-emerald-400 text-xs">https://{s.meta.owner.toLowerCase()}.github.io/{s.meta.name.toLowerCase()}/</span>
                  </div>
                </div>

                {publishing && (
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-4 text-sm animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                    <span>{publishStep || 'Deploying landing page…'}</span>
                  </div>
                )}

                {publishError && (
                  <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3.5 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{publishError}</span>
                  </div>
                )}

                {publishUrl && (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Check className="w-5 h-5 text-emerald-400" />
                      <span>Your landing page is live!</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2 font-mono text-xs text-emerald-300">
                      <span className="truncate">{publishUrl}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(publishUrl);
                          setCopiedPublishUrl(true);
                          setTimeout(() => setCopiedPublishUrl(false), 2000);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white ml-auto shrink-0"
                      >
                        {copiedPublishUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  {publishUrl ? (
                    <a
                      href={publishUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg text-sm transition"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Live Page
                    </a>
                  ) : (
                    <button
                      onClick={doPublish}
                      disabled={publishing}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg text-sm transition disabled:opacity-50"
                    >
                      {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                      {publishing ? 'Publishing…' : 'Publish to GitHub Pages'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
