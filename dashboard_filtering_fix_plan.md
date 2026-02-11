# Refinamiento de Cálculos de Pipeline Activo

## Problema Detectado
El usuario reportó que la información del Dashboard seguía sin reflejar correctamente el "Pipeline Activo" a pesar de los cambios previos.
Análisis técnico: Es probable que los filtros complejos de Supabase (`.not('stage', 'in', ...)`) estuvieran fallando silenciosamente o devolviendo resultados incorrectos debido a la sintaxis de filtros anidados o listas de strings.

## Solución Aplicada: Filtrado en JavaScript (Frontend)

Se eliminaron los filtros "frágiles" de las consultas SQL/Supabase y se reemplazaron por un filtrado robusto en JavaScript una vez obtenidos los datos. Esto garantiza 100% de precisión al excluir `Lost`, `Delete_Pending` y `Lost_Pending`.

### Cambios en `script.js`

1.  **Active Pipeline (Valor Total)**:
    - Se traen todas las cotizaciones (con su monto y etapa).
    - Se filtra en JS: `pipelineData.filter(x => !['Lost', 'Delete_Pending', 'Lost_Pending'].includes(x.stage))`.
    - Se suma el total resultante.

2.  **Active Deals (Cantidad)**:
    - Se traen todas las etapas.
    - Se cuenta en JS aplicando el mismo filtro de exclusión.

3.  **Quotes This Month (Mes en curso)**:
    - Se traen las cotizaciones del mes.
    - Se filtra en JS para contar solo las que siguen activas.

4.  **Listas de Próximas Entregas y Awards**:
    - Se aumentó el límite de consulta (de 10 a 20) para traer más candidatos.
    - Se filtra en JS antes de renderizar la lista final, asegurando que no aparezca ninguna "basura".

## Resultado Esperado
- El monto de "Active Pipeline" será exacto y corresponderá a la suma de todas las oportunidades vivas.
- Los contadores de "Active Deals" y "Quotes This Month" coincidirán perfectamente con la realidad operativa.
- Las listas inferiores no mostrarán proyectos muertos.
