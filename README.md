# NotiFinance

NotiFinance es una plataforma de seguimiento financiero para mercado argentino que unifica cotizaciones, alertas, portfolio y notificaciones en tiempo real.

## Qué problema resuelve

La información de mercado suele estar fragmentada en múltiples fuentes y obliga a monitoreo manual.
NotiFinance centraliza ese flujo: ingesta datos, evalúa reglas de alerta del usuario y entrega notificaciones accionables por canales configurables.

## Cómo lo resuelve

- Backend event-driven con NestJS, PostgreSQL, Redis y RabbitMQ.
- Frontend web con Next.js para explorar activos, gestionar watchlist/portfolio y operar alertas.
- Arquitectura hexagonal para mantener separación de responsabilidades, testabilidad y escalabilidad.

## Qué debería saber un recruiter

- Alcance funcional: autenticación, market data, buscador de activos, watchlist, portfolio, alertas, notificaciones y preferencias.
- Calidad técnica: tipado estricto, validación de entrada, pruebas unitarias/e2e y test de arquitectura.
- Enfoque de ingeniería: diseño por capas, contratos explícitos de API y trazabilidad de eventos.
- Estado del proyecto: plan principal implementado y auditado; ver progreso en [docs/implementation-progress.md](docs/implementation-progress.md).

## Quick Start

### Requisitos

- Node.js 20+
- Docker Desktop (o Docker Engine + Compose)

### Instalación

```bash
npm install
cp .env.example .env
```

### Ejecución

```bash
npm run start:dev
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api`
- RabbitMQ UI: `http://localhost:15672`

## Comandos principales

```bash
npm run build
npm run lint
npm test
npm run test:e2e
```

## Documentación

- Arquitectura técnica detallada: [architecture.md](architecture.md)
- Requisitos: [docs/01-requirements-specification.md](docs/01-requirements-specification.md)
- Especificación técnica: [docs/02-technical-specification.md](docs/02-technical-specification.md)
- Plan de implementación: [docs/03-implementation-plan.md](docs/03-implementation-plan.md)
- Estado de implementación: [docs/implementation-progress.md](docs/implementation-progress.md)
