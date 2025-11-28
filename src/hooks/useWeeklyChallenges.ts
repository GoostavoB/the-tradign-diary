import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Trophy, TrendingUp, Target, Award, Zap } from 'lucide-react';

export interface WeeklyChallenge {
  id: string;
  challenge_type: string;
  title: string;
  description: string;
  current_progress: number;
  target_value: number;
  xp_reward: number;
  is_completed: boolean;
  icon: any;
}

const WEEKLY_CHALLENGE_TEMPLATES = [
  {
    challenge_type: 'weekly_trade_count',
    title: 'Active Trader',
    description: 'Execute 20 trades this week',
    target_value: 20,
    xp_reward: 100,
    icon: TrendingUp,
  },
  {
    challenge_type: 'weekly_profit',
    title: 'Profit Master',
    description: 'Earn $500 profit this week',
    target_value: 500,
    xp_reward: 150,
    icon: Trophy,
  },
  {
    challenge_type: 'weekly_win_rate',
    title: 'Consistency King',
    description: 'Maintain 70% win rate this week',
    target_value: 70,
    xp_reward: 120,
    icon: Target,
  },
  {
    challenge_type: 'weekly_streak',
    title: 'Daily Dedication',
    description: 'Log trades every day this week',
    target_value: 7,
    xp_reward: 80,
    icon: Zap,
  },
];

export const useWeeklyChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  const initializeChallenges = useCallback(async () => {
    if (!user) return;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Check if challenges exist for this week
    const { data: existing } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStartStr);

    if (!existing || existing.length === 0) {
      // Create new weekly challenges
      const newChallenges = WEEKLY_CHALLENGE_TEMPLATES.map(template => ({
        user_id: user.id,
        week_start_date: weekStartStr,
        ...template,
        current_progress: 0,
        is_completed: false,
      }));

      await supabase.from('weekly_challenges').insert(newChallenges);
    }
  }, [user]);

  const fetchChallenges = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedChallenges: WeeklyChallenge[] = (data || []).map(challenge => {
        const template = WEEKLY_CHALLENGE_TEMPLATES.find(t => t.challenge_type === challenge.challenge_type);
        return {
          id: challenge.id,
          challenge_type: challenge.challenge_type,
          title: challenge.title,
          description: challenge.description,
          current_progress: challenge.current_progress,
          target_value: challenge.target_value,
          xp_reward: challenge.xp_reward,
          is_completed: challenge.is_completed,
          icon: template?.icon || Award,
        };
      });

      setChallenges(formattedChallenges);
    } catch (error) {
      console.error('Error fetching weekly challenges:', error);
      toast.error('Failed to load weekly challenges');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      initializeChallenges().then(() => fetchChallenges());
    }
  }, [user, initializeChallenges, fetchChallenges]);

  const updateChallengeProgress = async (challengeId: string, newProgress: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const isCompleted = newProgress >= challenge.target_value;

    const { error } = await supabase
      .from('weekly_challenges')
      .update({
        current_progress: newProgress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', challengeId);

    if (error) {
      toast.error('Failed to update challenge progress');
      return;
    }

    if (isCompleted && !challenge.is_completed) {
      toast.success(`Weekly Challenge Complete! +${challenge.xp_reward} XP`, {
        icon: '🎯',
        duration: 3000,
      });
    }

    fetchChallenges();
  };

  return {
    challenges,
    loading,
    updateChallengeProgress,
    refresh: fetchChallenges,
  };
};
