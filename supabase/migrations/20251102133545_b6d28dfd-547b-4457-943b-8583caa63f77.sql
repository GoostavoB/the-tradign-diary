-- Create Claude API usage tracking table
CREATE TABLE IF NOT EXISTS public.claude_api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL,
  table_name TEXT,
  query_params JSONB,
  response_time_ms INTEGER,
  response_size_bytes INTEGER,
  row_count INTEGER,
  success BOOLEAN NOT NULL,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.claude_api_usage ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view API usage"
ON public.claude_api_usage
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for better performance
CREATE INDEX idx_claude_api_usage_created_at ON public.claude_api_usage(created_at DESC);
CREATE INDEX idx_claude_api_usage_operation ON public.claude_api_usage(operation);
CREATE INDEX idx_claude_api_usage_table_name ON public.claude_api_usage(table_name);

-- RPC Function: Get user dashboard stats
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_trades', COUNT(t.id),
    'winning_trades', COUNT(t.id) FILTER (WHERE t.pnl > 0),
    'losing_trades', COUNT(t.id) FILTER (WHERE t.pnl < 0),
    'total_pnl', COALESCE(SUM(t.pnl), 0),
    'win_rate', CASE 
      WHEN COUNT(t.id) > 0 
      THEN ROUND((COUNT(t.id) FILTER (WHERE t.pnl > 0)::DECIMAL / COUNT(t.id)) * 100, 2)
      ELSE 0 
    END,
    'avg_profit', COALESCE(AVG(t.pnl) FILTER (WHERE t.pnl > 0), 0),
    'avg_loss', COALESCE(AVG(t.pnl) FILTER (WHERE t.pnl < 0), 0),
    'current_xp', COALESCE(x.current_xp, 0),
    'current_level', COALESCE(x.current_level, 1),
    'subscription_status', COALESCE(s.status, 'free'),
    'plan_type', COALESCE(s.plan_type, 'free')
  ) INTO result
  FROM public.profiles p
  LEFT JOIN public.trades t ON t.user_id = p.id AND t.deleted_at IS NULL
  LEFT JOIN public.user_xp_levels x ON x.user_id = p.id
  LEFT JOIN public.subscriptions s ON s.user_id = p.id AND s.status IN ('active', 'trial')
  WHERE p.id = user_uuid
  GROUP BY p.id, x.current_xp, x.current_level, s.status, s.plan_type;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Get subscription metrics (admin only)
CREATE OR REPLACE FUNCTION public.get_subscription_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  SELECT json_build_object(
    'total_subscribers', COUNT(*) FILTER (WHERE status IN ('active', 'trial')),
    'active_subscribers', COUNT(*) FILTER (WHERE status = 'active'),
    'trial_subscribers', COUNT(*) FILTER (WHERE status = 'trial'),
    'elite_subscribers', COUNT(*) FILTER (WHERE status = 'active' AND plan_type = 'elite'),
    'pro_subscribers', COUNT(*) FILTER (WHERE status = 'active' AND plan_type = 'pro'),
    'starter_subscribers', COUNT(*) FILTER (WHERE status = 'active' AND plan_type = 'starter'),
    'cancelled_subscriptions', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'total_mrr', COALESCE(SUM(CASE 
      WHEN status = 'active' AND plan_type = 'elite' THEN 14.99
      WHEN status = 'active' AND plan_type = 'pro' THEN 7.99
      WHEN status = 'active' AND plan_type = 'starter' THEN 2.99
      ELSE 0
    END), 0)
  ) INTO result
  FROM public.subscriptions;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Get trading analytics
CREATE OR REPLACE FUNCTION public.get_trading_analytics(
  user_uuid UUID,
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  date_filter BOOLEAN;
BEGIN
  date_filter := start_date IS NOT NULL AND end_date IS NOT NULL;
  
  SELECT json_build_object(
    'total_trades', COUNT(t.id),
    'total_pnl', COALESCE(SUM(t.pnl), 0),
    'win_rate', CASE 
      WHEN COUNT(t.id) > 0 
      THEN ROUND((COUNT(t.id) FILTER (WHERE t.pnl > 0)::DECIMAL / COUNT(t.id)) * 100, 2)
      ELSE 0 
    END,
    'avg_trade_duration_hours', COALESCE(AVG(t.duration_hours), 0),
    'most_traded_symbol', (
      SELECT t2.symbol
      FROM public.trades t2
      WHERE t2.user_id = user_uuid 
        AND t2.deleted_at IS NULL
        AND (NOT date_filter OR (t2.created_at >= start_date AND t2.created_at <= end_date))
      GROUP BY t2.symbol
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ),
    'best_performing_symbol', (
      SELECT json_build_object(
        'symbol', t2.symbol,
        'total_pnl', SUM(t2.pnl)
      )
      FROM public.trades t2
      WHERE t2.user_id = user_uuid 
        AND t2.deleted_at IS NULL
        AND (NOT date_filter OR (t2.created_at >= start_date AND t2.created_at <= end_date))
      GROUP BY t2.symbol
      ORDER BY SUM(t2.pnl) DESC
      LIMIT 1
    ),
    'worst_performing_symbol', (
      SELECT json_build_object(
        'symbol', t2.symbol,
        'total_pnl', SUM(t2.pnl)
      )
      FROM public.trades t2
      WHERE t2.user_id = user_uuid 
        AND t2.deleted_at IS NULL
        AND (NOT date_filter OR (t2.created_at >= start_date AND t2.created_at <= end_date))
      GROUP BY t2.symbol
      ORDER BY SUM(t2.pnl) ASC
      LIMIT 1
    ),
    'trades_by_side', (
      SELECT json_build_object(
        'long_trades', COUNT(*) FILTER (WHERE side = 'long'),
        'short_trades', COUNT(*) FILTER (WHERE side = 'short'),
        'long_pnl', COALESCE(SUM(pnl) FILTER (WHERE side = 'long'), 0),
        'short_pnl', COALESCE(SUM(pnl) FILTER (WHERE side = 'short'), 0)
      )
      FROM public.trades t2
      WHERE t2.user_id = user_uuid 
        AND t2.deleted_at IS NULL
        AND (NOT date_filter OR (t2.created_at >= start_date AND t2.created_at <= end_date))
    )
  ) INTO result
  FROM public.trades t
  WHERE t.user_id = user_uuid 
    AND t.deleted_at IS NULL
    AND (NOT date_filter OR (t.created_at >= start_date AND t.created_at <= end_date));
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;