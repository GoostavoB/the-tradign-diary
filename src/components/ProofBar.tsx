import { Zap, Clock, Shield, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

export const ProofBar = () => {
  const { t } = useTranslation();

  const metrics = [
    {
      icon: Zap,
      value: t('landing.performanceMetrics.metric1.value', '40x'),
      label: t('landing.performanceMetrics.metric1.title', 'Upload Trades 40 Times Faster'),
      description: t('landing.performanceMetrics.metric1.description', 'Batch upload screenshots and process trades in seconds.'),
    },
    {
      icon: Clock,
      value: t('landing.performanceMetrics.metric2.value', '97%'),
      label: t('landing.performanceMetrics.metric2.title', 'Save Up to 97 Percent of Your Time'),
      description: t('landing.performanceMetrics.metric2.description', 'Focus on analysis instead of manual work.'),
    },
    {
      icon: Shield,
      value: t('landing.performanceMetrics.metric3.value', 'More Errors Caught'),
      label: t('landing.performanceMetrics.metric3.title', 'Catch More Errors'),
      description: t('landing.performanceMetrics.metric3.description', 'Daily review helps you detect mistakes early.'),
    },
    {
      icon: Target,
      value: t('landing.performanceMetrics.metric4.value', 'Improved Accuracy'),
      label: t('landing.performanceMetrics.metric4.title', 'Improve Decision Accuracy'),
      description: t('landing.performanceMetrics.metric4.description', 'Structured logs and clear analytics support better choices.'),
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      viewport={{ once: true }}
      className="relative -mt-24 z-20 px-6"
      aria-label="Performance metrics"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold">
            {t('landing.performanceMetrics.sectionTitle', 'Your Real Performance Insights')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Card with glass effect and better shadows */}
                <div className="relative bg-black/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 flex flex-col text-center gap-4 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden h-full">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center gap-4 flex-1">
                    {/* Icon with glow effect */}
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>

                    {/* Value */}
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
                      {metric.value}
                    </div>

                    {/* Label */}
                    <div className="text-base font-semibold text-foreground">
                      {metric.label}
                    </div>

                    {/* Description */}
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {metric.description}
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Glow effect behind card */}
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};
