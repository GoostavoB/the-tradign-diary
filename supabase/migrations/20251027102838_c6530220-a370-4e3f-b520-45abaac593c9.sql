-- Create withdrawal_log table
CREATE TABLE IF NOT EXISTS public.withdrawal_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_withdrawn NUMERIC NOT NULL CHECK (amount_withdrawn > 0),
  withdrawal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_after NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.withdrawal_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own withdrawal log"
  ON public.withdrawal_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawal log"
  ON public.withdrawal_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own withdrawal log"
  ON public.withdrawal_log
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own withdrawal log"
  ON public.withdrawal_log
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_withdrawal_log_user_date ON public.withdrawal_log(user_id, withdrawal_date DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_withdrawal_log_updated_at
  BEFORE UPDATE ON public.withdrawal_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();