import type { RepoMetadata } from '../types';

export interface ParsedRepoUrl {
  owner: string;
  repo: string;
}

const GH_HOSTS = ['github.com', 'www.github.com', 'git@github.com'];

/**
 * Accepts any common GitHub URL shape:
 *  - https://github.com/owner/repo
 *  - github.com/owner/repo
 *  - owner/repo
 *  - git@github.com:owner/repo.git
 */
export function parseGitHubUrl(input: string): ParsedRepoUrl | null {
  if (!input) return null;
  let s = input.trim();
  if (!s) return null;

  // ssh form
  const ssh = s.match(/^git@github\.com:([\w.-]+)\/([\w.-]+?)(\.git)?$/i);
  if (ssh) return { owner: ssh[1], repo: ssh[2] };

  // strip protocol
  s = s.replace(/^https?:\/\//i, '').replace(/\.git$/i, '').replace(/\/+$/, '');

  const parts = s.split('/').filter(Boolean);
  if (parts.length >= 2 && GH_HOSTS.includes(parts[0].toLowerCase())) {
    return { owner: parts[1], repo: parts[2] };
  }
  if (parts.length === 2) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

export class GitHubError extends Error {
  kind: 'not-found' | 'private' | 'rate-limit' | 'network';
  constructor(kind: GitHubError['kind'], message: string) {
    super(message);
    this.kind = kind;
  }
}

function authHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function mapStatus(status: number): GitHubError {
  if (status === 404) return new GitHubError('not-found', 'Repository not found. Check the URL — private repos need a personal token with repo scope.');
  if (status === 401 || status === 403) return new GitHubError('rate-limit', 'GitHub API rate limit reached (60 req/hr unauthenticated). Add a personal access token in Settings to keep going.');
  return new GitHubError('network', `GitHub API error (HTTP ${status})`);
}

export async function fetchRepoMetadata(url: string, token?: string): Promise<{ meta: RepoMetadata; readme: string }> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) throw new GitHubError('not-found', 'Could not parse that GitHub URL. Try `owner/repo` or a full https://github.com link.');

  const api = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;

  let res: Response;
  try {
    res = await fetch(api, { headers: authHeaders(token) });
  } catch {
    throw new GitHubError('network', 'Network error reaching GitHub. Check your connection.');
  }
  if (!res.ok) throw mapStatus(res.status);
  const data = await res.json();

  const meta: RepoMetadata = {
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    license: data.license?.spdx_id && data.license.spdx_id !== 'NOASSERTION' ? data.license.spdx_id : (data.license?.name ?? null),
    description: data.description ?? '',
    topics: data.topics ?? [],
    defaultBranch: data.default_branch ?? 'main',
    repoUrl: data.html_url ?? `https://github.com/${parsed.owner}/${parsed.repo}`,
    owner: parsed.owner,
    name: parsed.repo,
    language: data.language ?? null,
    homepage: data.homepage ?? null,
  };

  const readme = await fetchReadme(parsed.owner, parsed.repo, meta.defaultBranch, token);
  return { meta, readme };
}

