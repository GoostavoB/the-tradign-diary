-- =====================================================
-- The Trading Diary - Complete Stripe Payment System V2
-- =====================================================
-- This migration adds support for monthly/annual subscriptions and credit packs

-- =====================================================
-- 1. ADD INTERVAL TO SUBSCRIPTIONS TABLE
-- =====================================================
-- Add interval field to track monthly vs annual subscriptions
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS interval TEXT DEFAULT 'month' CHECK (interval IN ('month', 'year'));

-- =====================================================
-- 2. UPDATE PROFILES TABLE
-- =====================================================
-- Add credits balance tracking to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- =====================================================
-- 3. CREDITS MANAGEMENT FUNCTIONS
-- =====================================================
-- Function to add credits to a user's balance
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET credits_balance = COALESCE(credits_balance, 0) + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits from a user's balance
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT credits_balance INTO current_balance
  FROM profiles
  WHERE id = p_user_id;

  IF current_balance >= p_amount THEN
    UPDATE profiles
    SET credits_balance = credits_balance - p_amount
    WHERE id = p_user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION add_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits(UUID, INTEGER) TO authenticated;