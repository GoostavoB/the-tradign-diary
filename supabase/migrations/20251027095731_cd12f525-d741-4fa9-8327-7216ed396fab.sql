-- Phase 1: Friend Challenge & Invitation System Tables

-- Create user_rivals table if not exists
CREATE TABLE IF NOT EXISTS public.user_rivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rival_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_mutual BOOLEAN DEFAULT false,
  challenge_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, rival_user_id)
);

-- Friend invitations table
CREATE TABLE public.friend_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT,
  invitee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'))
);

-- Friend groups/leaderboards
CREATE TABLE public.friend_leaderboard_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT true,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group memberships
CREATE TABLE public.friend_leaderboard_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES friend_leaderboard_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Challenge notifications
CREATE TABLE public.friend_challenge_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenger_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (notification_type IN ('rank_overtaken', 'challenge_issued', 'milestone_achieved', 'invitation_accepted', 'group_joined'))
);

-- Add group_id to leaderboard_entries for friend group rankings
ALTER TABLE public.leaderboard_entries 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES friend_leaderboard_groups(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friend_invitations_inviter ON friend_invitations(inviter_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_invitations_invitee ON friend_invitations(invitee_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_invitations_code ON friend_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_friend_invitations_status ON friend_invitations(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_group ON leaderboard_entries(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON friend_leaderboard_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON friend_leaderboard_members(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON friend_challenge_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_rivals_user ON user_rivals(user_id);

-- Enable RLS
ALTER TABLE public.user_rivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_leaderboard_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_leaderboard_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_challenge_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_rivals
CREATE POLICY "Users can view their own rivals"
ON public.user_rivals FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = rival_user_id);

CREATE POLICY "Users can add rivals"
ON public.user_rivals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rivals"
ON public.user_rivals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rivals"
ON public.user_rivals FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for friend_invitations
CREATE POLICY "Users can view their own invitations"
ON public.friend_invitations FOR SELECT
USING (auth.uid() = inviter_user_id OR auth.uid() = invitee_user_id);

CREATE POLICY "Users can send invitations"
ON public.friend_invitations FOR INSERT
WITH CHECK (auth.uid() = inviter_user_id);

CREATE POLICY "Users can update invitations they received"
ON public.friend_invitations FOR UPDATE
USING (auth.uid() = invitee_user_id OR auth.uid() = inviter_user_id);

CREATE POLICY "Anyone can view invitation by code"
ON public.friend_invitations FOR SELECT
USING (true);

-- RLS Policies for friend_leaderboard_groups
CREATE POLICY "Users can view public groups or groups they're in"
ON public.friend_leaderboard_groups FOR SELECT
USING (
  is_private = false 
  OR creator_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM friend_leaderboard_members 
    WHERE group_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups"
ON public.friend_leaderboard_groups FOR INSERT
WITH CHECK (auth.uid() = creator_user_id);

CREATE POLICY "Group creators can update their groups"
ON public.friend_leaderboard_groups FOR UPDATE
USING (auth.uid() = creator_user_id);

CREATE POLICY "Group creators can delete their groups"
ON public.friend_leaderboard_groups FOR DELETE
USING (auth.uid() = creator_user_id);

-- RLS Policies for friend_leaderboard_members
CREATE POLICY "Users can view members of groups they're in"
ON public.friend_leaderboard_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM friend_leaderboard_groups 
    WHERE id = group_id 
    AND (is_private = false OR creator_user_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM friend_leaderboard_members flm2
    WHERE flm2.group_id = friend_leaderboard_members.group_id 
    AND flm2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join groups"
ON public.friend_leaderboard_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON public.friend_leaderboard_members FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for friend_challenge_notifications
CREATE POLICY "Users can view their own notifications"
ON public.friend_challenge_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications"
ON public.friend_challenge_notifications FOR INSERT
WITH CHECK (auth.uid() = challenger_user_id);

CREATE POLICY "Users can update their own notifications"
ON public.friend_challenge_notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for notifications and leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE friend_challenge_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE friend_leaderboard_members;
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboard_entries;