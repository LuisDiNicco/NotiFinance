---
applyTo: "src/**/*.ts"
---
# Reglas de Diseño de API REST (agnóstico)

> Ver `development_rules.md §5,§12` para reglas de paginación y documentación Swagger del proyecto.

## HTTP semántico

- **Métodos correctos:** GET (lectura idempotente), POST (creación/acción), PUT (reemplazo completo), PATCH (actualización parcial), DELETE (eliminación).
- **Status codes correctos:**
  - `200` OK — lectura exitosa, actualización exitosa
  - `201` Created — recurso creado (incluir `Location` header con la URL del nuevo recurso)
  - `204` No Content — acción exitosa sin cuerpo de respuesta (DELETE, algunas acciones)
  - `400` Bad Request — validación fallida, payload malformado
  - `401` Unauthorized — no autenticado
  - `403` Forbidden — autenticado pero sin permisos
  - `404` Not Found — recurso no existe
  - `409` Conflict — violación de integridad (ej: email duplicado)
  - `422` Unprocessable Entity — payload válido sintácticamente pero inválido semánticamente
  - `429` Too Many Requests — rate limit alcanzado
  - `500` Internal Server Error — error no controlado (nunca exponer detalles internos)

## Diseño de recursos y URLs

- URLs en `kebab-case` y en **plural** para colecciones: `/api/v1/market-assets`, `/api/v1/notification-templates`.
- Recursos anidados solo hasta 2 niveles: `/api/v1/users/:id/preferences`. Más profundidad = señal de re-diseño.
- Acciones que no mapean limpiamente a CRUD: usar sub-recurso verbo: `POST /api/v1/alerts/:id/acknowledge`.
- Versionar la API desde el principio: `/api/v1/`. Nunca romper contratos sin incrementar versión.

## Paginación (obligatoria en colecciones)

- **Nunca retornar arrays sin límite** para queries que puedan crecer con el tiempo.
- Request: `?page=1&limit=20&sortBy=createdAt&sortOrder=DESC`.
- Response wrapper:
  ```json
  {
    "data": [...],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
  ```
- Límite máximo configurable (ej: `limit` ≤ 100). Rechazar requests que excedan el máximo.

## Respuestas de error

- Formato consistente en todos los errores:
  ```json
  {
    "statusCode": 400,
    "message": "Validation failed",
    "errors": [{ "field": "email", "message": "must be a valid email" }],
    "timestamp": "2026-01-01T00:00:00Z",
    "path": "/api/v1/users"
  }
  ```
- Nunca exponer stack traces, nombres de archivo internos ni mensajes de excepción raw en producción.
- Los mensajes de error deben ser útiles para el consumidor de la API, no para el implementador.

## Documentación (Swagger/OpenAPI)

- Cada controller decorado con `@ApiTags()`.
- Cada endpoint: `@ApiOperation({ summary: '...' })` + `@ApiResponse` para cada status code posible.
- Cada propiedad de DTO: `@ApiProperty({ description, type, example })`.
- El esquema de Swagger en `/api/docs` debe estar siempre actualizado y verificable.

## Idempotencia y seguridad de métodos

- GET, PUT, DELETE deben ser idempotentes: llamarlos N veces = mismo efecto que llamarlos 1 vez.
- POST no es inherentemente idempotente: implementar Idempotency Key en operaciones críticas si el cliente puede reintentar.
- En operaciones de escritura sobre mensajería: implementar Inbox pattern para garantizar idempotencia del consumidor.
