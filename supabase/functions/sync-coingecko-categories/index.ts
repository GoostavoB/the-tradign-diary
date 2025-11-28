import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

interface CoinGeckoCategory {
  category_id: string;
  name: string;
}

interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  categories: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's holdings to know which coins to fetch
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('symbol, coingecko_id')
      .eq('is_active', true);

    if (assetsError) throw assetsError;

    console.log(`Syncing categories for ${assets?.length || 0} assets`);

    // Fetch categories list from CoinGecko
    const categoriesResponse = await fetch(`${COINGECKO_API}/coins/categories/list`);
    const categoriesList: CoinGeckoCategory[] = await categoriesResponse.json();

    console.log(`Fetched ${categoriesList.length} categories from CoinGecko`);

    // Store categories in database
    for (const category of categoriesList) {
      await supabase
        .from('categories')
        .upsert({
          coingecko_category_id: category.category_id,
          name: category.name,
        }, {
          onConflict: 'coingecko_category_id',
          ignoreDuplicates: false
        });
    }

    // For each asset, fetch coin details and update categories
    const updates = [];
    for (const asset of assets || []) {
      try {
        // Use symbol to get coin ID if not already stored
        let coinId = asset.coingecko_id;
        
        if (!coinId) {
          // Search for coin by symbol
          const searchResponse = await fetch(`${COINGECKO_API}/search?query=${asset.symbol}`);
          const searchData = await searchResponse.json();
          const coin = searchData.coins?.find((c: any) => 
            c.symbol.toUpperCase() === asset.symbol.toUpperCase()
          );
          coinId = coin?.id;
        }

        if (coinId) {
          // Fetch detailed coin data
          const coinResponse = await fetch(`${COINGECKO_API}/coins/${coinId}`);
          const coinData: CoinGeckoCoin = await coinResponse.json();

          const categories = coinData.categories?.filter(c => c) || [];
          const primaryCategory = categories[0] || 'Uncategorized';

          updates.push({
            symbol: asset.symbol,
            coingecko_id: coinId,
            primary_category: primaryCategory,
            categories_json: categories,
            last_synced_at: new Date().toISOString()
          });

          console.log(`Updated ${asset.symbol}: ${primaryCategory} (${categories.length} total categories)`);
        } else {
          console.log(`Could not find CoinGecko ID for ${asset.symbol}`);
        }

        // Rate limiting: wait 1.2 seconds between requests (50 calls/minute for free tier)
        await new Promise(resolve => setTimeout(resolve, 1200));
      } catch (error) {
        console.error(`Error fetching data for ${asset.symbol}:`, error);
      }
    }

    // Bulk update assets
    if (updates.length > 0) {
      for (const update of updates) {
        await supabase
          .from('assets')
          .update({
            coingecko_id: update.coingecko_id,
            primary_category: update.primary_category,
            categories_json: update.categories_json,
            last_synced_at: update.last_synced_at
          })
          .eq('symbol', update.symbol);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        categoriesCount: categoriesList.length,
        assetsUpdated: updates.length,
        updates
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-coingecko-categories:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
