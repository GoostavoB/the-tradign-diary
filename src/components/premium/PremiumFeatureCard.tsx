import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { PremiumFeature } from '@/hooks/usePremiumShowcase';
import { fadeInUp, cardHover } from '@/utils/animations';
import { memo } from 'react';

interface PremiumFeatureCardProps {
  feature: PremiumFeature;
  isUnlocked: boolean;
  index: number;
}

const PremiumFeatureCardComponent = ({ feature, isUnlocked, index }: PremiumFeatureCardProps) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleUpgrade = () => {
    const pricingPath = currentLang === 'en' ? '/pricing' : `/${currentLang}/pricing`;
    navigate(pricingPath);
  };

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <Card className={`h-full transition-all duration-300 ${
        isUnlocked 
          ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-transparent glass-card' 
          : 'border-muted hover:border-primary/30 glass-subtle hover:glass-strong'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">{feature.icon}</div>
            <Badge 
              variant={isUnlocked ? "default" : "secondary"}
              className="gap-1"
            >
              {isUnlocked ? (
                <>
                  <Check className="h-3 w-3" />
                  <span className="hidden sm:inline">Unlocked</span>
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  <span>{feature.requiredPlan === 'elite' ? 'Elite' : 'Pro'}</span>
                </>
              )}
            </Badge>
          </div>
          <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
          <CardDescription className="text-sm">{feature.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {feature.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className={isUnlocked ? 'text-foreground' : 'text-muted-foreground'}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>
          
          {!isUnlocked && (
            <Button 
              onClick={handleUpgrade}
              variant="outline"
              size="sm"
              className="w-full gap-2 mt-4 min-h-[44px]"
              aria-label={`Upgrade to ${feature.requiredPlan} plan to unlock ${feature.title}`}
            >
              <Lock className="h-4 w-4" />
              Upgrade to {feature.requiredPlan === 'elite' ? 'Elite' : 'Pro'}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const PremiumFeatureCard = memo(PremiumFeatureCardComponent);
