-- Add tour versioning to user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS tour_version_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_seen_updates_version INTEGER DEFAULT 0;

-- Create tour_versions table to manage tour content
CREATE TABLE IF NOT EXISTS public.tour_versions (
  id SERIAL PRIMARY KEY,
  version INTEGER NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('full', 'update')),
  title TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  active BOOLEAN DEFAULT true
);

-- Create updates_log table for bug fixes and improvements
CREATE TABLE IF NOT EXISTS public.updates_log (
  id SERIAL PRIMARY KEY,
  version INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  changes JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.tour_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.updates_log ENABLE ROW LEVEL SECURITY;

-- Public read access for tour_versions and updates_log
CREATE POLICY "Anyone can view tour versions"
ON public.tour_versions FOR SELECT
USING (active = true);

CREATE POLICY "Anyone can view updates log"
ON public.updates_log FOR SELECT
USING (published = true);

-- Insert initial tour version
INSERT INTO public.tour_versions (version, type, title, description, steps, active)
VALUES (
  1,
  'full',
  'Tour Completo da Plataforma',
  'Conheça todas as funcionalidades da TD',
  '[]'::jsonb,
  true
)
ON CONFLICT (version) DO NOTHING;