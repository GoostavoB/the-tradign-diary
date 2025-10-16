import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [reminders, setReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    if (user) {
      fetchReminders();
    }
  }, [user]);

  const fetchReminders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('event_reminders')
      .select('event_name, event_time')
      .eq('user_id', user.id);

    if (!error && data) {
      const reminderKeys = new Set(
        data.map(r => `${r.event_name}-${r.event_time}`)
      );
      setReminders(reminderKeys);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Este navegador não suporta notificações');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notificações ativadas!');
        return true;
      } else if (result === 'denied') {
        toast.error('Você negou as notificações. Ative nas configurações do navegador.');
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao solicitar permissão para notificações');
      return false;
    }
    return false;
  };

  const addReminder = async (
    eventName: string,
    eventTime: Date,
    eventCategory?: string,
    eventImpact?: string
  ) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return false;
    }

    // Check permission first
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      const { error } = await supabase
        .from('event_reminders')
        .insert({
          user_id: user.id,
          event_name: eventName,
          event_time: eventTime.toISOString(),
          event_category: eventCategory,
          event_impact: eventImpact,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('Você já tem um lembrete para este evento');
        } else {
          throw error;
        }
        return false;
      }

      const reminderKey = `${eventName}-${eventTime.toISOString()}`;
      setReminders(prev => new Set(prev).add(reminderKey));
      toast.success('Lembrete adicionado! Você receberá uma notificação 10 minutos antes.');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar lembrete:', error);
      toast.error('Erro ao adicionar lembrete');
      return false;
    }
  };

  const removeReminder = async (eventName: string, eventTime: Date) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('event_reminders')
        .delete()
        .eq('user_id', user.id)
        .eq('event_name', eventName)
        .eq('event_time', eventTime.toISOString());

      if (error) throw error;

      const reminderKey = `${eventName}-${eventTime.toISOString()}`;
      setReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(reminderKey);
        return newSet;
      });
      
      toast.success('Lembrete removido');
      return true;
    } catch (error) {
      console.error('Erro ao remover lembrete:', error);
      toast.error('Erro ao remover lembrete');
      return false;
    }
  };

  const hasReminder = (eventName: string, eventTime: Date) => {
    const reminderKey = `${eventName}-${eventTime.toISOString()}`;
    return reminders.has(reminderKey);
  };

  return {
    permission,
    requestPermission,
    addReminder,
    removeReminder,
    hasReminder,
  };
};
