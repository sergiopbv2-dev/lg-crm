-- setup_inventory.sql
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_suffix TEXT UNIQUE NOT NULL,
    stock INTEGER DEFAULT 0,
    week_1 INTEGER DEFAULT 0,
    week_2 INTEGER DEFAULT 0,
    week_3 INTEGER DEFAULT 0,
    week_4 INTEGER DEFAULT 0,
    week_5 INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos pueden ver stock" ON inventory;
CREATE POLICY "Todos pueden ver stock" ON inventory FOR SELECT USING (auth.role() = 'authenticated');

-- Permitimos que todos hagan insert/update o solo los que son admins? 
-- Asumiremos que el frontend controla el rol de admin o bien dejamos abierta la política de UPSERT por simplicidad de momento,
-- Permite al Admin gestionar la tabla general
DROP POLICY IF EXISTS "Admin puede modificar stock" ON inventory;
CREATE POLICY "Admin puede modificar stock" ON inventory FOR ALL USING (is_admin() OR auth.jwt()->>'email' = 'sergio.baezv@usach.cl');

-- Tabla separada para el inventario propio de los distribuidores
CREATE TABLE IF NOT EXISTS distributor_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id UUID REFERENCES companies(id) NOT NULL,
    model_suffix TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    week_1 INTEGER DEFAULT 0,
    week_2 INTEGER DEFAULT 0,
    week_3 INTEGER DEFAULT 0,
    week_4 INTEGER DEFAULT 0,
    week_5 INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(distributor_id, model_suffix)
);

ALTER TABLE distributor_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos pueden ver el stock dist" ON distributor_inventory;
CREATE POLICY "Todos pueden ver el stock dist" ON distributor_inventory FOR SELECT USING (auth.role() = 'authenticated');
-- In a real scenario, we'd limit UPSERT to the specific distributor, but for now we grant authenticated
DROP POLICY IF EXISTS "Distribuidores pueden modificar su stock" ON distributor_inventory;
CREATE POLICY "Distribuidores pueden modificar su stock" ON distributor_inventory FOR ALL USING (auth.role() = 'authenticated');
