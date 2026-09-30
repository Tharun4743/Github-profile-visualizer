const https = require('https');

function fetchLeetCode(username) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      query: `
        query userProblemsSolved($username: String!) {
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            profile {
              ranking
            }
          }
        }
      `,
      variables: { username },
    });

    const req = https.request(
      {
        hostname: 'leetcode.com',
        path: '/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 6000,
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(d);
            const ac = parsed?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
            const ranking = parsed?.data?.matchedUser?.profile?.ranking || 0;
            let total = 0, easy = 0, medium = 0, hard = 0;
            ac.forEach((item) => {
              if (item.difficulty === 'All') total = item.count;
              if (item.difficulty === 'Easy') easy = item.count;
              if (item.difficulty === 'Medium') medium = item.count;
              if (item.difficulty === 'Hard') hard = item.count;
            });
            resolve({ total, easy, medium, hard, ranking });
          } catch (e) {
            resolve({ total: 0, easy: 0, medium: 0, hard: 0, ranking: 0 });
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ total: 0, easy: 0, medium: 0, hard: 0, ranking: 0 });
    });
    req.on('error', () => resolve({ total: 0, easy: 0, medium: 0, hard: 0, ranking: 0 }));
    req.write(body);
    req.end();
  });
}

async function renderLeetCodeCard(username, theme = {}, options = {}) {
  const lc = await fetchLeetCode(username);

  const width = options.width || 467;
  const height = 195;
  const rx = options.borderRadius !== undefined ? options.borderRadius : 8;
  const showBorder = options.showBorder !== false;
  const bg = options.transparent ? 'none' : (theme.bgStart || '#1a1b27');
  const border = showBorder ? (theme.border || '#24283b') : 'none';
  const textColor = theme.textColor || (theme.isLight ? '#1e293b' : '#c0caf5');
  const subtextColor = theme.subtextColor || (theme.isLight ? '#64748b' : '#8b949e');
  const watermarkColor = theme.watermarkColor || (theme.isLight ? '#94a3b8' : '#565f89');

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .stat-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; fill: ${textColor}; }
    .stat-val { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; }
    @keyframes liveThemePulse {
      0%, 100% { stroke: #ffa116; }
      50% { stroke: #00f0ff; }
    }
    .card-border { animation: liveThemePulse 7s ease-in-out infinite; }
  </style>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="1.5" class="card-border" />

  <!-- Header -->
  <g transform="translate(24, 32)">
    <text fill="#ffa116" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
      🧩 LeetCode Telemetry • @${username}
    </text>
  </g>

  <!-- Metrics -->
  <g transform="translate(24, 52)">
    <g transform="translate(0, 10)">
      <text class="stat-label">Total Solved:</text>
      <text x="240" class="stat-val" fill="#ffa116">${lc.total}</text>
    </g>
    <g transform="translate(0, 36)">
      <text class="stat-label">Easy Problems:</text>
      <text x="240" class="stat-val" fill="#00b8a3">${lc.easy}</text>
    </g>
    <g transform="translate(0, 62)">
      <text class="stat-label">Medium Problems:</text>
      <text x="240" class="stat-val" fill="#ffc01e">${lc.medium}</text>
    </g>
    <g transform="translate(0, 88)">
      <text class="stat-label">Hard Problems:</text>
      <text x="240" class="stat-val" fill="#ff375f">${lc.hard}</text>
    </g>
    <g transform="translate(0, 114)">
      <text class="stat-label">Global Ranking:</text>
      <text x="240" class="stat-val" fill="${subtextColor}">${lc.ranking ? lc.ranking.toLocaleString() : 'N/A'}</text>
    </g>
  </g>

  <!-- Personal Branding Watermark -->
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 24}" y="${height - 12}" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderLeetCodeCard };
