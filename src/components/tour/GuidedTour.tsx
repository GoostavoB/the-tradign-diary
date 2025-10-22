import { useEffect, useState } from 'react';
import Joyride, { Step, CallBackProps, STATUS, ACTIONS } from 'react-joyride';
import { useGuidedTour, TourMode } from '@/hooks/useGuidedTour';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const fullTourSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-light tracking-wide">Bem-vindo ao Tour Guiado</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Vamos apresentar todas as funcionalidades da plataforma para você aproveitar ao máximo.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard-customization"]',
    content: (
      <div className="space-y-3">
        <h3 className="font-light text-lg tracking-wide text-center">Personalize seu Dashboard</h3>
        <p className="text-sm leading-relaxed text-center">
          Reorganize widgets, adicione novos gráficos e crie uma visualização perfeita para o seu estilo de trading.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme-toggle"]',
    content: (
      <div className="space-y-3">
        <h3 className="font-light text-lg tracking-wide text-center">Modo Claro & Escuro</h3>
        <p className="text-sm leading-relaxed text-center">
          Alterne entre temas e personalize cores para uma experiência visual confortável em qualquer momento.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="sidebar-menu"]',
    content: (
      <div className="space-y-3">
        <h3 className="font-light text-lg tracking-wide text-center">Menu Principal</h3>
        <div className="space-y-2 text-sm">
          <p className="text-center mb-3 text-muted-foreground">Navegue pelas principais seções:</p>
          <div className="space-y-1.5">
            <p><span className="font-medium">Dashboard</span> — Visão geral do desempenho</p>
            <p><span className="font-medium">Trade History</span> — Histórico completo de trades</p>
            <p><span className="font-medium">Analytics</span> — Análises avançadas e insights</p>
            <p><span className="font-medium">Upload</span> — Importação de trades com IA</p>
          </div>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="analytics-section"]',
    content: (
      <div className="space-y-3">
        <h3 className="font-light text-lg tracking-wide text-center">Analytics</h3>
        <div className="space-y-2 text-sm">
          <p className="text-center mb-3 text-muted-foreground">Análises detalhadas do seu desempenho:</p>
          <div className="space-y-1.5">
            <p><span className="font-medium">Performance</span> — Gráficos de P&L e evolução</p>
            <p><span className="font-medium">Statistics</span> — Win rate, drawdown e métricas</p>
            <p><span className="font-medium">Patterns</span> — Padrões e tendências identificadas</p>
            <p><span className="font-medium">Insights</span> — Recomendações baseadas em dados</p>
          </div>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="market-data"]',
    content: (
      <div className="space-y-3">
        <h3 className="font-light text-lg tracking-wide text-center">Market Data</h3>
        <div className="space-y-2 text-sm">
          <p className="text-center mb-3 text-muted-foreground">Dados de mercado em tempo real:</p>
          <div className="space-y-1.5">
            <p><span className="font-medium">Long/Short Ratio</span> — Posições do mercado</p>
            <p><span className="font-medium">Live Prices</span> — BTC, ETH e principais altcoins</p>
            <p><span className="font-medium">Open Interest</span> — Volume de contratos abertos</p>
            <p><span className="font-medium">Fear & Greed</span> — Sentimento do mercado</p>
          </div>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="social-section"]',
    content: (
      <div className="space-y-3">
        <h3 className="font-light text-lg tracking-wide text-center">Community</h3>
        <div className="space-y-2 text-sm">
          <p className="text-center mb-3 text-muted-foreground">Conecte-se com outros traders:</p>
          <div className="space-y-1.5">
            <p><span className="font-medium">Social Feed</span> — Compartilhe conquistas</p>
            <p><span className="font-medium">Leaderboard</span> — Rankings de performance</p>
            <p><span className="font-medium">Following</span> — Siga traders de sucesso</p>
            <p><span className="font-medium">Community</span> — Participe das discussões</p>
          </div>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="settings"]',
    content: (
      <div className="space-y-3">
        <h3 className="font-light text-lg tracking-wide text-center">Configurações</h3>
        <div className="space-y-2 text-sm">
          <p className="text-center mb-3 text-muted-foreground">Personalize sua experiência:</p>
          <div className="space-y-1.5">
            <p><span className="font-medium">Theme</span> — Cores e aparência</p>
            <p><span className="font-medium">Notifications</span> — Alertas e lembretes</p>
            <p><span className="font-medium">Account</span> — Dados e preferências</p>
            <p><span className="font-medium">Display</span> — Layout e visualização</p>
          </div>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: 'body',
    content: (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-light tracking-wide">Pronto para começar</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Você agora conhece todas as principais funcionalidades da plataforma.<br />
          Explore e leve seu trading para o próximo nível.
        </p>
        <p className="text-xs text-muted-foreground/70 mt-6 pt-4 border-t border-border/50">
          Você pode rever este tour a qualquer momento nas configurações.
        </p>
      </div>
    ),
    placement: 'center',
  },
];

export const GuidedTour = () => {
  const { shouldShowTour, tourMode, completeTour } = useGuidedTour();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);

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
        // Load tour steps based on mode
        if (tourMode === 'full' || tourMode === 'manual-full') {
          console.log('📋 Setting full tour steps');
          if (!isCancelled) {
            setSteps(fullTourSteps);
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
              setSteps(fullTourSteps);
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
          setSteps(fullTourSteps);
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
      spotlightPadding={8}
      floaterProps={{
        styles: {
          floater: {
            transition: 'opacity 0.4s ease-in-out, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      }}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          zIndex: 10000,
          arrowColor: 'transparent',
        },
        spotlight: {
          borderRadius: 12,
          border: '1px solid hsl(var(--primary) / 0.3)',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 40px hsl(var(--primary) / 0.3)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(2px)',
          transition: 'all 0.4s ease-in-out',
        },
        tooltip: {
          backgroundColor: 'hsl(var(--background) / 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid hsl(var(--border) / 0.5)',
          borderRadius: 16,
          padding: '24px 28px',
          boxShadow: '0 20px 60px -10px hsl(var(--primary) / 0.2), 0 0 0 1px hsl(var(--primary) / 0.1)',
          maxWidth: 420,
          animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        tooltipContainer: {
          textAlign: 'center',
        },
        tooltipContent: {
          padding: 0,
          color: 'hsl(var(--foreground))',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '14px',
          fontWeight: '400',
          transition: 'all 0.2s ease',
          border: 'none',
          letterSpacing: '0.3px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: 12,
          fontSize: '14px',
          fontWeight: '400',
          padding: '10px 20px',
          borderRadius: 10,
          transition: 'all 0.2s ease',
          letterSpacing: '0.3px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: '13px',
          fontWeight: '400',
          padding: '8px 16px',
          transition: 'all 0.2s ease',
          letterSpacing: '0.3px',
        },
        buttonClose: {
          display: 'none',
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular',
      }}
      callback={handleJoyrideCallback}
    />
  );
};
