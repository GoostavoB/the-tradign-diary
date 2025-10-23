import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Upload,
  Download,
  FileText,
  Camera,
  Share2,
  AlertCircle,
  BookOpen,
  Zap
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

export const QuickActionsMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Upload,
      label: t('quickActions.uploadTrades'),
      action: () => navigate('/upload'),
      color: 'text-primary'
    },
    {
      icon: FileText,
      label: t('quickActions.viewReports'),
      action: () => navigate('/reports'),
      color: 'text-blue-500'
    },
    {
      icon: Camera,
      label: t('quickActions.portfolioSnapshot'),
      action: () => navigate('/portfolio'),
      color: 'text-green-500'
    },
    {
      icon: AlertCircle,
      label: t('quickActions.logError'),
      action: () => navigate('/analytics'),
      color: 'text-orange-500'
    },
    {
      icon: BookOpen,
      label: t('quickActions.tradeJournal'),
      action: () => navigate('/journal'),
      color: 'text-purple-500'
    },
    {
      icon: Share2,
      label: t('quickActions.shareResults'),
      action: () => navigate('/settings'),
      color: 'text-pink-500'
    },
    {
      icon: Download,
      label: t('quickActions.exportData'),
      action: () => navigate('/exports'),
      color: 'text-cyan-500'
    }
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        >
          <Zap className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">
          {t('quickActions.title')}
        </div>
        <DropdownMenuSeparator />
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => {
                action.action();
                setIsOpen(false);
              }}
              className="gap-2 cursor-pointer"
            >
              <Icon className={`h-4 w-4 ${action.color}`} />
              <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
