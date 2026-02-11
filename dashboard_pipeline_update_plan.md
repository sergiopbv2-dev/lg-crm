# Actualización del Dashboard: Filtros de Pipeline Activo

## Solicitud del Usuario
El usuario solicitó que "Total Sales" refleje el "Active Pipeline", es decir, la suma de todas las oportunidades activas, excluyendo explícitamente aquellas en estado `Lost` o que están en proceso de eliminación (`Delete_Pending`, `Lost_Pending`). También solicitó aplicar esta misma lógica a los listados de "Próximas Entregas" y "Próximos Awards".

## Cambios Implementados

### 1. Etiqueta de KPI (`index.html`)
- Se cambió el título del KPI **"Total Sales"** a **"Active Pipeline"** para reflejar mejor que es la suma de oportunidades vivas.

### 2. Lógica de Datos (`script.js`)

**Filtro General de Exclusión:**
Se implementó un filtro que excluye cualquier cotización cuyo estado sea:
- `Lost` (Perdida confirmada)
- `Delete_Pending` (Solicitud de baja)
- `Lost_Pending` (Solicitud de pérdida)

**Aplicación del Filtro:**

1.  **Gráfico de Revenue / Active Pipeline (`loadRevenueData`)**:
    - Se modificó la consulta para incluir el campo `stage`.
    - Se agregó un filtro en JavaScript para sumar solo los items de cotizaciones que NO están en los estados excluidos.
    - Esto actualiza tanto el gráfico como el número total del KPI "Active Pipeline".

2.  **Gráfico de Awards (`loadAwardData`)**:
    - Se modificó la consulta para incluir `stage`.
    - Se filtra en JavaScript para no contar Awards de proyectos perdidos o en baja.

3.  **KPI "Active Deals" (`loadKPIs`)**:
    - Se agregó el filtro `.not('stage', 'in', '("Lost","Delete_Pending","Lost_Pending")')` a la consulta Supabase para contar solo las cotizaciones activas reales.

4.  **Listados de Próximas Entregas y Awards (`loadLists`)**:
    - **Entregas**: Se agregó el filtro `.not('quotes.stage', ...)` a la consulta de items.
    - **Awards**: Se agregó el filtro `.not('stage', ...)` a la consulta de cotizaciones.

## Resultado Esperado
- El Dashboard ahora muestra una visión "limpia" del negocio potencial real.
- Las oportunidades perdidas o en proceso de eliminación ya no inflan los números de venta, ni aparecen en los calendarios de entregas o awards.
