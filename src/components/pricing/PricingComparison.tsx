import { Check, X, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PricingComparison = () => {
  const features = [
    {
      category: "Results",
      items: [
        { name: "Win-rate tracking", basic: true, pro: true, elite: true },
        { name: "Max weekly drawdown limit", basic: false, pro: true, elite: true },
        { name: "Cost impact analysis on R", basic: false, pro: true, elite: true }
      ]
    },
    {
      category: "Data capture",
      items: [
        { name: "CSV uploads", basic: true, pro: true, elite: true },
        { name: "Screenshot OCR uploads", basic: true, pro: true, elite: true },
        { name: "AI accuracy tier", basic: "Standard", pro: "Enhanced", elite: "Premium" },
        { name: "Custom data fields/tags", basic: false, pro: true, elite: true }
      ]
    },
    {
      category: "Risk tools",
      items: [
        { name: "Leverage and position size calculator", basic: false, pro: true, elite: true },
        { name: "Pre-trade checklist", basic: false, pro: true, elite: true },
        { name: "Risk alerts", basic: false, pro: true, elite: true }
      ]
    },
    {
      category: "Costs",
      items: [
        { name: "Fees dashboard by exchange and pair", basic: false, pro: true, elite: true },
        { name: "Maker vs taker simulation", basic: false, pro: true, elite: true },
        { name: "Funding and rebates", basic: false, pro: true, elite: true }
      ]
    },
    {
      category: "Analytics",
      items: [
        { name: "Weekly heatmap", basic: true, pro: true, elite: true },
        { name: "Best assets and hours", basic: true, pro: true, elite: true },
        { name: "MFE/MAE and expectancy", basic: false, pro: false, elite: true }
      ]
    },
    {
      category: "Ops",
      items: [
        { name: "Weekly email reports", basic: false, pro: false, elite: true },
        { name: "Export CSV and PDF", basic: false, pro: false, elite: true },
        { name: "Integrations", basic: "1 exchange", pro: "3 exchanges", elite: "5 exchanges", tooltip: "See all supported exchanges" }
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
    return <span className="text-sm">{value}</span>;
  };

  return (
    <section className="px-6 mb-16">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-8">Compare plans</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-primary/20">
                <th className="text-left py-4 px-4 font-semibold">Feature</th>
                <th className="text-center py-4 px-4 font-semibold">Basic</th>
                <th className="text-center py-4 px-4 font-semibold">Pro</th>
                <th className="text-center py-4 px-4 font-semibold">Elite</th>
              </tr>
            </thead>
            <tbody>
              {features.map((category, categoryIndex) => (
                <>
                  <tr key={`category-${categoryIndex}`} className="bg-primary/5">
                    <td colSpan={4} className="py-3 px-4 font-semibold text-sm uppercase tracking-wide">
                      {category.category}
                    </td>
                  </tr>
                  {category.items.map((item, itemIndex) => (
                    <tr key={`item-${categoryIndex}-${itemIndex}`} className="border-b border-primary/10 hover:bg-secondary/20">
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          {item.name}
                          {item.tooltip && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{item.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{renderCell(item.basic)}</td>
                      <td className="py-3 px-4 text-center">{renderCell(item.pro)}</td>
                      <td className="py-3 px-4 text-center">{renderCell(item.elite)}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PricingComparison;
