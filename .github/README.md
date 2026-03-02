# Plantilla portable de `.github` para Copilot

Esta carpeta está diseñada para copiarse entre repositorios y usarla como base.

## Arquitectura en dos capas

| Capa | Archivos | Contenido |
|---|---|---|
| Universal (agnóstica) | `copilot-instructions.md`, `instructions/` | Principios de ingeniería aplicables a cualquier proyecto |
| Específica del proyecto | `project-context.md`, `docs/`, `development_rules.md` | Stack, comandos, módulos, reglas con ejemplos concretos |

## Qué incluye

### Instrucciones automáticas (`instructions/`)
Cargadas automáticamente según el patrón `applyTo`:

| Archivo | Aplica a | Contenido |
|---|---|---|
| `00-global.instructions.md` | `**/*` | Orden de lectura, reglas invariantes, convenciones base |
| `backend.instructions.md` | `src/**/*.ts` | Arquitectura, capas, DTOs, patrones |
| `frontend.instructions.md` | `**/*.{tsx,jsx}` | UI, accesibilidad, diseño, performance |
| `security.instructions.md` | `**/*` | OWASP, validación, secretos, checklist de merge |
| `performance.instructions.md` | `**/*` | DB, caché, jobs, frontend, checklist |
| `devops.instructions.md` | `Dockerfile,docker-compose*,workflows/**` | Docker multistage, CI/CD, health |
| `git.instructions.md` | `**/*` | Conventional Commits, branching, política de commits |
| `api-design.instructions.md` | `src/**/*.ts` | HTTP semántico, paginación, errores, Swagger |
| `observability.instructions.md` | `src/**/*.ts` | Logging, correlation IDs, health checks, métricas |
| `tests-dot-test-ts.instructions.md` | `**/*.test.ts` | Unit/integration tests backend |
| `tests-dot-test-tsx.instructions.md` | `**/*.test.tsx` | Tests de componentes UI |
| `tests.instructions.md` | `**/*spec.ts` | E2E con Playwright, Page Object, arquitectura |

### Prompts operacionales (`prompts/`)
Prompts reutilizables para tareas recurrentes:
- `create-module.prompt.md` — Scaffolding completo de módulo hexagonal
- `write-unit-tests.prompt.md` — Tests unitarios e integración con mocks
- `write-e2e-tests.prompt.md` — Tests E2E con Playwright y Page Object Model
- `code-review.prompt.md` — Review estructurado por dimensiones
- `fix-bug.prompt.md` — Diagnóstico, fix y test de regresión
- `security-audit.prompt.md` — Auditoría OWASP de módulo o endpoint
- `create-frontend-component.prompt.md` — Componente React de nivel premium
- `analyze-performance.prompt.md` — Análisis de bottlenecks con soluciones
- `refactor.prompt.md` — Refactoring sin cambio de comportamiento

### Chat modes (`chatmodes/`)
Personalidades especializadas del agente:
- `architect.chatmode.md` — Decisiones de diseño y arquitectura
- `qa-senior.chatmode.md` — Estrategia de testing y calidad exhaustiva
- `security-analyst.chatmode.md` — AppSec y OWASP
- `devops-engineer.chatmode.md` — CI/CD, contenedores e infraestructura

### Reglas de desarrollo (`development_rules.md` y `development_rules/`)
Estándares detallados de implementación con ejemplos del framework actual:
- `01_architecture.md` — Capas y dependencias
- `02_typing_dtos_patterns.md` — Tipado, DTOs, patrones
- `03_api_errors_docs.md` — API REST, errores, Swagger
- `04_observability_integrations.md` — Logging, caché, mensajería, jobs
- `05_config_security_conventions.md` — Config, seguridad, convenciones
- `06_devops_git_testing.md` — Docker, Git, testing
- `07_frontend_best_practices.md` — UI/UX avanzado, art direction, accesibilidad

### Otros
- `copilot-instructions.md` — Reglas globales + flujo A→H por fases
- `project-context.md` — Contexto específico del proyecto (editar por proyecto)
- `workflows/` — Pipelines de CI/CD (GitHub Actions)

## Impacto directo en el agente

| Nivel | Archivos | Activación |
|---|---|---|
| 🔴 Siempre activo | `copilot-instructions.md`, `instructions/*.instructions.md` | Automático |
| 🟡 Por tarea | `prompts/*.prompt.md` | Al invocar el prompt |
| 🟡 Por sesión | `chatmodes/*.chatmode.md` | Al seleccionar el modo |
| 🟢 Indirecto | `development_rules*`, `project-context.md`, `docs/` | Cuando el agente los lee según instrucciones |
| ⚪ Proceso/calidad | `workflows/` | GitHub Actions CI/CD |

## Cómo personalizar para un proyecto nuevo

1. Editar `project-context.md` con: stack, comandos reales, módulos en scope, restricciones.
2. Si existe `docs/`: agregar especificación funcional, técnica y plan de implementación.
3. Actualizar `development_rules.md` o los archivos en `development_rules/` si el proyecto usa un ORM o framework diferente al actual.
4. **NO tocar** los archivos de `instructions/` salvo para cambiar comportamiento universal.

## Regla de prioridad

`project-context.md` > `docs/` > `development_rules.md` > `instructions/` (base universal)

