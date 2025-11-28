-- Create user_setups table for custom setup tags
CREATE TABLE public.user_setups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.user_setups ENABLE ROW LEVEL SECURITY;

-- Create policies for user_setups
CREATE POLICY "Users can view own setups" 
ON public.user_setups 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own setups" 
ON public.user_setups 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own setups" 
ON public.user_setups 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own setups" 
ON public.user_setups 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_setups_updated_at
BEFORE UPDATE ON public.user_setups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_user_setups_user_id ON public.user_setups(user_id);