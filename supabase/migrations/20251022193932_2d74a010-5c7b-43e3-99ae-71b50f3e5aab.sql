-- Remove any existing role for gustavo.belfiore@gmail.com
DELETE FROM public.user_roles 
WHERE user_id = 'e019b392-2eb3-4b82-8e92-bbb8f502560b';

-- Set as admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('e019b392-2eb3-4b82-8e92-bbb8f502560b', 'admin');

-- Update profile to elite subscription
UPDATE public.profiles
SET 
  subscription_tier = 'elite',
  subscription_status = 'active',
  trial_end_date = NULL,
  updated_at = now()
WHERE id = 'e019b392-2eb3-4b82-8e92-bbb8f502560b';