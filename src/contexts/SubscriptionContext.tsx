import { createContext, useContext, ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';

type PlanType = 'basic' | 'pro' | 'elite';

interface SubscriptionContextType {
  currentPlan: PlanType;
  isActive: boolean;
  isLoading: boolean;
  canAccessFeature: (requiredPlan: PlanType) => boolean;
  isFeatureLocked: (requiredPlan: PlanType) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { isActive, isLoading: subscriptionLoading } = useSubscription();
  const { currentPlan, canAccessFeature, isFeatureLocked, isLoading: premiumLoading } = usePremiumFeatures();

  const value: SubscriptionContextType = {
    currentPlan,
    isActive,
    isLoading: subscriptionLoading || premiumLoading,
    canAccessFeature,
    isFeatureLocked
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};
