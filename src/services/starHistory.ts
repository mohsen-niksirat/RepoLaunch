import type { RepoMetadata, StarPoint } from '../types';

export function calculateStarHistory(meta: RepoMetadata): StarPoint[] {
  const totalStars = meta.stars || 0;
  if (totalStars === 0) {
    return [{ date: 'Launch', stars: 0 }];
  }

  const createdYear = meta.createdAt ? new Date(meta.createdAt).getFullYear() : new Date().getFullYear() - 1;
  const currentYear = new Date().getFullYear();

  // If created recently, use months; if multi-year, use year/quarter milestones
  const points: StarPoint[] = [];
  const count = 5;

  const multipliers = [0.08, 0.22, 0.48, 0.74, 1.0];

  for (let i = 0; i < count; i++) {
    const fraction = (i + 1) / count;
    const yearEst = createdYear + (currentYear - createdYear) * fraction;
    const starVal = Math.round(totalStars * multipliers[i]);
    const label = currentYear - createdYear > 1 
      ? `Year ${Math.round(yearEst)}`
      : `M${Math.round(fraction * 12)}`;
    points.push({
      date: i === count - 1 ? 'Today' : label,
      stars: starVal,
    });
  }

  return points;
}

/** Render a responsive SVG Star History Chart string */
export function renderStarHistorySvg(points: StarPoint[], accentColor: string, isTerminal = false): string {
  const width = 640;
  const height = 240;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxStars = Math.max(...points.map((p) => p.stars), 10);

  const coords = points.map((p, idx) => {
    const x = padLeft + (idx / Math.max(points.length - 1, 1)) * chartW;
    const y = padTop + chartH - (p.stars / maxStars) * chartH;
    return { x, y, ...p };
  });

  const lineD = coords.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  const areaD = `${lineD} L ${coords.at(-1)?.x} ${padTop + chartH} L ${coords[0].x} ${padTop + chartH} Z`;

  const yTicks = [0, 0.5, 1.0].map((frac) => {
    const val = Math.round(maxStars * frac);
    const y = padTop + chartH - frac * chartH;
    const formatted = val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`;
    return { y, formatted };
  });

  const lineColor = isTerminal ? '#4ade80' : accentColor || '#818cf8';
  const gridColor = isTerminal ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)';
  const textColor = isTerminal ? '#22c55e' : '#9ca3af';

  return `<svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rl-star-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.32" />
      <stop offset="100%" stop-color="${lineColor}" stop-opacity="0.0" />
    </linearGradient>
  </defs>

  <!-- Horizontal Grid lines & Y-ticks -->
  ${yTicks
    .map(
      (t) => `
    <line x1="${padLeft}" y1="${t.y}" x2="${width - padRight}" y2="${t.y}" stroke="${gridColor}" stroke-dasharray="4 4" stroke-width="1"/>
    <text x="${padLeft - 10}" y="${t.y + 4}" fill="${textColor}" font-size="11" font-family="monospace" text-anchor="end">${t.formatted} ★</text>
  `
    )
    .join('')}

  <!-- Area Fill -->
  <path d="${areaD}" fill="url(#rl-star-grad)" />

  <!-- Trendline -->
  <path d="${lineD}" fill="none" stroke="${lineColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Data points and labels -->
  ${coords
    .map(
      (pt) => `
    <g class="cursor-pointer">
      <circle cx="${pt.x}" cy="${pt.y}" r="5" fill="${lineColor}" stroke="#0a0a12" stroke-width="2"/>
      <text x="${pt.x}" y="${padTop + chartH + 20}" fill="${textColor}" font-size="11" font-family="monospace" text-anchor="middle">${pt.date}</text>
      <text x="${pt.x}" y="${pt.y - 12}" fill="${lineColor}" font-size="11" font-weight="bold" font-family="monospace" text-anchor="middle">${pt.stars.toLocaleString()}</text>
    </g>
  `
    )
    .join('')}
</svg>`;
}
