# Sistema de Recuperación ante Fallos en Dashboard

## Problema
El usuario reportó que el dashboard se mantenía en "$0" y "Cargando...".
Causa confirmada: Las consultas SQL fallaban porque las columnas `is_spec_in` y `is_retrofit` no existen aún en la base de datos (Supabase), lo que provocaba que la promesa de Javascript devolviera error. El código anterior simplemente logueaba el error pero no intentaba una alternativa, dejando la UI congelada en su estado inicial ($0).

## Solución Implementada (Retry Logic)
Se modificó `script.js` para las tres tarjetas críticas:
1.  **Pipeline Total**: Se creó la función `fetchPipeline(safe=false)`.
2.  **Mes Entregas**: Se creó `fetchDeliveries(safe=false)`.
3.  **Mes Awards**: Se creó `fetchAwards(safe=false)`.

### Funcionamiento:
1.  **Intento 1 (Safe = false)**: Intenta consultar **TODAS** las columnas (monto, stage, `is_spec_in`, `is_retrofit`).
2.  **Protección de Error**: Si Supabase devuelve error (ej: columna no encontrada), el `catch` o bloque `if(error)` atrapa el fallo.
3.  **Intento 2 (Safe = true)**: Automáticamente re-ejecuta la misma función pero esta vez pidiendo **SOLO** las columnas básicas (`total_net_price`, `stage`).
4.  **Resultado en UI**:
    - Las tarjetas de dinero ($) mostrarán el monto correcto basándose en las columnas existentes.
    - Las tarjetas de desglose (Spec In / Retrofit) mostrarán "$0 (N/A)" o "Sin Datos Calidad" en lugar de romperse, indicando sutilmente que falta configurar la DB pero permitiendo operar lo financiero.

## Beneficio
El dashboard es ahora **resiliente**. Funcionará siempre, mostrando el dinero correctamente, incluso si el usuario olvida correr scripts de actualización de base de datos.
