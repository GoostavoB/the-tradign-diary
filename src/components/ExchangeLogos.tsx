import { motion } from "framer-motion";
import { ExchangeCarousel } from "./ExchangeCarousel";
import { useTranslation } from "react-i18next";

const ExchangeLogos = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-16 md:py-20 px-6 relative overflow-hidden" aria-labelledby="exchanges-heading">
      <div className="absolute inset-0 border-t border-b border-primary/10" aria-hidden="true"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center space-y-8"
        >
          <h2 id="exchanges-heading" className="text-2xl md:text-3xl font-bold">
            {t('landing.exchangeLogos.title').split('crypto traders')[0]}
            <span className="text-gradient-primary">crypto traders</span>
            {t('landing.exchangeLogos.title').split('crypto traders')[1]}
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('landing.exchangeLogos.subtitle')}
          </p>

          {/* Premium Exchange Carousel */}
          <ExchangeCarousel />
        </motion.div>
      </div>
    </section>
  );
};

export default ExchangeLogos;
