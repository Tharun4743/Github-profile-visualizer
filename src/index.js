const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const { fetchContributions } = require('./fetcher');
const { render3DCity } = require('./isometric');
const { THEMES, getTheme, createCustomTheme } = require('./themes');
const { renderActivityTimeline } = require('./visualizers/activity');
const { renderCodingHabits } = require('./visualizers/habits');
const { renderLanguageMatrix } = require('./visualizers/languages');
const { renderLeetCodeCard } = require('./visualizers/leetcode');
const { renderAchievements } = require('./visualizers/achievements');
const { renderCommitVelocity } = require('./visualizers/velocity');
const { renderSkillsRadar } = require('./visualizers/radar');
const { renderExecutiveSummary } = require('./visualizers/summary');
const { renderGFGCard } = require('./visualizers/gfg');
const { renderHackerRankCard } = require('./visualizers/hackerrank');
const { renderDuolingoCard } = require('./visualizers/duolingo');
const { renderStatsCard } = require('./visualizers/stats');

async function run() {
  try {
    const username = core.getInput('username') || process.env.GITHUB_REPOSITORY_OWNER;
    const token = core.getInput('token') || process.env.GITHUB_TOKEN;
    const themeKey = (core.getInput('theme') || 'pearl-neon').toLowerCase();
    const visualizersInput = (core.getInput('visualizers') || 'all').toLowerCase();
    const customColors = core.getInput('custom-colors');
    const customBg = core.getInput('custom-bg');
    const title = core.getInput('title');
    const hideHeader = core.getInput('hide-header') === 'true';
    const hideLegend = core.getInput('hide-legend') === 'true';
    const animate = core.getInput('animate') !== 'false';
    const heightScale = parseFloat(core.getInput('height-scale') || '1.0');
    const transparent = core.getInput('transparent') === 'true';
    const borderRadius = core.getInput('border-radius') !== '' ? parseInt(core.getInput('border-radius'), 10) : undefined;
    const showBorder = core.getInput('show-border') !== 'false';
    const year = core.getInput('year') || 'last-year';
    const outputDir = core.getInput('output-dir') || 'assets';
    const filename = core.getInput('filename') || 'profile-3d-city.svg';
    const generateAllThemes = core.getInput('generate-all') === 'true';
    const leetcodeUser = core.getInput('leetcode-username') || username;
    const gfgUser = core.getInput('gfg-username') || core.getInput('gfg_username') || username;
    const hackerrankUser = core.getInput('hackerrank-username') || core.getInput('hackerrank_username') || username;
    const duolingoUser = core.getInput('duolingo-username') || core.getInput('duolingo_username') || username;
    const excludeRepos = core.getInput('exclude-repos') || core.getInput('ignored-repos') || '';

    if (!username) {
      throw new Error('Username is required. Specify input "username" or set GITHUB_REPOSITORY_OWNER.');
    }

    const resolvedDir = path.resolve(process.cwd(), outputDir);
    if (!fs.existsSync(resolvedDir)) {
      fs.mkdirSync(resolvedDir, { recursive: true });
    }

    const allVisualizers = ['3d-city', 'activity', 'habits', 'languages', 'leetcode', 'gfg', 'hackerrank', 'duolingo', 'achievements', 'velocity', 'radar', 'summary', 'stats'];
    const requested = visualizersInput === 'all'
      ? allVisualizers
      : visualizersInput.split(',').map((v) => v.trim());

    core.info(`🏙️ Generating Visualizer Suite for @${username}...`);
    core.info(`📋 Requested Visualizers: ${requested.join(', ')}`);

    const themeKeys = Object.keys(THEMES);
    let activeThemeKey = themeKey;
    if (themeKey === 'random' || themeKey === 'auto' || themeKey === 'rotate') {
      activeThemeKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
      core.info(`🎲 Dynamic Theme Engine: Selected "${activeThemeKey}" theme for this run.`);
    }

    const radarSkills = core.getInput('radar-skills');
    let selectedTheme = getTheme(activeThemeKey);
    if (customColors) {
      selectedTheme = createCustomTheme(customColors, customBg || selectedTheme.bgStart);
    }

    const universalOptions = {
      theme: activeThemeKey,
      customColors,
      customBg,
      transparent,
      borderRadius,
      showBorder,
      skills: radarSkills,
      excludeRepos,
    };

    let calendarData = null;
    const needCalendar = requested.some((r) => ['3d-city', 'city', 'velocity', 'achievements', 'summary', 'stats', 'analytics'].includes(r));
    if (needCalendar) {
      calendarData = await fetchContributions(username, token, year);
    }

    // 1. 3D City
    if (requested.includes('3d-city') || requested.includes('city')) {
      core.info(`Generating 3D Contribution City (${year})...`);
      const citySvg = render3DCity(calendarData, username, {
        ...universalOptions,
        title,
        hideHeader,
        hideLegend,
        animate,
        heightScale,
      });
      const cityPath = path.join(resolvedDir, filename);
      fs.writeFileSync(cityPath, citySvg, 'utf8');
      core.info(`✅ Generated: ${cityPath}`);
      core.setOutput('svg-path', cityPath);
      core.setOutput('total-contributions', calendarData.total.toString());
      const activeDays = calendarData.days.filter((d) => (d.level || 0) > 0).length;
      core.setOutput('active-days', activeDays.toString());

      if (generateAllThemes) {
        for (const tKey of Object.keys(THEMES)) {
          const tTheme = THEMES[tKey];
          const tSvg = render3DCity(calendarData, username, { ...universalOptions, theme: tKey, heightScale, animate });
          fs.writeFileSync(path.join(resolvedDir, `profile-3d-${tKey}.svg`), tSvg, 'utf8');
          const tStats = renderStatsCard(username, {
            commits: calendarData?.totalCommitContributions || calendarData?.total || 3113,
            prs: calendarData?.totalPullRequestContributions || 15,
            stars: calendarData?.totalStars || 8,
            publicRepos: calendarData?.totalRepositoryContributions || 28
          }, tTheme, universalOptions);
          fs.writeFileSync(path.join(resolvedDir, `stats-${tKey}.svg`), tStats, 'utf8');
        }
        // Yoshi389111 compatibility aliases
        fs.writeFileSync(path.join(resolvedDir, 'profile-night-view.svg'), render3DCity(calendarData, username, { ...universalOptions, theme: 'night-view', animate }), 'utf8');
        fs.writeFileSync(path.join(resolvedDir, 'profile-night-rainbow.svg'), render3DCity(calendarData, username, { ...universalOptions, theme: 'night-rainbow', animate }), 'utf8');
        fs.writeFileSync(path.join(resolvedDir, 'profile-green-animate.svg'), render3DCity(calendarData, username, { ...universalOptions, theme: 'night-green', animate }), 'utf8');
      }
    }

    // 2. Activity Timeline
    if (requested.includes('activity') || requested.includes('activity-timeline')) {
      core.info('Generating Recent Activity Timeline...');
      const actSvg = await renderActivityTimeline(username, token, selectedTheme, universalOptions);
      const actPath = path.join(resolvedDir, 'activity-timeline.svg');
      fs.writeFileSync(actPath, actSvg, 'utf8');
      core.info(`✅ Generated: ${actPath}`);
      core.setOutput('activity-svg-path', actPath);
    }

    // 3. Coding Habits
    if (requested.includes('habits') || requested.includes('coding-habits')) {
      core.info('Generating Coding Habits Radar...');
      const habitsSvg = await renderCodingHabits(username, token, selectedTheme, universalOptions);
      const habitsPath = path.join(resolvedDir, 'coding-habits.svg');
      fs.writeFileSync(habitsPath, habitsSvg, 'utf8');
      core.info(`✅ Generated: ${habitsPath}`);
      core.setOutput('habits-svg-path', habitsPath);
    }

    // 4. Languages Matrix
    if (requested.includes('languages') || requested.includes('langs')) {
      core.info('Generating Languages Matrix...');
      const langSvg = await renderLanguageMatrix(username, token, selectedTheme, universalOptions);
      const langPath = path.join(resolvedDir, 'languages-matrix.svg');
      fs.writeFileSync(langPath, langSvg, 'utf8');
      core.info(`✅ Generated: ${langPath}`);
      core.setOutput('languages-svg-path', langPath);
    }

    // 5. LeetCode Card
    if (requested.includes('leetcode')) {
      core.info(`Generating LeetCode Card for @${leetcodeUser}...`);
      const lcSvg = await renderLeetCodeCard(leetcodeUser, selectedTheme, universalOptions);
      const lcPath = path.join(resolvedDir, 'leetcode-card.svg');
      fs.writeFileSync(lcPath, lcSvg, 'utf8');
      core.info(`✅ Generated: ${lcPath}`);
      core.setOutput('leetcode-svg-path', lcPath);
    }

    // 5b. GeeksforGeeks Card
    if (requested.includes('gfg') || requested.includes('geeksforgeeks')) {
      core.info(`Generating GeeksforGeeks Card for @${gfgUser}...`);
      const gfgSvg = await renderGFGCard(gfgUser, selectedTheme, universalOptions);
      if (gfgSvg) {
        const gfgPath = path.join(resolvedDir, 'gfg-card.svg');
        fs.writeFileSync(gfgPath, gfgSvg, 'utf8');
        core.info(`✅ Generated: ${gfgPath}`);
        core.setOutput('gfg-svg-path', gfgPath);
      }
    }

    // 5c. HackerRank Card
    if (requested.includes('hackerrank') || requested.includes('hr')) {
      core.info(`Generating HackerRank Card for @${hackerrankUser}...`);
      const hrSvg = await renderHackerRankCard(hackerrankUser, selectedTheme, universalOptions);
      if (hrSvg) {
        const hrPath = path.join(resolvedDir, 'hackerrank-card.svg');
        fs.writeFileSync(hrPath, hrSvg, 'utf8');
        core.info(`✅ Generated: ${hrPath}`);
        core.setOutput('hackerrank-svg-path', hrPath);
      }
    }

    // 5d. Duolingo Card
    if (requested.includes('duolingo') || requested.includes('duo')) {
      core.info(`Generating Duolingo Card for @${duolingoUser}...`);
      const duoSvg = await renderDuolingoCard(duolingoUser, selectedTheme, universalOptions);
      if (duoSvg) {
        const duoPath = path.join(resolvedDir, 'duolingo-card.svg');
        fs.writeFileSync(duoPath, duoSvg, 'utf8');
        core.info(`✅ Generated: ${duoPath}`);
        core.setOutput('duolingo-svg-path', duoPath);
      }
    }

    // 6. Developer Trophies & Achievements
    if (requested.includes('achievements') || requested.includes('trophies')) {
      core.info('Generating Achievements & Trophies...');
      const activeDays = calendarData?.days ? calendarData.days.filter((d) => (d.level || 0) > 0).length : 190;
      const achSvg = renderAchievements(
        username,
        { commits: calendarData?.total || 2480, activeDays },
        selectedTheme,
        universalOptions
      );
      const achPath = path.join(resolvedDir, 'achievements.svg');
      fs.writeFileSync(achPath, achSvg, 'utf8');
      core.info(`✅ Generated: ${achPath}`);
      core.setOutput('achievements-svg-path', achPath);
    }

    // 7. Commit Velocity Wave Chart
    if (requested.includes('velocity') || requested.includes('commit-velocity')) {
      core.info('Generating Commit Velocity Wave Chart...');
      const velSvg = renderCommitVelocity(calendarData?.days || [], username, selectedTheme, universalOptions);
      const velPath = path.join(resolvedDir, 'commit-velocity.svg');
      fs.writeFileSync(velPath, velSvg, 'utf8');
      core.info(`✅ Generated: ${velPath}`);
      core.setOutput('velocity-svg-path', velPath);
    }

    // 8. Engineering Competency Radar
    if (requested.includes('radar') || requested.includes('skills-radar')) {
      core.info('Generating Engineering Competency Radar...');
      const radSvg = renderSkillsRadar(username, selectedTheme, universalOptions);
      const radPath = path.join(resolvedDir, 'skills-radar.svg');
      fs.writeFileSync(radPath, radSvg, 'utf8');
      core.info(`✅ Generated: ${radPath}`);
      core.setOutput('radar-svg-path', radPath);
    }

    // 9. Executive Summary Banner
    if (requested.includes('summary') || requested.includes('executive-summary')) {
      core.info('Generating Executive Summary Banner...');
      const sumSvg = renderExecutiveSummary(
        username,
        { commits: calendarData?.total || 2480, prs: 12, stars: 5 },
        { total: 'Active', ranking: 340000 },
        selectedTheme,
        universalOptions
      );
      const sumPath = path.join(resolvedDir, 'executive-summary.svg');
      fs.writeFileSync(sumPath, sumSvg, 'utf8');
      core.info(`✅ Generated: ${sumPath}`);
      core.setOutput('summary-svg-path', sumPath);
    }

    // 10. GitHub Core Analytics & Stats Card
    if (requested.includes('stats') || requested.includes('analytics')) {
      core.info('Generating GitHub Core Analytics & Stats Card...');
      const statsSvg = renderStatsCard(
        username,
        {
          commits: calendarData?.totalCommitContributions || calendarData?.total || 3113,
          prs: calendarData?.totalPullRequestContributions || 15,
          stars: calendarData?.totalStars || 8,
          publicRepos: calendarData?.totalRepositoryContributions || 28
        },
        selectedTheme,
        universalOptions
      );
      const statsPath = path.join(resolvedDir, 'stats.svg');
      fs.writeFileSync(statsPath, statsSvg, 'utf8');
      core.info(`✅ Generated: ${statsPath}`);
      core.setOutput('stats-svg-path', statsPath);
    }

    core.info('🎉 All requested visualizers completed successfully!');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
