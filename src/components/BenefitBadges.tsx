import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Globe, Lock, Upload } from "lucide-react";

const benefits = [
  { text: "No API keys needed", icon: Key },
  { text: "Works with every exchange", icon: Globe },
  { text: "Private by default", icon: Shield },
  { text: "Safer by design", icon: Lock },
  { text: "Upload and go", icon: Upload },
];

const BenefitBadges = () => {
  return (
    <section className="py-20 md:py-28 px-6 relative overflow-hidden" aria-label="Key benefits">
      <div className="absolute inset-0 border-t border-b border-primary/10" aria-hidden="true"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 md:gap-6"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="hover-scale"
              >
                <Badge 
                  variant="secondary" 
                  className="px-6 py-3.5 text-base md:text-lg font-semibold flex items-center gap-3 bg-background/60 backdrop-blur-md border-2 border-primary/30 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                >
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" aria-hidden="true" />
                  <span>{benefit.text}</span>
                </Badge>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitBadges;
