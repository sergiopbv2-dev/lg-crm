-- Fix for Upload List Price (products table)
ALTER TABLE products ADD CONSTRAINT unique_model_suffix UNIQUE (model_suffix);

-- Fix for Upload Discounts (distributor_discounts table), just in case it's missing too
ALTER TABLE distributor_discounts ADD CONSTRAINT unique_distributor_category UNIQUE (distributor_id, category);
