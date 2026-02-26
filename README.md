# NotiFinance Backend

NotiFinance is an event-driven backend for market monitoring, alerts, notifications, portfolios, and watchlists. It is built with NestJS + TypeORM, using Hexagonal Architecture and an asynchronous event flow over RabbitMQ.

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (or Docker Engine + Compose)

### Setup

```bash
npm install
cp .env.example .env
```

### Run

```bash
npm run start:dev
```

- API base URL: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/api`
- RabbitMQ UI: `http://localhost:15672`

## Main API Domains

- `Auth`: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/demo`
- `Market`: `GET /market/dollar`, `GET /market/risk`, `GET /market/summary`, `GET /market/status`, `GET /market/top-movers`
- `Assets`: `GET /assets`, `GET /assets/:ticker`, `GET /assets/:ticker/quotes`, `GET /search`
- `Watchlist`: `GET /watchlist`, `POST /watchlist`, `DELETE /watchlist/:ticker`
- `Portfolio`: `POST /portfolios`, `GET /portfolios`, `GET /portfolios/:id`, `POST /portfolios/:id/trades`, `GET /portfolios/:id/holdings`, `GET /portfolios/:id/distribution`
- `Alerts`: `POST /alerts`, `GET /alerts`, `PATCH /alerts/:id`, `PATCH /alerts/:id/status`, `DELETE /alerts/:id`
- `Notifications`: `GET /notifications`, `GET /notifications/count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `DELETE /notifications/:id`

## Environment Variables

Key variables (see `.env.example`):

- App: `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `THROTTLE_TTL`, `THROTTLE_LIMIT`
- Integrations: `DATABASE_URL`, `REDIS_URL`, `RABBITMQ_URL`, `RUN_MIGRATIONS`
- Auth: `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- Market: `DOLAR_API_URL`, `MARKET_CHUNK_DELAY_MS`, `MARKET_QUOTE_RETRY_ATTEMPTS`, `MARKET_QUOTE_RETRY_BASE_DELAY_MS`, `MARKET_STATUS_CACHE_TTL_SECONDS`, `MARKET_TOP_MOVERS_CACHE_TTL_SECONDS`

## Development & Testing Commands

```bash
npm run start:dev
npm run build
npm run lint

npm run test:unit
npm run test:e2e
npm run test:arch
npm run test:unit:cov
npm run test:e2e:cov
```

## Architecture

- High-level architecture: [architecture.md](architecture.md)
- Detailed implementation plan: [docs/03-implementation-plan.md](docs/03-implementation-plan.md)
- Incremental progress log: [docs/implementation-progress.md](docs/implementation-progress.md)
