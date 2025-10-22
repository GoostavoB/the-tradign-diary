import { Rocket, Zap, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const PricingRoadmap = () => {
  const { t } = useTranslation();

  const roadmapItems = [
    {
      icon: Star,
      priority: "high",
      quarter: "Q2 2025",
      features: [
        t('pricing.roadmap.features.bestAssetFinder'),
        t('pricing.roadmap.features.batchEdit'),
        t('pricing.roadmap.features.valueAtRisk'),
      ]
    },
    {
      icon: Zap,
      priority: "high",
      quarter: "Q3 2025",
      features: [
        t('pricing.roadmap.features.apiAccess'),
        t('pricing.roadmap.features.portfolioTracking'),
        t('pricing.roadmap.features.inAppAlerts'),
      ]
    },
    {
      icon: Rocket,
      priority: "medium",
      quarter: "Q4 2025",
      features: [
        t('pricing.roadmap.features.autosyncDelta'),
        t('pricing.roadmap.features.savedViews'),
        t('pricing.roadmap.features.teamCollaboration'),
      ]
    },
  ];

  const getPriorityColor = (priority: string) => {
    return priority === 'high' ? 'text-primary' : 'text-muted-foreground';
  };

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            {t('pricing.roadmap.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('pricing.roadmap.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roadmapItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="glass rounded-2xl p-6 hover-lift transition-all"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-primary/10 ${getPriorityColor(item.priority)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {t('pricing.roadmap.targetQuarter')}
                    </div>
                    <div className="font-semibold">{item.quarter}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    item.priority === 'high' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.priority === 'high' ? t('pricing.roadmap.highPriority') : t('pricing.roadmap.mediumPriority')}
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t('pricing.roadmap.disclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingRoadmap;
