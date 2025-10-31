-- Create table for weekly PNL snapshots
CREATE TABLE IF NOT EXISTS public.weekly_pnl_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_pnl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  trade_count INTEGER NOT NULL DEFAULT 0,
  winning_trades INTEGER NOT NULL DEFAULT 0,
  losing_trades INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.weekly_pnl_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own weekly snapshots"
ON public.weekly_pnl_snapshots
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly snapshots"
ON public.weekly_pnl_snapshots
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_weekly_pnl_user_week ON public.weekly_pnl_snapshots(user_id, week_start DESC);