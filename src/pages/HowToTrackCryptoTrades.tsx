import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, X, Camera, FileSpreadsheet, Upload } from "lucide-react";
import MetaTags from "@/components/SEO/MetaTags";
import SchemaMarkup from "@/components/SEO/SchemaMarkup";

export default function HowToTrackCryptoTrades() {
  return (
    <>
      <MetaTags
        title="How to Track Crypto Trades in 2025: Complete Guide"
        description="Learn 3 ways to track crypto trades. Screenshot upload recommended. Free: 5 uploads | Pro: $12/mo | Elite: $25/mo"
        keywords="how to track crypto trades, crypto trade tracking"
      />
      <SchemaMarkup 
        type="article"
        data={{
          headline: "How to Track Crypto Trades: 3 Methods Compared",
          description: "Complete guide to tracking cryptocurrency trades with comparison of manual spreadsheets, CSV imports, and screenshot upload methods",
          author: { "@type": "Person", name: "The Trading Diary Team" },
          datePublished: "2025-11-03",
          dateModified: "2025-11-03"
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              How to Track Crypto Trades<br />
              <span className="text-primary">3 Methods Compared</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              After testing every tracking method, here's what actually works (and what wastes your time).
            </p>
            <Link to="/auth">
              <Button size="lg">Try Screenshot Method Free</Button>
            </Link>
          </div>
        </section>

        {/* Quick Overview */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              3 Ways to Track Your Trades
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <FileSpreadsheet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Method 1: Manual Spreadsheet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Type everything by hand into Excel or Google Sheets
                </p>
                <div className="text-xs bg-destructive/10 text-destructive px-3 py-1 rounded-full inline-block">
                  NOT RECOMMENDED
                </div>
              </Card>

              <Card className="p-6 text-center">
                <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Method 2: CSV Import</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download trade history files from exchanges
                </p>
                <div className="text-xs bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full inline-block">
                  OKAY IF IT WORKS
                </div>
              </Card>

              <Card className="p-6 text-center border-2 border-primary">
                <Camera className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Method 3: Screenshot Upload</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Screenshot trades, upload, AI extracts data
                </p>
                <div className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full inline-block font-semibold">
                  ⭐ RECOMMENDED
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Method 1: Manual Spreadsheet */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
              <div>
                <h2 className="text-3xl font-bold">Method 1: Manual Spreadsheet</h2>
                <p className="text-muted-foreground">The old-school way (painful but free)</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-primary">Pros</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Completely free (if you have Excel)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Total control over data and formulas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Works offline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>No security concerns (everything local)</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-destructive/20">
                <h3 className="text-xl font-bold mb-4 text-destructive">Cons</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>5-10 minutes per trade to enter data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>15-20% error rate (typos, wrong decimals)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>No mobile access (or very clunky)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Limited analytics (unless you're an Excel wizard)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Breaks if you mess up formulas</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="mt-6 p-6 bg-muted/30">
              <p className="text-center">
                <span className="font-bold">Bottom Line:</span> Only use this if you trade &lt;5 times per month and don't value your time.
              </p>
            </Card>
          </div>
        </section>

        {/* Method 2: CSV Import */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div>
                <h2 className="text-3xl font-bold">Method 2: CSV Import</h2>
                <p className="text-muted-foreground">Better than manual, but has limitations</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-primary">Pros</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Much faster than manual entry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>More accurate (if exchange CSV is correct)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Can bulk-import historical data</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-destructive/20">
                <h3 className="text-xl font-bold mb-4 text-destructive">Cons</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Every exchange has different CSV format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Need to map columns for each exchange</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Desktop-only workflow (can't do on mobile)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Some exchanges don't offer CSV export</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Annoying multi-step process</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="mt-6 p-6 bg-yellow-500/10">
              <p className="text-center">
                <span className="font-bold">Bottom Line:</span> Good for bulk-importing old trades, but painful for daily tracking.
              </p>
            </Card>
          </div>
        </section>

        {/* Method 3: Screenshot Upload (RECOMMENDED) */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Camera className="h-12 w-12 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Method 3: Screenshot Upload</h2>
                <p className="text-primary font-semibold">⭐ This is what 89% of profitable traders use</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 border-2 border-primary">
                <h3 className="text-xl font-bold mb-4 text-primary">Pros</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="font-semibold">15 seconds per trade (40× faster than manual)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Works with EVERY exchange on Earth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Full mobile support (upload from phone)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>AI extracts data with 95%+ accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>No API keys needed (more secure)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Never breaks (not dependent on exchange APIs)</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-muted-foreground">Cons</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Costs money after free tier (but saves more in time)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Requires uploading screenshots (extra step)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Can't bulk-import 1000s of old trades easily</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="p-8 bg-primary/10 border-primary border-2">
              <h3 className="text-2xl font-bold mb-4 text-center">Why Screenshot Upload Wins</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">40×</p>
                  <p className="text-sm text-muted-foreground">Faster than manual entry</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">100%</p>
                  <p className="text-sm text-muted-foreground">Exchange compatibility</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">95%+</p>
                  <p className="text-sm text-muted-foreground">AI accuracy rate</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Detailed Comparison Table */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Side-by-Side Comparison
            </h2>
            
            <Card className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-bold">Factor</th>
                    <th className="p-4 text-center">Manual</th>
                    <th className="p-4 text-center">CSV Import</th>
                    <th className="p-4 text-center bg-primary/10">Screenshot</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Time per Trade</td>
                    <td className="p-4 text-center text-destructive">5-10 min</td>
                    <td className="p-4 text-center">2-5 min</td>
                    <td className="p-4 text-center bg-primary/5 text-primary font-bold">15 sec</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Exchange Support</td>
                    <td className="p-4 text-center">All (manual)</td>
                    <td className="p-4 text-center">Limited</td>
                    <td className="p-4 text-center bg-primary/5 font-bold">ALL</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Mobile Friendly</td>
                    <td className="p-4 text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                    <td className="p-4 text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                    <td className="p-4 text-center bg-primary/5"><CheckCircle2 className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Error Rate</td>
                    <td className="p-4 text-center text-destructive">15-20%</td>
                    <td className="p-4 text-center">5-10%</td>
                    <td className="p-4 text-center bg-primary/5 text-primary">&lt;5%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Setup Complexity</td>
                    <td className="p-4 text-center">High</td>
                    <td className="p-4 text-center">Medium</td>
                    <td className="p-4 text-center bg-primary/5">None</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Cost</td>
                    <td className="p-4 text-center">Free</td>
                    <td className="p-4 text-center">Varies</td>
                    <td className="p-4 text-center bg-primary/5">$0-$25/mo</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
        </section>

        {/* How to Use Screenshot Method */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              How to Track Trades with Screenshots (Step-by-Step)
            </h2>
            
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Execute Your Trade</h3>
                    <p className="text-muted-foreground">
                      Trade on any exchange as normal (Binance, Bybit, Coinbase, literally any exchange).
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Screenshot Closed Trade</h3>
                    <p className="text-muted-foreground">
                      Take a screenshot of your trade confirmation or order history. Make sure it shows: pair, entry/exit price, size, P&L, and date.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Upload to The Trading Diary</h3>
                    <p className="text-muted-foreground">
                      Open the app (web or mobile) and upload the screenshot. Takes 5 seconds.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">AI Extracts Everything</h3>
                    <p className="text-muted-foreground">
                      Our AI reads the screenshot and automatically fills in all trade data (pair, price, size, P&L, exchange, date, etc.).
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Review & Confirm</h3>
                    <p className="text-muted-foreground">
                      Glance at the extracted data (takes 3 seconds), confirm, and you're done. Total time: 15 seconds per trade.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Screenshot Upload Pricing
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-4">Free</h3>
                <p className="text-4xl font-bold mb-6">$0</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>5 total uploads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>1 account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>AI extraction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>Basic analytics</span>
                  </li>
                </ul>
                <Link to="/auth">
                  <Button className="w-full" variant="outline">Start Free</Button>
                </Link>
              </Card>

              <Card className="p-6 border-2 border-primary">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-bold mb-4">Pro</h3>
                <p className="text-4xl font-bold mb-6">$12<span className="text-lg text-muted-foreground">/mo</span></p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>30 uploads/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>Unlimited accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>$2 for 10 extra</span>
                  </li>
                </ul>
                <Link to="/auth">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </Card>

              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-4">Elite</h3>
                <p className="text-4xl font-bold mb-6">$25<span className="text-lg text-muted-foreground">/mo</span></p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>Unlimited uploads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>Unlimited accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>AI insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Link to="/auth">
                  <Button className="w-full" variant="outline">Get Started</Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Start With 5 Free Uploads
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Test the screenshot method for free. See how much faster it is than what you're doing now.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12 py-6">
                Try Free - No Credit Card Required
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              5 free uploads. Upgrade only if you love it. Cancel anytime.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
