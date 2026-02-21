# NotiCore Architecture & Design Document

## System Overview
NotiCore is a backend event-driven engine designed to dynamically ingest business events, evaluate user preferences, parse text templates via string interpolation, and dispatch final notifications across various Channels (Email, SMS, In-App).

## Key Architectural Decisions

### 1. Hexagonal Architecture (Ports and Adapters)
The project is strictly divided into Domain, Application, and Infrastructure layers.
- **Domain**: Contains plain TypeScript entities (`EventPayload`, `UserPreference`, `NotificationTemplate`). Contains absolutely no framework couplings.
- **Application**: Contains Use Cases and Orchestration (`DispatcherService`, `EventIngestionService`). Defines `Ports` for outbound limits (e.g. `IEventPublisher`, `IPreferencesRepository`).
- **Infrastructure**: Implements `Adapters` for the outward facing parts of the application. Includes REST Controllers, RabbitMQ Consumers, TypeORM Repositories, and Channel Delivery Workers.

### 2. Idempotency & Message Guarantees
- **Ingestion**: The HTTP API POST `/events` sits behind an `IdempotencyInterceptor`. It utilizes `Redis SET NX` caching to assure an `eventId` can only be queued once within a 24-hour window, returning a 200 OK early for exact duplicates instead of 202 Accepted.
- **Processing**: The Core Engine consumes off `RabbitMQ` (`notification_events` queue). It explicitly utilizes Manual Acknowledgments (Ack/Nack):
  - **Logical/Business Errors**: E.g., `NotFoundException` when a Template does not exist -> **Ack** (drop message to prevent poison pill loops).
  - **Technical/Transient Errors**: E.g., Database timeout -> **Nack** (re-queue for retry strategy).

### 3. Distributed Tracing
End-to-end tracing is maintained globally. An HTTP request generating or passing an `x-correlation-id` propagates it through:
1. Pino Logger Context (HTTP Middleware).
2. RabbitMQ Message headers.
3. Microservice Worker Context.
4. Channel Providers log outputs.

### 4. Strictness & Safety
We leverage `strict: true` TSConfig preventing implicit `any`. All TypeORM database entities leverage definitely assigned assertions (`!`) to maintain safety without turning off class property validations. All incoming HTTP data is validated against DTOs using native `class-validator` metadata.

## Module Structure Summary
- **IngestionModule**: HTTP -> Redis Idempotency -> RabbitMQ Publisher
- **PreferencesModule**: CRUD logic for User Notification rules -> PostgreSQL
- **TemplateModule**: Compilation engine substituting `{{ var }}` strings -> PostgreSQL
- **NotificationModule**: RabbitMQ Consumer -> `DispatcherService` -> Resolves Preferences + Template -> Dispatches to injected `CHANNEL_PROVIDERS`.
