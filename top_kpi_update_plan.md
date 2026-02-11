# Actualización de Métricas Superiores (Top KPIs)

## Solicitud del Usuario
El usuario solicitó explícitamente que la sección superior del Dashboard ("acá arriba") refleje:
1.  **Medición del Pipeline**: El valor total del pipeline activo, independientemente del año de visualización de los gráficos.
2.  **Mes en curso**: Que el contador de cotizaciones del mes considere solo las activas.

Anteriormente, la tarjeta "Active Pipeline" estaba vinculada al gráfico de Revenue (que filtra por año, por defecto 2026), por lo que mostraba solo el pipeline de ese año.

## Cambios Implementados

### 1. Desvinculación del KPI "Active Pipeline"
- Se modificó `script.js` para que la tarjeta de KPI #1 ("Active Pipeline") **NO** se actualice desde la función `loadRevenueData`.
- Se creó una nueva lógica dedicada en `loadKPIs` ("1.5 TOTAL ACTIVE PIPELINE VALUE").
    - Esta lógica consulta la suma de `total_net_price` de **todas** las cotizaciones activas (`stage` NO es Lost/Deleted).
    - No aplica filtro de año. Muestra el valor "Histórico Activo" completo.

### 2. Filtro en KPI "Quotes This Month"
- Se agregó el filtro `.not('stage', 'in', ...)` a la consulta que cuenta las cotizaciones creadas este mes.
- Ahora, si una cotización creada este mes se marca como "Lost" o se envía a la papelera, el contador disminuirá, reflejando solo el éxito neto del mes actual.

## Resultado Esperado
- **Tarjeta 1 (Active Pipeline)**: Mostrará un monto mayor (o igual) al del gráfico, representando todo el dinero "sobre la mesa" actualmente.
- **Tarjeta 4 (Quotes This Month)**: Mostrará cuántas oportunidades nuevas y activas se han generado este mes.
