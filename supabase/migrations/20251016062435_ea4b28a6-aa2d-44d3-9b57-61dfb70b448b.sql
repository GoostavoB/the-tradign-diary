-- Add missing columns to trades table
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS position_type text CHECK (position_type IN ('long', 'short')),
ADD COLUMN IF NOT EXISTS profit_loss numeric,
ADD COLUMN IF NOT EXISTS funding_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS trading_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS margin numeric,
ADD COLUMN IF NOT EXISTS opened_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS closed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS period_of_day text CHECK (period_of_day IN ('morning', 'afternoon', 'night')),
ADD COLUMN IF NOT EXISTS duration_days integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration_hours integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 0;

COMMENT ON COLUMN public.trades.position_type IS 'Type of position: long or short';
COMMENT ON COLUMN public.trades.profit_loss IS 'Actual profit or loss amount';
COMMENT ON COLUMN public.trades.funding_fee IS 'Funding fee charged (if any)';
COMMENT ON COLUMN public.trades.trading_fee IS 'Trading fee charged';
COMMENT ON COLUMN public.trades.margin IS 'Margin used for the trade';
COMMENT ON COLUMN public.trades.opened_at IS 'Timestamp when trade was opened';
COMMENT ON COLUMN public.trades.closed_at IS 'Timestamp when trade was closed';
COMMENT ON COLUMN public.trades.period_of_day IS 'Period when trade started: morning (<12h), afternoon (12-18h), night (>18h)';
COMMENT ON COLUMN public.trades.duration_days IS 'Trade duration in days';
COMMENT ON COLUMN public.trades.duration_hours IS 'Trade duration in hours (after days)';
COMMENT ON COLUMN public.trades.duration_minutes IS 'Trade duration in minutes (after hours)';