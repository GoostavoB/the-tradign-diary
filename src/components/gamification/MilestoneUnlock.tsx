import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MilestoneUnlockProps {
  show: boolean;
  title: string;
  description: string;
  icon?: 'trophy' | 'star' | 'target' | 'zap';
}

export const MilestoneUnlock = ({ show, title, description, icon = 'trophy' }: MilestoneUnlockProps) => {
  if (!show) return null;

  const getIcon = () => {
    switch (icon) {
      case 'star': return Star;
      case 'target': return Target;
      case 'zap': return Zap;
      default: return Trophy;
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      role="alert"
      aria-live="polite"
    >
      <Card className="glass-strong p-4 border border-primary/30 shadow-2xl min-w-[300px]">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ duration: 1 }}
            className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-dark"
            role="img"
            aria-label={`${icon} achievement icon`}
          >
            <Icon className="w-6 h-6 text-primary-foreground" />
          </motion.div>
          <div>
            <h3 className="font-bold text-primary">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
