/**
 * Engineering Competency Radar Chart
 * Renders a polygonal radar chart visualizing engineering proficiencies.
 */
function renderSkillsRadar(username = '', theme = {}, options = {}) {
  const width = options.width || 467;
  const height = 195;
  const rx = options.borderRadius !== undefined ? options.borderRadius : 8;
  const showBorder = options.showBorder !== false;
  const bg = options.transparent ? 'none' : (theme.bgStart || '#1a1b27');
  const border = showBorder ? (theme.border || '#24283b') : 'none';
  const radarColor = theme.titleColor || '#00f0ff';
  const statColor = theme.statColor || '#bd93f9';

  const centerX = width / 2;
  const centerY = 112;
  const maxRadius = 58;

  // 5 Competency Axes and their score (0.0 to 1.0)
  let skills = [
    { name: 'Algorithms', score: 0.94 },
    { name: 'Full Stack', score: 0.96 },
    { name: 'Distributed', score: 0.88 },
    { name: 'System Design', score: 0.90 },
    { name: 'APIs &amp; DBs', score: 0.95 },
  ];

  if (options.skills) {
    if (typeof options.skills === 'string') {
      try {
        const parsed = options.skills.split(',').map((s) => {
          const parts = s.split(':');
          const name = (parts[0] || '').trim().replace(/&amp;/g, '&').replace(/&/g, '&amp;');
          const score = parseFloat(parts[1]) || 0.85;
          return { name, score: Math.min(1.0, Math.max(0.1, score)) };
        }).filter((item) => item.name);
        if (parsed.length >= 3) skills = parsed;
      } catch (e) {}
    } else if (Array.isArray(options.skills) && options.skills.length >= 3) {
      skills = options.skills.map((s) => ({
        name: (s.name || '').replace(/&amp;/g, '&').replace(/&/g, '&amp;'),
        score: Math.min(1.0, Math.max(0.1, parseFloat(s.score) || 0.85)),
      }));
    }
  }

  const totalAxes = skills.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  const gridStroke = theme.isLight ? '#cbd5e1' : '#24283b';
  const textColor = theme.textColor || (theme.isLight ? '#1e293b' : '#c0caf5');
  const watermarkColor = theme.watermarkColor || (theme.isLight ? '#94a3b8' : '#565f89');

  // Concentric grid rings (25%, 50%, 75%, 100%)
  let ringsSvg = '';
  [0.35, 0.7, 1.0].forEach((rPct) => {
    const r = maxRadius * rPct;
    let ringPts = '';
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      ringPts += `${x.toFixed(1)},${y.toFixed(1)} `;
    }
    ringsSvg += `<polygon points="${ringPts.trim()}" fill="none" stroke="${gridStroke}" stroke-width="1" />`;
  });

  // Axis Spokes and Labels
  let spokesSvg = '';
  let polygonPts = '';
  skills.forEach((skill, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const endX = centerX + maxRadius * Math.cos(angle);
    const endY = centerY + maxRadius * Math.sin(angle);
    spokesSvg += `<line x1="${centerX}" y1="${centerY}" x2="${endX}" y2="${endY}" stroke="${gridStroke}" stroke-width="1" />`;

    // Data polygon vertex
    const dataRadius = maxRadius * skill.score;
    const dataX = centerX + dataRadius * Math.cos(angle);
    const dataY = centerY + dataRadius * Math.sin(angle);
    polygonPts += `${dataX.toFixed(1)},${dataY.toFixed(1)} `;

    // Label position slightly outside radius
    const labelX = centerX + (maxRadius + 18) * Math.cos(angle);
    const labelY = centerY + (maxRadius + 14) * Math.sin(angle) + 4;
    const anchor = Math.cos(angle) > 0.3 ? 'start' : Math.cos(angle) < -0.3 ? 'end' : 'middle';

    spokesSvg += `
      <text x="${labelX}" y="${labelY}" text-anchor="${anchor}" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600">
        ${skill.name}
      </text>`;
  });

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${radarColor}" stop-opacity="0.38" />
      <stop offset="100%" stop-color="${statColor}" stop-opacity="0.08" />
    </radialGradient>
  </defs>

  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="1.5" />
  
  <!-- Header -->
  <g transform="translate(24, 28)">
    <text fill="${radarColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
      🎯 Engineering Competency Radar • @${username}
    </text>
  </g>

  <!-- Concentric Rings and Spokes -->
  ${ringsSvg}
  ${spokesSvg}

  <!-- Data Filled Polygon -->
  <polygon points="${polygonPts.trim()}" fill="url(#radar-glow)" stroke="${radarColor}" stroke-width="2" />

  <!-- Personal Branding Watermark -->
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 24}" y="${height - 10}" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderSkillsRadar };
