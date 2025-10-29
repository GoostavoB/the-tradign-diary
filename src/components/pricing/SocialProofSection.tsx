import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AnimatedMetric } from "@/components/premium/AnimatedMetric";
import { useInView } from "react-intersection-observer";
import { Quote } from "lucide-react";

export const SocialProofSection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: statsRef, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  const metrics = [
    { value: 23, suffix: "%", label: "Improvement in win rate", prefix: "+" },
    { value: 18, suffix: "%", label: "Reduction in drawdown", prefix: "–" },
    { value: 31, suffix: "%", label: "Increase in consistency", prefix: "+" },
  ];

  return (
    <section ref={sectionRef} className="px-6 py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 
            className="font-bold leading-tight tracking-tight mb-4"
            style={{ 
              fontSize: 'clamp(28px, 4vw, 42px)',
              letterSpacing: '-0.01em'
            }}
          >
            Built from real trader data.
          </h2>
          <p className="text-[17px] text-muted-foreground/80 max-w-2xl mx-auto">
            Our system was tested with 1,000+ active traders. Within 4 weeks, they reported:
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div ref={statsRef} className="grid md:grid-cols-3 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="glass-card p-8 text-center"
            >
              <div className="mb-3">
                <AnimatedMetric
                  value={metric.value}
                  suffix={metric.suffix}
                  prefix={metric.prefix}
                  decimals={0}
                  inView={inView}
                />
              </div>
              <p className="text-[14px] text-muted-foreground">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card p-8 max-w-3xl mx-auto relative"
        >
          <Quote className="w-10 h-10 text-primary/30 absolute top-6 left-6" />
          <div className="relative z-10 pl-8">
            <p className="text-[17px] text-foreground/90 leading-relaxed mb-4 italic">
              "The XP system completely changed how I approach trading. I went from inconsistent 
              results to hitting my targets every week. The gamification makes journaling something 
              I actually look forward to."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[14px] font-bold text-primary">MT</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">Michael T.</p>
                <p className="text-[12px] text-muted-foreground">Day Trader, Elite Member</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-[13px] text-muted-foreground text-center mt-6"
        >
          Based on real user data from 1,000+ active traders
        </motion.p>
      </div>
    </section>
  );
};
