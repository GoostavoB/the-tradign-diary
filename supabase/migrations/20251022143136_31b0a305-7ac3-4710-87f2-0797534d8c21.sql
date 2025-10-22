-- Add column to track if user completed the guided tour after first trade upload
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS guided_tour_completed BOOLEAN DEFAULT FALSE;