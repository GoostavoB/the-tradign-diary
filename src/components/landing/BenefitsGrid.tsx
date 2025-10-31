import { Shield, Zap, Lock, Building2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const BenefitsGrid = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Shield,
      titleKey: "landing.benefits.noApiKeys.title",
      descriptionKey: "landing.benefits.noApiKeys.description",
      fallbackTitle: "No API keys. Maximum security.",
      fallbackDescription: "Avoid risks and simplify setup. No API keys means no access vulnerabilities."
    },
    {
      icon: Building2,
      titleKey: "landing.benefits.allExchanges.title",
      descriptionKey: "landing.benefits.allExchanges.description",
      fallbackTitle: "Compatible with every exchange.",
      fallbackDescription: "Works seamlessly with Binance, Bybit, OKX, and all major platforms."
    },
    {
      icon: Lock,
      titleKey: "landing.benefits.privateDefault.title",
      descriptionKey: "landing.benefits.privateDefault.description",
      fallbackTitle: "Privacy guaranteed by default.",
      fallbackDescription: "Your data stays yours. End-to-end encryption and zero data sharing."
    },
    {
      icon: Shield,
      titleKey: "landing.benefits.saferDesign.title",
      descriptionKey: "landing.benefits.saferDesign.description",
      fallbackTitle: "Security first, by design.",
      fallbackDescription: "Built with industry-leading security standards from the ground up."
    },
    {
      icon: Upload,
      titleKey: "landing.benefits.uploadGo.title",
      descriptionKey: "landing.benefits.uploadGo.description",
      fallbackTitle: "Upload and trade instantly.",
      fallbackDescription: "Screenshot your trades and upload. AI handles the rest in seconds."
    },
    {
      icon: Zap,
      titleKey: "landing.benefits.fasterUploads.title",
      descriptionKey: "landing.benefits.fasterUploads.description",
      fallbackTitle: "40× Faster Uploads",
      fallbackDescription: "Batch upload from screenshots. No more manual entry."
    },
  ];

  const handleCTAClick = () => {
    const params = new URLSearchParams(location.search);
    const lang = params.get('lang');
    navigate(`/auth${lang ? `?lang=${lang}` : ''}`);
  };

  return (
    <section 
      className="py-20 md:py-32 px-4 relative overflow-hidden"
      data-testid="benefits-v2"
      aria-label="Key Benefits"
    >
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[140px]" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            {t('landing.benefits.mainTitle', 'Built for Every Trader')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('landing.benefits.mainSubtitle', 'Security, privacy, and compatibility with every exchange.')}
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeOut" } 
                }}
                className="group relative"
              >
                <div className="relative h-full p-8 rounded-2xl overflow-hidden
                              bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-sm
                              border border-primary/10 
                              group-hover:border-primary/40 
                              group-hover:shadow-[0_8px_30px_rgb(var(--primary)_/_0.12)]
                              transition-all duration-500 ease-out">
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                  </div>
                  
                  {/* Icon with subtle glow on hover */}
                  <div className="relative mb-6 inline-flex p-4 rounded-xl 
                                bg-primary/10 group-hover:bg-primary/20
                                transition-all duration-300">
                    <Icon className="h-7 w-7 text-primary 
                                   group-hover:scale-110 group-hover:rotate-3
                                   transition-all duration-300" 
                          strokeWidth={1.5} 
                          aria-hidden="true" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-foreground 
                               group-hover:text-primary transition-colors duration-300">
                    {t(benefit.titleKey, benefit.fallbackTitle)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(benefit.descriptionKey, benefit.fallbackDescription)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            onClick={handleCTAClick}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground 
                     px-8 py-6 text-lg font-semibold 
                     shadow-lg hover:shadow-xl hover:scale-105
                     transition-all duration-300"
            aria-label={t("landing.benefits.ctaButton", "Try it free now")}
          >
            {t("landing.benefits.ctaButton", "Try it free now")}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsGrid;
