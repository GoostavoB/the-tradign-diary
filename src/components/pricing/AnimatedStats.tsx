import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { AnimatedMetric } from "@/components/premium/AnimatedMetric";

export const AnimatedStats = () => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const stats = [
    { value: 23, suffix: "%", label: "Performance gain" },
    { value: 18, suffix: "%", label: "Drawdown reduction", prefix: "–" },
    { value: 40, suffix: "x", label: "Faster logging" },
  ];

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: index * 0.15 }}
          className="glass-card p-6 text-center"
        >
          <div className="mb-2">
            <AnimatedMetric
              value={stat.value}
              suffix={stat.suffix}
              prefix={stat.prefix}
              decimals={0}
              inView={inView}
            />
          </div>
          <p className="text-[14px] text-muted-foreground">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
};
