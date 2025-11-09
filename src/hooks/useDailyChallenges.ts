import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Target, TrendingUp, Zap, Trophy, Flame, type LucideIcon } from 'lucide-react';
import { useXPSystem } from './useXPSystem';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Challenge {
  id: string;
  type: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  isCompleted: boolean;
  icon: LucideIcon;
}

const CHALLENGE_TEMPLATES = [
  {
    type: 'trade_count',
    title: 'Active Trader',
    description: 'Execute 5 trades today',
    target: 5,
    xpReward: 50,
    icon: TrendingUp
  },
  {
    type: 'win_rate',
    title: 'Winning Streak',
    description: 'Win 3 consecutive trades',
    target: 3,
    xpReward: 75,
    icon: Trophy
  },
  {
    type: 'profit_target',
    title: 'Profit Hunter',
    description: 'Earn $100 in profit today',
    target: 100,
    xpReward: 100,
    icon: Target
  },
  {
    type: 'journal_entry',
    title: 'Reflection Master',
    description: 'Write a journal entry',
    target: 1,
    xpReward: 25,
    icon: Zap
  },
  {
    type: 'daily_login',
    title: 'Consistency Champion',
    description: 'Log in for 5 days in a row',
    target: 5,
    xpReward: 150,
    icon: Flame
  }
];

export const useDailyChallenges = () => {
  const { user } = useAuth();
  const { addXP } = useXPSystem();
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading: loading } = useQuery({
    queryKey: ['daily-challenges', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const today = new Date().toISOString().split('T')[0];

      // Check if challenges exist for today
      let { data: existing } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_date', today);

      if (!existing || existing.length === 0) {
        // Create today's challenges (select 3 random challenges)
        const selectedTemplates = CHALLENGE_TEMPLATES
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const newChallenges = selectedTemplates.map(template => ({
          user_id: user.id,
          challenge_type: template.type,
          challenge_date: today,
          target_value: template.target,
          current_progress: 0,
          xp_reward: template.xpReward,
          is_completed: false
        }));

        await supabase.from('daily_challenges').insert(newChallenges);

        // Fetch the newly created challenges
        const { data } = await supabase
          .from('daily_challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('challenge_date', today);

        existing = data;
      }

      const formattedChallenges: Challenge[] = (existing || []).map(challenge => {
        const template = CHALLENGE_TEMPLATES.find(t => t.type === challenge.challenge_type);
        return {
          id: challenge.id,
          type: challenge.challenge_type,
          title: template?.title || 'Challenge',
          description: template?.description || '',
          progress: challenge.current_progress,
          target: challenge.target_value,
          xpReward: challenge.xp_reward,
          isCompleted: challenge.is_completed,
          icon: template?.icon || Target
        };
      });

      return formattedChallenges;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const updateChallengeProgress = useCallback(async (
    challengeType: string,
    progress: number
  ) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const challenge = challenges.find(c => c.type === challengeType);
      if (!challenge || challenge.isCompleted) return;

      const newProgress = Math.min(progress, challenge.target);
      const isCompleted = newProgress >= challenge.target;

      const { error } = await supabase
        .from('daily_challenges')
        .update({
          current_progress: newProgress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('user_id', user.id)
        .eq('challenge_type', challengeType)
        .eq('challenge_date', today);

      if (error) throw error;

      if (isCompleted && !challenge.isCompleted) {
        await addXP(challenge.xpReward, 'challenge_completed', challenge.title);
      }

      // Refresh challenges
      queryClient.invalidateQueries({ queryKey: ['daily-challenges', user.id] });
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  }, [user, challenges, addXP, queryClient]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['daily-challenges', user?.id] });
  }, [queryClient, user]);

  return {
    challenges,
    loading,
    updateChallengeProgress,
    refresh
  };
};
