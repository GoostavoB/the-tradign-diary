import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { TrendingUp, Target, Shield, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const metrics = [
  { icon: TrendingUp, key: "winRate" },
  { icon: Target, key: "expectancy" },
  { icon: Shield, key: "profitFactor" },
  { icon: Zap, key: "drawdown" },
];

export const ExpectedResults = () => {
  const { t } = useTranslation();
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            {t("pricing.expectedResults.title")}
          </h2>
          <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
            {t("pricing.expectedResults.subtitle")}
          </p>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="outcome-card-refined p-6 rounded-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t(`pricing.expectedResults.metrics.${metric.key}.label`)}
                    </h3>
                    <p className="text-2xl font-bold text-primary mb-1">
                      {t(`pricing.expectedResults.metrics.${metric.key}.value`)}
                    </p>
                    <p className="text-sm text-foreground/60">
                      {t(`pricing.expectedResults.metrics.${metric.key}.description`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Before/After Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="outcome-card-refined p-8 md:p-10 rounded-2xl max-w-4xl mx-auto"
        >
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8">
            {t("pricing.expectedResults.example.title")}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="space-y-3">
              <div className="inline-block px-4 py-1 rounded-full bg-destructive/10 text-destructive font-semibold text-sm mb-3">
                {t("pricing.expectedResults.example.before")}
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-foreground/70">{t("pricing.expectedResults.example.winRate")}</span>
                  <span className="font-semibold">45%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-foreground/70">{t("pricing.expectedResults.example.avgWin")}</span>
                  <span className="font-semibold">1.7 R</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-foreground/70">{t("pricing.expectedResults.example.avgLoss")}</span>
                  <span className="font-semibold">1.0 R</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-foreground/70">{t("pricing.expectedResults.example.profitFactor")}</span>
                  <span className="font-semibold">1.38</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-foreground/70">{t("pricing.expectedResults.example.expectancy")}</span>
                  <span className="font-semibold">0.205 R</span>
                </p>
              </div>
            </div>

            {/* After */}
            <div className="space-y-3">
              <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-3">
                {t("pricing.expectedResults.example.after")}
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-foreground/70">{t("pricing.expectedResults.example.winRate")}</span>
                  <span className="font-bold text-primary">51% ↑</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-foreground/70">{t("pricing.expectedResults.example.avgWin")}</span>
                  <span className="font-bold text-primary">1.8 R ↑</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-foreground/70">{t("pricing.expectedResults.example.avgLoss")}</span>
                  <span className="font-bold text-primary">0.9 R ↓</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-foreground/70">{t("pricing.expectedResults.example.profitFactor")}</span>
                  <span className="font-bold text-primary">1.80 ↑</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-foreground/70">{t("pricing.expectedResults.example.expectancy")}</span>
                  <span className="font-bold text-primary">0.459 R ↑</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
        >
          {[
            "avgLoss",
            "avgWin",
            "planAdherence",
            "ruleBreaks",
            "returnVolatility",
            "overtrading",
          ].map((key, index) => (
            <div
              key={key}
              className="p-4 rounded-lg bg-accent/30 border border-border/50"
            >
              <p className="text-sm text-foreground/70 mb-1">
                {t(`pricing.expectedResults.additional.${key}.label`)}
              </p>
              <p className="text-lg font-bold text-primary">
                {t(`pricing.expectedResults.additional.${key}.value`)}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
