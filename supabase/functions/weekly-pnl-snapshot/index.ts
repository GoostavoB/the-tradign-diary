import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting weekly PNL snapshot capture...");

    // Get last Monday (start of previous week)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - daysToLastMonday - 7);
    lastMonday.setHours(0, 0, 0, 0);

    // Get last Sunday (end of previous week)
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    console.log(`Processing week: ${lastMonday.toISOString()} to ${lastSunday.toISOString()}`);

    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    let snapshotsCreated = 0;

    for (const user of users.users) {
      try {
        // Get trades for the previous week
        const { data: trades, error: tradesError } = await supabase
          .from("trades")
          .select("pnl, profit_loss")
          .eq("user_id", user.id)
          .gte("entry_date", lastMonday.toISOString())
          .lte("entry_date", lastSunday.toISOString());

        if (tradesError) {
          console.error(`Error fetching trades for user ${user.id}:`, tradesError);
          continue;
        }

        if (!trades || trades.length === 0) {
          console.log(`No trades for user ${user.id} in previous week`);
          continue;
        }

        const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length;
        const losingTrades = trades.filter(t => (t.pnl || 0) <= 0).length;

        // Insert or update snapshot
        const { error: insertError } = await supabase
          .from("weekly_pnl_snapshots")
          .upsert({
            user_id: user.id,
            week_start: lastMonday.toISOString().split('T')[0],
            week_end: lastSunday.toISOString().split('T')[0],
            total_pnl: totalPnL,
            trade_count: trades.length,
            winning_trades: winningTrades,
            losing_trades: losingTrades,
          }, {
            onConflict: 'user_id,week_start'
          });

        if (insertError) {
          console.error(`Error inserting snapshot for user ${user.id}:`, insertError);
          continue;
        }

        snapshotsCreated++;
        console.log(`Created snapshot for user ${user.id}: $${totalPnL.toFixed(2)}`);
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }

    console.log(`Completed: ${snapshotsCreated} snapshots created`);

    return new Response(
      JSON.stringify({ success: true, snapshotsCreated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in weekly-pnl-snapshot:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
