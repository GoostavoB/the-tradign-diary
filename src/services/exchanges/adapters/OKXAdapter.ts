import { BaseExchangeAdapter } from '../BaseExchangeAdapter';
import type { ExchangeCredentials, Trade, Balance, Order, Deposit, Withdrawal, FetchOptions } from '../types';
import CryptoJS from 'crypto-js';

export class OKXAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://www.okx.com';
  protected name = 'OKX';
  protected rateLimitDelay = 100;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
    if (!credentials.apiPassphrase) {
      console.warn('OKX requires API Passphrase');
    }
  }

  private generateSignature(timestamp: string, method: string, requestPath: string, body: string = ''): string {
    const message = timestamp + method + requestPath + body;
    return CryptoJS.HmacSHA256(message, this.credentials.apiSecret).toString(CryptoJS.enc.Base64);
  }

  private async makeRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    await this.rateLimit();
    const timestamp = new Date().toISOString();
    const bodyString = body ? JSON.stringify(body) : '';
    const signature = this.generateSignature(timestamp, method, endpoint, bodyString);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'OK-ACCESS-KEY': this.credentials.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.credentials.apiPassphrase || '',
        'Content-Type': 'application/json',
      },
      body: bodyString || undefined,
    });

    const data = await response.json();
    if (data.code !== '0') {
      throw new Error(`OKX API Error: ${data.msg}`);
    }
    return data.data as T;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/api/v5/account/balance');
      return true;
    } catch { return false; }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const response = await this.makeRequest<any[]>('/api/v5/trade/fills', 'GET');
      return response.map(t => ({
        id: t.tradeId,
        exchange: 'okx',
        symbol: t.instId.replace('-', '/'),
        side: t.side,
        price: parseFloat(t.fillPx),
        quantity: parseFloat(t.fillSz),
        fee: parseFloat(t.fee),
        feeCurrency: t.feeCcy,
        timestamp: new Date(parseInt(t.ts)),
        orderId: t.ordId,
        role: t.execType === 'M' ? 'maker' : 'taker',
      }));
    } catch (error) {
      console.error('Error fetching OKX trades:', error);
      return [];
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const response = await this.makeRequest<any[]>('/api/v5/account/balance');
      const balances: Balance[] = [];
      
      for (const account of response) {
        for (const detail of account.details || []) {
          const free = parseFloat(detail.availBal);
          const locked = parseFloat(detail.frozenBal);
          if (free > 0 || locked > 0) {
            balances.push({
              exchange: 'okx',
              currency: detail.ccy,
              free,
              locked,
              total: free + locked,
            });
          }
        }
      }
      return balances;
    } catch (error) {
      console.error('Error fetching OKX balances:', error);
      return [];
    }
  }

  async fetchOrders(options?: FetchOptions): Promise<Order[]> {
    try {
      const response = await this.makeRequest<any[]>('/api/v5/trade/orders-pending', 'GET');
      return response.map(o => ({
        id: o.ordId,
        exchange: 'okx',
        symbol: o.instId.replace('-', '/'),
        type: o.ordType,
        side: o.side,
        price: parseFloat(o.px),
        quantity: parseFloat(o.sz),
        filled: parseFloat(o.accFillSz),
        remaining: parseFloat(o.sz) - parseFloat(o.accFillSz),
        status: o.state === 'live' ? 'open' : o.state === 'filled' ? 'closed' : 'cancelled',
        timestamp: new Date(parseInt(o.cTime)),
      }));
    } catch (error) {
      console.error('Error fetching OKX orders:', error);
      return [];
    }
  }

  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> {
    try {
      const response = await this.makeRequest<any[]>('/api/v5/asset/deposit-history');
      return response.map(d => ({
        id: d.depId,
        exchange: 'okx',
        currency: d.ccy,
        amount: parseFloat(d.amt),
        address: d.to,
        txId: d.txId,
        status: d.state === '2' ? 'completed' : d.state === '3' ? 'failed' : 'pending',
        timestamp: new Date(parseInt(d.ts)),
        network: d.chain,
      }));
    } catch (error) {
      console.error('Error fetching OKX deposits:', error);
      return [];
    }
  }

  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> {
    try {
      const response = await this.makeRequest<any[]>('/api/v5/asset/withdrawal-history');
      return response.map(w => ({
        id: w.wdId,
        exchange: 'okx',
        currency: w.ccy,
        amount: parseFloat(w.amt),
        address: w.to,
        txId: w.txId,
        fee: parseFloat(w.fee),
        status: w.state === '2' ? 'completed' : w.state === '3' ? 'failed' : 'pending',
        timestamp: new Date(parseInt(w.ts)),
        network: w.chain,
      }));
    } catch (error) {
      console.error('Error fetching OKX withdrawals:', error);
      return [];
    }
  }
}
