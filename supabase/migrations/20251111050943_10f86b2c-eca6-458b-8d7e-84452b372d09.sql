-- Create themes table for custom themes
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tokens JSONB NOT NULL,
  is_custom BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  version INTEGER DEFAULT 1
);

-- Add JSON size validation trigger
CREATE OR REPLACE FUNCTION check_theme_json_size()
RETURNS TRIGGER AS $$
BEGIN
  IF pg_column_size(NEW.tokens) > 10240 THEN
    RAISE EXCEPTION 'Theme JSON exceeds 10KB limit';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_theme_size
  BEFORE INSERT OR UPDATE ON public.themes
  FOR EACH ROW
  EXECUTE FUNCTION check_theme_json_size();

-- Create indexes
CREATE INDEX idx_themes_user_id ON public.themes(user_id);
CREATE INDEX idx_themes_active ON public.themes(user_id, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own themes"
  ON public.themes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own themes"
  ON public.themes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own themes"
  ON public.themes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own themes"
  ON public.themes FOR DELETE
  USING (auth.uid() = user_id);

-- Add columns to user_customization_preferences
ALTER TABLE public.user_customization_preferences
ADD COLUMN IF NOT EXISTS custom_theme_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_themes JSONB DEFAULT '[]'::jsonb;

-- Make XP level nullable for future use
ALTER TABLE public.user_xp_levels
ALTER COLUMN current_level DROP NOT NULL;

COMMENT ON COLUMN public.user_xp_levels.current_level IS 'Reserved for future XP-based features';

-- Backfill existing users with starter tier
UPDATE public.profiles
SET subscription_tier = 'free'
WHERE subscription_tier IS NULL;

-- Grant default and classic themes to all users
UPDATE public.user_customization_preferences
SET unlocked_themes = ARRAY['default', 'classic']
WHERE unlocked_themes IS NULL OR array_length(unlocked_themes, 1) = 0 OR unlocked_themes = '{}'::text[];

-- Ensure all users have customization preferences
INSERT INTO public.user_customization_preferences (user_id, unlocked_themes)
SELECT p.id, ARRAY['default', 'classic']
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_customization_preferences ucp WHERE ucp.user_id = p.id
);