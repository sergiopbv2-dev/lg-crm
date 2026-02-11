# Restauración de Estilo de KPIs

## Solicitud del Usuario
El usuario indicó que la versión de 6 columnas se sentía "apretada" y que los bloques no respetaban las dimensiones estándar del diseño base.
También mencionó que esto afectaba la percepción del menú lateral.

## Cambios Implementados

### 1. Restauración de Dimensiones (`style.css`)
- **Grid**: Se cambió de `repeat(6, 1fr)` a `repeat(3, 1fr)`.
    - Esto hará que los 6 KPIs se distribuyan en **2 filas de 3 columnas**.
    - Se restauró el `gap` a `20px` (antes 12px) para dar más aire.
- **Card**: Se restauró el padding a `20px` (antes 15px) y la altura mínima a `140px` (antes 110px).
    - Esto recupera la presencia visual y la "importancia" de cada tarjeta.
- **Tipografía**: Se restauró el tamaño de fuente del valor principal a `1.8rem` (antes 1.4rem).

## Resultado Visual
- El Dashboard tendrá ahora una sección superior más prominente con dos filas de tarjetas grandes y legibles.
- Se mantiene la consistencia visual ("Look & Feel") con el resto de la aplicación y con el estado original del dashboard.
- Los iconos y textos tendrán el espacio adecuado para "respirar".
