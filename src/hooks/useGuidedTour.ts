import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useGuidedTour = () => {
  const { user } = useAuth();
  const [shouldShowTour, setShouldShowTour] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTourStatus();
  }, [user]);

  const checkTourStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('guided_tour_completed, onboarding_completed')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking tour status:', error);
        setLoading(false);
        return;
      }

      // Show tour if onboarding is done but tour is not
      setShouldShowTour(data?.onboarding_completed && !data?.guided_tour_completed);
    } catch (error) {
      console.error('Error in checkTourStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTour = async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_settings')
        .update({ guided_tour_completed: true })
        .eq('user_id', user.id);

      setShouldShowTour(false);
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  };

  const startTour = () => {
    setShouldShowTour(true);
  };

  return {
    shouldShowTour,
    loading,
    completeTour,
    startTour,
  };
};
