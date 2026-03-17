# Implementación de Aprobación para Estado 'Perdida' (Lost)

## Problema Detectado
El usuario reportó que al marcar una cotización como **"Lost"** (Perdida) desde el menú de edición, esta pasaba directamente a ese estado sin requerir aprobación del administrador. Esto ocurría incluso si la cotización ya tenía una solicitud de baja pendiente, "sobreescribiendo" el estado sin control.

## Solución Aplicada
Se modificó la función `saveQuote` en `quotes.html` para interceptar la selección del estado "Lost".

### Nueva Lógica:
1.  **Detección de Intento**: Cuando el usuario presiona "Guardar Cotización", el sistema verifica si el estado seleccionado es "Lost" y si el usuario **NO** es administrador.
2.  **Confirmación de Usuario**: Se muestra un mensaje confirmando que esta acción requiere aprobación.
    *   Si el usuario cancela, se detiene el guardado.
3.  **Captura de Razón**: Se solicita obligatoriamente una "Razón de Pérdida" (mediante `prompt`).
    *   Si no se ingresa razón, se cancela el proceso.
4.  **Cambio de Estado Forzado**: En lugar de guardar como "Lost", el sistema cambia el estado internamente a **`Delete_Pending`**.
5.  **Registro de Solicitante**: Se asegura que el campo `requested_by` se actualice con el ID del usuario actual, para que el flujo de aprobación funcione correctamente.

## Resultado Esperado
- Un usuario normal ya no puede pasar una oportunidad a "Lost" directamente.
- Al intentarlo, se crea una solicitud de aprobación (`Delete_Pending`).
- El administrador verá esta solicitud en su panel y podrá Aprobarla (pasando a `Lost` definitivo) o Rechazarla.
