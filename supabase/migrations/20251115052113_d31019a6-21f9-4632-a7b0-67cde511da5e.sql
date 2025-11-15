-- Drop the old constraint that doesn't include 'capital'
ALTER TABLE public.trading_goals
  DROP CONSTRAINT IF EXISTS trading_goals_goal_type_check;

-- Add the updated constraint that includes 'capital'
ALTER TABLE public.trading_goals
  ADD CONSTRAINT trading_goals_goal_type_check
  CHECK (goal_type = ANY (ARRAY['capital'::text, 'profit'::text, 'win_rate'::text, 'trades'::text, 'streak'::text, 'roi'::text]));