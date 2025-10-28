-- =====================================================
-- Track Trade Activity Trigger
-- Automatically increments user_daily_activity.trades_uploaded
-- whenever a new trade is inserted
-- =====================================================

CREATE OR REPLACE FUNCTION public.track_trade_activity()
RETURNS TRIGGER AS $$
DECLARE
  user_timezone TEXT;
  user_local_date DATE;
BEGIN
  -- Get user's timezone (defaults to UTC if not set)
  SELECT COALESCE(last_login_timezone, 'UTC') INTO user_timezone
  FROM public.user_xp_tiers
  WHERE user_id = NEW.user_id;
  
  -- Calculate user's local date in their timezone
  user_local_date := (NOW() AT TIME ZONE user_timezone)::DATE;
  
  -- Upsert daily activity record
  INSERT INTO public.user_daily_activity (
    user_id,
    activity_date,
    trades_uploaded,
    last_updated_at
  )
  VALUES (
    NEW.user_id,
    user_local_date,
    1,
    NOW()
  )
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    trades_uploaded = user_daily_activity.trades_uploaded + 1,
    last_updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to trades table
DROP TRIGGER IF EXISTS track_trade_upload ON public.trades;
CREATE TRIGGER track_trade_upload
  AFTER INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.track_trade_activity();

-- Add helpful comments
COMMENT ON FUNCTION public.track_trade_activity IS 
  'Automatically tracks trade uploads in user_daily_activity table for daily engagement reminders. Uses user timezone for accurate date tracking.';

COMMENT ON TRIGGER track_trade_upload ON public.trades IS
  'Increments daily trade counter for engagement tracking system';