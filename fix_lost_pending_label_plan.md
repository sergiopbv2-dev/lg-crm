# Corrección de Etiqueta y Estado de Pérdida

## Problema Detectado
El usuario reportó que al marcar una oportunidad como "Lost", la etiqueta seguía mostrando `Delete_Pending` en lugar de `Lost_Pending`.
Esto se debía a que, aunque se implementó la lógica en el panel de aprobación, la función `saveQuote` en `quotes.html` no fue actualizada correctamente en el paso anterior y seguía enviando el estado `Delete_Pending`.

## Solución Aplicada

### 1. Corrección en `quotes.html` (Lógica de Guardado)
- Se actualizó la línea `currentStage = 'Delete_Pending'` por `currentStage = 'Lost_Pending'` dentro del bloque de intercepción de "Lost status".
- Ahora, las nuevas solicitudes se guardarán correctamente con el estado de pérdida pendiente.

### 2. Mejora Visual de Etiquetas ("Badges")
- Se actualizó el renderizado de la columna "Etapa" en `quotes.html` y `approvals.html`.
- Ahora se reemplazan los guiones bajos (`_`) por espacios.
    - `LOST_PENDING` se mostrará como **`LOST PENDING`**.
    - `DELETE_PENDING` se mostrará como **`DELETE PENDING`**.

## Resultado Esperado
- Al solicitar una pérdida, la solicitud aparecerá con la etiqueta naranja **`LOST PENDING`**.
- Al solicitar una eliminación (basurero), aparecerá con la etiqueta roja **`DELETE PENDING`**.
- Los botones de acción ahora son simples ("Aprobar" / "Rechazar"), delegando el contexto a la etiqueta de etapa.
