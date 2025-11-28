-- Add deleted_at column to trades table for soft deletes
ALTER TABLE public.trades
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for faster queries on deleted trades
CREATE INDEX idx_trades_deleted_at ON public.trades(deleted_at) WHERE deleted_at IS NOT NULL;

-- Enable pg_cron extension for scheduled cleanup
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to permanently delete trades older than 48 hours
CREATE OR REPLACE FUNCTION public.cleanup_deleted_trades()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.trades
  WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '48 hours';
END;
$$;

-- Schedule the cleanup function to run every hour
SELECT cron.schedule(
  'cleanup-deleted-trades',
  '0 * * * *', -- Every hour at minute 0
  $$SELECT public.cleanup_deleted_trades();$$
);