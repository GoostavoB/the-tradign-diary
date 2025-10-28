-- Add unlocked_colors column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS unlocked_colors JSONB 
DEFAULT '{"colors": []}'::jsonb;

-- Set default unlocked colors based on subscription tier
-- Pro users get 3 colors (primary, secondary, accent)
UPDATE profiles 
SET unlocked_colors = '{"colors": ["primary", "secondary", "accent"]}'::jsonb
WHERE subscription_tier = 'pro';

-- Elite users get full palette (primary, secondary, accent, background)
UPDATE profiles 
SET unlocked_colors = '{"colors": ["primary", "secondary", "accent", "background"]}'::jsonb
WHERE subscription_tier = 'elite';

-- Free users who reached Tier 5 + 30-day streak get primary color
UPDATE profiles p
SET unlocked_colors = '{"colors": ["primary"]}'::jsonb
FROM user_xp_tiers uxt, user_settings us
WHERE p.id = uxt.user_id 
  AND p.id = us.user_id
  AND p.subscription_tier = 'free'
  AND uxt.current_tier >= 5
  AND us.current_visit_streak >= 30;

-- Add comment for documentation
COMMENT ON COLUMN profiles.unlocked_colors IS 'JSONB array of unlocked color customization slots: {"colors": ["primary", "secondary", "accent", "background"]}';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_unlocked_colors ON profiles USING GIN (unlocked_colors);