import { useThemeMode, ColorMode } from '@/hooks/useThemeMode';
import { ThemePreviewCard } from './ThemePreviewCard';
import { PRESET_THEMES } from '@/utils/themePresets';

export const QuickThemesGrid = () => {
  const { themeMode, setThemeMode } = useThemeMode();

  const handleThemeClick = (theme: ColorMode) => {
    setThemeMode(theme.id);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold px-4">Quick Themes</h3>
      <div className="grid grid-cols-2 gap-3 px-4">
        {PRESET_THEMES.map((theme) => (
          <ThemePreviewCard
            key={theme.id}
            theme={theme}
            isActive={themeMode === theme.id}
            onClick={() => handleThemeClick(theme)}
          />
        ))}
      </div>
    </div>
  );
};
