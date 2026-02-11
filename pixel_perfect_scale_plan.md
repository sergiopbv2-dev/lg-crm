# Consolidación Definitiva de Escalas (Pixel Perfect)

## Problema
El usuario reporta un efecto "Zoom" donde algunas páginas (`quotes.html`) muestran un menú y letras más grandes que el Dashboard (`index.html`). Esto probablemente se debe a variaciones en la interpretación de unidades relativas (`rem`) o diferencias en el renderizado de iconos (ancho variable de emojis) que desplazan el texto.

## Solución Aplicada
Se realizó un cambio radical hacia **unidades absolutas (px)** y estructura rígida para garantizar consistencia total:

1.  **Fuente Base Absoluta**:
    - `html` y `body`: `font-size: 16px`. Ya no depende de `1rem` calculado.

2.  **Menú Lateral "Indestructible"**:
    - **Enlaces**: `font-size: 14px` (fijo). Ni más ni menos.
    - **Iconos**:
        - `font-size: 18px` (fijo).
        - **Ancho Fijo (`width: 24px`)**: Esto es crucial. Antes, un emoji ancho (como `📄`) empujaba el texto más a la derecha que uno estrecho (como `⊞`), creando la ilusión de que el menú "se movía" o cambiaba de tamaño al cambiar de página. Ahora todos ocupan exactamente el mismo espacio horizontal.
        - `text-align: center`: Centra el icono en su caja de 24px.
    - **Espaciado**: Se redujo el `gap` de `12px` a `8px` para compactar visualmente.

3.  **Tablas Compactas**:
    - Se redujo el padding de celda (`td`) de `1rem` (16px) a `12px`.
    - Se fijó la fuente de celda en `14px`.
    - Esto hace que las tablas grandes de `quotes.html` se sientan tan densas y profesionales como las listas del Dashboard, eliminando la sensación de "gigantismo".

## Resultado Esperado
- El menú lateral será **idéntico pixel por pixel** en todas las páginas.
- Los iconos estarán perfectamente alineados verticalmente.
- La densidad de información en las tablas será consistente con la del Dashboard.
- Se elimina cualquier factor de "zoom" subjetivo o técnico.
