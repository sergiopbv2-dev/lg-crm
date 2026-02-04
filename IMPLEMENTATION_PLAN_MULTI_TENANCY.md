# Plan de Implementación: Multi-Tenencia y Seguridad en Supabase

Este documento detalla la estructura de base de datos y las Políticas de Seguridad a Nivel de Fila (RLS) para garantizar que los datos de cada Distribuidor (Company) estén totalmente aislados, cumpliendo con los requisitos de negocio.

## 1. Modelo de Datos (Schema)

Asegúrate de que tus tablas en Supabase tengan, como mínimo, la siguiente estructura. La clave es la columna `distributor_id` (o `owner_company_id`) que actúa como la llave de aislamiento.

### A. Tabla `companies` (Distribuidores)
Representa a las empresas (Cosmoplas, NBL, etc.).
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### B. Tabla `profiles` (Usuarios)
Vincula al usuario autenticado con un distribuidor específico.
```sql
-- Asegúrate de que esta tabla extienda a auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    role TEXT DEFAULT 'user', -- 'admin' o 'user'
    distributor_id UUID REFERENCES companies(id), -- VITAL: Define a quién pertenece el usuario
    full_name TEXT
);
```

### C. Tabla `clients` (Clientes)
**Regla:** Un cliente pertenece *exclusivamente* al distribuidor que lo creó.
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id UUID NOT NULL REFERENCES companies(id), -- El dueño del dato
    company_name TEXT NOT NULL,
    company_rut TEXT, -- Opcional, permitimos duplicados entre distribuidores
    contact_name TEXT,
    contact_phone TEXT,
    client_type TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para mejorar rendimiento de filtros
     INDEX idx_clients_distributor (distributor_id)
);
```

### D. Tabla `opportunities` (Oportunidades)
```sql
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    distributor_id UUID NOT NULL REFERENCES companies(id), -- Redundancia útil para seguridad rápida
    title TEXT NOT NULL,
    status TEXT DEFAULT 'prospect', -- prospect, negotiation, closed_won, closed_lost
    amount NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 2. Lógica de Seguridad (Row Level Security - RLS)

Esta es la parte más crítica. Estas políticas se aplican en la base de datos.
**Nota:** Para aplicar esto, debes ir al "SQL Editor" en tu dashboard de Supabase y ejecutar estos scripts.

### Paso 1: Habilitar RLS
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
```

### Paso 2: Crear Funciones Helper (Opcional pero recomendado)
Para simplificar las consultas de seguridad.

```sql
-- Función para obtener el ID del distribuidor del usuario actual
CREATE OR REPLACE FUNCTION get_my_distributor_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT distributor_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para saber si soy ADMIN
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Paso 3: Definir Políticas para `clients`

**Regla de Visibilidad (SELECT):**
"Veo los clientes si pertenecen a mi distribuidor O si soy admin."

```sql
CREATE POLICY "Ver clientes propios o todos si soy admin"
ON clients
FOR SELECT
USING (
    distributor_id = get_my_distributor_id() -- Regla USER
    OR 
    is_admin() -- Regla ADMIN
);
```

**Regla de Creación (INSERT):**
"Solo puedo crear clientes para MI distribuidor."
*Evita que un usuario malintencionado inyecte datos a otro distribuidor.*

```sql
CREATE POLICY "Crear clientes para mi distribuidor"
ON clients
FOR INSERT
WITH CHECK (
    distributor_id = get_my_distributor_id()
    OR
    is_admin() -- Admin puede crear para cualquiera (opcional)
);
```

**Regla de Edición (UPDATE/DELETE):**
"Solo puedo editar mis clientes."

```sql
CREATE POLICY "Editar mis clientes"
ON clients
FOR UPDATE
USING (
    distributor_id = get_my_distributor_id() OR is_admin()
);
```

---

## 3. Lógica Frontend (Javascript)

Al crear un cliente en `clients.html`, el código debe seguir esta lógica:

```javascript
// 1. Obtener perfil del usuario para saber su distributor_id
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
    .from('profiles')
    .select('distributor_id')
    .eq('id', user.id)
    .single();

// 2. Preparar objeto (sin validar unicidad global)
const newClient = {
    company_name: form.companyName,
    company_rut: form.companyRut, // Se permite RUT duplicado si es otro distribuidor
    contact_name: form.contactName,
    distributor_id: profile.distributor_id // CRÍTICO: Asignar el ID propio
};

// 3. Insertar
// Gracias a las RLS, si intentaras poner otro ID, Supabase rechazaría la petición.
const { error } = await supabase.from('clients').insert([newClient]);
```

## 4. Preguntas Frecuentes del Modelo

**P: ¿Qué pasa si Cosmoplas y NBL registran al cliente "Falabella"?**
**R:** Habrá dos filas en la tabla `clients`.
1. ID: `uuid-1`, Name: "Falabella", Distributor: `Cosmoplas-ID`
2. ID: `uuid-2`, Name: "Falabella", Distributor: `NBL-ID`
Como las consultas filtran por `distributor_id`, Cosmoplas solo verá el suyo y NBL el suyo. Son totalmente independientes.

**P: ¿Cómo ve el Admin los duplicados?**
**R:** Como el Admin tiene permiso global en el RLS, al hacer `select * from clients`, verá ambas filas. En el frontend del Admin, podrás agrupar por RUT para ver coincidencias, pero a nivel de base de datos son registros aislados.
