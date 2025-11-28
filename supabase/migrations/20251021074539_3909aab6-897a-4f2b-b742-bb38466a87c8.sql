-- Create user broker preferences table to track usage
CREATE TABLE IF NOT EXISTS public.user_broker_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_name TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, broker_name)
);

-- Enable RLS
ALTER TABLE public.user_broker_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own broker preferences" 
ON public.user_broker_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own broker preferences" 
ON public.user_broker_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own broker preferences" 
ON public.user_broker_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to increment broker usage
CREATE OR REPLACE FUNCTION public.increment_broker_usage(p_broker_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_broker_preferences (user_id, broker_name, usage_count, last_used_at)
  VALUES (auth.uid(), p_broker_name, 1, now())
  ON CONFLICT (user_id, broker_name) 
  DO UPDATE SET 
    usage_count = user_broker_preferences.usage_count + 1,
    last_used_at = now(),
    updated_at = now();
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_broker_preferences_updated_at
BEFORE UPDATE ON public.user_broker_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_user_broker_preferences_user_usage 
ON public.user_broker_preferences(user_id, usage_count DESC, last_used_at DESC);