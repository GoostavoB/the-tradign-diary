/**
 * STRIPE CHECKOUT UTILITY
 * Unified function to initiate Stripe checkout for all product types
 * Handles subscriptions and credit purchases
 */

import { supabase } from '@/integrations/supabase/client';
import { trackCheckoutFunnel } from '@/utils/checkoutAnalytics';

export interface CheckoutParams {
  priceId: string;
  productType: 'subscription_monthly' | 'subscription_annual' | 'credits_starter' | 'credits_pro';
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

/**
 * Initiates a Stripe checkout session and redirects user to Stripe
 * @param params Checkout configuration
 * @returns Promise that resolves when redirect happens
 */
export const initiateStripeCheckout = async (params: CheckoutParams): Promise<void> => {
  const { priceId, productType, successUrl, cancelUrl } = params;

  // Verify user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('You must be logged in to make a purchase');
  }

  // Set default URLs if not provided
  const frontendUrl = window.location.origin;
  const defaultSuccessUrl = `${frontendUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`;
  const defaultCancelUrl = `${frontendUrl}/checkout-cancel`;

  // Call Edge Function to create Stripe checkout session
  const invokePromise = supabase.functions.invoke('create-stripe-checkout', {
    body: {
      priceId,
      productType,
      successUrl: successUrl || defaultSuccessUrl,
      cancelUrl: cancelUrl || defaultCancelUrl,
    },
  });

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Checkout request timed out')), 15000)
  );

  const { data, error } = await Promise.race([invokePromise, timeout]) as any;

  if (error) {
    console.error('Checkout error:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }

  if (!data?.url) {
    throw new Error('No checkout URL received from server');
  }

  // Track checkout initiation (before redirect)
  const amount = parseFloat(priceId.includes('annual') ? '99' : priceId.includes('monthly') ? '29' : '0');
  trackCheckoutFunnel.initiateCheckout(productType, priceId, amount);

  // Redirect to Stripe Checkout (try new tab first to avoid sandbox issues)
  const opened = window.open(data.url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.href = data.url;
  }
};

/**
 * Convenience function for subscription checkout
 */
export const checkoutSubscription = async (
  tier: 'pro' | 'elite',
  interval: 'monthly' | 'annual',
  priceId: string
): Promise<void> => {
  const productType = interval === 'monthly' ? 'subscription_monthly' : 'subscription_annual';
  
  return initiateStripeCheckout({
    priceId,
    productType,
  });
};

/**
 * Convenience function for credit purchase checkout
 */
export const checkoutCredits = async (
  priceId: string,
  hasSubscription: boolean
): Promise<void> => {
  const productType = hasSubscription ? 'credits_pro' : 'credits_starter';
  
  return initiateStripeCheckout({
    priceId,
    productType,
  });
};
