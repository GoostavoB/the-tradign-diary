import { motion } from 'framer-motion';
import { Zap, TrendingUp, Trophy, Target, Star } from 'lucide-react';

interface XPToastProps {
  amount: number;
  reason: string;
  type?: 'default' | 'achievement' | 'milestone';
}

export const XPToast = ({ amount, reason, type = 'default' }: XPToastProps) => {
  const getIcon = () => {
    if (type === 'achievement') return Trophy;
    if (type === 'milestone') return Star;
    return Zap;
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl glass-strong border border-primary/20"
    >
      <motion.div
        initial={{ rotate: -20 }}
        animate={{ rotate: 0 }}
        className="p-2 rounded-lg bg-primary/20"
      >
        <Icon className="w-5 h-5 text-primary" />
      </motion.div>
      <div>
        <div className="flex items-center gap-2">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-bold text-primary"
          >
            +{amount} XP
          </motion.span>
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground">{reason}</p>
      </div>
    </motion.div>
  );
};
