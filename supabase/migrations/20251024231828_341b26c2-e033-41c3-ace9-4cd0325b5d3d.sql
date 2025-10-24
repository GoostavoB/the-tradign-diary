-- Add new fields to trading_plans table for reformulated plan structure
ALTER TABLE public.trading_plans 
ADD COLUMN IF NOT EXISTS currency_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS trade_setups TEXT,
ADD COLUMN IF NOT EXISTS checklist TEXT;

-- Migrate existing markets data to currency_types if needed
UPDATE public.trading_plans 
SET currency_types = markets 
WHERE currency_types = '{}' AND markets IS NOT NULL AND markets != '{}';