import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export const FeatureComparison = () => {
  const { t } = useTranslation();

  const features = [
    {
      category: t('landing.comparison.xpSystem', 'XP Discipline System'),
      free: t('landing.comparison.basic', 'Basic'),
      pro: t('landing.comparison.full', 'Full'),
      elite: t('landing.comparison.full', 'Full'),
    },
    {
      category: t('landing.comparison.uploadSpeed', 'Trade Upload Speed'),
      free: t('landing.comparison.standard', 'Standard'),
      pro: t('landing.comparison.fast', 'Fast'),
      elite: t('landing.comparison.fastest', 'Fastest'),
    },
    {
      category: t('landing.comparison.analytics', 'Analytics (metrics count)'),
      free: '10',
      pro: '50+',
      elite: '100+',
    },
    {
      category: t('landing.comparison.customization', 'Customization level'),
      free: t('landing.comparison.basic', 'Basic'),
      pro: t('landing.comparison.advanced', 'Advanced'),
      elite: t('landing.comparison.full', 'Full'),
    },
    {
      category: t('landing.comparison.support', 'Support type'),
      free: t('landing.comparison.community', 'Community'),
      pro: t('landing.comparison.email', 'Email'),
      elite: t('landing.comparison.priority', 'Priority'),
    },
    {
      category: t('landing.comparison.privacy', 'Privacy & Security'),
      free: true,
      pro: true,
      elite: true,
    },
    {
      category: t('landing.comparison.extraUploads', 'Extra upload costs'),
      free: false,
      pro: '$2 per 10',
      elite: '$1 per 10',
    },
  ];

  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <section id="comparison" className="py-16 md:py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t('landing.comparison.title', 'Complete Feature Comparison')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.comparison.subtitle', 'Compare all features across our plans to find the perfect fit for your trading needs.')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-bold">{t('landing.comparison.feature', 'Feature')}</th>
                  <th className="text-center p-4 font-bold">{t('landing.comparison.free', 'Free')}</th>
                  <th className="text-center p-4 font-bold bg-primary/10">{t('landing.comparison.pro', 'Pro')}</th>
                  <th className="text-center p-4 font-bold">{t('landing.comparison.elite', 'Elite')}</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="p-4 font-medium">{feature.category}</td>
                    <td className="p-4 text-center">{renderCell(feature.free)}</td>
                    <td className="p-4 text-center bg-primary/5">{renderCell(feature.pro)}</td>
                    <td className="p-4 text-center">{renderCell(feature.elite)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
