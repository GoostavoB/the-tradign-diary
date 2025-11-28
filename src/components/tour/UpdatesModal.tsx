import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGuidedTour } from '@/hooks/useGuidedTour';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface Update {
  version: number;
  title: string;
  description: string;
  changes: {
    improvements?: string[];
    fixes?: string[];
    features?: string[];
  };
}

export const UpdatesModal = () => {
  const { user } = useAuth();
  const { markUpdatesAsSeen } = useGuidedTour();
  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState<Update | null>(null);

  useEffect(() => {
    checkForNewUpdates();
  }, [user]);

  const checkForNewUpdates = async () => {
    if (!user) return;

    try {
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('last_seen_updates_version')
        .eq('user_id', user.id)
        .single();

      const lastSeenVersion = userSettings?.last_seen_updates_version || 0;

      const { data: latestUpdate } = await supabase
        .from('updates_log')
        .select('*')
        .eq('published', true)
        .gt('version', lastSeenVersion)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestUpdate) {
        setUpdate(latestUpdate as Update);
        setOpen(true);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const handleClose = () => {
    if (update) {
      markUpdatesAsSeen(update.version);
    }
    setOpen(false);
  };

  if (!update) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-wide flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            {update.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-muted-foreground leading-relaxed">
            {update.description}
          </p>

          <div className="space-y-4">
            {update.changes.features && update.changes.features.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Novas Funcionalidades
                </h4>
                <ul className="space-y-1 ml-6">
                  {update.changes.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {update.changes.improvements && update.changes.improvements.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Melhorias
                </h4>
                <ul className="space-y-1 ml-6">
                  {update.changes.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {update.changes.fixes && update.changes.fixes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  Correções
                </h4>
                <ul className="space-y-1 ml-6">
                  {update.changes.fixes.map((fix, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleClose} className="px-8">
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
