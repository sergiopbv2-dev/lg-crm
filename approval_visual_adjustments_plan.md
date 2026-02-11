# Plan de Ajuste de Visualización de Aprobaciones

## Solicitud del Usuario
El usuario solicitó dos ajustes visuales específicos en la sección de aprobaciones:
1.  **Diferenciación Visual de Etapas**: Que el estado `LOST_PENDING` se muestre explícitamente y se diferencie de `DELETE_PENDING`, para que el administrador sepa de inmediato si es una solicitud de pérdida o de eliminación.
2.  **Simplificación de Botones**: Que los botones de acción digan simplemente "Aprobar" y "Rechazar", ya que la columna "Etapa" ahora provee el contexto necesario sobre qué se está aprobando.

## Cambios Implementados

### 1. Actualización de Estilos (`style.css`)
- Se agregó una nueva clase CSS `.badge-stage.lost_pending`.
    - **Color**: Naranja (`#d9480f`) con fondo claro (`#ffd8a8`), para diferenciarlo del Rojo de `Delete_Pending`.
    - Esto asegura que cuando la tabla renderice el badge, se vea visualmente distinto.

### 2. Simplificación en `approvals.html`
- **Títulos de Botones**: Se eliminó la lógica que cambiaba el texto del botón a "Aprobar Baja" o "Aprobar Pérdida".
- **Estado**: Ahora los botones son estáticos: "✓ Aprobar" y "✕ Rechazar".
- La columna "Etapa" mostrará `LOST_PENDING` o `DELETE_PENDING` gracias a la lógica existente que usa el valor de la base de datos (que ya estábamos guardando correctamente).

### 3. Simplificación en `quotes.html`
- Se replicó el cambio de los botones para mantener consistencia.

## Resultado Esperado
- En la tabla de aprobaciones:
    - Solicitudes de Pérdida mostrarán una etiqueta naranja **LOST_PENDING**.
    - Solicitudes de Eliminación mostrarán una etiqueta roja **DELETE_PENDING**.
    - Los botones de acción serán limpios y uniformes: **Aprobar** / **Rechazar**.
