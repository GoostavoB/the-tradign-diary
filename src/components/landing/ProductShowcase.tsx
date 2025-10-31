import { motion } from "framer-motion";
import { InteractiveThemePreview } from "./showcase/InteractiveThemePreview";
import { FeatureCarousel } from "./showcase/FeatureCarousel";
import { CustomizationGrid } from "./showcase/CustomizationGrid";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ProductShowcase = () => {
  return (
    <section 
      className="py-20 md:py-28 px-6" 
      aria-label="Interactive product showcase and customization features"
    >
      <div className="container mx-auto max-w-7xl space-y-20">
        {/* Section 1: Interactive Theme Preview */}
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Your Trading Journal. Your Way.
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Fully customizable themes, colors, and dashboard layouts. Track Binance, Bybit, Coinbase, and more — all in your style.
            </p>
            
            {/* Hidden SEO-rich content */}
            <div className="sr-only">
              <h3>Customizable Multi-Exchange Trading Journal Features</h3>
              <ul>
                <li>Customizable color themes and dashboard layouts for crypto trading</li>
                <li>Achievement badges and gamification system with rank progression</li>
                <li>Automated tax reports for Binance, Bybit, Coinbase, Gate.io (2025 compliant)</li>
                <li>AI-powered trade screenshot extraction and OCR technology</li>
                <li>Multi-exchange portfolio analytics and consolidated tracking</li>
                <li>Long/short ratio and open interest tracking for market analysis</li>
                <li>Psychology and emotion tracking with decision quality scoring</li>
                <li>Drag-and-drop dashboard widgets with custom layouts</li>
                <li>Multi-exchange trade uploads and centralized tracking</li>
                <li>Advanced chart customization and technical indicators</li>
              </ul>
            </div>
          </motion.div>

          <InteractiveThemePreview />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <Button size="lg" className="gap-2 rounded-full">
              Start Customizing Your Journal
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Section 2: Feature Carousel */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything You Need. In One Place.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From AI-powered trade uploads to advanced analytics, discover all the features that make journaling effortless.
            </p>
          </motion.div>

          <FeatureCarousel />
        </div>

        {/* Section 3: Customization Grid */}
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Your trading style, your dashboard layout
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Customize every aspect of your trading journal. No two traders are the same, neither are the dashboards.
            </p>
          </motion.div>

          <CustomizationGrid />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button size="lg" className="gap-2 rounded-full">
              Try the free plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
