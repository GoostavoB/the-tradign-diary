import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
}

export const useKeyboardShortcuts = (enabled: boolean = true) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    const shortcuts: ShortcutConfig[] = [
      // Navigation shortcuts
      {
        key: 'd',
        altKey: true,
        description: 'Go to Dashboard',
        action: () => navigate('/dashboard'),
      },
      {
        key: 'u',
        altKey: true,
        description: 'Go to Upload',
        action: () => navigate('/upload'),
      },
      {
        key: 'f',
        altKey: true,
        description: 'Go to Forecast',
        action: () => navigate('/forecast'),
      },
      {
        key: 'h',
        altKey: true,
        description: 'Go to Home',
        action: () => navigate('/'),
      },
      {
        key: 's',
        altKey: true,
        description: 'Go to Settings',
        action: () => navigate('/settings'),
      },
      // Help shortcut
      {
        key: '?',
        shiftKey: true,
        description: 'Show keyboard shortcuts',
        action: () => {
          const shortcutsList = [
            'Alt + D: Dashboard',
            'Alt + U: Upload',
            'Alt + F: Forecast',
            'Alt + H: Home',
            'Alt + S: Settings',
            'Shift + ?: Show this help',
          ].join('\n');
          
          toast.info('Keyboard Shortcuts', {
            description: shortcutsList,
            duration: 5000,
          });
        },
      },
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const shortcut = shortcuts.find((s) => {
        return (
          s.key.toLowerCase() === event.key.toLowerCase() &&
          (s.ctrlKey === undefined || s.ctrlKey === event.ctrlKey) &&
          (s.altKey === undefined || s.altKey === event.altKey) &&
          (s.shiftKey === undefined || s.shiftKey === event.shiftKey)
        );
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, navigate]);
};
