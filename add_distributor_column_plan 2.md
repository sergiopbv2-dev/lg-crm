# Plan de Mejora: Visualización de Distribuidor en Cotizaciones

## Solicitud del Usuario
El administrador desea ver el origen (Distribuidor) de cada cotización en el listado general, específicamente en la primera columna. Esto es para identificar si la cotización proviene de "Mar del Sur", "Cosmoplas", etc.

## Cambios Implementados

### 1. Modificación de `quotes.html`

**Encabezado de Tabla:**
- Se agregó la columna `<th>Distribuidor</th>` al inicio de la tabla `#listTable`.

**Lógica de Renderizado (`renderQuotesList`):**
- Se implementó la recolección de `distributor_id` únicos de las cotizaciones cargadas.
- Se realiza una consulta a la tabla `companies` para obtener los nombres (`name`) correspondientes a esos IDs.
- Se mapea el nombre del distribuidor a cada fila.
- Si no hay distribuidor asignado, se muestra "Directo LG" (o "Desconocido" si hay ID pero no nombre).
- Se insertó la celda `<td>` con el nombre del distribuidor como primera columna en el cuerpo de la tabla.

## Resultado
El administrador ahora verá una columna "Distribuidor" a la izquierda de "Proyecto", permitiéndole identificar rápidamente el origen de cada oportunidad de negocio en el "universo de clientes".
