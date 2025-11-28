-- Add notification preference columns to user_settings table
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS trade_reminders boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS weekly_summary boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS monthly_report boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS performance_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS event_reminders boolean DEFAULT true;

-- Add comment
COMMENT ON COLUMN public.user_settings.email_notifications IS 'Master switch for all email notifications';
COMMENT ON COLUMN public.user_settings.trade_reminders IS 'Daily reminders to log trades';
COMMENT ON COLUMN public.user_settings.weekly_summary IS 'Weekly performance summary emails';
COMMENT ON COLUMN public.user_settings.monthly_report IS 'Monthly detailed reports';
COMMENT ON COLUMN public.user_settings.performance_alerts IS 'Alerts for significant performance changes';
COMMENT ON COLUMN public.user_settings.event_reminders IS 'Economic calendar event notifications';