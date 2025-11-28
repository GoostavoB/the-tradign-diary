-- Backfill existing trades with their user's Main sub-account
-- This ensures all existing trades (with NULL sub_account_id) are assigned to the Main account

UPDATE trades
SET sub_account_id = sa.id
FROM sub_accounts sa
WHERE trades.user_id = sa.user_id
  AND sa.name = 'Main'
  AND trades.sub_account_id IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN trades.sub_account_id IS 'Links trade to a specific sub-account for multi-account trading';