import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { messages, context } = await req.json();

    // Fetch user context for personalized coaching
    const { data: trades } = await supabaseClient
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('closed_at', { ascending: false })
      .limit(10);

    const { data: goals } = await supabaseClient
      .from('trading_goals')
      .select('*')
      .eq('user_id', user.id)
      .gte('deadline', new Date().toISOString())
      .order('deadline', { ascending: true })
      .limit(3);

    // Calculate stats
    const totalPnL = trades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;
    const winningTrades = trades?.filter(t => (t.pnl || 0) > 0).length || 0;
    const winRate = trades && trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
    const bestTrade = trades?.reduce((max, t) => (t.pnl || 0) > (max.pnl || 0) ? t : max, trades[0]);

    const systemPrompt = `You are an expert trading mentor and performance analyst. 

Your role is to:
- Provide professional yet encouraging guidance
- Focus on risk management, discipline, and trading psychology
- Reference the trader's actual data when answering questions
- Never provide financial advice or guarantee returns
- Be specific and actionable in your recommendations

The trader's current stats:
- Total P&L: $${totalPnL.toFixed(2)}
- Win Rate: ${winRate.toFixed(1)}%
- Total Trades: ${trades?.length || 0}
- Best Trade: $${bestTrade?.pnl?.toFixed(2) || 0} on ${bestTrade?.symbol || 'N/A'}
- Recent Activity: ${trades?.length || 0} trades in history

${goals && goals.length > 0 ? `Active Goals:\n${goals.map(g => `- ${g.title}: ${g.current_value}/${g.target_value}`).join('\n')}` : 'No active goals set'}

When answering questions like "my win rate" or "my best trade", reference these specific numbers.

Maintain a tone that is: Professional, Data-driven, Encouraging, Honest

Keep responses concise and actionable (under 200 words).`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      throw new Error(`AI API failed: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.choices?.[0]?.message?.content || '';

    // Save conversation to history
    await supabaseClient.from('ai_chat_history').insert([
      {
        user_id: user.id,
        role: 'user',
        message: messages[messages.length - 1].content
      },
      {
        user_id: user.id,
        role: 'assistant',
        message: aiResponse
      }
    ]);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('Error in ai-chat:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
