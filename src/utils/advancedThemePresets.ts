import { ColorMode } from '@/hooks/useThemeMode';
import { ADVANCED_THEME_COLORS, UNIFIED_THEMES } from './unifiedThemes';

// Re-export from unified themes for backwards compatibility
export const LEVEL_3_THEMES: ColorMode[] = ADVANCED_THEME_COLORS.filter(t => {
  const theme = UNIFIED_THEMES.find(ut => ut.id === t.id);
  return theme?.tier === 2;
});

export const LEVEL_4_THEMES: ColorMode[] = ADVANCED_THEME_COLORS.filter(t => {
  const theme = UNIFIED_THEMES.find(ut => ut.id === t.id);
  return theme?.tier === 3;
});

export const LEVEL_5_THEMES: ColorMode[] = ADVANCED_THEME_COLORS.filter(t => {
  const theme = UNIFIED_THEMES.find(ut => ut.id === t.id);
  return theme?.tier === 4;
});

export const ALL_ADVANCED_THEMES = ADVANCED_THEME_COLORS;
