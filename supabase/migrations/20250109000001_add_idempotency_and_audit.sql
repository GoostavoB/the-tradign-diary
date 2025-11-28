-- Migration: Add idempotency and audit logging
-- Created: 2025-01-09

-- 1. Add idempotency_key to ai_cost_log
ALTER TABLE ai_cost_log
ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
ADD COLUMN IF NOT EXISTS request_id TEXT;

-- Create unique index on idempotency_key (prevents duplicate inserts)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cost_log_idempotency
ON ai_cost_log(idempotency_key)
WHERE idempotency_key IS NOT NULL;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cost_log_request_id
ON ai_cost_log(request_id)
WHERE request_id IS NOT NULL;

-- 2. Create budget_audit_log table
CREATE TABLE IF NOT EXISTS budget_audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  modified_by UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'reset', 'admin_override')),
  old_budget_cents INTEGER,
  new_budget_cents INTEGER,
  old_spend_cents INTEGER,
  new_spend_cents INTEGER,
  old_plan TEXT,
  new_plan TEXT,
  reason TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit log
CREATE INDEX idx_audit_user ON budget_audit_log(user_id);
CREATE INDEX idx_audit_modified_by ON budget_audit_log(modified_by);
CREATE INDEX idx_audit_created_at ON budget_audit_log(created_at);

-- Enable RLS on audit log
ALTER TABLE budget_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_audit_log
CREATE POLICY "Users can read their own audit logs"
ON budget_audit_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all audit logs"
ON budget_audit_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Service role can manage audit logs"
ON budget_audit_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Create trigger for auto-audit on user_ai_budget changes
CREATE OR REPLACE FUNCTION log_budget_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if actual values changed
  IF (TG_OP = 'UPDATE' AND (
    OLD.budget_cents IS DISTINCT FROM NEW.budget_cents OR
    OLD.spend_cents IS DISTINCT FROM NEW.spend_cents OR
    OLD.plan IS DISTINCT FROM NEW.plan
  )) THEN
    INSERT INTO budget_audit_log (
      user_id,
      modified_by,
      action,
      old_budget_cents,
      new_budget_cents,
      old_spend_cents,
      new_spend_cents,
      old_plan,
      new_plan,
      reason,
      metadata
    ) VALUES (
      NEW.user_id,
      COALESCE(
        current_setting('app.modified_by_user_id', true)::UUID,
        NEW.user_id  -- Fallback to user_id if not set
      ),
      'update',
      OLD.budget_cents,
      NEW.budget_cents,
      OLD.spend_cents,
      NEW.spend_cents,
      OLD.plan,
      NEW.plan,
      current_setting('app.audit_reason', true),
      jsonb_build_object(
        'old_force_lite', OLD.force_lite_at_80_percent,
        'new_force_lite', NEW.force_lite_at_80_percent,
        'old_blocked', OLD.blocked_at_100_percent,
        'new_blocked', NEW.blocked_at_100_percent
      )
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO budget_audit_log (
      user_id,
      modified_by,
      action,
      new_budget_cents,
      new_spend_cents,
      new_plan,
      reason
    ) VALUES (
      NEW.user_id,
      COALESCE(
        current_setting('app.modified_by_user_id', true)::UUID,
        NEW.user_id
      ),
      'create',
      NEW.budget_cents,
      NEW.spend_cents,
      NEW.plan,
      'Budget initialized'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS budget_change_audit ON user_ai_budget;

-- Create trigger
CREATE TRIGGER budget_change_audit
AFTER INSERT OR UPDATE ON user_ai_budget
FOR EACH ROW
EXECUTE FUNCTION log_budget_change();

-- 4. Add upload_audit_log table for virus scan and upload tracking
CREATE TABLE IF NOT EXISTS upload_audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  upload_id UUID DEFAULT gen_random_uuid(),
  file_name TEXT,
  file_size BIGINT,
  file_mime_type TEXT,
  file_hash TEXT,
  virus_scan_status TEXT CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'error', 'skipped')),
  virus_scan_provider TEXT,
  virus_scan_result JSONB,
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for upload audit
CREATE INDEX idx_upload_user ON upload_audit_log(user_id);
CREATE INDEX idx_upload_hash ON upload_audit_log(file_hash);
CREATE INDEX idx_upload_status ON upload_audit_log(processing_status);
CREATE INDEX idx_upload_created ON upload_audit_log(created_at);

-- Enable RLS on upload audit
ALTER TABLE upload_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own uploads"
ON upload_audit_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage uploads"
ON upload_audit_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Function to get idempotent cost log entry
CREATE OR REPLACE FUNCTION get_or_create_cost_log(
  p_idempotency_key TEXT,
  p_user_id UUID,
  p_endpoint TEXT,
  p_route TEXT,
  p_model_id TEXT,
  p_tokens_in INTEGER,
  p_tokens_out INTEGER,
  p_cost_cents INTEGER,
  p_latency_ms INTEGER,
  p_cache_hit BOOLEAN DEFAULT false,
  p_request_id TEXT DEFAULT NULL
) RETURNS TABLE(
  id BIGINT,
  already_exists BOOLEAN
) AS $$
DECLARE
  v_id BIGINT;
  v_exists BOOLEAN;
BEGIN
  -- Try to find existing entry
  SELECT ai_cost_log.id INTO v_id
  FROM ai_cost_log
  WHERE idempotency_key = p_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    -- Entry already exists (idempotent retry)
    v_exists := true;
  ELSE
    -- Create new entry
    INSERT INTO ai_cost_log (
      idempotency_key,
      request_id,
      user_id,
      endpoint,
      route,
      model_id,
      tokens_in,
      tokens_out,
      cost_cents,
      latency_ms,
      cache_hit
    ) VALUES (
      p_idempotency_key,
      p_request_id,
      p_user_id,
      p_endpoint,
      p_route,
      p_model_id,
      p_tokens_in,
      p_tokens_out,
      p_cost_cents,
      p_latency_ms,
      p_cache_hit
    ) RETURNING ai_cost_log.id INTO v_id;

    v_exists := false;
  END IF;

  RETURN QUERY SELECT v_id, v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Comments for documentation
COMMENT ON TABLE budget_audit_log IS 'Audit trail for all budget modifications';
COMMENT ON TABLE upload_audit_log IS 'Audit trail for file uploads with virus scan results';
COMMENT ON COLUMN ai_cost_log.idempotency_key IS 'Prevents duplicate charges on retry (format: user_id:endpoint:timestamp:hash)';
COMMENT ON COLUMN ai_cost_log.request_id IS 'Request correlation ID for debugging';
