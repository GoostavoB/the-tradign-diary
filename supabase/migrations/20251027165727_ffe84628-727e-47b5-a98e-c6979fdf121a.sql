-- Recalculate and populate margin field for all existing trades
-- Formula: margin = (position_size * entry_price) / leverage

UPDATE public.trades
SET margin = (position_size * entry_price) / NULLIF(leverage, 0)
WHERE position_size IS NOT NULL 
  AND entry_price IS NOT NULL 
  AND leverage IS NOT NULL 
  AND leverage > 0;

-- Recalculate ROI for all trades based on correct margin
-- Formula: roi = (profit_loss / margin) * 100

UPDATE public.trades
SET roi = (profit_loss / NULLIF(margin, 0)) * 100
WHERE margin IS NOT NULL 
  AND margin > 0
  AND profit_loss IS NOT NULL;