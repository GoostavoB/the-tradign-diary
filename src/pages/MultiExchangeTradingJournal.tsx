import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, Shield, Zap, CheckCircle2 } from "lucide-react";
import MetaTags from "@/components/SEO/MetaTags";
import SchemaMarkup from "@/components/SEO/SchemaMarkup";

export default function MultiExchangeTradingJournal() {
  const exchanges = [
    "Binance", "Bybit", "Coinbase", "Coinbase Pro", "Kraken", "KuCoin",
    "OKX", "Gate.io", "Bitfinex", "Huobi", "Crypto.com", "Gemini",
    "Bitstamp", "MEXC", "BingX", "Bitget", "HTX", "Bitrue",
    "Phemex", "BitMart", "Poloniex", "CoinEx", "XT.COM", "BTSE",
    "WhiteBIT", "Bitazza", "Pionex", "AscendEX", "LBank", "ProBit",
    "BIT", "BigONE", "Upbit", "Bithumb", "Coincheck", "BitFlyer",
    "Zaif", "Liquid", "Bit2C", "CEX.IO", "Luno", "VALR",
    "Paxful", "LocalBitcoins", "Bisq", "HodlHodl", "Deribit", "FTX"
  ];

  return (
    <>
      <MetaTags
        title="Multi-Exchange Trading Journal | Works With ALL Exchanges"
        description="Track trades from EVERY crypto exchange via image upload. Binance, Bybit, Coinbase, and 50+ more. No API needed. Universal compatibility."
        keywords="multi-exchange trading journal, universal crypto tracker, all exchange support, image upload journal"
      />
      <SchemaMarkup />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              The ONLY Trading Journal That Works With<br />
              <span className="text-primary">EVERY Exchange on Earth</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Binance user? ✅ Bybit trader? ✅ Small regional exchange? ✅ DeFi wallet? ✅
              <br />
              Our image upload technology works with 100% of exchanges. Zero limitations.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Tracking All Your Exchanges
              </Button>
            </Link>
          </div>
        </section>

        {/* The Problem */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              The Multi-Exchange Problem
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-destructive border-2">
                <h3 className="text-2xl font-bold mb-4 text-destructive">
                  ❌ API-Based Journals
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>"Sorry, we don't support your exchange yet"</li>
                  <li>"Limited to 10-15 major exchanges only"</li>
                  <li>"Regional exchange? Not available"</li>
                  <li>"DeFi wallets? No support"</li>
                  <li>"API broke after exchange update"</li>
                  <li>"Generate API keys for each exchange"</li>
                </ul>
              </Card>

              <Card className="p-8 border-primary border-2">
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  ✅ The Trading Diary
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>Works with EVERY exchange instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>No "supported exchanges" limitation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>Regional exchanges fully supported</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>DeFi wallets work perfectly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>Unlimited accounts (Pro/Elite)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>Never breaks (no API dependency)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>Screenshot and upload - done!</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              How Image Upload Makes Universal Support Possible
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-bold mb-2">Trade on ANY Exchange</h3>
                <p className="text-sm text-muted-foreground">
                  Binance, small regional exchange, DeFi wallet - doesn't matter
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-bold mb-2">Screenshot Trade</h3>
                <p className="text-sm text-muted-foreground">
                  Mobile or desktop, just screenshot the closed trade
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-bold mb-2">AI Extracts Data</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI reads the image and extracts all trade data
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="font-bold mb-2">Unified Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  All exchanges in one place, unified analytics
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Supported Exchanges */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Works With These Exchanges<br />
              <span className="text-xl font-normal text-muted-foreground">(And literally ALL others)</span>
            </h2>
            
            <Card className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {exchanges.map((exchange, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm">{exchange}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-primary/10 rounded-lg text-center">
                <p className="font-bold text-lg">+ EVERY other exchange on Earth</p>
                <p className="text-sm text-muted-foreground mt-2">
                  If you can screenshot it, we can track it. No exceptions.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Benefits of Multi-Exchange Tracking
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <Globe className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">Unified Performance View</h3>
                <p className="text-muted-foreground">
                  See your true performance across all platforms. No more scattered data in different apps.
                </p>
              </Card>

              <Card className="p-6">
                <Shield className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">Maximum Security</h3>
                <p className="text-muted-foreground">
                  Zero API connections = zero security risk. Never give exchange access to any third party.
                </p>
              </Card>

              <Card className="p-6">
                <Zap className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">Future-Proof</h3>
                <p className="text-muted-foreground">
                  New exchange launches tomorrow? Works immediately. No waiting for "integration updates."
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Stop Fighting With "Unsupported Exchange" Errors
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Track trades from ALL your exchanges in one unified dashboard. No API setup. No limitations.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12 py-6">
                Start Tracking All Exchanges Free
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
