import { useThemeMode, ColorMode } from '@/hooks/useThemeMode';
import { ThemePreviewCard } from './ThemePreviewCard';
import { PRESET_THEMES } from '@/utils/themePresets';
import { ALL_ADVANCED_THEMES } from '@/utils/advancedThemePresets';
import { useThemeUnlocks } from '@/hooks/useThemeUnlocks';

export const QuickThemesGrid = () => {
  const { themeMode, setThemeMode } = useThemeMode();
  const { themes } = useThemeUnlocks();

  const handleThemeClick = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme?.isUnlocked) {
      setThemeMode(themeId);
    }
  };

  const allThemes = [...PRESET_THEMES, ...ALL_ADVANCED_THEMES];
  const unlockedThemes = allThemes.filter(t => 
    themes.find(ut => ut.id === t.id)?.isUnlocked
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold px-4">Available Themes</h3>
        <div className="grid grid-cols-2 gap-3 px-4">
          {unlockedThemes.map((theme) => (
            <ThemePreviewCard
              key={theme.id}
              theme={theme}
              isActive={themeMode === theme.id}
              onClick={() => handleThemeClick(theme.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
