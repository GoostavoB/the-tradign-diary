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

    const { invitation_code } = await req.json();

    // Find invitation
    const { data: invitation, error: findError } = await supabase
      .from('friend_invitations')
      .select('*')
      .eq('invitation_code', invitation_code)
      .single();

    if (findError || !invitation) {
      throw new Error('Invitation not found');
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from('friend_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);
      
      throw new Error('Invitation has expired');
    }

    // Check if already accepted
    if (invitation.status !== 'pending') {
      throw new Error('Invitation already processed');
    }

    // Update invitation
    const { error: updateError } = await supabase
      .from('friend_invitations')
      .update({
        status: 'accepted',
        invitee_user_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    if (updateError) throw updateError;

    // Create mutual follow relationship
    const followPromises = [
      supabase.from('user_follows').insert({
        follower_id: user.id,
        following_id: invitation.inviter_user_id,
      }),
      supabase.from('user_follows').insert({
        follower_id: invitation.inviter_user_id,
        following_id: user.id,
      }),
    ];

    await Promise.all(followPromises);

    // Create notification for inviter
    const { data: inviteeProfile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .single();

    const inviteeName = inviteeProfile?.full_name || inviteeProfile?.username || 'Someone';

    await supabase
      .from('friend_challenge_notifications')
      .insert({
        user_id: invitation.inviter_user_id,
        challenger_user_id: user.id,
        notification_type: 'invitation_accepted',
        message: `${inviteeName} accepted your friend invitation! 🎉`,
      });

    console.log(`Invitation accepted: ${invitation_code} by ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Friend invitation accepted!',
        inviter_user_id: invitation.inviter_user_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error accepting invitation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
