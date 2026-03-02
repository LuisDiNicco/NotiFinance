# Backend Development Standards: Architecture

**Context:** Node.js, TypeScript, NestJS backend projects.
**Role:** Enforce Clean/Hexagonal Architecture, strict typing, and high-quality software engineering practices.

---

## 1. Architecture and Dependencies (Critical)

- **Pattern:** Clean/Hexagonal Architecture. Business logic must be framework-agnostic and highly testable.
- **Layers:** `domain` (inner, core rules), `application` (middle, use cases), `infrastructure` (outer, I/O and frameworks).

### Strict Dependency Rules
1. **domain** MUST NOT depend on ANY other layer, framework, or library (except core TS). No NestJS decorators (`@Injectable`), no Prisma imports (`@prisma/client`), and no Axios imports.
2. **application** depends ONLY on `domain`. It orchestrates business flows using domain entities.
3. **infrastructure** depends on `application` and `domain`. This is where NestJS, Prisma, and external SDKs live.
4. **primary-adapters** (HTTP controllers, message consumers) MUST NOT depend on **secondary-adapters** (DB, external APIs). Orchestrate them strictly via application services.
5. **Cross-layer communication** MUST use Interfaces defined in `application`. The infrastructure layer implements these interfaces (Dependency Inversion).

---

## 2. Project Structure

Enforce this specific folder structure to maintain boundaries:

```text
src/
├── main.ts & AppModule.ts
├── domain/            # Pure business rules and models
│   ├── entities/      # Pure TS classes with business methods (e.g., `applyDiscount()`)
│   ├── enums/         # PascalCase names, SCREAMING_SNAKE_CASE values
│   └── errors/        # Custom error classes extending native Error
├── application/       # Orchestration and Port definitions
│   ├── interfaces/    # Repository/Service contracts (Prefix 'I', export const Token)
│   └── services/      # Use cases (Max 200 lines). One public method per use-case preferred.
└── infrastructure/    # Framework & External dependencies (Adapters)
    ├── base/          # Cross-cutting concerns: Config, logger, global filters, interceptors
    ├── primary-adapters/    # Input: Controllers, Guards, Webhooks, Consumers
    └── secondary-adapters/  # Output: DB, Redis, External APIs, Publishers
    ├── database/  # Prisma models/mappers y Repositories implementing app interfaces
        └── http/      # Axios/Fetch clients for external APIs, DTOs for external payloads
```
