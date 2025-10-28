-- Daily Rewards System
-- Track daily login rewards and streaks

-- Add daily rewards tracking to user_xp_tiers
ALTER TABLE public.user_xp_tiers
ADD COLUMN IF NOT EXISTS consecutive_login_days INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reward_claimed_date DATE,
ADD COLUMN IF NOT EXISTS total_rewards_claimed INT DEFAULT 0;

-- Create daily_rewards_log table to track reward history
CREATE TABLE IF NOT EXISTS public.daily_rewards_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_date DATE NOT NULL,
  consecutive_days INT NOT NULL DEFAULT 1,
  xp_awarded INT NOT NULL DEFAULT 0,
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.0,
  reward_tier INT DEFAULT 0,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on daily_rewards_log
ALTER TABLE public.daily_rewards_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_rewards_log
CREATE POLICY "Users can view their own rewards"
  ON public.daily_rewards_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards"
  ON public.daily_rewards_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_date 
  ON public.daily_rewards_log(user_id, reward_date DESC);

-- Create function to calculate daily reward
CREATE OR REPLACE FUNCTION public.calculate_daily_reward(p_consecutive_days INT, p_user_tier INT)
RETURNS TABLE (
  xp_reward INT,
  bonus_multiplier DECIMAL,
  reward_tier INT
) AS $$
BEGIN
  -- Base rewards scale with consecutive days
  -- Day 1: 50 XP
  -- Day 2-6: 75 XP
  -- Day 7: 200 XP (Weekly bonus)
  -- Day 8-13: 100 XP
  -- Day 14: 300 XP (Bi-weekly bonus)
  -- Day 15-29: 125 XP
  -- Day 30+: 500 XP (Monthly milestone)
  
  RETURN QUERY
  SELECT 
    CASE
      WHEN p_consecutive_days = 1 THEN 50
      WHEN p_consecutive_days >= 2 AND p_consecutive_days <= 6 THEN 75
      WHEN p_consecutive_days = 7 THEN 200
      WHEN p_consecutive_days >= 8 AND p_consecutive_days <= 13 THEN 100
      WHEN p_consecutive_days = 14 THEN 300
      WHEN p_consecutive_days >= 15 AND p_consecutive_days <= 29 THEN 125
      WHEN p_consecutive_days >= 30 THEN 500
      ELSE 50
    END AS xp_reward,
    CASE
      WHEN p_user_tier >= 3 THEN 1.5::DECIMAL
      WHEN p_user_tier >= 2 THEN 1.25::DECIMAL
      ELSE 1.0::DECIMAL
    END AS bonus_multiplier,
    CASE
      WHEN p_consecutive_days >= 30 THEN 4
      WHEN p_consecutive_days >= 14 THEN 3
      WHEN p_consecutive_days >= 7 THEN 2
      ELSE 1
    END AS reward_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;