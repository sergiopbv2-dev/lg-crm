# Sincronización de Escalado y Fuentes

## Problema Detectado
El usuario reportó un efecto de "zoom" o "agrandamiento" en el menú y los textos al navegar fuera del Dashboard (`index.html`) hacia otras secciones (`quotes.html`, etc.).
Análisis técnico:
1.  **Fuentes inconsistentes**: `index.html` cargaba la fuente Inter con pesos 400, 500, 600. `quotes.html` cargaba 300, 400, 500, 600, 700. Esto puede causar que el navegador renderice la tipografía con métricas ligeramente diferentes.
2.  **Estilos Redundantes**: Las páginas secundarias tenían un bloque `<style>` interno que redefinía `body { font-family: ... }`. Aunque coincidía en teoría, el hecho de declararlo explícitamente podría estar anulando sutilmente la herencia de `style.css` o causando un comportamiento diferente en la carga.
3.  **Meta Viewport**: Se confirmó que es idéntico, por lo que no era la causa.

## Solución Aplicada
Se realizó una limpieza quirúrgica en los encabezados (`<head>`) de todas las páginas secundarias:
- **Unificación de Fuentes**: Se copió exactamente el `<link>` de Google Fonts de `index.html` a todas las páginas. Ahora todas piden exactamente los mismos pesos y familias.
- **Eliminación de Estilos Body**: Se eliminó la regla `body` dentro de los bloques `<style>` locales. Ahora todas las páginas dependen 100% de la definición maestra en `style.css` (`line-height: 1.6`, `height: 100vh`, `overflow: hidden`).

## Archivos Afectados
- `quotes.html`
- `approvals.html`
- `reports.html` (Incluyendo corrección de un error de sintaxis `<style><style>`)
- `clients.html`

## Resultado Esperado
- La transición entre páginas será imperceptible en cuanto a tamaño de letra y escala.
- El menú lateral se verá idéntico pixel-perfect en toda la aplicación.
- Se elimina la sensación de "zoom" inesperado.
