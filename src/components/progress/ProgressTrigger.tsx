import { useState } from 'react';
import { Zap } from 'lucide-react';
import { ProgressPanel } from './ProgressPanel';
import { cn } from '@/lib/utils';
import { useEngagementReminders } from '@/hooks/useEngagementReminders';

export function ProgressTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const { activityData } = useEngagementReminders();

  // Always show the trigger even if no data yet
  if (!activityData) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed top-20 right-6 z-30",
            "p-3 rounded-full shadow-lg",
            "transition-all duration-300 hover:scale-110",
            "bg-gradient-to-br from-amber-500 to-amber-600",
            "hover:from-amber-400 hover:to-amber-500",
            "border-2 border-amber-400/50"
          )}
          aria-label="Open progress panel"
        >
          <Zap className="h-5 w-5 text-white" strokeWidth={2.5} fill="currentColor" />
        </button>
        <ProgressPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  const activities = [
    { current: activityData.trades_uploaded, target: 5 },
    { current: activityData.emotional_logs_created, target: 3 },
    { current: activityData.journal_entries_created, target: 2 },
    { current: activityData.challenges_completed, target: 3 },
  ];

  const completedCount = activities.filter(a => a.current >= a.target).length;
  const hasIncomplete = completedCount < activities.length;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed top-20 right-6 z-30",
          "p-3 rounded-full shadow-lg",
          "transition-all duration-300 hover:scale-110",
          "bg-gradient-to-br from-amber-500 to-amber-600",
          "hover:from-amber-400 hover:to-amber-500",
          "border-2 border-amber-400/50"
        )}
        aria-label="Open progress panel"
      >
        <Zap className="h-5 w-5 text-white" strokeWidth={2.5} fill="currentColor" />
        {hasIncomplete && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center shadow-md border-2 border-background">
              <span className="text-[10px] font-bold text-white">{activities.length - completedCount}</span>
            </span>
          </span>
        )}
      </button>

      <ProgressPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
