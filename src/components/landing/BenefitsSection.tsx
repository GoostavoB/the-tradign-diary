import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { AnimatedMetric } from "@/components/premium/AnimatedMetric";
import { useTranslation } from "@/hooks/useTranslation";

export const BenefitsSection = () => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const { t } = useTranslation();

  const stats = [
    { value: 23, suffix: "%", label: t('landing.benefits.performanceGain', '23% more performance gain') },
    { value: 18, suffix: "%", label: t('landing.benefits.drawdownReduction', '18% less drawdown'), prefix: "–" },
    { value: 10, suffix: "x", label: t('landing.benefits.fasterUploads', '10x faster uploads') },
  ];

  return (
    <section id="benefits" className="py-16 md:py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t('landing.benefits.sectionTitle', 'Built for Every Trader')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.benefits.sectionSubtitle', 'Every plan includes our core features to help you track, analyze, and improve your trading.')}
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="glass-card p-8 text-center"
            >
              <div className="mb-3">
                <AnimatedMetric
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimals={0}
                  inView={inView}
                />
              </div>
              <p className="text-base text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground text-sm mt-8"
        >
          {t('landing.benefits.caption', 'Every plan includes our core features to help you track, analyze, and improve your trading.')}
        </motion.p>
      </div>
    </section>
  );
};
