import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();
    console.log("Generating clarification questions for:", prompt);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a trading analytics assistant helping users create custom widgets.

User's request: "${prompt}"

Available data context: ${JSON.stringify(context, null, 2)}

Generate 3-5 clarifying questions to ensure you understand exactly what the user wants. Focus on:
1. What specific metric they want (ROI, P&L, win rate, average trade duration, etc.)
2. How they want data grouped (by setup, symbol, broker, time period, day of week)
3. What time range to analyze (all time, last month, last 6 months, custom range)
4. What format to display (percentage, currency $, raw numbers, with decimals)
5. What type of visualization (table ranked, bar chart, pie chart, single number card, heatmap)

Respond with ONLY a JSON array of 3-5 concise question strings:
["Question 1?", "Question 2?", "Question 3?"]

Make questions specific and actionable.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: systemPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const questionsText = data.choices[0].message.content;
    
    console.log("Generated questions:", questionsText);

    // Parse and validate JSON
    let questions;
    try {
      questions = JSON.parse(questionsText);
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }
    } catch (e) {
      console.error("Failed to parse AI response as JSON array:", questionsText);
      throw new Error("AI generated invalid questions format");
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate clarification questions";
    console.error("Error in ai-widget-clarify:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});