import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon } from 'lucide-react';

export const WelcomeMessage = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [timeIcon, setTimeIcon] = useState<any>(Sun);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
      setTimeIcon(Sun);
    } else if (hour < 18) {
      setGreeting('Good afternoon');
      setTimeIcon(Sunset);
    } else {
      setGreeting('Good evening');
      setTimeIcon(Moon);
    }
  }, []);

  const userName = user?.email?.split('@')[0] || 'Trader';

  const TimeIconComponent = timeIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PremiumCard className="p-6 glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TimeIconComponent className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">
                {greeting}, {userName}!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back to your trading journal.
              </p>
            </div>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
};
