-- 1. CATÁLOGO DE PRODUCTOS (Master)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_suffix TEXT UNIQUE NOT NULL, -- Código único: PQWRCQ0FDB.ENCXLEU
    model_short TEXT, -- PQWRCQ0FDB
    category TEXT NOT NULL, -- 'Accesories', 'Multi-V', 'Single', etc.
    description TEXT,
    list_price NUMERIC NOT NULL, -- Precio de lista público
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar lectura para todos los usuarios autenticados
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos pueden ver productos" ON products FOR SELECT USING (auth.role() = 'authenticated');


-- 2. REGLAS DE DESCUENTO POR DISTRIBUIDOR
CREATE TABLE IF NOT EXISTS distributor_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id UUID NOT NULL REFERENCES companies(id),
    category TEXT NOT NULL, -- Debe coincidir con products.category
    discount_percent NUMERIC NOT NULL, -- Ej: 45 para 45%
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(distributor_id, category) -- Evita reglas duplicadas
);

-- Habilitar seguridad: Cada distribuidor solo ve sus propios descuentos
ALTER TABLE distributor_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver mis propios descuentos" ON distributor_discounts 
FOR SELECT USING (
    distributor_id = get_my_distributor_id() OR is_admin()
);


-- 3. INTERFAZ DE COTIZACIONES (Cabecera)
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number SERIAL, -- Autoincremental simple (1001, 1002...)
    distributor_id UUID NOT NULL REFERENCES companies(id),
    user_id UUID REFERENCES auth.users(id),
    client_id UUID REFERENCES clients(id), -- Cliente seleccionado
    project_name TEXT,
    total_list_price NUMERIC,
    total_net_price NUMERIC, -- Precio final con descuento
    status TEXT DEFAULT 'draft', -- draft, sent, approved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
-- Política: Ver solo cotizaciones de mi empresa
CREATE POLICY "Ver cotizaciones propias" ON quotes 
FOR SELECT USING (distributor_id = get_my_distributor_id() OR is_admin());
-- Política: Crear cotizaciones para mi empresa
CREATE POLICY "Crear cotizaciones propias" ON quotes 
FOR INSERT WITH CHECK (distributor_id = get_my_distributor_id() OR is_admin());


-- 4. ÍTEMS DE LA COTIZACIÓN (Detalle)
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    unit_list_price NUMERIC, -- Guardamos el precio del momento (snapshot)
    applied_discount NUMERIC, -- Guardamos el descuento que se aplicó (snapshot)
    final_unit_price NUMERIC, -- Precio final calculado
    total_line_price NUMERIC -- (final_unit_price * quantity)
);

ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
-- Política "heredada": si puedes ver la quote padre, puedes ver los items
CREATE POLICY "Ver items propios" ON quote_items 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM quotes q WHERE q.id = quote_items.quote_id AND (q.distributor_id = get_my_distributor_id() OR is_admin()))
);
CREATE POLICY "Crear items propios" ON quote_items 
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quotes q WHERE q.id = quote_items.quote_id AND (q.distributor_id = get_my_distributor_id() OR is_admin()))
);


-- ============== DATOS DE EJEMPLO (SEED) ==============

-- Insertar Productos de la imagen (Ejemplo)
INSERT INTO products (model_suffix, model_short, category, description, list_price) 
VALUES 
('PQWRCQ0FDB.ENCXLEU', 'PQWRCQ0FDB', 'Accesories', 'Better Wireless Remote Controller', 102.34),
('PREMTB100.ENCXCOM', 'PREMTB100', 'Accesories', 'Standard Wired Remote Controller III', 357.00),
('ARNU07GTRA4', 'ARNU07', 'Multi-V', 'Multi V Indoor Unit 7k', 500.00), -- Ficticio para probar
('ARNU09GTRA4', 'ARNU09', 'Multi-V', 'Multi V Indoor Unit 9k', 650.00)  -- Ficticio
ON CONFLICT (model_suffix) DO NOTHING;
