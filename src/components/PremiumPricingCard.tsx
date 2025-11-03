import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MagneticButton } from './MagneticButton';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptionProduct } from '@/config/stripe-products';
import { initiateStripeCheckout } from '@/utils/stripeCheckout';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trackCheckoutFunnel } from '@/utils/checkoutAnalytics';
import { AnnualUpgradeUpsell } from '@/components/checkout/AnnualUpgradeUpsell';

interface PricingPlan {
  id: string;
  nameKey: string;
  descriptionKey: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  annualTotal: number | null;
  featuresKeys: string[];
  ctaKey: string;
  popular: boolean;
  comingSoon?: boolean;
}

interface PremiumPricingCardProps {
  plan: PricingPlan;
  billingCycle: 'monthly' | 'annual';
  index: number;
  t: (key: string, params?: any) => string;
}

export const PremiumPricingCard = ({ plan, billingCycle, index, t }: PremiumPricingCardProps) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const currentLang = i18n.language;
  const [loading, setLoading] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<{
    tier: 'pro' | 'elite';
    stripeProduct: any;
    price: number;
  } | null>(null);
  
  const handleCTA = async () => {
    if (plan.comingSoon) return;
    
    // If not logged in, redirect to signup
    if (!user) {
      const authPath = currentLang === 'en' ? '/auth?mode=signup' : `/${currentLang}/auth?mode=signup`;
      navigate(authPath);
      return;
    }

    // User is logged in, initiate Stripe checkout
    setLoading(true);
    
    try {
      // Determine tier and get the correct product
      const tier = plan.id.toLowerCase() as 'pro' | 'elite';
      const stripeProduct = getSubscriptionProduct(tier, billingCycle);
      
      // Track plan selection
      const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
      trackCheckoutFunnel.selectPlan(plan.nameKey, billingCycle, price || 0);
      
      // If annual plan and not free, show upsell modal
      if (billingCycle === 'annual' && plan.id !== 'free') {
        setPendingCheckout({ tier, stripeProduct, price: price || 0 });
        setShowUpsell(true);
        trackCheckoutFunnel.annualUpsellShown(plan.nameKey);
        setLoading(false);
        return;
      }
      
      // Pre-open a new tab for smooth editor experience
      const checkoutWindow = window.open('about:blank', '_blank');
      
      // Navigate to checkout interstitial which will handle the redirect
      const checkoutUrl = `/checkout?priceId=${stripeProduct.priceId}&productType=${stripeProduct.productType}`;
      
      // If we successfully opened a window, navigate it; otherwise use standard navigation
      if (checkoutWindow) {
        checkoutWindow.location.href = window.location.origin + checkoutUrl;
      } else {
        navigate(checkoutUrl);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error instanceof Error ? error.message : 'Failed to start checkout',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleUpsellAccept = (quantity: number) => {
    if (!pendingCheckout) return;
    
    const totalSavings = quantity * 1.00; // $1 saved per pack
    trackCheckoutFunnel.annualUpsellAccepted(quantity, quantity * 1.00, totalSavings);
    
    // Navigate with upsell credits parameter
    navigate(
      `/checkout?priceId=${pendingCheckout.stripeProduct.priceId}&productType=${pendingCheckout.stripeProduct.productType}&upsellCredits=${quantity * 10}`
    );
    setShowUpsell(false);
  };

  const handleUpsellDecline = () => {
    if (!pendingCheckout) return;
    
    trackCheckoutFunnel.annualUpsellDeclined(plan.nameKey);
    
    // Navigate without upsell
    navigate(
      `/checkout?priceId=${pendingCheckout.stripeProduct.priceId}&productType=${pendingCheckout.stripeProduct.productType}`
    );
    setShowUpsell(false);
  };
  
  const getDisplayPrice = () => {
    if (plan.monthlyPrice === null || plan.annualPrice === null) return null;
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavings = () => {
    if (plan.monthlyPrice === null || plan.annualTotal === null) return 0;
    return (plan.monthlyPrice * 12) - plan.annualTotal;
  };

  return (
    <>
      <AnnualUpgradeUpsell
        open={showUpsell}
        onAccept={handleUpsellAccept}
        onDecline={handleUpsellDecline}
        planName={t(plan.nameKey)}
        annualPrice={pendingCheckout?.price || 0}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.45,
          delay: index * 0.09,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="h-full"
      >
        <GlassCard
        elevated={plan.popular}
        className={`group p-8 h-full flex flex-col relative ${plan.popular ? 'scale-105' : ''}`}
        style={plan.popular ? {
          boxShadow: 'inset 0 -2px 0 0 rgba(255,255,255,0.15), 0 0 60px rgba(200, 220, 240, 0.08), 0 24px 70px -15px rgba(0, 0, 0, 0.5)'
        } : undefined}
      >
        {plan.popular && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute -top-3 right-6 px-6 py-2 bg-gradient-to-r from-primary via-accent to-primary bg-size-200 animate-gradient rounded-full text-xs font-bold tracking-wider text-primary-foreground shadow-lg shadow-primary/25"
          >
            {t('pricing.mostPopular')}
          </motion.div>
        )}

        {plan.comingSoon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute -top-3 right-6 px-6 py-2 bg-gradient-to-r from-accent via-primary to-accent bg-size-200 animate-gradient rounded-full text-xs font-bold tracking-wider text-primary-foreground shadow-lg shadow-accent/25"
          >
            Coming Soon
          </motion.div>
        )}

        <div className="mb-6">
          <h3 className="text-[22px] font-bold mb-2 tracking-tight" style={{ letterSpacing: '-0.01em' }}>
            {plan.comingSoon ? plan.nameKey : t(plan.nameKey)}
          </h3>
          <p className="text-[14px] text-muted-foreground dark:text-muted-foreground/70 leading-relaxed">
            {plan.comingSoon ? plan.descriptionKey : t(plan.descriptionKey)}
          </p>
        </div>

        {/* Annual Upgrade Promotion for Monthly Plans */}
        {billingCycle === 'monthly' && !plan.comingSoon && plan.id !== 'free' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-6"
          >
            <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Upgrade to Annual:</strong> Get 50% off all credit purchases - exclusive one-time offer!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="mb-8">
          {getDisplayPrice() !== null ? (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <motion.span 
                  key={`${billingCycle}-${getDisplayPrice()}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[38px] font-bold tracking-tight tabular-nums"
                  style={{ 
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em'
                  }}
                >
                  ${getDisplayPrice()}
                </motion.span>
                <span className="text-[14px] text-muted-foreground dark:text-muted-foreground/70">
                  /{billingCycle === 'monthly' ? t('pricing.perMonth') : t('pricing.perMonthBilledAnnually')}
                </span>
              </div>
              {billingCycle === 'annual' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.28 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                >
                  <span className="text-sm font-bold text-primary">
                    {t('pricing.savingsAmount', { amount: getSavings() })}
                  </span>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-[32px] font-bold tracking-tight mb-2">
              Custom Pricing
            </div>
          )}
        </div>

        <MagneticButton
          onClick={handleCTA}
          variant={plan.popular ? 'default' : 'outline'}
          className={`w-full mb-8 py-6 text-[15px] font-semibold ${plan.comingSoon || loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            plan.comingSoon ? plan.ctaKey : t(plan.ctaKey)
          )}
        </MagneticButton>

        <ul className="space-y-4 flex-1">
          {plan.featuresKeys.map((featureKey, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.28,
                delay: index * 0.09 + i * 0.05,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-all duration-280 ease-premium">
                <Check size={14} className="text-accent" />
              </div>
              <span className="text-[14px] text-muted-foreground dark:text-muted-foreground/70 leading-relaxed group-hover:text-foreground transition-colors duration-280 ease-premium">
                {plan.comingSoon ? featureKey : t(featureKey)}
              </span>
            </motion.li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
    </>
  );
};
