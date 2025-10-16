-- Create upload_batches table to track trade upload history
CREATE TABLE IF NOT EXISTS public.upload_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trade_count INTEGER NOT NULL DEFAULT 0,
  assets TEXT[] NOT NULL DEFAULT '{}',
  total_entry_value NUMERIC NOT NULL DEFAULT 0,
  most_recent_trade_id UUID,
  most_recent_trade_asset TEXT,
  most_recent_trade_value NUMERIC,
  CONSTRAINT upload_batches_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.upload_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own upload batches"
  ON public.upload_batches
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own upload batches"
  ON public.upload_batches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own upload batches"
  ON public.upload_batches
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_upload_batches_user_created 
  ON public.upload_batches(user_id, created_at DESC);