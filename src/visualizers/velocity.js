/**
 * Commit Velocity Wave Chart Visualizer
 * Plots commit frequency across the year using smooth cubic Bezier curves and area gradients.
 */
function renderCommitVelocity(days = [], username = '', theme = {}, options = {}) {
  const width = options.width || 467;
  const height = 195;
  const rx = options.borderRadius !== undefined ? options.borderRadius : 8;
  const showBorder = options.showBorder !== false;
  const bg = options.transparent ? 'none' : (theme.bgStart || '#1a1b27');
  const border = showBorder ? (theme.border || '#24283b') : 'none';
  const lineColor = theme.titleColor || '#00f0ff';
  const glowColor = theme.statColor || '#7aa2f7';
  const subtextColor = theme.subtextColor || (theme.isLight ? '#64748b' : '#8b949e');
  const cardBg = theme.cardBg || (theme.isLight ? '#f8fafc' : '#131620');
  const watermarkColor = theme.watermarkColor || (theme.isLight ? '#94a3b8' : '#565f89');

  // Group days into 12 monthly buckets
  const monthSums = new Array(12).fill(0);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const safeDays = Array.isArray(days) ? days : [];
  safeDays.forEach((d) => {
    if (!d.date) return;
    const m = parseInt(d.date.split('-')[1], 10) - 1;
    if (m >= 0 && m < 12) {
      monthSums[m] += d.count || (d.level > 0 ? d.level * 2 : 0);
    }
  });

  const maxVal = Math.max(1, ...monthSums);
  const chartLeft = 32;
  const chartRight = width - 32;
  const chartBottom = height - 36;
  const chartTop = 64;
  const chartHeight = chartBottom - chartTop;

  // Calculate (x, y) coordinates for the 12 data points
  const points = monthSums.map((val, idx) => {
    const x = chartLeft + (idx / 11) * (chartRight - chartLeft);
    const y = chartBottom - (val / maxVal) * chartHeight;
    return { x, y, val, month: months[idx] };
  });

  // Build cubic Bezier curve path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.x.toFixed(1)}`;
  }

  // Closed area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`;

  // Draw X axis month labels and data circles
  let markersSvg = '';
  points.forEach((p, i) => {
    if (i % 2 === 0 || i === 11) {
      markersSvg += `<text x="${p.x}" y="${height - 18}" text-anchor="middle" fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10">${p.month}</text>`;
    }
    if (p.val > 0) {
      markersSvg += `
        <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${lineColor}" stroke="${cardBg}" stroke-width="1.5">
          <title>${p.month}: ${p.val} contributions</title>
        </circle>`;
    }
  });

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="velocity-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.32" />
      <stop offset="100%" stop-color="${glowColor}" stop-opacity="0.0" />
    </linearGradient>
  </defs>

  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="1.5" />
  
  <!-- Header -->
  <g transform="translate(24, 32)">
    <text fill="${lineColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
      📈 Commit Velocity Wave • @${username}
    </text>
    <text y="18" fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11">
      Monthly Engineering Momentum &amp; Volume Curve
    </text>
  </g>

  <!-- Area Fill -->
  <path d="${areaD}" fill="url(#velocity-grad)" />

  <!-- Wave Stroke -->
  <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-linecap="round" />

  <!-- Markers and Labels -->
  ${markersSvg}

  <!-- Personal Branding Watermark -->
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 24}" y="${height - 10}" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderCommitVelocity };
