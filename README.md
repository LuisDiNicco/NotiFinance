# NotiCore - Event-Driven Notification Engine

NotiCore is a backend notification system that processes events, evaluates user preferences, compiles templates, and dispatches notifications across multiple channels (Email, SMS, In-App). Built with NestJS following Hexagonal Architecture principles with strict separation of concerns, type safety, and distributed tracing.

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose installed

### Setup and Run

```bash
# Install dependencies
npm install

# Start development environment (automatically starts Docker containers)
npm run start:dev

# The application will start on http://localhost:3000
# API documentation available at http://localhost:3000/api
```

### Available Commands

```bash
npm run build              # Compile TypeScript
npm run start              # Run production build
npm run start:debug        # Debug mode
npm test                   # Run unit tests
npm run test:cov          # Run tests with coverage
npm run test:e2e          # Run end-to-end tests
npm run lint              # Check and fix code style
npm run docker:up         # Start Docker containers manually
npm run docker:down       # Stop Docker containers
npm run docker:logs       # View container logs
```

## How It Works

1. Client sends event via HTTP POST `/events` with validated payload
2. Idempotency check via Redis (no duplicate processing)
3. Event published to RabbitMQ message queue
4. Background consumer receives event
5. Consumer resolves user preferences and notification template
6. Template compiled with event data
7. Notification dispatched to enabled channels (Email, SMS, In-App)

## Project Structure

```
src/
├── domain/              # Business logic (entities, enums, errors)
├── application/         # Use cases and orchestration (services, interfaces)
└── infrastructure/      # Framework implementations (adapters, repositories, controllers)
    ├── primary-adapters/      # HTTP controllers, message consumers
    └── secondary-adapters/    # Database, external APIs, channel implementations
```

## Core Features

- Event ingestion with idempotency guarantees via Redis
- RabbitMQ message routing with manual acknowledgment strategy
- Template engine supporting variable interpolation
- Multi-channel notification dispatch (Email, SMS, In-App)
- Comprehensive input validation with class-validator
- Distributed tracing with correlation IDs
- Structured logging via Pino
- Type-safe database layer with TypeORM

## Database & Services

The application requires three backing services (automatically started):

- PostgreSQL 15: Event and configuration storage
- Redis 7: Idempotency caching and distributed locks
- RabbitMQ 3: Event message queue with management UI at http://localhost:15672

Connection details are configured via `.env` file (created automatically from `.env.example` on first run).

## Environment Setup

On first run, `.env` is automatically created from `.env.example` with sensible defaults. For production or custom configuration, edit `.env` with appropriate values before starting the application.

## Architecture Details

For comprehensive architectural decisions, layer separation, design patterns, and implementation details see [architecture.md](architecture.md).

## Development Standards

The project enforces Clean/Hexagonal Architecture through strict folder structure and dependency rules. All code must maintain type safety (TypeScript strict mode), pass ESLint validation, and be covered by tests. See [development_rules.md](development_rules.md) for detailed standards.
