import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAITrainingProfile = () => {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfile();
  }, [user]);

  const checkProfile = async () => {
    if (!user) {
      setLoading(false);
      setHasProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ai_training_profile')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking AI training profile:', error);
      }

      setHasProfile(!!data);
    } catch (error) {
      console.error('Error in checkProfile:', error);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    hasProfile,
    loading,
    refetch: checkProfile,
  };
};