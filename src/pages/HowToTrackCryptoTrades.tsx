import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, FileText, Upload, CheckCircle2, X } from "lucide-react";
import MetaTags from "@/components/SEO/MetaTags";
import SchemaMarkup, { createArticleSchema } from "@/components/SEO/SchemaMarkup";

export default function HowToTrackCryptoTrades() {
  const articleSchema = createArticleSchema({
    title: "How to Track Crypto Trades in 2025: The Complete Guide",
    description: "Complete guide to tracking cryptocurrency trades. Learn the 3 methods (manual, CSV, image upload), essential metrics, and how to improve win rates by 20-30%.",
    image: "https://www.thetradingdiary.com/og-image-en.png",
    author: "The Trading Diary Team",
    datePublished: "2025-11-02",
    url: "https://www.thetradingdiary.com/how-to-track-crypto-trades"
  });

  return (
    <>
      <MetaTags
        title="How to Track Crypto Trades in 2025: The Complete Guide"
        description="Learn the 3 methods to track crypto trades (manual, CSV, image upload). Why image upload is fastest, safest, and works with ANY exchange. 15-second process."
        keywords="how to track crypto trades, crypto trade tracking, trade journal methods, image upload trading"
        article={true}
        publishedTime="2025-11-02"
      />
      <SchemaMarkup type="article" data={articleSchema} />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm font-semibold text-primary mb-4">
                TUTORIAL
              </span>
              <h1 className="text-5xl font-bold mb-6">
                How to Track Crypto Trades in 2025:<br />The Complete Guide
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                Last Updated: November 2, 2025 • Reading Time: 10 minutes
              </p>
            </div>

            <Card className="p-8 bg-muted/30">
              <h2 className="text-2xl font-bold mb-4">Why 90% of Traders Fail (And How to Join the Winning 10%)</h2>
              <p className="text-lg mb-4">
                <strong>Harsh reality:</strong> 90% of crypto traders lose money within their first year.
              </p>
              <p className="text-muted-foreground">
                But the winning 10%? They have ONE thing in common: <strong>they track every single trade meticulously.</strong>
              </p>
            </Card>

            <div className="mt-8 text-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 py-6">
                  Track Your Trades in 15 Seconds →
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Method 1: Manual */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <FileText className="h-8 w-8 text-orange-500" />
              Method 1: Manual Tracking (Spreadsheets)
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card className="p-4">
                <p><strong>Difficulty:</strong> Hard</p>
                <p><strong>Time:</strong> 5-10 minutes per trade</p>
                <p><strong>Cost:</strong> Free</p>
                <p><strong>Best For:</strong> Beginners with &lt;10 trades/week</p>
              </Card>
              <Card className="p-4 bg-muted">
                <p><strong>Realistic Time Investment:</strong></p>
                <p className="text-2xl font-bold text-destructive">250 min/week</p>
                <p className="text-sm text-muted-foreground">For 50 trades = 4.2 hours wasted</p>
              </Card>
            </div>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">How It Works</h3>
              <p className="mb-4">Create a spreadsheet with these columns:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Date & Time</li>
                <li>Exchange</li>
                <li>Pair (BTC/USDT)</li>
                <li>Side (Long/Short)</li>
                <li>Entry Price</li>
                <li>Exit Price</li>
                <li>Position Size</li>
                <li>Leverage (if any)</li>
                <li>Fees</li>
                <li>Net P&L</li>
                <li>Strategy</li>
                <li>Notes (emotions, market conditions)</li>
              </ol>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-bold mb-3 text-green-500">Pros</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Free</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Full control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>No technical setup</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h4 className="font-bold mb-3 text-destructive">Cons</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5" />
                    <span>Time-consuming (5-10 min/trade)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5" />
                    <span>High error rate (typos, missed trades)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5" />
                    <span>No insights or analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5" />
                    <span>Painful with high volume</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="mt-6 p-6 bg-orange-500/10">
              <p><strong>Who should use this?</strong> Complete beginners learning fundamentals. Not recommended for anyone trading more than 10 times per week.</p>
            </Card>
          </div>
        </section>

        {/* Method 3: Image Upload */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Camera className="h-8 w-8 text-primary" />
              Method 3: Image Upload (The Future of Trade Tracking)
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card className="p-4 border-primary border-2">
                <p><strong>Difficulty:</strong> Easy</p>
                <p><strong>Time:</strong> 15 seconds per trade</p>
                <p><strong>Cost:</strong> Free to $30/month</p>
                <p><strong>Best For:</strong> ALL traders (any volume)</p>
              </Card>
              <Card className="p-4 bg-primary/10">
                <p><strong>Realistic Time Investment:</strong></p>
                <p className="text-2xl font-bold text-primary">12.5 min/week</p>
                <p className="text-sm text-muted-foreground">For 50 trades = 95% time savings!</p>
              </Card>
            </div>

            <Card className="p-8 mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
              <h3 className="text-2xl font-bold mb-6">How It Works</h3>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h4 className="font-bold mb-2">1. Screenshot</h4>
                  <p className="text-sm text-muted-foreground">Take a photo of your closed trade</p>
                </div>

                <div className="text-center">
                  <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold mb-2">2. Upload</h4>
                  <p className="text-sm text-muted-foreground">Upload to the app (mobile or web)</p>
                </div>

                <div className="text-center">
                  <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h4 className="font-bold mb-2">3. AI Extracts</h4>
                  <p className="text-sm text-muted-foreground">Data extracted automatically</p>
                </div>

                <div className="text-center">
                  <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold mb-2">4. Done!</h4>
                  <p className="text-sm text-muted-foreground">Review and confirm (5 sec)</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/50 dark:bg-black/20 rounded-lg text-center">
                <p className="text-lg font-bold">Total time: 15 seconds</p>
              </div>
            </Card>

            <h3 className="text-2xl font-bold mb-6">Why Image Upload is Revolutionary</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-bold mb-3 text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Universal Compatibility
                </h4>
                <p className="text-muted-foreground">
                  Works with EVERY exchange on Earth. Binance, Bybit, small regional exchanges, DeFi wallets - if you can screenshot it, we can track it.
                </p>
              </Card>

              <Card className="p-6">
                <h4 className="font-bold mb-3 text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Maximum Security
                </h4>
                <p className="text-muted-foreground">
                  Zero exchange access needed. No API keys to manage. No risk of accidental permissions. Complete data privacy.
                </p>
              </Card>

              <Card className="p-6">
                <h4 className="font-bold mb-3 text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Lightning Fast
                </h4>
                <p className="text-muted-foreground">
                  Screenshot → Upload → Done (15 seconds). Mobile-optimized. Offline support. Batch upload multiple trades at once.
                </p>
              </Card>

              <Card className="p-6">
                <h4 className="font-bold mb-3 text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  AI-Powered Accuracy
                </h4>
                <p className="text-muted-foreground">
                  95%+ accuracy rate. Extracts: pair, entry, exit, size, leverage, fees, P&L. You just review and confirm.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Step-by-Step: Your First Trade Upload
            </h2>
            
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Step 1: Close Your Trade</h3>
                <p className="text-muted-foreground">
                  You exit your BTC/USDT long position at $43,200 (entered at $42,500).
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Step 2: Screenshot the Result</h3>
                <p className="text-muted-foreground mb-3">On Binance:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Mobile:</strong> Screenshot the "Position Closed" notification</li>
                  <li><strong>Desktop:</strong> Screenshot the closed order in "Order History"</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Step 3: Upload to The Trading Diary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">On mobile:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Open The Trading Diary app</li>
                      <li>Tap the camera icon</li>
                      <li>Select your screenshot</li>
                      <li>AI processes in 2-3 seconds</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">On desktop:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to TheTradingDiary.com</li>
                      <li>Click "Upload Trade"</li>
                      <li>Drag & drop screenshot</li>
                      <li>AI extracts data</li>
                    </ol>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-primary/5">
                <h3 className="text-xl font-bold mb-3">Step 4: Review & Confirm</h3>
                <p className="mb-4">AI shows you:</p>
                <div className="bg-white dark:bg-black/20 p-4 rounded font-mono text-sm space-y-1">
                  <p>✅ Pair: BTC/USDT</p>
                  <p>✅ Entry: $42,500</p>
                  <p>✅ Exit: $43,200</p>
                  <p>✅ Size: 0.1 BTC</p>
                  <p>✅ Leverage: 5x</p>
                  <p>✅ Fees: $3.20</p>
                  <p>✅ P&L: +$347.80</p>
                </div>
                <p className="mt-4 text-muted-foreground">Click "Confirm" or edit any field. Add notes: "Breakout trade, followed plan perfectly"</p>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Card className="inline-block p-6 bg-primary/10">
                <p className="text-2xl font-bold">Total time: 15 seconds</p>
                <p className="text-muted-foreground mt-2">Trade is now logged with full data, automatically added to your dashboard and analytics.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Track Trades 20x Faster?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 10,000+ traders saving 4+ hours per week with image upload tracking.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12 py-6">
                Start Free - 20 Uploads/Month
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required. Works with ALL exchanges.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
