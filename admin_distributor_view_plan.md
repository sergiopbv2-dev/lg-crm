# Visualización de Distribuidores en Listas (Solo Admin)

## Solicitud del Usuario
El usuario (administrador) desea ver qué empresa (Distribuidor) está a cargo de cada oportunidad en las listas de "Próximas Entregas" y "Próximos Awards".
Requisito Clave: Esta información **solo debe ser visible para el administrador**. Los distribuidores normales no deben ver nombres de otras empresas (aunque por el diseño actual, ellos solo ven sus propios datos de todos modos, pero la distinción visual es importante).

## Cambios Realizados en `script.js`

1.  **Optimización de Consultas (`loadLists`)**:
    - Se modificó la consulta de `Próximas Entregas` para incluir la relación anidada con la tabla `companies`: `quotes!inner(..., companies(name))`.
    - Se modificó la consulta de `Próximos Awards` para incluir la relación directa: `companies(name)`.

2.  **Lógica de Renderizado Condicional**:
    - Se agregó una verificación `if (isAdmin && ...)` dentro del bucle de generación de HTML.
    - Si el usuario es administrador, se genera un pequeño "badge" (etiqueta) al lado del nombre del proyecto.

3.  **Estilo del Badge**:
    - **Entregas**: Fondo gris claro, texto gris oscuro (discreto).
    - **Awards**: Fondo azul muy claro, texto azul oscuro (a juego con el tema de Awards).
    - Estilo inline para evitar conflictos de CSS caché: `font-size:0.75rem; padding:2px 6px; border-radius:4px;`.

## Resultado
- **Vista Distribuidor**: Ve "Proyecto X", "Monto Y". Limpio y propio.
- **Vista Administrador**: Ve "Proyecto X [Cosmoplas]", "Monto Y". Permite identificar rápidamente quién gestiona cada oportunidad crítica.
