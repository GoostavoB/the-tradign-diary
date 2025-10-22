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

interface BybitTrade {
  symbol: string;
  id: string;
  orderId: string;
  tradeId: string;
  orderPrice: string;
  orderQty: string;
  execFee: string;
  feeTokenId: string;
  creatTime: string;
  isBuyer: string;
  isMaker: string;
  matchOrderId: string;
  makerRebate: string;
  executionTime: string;
}

interface BybitBalance {
  coin: string;
  walletBalance: string;
  availableToWithdraw: string;
  bonus: string;
}

export class BybitAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.bybit.com';
  protected name = 'Bybit';
  protected rateLimitDelay = 100;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private async generateSignature(timestamp: string, params: string): Promise<string> {
    const message = timestamp + this.credentials.apiKey + '5000' + params;
    return await hmacSha256(this.credentials.apiSecret, message);
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    await this.rateLimit();

    const timestamp = Date.now().toString();
    const paramString = new URLSearchParams(params).toString();
    const signature = await this.generateSignature(timestamp, paramString);

    const url = `${this.baseUrl}${endpoint}?${paramString}`;

    const response = await fetch(url, {
      headers: {
        'X-BAPI-API-KEY': this.credentials.apiKey,
        'X-BAPI-SIGN': signature,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-RECV-WINDOW': '5000',
      },
    });

    if (!response.ok) {
      throw new Error(`Bybit API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result as T;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/v5/account/wallet-balance', { accountType: 'UNIFIED' });
      return true;
    } catch (error) {
      console.error('Bybit connection test failed:', error);
      return false;
    }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const params: Record<string, any> = {
        category: 'spot',
        limit: options?.limit || 100,
      };

      if (options?.startTime) {
        params.startTime = options.startTime.getTime();
      }

      if (options?.endTime) {
        params.endTime = options.endTime.getTime();
      }

      const response = await this.makeRequest<{ list: BybitTrade[] }>('/v5/execution/list', params);
      return response.list.map(trade => ({
        id: trade.id,
        exchange: 'bybit',
        symbol: trade.symbol.replace(/([A-Z]+)([A-Z]{3,4})$/, '$1/$2'),
        side: trade.isBuyer === '1' ? 'buy' : 'sell',
        price: parseFloat(trade.orderPrice),
        quantity: parseFloat(trade.orderQty),
        fee: parseFloat(trade.execFee),
        feeCurrency: trade.feeTokenId,
        timestamp: new Date(parseInt(trade.executionTime)),
        orderId: trade.orderId,
        role: trade.isMaker === '1' ? 'maker' : 'taker',
      }));
    } catch (error) {
      console.error('Error fetching Bybit trades:', error);
      throw error;
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const response = await this.makeRequest<{ list: { coin: BybitBalance[] }[] }>(
        '/v5/account/wallet-balance',
        { accountType: 'UNIFIED' }
      );

      const balances: Balance[] = [];
      for (const account of response.list) {
        for (const balance of account.coin) {
          const total = parseFloat(balance.walletBalance);
          const free = parseFloat(balance.availableToWithdraw);
          balances.push({
            exchange: 'bybit',
            currency: balance.coin,
            free,
            locked: total - free,
            total,
          });
        }
      }
      return balances;
    } catch (error) {
      console.error('Error fetching Bybit balances:', error);
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
}
