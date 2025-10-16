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
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Extracting trade information from image...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are a trade data extraction expert. Extract ALL trades from trading screenshots and return structured JSON data.

CRITICAL RULES:
1. Extract ALL trades visible in the image (not just one)
2. For position_type: determine if it's "long" or "short" based on:
   - If entry price > exit price AND profit is positive = SHORT
   - If entry price < exit price AND profit is positive = LONG
   - If entry price > exit price AND profit is negative = LONG
   - If entry price < exit price AND profit is negative = SHORT
3. Calculate period_of_day based on opened_at time:
   - morning: 00:00-11:59
   - afternoon: 12:00-17:59
   - night: 18:00-23:59
4. Calculate duration from opened_at to closed_at:
   - duration_days: full days (24h = 1 day)
   - duration_hours: remaining hours after days
   - duration_minutes: remaining minutes after hours
5. CRITICAL - Extract position_size (Size, Qty, Amount, Quantity):
   - Look for labels like "Size:", "Qty:", "Amount:", "Quantity:", "Contracts:", "Units:"
   - This is the NUMBER OF CONTRACTS or UNITS traded (e.g., 0.001, 1.5, 100)
   - If you cannot find it explicitly, try to calculate from: margin / entry_price for futures
   - NEVER leave position_size as null - calculate it if needed
   - Common locations: near entry/exit price, in trade details, beside margin
6. CRITICAL - Extract leverage (e.g., "10x", "5X", "Leverage: 10"):
   - Look for leverage indicators like "10x", "5X", "20x", "Leverage:", "Lev:"
   - Extract just the number (e.g., from "10x" extract 10)
   - Common locations: near position size, in trade header, beside margin
   - Default to 1 if no leverage is found
7. Extract ALL available information including:
   - broker: trading platform/broker name if visible
   - setup: trading strategy/setup type if visible (e.g., "Breakout", "Reversal", "Scalp")
   - emotional_tag: emotional state if visible or inferable (leave empty if not available)
   - notes: any additional observations or notes visible (leave empty if not available)
8. Return an array of trades even if there's only one trade

Return ONLY valid JSON with this structure (as an array):
[{
  "asset": "BTCUSDT",
  "broker": "Binance",
  "setup": "Breakout",
  "emotional_tag": "",
  "entry_price": 45000.50,
  "exit_price": 46000.00,
  "position_size": 0.5,
  "position_type": "long",
  "leverage": 10,
  "profit_loss": 500.00,
  "funding_fee": 0.15,
  "trading_fee": 2.50,
  "roi": 22.5,
  "margin": 2000.00,
  "opened_at": "2025-10-15T10:30:00Z",
  "closed_at": "2025-10-15T14:45:00Z",
  "period_of_day": "morning",
  "duration_days": 0,
  "duration_hours": 4,
  "duration_minutes": 15,
  "notes": ""
}]

IMPORTANT: All text fields (broker, setup, emotional_tag, notes) should be extracted if visible in the image. Leave them as empty strings "" if not available.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract ALL trading information from this screenshot. Return an array of all trades found."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const aiResponse = result.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    console.log('AI Response:', aiResponse);

    // Parse the JSON response
    let trades;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        trades = JSON.parse(jsonMatch[0]);
      } else {
        trades = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse trade data from AI response');
    }

    // Ensure trades is an array
    if (!Array.isArray(trades)) {
      trades = [trades];
    }

    console.log('Extracted trades:', trades);

    return new Response(
      JSON.stringify({ trades }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in extract-trade-info function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to extract trade information" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
