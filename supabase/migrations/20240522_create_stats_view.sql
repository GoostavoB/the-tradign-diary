-- Create a function to get dashboard stats
create or replace function get_dashboard_stats(p_user_id uuid)
returns table (
  total_trades bigint,
  total_pnl numeric,
  winning_trades bigint,
  losing_trades bigint,
  avg_win numeric,
  avg_loss numeric,
  best_trade_pnl numeric,
  worst_trade_pnl numeric,
  win_rate numeric,
  profit_factor numeric
)
language plpgsql
security definer
as $$
begin
  return query
  with user_trades as (
    select profit_loss
    from trades
    where user_id = p_user_id
    and deleted_at is null
  ),
  stats as (
    select
      count(*) as total_cnt,
      coalesce(sum(profit_loss), 0) as pnl_sum,
      count(case when profit_loss > 0 then 1 end) as win_cnt,
      count(case when profit_loss <= 0 then 1 end) as loss_cnt,
      avg(case when profit_loss > 0 then profit_loss end) as avg_w,
      avg(case when profit_loss <= 0 then abs(profit_loss) end) as avg_l,
      max(profit_loss) as best_pnl,
      min(profit_loss) as worst_pnl
    from user_trades
  )
  select
    total_cnt as total_trades,
    pnl_sum as total_pnl,
    win_cnt as winning_trades,
    loss_cnt as losing_trades,
    coalesce(avg_w, 0) as avg_win,
    coalesce(avg_l, 0) as avg_loss,
    coalesce(best_pnl, 0) as best_trade_pnl,
    coalesce(worst_pnl, 0) as worst_trade_pnl,
    case when total_cnt > 0 then (win_cnt::numeric / total_cnt::numeric) * 100 else 0 end as win_rate,
    case when coalesce(avg_l, 0) > 0 then coalesce(avg_w, 0) / avg_l else 0 end as profit_factor
  from stats;
end;
$$;
