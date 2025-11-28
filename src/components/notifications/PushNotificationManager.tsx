import { useState, useEffect } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  tradeAlerts: boolean;
  priceAlerts: boolean;
  newsAlerts: boolean;
  achievementAlerts: boolean;
}

export function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    tradeAlerts: true,
    priceAlerts: true,
    newsAlerts: false,
    achievementAlerts: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not supported',
        description: 'Push notifications are not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        setIsSubscribed(true);
        toast({
          title: 'Notifications enabled!',
          description: 'You will now receive push notifications.',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable notifications.',
        variant: 'destructive',
      });
    }
  };

  const disableNotifications = async () => {
    setIsSubscribed(false);
    toast({
      title: 'Notifications disabled',
      description: 'You will no longer receive push notifications.',
    });
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  return (
    <PremiumCard className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Push Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Get notified about important trading events
          </p>
        </div>
        {permission === 'granted' && isSubscribed ? (
          <Bell className="h-5 w-5 text-primary" />
        ) : (
          <BellOff className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {permission === 'default' && (
        <Button onClick={requestPermission} className="w-full">
          <Bell className="mr-2 h-4 w-4" />
          Enable Push Notifications
        </Button>
      )}

      {permission === 'denied' && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}

      {permission === 'granted' && isSubscribed && (
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="trade-alerts" className="flex flex-col gap-1">
                <span>Trade Alerts</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Notifications when trades are executed
                </span>
              </Label>
              <Switch
                id="trade-alerts"
                checked={settings.tradeAlerts}
                onCheckedChange={(checked) => updateSetting('tradeAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="price-alerts" className="flex flex-col gap-1">
                <span>Price Alerts</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Notifications for price target hits
                </span>
              </Label>
              <Switch
                id="price-alerts"
                checked={settings.priceAlerts}
                onCheckedChange={(checked) => updateSetting('priceAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="news-alerts" className="flex flex-col gap-1">
                <span>News Alerts</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Market news and updates
                </span>
              </Label>
              <Switch
                id="news-alerts"
                checked={settings.newsAlerts}
                onCheckedChange={(checked) => updateSetting('newsAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="achievement-alerts" className="flex flex-col gap-1">
                <span>Achievement Alerts</span>
                <span className="text-xs text-muted-foreground font-normal">
                  New badges and milestones
                </span>
              </Label>
              <Switch
                id="achievement-alerts"
                checked={settings.achievementAlerts}
                onCheckedChange={(checked) => updateSetting('achievementAlerts', checked)}
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={disableNotifications}
            className="w-full"
          >
            <BellOff className="mr-2 h-4 w-4" />
            Disable All Notifications
          </Button>
        </>
      )}
    </PremiumCard>
  );
}
