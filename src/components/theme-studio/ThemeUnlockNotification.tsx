import { useEffect } from 'react';
import { toast } from 'sonner';
import { Palette, Sparkles } from 'lucide-react';
import { useThemeUnlocks } from '@/hooks/useThemeUnlocks';

export const ThemeUnlockNotification = () => {
  const { themes } = useThemeUnlocks();

  useEffect(() => {
    const newlyUnlocked = themes.filter(t => t.isUnlocked);
    
    if (newlyUnlocked.length > 0) {
      // Only show notification for themes unlocked in last 24h
      // For now, just skip notification
    }
  }, [themes]);

  return null;
};
