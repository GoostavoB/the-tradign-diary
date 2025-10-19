import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { Card } from '@/components/ui/card';

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['Alt', 'D'], description: 'Go to Dashboard' },
      { keys: ['Alt', 'U'], description: 'Go to Upload' },
      { keys: ['Alt', 'F'], description: 'Go to Forecast' },
      { keys: ['Alt', 'A'], description: 'Go to Analytics' },
      { keys: ['Alt', 'T'], description: 'Go to Tools' },
      { keys: ['Alt', 'H'], description: 'Go to Home' },
      { keys: ['Alt', 'S'], description: 'Go to Settings' },
    ],
  },
  {
    category: 'Dashboard Actions',
    items: [
      { keys: ['N'], description: 'Add new trade' },
      { keys: ['E'], description: 'Export trades' },
      { keys: ['C'], description: 'Customize dashboard' },
      { keys: ['Tab'], description: 'Navigate between sections' },
    ],
  },
  {
    category: 'AI Assistant',
    items: [
      { keys: ['Alt', 'I'], description: 'Open AI Assistant' },
      { keys: ['Ctrl', 'Enter'], description: 'Send message (in chat)' },
    ],
  },
  {
    category: 'General',
    items: [
      { keys: ['Shift', '?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close dialogs/modals' },
      { keys: ['Ctrl', 'K'], description: 'Focus search' },
      { keys: ['Ctrl', '/'], description: 'Toggle sidebar' },
    ],
  },
];

export const KeyboardShortcutsHelp = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Keyboard Shortcuts (Shift + ?)">
          <Keyboard className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <Card
                    key={index}
                    className="p-3 bg-muted/30 border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-2 py-1 text-xs font-semibold bg-card border border-border rounded shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-semibold">Shift</kbd> +{' '}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-semibold">?</kbd> anytime to view this help
        </div>
      </DialogContent>
    </Dialog>
  );
};
