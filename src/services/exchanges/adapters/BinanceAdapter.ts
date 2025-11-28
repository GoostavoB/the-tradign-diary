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

interface BinanceOrder {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  stopPrice: string;
  icebergQty: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  origQuoteOrderQty: string;
}

interface BinanceDeposit {
  id: string;
  amount: string;
  coin: string;
  network: string;
  status: number;
  address: string;
  addressTag: string;
  txId: string;
  insertTime: number;
  transferType: number;
  confirmTimes: string;
  unlockConfirm: number;
  walletType: number;
}

interface BinanceWithdrawal {
  id: string;
  amount: string;
  transactionFee: string;
  coin: string;
  status: number;
  address: string;
  txId: string;
  applyTime: string;
  network: string;
  transferType: number;
  withdrawOrderId: string;
  info: string;
  confirmNo: number;
  walletType: number;
  txKey: string;
  completeTime: string;
}

/**
 * Binance Exchange Adapter
 * API Documentation: https://binance-docs.github.io/apidocs/spot/en/
 * 
 * Features:
 * - Spot trading
 * - Margin trading
 * - Futures trading
 * - HMAC SHA256 authentication
 * - Rate limit: 1200 requests per minute
 */
export class BinanceAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.binance.com';
  protected name = 'Binance';
  protected rateLimitDelay = 50; // 50ms = 1200 req/min

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  /**
   * Generate Binance signature for authentication
   */
  private generateSignature(queryString: string): string {
    return CryptoJS.HmacSHA256(queryString, this.credentials.apiSecret).toString();
  }

  /**
   * Make authenticated request to Binance API
   */
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

    const signature = this.generateSignature(queryString);
    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'X-MBX-APIKEY': this.credentials.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleError(response.status, errorData);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(0, error);
    }
  }

  /**
   * Test connection to Binance API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/api/v3/account');
      return true;
    } catch (error) {
      console.error('Binance connection test failed:', error);
      return false;
    }
  }

  /**
   * Fetch trade history from Binance
   */
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
      return trades.map(trade => this.mapTrade(trade));
    } catch (error) {
      console.error('Error fetching Binance trades:', error);
      throw error;
    }
  }

  /**
   * Fetch account balances from Binance
   */
  async fetchBalances(): Promise<Balance[]> {
    try {
      const accountInfo = await this.makeRequest<{ balances: BinanceBalance[] }>('/api/v3/account');
      
      return accountInfo.balances
        .filter(balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
        .map(balance => this.mapBalance(balance));
    } catch (error) {
      console.error('Error fetching Binance balances:', error);
      throw error;
    }
  }

  /**
   * Fetch order history from Binance
   */
  async fetchOrders(options?: FetchOptions): Promise<Order[]> {
    try {
      const params: Record<string, any> = {
        limit: options?.limit || 500,
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

      const orders = await this.makeRequest<BinanceOrder[]>('/api/v3/allOrders', params);
      return orders.map(order => this.mapOrder(order));
    } catch (error) {
      console.error('Error fetching Binance orders:', error);
      throw error;
    }
  }

  /**
   * Fetch deposit history from Binance
   */
  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> {
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

      const deposits = await this.makeRequest<BinanceDeposit[]>('/sapi/v1/capital/deposit/hisrec', params);
      return deposits.map(deposit => this.mapDeposit(deposit));
    } catch (error) {
      console.error('Error fetching Binance deposits:', error);
      throw error;
    }
  }

  /**
   * Fetch withdrawal history from Binance
   */
  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> {
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

      const withdrawals = await this.makeRequest<BinanceWithdrawal[]>('/sapi/v1/capital/withdraw/history', params);
      return withdrawals.map(withdrawal => this.mapWithdrawal(withdrawal));
    } catch (error) {
      console.error('Error fetching Binance withdrawals:', error);
      throw error;
    }
  }

  /**
   * Map Binance trade to unified Trade format
   */
  private mapTrade(trade: BinanceTrade): Trade {
    return {
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
    };
  }

  /**
   * Map Binance balance to unified Balance format
   */
  private mapBalance(balance: BinanceBalance): Balance {
    const free = parseFloat(balance.free);
    const locked = parseFloat(balance.locked);

    return {
      exchange: 'binance',
      currency: balance.asset,
      free,
      locked,
      total: free + locked,
    };
  }

  /**
   * Map Binance order to unified Order format
   */
  private mapOrder(order: BinanceOrder): Order {
    const quantity = parseFloat(order.origQty);
    const filled = parseFloat(order.executedQty);

    return {
      id: order.orderId.toString(),
      exchange: 'binance',
      symbol: this.formatSymbol(order.symbol),
      type: order.type.toLowerCase() as any,
      side: order.side.toLowerCase() as 'buy' | 'sell',
      price: order.price ? parseFloat(order.price) : undefined,
      quantity,
      filled,
      remaining: quantity - filled,
      status: this.mapOrderStatus(order.status),
      timestamp: new Date(order.time),
    };
  }

  /**
   * Map Binance order status to unified status
   */
  private mapOrderStatus(status: string): Order['status'] {
    switch (status) {
      case 'NEW':
      case 'PARTIALLY_FILLED':
        return 'open';
      case 'FILLED':
        return 'closed';
      case 'CANCELED':
      case 'PENDING_CANCEL':
      case 'REJECTED':
        return 'cancelled';
      case 'EXPIRED':
        return 'expired';
      default:
        return 'open';
    }
  }

  /**
   * Map Binance deposit to unified Deposit format
   */
  private mapDeposit(deposit: BinanceDeposit): Deposit {
    return {
      id: deposit.id,
      exchange: 'binance',
      currency: deposit.coin,
      amount: parseFloat(deposit.amount),
      address: deposit.address,
      txId: deposit.txId,
      status: this.mapDepositStatus(deposit.status),
      timestamp: new Date(deposit.insertTime),
      network: deposit.network,
    };
  }

  /**
   * Map Binance withdrawal to unified Withdrawal format
   */
  private mapWithdrawal(withdrawal: BinanceWithdrawal): Withdrawal {
    return {
      id: withdrawal.id,
      exchange: 'binance',
      currency: withdrawal.coin,
      amount: parseFloat(withdrawal.amount),
      address: withdrawal.address,
      txId: withdrawal.txId,
      fee: parseFloat(withdrawal.transactionFee),
      status: this.mapWithdrawalStatus(withdrawal.status),
      timestamp: new Date(withdrawal.applyTime),
      network: withdrawal.network,
    };
  }

  /**
   * Map Binance deposit status to unified status
   */
  private mapDepositStatus(status: number): 'pending' | 'completed' | 'failed' {
    switch (status) {
      case 0:
        return 'pending';
      case 1:
        return 'completed';
      case 6:
        return 'failed';
      default:
        return 'pending';
    }
  }

  /**
   * Map Binance withdrawal status to unified status
   */
  private mapWithdrawalStatus(status: number): 'pending' | 'completed' | 'failed' {
    switch (status) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 5:
        return 'pending';
      case 6:
        return 'completed';
      case 4:
        return 'failed';
      default:
        return 'pending';
    }
  }

  /**
   * Format Binance symbol to standard format
   */
  private formatSymbol(symbol: string): string {
    // Binance uses BTCUSDT format, convert to BTC/USDT
    const match = symbol.match(/^([A-Z]+)(USDT|BTC|ETH|BNB|BUSD|USD|EUR)$/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
    return symbol;
  }

  /**
   * Handle API errors
   */
  private handleError(status: number, error: any): Error {
    const message = error?.msg || error?.message || 'Unknown Binance API error';
    
    if (status === 401 || status === 403) {
      return new Error(`Binance Authentication Error: ${message}`);
    }
    
    if (status === 429) {
      return new Error('Binance Rate Limit Exceeded. Please try again later.');
    }
    
    if (status >= 500) {
      return new Error(`Binance Server Error: ${message}`);
    }
    
    return new Error(`Binance API Error: ${message}`);
  }
}
