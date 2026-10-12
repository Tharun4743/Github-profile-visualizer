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

function timeAgo(dateStr) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatEvent(e) {
  const repo = e.repo ? e.repo.name.replace(/^[^/]+\//, '') : 'repository';
  const time = timeAgo(e.created_at);
  const ref = e.payload?.ref?.replace('refs/heads/', '') || 'main';

  switch (e.type) {
    case 'PushEvent': {
      const commitCount = e.payload?.commits?.length || (e.payload?.size !== undefined ? e.payload.size : (e.payload?.distinct_size !== undefined ? e.payload.distinct_size : 1));
      const commitTxt = commitCount ? ` ${commitCount} commit${commitCount > 1 ? 's' : ''}` : '';
      const msg = e.payload?.commits?.[0]?.message?.split('\n')[0];
      const detail = msg ? (msg.length > 28 ? msg.substring(0, 26) + '...' : msg) : ref;
      return {
        icon: '⚡',
        action: `Pushed${commitTxt} to`,
        target: repo,
        detail,
        time,
        color: '#00f0ff',
      };
    }
    case 'ReleaseEvent': {
      const tag = e.payload?.release?.tag_name || 'new release';
      return {
        icon: '🚀',
        action: `Published release ${tag} in`,
        target: repo,
        detail: 'Release',
        time,
        color: '#ff79c6',
      };
    }
    case 'PullRequestEvent': {
      const action = e.payload?.action || 'opened';
      const title = e.payload?.pull_request?.title || 'Pull Request';
      const cleanTitle = title.length > 28 ? title.substring(0, 26) + '...' : title;
      return {
        icon: '🔀',
        action: `${action.charAt(0).toUpperCase() + action.slice(1)} PR in`,
        target: repo,
        detail: cleanTitle,
        time,
        color: '#bd93f9',
      };
    }
    case 'WatchEvent': {
      return {
        icon: '⭐',
        action: 'Starred repository',
        target: repo,
        detail: 'Starred',
        time,
        color: '#ffd866',
      };
    }
    case 'CreateEvent': {
      const refType = e.payload?.ref_type || 'repository';
      return {
        icon: '📦',
        action: `Created ${refType} in`,
        target: repo,
        detail: ref,
        time,
        color: '#50fa7b',
      };
    }
    default:
      return {
        icon: '🔨',
        action: 'Updated repository',
        target: repo,
        detail: 'Activity',
        time,
        color: '#8be9fd',
      };
  }
}

async function renderActivityTimeline(username, token, theme = {}, options = {}) {
  const eventsRaw = options.eventsRaw || options.events || await fetchJson(`https://api.github.com/users/${username}/events/public?per_page=100`, token);
  
  const targetUser = (username || '').toLowerCase();

  // Filter public activity belonging to the target developer's own repositories
  const filteredEvents = Array.isArray(eventsRaw)
    ? eventsRaw.filter((e) => {
        const repoFullName = (e.repo?.name || '').toLowerCase();
        return repoFullName.startsWith(`${targetUser}/`);
      })
    : [];

  // Strictly sort chronological newest-first
  filteredEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Deduplicate by distinct repo first to showcase multi-project activity cleanly
  const distinctEvents = [];
  const seenRepos = new Set();

  for (const e of filteredEvents) {
    const repoName = (e.repo?.name || '').replace(/^[^/]+\//, '').toLowerCase();
    if (!seenRepos.has(repoName)) {
      seenRepos.add(repoName);
      distinctEvents.push(e);
    }
    if (distinctEvents.length >= 5) break;
  }

  // Backfill if less than 5 distinct repos in public activity
  if (distinctEvents.length < 5) {
    const seenEventIds = new Set(distinctEvents.map((e) => e.id));
    for (const e of filteredEvents) {
      if (!seenEventIds.has(e.id)) {
        seenEventIds.add(e.id);
        distinctEvents.push(e);
      }
      if (distinctEvents.length >= 5) break;
    }
    distinctEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const events = distinctEvents.slice(0, 5).map(formatEvent);

  const width = options.width || 467;
  const height = 195;
  const rx = options.borderRadius !== undefined ? options.borderRadius : 8;
  const showBorder = options.showBorder !== false;
  const bg = options.transparent ? 'none' : (theme.bgStart || '#1a1b27');
  const border = showBorder ? (theme.border || '#24283b') : 'none';
  const titleColor = theme.titleColor || '#70a5fd';
  const textColor = theme.textColor || (theme.isLight ? '#1e293b' : '#c0caf5');
  const subtextColor = theme.subtextColor || (theme.isLight ? '#64748b' : '#8b949e');
  const watermarkColor = theme.watermarkColor || (theme.isLight ? '#94a3b8' : '#565f89');

  let itemsSvg = '';
  events.forEach((item, idx) => {
    const y = 50 + idx * 26;
    itemsSvg += `
      <g transform="translate(24, ${y})">
        <text x="0" y="12" font-size="12">${item.icon}</text>
        <text x="22" y="12" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12">
          ${item.action} <tspan fill="${item.color}" font-weight="600">${item.target}</tspan>
        </text>
        <text x="${width - 48}" y="12" text-anchor="end" fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11">
          ${item.time}
        </text>
      </g>`;
  });

  if (events.length === 0) {
    itemsSvg = `
      <text x="${width / 2}" y="110" text-anchor="middle" fill="${subtextColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13">
        No recent public events found.
      </text>`;
  }

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="1.5" />
  
  <!-- Header -->
  <g transform="translate(24, 30)">
    <text fill="${titleColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
      ⚡ Recent GitHub Activity • @${username}
    </text>
  </g>

  ${itemsSvg}

  <!-- Personal Branding Watermark -->
  <a href="https://github.com/Tharun4743/github-profile-visualizer" target="_blank">
    <text x="${width - 24}" y="${height - 12}" text-anchor="end" fill="${watermarkColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" opacity="0.85">⚡ by @Tharun4743</text>
  </a>
</svg>`;
}

module.exports = { renderActivityTimeline };
