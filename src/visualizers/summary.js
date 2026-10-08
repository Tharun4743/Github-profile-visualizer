/**
 * Executive Summary Banner Visualizer
 * Full-width executive overview card uniting GitHub and LeetCode key performance indicators.
 */
function renderExecutiveSummary(username = '', ghData = {}, lcData = {}, theme = {}, options = {}) {
  const width = options.width || 940;
  const height = options.height || 130;
  const rx = options.borderRadius !== undefined ? options.borderRadius : 10;
  const showBorder = options.showBorder !== false;
  const bg = options.transparent ? 'none' : (theme.bgStart || '#1a1b27');
  const border = showBorder ? (theme.border || '#24283b') : 'none';
  const titleColor = theme.titleColor || '#00f0ff';
  const statColor = theme.statColor || '#7aa2f7';

  const cardBg = theme.cardBg || (theme.isLight ? '#f8fafc' : '#131620');
  const cardBorder = theme.cardBorder || (theme.isLight ? '#e2e8f0' : '#24283b');
  const subtextColor = theme.subtextColor || (theme.isLight ? '#64748b' : '#8b949e');
  const watermarkColor = theme.watermarkColor || (theme.isLight ? '#94a3b8' : '#565f89');

  const commits = (ghData.commits !== undefined ? ghData.commits : 0).toLocaleString();
  const prs = ghData.prs || 0;
  const stars = ghData.stars || 0;
  const lcSolved = lcData.total !== undefined ? lcData.total : 0;
  const lcRank = lcData.ranking ? lcData.ranking.toLocaleString() : 'N/A';

  const metricBlock = (x, label, value, sublabel, valColor) => `
    <g transform="translate(${x}, 48)">
      <rect width="168" height="60" rx="6" fill="${cardBg}" stroke="${cardBorder}" stroke-width="0.8" />
      <text x="14" y="20" fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600" text-transform="uppercase" letter-spacing="0.5px">
        ${label}
      </text>
      <text x="14" y="42" fill="${valColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700">
        ${value}
      </text>
      <text x="154" y="42" text-anchor="end" fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10">
        ${sublabel}
      </text>
    </g>`;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    @keyframes bannerPulse {
      0%, 100% { stroke: ${titleColor}; }
      50% { stroke: #bd93f9; }
    }
    .banner-border { animation: bannerPulse 8s ease-in-out infinite; }
  </style>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="1.5" class="banner-border" />

  <!-- Header Banner Title -->
  <g transform="translate(28, 28)">
    <text fill="${titleColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700">
      ⚡ Executive Engineering Velocity Summary • @${username}
    </text>
  </g>

  <!-- 5 Unified Metric Cards across the banner -->
  ${metricBlock(28, 'Lifetime Commits', commits, 'GitHub', theme.isLight ? '#0284c7' : '#00f0ff')}
  ${metricBlock(208, 'Pull Requests', `${prs} PRs`, 'Merged', theme.isLight ? '#7c3aed' : '#bd93f9')}
  ${metricBlock(388, 'Stars Earned', `${stars} ⭐`, 'Community', theme.isLight ? '#d97706' : '#ffd866')}
  ${metricBlock(568, 'LeetCode Solved', `${lcSolved}`, 'DSA Problems', '#ffa116')}
  ${metricBlock(748, 'LeetCode Ranking', `${lcRank}`, 'Global', theme.isLight ? '#16a34a' : '#00d26a')}

  <!-- Personal Branding Watermark -->
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 28}" y="32" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderExecutiveSummary };
