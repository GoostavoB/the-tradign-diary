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
    const { variation, imageUrl: originalImageUrl } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!originalImageUrl) {
      throw new Error('Original logo image URL is required');
    }

    // Define color change prompts for each variation - ONLY recolor, keep design identical
    const prompts: Record<string, string> = {
      'all-white': 'Recolor this logo to be all pure white. Keep the exact same design, shapes, and layout. Only change the colors to pure white (#FFFFFF). Maintain transparency.',
      'all-black': 'Recolor this logo to be all pure black. Keep the exact same design, shapes, and layout. Only change the colors to pure black (#000000). Maintain transparency.',
      'blue-white': 'Recolor this logo: make the circular icon and TR symbol vibrant blue (#3B82F6), and the text pure white (#FFFFFF). Keep the exact same design and shapes, only change colors. Maintain transparency.',
      'blue-black': 'Recolor this logo: make the circular icon and TR symbol vibrant blue (#3B82F6), and the text pure black (#000000). Keep the exact same design and shapes, only change colors. Maintain transparency.',
      'blue-gray': 'Recolor this logo: make the circular icon and TR symbol vibrant blue (#3B82F6), and the text dark gray (#374151). Keep the exact same design and shapes, only change colors. Maintain transparency.',
      'vietnam': 'Recolor this logo using Vietnam flag colors: the circular icon should be vibrant red (#DA251D), and the TR symbol and text should be golden yellow (#FFCD00). Keep the exact same design and shapes, only change colors. Maintain transparency.',
      'usa': 'Recolor this logo using USA flag colors: use red (#B22234), white (#FFFFFF), and blue (#3C3B6E). Keep the exact same design and shapes, only change colors to these patriotic colors. Maintain transparency.',
      'uae': 'Recolor this logo using UAE flag colors: use red (#FF0000), green (#00732F), white (#FFFFFF), and black (#000000). Keep the exact same design and shapes, only change colors. Maintain transparency.',
      'brazil': 'Recolor this logo using Brazil flag colors: vibrant green (#009739), golden yellow (#FEDD00), and blue (#002776). Keep the exact same design and shapes, only change colors. Maintain transparency.'
    };

    const prompt = prompts[variation];
    if (!prompt) {
      throw new Error('Invalid variation specified');
    }

    console.log(`Recoloring logo for variation: ${variation}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: originalImageUrl
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated in response');
    }

    console.log(`Successfully recolored ${variation} logo`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl,
        variation 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error generating logo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
