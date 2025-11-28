import { BaseExchangeAdapter } from '../BaseExchangeAdapter';
import type { 
  ExchangeCredentials, 
  Trade, 
  Balance, 
  Order, 
  Deposit, 
  Withdrawal,
  FetchOptions 
} from '../types';
import CryptoJS from 'crypto-js';

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

interface BybitOrder {
  orderId: string;
  symbol: string;
  orderType: string;
  side: string;
  price: string;
  qty: string;
  cumExecQty: string;
  cumExecValue: string;
  cumExecFee: string;
  timeInForce: string;
  orderStatus: string;
  createdTime: string;
  updatedTime: string;
}

export class BybitAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.bybit.com';
  protected name = 'Bybit';
  protected rateLimitDelay = 100;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private generateSignature(timestamp: string, params: string): string {
    const message = timestamp + this.credentials.apiKey + '5000' + params;
    return CryptoJS.HmacSHA256(message, this.credentials.apiSecret).toString();
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    await this.rateLimit();

    const timestamp = Date.now().toString();
    const paramString = new URLSearchParams(params).toString();
    const signature = this.generateSignature(timestamp, paramString);

    const url = `${this.baseUrl}${endpoint}?${paramString}`;

    try {
      const response = await fetch(url, {
        headers: {
          'X-BAPI-API-KEY': this.credentials.apiKey,
          'X-BAPI-SIGN': signature,
          'X-BAPI-TIMESTAMP': timestamp,
          'X-BAPI-RECV-WINDOW': '5000',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleError(response.status, errorData);
      }

      const data = await response.json();
      return data.result as T;
    } catch (error) {
      throw this.handleError(0, error);
    }
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
      return response.list.map(trade => this.mapTrade(trade));
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
          balances.push(this.mapBalance(balance));
        }
      }
      return balances;
    } catch (error) {
      console.error('Error fetching Bybit balances:', error);
      throw error;
    }
  }

  async fetchOrders(options?: FetchOptions): Promise<Order[]> {
    try {
      const params: Record<string, any> = {
        category: 'spot',
        limit: options?.limit || 50,
      };

      const response = await this.makeRequest<{ list: BybitOrder[] }>('/v5/order/history', params);
      return response.list.map(order => this.mapOrder(order));
    } catch (error) {
      console.error('Error fetching Bybit orders:', error);
      throw error;
    }
  }

  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> {
    return []; // Bybit V5 API structure differs
  }

  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> {
    return []; // Bybit V5 API structure differs
  }

  private mapTrade(trade: BybitTrade): Trade {
    return {
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
    };
  }

  private mapBalance(balance: BybitBalance): Balance {
    const total = parseFloat(balance.walletBalance);
    const free = parseFloat(balance.availableToWithdraw);

    return {
      exchange: 'bybit',
      currency: balance.coin,
      free,
      locked: total - free,
      total,
    };
  }

  private mapOrder(order: BybitOrder): Order {
    const quantity = parseFloat(order.qty);
    const filled = parseFloat(order.cumExecQty);

    return {
      id: order.orderId,
      exchange: 'bybit',
      symbol: order.symbol.replace(/([A-Z]+)([A-Z]{3,4})$/, '$1/$2'),
      type: order.orderType.toLowerCase() as any,
      side: order.side.toLowerCase() as 'buy' | 'sell',
      price: order.price ? parseFloat(order.price) : undefined,
      quantity,
      filled,
      remaining: quantity - filled,
      status: this.mapOrderStatus(order.orderStatus),
      timestamp: new Date(parseInt(order.createdTime)),
    };
  }

  private mapOrderStatus(status: string): Order['status'] {
    switch (status) {
      case 'New':
      case 'PartiallyFilled':
        return 'open';
      case 'Filled':
        return 'closed';
      case 'Cancelled':
      case 'Rejected':
        return 'cancelled';
      default:
        return 'open';
    }
  }

  private handleError(status: number, error: any): Error {
    const message = error?.retMsg || error?.message || 'Unknown Bybit API error';
    const code = error?.retCode;
    
    console.error('Bybit Error:', { status, code, message, error });
    
    // Bybit V5 error codes
    const errorMap: Record<number, string> = {
      10003: 'Invalid API key or signature. Please verify your credentials.',
      10004: 'API key has insufficient permissions. Please enable required permissions in Bybit.',
      10006: 'Rate limit exceeded. Please slow down your requests.',
      10016: 'Invalid request. Please check your parameters.',
      110001: 'Order does not exist.',
      110003: 'Insufficient balance.',
    };
    
    if (status === 401 || status === 403 || code === 10003 || code === 10004) {
      return new Error(`Bybit Authentication Error [${code}]: ${errorMap[code] || message}. Please check your API keys and permissions.`);
    }
    
    if (status === 429 || code === 10006) {
      return new Error('Bybit Rate Limit Exceeded. Please try again later.');
    }

    const knownError = errorMap[code];
    if (knownError) {
      return new Error(`Bybit Error [${code}]: ${knownError}`);
    }
    
    return new Error(`Bybit API Error [${code || status}]: ${message}`);
  }
}
