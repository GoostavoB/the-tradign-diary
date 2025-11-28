import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

const CTA = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="py-20 md:py-28 px-6" aria-labelledby="cta-heading">
      <div className="container mx-auto max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold leading-tight">
            {t('landing.cta.title')}
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          
          <div>
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="px-10 py-7 text-base font-medium rounded-xl"
              aria-label="Start using The Trading Diary for free"
            >
              {t('landing.cta.button')}
            </Button>
            
            <p className="mt-4 text-xs text-muted-foreground">
              {t('landing.cta.note')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
