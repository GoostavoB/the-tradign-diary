import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  calculateTier, 
  getTierName, 
  getXPToNextTier, 
  getDailyXPCap,
  getDailyUploadLimit,
  canEarnXP,
  getRemainingDailyXP,
  getTierProgress,
  type TierLevel 
} from '@/utils/xpEngine';

export type UserTier = 'free' | 'basic' | 'pro' | 'elite';

export interface TierData {
  tier: UserTier;
  tierLevel: TierLevel;
  tierName: string;
  totalXP: number;
  xpToNextTier: number | null;
  tierProgress: number;
  dailyXPEarned: number;
  dailyXPCap: number;
  canEarnXP: boolean;
  remainingDailyXP: number;
  dailyUploadLimit: number;
  uploadCreditsUsed: number;
}

export const useUserTier = () => {
  const { user } = useAuth();
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTierData = async () => {
    if (!user) {
      setTierData(null);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch user XP levels
      const { data: xpData } = await supabase
        .from('user_xp_levels')
        .select('total_xp_earned')
        .eq('user_id', user.id)
        .single();

      // Fetch user tier data
      const { data: tierInfo } = await supabase
        .from('user_xp_tiers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch subscription to determine legacy tier mapping
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const totalXP = xpData?.total_xp_earned || 0;
      const tierLevel = calculateTier(totalXP);
      const tierName = getTierName(tierLevel);
      const xpToNextTier = getXPToNextTier(totalXP);
      const tierProgress = getTierProgress(totalXP);

      // Prefer DB cap; clamp unrealistic "unlimited" caps unless at max tier
      let dailyXPCapRaw = tierInfo?.daily_xp_cap ?? getDailyXPCap(tierLevel);
      const dailyXPCap = (dailyXPCapRaw === Infinity || dailyXPCapRaw >= 999999) && tierLevel < 4
        ? getDailyXPCap(tierLevel)
        : dailyXPCapRaw;
      const dailyXPEarned = tierInfo?.daily_xp_earned ?? 0;
      const dailyUploadLimit = tierInfo?.daily_upload_limit ?? getDailyUploadLimit(tierLevel);

      // Map to legacy tier system for backwards compatibility
      let legacyTier: UserTier = 'free';
      if (subscription?.plan_type === 'elite') {
        legacyTier = 'elite';
      } else if (subscription?.plan_type === 'pro') {
        legacyTier = 'pro';
      } else if (tierLevel >= 2) {
        legacyTier = 'basic';
      }

      setTierData({
        tier: legacyTier,
        tierLevel,
        tierName,
        totalXP,
        xpToNextTier,
        tierProgress,
        dailyXPEarned,
        dailyXPCap,
        canEarnXP: canEarnXP(dailyXPEarned, dailyXPCap),
        remainingDailyXP: getRemainingDailyXP(dailyXPEarned, dailyXPCap),
        dailyUploadLimit,
        uploadCreditsUsed: 0, // TODO: Track this separately
      });
    } catch (error) {
      console.error('Error fetching tier data:', error);
      // Fallback to free tier
      setTierData({
        tier: 'free',
        tierLevel: 0,
        tierName: 'Free',
        totalXP: 0,
        xpToNextTier: 1000,
        tierProgress: 0,
        dailyXPEarned: 0,
        dailyXPCap: 750,
        canEarnXP: true,
        remainingDailyXP: 750,
        dailyUploadLimit: 1,
        uploadCreditsUsed: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTierData();
  }, [user]);

  const refresh = () => {
    fetchTierData();
  };

  const isPro = tierData?.tier === 'pro' || tierData?.tier === 'elite';
  const isElite = tierData?.tier === 'elite';
  const canCustomizeDashboard = isPro || isElite;

  return {
    ...tierData,
    tier: tierData?.tier || 'free',
    isLoading,
    isPro,
    isElite,
    canCustomizeDashboard,
    refresh,
  };
};
