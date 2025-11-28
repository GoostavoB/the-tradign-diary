import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DisconnectRequest {
  connectionId: string;
  deleteTrades: boolean;
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

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { connectionId, deleteTrades }: DisconnectRequest = await req.json();

    // Fetch connection to verify ownership
    const { data: connection, error: connectionError } = await supabaseClient
      .from('exchange_connections')
      .select('exchange_name')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .single();

    if (connectionError || !connection) {
      throw new Error('Connection not found');
    }

    // Delete trades if requested
    if (deleteTrades) {
      const { error: deleteError } = await supabaseClient
        .from('trades')
        .delete()
        .eq('user_id', user.id)
        .eq('exchange_source', connection.exchange_name);

      if (deleteError) {
        console.error('Error deleting trades:', deleteError);
      }
    }

    // Delete connection (this will cascade delete sync history)
    const { error: deleteConnectionError } = await supabaseClient
      .from('exchange_connections')
      .delete()
      .eq('id', connectionId)
      .eq('user_id', user.id);

    if (deleteConnectionError) {
      throw new Error('Failed to delete connection');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully disconnected from ${connection.exchange_name}`,
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
