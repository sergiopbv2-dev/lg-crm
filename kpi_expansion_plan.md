# Nuevos KPIs para Deliveries y Awards Mensuales

## Solicitud del Usuario
El usuario solicitó ampliar la sección de KPIs superiores para incluir información específica sobre "Active Pipeline" y resultados del "mes en curso" (Current Month), mencionando explícitamente "posible Award de este mes" y "delivery date".

## Cambios Implementados

### 1. Diseño y Estructura (`style.css`, `index.html`)
- **Grid de 6 Columnas**: Se amplió el grid de KPIs de 4 a 6 columnas para alojar las nuevas tarjetas sin ocupar más altura en la pantalla.
- **Tarjetas Compactas**: Se redujo el padding y la altura mínima de las tarjetas para que se vean bien alineadas en una sola fila.
- **Nuevas Tarjetas Agregadas**:
    1.  **Month Deliveries**: Muestra el monto total ($) de entregas programadas para este mes.
    2.  **Month Awards**: Muestra el monto total ($) de adjudicaciones (contracts won) esperadas o realizadas este mes.

### 2. Lógica de Datos (`script.js`)

Se agregaron dos nuevas consultas en `loadKPIs`:

**A. Month Deliveries (Entregas del Mes)**
- Consulta la tabla `quote_items`.
- Filtra por `delivery_date` dentro del mes actual (1 al 31).
- **Filtro de Seguridad**: Excluye items de cotizaciones en estado `Lost` o `Delete_Pending/Lost_Pending` (usando JS filter robusto).

**B. Month Awards (Adjudicaciones del Mes)**
- Consulta la tabla `quotes`.
- Filtra por `award_date` dentro del mes actual.
- **Filtro de Seguridad**: Excluye cotizaciones perdidas o eliminadas.

## Resultado
El Dashboard ahora presenta una fila superior de 6 KPIs clave:
1.  **Active Pipeline**: Dinero total "en juego" (vivo).
2.  **Active Deals**: Número de negocios activos.
3.  **Month Deliveries**: Dinero a facturar/entregar este mes.
4.  **Month Awards**: Dinero a cerrar/ganar este mes.
5.  **Total Customers**: Clientes únicos.
6.  **Quotes Created**: Nuevas oportunidades generadas este mes (vivas).
