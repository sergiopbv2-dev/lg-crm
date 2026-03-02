ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
UPDATE public.products SET is_active = true WHERE is_active IS NULL;
