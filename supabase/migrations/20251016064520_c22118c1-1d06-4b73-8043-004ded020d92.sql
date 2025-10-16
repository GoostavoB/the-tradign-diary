-- Add initial_investment to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS initial_investment numeric DEFAULT 0;