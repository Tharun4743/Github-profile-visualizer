/**
 * Predefined Color Themes for 3D Contribution City
 * All themes use clean, high-contrast, attractive pure white / light aesthetics.
 * If any dark or invalid theme is configured, it automatically resolves to 'pearl-neon'.
 */
const THEMES = {
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
      { top: '#38bdf8', left: '#0ea5e9', right: '#0284c7' }, // 1 (Sky Blue)
      { top: '#6366f1', left: '#4f46e5', right: '#4338ca' }, // 2 (Indigo)
      { top: '#a855f7', left: '#9333ea', right: '#7e22ce' }, // 3 (Purple)
      { top: '#ec4899', left: '#db2777', right: '#be185d' }  // 4 (Pink Neon)
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
      { top: '#fbbf24', left: '#f59e0b', right: '#d97706' }, // 1 (Amber)
      { top: '#fb923c', left: '#f97316', right: '#ea580c' }, // 2 (Orange)
      { top: '#f87171', left: '#ef4444', right: '#dc2626' }, // 3 (Coral)
      { top: '#f43f5e', left: '#e11d48', right: '#be123c' }  // 4 (Rose Red)
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
      { top: '#5eead4', left: '#2dd4bf', right: '#14b8a6' }, // 1 (Mint)
      { top: '#38bdf8', left: '#0ea5e9', right: '#0284c7' }, // 2 (Cyan)
      { top: '#3b82f6', left: '#2563eb', right: '#1d4ed8' }, // 3 (Blue)
      { top: '#6366f1', left: '#4f46e5', right: '#3730a3' }  // 4 (Indigo)
    ]
  },
  'github-light': {
    name: 'GitHub Emerald Light',
    bgStart: '#ffffff',
    bgEnd: '#f6f8fa',
    border: '#d0d7de',
    titleColor: '#1a7f37',
    subtitleColor: '#57606a',
    statColor: '#0969da',
    levels: [
      { top: '#ebedf0', left: '#d0d7de', right: '#afb8c1' }, // 0
      { top: '#9be9a8', left: '#76ca83', right: '#56a762' }, // 1
      { top: '#40c463', left: '#2da04b', right: '#1e7d36' }, // 2
      { top: '#30a14e', left: '#21803c', right: '#15612c' }, // 3
      { top: '#216e39', left: '#17542a', right: '#0e3a1c' }  // 4
    ]
  }
};

// Aliases and automatic fallback mapping for removed / dark themes
const THEME_ALIASES = {
  cyberpunk: 'pearl-neon',
  tokyonight: 'pearl-neon',
  dracula: 'pearl-neon',
  synthwave: 'pearl-neon',
  matrix: 'ocean-light',
  nord: 'ocean-light',
  monokai: 'solar-light',
  sunset: 'solar-light',
  emerald: 'github-light',
  'github-dark': 'github-light',
  'night-view': 'pearl-neon',
  'night-rainbow': 'pearl-neon',
  'night-green': 'github-light',
  dark: 'pearl-neon',
  light: 'pearl-neon',
  default: 'pearl-neon'
};

function getTheme(themeName) {
  const key = (themeName || 'pearl-neon').toLowerCase().trim();
  if (THEMES[key]) {
    return THEMES[key];
  }
  if (THEME_ALIASES[key] && THEMES[THEME_ALIASES[key]]) {
    return THEMES[THEME_ALIASES[key]];
  }
  return THEMES['pearl-neon'];
}

/**
 * Creates a custom theme from comma-separated hex colors (5 colors for levels 0-4)
 * Enforces clean white / bright backgrounds for maximum readability and visual appeal.
 */
function createCustomTheme(customColorsStr, bgStr = '#ffffff') {
  if (!customColorsStr) return getTheme('pearl-neon');
  const hexes = customColorsStr.split(',').map(c => c.trim()).filter(Boolean);
  if (hexes.length < 5) return getTheme('pearl-neon');

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
    left: adjustColor(topHex, -20),
    right: adjustColor(topHex, -35)
  }));

  return {
    name: 'Custom Palette',
    bgStart: '#ffffff',
    bgEnd: '#f8fafc',
    border: '#cbd5e1',
    titleColor: '#0f172a',
    subtitleColor: '#6366f1',
    statColor: hexes[3] || '#0284c7',
    levels
  };
}

module.exports = { THEMES, getTheme, createCustomTheme };
