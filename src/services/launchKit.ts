import type { LandingPageContent, RepoMetadata } from '../types';

export interface LaunchAnnouncement {
  twitterThread: string[];
  hackerNews: {
    title: string;
    body: string;
    text: string;
  };
  reddit: {
    title: string;
    body: string;
    subreddits: string[];
  };
  productHunt: {
    tagline: string;
    makerComment: string;
  };
}

export function generateLaunchKit(meta: RepoMetadata, content: LandingPageContent, customDomain?: string): LaunchAnnouncement {
  const name = meta.name;
  const owner = meta.owner;
  const repoUrl = meta.repoUrl;
  const homepage = customDomain ? (customDomain.startsWith('http') ? customDomain : `https://${customDomain}/`) : (meta.homepage || `https://${owner}.github.io/${name}/`);
  const headline = content.hero.headline;
  const subheadline = content.hero.subheadline;
  const topFeatures = content.features.slice(0, 4);

  const summary = (headline.trim().toLowerCase() === subheadline.trim().toLowerCase() || subheadline.toLowerCase().includes(headline.toLowerCase()))
    ? subheadline
    : `${headline} — ${subheadline}`;

  // 1. Twitter / X Launch Thread
  const tweet1 = `🚀 Excited to open-source ${name}!

${summary}

⭐ Star the repo: ${repoUrl}
🌐 Live site: ${homepage}

Here's why we built it and what makes it special 🧵👇`;

  const tweet2 = `💡 The Problem:
Many tools in this space are either too heavy, complex to configure, or lack modern DX.

With ${name}, we focused on:
${topFeatures.map((f, i) => `${i + 1}️⃣ ${f.title}${f.desc && f.desc.trim().toLowerCase() !== f.title.trim().toLowerCase() ? ` — ${f.desc.slice(0, 90)}` : ''}`).join('\n')}`;

  const tweet3 = `⚡ Get started in seconds:
${content.quickstart[0]?.command ? `\`\`\`bash\n${content.quickstart[0].command}\n\`\`\`` : `Clone & run immediately without bloat.`}

${meta.latestRelease ? `📦 Latest release: ${meta.latestRelease.tagName}` : ''}
🛠️ Built with ${content.techStack.slice(0, 4).map((t) => t.label).join(' · ')}`;

  const tweet4 = `🙌 100% Free & Open Source under ${meta.license || 'MIT'}.

Check it out, try the demo, and let us know what you think:
⭐ GitHub: ${repoUrl}
🌐 Website: ${homepage}

Feedback, PRs, and stars are super appreciated! ❤️`;

  // 2. Hacker News (Show HN)
  const hnTitle = `Show HN: ${name} – ${headline}`;
  const hnText = `Hey HN,

I'm excited to share ${name} (${repoUrl}).

${subheadline}

Why we built this:
We needed a fast, reliable, and lightweight solution that gets out of the way. Most alternatives were bloated or overly complex.

Key Features:
${topFeatures.map((f) => `- ${f.title}: ${f.desc}`).join('\n')}

- 100% Open source: ${meta.license ? `Licensed under ${meta.license}` : 'Permissive open source'}
- Live Website / Docs: ${homepage}
- Code repository: ${repoUrl}

Would love your thoughts, feedback, and architectural critiques!`;

  // 3. Reddit (r/programming / r/opensource / r/webdev)
  const redditTitle = `[Open Source] ${name} – ${headline}`;
  const redditBody = `Hey everyone!

I just launched **${name}**, an open-source tool designed to:
> *${subheadline}*

### 🌟 What makes it different?
${topFeatures.map((f) => `* **${f.title}**: ${f.desc}`).join('\n')}

### 🚀 Quickstart
\`\`\`bash
${content.quickstart[0]?.command || `git clone ${repoUrl}`}
\`\`\`

### 🔗 Links:
* **GitHub Repository**: [${repoUrl}](${repoUrl})
* **Live Landing Page**: [${homepage}](${homepage})

I'd really appreciate your thoughts, feedback, and bug reports. Thanks for checking it out!`;

  // 4. Product Hunt
  const phTagline = headline.length <= 60 ? headline : `${name}: ${subheadline.slice(0, 50)}...`;
  const phMakerComment = `Hey Product Hunt community! 👋

I'm thrilled to introduce **${name}** to you all!

**What is it?**
${subheadline}

**Why did we make this?**
We wanted to eliminate friction and give developers a clean, modern, and delightful experience.

**Highlights:**
${topFeatures.map((f) => `• ${f.title} - ${f.desc}`).join('\n')}

It's completely free and open-source. Try the live demo at ${homepage} and check out the code at ${repoUrl}.

Looking forward to your questions and feedback! 🚀`;

  return {
    twitterThread: [tweet1, tweet2, tweet3, tweet4],
    hackerNews: { title: hnTitle, body: hnText, text: hnText },
    reddit: {
      title: redditTitle,
      body: redditBody,
      subreddits: ['r/programming', 'r/opensource', 'r/webdev', 'r/github', 'r/reactjs'],
    },
    productHunt: { tagline: phTagline, makerComment: phMakerComment },
  };
}
