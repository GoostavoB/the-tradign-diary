import { Star, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Testimonials = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 md:py-28 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-strong backdrop-blur-xl border border-primary/30">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-lg md:text-xl font-semibold">
              {t('landing.testimonials.approvedByTraders')}
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-primary">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-primary" />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
