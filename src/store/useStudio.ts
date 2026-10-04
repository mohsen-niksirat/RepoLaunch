import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIConfig, DevicePreview, LandingPageContent, RepoMetadata, ThemeConfig, ThemeId } from '../types';
import { MOCK_PRESETS, fetchRepoMetadata } from '../services/github';
import { buildHeuristicContent } from '../services/heuristicParser';

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
  toggleSection: (k: 'showTerminal' | 'showFaq' | 'showTechStack') => void;
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
      theme: { themeId: 'midnight-linear', accentColor: '#818cf8', fontStyle: 'sans', showTerminal: true, showFaq: true, showTechStack: true },
      device: 'desktop',
      settingsOpen: false,
      githubToken: '',
      aiConfig: { provider: 'openai', apiKey: '', baseUrl: '', model: '' },

      setUrlInput: (v) => set({ urlInput: v }),
      setDevice: (d) => set({ device: d }),
      setSettingsOpen: (b) => set({ settingsOpen: b }),
      setGithubToken: (t) => set({ githubToken: t }),
      setAIConfig: (c) => set({ aiConfig: c }),
      setThemeId: (t) => set((s) => ({ theme: { ...s.theme, themeId: t } })),
      setAccent: (c) => set((s) => ({ theme: { ...s.theme, accentColor: c } })),
      toggleSection: (k) => set((s) => ({ theme: { ...s.theme, [k]: !s.theme[k] } })),

      generate: async (url) => {
        set({ status: 'loading', error: '', loadingMsg: 'Fetching repository from GitHub…', usingMock: false });
        try {
          const { meta, readme } = await fetchRepoMetadata(url, get().githubToken || undefined);
          set({
            meta,
            readme,
            content: buildHeuristicContent(meta, readme),
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
          content: buildHeuristicContent(preset.meta, preset.readme),
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
