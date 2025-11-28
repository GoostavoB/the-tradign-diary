import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSubAccount } from './SubAccountContext';
import { supabase } from '@/integrations/supabase/client';

interface CalmModeContextType {
  calmModeEnabled: boolean;
  soundEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  toggleCalmMode: () => void;
  toggleSound: () => void;
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
}

const CalmModeContext = createContext<CalmModeContextType | undefined>(undefined);

export const CalmModeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { activeSubAccount } = useSubAccount();
  const [calmModeEnabled, setCalmModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationSpeed, setAnimationSpeedState] = useState<'slow' | 'normal' | 'fast'>('normal');

  useEffect(() => {
    if (!user || !activeSubAccount) return;

    const fetchPreferences = async () => {
      const { data, error } = await supabase
        .from('user_customization_preferences')
        .select('*')
        .eq('sub_account_id', activeSubAccount.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setCalmModeEnabled(data.calm_mode_enabled);
        setSoundEnabled(data.sound_enabled);
        setAnimationSpeedState(data.animation_speed as 'slow' | 'normal' | 'fast');
      } else {
        // Initialize preferences for new sub-account
        await supabase
          .from('user_customization_preferences')
          .insert({
            user_id: user.id,
            sub_account_id: activeSubAccount.id,
            calm_mode_enabled: false,
            sound_enabled: true,
            animation_speed: 'normal',
          });
      }
    };

    fetchPreferences();
  }, [user, activeSubAccount]);

  const toggleCalmMode = async () => {
    if (!user || !activeSubAccount) return;
    
    const newValue = !calmModeEnabled;
    setCalmModeEnabled(newValue);

    await supabase
      .from('user_customization_preferences')
      .update({ calm_mode_enabled: newValue })
      .eq('sub_account_id', activeSubAccount.id);
  };

  const toggleSound = async () => {
    if (!user || !activeSubAccount) return;
    
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);

    await supabase
      .from('user_customization_preferences')
      .update({ sound_enabled: newValue })
      .eq('sub_account_id', activeSubAccount.id);
  };

  const setAnimationSpeed = async (speed: 'slow' | 'normal' | 'fast') => {
    if (!user || !activeSubAccount) return;
    
    setAnimationSpeedState(speed);

    await supabase
      .from('user_customization_preferences')
      .update({ animation_speed: speed })
      .eq('sub_account_id', activeSubAccount.id);
  };

  return (
    <CalmModeContext.Provider value={{
      calmModeEnabled,
      soundEnabled,
      animationSpeed,
      toggleCalmMode,
      toggleSound,
      setAnimationSpeed,
    }}>
      {children}
    </CalmModeContext.Provider>
  );
};

export const useCalmMode = () => {
  const context = useContext(CalmModeContext);
  if (!context) {
    throw new Error('useCalmMode must be used within CalmModeProvider');
  }
  return context;
};
