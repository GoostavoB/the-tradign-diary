import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Award, Star, Trophy } from "lucide-react";

export const XPProgressAnimation = () => {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  const badges = [
    { icon: Star, label: "Discipline Starter", delay: 0.5 },
    { icon: Award, label: "Consistency Pro", delay: 0.8 },
    { icon: Trophy, label: "Elite Trader", delay: 1.1 },
  ];

  return (
    <div ref={ref} className="max-w-2xl mx-auto space-y-6">
      {/* XP Progress Bar */}
      <div className="relative">
        <div className="h-4 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm border border-primary/20">
          <motion.div
            initial={{ width: 0 }}
            animate={inView ? { width: "75%" } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-primary rounded-full relative"
            style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
            }}
          >
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="absolute -top-8 left-3/4 -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-blue-500 to-primary text-white px-3 py-1 rounded-full text-[12px] font-bold shadow-lg"
            style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
            }}
          >
            750 XP
          </div>
        </motion.div>
      </div>

      {/* Unlocking Badges */}
      <div className="grid grid-cols-3 gap-4 mt-12">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: badge.delay }}
              className="glass-card p-4 text-center relative overflow-hidden border border-primary/30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={inView ? { scale: [0, 1.2, 1] } : {}}
                transition={{ duration: 0.6, delay: badge.delay + 0.2 }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-primary mb-2 relative"
                style={{
                  boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)'
                }}
              >
                <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
              </motion.div>
              <p className="text-[12px] text-foreground font-semibold">{badge.label}</p>
              
              {/* Unlock shimmer effect */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={inView ? { x: "200%" } : {}}
                transition={{ duration: 1, delay: badge.delay + 0.3 }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent skew-x-12"
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
