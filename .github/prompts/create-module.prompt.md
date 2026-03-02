---
mode: agent
description: Genera un módulo backend completo siguiendo la arquitectura del proyecto (Clean/Hexagonal). Lee project-context.md para el framework y ORM actuales.
tools:
  - codebase
  - create_file
  - run_in_terminal
---

# Crear módulo backend

Crea un módulo backend completo para la funcionalidad: **[NOMBRE_DEL_MÓDULO]**

## Contexto obligatorio a leer primero

1. `.github/project-context.md` — framework, ORM, estructura de carpetas del proyecto
2. `.github/development_rules.md` — reglas de arquitectura, patrones e implementación
3. `.github/development_rules/01_architecture.md` — estructura de carpetas esperada
4. Buscar un módulo existente similar en `src/modules/` para mantener consistencia de estilo

## Qué debe generar

### 1. Domain layer (`src/modules/<nombre>/domain/`)
- Entidad de dominio: clase TypeScript pura con métodos de negocio relevantes
- Enum(s) si aplica: `PascalCase` nombre, `SCREAMING_SNAKE_CASE` valores
- Error(es) de dominio: clases extendiendo `Error` nativo

### 2. Application layer (`src/modules/<nombre>/application/`)
- Interface(s) del repositorio (`I<Nombre>Repository`) con tokens de inyección
- Servicio(s) de caso de uso (< 200 líneas, fail-fast, early returns)

### 3. Infrastructure layer (`src/modules/<nombre>/infrastructure/`)
- Entidad/modelo de DB con campos de auditoría (`createdAt`, `updatedAt`, `deletedAt`)
- Repositorio concreto que implementa la interfaz
- Mapper: `toEntity()` (DB → Domain) y `toPersistence()` (Domain → DB)
- Controller con:
  - DTOs de request (`class-validator` + método `toEntity()`)
  - DTOs de response (factory estático `fromEntity()`)
  - Decoradores Swagger: `@ApiTags`, `@ApiOperation`, `@ApiResponse`
  - < 80 líneas

### 4. Módulo NestJS / DI
- Registrar providers con tokens de inyección
- Exportar lo necesario para otros módulos

### 5. Tests
- Unit test del servicio con todos los casos: ruta feliz, errores de dominio, casos límite
- Mocks de todas las dependencias

## Criterios de aceptación

- Sin `any`
- Pasa `npm run lint` y `npm run build` sin errores
- Separación de capas estricta (domain sin imports de framework)
- Swagger actualizado
- Test con cobertura del servicio > 80%
