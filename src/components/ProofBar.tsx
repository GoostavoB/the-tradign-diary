import { Users, TrendingUp, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

export const ProofBar = () => {
  const { t } = useTranslation();

  const metrics = [
    {
      icon: Users,
      value: "10,000+",
      label: t('landing.proofBar.activeTraders', 'Active Traders'),
    },
    {
      icon: TrendingUp,
      value: "1M+",
      label: t('landing.proofBar.tradesAnalyzed', 'Trades Analyzed'),
    },
    {
      icon: Star,
      value: "98%",
      label: t('landing.proofBar.averageRating', 'Average Rating'),
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      viewport={{ once: true }}
      className="relative -mt-24 z-20 px-6"
      aria-label="Social proof metrics"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
                <div className="relative bg-black/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-10 flex flex-col items-center text-center gap-4 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    {/* Icon with glow effect */}
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    
                    {/* Value */}
                    <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
                      {metric.value}
                    </div>
                    
                    {/* Label */}
                    <div className="text-base md:text-lg font-medium text-foreground/80">
                      {metric.label}
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
