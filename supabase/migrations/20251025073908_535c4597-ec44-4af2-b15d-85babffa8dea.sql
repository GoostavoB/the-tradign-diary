-- Add trading_type column to exchange_connections table
ALTER TABLE exchange_connections 
ADD COLUMN trading_type text DEFAULT 'spot' CHECK (trading_type IN ('spot', 'futures', 'both'));

-- Add trading_type column to trades table to differentiate spot vs futures trades
ALTER TABLE trades 
ADD COLUMN trading_type text DEFAULT 'spot' CHECK (trading_type IN ('spot', 'futures', 'margin'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_exchange_connections_trading_type ON exchange_connections(trading_type);
CREATE INDEX IF NOT EXISTS idx_trades_trading_type ON trades(trading_type);