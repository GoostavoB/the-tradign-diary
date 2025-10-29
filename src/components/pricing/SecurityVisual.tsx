import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Shield, Lock, Eye, Database } from "lucide-react";

export const SecurityVisual = () => {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  const features = [
    { icon: Shield, label: "End-to-end encryption", delay: 0.2 },
    { icon: Lock, label: "No API connections", delay: 0.4 },
    { icon: Eye, label: "Your eyes only", delay: 0.6 },
    { icon: Database, label: "Secure cloud storage", delay: 0.8 },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Central shield with pulse */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="relative mx-auto w-48 h-48 flex items-center justify-center"
      >
        {/* Pulsing rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={
              inView
                ? {
                    scale: [1, 1.5, 2],
                    opacity: [0.5, 0.2, 0],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: ring * 0.4,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full border-2 border-primary"
          />
        ))}

        {/* Shield icon */}
        <motion.div
          animate={
            inView
              ? {
                  scale: [1, 1.05, 1],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center"
        >
          <Shield className="w-12 h-12 text-primary" />
        </motion.div>
      </motion.div>

      {/* Feature badges around shield */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: feature.delay }}
              className="glass-card p-4 flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[12px] text-muted-foreground font-medium">
                {feature.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-6 text-center"
      >
        <p className="text-[13px] text-primary font-semibold">
          🔒 100% trader-owned data
        </p>
      </motion.div>
    </div>
  );
};
