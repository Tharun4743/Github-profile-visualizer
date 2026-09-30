const https = require('https');

function fetchJson(url, token) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const headers = { 'User-Agent': 'github-profile-visualizer' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = https.get(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers,
        timeout: 8000,
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            resolve([]);
          }
        });
      }
    );
    req.on('timeout', () => {
      req.destroy();
      resolve([]);
    });
    req.on('error', () => resolve([]));
  });
}

const LANG_COLORS = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Dart: '#00B4AB',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  Shell: '#89e051',
  Vue: '#41b883',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Other: '#8b949e',
};

async function renderLanguageMatrix(username, token, theme = {}, options = {}) {
  const reposRaw = await fetchJson(`https://api.github.com/users/${username}/repos?per_page=100`, token);
  const repos = Array.isArray(reposRaw) ? reposRaw : [];

  const langCounts = {};
  repos.forEach((r) => {
    if (r.language && !r.fork) {
      langCounts[r.language] = (langCounts[r.language] || 0) + (r.size || 10);
    }
  });

  const total = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
  const sorted = Object.entries(langCounts)
    .map(([lang, bytes]) => ({
      lang,
      pct: parseFloat(((bytes / total) * 100).toFixed(1)),
      color: LANG_COLORS[lang] || LANG_COLORS.Other,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  const width = options.width || 467;
  const height = 195;
  const rx = options.borderRadius !== undefined ? options.borderRadius : 8;
  const showBorder = options.showBorder !== false;
  const bg = options.transparent ? 'none' : (theme.bgStart || '#1a1b27');
  const border = showBorder ? (theme.border || '#24283b') : 'none';
  const titleColor = theme.titleColor || '#7aa2f7';
  const textColor = theme.textColor || (theme.isLight ? '#1e293b' : '#c0caf5');
  const subtextColor = theme.subtextColor || (theme.isLight ? '#64748b' : '#8b949e');
  const trackBg = theme.trackBg || (theme.isLight ? '#e2e8f0' : '#131620');
  const watermarkColor = theme.watermarkColor || (theme.isLight ? '#94a3b8' : '#565f89');

  const totalBarWidth = width - 48;
  let currentX = 24;
  let barRects = '';
  sorted.forEach((item, idx) => {
    const segWidth = Math.max(3, Math.round((item.pct / 100) * totalBarWidth));
    const roundAttr = idx === 0 ? 'rx="5"' : idx === sorted.length - 1 ? 'rx="5"' : '';
    barRects += `<rect x="${currentX}" y="65" width="${segWidth}" height="14" ${roundAttr} fill="${item.color}" />`;
    currentX += segWidth;
  });

  let chipsSvg = '';
  sorted.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 24 + col * 200;
    const y = 105 + row * 26;

    chipsSvg += `
      <g transform="translate(${x}, ${y})">
        <circle cx="6" cy="6" r="5" fill="${item.color}" />
        <text x="18" y="10" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">
          ${item.lang}
        </text>
        <text x="120" y="10" fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12">
          ${item.pct}%
        </text>
      </g>`;
  });

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="1.5" />

  <!-- Header -->
  <g transform="translate(24, 32)">
    <text fill="${titleColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
      💻 Most Used Languages • @${username}
    </text>
  </g>

  <!-- Progress Bar -->
  <rect x="24" y="65" width="${totalBarWidth}" height="14" rx="6" fill="${trackBg}" />
  ${barRects}

  <!-- Chips -->
  ${chipsSvg}

  <!-- Personal Branding Watermark -->
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 24}" y="${height - 12}" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderLanguageMatrix };
