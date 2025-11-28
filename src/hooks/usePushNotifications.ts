import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const { user } = useAuth();

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!user) return;

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        toast.error('Notification permission denied');
        return;
      }

      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Subscribe to push notifications (placeholder - would need VAPID keys for real implementation)
        const subscription = {
          endpoint: 'placeholder',
          keys: {
            p256dh: 'placeholder',
            auth: 'placeholder',
          },
        };

        // Store subscription in database
        await supabase
          .from('browser_notifications')
          .upsert({
            user_id: user.id,
            push_subscription: subscription,
          });

        toast.success('Notifications enabled!');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Failed to enable notifications');
    }
  }, [user, requestPermission]);

  const sendNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo-192.png',
        badge: '/logo-192.png',
      });
    }
  }, []);

  return {
    requestPermission,
    subscribeToPush,
    sendNotification,
  };
};
