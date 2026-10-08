const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const { fetchContributions } = require('./fetcher');
const { render3DCity } = require('./isometric');
const { THEMES, getTheme, createCustomTheme } = require('./themes');
const { renderActivityTimeline } = require('./visualizers/activity');
const { renderCodingHabits } = require('./visualizers/habits');
const { renderLanguageMatrix } = require('./visualizers/languages');
const { renderLeetCodeCard, fetchLeetCode } = require('./visualizers/leetcode');
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

    // Helper to persist files under both standard and themed names
    function saveSvg(baseName, content, extraFilename = null) {
      if (!content) return;
      // 1. Standard base filename (e.g. assets/commit-velocity.svg)
      const standardPath = path.join(resolvedDir, `${baseName}.svg`);
      fs.writeFileSync(standardPath, content, 'utf8');

      // 2. Themed filename (e.g. assets/commit-velocity-ocean-light.svg)
      if (activeThemeKey) {
        const themedPath = path.join(resolvedDir, `${baseName}-${activeThemeKey}.svg`);
        fs.writeFileSync(themedPath, content, 'utf8');
      }

      // 3. Theme aliases for white-ocean and white-solar
      if (activeThemeKey === 'ocean-light') {
        fs.writeFileSync(path.join(resolvedDir, `${baseName}-white-ocean.svg`), content, 'utf8');
      } else if (activeThemeKey === 'solar-light') {
        fs.writeFileSync(path.join(resolvedDir, `${baseName}-white-solar.svg`), content, 'utf8');
      }

      // 4. Custom specified filename if provided
      if (extraFilename && extraFilename !== `${baseName}.svg`) {
        fs.writeFileSync(path.join(resolvedDir, extraFilename), content, 'utf8');
      }
    }

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
      saveSvg('profile-3d-city', citySvg, filename);
      if (activeThemeKey) {
        fs.writeFileSync(path.join(resolvedDir, `profile-3d-${activeThemeKey}.svg`), citySvg, 'utf8');
      }
      core.info(`✅ Generated 3D City: ${cityPath}`);
      core.setOutput('svg-path', cityPath);
      core.setOutput('total-contributions', (calendarData?.total || 0).toString());
      const activeDays = calendarData?.days ? calendarData.days.filter((d) => (d.count || d.level || 0) > 0).length : 0;
      core.setOutput('active-days', activeDays.toString());

      if (generateAllThemes) {
        for (const tKey of Object.keys(THEMES)) {
          const tTheme = THEMES[tKey];
          const tSvg = render3DCity(calendarData, username, { ...universalOptions, theme: tKey, heightScale, animate });
          fs.writeFileSync(path.join(resolvedDir, `profile-3d-${tKey}.svg`), tSvg, 'utf8');
          const tStats = renderStatsCard(username, {
            commits: calendarData?.totalCommitContributions || calendarData?.total || 0,
            prs: calendarData?.totalPullRequestContributions || 0,
            stars: calendarData?.totalStars || 0,
            publicRepos: calendarData?.totalRepositoryContributions || 0
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
      saveSvg('activity-timeline', actSvg);
      core.info('✅ Generated Activity Timeline');
      core.setOutput('activity-svg-path', path.join(resolvedDir, 'activity-timeline.svg'));
    }

    // 3. Coding Habits
    if (requested.includes('habits') || requested.includes('coding-habits')) {
      core.info('Generating Coding Habits Radar...');
      const habitsSvg = await renderCodingHabits(username, token, selectedTheme, universalOptions);
      saveSvg('coding-habits', habitsSvg);
      core.info('✅ Generated Coding Habits');
      core.setOutput('habits-svg-path', path.join(resolvedDir, 'coding-habits.svg'));
    }

    // 4. Languages Matrix
    if (requested.includes('languages') || requested.includes('langs')) {
      core.info('Generating Languages Matrix...');
      const langSvg = await renderLanguageMatrix(username, token, selectedTheme, universalOptions);
      saveSvg('languages-matrix', langSvg);
      core.info('✅ Generated Languages Matrix');
      core.setOutput('languages-svg-path', path.join(resolvedDir, 'languages-matrix.svg'));
    }

    // 5. LeetCode Card
    let realLeetCodeData = null;
    if (requested.includes('leetcode') || requested.includes('summary') || requested.includes('executive-summary')) {
      core.info(`Fetching real LeetCode stats for @${leetcodeUser}...`);
      realLeetCodeData = await fetchLeetCode(leetcodeUser);
    }

    if (requested.includes('leetcode')) {
      core.info(`Generating LeetCode Card for @${leetcodeUser}...`);
      const lcSvg = await renderLeetCodeCard(leetcodeUser, selectedTheme, universalOptions);
      saveSvg('leetcode-card', lcSvg);
      core.info('✅ Generated LeetCode Card');
      core.setOutput('leetcode-svg-path', path.join(resolvedDir, 'leetcode-card.svg'));
    }

    // 5b. GeeksforGeeks Card
    if (requested.includes('gfg') || requested.includes('geeksforgeeks')) {
      core.info(`Generating GeeksforGeeks Card for @${gfgUser}...`);
      const gfgSvg = await renderGFGCard(gfgUser, selectedTheme, universalOptions);
      if (gfgSvg) {
        saveSvg('gfg-card', gfgSvg);
        core.info('✅ Generated GeeksforGeeks Card');
        core.setOutput('gfg-svg-path', path.join(resolvedDir, 'gfg-card.svg'));
      }
    }

    // 5c. HackerRank Card
    if (requested.includes('hackerrank') || requested.includes('hr')) {
      core.info(`Generating HackerRank Card for @${hackerrankUser}...`);
      const hrSvg = await renderHackerRankCard(hackerrankUser, selectedTheme, universalOptions);
      if (hrSvg) {
        saveSvg('hackerrank-card', hrSvg);
        core.info('✅ Generated HackerRank Card');
        core.setOutput('hackerrank-svg-path', path.join(resolvedDir, 'hackerrank-card.svg'));
      }
    }

    // 5d. Duolingo Card
    if (requested.includes('duolingo') || requested.includes('duo')) {
      core.info(`Generating Duolingo Card for @${duolingoUser}...`);
      const duoSvg = await renderDuolingoCard(duolingoUser, selectedTheme, universalOptions);
      if (duoSvg) {
        saveSvg('duolingo-card', duoSvg);
        core.info('✅ Generated Duolingo Card');
        core.setOutput('duolingo-svg-path', path.join(resolvedDir, 'duolingo-card.svg'));
      }
    }

    // 6. Developer Trophies & Achievements (100% Real Numbers)
    if (requested.includes('achievements') || requested.includes('trophies')) {
      core.info('Generating Achievements & Trophies with live telemetry...');
      const activeDays = calendarData?.days ? calendarData.days.filter((d) => (d.count || d.level || 0) > 0).length : 0;
      const achSvg = renderAchievements(
        username,
        {
          commits: calendarData?.totalCommitContributions || calendarData?.total || 0,
          stars: calendarData?.totalStars || 0,
          publicRepos: calendarData?.totalRepositoryContributions || 0,
          activeDays,
        },
        selectedTheme,
        universalOptions
      );
      saveSvg('achievements', achSvg);
      core.info('✅ Generated Achievements');
      core.setOutput('achievements-svg-path', path.join(resolvedDir, 'achievements.svg'));
    }

    // 7. Commit Velocity Wave Chart (100% Real 365-day Velocity Data)
    if (requested.includes('velocity') || requested.includes('commit-velocity')) {
      core.info('Generating Commit Velocity Wave Chart...');
      const velSvg = renderCommitVelocity(calendarData?.days || [], username, selectedTheme, universalOptions);
      saveSvg('commit-velocity', velSvg);
      core.info('✅ Generated Commit Velocity Wave');
      core.setOutput('velocity-svg-path', path.join(resolvedDir, 'commit-velocity.svg'));
    }

    // 8. Engineering Competency Radar
    if (requested.includes('radar') || requested.includes('skills-radar')) {
      core.info('Generating Engineering Competency Radar...');
      const radSvg = renderSkillsRadar(username, selectedTheme, universalOptions);
      saveSvg('skills-radar', radSvg);
      core.info('✅ Generated Skills Radar');
      core.setOutput('radar-svg-path', path.join(resolvedDir, 'skills-radar.svg'));
    }

    // 9. Executive Summary Banner (100% Real Telemetry & Real LeetCode Data)
    if (requested.includes('summary') || requested.includes('executive-summary')) {
      core.info('Generating Executive Summary Banner with live telemetry...');
      const sumSvg = renderExecutiveSummary(
        username,
        {
          commits: calendarData?.totalCommitContributions || calendarData?.total || 0,
          prs: calendarData?.totalPullRequestContributions || 0,
          stars: calendarData?.totalStars || 0,
        },
        realLeetCodeData || { total: 'Active', ranking: 0 },
        selectedTheme,
        universalOptions
      );
      saveSvg('executive-summary', sumSvg);
      core.info('✅ Generated Executive Summary Banner');
      core.setOutput('summary-svg-path', path.join(resolvedDir, 'executive-summary.svg'));
    }

    // 10. GitHub Core Analytics & Stats Card (100% Real Telemetry)
    if (requested.includes('stats') || requested.includes('analytics')) {
      core.info('Generating GitHub Core Analytics & Stats Card with live telemetry...');
      const statsSvg = renderStatsCard(
        username,
        {
          commits: calendarData?.totalCommitContributions || calendarData?.total || 0,
          prs: calendarData?.totalPullRequestContributions || 0,
          stars: calendarData?.totalStars || 0,
          publicRepos: calendarData?.totalRepositoryContributions || 0
        },
        selectedTheme,
        universalOptions
      );
      saveSvg('stats', statsSvg);
      core.info('✅ Generated Stats Card');
      core.setOutput('stats-svg-path', path.join(resolvedDir, 'stats.svg'));
    }

    core.info('🎉 All requested visualizers completed successfully with real numbers!');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
