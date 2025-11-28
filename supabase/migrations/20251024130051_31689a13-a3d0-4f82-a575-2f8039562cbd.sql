-- Add error_description column to trades table for tracking mistakes and lessons learned
ALTER TABLE public.trades 
ADD COLUMN error_description TEXT;

-- Add index for querying trades with errors
CREATE INDEX idx_trades_with_errors ON public.trades (error_description) 
WHERE error_description IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.trades.error_description IS 'User-entered description of mistakes or lessons learned from this trade';