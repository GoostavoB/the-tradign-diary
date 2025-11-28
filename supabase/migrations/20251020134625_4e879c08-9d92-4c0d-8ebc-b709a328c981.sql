-- Create exchange_connections table to store encrypted API credentials
CREATE TABLE exchange_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange_name TEXT NOT NULL CHECK (exchange_name IN ('bingx', 'binance', 'bybit', 'coinbase')),
  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  api_passphrase_encrypted TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending',
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exchange_name)
);

CREATE INDEX idx_exchange_connections_user_id ON exchange_connections(user_id);

-- Enable RLS
ALTER TABLE exchange_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exchange_connections
CREATE POLICY "Users can view own exchange connections"
  ON exchange_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exchange connections"
  ON exchange_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exchange connections"
  ON exchange_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exchange connections"
  ON exchange_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Create exchange_sync_history table to track sync operations
CREATE TABLE exchange_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES exchange_connections(id) ON DELETE CASCADE,
  exchange_name TEXT NOT NULL,
  sync_type TEXT NOT NULL,
  trades_fetched INTEGER DEFAULT 0,
  trades_imported INTEGER DEFAULT 0,
  trades_skipped INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sync_history_user_id ON exchange_sync_history(user_id);
CREATE INDEX idx_sync_history_connection_id ON exchange_sync_history(connection_id);

-- Enable RLS
ALTER TABLE exchange_sync_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy for exchange_sync_history
CREATE POLICY "Users can view own sync history"
  ON exchange_sync_history FOR SELECT
  USING (auth.uid() = user_id);

-- Add exchange tracking columns to trades table
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS exchange_source TEXT,
ADD COLUMN IF NOT EXISTS exchange_trade_id TEXT;

-- Create unique constraint to prevent duplicate imports
CREATE UNIQUE INDEX IF NOT EXISTS unique_exchange_trade 
ON trades(user_id, exchange_source, exchange_trade_id) 
WHERE exchange_source IS NOT NULL AND exchange_trade_id IS NOT NULL;

-- Create index for faster filtering by exchange
CREATE INDEX IF NOT EXISTS idx_trades_exchange_source ON trades(user_id, exchange_source);

-- Trigger to update updated_at on exchange_connections
CREATE OR REPLACE FUNCTION update_exchange_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exchange_connections_updated_at
  BEFORE UPDATE ON exchange_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_connections_updated_at();