---
applyTo: "src/**/*.ts"
---
# Reglas de Observabilidad — Logging, Trazabilidad y Health (agnóstico)

> Ver `development_rules.md §7` para reglas de observabilidad con ejemplos del framework actual.

## Logging

### Qué loguear (obligatorio)

- Inicio y fin de cada request HTTP con: método, path, status code, duración en ms.
- Inicio y fin de cada job/cron: timestamp inicio, total registros procesados, éxitos, fallos, duración total.
- Errores no controlados con stack trace completo (solo en logs internos, nunca expuesto al cliente).
- Intentos de autenticación fallidos y accesos no autorizados (con IP, sin credenciales).
- Operaciones críticas de negocio: "alerta creada", "notificación enviada", "usuario activado".

### Qué NO loguear (prohibido)

- Passwords, tokens JWT completos, secrets o API keys.
- Datos de tarjetas de crédito, datos bancarios o PII sensible (GDPR/privacidad).
- Request bodies completos en endpoints de auth o que puedan contener información sensible.
- Stack traces completos en respuestas HTTP (solo en logs internos).

### Formato y nivel

- **Logs estructurados en JSON** para facilitar ingesta en plataformas centralizadas (Loki, CloudWatch, Datadog).
- Niveles: `error` (excepciones), `warn` (condiciones anómalas no fatales), `info` (eventos de negocio), `debug` (solo en desarrollo).
- En producción: nivel mínimo `info`. Nivel `debug` solo con feature flag o variable de entorno.
- Cada entry de log debe incluir: `timestamp`, `level`, `message`, `context` (clase/módulo), y los identificadores del dominio relevantes.

## Trazabilidad (Correlation IDs)

- Cada request entrante debe tener un `correlationId` / `traceId`. Si el cliente lo envía (header `X-Correlation-Id`), usarlo. Si no, generarlo.
- El `correlationId` debe propagarse en **todos los logs** del ciclo de vida de ese request.
- En arquitecturas multi-servicio: propagar el `correlationId` en los headers de las llamadas HTTP salientes y en los mensajes de mensajería.
- Usar el contexto de ejecución del framework para transportar el ID sin pasarlo explícitamente entre funciones.

## Contexto en logs

- Siempre loguear los identificadores de contexto relevantes: `userId`, `orderId`, `alertId`, `requestId`.
- Usar un logger con contexto inyectable que agregue automáticamente el `correlationId` a todos los logs del request actual.
- No usar `console.log` en producción. Usar el logger del framework (`@nestjs/common Logger`, `pino`, `winston`, etc.) declarado en `project-context.md`.

## Health Checks

- **Endpoint `/health`** obligatorio, respondiendo antes de recibir tráfico.
- **Liveness probe:** verifica que la aplicación está viva (proceso responde). Sin dependencias externas.
- **Readiness probe:** verifica que la aplicación puede atender tráfico. Incluir: conexión a DB, conexión a cache, conexión a broker (si aplica).
- Response schema:
  ```json
  {
    "status": "ok",
    "info": {
      "database": { "status": "up" },
      "redis": { "status": "up" }
    },
    "error": {},
    "details": { ... }
  }
  ```
- En Kubernetes/Docker: configurar `livenessProbe` y `readinessProbe` apuntando a `/health`.
- El endpoint `/health` debe responder en < 500ms. Si una dependencia tarda más, considerar un timeout con estado degradado.

## Métricas (baseline)

- Exponer métricas básicas de proceso en un endpoint `/metrics` (Prometheus format si aplica).
- Métricas mínimas: latencia de endpoints (p50, p95, p99), tasa de errores por endpoint, uso de memoria del proceso.
- Jobs/crons: registrar duración y tasa de éxito/fallo como métricas.
