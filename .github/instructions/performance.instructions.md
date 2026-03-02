---
applyTo: "**/*"
---
# Reglas de Performance (transversal — agnóstico)

> Ver `development_rules.md §5,§9,§11` para reglas de paginación, caché y jobs en el contexto del proyecto actual.
> Ver `development_rules/07_frontend_best_practices.md` para optimizaciones específicas de UI.

## Principios generales

- **No optimizar prematuramente.** Medir primero con profiling real antes de agregar capas de complejidad.
- **No degradar sin justificación.** Cualquier cambio que introduzca una regresión de performance medible debe justificarse con un trade-off explícito.
- El código debe ser correcto primero, luego legible, y solo entonces optimizado donde haya evidencia de cuello de botella.

## Base de datos y queries

- **Nunca retornar colecciones sin límite** para queries que puedan crecer con el tiempo. Siempre paginar (`page`, `limit`, `sortBy`) y retornar `PaginatedResponse` con metadatos.
- Prevenir el problema **N+1**: no ejecutar queries dentro de loops. Usar joins, eager loading o batch loading.
- Agregar índices en columnas usadas frecuentemente en `WHERE`, `ORDER BY`, `JOIN ON`. Revisar el query plan (`EXPLAIN ANALYZE`) antes de agregar un índice a ciegas.
- Para queries de lectura pesadas y de alta frecuencia, considerar proyecciones (seleccionar solo columnas necesarias).
- Evitar transacciones de larga duración que bloqueen tablas.

## Caché

- Definir interfaz de caché en `application/interfaces/`. Implementar en `infrastructure`.
- **Todo valor cacheado DEBE tener TTL explícito.** Caché infinita = bug potencial de consistencia.
- Usar claves estructuradas y predecibles: `<feature>:<entity>:<id>:<variant>`.
- Para queries con alta concurrencia: implementar mecanismo de coordinación (lock/single-flight) para prevenir cache stampede.
- Invalidar caché explícitamente ante escrituras relevantes. No depender solo del TTL para consistencia crítica.

## Jobs y procesamiento en background

- Los job processors deben ser **completamente stateless**. Estado = bugs difíciles de reproducir.
- Procesar en **batches** (chunk size configurable, ej: 100 registros). Nunca cargar colecciones completas en memoria.
- Loguear lifecycle completo: inicio, total de registros, procesados exitosamente, fallidos, duración total.
- Implementar Dead Letter Queue para mensajes/registros que fallen repetidamente. No reintentar infinitamente.

## APIs externas y clientes HTTP

- **Timeout explícito** en todas las llamadas HTTP salientes. Sin timeout = dependencia de terceros puede bloquear el proceso.
- Implementar **Circuit Breaker** y backoff exponencial con jitter para tolerancia a fallos.
- Cachear tokens de OAuth/external auth internamente. No pedir un token nuevo en cada request.
- Limitar tamaño de payload de respuesta cuando la API externa lo permite (fields filtering).

## Frontend

- **Lazy-load** de rutas y componentes pesados. Code splitting por ruta.
- Optimizar imágenes: tamaños responsivos, formatos modernos (WebP/AVIF). Evitar layout shifts (CLS).
- Evitar re-renders innecesarios: memoización (`useMemo`, `useCallback`, `React.memo`) solo donde el profiling muestre beneficio real.
- Web Vitals target: LCP < 2.5s, FID/INP < 100ms, CLS < 0.1.
- Deferrir scripts de terceros que no sean críticos para el render inicial.

## Checklist de performance antes de hacer merge

- [ ] Queries a DB nuevas tienen paginación si retornan colecciones
- [ ] Sin loops con queries dentro (N+1)
- [ ] Valores nuevos en caché tienen TTL definido
- [ ] Llamadas HTTP salientes tienen timeout configurado
- [ ] Sin imports de librerías pesadas en el bundle crítico del frontend sin code splitting
