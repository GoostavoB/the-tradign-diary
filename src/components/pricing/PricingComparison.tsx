import { Check, X, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const PricingComparison = () => {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  
  const features = [
    {
      categoryKey: "pricingComparison.categories.results",
      items: [
        { nameKey: "pricingComparison.features.winRateTracking", basic: true, pro: true, elite: true },
        { nameKey: "pricingComparison.features.maxWeeklyDrawdown", basic: false, pro: true, elite: true },
        { nameKey: "pricingComparison.features.costImpactAnalysis", basic: false, pro: true, elite: true }
      ]
    },
    {
      categoryKey: "pricingComparison.categories.dataCapture",
      items: [
        { nameKey: "pricingComparison.features.csvUploads", basic: true, pro: true, elite: true },
        { nameKey: "pricingComparison.features.screenshotOcr", basic: true, pro: true, elite: true },
        { nameKey: "pricingComparison.features.aiAccuracyTier", basic: "pricingComparison.tiers.standard", pro: "pricingComparison.tiers.enhanced", elite: "pricingComparison.tiers.premium" },
        { nameKey: "pricingComparison.features.customFields", basic: false, pro: true, elite: true }
      ]
    },
    {
      categoryKey: "pricingComparison.categories.riskTools",
      items: [
        { nameKey: "pricingComparison.features.leverageCalculator", basic: false, pro: true, elite: true },
        { nameKey: "pricingComparison.features.preTradeChecklist", basic: false, pro: true, elite: true },
        { nameKey: "pricingComparison.features.riskAlerts", basic: false, pro: true, elite: true }
      ]
    },
    {
      categoryKey: "pricingComparison.categories.costs",
      items: [
        { nameKey: "pricingComparison.features.feesDashboard", basic: false, pro: true, elite: true },
        { nameKey: "pricingComparison.features.makerTakerSimulation", basic: false, pro: true, elite: true },
        { nameKey: "pricingComparison.features.fundingRebates", basic: false, pro: true, elite: true }
      ]
    },
    {
      categoryKey: "pricingComparison.categories.analytics",
      items: [
        { nameKey: "pricingComparison.features.weeklyHeatmap", basic: true, pro: true, elite: true },
        { nameKey: "pricingComparison.features.bestAssetsHours", basic: true, pro: true, elite: true },
        { nameKey: "pricingComparison.features.mfeMaeExpectancy", basic: false, pro: false, elite: true }
      ]
    },
    {
      categoryKey: "pricingComparison.categories.ops",
      items: [
        { nameKey: "pricingComparison.features.weeklyEmailReports", basic: false, pro: false, elite: true },
        { nameKey: "pricingComparison.features.exportCsvPdf", basic: false, pro: false, elite: true },
        { nameKey: "pricingComparison.features.integrations", basic: "pricingComparison.tiers.oneExchange", pro: "pricingComparison.tiers.threeExchanges", elite: "pricingComparison.tiers.fiveExchanges", tooltipKey: "pricingComparison.features.integrationsTooltip" }
      ]
    }
  ];

  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-primary mx-auto" />
      ) : (
        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
      );
    }
    // If value is a translation key, translate it
    return <span className="text-sm">{t(value)}</span>;
  };

  return (
    <section ref={ref} className="px-6 mb-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 
            className="font-bold leading-tight tracking-tight mb-4"
            style={{ 
              fontSize: 'clamp(28px, 4vw, 42px)',
              letterSpacing: '-0.01em'
            }}
          >
            {t('pricingComparison.title')}
          </h2>
          <p className="text-[17px] text-muted-foreground/80 max-w-2xl mx-auto">
            Compare features across all plans
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-primary/20 bg-primary/5">
                  <th className="text-left py-4 px-4 font-semibold text-[14px]">{t('pricingComparison.feature')}</th>
                  <th className="text-center py-4 px-4 font-semibold text-[14px]">{t('pricingComparison.basic')}</th>
                  <th className="text-center py-4 px-4 font-semibold text-[14px]">{t('pricingComparison.pro')}</th>
                  <th className="text-center py-4 px-4 font-semibold text-[14px]">{t('pricingComparison.elite')}</th>
                </tr>
              </thead>
              <tbody>
                {features.map((category, categoryIndex) => (
                  <>
                    <tr key={`category-${categoryIndex}`} className="bg-primary/10">
                      <td colSpan={4} className="py-4 px-4 font-semibold text-[13px] uppercase tracking-wide text-primary">
                        {t(category.categoryKey)}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <motion.tr
                        key={`item-${categoryIndex}-${itemIndex}`}
                        initial={{ opacity: 0 }}
                        animate={isVisible ? { opacity: 1 } : {}}
                        transition={{ duration: 0.3, delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                        className="border-b border-primary/10 hover:bg-primary/5 transition-colors group"
                      >
                        <td className="py-4 px-4 text-[14px]">
                          <div className="flex items-center gap-2">
                            <span className="group-hover:text-foreground transition-colors">{t(item.nameKey)}</span>
                            {item.tooltipKey && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-[13px]">{t(item.tooltipKey)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">{renderCell(item.basic)}</td>
                        <td className="py-4 px-4 text-center">{renderCell(item.pro)}</td>
                        <td className="py-4 px-4 text-center">{renderCell(item.elite)}</td>
                      </motion.tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingComparison;
