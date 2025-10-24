-- Create table for tracking social shares and rewards
CREATE TABLE IF NOT EXISTS public.social_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('Twitter', 'LinkedIn', 'Facebook')),
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  week_start DATE NOT NULL, -- Monday of the week
  rewards_claimed BOOLEAN NOT NULL DEFAULT false,
  rewards_amount INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_social_shares_user_week ON public.social_shares(user_id, week_start);
CREATE INDEX idx_social_shares_platform ON public.social_shares(platform);

-- Enable RLS
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own shares"
ON public.social_shares
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shares"
ON public.social_shares
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to get the start of the current week (Monday)
CREATE OR REPLACE FUNCTION public.get_week_start(date_input DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
  -- Get Monday of the current week
  RETURN date_input - ((EXTRACT(DOW FROM date_input)::INTEGER + 6) % 7);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if user can share on platform this week
CREATE OR REPLACE FUNCTION public.can_share_this_week(
  p_user_id UUID,
  p_platform TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_week_start DATE;
  v_share_count INTEGER;
BEGIN
  v_week_start := public.get_week_start(CURRENT_DATE);
  
  SELECT COUNT(*)
  INTO v_share_count
  FROM public.social_shares
  WHERE user_id = p_user_id
    AND platform = p_platform
    AND week_start = v_week_start;
  
  RETURN v_share_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a social share and grant rewards
CREATE OR REPLACE FUNCTION public.record_social_share(
  p_platform TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_week_start DATE;
  v_can_share BOOLEAN;
  v_rewards INTEGER := 2;
  v_share_id UUID;
  v_current_credits INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  v_week_start := public.get_week_start(CURRENT_DATE);
  
  -- Check if user can share on this platform this week
  v_can_share := public.can_share_this_week(v_user_id, p_platform);
  
  IF NOT v_can_share THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Already shared on ' || p_platform || ' this week',
      'rewards', 0
    );
  END IF;
  
  -- Record the share
  INSERT INTO public.social_shares (
    user_id,
    platform,
    week_start,
    rewards_claimed,
    rewards_amount
  ) VALUES (
    v_user_id,
    p_platform,
    v_week_start,
    true,
    v_rewards
  )
  RETURNING id INTO v_share_id;
  
  -- Grant upload credits (add to user's credits)
  UPDATE public.user_settings
  SET upload_credits = COALESCE(upload_credits, 0) + v_rewards
  WHERE user_id = v_user_id
  RETURNING upload_credits INTO v_current_credits;
  
  -- If user_settings doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO public.user_settings (user_id, upload_credits)
    VALUES (v_user_id, v_rewards)
    ON CONFLICT (user_id) DO UPDATE
    SET upload_credits = COALESCE(user_settings.upload_credits, 0) + v_rewards
    RETURNING upload_credits INTO v_current_credits;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Share recorded successfully',
    'rewards', v_rewards,
    'total_credits', v_current_credits,
    'share_id', v_share_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;