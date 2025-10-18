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
    const { trade_ids, period, report_type } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    if (report_type === "performance") {
      systemPrompt = `You are an expert trading performance analyst. Generate a comprehensive performance report in JSON format:
{
  "summary": "2-3 sentence executive summary",
  "findings": ["key finding 1", "key finding 2", "key finding 3"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
  "detailed_analysis": "Detailed paragraph analysis of performance trends"
}`;
    } else if (report_type === "analysis") {
      systemPrompt = `You are an expert trading analyst. Generate a deep-dive analysis report in JSON format:
{
  "summary": "Executive summary of analysis",
  "findings": ["pattern 1", "pattern 2", "behavioral insight"],
  "recommendations": ["optimization strategy 1", "risk adjustment"],
  "detailed_analysis": "Comprehensive analysis with statistical insights"
}`;
    } else {
      systemPrompt = `You are an expert trading coach. Generate a coaching report in JSON format:
{
  "summary": "Motivational summary",
  "findings": ["strength 1", "strength 2", "area for improvement"],
  "recommendations": ["coaching advice 1", "coaching advice 2"],
  "detailed_analysis": "Personalized coaching guidance and encouragement"
}`;
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
          { role: "user", content: `Generate a ${report_type} report for ${period} period covering trades: ${trade_ids?.join(', ')}` }
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
    const reportText = result.choices?.[0]?.message?.content;
    const report = JSON.parse(reportText);

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-generate-report function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Report generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
