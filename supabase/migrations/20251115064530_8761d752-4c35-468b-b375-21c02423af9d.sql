-- First, update existing capital and ROI goals with null or 0 baseline_value to have a default value
-- This ensures the constraint can be added without errors
UPDATE trading_goals 
SET baseline_value = 1000
WHERE goal_type IN ('capital', 'roi') 
AND (baseline_value IS NULL OR baseline_value = 0);

-- Now add the check constraint to ensure baseline_value is set for future capital and ROI goals
ALTER TABLE trading_goals 
ADD CONSTRAINT baseline_value_required 
CHECK (
  (goal_type NOT IN ('capital', 'roi')) 
  OR 
  (goal_type IN ('capital', 'roi') AND baseline_value IS NOT NULL AND baseline_value > 0)
);