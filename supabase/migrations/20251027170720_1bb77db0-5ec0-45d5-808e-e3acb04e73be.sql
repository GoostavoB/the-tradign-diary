-- Fix margin calculation for existing trades
-- For trades with ROI data, reverse-engineer the correct margin from P&L and ROI
-- This assumes the ROI percentage stored is accurate (from the broker)

UPDATE trades
SET margin = CASE 
  WHEN roi IS NOT NULL AND roi != 0 THEN ABS(profit_loss / (roi / 100))
  ELSE margin
END
WHERE closed_at IS NOT NULL
  AND roi IS NOT NULL 
  AND roi != 0
  AND profit_loss IS NOT NULL;

-- Recalculate ROI for all closed trades to ensure consistency
UPDATE trades
SET roi = CASE 
  WHEN margin > 0 AND profit_loss IS NOT NULL THEN (profit_loss / margin) * 100
  ELSE 0
END
WHERE closed_at IS NOT NULL;