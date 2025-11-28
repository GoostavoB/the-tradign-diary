-- Phase 1: Weekly Challenges Table
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL DEFAULT DATE_TRUNC('week', CURRENT_DATE),
  challenge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly challenges" ON public.weekly_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly challenges" ON public.weekly_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly challenges" ON public.weekly_challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly challenges" ON public.weekly_challenges
  FOR DELETE USING (auth.uid() = user_id);

-- Phase 2: Seasonal Challenges Table
CREATE TABLE IF NOT EXISTS public.seasonal_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.seasonal_competitions(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  cosmetic_reward TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.seasonal_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own seasonal challenges" ON public.seasonal_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seasonal challenges" ON public.seasonal_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seasonal challenges" ON public.seasonal_challenges
  FOR UPDATE USING (auth.uid() = user_id);

-- Phase 3: Widget Usage Stats Table
CREATE TABLE IF NOT EXISTS public.widget_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  interaction_count INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  last_interacted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, widget_type)
);

ALTER TABLE public.widget_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own widget stats" ON public.widget_usage_stats
  FOR ALL USING (auth.uid() = user_id);

-- Phase 4: Profile Frames Table
CREATE TABLE IF NOT EXISTS public.profile_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frame_id TEXT NOT NULL UNIQUE,
  frame_name TEXT NOT NULL,
  unlock_requirement TEXT NOT NULL,
  required_level INTEGER,
  required_badge TEXT,
  frame_style JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profile_frames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profile frames" ON public.profile_frames
  FOR SELECT USING (true);

-- User Profile Frame Selection
CREATE TABLE IF NOT EXISTS public.user_profile_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frame_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, frame_id)
);

ALTER TABLE public.user_profile_frames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own frames" ON public.user_profile_frames
  FOR ALL USING (auth.uid() = user_id);

-- Phase 5: Widget Styles Table
CREATE TABLE IF NOT EXISTS public.widget_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id TEXT NOT NULL UNIQUE,
  style_name TEXT NOT NULL,
  unlock_requirement TEXT NOT NULL,
  required_level INTEGER,
  style_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.widget_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view widget styles" ON public.widget_styles
  FOR SELECT USING (true);

-- User Widget Style Selection
CREATE TABLE IF NOT EXISTS public.user_widget_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, style_id)
);

ALTER TABLE public.user_widget_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own widget styles" ON public.user_widget_styles
  FOR ALL USING (auth.uid() = user_id);

-- Phase 6: User Rivals Table
CREATE TABLE IF NOT EXISTS public.user_rivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rival_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_notified_at TIMESTAMPTZ,
  UNIQUE(user_id, rival_user_id),
  CHECK (user_id != rival_user_id)
);

ALTER TABLE public.user_rivals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own rivals" ON public.user_rivals
  FOR ALL USING (auth.uid() = user_id);

-- Phase 7: Reactions Log Table
CREATE TABLE IF NOT EXISTS public.reactions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reaction_emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id, reaction_emoji)
);

ALTER TABLE public.reactions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.reactions_log
  FOR SELECT USING (true);

CREATE POLICY "Users can create own reactions" ON public.reactions_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions" ON public.reactions_log
  FOR DELETE USING (auth.uid() = user_id);

-- Phase 8: Browser Notifications Table
CREATE TABLE IF NOT EXISTS public.browser_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_notified_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

ALTER TABLE public.browser_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push tokens" ON public.browser_notifications
  FOR ALL USING (auth.uid() = user_id);

-- Phase 9: Update user_progression table
ALTER TABLE public.user_progression 
ADD COLUMN IF NOT EXISTS rank_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trader_identity_scores JSONB DEFAULT '{
  "aggression": 50,
  "patience": 50,
  "risk_management": 50,
  "consistency": 50,
  "discipline": 50,
  "adaptability": 50
}'::jsonb;

-- Phase 10: Update streak_freeze_inventory table
ALTER TABLE public.streak_freeze_inventory
ADD COLUMN IF NOT EXISTS earned_from_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS earned_from_level INTEGER DEFAULT 0;

-- Phase 11: Insert Default Profile Frames
INSERT INTO public.profile_frames (frame_id, frame_name, unlock_requirement, required_level, frame_style) VALUES
  ('bronze_border', 'Bronze Border', 'Reach Level 5', 5, '{"border": "2px solid #CD7F32", "glow": "0 0 10px rgba(205, 127, 50, 0.5)"}'::jsonb),
  ('silver_border', 'Silver Border', 'Reach Level 10', 10, '{"border": "2px solid #C0C0C0", "glow": "0 0 10px rgba(192, 192, 192, 0.6)"}'::jsonb),
  ('gold_border', 'Gold Border', 'Reach Level 20', 20, '{"border": "2px solid #FFD700", "glow": "0 0 15px rgba(255, 215, 0, 0.7)"}'::jsonb),
  ('diamond_border', 'Diamond Border', 'Reach Level 50', 50, '{"border": "3px solid #B9F2FF", "glow": "0 0 20px rgba(185, 242, 255, 0.8)"}'::jsonb),
  ('elite_border', 'Elite Trader Frame', 'Reach Elite Rank', 75, '{"border": "3px solid #9333EA", "glow": "0 0 25px rgba(147, 51, 234, 0.9)", "animation": "pulse"}'::jsonb)
ON CONFLICT (frame_id) DO NOTHING;

-- Phase 12: Insert Default Widget Styles
INSERT INTO public.widget_styles (style_id, style_name, unlock_requirement, required_level, style_config) VALUES
  ('glass_effect', 'Glass Effect', 'Default', 1, '{"background": "rgba(255, 255, 255, 0.05)", "backdropFilter": "blur(10px)", "border": "1px solid rgba(255, 255, 255, 0.1)"}'::jsonb),
  ('gradient_cards', 'Gradient Cards', 'Reach Level 10', 10, '{"background": "linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))", "border": "1px solid rgba(147, 51, 234, 0.3)"}'::jsonb),
  ('neon_borders', 'Neon Borders', 'Reach Level 25', 25, '{"border": "2px solid #9333EA", "boxShadow": "0 0 20px rgba(147, 51, 234, 0.6)", "animation": "glow"}'::jsonb),
  ('animated_bg', 'Animated Background', 'Reach Level 50', 50, '{"background": "linear-gradient(-45deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))", "backgroundSize": "400% 400%", "animation": "gradient"}'::jsonb)
ON CONFLICT (style_id) DO NOTHING;

-- Phase 13: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_user_week ON public.weekly_challenges(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_seasonal_challenges_user_season ON public.seasonal_challenges(user_id, season_id);
CREATE INDEX IF NOT EXISTS idx_widget_usage_user ON public.widget_usage_stats(user_id, interaction_count DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_target ON public.reactions_log(target_type, target_id);

-- Phase 14: Add mystery_unlocked to daily_challenges
ALTER TABLE public.daily_challenges
ADD COLUMN IF NOT EXISTS mystery_unlocked BOOLEAN DEFAULT false;