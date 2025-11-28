-- Add sync metadata tracking to exchange_connections
ALTER TABLE exchange_connections 
ADD COLUMN IF NOT EXISTS last_trade_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_order_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_deposit_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_withdrawal_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sync_cursor JSONB,
ADD COLUMN IF NOT EXISTS failed_sync_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'healthy';

-- Create exchange_orders table for storing order history
CREATE TABLE IF NOT EXISTS exchange_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connection_id UUID NOT NULL REFERENCES exchange_connections(id) ON DELETE CASCADE,
  exchange_order_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  type TEXT NOT NULL,
  price DECIMAL NOT NULL,
  quantity DECIMAL NOT NULL,
  filled DECIMAL DEFAULT 0,
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, exchange_order_id)
);

-- Create exchange_deposits table
CREATE TABLE IF NOT EXISTS exchange_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connection_id UUID NOT NULL REFERENCES exchange_connections(id) ON DELETE CASCADE,
  exchange_deposit_id TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT NOT NULL,
  tx_id TEXT,
  network TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, exchange_deposit_id)
);

-- Create exchange_withdrawals table
CREATE TABLE IF NOT EXISTS exchange_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connection_id UUID NOT NULL REFERENCES exchange_connections(id) ON DELETE CASCADE,
  exchange_withdrawal_id TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  fee DECIMAL NOT NULL,
  status TEXT NOT NULL,
  tx_id TEXT,
  network TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, exchange_withdrawal_id)
);

-- Enable RLS on new tables
ALTER TABLE exchange_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS policies for exchange_orders
CREATE POLICY "Users can view own orders" ON exchange_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON exchange_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON exchange_orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON exchange_orders
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for exchange_deposits
CREATE POLICY "Users can view own deposits" ON exchange_deposits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deposits" ON exchange_deposits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own deposits" ON exchange_deposits
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for exchange_withdrawals
CREATE POLICY "Users can view own withdrawals" ON exchange_withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals" ON exchange_withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own withdrawals" ON exchange_withdrawals
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_exchange_orders_user_id ON exchange_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_orders_connection_id ON exchange_orders(connection_id);
CREATE INDEX IF NOT EXISTS idx_exchange_orders_timestamp ON exchange_orders(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_exchange_deposits_user_id ON exchange_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_deposits_connection_id ON exchange_deposits(connection_id);
CREATE INDEX IF NOT EXISTS idx_exchange_deposits_timestamp ON exchange_deposits(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_exchange_withdrawals_user_id ON exchange_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_withdrawals_connection_id ON exchange_withdrawals(connection_id);
CREATE INDEX IF NOT EXISTS idx_exchange_withdrawals_timestamp ON exchange_withdrawals(timestamp DESC);

-- Add trigger for updated_at on exchange_orders
CREATE TRIGGER update_exchange_orders_updated_at
  BEFORE UPDATE ON exchange_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_connections_updated_at();