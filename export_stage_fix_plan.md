# Corrección de Exportación de Etapas

## Problema Detectado
El usuario reportó que la columna de "Etapa" (Stage) no aparecía o estaba incorrecta en el reporte de Excel de Oportunidades.
Diagnóstico técnico:
- El script intentaba leer la columna `status` de la base de datos.
- La columna real que contiene la etapa ("Registration", "Award", "Spec/In", etc.) se llama `stage`.
- Como `status` probablemente no existe o está vacía, el valor exportado era nulo.

## Solución Aplicada
1.  Se modificó la consulta a Supabase en `exportOpportunities()` para seleccionar `stage` en lugar de `status`.
2.  Se actualizó el mapeo del objeto JSON para que la clave "Estado" en el Excel se llene con `q.stage`.

## Resultado Esperado
Al generar el reporte de oportunidades nuevamente, la columna "Estado" ahora mostrará correctamente valores como:
- Registration
- Access
- Spec/In
- Award
- Closed
- Lost
