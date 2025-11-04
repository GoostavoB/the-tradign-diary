import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { imageBase64, broker, annotations } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📸 Vision extraction request:', { 
      userId: user.id, 
      broker,
      hasAnnotations: !!annotations?.length 
    });

    // Build prompt based on whether annotations are provided
    let userPrompt = `Extract ALL trades from this trading screenshot. Analyze the image carefully and return a JSON array of trade objects.

CRITICAL FIELDS (MUST be present):
- direction: 'long' or 'short' (REQUIRED)
- symbol: asset/pair like 'BTC', 'BTCUSDT', 'ETHUSDT' (REQUIRED)
- pnl: profit/loss as a number (REQUIRED)

IMPORTANT FIELDS (extract if visible):
- entry_price: entry price number
- exit_price: exit price number
- position_size: position size number
- leverage: leverage multiplier (default 1)
- margin: margin used
- trading_fee: trading fee paid
- funding_fee: funding fee paid
- opened_at: ISO timestamp when trade opened
- closed_at: ISO timestamp when trade closed

Return ONLY valid JSON array with this structure:
[
  {
    "direction": "long",
    "symbol": "BTCUSDT",
    "pnl": 150.50,
    "entry_price": 45000,
    "exit_price": 46000,
    "position_size": 0.5,
    "leverage": 10,
    "margin": 2250,
    "trading_fee": 5.25,
    "funding_fee": 2.15,
    "opened_at": "2025-01-15T10:30:00Z",
    "closed_at": "2025-01-15T14:45:00Z"
  }
]`;

    if (annotations && annotations.length > 0) {
      userPrompt += `\n\nIMPORTANT ANNOTATION HINTS: The user has marked these field locations on the image to help you understand the layout:\n`;
      annotations.forEach((ann: any) => {
        userPrompt += `- "${ann.label}" is located at approximately ${ann.relativeX.toFixed(1)}% horizontal, ${ann.relativeY.toFixed(1)}% vertical\n`;
      });
      userPrompt += `\nUse these annotations as visual hints to understand which columns/fields contain which data. Look for similar patterns in other rows/trades.`;
    }

    // Call Lovable AI Gateway with Gemini Pro Vision
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('❌ LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🤖 Calling Gemini Pro Vision...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a precise trade data extractor. Return ONLY valid JSON arrays. Never include markdown, explanations, or any text outside the JSON structure.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      })
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const errorText = await aiResponse.text();
      console.error('❌ AI Gateway error:', status, errorText);
      
      if (status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again in a moment.',
          retryAfter: 60 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required',
          message: 'AI credits exhausted. Please add funds to your Lovable workspace.'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'AI processing failed',
        details: errorText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error('❌ No content in AI response');
      return new Response(JSON.stringify({ 
        error: 'Empty AI response',
        needsAnnotation: true,
        reason: 'complex_layout'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ AI response received');

    // Parse JSON from response (handle markdown code blocks)
    let tradesData;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      tradesData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.error('Raw content:', content);
      return new Response(JSON.stringify({ 
        error: 'Invalid AI response format',
        needsAnnotation: !annotations,
        reason: 'parse_error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Ensure it's an array
    if (!Array.isArray(tradesData)) {
      tradesData = [tradesData];
    }

    // Validate and normalize trades
    const validTrades = tradesData
      .filter((t: any) => {
        // Must have critical fields
        const hasDirection = t.direction || t.side;
        const hasSymbol = t.symbol || t.asset || t.pair;
        const hasPnL = typeof t.pnl === 'number' || typeof t.profit_loss === 'number';
        
        return hasDirection && hasSymbol && hasPnL;
      })
      .map((t: any) => {
        // Normalize field names
        const direction = (t.direction || t.side || 'long').toLowerCase();
        const symbol = t.symbol || t.asset || t.pair || 'UNKNOWN';
        const pnl = Number(t.pnl ?? t.profit_loss ?? 0);
        
        // Calculate durations if timestamps provided
        let duration_hours = 0;
        let duration_minutes = 0;
        let duration_days = 0;
        
        if (t.opened_at && t.closed_at) {
          const openMs = new Date(t.opened_at).getTime();
          const closeMs = new Date(t.closed_at).getTime();
          const diffMs = closeMs - openMs;
          
          if (diffMs > 0) {
            duration_minutes = Math.floor(diffMs / (1000 * 60));
            duration_hours = Math.floor(duration_minutes / 60);
            duration_days = Math.floor(duration_hours / 24);
          }
        }

        // Calculate ROI if possible
        const entry_price = Number(t.entry_price || 0);
        const position_size = Number(t.position_size || 0);
        const margin = Number(t.margin || (entry_price * position_size) || 0);
        const roi = margin > 0 ? ((pnl / margin) * 100) : 0;

        return {
          symbol: symbol.toUpperCase(),
          side: direction as 'long' | 'short',
          broker: broker || t.broker || null,
          entry_price: entry_price,
          exit_price: Number(t.exit_price || 0),
          position_size: position_size,
          leverage: Number(t.leverage || 1),
          margin: margin,
          trading_fee: Number(t.trading_fee || t.fee || 0),
          funding_fee: Number(t.funding_fee || 0),
          profit_loss: pnl,
          roi: roi,
          opened_at: t.opened_at || new Date().toISOString(),
          closed_at: t.closed_at || new Date().toISOString(),
          period_of_day: determinePeriod(t.opened_at),
          duration_days,
          duration_hours,
          duration_minutes,
          notes: t.notes || null,
          setup: t.setup || null,
          emotional_tag: t.emotional_tag || null
        };
      });

    console.log(`✅ Extracted ${validTrades.length} valid trades`);

    // Determine if we need annotation based on results
    const needsAnnotation = validTrades.length === 0 && !annotations;
    const confidence = validTrades.length > 0 ? 0.85 : 0.3;
    const detectedLayout = determineLayout(validTrades, content);

    if (needsAnnotation) {
      return new Response(JSON.stringify({ 
        trades: [],
        confidence,
        totalFound: 0,
        detectedLayout,
        needsAnnotation: true,
        reason: 'no_trades_detected',
        message: 'Could not detect trades. Please mark one example trade to help us understand the layout.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      trades: validTrades,
      confidence,
      totalFound: validTrades.length,
      detectedLayout,
      needsAnnotation: false
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Vision extraction error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      needsAnnotation: true 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function determinePeriod(timestamp: string | null): 'morning' | 'afternoon' | 'night' {
  if (!timestamp) return 'morning';
  
  const hour = new Date(timestamp).getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}

function determineLayout(trades: any[], content: string): string {
  if (trades.length === 0) return 'complex';
  if (content.includes('header') || content.includes('column')) return 'table_with_headers';
  return 'table_no_headers';
}
