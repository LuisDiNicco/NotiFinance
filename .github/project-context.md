# Project Context (Template)

> Este archivo define el contexto real del repositorio actual.

## 1) Project profile

- Name: `Motor-de-Notificaciones / NotiFinance`
- Main stack: `NestJS 11 + TypeScript (backend), Next.js 15 + React 19 + TypeScript (frontend), PostgreSQL + Redis + RabbitMQ, Docker Compose`
- Architecture style: `Hexagonal / Clean Architecture`
- Main language(s): `TypeScript`

## 2) Source-of-truth documents

Rutas reales del proyecto:

- Requirements: `docs/01-requirements-specification.md`
- Technical design: `docs/02-technical-specification.md`
- Implementation plan: `docs/03-implementation-plan.md`
- Supplementary specs: `docs/04-supplementary-specs.md`
- Progress/status: `docs/implementation-progress.md`
- Development rules: `.github/development_rules.md`
- Repository architecture summary: `architecture.md`

## 3) Mandatory quality commands

Comandos reales del proyecto:

- Backend build: `npm run build`
- Backend test: `npm run test`
- Backend lint: `npm run lint`
- Backend e2e: `npm run test:e2e`
- Frontend build: `cd notifinance-frontend && npm run build`
- Frontend test: `cd notifinance-frontend && npm run test`
- Frontend lint: `cd notifinance-frontend && npm run lint`
- Frontend e2e (with timeout): `cd notifinance-frontend && npx playwright test --reporter=line --timeout=45000`

## 4) Scope and constraints

- In-scope modules/features:
	- Backend modules: `auth`, `market-data`, `alert`, `portfolio`, `watchlist`, `notification`, `preferences`, `template`, `ingestion`.
	- Frontend app en `notifinance-frontend` según fases de `docs/implementation-progress.md`.
- Out-of-scope modules/features:
	- Funcionalidad de broker/trading real, pagos o transferencias.
	- Features no definidas en documentación funcional/técnica.
- Security/compliance constraints:
	- No hardcodear secretos.
	- Validación estricta de inputs y tipado estricto.
	- No exponer PII ni tokens en logs.
- Performance constraints:
	- Mantener consultas y payloads paginados cuando aplica.
	- Evitar loops de E2E sin timeout explícito.

## 5) Delivery policy

- Commit strategy: `Conventional Commits`
- Push policy: `AT_END_OF_PHASE`
- Notes:
	- En fases largas, permitir commits parciales cada ~500 líneas modificadas para trazabilidad.
	- Si commit/push no es posible por permisos/política del entorno, informar bloqueo y proponer comandos exactos.
