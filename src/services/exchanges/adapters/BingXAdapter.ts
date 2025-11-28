import { BaseExchangeAdapter } from '../BaseExchangeAdapter';
import type { ExchangeCredentials, Trade, Balance, Order, Deposit, Withdrawal, FetchOptions } from '../types';
import CryptoJS from 'crypto-js';

export class BingXAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://open-api.bingx.com';
  protected name = 'BingX';
  protected rateLimitDelay = 150;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private generateSignature(params: string): string {
    return CryptoJS.HmacSHA256(params, this.credentials.apiSecret).toString();
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    await this.rateLimit();
    const timestamp = Date.now();
    const allParams = { ...params, timestamp };
    const queryString = new URLSearchParams(allParams as any).toString();
    const signature = this.generateSignature(queryString);
    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    console.log('BingX Request:', { endpoint, timestamp, params });

    const response = await fetch(url, {
      headers: { 'X-BX-APIKEY': this.credentials.apiKey },
    });

    const data = await response.json();
    
    console.log('BingX Response:', { status: response.status, code: data.code, msg: data.msg });
    
    if (data.code !== 0) {
      const errorMessage = this.handleError(data.code, data.msg);
      console.error('BingX API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    return data.data as T;
  }

  private handleError(code: number, message: string): string {
    // Common BingX error codes
    const errorMap: Record<number, string> = {
      100001: 'Invalid signature. Please check your API Secret.',
      100202: 'Invalid API Key. Please verify your credentials.',
      100400: 'Invalid request parameters.',
      100429: 'Rate limit exceeded. Please slow down your requests.',
      100500: 'Internal server error. Please try again later.',
    };

    const knownError = errorMap[code];
    if (knownError) {
      return `BingX Error [${code}]: ${knownError}`;
    }

    return `BingX API Error [${code}]: ${message || 'Unknown error'}`;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/openApi/spot/v1/account/balance');
      return true;
    } catch { return false; }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const response = await this.makeRequest<any>('/openApi/spot/v1/trade/query', {});
      return (response.fills || []).map((t: any) => ({
        id: t.id,
        exchange: 'bingx',
        symbol: t.symbol,
        side: t.side.toLowerCase(),
        price: parseFloat(t.price),
        quantity: parseFloat(t.qty),
        fee: parseFloat(t.commission),
        feeCurrency: t.commissionAsset,
        timestamp: new Date(t.time),
        orderId: t.orderId,
      }));
    } catch (error) {
      console.error('Error fetching BingX trades:', error);
      return [];
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const response = await this.makeRequest<any>('/openApi/spot/v1/account/balance');
      return (response.balances || []).map((b: any) => ({
        exchange: 'bingx',
        currency: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked),
      })).filter((b: any) => b.total > 0);
    } catch (error) {
      console.error('Error fetching BingX balances:', error);
      return [];
    }
  }

  async fetchOrders(options?: FetchOptions): Promise<Order[]> {
    try {
      const response = await this.makeRequest<any>('/openApi/spot/v1/trade/openOrders', {});
      return (response.orders || []).map((o: any) => ({
        id: o.orderId,
        exchange: 'bingx',
        symbol: o.symbol,
        type: o.type.toLowerCase(),
        side: o.side.toLowerCase(),
        price: parseFloat(o.price),
        quantity: parseFloat(o.origQty),
        filled: parseFloat(o.executedQty),
        remaining: parseFloat(o.origQty) - parseFloat(o.executedQty),
        status: o.status.toLowerCase(),
        timestamp: new Date(o.time),
      }));
    } catch (error) {
      console.error('Error fetching BingX orders:', error);
      return [];
    }
  }

  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> { return []; }
  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> { return []; }
}
