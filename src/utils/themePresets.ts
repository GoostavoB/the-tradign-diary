import { ColorMode } from '@/hooks/useThemeMode';
import { PRESET_THEME_COLORS } from './unifiedThemes';

// Re-export from unified themes for backwards compatibility
export const PRESET_THEMES: ColorMode[] = PRESET_THEME_COLORS;

export const getThemeColors = (theme: ColorMode) => {
  return [
    `hsl(${theme.primary})`,
    `hsl(${theme.secondary})`,
    `hsl(${theme.accent})`,
  ];
};
