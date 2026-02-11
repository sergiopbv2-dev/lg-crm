# Separación de Flujos: Lost (Perdida) y Delete (Baja)

## Solicitud del Usuario
El usuario solicitó diferenciar claramente entre dos acciones de baja:
1.  **Marcar como Lost**: El usuario quiere indicar que la oportunidad se perdió (negocio fallido).
2.  **Eliminar (Basurero)**: El usuario quiere eliminar la cotización del sistema (error, duplicado, etc.).

Anteriormente, ambas acciones llevaban al mismo estado (`Delete_Pending`) y al aprobarse se marcaban como 'Lost', lo cual confundía la intención de "eliminar del sistema".

## Cambios Implementados

### 1. Actualización en `quotes.html` (Lógica de Guardado)
- **Intercepción de "Lost"**: Si el usuario selecciona el estado "Lost" y no es admin, el sistema ahora asigna el estado **`Lost_Pending`** (en lugar de `Delete_Pending`).
- **Botón de Basurero**: Sigue asignando el estado **`Delete_Pending`**.

### 2. Actualización en `approvals.html` (Panel de Aprobación)
- **Carga de Datos**: Ahora busca cotizaciones con estado `Delete_Pending` **O** `Lost_Pending`.
- **Botones de Acción**:
    - Si es `Lost_Pending`, el botón dice **"Aprobar Pérdida"**.
    - Si es `Delete_Pending`, el botón dice **"Aprobar Eliminación"**.

### 3. Lógica de Aprobación (`approveDelete`)
Se modificó la función para actuar según el tipo de solicitud:
- **Caso `Lost_Pending`**: Al aprobar, la cotización pasa a estado definitivo **`Lost`**. Se mantiene en el historial.
- **Caso `Delete_Pending`**: Al aprobar, la cotización se **ELIMINA FÍSICAMENTE** de la base de datos (primero sus items, luego la cabecera).

## Resultado Esperado
- El administrador verá claramente si están pidiendo "Marcar como Perdida" o "Eliminar".
- Al aprobar una eliminación, el registro desaparecerá.
- Al aprobar una pérdida, el registro quedará como histórico con estado 'Lost'.
