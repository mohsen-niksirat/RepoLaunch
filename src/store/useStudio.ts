import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIConfig, DevicePreview, LandingPageContent, LanguageCode, RepoMetadata, ThemeConfig, ThemeId } from '../types';
import { MOCK_PRESETS, fetchRepoMetadata } from '../services/github';
import { buildHeuristicContent } from '../services/heuristicParser';
import { applyOfflineTranslation, translateWithAI } from '../services/translator';

export type Status = 'idle' | 'loading' | 'ready' | 'error';

interface StudioState {
  // data
  meta: RepoMetadata | null;
  content: LandingPageContent | null;
  readme: string;
  status: Status;
  error: string;
  loadingMsg: string;
  usingMock: boolean;

  // ui
  urlInput: string;
  theme: ThemeConfig;
  device: DevicePreview;
  settingsOpen: boolean;
  githubToken: string;
  aiConfig: AIConfig;

  // actions
  setUrlInput: (v: string) => void;
  setDevice: (d: DevicePreview) => void;
  setSettingsOpen: (b: boolean) => void;
  setGithubToken: (t: string) => void;
  setAIConfig: (c: AIConfig) => void;
  setThemeId: (t: ThemeId) => void;
  setAccent: (c: string) => void;
  setLanguage: (lang: LanguageCode) => void;
  translateContent: (lang: LanguageCode) => Promise<void>;
  toggleSection: (k: 'showTerminal' | 'showScreenshots' | 'showFaq' | 'showTechStack' | 'showNewsletter' | 'showChangelog' | 'showStarHistory' | 'showPricing' | 'showTestimonials') => void;
  setNewsletterEndpoint: (endpoint: string) => void;
  setAnalytics: (analytics?: import('../types').AnalyticsConfig) => void;
  moveSection: (id: import('../types').SectionId, direction: 'up' | 'down') => void;
  generate: (url: string) => Promise<void>;
  loadMock: (key: string) => void;
  updateContent: (updater: (draft: LandingPageContent) => void) => void;
}

function produce<T>(obj: T, fn: (draft: T) => void): T {
  const clone = structuredClone(obj);
  fn(clone);
  return clone;
}

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      meta: null,
      content: null,
      readme: '',
      status: 'idle',
      error: '',
      loadingMsg: '',
      usingMock: false,

      urlInput: '',
      theme: {
        themeId: 'midnight-linear',
        accentColor: '#818cf8',
        fontStyle: 'sans',
        showTerminal: true,
        showScreenshots: true,
        showFaq: true,
        showTechStack: true,
        showNewsletter: true,
        showChangelog: true,
        showStarHistory: true,
        showPricing: true,
        showTestimonials: true,
        newsletterEndpoint: '',
        sectionOrder: ['showcase', 'features', 'howItWorks', 'quickstart', 'starHistory', 'changelog', 'techStack', 'testimonials', 'pricing', 'faq', 'newsletter'],
      },
      device: 'desktop',
      settingsOpen: false,
      githubToken: '',
      aiConfig: { provider: 'openai', apiKey: '', baseUrl: '', model: '', customPrompt: '' },

      setUrlInput: (v) => set({ urlInput: v }),
      setDevice: (d) => set({ device: d }),
      setSettingsOpen: (b) => set({ settingsOpen: b }),
      setGithubToken: (t) => set({ githubToken: t }),
      setAIConfig: (c) => set({ aiConfig: c }),
      setThemeId: (t) => set((s) => ({ theme: { ...s.theme, themeId: t } })),
      setAccent: (c) => set((s) => ({ theme: { ...s.theme, accentColor: c } })),
      setLanguage: (lang) => {
        set((s) => {
          const nextTheme = { ...s.theme, language: lang };
          if (!s.content) return { theme: nextTheme };
          const translated = applyOfflineTranslation(s.content, lang);
          return { theme: nextTheme, content: translated };
        });
      },
      translateContent: async (lang) => {
        const state = get();
        if (!state.content) return;
        set({ loadingMsg: `Translating page copy to ${lang}…` });
        try {
          const translated = await translateWithAI(state.aiConfig, state.content, lang);
          set({
            content: translated,
            theme: { ...state.theme, language: lang },
            loadingMsg: '',
          });
        } catch (e: any) {
          const offline = applyOfflineTranslation(state.content, lang);
          set({
            content: offline,
            theme: { ...state.theme, language: lang },
            loadingMsg: '',
            error: e?.message || 'AI translation failed, applied offline template translation.',
          });
        }
      },
      toggleSection: (k) => set((s) => ({ theme: { ...s.theme, [k]: !s.theme[k] } })),
      setNewsletterEndpoint: (endpoint) => set((s) => ({ theme: { ...s.theme, newsletterEndpoint: endpoint } })),
      setAnalytics: (analytics) => set((s) => ({ theme: { ...s.theme, analytics } })),
      moveSection: (id, direction) => {
        set((state) => {
          const currentOrder = state.theme.sectionOrder || ['showcase', 'features', 'howItWorks', 'quickstart', 'starHistory', 'changelog', 'techStack', 'testimonials', 'pricing', 'faq', 'newsletter'];
          const order = [...currentOrder];
          const idx = order.indexOf(id);
          if (idx === -1) return state;
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= order.length) return state;
          const temp = order[idx];
          order[idx] = order[targetIdx];
          order[targetIdx] = temp;
          return { theme: { ...state.theme, sectionOrder: order } };
        });
      },

      generate: async (url) => {
        set({ status: 'loading', error: '', loadingMsg: 'Fetching repository from GitHub…', usingMock: false });
        try {
          const { meta, readme, releases } = await fetchRepoMetadata(url, get().githubToken || undefined);
          set({
            meta,
            readme,
            content: buildHeuristicContent(meta, readme, releases),
            status: 'ready',
            urlInput: url,
          });
        } catch (e: any) {
          set({ status: 'error', error: e?.message ?? 'Something went wrong fetching the repository.' });
        }
      },

      loadMock: (key) => {
        const preset = MOCK_PRESETS[key];
        if (!preset) return;
        set({
          meta: preset.meta,
          readme: preset.readme,
          content: buildHeuristicContent(preset.meta, preset.readme, preset.releases),
          status: 'ready',
          urlInput: preset.meta.repoUrl,
          usingMock: true,
          error: '',
        });
      },

      updateContent: (updater) =>
        set((s) => (s.content ? { content: produce(s.content, updater) } : {})),
    }),
    {
      name: 'repolaunch-studio',
      partialize: (s) => ({ githubToken: s.githubToken, aiConfig: s.aiConfig, theme: s.theme }),
    }
  )
);
