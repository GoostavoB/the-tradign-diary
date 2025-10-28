import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { PRESET_THEMES } from '@/utils/themePresets';

/**
 * PublicPageThemeWrapper - Forces dark mode and default theme colors on public pages
 * Always uses dark mode with default blue/gray theme regardless of user's saved preferences
 */
export const PublicPageThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { setTheme } = useTheme();
  
  useEffect(() => {
    // Force dark mode on all public pages
    setTheme('dark');
    // Brand colors are preserved - no forced color override
  }, [setTheme]);
  
  return <>{children}</>;
};
