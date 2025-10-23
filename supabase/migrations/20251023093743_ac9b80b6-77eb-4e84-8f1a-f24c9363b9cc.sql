-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  confirmed BOOLEAN DEFAULT false,
  confirmation_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can view subscriptions (admin feature)
CREATE POLICY "Authenticated users can view subscriptions"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);