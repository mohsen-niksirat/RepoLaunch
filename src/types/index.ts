// ─── Core domain types for RepoLaunch ────────────────────────────────────────

export interface RepoMetadata {
  stars: number;
  forks: number;
  openIssues: number;
  license: string | null;
  description: string;
  topics: string[];
  defaultBranch: string;
  repoUrl: string;
  owner: string;
  name: string;
  language: string | null;
  homepage: string | null;
  latestRelease?: {
    tagName: string;
    publishedAt?: string;
  } | null;
}

export interface Badge {
  label: string;
  value: string;
}

export interface ScreenshotItem {
  url: string;
  caption?: string;
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaPrimaryLink: string;
  ctaSecondary: string;
  ctaSecondaryLink: string;
  eyebrow: string;
  badges: Badge[];
}

export interface QuickstartTab {
  id: string;         // npm | pnpm | pip | docker | clone
  label: string;      // npm install
  command: string;
}

export interface FeatureItem {
  title: string;
  desc: string;
  icon: string; // lucide icon name
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TechPill {
  label: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface LandingPageContent {
  hero: HeroContent;
  features: FeatureItem[];
  screenshots: ScreenshotItem[];
  quickstart: QuickstartTab[];
  techStack: TechPill[];
  faq: FAQItem[];
  footerLinks: FooterLink[];
  howItWorks: { title: string; desc: string }[];
  newsletter?: {
    heading: string;
    description: string;
    placeholder: string;
    buttonText: string;
  };
}

export type ThemeId = 'midnight-linear' | 'neo-brutalist' | 'clean-minimal' | 'matrix-terminal';

export type SectionId = 'showcase' | 'features' | 'howItWorks' | 'quickstart' | 'techStack' | 'faq' | 'newsletter';

export interface ThemeConfig {
  themeId: ThemeId;
  accentColor: string;
  fontStyle: 'sans' | 'mono';
  showTerminal: boolean;
  showScreenshots: boolean;
  showFaq: boolean;
  showTechStack: boolean;
  showNewsletter?: boolean;
  newsletterEndpoint?: string;
  sectionOrder: SectionId[];
}

export interface GitHubTokenLike {
  githubToken?: string;
}

export type AIProvider = 'openai' | 'gemini' | 'groq' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  customPrompt?: string;
}

export type DevicePreview = 'desktop' | 'tablet' | 'mobile';
