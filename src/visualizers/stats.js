/**
 * GitHub Core Analytics & Stats Card Visualizer
 * Renders GitHub stats across all themes with high-contrast text and theme-aware accents.
 */
function renderStatsCard(username = '', data = {}, theme = {}, options = {}) {
  if (typeof data === 'object' && data !== null && !data.commits && (data.bgStart || data.titleColor)) {
    // Parameter shift: (username, theme, options)
    options = theme || {};
    theme = data;
    data = {};
  }

  const cleanUser = String(username || options.username || 'developer').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const width = options.width || 467;
  const height = 195;
  const rx = options.borderRadius !== undefined ? options.borderRadius : 8;
  const showBorder = options.showBorder !== false;
  const bg = options.transparent ? 'none' : (theme.bgStart || '#1a1b27');
  const border = showBorder ? (theme.border || '#24283b') : 'none';
  const titleColor = theme.titleColor || '#00f0ff';
  const textColor = theme.textColor || (theme.isLight ? '#0f172a' : '#c0caf5');
  const watermarkColor = theme.watermarkColor || (theme.isLight ? '#94a3b8' : '#565f89');

  const stars = Number(data.stars || 0);
  const commits = (data.commits !== undefined ? Number(data.commits) : 0).toLocaleString();
  const prs = Number(data.prs || 0);
  const repos = Number(data.publicRepos || data.repos || 0);

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: ${titleColor}; }
    .stat-label { font: 600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: ${textColor}; }
    .stat-val { font: 700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
  <rect x="0.5" y="0.5" rx="${rx}" height="${height - 1}" width="${width - 1}" fill="${bg}" stroke="${border}" stroke-width="1.5" />
  <g transform="translate(24, 32)">
    <text x="0" y="0" class="header">📊 GitHub Core Analytics • @${cleanUser}</text>
  </g>
  <g transform="translate(24, 56)">
    <g transform="translate(0, 0)">
      <text class="stat-label" x="0" y="12">Total Stars Earned:</text>
      <text class="stat-val" x="220" y="12" fill="${theme.isLight ? '#d97706' : '#ffd866'}">${stars} ⭐</text>
    </g>
    <g transform="translate(0, 26)">
      <text class="stat-label" x="0" y="12">Total Lifetime Commits:</text>
      <text class="stat-val" x="220" y="12" fill="${theme.isLight ? '#0f766e' : '#00f0ff'}">${commits} ⚡</text>
    </g>
    <g transform="translate(0, 52)">
      <text class="stat-label" x="0" y="12">Pull Requests Merged:</text>
      <text class="stat-val" x="220" y="12" fill="${theme.isLight ? '#0284c7' : '#bd93f9'}">${prs} PRs</text>
    </g>
    <g transform="translate(0, 78)">
      <text class="stat-label" x="0" y="12">Public Repositories:</text>
      <text class="stat-val" x="220" y="12" fill="${theme.isLight ? '#6366f1' : '#50fa7b'}">${repos} Repos</text>
    </g>
  </g>
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 24}" y="${height - 12}" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderStatsCard };
