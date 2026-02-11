# Resolución de Datos en Cero (Cargando...)

## Problema
El dashboard muestra "Cargando..." o valores en cero en las nuevas tarjetas y gráficas.
Diagnóstico Principal: Es casi seguro que las columnas `is_spec_in` y `is_retrofit` no existen en la tabla `quotes` de Supabase. Al intentar consultarlas (para calcular el desglose), la petición falla y el código se detiene, dejando el texto "Cargando..." congelado.

## Solución Crítica (Acción Requerida)
El usuario **DEBE ejecutar el siguiente script SQL** en el editor de Supabase. El sistema no puede crear columnas mágicamente.

Archivo generado: `update_cols_spec_retro.sql`

```sql
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_spec_in BOOLEAN DEFAULT FALSE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_retrofit BOOLEAN DEFAULT FALSE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS specified_brands TEXT[] DEFAULT '{}';
```

## Ajuste de Resiliencia en JS
Se modificó `script.js` para que, si falla la consulta (por falta de columnas), elimine el mensaje "Cargando..." y muestre **"Requiere actualización SQL"** o al menos "$0" y no se quede pegado. Esto confirma que el error es de base de datos y no de lógica eterna.

## Definiciones Confirmadas
- **Venta/Deliveries**: Se usa el campo `delivery_date` de `quote_items`.
- **Award**: Se usa el campo `award_date` de `quotes`.
Estas definiciones ya están correctamente implementadas en el código.
