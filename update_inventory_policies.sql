-- update_inventory_policies.sql

-- Eliminar politicas anteriores que eran muy permisivas
DROP POLICY IF EXISTS "Todos pueden ver el stock dist" ON distributor_inventory;
DROP POLICY IF EXISTS "Distribuidores pueden modificar su stock" ON distributor_inventory;

-- Crear politicas mas estrictas para distributor_inventory
CREATE POLICY "Ver stock propio dist" ON distributor_inventory FOR SELECT USING (
    is_admin() 
    OR auth.jwt()->>'email' = 'sergio.baezv@usach.cl'
    OR distributor_id = (SELECT distributor_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Modificar stock propio dist" ON distributor_inventory FOR ALL USING (
    is_admin() 
    OR auth.jwt()->>'email' = 'sergio.baezv@usach.cl'
    OR distributor_id = (SELECT distributor_id FROM profiles WHERE id = auth.uid())
);

-- Nota: la política sobre "inventory" (LG) se mantiene como "Todos pueden ver stock"
-- para que los dist puedan jalar datos de LG al armar el PDF de cotización, 
-- pero en la vista de stock.html (frontend) ya están limitados a ver solo su parte.
