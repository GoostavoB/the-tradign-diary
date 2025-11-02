/**
 * STRIPE WEBHOOK HANDLER
 * Handles Stripe events for subscriptions and payments
 * 
 * Endpoint: POST /functions/v1/stripe-webhook
 * 
 * Critical Events:
 * - checkout.session.completed (new subscription/purchase)
 * - payment_intent.succeeded (credit purchase confirmed)
 * - customer.subscription.updated (tier change, renewal)
 * - customer.subscription.deleted (cancellation)
 * - invoice.payment_succeeded (monthly billing)
 * - invoice.payment_failed (failed payment)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

// Credit amounts per tier
const TIER_CREDITS = {
  pro: 30,
  elite: 100,
};

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
      status: 400,
    });
  }

  try {
    // Get raw body for signature verification
    const body = await req.text();

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log(`✅ Webhook received: ${event.type}`);

    // Initialize Supabase admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabaseAdmin);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object, supabaseAdmin);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseAdmin);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, supabaseAdmin);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabaseAdmin);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      }),
      { status: 400 }
    );
  }
});

/**
 * HANDLE CHECKOUT SESSION COMPLETED
 * Triggered when user completes subscription or credit purchase checkout
 */
async function handleCheckoutCompleted(session: any, supabase: any) {
  const userId = session.metadata.userId;
  const type = session.metadata.type;

  console.log(`Processing checkout for user ${userId}, type: ${type}`);

  if (type === 'subscription') {
    // Handle subscription checkout
    const tier = session.metadata.tier;
    const subscriptionId = session.subscription;
    
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    const subscriptionData = {
      user_id: userId,
      tier,
      status: stripeSubscription.status,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: false,
      credits_remaining: TIER_CREDITS[tier as 'pro' | 'elite'],
    };

    if (existingSub) {
      await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSub.id);
    } else {
      await supabase.from('subscriptions').insert(subscriptionData);
    }

    // Update user's Stripe customer ID
    await supabase
      .from('users')
      .update({ stripe_customer_id: session.customer })
      .eq('id', userId);

    console.log(`✅ Subscription created for user ${userId}`);
  } else if (type === 'credits') {
    // Handle credit purchase
    const credits = parseInt(session.metadata.credits);

    // Add credits to user
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('credits_remaining')
      .eq('user_id', userId)
      .single();

    const currentCredits = subscription?.credits_remaining || 0;

    await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        credits_remaining: currentCredits + credits,
        tier: 'free',
        status: 'active',
      });

    // Record transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: credits,
      type: 'purchase',
      description: `Purchased ${credits} credits`,
      stripe_payment_intent_id: session.payment_intent,
    });

    console.log(`✅ Added ${credits} credits to user ${userId}`);
  }
}

/**
 * HANDLE SUBSCRIPTION UPDATE
 * Triggered when subscription is created or updated
 */
async function handleSubscriptionUpdate(subscription: any, supabase: any) {
  const customerId = subscription.customer;
  
  // Find user by customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  const tier = subscription.metadata.tier || 'pro';

  const subscriptionData = {
    user_id: user.id,
    tier,
    status: subscription.status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

  // Update or insert subscription
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existing.id);
  } else {
    await supabase.from('subscriptions').insert({
      ...subscriptionData,
      credits_remaining: TIER_CREDITS[tier as 'pro' | 'elite'],
    });
  }

  console.log(`✅ Subscription updated for user ${user.id}`);
}

/**
 * HANDLE SUBSCRIPTION DELETED
 * Triggered when subscription is cancelled
 */
async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  const customerId = subscription.customer;

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      tier: 'free',
      stripe_subscription_id: null,
    })
    .eq('user_id', user.id);

  console.log(`✅ Subscription canceled for user ${user.id}`);
}

/**
 * HANDLE INVOICE PAYMENT SUCCEEDED
 * Triggered when monthly billing succeeds - refill credits
 */
async function handleInvoicePaymentSucceeded(invoice: any, supabase: any) {
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return; // Not a subscription invoice

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = stripeSubscription.customer as string;

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) return;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .single();

  if (!subscription) return;

  // Refill credits for the billing period
  const credits = TIER_CREDITS[subscription.tier as 'pro' | 'elite'];

  await supabase
    .from('subscriptions')
    .update({
      credits_remaining: credits,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    })
    .eq('user_id', user.id);

  console.log(`✅ Credits refilled for user ${user.id} (${credits} credits)`);
}

/**
 * HANDLE INVOICE PAYMENT FAILED
 * Triggered when monthly billing fails
 */
async function handleInvoicePaymentFailed(invoice: any, supabase: any) {
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return;

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = stripeSubscription.customer as string;

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) return;

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('user_id', user.id);

  console.log(`⚠️ Payment failed for user ${user.id}`);
}
