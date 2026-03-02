# Backend Development Standards: API, Errors, Docs

## 5. API Design and Pagination

- **RESTful Standards:** Use correct HTTP methods (GET, POST, PUT, PATCH, DELETE) and status codes (200, 201, 204, 400, 401, 403, 404, 409).
- **Collections and Pagination:** NEVER return unpaginated arrays for unbounded queries. Always implement standard pagination DTOs (`PaginatedRequest`: page, limit, sortBy) and return wrapped responses (`PaginatedResponse`: data, total, page, totalPages).

---

## 6. Error Handling

- Create custom domain errors in `domain/errors/` (e.g., `EntityNotFoundError`).
- **NEVER swallow exceptions** (e.g., empty catch blocks). Swallowing errors destroys stack traces.
- Use a **Global Exception Filter** (`infrastructure/primary-adapters/filters/`) to intercept Domain Errors and map them to HTTP Status Codes.

---

## 12. API Documentation (Swagger)

- **Controllers:** Must be decorated with `@ApiTags()`. Endpoints require `@ApiOperation({ summary: '...' })` and accurate `@ApiResponse`.
- **DTOs:** Every property MUST be decorated with `@ApiProperty()`, detailing type, description, and examples.
