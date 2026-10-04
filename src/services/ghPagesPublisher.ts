import type { RepoMetadata } from '../types';

export interface PublishResult {
  success: boolean;
  url: string;
  error?: string;
}

function utf8ToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token.trim()}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
}

export async function publishToGitHubPages(
  meta: RepoMetadata,
  html: string,
  token: string,
  ogBlob?: Blob,
  onProgress?: (msg: string) => void
): Promise<PublishResult> {
  if (!token) {
    throw new Error('A GitHub Personal Access Token with "repo" scope is required to publish directly.');
  }

  const owner = meta.owner;
  const repo = meta.name;
  const branch = 'gh-pages';
  const headers = authHeaders(token);

  // 1. Ensure gh-pages branch exists
  onProgress?.('Checking gh-pages branch…');
  let branchExists = false;
  try {
    const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, { headers });
    if (branchRes.ok) branchExists = true;
  } catch {
    // continue
  }

  if (!branchExists) {
    onProgress?.('Creating gh-pages branch from default branch…');
    // Get commit sha of default branch
    let defaultSha = '';
    for (const b of [meta.defaultBranch || 'main', 'main', 'master']) {
      try {
        const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${b}`, { headers });
        if (refRes.ok) {
          const refData = await refRes.json();
          defaultSha = refData.object?.sha || '';
          if (defaultSha) break;
        }
      } catch {
        // try next
      }
    }

    if (!defaultSha) {
      throw new Error(`Could not find default branch commit on repository "${owner}/${repo}". Check token permissions.`);
    }

    // Create gh-pages ref
    const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: defaultSha,
      }),
    });

    if (!createRefRes.ok && createRefRes.status !== 422) {
      const err = await createRefRes.json().catch(() => ({}));
      throw new Error(`Failed to create ${branch} branch: ${err.message || createRefRes.statusText}`);
    }
  }

  // 2. Upload / update index.html
  onProgress?.('Uploading standalone landing page (index.html)…');
  let existingIndexSha = '';
  try {
    const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/index.html?ref=${branch}`, { headers });
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      existingIndexSha = fileData.sha || '';
    }
  } catch {
    // new file
  }

  const putIndexRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/index.html`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: 'deploy: publish landing page via RepoLaunch 🚀',
      content: utf8ToBase64(html),
      branch,
      ...(existingIndexSha ? { sha: existingIndexSha } : {}),
    }),
  });

  if (!putIndexRes.ok) {
    const err = await putIndexRes.json().catch(() => ({}));
    throw new Error(`Failed to commit index.html: ${err.message || putIndexRes.statusText}`);
  }

  // 3. Upload og-image.png if provided
  if (ogBlob) {
    onProgress?.('Uploading social preview card (og-image.png)…');
    try {
      let existingOgSha = '';
      const ogRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/og-image.png?ref=${branch}`, { headers });
      if (ogRes.ok) {
        const ogData = await ogRes.json();
        existingOgSha = ogData.sha || '';
      }
      const ogBase64 = await blobToBase64(ogBlob);
      await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/og-image.png`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: 'assets: add og-image.png social card preview',
          content: ogBase64,
          branch,
          ...(existingOgSha ? { sha: existingOgSha } : {}),
        }),
      });
    } catch {
      // Optional asset upload failure won't fail the whole deployment
    }
  }

  // 4. Activate or verify GitHub Pages site
  onProgress?.('Enabling and configuring GitHub Pages…');
  try {
    await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source: { branch, path: '/' },
      }),
    });
  } catch {
    // May already be enabled
  }

  const liveUrl = `https://${owner.toLowerCase()}.github.io/${repo.toLowerCase()}/`;
  onProgress?.('Published successfully! 🎉');

  return {
    success: true,
    url: liveUrl,
  };
}
