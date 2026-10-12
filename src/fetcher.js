const https = require('https');

const LANG_COLORS = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Dart: '#00B4AB',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Shell: '#89e051',
  Vue: '#41b883',
  React: '#61dafb',
  other: '#444444',
};

function fetchLifetimeCommits(username, token) {
  return new Promise((resolve) => {
    const headers = { 'User-Agent': 'github-profile-visualizer' };
    if (token) headers['Authorization'] = token.startsWith('ghp_') ? `token ${token}` : `Bearer ${token}`;

    const req = https.get(
      {
        hostname: 'api.github.com',
        path: `/search/commits?q=author:${username}`,
        headers,
        timeout: 8000,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            if (data && typeof data.total_count === 'number' && data.total_count > 0) {
              return resolve(data.total_count);
            }
          } catch (e) {}
          resolve(null);
        });
      }
    );
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
  });
}

/**
 * Fetches daily contribution history and rich profile telemetry for a given GitHub username.
 * Supports year selection, GitHub GraphQL API with token, and public scraper fallback.
 */
async function fetchContributions(username, token, year = 'last-year') {
  let result = null;
  if (token) {
    try {
      const data = await fetchFromGraphQL(username, token, year);
      if (data && data.days && data.days.length > 0) result = data;
    } catch (err) {
      console.warn('GraphQL fetch warning:', err.message, 'Falling back to public scraper...');
    }
  }
  if (!result) {
    result = await fetchFromPublic(username, year);
  }

  const lifetime = await fetchLifetimeCommits(username, token);
  result.lifetimeCommits = lifetime || result.totalCommitContributions || result.total || 0;
  return result;
}

function fetchFromGraphQL(username, token, year) {
  return new Promise((resolve, reject) => {
    let dateArgs = '';
    if (year && year !== 'last-year') {
      const y = parseInt(year, 10);
      if (!isNaN(y)) {
        dateArgs = `from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z"`;
      }
    }

    const query = `
      query($login: String!) {
        user(login: $login) {
          contributionsCollection(${dateArgs}) {
            contributionCalendar {
              isHalloween
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                }
              }
            }
            totalCommitContributions
            totalIssueContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            totalRepositoryContributions
            commitContributionsByRepository(maxRepositories: 100) {
              contributions {
                totalCount
              }
              repository {
                primaryLanguage {
                  name
                  color
                }
              }
            }
          }
          repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
            nodes {
              forkCount
              stargazerCount
            }
          }
        }
      }
    `;

    const body = JSON.stringify({ query, variables: { login: username } });
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: '/graphql',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'github-profile-visualizer',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            if (parsed.errors && parsed.errors.length) {
              return reject(new Error(parsed.errors[0].message));
            }
            const user = parsed.data?.user;
            if (!user) return reject(new Error('User not found'));

            const collection = user.contributionsCollection;
            const calendar = collection?.contributionCalendar;
            if (!calendar) return reject(new Error('Calendar not found'));

            const levelMap = {
              NONE: 0,
              FIRST_QUARTILE: 1,
              SECOND_QUARTILE: 2,
              THIRD_QUARTILE: 3,
              FOURTH_QUARTILE: 4,
            };

            const days = [];
            for (const week of calendar.weeks) {
              for (const day of week.contributionDays) {
                days.push({
                  date: day.date,
                  count: day.contributionCount,
                  level: levelMap[day.contributionLevel] ?? (day.contributionCount > 0 ? 1 : 0),
                });
              }
            }

            days.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Aggregate languages
            const langMap = {};
            if (collection.commitContributionsByRepository) {
              collection.commitContributionsByRepository.forEach((repo) => {
                if (repo.repository && repo.repository.primaryLanguage) {
                  const name = repo.repository.primaryLanguage.name;
                  const color = repo.repository.primaryLanguage.color || LANG_COLORS[name] || '#444444';
                  const count = repo.contributions?.totalCount || 0;
                  if (!langMap[name]) {
                    langMap[name] = { language: name, color, contributions: 0 };
                  }
                  langMap[name].contributions += count;
                }
              });
            }
            const languages = Object.values(langMap).sort((a, b) => b.contributions - a.contributions);

            // Aggregate stars & forks
            let totalStars = 0;
            let totalForks = 0;
            if (user.repositories?.nodes) {
              user.repositories.nodes.forEach((node) => {
                totalStars += node.stargazerCount || 0;
                totalForks += node.forkCount || 0;
              });
            }

            resolve({
              days,
              total: calendar.totalContributions,
              isHalloween: calendar.isHalloween || false,
              totalCommitContributions: collection.totalCommitContributions || calendar.totalContributions,
              totalIssueContributions: collection.totalIssueContributions || 0,
              totalPullRequestContributions: collection.totalPullRequestContributions || 0,
              totalPullRequestReviewContributions: collection.totalPullRequestReviewContributions || 0,
              totalRepositoryContributions: collection.totalRepositoryContributions || 0,
              languages,
              totalStars,
              totalForks,
            });
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function fetchPublicRepos(username) {
  return new Promise((resolve) => {
    https.get(
      {
        hostname: 'api.github.com',
        path: `/users/${username}/repos?per_page=100`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              let totalStars = 0;
              let totalForks = 0;
              const langCount = {};
              list.forEach((r) => {
                totalStars += r.stargazers_count || 0;
                totalForks += r.forks_count || 0;
                if (r.language) {
                  langCount[r.language] = (langCount[r.language] || 0) + 1;
                }
              });
              const languages = Object.entries(langCount)
                .map(([name, count]) => ({
                  language: name,
                  color: LANG_COLORS[name] || '#444444',
                  contributions: count,
                }))
                .sort((a, b) => b.contributions - a.contributions);
              resolve({ totalStars, totalForks, languages, repoCount: list.length });
              return;
            }
          } catch (e) {
            // ignore
          }
          resolve({ totalStars: 0, totalForks: 0, languages: [], repoCount: 0 });
        });
      }
    ).on('error', () => resolve({ totalStars: 0, totalForks: 0, languages: [], repoCount: 0 }));
  });
}

