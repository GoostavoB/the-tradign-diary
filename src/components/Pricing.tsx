import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for beginners getting started",
    features: [
      "Up to 50 trades per month",
      "Basic analytics & charts",
      "Manual trade entry",
      "7-day data retention",
      "Email support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For serious traders who need more",
    features: [
      "Unlimited trades",
      "Advanced analytics & forecasting",
      "AI-powered trade extraction",
      "Unlimited data retention",
      "Priority support",
      "Custom setups & tags",
      "Export reports",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Elite",
    price: "$49",
    period: "per month",
    description: "For professional traders & teams",
    features: [
      "Everything in Pro",
      "Multi-account tracking",
      "API access",
      "White-label reports",
      "Dedicated account manager",
      "Early access to features",
      "Team collaboration tools",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your trading style. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <GlassCard
              key={index}
              variant={plan.popular ? "strong" : "default"}
              hover
              className={`p-8 relative ${
                plan.popular ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 gradient-primary text-background text-sm font-semibold rounded-full flex items-center gap-1">
                  <Sparkles size={14} />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gradient-primary">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/auth')}
                className={`w-full mb-6 ${
                  plan.popular
                    ? "gradient-primary text-background hover:opacity-90"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {plan.cta}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check
                      size={20}
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.popular ? "text-primary" : "text-foreground"
                      }`}
                    />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12">
          All plans include 14-day free trial • No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default Pricing;
