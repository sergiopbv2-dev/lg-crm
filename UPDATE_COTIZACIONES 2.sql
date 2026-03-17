
-- 1. Agregar nuevas columnas a la tabla quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_consultant BOOLEAN DEFAULT FALSE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_spec_in BOOLEAN DEFAULT FALSE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_retrofit BOOLEAN DEFAULT FALSE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS specified_brands TEXT[]; -- Array de marcas seleccionadas

-- 2. Crear tabla de Marcas (Brands)
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar seguridad (lectura pública para autenticados)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura a todos" ON brands FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Insertar marcas iniciales
INSERT INTO brands (name) VALUES 
('Samsung'), 
('Daikin'), 
('Trane'), 
('Anwo'), 
('Clark'), 
('Climaveneta'), 
('Euroklimat'), 
('JCI')
ON CONFLICT (name) DO NOTHING;
