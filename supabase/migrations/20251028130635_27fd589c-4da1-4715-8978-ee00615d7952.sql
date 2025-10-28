-- Migration: XP Tier System - Phase 1 Week 1
-- Creates core tables for tier-based monetization system

-- 1. Create user_xp_tiers table to track daily XP progress and caps
CREATE TABLE IF NOT EXISTS public.user_xp_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_tier INTEGER NOT NULL DEFAULT 0,
  daily_xp_earned INTEGER NOT NULL DEFAULT 0,
  daily_xp_cap INTEGER NOT NULL DEFAULT 750,
  daily_upload_limit INTEGER NOT NULL DEFAULT 1,
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_xp_tiers ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own tier data
CREATE POLICY "Users can view own tier data"
  ON public.user_xp_tiers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tier data"
  ON public.user_xp_tiers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tier data"
  ON public.user_xp_tiers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_xp_tiers_user_id ON public.user_xp_tiers(user_id);

-- 2. Add daily cap columns to subscriptions table (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'subscriptions' AND column_name = 'daily_xp_cap') THEN
    ALTER TABLE public.subscriptions ADD COLUMN daily_xp_cap INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'subscriptions' AND column_name = 'daily_upload_limit') THEN
    ALTER TABLE public.subscriptions ADD COLUMN daily_upload_limit INTEGER;
  END IF;
END $$;

-- Backfill existing subscriptions with tier-based defaults
UPDATE public.subscriptions
SET 
  daily_xp_cap = CASE 
    WHEN plan_type = 'elite' THEN 999999 
    WHEN plan_type = 'pro' THEN 1500 
    ELSE 750 
  END,
  daily_upload_limit = CASE 
    WHEN plan_type = 'elite' THEN 20 
    WHEN plan_type = 'pro' THEN 5 
    ELSE 1 
  END
WHERE daily_xp_cap IS NULL OR daily_upload_limit IS NULL;

-- 3. Create trade_emotions junction table for emotion tagging
CREATE TABLE IF NOT EXISTS public.trade_emotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.trade_emotions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own trade emotions
CREATE POLICY "Users can view own trade emotions"
  ON public.trade_emotions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trade emotions"
  ON public.trade_emotions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trade emotions"
  ON public.trade_emotions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_trade_emotions_trade_id ON public.trade_emotions(trade_id);
CREATE INDEX idx_trade_emotions_user_id ON public.trade_emotions(user_id);

-- 4. Create tier_preview_unlocks table (one-time modal triggers)
CREATE TABLE IF NOT EXISTS public.tier_preview_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_previewed INTEGER NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tier_previewed)
);

-- Enable RLS
ALTER TABLE public.tier_preview_unlocks ENABLE ROW LEVEL SECURITY;

-- Users can view and insert their own preview unlocks
CREATE POLICY "Users can view own tier previews"
  ON public.tier_preview_unlocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tier previews"
  ON public.tier_preview_unlocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_tier_preview_unlocks_user_id ON public.tier_preview_unlocks(user_id);

-- 5. Create daily reset function to reset daily_xp_earned at midnight UTC
CREATE OR REPLACE FUNCTION public.reset_daily_xp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_xp_tiers
  SET 
    daily_xp_earned = 0,
    last_reset_at = NOW()
  WHERE last_reset_at < DATE_TRUNC('day', NOW());
END;
$$;

-- 6. Initialize user_xp_tiers for existing users based on their current XP level
INSERT INTO public.user_xp_tiers (user_id, current_tier, daily_xp_cap, daily_upload_limit)
SELECT 
  uxl.user_id,
  CASE 
    WHEN uxl.total_xp_earned >= 25000 THEN 4
    WHEN uxl.total_xp_earned >= 10000 THEN 3
    WHEN uxl.total_xp_earned >= 4000 THEN 2
    WHEN uxl.total_xp_earned >= 1000 THEN 1
    ELSE 0
  END as current_tier,
  COALESCE(s.daily_xp_cap, 750) as daily_xp_cap,
  COALESCE(s.daily_upload_limit, 1) as daily_upload_limit
FROM public.user_xp_levels uxl
LEFT JOIN public.subscriptions s ON s.user_id = uxl.user_id AND s.status = 'active'
ON CONFLICT (user_id) DO NOTHING;