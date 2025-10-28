import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ColorPreferences {
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
}

export interface UnlockedColors {
  colors: ('primary' | 'secondary' | 'accent' | 'background')[];
}

export type ColorType = 'primary' | 'secondary' | 'accent' | 'background';

const DEFAULT_COLORS: ColorPreferences = {
  primary: '217 91% 60%', // Blue
  secondary: '215 16% 47%', // Gray
  accent: '251 100% 77%', // Purple
};

export function useColorSystem() {
  const { user } = useAuth();
  const [colors, setColors] = useState<ColorPreferences>(DEFAULT_COLORS);
  const [unlockedColors, setUnlockedColors] = useState<ColorType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadColors();
  }, [user]);

  const loadColors = async () => {
    if (!user) {
      // Load from localStorage for non-authenticated users
      const saved = localStorage.getItem('theme:colors');
      if (saved) {
        try {
          setColors(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved colors', e);
        }
      }
      setLoading(false);
      return;
    }

    // Load from database for authenticated users
    const { data: profileData } = await supabase
      .from('profiles')
      .select('unlocked_colors, subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileData?.unlocked_colors) {
      const unlockedData = profileData.unlocked_colors as { colors?: ColorType[] };
      if (unlockedData.colors) {
        setUnlockedColors(unlockedData.colors);
      }
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('accent_color')
      .eq('user_id', user.id)
      .single();

    if (!error && data?.accent_color) {
      const accentHsl = hexToHsl(data.accent_color);
      setColors({
        ...DEFAULT_COLORS,
        accent: accentHsl,
      });
      applyColors({
        ...DEFAULT_COLORS,
        accent: accentHsl,
      });
    }
    
    // Check for unlock conditions
    await checkAndUnlockColors();
    
    setLoading(false);
  };

  const checkAndUnlockColors = async () => {
    if (!user) return;

    // Fetch user tier and streak
    const { data: tierData } = await supabase
      .from('user_xp_tiers')
      .select('current_tier')
      .eq('user_id', user.id)
      .single();

    const { data: settingsData } = await supabase
      .from('user_settings')
      .select('current_visit_streak')
      .eq('user_id', user.id)
      .single();

    const { data: profileData } = await supabase
      .from('profiles')
      .select('subscription_tier, unlocked_colors')
      .eq('id', user.id)
      .single();

    const tier = tierData?.current_tier || 0;
    const streak = settingsData?.current_visit_streak || 0;
    const plan = profileData?.subscription_tier || 'free';
    
    const unlockedData = profileData?.unlocked_colors as { colors?: ColorType[] } | null;
    const currentUnlocked = unlockedData?.colors || [];

    // Check if Free user qualifies for primary unlock
    if (plan === 'free' && tier >= 5 && streak >= 30) {
      if (!currentUnlocked.includes('primary')) {
        // UNLOCK PRIMARY COLOR!
        await supabase
          .from('profiles')
          .update({ 
            unlocked_colors: { colors: ['primary'] } 
          })
          .eq('id', user.id);

        // Trigger confetti
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          console.error('Failed to load confetti:', e);
        }

        // Show toast
        const { toast } = await import('sonner');
        toast.success('🎨 Primary color unlocked!', {
          description: 'Customize your theme in Settings → Rewards',
          duration: 5000,
        });

        // PostHog event
        const { posthog } = await import('@/lib/posthog');
        posthog.capture('color_unlocked', {
          color_type: 'primary',
          tier: tier,
          streak: streak,
        });

        // Update state
        setUnlockedColors(['primary']);
      }
    }
  };

  const applyColors = (newColors: ColorPreferences) => {
    document.documentElement.style.setProperty('--primary', newColors.primary);
    document.documentElement.style.setProperty('--secondary', newColors.secondary);
    document.documentElement.style.setProperty('--accent', newColors.accent);
    if (newColors.background) {
      document.documentElement.style.setProperty('--background', newColors.background);
    }
    document.documentElement.style.setProperty('--chart-1', newColors.accent);
    document.documentElement.style.setProperty('--chart-2', newColors.primary);
    document.documentElement.style.setProperty('--chart-3', newColors.secondary);
  };

  const canChangeColor = (colorType: ColorType): boolean => {
    return unlockedColors.includes(colorType);
  };

  const updateColors = async (newColors: Partial<ColorPreferences>) => {
    // Check permissions for each color being updated
    for (const [colorType, value] of Object.entries(newColors)) {
      if (!canChangeColor(colorType as ColorType)) {
        const { toast } = await import('sonner');
        toast.error(`${colorType} color is locked`, {
          description: 'Unlock this color to customize it'
        });
        return;
      }
    }

    const updatedColors = { ...colors, ...newColors };
    setColors(updatedColors);
    applyColors(updatedColors);

    // Save to localStorage
    localStorage.setItem('theme:colors', JSON.stringify(updatedColors));

    // Save to database if authenticated
    if (user && newColors.accent) {
      const accentHex = hslToHex(newColors.accent);
      await supabase
        .from('user_settings')
        .update({ accent_color: accentHex })
        .eq('user_id', user.id);
    }
  };

  return {
    colors,
    unlockedColors,
    loading,
    updateColors,
    canChangeColor,
    checkAndUnlockColors,
  };
}

export { hslToHex };

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${h} ${s}% ${lPercent}%`;
}

// Helper function to convert HSL to hex
function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((v, i) => {
    const num = parseFloat(v.replace('%', ''));
    return i === 0 ? num : num / 100;
  });

  const hDecimal = h / 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hDecimal * 6) % 2) - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;

  if (hDecimal < 1/6) {
    r = c; g = x; b = 0;
  } else if (hDecimal < 2/6) {
    r = x; g = c; b = 0;
  } else if (hDecimal < 3/6) {
    r = 0; g = c; b = x;
  } else if (hDecimal < 4/6) {
    r = 0; g = x; b = c;
  } else if (hDecimal < 5/6) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}
