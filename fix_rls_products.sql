-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_discounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any, just to be safe
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for auth users" ON products;

DROP POLICY IF EXISTS "Enable read access for all users" ON distributor_discounts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON distributor_discounts;
DROP POLICY IF EXISTS "Enable update for auth users" ON distributor_discounts;

-- Create policies for PRODUCTS table
-- 1. Anyone logged in can read products
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Authenticated users can insert products
CREATE POLICY "Enable insert for authenticated users only" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Authenticated users can update products
CREATE POLICY "Enable update for auth users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');


-- Create policies for DISTRIBUTOR_DISCOUNTS table
-- 1. Anyone logged in can read discounts
CREATE POLICY "Enable read access for all users" ON distributor_discounts
    FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Authenticated users can insert discounts
CREATE POLICY "Enable insert for authenticated users only" ON distributor_discounts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Authenticated users can update discounts
CREATE POLICY "Enable update for auth users" ON distributor_discounts
    FOR UPDATE USING (auth.role() = 'authenticated');