async function fetchReadme(owner: string, repo: string, branch: string, token?: string): Promise<string> {
  // Prefer the API (finds README with any case/extension), fall back to raw.
  const apiReadme = `https://api.github.com/repos/${owner}/${repo}/readme`;
  try {
    const res = await fetch(apiReadme, { headers: { ...authHeaders(token), Accept: 'application/vnd.github.raw+json' } });
    if (res.ok) return await res.text();
  } catch { /* fall through */ }

  const candidates = ['README.md', 'readme.md', 'Readme.md', 'README.rst', 'README'];
  for (const c of candidates) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${c}`);
      if (res.ok) return await res.text();
    } catch { /* try next */ }
  }
  return '';
}

// ─── Mock presets for 1-click testing ────────────────────────────────────────

export const MOCK_PRESETS: Record<string, { meta: RepoMetadata; readme: string }> = {
  'expressjs/express': {
    meta: {
      stars: 65000, forks: 12000, openIssues: 180,
      license: 'MIT',
      description: 'Fast, unopinionated, minimalist web framework for node.',
      topics: ['express', 'nodejs', 'framework', 'web', 'rest'],
      defaultBranch: 'master', repoUrl: 'https://github.com/expressjs/express',
      owner: 'expressjs', name: 'express', language: 'JavaScript', homepage: 'https://expressjs.com',
    },
    readme: `# Express\n\nFast, unopinionated, minimalist web framework for [node](http://nodejs.org).\n\n## Features\n\n  * Robust routing\n  * Focus on high performance\n  * Super-high test coverage\n  * HTTP helpers (redirection, caching, etc)\n  * View system supporting 14+ template engines\n  * Content negotiation\n  * Executable for generating applications quickly\n\n## Installation\n\nThis is a [Node.js](https://nodejs.org/en/) module available through the\n[npm registry](https://www.npmjs.com/).\n\n\`\`\`bash\n$ npm install express\n\`\`\`\n\nFollow our installing guide for more information.\n\n## Quick Start\n\nInstall the executable. The quickest way to get started with express is to\nutilize the executable [\`express(1)\`](https://github.com/expressjs/generator).\n\nInstall it as follows:\n\n\`\`\`bash\n$ npm install -g express-generator\n\`\`\`\n\n## Docs & Community\n\n  * Website and Documentation - [[website]](https://expressjs.com)\n  * #express on freenode IRC\n  * [Github Organization](https://github.com/expressjs) for Official Middleware & Modules\n\n## FAQ\n\n### Is Express open source?\nYes, Express is fully open source under the MIT license.\n\n### Does it support TypeScript?\nCommunity typings are available via @types/express.\n`,
  },
  'fastapi/fastapi': {
    meta: {
      stars: 78000, forks: 6900, openIssues: 20,
      license: 'MIT',
      description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production.',
      topics: ['async', 'fastapi', 'openapi', 'python', 'starlette'],
      defaultBranch: 'master', repoUrl: 'https://github.com/fastapi/fastapi',
      owner: 'fastapi', name: 'fastapi', language: 'Python', homepage: 'https://fastapi.tiangolo.com',
    },
    readme: `# FastAPI\n\nFastAPI framework, high performance, easy to learn, fast to code, ready for production\n\n## Features\n\n* **Fast**: Very high performance, on par with **NodeJS** and **Go** (thanks to Starlette and Pydantic).\n* **Fast to code**: Increase the speed to develop features by about 200% to 300%.\n* **Fewer bugs**: Reduce about 40% of human induced errors.\n* **Intuitive**: Great editor support. Completion everywhere.\n* **Easy**: Designed to be easy to use and learn.\n* **Short**: Minimize code duplication.\n* **Robust**: Get production-ready code. With automatic interactive documentation.\n* **Standards-based**: Based on the open standards for APIs: OpenAPI and JSON Schema.\n\n## Installation\n\n\`\`\`bash\npip install fastapi\n\`\`\`\n\nYou will also need an ASGI server, for production such as Uvicorn or Hypercorn.\n\n\`\`\`bash\npip install "uvicorn[standard]"\n\`\`\`\n\n## Example\n\n\`\`\`python\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/")\nasync def root():\n    return {"message": "Hello World"}\n\`\`\`\n\n## FAQ\n\n### Is FastAPI production ready?\nYes — it is used by companies like Uber, Netflix and Microsoft in production.\n`,
  },
  'shadcn/ui': {
    meta: {
      stars: 75000, forks: 4900, openIssues: 900,
      license: 'MIT',
      description: 'A set of beautifully-designed, accessible components and a code distribution platform.',
      topics: ['radix-ui', 'react', 'shadcn', 'tailwind', 'components'],
      defaultBranch: 'main', repoUrl: 'https://github.com/shadcn-ui/ui',
      owner: 'shadcn-ui', name: 'ui', language: 'TypeScript', homepage: 'https://ui.shadcn.com',
    },
    readme: `# shadcn/ui\n\nBeautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.\n\n## Features\n\n* Beautifully designed components\n* Accessible (WAI-ARIA compliant via Radix UI)\n* Themeable with CSS variables\n* Copy and paste into your projects\n* Free and open source\n* CLI for easy installation\n\n## Installation\n\n\`\`\`bash\nnpx shadcn@latest init\n\`\`\`\n\nAdd a button:\n\n\`\`\`bash\nnpx shadcn@latest add button\n\`\`\`\n\n## FAQ\n\n### Is this a component library?\nNo — it is a collection of reusable components you can copy into your app and own the code.\n`,
  },
};
