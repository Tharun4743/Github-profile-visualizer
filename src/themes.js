/**
 * Predefined Color Themes for 3D Contribution City & Telemetry Suite
 * Each theme defines colors for background, border, title, stats, and 5 levels (0-4).
 */
const THEMES = {
  cyberpunk: {
    name: 'Cyberpunk Neon',
    bgStart: '#090d16',
    bgEnd: '#141a29',
    border: '#243048',
    titleColor: '#00f0ff',
    subtitleColor: '#ff79c6',
    statColor: '#8be9fd',
    levels: [
      { top: '#181f2f', left: '#101522', right: '#0a0d16' }, // 0
      { top: '#00d26a', left: '#009c4f', right: '#006c37' }, // 1
      { top: '#00f0ff', left: '#00b4c0', right: '#007c85' }, // 2
      { top: '#bd93f9', left: '#926fd1', right: '#684aa3' }, // 3
      { top: '#ff79c6', left: '#cf549d', right: '#9b3572' }  // 4
    ]
  },
  tokyonight: {
    name: 'Tokyo Night',
    bgStart: '#1a1b26',
    bgEnd: '#24283b',
    border: '#414868',
    titleColor: '#7aa2f7',
    subtitleColor: '#9aa5ce',
    statColor: '#bb9af7',
    levels: [
      { top: '#282e44', left: '#1f2334', right: '#181b28' }, // 0
      { top: '#449dab', left: '#347984', right: '#26575f' }, // 1
      { top: '#7aa2f7', left: '#5a78b8', right: '#3f5482' }, // 2
      { top: '#bb9af7', left: '#9076bf', right: '#6c588f' }, // 3
      { top: '#f7768e', left: '#c55e71', right: '#914553' }  // 4
    ]
  },
  dracula: {
    name: 'Dracula',
    bgStart: '#282a36',
    bgEnd: '#21222c',
    border: '#6272a4',
    titleColor: '#bd93f9',
    subtitleColor: '#ff79c6',
    statColor: '#50fa7b',
    levels: [
      { top: '#44475a', left: '#343746', right: '#282a36' }, // 0
      { top: '#6272a4', left: '#4e5a82', right: '#3a4463' }, // 1
      { top: '#8be9fd', left: '#64b6c7', right: '#458896' }, // 2
      { top: '#50fa7b', left: '#3ec460', right: '#298e43' }, // 3
      { top: '#ff79c6', left: '#cf549d', right: '#9b3572' }  // 4
    ]
  },
  synthwave: {
    name: 'Synthwave 84',
    bgStart: '#261435',
    bgEnd: '#170b22',
    border: '#fe4450',
    titleColor: '#f92aad',
    subtitleColor: '#fede5d',
    statColor: '#36f9f6',
    levels: [
      { top: '#3c2353', left: '#2a163d', right: '#1c0c2a' }, // 0
      { top: '#72f1b8', left: '#52b588', right: '#36805d' }, // 1
      { top: '#36f9f6', left: '#24b8b6', right: '#167d7c' }, // 2
      { top: '#fede5d', left: '#c9b044', right: '#8c7a2c' }, // 3
      { top: '#f92aad', left: '#c41d86', right: '#8e1160' }  // 4
    ]
  },
  emerald: {
    name: 'GitHub Emerald',
    bgStart: '#0d1117',
    bgEnd: '#161b22',
    border: '#30363d',
    titleColor: '#39d353',
    subtitleColor: '#8b949e',
    statColor: '#2ea043',
    levels: [
      { top: '#1f242c', left: '#161b22', right: '#0d1117' }, // 0
      { top: '#0e4429', left: '#0a321e', right: '#072415' }, // 1
      { top: '#006d32', left: '#005226', right: '#003a1b' }, // 2
      { top: '#26a641', left: '#1c7d31', right: '#145923' }, // 3
      { top: '#39d353', left: '#2ba440', right: '#1e752d' }  // 4
    ]
  },
  'pearl-neon': {
    name: 'Pearl Neon Light',
    bgStart: '#ffffff',
    bgEnd: '#f1f5f9',
    border: '#cbd5e1',
    titleColor: '#0f172a',
    subtitleColor: '#6366f1',
    statColor: '#0284c7',
    levels: [
      { top: '#e2e8f0', left: '#cbd5e1', right: '#94a3b8' }, // 0
      { top: '#38bdf8', left: '#0ea5e9', right: '#0284c7' }, // 1
      { top: '#6366f1', left: '#4f46e5', right: '#4338ca' }, // 2
      { top: '#a855f7', left: '#9333ea', right: '#7e22ce' }, // 3
      { top: '#ec4899', left: '#db2777', right: '#be185d' }  // 4
    ]
  },
  'solar-light': {
    name: 'Solar Sunrise Light',
    bgStart: '#ffffff',
    bgEnd: '#fff7ed',
    border: '#fed7aa',
    titleColor: '#c2410c',
    subtitleColor: '#ea580c',
    statColor: '#d97706',
    levels: [
      { top: '#f1f5f9', left: '#e2e8f0', right: '#cbd5e1' }, // 0
      { top: '#fbbf24', left: '#f59e0b', right: '#d97706' }, // 1
      { top: '#fb923c', left: '#f97316', right: '#ea580c' }, // 2
      { top: '#f87171', left: '#ef4444', right: '#dc2626' }, // 3
      { top: '#f43f5e', left: '#e11d48', right: '#be123c' }  // 4
    ]
  },
  'ocean-light': {
    name: 'Ocean Breeze Light',
    bgStart: '#ffffff',
    bgEnd: '#f0fdfa',
    border: '#99f6e4',
    titleColor: '#0f766e',
    subtitleColor: '#0284c7',
    statColor: '#0d9488',
    levels: [
      { top: '#e2e8f0', left: '#cbd5e1', right: '#94a3b8' }, // 0
      { top: '#5eead4', left: '#2dd4bf', right: '#14b8a6' }, // 1
      { top: '#38bdf8', left: '#0ea5e9', right: '#0284c7' }, // 2
      { top: '#3b82f6', left: '#2563eb', right: '#1d4ed8' }, // 3
      { top: '#6366f1', left: '#4f46e5', right: '#3730a3' }  // 4
    ]
  }
};

function getTheme(themeName) {
  const key = (themeName || 'cyberpunk').toLowerCase().trim();
  return THEMES[key] || THEMES['cyberpunk'];
}

function createCustomTheme(customColorsStr, bgStr = '#090d16') {
  if (!customColorsStr) return getTheme('cyberpunk');
  const hexes = customColorsStr.split(',').map(c => c.trim()).filter(Boolean);
  if (hexes.length < 5) return getTheme('cyberpunk');

  function adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
    return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  const levels = hexes.slice(0, 5).map(topHex => ({
    top: topHex,
    left: adjustColor(topHex, -28),
    right: adjustColor(topHex, -45)
  }));

  return {
    name: 'Custom Palette',
    bgStart: bgStr,
    bgEnd: adjustColor(bgStr, -10),
    border: adjustColor(bgStr, 30),
    titleColor: hexes[4] || '#00f0ff',
    subtitleColor: '#ff79c6',
    statColor: hexes[3] || '#8be9fd',
    levels
  };
}

module.exports = { THEMES, getTheme, createCustomTheme };
