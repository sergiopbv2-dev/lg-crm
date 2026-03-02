-- Agregamos la política de seguridad (RLS) que autoriza el borrado de clientes.
-- Anteriormente, Supabase bloqueaba la eliminación de forma silenciosa.

CREATE POLICY "Eliminar mis clientes"
ON clients
FOR DELETE
USING (
    distributor_id = (SELECT distributor_id FROM profiles WHERE id = auth.uid()) 
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
