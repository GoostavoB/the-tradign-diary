import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, X, Clock, TrendingUp } from "lucide-react";
import MetaTags from "@/components/SEO/MetaTags";
import SchemaMarkup from "@/components/SEO/SchemaMarkup";

export default function TradingJournalVsSpreadsheet() {
  return (
    <>
      <MetaTags
        title="Trading Journal vs Spreadsheet: Complete Comparison 2025"
        description="Manual spreadsheet vs CSV import vs image upload trading journal. Time savings comparison, error rates, and feature analysis."
        keywords="trading journal vs spreadsheet, manual trade tracking, CSV import, image upload journal"
      />
      <SchemaMarkup />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Trading Journal vs Spreadsheet:<br />Complete Comparison
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Still using Excel to track trades? You're wasting 4+ hours every week and making costly mistakes. Here's the data.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                Try Image Upload Method Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Time Comparison */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Time Comparison: 50 Trades Per Week
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 border-destructive border-2">
                <h3 className="text-2xl font-bold mb-4 text-destructive flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  Manual Spreadsheet
                </h3>
                <div className="space-y-3 mb-6">
                  <p className="text-4xl font-bold">250 min/week</p>
                  <p className="text-muted-foreground">= 4.2 hours wasted</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    5 minutes per trade
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    High error rate (~15%)
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    Forget trades often
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    No analytics
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-orange-500 border-2">
                <h3 className="text-2xl font-bold mb-4 text-orange-500 flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  CSV Import Weekly
                </h3>
                <div className="space-y-3 mb-6">
                  <p className="text-4xl font-bold">55 min/week</p>
                  <p className="text-muted-foreground">Better but not great</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Automated calculations
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    Weekly maintenance
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    Not real-time
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    Different formats per exchange
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-primary border-2">
                <h3 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  Image Upload
                </h3>
                <div className="space-y-3 mb-6">
                  <p className="text-4xl font-bold">12.5 min/week</p>
                  <p className="text-muted-foreground">⚡ 95% time savings!</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    15 seconds per trade
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Zero errors (AI + review)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Real-time tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Instant analytics
                  </li>
                </ul>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Card className="inline-block p-6 bg-primary/10">
                <p className="text-2xl font-bold">
                  Save 237.5 minutes per week = <span className="text-primary">4 hours saved!</span>
                </p>
                <p className="text-muted-foreground mt-2">
                  At $50/hour value, that's $200/week = $800/month in saved time
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Complete Feature Comparison
            </h2>
            
            <Card className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left">Feature</th>
                    <th className="p-4 text-center">Manual<br/>Spreadsheet</th>
                    <th className="p-4 text-center">CSV<br/>Import</th>
                    <th className="p-4 text-center bg-primary/10">Image<br/>Upload</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Time per trade</td>
                    <td className="p-4 text-center">5-10 min</td>
                    <td className="p-4 text-center">1-2 min</td>
                    <td className="p-4 text-center bg-primary/5 font-bold">15 sec</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Error rate</td>
                    <td className="p-4 text-center text-destructive">15-20%</td>
                    <td className="p-4 text-center text-orange-500">5-10%</td>
                    <td className="p-4 text-center bg-primary/5 text-green-500 font-bold">&lt;1%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Works with all exchanges</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">⚠️ Format varies</td>
                    <td className="p-4 text-center bg-primary/5 font-bold">✅ Perfect</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Real-time updates</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">❌ Weekly</td>
                    <td className="p-4 text-center bg-primary/5 font-bold">✅ Instant</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Automated analytics</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center bg-primary/5 font-bold">✅ Advanced</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Mobile friendly</td>
                    <td className="p-4 text-center">❌ Terrible</td>
                    <td className="p-4 text-center">⚠️ Web only</td>
                    <td className="p-4 text-center bg-primary/5 font-bold">✅ Perfect</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Setup complexity</td>
                    <td className="p-4 text-center">Medium</td>
                    <td className="p-4 text-center">Hard</td>
                    <td className="p-4 text-center bg-primary/5 font-bold">Zero</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Cost</td>
                    <td className="p-4 text-center">Free</td>
                    <td className="p-4 text-center">$10-20/mo</td>
                    <td className="p-4 text-center bg-primary/5 font-bold">Free - $30/mo</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
        </section>

        {/* Real User Example */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Real Trader Comparison
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                    <span className="text-2xl">😰</span>
                  </div>
                  <div>
                    <h3 className="font-bold">Sarah - Before</h3>
                    <p className="text-sm text-muted-foreground">Using Excel spreadsheet</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• 3 exchanges: Binance, Bybit, KuCoin</li>
                  <li>• Manually entered all trades</li>
                  <li>• 4.5 hours per week on data entry</li>
                  <li>• Forgot 30-40% of trades</li>
                  <li>• No unified performance view</li>
                  <li>• Couldn't identify patterns</li>
                </ul>
              </Card>

              <Card className="p-6 border-primary border-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="font-bold">Sarah - After</h3>
                    <p className="text-sm text-muted-foreground">Using image upload</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Screenshots all 3 exchanges (10 sec each)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Only 15 minutes per week total
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    100% of trades tracked
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Unified dashboard across all exchanges
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Win rate improved from 48% to 61%
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Spreadsheets Fail */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              5 Reasons Spreadsheets Fail Traders
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="text-destructive">1.</span> Time Sink
                </h3>
                <p className="text-muted-foreground">
                  5 minutes per trade = 4+ hours per week. That's time you could spend analyzing markets or improving strategy.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="text-destructive">2.</span> High Error Rate
                </h3>
                <p className="text-muted-foreground">
                  Typos, missed decimal points, forgotten fees. 15-20% of manually entered trades have errors that skew your analysis.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="text-destructive">3.</span> Forgotten Trades
                </h3>
                <p className="text-muted-foreground">
                  "I'll log it later" = never logs it. 30-40% of trades never make it into the spreadsheet.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="text-destructive">4.</span> No Insights
                </h3>
                <p className="text-muted-foreground">
                  Raw data is useless without analysis. Spreadsheets don't tell you WHAT to change or WHY you're losing.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="text-destructive">5.</span> Boring AF
                </h3>
                <p className="text-muted-foreground">
                  Manual data entry is soul-crushing. You'll stop doing it within weeks. Consistency is impossible.
                </p>
              </Card>

              <Card className="p-6 border-primary border-2">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="text-primary" />
                  The Solution
                </h3>
                <p className="text-muted-foreground">
                  Image upload makes trade logging take 15 seconds. Fast enough to actually do it. Accurate enough to trust the data.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-20 bg-muted/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Stop Wasting 4 Hours Per Week
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Screenshot. Upload. Done. Track trades in 15 seconds instead of 5 minutes. Try it free.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12 py-6">
                Try Image Upload Method Free
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              5 free uploads to start. Add more for $5 per 10 uploads. No credit card required.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
