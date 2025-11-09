import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAccountRequest {
  name: string;
  type?: string;
  color?: string;
}

interface DuplicateAccountRequest {
  copy_data?: boolean;
  include?: {
    trades?: boolean;
    journal?: boolean;
    custom_metrics?: boolean;
  };
}

Deno.serve(async (req) => {
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const method = req.method;

    // Normalize route parts to start at function name
    const fnIndex = pathParts.findIndex((p) => p === 'accounts');
    const routeParts = fnIndex >= 0 ? pathParts.slice(fnIndex) : [];

    console.log('Request:', method, url.pathname, 'pathParts:', pathParts, 'routeParts:', routeParts);

    // GET /accounts - List all accounts
    if (method === 'GET' && routeParts.length === 1 && routeParts[0] === 'accounts') {
      const { data: accounts, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('active_account_id')
        .eq('id', user.id)
        .single();

      return new Response(
        JSON.stringify({
          accounts: accounts || [],
          activeAccountId: profile?.active_account_id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // POST /accounts - Handle body-based actions (activate) or create new account
    if (method === 'POST' && routeParts.length === 1 && routeParts[0] === 'accounts') {
      const body = await req.json();
      
      // Handle activation via body parameter
      if (body.action === 'activate' && body.accountId) {
        const accountId = body.accountId;
        
        // Verify ownership
        const { data: account } = await supabase
          .from('trading_accounts')
          .select('id')
          .eq('id', accountId)
          .eq('user_id', user.id)
          .single();

        if (!account) {
          return new Response(JSON.stringify({ error: 'Account not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('profiles')
          .update({ active_account_id: accountId })
          .eq('id', user.id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, activeAccountId: accountId }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Otherwise, handle as create account request
      const createBody: CreateAccountRequest = body;

      // Check plan limits
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      const tier = profile?.subscription_tier || 'free';

      // Count existing accounts
      const { count } = await supabase
        .from('trading_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Starter/free plan: limit to 1 account
      if ((tier === 'free' || tier === 'basic') && (count || 0) >= 1) {
        return new Response(
          JSON.stringify({
            error: 'Plan limit reached',
            message: 'Starter supports 1 account. Upgrade to Pro for unlimited accounts.',
            code: 'PLAN_LIMIT_REACHED',
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Validate name
      if (!createBody.name || createBody.name.length < 2 || createBody.name.length > 40) {
        return new Response(
          JSON.stringify({ error: 'Name must be between 2 and 40 characters' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Generate slug
      const slug = createBody.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const { data: newAccount, error } = await supabase
        .from('trading_accounts')
        .insert({
          user_id: user.id,
          name: createBody.name,
          slug,
          type: createBody.type,
          color: createBody.color,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ error: 'Account name already exists' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        throw error;
      }

      return new Response(JSON.stringify(newAccount), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /accounts/:id - Update account
    if (method === 'PATCH' && routeParts.length === 2 && routeParts[0] === 'accounts') {
      const accountId = routeParts[1];
      const body = await req.json();

      const slug = body.name
        ? body.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        : undefined;

      const { data: updatedAccount, error } = await supabase
        .from('trading_accounts')
        .update({
          name: body.name,
          slug,
          type: body.type,
          color: body.color,
        })
        .eq('id', accountId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(updatedAccount), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /accounts/:id/activate - Set as active account
    if (method === 'POST' && routeParts.length === 3 && routeParts[0] === 'accounts' && routeParts[2] === 'activate') {
      const accountId = routeParts[1];

      // Verify ownership
      const { data: account } = await supabase
        .from('trading_accounts')
        .select('id')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single();

      if (!account) {
        return new Response(JSON.stringify({ error: 'Account not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase
        .from('profiles')
        .update({ active_account_id: accountId })
        .eq('id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, activeAccountId: accountId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /accounts/:id/duplicate - Duplicate account
    if (method === 'POST' && routeParts.length === 3 && routeParts[0] === 'accounts' && routeParts[2] === 'duplicate') {
      const accountId = routeParts[1];
      const body: DuplicateAccountRequest = await req.json();

      // Verify ownership of source account
      const { data: sourceAccount } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single();

      if (!sourceAccount) {
        return new Response(JSON.stringify({ error: 'Source account not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check plan limits
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      const tier = profile?.subscription_tier || 'free';

      const { count } = await supabase
        .from('trading_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if ((tier === 'free' || tier === 'basic') && (count || 0) >= 1) {
        return new Response(
          JSON.stringify({
            error: 'Plan limit reached',
            message: 'Starter supports 1 account. Upgrade to Pro for unlimited accounts.',
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Create new account with " Copy" suffix
      const newName = `${sourceAccount.name} Copy`;
      const slug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const { data: newAccount, error: createError } = await supabase
        .from('trading_accounts')
        .insert({
          user_id: user.id,
          name: newName,
          slug,
          type: sourceAccount.type,
          color: sourceAccount.color,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copy data if requested
      if (body.copy_data !== false) {
        const include = body.include || {
          trades: true,
          journal: true,
          custom_metrics: true,
        };

        if (include.trades) {
          const { data: trades } = await supabase
            .from('trades')
            .select('*')
            .eq('account_id', accountId)
            .is('deleted_at', null);

          if (trades && trades.length > 0) {
            const tradesToInsert = trades.map((t) => {
              const { id, created_at, updated_at, ...rest } = t;
              return { ...rest, account_id: newAccount.id };
            });

            await supabase.from('trades').insert(tradesToInsert);
          }
        }

        if (include.journal) {
          const { data: journals } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('account_id', accountId);

          if (journals && journals.length > 0) {
            const journalsToInsert = journals.map((j) => {
              const { id, created_at, updated_at, ...rest } = j;
              return { ...rest, account_id: newAccount.id };
            });

            await supabase.from('journal_entries').insert(journalsToInsert);
          }
        }

        if (include.custom_metrics) {
          const { data: widgets } = await supabase
            .from('custom_dashboard_widgets')
            .select('*')
            .eq('account_id', accountId);

          if (widgets && widgets.length > 0) {
            const widgetsToInsert = widgets.map((w) => {
              const { id, created_at, updated_at, ...rest } = w;
              return { ...rest, account_id: newAccount.id };
            });

            await supabase.from('custom_dashboard_widgets').insert(widgetsToInsert);
          }
        }
      }

      // Set new account as active
      await supabase
        .from('profiles')
        .update({ active_account_id: newAccount.id })
        .eq('id', user.id);

      return new Response(JSON.stringify(newAccount), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /accounts/:id - Delete account
    if (method === 'DELETE' && routeParts.length === 2 && routeParts[0] === 'accounts') {
      const accountId = routeParts[1];

      // Check if it's the active account
      const { data: profile } = await supabase
        .from('profiles')
        .select('active_account_id')
        .eq('id', user.id)
        .single();

      if (profile?.active_account_id === accountId) {
        return new Response(
          JSON.stringify({
            error: 'Cannot delete active account',
            message: 'Please switch to another account first',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Delete the account (hard delete since no is_deleted column exists)
      const { error } = await supabase
        .from('trading_accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
