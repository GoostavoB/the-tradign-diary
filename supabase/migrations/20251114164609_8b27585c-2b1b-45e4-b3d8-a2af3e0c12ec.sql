-- Drop the existing single-column unique constraint on trade_hash
ALTER TABLE public.trades DROP CONSTRAINT IF EXISTS trades_trade_hash_key;

-- Add a composite unique constraint on user_id and trade_hash
-- This allows the same trade_hash across different users while preventing duplicates within a user's trades
ALTER TABLE public.trades ADD CONSTRAINT trades_user_id_trade_hash_key 
  UNIQUE (user_id, trade_hash);