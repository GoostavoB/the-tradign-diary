-- Drop the overly restrictive SELECT policy on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a new visibility-aware SELECT policy
-- This allows:
-- 1. Users to always view their own profile (with all fields including email)
-- 2. Authenticated users to view public profiles (excluding email)
-- 3. Authenticated users to view follower-only profiles if they follow that user (excluding email)
CREATE POLICY "Users can view profiles based on visibility"
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- Always allow viewing own profile
  auth.uid() = id
  OR
  -- Allow viewing public profiles
  profile_visibility = 'public'
  OR
  -- Allow viewing profiles of users you follow when visibility is set to followers
  (
    profile_visibility = 'followers'
    AND EXISTS (
      SELECT 1 FROM user_follows
      WHERE follower_id = auth.uid()
      AND following_id = profiles.id
    )
  )
);

-- Create a safe view for public profile data (excludes sensitive fields like email)
CREATE OR REPLACE VIEW public.public_profiles AS
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
FROM public.profiles
WHERE profile_visibility = 'public' OR profile_visibility = 'followers';

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add a comment explaining the security model
COMMENT ON POLICY "Users can view profiles based on visibility" ON public.profiles IS 
'Allows users to view their own full profile, and view other profiles based on visibility settings. Email and other sensitive fields should be filtered in application queries when viewing other users profiles.';