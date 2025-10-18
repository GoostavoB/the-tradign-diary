-- Create trading_expenses table
CREATE TABLE IF NOT EXISTS public.trading_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trading_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own expenses"
  ON public.trading_expenses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses"
  ON public.trading_expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.trading_expenses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.trading_expenses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_trading_expenses_updated_at
  BEFORE UPDATE ON public.trading_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_trading_expenses_user_date ON public.trading_expenses(user_id, expense_date DESC);

-- Add comments
COMMENT ON TABLE public.trading_expenses IS 'Trading-related expenses tracking';
COMMENT ON COLUMN public.trading_expenses.recurring IS 'Whether this is a recurring monthly expense';
COMMENT ON COLUMN public.trading_expenses.category IS 'Expense category (Platform Fees, Data Subscription, etc.)';