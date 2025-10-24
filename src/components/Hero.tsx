import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";


const Hero = () => {
  const navigate = useNavigate();
  const { t, isLoading } = useTranslation();

  // Avoid rendering while language is switching
  if (isLoading) {
    return null;
  }

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-6 pt-32 pb-16" aria-labelledby="hero-title">
      {/* Clean dark background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center space-y-8">
          {/* Clean Hero Title */}
          <motion.h1 
            id="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[clamp(40px,6vw,68px)] font-bold leading-[1.1] tracking-tight"
          >
            {t('landing.hero.mainTitle', 'The #1 Crypto Trading Journal')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            {t('landing.hero.subtitle', 'Track, analyze, and review every crypto trade with AI. Built exclusively for crypto traders.')}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pt-4"
          >
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="h-14 px-10 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300"
              aria-label="Start using The Trading Diary for free"
            >
              {t('landing.hero.ctaPrimary', 'Get Started Free')}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
