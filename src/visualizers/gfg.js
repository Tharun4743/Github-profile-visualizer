const https = require('https');

function fetchJson(url, headers = {}) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers
      },
      timeout: 7000
    }, (res) => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, data: null });
        }
      });
    }).on('timeout', function() {
      this.destroy();
      resolve({ status: 408, data: null });
    }).on('error', () => resolve({ status: 500, data: null }));
  });
}

async function fetchGFG(username) {
  if (!username) return null;

  // Try Primary high-availability endpoint
  const primary = await fetchJson(`https://gfgstatscard.vercel.app/${encodeURIComponent(username)}?raw=true`);
  if (primary.data && (primary.data.userHandle || primary.data.total_problems_solved !== undefined)) {
    const d = primary.data;
    const basic = Number(d.Basic || 0) + Number(d.School || 0);
    const easy = Number(d.Easy || 0);
    const medium = Number(d.Medium || 0);
    const hard = Number(d.Hard || 0);
    const total = Number(d.total_problems_solved || (basic + easy + medium + hard));
    const score = Number(d.total_score || 0);
    const streak = Number(d.pod_solved_current_streak || d.pod_solved_longest_streak || 0);
    return { username, total, basic, easy, medium, hard, score, streak };
  }

  // Try Secondary endpoint
  const secondary = await fetchJson(`https://geeks-for-geeks-stats-api.vercel.app/?raw=y&userName=${encodeURIComponent(username)}`);
  if (secondary.data && !secondary.data.error) {
    const d = secondary.data;
    const basic = Number(d.Basic || 0) + Number(d.School || 0);
    const easy = Number(d.Easy || 0);
    const medium = Number(d.Medium || 0);
    const hard = Number(d.Hard || 0);
    const total = Number(d.totalProblemsSolved || (basic + easy + medium + hard));
    const score = Number(d.totalScore || 0);
    const streak = Number(d.currentStreak || 0);
    return { username, total, basic, easy, medium, hard, score, streak };
  }

  return { username, total: 0, basic: 0, easy: 0, medium: 0, hard: 0, score: 0, streak: 0 };
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function renderGFGCard(username, theme = {}, options = {}) {
  const gfg = await fetchGFG(username);
  if (!gfg) return null;

  const width = options.width || 467;
  const height = 195;
  const rx = options.borderRadius !== undefined ? options.borderRadius : 8;
  const showBorder = options.showBorder !== false;
  const bg = options.transparent ? 'none' : (theme.bgStart || '#1a1b27');
  const border = showBorder ? (theme.border || '#24283b') : 'none';
  const cleanUser = escapeXml(username);
  const textColor = theme.textColor || (theme.isLight ? '#1e293b' : '#c0caf5');
  const subtextColor = theme.subtextColor || (theme.isLight ? '#64748b' : '#8b949e');
  const trackBg = theme.trackBg || (theme.isLight ? '#e2e8f0' : '#282a36');
  const watermarkColor = theme.watermarkColor || (theme.isLight ? '#94a3b8' : '#565f89');

  // Distribution bar calculation
  const total = gfg.total || (gfg.basic + gfg.easy + gfg.medium + gfg.hard) || 1;
  const barWidth = width - 48;
  const basicW = Math.max(0, Math.round((gfg.basic / total) * barWidth));
  const easyW = Math.max(0, Math.round((gfg.easy / total) * barWidth));
  const medW = Math.max(0, Math.round((gfg.medium / total) * barWidth));
  const hardW = Math.max(0, barWidth - basicW - easyW - medW);

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .stat-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; fill: ${textColor}; }
    .stat-val { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; }
  </style>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="1.5" />

  <!-- Header -->
  <g transform="translate(24, 30)">
    <text fill="#2f8d46" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
      🌿 GeeksforGeeks Telemetry • @${cleanUser}
    </text>
  </g>

  <!-- Distribution Progress Bar -->
  <g transform="translate(24, 46)">
    <rect x="0" y="0" width="${barWidth}" height="6" rx="3" fill="${trackBg}" />
    <rect x="0" y="0" width="${basicW}" height="6" rx="3" fill="#00b8a3" />
    <rect x="${basicW}" y="0" width="${easyW}" height="6" fill="#00ea64" />
    <rect x="${basicW + easyW}" y="0" width="${medW}" height="6" fill="#ffc01e" />
    <rect x="${basicW + easyW + medW}" y="0" width="${hardW}" height="6" rx="3" fill="#ff375f" />
  </g>

  <!-- Metrics Grid -->
  <g transform="translate(24, 66)">
    <g transform="translate(0, 10)">
      <text class="stat-label">Total Solved:</text>
      <text x="240" class="stat-val" fill="#2f8d46">${gfg.total}</text>
    </g>
    <g transform="translate(0, 34)">
      <text class="stat-label">Basic / School:</text>
      <text x="240" class="stat-val" fill="#00b8a3">${gfg.basic}</text>
    </g>
    <g transform="translate(0, 58)">
      <text class="stat-label">Easy Problems:</text>
      <text x="240" class="stat-val" fill="#00ea64">${gfg.easy}</text>
    </g>
    <g transform="translate(0, 82)">
      <text class="stat-label">Medium / Hard:</text>
      <text x="240" class="stat-val" fill="#ffc01e">${gfg.medium} / <tspan fill="#ff375f">${gfg.hard}</tspan></text>
    </g>
    <g transform="translate(0, 106)">
      <text class="stat-label">Coding Score / Streak:</text>
      <text x="240" class="stat-val" fill="${subtextColor}">${gfg.score || gfg.total * 2} pts • ${gfg.streak}d 🔥</text>
    </g>
  </g>

  <!-- Personal Branding Watermark -->
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 24}" y="${height - 12}" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderGFGCard, fetchGFG };
