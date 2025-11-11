import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UnlockableTheme {
  id: string;
  name: string;
  description: string;
  previewColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  unlockRequirement: {
    type: 'level' | 'rank' | 'achievement' | 'default';
    value: string | number;
  };
  isUnlocked: boolean;
}

// Helper to convert HSL to hex for preview colors
const hslToHex = (hsl: string): string => {
  const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
  const lightness = l / 100;
  const saturation = s / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lightness - chroma / 2;
  
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = chroma; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = chroma; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = chroma; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = chroma; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = chroma; }
  else if (h >= 300 && h < 360) { r = chroma; g = 0; b = x; }
  
  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Import unified themes
import { UNIFIED_THEMES, isThemeUnlocked as checkUnlock } from '@/utils/unifiedThemes';

const THEME_CATALOG: Omit<UnlockableTheme, 'isUnlocked'>[] = UNIFIED_THEMES.map(theme => ({
  id: theme.id,
  name: theme.name,
  description: theme.description,
  previewColors: {
    primary: hslToHex(theme.primary),
    secondary: hslToHex(theme.secondary),
    accent: hslToHex(theme.accent),
  },
  unlockRequirement: theme.unlockRequirement,
}));

export const useThemeUnlocks = () => {
  const { user } = useAuth();
  const [themes, setThemes] = useState<UnlockableTheme[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUnlocks();
    }
  }, [user]);

  const fetchUnlocks = async () => {
    if (!user) return;

    try {
      // Fetch user progression
      const { data: progression } = await supabase
        .from('user_xp_levels')
        .select('current_level')
        .eq('user_id', user.id)
        .single();

      const { data: userProgression } = await supabase
        .from('user_progression')
        .select('rank')
        .eq('user_id', user.id)
        .single();

      // Fetch user preferences
      const { data: preferences } = await supabase
        .from('user_customization_preferences')
        .select('active_theme, unlocked_themes')
        .eq('user_id', user.id)
        .single();

      const currentLevel = progression?.current_level || 1;
      const currentRank = userProgression?.rank || 'rookie_trader';
      const unlockedThemes = preferences?.unlocked_themes || ['default'];
      const activeThemeId = preferences?.active_theme || 'default';

      setActiveTheme(activeThemeId);

      // Check which themes are unlocked
      const themesWithUnlocks = THEME_CATALOG.map(theme => {
        let isUnlocked = unlockedThemes.includes(theme.id);
        
        if (!isUnlocked) {
          if (theme.unlockRequirement.type === 'default') {
            isUnlocked = true; // Default themes are always unlocked
          } else if (theme.unlockRequirement.type === 'level') {
            isUnlocked = currentLevel >= (theme.unlockRequirement.value as number);
          } else if (theme.unlockRequirement.type === 'rank') {
            const rankOrder = ['rookie_trader', 'active_trader', 'consistent_trader', 'pro_trader', 'elite_trader', 'legend_trader'];
            const requiredRankIndex = rankOrder.indexOf(theme.unlockRequirement.value as string);
            const currentRankIndex = rankOrder.indexOf(currentRank);
            isUnlocked = currentRankIndex >= requiredRankIndex;
          }
        }

        return { ...theme, isUnlocked };
      });

      setThemes(themesWithUnlocks);
    } catch (error) {
      console.error('Error fetching theme unlocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const activateTheme = async (themeId: string) => {
    if (!user) return;

    const theme = themes.find(t => t.id === themeId);
    if (!theme?.isUnlocked) return;

    try {
      // Update active theme in database
      const { error } = await supabase
        .from('user_customization_preferences')
        .upsert({
          user_id: user.id,
          active_theme: themeId
        }, {
          onConflict: 'user_id'
        });

      if (!error) {
        setActiveTheme(themeId);
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', themeId);
      }
    } catch (error) {
      console.error('Error activating theme:', error);
    }
  };

  return {
    themes,
    activeTheme,
    loading,
    activateTheme,
    refresh: fetchUnlocks
  };
};
