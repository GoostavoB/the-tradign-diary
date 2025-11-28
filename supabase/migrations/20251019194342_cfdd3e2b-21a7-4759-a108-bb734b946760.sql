-- Drop the view and recreate it with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

-- Create a safe view for public profile data with SECURITY INVOKER
-- This means the view will use the permissions of the querying user, not the creator
CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT
  id,
  username,
  full_name,
  avatar_url,
  bio,
  followers_count,
  following_count,
  profile_visibility,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add RLS to the view to ensure it respects the same policies as the profiles table
ALTER VIEW public.public_profiles SET (security_invoker = true);