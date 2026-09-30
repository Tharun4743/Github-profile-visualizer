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

async function fetchHackerRank(username) {
  if (!username) return null;

  const [profileRes, badgesRes] = await Promise.all([
    fetchJson(`https://www.hackerrank.com/rest/contests/master/hackers/${encodeURIComponent(username)}/profile`),
    fetchJson(`https://www.hackerrank.com/rest/hackers/${encodeURIComponent(username)}/badges`)
  ]);

  const profile = profileRes.data?.model || {};
  const badgesList = badgesRes.data?.models || [];

  const name = profile.name || profile.username || username;
  const country = profile.country || '';
  const level = profile.level || 1;
  
  let totalSolved = 0;
  let totalStars = 0;
  const badges = badgesList.map((b) => {
    const stars = Number(b.stars || 0);
    const solved = Number(b.solved || 0);
    totalSolved += solved;
    totalStars += stars;
    return {
      name: b.badge_name || b.badge_type || 'Skill',
      stars,
      totalStars: Number(b.total_stars || 6),
      solved,
      points: Number(b.current_points || 0),
      rank: b.hacker_rank ? Number(b.hacker_rank) : null
    };
  });

  return {
    username,
    name,
    country,
    level,
    totalSolved,
    totalStars,
    badges
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

async function renderHackerRankCard(username, theme = {}, options = {}) {
  const hr = await fetchHackerRank(username);
  if (!hr) return null;

  const width = options.width || 467;
  const height = 195;
  const rx = options.borderRadius !== undefined ? options.borderRadius : 8;
  const showBorder = options.showBorder !== false;
  const bg = options.transparent ? 'none' : (theme.bgStart || '#1a1b27');
  const border = showBorder ? (theme.border || '#24283b') : 'none';
  const cleanUser = escapeXml(username);
  const cleanName = escapeXml(hr.name);
  const textColor = theme.textColor || (theme.isLight ? '#1e293b' : '#c0caf5');
  const subtextColor = theme.subtextColor || (theme.isLight ? '#64748b' : '#8b949e');
  const watermarkColor = theme.watermarkColor || (theme.isLight ? '#94a3b8' : '#565f89');

  const rows = [];
  hr.badges.forEach((b) => {
    const starString = '★'.repeat(Math.max(1, b.stars)) + '☆'.repeat(Math.max(0, b.totalStars - b.stars));
    rows.push({
      label: `${escapeXml(b.name)}:`,
      val: escapeXml(starString),
      color: '#ffa116',
      isStars: true
    });
  });

  // Complement rows to ensure 4 full lines
  if (rows.length < 2) {
    rows.push({ label: 'Primary Track:', val: 'Problem Solving (Algorithms)', color: '#00ea64' });
  }
  if (rows.length < 3) {
    rows.push({ label: 'Challenges Solved:', val: `${hr.totalSolved} challenges`, color: '#00d26a' });
  }
  if (rows.length < 4) {
    rows.push({ label: 'Profile Standing:', val: `Active Candidate (Lvl ${hr.level})`, color: subtextColor });
  }

  const displayRows = rows.slice(0, 4);
  const badgeRows = displayRows.map((r, idx) => {
    const y = idx * 26;
    const fontClass = r.isStars ? 'star-val' : 'stat-val';
    return `<g transform="translate(0, ${y})">
      <text class="stat-label">${r.label}</text>
      <text x="220" class="${fontClass}" fill="${r.color}">${r.val}</text>
    </g>`;
  }).join('\n    ');

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .stat-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; fill: ${textColor}; }
    .stat-val { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; }
    .star-val { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 2px; }
  </style>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="1.5" />

  <!-- Header -->
  <g transform="translate(24, 30)">
    <text fill="#00ea64" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
      🎖️ HackerRank Achievements • @${cleanUser}
    </text>
    <text x="419" y="0" text-anchor="end" fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600">
      Level ${hr.level}${hr.country ? ' • ' + escapeXml(hr.country) : ''}
    </text>
  </g>

  <!-- Badges / Stars -->
  <g transform="translate(24, 56)">
    ${badgeRows}
  </g>

  <!-- Summary Footer Line -->
  <g transform="translate(24, 168)">
    <text fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600">
      Total Solved: <tspan fill="#00ea64" font-weight="700">${hr.totalSolved}</tspan> • Earned Stars: <tspan fill="#ffa116" font-weight="700">${hr.totalStars}★</tspan>
    </text>
  </g>

  <!-- Personal Branding Watermark -->
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 24}" y="${height - 12}" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderHackerRankCard, fetchHackerRank };
