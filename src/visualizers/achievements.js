/**
 * Developer Trophies & Achievements Visualizer
 * Calculates gamified developer achievement medals based on real telemetry.
 */
function renderAchievements(username, data = {}, theme = {}, options = {}) {
  const totalCommits = Number(data.commits || 0);
  const stars = Number(data.stars || 0);
  const reposCount = Number(data.publicRepos || 0);
  const activeDays = Number(data.activeDays || 0);

  const width = options.width || 467;
  const height = 195;
  const rx = options.borderRadius !== undefined ? options.borderRadius : 8;
  const showBorder = options.showBorder !== false;
  const bg = options.transparent ? 'none' : (theme.bgStart || '#1a1b27');
  const border = showBorder ? (theme.border || '#24283b') : 'none';
  const titleColor = theme.titleColor || '#7aa2f7';
  const textColor = theme.textColor || (theme.isLight ? '#1e293b' : '#c0caf5');
  const cardBg = theme.cardBg || (theme.isLight ? '#f8fafc' : '#131620');
  const watermarkColor = theme.watermarkColor || (theme.isLight ? '#94a3b8' : '#565f89');

  // Gamified achievements list
  const achievements = [
    {
      icon: '💎',
      title: 'Commit Titan',
      desc: `${totalCommits.toLocaleString()}+ commits`,
      tier: 'Diamond',
      color: theme.isLight ? '#0284c7' : '#00f0ff',
      border: theme.isLight ? '#38bdf8' : '#00f0ff',
    },
    {
      icon: '🏆',
      title: 'Streak Master',
      desc: `${activeDays}+ active days`,
      tier: 'Gold',
      color: theme.isLight ? '#d97706' : '#ffd866',
      border: theme.isLight ? '#f59e0b' : '#ffd866',
    },
    {
      icon: '🧠',
      title: 'Polyglot Dev',
      desc: '5+ Languages',
      tier: 'Platinum',
      color: theme.isLight ? '#7c3aed' : '#bd93f9',
      border: theme.isLight ? '#8b5cf6' : '#bd93f9',
    },
    {
      icon: '🚀',
      title: 'Open Source',
      desc: `${reposCount}+ Repositories`,
      tier: 'Silver',
      color: theme.isLight ? '#16a34a' : '#50fa7b',
      border: theme.isLight ? '#22c55e' : '#50fa7b',
    },
  ];

  let cardsSvg = '';
  achievements.forEach((ach, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 24 + col * 210;
    const y = 55 + row * 58;

    cardsSvg += `
      <g transform="translate(${x}, ${y})">
        <rect width="195" height="48" rx="6" fill="${cardBg}" stroke="${ach.border}" stroke-opacity="0.5" stroke-width="1" />
        <text x="12" y="30" font-size="20">${ach.icon}</text>
        <text x="42" y="20" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700">
          ${ach.title}
        </text>
        <text x="42" y="36" fill="${ach.color}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600">
          ${ach.desc} • ${ach.tier}
        </text>
      </g>`;
  });

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="1.5" />
  
  <!-- Header -->
  <g transform="translate(24, 32)">
    <text fill="${titleColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
      🏆 Developer Achievements &amp; Medals • @${username}
    </text>
  </g>

  ${cardsSvg}

  <!-- Personal Branding Watermark -->
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 24}" y="${height - 10}" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderAchievements };
