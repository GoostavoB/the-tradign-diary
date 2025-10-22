import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface XPData {
  currentXP: number;
  currentLevel: number;
  totalXPEarned: number;
  levelUpCount: number;
}

const XP_PER_LEVEL_BASE = 100;
const XP_GROWTH_RATE = 1.5;

export const calculateXPForLevel = (level: number): number => {
  return Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_GROWTH_RATE, level - 1));
};

export const calculateLevelFromXP = (totalXP: number): { level: number; currentXP: number } => {
  let level = 1;
  let xpForCurrentLevel = 0;
  
  while (totalXP >= xpForCurrentLevel + calculateXPForLevel(level)) {
    xpForCurrentLevel += calculateXPForLevel(level);
    level++;
  }
  
  return {
    level,
    currentXP: totalXP - xpForCurrentLevel
  };
};

export const useXPSystem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelRef, setNewLevelRef] = useState<number | null>(null);

  const { data: xpData = {
    currentXP: 0,
    currentLevel: 1,
    totalXPEarned: 0,
    levelUpCount: 0
  }, isLoading: loading } = useQuery({
    queryKey: ['user-xp', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_xp_levels')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        return {
          currentXP: data.current_xp,
          currentLevel: data.current_level,
          totalXPEarned: data.total_xp_earned,
          levelUpCount: data.level_up_count
        };
      }

      // Initialize XP data for new user
      const { error: insertError } = await supabase
        .from('user_xp_levels')
        .insert({
          user_id: user.id,
          current_xp: 0,
          current_level: 1,
          total_xp_earned: 0,
          level_up_count: 0
        });

      if (insertError) throw insertError;

      return {
        currentXP: 0,
        currentLevel: 1,
        totalXPEarned: 0,
        levelUpCount: 0
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const addXP = useCallback(async (
    amount: number, 
    activityType: string, 
    description?: string
  ) => {
    if (!user || amount <= 0) return;

    try {
      // Check for streak multiplier
      const { data: progression } = await supabase
        .from('user_progression')
        .select('daily_streak')
        .eq('user_id', user.id)
        .single();

      let multiplier = 1;
      const streak = progression?.daily_streak || 0;
      
      if (streak >= 30) multiplier = 2.0;
      else if (streak >= 14) multiplier = 1.5;
      else if (streak >= 7) multiplier = 1.25;
      else if (streak >= 3) multiplier = 1.1;

      const finalAmount = Math.floor(amount * multiplier);

      const newTotalXP = xpData.totalXPEarned + finalAmount;
      const { level: newLevel, currentXP: newCurrentXP } = calculateLevelFromXP(newTotalXP);
      const didLevelUp = newLevel > xpData.currentLevel;

      // Update XP data
      const { error: updateError } = await supabase
        .from('user_xp_levels')
        .update({
          current_xp: newCurrentXP,
          current_level: newLevel,
          total_xp_earned: newTotalXP,
          level_up_count: didLevelUp ? xpData.levelUpCount + 1 : xpData.levelUpCount,
          last_xp_earned_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log activity
      const { error: logError } = await supabase
        .from('xp_activity_log')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          xp_earned: finalAmount,
          description: description || `Earned ${finalAmount} XP from ${activityType}${multiplier > 1 ? ` (${multiplier}x streak bonus)` : ''}`
        });

      if (logError) throw logError;

      // Update local state
      queryClient.setQueryData(['user-xp', user.id], {
        currentXP: newCurrentXP,
        currentLevel: newLevel,
        totalXPEarned: newTotalXP,
        levelUpCount: didLevelUp ? xpData.levelUpCount + 1 : xpData.levelUpCount
      });

      // Show notifications
      if (didLevelUp) {
        setNewLevelRef(newLevel);
        setShowLevelUp(true);
        
        toast.success(`🎉 Level Up! You're now level ${newLevel}!`, {
          description: `Keep trading to reach level ${newLevel + 1}`,
          duration: 5000
        });

        // Award freeze token every 5 levels
        if (newLevel % 5 === 0) {
          const { data: inventory } = await supabase
            .from('streak_freeze_inventory')
            .select('freeze_tokens, earned_from_level')
            .eq('user_id', user.id)
            .single();

          if (inventory) {
            await supabase
              .from('streak_freeze_inventory')
              .update({
                freeze_tokens: inventory.freeze_tokens + 1,
                earned_from_level: inventory.earned_from_level + 1,
              })
              .eq('user_id', user.id);
          } else {
            await supabase
              .from('streak_freeze_inventory')
              .insert({
                user_id: user.id,
                freeze_tokens: 1,
                earned_from_level: 1,
                earned_from_streak: 0,
              });
          }

          toast.success('Bonus! You earned a Streak Freeze token! 🧊', {
            duration: 4000,
          });
        }
      } else {
        toast.success(`+${finalAmount} XP${multiplier > 1 ? ` (${multiplier}x)` : ''}`, {
          description: description || activityType,
          duration: 2000,
          icon: '⚡'
        });
      }
    } catch (error) {
      console.error('Error adding XP:', error);
      toast.error('Failed to award XP');
    }
  }, [user, xpData]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['user-xp', user?.id] });
  }, [queryClient, user]);

  const getXPForNextLevel = useCallback(() => {
    return calculateXPForLevel(xpData.currentLevel);
  }, [xpData.currentLevel]);

  return {
    xpData,
    loading,
    addXP,
    getXPForNextLevel,
    showLevelUp,
    setShowLevelUp,
    newLevel: newLevelRef,
    refresh
  };
};
