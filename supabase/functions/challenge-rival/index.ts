import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { rival_user_id, challenge_message } = await req.json();

    if (!rival_user_id) {
      throw new Error('Rival user ID is required');
    }

    // Check if rival exists
    const { data: rivalProfile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', rival_user_id)
      .single();

    if (!rivalProfile) {
      throw new Error('Rival user not found');
    }

    // Add as rival if not already
    const { data: existingRival } = await supabase
      .from('user_rivals')
      .select('*')
      .eq('user_id', user.id)
      .eq('rival_user_id', rival_user_id)
      .single();

    if (!existingRival) {
      await supabase
        .from('user_rivals')
        .insert({
          user_id: user.id,
          rival_user_id,
          challenge_message,
        });
    } else {
      // Update challenge message
      await supabase
        .from('user_rivals')
        .update({ challenge_message })
        .eq('id', existingRival.id);
    }

    // Check if rival also has user as rival (mutual)
    const { data: mutualRival } = await supabase
      .from('user_rivals')
      .select('*')
      .eq('user_id', rival_user_id)
      .eq('rival_user_id', user.id)
      .single();

    if (mutualRival) {
      // Update both to mutual
      await Promise.all([
        supabase
          .from('user_rivals')
          .update({ is_mutual: true })
          .eq('user_id', user.id)
          .eq('rival_user_id', rival_user_id),
        supabase
          .from('user_rivals')
          .update({ is_mutual: true })
          .eq('user_id', rival_user_id)
          .eq('rival_user_id', user.id),
      ]);
    }

    // Get challenger profile
    const { data: challengerProfile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .single();

    const challengerName = challengerProfile?.full_name || challengerProfile?.username || 'A trader';
    const message = challenge_message 
      ? `${challengerName} challenged you: "${challenge_message}" 🔥`
      : `${challengerName} challenged you to a trading duel! 🔥`;

    // Send notification
    await supabase
      .from('friend_challenge_notifications')
      .insert({
        user_id: rival_user_id,
        challenger_user_id: user.id,
        notification_type: 'challenge_issued',
        message,
      });

    console.log(`Challenge sent from ${user.id} to ${rival_user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Challenge sent to ${rivalProfile.full_name || rivalProfile.username}!`,
        is_mutual: !!mutualRival,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending challenge:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
