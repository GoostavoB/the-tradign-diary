import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

/**
 * SEO-optimized feature banner that sits just below the hero
 * Contains keyword-rich content while maintaining clean design
 */
export const HeroFeatureBanner = () => {
  const stats = [
    { title: "40× Faster Uploads", description: "Batch upload from screenshots. No more manual entry." },
    { title: "Know Every Fee", description: "Compare exchanges and uncover hidden costs." },
    { title: "Your Dashboard, Your Rules", description: "Fully customizable metrics, colors, and layout." }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="py-12 px-4 bg-secondary/10 border-y border-border/50"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Main Heading - H2 for SEO hierarchy */}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
          AI Powered Multi-Exchange Crypto Trading Journal
        </h2>
        
        {/* SEO-rich description */}
        <p className="text-center text-muted-foreground max-w-4xl mx-auto mb-6 text-sm md:text-base">
          Consolidates all your trades from Binance, Bybit, Coinbase & ALL other exchanges via our AI system. 
          Professional crypto trading journal with multi-exchange analytics, risk management tools, 
          and AI-powered insights in one place.
        </p>

        {/* Stats cards */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="p-4 rounded-xl bg-card/50 border border-primary/20"
            >
              <h3 className="font-semibold mb-1 text-sm">{stat.title}</h3>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
