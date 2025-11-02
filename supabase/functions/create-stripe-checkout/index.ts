/**
 * STRIPE CHECKOUT SESSION CREATION V2
 * Creates Stripe checkout sessions for subscriptions (monthly/annual) and credit purchases
 * 
 * Endpoint: POST /functions/v1/create-stripe-checkout
 * 
 * Body:
 * {
 *   "priceId": "price_xxx",
 *   "productType": "subscription_monthly" | "subscription_annual" | "credits_starter" | "credits_pro",
 *   "successUrl": "optional",
 *   "cancelUrl": "optional"
 * }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('No user found')
    }

    const { priceId, productType, successUrl, cancelUrl } = await req.json()

    if (!priceId || !productType) {
      throw new Error('Missing required parameters: priceId and productType')
    }

    console.log('Creating checkout session for:', {
      userId: user.id,
      email: user.email,
      priceId,
      productType,
    })

    // Determine session configuration based on product type
    let sessionConfig: any = {
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // Default to payment mode
      success_url: successUrl || `${Deno.env.get('FRONTEND_URL')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${Deno.env.get('FRONTEND_URL')}/pricing`,
      metadata: {
        user_id: user.id,
        product_type: productType,
      },
    }

    // Configure based on product type
    switch (productType) {
      case 'subscription_monthly':
      case 'subscription_annual':
        sessionConfig.mode = 'subscription'
        sessionConfig.metadata.subscription_type = productType
        // Enable customer portal access for subscriptions
        sessionConfig.subscription_data = {
          metadata: {
            user_id: user.id,
          },
        }
        break

      case 'credits_starter':
      case 'credits_pro':
        sessionConfig.mode = 'payment'
        sessionConfig.metadata.credit_type = productType
        // Both give 10 credits, price differs
        const creditAmount = 10
        sessionConfig.metadata.credit_amount = creditAmount.toString()
        break

      default:
        throw new Error(`Unknown product type: ${productType}`)
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig)

    console.log('Checkout session created:', session.id)

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
