-- Add layout mode preferences to user_settings
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS layout_mode_command_center TEXT DEFAULT 'adaptive',
ADD COLUMN IF NOT EXISTS layout_mode_trade_station TEXT DEFAULT 'adaptive';

-- Add check constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_settings_layout_mode_command_center_check'
  ) THEN
    ALTER TABLE user_settings
    ADD CONSTRAINT user_settings_layout_mode_command_center_check 
    CHECK (layout_mode_command_center IN ('adaptive', 'fixed'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_settings_layout_mode_trade_station_check'
  ) THEN
    ALTER TABLE user_settings
    ADD CONSTRAINT user_settings_layout_mode_trade_station_check 
    CHECK (layout_mode_trade_station IN ('adaptive', 'fixed'));
  END IF;
END $$;