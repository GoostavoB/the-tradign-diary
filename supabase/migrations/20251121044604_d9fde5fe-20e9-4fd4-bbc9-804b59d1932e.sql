-- Step 1: Calculate entry_price for trades missing it (where exit_price and pnl exist)
UPDATE trades
SET entry_price = CASE
  WHEN (entry_price IS NULL OR entry_price = 0) 
    AND exit_price IS NOT NULL 
    AND exit_price > 0
    AND position_size IS NOT NULL 
    AND position_size > 0
    AND pnl IS NOT NULL 
    AND pnl != 0 THEN
    CASE
      WHEN side = 'long' THEN exit_price - (pnl / NULLIF(position_size, 0))
      WHEN side = 'short' THEN exit_price + (pnl / NULLIF(position_size, 0))
      ELSE entry_price
    END
  ELSE entry_price
END
WHERE (entry_price IS NULL OR entry_price = 0)
  AND exit_price IS NOT NULL
  AND exit_price > 0
  AND position_size IS NOT NULL
  AND position_size > 0
  AND pnl IS NOT NULL;

-- Step 2: Recalculate margin for all trades where entry_price now exists
UPDATE trades
SET margin = (position_size * entry_price) / COALESCE(NULLIF(leverage, 0), 1)
WHERE (margin IS NULL OR margin = 0)
  AND entry_price IS NOT NULL 
  AND entry_price > 0
  AND position_size IS NOT NULL
  AND position_size > 0;

-- Step 3: Recalculate ROI for all trades with valid margin
UPDATE trades
SET roi = ROUND(((pnl / NULLIF(margin, 0)) * 100)::numeric, 2)
WHERE margin IS NOT NULL 
  AND margin > 0 
  AND pnl IS NOT NULL
  AND (roi IS NULL OR roi = 0);