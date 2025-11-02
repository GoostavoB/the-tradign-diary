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

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;
        const type = session.metadata?.type;

        if (!userId) {
          console.error('No userId in session metadata');
          break;
        }

        if (type === 'subscription') {
          // Handle subscription purchase
          const tier = session.metadata?.tier;
          const credits = parseInt(session.metadata?.credits || '0');
          const subscriptionId = session.subscription as string;

          // Create subscription record
          await supabaseAdmin.from('subscriptions').insert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
            tier,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });

          // Update user profile
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_tier: tier,
              credits_remaining: credits,
            })
            .eq('id', userId);

          console.log(`✅ Subscription activated for user ${userId}: ${tier}`);
        } else if (type === 'credits') {
          // Handle credits purchase
          const credits = parseInt(session.metadata?.credits || '0');
          const amount = session.amount_total || 0;

          // Add credits to user
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('credits_remaining')
            .eq('id', userId)
            .single();

          const currentCredits = profile?.credits_remaining || 0;

          await supabaseAdmin
            .from('profiles')
            .update({
              credits_remaining: currentCredits + credits,
            })
            .eq('id', userId);

          // Record transaction
          await supabaseAdmin.from('transactions').insert({
            user_id: userId,
            type: 'credit_purchase',
            amount: amount / 100, // Convert cents to dollars
            credits,
            stripe_payment_intent_id: session.payment_intent as string,
          });

          console.log(`✅ Credits added for user ${userId}: +${credits}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        // Update subscription status
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        // If subscription was canceled or paused
        if (subscription.status !== 'active') {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_tier: 'free',
            })
            .eq('id', userId);
        }

        console.log(`✅ Subscription updated for user ${userId}: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        // Mark subscription as canceled
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        // Downgrade user to free tier
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_tier: 'free',
          })
          .eq('id', userId);

        console.log(`✅ Subscription canceled for user ${userId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Get subscription to find user
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, tier')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!subscription) break;

        // Renew monthly credits
        const tier = subscription.tier as 'pro' | 'elite';
        const credits = TIER_CREDITS[tier];

        await supabaseAdmin
          .from('profiles')
          .update({
            credits_remaining: credits,
          })
          .eq('id', subscription.user_id);

        console.log(`✅ Monthly credits renewed for user ${subscription.user_id}: ${credits}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Get subscription to find user
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!subscription) break;

        // Mark subscription as past_due
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'past_due',
          })
          .eq('stripe_subscription_id', subscriptionId);

        console.log(`⚠️ Payment failed for user ${subscription.user_id}`);
        break;
      }

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
        error: error instanceof Error ? error.message : 'Webhook handler failed',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
