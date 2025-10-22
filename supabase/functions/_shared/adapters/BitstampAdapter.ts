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
    .join('')
    .toUpperCase();
}

export class BitstampAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://www.bitstamp.net/api/v2';
  protected name = 'Bitstamp';
  protected rateLimitDelay = 100;

  private customerId: string;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
    this.customerId = credentials.apiPassphrase || '';
    
    if (!this.customerId) {
      console.warn('Bitstamp requires Customer ID. Please provide it in the apiPassphrase field.');
    }
  }

  private async generateSignature(nonce: string): Promise<string> {
    const message = nonce + this.customerId + this.credentials.apiKey;
    return await hmacSha256(this.credentials.apiSecret, message);
  }

  private getNonce(): string {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    await this.rateLimit();

    const nonce = this.getNonce();
    const signature = await this.generateSignature(nonce);

    const url = `${this.baseUrl}${endpoint}`;

    const body = new URLSearchParams({
      key: this.credentials.apiKey,
      signature: signature,
      nonce: nonce,
      ...params,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Bitstamp API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data as T;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest<any>('/balance/');
      return true;
    } catch (error) {
      console.error('Bitstamp connection test failed:', error);
      return false;
    }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const balances = await this.fetchBalances();
      const currencies = balances.map(b => b.currency).filter(c => c && c !== 'USD' && c !== 'EUR');
      
      if (currencies.length === 0) {
        return [];
      }

      const allTrades: Trade[] = [];
      const params: Record<string, any> = { limit: '100' };
      
      if (options?.startTime) {
        params.since_timestamp = Math.floor(new Date(options.startTime).getTime() / 1000).toString();
      }
      if (options?.limit) {
        params.limit = Math.min(options.limit, 1000).toString();
      }

      // Fetch trades for common pairs
      const commonPairs = currencies
        .filter((c): c is string => c !== undefined && c !== 'USDT')
        .map(c => `${c.toLowerCase()}usd`)
        .slice(0, 10);

      for (const pair of commonPairs) {
        try {
          const trades = await this.makeRequest<any[]>(`/user_transactions/${pair}/`, params);

          for (const trade of trades) {
            if (trade.type === 2) { // Type 2 = trade
              const isBuy = parseFloat(trade[pair.replace('usd', '')]) > 0;
              allTrades.push({
                id: trade.id.toString(),
                orderId: trade.order_id?.toString() || trade.id.toString(),
                symbol: pair.toUpperCase(),
                side: isBuy ? 'buy' : 'sell',
                price: parseFloat(trade[`${pair}_price`] || trade.price || '0'),
                quantity: Math.abs(parseFloat(trade[pair.replace('usd', '')] || '0')),
                fee: parseFloat(trade.fee || '0'),
                feeCurrency: 'USD',
                timestamp: new Date(trade.datetime),
                exchange: 'bitstamp',
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching trades for ${pair}:`, error);
          continue;
        }
      }

      return allTrades;
    } catch (error) {
      console.error('Error fetching Bitstamp trades:', error);
      return [];
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const balances = await this.makeRequest<any>('/balance/');
      
      const result: Balance[] = [];
      const currencies = new Set<string>();

      for (const key in balances) {
        const match = key.match(/^([a-z]+)_(available|balance|reserved)$/);
        if (match) {
          currencies.add(match[1].toUpperCase());
        }
      }

      for (const currency of currencies) {
        const currencyLower = currency.toLowerCase();
        const available = parseFloat(balances[`${currencyLower}_available`] || '0');
        const reserved = parseFloat(balances[`${currencyLower}_reserved`] || '0');
        const balance = parseFloat(balances[`${currencyLower}_balance`] || '0');

        if (balance > 0 || available > 0 || reserved > 0) {
          result.push({
            exchange: 'bitstamp',
            currency,
            free: available,
            locked: reserved,
            total: balance,
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Error fetching Bitstamp balances:', error);
      return [];
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
