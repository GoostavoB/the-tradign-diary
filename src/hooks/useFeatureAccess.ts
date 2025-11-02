import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type PlanType = 'basic' | 'pro' | 'elite';

interface FeatureAccess {
  hasFeeAnalysis: boolean;
  connectedAccountsLimit: number;
  currentAccountsCount: number;
  canAddAccount: boolean;
  customMetricsLimit: number;
  customMetricsUsed: number;
  canCreateCustomMetric: boolean;
  planType: PlanType;
  isLoading: boolean;
}

export const useFeatureAccess = () => {
  const { user } = useAuth();
  const [access, setAccess] = useState<FeatureAccess>({
    hasFeeAnalysis: false,
    connectedAccountsLimit: 1,
    currentAccountsCount: 0,
    canAddAccount: true,
    customMetricsLimit: 0,
    customMetricsUsed: 0,
    canCreateCustomMetric: false,
    planType: 'basic',
    isLoading: true,
  });

  const fetchAccess = async () => {
    if (!user) {
      setAccess({
        hasFeeAnalysis: false,
        connectedAccountsLimit: 1,
        currentAccountsCount: 0,
        canAddAccount: true,
        customMetricsLimit: 0,
        customMetricsUsed: 0,
        canCreateCustomMetric: false,
        planType: 'basic',
        isLoading: false,
      });
      return;
    }

    try {
      // Get actual subscription data
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      // Get connected accounts count
      const { count: accountsCount } = await supabase
        .from('connected_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true);
      const currentCount = accountsCount || 0;

      // Determine plan type and access
      const planType: PlanType = subscription?.plan_type === 'elite' 
        ? 'elite' 
        : subscription?.plan_type === 'pro' 
        ? 'pro' 
        : 'basic';

      // Set access based on actual plan
      if (planType === 'elite') {
        setAccess({
          hasFeeAnalysis: true,
          connectedAccountsLimit: 999,
          currentAccountsCount: currentCount,
          canAddAccount: true,
          customMetricsLimit: 999,
          customMetricsUsed: 0,
          canCreateCustomMetric: true,
          planType: 'elite',
          isLoading: false,
        });
      } else if (planType === 'pro') {
        setAccess({
          hasFeeAnalysis: true,
          connectedAccountsLimit: 999,
          currentAccountsCount: currentCount,
          canAddAccount: true,
          customMetricsLimit: 999,
          customMetricsUsed: 0,
          canCreateCustomMetric: true,
          planType: 'pro',
          isLoading: false,
        });
      } else {
        // Basic/Free tier
        setAccess({
          hasFeeAnalysis: false,
          connectedAccountsLimit: 1,
          currentAccountsCount: currentCount,
          canAddAccount: currentCount < 1,
          customMetricsLimit: 0,
          customMetricsUsed: 0,
          canCreateCustomMetric: false,
          planType: 'basic',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching access:', error);
      setAccess({
        hasFeeAnalysis: false,
        connectedAccountsLimit: 1,
        currentAccountsCount: 0,
        canAddAccount: true,
        customMetricsLimit: 0,
        customMetricsUsed: 0,
        canCreateCustomMetric: false,
        planType: 'basic',
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    fetchAccess();

    // Subscribe to subscription changes
    const channel = supabase
      .channel('subscription-feature-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchAccess();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    ...access,
    refetch: fetchAccess,
  };
};
