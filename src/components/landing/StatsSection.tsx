import { memo, useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Users, BarChart3 } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
}

const StatItem = memo(({ icon, value, suffix = '', label, delay = 0 }: StatItemProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShouldAnimate(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="flex flex-col items-center text-center space-y-4 p-8 rounded-2xl 
                 bg-gradient-to-br from-primary/5 to-accent/5 
                 border border-primary/10 backdrop-blur-sm
                 hover:scale-105 hover:border-primary/30 
                 transition-all duration-300 ease-out"
    >
      <div className="p-4 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-4xl md:text-5xl font-bold text-foreground">
          {shouldAnimate ? (
            <AnimatedCounter value={value} suffix={suffix} duration={2000} />
          ) : (
            <span>0{suffix}</span>
          )}
        </div>
        <p className="text-sm md:text-base text-muted-foreground font-medium">
          {label}
        </p>
      </div>
    </motion.div>
  );
});

StatItem.displayName = 'StatItem';

export const StatsSection = memo(() => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Ambient glow effects */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Trusted by Traders Worldwide
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of traders who have transformed their trading journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <StatItem
            icon={<Users className="h-8 w-8" />}
            value={10000}
            suffix="+"
            label="Active Traders"
            delay={0}
          />
          <StatItem
            icon={<BarChart3 className="h-8 w-8" />}
            value={1000000}
            suffix="+"
            label="Trades Analyzed"
            delay={150}
          />
          <StatItem
            icon={<TrendingUp className="h-8 w-8" />}
            value={98}
            suffix="%"
            label="Satisfaction Rate"
            delay={300}
          />
        </div>
      </div>
    </section>
  );
});

StatsSection.displayName = 'StatsSection';
