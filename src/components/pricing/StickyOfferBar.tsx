import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { usePromoStatus } from "@/hooks/usePromoStatus";

export const StickyOfferBar = () => {
  const promoStatus = usePromoStatus();

  if (!promoStatus.isActive) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary/20"
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-center gap-3 text-primary-foreground">
          <Clock className="w-4 h-4 animate-pulse" />
          <p className="text-[14px] font-semibold">
            Launch pricing ending soon. Save up to 40% on annual plans
            {promoStatus.daysRemaining > 0 
              ? ` — ${promoStatus.daysRemaining} days remaining`
              : ` — ${promoStatus.hoursRemaining} hours remaining`
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
};
