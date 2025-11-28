import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LSRAlert {
  id: string;
  user_id: string;
  alert_id: string;
  symbol: string;
  alert_type: 'rapid_change' | 'cross_below_1' | 'cross_above_1';
  ratio_value: number;
  previous_value: number;
  change_percentage: number;
  direction: 'up' | 'down';
  long_account: number;
  short_account: number;
  triggered_at: string;
  notified: boolean;
}

export const useLSRNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications Not Supported', {
        description: 'Your browser doesn\'t support push notifications. Please try Chrome, Firefox, or Safari.',
      });
      return false;
    }

    // Check if already granted (e.g., from browser settings)
    if (Notification.permission === 'granted') {
      setPermission('granted');
      toast.success('Notifications Already Enabled! 🔔', {
        description: 'You\'re all set to receive real-time LSR alerts.',
      });
      return true;
    }

    // Check if blocked - need to reset in browser
    if (Notification.permission === 'denied') {
      toast.error('Notifications Blocked in Browser', {
        description: 'To enable:\n1. Click the lock/info icon (🔒) in your address bar\n2. Find "Notifications" and change to "Allow"\n3. Refresh this page\n4. Click "Enable Alerts" again',
        duration: 10000,
        action: {
          label: 'Refresh Page',
          onClick: () => window.location.reload(),
        },
      });
      return false;
    }

    // Request permission (first time)
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Notifications Enabled! 🔔', {
          description: 'You\'ll now receive real-time LSR alerts. Configure your preferences below.',
        });
        return true;
      } else if (result === 'denied') {
        toast.error('Notifications Blocked', {
          description: 'You clicked "Block". To enable later:\n1. Click the lock icon (🔒) in your address bar\n2. Change Notifications to "Allow"\n3. Refresh this page',
          duration: 10000,
        });
        return false;
      } else {
        toast('Permission Dismissed', {
          description: 'Click "Enable Alerts" again when you\'re ready.',
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Permission Request Failed', {
        description: 'Please try refreshing the page and enabling notifications again.',
      });
      return false;
    }
  };

  useEffect(() => {
    if (!user || permission !== 'granted') return;

    console.log('Setting up LSR notification listener...');

    const channel = supabase
      .channel('lsr-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lsr_alert_history',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const alert = payload.new as LSRAlert;
          await showLSRNotification(alert);
          await markAsNotified(alert.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, permission]);

  const showLSRNotification = async (alert: LSRAlert) => {
    if (permission !== 'granted') return;

    const icon = getAlertIcon(alert);
    const title = `${icon} LSR Alert: ${alert.symbol}`;
    const body = getNotificationBody(alert);

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: `lsr-${alert.id}`,
        requireInteraction: true,
        data: { alertId: alert.id, symbol: alert.symbol },
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = `/market-data?symbol=${alert.symbol}`;
        markAsClicked(alert.id);
        notification.close();
      };

      // Also show toast notification
      toast(title, {
        description: body,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = `/market-data?symbol=${alert.symbol}`;
            markAsClicked(alert.id);
          },
        },
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const getAlertIcon = (alert: LSRAlert): string => {
    if (alert.alert_type === 'rapid_change') {
      return alert.direction === 'up' ? '📈' : '📉';
    }
    return alert.alert_type === 'cross_below_1' ? '📉' : '📈';
  };

  const getNotificationBody = (alert: LSRAlert): string => {
    switch (alert.alert_type) {
      case 'rapid_change':
        return `Rapid ${alert.direction === 'up' ? 'increase' : 'decrease'} detected!\nRatio: ${alert.ratio_value.toFixed(2)} (${alert.change_percentage > 0 ? '+' : ''}${alert.change_percentage.toFixed(1)}%)`;
      case 'cross_below_1':
        return `Market sentiment turned bearish!\nLong/Short Ratio dropped to ${alert.ratio_value.toFixed(2)} (more shorts)`;
      case 'cross_above_1':
        return `Market sentiment turned bullish!\nLong/Short Ratio rose to ${alert.ratio_value.toFixed(2)} (more longs)`;
      default:
        return `LSR Alert for ${alert.symbol}`;
    }
  };

  const markAsNotified = async (alertId: string) => {
    await supabase
      .from('lsr_alert_history')
      .update({
        notified: true,
        notification_sent_at: new Date().toISOString(),
      })
      .eq('id', alertId);
  };

  const markAsClicked = async (alertId: string) => {
    await supabase
      .from('lsr_alert_history')
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    // Increment clicked count in daily stats
    if (user) {
      const { data: stats } = await supabase
        .from('lsr_alert_daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('stat_date', new Date().toISOString().split('T')[0])
        .single();

      if (stats) {
        await supabase
          .from('lsr_alert_daily_stats')
          .update({ alerts_clicked: (stats.alerts_clicked || 0) + 1 })
          .eq('id', stats.id);
      }
    }
  };

  return {
    permission,
    requestPermission,
    isEnabled: permission === 'granted',
  };
};
