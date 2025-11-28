-- Create exchange_pending_trades table for trade preview
CREATE TABLE exchange_pending_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES exchange_connections(id) ON DELETE CASCADE,
  trade_data JSONB NOT NULL,
  is_selected BOOLEAN DEFAULT true,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- Create indexes for performance
CREATE INDEX idx_pending_trades_user_id ON exchange_pending_trades(user_id);
CREATE INDEX idx_pending_trades_connection_id ON exchange_pending_trades(connection_id);
CREATE INDEX idx_pending_trades_expires_at ON exchange_pending_trades(expires_at);

-- Enable RLS
ALTER TABLE exchange_pending_trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own pending trades"
  ON exchange_pending_trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pending trades"
  ON exchange_pending_trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending trades"
  ON exchange_pending_trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pending trades"
  ON exchange_pending_trades FOR DELETE
  USING (auth.uid() = user_id);

-- Cleanup function for expired pending trades
CREATE OR REPLACE FUNCTION cleanup_expired_pending_trades()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM exchange_pending_trades
  WHERE expires_at < NOW();
END;
$$;