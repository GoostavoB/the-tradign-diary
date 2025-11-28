-- Update profiles table to include GDPR fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS accepted_terms_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS accepted_privacy_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'email';

-- Update trades table to match V2 requirements
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS symbol text,
ADD COLUMN IF NOT EXISTS side text CHECK (side IN ('long', 'short')),
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS trade_hash text UNIQUE;

-- Rename columns for consistency
ALTER TABLE public.trades RENAME COLUMN asset TO symbol_temp;
ALTER TABLE public.trades RENAME COLUMN position_type TO side_temp;

-- Copy data if columns exist
UPDATE public.trades SET symbol = symbol_temp WHERE symbol_temp IS NOT NULL;
UPDATE public.trades SET side = LOWER(side_temp) WHERE side_temp IS NOT NULL;

-- Update user_settings to include theme and accent
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#8B5CF6',
ADD COLUMN IF NOT EXISTS layout_json jsonb DEFAULT '{}'::jsonb;

-- Create storage buckets for trade uploads and share cards
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trade_uploads', 'trade_uploads', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('share_cards', 'share_cards', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for trade_uploads bucket
CREATE POLICY "Users can upload their own trade images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'trade_uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own trade images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'trade_uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own trade images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'trade_uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for share_cards bucket
CREATE POLICY "Users can create their own share cards"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'share_cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own share cards"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'share_cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own share cards"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'share_cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update handle_new_user function to include GDPR fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    country, 
    marketing_consent,
    accepted_terms_at,
    accepted_privacy_at,
    provider,
    terms_accepted_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false),
    CASE 
      WHEN NEW.raw_user_meta_data->>'accepted_terms_at' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'accepted_terms_at')::timestamp with time zone
      ELSE NULL
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'accepted_privacy_at' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'accepted_privacy_at')::timestamp with time zone
      ELSE NULL
    END,
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'terms_accepted_at' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'terms_accepted_at')::timestamp with time zone
      ELSE NULL
    END
  );
  
  INSERT INTO public.user_settings (user_id, theme, accent_color)
  VALUES (NEW.id, 'dark', '#8B5CF6');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;