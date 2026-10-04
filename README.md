# RepoLaunch 🚀

**Turn any GitHub repository into a modern, high-converting landing page — in seconds.**

Paste a GitHub URL → get a beautiful, mobile-responsive developer landing page with live preview, in-place editing, three themes, and 1-click export (Standalone HTML / React JSX / ZIP). No backend. No AI key required.

---

## ✨ Features

- **GitHub ingestion** — any URL format (`https://github.com/owner/repo`, `owner/repo`, or `git@github.com:owner/repo.git`).
- **Dual parser engine**
  - *Heuristic parser* — works 100% offline. Extracts headline, features, quickstart code blocks, tech stack and FAQs straight from the README + repo metadata.
  - *AI-enhanced (BYOK)* — plug in OpenAI, Google Gemini, Groq, or any OpenAI-compatible endpoint to rewrite the copy.
- **3 themes** — Midnight Linear (glassy dark), Neo-Brutalist (bold retro), Clean Minimal (Apple/Stripe).
- **Live preview** with device switcher (Desktop / Tablet / Mobile).
- **In-place editing** — click any headline, subtitle or feature text to edit it; changes persist into exports.
- **Section toggles** — show/hide Quickstart, Tech Stack, FAQ.
- **Export engine**
  - Standalone `index.html` (self-contained, open it or deploy instantly)
  - Ready-to-paste React/JSX component (Tailwind)
  - Full ZIP bundle with deployment instructions
  - Confetti 🎉 on export

## 🛠️ Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · Lucide Icons · Zustand · JSZip · canvas-confetti

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

The production build passes with **zero TypeScript errors and zero warnings**.

## 🌐 Deploying to GitHub Pages

This project is already configured for GitHub Pages (Vite `base: './'`, so it works at `https://<user>.github.io/<repo>/`).

### Option A — GitHub Actions (recommended)
1. Push this project to a GitHub repository.
2. The included workflow at `.github/workflows/deploy.yml` builds and publishes automatically on every push to `main`.
3. In **Settings → Pages**, set **Source** to *GitHub Actions*.

### Option B — Manual
```bash
npm run build
```
Then publish the contents of `dist/` to your `gh-pages` branch (or drag `dist/` into Netlify/Vercel).

## 🔑 Optional keys (stored only in your browser)

Open **Settings** in the toolbar to add:

- **GitHub Personal Token** — avoids the 60 req/hr unauthenticated rate limit (needs `public_repo` scope at minimum).
- **AI provider key** — OpenAI / Gemini / Groq / custom base URL, for the ✨ AI enhancement button.

Keys live in `localStorage` and are sent **directly from your browser** to the provider. No servers involved.

## 📁 Project structure

```
src/
  components/
    Studio.tsx          # toolbar, workspace, settings drawer, export menu
    LandingPreview.tsx  # live, editable landing page renderer (3 themes)
  services/
    github.ts           # URL parsing, GitHub REST API, mock presets
    heuristicParser.ts  # offline README → landing content
    aiGenerator.ts      # BYOK AI enhancement
    exportEngine.ts     # HTML / JSX / ZIP generation
  store/useStudio.ts    # Zustand state
  types/index.ts        # domain types
```

## 📝 License

MIT — do whatever you want with it.
