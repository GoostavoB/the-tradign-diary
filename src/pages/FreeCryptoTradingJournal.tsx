import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Camera, Zap, TrendingUp } from "lucide-react";
import MetaTags from "@/components/SEO/MetaTags";
import SchemaMarkup from "@/components/SEO/SchemaMarkup";

export default function FreeCryptoTradingJournal() {
  return (
    <>
      <MetaTags
        title="Free Crypto Trading Journal | 20 Uploads/Month Forever"
        description="Start tracking crypto trades for free. 20 image uploads per month, AI data extraction, performance analytics. No credit card required. Works with ALL exchanges."
        keywords="free trading journal, free crypto journal app, free trade tracker, screenshot trade journal"
      />
      <SchemaMarkup />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
              <span className="text-primary font-semibold">100% FREE FOREVER</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Free Crypto Trading Journal<br />5 Free Uploads to Get Started
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Screenshot your trades, upload, and let AI track everything. No credit card required. Add more uploads for just $5 per 10 trades.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free - No Credit Card Required
              </Button>
            </Link>
          </div>
        </section>

        {/* What's Included Free */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Everything Included in Free Plan
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">5 Free Uploads</h3>
                </div>
                <p className="text-muted-foreground">
                  Get started with 5 free uploads. Perfect to test the system. Add more anytime for $5 per 10 uploads (~100 trades).
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">AI Data Extraction</h3>
                </div>
                <p className="text-muted-foreground">
                  Full AI-powered data extraction from screenshots. Same technology as paid plans. 95%+ accuracy.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Basic Analytics</h3>
                </div>
                <p className="text-muted-foreground">
                  Win rate, P&L tracking, performance charts. All essential metrics included for free.
                </p>
              </Card>
            </div>

            <Card className="p-8 bg-primary/5">
              <h3 className="text-2xl font-bold mb-6">Free Plan Features:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">5 Free Uploads</p>
                    <p className="text-sm text-muted-foreground">Get started for free, add more for $5/10 uploads</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">AI Data Extraction</p>
                    <p className="text-sm text-muted-foreground">Full AI capabilities included</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Works with ALL Exchanges</p>
                    <p className="text-sm text-muted-foreground">Binance, Bybit, ANY exchange</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Basic Performance Analytics</p>
                    <p className="text-sm text-muted-foreground">Win rate, P&L, charts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">30-Day History</p>
                    <p className="text-sm text-muted-foreground">Access last month of trades</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Mobile & Web Access</p>
                    <p className="text-sm text-muted-foreground">Full cross-platform support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">XP & Gamification</p>
                    <p className="text-sm text-muted-foreground">Make logging trades fun</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">No Credit Card Required</p>
                    <p className="text-sm text-muted-foreground">Sign up in 30 seconds</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Comparison: Free vs Paid */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Free vs Pro vs Elite
            </h2>
            
            <Card className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left">Feature</th>
                    <th className="p-4 text-center">Free</th>
                    <th className="p-4 text-center bg-primary/10">Pro<br/>$9.99/mo</th>
                    <th className="p-4 text-center">Elite<br/>$29.99/mo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Trade Uploads</td>
                    <td className="p-4 text-center">5 total</td>
                    <td className="p-4 text-center bg-primary/5">30/month</td>
                    <td className="p-4 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">AI Extraction</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center bg-primary/5">✅</td>
                    <td className="p-4 text-center">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Extra Uploads</td>
                    <td className="p-4 text-center">$5/10 uploads</td>
                    <td className="p-4 text-center bg-primary/5">$2/10 uploads</td>
                    <td className="p-4 text-center">Included</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Advanced Analytics</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center bg-primary/5">✅</td>
                    <td className="p-4 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">AI Insights</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center bg-primary/5">-</td>
                    <td className="p-4 text-center">✅</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
        </section>

        {/* Why Start Free */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Why Start With Free?
            </h2>
            
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Test the Image Upload Method</h3>
                <p className="text-muted-foreground">
                  See for yourself how much faster image upload is compared to manual entry or CSV imports. Upload your first trade in 15 seconds.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Verify It Works With Your Exchange</h3>
                <p className="text-muted-foreground">
                  Screenshot a trade from your exchange and upload it. Our AI will extract the data. Works with 100% of exchanges we've tested.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Build the Habit Risk-Free</h3>
                <p className="text-muted-foreground">
                  5 free uploads let you test the system completely free. Build the consistency habit, then add more uploads for just $5 per 10 trades when you need them.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-20 bg-muted/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Start Free Today
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              No credit card. No hidden fees. No commitment. Just sign up and start tracking trades in 30 seconds.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12 py-6">
                Create Free Account Now
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Upgrade anytime if you need unlimited uploads. Cancel anytime.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
