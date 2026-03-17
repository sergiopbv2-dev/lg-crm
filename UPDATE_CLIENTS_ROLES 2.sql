
-- 1. Actualizar tabla CLIENTS para soportar múltiples roles
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_installer BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_consultant BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_end_user BOOLEAN DEFAULT FALSE;

-- 2. Actualizar tabla QUOTES para vincular una empresa consultora específica
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS consultant_id UUID REFERENCES clients(id);

-- 3. (Opcional) Migrar datos existentes de 'client_type' a las nuevas columnas booleanas
UPDATE clients SET is_installer = TRUE WHERE client_type = 'Installer';
UPDATE clients SET is_consultant = TRUE WHERE client_type = 'Consultant' OR client_type = 'Spec In'; -- Asumiendo que Spec In anterior era consultor
UPDATE clients SET is_end_user = TRUE WHERE client_type = 'End User';
