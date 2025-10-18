import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trades } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert pattern recognition system for trading analysis.
Analyze the provided trades and identify recurring patterns in JSON format:

{
  "identified_patterns": [
    {
      "name": "Pattern name",
      "description": "Detailed description",
      "win_rate": number (0-100),
      "occurrences": number,
      "examples": ["trade_id1", "trade_id2"]
    }
  ],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"]
}

Focus on:
- Time-based patterns (day of week, time of day)
- Market condition patterns
- Setup execution patterns
- Risk management patterns
- Emotional/behavioral patterns`;

    const tradesData = JSON.stringify(trades);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze these trades and identify patterns:\n${tradesData}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const analysisText = result.choices?.[0]?.message?.content;
    const patterns = JSON.parse(analysisText);

    return new Response(
      JSON.stringify({ patterns }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-pattern-recognition function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Pattern recognition failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
