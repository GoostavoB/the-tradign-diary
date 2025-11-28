import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTourStore } from '@/stores/useTourStore';

export type TourMode = 'full' | 'updates' | 'manual-full' | 'manual-updates';

export const useGuidedTour = () => {
  const { user } = useAuth();
  const { 
    shouldShowTour, 
    tourMode, 
    hasNewUpdates, 
    loading,
    setShouldShowTour,
    setTourMode,
    setHasNewUpdates,
    setLoading,
    startTour: startTourStore
  } = useTourStore();

  useEffect(() => {
    checkTourStatus();
  }, [user]);

  const checkTourStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('guided_tour_completed, onboarding_completed, tour_version_completed, last_seen_updates_version')
        .eq('user_id', user.id)
        .single();

      if (settingsError) {
        console.error('Error checking tour status:', settingsError);
        setLoading(false);
        return;
      }

      // Get latest tour version
      const { data: latestVersion } = await supabase
        .from('tour_versions')
        .select('version, type')
        .eq('active', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      // Check for new updates
      const { data: latestUpdate } = await supabase
        .from('updates_log')
        .select('version')
        .eq('published', true)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      const userTourVersion = userSettings?.tour_version_completed || 0;
      const latestTourVersion = latestVersion?.version || 1;
      const userUpdatesVersion = userSettings?.last_seen_updates_version || 0;
      const latestUpdatesVersion = latestUpdate?.version || 0;

      // Check if there are new updates to show
      setHasNewUpdates(latestUpdatesVersion > userUpdatesVersion);

      // Show tour if onboarding is done but tour is not completed
      if (userSettings?.onboarding_completed && !userSettings?.guided_tour_completed) {
        setShouldShowTour(true);
        setTourMode('full');
      } else if (latestTourVersion > userTourVersion && latestVersion?.type === 'update') {
        // There's a new tour with updates
        setShouldShowTour(false); // Don't auto-show, wait for user to click badge
        setTourMode('updates');
      }
    } catch (error) {
      console.error('Error in checkTourStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTour = async (version?: number) => {
    if (!user) return;

    try {
      const updates: any = { guided_tour_completed: true };
      
      if (version) {
        updates.tour_version_completed = version;
      }

      await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      setShouldShowTour(false);
      await checkTourStatus(); // Refresh status
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  };

  const markUpdatesAsSeen = async (version: number) => {
    if (!user) return;

    try {
      await supabase
        .from('user_settings')
        .update({ last_seen_updates_version: version })
        .eq('user_id', user.id);

      setHasNewUpdates(false);
    } catch (error) {
      console.error('Error marking updates as seen:', error);
    }
  };

  const startTour = (mode: TourMode = 'manual-full') => {
    console.log('🎯 useGuidedTour.startTour called with mode:', mode);
    startTourStore(mode);
  };

  return {
    shouldShowTour,
    tourMode,
    hasNewUpdates,
    loading,
    completeTour,
    startTour,
    markUpdatesAsSeen,
    checkTourStatus,
  };
};
