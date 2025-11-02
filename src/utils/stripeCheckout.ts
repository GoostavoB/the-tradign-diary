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
  console.log('🚀 initiateStripeCheckout called with:', params);
  const { priceId, productType, successUrl, cancelUrl } = params;

  // Verify user is authenticated
  console.log('🔐 Checking authentication...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  console.log('🔐 Session:', session ? 'Found' : 'Not found', 'Error:', sessionError);
  
  if (sessionError || !session) {
    console.error('❌ Authentication failed:', sessionError);
    throw new Error('You must be logged in to make a purchase');
  }

  // Set default URLs if not provided
  const frontendUrl = window.location.origin;
  const defaultSuccessUrl = `${frontendUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`;
  const defaultCancelUrl = `${frontendUrl}/checkout-cancel`;

  // Call Edge Function to create Stripe checkout session
  console.log('📞 Calling edge function with body:', {
    priceId,
    productType,
    successUrl: successUrl || defaultSuccessUrl,
    cancelUrl: cancelUrl || defaultCancelUrl,
  });
  
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

  console.log('⏳ Waiting for response...');
  const { data, error } = await Promise.race([invokePromise, timeout]) as any;

  console.log('📦 Response received:', { data, error });

  if (error) {
    console.error('❌ Checkout error:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }

  if (!data?.url) {
    console.error('❌ No checkout URL in response:', data);
    throw new Error('No checkout URL received from server');
  }

  // Track checkout initiation (before redirect)
  const amount = parseFloat(priceId.includes('annual') ? '99' : priceId.includes('monthly') ? '29' : '0');
  console.info('📊 Tracking checkout initiation');
  trackCheckoutFunnel.initiateCheckout(productType, priceId, amount);

  // Redirect in same tab, breaking out of iframe if needed
  console.info('🔗 Redirecting to Stripe checkout:', data.url);
  if (window.top && window.top !== window) {
    console.info('⚠️ Breaking out of iframe to top-level window');
    window.top.location.assign(data.url);
  } else {
    window.location.assign(data.url);
  }
  console.info('✅ Redirect initiated successfully');
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
