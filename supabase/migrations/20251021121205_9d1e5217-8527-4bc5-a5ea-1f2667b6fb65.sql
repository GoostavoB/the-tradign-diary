-- Create trading_journal table
CREATE TABLE IF NOT EXISTS public.trading_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('confident', 'anxious', 'neutral', 'excited', 'frustrated')),
  tags TEXT[] DEFAULT '{}',
  lessons_learned TEXT,
  what_went_well TEXT,
  what_to_improve TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_trading_journal_user_id ON public.trading_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_journal_trade_id ON public.trading_journal(trade_id);
CREATE INDEX IF NOT EXISTS idx_trading_journal_created_at ON public.trading_journal(created_at DESC);

-- Enable RLS
ALTER TABLE public.trading_journal ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own journal entries"
  ON public.trading_journal
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
  ON public.trading_journal
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON public.trading_journal
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON public.trading_journal
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_trading_journal_updated_at
  BEFORE UPDATE ON public.trading_journal
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();