import { ColorMode } from '@/hooks/useThemeMode';

/**
 * Unified Theme System - Single source of truth for all themes
 * Combines color definitions with unlock requirements
 */

export interface ThemeDefinition extends ColorMode {
  description: string;
  unlockRequirement: {
    type: 'level' | 'rank' | 'default';
    value: string | number;
  };
  tier: number; // 1 = default/free, 2-5 = progression tiers
}

export const UNIFIED_THEMES: ThemeDefinition[] = [
  // Tier 1: Default/Free themes (always unlocked)
  {
    id: 'default',
    name: 'Default Theme',
    description: 'Clean and professional',
    primary: '210 90% 58%', // Blue
    secondary: '215 16% 47%', // Gray
    accent: '210 90% 58%',
    profit: '210 90% 58%',
    loss: '215 16% 47%',
    unlockRequirement: { type: 'default', value: 1 },
    tier: 1,
  },
  {
    id: 'purple',
    name: 'Purple Haze',
    description: 'Vibrant purple aesthetics',
    primary: '270 67% 62%', // Purple
    secondary: '239 84% 67%', // Indigo
    accent: '270 67% 62%',
    profit: '270 67% 62%',
    loss: '239 84% 67%',
    unlockRequirement: { type: 'default', value: 1 },
    tier: 1,
  },
  {
    id: 'classic',
    name: 'Classic Trader',
    description: 'Traditional green wins, red losses',
    primary: '142 76% 58%', // Green
    secondary: '0 91% 61%', // Red
    accent: '142 76% 58%',
    profit: '142 76% 58%', // Green for profit
    loss: '0 91% 61%', // Red for loss
    unlockRequirement: { type: 'default', value: 1 },
    tier: 1,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark and professional',
    primary: '217 91% 60%', // Blue
    secondary: '215 16% 47%', // Gray
    accent: '217 91% 60%',
    profit: '217 91% 60%',
    loss: '215 16% 47%',
    unlockRequirement: { type: 'default', value: 1 },
    tier: 1,
  },

  // Tier 2: Level 3+ themes
  {
    id: 'wall-street',
    name: 'Wall Street',
    description: 'Luxurious gold and navy',
    primary: '45 93% 57%', // Gold
    secondary: '220 26% 14%', // Navy
    accent: '45 93% 57%',
    profit: '45 93% 57%',
    loss: '220 26% 14%',
    unlockRequirement: { type: 'level', value: 3 },
    tier: 2,
  },
  {
    id: 'focus',
    name: 'Focus Mode',
    description: 'Minimal distractions',
    primary: '210 16% 88%', // Light gray
    secondary: '215 20% 35%', // Dark gray
    accent: '210 16% 88%',
    profit: '210 16% 88%',
    loss: '215 20% 35%',
    unlockRequirement: { type: 'level', value: 3 },
    tier: 2,
  },
  {
    id: 'neon',
    name: 'Neon City',
    description: 'Cyberpunk vibes',
    primary: '330 81% 60%', // Pink
    secondary: '189 94% 43%', // Cyan
    accent: '330 81% 60%',
    profit: '330 81% 60%',
    loss: '189 94% 43%',
    unlockRequirement: { type: 'level', value: 3 },
    tier: 2,
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural earth tones',
    primary: '142 71% 45%', // Green
    secondary: '25 46% 38%', // Brown
    accent: '142 71% 45%',
    profit: '142 71% 45%',
    loss: '25 46% 38%',
    unlockRequirement: { type: 'level', value: 3 },
    tier: 2,
  },
  {
    id: 'vietnam',
    name: '🇻🇳 Vietnam',
    description: 'National pride',
    primary: '358 77% 48%', // Vietnam Red
    secondary: '60 100% 50%', // Vietnam Yellow
    accent: '358 77% 48%',
    profit: '358 77% 48%',
    loss: '60 100% 50%',
    unlockRequirement: { type: 'level', value: 3 },
    tier: 2,
  },

  // Tier 3: Level 4+ themes
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm evening hues',
    primary: '14 100% 57%', // Orange
    secondary: '340 82% 52%', // Pink
    accent: '14 100% 57%',
    profit: '14 100% 57%',
    loss: '340 82% 52%',
    unlockRequirement: { type: 'level', value: 4 },
    tier: 3,
  },
  {
    id: 'arctic',
    name: 'Arctic',
    description: 'Cool ice blue',
    primary: '189 75% 75%', // Ice blue
    secondary: '0 0% 100%', // White
    accent: '189 75% 75%',
    profit: '189 75% 75%',
    loss: '200 10% 60%',
    unlockRequirement: { type: 'level', value: 4 },
    tier: 3,
  },
  {
    id: 'matrix',
    name: 'Matrix',
    description: 'Terminal green',
    primary: '120 100% 50%', // Terminal green
    secondary: '0 0% 0%', // Black
    accent: '120 100% 50%',
    profit: '120 100% 50%',
    loss: '0 0% 20%',
    unlockRequirement: { type: 'level', value: 4 },
    tier: 3,
  },
  {
    id: 'fire',
    name: 'Fire',
    description: 'Blazing intensity',
    primary: '0 100% 50%', // Red
    secondary: '14 100% 57%', // Orange
    accent: '0 100% 50%',
    profit: '14 100% 57%',
    loss: '0 100% 50%',
    unlockRequirement: { type: 'level', value: 4 },
    tier: 3,
  },

  // Tier 4: Level 5+ themes
  {
    id: 'galaxy',
    name: 'Galaxy',
    description: 'Deep space purple',
    primary: '270 67% 62%', // Purple
    secondary: '240 10% 3%', // Deep black
    accent: '270 67% 62%',
    profit: '270 67% 62%',
    loss: '240 10% 20%',
    unlockRequirement: { type: 'level', value: 5 },
    tier: 4,
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    description: 'Retro neon aesthetics',
    primary: '300 76% 72%', // Neon pink
    secondary: '280 89% 66%', // Neon purple
    accent: '300 76% 72%',
    profit: '300 76% 72%',
    loss: '280 89% 66%',
    unlockRequirement: { type: 'level', value: 5 },
    tier: 4,
  },
];

