
-- 1. Add new columns to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS consultant_name text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_spec_in boolean DEFAULT false;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_retrofit boolean DEFAULT false;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS competitor_brands text[];

-- 2. Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Insert default brands
INSERT INTO brands (name) VALUES 
('Samsung'), ('Daikin'), ('Trane'), ('Anwo'), ('Clark'), ('Climaveneta'), ('Euroklimat'), ('JCI')
ON CONFLICT (name) DO NOTHING;

-- 4. Grant permissions
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON brands FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'Enable insert for authenticated users'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users" ON brands FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
END
$$;
