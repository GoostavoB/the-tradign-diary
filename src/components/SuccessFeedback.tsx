import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface SuccessFeedbackProps {
  tradesCount: number;
  onViewDashboard: () => void;
  onViewHistory: () => void;
  onStayHere?: () => void;
  autoCloseDelay?: number; // in seconds, 0 means no auto-close
}

export function SuccessFeedback({ 
  tradesCount, 
  onViewDashboard, 
  onViewHistory,
  onStayHere,
  autoCloseDelay = 0 
}: SuccessFeedbackProps) {
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay);

  useEffect(() => {
    if (autoCloseDelay > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [autoCloseDelay]);

  useEffect(() => {
    if (timeLeft === 0 && autoCloseDelay > 0) {
      onViewDashboard();
    }
  }, [timeLeft, autoCloseDelay, onViewDashboard]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="p-8 glass-card border-border/50 text-center space-y-6">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
        </motion.div>

        {/* Success Message */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">
            Trade{tradesCount > 1 ? 's' : ''} Added Successfully!
          </h3>
          <p className="text-muted-foreground">
            {tradesCount > 1 
              ? `${tradesCount} trades have been saved to your history.`
              : 'Your trade has been saved to your history.'
            }
          </p>
          {autoCloseDelay > 0 && timeLeft > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Redirecting to dashboard in {timeLeft}s...
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={onViewDashboard}
            className="w-full"
            size="lg"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            onClick={onViewHistory}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <History className="w-4 h-4 mr-2" />
            Go to Trade History
          </Button>
          {onStayHere && (
            <Button
              onClick={onStayHere}
              variant="ghost"
              className="w-full"
              size="lg"
            >
              <X className="w-4 h-4 mr-2" />
              Stay Here
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground pt-4 border-t border-border/50">
          You can edit or remove trades anytime in your Trade History page
        </div>
      </Card>
    </motion.div>
  );
}
