-- Add xp_awarded column to trades table to track if XP has been given
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS xp_awarded boolean NOT NULL DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_xp_awarded ON public.trades(user_id, xp_awarded) WHERE xp_awarded = false;