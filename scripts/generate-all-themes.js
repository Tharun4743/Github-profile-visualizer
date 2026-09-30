const fs = require('fs');
const path = require('path');
const { fetchContributions } = require('../src/fetcher');
const { render3DCity } = require('../src/isometric');
const { THEMES } = require('../src/themes');
const { renderActivityTimeline } = require('../src/visualizers/activity');
const { renderCodingHabits } = require('../src/visualizers/habits');
const { renderLanguageMatrix } = require('../src/visualizers/languages');
const { renderLeetCodeCard } = require('../src/visualizers/leetcode');
const { renderAchievements } = require('../src/visualizers/achievements');
const { renderCommitVelocity } = require('../src/visualizers/velocity');
const { renderSkillsRadar } = require('../src/visualizers/radar');
const { renderExecutiveSummary } = require('../src/visualizers/summary');
const { renderGFGCard } = require('../src/visualizers/gfg');
const { renderHackerRankCard } = require('../src/visualizers/hackerrank');
const { renderDuolingoCard } = require('../src/visualizers/duolingo');

const USERNAME = 'Tharun4743';
const LC_USER = 'Tharunkumar__K';
const DUO_USER = 'Tharunkumar4743';
const GFG_USER = 'Tharun4743';
const HR_USER = 'Tharun4743';

const THEME_LIST = ['cyberpunk', 'emerald', 'pearl-neon'];

const DIRS = [
  path.resolve(__dirname, '../examples'),
  path.resolve(__dirname, '../assets'),
  path.resolve(__dirname, '../../Tharun4743/assets')
];

DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function run() {
  console.log('🚀 Generating Full Multi-Theme Suite (Cyberpunk, Emerald, Pearl-Neon)...');
  const token = process.env.GITHUB_TOKEN || '';
  const calendarData = await fetchContributions(USERNAME, token, 'last-year');

  for (const themeKey of THEME_LIST) {
    console.log(`\n🎨 Rendering Theme: [${themeKey}]...`);
    const theme = THEMES[themeKey] || THEMES.cyberpunk;
    const universalOpts = { theme: themeKey };

    // 1. 3D City
    const citySvg = render3DCity(calendarData, USERNAME, universalOpts);
    
    // 2. Activity Timeline
    const actSvg = await renderActivityTimeline(USERNAME, token, theme, universalOpts);

    // 3. Coding Habits
    const habitsSvg = await renderCodingHabits(USERNAME, token, theme, universalOpts);

    // 4. Languages Matrix
    const langSvg = await renderLanguageMatrix(USERNAME, token, theme, universalOpts);

    // 5. LeetCode Card
    const lcSvg = await renderLeetCodeCard(LC_USER, theme, universalOpts);

    // 6. GFG Card
    const gfgSvg = await renderGFGCard(GFG_USER, theme, universalOpts);

    // 7. HackerRank Card
    const hrSvg = await renderHackerRankCard(HR_USER, theme, universalOpts);

    // 8. Duolingo Card
    const duoSvg = await renderDuolingoCard(DUO_USER, theme, universalOpts);

    // 9. Achievements
    const achSvg = renderAchievements(USERNAME, {
      commits: calendarData.totalCommitContributions || calendarData.total,
      stars: calendarData.totalStars,
      publicRepos: calendarData.totalRepositoryContributions,
      activeDays: calendarData.days.filter(d => d.count > 0).length,
    }, theme, universalOpts);

    // 10. Commit Velocity Wave
    const velSvg = renderCommitVelocity(calendarData.days, theme, universalOpts);

    // 11. Skills Radar
    const radarSvg = renderSkillsRadar(USERNAME, theme, {
      ...universalOpts,
      skills: 'Algorithms:0.94,Full Stack:0.96,Distributed:0.88,System Design:0.90,APIs & DBs:0.95'
    });

    // 12. Executive Summary
    const sumSvg = renderExecutiveSummary(USERNAME, {
      commits: calendarData.totalCommitContributions || calendarData.total,
      prs: calendarData.totalPullRequestContributions || 12,
      stars: calendarData.totalStars || 8,
    }, {
      total: 350,
      ranking: 15420
    }, theme, universalOpts);

    // Write files to all target directories
    const files = {
      [`profile-3d-${themeKey}.svg`]: citySvg,
      [`activity-timeline-${themeKey}.svg`]: actSvg,
      [`coding-habits-${themeKey}.svg`]: habitsSvg,
      [`languages-matrix-${themeKey}.svg`]: langSvg,
      [`leetcode-card-${themeKey}.svg`]: lcSvg,
      [`gfg-card-${themeKey}.svg`]: gfgSvg,
      [`hackerrank-card-${themeKey}.svg`]: hrSvg,
      [`duolingo-card-${themeKey}.svg`]: duoSvg,
      [`achievements-${themeKey}.svg`]: achSvg,
      [`commit-velocity-${themeKey}.svg`]: velSvg,
      [`skills-radar-${themeKey}.svg`]: radarSvg,
      [`executive-summary-${themeKey}.svg`]: sumSvg,
    };

    // If cyberpunk (default primary theme), also save as standard un-suffixed filenames
    if (themeKey === 'cyberpunk') {
      files['profile-3d-city.svg'] = citySvg;
      files['activity-timeline.svg'] = actSvg;
      files['coding-habits.svg'] = habitsSvg;
      files['languages-matrix.svg'] = langSvg;
      files['leetcode-card.svg'] = lcSvg;
      files['gfg-card.svg'] = gfgSvg;
      files['hackerrank-card.svg'] = hrSvg;
      files['duolingo-card.svg'] = duoSvg;
      files['achievements.svg'] = achSvg;
      files['commit-velocity.svg'] = velSvg;
      files['skills-radar.svg'] = radarSvg;
      files['executive-summary.svg'] = sumSvg;
    }

    for (const d of DIRS) {
      for (const [filename, content] of Object.entries(files)) {
        if (content) {
          fs.writeFileSync(path.join(d, filename), content, 'utf8');
        }
      }
    }
    console.log(`✅ Saved all ${Object.keys(files).length} SVGs for theme [${themeKey}]!`);
  }

  console.log('\n🎉 Successfully generated all multi-theme SVGs (Cyberpunk, Emerald, Pearl-Neon) across all repositories!');
}

run().catch(console.error);
