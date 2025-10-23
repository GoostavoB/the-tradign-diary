import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface BlurContextType {
  isBlurred: boolean;
  toggleBlur: () => void;
  setBlurred: (value: boolean) => void;
}

const BlurContext = createContext<BlurContextType | undefined>(undefined);

export const BlurProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    if (user) {
      loadBlurSetting();
    }
  }, [user]);

  const loadBlurSetting = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('blur_enabled')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading blur setting:', error);
        return;
      }

      if (data) {
        setIsBlurred(data.blur_enabled ?? false);
      }
    } catch (error) {
      console.error('Error loading blur setting:', error);
    }
  };

  const setBlurred = async (value: boolean) => {
    setIsBlurred(value);

    if (user) {
      try {
        const { error } = await supabase
          .from('user_settings')
          .update({ blur_enabled: value })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error saving blur setting:', error);
        }
      } catch (error) {
        console.error('Error saving blur setting:', error);
      }
    }
  };

  const toggleBlur = () => {
    setBlurred(!isBlurred);
  };

  return (
    <BlurContext.Provider value={{ isBlurred, toggleBlur, setBlurred }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => {
  const context = useContext(BlurContext);
  if (!context) {
    throw new Error('useBlur must be used within BlurProvider');
  }
  return context;
};
