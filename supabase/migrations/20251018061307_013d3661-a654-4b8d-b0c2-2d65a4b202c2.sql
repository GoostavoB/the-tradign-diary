-- Add accent_color column to user_settings if it doesn't exist
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#3B82F6';

-- Update existing records to have the default accent color
UPDATE public.user_settings 
SET accent_color = '#3B82F6' 
WHERE accent_color IS NULL;