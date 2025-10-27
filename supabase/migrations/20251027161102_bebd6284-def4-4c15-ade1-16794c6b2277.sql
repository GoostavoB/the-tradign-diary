
-- Fix miscategorized broker names
-- All trades should be BingX since user only uploaded BingX trades
UPDATE trades
SET broker = 'BingX', updated_at = NOW()
WHERE deleted_at IS NULL
  AND broker IN ('Bybit', 'Kraken', 'Bitget');
