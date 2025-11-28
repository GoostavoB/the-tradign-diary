-- Phase 1: Trade Station Schema

-- Add new columns to user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS risk_strategy TEXT DEFAULT 'day' CHECK (risk_strategy IN ('scalp', 'day', 'swing', 'position')),
ADD COLUMN IF NOT EXISTS risk_base TEXT DEFAULT 'equity' CHECK (risk_base IN ('initial', 'equity', 'profit')),
ADD COLUMN IF NOT EXISTS risk_percent DECIMAL(5,2) DEFAULT 1.0 CHECK (risk_percent >= 0 AND risk_percent <= 20),
ADD COLUMN IF NOT EXISTS daily_loss_percent DECIMAL(5,2) DEFAULT 2.0 CHECK (daily_loss_percent >= 0 AND daily_loss_percent <= 100),
ADD COLUMN IF NOT EXISTS error_daily_reminder BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS error_reminder_paused_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_clean_sheet_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS error_pnl_prompt_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS error_pnl_threshold_value DECIMAL(10,2) DEFAULT 100,
ADD COLUMN IF NOT EXISTS error_pnl_threshold_type TEXT DEFAULT 'value' CHECK (error_pnl_threshold_type IN ('value', 'percent')),
ADD COLUMN IF NOT EXISTS preflight_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preflight_calendar_url TEXT,
ADD COLUMN IF NOT EXISTS daily_loss_lock_enabled BOOLEAN DEFAULT false;

-- Create user_errors table
CREATE TABLE IF NOT EXISTS public.user_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  error_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for user_errors
CREATE INDEX IF NOT EXISTS idx_user_errors_user_id ON public.user_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_errors_status ON public.user_errors(status);
CREATE INDEX IF NOT EXISTS idx_user_errors_expires_at ON public.user_errors(expires_at);

-- RLS policies for user_errors
ALTER TABLE public.user_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own errors"
  ON public.user_errors
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own errors"
  ON public.user_errors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own errors"
  ON public.user_errors
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own errors"
  ON public.user_errors
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trading_sessions table
CREATE TABLE IF NOT EXISTS public.trading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  spx_checked BOOLEAN DEFAULT false,
  spx_trend TEXT,
  lsr_reviewed BOOLEAN DEFAULT false,
  lsr_value DECIMAL(10,2),
  errors_reviewed BOOLEAN DEFAULT false,
  calendar_checked BOOLEAN DEFAULT false,
  bypassed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for trading_sessions
CREATE INDEX IF NOT EXISTS idx_trading_sessions_user_id ON public.trading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_sessions_session_date ON public.trading_sessions(session_date);

-- RLS policies for trading_sessions
ALTER TABLE public.trading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.trading_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.trading_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.trading_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create daily_loss_events table
CREATE TABLE IF NOT EXISTS public.daily_loss_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  loss_limit DECIMAL(10,2) NOT NULL,
  actual_loss DECIMAL(10,2) NOT NULL,
  override_used BOOLEAN DEFAULT false,
  override_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for daily_loss_events
CREATE INDEX IF NOT EXISTS idx_daily_loss_events_user_id ON public.daily_loss_events(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_loss_events_event_date ON public.daily_loss_events(event_date);

-- RLS policies for daily_loss_events
ALTER TABLE public.daily_loss_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loss events"
  ON public.daily_loss_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loss events"
  ON public.daily_loss_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
