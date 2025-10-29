import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Clock, Zap } from "lucide-react";

export const SpeedComparisonVisual = () => {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <div ref={ref} className="space-y-6">
      {/* Manual Entry */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span className="text-[14px] font-semibold text-muted-foreground">Manual Entry</span>
        </div>
        
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.3, delay: i * 0.2 }}
              className="h-6 bg-muted/30 rounded-md"
            />
          ))}
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 2 }}
          className="text-[13px] text-muted-foreground mt-4 text-center"
        >
          ⏱️ 20 minutes for 10 trades
        </motion.p>
      </div>

      {/* AI Upload */}
      <div className="glass-card p-6 border-2 border-primary">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-[14px] font-semibold text-primary">AI Upload System</span>
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 2.2 }}
          className="relative"
        >
          <div className="h-32 bg-primary/20 rounded-lg flex items-center justify-center relative overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-primary/20 rounded-lg"
            />
            <Zap className="w-12 h-12 text-primary relative z-10" />
          </div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 2.5 }}
          className="text-[13px] text-primary font-semibold mt-4 text-center"
        >
          ⚡ 30 seconds for 10 trades
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 2.8 }}
        className="text-center"
      >
        <p className="text-[15px] font-bold text-primary">40x faster</p>
        <p className="text-[13px] text-muted-foreground">Save hours every week</p>
      </motion.div>
    </div>
  );
};
