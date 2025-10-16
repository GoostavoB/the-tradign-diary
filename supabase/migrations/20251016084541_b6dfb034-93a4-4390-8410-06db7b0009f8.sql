-- Add leverage column to trades table
ALTER TABLE public.trades 
ADD COLUMN leverage numeric DEFAULT 1;