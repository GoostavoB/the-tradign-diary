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
    <section className="py-16 md:py-20 px-6 relative overflow-hidden" aria-label="Key benefits">
      <div className="absolute inset-0 border-t border-b border-primary/10" aria-hidden="true"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 md:gap-4"
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
              >
                <Badge 
                  variant="secondary" 
                  className="px-4 py-2 text-sm md:text-base font-medium flex items-center gap-2 bg-background/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-colors"
                >
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
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
