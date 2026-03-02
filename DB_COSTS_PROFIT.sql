-- 1. Create the secret product costs table
CREATE TABLE IF NOT EXISTS product_costs (
    model_suffix TEXT PRIMARY KEY,
    unit_variable_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on RLS for the secret table
ALTER TABLE product_costs ENABLE ROW LEVEL SECURITY;

-- Admins can read/write the costs
CREATE POLICY "Admins can manage product costs"
ON product_costs
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- 2. Modify Companies to handle modifiers (Freight and Rebates)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS freight_pct NUMERIC DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS rebate_pct NUMERIC DEFAULT 0;

-- 3. Modify Quotes and Quote Items
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS requested_discount_pct NUMERIC DEFAULT 0;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS discount_justification TEXT;

ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS historical_unit_cost NUMERIC;

-- Policy to protect quote_items costs?
-- Actually, we can restrict SELECT on `historical_unit_cost` at the app level by simply not exposing it to clients, or we can just leave it since the quote belongs to the client anyway. If the client sees the cost of their own quote, wait, NO!
-- We must hide `historical_unit_cost` from regular users. Since Supabase doesn't easily support column-level security without secure views, we will create a secure VIEW for the admin.

CREATE OR REPLACE VIEW admin_quote_items AS
SELECT qi.*, pc.unit_variable_cost as current_variable_cost
FROM quote_items qi
LEFT JOIN products p ON qi.product_id = p.id
LEFT JOIN product_costs pc ON p.model_suffix = pc.model_suffix;
-- This view bypasses RLS and should be used by admins to fetch quote items!

-- Or, since we only want Admin to see it, we can create an RPC (Function).
CREATE OR REPLACE FUNCTION get_admin_quote_items(p_quote_id UUID)
RETURNS TABLE (
    id UUID,
    quote_id UUID,
    product_id UUID,
    quantity INTEGER,
    unit_price NUMERIC,
    model_short TEXT,
    description TEXT,
    category TEXT,
    unit_variable_cost NUMERIC
)
SECURITY DEFINER
AS $$
BEGIN
  -- Verify if the user is an admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT 
      qi.id,
      qi.quote_id,
      qi.product_id,
      qi.quantity,
      qi.unit_price,
      p.model_short,
      p.description,
      p.category,
      pc.unit_variable_cost
  FROM quote_items qi
  JOIN products p ON qi.product_id = p.id
  LEFT JOIN product_costs pc ON p.model_suffix = pc.model_suffix
  WHERE qi.quote_id = p_quote_id;
END;
$$ LANGUAGE plpgsql;
