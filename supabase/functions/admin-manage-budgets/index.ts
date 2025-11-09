import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BudgetUpdateParams {
  userId: string;
  budgetCents?: number;
  spendCents?: number;
  plan?: 'starter' | 'pro' | 'elite';
  reason: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, params } = await req.json();

    // Get all budgets
    if (action === 'list_budgets') {
      const { page = 1, limit = 50, search } = params || {};
      const offset = (page - 1) * limit;

      let query = supabaseClient
        .from('user_ai_budget')
        .select(`
          *,
          profiles!user_ai_budget_user_id_fkey(email, full_name)
        `, { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        // Search by email or user_id
        query = query.or(`user_id.eq.${search},profiles.email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({
          budgets: data,
          pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil((count || 0) / limit)
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get specific user's budget
    if (action === 'get_budget') {
      const { userId } = params;
      if (!userId) throw new Error('userId is required');

      const monthStart = new Date().toISOString().slice(0, 7) + '-01';

      const { data, error } = await supabaseClient
        .from('user_ai_budget')
        .select(`
          *,
          profiles!user_ai_budget_user_id_fkey(email, full_name)
        `)
        .eq('user_id', userId)
        .eq('month_start', monthStart)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

      return new Response(
        JSON.stringify({ budget: data || null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update user's budget
    if (action === 'update_budget') {
      const { userId, budgetCents, spendCents, plan, reason }: BudgetUpdateParams = params;

      if (!userId || !reason) {
        throw new Error('userId and reason are required');
      }

      const monthStart = new Date().toISOString().slice(0, 7) + '-01';

      // Get existing budget
      const { data: existing } = await supabaseClient
        .from('user_ai_budget')
        .select('*')
        .eq('user_id', userId)
        .eq('month_start', monthStart)
        .single();

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString()
      };

      if (budgetCents !== undefined) updateData.budget_cents = budgetCents;
      if (spendCents !== undefined) updateData.spend_cents = spendCents;
      if (plan) updateData.plan = plan;

      // Set session variable for audit log
      await supabaseClient.rpc('exec_sql', {
        sql: `SET LOCAL app.modified_by_user_id = '${user.id}';`
      }).catch(() => {
        // Fallback: session variables might not work, audit trigger will use user_id
      });

      await supabaseClient.rpc('exec_sql', {
        sql: `SET LOCAL app.audit_reason = '${reason.replace(/'/g, "''")}';`
      }).catch(() => {});

      let result;
      if (existing) {
        // Update existing
        const { data, error } = await supabaseClient
          .from('user_ai_budget')
          .update(updateData)
          .eq('user_id', userId)
          .eq('month_start', monthStart)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new
        const { data, error } = await supabaseClient
          .from('user_ai_budget')
          .insert({
            user_id: userId,
            month_start: monthStart,
            budget_cents: budgetCents || 75,
            spend_cents: spendCents || 0,
            plan: plan || 'starter',
            ...updateData
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Manual audit log entry (in case trigger doesn't capture reason)
      await supabaseClient.from('budget_audit_log').insert({
        user_id: userId,
        modified_by: user.id,
        action: existing ? 'admin_override' : 'create',
        old_budget_cents: existing?.budget_cents,
        new_budget_cents: budgetCents,
        old_spend_cents: existing?.spend_cents,
        new_spend_cents: spendCents,
        old_plan: existing?.plan,
        new_plan: plan,
        reason: `[ADMIN] ${reason}`,
        metadata: { admin_user_id: user.id, admin_email: user.email }
      });

      return new Response(
        JSON.stringify({ budget: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reset user's monthly spend
    if (action === 'reset_spend') {
      const { userId, reason } = params;

      if (!userId || !reason) {
        throw new Error('userId and reason are required');
      }

      const monthStart = new Date().toISOString().slice(0, 7) + '-01';

      const { data, error } = await supabaseClient
        .from('user_ai_budget')
        .update({
          spend_cents: 0,
          force_lite_at_80_percent: false,
          blocked_at_100_percent: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('month_start', monthStart)
        .select()
        .single();

      if (error) throw error;

      // Audit log
      await supabaseClient.from('budget_audit_log').insert({
        user_id: userId,
        modified_by: user.id,
        action: 'reset',
        old_spend_cents: data.spend_cents,
        new_spend_cents: 0,
        reason: `[ADMIN] ${reason}`,
        metadata: { admin_user_id: user.id, admin_email: user.email }
      });

      return new Response(
        JSON.stringify({ budget: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's cost logs
    if (action === 'get_cost_logs') {
      const { userId, page = 1, limit = 100 } = params;
      if (!userId) throw new Error('userId is required');

      const offset = (page - 1) * limit;

      const { data, error, count } = await supabaseClient
        .from('ai_cost_log')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return new Response(
        JSON.stringify({
          logs: data,
          pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil((count || 0) / limit)
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's audit trail
    if (action === 'get_audit_trail') {
      const { userId, page = 1, limit = 50 } = params;
      if (!userId) throw new Error('userId is required');

      const offset = (page - 1) * limit;

      const { data, error, count } = await supabaseClient
        .from('budget_audit_log')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return new Response(
        JSON.stringify({
          audits: data,
          pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil((count || 0) / limit)
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get stats (total users, total spend, etc.)
    if (action === 'get_stats') {
      const monthStart = new Date().toISOString().slice(0, 7) + '-01';

      const [
        { count: totalUsers },
        { data: budgetStats },
        { data: costStats }
      ] = await Promise.all([
        supabaseClient.from('user_ai_budget').select('*', { count: 'exact', head: true }),
        supabaseClient.from('user_ai_budget').select('spend_cents, budget_cents').eq('month_start', monthStart),
        supabaseClient.from('ai_cost_log').select('cost_cents, endpoint').gte('created_at', monthStart)
      ]);

      const totalSpend = budgetStats?.reduce((sum, b) => sum + b.spend_cents, 0) || 0;
      const totalBudget = budgetStats?.reduce((sum, b) => sum + b.budget_cents, 0) || 0;
      const totalCost = costStats?.reduce((sum, l) => sum + l.cost_cents, 0) || 0;

      const usersAtLimit = budgetStats?.filter(b =>
        (b.spend_cents / b.budget_cents) >= 1.0
      ).length || 0;

      const usersNearLimit = budgetStats?.filter(b =>
        (b.spend_cents / b.budget_cents) >= 0.8 && (b.spend_cents / b.budget_cents) < 1.0
      ).length || 0;

      return new Response(
        JSON.stringify({
          totalUsers,
          totalSpend,
          totalBudget,
          totalCost,
          usersAtLimit,
          usersNearLimit,
          averageSpend: totalUsers ? totalSpend / totalUsers : 0,
          budgetUtilization: totalBudget ? (totalSpend / totalBudget) * 100 : 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in admin-manage-budgets:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
