import { Star, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Testimonials = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      nameKey: "landing.testimonials.alex.name",
      roleKey: "landing.testimonials.alex.role",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      rating: 5,
      textKey: "landing.testimonials.alex.text",
    },
    {
      nameKey: "landing.testimonials.sarah.name",
      roleKey: "landing.testimonials.sarah.role",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      rating: 5,
      textKey: "landing.testimonials.sarah.text",
    },
    {
      nameKey: "landing.testimonials.marcus.name",
      roleKey: "landing.testimonials.marcus.role",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      rating: 5,
      textKey: "landing.testimonials.marcus.text",
    },
  ];
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            {t('landing.testimonials.title').split('Thousands')[0]}
            <span className="text-gradient-primary">Thousands</span>
            {t('landing.testimonials.title').split('Thousands')[1]}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.testimonials.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-6 h-full flex flex-col">
                 <div className="flex items-start gap-3 mb-4">
                  <img
                    src={testimonial.image}
                    alt={t(testimonial.nameKey)}
                    className="w-12 h-12 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm truncate">{t(testimonial.nameKey)}</h4>
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">{t(testimonial.roleKey)}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  "{t(testimonial.textKey)}"
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
