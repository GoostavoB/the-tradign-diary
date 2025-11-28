import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { GlassCard } from "@/components/GlassCard";

export const PricingPrivacy = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-6" aria-labelledby="privacy-heading">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <GlassCard className="p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-primary/10">
                <Shield className="w-10 h-10 text-primary" />
              </div>
            </div>

            <h2 id="privacy-heading" className="text-2xl md:text-3xl font-bold mb-6">
              {t('pricing.privacy.title', 'Full Privacy')}
            </h2>

            <div className="space-y-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              <p>{t('pricing.privacy.line1', 'We do not use APIs.')}</p>
              <p>{t('pricing.privacy.line2', 'We do not connect to exchanges.')}</p>
              <p className="font-semibold text-foreground">
                {t('pricing.privacy.line3', 'Your data stays in your control.')}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingPrivacy;
