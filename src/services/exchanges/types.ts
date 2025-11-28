/**
 * Type definitions for exchange integrations
 */

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  apiPassphrase?: string; // Required for KuCoin, OKX, Bitstamp (Customer ID)
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  fee: number;
  feeAsset?: string;
  feeCurrency?: string;
  timestamp: number | Date;
  orderId?: string;
  exchange?: string;
  role?: string;
  [key: string]: any; // Allow additional properties
}

export interface Balance {
  asset?: string;
  currency?: string;
  free: number;
  locked: number;
  total: number;
  exchange?: string;
  [key: string]: any; // Allow additional properties
}

export interface Order {
  id: string;
  symbol: string;
  type: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  executedQuantity?: number;
  filled?: number;
  remaining?: number;
  status: string;
  timestamp: number | Date;
  exchange?: string;
  [key: string]: any; // Allow additional properties
}

export interface Deposit {
  id: string;
  asset?: string;
  coin?: string;
  currency?: string;
  amount: number;
  status: string;
  timestamp: number | Date;
  txId?: string;
  network?: string;
  exchange?: string;
  [key: string]: any; // Allow additional properties
}

export interface Withdrawal {
  id: string;
  asset?: string;
  coin?: string;
  currency?: string;
  amount: number;
  fee: number;
  status: string;
  timestamp: number | Date;
  txId?: string;
  network?: string;
  exchange?: string;
  [key: string]: any; // Allow additional properties
}

export interface FetchOptions {
  startTime?: Date;
  endTime?: Date;
  limit?: number;
  symbol?: string;
}
