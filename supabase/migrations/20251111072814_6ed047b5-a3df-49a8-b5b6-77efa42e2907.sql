-- Remove quickActions and rollingTarget widgets from existing users' dashboard layouts
-- This updates the layout_json column in user_settings to filter out these widgets

UPDATE user_settings
SET layout_json = (
  CASE 
    -- Handle new format with positions and columnCount
    WHEN jsonb_typeof(layout_json) = 'object' 
         AND layout_json ? 'positions' 
         AND jsonb_typeof(layout_json->'positions') = 'array' THEN
      jsonb_build_object(
        'positions', (
          SELECT jsonb_agg(pos)
          FROM jsonb_array_elements(layout_json->'positions') AS pos
          WHERE pos->>'id' NOT IN ('quickActions', 'rollingTarget')
        ),
        'columnCount', COALESCE(layout_json->'columnCount', '3'::jsonb)
      )
    
    -- Handle position-based format (backwards compatibility)
    WHEN jsonb_typeof(layout_json) = 'array' 
         AND jsonb_array_length(layout_json) > 0
         AND (layout_json->0) ? 'column' THEN
      (
        SELECT jsonb_agg(pos)
        FROM jsonb_array_elements(layout_json) AS pos
        WHERE pos->>'id' NOT IN ('quickActions', 'rollingTarget')
      )
    
    -- Handle old order-based format (array of strings)
    WHEN jsonb_typeof(layout_json) = 'array' 
         AND jsonb_array_length(layout_json) > 0
         AND jsonb_typeof(layout_json->0) = 'string' THEN
      (
        SELECT jsonb_agg(widget_id)
        FROM jsonb_array_elements_text(layout_json) AS widget_id
        WHERE widget_id NOT IN ('quickActions', 'rollingTarget')
      )
    
    -- Keep as-is if format is unrecognized
    ELSE layout_json
  END
),
updated_at = now()
WHERE layout_json IS NOT NULL
  AND (
    -- Check if quickActions or rollingTarget exists in any format
    (jsonb_typeof(layout_json) = 'object' AND layout_json->'positions' @> '[{"id": "quickActions"}]'::jsonb)
    OR (jsonb_typeof(layout_json) = 'object' AND layout_json->'positions' @> '[{"id": "rollingTarget"}]'::jsonb)
    OR (jsonb_typeof(layout_json) = 'array' AND layout_json @> '["quickActions"]'::jsonb)
    OR (jsonb_typeof(layout_json) = 'array' AND layout_json @> '["rollingTarget"]'::jsonb)
    OR (jsonb_typeof(layout_json) = 'array' AND layout_json @> '[{"id": "quickActions"}]'::jsonb)
    OR (jsonb_typeof(layout_json) = 'array' AND layout_json @> '[{"id": "rollingTarget"}]'::jsonb)
  );