import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from './useUserTier';

interface DailyUploadStatus {
  uploadsToday: number;
  dailyLimit: number;
  canUpload: boolean;
  remainingUploads: number;
  isLoading: boolean;
}

export const useDailyUploadLimit = () => {
  const { user } = useAuth();
  const { dailyUploadLimit } = useUserTier();
  const [status, setStatus] = useState<DailyUploadStatus>({
    uploadsToday: 0,
    dailyLimit: dailyUploadLimit || 1,
    canUpload: true,
    remainingUploads: dailyUploadLimit || 1,
    isLoading: true,
  });

  const fetchUploadStatus = async () => {
    if (!user) {
      setStatus({
        uploadsToday: 0,
        dailyLimit: 0,
        canUpload: false,
        remainingUploads: 0,
        isLoading: false,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_xp_tiers')
        .select('daily_upload_count, daily_upload_limit')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching upload status:', error);
        setStatus({
          uploadsToday: 0,
          dailyLimit: dailyUploadLimit || 1,
          canUpload: true,
          remainingUploads: dailyUploadLimit || 1,
          isLoading: false,
        });
        return;
      }

      const uploadsToday = data?.daily_upload_count || 0;
      const limit = data?.daily_upload_limit || dailyUploadLimit || 1;
      const remaining = Math.max(0, limit - uploadsToday);

      setStatus({
        uploadsToday,
        dailyLimit: limit,
        canUpload: remaining > 0,
        remainingUploads: remaining,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking daily upload limit:', error);
      setStatus({
        uploadsToday: 0,
        dailyLimit: dailyUploadLimit || 1,
        canUpload: true,
        remainingUploads: dailyUploadLimit || 1,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    fetchUploadStatus();
  }, [user, dailyUploadLimit]);

  const incrementUploadCount = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check current count first
      const { data: current } = await supabase
        .from('user_xp_tiers')
        .select('daily_upload_count, daily_upload_limit')
        .eq('user_id', user.id)
        .single();

      const currentCount = current?.daily_upload_count || 0;
      const limit = current?.daily_upload_limit || dailyUploadLimit || 1;

      if (currentCount >= limit) {
        return false; // Limit reached
      }

      // Increment counter
      const { error } = await supabase
        .from('user_xp_tiers')
        .update({ 
          daily_upload_count: currentCount + 1 
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error incrementing upload count:', error);
        return false;
      }

      // Refresh status
      await fetchUploadStatus();
      return true;
    } catch (error) {
      console.error('Error incrementing upload count:', error);
      return false;
    }
  };

  return {
    ...status,
    refresh: fetchUploadStatus,
    incrementUploadCount,
  };
};
