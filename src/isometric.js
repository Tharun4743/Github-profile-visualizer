/**
 * High-Fidelity 3D Isometric Contribution City Engine.
 * Recreates the iconic yoshi389111/github-profile-3d-contrib architecture:
 * - 1280x850 isometric canvas with 3D extruded contribution mesh
 * - Animated 3-second rising blocks
 * - 5-axis activity radar (Commit, Issue, PullReq, Review, Repo)
 * - Animated language breakdown donut pie chart
 * - Stargazer & fork metrics, total contribution counter, and date range
 * - Multi-theme support (night-view, night-rainbow, night-green, cyberpunk, tokyonight, dracula, emerald)
 * - Tharun4743 signature branding
 */

const ANGLE = 30;
const RAD = Math.PI / 180;

function toEpochDays(date) {
  return Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
}

function toIsoDate(date) {
  return date.toISOString().split('T')[0];
}

function formatThousand(num) {
  return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function toScale(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return (num || 0).toString();
}

// Color utility: darker multiplier mimicking d3.rgb.darker
function shadeColor(color, factor) {
  let r = 0, g = 0, b = 0;
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
  } else if (color.startsWith('rgb')) {
    const m = color.match(/\d+/g);
    if (m) {
      r = parseInt(m[0], 10);
      g = parseInt(m[1], 10);
      b = parseInt(m[2], 10);
    }
  }
  r = Math.max(0, Math.min(255, Math.round(r * factor)));
  g = Math.max(0, Math.min(255, Math.round(g * factor)));
  b = Math.max(0, Math.min(255, Math.round(b * factor)));
  return `rgb(${r}, ${g}, ${b})`;
}

// Built-in 3D Themes (Pure White / Light Aesthetic with High-Contrast Luminous Towers)
const THEME_CONFIGS = {
  'pearl-neon': {
    type: 'normal',
    backgroundColor: '#ffffff',
    foregroundColor: '#0f172a',
    strongColor: '#4f46e5',
    weakColor: '#64748b',
    radarColor: '#0284c7',
    levels: [
      '#e2e8f0',
      '#38bdf8',
      '#6366f1',
      '#a855f7',
      '#ec4899',
    ],
  },
  'solar-light': {
    type: 'normal',
    backgroundColor: '#ffffff',
    foregroundColor: '#1e293b',
    strongColor: '#ea580c',
    weakColor: '#78716c',
    radarColor: '#f59e0b',
    levels: [
      '#f1f5f9',
      '#fbbf24',
      '#f97316',
      '#ef4444',
      '#e11d48',
    ],
  },
  'ocean-light': {
    type: 'normal',
    backgroundColor: '#ffffff',
    foregroundColor: '#0f172a',
    strongColor: '#0284c7',
    weakColor: '#64748b',
    radarColor: '#0d9488',
    levels: [
      '#e2e8f0',
      '#2dd4bf',
      '#0ea5e9',
      '#3b82f6',
      '#6366f1',
    ],
  },
  'github-light': {
    type: 'normal',
    backgroundColor: '#ffffff',
    foregroundColor: '#24292f',
    strongColor: '#1a7f37',
    weakColor: '#57606a',
    radarColor: '#2da04b',
    levels: [
      '#ebedf0',
      '#9be9a8',
      '#40c463',
      '#30a14e',
      '#216e39',
    ],
  },
};

// Automatic alias fallback mapping for dark/removed theme configs
const THEME_ALIASES = {
  cyberpunk: 'pearl-neon',
  tokyonight: 'pearl-neon',
  dracula: 'pearl-neon',
  synthwave: 'pearl-neon',
  'night-view': 'pearl-neon',
  'night-rainbow': 'pearl-neon',
  'night-green': 'github-light',
  green: 'github-light',
  emerald: 'github-light',
  matrix: 'ocean-light',
  nord: 'ocean-light',
  monokai: 'solar-light',
  sunset: 'solar-light',
  dark: 'pearl-neon',
  light: 'pearl-neon',
  default: 'pearl-neon',
};

