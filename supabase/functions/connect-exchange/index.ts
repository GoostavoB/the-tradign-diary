import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { encrypt, isSupportedExchange, requiresPassphrase } from '../_shared/exchangeUtils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConnectRequest {
  exchange: string;
  apiKey: string;
  apiSecret: string;
  apiPassphrase?: string;
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

    // Validate exchange is supported
    if (!isSupportedExchange(exchange)) {
      return new Response(
        JSON.stringify({ error: `Exchange ${exchange} is not supported` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate passphrase for exchanges that require it
    if (requiresPassphrase(exchange) && !apiPassphrase) {
      return new Response(
        JSON.stringify({ error: `${exchange} requires an API passphrase or customer ID` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Note: Credential validation will be done during first sync
    // We store the credentials now and test them when syncing trades

    // Encrypt credentials
    const encryptedKey = encrypt(apiKey);
    const encryptedSecret = encrypt(apiSecret);
    const encryptedPassphrase = apiPassphrase ? encrypt(apiPassphrase) : null;

    // Store connection in database (upsert to handle reconnections)
    const { data: connection, error: dbError } = await supabaseClient
      .from('exchange_connections')
      .upsert({
        user_id: user.id,
        exchange_name: exchange.toLowerCase(),
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
