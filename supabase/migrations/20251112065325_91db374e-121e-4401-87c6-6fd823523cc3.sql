-- Add Rolling Target Tracker settings to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS rolling_target_percent numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS rolling_target_mode text DEFAULT 'per-day',
ADD COLUMN IF NOT EXISTS rolling_target_carryover_cap numeric DEFAULT 2.0,
ADD COLUMN IF NOT EXISTS rolling_target_suggestion_method text DEFAULT 'median',
ADD COLUMN IF NOT EXISTS rolling_target_suggestions_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS rolling_target_rollover_weekends boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS rolling_target_last_suggestion_date timestamptz,
ADD COLUMN IF NOT EXISTS rolling_target_dismissed_suggestion boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN user_settings.rolling_target_percent IS 'Target daily growth percentage for Rolling Target Tracker';
COMMENT ON COLUMN user_settings.rolling_target_mode IS 'Tracking mode: per-day, rolling, or rolling-with-carryover';
COMMENT ON COLUMN user_settings.rolling_target_carryover_cap IS 'Maximum percentage of previous day target that can carry over';
COMMENT ON COLUMN user_settings.rolling_target_suggestion_method IS 'Method for auto-suggestions: median, average, or historical';
COMMENT ON COLUMN user_settings.rolling_target_suggestions_enabled IS 'Whether automatic target suggestions are enabled';
COMMENT ON COLUMN user_settings.rolling_target_rollover_weekends IS 'Whether to roll over weekend targets to Monday';
COMMENT ON COLUMN user_settings.rolling_target_last_suggestion_date IS 'Last date a suggestion was shown to the user';
COMMENT ON COLUMN user_settings.rolling_target_dismissed_suggestion IS 'Whether user dismissed the last suggestion';