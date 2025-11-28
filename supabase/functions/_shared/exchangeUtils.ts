/**
 * Shared utilities for exchange integrations
 */

// Simple encryption using base64 encoding
export function encrypt(text: string): string {
  return btoa(text);
}

// Simple decryption using base64 decoding
export function decrypt(text: string): string {
  return atob(text);
}

/**
 * Supported exchanges list
 */
export const SUPPORTED_EXCHANGES = [
  'binance',
  'bybit',
  'coinbase',
  'kraken',
  'bitfinex',
  'bingx',
  'mexc',
  'kucoin',
  'okx',
  'gateio',
  'bitstamp',
] as const;

export type SupportedExchange = typeof SUPPORTED_EXCHANGES[number];

/**
 * Exchanges that require API passphrase
 */
export const EXCHANGES_REQUIRING_PASSPHRASE: SupportedExchange[] = ['kucoin', 'okx', 'bitstamp'];

/**
 * Check if exchange requires passphrase
 */
export function requiresPassphrase(exchange: string): boolean {
  return EXCHANGES_REQUIRING_PASSPHRASE.includes(exchange as SupportedExchange);
}

/**
 * Validate exchange name
 */
export function isSupportedExchange(exchange: string): boolean {
  return SUPPORTED_EXCHANGES.includes(exchange.toLowerCase() as SupportedExchange);
}
