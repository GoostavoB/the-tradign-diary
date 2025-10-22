import { BaseExchangeAdapter } from './BaseExchangeAdapter.ts';
import type { 
  ExchangeCredentials, 
  Trade, 
  Balance, 
  Order, 
  Deposit, 
  Withdrawal,
  FetchOptions 
} from './types.ts';

async function hmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Binance API Response Types
interface BinanceTrade {
  id: number;
  symbol: string;
  orderId: number;
  price: string;
  qty: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
  isBestMatch: boolean;
}

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

export class BinanceAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.binance.com';
  protected name = 'Binance';
  protected rateLimitDelay = 50;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private async generateSignature(queryString: string): Promise<string> {
    return await hmacSha256(this.credentials.apiSecret, queryString);
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {},
    method: string = 'GET'
  ): Promise<T> {
    await this.rateLimit();

    const timestamp = Date.now();
    const queryString = new URLSearchParams({
      ...params,
      timestamp: timestamp.toString(),
    }).toString();

    const signature = await this.generateSignature(queryString);
    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method,
      headers: {
        'X-MBX-APIKEY': this.credentials.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Binance API Error: ${response.statusText}`);
    }

    return await response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/api/v3/account');
      return true;
    } catch (error) {
      console.error('Binance connection test failed:', error);
      return false;
    }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const params: Record<string, any> = {
        limit: options?.limit || 1000,
      };

      if (options?.startTime) {
        params.startTime = options.startTime.getTime();
      }

      if (options?.endTime) {
        params.endTime = options.endTime.getTime();
      }

      if (options?.symbol) {
        params.symbol = options.symbol.replace('/', '');
      }

      const trades = await this.makeRequest<BinanceTrade[]>('/api/v3/myTrades', params);
      return trades.map(trade => ({
        id: trade.id.toString(),
        exchange: 'binance',
        symbol: this.formatSymbol(trade.symbol),
        side: trade.isBuyer ? 'buy' : 'sell',
        price: parseFloat(trade.price),
        quantity: parseFloat(trade.qty),
        fee: parseFloat(trade.commission),
        feeCurrency: trade.commissionAsset,
        timestamp: new Date(trade.time),
        orderId: trade.orderId.toString(),
        role: trade.isMaker ? 'maker' : 'taker',
      }));
    } catch (error) {
      console.error('Error fetching Binance trades:', error);
      throw error;
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const accountInfo = await this.makeRequest<{ balances: BinanceBalance[] }>('/api/v3/account');
      
      return accountInfo.balances
        .filter(balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
        .map(balance => {
          const free = parseFloat(balance.free);
          const locked = parseFloat(balance.locked);
          return {
            exchange: 'binance',
            currency: balance.asset,
            free,
            locked,
            total: free + locked,
          };
        });
    } catch (error) {
      console.error('Error fetching Binance balances:', error);
      throw error;
    }
  }

  async fetchOrders(options?: FetchOptions): Promise<Order[]> {
    return [];
  }

  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> {
    return [];
  }

  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> {
    return [];
  }

  private formatSymbol(symbol: string): string {
    const match = symbol.match(/^([A-Z]+)(USDT|BTC|ETH|BNB|BUSD|USD|EUR)$/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
    return symbol;
  }
}
