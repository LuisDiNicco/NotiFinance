# NotiCore Architecture & Design Document

## System Overview

NotiCore is an event-driven notification engine designed to process business events, evaluate user notification preferences, compile templates with runtime data, and dispatch notifications across multiple channels. The system emphasizes reliability, type safety, and clean separation of concerns through Hexagonal Architecture.

## Core Architecture: Hexagonal Pattern (Ports and Adapters)

NotiCore is structured in three strict layers with unidirectional dependency flow:

### Layer 1: Domain (Core Business Logic)
Pure TypeScript business entities with no framework dependencies.

```
domain/
├── entities/          # UserPreference, NotificationTemplate, EventPayload
├── enums/            # NotificationChannel, EventType
└── errors/           # PreferencesNotFoundError, TemplateNotFoundError
```

Characteristics:
- No NestJS decorators, no TypeORM, no external library imports
- Pure business methods (e.g., `canReceiveEventVia()` on UserPreference)
- Single responsibility - each entity represents a core business concept
- Fully testable without mocks or frameworks

### Layer 2: Application (Use Cases & Orchestration)
Orchestrates business flows using domain entities. Defines interfaces (Ports) that specify contracts for external dependencies.

```
application/
├── interfaces/       # IPreferencesRepository, IEventPublisher, IChannelProvider
└── services/         # DispatcherService, TemplateCompilerService, EventIngestionService
```

Characteristics:
- Services orchestrate domain entities (max 200 lines to maintain focus)
- Depends only on domain and interfaces
- Throws domain errors (not NestJS exceptions)
- Services use constructor injection with string tokens for interfaces

### Layer 3: Infrastructure (Frameworks & External Systems)
Implements concrete adapters for all external dependencies.

```
infrastructure/
├── primary-adapters/       # Inbound traffic
│   ├── http/              # Controllers for REST endpoints
│   └── message-brokers/   # RabbitMQ consumers
├── secondary-adapters/     # Outbound traffic
│   ├── database/          # TypeORM repositories + mappers
│   ├── message-brokers/   # RabbitMQ publisher
│   └── workers/           # Channel implementations (Email, SMS, In-App)
└── base/                  # Cross-cutting concerns (logger, filters, config)
```

Characteristics:
- Implements application layer interfaces
- Contains all NestJS decorators, TypeORM entities, external libraries
- Never imports from primary-adapters (e.g., controllers cannot call consumers)
- All external communication flows through interfaces

### Dependency Rule

```
Primary Adapters -----> Application ----> Domain
                            ^
                            |
                        Interfaces
                            ^
                            |
Secondary Adapters
```

**Never violate**: Secondary adapters cannot declare dependencies on primary adapters. Both depend on application interfaces.

## Key Design Decisions

### 1. Request/Response DTOs with Domain Mapping

Every HTTP endpoint receives a Request DTO and returns a Response DTO. DTOs provide three functions:

1. **Input Validation** (Request DTOs)
   ```typescript
   // Request DTO with @IsString, @IsArray decorators (class-validator)
   class PreferencesRequest {
     toEntity(): UserPreference  // Converts validated input to domain
   }
   ```

2. **Type Safety** (Response DTOs)
   ```typescript
   // Response DTO prevents domain entity leakage to HTTP layer
   class UserPreferenceResponse {
     static fromEntity(entity: UserPreference): UserPreferenceResponse
   }
   ```

3. **API Contract** (Swagger @ApiProperty decorators)
   - Documented in OpenAPI spec at `/api`
   - Clear type information for API consumers

### 2. Database Mappers (ORM Decoupling)

TypeORM database entities are never exposed to application layer. Explicit mappers convert between persistence and domain:

```
HTTP Request
    ↓
Request DTO → toEntity() → Domain Entity
                               ↓
                      Application Service
                               ↓
                      Database Mapper: toDomain()
                               ↓
                         TypeORM Entity (persisted)
                               ↓
                      Database Mapper: toPersistence()
                               ↓
                      Response DTO ← fromEntity()
                               ↓
                         HTTP Response
```

Benefits:
- ORM implementation details (timestamps, soft deletes) never reach business logic
- Schema changes isolated to infrastructure layer
- Domain entities remain pure and testable

### 3. Idempotency & Message Guarantees

#### Ingestion Layer (HTTP POST /events)
- All event IDs checked against Redis SET NX operation
- Duplicate events return 200 OK with metadata
- Window: 24 hours (configurable via TTL)
- Prevents message duplication at source

#### Processing Layer (RabbitMQ Consumer)
Two-phase message handling with explicit Ack/Nack:

**Automatic ACK** (message dropped safely):
- Business errors (user not found, template not found)
- User opted-out of event type/channel
- Prevents poison pill loops (infinite retries of unresolvable state)

**Automatic NACK** (message re-queued):
- Technical failures (database timeout, Redis unavailable)
- Transient errors with retry expectation
- Uses RabbitMQ's built-in exponential backoff

### 4. Distributed Tracing via Correlation IDs

Every request through the system maintains a correlation ID for end-to-end tracing:

```
HTTP Header: x-correlation-id
    ↓
Pino Logger Context (HTTP Middleware)
    ↓
ServiceContext (NestJS context service)
    ↓
RabbitMQ Message Headers
    ↓
Consumer (reads from message, propagates to logs)
    ↓
Channel Workers (final log output includes ID)
```

All structured logs include `correlationId` property, enabling:
- Request tracking across async boundaries
- Debugging distributed failures
- Performance analysis per request

### 5. Type Safety & Error Handling

