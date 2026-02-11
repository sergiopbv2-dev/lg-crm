# Estandarización del Menú Lateral

## Problema Detectado
El usuario notó inconsistencias visuales graves entre el Dashboard (`index.html`) y otras páginas como Cotizaciones (`quotes.html`).
- **Dashboard**: Menú completo con iconos, alineación correcta, y footer con "Configuración".
- **Cotizaciones**: Menú sin iconos (solo texto), lo que causaba que el texto se "moviera" o desalineara visualmente. Footer diferente ("Salir" vs "Configuración").
- **Otras páginas**: Posibles inconsistencias similares en Aprobaciones, Clientes y Reportes.

## Solución Aplicada
Se realizó una auditoría y **reemplazo completo** del bloque del sidebar en todas las páginas HTML secundarias para que sea **idéntico** al del Dashboard (Golden Standard).

### Cambios realizados por archivo:

1.  **`quotes.html` (Cotizaciones)**
    - Reemplazo total del `<aside class="sidebar">`.
    - Se agregaron los iconos `<span>` faltantes.
    - Se estandarizó el footer para incluir "Configuración" y "Cerrar Sesión" con los mismos iconos.
    - Se aseguró que "Cotizaciones" tenga la clase `active`.

2.  **`approvals.html` (Aprobaciones)**
    - Reemplazo total del `<aside class="sidebar">`.
    - Se agregaron iconos y estructura estándar.
    - Footer unificado.
    - Clase `active` en "Aprobaciones".

3.  **`clients.html` (Clientes)**
    - Tenía iconos pero estructura de footer diferente ("Salir" simple).
    - Se actualizó el footer para coincidir con el Dashboard ("Configuración" + "Cerrar Sesión").

4.  **`reports.html` (Reportes)**
    - Tenía iconos pero estructura de footer diferente.
    - Se actualizó el footer para coincidir con el Dashboard.

## Resultado Esperado
- La navegación entre el Dashboard y cualquier sección ahora se sentirá **fluida y sólida**.
- No habrá "saltos" visuales en el menú (el texto y los iconos estarán en la misma posición exacta pixel-perfect).
- La funcionalidad de "Cerrar Sesión" y el acceso a "Configuración" (simulado) son consistentes en toda la app.
