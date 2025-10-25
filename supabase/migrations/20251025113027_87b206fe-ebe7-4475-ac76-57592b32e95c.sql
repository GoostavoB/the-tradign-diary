-- Create AI training profile table
CREATE TABLE public.ai_training_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  trading_styles TEXT[] DEFAULT '{}',
  main_goals TEXT[] DEFAULT '{}',
  main_goals_other TEXT,
  market_focus TEXT[] DEFAULT '{}',
  strategy_style TEXT,
  risk_per_trade TEXT,
  trading_schedule TEXT[] DEFAULT '{}',
  common_challenges TEXT[] DEFAULT '{}',
  consent_to_analyze BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.ai_training_profile ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own AI training profile"
  ON public.ai_training_profile
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI training profile"
  ON public.ai_training_profile
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI training profile"
  ON public.ai_training_profile
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ai_training_profile_updated_at
  BEFORE UPDATE ON public.ai_training_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();