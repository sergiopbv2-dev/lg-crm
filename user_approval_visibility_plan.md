# Implementación de Visibilidad de Estado de Aprobación para Usuarios

## Solicitud del Usuario
El usuario solicitó que, cuando un perfil de usuario (no administrador) ingrese a la sección de **Aprobaciones**, pueda ver las solicitudes que ha elevado pero con un estado claro de "Pendiente por aprobación del administrador", en lugar de ver botones de acción o un mensaje genérico.

## Cambios Implementados

### 1. Actualización en `approvals.html`
- **Función `renderActionButtons`**:
    - Se eliminó la condición `q.requested_by === currentUser.id` que permitía al solicitante auto-aprobarse (técnicamente).
    - Ahora, si el usuario **no es Admin**, se muestra un mensaje `<span ...>⏳ Pendiente por Aprobación de Admin</span>`.
    - Solo los administradores ven los botones de "Aprobar" y "Rechazar".

### 2. Actualización en `quotes.html`
- **Función `renderActionButtons`**:
    - Se replicó la lógica: Si el estado es `Delete_Pending` y el usuario **no es Admin**, se muestra "⏳ Pendiente Aprobación Admin".
    - Esto asegura consistencia tanto en el listado general como en la vista dedicada de aprobaciones.

## Resultado Esperado
- **Usuario Regular**: Al solicitar la baja de una cotización, verá esa cotización en su lista con el estado "Delete Pending" y en la columna de acciones verá "⏳ Pendiente por Aprobación de Admin". No podrá aprobarla ni rechazarla él mismo.
- **Administrador**: Verá los botones para gestionar (Aprobar/Rechazar) la solicitud.
