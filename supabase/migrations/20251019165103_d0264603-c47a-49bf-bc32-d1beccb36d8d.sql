-- Create capital_log table to track capital additions and changes over time
CREATE TABLE public.capital_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_added NUMERIC NOT NULL,
  total_after NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.capital_log ENABLE ROW LEVEL SECURITY;

-- Create policies for capital_log
CREATE POLICY "Users can view own capital log"
  ON public.capital_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own capital log"
  ON public.capital_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own capital log"
  ON public.capital_log
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own capital log"
  ON public.capital_log
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_capital_log_user_date ON public.capital_log(user_id, log_date DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_capital_log_updated_at
  BEFORE UPDATE ON public.capital_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comment on table
COMMENT ON TABLE public.capital_log IS 'Tracks historical capital additions and changes for accurate period-based ROI calculations';