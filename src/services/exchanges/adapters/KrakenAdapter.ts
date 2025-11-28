import { BaseExchangeAdapter } from '../BaseExchangeAdapter';
import type { ExchangeCredentials, Trade, Balance, Order, Deposit, Withdrawal, FetchOptions } from '../types';
import CryptoJS from 'crypto-js';

export class KrakenAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.kraken.com';
  protected name = 'Kraken';
  protected rateLimitDelay = 100;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private generateSignature(path: string, nonce: string, postData: string): string {
    const message = nonce + postData;
    const hash = CryptoJS.SHA256(message);
    const hmac = CryptoJS.HmacSHA512(path + hash, CryptoJS.enc.Base64.parse(this.credentials.apiSecret));
    return CryptoJS.enc.Base64.stringify(hmac);
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    await this.rateLimit();
    const nonce = Date.now().toString() + '000';
    const postData = new URLSearchParams({ ...params, nonce }).toString();
    const path = `/0/private/${endpoint}`;
    const signature = this.generateSignature(path, nonce, postData);

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'API-Key': this.credentials.apiKey,
        'API-Sign': signature,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postData,
    });

    const data = await response.json();
    if (data.error && data.error.length > 0) {
      throw new Error(`Kraken API Error: ${data.error.join(', ')}`);
    }
    return data.result as T;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('Balance');
      return true;
    } catch { return false; }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const response = await this.makeRequest<any>('TradesHistory', {});
      const trades: Trade[] = [];
      for (const [id, trade] of Object.entries(response.trades || {})) {
        const t = trade as any;
        trades.push({
          id,
          exchange: 'kraken',
          symbol: t.pair,
          side: t.type,
          price: parseFloat(t.price),
          quantity: parseFloat(t.vol),
          fee: parseFloat(t.fee),
          feeCurrency: t.pair.slice(-3),
          timestamp: new Date(t.time * 1000),
          orderId: t.ordertxid,
        });
      }
      return trades;
    } catch (error) {
      console.error('Error fetching Kraken trades:', error);
      return [];
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const balances = await this.makeRequest<Record<string, string>>('Balance');
      return Object.entries(balances).map(([currency, balance]) => ({
        exchange: 'kraken',
        currency,
        free: parseFloat(balance),
        locked: 0,
        total: parseFloat(balance),
      }));
    } catch (error) {
      console.error('Error fetching Kraken balances:', error);
      return [];
    }
  }

  async fetchOrders(options?: FetchOptions): Promise<Order[]> {
    try {
      const response = await this.makeRequest<any>('OpenOrders', {});
      const orders: Order[] = [];
      for (const [id, order] of Object.entries(response.open || {})) {
        const o = order as any;
        orders.push({
          id,
          exchange: 'kraken',
          symbol: o.descr.pair,
          type: o.descr.ordertype,
          side: o.descr.type,
          price: parseFloat(o.descr.price),
          quantity: parseFloat(o.vol),
          filled: parseFloat(o.vol_exec),
          remaining: parseFloat(o.vol) - parseFloat(o.vol_exec),
          status: 'open',
          timestamp: new Date(o.opentm * 1000),
        });
      }
      return orders;
    } catch (error) {
      console.error('Error fetching Kraken orders:', error);
      return [];
    }
  }

  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> { return []; }
  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> { return []; }
}
