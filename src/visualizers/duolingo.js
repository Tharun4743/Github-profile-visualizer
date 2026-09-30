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

async function fetchDuolingo(username) {
  if (!username) return null;

  const res = await fetchJson(`https://www.duolingo.com/2017-06-30/users?username=${encodeURIComponent(username)}`);
  const user = res.data?.users?.[0];
  if (!user) {
    return {
      username,
      name: username,
      streak: 0,
      totalXp: 0,
      learningLanguage: '',
      courses: []
    };
  }

  return {
    username: user.username || username,
    name: user.name || user.username || username,
    streak: Number(user.streak || 0),
    totalXp: Number(user.totalXp || 0),
    learningLanguage: user.learningLanguage || '',
    courses: (user.courses || []).map(c => ({
      title: c.title,
      xp: Number(c.xp || 0),
      crowns: Number(c.crowns || 0)
    }))
  };
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function renderDuolingoCard(username, theme = {}, options = {}) {
  const duo = await fetchDuolingo(username);
  if (!duo) return null;

  const width = options.width || 467;
  const height = 195;
  const rx = options.borderRadius !== undefined ? options.borderRadius : 8;
  const showBorder = options.showBorder !== false;
  const bg = options.transparent ? 'none' : (theme.bgStart || '#1a1b27');
  const border = showBorder ? (theme.border || '#24283b') : 'none';
  const cleanUser = escapeXml(username);
  const textColor = theme.textColor || (theme.isLight ? '#1e293b' : '#c0caf5');
  const subtextColor = theme.subtextColor || (theme.isLight ? '#64748b' : '#8b949e');
  const watermarkColor = theme.watermarkColor || (theme.isLight ? '#94a3b8' : '#565f89');

  const topCourse = duo.courses.length > 0 ? duo.courses[0] : null;
  const courseTitle = topCourse?.title || duo.learningLanguage?.toUpperCase() || 'Language Practice';
  const courseXp = topCourse?.xp || duo.totalXp;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .stat-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; fill: ${textColor}; }
    .stat-val { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; }
    @keyframes duoGlowPulse {
      0%, 100% { stroke: #58cc02; }
      50% { stroke: #ffc800; }
    }
    .card-border { animation: duoGlowPulse 6s ease-in-out infinite; }
  </style>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="1.5" class="card-border" />

  <!-- Header -->
  <g transform="translate(24, 30)">
    <text fill="#58cc02" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
      🦉 Duolingo Learning Streak • @${cleanUser}
    </text>
  </g>

  <!-- Metrics -->
  <g transform="translate(24, 54)">
    <g transform="translate(0, 10)">
      <text class="stat-label">Daily Streak:</text>
      <text x="240" class="stat-val" fill="#ff9600">${duo.streak} Days 🔥</text>
    </g>
    <g transform="translate(0, 36)">
      <text class="stat-label">Total Experience:</text>
      <text x="240" class="stat-val" fill="#ffc800">${duo.totalXp.toLocaleString()} XP ⚡</text>
    </g>
    <g transform="translate(0, 62)">
      <text class="stat-label">Active Language:</text>
      <text x="240" class="stat-val" fill="#58cc02">${escapeXml(courseTitle)}</text>
    </g>
    <g transform="translate(0, 88)">
      <text class="stat-label">Language XP / Crowns:</text>
      <text x="240" class="stat-val" fill="#00d26a">${courseXp.toLocaleString()} XP • ${topCourse?.crowns || 0} 👑</text>
    </g>
  </g>

  <!-- Courses Badges -->
  <g transform="translate(24, 168)">
    <text fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600">
      Enrolled Courses: <tspan fill="${textColor}" font-weight="700">${duo.courses.length || 1}</tspan> (${duo.courses.map(c => escapeXml(c.title)).slice(0, 3).join(', ') || 'Global'})
    </text>
  </g>

  <!-- Personal Branding Watermark -->
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 24}" y="${height - 12}" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderDuolingoCard, fetchDuolingo };