// Export color-only definitions for useThemeMode
export const PRESET_THEME_COLORS: ColorMode[] = UNIFIED_THEMES
  .filter(t => t.tier === 1)
  .map(({ id, name, primary, secondary, accent, profit, loss }) => ({
    id,
    name,
    primary,
    secondary,
    accent,
    profit,
    loss,
  }));

export const ADVANCED_THEME_COLORS: ColorMode[] = UNIFIED_THEMES
  .filter(t => t.tier > 1)
  .map(({ id, name, primary, secondary, accent, profit, loss }) => ({
    id,
    name,
    primary,
    secondary,
    accent,
    profit,
    loss,
  }));

// Helper to get theme by ID
export const getThemeById = (id: string): ThemeDefinition | undefined => {
  return UNIFIED_THEMES.find(t => t.id === id);
};

// Helper to check if theme is unlocked
export const isThemeUnlocked = (
  theme: ThemeDefinition,
  userLevel: number,
  userRank?: string
): boolean => {
  if (theme.unlockRequirement.type === 'default') {
    return true;
  }
  
  if (theme.unlockRequirement.type === 'level') {
    return userLevel >= (theme.unlockRequirement.value as number);
  }
  
  if (theme.unlockRequirement.type === 'rank' && userRank) {
    const rankOrder = [
      'rookie_trader',
      'active_trader',
      'consistent_trader',
      'pro_trader',
      'elite_trader',
      'legend_trader',
    ];
    const requiredRankIndex = rankOrder.indexOf(theme.unlockRequirement.value as string);
    const currentRankIndex = rankOrder.indexOf(userRank);
    return currentRankIndex >= requiredRankIndex;
  }
  
  return false;
};
