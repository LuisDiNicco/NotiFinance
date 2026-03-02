---
applyTo: "src/**/*.ts"
---
# Reglas backend (agnóstico — ver `project-context.md` para el framework específico)

> Leer `.github/development_rules.md` y `.github/development_rules/` para reglas detalladas con ejemplos.
> Leer `.github/project-context.md` para stack, ORM, framework de mensajería y comandos reales del proyecto.

## Arquitectura y dependencias (crítico)

- **Patrón:** Clean/Hexagonal Architecture. La lógica de negocio debe ser framework-agnostic y altamente testeable.
- **Capas:** `domain` (reglas puras) → `application` (casos de uso, interfaces/ports) → `infrastructure` (framework, DB, APIs externas).
- `domain` NO puede importar nada del framework, ORM ni librerías externas.
- `application` solo depende de `domain`. Aquí se definen las interfaces (ports) que la infraestructura implementa.
- `infrastructure` implementa las interfaces definidas en `application` (Dependency Inversion).
- Los primary-adapters (controllers, consumers) NUNCA dependen directamente de secondary-adapters (DB, APIs). Solo de services de application.
- Comunicación cross-layer: siempre por interfaces, nunca por instancias concretas.

## Estructura de carpetas esperada

```
src/
├── domain/       # Entidades puras, enums, errores de dominio
├── application/  # Interfaces (ports), servicios de caso de uso (max 200 líneas)
└── infrastructure/
    ├── base/             # Config, logger, filtros globales, interceptors
    ├── primary-adapters/ # Controllers, Guards, Consumers, Jobs
    └── secondary-adapters/ # DB, Cache, HTTP clients, Publishers
```

## Tipado y DTOs

- `any` está PROHIBIDO. Usar `unknown` con type guards cuando el payload es dinámico.
- `switch` sobre enums: cubrir TODOS los casos o usar un default que lance error (exhaustiveness).
- Request DTOs: validación en el borde (class-validator/similar) + método `toEntity()` para convertir a entidad de dominio.
- Response DTOs: factory estático `fromEntity()` para que el dominio nunca se filtre hacia afuera.
- Entities de DB ≠ Entities de dominio: mapear explícitamente en la capa de infra. Nunca exponer modelos ORM al application layer.

## Patrones de implementación

- **DI:** Constructor Injection con tokens constantes (e.g., `@Inject(REPO_TOKEN) repo: IRepository`).
- **Repositorios:** métodos con nombre de negocio claro (`findActiveUsersByCountry`), NO CRUD genérico.
- **Unit of Work:** para transacciones multi-paso. Interfaz en `application`, implementación en `infrastructure`.
- **Controllers:** responsabilidad única — parsear HTTP context, traducir DTOs, delegar a service, retornar status code. El conteo de líneas (guía: ~80) es un síntoma de violación de SRP, no la métrica primaria. Si supera ese umbral, es una señal de que tiene más de una razón para cambiar.
- **Services:** responsabilidad única de orquestación. Fail fast con early returns, sin nesting profundo. La complejidad ciclomática por método es la métrica real — si supera ~10 caminos lógicos distintos, dividir el método. El límite orientativo de ~200 líneas es consecuencia de SRP bien aplicado, no el objetivo en sí.
- **Migraciones:** cambios de schema SIEMPRE por migraciones del ORM. Nunca `synchronize: true` en producción.

## Errores y manejo defensivo (minimizar errores 500)

- Crear errores de dominio en `domain/errors/` (ej: `EntityNotFoundError extends Error`).
- **NUNCA** swallow exceptions (catch vacíos destruyen stack traces).
- Global Exception Filter en infra mapea errores de dominio → HTTP status codes.

### Clasificación obligatoria de errores

**Errores operacionales** (esperados, predecibles — nunca deben ser 500):
- Validación de input fallida → `400 Bad Request`
- Recurso no encontrado → `404 Not Found`
- Conflicto de integridad → `409 Conflict`
- No autenticado / token inválido → `401 Unauthorized`
- Sin permisos → `403 Forbidden`
- Rate limit → `429 Too Many Requests`

**Errores de programador** (bugs reales — el único caso legítimo de 500):
- Excepciones no anticipadas, fallos de infraestructura, estados imposibles.

### Regla anti-500: todo error de negocio predecible DEBE tener su clase de dominio

- Si un flujo puede fallar por una condición de negocio conocida, crear la clase de error correspondiente en `domain/errors/`. El Global Exception Filter lo convierte en el status code correcto.
- Un `500` en producción indica que **faltó** una clase de dominio o una validación. Investigar siempre la causa raíz.

### Mensajes de error: dos audiencias

**Al usuario (respuesta HTTP):** claro, accionable, en términos del dominio, sin jerga técnica.
```json
{ "statusCode": 404, "message": "La alerta con id 'abc' no existe.", "path": "/api/v1/alerts/abc" }
```

**Al desarrollador (log interno):** máximo contexto para diagnóstico exacto. Incluir:
- `correlationId` / `traceId` del request
- Clase + método donde ocurrió
- Input exacto que desencadenó el error
- Stack trace completo
- Estado relevante del sistema en ese momento

El mismo `correlationId` que aparece en los logs debe poder enviarse al usuario en el body del error para correlación rápida en soporte.

### Validación defensiva temprana (fail fast)

- Validar todos los inputs en el borde (DTO) **antes** de que lleguen al servicio. Los servicios no deberían recibir datos inválidos.
- En servicios: usar guard clauses al inicio del método para estados inválidos. No esperar hasta el fondo del flujo para detectar errores predecibles.
- Si una operación puede fallar por una precondición de negocio, verificarla **antes** de iniciar transacciones o llamadas a sistemas externos.

## Configuración

- NUNCA leer `process.env` directamente en servicios o controladores.
- Registrar configuraciones con factory pattern. Inyectar objetos tipados, no strings crudos.

## Seguir flujo por fases

Ver `.github/copilot-instructions.md §3` para el ciclo completo: build → test → lint → audit → review → cierre.
