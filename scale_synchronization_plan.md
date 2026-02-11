# Sincronización Total de Escala y Tamaños

## Problema Detectado
El usuario insistía en que había diferencias de tamaño ("zoom") entre el Dashboard (`index.html`) y las demás páginas (`quotes.html`, etc.), a pesar de compartir estilos.
Análisis final:
1.  Falta de un tamaño base (`base font-size`) explícito en `html`, lo que dejaba espacio a interpretación del navegador o herencias sutiles.
2.  El menú lateral tenía un tamaño ligeramente grande (`0.95rem` ≈ 15.2px) que al cambiar de contexto visual (de dashboard denso a tabla amplia) parecía "agrandarse".
3.  Los títulos (`h1` vs `h2`) no estaban estandarizados globalmente. El Dashboard usaba un `h1` de `1.8rem`, pero `quotes.html` usaba un `h2` sin estilo definido (por defecto del navegador ≈ 1.5em), lo que creaba una inconsistencia visual inmediata.

## Solución Aplicada en `style.css`

1.  **Forzado de Tamaño Base**:
    - Se agregó `html { font-size: 16px; }`.
    - Se agregó `body { font-size: 1rem; }`.
    - Esto garantiza que `1rem` sea **siempre** 16px en todas las páginas, sin excepción.

2.  **Menú Lateral Compacto**:
    - Se redujo el tamaño de fuente de los enlaces del menú de `0.95rem` a `0.9rem` (14.4px).
    - Esto hace que el menú se vea más nítido, profesional y menos "invasivo" o "zoomeado", igualando la percepción del usuario sobre el dashboard original.

3.  **Estandarización de Títulos**:
    - Se creó una regla global para `h2` y `.page-header h2`.
    - Ahora todos los títulos de sección ("Gestión de Cotizaciones", "Clientes", etc.) tendrán exactamente el mismo peso (`800`), fuente (`Outfit`) y tamaño (`1.8rem`) que el título del Dashboard.

## Resultado Esperado
- **Consistencia Absoluta**: Al navegar entre Dashboard, Cotizaciones y Aprobaciones, el menú lateral permanecerá **inmóvil** y del mismo tamaño exacto.
- **Títulos Uniformes**: El encabezado de cada página tendrá la misma presencia visual.
- **Sensación de "App Nativa"**: Se elimina cualquier "salto" visual que rompa la inmersión.