function fetchFromPublic(username, year) {
  return new Promise((resolve, reject) => {
    let path = `/users/${username}/contributions`;
    if (year && year !== 'last-year') {
      const y = parseInt(year, 10);
      if (!isNaN(y)) {
        path += `?from=${y}-12-01&to=${y}-12-31`;
      }
    }

    https.get(
      {
        hostname: 'github.com',
        path,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      },
      async (res) => {
        let html = '';
        res.on('data', (chunk) => (html += chunk));
        res.on('end', async () => {
          const days = [];
          let total = 0;
          const regex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*?data-level="(\d+)"/g;
          let match;
          while ((match = regex.exec(html)) !== null) {
            const level = parseInt(match[2], 10);
            days.push({
              date: match[1],
              count: level === 0 ? 0 : Math.max(1, level * 2),
              level,
            });
          }

          const totalMatch = html.match(/([\d,]+)\s+contributions/i);
          if (totalMatch) {
            total = parseInt(totalMatch[1].replace(/,/g, ''), 10);
          } else {
            total = days.reduce((sum, d) => sum + (d.count || 0), 0);
          }

          days.sort((a, b) => new Date(a.date) - new Date(b.date));

          const repoData = await fetchPublicRepos(username);

          resolve({
            days,
            total,
            isHalloween: false,
            totalCommitContributions: total,
            totalIssueContributions: 0,
            totalPullRequestContributions: 0,
            totalPullRequestReviewContributions: 0,
            totalRepositoryContributions: repoData.repoCount,
            languages: repoData.languages,
            totalStars: repoData.totalStars,
            totalForks: repoData.totalForks,
          });
        });
      }
    ).on('error', reject);
  });
}

module.exports = { fetchContributions, fetchLifetimeCommits };