#### TypeScript Strategy
- `tsconfig.json` strict mode enabled
- No `any` types allowed (compile-time enforcement)
- Unknown payloads strictly type-guarded before use
- Exhaustive switch statements on enums

#### Error Handling
Domain errors replace NestJS exceptions:

```typescript
// Domain error (thrown by services)
class PreferencesNotFoundError extends Error {}

// Global filter maps domain errors to HTTP status
CustomExceptionsFilter:
  PreferencesNotFoundError → 404
  TemplateNotFoundError → 404
  ValidationError → 400
  Unexpected → 500
```

Benefits:
- Services remain independent of HTTP layer
- Same error handling in synchronous and async contexts
- Testable without mocking HTTP decorators

### 6. Module Dependencies

Modules enforce the hexagonal pattern through NestJS DI:

**IngestionModule** (Event Entry Point)
- HTTP Controller → Redis Service → RabbitMQ Publisher

**PreferencesModule** (User Settings)
- HTTP Controller → PreferencesService → TypeORM Repository

**TemplateModule** (Template Management)
- HTTP Controller → TemplateCompilerService → TypeORM Repository

**NotificationModule** (Event Processing)
- RabbitMQ Consumer → DispatcherService → PreferencesService + TemplateService → Channel Providers

Each module is self-contained with clear entry/exit points.

## Database Design

### Tables
- `user_preferences`: User notification rule configuration
- `notification_templates`: Event-to-template mapping with compilable content
- Standard audit columns: `id` (UUID), `createdAt`, `updatedAt`, `deletedAt` (soft delete)

### BaseEntity Pattern
All entities inherit from `BaseEntity` abstract class:
- Consolidates common columns in one place
- Reduces repetition across schema migrations
- Enables global soft-delete behavior

### Query Strategy
Repositories expose business-meaningful methods:
- `findByUserId()` instead of `findOne()`
- `findByEventType()` instead of `query("SELECT...")`
- Prevents exposing SQL/ORM details to application layer

## Testing Strategy

### Unit Tests (test/unit/)
Test application services and domain entities in isolation:
- Mock repositories via Dependency Injection
- Verify business logic paths
- No database or RabbitMQ mocking needed
- Target: >80% coverage on core services

### Integration Tests (test/integration/) - Recommended
Test HTTP endpoints with real/test database:
- Spin up temporary test database
- Use supertest for HTTP assertions
- Verify full request → response flow

### E2E Tests (test/)
Full system tests with all backing services:
- Docker containers started
- Real event flow through RabbitMQ
- Message acknowledgment strategies verified

## Infrastructure as Code

### Docker Deployment
Development (`docker-compose.yml`):
- Three services: PostgreSQL, Redis, RabbitMQ
- Health checks enabled
- Persistent volumes for data
- Automatically started on `npm run build` via `scripts/docker-setup.js`

Production (`docker-compose.prod.yml`):
- Application container added
- Multi-stage Dockerfile with production optimizations
- Non-root user execution
- Reference only - production uses managed services

### Container Initialization
`scripts/docker-setup.js` handles:
1. Docker daemon availability check
2. `.env` file creation from template (if missing)
3. Image pull and container startup
4. Health check polling (PostgreSQL, Redis, RabbitMQ)
5. Clear error messages for misconfiguration

## Security & Validation

### Input Validation
- Global ValidationPipe with `whitelist: true`
- Prevents mass assignment vulnerabilities
- class-validator decorators on all DTOs
- Rejects unknown properties

### HTTP Security
- Helmet middleware (CORS, CSP, security headers)
- CORS configured from environment variable
- Rate limiting ready for implementation

### Secret Management
- Never hardcode credentials
- All configuration via environment variables
- `.env.example` provides template with defaults
- Production: Use container secret managers

## Logging & Observability

### Structured Logging (Pino)
- JSON format for log aggregation
- Custom properties: `context`, `correlationId`
- Environment-based log levels (debug/prod)
- FastifyAdapter handles HTTP logging

### Log Levels
- `debug`: Development details, function entry/exit
- `info`: Standard flow (event received, preferences resolved)
- `warn`: Non-fatal issues (user not found, skipped channel)
- `error`: Exceptions and failures

### Correlation ID Propagation
- Extracted from HTTP headers or generated
- Passed through all async operations
- Logged with every message
- Enables request tracing through external log systems

## Extensibility

### Adding New Channels
1. Create new `ChannelAdapter` implementing `IChannelProvider`
2. Register in NotificationModule providers
3. Add enum value to `NotificationChannel`
4. No changes to core dispatcher logic needed

### Adding New Event Types
1. Add to `EventType` enum
2. Create template in database
3. DispatcherService automatically handles routing

### Custom Repositories
1. Implement `IRepository` interface in application
2. Create concrete implementation in infrastructure
3. Register in module with useClass/useFactory
4. Application remains unchanged

## Production Considerations

### Scaling
- RabbitMQ scales horizontally (multiple consumers)
- PostgreSQL benefits from connection pooling
- Redis cluster for distributed caching
- Stateless application design enables multiple instances

### Data Retention
- Soft deletes preserve audit trail
- Migration strategy for schema changes
- Backup PostgreSQL data separately
- Redis data can be reconstructed from events

### Monitoring
- Health endpoint at `/health` (ready for @nestjs/terminus)
- Structured logs to ELK/Datadog/CloudWatch
- Correlation IDs for distributed tracing
- Database connection pool monitoring

## Development Workflow

See [development_rules.md](development_rules.md) for:
- Detailed code standards
- Folder structure enforcement
- Type safety requirements
- Commit conventions
- Testing standards

See [README.md](README.md) for:
- Quick start instructions
- Available npm commands
- Project setup
- Docker management
