/**
 * Native GitHub Contribution Grid & Chart Visualizer
 * Pure SVG vector engine rendering full 53-week x 7-day contribution grids with custom palette grading.
 * Eliminates external dependencies on third-party chart generators (e.g. ghchart.rshah.org).
 */

function hexToRgb(hex) {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 15, g: 118, b: 110 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function generateColorRamp(primaryHex, isLight = true) {
  const { r, g, b } = hexToRgb(primaryHex);
  const empty = isLight ? '#ebedf0' : '#161b22';
  
  // Calculate 4 progressive tints from subtle to primary full intensity
  return [
    empty,
    `rgba(${r}, ${g}, ${b}, 0.28)`,
    `rgba(${r}, ${g}, ${b}, 0.55)`,
    `rgba(${r}, ${g}, ${b}, 0.80)`,
    `rgba(${r}, ${g}, ${b}, 1.00)`
  ];
}

function renderContributionChart(days = [], username = '', theme = {}, options = {}) {
  // Support flexible argument signatures
  if (typeof username === 'object' && username !== null) {
    options = theme || {};
    theme = username;
    username = options.username || '';
  }

  const cleanUser = String(username || options.username || 'developer')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const isLight = theme.isLight !== false;
  const primaryColor = options.color || options.cleanColor || theme.titleColor || theme.statColor || '#0f766e';
  const fullHex = primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`;
  const ramp = generateColorRamp(fullHex, isLight);

  const safeDays = Array.isArray(days) ? [...days] : [];
  safeDays.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Build calendar matrix (53 columns x 7 days: Sunday=0 to Saturday=6)
  const totalWeeks = 53;
  const cellSize = 10;
  const cellGap = 2.5;
  const step = cellSize + cellGap; // 12.5px
  const gridStartX = 28;
  const gridStartY = 20;

  // Map days by YYYY-MM-DD
  const dayMap = new Map();
  let totalContributions = 0;
  safeDays.forEach((d) => {
    if (!d.date) return;
    const count = Number(d.count || 0);
    const level = Number(d.level ?? (count > 0 ? (count > 8 ? 4 : count > 4 ? 3 : count > 1 ? 2 : 1) : 0));
    dayMap.set(d.date, { date: d.date, count, level });
    totalContributions += count;
  });

  // Calculate calendar start date (last 53 weeks ending today or last day in dataset)
  let endDate = safeDays.length > 0 ? new Date(safeDays[safeDays.length - 1].date) : new Date();
  if (isNaN(endDate.getTime())) endDate = new Date();

  // Normalize end date to Saturday or current day
  const endDayOfWeek = endDate.getDay();
  const alignedEndDate = new Date(endDate);
  alignedEndDate.setDate(endDate.getDate() + (6 - endDayOfWeek));

  const startDate = new Date(alignedEndDate);
  startDate.setDate(alignedEndDate.getDate() - (totalWeeks * 7 - 1));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabels = [];
  let lastMonth = -1;

  const rects = [];
  const cur = new Date(startDate);

  for (let w = 0; w < totalWeeks; w++) {
    for (let d = 0; d < 7; d++) {
      const dateStr = cur.toISOString().split('T')[0];
      const month = cur.getMonth();

      // Check if month label should be placed at the first week of a month
      if (d === 0 && month !== lastMonth && w < totalWeeks - 1) {
        monthLabels.push({
          x: gridStartX + w * step,
          label: monthNames[month],
        });
        lastMonth = month;
      }

      const info = dayMap.get(dateStr) || { date: dateStr, count: 0, level: 0 };
      const level = Math.min(4, Math.max(0, info.level));
      const fill = ramp[level];
      const x = gridStartX + w * step;
      const y = gridStartY + d * step;

      rects.push(
        `<rect class="day level-${level}" width="${cellSize}" height="${cellSize}" x="${x}" y="${y}" rx="2" ry="2" fill="${fill}" data-date="${dateStr}" data-count="${info.count}"><title>${info.count} contribution${info.count === 1 ? '' : 's'} on ${dateStr}</title></rect>`
      );

      cur.setDate(cur.getDate() + 1);
    }
  }

  const chartWidth = gridStartX + totalWeeks * step + 16;
  const chartHeight = gridStartY + 7 * step + 16;

  const textColor = isLight ? '#64748b' : '#94a3b8';

  return `<svg width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .month-text { font: 600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: ${textColor}; }
    .wday-text { font: 600 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: ${textColor}; }
    .day { shape-rendering: geometricPrecision; transition: fill 0.2s ease, stroke 0.2s ease; }
    .day:hover { stroke: var(--theme-primary, ${fullHex}); stroke-width: 1.5px; }
    .day.level-0 { fill: var(--contrib-level-0, ${ramp[0]}); }
    .day.level-1 { fill: var(--contrib-level-1, ${ramp[1]}); }
    .day.level-2 { fill: var(--contrib-level-2, ${ramp[2]}); }
    .day.level-3 { fill: var(--contrib-level-3, ${ramp[3]}); }
    .day.level-4 { fill: var(--contrib-level-4, ${ramp[4]}); }
  </style>
  
  <!-- Month Labels -->
  <g class="months">
    ${monthLabels.map((m) => `<text x="${m.x}" y="12" class="month-text">${m.label}</text>`).join('\n    ')}
  </g>

  <!-- Weekday Labels -->
  <g class="weekdays">
    <text x="4" y="${gridStartY + 1 * step + 8}" class="wday-text">Mon</text>
    <text x="4" y="${gridStartY + 3 * step + 8}" class="wday-text">Wed</text>
    <text x="4" y="${gridStartY + 5 * step + 8}" class="wday-text">Fri</text>
  </g>

  <!-- Contribution Heatmap Grid (53 Weeks x 7 Days) -->
  <g class="grid">
    ${rects.join('\n    ')}
  </g>
</svg>`;
}

module.exports = { renderContributionChart, generateColorRamp };
