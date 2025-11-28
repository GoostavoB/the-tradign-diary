-- Part 3: user_settings
-- Drop the unique constraint on user_id first
ALTER TABLE public.user_settings 
DROP CONSTRAINT IF EXISTS user_settings_user_id_key;

-- Add sub_account_id column
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS sub_account_id UUID REFERENCES public.sub_accounts(id) ON DELETE CASCADE;

-- Duplicate existing settings for each sub-account
DO $$
DECLARE
  settings_record RECORD;
  sub_acc RECORD;
BEGIN
  FOR settings_record IN SELECT * FROM public.user_settings WHERE sub_account_id IS NULL
  LOOP
    FOR sub_acc IN SELECT id FROM public.sub_accounts WHERE user_id = settings_record.user_id
    LOOP
      INSERT INTO public.user_settings (
        user_id, sub_account_id, accent_color, blur_enabled, crypto_display_mode,
        currency, display_currency, email_notifications, event_reminders,
        guided_tour_completed, initial_investment, language, layout_json,
        monthly_report, onboarding_completed, performance_alerts, risk_base,
        risk_currency, risk_daily_loss_pct, risk_day_pct, risk_max_drawdown,
        risk_percent, risk_position_pct, risk_profile, risk_scalp_pct,
        risk_strategy, risk_swing_pct, sidebar_style, theme,
        trade_reminders, trade_station_layout_json, trading_days_calculation_mode,
        weekly_summary, daily_loss_lock_enabled, daily_loss_percent
      ) VALUES (
        settings_record.user_id, sub_acc.id, settings_record.accent_color,
        settings_record.blur_enabled, settings_record.crypto_display_mode,
        settings_record.currency, settings_record.display_currency,
        settings_record.email_notifications, settings_record.event_reminders,
        settings_record.guided_tour_completed, settings_record.initial_investment,
        settings_record.language, settings_record.layout_json,
        settings_record.monthly_report, settings_record.onboarding_completed,
        settings_record.performance_alerts, settings_record.risk_base,
        settings_record.risk_currency, settings_record.risk_daily_loss_pct,
        settings_record.risk_day_pct, settings_record.risk_max_drawdown,
        settings_record.risk_percent, settings_record.risk_position_pct,
        settings_record.risk_profile, settings_record.risk_scalp_pct,
        settings_record.risk_strategy, settings_record.risk_swing_pct,
        settings_record.sidebar_style, settings_record.theme,
        settings_record.trade_reminders, settings_record.trade_station_layout_json,
        settings_record.trading_days_calculation_mode, settings_record.weekly_summary,
        settings_record.daily_loss_lock_enabled, settings_record.daily_loss_percent
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Delete old records without sub_account_id
DELETE FROM public.user_settings WHERE sub_account_id IS NULL;

-- Make sub_account_id NOT NULL
ALTER TABLE public.user_settings 
ALTER COLUMN sub_account_id SET NOT NULL;

-- Add unique constraint per sub-account
ALTER TABLE public.user_settings 
ADD CONSTRAINT user_settings_sub_account_unique 
UNIQUE (sub_account_id);

-- Add index
CREATE INDEX IF NOT EXISTS idx_user_settings_sub_account_id 
ON public.user_settings(sub_account_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;

CREATE POLICY "Users can manage settings for their sub-accounts"
ON public.user_settings FOR ALL
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.sub_accounts 
    WHERE id = user_settings.sub_account_id 
    AND user_id = auth.uid()
  )
);

COMMENT ON COLUMN public.user_settings.sub_account_id IS 'Links settings (layout, preferences) to specific sub-account';