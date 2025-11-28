import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useWidgetUsageTracking = (widgetType: string) => {
  const { user } = useAuth();

  const trackInteraction = useCallback(async () => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('widget_usage_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('widget_type', widgetType)
        .single();

      if (existing) {
        await supabase
          .from('widget_usage_stats')
          .update({
            interaction_count: existing.interaction_count + 1,
            last_interacted_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('widget_usage_stats')
          .insert({
            user_id: user.id,
            widget_type: widgetType,
            interaction_count: 1,
          });
      }
    } catch (error) {
      console.error('Error tracking widget interaction:', error);
    }
  }, [user, widgetType]);

  const trackTimeSpent = useCallback(async (seconds: number) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('widget_usage_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('widget_type', widgetType)
        .single();

      if (existing) {
        await supabase
          .from('widget_usage_stats')
          .update({
            total_time_seconds: existing.total_time_seconds + seconds,
          })
          .eq('id', existing.id);
      }
    } catch (error) {
      console.error('Error tracking widget time:', error);
    }
  }, [user, widgetType]);

  // Track interaction on mount
  useEffect(() => {
    trackInteraction();
  }, [trackInteraction]);

  return { trackInteraction, trackTimeSpent };
};

export const useTopWidgets = () => {
  const { user } = useAuth();

  const getTopWidgets = useCallback(async (): Promise<string[]> => {
    if (!user) return [];

    try {
      const { data } = await supabase
        .from('widget_usage_stats')
        .select('widget_type')
        .eq('user_id', user.id)
        .order('interaction_count', { ascending: false })
        .limit(3);

      return data?.map(d => d.widget_type) || [];
    } catch (error) {
      console.error('Error fetching top widgets:', error);
      return [];
    }
  }, [user]);

  return { getTopWidgets };
};
