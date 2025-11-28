import type {
  ExchangeCredentials,
  Trade,
  Balance,
  Order,
  Deposit,
  Withdrawal,
  FetchOptions,
} from './types';

/**
 * Base Exchange Adapter
 * Abstract class providing common functionality for all exchange adapters
 */
export abstract class BaseExchangeAdapter {
  protected credentials: ExchangeCredentials;
  protected abstract baseUrl: string;
  protected abstract name: string;
  protected abstract rateLimitDelay: number;
  protected lastRequestTime: number = 0;

  constructor(credentials: ExchangeCredentials) {
    this.credentials = credentials;
  }

  /**
   * Rate limiting: ensure minimum delay between requests
   */
  protected async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const waitTime = Math.max(0, this.rateLimitDelay - timeSinceLastRequest);

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Test connection to exchange
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Fetch trade history
   */
  abstract fetchTrades(options?: FetchOptions): Promise<Trade[]>;

  /**
   * Fetch account balances
   */
  abstract fetchBalances(): Promise<Balance[]>;

  /**
   * Fetch order history
   */
  abstract fetchOrders(options?: FetchOptions): Promise<Order[]>;

  /**
   * Fetch deposit history
   */
  abstract fetchDeposits(options?: FetchOptions): Promise<Deposit[]>;

  /**
   * Fetch withdrawal history
   */
  abstract fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]>;
}
