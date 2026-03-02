# Backend Development Standards: Config, Security, Conventions

## 13. Configuration and Environment

- **Strict Config:** NEVER read directly from `process.env` in the codebase.
- Use NestJS `@nestjs/config`. Register configurations using the Factory pattern (`registerAs`).
- Inject strictly typed configuration objects into your services via `@Inject(featureConfig.KEY)`.

---

## 14. Security and Validation

- Set up a global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` to prevent Mass Assignment.
- **CORS and Helmet:** Configure CORS securely using `app.enableCors()` with explicit origins. Use `helmet()` to set standard HTTP security headers.
- **Rate Limiting:** Implement `@nestjs/throttler` globally or per-controller for public endpoints to prevent abuse.
- **Authentication** via JWT (Guards). Role-based access via custom `@Roles()` decorators.
- **Secrets:** NEVER hardcode. Inject via `ConfigService`.
- **Prevent SQL Injection:** Strictly use ORM methods or parameterized Query Builders.

---

## 15. Code Conventions and Formatting

- **Naming:** `camelCase` for variables and functions, `PascalCase` for classes and interfaces, `SCREAMING_SNAKE_CASE` for global constants.
- **Formatting:** Rely on Prettier and ESLint for code formatting. Do not invent custom spacing rules.
- **KISS / YAGNI:** Keep It Simple / You Aren't Gonna Need It. Do not implement over-engineered abstractions for features that don't exist yet.

---

## 19. Anti-Patterns to Avoid

- **Controller containing business logic** or DB queries.
- **Circular dependencies** between services.
- **Boolean parameters** in methods: Use named options objects instead.
- **Mutable default parameters** (e.g., `date = new Date()`).
- **Redundant Comments:** Rely on expressive naming. Only explain "why", not "what".
