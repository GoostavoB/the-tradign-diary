/**
 * STRIPE CHECKOUT SESSION CREATION
 * Creates Stripe checkout sessions for subscriptions and credit purchases
 * 
 * Endpoint: POST /functions/v1/create-stripe-checkout
 * 
 * Body:
 * {
 *   "type": "subscription" | "credits",
 *   "tier": "pro" | "elite",  // For subscriptions
 *   "credits": number         // For credit purchases
 * }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pricing Configuration
const PRICING = {
  subscriptions: {
    pro: {
      priceId: Deno.env.get('STRIPE_PRO_PRICE_ID'),
      amount: 1900, // $19.00
      credits: 30,
    },
    elite: {
      priceId: Deno.env.get('STRIPE_ELITE_PRICE_ID'),
      amount: 4900, // $49.00
      credits: 100,
    },
  },
  credits: {
    free: {
      base: 500, // $5.00 for 10 credits
      perCredit: 50,
    },
    pro: {
      base: 200, // $2.00 for 10 credits (60% discount)
      perCredit: 20,
    },
  },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with user context
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Parse request body
    const { type, tier, credits } = await req.json();

    // Validate request
    if (!type || !['subscription', 'credits'].includes(type)) {
      throw new Error('Invalid checkout type');
    }

    if (type === 'subscription' && !['pro', 'elite'].includes(tier)) {
      throw new Error('Invalid subscription tier');
    }

    if (type === 'credits' && (!credits || credits < 1)) {
      throw new Error('Invalid credits amount');
    }

    // Get user's current tier for pricing
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const userTier = profile?.subscription_tier || 'free';

    // Create checkout session based on type
    let sessionConfig: Stripe.Checkout.SessionCreateParams;

    if (type === 'subscription') {
      if (!tier || !['pro', 'elite'].includes(tier)) {
        throw new Error('Invalid subscription tier');
      }

      const pricing = PRICING.subscriptions[tier as 'pro' | 'elite'];

      sessionConfig = {
        mode: 'subscription',
        line_items: [
          {
            price: pricing.priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          type: 'subscription',
          tier,
          credits: pricing.credits.toString(),
        },
      };
    } else {
      // Credits purchase
      if (!credits || credits < 10) {
        throw new Error('Minimum credit purchase is 10 credits');
      }

      const pricing = PRICING.credits[userTier as 'free' | 'pro'];
      const amount = Math.ceil(credits / 10) * pricing.base;

      sessionConfig = {
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${credits} AI Extraction Credits`,
                description: `Additional credits for The Trading Diary`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          type: 'credits',
          credits: credits.toString(),
        },
      };
    }

    // Common session configuration
    const session = await stripe.checkout.sessions.create({
      ...sessionConfig,
      customer_email: user.email,
      success_url: `${Deno.env.get('FRONTEND_URL')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('FRONTEND_URL')}/pricing`,
      client_reference_id: user.id,
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
