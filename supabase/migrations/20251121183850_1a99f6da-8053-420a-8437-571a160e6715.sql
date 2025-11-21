-- Part 2: user_customization_preferences
-- Drop the unique constraint on user_id first
ALTER TABLE public.user_customization_preferences 
DROP CONSTRAINT IF EXISTS user_customization_preferences_user_id_key;

-- Add sub_account_id column
ALTER TABLE public.user_customization_preferences 
ADD COLUMN IF NOT EXISTS sub_account_id UUID REFERENCES public.sub_accounts(id) ON DELETE CASCADE;

-- Duplicate existing preferences for each sub-account
DO $$
DECLARE
  pref_record RECORD;
  sub_acc RECORD;
BEGIN
  FOR pref_record IN SELECT * FROM public.user_customization_preferences WHERE sub_account_id IS NULL
  LOOP
    FOR sub_acc IN SELECT id FROM public.sub_accounts WHERE user_id = pref_record.user_id
    LOOP
      INSERT INTO public.user_customization_preferences (
        user_id, sub_account_id, active_theme, animation_speed, background_gradient,
        calm_mode_enabled, custom_background, custom_theme_count, custom_themes,
        haptic_feedback_enabled, profile_frame, sound_enabled, theme_studio_opened_count,
        theme_unlock_dates, unlocked_themes
      ) VALUES (
        pref_record.user_id, sub_acc.id, pref_record.active_theme, pref_record.animation_speed, 
        pref_record.background_gradient, pref_record.calm_mode_enabled, pref_record.custom_background,
        pref_record.custom_theme_count, pref_record.custom_themes, pref_record.haptic_feedback_enabled,
        pref_record.profile_frame, pref_record.sound_enabled, pref_record.theme_studio_opened_count,
        pref_record.theme_unlock_dates, pref_record.unlocked_themes
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Delete old records without sub_account_id
DELETE FROM public.user_customization_preferences WHERE sub_account_id IS NULL;

-- Make sub_account_id NOT NULL
ALTER TABLE public.user_customization_preferences 
ALTER COLUMN sub_account_id SET NOT NULL;

-- Add unique constraint per sub-account
ALTER TABLE public.user_customization_preferences 
ADD CONSTRAINT user_customization_preferences_sub_account_unique 
UNIQUE (sub_account_id);

-- Add index
CREATE INDEX IF NOT EXISTS idx_user_customization_preferences_sub_account_id 
ON public.user_customization_preferences(sub_account_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can manage own customization" ON public.user_customization_preferences;
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_customization_preferences;
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_customization_preferences;

CREATE POLICY "Users can manage customization for their sub-accounts"
ON public.user_customization_preferences FOR ALL
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.sub_accounts 
    WHERE id = user_customization_preferences.sub_account_id 
    AND user_id = auth.uid()
  )
);

COMMENT ON COLUMN public.user_customization_preferences.sub_account_id IS 'Links customization (themes, animations) to specific sub-account';