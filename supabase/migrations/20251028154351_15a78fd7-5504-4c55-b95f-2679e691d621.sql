-- ============================================
-- PHASE 1: ADD MISSING ACTIVITY TRACKERS
-- ============================================

-- Trigger 1: Track Emotional Logs
CREATE OR REPLACE FUNCTION public.track_emotional_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    emotional_logs_created,
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
    emotional_logs_created = user_daily_activity.emotional_logs_created + 1,
    last_updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Create trigger for emotional logs
DROP TRIGGER IF EXISTS track_emotional_log_trigger ON psychology_logs;
CREATE TRIGGER track_emotional_log_trigger
  AFTER INSERT ON psychology_logs
  FOR EACH ROW
  EXECUTE FUNCTION track_emotional_log();

-- Trigger 2: Track Journal Entries
CREATE OR REPLACE FUNCTION public.track_journal_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    journal_entries_created,
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
    journal_entries_created = user_daily_activity.journal_entries_created + 1,
    last_updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Create trigger for journal entries
DROP TRIGGER IF EXISTS track_journal_entry_trigger ON trading_journal;
CREATE TRIGGER track_journal_entry_trigger
  AFTER INSERT ON trading_journal
  FOR EACH ROW
  EXECUTE FUNCTION track_journal_entry();