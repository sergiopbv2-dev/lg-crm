
-- 5. POLÍTICAS DE ELIMINACIÓN Y ACTUALIZACIÓN (Corrección)
-- Ejecuta este bloque en tu editor SQL de Supabase para permitir borrar/editar

-- Políticas para Quotes
CREATE POLICY "Actualizar cotizaciones propias" ON quotes 
FOR UPDATE USING (distributor_id = get_my_distributor_id() OR is_admin());

CREATE POLICY "Borrar cotizaciones propias" ON quotes 
FOR DELETE USING (distributor_id = get_my_distributor_id() OR is_admin());

-- Políticas para Quote Items
CREATE POLICY "Actualizar items propios" ON quote_items 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM quotes q WHERE q.id = quote_items.quote_id AND (q.distributor_id = get_my_distributor_id() OR is_admin()))
);

CREATE POLICY "Borrar items propios" ON quote_items 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM quotes q WHERE q.id = quote_items.quote_id AND (q.distributor_id = get_my_distributor_id() OR is_admin()))
);
