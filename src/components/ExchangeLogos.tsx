import { motion } from "framer-motion";
import { ExchangeCarousel } from "./ExchangeCarousel";

const ExchangeLogos = () => {
  return (
    <section className="py-16 md:py-20 px-6 relative overflow-hidden bg-gray-900/30">
      <div className="absolute inset-0 border-t border-b border-primary/10"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center space-y-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold">
            Built for <span className="text-gradient-primary">crypto traders</span> who take performance seriously.
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Whether you scalp, day trade, or swing — track what's working and what's costing you.
          </p>

          {/* Premium Exchange Carousel */}
          <ExchangeCarousel />
        </motion.div>
      </div>
    </section>
  );
};

export default ExchangeLogos;
