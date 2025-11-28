import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface PortfolioSettingsProps {
  settings: {
    base_currency: string;
    cost_method: string;
    blur_sensitive: boolean;
    category_split_mode: boolean;
  };
  onSettingsChange: () => void;
}

export const PortfolioSettings = ({ settings, onSettingsChange }: PortfolioSettingsProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (field: keyof typeof settings, value: boolean) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('portfolio_settings')
        .update({ [field]: value })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Settings updated',
        description: 'Your portfolio settings have been saved.',
      });

      onSettingsChange();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Portfolio Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="blur-sensitive">Blur Sensitive Data</Label>
              <p className="text-sm text-muted-foreground">
                Hide values and amounts for privacy
              </p>
            </div>
            <Switch
              id="blur-sensitive"
              checked={settings.blur_sensitive}
              onCheckedChange={(value) => handleToggle('blur_sensitive', value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="category-split">Split Categories</Label>
              <p className="text-sm text-muted-foreground">
                Distribute assets across all their categories
              </p>
            </div>
            <Switch
              id="category-split"
              checked={settings.category_split_mode}
              onCheckedChange={(value) => handleToggle('category_split_mode', value)}
              disabled={loading}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Currency:</span>
                <span className="font-medium">{settings.base_currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cost Method:</span>
                <span className="font-medium">{settings.cost_method}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
