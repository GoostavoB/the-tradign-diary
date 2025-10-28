-- =====================================================
-- Track Daily Challenge Completion
-- Increments user_daily_activity.challenges_completed
-- when a challenge is marked as complete
-- =====================================================

CREATE OR REPLACE FUNCTION public.increment_challenges_counter(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_daily_activity (
    user_id,
    activity_date,
    challenges_completed,
    last_updated_at
  )
  VALUES (
    p_user_id,
    CURRENT_DATE,
    1,
    NOW()
  )
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    challenges_completed = user_daily_activity.challenges_completed + 1,
    last_updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.increment_challenges_counter IS 
  'Increments the challenges_completed counter in user_daily_activity for daily engagement tracking';