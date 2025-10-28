import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { analytics } from '@/utils/analytics';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category_id: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  is_secret: boolean;
  max_progress: number;
  display_order: number;
}

export interface AchievementProgress {
  achievement_id: string;
  current_progress: number;
  max_progress: number;
  completed: boolean;
  achievement: Achievement;
}

export interface AchievementCategory {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  sort_order: number;
}

export const useAchievementProgress = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<Record<string, AchievementProgress>>({});
  const [categories, setCategories] = useState<AchievementCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
      loadProgress();
      loadCategories();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('achievement_categories' as any)
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data as any || []);
    } catch (error) {
      console.error('Error loading achievement categories:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements' as any)
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setAchievements(data as any || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get all achievements with progress
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements' as any)
        .select('*');

      if (achievementsError) throw achievementsError;

      // Get user's progress
      const { data: progressData, error: progressError } = await supabase
        .from('achievement_progress' as any)
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Get user's completed badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges' as any)
        .select('achievement_id')
        .eq('user_id', user.id);

      if (badgesError) throw badgesError;

      const completedIds = new Set((badgesData as any)?.map((b: any) => b.achievement_id) || []);

      // Combine data
      const progressMap: Record<string, AchievementProgress> = {};
      
      (achievementsData as any)?.forEach((achievement: any) => {
        const userProgress = (progressData as any)?.find((p: any) => p.achievement_id === achievement.id);
        const isCompleted = completedIds.has(achievement.id);

        progressMap[achievement.id] = {
          achievement_id: achievement.id,
          current_progress: userProgress?.current_progress || 0,
          max_progress: achievement.max_progress || 1,
          completed: isCompleted,
          achievement: achievement as Achievement
        };
      });

      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading achievement progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = useCallback(async (achievementId: string, increment: number = 1) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('update_achievement_progress' as any, {
        p_user_id: user.id,
        p_achievement_id: achievementId,
        p_increment: increment
      });

      if (error) throw error;

      const result = (data as any)?.[0];
      if (result?.completed) {
        const achievement = achievements.find(a => a.id === achievementId);
        
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#ec4899', '#f59e0b']
        });

        // Show toast
        toast.success(`🏆 Achievement Unlocked!`, {
          description: achievement?.name || 'New achievement completed!'
        });

        // Track analytics
        analytics.track('achievement_completed', {
          user_id: user.id,
          achievement_id: achievementId,
          achievement_name: achievement?.name,
          xp_reward: achievement?.xp_reward || 0
        });
      }

      // Reload progress
      await loadProgress();

      return result;
    } catch (error) {
      console.error('Error updating achievement progress:', error);
    }
  }, [user, achievements]);

  const getProgressByCategory = (categoryId: string) => {
    return Object.values(progress).filter(
      p => p.achievement.category_id === categoryId
    );
  };

  const getCompletionRate = () => {
    const total = Object.keys(progress).length;
    const completed = Object.values(progress).filter(p => p.completed).length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  return {
    achievements,
    progress,
    categories,
    loading,
    updateProgress,
    loadProgress,
    getProgressByCategory,
    getCompletionRate
  };
};
