-- Phase 1.1: Fix Goals System - Add missing description column
ALTER TABLE trading_goals 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Phase 1.2: Create Reports System Tables
CREATE TABLE IF NOT EXISTS generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('performance', 'analysis', 'coaching')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  report_data JSONB NOT NULL,
  trade_count INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_reports_user_id ON generated_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_at ON generated_reports(generated_at DESC);

-- Enable RLS
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_reports
CREATE POLICY "Users can view their own reports"
  ON generated_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
  ON generated_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON generated_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Phase 1.3: Create AI Learning Tables for pattern recognition
CREATE TABLE IF NOT EXISTS user_trade_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_frequency JSONB DEFAULT '{}',
  symbol_frequency JSONB DEFAULT '{}',
  setup_frequency JSONB DEFAULT '{}',
  emotional_tag_frequency JSONB DEFAULT '{}',
  avg_leverage NUMERIC DEFAULT 1,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS for user_trade_patterns
ALTER TABLE user_trade_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own patterns"
  ON user_trade_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own patterns"
  ON user_trade_patterns FOR ALL
  USING (auth.uid() = user_id);