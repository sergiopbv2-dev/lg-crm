# Implementación de Métricas Estratégicas (Spec In & Retrofit)

## Solicitud del Usuario
El usuario solicitó ampliar la sección de KPIs del Dashboard para medir el impacto de dos estrategias clave:
1.  **LG Spec In**: Proyectos donde LG ha sido especificado desde el diseño.
2.  **Retrofit**: Proyectos de renovación de equipos existentes.

Se pidieron métricas de **monto acumulado** (total en pipeline) y **porcentaje de penetración** respecto al total del pipeline.

## Cambios Realizados

1.  **Dashboard (`index.html`)**:
    - Se agregaron 4 nuevas tarjetas KPI al final de la grilla `.kpi-grid`:
        - **LG Spec In (Total)**: Monto ($) total de oportunidades vivas marcadas como Spec In.
        - **LG Spec In (%)**: Porcentaje que representa este monto del total del pipeline.
        - **Retrofit (Total)**: Monto ($) total de oportunidades vivas marcadas como Retrofit.
        - **Retrofit (%)**: Porcentaje que representa este monto del total del pipeline.

2.  **Lógica (`script.js`)**:
    - Se optimizó la consulta principal de `loadKPIs` (Sección 1.5 - Pipeline Value).
    - Ahora, además de sumar el total general, el script itera sobre todas las oportunidades activas (excluyendo 'Lost'/'Delete') y acumula separadamente los montos donde `is_spec_in === true` y `is_retrofit === true`.
    - Se calculan las tasas: `(Monto Específico / Monto Total Pipeline) * 100`.

## Resultado Visual
Al ingresar al Dashboard, debajo de los KPIs operativos (Entregas, Awards, Clientes), ahora aparecerán estas métricas de salud estratégica, permitiendo evaluar rápidamente qué tan efectiva es la venta consultiva (Spec In) y la renovación (Retrofit).
