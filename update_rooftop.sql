-- Actualizamos la categoría de los equipos que comienzan con "AK-" a "Rooftop"
UPDATE products 
SET category = 'Rooftop' 
WHERE (model_short LIKE 'AK-%' OR model_suffix LIKE 'AK-%') 
  AND category = 'SCAC';
