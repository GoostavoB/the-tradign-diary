-- Create social_notifications table
CREATE TABLE IF NOT EXISTS public.social_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'achievement', 'mention')),
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  actor_avatar TEXT,
  content TEXT NOT NULL,
  post_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_social_notifications_user_id ON public.social_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_social_notifications_read ON public.social_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_social_notifications_created_at ON public.social_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.social_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.social_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.social_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications for others"
  ON public.social_notifications
  FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- Add visibility and trade_data columns to social_posts if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'visibility') THEN
    ALTER TABLE public.social_posts ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'trade_data') THEN
    ALTER TABLE public.social_posts ADD COLUMN trade_data JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'media_urls') THEN
    ALTER TABLE public.social_posts ADD COLUMN media_urls TEXT[];
  END IF;
END $$;

-- Enable realtime for social_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_notifications;