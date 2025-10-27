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

    const { invitee_email, group_id } = await req.json();

    // Generate unique 8-character invitation code
    const invitationCode = Array.from({ length: 8 }, () => 
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');

    // Check if user already has pending invitation
    const { data: existing } = await supabase
      .from('friend_invitations')
      .select('id')
      .eq('inviter_user_id', user.id)
      .eq('invitee_email', invitee_email)
      .eq('status', 'pending')
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Invitation already sent to this email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('friend_invitations')
      .insert({
        inviter_user_id: user.id,
        invitee_email,
        invitation_code: invitationCode,
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // Get inviter profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .single();

    const inviterName = profile?.full_name || profile?.username || 'A trader';
    const inviteUrl = `${req.headers.get('origin') || 'https://app.tradinghub.com'}/invite/${invitationCode}`;

    console.log(`Invitation created: ${invitationCode} from ${user.id} to ${invitee_email}`);

    return new Response(
      JSON.stringify({
        success: true,
        invitation_code: invitationCode,
        invite_url: inviteUrl,
        message: `Invitation sent to ${invitee_email}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending invitation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
