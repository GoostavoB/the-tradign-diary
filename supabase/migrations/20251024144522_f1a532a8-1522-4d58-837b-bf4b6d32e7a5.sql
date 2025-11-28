-- Add emotion and error tags to trades table
ALTER TABLE public.trades 
ADD COLUMN emotion_tags text[] DEFAULT '{}',
ADD COLUMN error_tags text[] DEFAULT '{}';

-- Create index for array searches
CREATE INDEX idx_trades_emotion_tags ON public.trades USING GIN (emotion_tags);
CREATE INDEX idx_trades_error_tags ON public.trades USING GIN (error_tags);

-- Create table for custom user tags
CREATE TABLE IF NOT EXISTS public.custom_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tag_name text NOT NULL,
  tag_type text NOT NULL CHECK (tag_type IN ('emotion', 'error')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tag_name, tag_type)
);

-- Enable RLS
ALTER TABLE public.custom_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_tags
CREATE POLICY "Users can view their own custom tags"
  ON public.custom_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom tags"
  ON public.custom_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom tags"
  ON public.custom_tags FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE public.custom_tags IS 'User-defined custom emotion and error tags for trades';
COMMENT ON COLUMN public.trades.emotion_tags IS 'Array of emotion tags associated with the trade';
COMMENT ON COLUMN public.trades.error_tags IS 'Array of error/mistake tags associated with the trade';