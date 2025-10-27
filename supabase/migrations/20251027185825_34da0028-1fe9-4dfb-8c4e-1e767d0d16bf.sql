-- Enable realtime for trades table so custom widgets update automatically
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;