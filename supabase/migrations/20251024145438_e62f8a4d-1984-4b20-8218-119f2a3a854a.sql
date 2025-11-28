-- Create table to track lesson learned popup confirmations
CREATE TABLE IF NOT EXISTS public.lesson_learned_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shown_date date NOT NULL DEFAULT CURRENT_DATE,
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  hold_duration_seconds numeric NOT NULL,
  errors_shown jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, shown_date)
);

-- Enable RLS
ALTER TABLE public.lesson_learned_log ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own lesson logs"
  ON public.lesson_learned_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lesson logs"
  ON public.lesson_learned_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE public.lesson_learned_log IS 'Tracks when users acknowledge daily lesson learned popups';
COMMENT ON COLUMN public.lesson_learned_log.hold_duration_seconds IS 'How long user held the button (should be ~5 seconds)';
COMMENT ON COLUMN public.lesson_learned_log.errors_shown IS 'Array of error tags that were shown in this lesson';