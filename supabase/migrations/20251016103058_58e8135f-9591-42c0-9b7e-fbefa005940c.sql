-- Create event reminders table
CREATE TABLE IF NOT EXISTS public.event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_time TIMESTAMP WITH TIME ZONE NOT NULL,
  event_category TEXT,
  event_impact TEXT,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, event_name, event_time)
);

-- Enable RLS
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own reminders"
  ON public.event_reminders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders"
  ON public.event_reminders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON public.event_reminders
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON public.event_reminders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_event_reminders_user_time ON public.event_reminders(user_id, event_time);
CREATE INDEX idx_event_reminders_notified ON public.event_reminders(notified, event_time) WHERE notified = false;