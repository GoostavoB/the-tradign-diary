import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ReactNode } from "react";

interface PricingStorySectionProps {
  headline: string;
  copy: string | ReactNode;
  dataFact?: string;
  visual?: ReactNode;
  reverse?: boolean;
}

export const PricingStorySection = ({
  headline,
  copy,
  dataFact,
  visual,
  reverse = false,
}: PricingStorySectionProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="px-6 py-20 relative overflow-hidden">
      {/* Background gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative">
        <div className={`grid md:grid-cols-2 gap-12 items-center ${reverse ? 'md:flex-row-reverse' : ''}`}>
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className={reverse ? 'md:order-2' : ''}
          >
            <h2 
              className="font-bold leading-tight tracking-tight mb-6"
              style={{ 
                fontSize: 'clamp(28px, 4vw, 42px)',
                letterSpacing: '-0.01em'
              }}
            >
              {headline}
            </h2>
            
            <div className="text-[17px] text-muted-foreground/80 leading-relaxed space-y-4 mb-6">
              {typeof copy === 'string' ? <p>{copy}</p> : copy}
            </div>

            {dataFact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="glass-card p-4 border-l-4 border-primary"
              >
                <p className="text-[15px] font-semibold text-foreground/90">
                  {dataFact}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? -50 : 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={reverse ? 'md:order-1' : ''}
          >
            {visual}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
