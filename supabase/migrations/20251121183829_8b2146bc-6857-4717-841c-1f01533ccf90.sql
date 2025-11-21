-- Add sub_account_id to tables for per-sub-account customization
-- Part 1: trading_goals

ALTER TABLE public.trading_goals 
ADD COLUMN IF NOT EXISTS sub_account_id UUID REFERENCES public.sub_accounts(id) ON DELETE CASCADE;

-- Set default sub_account_id for existing goals
UPDATE public.trading_goals g
SET sub_account_id = (
  SELECT id FROM public.sub_accounts 
  WHERE user_id = g.user_id 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE sub_account_id IS NULL;

-- Make sub_account_id NOT NULL
ALTER TABLE public.trading_goals 
ALTER COLUMN sub_account_id SET NOT NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_trading_goals_sub_account_id ON public.trading_goals(sub_account_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can create their own trading goals" ON public.trading_goals;
DROP POLICY IF EXISTS "Users can delete their own trading goals" ON public.trading_goals;
DROP POLICY IF EXISTS "Users can update their own trading goals" ON public.trading_goals;
DROP POLICY IF EXISTS "Users can view their own trading goals" ON public.trading_goals;

CREATE POLICY "Users can create goals for their sub-accounts"
ON public.trading_goals FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.sub_accounts 
    WHERE id = trading_goals.sub_account_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view goals for their sub-accounts"
ON public.trading_goals FOR SELECT
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.sub_accounts 
    WHERE id = trading_goals.sub_account_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update goals for their sub-accounts"
ON public.trading_goals FOR UPDATE
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.sub_accounts 
    WHERE id = trading_goals.sub_account_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete goals for their sub-accounts"
ON public.trading_goals FOR DELETE
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.sub_accounts 
    WHERE id = trading_goals.sub_account_id 
    AND user_id = auth.uid()
  )
);

COMMENT ON COLUMN public.trading_goals.sub_account_id IS 'Links goal to specific sub-account for complete isolation';