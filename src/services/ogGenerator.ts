import type { LandingPageContent, RepoMetadata, ThemeConfig } from '../types';

export function generateOgCanvas(
  meta: RepoMetadata,
  content: LandingPageContent,
  theme: ThemeConfig
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const accent = theme.accentColor || '#818cf8';
  const isDark = theme.themeId !== 'clean-minimal' && theme.themeId !== 'neo-brutalist';
  const isBrutal = theme.themeId === 'neo-brutalist';

  // 1. Background
  if (isBrutal) {
    ctx.fillStyle = '#fff8e7';
    ctx.fillRect(0, 0, 1200, 630);
    // Draw brutalist border
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, 1184, 614);
  } else if (isDark) {
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, 1200, 630);

    // Glowing radial gradient top-right
    const radial = ctx.createRadialGradient(1000, 100, 20, 1000, 100, 550);
    radial.addColorStop(0, `${accent}44`);
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1200, 630);

    // Subtle bottom-left glow
    const radial2 = ctx.createRadialGradient(150, 550, 10, 150, 550, 400);
    radial2.addColorStop(0, `${accent}22`);
    radial2.addColorStop(1, 'transparent');
    ctx.fillStyle = radial2;
    ctx.fillRect(0, 0, 1200, 630);

    // Grid dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = 40; x < 1200; x += 40) {
      for (let y = 40; y < 630; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    // Minimal white/gray
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1200, 630);

    const radial = ctx.createRadialGradient(600, 0, 50, 600, 0, 600);
    radial.addColorStop(0, `${accent}18`);
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1200, 630);
  }

  // 2. Top Eyebrow / Repo owner
  ctx.save();
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = isBrutal ? '#111111' : isDark ? `${accent}` : accent;
  ctx.fillText(`${meta.owner} /`, 80, 100);
  ctx.restore();

  // 3. Project Title
  ctx.save();
  ctx.font = '800 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = isBrutal ? '#111111' : isDark ? '#ffffff' : '#0f172a';
  ctx.fillText(meta.name, 80, 175);
  ctx.restore();

  // 4. Headline / Slogan
  ctx.save();
  ctx.font = '500 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = isBrutal ? '#333333' : isDark ? '#cbd5e1' : '#334155';
  
  // Word wrap headline into max 2 lines
  const words = (content.hero.headline || meta.description || '').split(' ');
  let line = '';
  let y = 250;
  let linesCount = 0;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 1000 && n > 0) {
      ctx.fillText(line.trim(), 80, y);
      line = words[n] + ' ';
      y += 44;
      linesCount++;
      if (linesCount >= 2) break;
    } else {
      line = testLine;
    }
  }
  if (linesCount < 2 && line.trim()) {
    ctx.fillText(line.trim(), 80, y);
  }
  ctx.restore();

  // 5. Badges Bar at the bottom
  const badgesY = 510;
  const badges: { label: string; text: string }[] = [
    { label: '★', text: `${meta.stars.toLocaleString()} stars` },
    { label: '⑂', text: `${meta.forks.toLocaleString()} forks` },
    ...(meta.language ? [{ label: 'λ', text: meta.language }] : []),
    ...(meta.latestRelease ? [{ label: '🏷', text: meta.latestRelease.tagName }] : []),
    ...(meta.license ? [{ label: '⚖', text: meta.license }] : []),
  ];

  let badgeX = 80;
  for (const b of badges) {
    ctx.save();
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const textWidth = ctx.measureText(`${b.label}  ${b.text}`).width;
    const paddingX = 20;
    const badgeW = textWidth + paddingX * 2;
    const badgeH = 50;

    if (isBrutal) {
      // Brutalist badge with solid border and shadow
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(badgeX + 4, badgesY + 4, badgeW, badgeH); // shadow
      ctx.fillStyle = accent;
      ctx.fillRect(badgeX, badgesY, badgeW, badgeH);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 3;
      ctx.strokeRect(badgeX, badgesY, badgeW, badgeH);
      ctx.fillStyle = '#111111';
      ctx.fillText(`${b.label}  ${b.text}`, badgeX + paddingX, badgesY + 32);
    } else if (isDark) {
      // Midnight glass badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgesY, badgeW, badgeH, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(`${b.label}  ${b.text}`, badgeX + paddingX, badgesY + 32);
    } else {
      // Minimal white badge
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgesY, badgeW, badgeH, 12);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`${b.label}  ${b.text}`, badgeX + paddingX, badgesY + 32);
    }

    badgeX += badgeW + 16;
    ctx.restore();
  }

  // 6. Watermark stamp (bottom right)
  ctx.save();
  ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = isBrutal ? '#555555' : isDark ? '#64748b' : '#94a3b8';
  ctx.fillText('Generated by RepoLaunch', 940, 542);
  ctx.restore();

  return canvas;
}

export function generateOgImageBlob(
  meta: RepoMetadata,
  content: LandingPageContent,
  theme: ThemeConfig
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = generateOgCanvas(meta, content, theme);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate image blob'));
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
}
