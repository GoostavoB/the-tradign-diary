import { useEffect, useState } from 'react';
import Joyride, { Step, CallBackProps, STATUS, ACTIONS } from 'react-joyride';
import { useGuidedTour, TourMode } from '@/hooks/useGuidedTour';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

const createTourSteps = (t: any): Step[] => [
  {
    target: 'body',
    content: (
      <div className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-center">
          {t('tour.welcome.title')}
        </h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed text-center">
          {t('tour.welcome.description')}
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard-customization"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.dashboardCustomization.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.dashboardCustomization.description')}
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme-toggle"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.themeToggle.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.themeToggle.description')}
        </p>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.themeToggle.subtitle')}
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="portfolio-group"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.portfolioGroup.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.portfolioGroup.description')}
        </p>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p><span className="font-bold text-foreground">Spot Wallet</span> — {t('tour.portfolioGroup.spotWallet')}</p>
          
          <p><span className="font-bold text-foreground">Exchanges</span> — {t('tour.portfolioGroup.exchanges')}</p>
          
          <p><span className="font-bold text-foreground">Trading Accounts</span> — {t('tour.portfolioGroup.tradingAccounts')}</p>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="trades-group"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.tradesGroup.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.tradesGroup.description')}
        </p>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p><span className="font-bold text-foreground">Adicionar Trade</span> — {t('tour.tradesGroup.addTrade')}</p>
          
          <p><span className="font-bold text-foreground">Trade Analysis</span> — {t('tour.tradesGroup.tradeAnalysis')}</p>
          
          <p><span className="font-bold text-foreground">Fee Analysis</span> — {t('tour.tradesGroup.feeAnalysis')}</p>
          
          <p><span className="font-bold text-foreground">Risk Management</span> — {t('tour.tradesGroup.riskManagement')}</p>
          
          <p><span className="font-bold text-foreground">Trading Journal</span> — {t('tour.tradesGroup.tradingJournal')}</p>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="analytics-group"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.analyticsGroup.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.analyticsGroup.description')}
        </p>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p><span className="font-bold text-foreground">Market Data</span> — {t('tour.analyticsGroup.marketData')}</p>
          
          <p><span className="font-bold text-foreground">Forecast</span> — {t('tour.analyticsGroup.forecast')}</p>
          
          <p><span className="font-bold text-foreground">Economic Calendar</span> — {t('tour.analyticsGroup.economicCalendar')}</p>
          
          <p><span className="font-bold text-foreground">Performance Alerts</span> — {t('tour.analyticsGroup.performanceAlerts')}</p>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="planning-group"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.planningGroup.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.planningGroup.description')}
        </p>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p><span className="font-bold text-foreground">Trading Plan</span> — {t('tour.planningGroup.tradingPlan')}</p>
          
          <p><span className="font-bold text-foreground">Goals</span> — {t('tour.planningGroup.goals')}</p>
          
          <p><span className="font-bold text-foreground">Psychology</span> — {t('tour.planningGroup.psychology')}</p>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="reports-group"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.reportsGroup.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.reportsGroup.description')}
        </p>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p><span className="font-bold text-foreground">Reports</span> — {t('tour.reportsGroup.reports')}</p>
          
          <p><span className="font-bold text-foreground">Tax Reports</span> — {t('tour.reportsGroup.taxReports')}</p>
          
          <p><span className="font-bold text-foreground">My Metrics</span> — {t('tour.reportsGroup.myMetrics')}</p>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="community-group"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.communityGroup.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.communityGroup.description')}
        </p>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p><span className="font-bold text-foreground">Social</span> — {t('tour.communityGroup.social')}</p>
          
          <p><span className="font-bold text-foreground">Leaderboard</span> — {t('tour.communityGroup.leaderboard')}</p>
          
          <p><span className="font-bold text-foreground">Achievements</span> — {t('tour.communityGroup.achievements')}</p>
          
          <p><span className="font-bold text-foreground">Progress XP</span> — {t('tour.communityGroup.progressXP')}</p>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="user-guide"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.userGuide.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.userGuide.description')}
        </p>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.userGuide.subtitle')}
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="market-data-widget"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.marketDataWidget.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.marketDataWidget.description')}
        </p>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p><span className="font-bold text-foreground">Long/Short Ratio</span> — {t('tour.marketDataWidget.longShortRatio')}</p>
          
          <p><span className="font-bold text-foreground">Live Prices</span> — {t('tour.marketDataWidget.livePrices')}</p>
          
          <p><span className="font-bold text-foreground">Open Interest</span> — {t('tour.marketDataWidget.openInterest')}</p>
          
          <p><span className="font-bold text-foreground">Fear & Greed Index</span> — {t('tour.marketDataWidget.fearGreedIndex')}</p>
        </div>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '[data-tour="live-prices"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.livePrices.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.livePrices.description')}
        </p>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.livePrices.subtitle')}
        </p>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '[data-tour="settings-capital"]',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{t('tour.settingsCapital.title')}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.settingsCapital.description')}
        </p>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t('tour.settingsCapital.subtitle')}
        </p>
      </div>
    ),
    placement: 'left',
  },
  {
    target: 'body',
    content: (
      <div className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-center">
          {t('tour.finish.title')}
        </h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed text-center">
          {t('tour.finish.description')}
        </p>
        <p className="text-[15px] text-muted-foreground leading-relaxed text-center">
          {t('tour.finish.subtitle')}
        </p>
        <p className="text-[13px] text-muted-foreground/70 mt-6 pt-5 border-t border-border/30 text-center leading-relaxed">
          {t('tour.finish.footer')}
        </p>
      </div>
    ),
    placement: 'center',
  },
];