/**
 * Generates CSS rules for the 3D SVG.
 */
function generateCss(themeConfig) {
  const isRainbow = themeConfig.type === 'rainbow';
  let css = `
    * { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Helvetica", Arial, sans-serif; }
    .fill-fg { fill: ${themeConfig.foregroundColor}; }
    .stroke-fg { stroke: ${themeConfig.foregroundColor}; }
    .fill-bg { fill: ${themeConfig.backgroundColor}; }
    .stroke-bg { stroke: ${themeConfig.backgroundColor}; }
    .fill-strong { fill: ${themeConfig.strongColor}; }
    .fill-weak { fill: ${themeConfig.weakColor}; }
    .stroke-weak { stroke: ${themeConfig.weakColor}; }
    .radar {
      stroke-width: 4px;
      stroke: ${themeConfig.radarColor};
      fill: ${themeConfig.radarColor};
      fill-opacity: 0.5;
    }
  `;

  if (!isRainbow) {
    themeConfig.levels.forEach((color, i) => {
      const topColor = color;
      const leftColor = shadeColor(color, 0.836);
      const rightColor = shadeColor(color, 0.7);
      css += `
        .cont-top-${i} { fill: ${topColor}; }
        .cont-left-${i} { fill: ${leftColor}; }
        .cont-right-${i} { fill: ${rightColor}; }
      `;
    });
  } else {
    // Rainbow animation keyframes
    const hues = [0, 60, 120, 180, 240, 300, 360];
    const darkerList = [
      ['top', 1.0],
      ['left', 0.836],
      ['right', 0.7],
    ];

    for (let level = 0; level < themeConfig.contribLightness.length; level++) {
      const lightness = themeConfig.contribLightness[level];
      for (const [faceName, factor] of darkerList) {
        const className = `rb-l${level}-${faceName}`;
        css += `.${className} { animation: ${className} ${themeConfig.duration} linear infinite; }\n`;
        const stops = hues
          .map((hue, i) => {
            const pct = ((i / (hues.length - 1)) * 100).toFixed(2);
            // approximate HSL to darker
            return `${pct}% { fill: hsl(${hue}, ${themeConfig.saturation}, ${lightness}); }`;
          })
          .join(' ');
        css += `@keyframes ${className} { ${stops} }\n`;
      }
    }
  }

  return css;
}

/**
 * Calculates value for 5-axis radar chart.
 */
function toRadarLevel(value) {
  if (value < 1) return 0.8;
  const result = Math.log10(value);
  return Math.min(result, 5) + 1;
}

/**
 * Renders the 5-axis Activity Radar Chart.
 */
