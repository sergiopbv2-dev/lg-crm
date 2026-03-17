-- 1. Add new columns for Stage Workflow
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'Registration'; -- Registration, Access, Spec/In, Award, Closed, Lost, Pending_Delete
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS loss_reason TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS delete_requested2 BOOLEAN DEFAULT FALSE; -- Flag for deletion request workflow

-- 2. Update existing rows to default stage if null
UPDATE quotes SET stage = 'Registration' WHERE stage IS NULL;

-- 3. Add column for approval tracking (who requested deletion)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES auth.users(id);

-- 4. Ensure RLS policies cover updates
-- Existing policies should cover update if the user owns the quote.
-- We might need a policy for Admin to update ANY quote (already covered by is_admin()).

-- Note: User asked for "etapa de Borrar la oportunidad", so we can use 'Delete_Request' as a stage value.