export const GuidedTour = () => {
  const { shouldShowTour, tourMode, completeTour } = useGuidedTour();
  const { t, i18n } = useTranslation();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    console.log('🎯 GuidedTour useEffect triggered:', { shouldShowTour, tourMode, isLoadingSteps });
    
    if (shouldShowTour && !isLoadingSteps) {
      console.log('✅ Starting tour load...');
      setIsLoadingSteps(true);
      const cleanup = loadTourSteps();
      return () => {
        if (cleanup) cleanup();
      };
    } else if (!shouldShowTour) {
      console.log('❌ Tour should not show, resetting run state');
      setRun(false);
      setIsLoadingSteps(false);
    }
  }, [shouldShowTour, tourMode]);

  const loadTourSteps = () => {
    console.log('🔄 Loading tour steps for mode:', tourMode);
    let isCancelled = false;
    
    const load = async () => {
      try {
        const tourSteps = createTourSteps(t);
        
        // Load tour steps based on mode
        if (tourMode === 'full' || tourMode === 'manual-full') {
          console.log('📋 Setting full tour steps');
          if (!isCancelled) {
            setSteps(tourSteps);
          }
          
          // Get latest full tour version
          const { data } = await supabase
            .from('tour_versions')
            .select('version')
            .eq('type', 'full')
            .eq('active', true)
            .order('version', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (!isCancelled) {
            setCurrentVersion(data?.version || 1);
          }
        } else if (tourMode === 'updates' || tourMode === 'manual-updates') {
          // Load update-specific steps
          const { data } = await supabase
            .from('tour_versions')
            .select('version, steps')
            .eq('type', 'update')
            .eq('active', true)
            .order('version', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!isCancelled) {
            if (data && data.steps && Array.isArray(data.steps)) {
              setSteps(data.steps as unknown as Step[]);
              setCurrentVersion(data.version);
            } else {
              setSteps(tourSteps);
            }
          }
        }

        // Small delay to ensure DOM is fully rendered
        const timer = setTimeout(() => {
          if (!isCancelled) {
            console.log('▶️ Starting tour run');
            setRun(true);
            setIsLoadingSteps(false);
          }
        }, 800);
        
        return () => {
          clearTimeout(timer);
          isCancelled = true;
        };
      } catch (error) {
        console.error('Error loading tour steps:', error);
        if (!isCancelled) {
          setSteps(createTourSteps(t));
          setRun(true);
          setIsLoadingSteps(false);
        }
      }
    };
    
    load();
    
    return () => {
      isCancelled = true;
    };
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    
    console.log('🎮 Joyride callback:', { status, action, step: data.index });

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      console.log('🏁 Tour finished or skipped');
      setRun(false);
      setIsLoadingSteps(false);
      completeTour(currentVersion);
      
      const message = tourMode.includes('updates') 
        ? 'Novidades visualizadas' 
        : 'Tour concluído';
      toast.success(message);
    }

    // If user clicks outside or presses ESC
    if (action === ACTIONS.CLOSE) {
      console.log('❌ Tour closed by user');
      setRun(false);
      setIsLoadingSteps(false);
      completeTour(currentVersion);
    }
  };

  console.log('🎬 GuidedTour render:', { shouldShowTour, run, stepsCount: steps.length });
  
  if (!shouldShowTour) {
    console.log('⏸️ Tour should not show, returning null');
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      hideCloseButton={false}
      disableOverlayClose={false}
      spotlightPadding={12}
      disableScrolling={false}
      scrollOffset={100}
      floaterProps={{
        disableAnimation: false,
        styles: {
          floater: {
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          arrow: {
            length: 8,
            spread: 12,
          },
        },
      }}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          zIndex: 10000,
          arrowColor: 'hsl(var(--background) / 0.95)',
        },
        spotlight: {
          borderRadius: 16,
          border: '2px solid hsl(var(--primary) / 0.4)',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3), 0 0 60px hsl(var(--primary) / 0.5), inset 0 0 20px hsl(var(--primary) / 0.1)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        tooltip: {
          backgroundColor: 'hsl(var(--background) / 0.95)',
          backdropFilter: 'blur(24px) saturate(200%)',
          border: '1.5px solid hsl(var(--border) / 0.6)',
          borderRadius: 20,
          padding: '32px 36px',
          boxShadow: `
            0 24px 72px -12px hsl(var(--primary) / 0.25),
            0 0 0 1px hsl(var(--primary) / 0.15),
            inset 0 1px 0 0 hsl(var(--background) / 0.8),
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)
          `,
          maxWidth: 440,
          minWidth: 320,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          direction: isRTL ? 'rtl' : 'ltr',
          textAlign: isRTL ? 'right' : 'left',
        },
        tooltipContainer: {
          textAlign: 'left',
          lineHeight: '1.7',
        },
        tooltipContent: {
          padding: 0,
          color: 'hsl(var(--foreground))',
          fontSize: '15px',
          fontWeight: '400',
          letterSpacing: '0.01em',
        },
        tooltipTitle: {
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          lineHeight: '1.4',
          letterSpacing: '-0.01em',
        },
        tooltipFooter: {
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid hsl(var(--border) / 0.3)',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: 12,
          padding: '12px 28px',
          fontSize: '14.5px',
          fontWeight: '500',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: 'none',
          letterSpacing: '0.02em',
          boxShadow: '0 4px 12px hsl(var(--primary) / 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
          outline: 'none',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          backgroundColor: 'hsl(var(--muted) / 0.5)',
          marginRight: 12,
          fontSize: '14.5px',
          fontWeight: '500',
          padding: '12px 24px',
          borderRadius: 12,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          letterSpacing: '0.02em',
          border: '1px solid hsl(var(--border) / 0.3)',
          outline: 'none',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: '13.5px',
          fontWeight: '500',
          padding: '10px 18px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          letterSpacing: '0.02em',
          outline: 'none',
        },
        buttonClose: {
          display: 'none',
        },
      }}
      locale={{
        back: t('tour.locale.back'),
        close: t('tour.locale.close'),
        last: t('tour.locale.last'),
        next: t('tour.locale.next'),
        skip: t('tour.locale.skip'),
      }}
      callback={handleJoyrideCallback}
    />
  );
};
