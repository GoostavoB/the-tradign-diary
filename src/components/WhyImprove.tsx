import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

export const WhyImprove = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      title: t('landing.whyImprove.benefit1.title', 'You reduce repeated errors'),
      description: t('landing.whyImprove.benefit1.description', 'Tag mistakes and watch them decline over time.'),
    },
    {
      title: t('landing.whyImprove.benefit2.title', 'You make calmer decisions'),
      description: t('landing.whyImprove.benefit2.description', 'Track emotional trades and improve control.'),
    },
    {
      title: t('landing.whyImprove.benefit3.title', 'You build skill through daily review'),
      description: t('landing.whyImprove.benefit3.description', 'See what works and refine your process.'),
    },
    {
      title: t('landing.whyImprove.benefit4.title', 'You find patterns faster'),
      description: t('landing.whyImprove.benefit4.description', 'Spot changes in setups, conditions, and timing.'),
    },
  ];

  return (
    <section className="py-20 md:py-28 px-6 bg-gradient-to-b from-black/0 via-primary/5 to-black/0" aria-labelledby="why-improve-heading">
      <div className="container mx-auto max-w-4xl">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 id="why-improve-heading" className="text-3xl md:text-4xl font-bold leading-tight">
            {t('landing.whyImprove.header', 'A Simple System That Improves Your Trading Decisions')}
          </h2>
        </motion.header>

        <div className="space-y-8" role="list">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              role="listitem"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex gap-4 items-start group"
            >
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyImprove;
