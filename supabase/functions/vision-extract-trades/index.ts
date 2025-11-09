import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS for web app usage
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: safe base64 size estimation (bytes)
function estimateBase64Bytes(input: string): number {
  const str = input.startsWith("data:") ? input.split(",")[1] || "" : input;
  const len = str.length;
  return Math.floor((len * 3) / 4) - (str.endsWith("==") ? 2 : str.endsWith("=") ? 1 : 0);
}

serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startedAt = Date.now();
  const correlationId = crypto.randomUUID();

  try {
    // Auth (verify_jwt = true in config.toml enforces verification)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract user id from verified JWT
    const token = authHeader.replace("Bearer ", "");
    let userId = "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub || "";
    } catch (_) {
      return new Response(JSON.stringify({ error: "Invalid token format" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse body
    const { imageBase64, broker, debug } = await req.json();

    if (typeof imageBase64 !== "string" || imageBase64.length < 16) {
      return new Response(JSON.stringify({ error: "Invalid or missing imageBase64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enforce 10MB limit
    const approxBytes = estimateBase64Bytes(imageBase64);
    if (approxBytes > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Image too large. Max 10MB.", maxBytes: 10 * 1024 * 1024 }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[vision-extract-trades] Missing LOVABLE_API_KEY");
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(
      JSON.stringify({
        msg: "vision-extract-trades invoked",
        correlationId,
        userId,
        broker: broker || null,
        imageKB: Math.round(approxBytes / 1024),
        timestamp: new Date().toISOString(),
      })
    );

    // Prepare tool-calling schema
    const tools = [
      {
        type: "function",
        function: {
          name: "return_trades",
          description:
            "Return all trades found in the screenshot. Include whatever fields are confidently visible.",
          parameters: {
            type: "object",
            properties: {
              trades: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    timestamp: { type: "string", description: "ISO datetime if visible" },
                    symbol: { type: "string" },
                    side: { type: "string", enum: ["buy", "sell", "long", "short"] },
                    price: { type: "number" },
                    quantity: { type: "number" },
                    fee: { type: "number" },
                    feeCurrency: { type: "string" },
                    orderId: { type: "string" },
                    broker: { type: "string" },
                    entry_price: { type: "number" },
                    exit_price: { type: "number" },
                    position_size: { type: "number" },
                    leverage: { type: "number" },
                    margin: { type: "number" },
                    pnl: { type: "number" },
                    roi: { type: "number" },
                    opened_at: { type: "string" },
                    closed_at: { type: "string" },
                  },
                  additionalProperties: true,
                },
              },
              notes: { type: "string" },
            },
            required: ["trades"],
            additionalProperties: false,
          },
        },
      },
    ];

    const body = {
      model: "openai/gpt-5",
      messages: [
        {
          role: "system",
          content:
            "You extract structured trades from broker screenshots. Be strict and call the provided tool with the parsed results. Do not include narrative.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Identify all visible trade rows and return them via the return_trades function. Only include fields that are clear.",
            },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "return_trades" } },
      max_completion_tokens: 1200,
    } as const;

    const aiReqStarted = Date.now();
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error(
        JSON.stringify({
          msg: "AI gateway error",
          correlationId,
          status: aiResp.status,
          text: text?.slice(0, 400),
        })
      );

      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please retry shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add Lovable AI credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const latencyMs = Date.now() - aiReqStarted;

    // Try to read tool call results first
    let extracted: any[] | null = null;
    try {
      const tc = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
      if (tc?.function?.arguments) {
        const parsed = JSON.parse(tc.function.arguments);
        if (parsed?.trades && Array.isArray(parsed.trades)) {
          extracted = parsed.trades;
        }
      }
    } catch (e) {
      // ignore and fallback
    }

    // Fallback to parsing raw content as JSON array/object
    if (!extracted) {
      const content = aiJson?.choices?.[0]?.message?.content;
      if (typeof content === "string") {
        const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        try {
          const parsed = JSON.parse(cleaned);
          extracted = Array.isArray(parsed) ? parsed : [parsed];
        } catch (_) {
          extracted = [];
        }
      } else {
        extracted = [];
      }
    }

    // Normalize and lightly validate
    const trades = (extracted || [])
      .filter((t) => t && (t.symbol || t.pair || t.asset))
      .map((t) => {
        const direction = String(t.side || t.direction || "long").toLowerCase();
        const pnl = Number(t.pnl ?? t.profit_loss ?? 0);
        const entry_price = Number(t.entry_price || t.price || 0);
        const exit_price = Number(t.exit_price || 0);
        const position_size = Number(t.position_size || t.quantity || 0);
        const margin = Number(t.margin || (entry_price * position_size) || 0);
        const roi = margin > 0 ? (pnl / margin) * 100 : Number(t.roi || 0);
        return {
          symbol: String(t.symbol || t.pair || t.asset || "UNKNOWN").toUpperCase(),
          side: direction === "buy" ? "long" : direction === "sell" ? "short" : (direction as "long" | "short"),
          broker: broker || t.broker || null,
          entry_price,
          exit_price,
          position_size,
          leverage: Number(t.leverage || 1),
          margin,
          trading_fee: Number(t.trading_fee || t.fee || 0),
          funding_fee: Number(t.funding_fee || 0),
          profit_loss: pnl,
          roi,
          opened_at: t.opened_at || t.timestamp || new Date().toISOString(),
          closed_at: t.closed_at || new Date().toISOString(),
          period_of_day: (() => {
            const d = new Date(t.opened_at || t.timestamp || Date.now());
            const h = d.getHours();
            if (h >= 5 && h < 12) return "morning";
            if (h >= 12 && h < 18) return "afternoon";
            return "night";
          })(),
          duration_days: 0,
          duration_hours: 0,
          duration_minutes: 0,
          notes: t.notes || null,
          setup: t.setup || null,
          emotional_tag: t.emotional_tag || null,
        };
      });

    console.log(
      JSON.stringify({
        msg: "vision-extract-trades ok",
        correlationId,
        userId,
        count: trades.length,
        latencyMs,
      })
    );

    // If none found, return usable debug
    if (trades.length === 0) {
      return new Response(
        JSON.stringify({
          trades: [],
          totalFound: 0,
          needsAnnotation: true,
          reason: "no_trades_detected",
          debug: debug
            ? { correlationId, latencyMs, model: "openai/gpt-5", note: "No trades parsed from image." }
            : undefined,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success
    return new Response(
      JSON.stringify({
        trades,
        totalFound: trades.length,
        needsAnnotation: false,
        debug: debug ? { correlationId, latencyMs, model: "openai/gpt-5" } : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(
      JSON.stringify({ msg: "vision-extract-trades fatal", correlationId, error: String(err) })
    );
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
