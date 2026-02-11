-- Create new KPIs columns if they don't exist
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_spec_in BOOLEAN DEFAULT FALSE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_retrofit BOOLEAN DEFAULT FALSE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS specified_brands TEXT[] DEFAULT '{}';

-- Optional: Ensure data type is correct (in case it was created as text by mistake)
-- ALTER TABLE quotes ALTER COLUMN is_spec_in TYPE BOOLEAN USING is_spec_in::boolean;
-- ALTER TABLE quotes ALTER COLUMN is_retrofit TYPE BOOLEAN USING is_retrofit::boolean;
