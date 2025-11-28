import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { tradeStationEvents } from '@/utils/tradeStationEvents';

export interface PreFlightCheck {
  spxChecked: boolean;
  spxTrend?: string;
  lsrReviewed: boolean;
  lsrValue?: number;
  errorsReviewed: boolean;
  calendarChecked: boolean;
}

export const usePreFlight = () => {
  const { user } = useAuth();
  const [checks, setChecks] = useState<PreFlightCheck>({
    spxChecked: false,
    lsrReviewed: false,
    errorsReviewed: false,
    calendarChecked: false,
  });
  const [bypassedToday, setBypassedToday] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    if (user) {
      checkTodaySession();
    }
  }, [user]);

  const checkTodaySession = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      const { data } = await supabase
        .from('trading_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('session_date', today)
        .order('session_date', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setSessionStarted(true);
        setBypassedToday(data.preflight_bypassed || false);
      }
    } catch (error) {
      // No session today
    }
  };

  const updateCheck = (key: keyof PreFlightCheck, value: any) => {
    setChecks(prev => ({ ...prev, [key]: value }));
  };

  const allChecksComplete = (): boolean => {
    return (
      checks.spxChecked &&
      checks.lsrReviewed &&
      checks.errorsReviewed &&
      checks.calendarChecked
    );
  };

  const startSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trading_sessions')
        .insert({
          user_id: user.id,
          session_date: new Date().toISOString(),
          spx_trend: checks.spxTrend,
          lsr_value: checks.lsrValue,
          preflight_completed: true,
          preflight_bypassed: false,
        })
        .select()
        .single();

      if (error) throw error;

      setSessionStarted(true);
      tradeStationEvents.emit({
        type: 'preflight:completed',
        payload: { sessionId: data.id, timestamp: new Date(data.session_date) },
      });
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  };

  const bypassToday = async () => {
    if (!user) return;

    try {
      await supabase
        .from('trading_sessions')
        .insert({
          user_id: user.id,
          session_date: new Date().toISOString(),
          preflight_bypassed: true,
          preflight_completed: false,
        });

      setBypassedToday(true);
      setSessionStarted(true);

      tradeStationEvents.emit({
        type: 'preflight:bypassed',
        payload: { date: new Date().toISOString().split('T')[0] },
      });
    } catch (error) {
      console.error('Error bypassing preflight:', error);
    }
  };

  return {
    checks,
    updateCheck,
    allChecksComplete,
    startSession,
    bypassToday,
    sessionStarted,
    bypassedToday,
    reload: checkTodaySession,
  };
};
