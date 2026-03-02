DO $$
DECLARE
    lg_id UUID;
BEGIN
    -- 1. Buscamos si ya existe LG
    SELECT id INTO lg_id FROM companies WHERE name ILIKE 'LG%' LIMIT 1;
    
    -- 2. Si no existe, la creamos
    IF lg_id IS NULL THEN
        INSERT INTO companies (name) VALUES ('LG Electronics') RETURNING id INTO lg_id;
    END IF;

    -- 3. Asignarle esta compañía a los administradores
    UPDATE profiles 
    SET distributor_id = lg_id 
    WHERE role = 'admin';
    
END $$;
