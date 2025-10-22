import React from "react";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const PricingComparison = () => {
  const { t } = useTranslation();

  const features = [
    {
      category: t('pricing.comparison.categories.aiAnalytics'),
      items: [
        { name: t('pricing.comparison.features.aiUploads'), basic: "50/mo", pro: "100/mo", elite: "300/mo" },
        { name: t('pricing.comparison.features.manualUploads'), basic: true, pro: true, elite: true },
        { name: t('pricing.comparison.features.aiAnalysis'), basic: false, pro: "1/week", elite: "5/week" },
        { name: t('pricing.comparison.features.customWidgets'), basic: "15+", pro: t('pricing.comparison.unlimited'), elite: t('pricing.comparison.unlimited') },
        { name: t('pricing.comparison.features.advancedCharts'), basic: true, pro: true, elite: true },
      ]
    },
    {
      category: t('pricing.comparison.categories.tradingTools'),
      items: [
        { name: t('pricing.comparison.features.tradingPlan'), basic: false, pro: true, elite: true },
        { name: t('pricing.comparison.features.preTradeChecklist'), basic: false, pro: true, elite: true },
        { name: t('pricing.comparison.features.goalsTracking'), basic: false, pro: true, elite: true },
        { name: t('pricing.comparison.features.tradeReplay'), basic: false, pro: false, elite: true },
        { name: t('pricing.comparison.features.positionCalculator'), basic: false, pro: false, elite: true },
      ]
    },
    {
      category: t('pricing.comparison.categories.journaling'),
      items: [
        { name: t('pricing.comparison.features.basicJournal'), basic: true, pro: true, elite: true },
        { name: t('pricing.comparison.features.emotionalTimeline'), basic: true, pro: true, elite: true },
        { name: t('pricing.comparison.features.richJournal'), basic: false, pro: true, elite: true },
        { name: t('pricing.comparison.features.patternAnalysis'), basic: false, pro: true, elite: true },
      ]
    },
    {
      category: t('pricing.comparison.categories.riskManagement'),
      items: [
        { name: t('pricing.comparison.features.feeAnalytics'), basic: true, pro: true, elite: true },
        { name: t('pricing.comparison.features.riskDashboard'), basic: false, pro: false, elite: true },
        { name: t('pricing.comparison.features.drawdownAnalysis'), basic: false, pro: false, elite: true },
        { name: t('pricing.comparison.features.performanceAlerts'), basic: false, pro: false, elite: true },
      ]
    },
    {
      category: t('pricing.comparison.categories.integrations'),
      items: [
        { name: t('pricing.comparison.features.csvImport'), basic: true, pro: true, elite: true },
        { name: t('pricing.comparison.features.exchangeConnections'), basic: true, pro: true, elite: true },
        { name: t('pricing.comparison.features.autoRefresh'), basic: false, pro: true, elite: true },
      ]
    },
    {
      category: t('pricing.comparison.categories.social'),
      items: [
        { name: t('pricing.comparison.features.viewFeed'), basic: true, pro: true, elite: true },
        { name: t('pricing.comparison.features.createPosts'), basic: false, pro: true, elite: true },
        { name: t('pricing.comparison.features.leaderboard'), basic: true, pro: true, elite: true },
        { name: t('pricing.comparison.features.xpBadges'), basic: false, pro: true, elite: true },
        { name: t('pricing.comparison.features.challenges'), basic: false, pro: true, elite: true },
      ]
    },
  ];

  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-primary mx-auto" />
      ) : (
        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <section className="py-16 px-6 bg-background/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            {t('pricing.comparison.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('pricing.comparison.subtitle')}
          </p>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 md:p-6 font-semibold min-w-[200px]">
                    {t('pricing.comparison.feature')}
                  </th>
                  <th className="text-center p-4 md:p-6 font-semibold w-[120px]">
                    <div className="text-foreground">Basic</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">$15/mo</div>
                  </th>
                  <th className="text-center p-4 md:p-6 font-semibold w-[120px] bg-primary/5">
                    <div className="text-primary">Pro</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">$35/mo</div>
                  </th>
                  <th className="text-center p-4 md:p-6 font-semibold w-[120px]">
                    <div className="text-foreground">Elite</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">$79/mo</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((category, categoryIdx) => (
                  <React.Fragment key={categoryIdx}>
                    <tr className="bg-muted/30">
                      <td colSpan={4} className="p-3 md:p-4 font-semibold text-sm uppercase tracking-wider">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIdx) => (
                      <tr 
                        key={itemIdx} 
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-3 md:p-4 text-sm">{item.name}</td>
                        <td className="p-3 md:p-4 text-center">{renderCell(item.basic)}</td>
                        <td className="p-3 md:p-4 text-center bg-primary/5">{renderCell(item.pro)}</td>
                        <td className="p-3 md:p-4 text-center">{renderCell(item.elite)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingComparison;
