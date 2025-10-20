import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConnectRequest {
  exchange: 'bingx' | 'binance' | 'bybit' | 'coinbase';
  apiKey: string;
  apiSecret: string;
  apiPassphrase?: string;
}

// Simple encryption using base64 encoding
// In production, use proper encryption with a secret key
function encrypt(text: string): string {
  return btoa(text);
}

async function validateBingXCredentials(apiKey: string, apiSecret: string): Promise<boolean> {
  const timestamp = Date.now().toString();
  const queryString = `timestamp=${timestamp}`;
  
  // Generate HMAC SHA256 signature
  const signature = createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');
  
  const url = `https://open-api.bingx.com/openApi/spot/v1/account/balance?${queryString}&signature=${signature}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': apiKey,
      },
    });
    
    const data = await response.json();
    
    // BingX returns code: 0 for success
    if (response.ok && data.code === 0) {
      return true;
    }
    
    console.error('BingX API validation failed:', data);
    return false;
  } catch (error) {
    console.error('BingX API call error:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { exchange, apiKey, apiSecret, apiPassphrase }: ConnectRequest = await req.json();

    // Validate required fields
    if (!exchange || !apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate credentials based on exchange
    let isValid = false;
    switch (exchange) {
      case 'bingx':
        isValid = await validateBingXCredentials(apiKey, apiSecret);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Exchange not supported yet' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid API credentials. Please check your API key and secret.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Encrypt credentials
    const encryptedKey = encrypt(apiKey);
    const encryptedSecret = encrypt(apiSecret);
    const encryptedPassphrase = apiPassphrase ? encrypt(apiPassphrase) : null;

    // Store connection in database (upsert to handle reconnections)
    const { data: connection, error: dbError } = await supabaseClient
      .from('exchange_connections')
      .upsert({
        user_id: user.id,
        exchange_name: exchange,
        api_key_encrypted: encryptedKey,
        api_secret_encrypted: encryptedSecret,
        api_passphrase_encrypted: encryptedPassphrase,
        is_active: true,
        sync_status: 'pending',
        sync_error: null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,exchange_name'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save connection');
    }

    return new Response(
      JSON.stringify({
        success: true,
        connectionId: connection.id,
        message: `Successfully connected to ${exchange}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