function renderRadar(radarX, radarY, radarWidth, radarHeight, telemetry, isAnimate) {
  const levels = 5;
  const rangeLabels = ['1', '10', '100', '1K', '10K'];
  const radius = (radarHeight / 2) * 0.8;
  const cx = radarWidth / 2;
  const cy = (radarHeight / 2) * 1.1;
  const radians = 2 * Math.PI;

  const data = [
    { name: 'Commit', value: telemetry.totalCommitContributions || telemetry.total || 0 },
    { name: 'Issue', value: telemetry.totalIssueContributions || 0 },
    { name: 'PullReq', value: telemetry.totalPullRequestContributions || 0 },
    { name: 'Review', value: telemetry.totalPullRequestReviewContributions || 0 },
    { name: 'Repo', value: telemetry.totalRepositoryContributions || 0 },
  ];
  const total = data.length;

  const posX = (level, num) => (radius * (level / levels) * Math.sin((num / total) * radians)).toFixed(2);
  const posY = (level, num) => (radius * (level / levels) * -Math.cos((num / total) * radians)).toFixed(2);

  let out = `<g transform="translate(${radarX + cx}, ${radarY + cy})">\n`;

  // Grid concentric pentagons
  for (let j = 0; j < levels; j++) {
    for (let i = 0; i < total; i++) {
      const x1 = posX(j + 1, i);
      const y1 = posY(j + 1, i);
      const x2 = posX(j + 1, (i + 1) % total);
      const y2 = posY(j + 1, (i + 1) % total);
      out += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="stroke-weak" style="stroke-dasharray: 4 4; stroke-width: 1px;"></line>\n`;
    }
  }

  // Level numbers
  rangeLabels.forEach((label, i) => {
    out += `  <text x="${(radius / 50).toFixed(2)}" y="${(-radius * ((i + 1) / levels)).toFixed(2)}" style="font-size: ${(radius / 12).toFixed(2)}px;" text-anchor="start" dominant-baseline="auto" class="fill-weak">${label}</text>\n`;
  });

  // Axes lines & labels
  data.forEach((d, i) => {
    const x1 = posX(1, i);
    const y1 = posY(1, i);
    const x2 = posX(levels, i);
    const y2 = posY(levels, i);
    const lx = posX(1.25 * levels, i);
    const ly = posY(1.17 * levels, i);

    out += `  <g class="axis">\n`;
    out += `    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="stroke-weak" style="stroke-dasharray: 4 4; stroke-width: 1px;"></line>\n`;
    out += `    <text x="${lx}" y="${ly}" style="font-size: ${(radius / 7.5).toFixed(2)}px;" text-anchor="middle" dominant-baseline="middle" class="fill-fg">${d.name}<title>${d.value}</title></text>\n`;
    out += `  </g>\n`;
  });

  // Radar Polygon
  const points = data.map((d, i) => `${posX(toRadarLevel(d.value), i)},${posY(toRadarLevel(d.value), i)}`).join(' ');
  const points0 = data.map((d, i) => `${posX(0.8, i)},${posY(0.8, i)}`).join(' ');

  out += `  <polygon class="radar" points="${points}">\n`;
  if (isAnimate) {
    out += `    <animate attributeName="points" values="${points0};${points}" dur="3s" repeatCount="1"></animate>\n`;
  }
  out += `  </polygon>\n`;
  out += `</g>\n`;

  return out;
}

/**
 * Renders the Language Donut Pie Chart with animated arc segments and accurate percentage legend.
 */
function renderLanguageDonut(pieX, pieY, pieWidth, pieHeight, languages, totalCommits, isAnimate) {
  if (!languages || languages.length === 0) return '';

  const totalLangVolume = languages.reduce((sum, l) => sum + (l.contributions || 0), 0) || 1;
  const topLangs = languages.slice(0, 5).map(l => ({ ...l }));
  const topSum = topLangs.reduce((sum, l) => sum + (l.contributions || 0), 0);
  const remaining = totalLangVolume - topSum;
  if (remaining > 0 && languages.length > 5) {
    topLangs.push({ language: 'Other', color: '#94a3b8', contributions: remaining });
  }

  const grandTotal = topLangs.reduce((a, b) => a + (b.contributions || 0), 0) || 1;
  const radius = pieHeight / 2;
  const margin = radius / 10;
  const outerR = radius - margin;
  const innerR = radius / 1.8;
  const row = Math.max(6, topLangs.length + 1);
  const offset = 0.8;
  const fontSize = Math.min(14, pieHeight / row / 1.4);

  let out = `<g transform="translate(${pieX}, ${pieY})">\n`;

  // Background subtle track ring
  out += `  <circle cx="${radius}" cy="${radius}" r="${(outerR + innerR) / 2}" fill="none" stroke="#f1f5f9" stroke-width="${outerR - innerR}"></circle>\n`;

  // Legend markers & labels
  out += `  <g transform="translate(${radius * 2.2}, 0)">\n`;
  topLangs.forEach((lang, i) => {
    const fraction = (lang.contributions || 0) / grandTotal;
    const pct = Math.max(1, Math.round(fraction * 100));
    const y = (i + offset) * (pieHeight / row);

    out += `    <rect x="0" y="${(y - fontSize / 2).toFixed(2)}" width="${fontSize.toFixed(2)}" height="${fontSize.toFixed(2)}" rx="3" fill="${lang.color}" class="stroke-bg" stroke-width="1px">\n`;
    if (isAnimate) {
      out += `      <animate attributeName="fill-opacity" values="0;${(i + 1) * 0.2};1" dur="3s" repeatCount="1"></animate>\n`;
    }
    out += `    </rect>\n`;
    out += `    <text x="${(fontSize * 1.5).toFixed(2)}" y="${y.toFixed(2)}" dominant-baseline="middle" font-size="${fontSize.toFixed(2)}px" font-weight="600" class="fill-fg">${lang.language} <tspan font-weight="400" fill="#64748b" font-size="${(fontSize * 0.9).toFixed(2)}px">${pct}%</tspan>\n`;
    if (isAnimate) {
      out += `      <animate attributeName="fill-opacity" values="0;${(i + 1) * 0.2};1" dur="3s" repeatCount="1"></animate>\n`;
    }
    out += `    </text>\n`;
  });
  out += `  </g>\n`;

  // Donut Arcs
  out += `  <g transform="translate(${radius}, ${radius})">\n`;
  let currentAngle = 0;
  topLangs.forEach((lang) => {
    const fraction = (lang.contributions || 0) / grandTotal;
    const sliceAngle = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    let d = '';
    if (fraction >= 0.999) {
      // Full complete 360-degree annular donut ring
      d = `M 0 ${-outerR} A ${outerR} ${outerR} 0 1 1 0 ${outerR} A ${outerR} ${outerR} 0 1 1 0 ${-outerR} M 0 ${-innerR} A ${innerR} ${innerR} 0 1 0 0 ${innerR} A ${innerR} ${innerR} 0 1 0 0 ${-innerR} Z`;
    } else if (sliceAngle > 0.001) {
      // Annular sector segment
      const x1 = (Math.sin(startAngle) * outerR).toFixed(3);
      const y1 = (-Math.cos(startAngle) * outerR).toFixed(3);
      const x2 = (Math.sin(endAngle) * outerR).toFixed(3);
      const y2 = (-Math.cos(endAngle) * outerR).toFixed(3);
      const x3 = (Math.sin(endAngle) * innerR).toFixed(3);
      const y3 = (-Math.cos(endAngle) * innerR).toFixed(3);
      const x4 = (Math.sin(startAngle) * innerR).toFixed(3);
      const y4 = (-Math.cos(startAngle) * innerR).toFixed(3);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      d = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    }

    if (d) {
      out += `    <path d="${d}" style="fill: ${lang.color};" class="stroke-bg" stroke-width="2px">\n`;
      out += `      <title>${lang.language}: ${Math.round(fraction * 100)}%</title>\n`;
      if (isAnimate) {
        out += `      <animate attributeName="fill-opacity" values="0;0.5;1" dur="3s" repeatCount="1"></animate>\n`;
      }
      out += `    </path>\n`;
    }
  });
  out += `  </g>\n`;
  out += `</g>\n`;

  return out;
}

/**
 * Primary Export: Renders the Full 1280x850 3D Contribution City SVG.
 */
function render3DCity(telemetry, username, options = {}) {
  const days = telemetry.days || [];
  const total = telemetry.total || 0;
  const isAnimate = options.animate !== false;

  // Resolve theme (pure white / light aesthetics with automatic fallback for dark/removed themes)
  const themeInput = (options.theme || 'pearl-neon').toLowerCase().trim();
  let themeConfig = THEME_CONFIGS[themeInput] || THEME_CONFIGS[THEME_ALIASES[themeInput]] || THEME_CONFIGS['pearl-neon'];
  if (options.customColors && options.customColors.length >= 5) {
    themeConfig = {
      type: 'normal',
      backgroundColor: '#ffffff',
      foregroundColor: '#0f172a',
      strongColor: options.customColors[4] || '#4f46e5',
      weakColor: '#64748b',
      radarColor: options.customColors[3] || '#0284c7',
      levels: options.customColors.slice(0, 5),
    };
  }

  const width = 1280;
  const height = 850;

  if (days.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><text x="50%" y="50%" fill="#fff" text-anchor="middle">No Contribution Data Available</text></svg>`;
  }

  // Ensure days are sorted chronologically
  days.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Projection setup
  const firstDate = new Date(days[0].date);
  const firstUTCDay = firstDate.getUTCDay();
  const sundayOfFirstWeek = toEpochDays(firstDate) - firstUTCDay;
  const weekcount = Math.ceil((days.length + firstUTCDay) / 7.0);

  const dx = width / 64; // 20
  const dy = dx * Math.tan(ANGLE * RAD); // 11.547
  const dxx = dx * 0.9; // 18
  const dyy = dy * 0.9; // 10.392

  const offsetX = dx * 7; // 140
  const offsetY = height - (weekcount + 7) * dy;

  const scaleLeft = Math.sqrt(dxx * dxx + dyy * dyy) / dxx; // ≈ 1.1547
  const scaleRight = scaleLeft;

  // Render 3D Cubes
  let cubesSvg = '';
  days.forEach((day) => {
    const curDate = new Date(day.date);
    const week = Math.floor((toEpochDays(curDate) - sundayOfFirstWeek) / 7);
    const dayOfWeek = curDate.getUTCDay();

    const baseX = Math.round(offsetX + (week - dayOfWeek) * dx);
    const baseY = offsetY + (week + dayOfWeek) * dy;
    const calHeight = Math.log10((day.count || 0) / 20 + 1) * 144 + 3;
    const contribLevel = Math.min(4, Math.max(0, day.level || 0));

    const heightLeft = (calHeight / scaleLeft).toFixed(2);
    const heightRight = heightLeft;

    let classTop = `cont-top-${contribLevel}`;
    let classLeft = `cont-left-${contribLevel}`;
    let classRight = `cont-right-${contribLevel}`;
    let styleTop = '', styleLeft = '', styleRight = '';

    if (themeConfig.type === 'rainbow') {
      const offsetHue = week * themeConfig.hueRatio;
      const normalizedHue = ((offsetHue % 360) + 360) % 360;
      const durationSeconds = parseFloat(themeConfig.duration);
      const delaySeconds = (-(normalizedHue / 360) * durationSeconds).toFixed(3);

      classTop = `rb-l${contribLevel}-top`;
      classLeft = `rb-l${contribLevel}-left`;
      classRight = `rb-l${contribLevel}-right`;
      styleTop = ` style="animation-delay:${delaySeconds}s"`;
      styleLeft = ` style="animation-delay:${delaySeconds}s"`;
      styleRight = ` style="animation-delay:${delaySeconds}s"`;
    }

    if (contribLevel === 0) {
      cubesSvg += `<g transform="translate(${baseX} ${(baseY - 3).toFixed(2)})"><rect stroke="none" x="0" y="0" width="${dxx}" height="${dxx}" transform="skewY(-30) skewX(40.89) scale(1 1.15)" class="${classTop}"${styleTop}></rect><rect stroke="none" x="0" y="0" width="${dxx}" height="2.6" transform="skewY(30) scale(1 1.15)" class="${classLeft}"${styleLeft}></rect><rect stroke="none" x="0" y="0" width="${dxx}" height="2.6" transform="translate(${dxx} ${dyy.toFixed(2)}) skewY(-30) scale(1 1.15)" class="${classRight}"${styleRight}></rect></g>`;
    } else {
      cubesSvg += `<g transform="translate(${baseX} ${(baseY - calHeight).toFixed(2)})">`;
      if (isAnimate) {
        cubesSvg += `<animateTransform attributeName="transform" type="translate" values="${baseX} ${(baseY - 3).toFixed(2)};${baseX} ${(baseY - calHeight).toFixed(2)}" dur="3s" repeatCount="1"></animateTransform>`;
      }
      cubesSvg += `<rect stroke="none" x="0" y="0" width="${dxx}" height="${dxx}" transform="skewY(-30) skewX(40.89) scale(1 1.15)" class="${classTop}"${styleTop}></rect>`;
      cubesSvg += `<rect stroke="none" x="0" y="0" width="${dxx}" height="${heightLeft}" transform="skewY(30) scale(1 1.15)" class="${classLeft}"${styleLeft}>`;
      if (isAnimate) {
        cubesSvg += `<animate attributeName="height" values="2.6;${heightLeft}" dur="3s" repeatCount="1"></animate>`;
      }
      cubesSvg += `</rect>`;
      cubesSvg += `<rect stroke="none" x="0" y="0" width="${dxx}" height="${heightRight}" transform="translate(${dxx} ${dyy.toFixed(2)}) skewY(-30) scale(1 1.15)" class="${classRight}"${styleRight}>`;
      if (isAnimate) {
        cubesSvg += `<animate attributeName="height" values="2.6;${heightRight}" dur="3s" repeatCount="1"></animate>`;
      }
      cubesSvg += `</rect></g>`;
    }
  });

  // Radar Chart dimensions
  const radarWidth = 520;
  const radarHeight = 390;
  const radarX = width - radarWidth - 40;
  const radarY = 70;
  const radarSvg = renderRadar(radarX, radarY, radarWidth, radarHeight, telemetry, isAnimate);

  // Language Pie Chart dimensions
  const pieHeight = 260;
  const pieWidth = 520;
  const pieX = 40;
  const pieY = height - pieHeight - 70;
  const langSvg = renderLanguageDonut(pieX, pieY, pieWidth, pieHeight, telemetry.languages || [], telemetry.totalCommitContributions || total, isAnimate);

  // Date Range
  const startDate = days[0].date;
  const endDate = days[days.length - 1].date;
  const period = `${startDate} / ${endDate}`;

  // Metrics Bar
  const positionXContrib = Math.round((width * 3) / 10);
  const positionYContrib = height - 20;
  const positionXStar = Math.round((width * 5) / 10);
  const positionXFork = Math.round((width * 6) / 10);

  const starCount = telemetry.totalStars || 0;
  const forkCount = telemetry.totalForks || 0;

  const starIcon = `<path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z" class="fill-fg"></path>`;
  const forkIcon = `<path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" class="fill-fg"></path>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<style>${generateCss(themeConfig)}</style>
<rect x="0" y="0" width="${width}" height="${height}" class="fill-bg"></rect>

<!-- 3D Contribution Grid Terrain -->
<g>
${cubesSvg}
</g>

<!-- 5-Axis Activity Radar -->
${radarSvg}

<!-- Language Breakdown Donut Chart -->
${langSvg}

<!-- Telemetry & Metrics Summary -->
<g>
  <text style="font-size: 32px; font-weight: bold;" x="${positionXContrib}" y="${positionYContrib}" text-anchor="end" class="fill-strong">${formatThousand(total)}</text>
  <text style="font-size: 24px;" x="${positionXContrib + 10}" y="${positionYContrib}" text-anchor="start" class="fill-fg">contributions</text>

  <g transform="translate(${positionXStar - 32}, ${positionYContrib - 28}), scale(2)">
    ${starIcon}
  </g>
  <text style="font-size: 32px; font-weight: bold;" x="${positionXStar + 10}" y="${positionYContrib}" text-anchor="start" class="fill-fg">${toScale(starCount)}<title>${starCount} stars</title></text>

  <g transform="translate(${positionXFork - 32}, ${positionYContrib - 28}), scale(2)">
    ${forkIcon}
  </g>
  <text style="font-size: 32px; font-weight: bold;" x="${positionXFork + 4}" y="${positionYContrib}" text-anchor="start" class="fill-fg">${toScale(forkCount)}<title>${forkCount} forks</title></text>

  <!-- Date Range -->
  <text style="font-size: 16px;" x="${width - 20}" y="20" dominant-baseline="hanging" text-anchor="end" class="fill-weak">${period}</text>

  <!-- Signature Branding -->
  <text style="font-size: 13px; font-weight: 600; opacity: 0.75; letter-spacing: 0.5px;" x="${width - 20}" y="${height - 20}" text-anchor="end" class="fill-fg">&#9889; by @${username}</text>
</g>
</svg>`;
}

module.exports = { render3DCity, THEME_CONFIGS };
