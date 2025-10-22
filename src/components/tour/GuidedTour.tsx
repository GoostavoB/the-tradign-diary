import { useEffect, useState } from 'react';
import Joyride, { Step, CallBackProps, STATUS, ACTIONS } from 'react-joyride';
import { useGuidedTour } from '@/hooks/useGuidedTour';
import { toast } from 'sonner';

const tourSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold gradient-text">🎉 Bem-vindo ao Tour Guiado!</h2>
        <p className="text-muted-foreground">
          Vamos mostrar todas as funcionalidades da plataforma para você aproveitar ao máximo!
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard-customization"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">🎨 Personalize seu Dashboard</h3>
        <p>
          Clique aqui para reorganizar os widgets, adicionar novos gráficos e criar uma visualização
          perfeita para o seu estilo de trading!
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme-toggle"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">🌙 Modo Claro/Escuro</h3>
        <p>
          Alterne entre o modo claro e escuro para uma experiência visual confortável em qualquer hora do dia.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="sidebar-menu"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">📊 Menu Principal</h3>
        <p>
          Aqui você encontra todas as seções principais da plataforma:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 mt-2">
          <li><strong>Dashboard:</strong> Visão geral do seu desempenho</li>
          <li><strong>Trade History:</strong> Todos os seus trades registrados</li>
          <li><strong>Analytics:</strong> Análises avançadas e insights</li>
          <li><strong>Upload:</strong> Importe trades com IA</li>
        </ul>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="analytics-section"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">📈 Analytics</h3>
        <p>
          Acesse análises detalhadas do seu desempenho, incluindo:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 mt-2">
          <li>Gráficos de P&L ao longo do tempo</li>
          <li>Win rate por período e ativo</li>
          <li>Análise de drawdown</li>
          <li>Padrões de trading</li>
        </ul>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="market-data"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">📊 Market Data</h3>
        <p>
          Aqui você encontra dados do mercado em tempo real:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 mt-2">
          <li><strong>Long/Short Ratio:</strong> Proporção de posições compradas vs vendidas</li>
          <li><strong>Preços ao vivo:</strong> BTC, ETH e principais altcoins</li>
          <li><strong>Open Interest:</strong> Volume de contratos abertos</li>
          <li><strong>Fear & Greed Index:</strong> Sentimento do mercado</li>
        </ul>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="social-section"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">👥 Social</h3>
        <p>
          Conecte-se com outros traders:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 mt-2">
          <li>Compartilhe suas conquistas</li>
          <li>Veja o leaderboard</li>
          <li>Siga traders de sucesso</li>
          <li>Participe da comunidade</li>
        </ul>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="settings"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">⚙️ Configurações</h3>
        <p>
          Personalize sua experiência:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 mt-2">
          <li>Altere cores e temas</li>
          <li>Configure notificações</li>
          <li>Gerencie sua conta</li>
          <li>Defina preferências de exibição</li>
        </ul>
      </div>
    ),
    placement: 'right',
  },
  {
    target: 'body',
    content: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold gradient-text">🚀 Pronto para começar!</h2>
        <p className="text-muted-foreground">
          Você agora conhece todas as principais funcionalidades da plataforma. 
          Comece a explorar e leve seu trading para o próximo nível!
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          💡 Dica: Você pode sempre rever este tour nas configurações.
        </p>
      </div>
    ),
    placement: 'center',
  },
];

export const GuidedTour = () => {
  const { shouldShowTour, completeTour } = useGuidedTour();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (shouldShowTour) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        setRun(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      completeTour();
      toast.success('Tour concluído! Explore a plataforma à vontade 🎉');
    }

    // If user clicks outside or presses ESC
    if (action === ACTIONS.CLOSE) {
      setRun(false);
      completeTour();
    }
  };

  if (!shouldShowTour) return null;

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      hideCloseButton={false}
      disableOverlayClose={false}
      spotlightPadding={4}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          zIndex: 10000,
        },
        spotlight: {
          borderRadius: 8,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: 8,
          padding: '8px 16px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: 10,
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular Tour',
      }}
      callback={handleJoyrideCallback}
    />
  );
};
