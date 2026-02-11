# Reorganización Integral del Dashboard y Gráficas de Calidad

## Solicitud
El usuario sentía el dashboard "desordenado" y quería gráficas representativas que mostraran la profundidad de la gestión mensual, especialmente en qué porcentaje del Forecast proviene de **LG Spec In** o **Retrofit**.

## Cambios Realizados

1.  **Reorganización de la Cuadrícula KPI (6 Cartas Consolidadas)**:
    - Se eliminaron las 10 cartas dispersas.
    - Se creó una estructura de 3 columnas x 2 filas, mucho más limpia:
        - **Fila 1 (Ejecución)**:
            - **Active Pipeline**: El gran número total.
            - **Forecast Facturación (Mes)**: Cuánto se va a facturar este mes. *Nuevo: Incluye subtítulo con el mix `% Spec In | % Retrofit`.*
            - **Forecast Awards (Mes)**: Cuánto se va a cerrar este mes. *Nuevo: Incluye subtítulo con el mix `% Spec In | % Retrofit`.*
        - **Fila 2 (Estrategia)**:
            - **Estrategia LG Spec In**: Tarjeta "rica" que combina Monto Total y Porcentaje de Penetración en una sola vista.
            - **Estrategia Retrofit**: Igual que la anterior, combinando monto y tasa.
            - **Eficiencia**: Combina "Active Deals" y "Month Quotes" en una sola tarjeta compacta.

2.  **Nueva Gráfica Estratégica ("Calidad del Pipeline")**:
    - Se agregó una sección gráfica nueva de ancho completo.
    - **Eje X**: Meses del año.
    - **Barras (Gris Suave)**: Volumen Total de Pipeline generado ese mes ($).
    - **Línea Roja**: Porcentaje de ese volumen que fue **Spec In**.
    - **Línea Morada**: Porcentaje de ese volumen que fue **Retrofit**.
    - Esto cumple el deseo de "un gráfico que muestre el porcentaje de ambos grupos".

3.  **Lógica del Backend (JS)**:
    - Se actualizó `loadKPIs` para calcular los desgloses en tiempo real de las entregas y awards mensuales.
    - Se creó `initStrategyChart` que procesa todas las cotizaciones del año para generar la gráfica mixta.

## Resultado
El dashboard pasa de ser una "sopa de números" a un **panel de comando estructurado**:
- Arriba: ¿Cuánto dinero hay y cuánto entra este mes? (Con detalle de calidad).
- Medio: ¿Qué tan buena es nuestra estrategia a largo plazo?
- Abajo: Análisis visual de la tendencia de calidad mes a mes.
