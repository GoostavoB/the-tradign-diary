import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useReminderNotifications = () => {
  const { user } = useAuth();
  const notifiedReminders = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || Notification.permission !== 'granted') return;

    const checkReminders = async () => {
      try {
        // Get reminders for next 15 minutes that haven't been notified
        const now = new Date();
        const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);

        const { data: reminders, error } = await supabase
          .from('event_reminders')
          .select('*')
          .eq('user_id', user.id)
          .eq('notified', false)
          .gte('event_time', now.toISOString())
          .lte('event_time', fifteenMinutesLater.toISOString());

        if (error) throw error;

        if (reminders && reminders.length > 0) {
          for (const reminder of reminders) {
            const reminderKey = `${reminder.id}`;
            
            // Check if we already notified for this reminder in this session
            if (notifiedReminders.current.has(reminderKey)) continue;

            const eventTime = new Date(reminder.event_time);
            const timeDiff = eventTime.getTime() - now.getTime();
            const minutesUntil = Math.round(timeDiff / 60000);

            // Only notify if within 10 minutes
            if (minutesUntil <= 10 && minutesUntil >= 0) {
              // Show notification
              const notification = new Notification('Lembrete de Evento Econômico', {
                body: `${reminder.event_name} começa em ${minutesUntil} minuto${minutesUntil !== 1 ? 's' : ''}!\nImpacto: ${reminder.event_impact || 'N/A'}`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: reminderKey,
                requireInteraction: true,
              });

              notification.onclick = () => {
                window.focus();
                notification.close();
              };

              // Mark as notified in our session
              notifiedReminders.current.add(reminderKey);

              // Mark as notified in database
              await supabase
                .from('event_reminders')
                .update({ notified: true })
                .eq('id', reminder.id);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar lembretes:', error);
      }
    };

    // Check immediately
    checkReminders();

    // Then check every 2 minutes
    const interval = setInterval(checkReminders, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
};
