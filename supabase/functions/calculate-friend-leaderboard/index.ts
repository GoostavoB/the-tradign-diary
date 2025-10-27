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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { group_id } = await req.json();

    // Get group members
    const { data: members, error: membersError } = await supabase
      .from('friend_leaderboard_members')
      .select('user_id')
      .eq('group_id', group_id);

    if (membersError) throw membersError;

    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No members in group' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userIds = members.map(m => m.user_id);

    // Get active season
    const { data: season } = await supabase
      .from('seasonal_competitions')
      .select('*')
      .eq('is_active', true)
      .single();

    if (!season) {
      throw new Error('No active season found');
    }

    const rankings = [];

    // Calculate stats for each member
    for (const userId of userIds) {
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .gte('entry_date', season.start_date)
        .lte('entry_date', season.end_date);

      if (!trades || trades.length === 0) {
        rankings.push({
          user_id: userId,
          performance_score: 0,
          roi: 0,
          win_rate: 0,
          consistency_index: 0,
        });
        continue;
      }

      const winningTrades = trades.filter(t => (t.pnl_percentage || 0) > 0).length;
      const totalTrades = trades.length;
      const winRate = (winningTrades / totalTrades) * 100;

      const totalROI = trades.reduce((sum, t) => sum + (t.pnl_percentage || 0), 0);
      const avgROI = totalROI / totalTrades;

      // Calculate consistency (std deviation of returns)
      const mean = avgROI;
      const squaredDiffs = trades.map(t => Math.pow((t.pnl_percentage || 0) - mean, 2));
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / totalTrades;
      const stdDev = Math.sqrt(variance);
      const consistencyIndex = stdDev === 0 ? 100 : Math.max(0, 100 - stdDev);

      // Performance score formula (same as main leaderboard)
      const performanceScore = (winRate * 0.3) + (avgROI * 0.4) + (consistencyIndex * 0.3);

      rankings.push({
        user_id: userId,
        performance_score: performanceScore,
        roi: avgROI,
        win_rate: winRate,
        consistency_index: consistencyIndex,
      });
    }

    // Sort by performance score
    rankings.sort((a, b) => b.performance_score - a.performance_score);

    // Assign ranks
    const rankedEntries = rankings.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      group_id,
      season_id: season.id,
    }));

    // Clear old entries for this group
    await supabase
      .from('leaderboard_entries')
      .delete()
      .eq('group_id', group_id)
      .eq('season_id', season.id);

    // Insert new entries
    const { error: insertError } = await supabase
      .from('leaderboard_entries')
      .insert(rankedEntries);

    if (insertError) throw insertError;

    console.log(`Friend leaderboard calculated for group ${group_id}: ${rankedEntries.length} members`);

    // Check for rank changes and send notifications
    for (let i = 0; i < rankedEntries.length; i++) {
      const entry = rankedEntries[i];
      
      // Get previous rank
      const { data: prevEntry } = await supabase
        .from('leaderboard_entries')
        .select('rank')
        .eq('user_id', entry.user_id)
        .eq('group_id', group_id)
        .eq('season_id', season.id)
        .neq('rank', entry.rank)
        .single();

      if (prevEntry && prevEntry.rank > entry.rank) {
        // User improved rank - notify them
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', entry.user_id)
          .single();

        await supabase
          .from('friend_challenge_notifications')
          .insert({
            user_id: entry.user_id,
            challenger_user_id: entry.user_id,
            notification_type: 'rank_overtaken',
            message: `You moved up to #${entry.rank} in your friend group! 🚀`,
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        rankings: rankedEntries,
        message: `Leaderboard calculated for ${rankedEntries.length} members`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calculating friend leaderboard:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
