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

async function renderCodingHabits(username, token, theme = {}, options = {}) {
  const eventsRaw = await fetchJson(`https://api.github.com/users/${username}/events/public?per_page=100`, token);
  const events = Array.isArray(eventsRaw) ? eventsRaw : [];

  let morning = 0;   // 06:00 - 12:00
  let daytime = 0;   // 12:00 - 18:00
  let evening = 0;   // 18:00 - 24:00
  let night = 0;     // 00:00 - 06:00

  events.forEach((e) => {
    if (!e.created_at) return;
    const hour = new Date(e.created_at).getUTCHours();
    if (hour >= 6 && hour < 12) morning++;
    else if (hour >= 12 && hour < 18) daytime++;
    else if (hour >= 18 && hour < 24) evening++;
    else night++;
  });

  const total = morning + daytime + evening + night || 1;
  const pct = (val) => Math.round((val / total) * 100);

  const mPct = pct(morning);
  const dPct = pct(daytime);
  const ePct = pct(evening);
  const nPct = pct(night);

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

  const bar = (pctVal, color, y, label, icon) => {
    const barWidth = Math.max(4, Math.round((pctVal / 100) * 200));
    return `
      <g transform="translate(24, ${y})">
        <text x="0" y="12" font-size="12">${icon}</text>
        <text x="22" y="12" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500">${label}</text>
        <rect x="130" y="2" width="200" height="12" rx="6" fill="${trackBg}" />
        <rect x="130" y="2" width="${barWidth}" height="12" rx="6" fill="${color}" />
        <text x="345" y="12" fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600">${pctVal}%</text>
      </g>`;
  };

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="1.5" />
  
  <!-- Header -->
  <g transform="translate(24, 30)">
    <text fill="${titleColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
      🕒 Productive Coding Habits • @${username}
    </text>
  </g>

  ${bar(mPct, '#00d26a', 52, 'Morning (06-12)', '🌅')}
  ${bar(dPct, '#00f0ff', 80, 'Daytime (12-18)', '☀️')}
  ${bar(ePct, '#bd93f9', 108, 'Evening (18-24)', '🌆')}
  ${bar(nPct, '#ff79c6', 136, 'Night Owl (00-06)', '🌙')}

  <!-- Footer Tip -->
  <text x="24" y="${height - 12}" fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="9">
    Computed from recent activity telemetry
  </text>

  <!-- Personal Branding Watermark -->
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 24}" y="${height - 12}" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderCodingHabits };
