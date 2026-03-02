# Backend Development Standards: Typing, DTOs, Patterns

## 3. Typing and DTOs

- **Strict TypeScript:** `any` is FORBIDDEN. It disables compiler checks. Use `unknown` if a payload is truly dynamic, and strictly type-guard it.
- **Enums Exhaustiveness:** When evaluating Enums in `switch` statements, ALWAYS cover all possible cases or provide a fail-safe default case throwing an error.
- **Request DTOs (Data Transfer Objects):**
  - Must use `class-validator` and `class-transformer` decorators to sanitize inputs at the edge.
  - Must implement a `toEntity(): DomainEntity` method to convert raw payloads into valid domain objects before passing them to the application layer.
- **Response DTOs:**
  - Must implement a static `fromEntity(entity: DomainEntity): ResponseDto` factory method to ensure internal domain structures are not leaked.
- **Domain Entities vs DB Entities:** NEVER leak DB models (Prisma) to application/domain. Map them explícitamente en los repositorios/adapters de infraestructura.

---

## 4. Patterns and Implementation Details

- **Dependency Injection (DI):** Always use Constructor Injection. Inject interfaces using string constant Tokens (e.g., `@Inject(USER_REPO) repo: IUserRepository`).
- **Multipath Repository Pattern:** If a repository has multiple data sources (e.g., HTTP vs DB), use NestJS `useFactory` in the module to inject the correct concrete class based on environment variables.
- **Repositories:** Expose specific use-case methods with clear business meaning (e.g., `findActiveUsersByCountry`). Do NOT expose generic CRUD methods.
- **Unit of Work (UoW):** Use for multi-step DB transactions. Implement the UoW in infrastructure and expose an interface to application.
- **Database Records:** Mantener campos comunes de auditoría (`createdAt`, `updatedAt`, `deletedAt`) de forma consistente en schema y mapeos.
- **Database Migrations:** Database schema changes MUST be done via Prisma migrations (`prisma migrate`). Do not apply schema changes manually in production.
- **Controllers:** Keep under 80 lines. Parse HTTP context, execute DTO translation, delegate to Services, and return HTTP Status Codes.
- **Services:** Keep under 200 lines. Focus purely on business logic orchestration. Fail fast using early returns to prevent deep nesting.
