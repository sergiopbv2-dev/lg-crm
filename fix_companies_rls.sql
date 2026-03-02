-- Habilitamos RLS en caso de no haber estado habilitado
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 1. Permitimos que todos puedan ver (SELECT) las empresas
DROP POLICY IF EXISTS "Ver empresas" ON companies;
CREATE POLICY "Ver empresas" 
ON companies FOR SELECT 
USING (true);

-- 2. Permitimos que los administradores inserten (INSERT) nuevas empresas
DROP POLICY IF EXISTS "Crear empresas admin" ON companies;
CREATE POLICY "Crear empresas admin" 
ON companies FOR INSERT 
WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Permitir eliminar (DELETE) empresas para administradores (opcional pero útil para limpieza)
DROP POLICY IF EXISTS "Eliminar empresas admin" ON companies;
CREATE POLICY "Eliminar empresas admin" 
ON companies FOR DELETE 
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
