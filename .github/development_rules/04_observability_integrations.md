# Backend Development Standards: Observability and Integrations

## 7. Observability, Logging, and Health

- **Interceptors:** Use NestJS Global Interceptors to log all incoming requests and outgoing responses (Method, URL, Duration, Status Code).
- **Context Logging:** Always log contextual identifiers (`userId`, `orderId`). NEVER log sensitive data (passwords, JWT tokens, PII).
- **Correlation IDs:** Pass a `traceId` or `correlationId` through the execution context to track requests across microservices.
- **Health Checks:** Always implement a `/health` endpoint (using `@nestjs/terminus`) exposing Liveness and Readiness probes, including DB and Redis connection statuses.

---

## 8. External APIs and Clients

- Create dedicated HTTP clients in `secondary-adapters/http/` extending a `BaseHttpClient`.
- External payloads must be strictly typed and validated upon reception.
- Implement **Token Managers** with internal caching for OAuth/external auth to avoid requesting a new token on every outgoing call.
- Use **Circuit Breakers** and exponential backoff strategies for fault tolerance.

---

## 9. Caching

- Define cache interfaces in `application/interfaces/`. Implement logic in `infrastructure/secondary-adapters/` (in-memory en el estado actual del proyecto).
- ALWAYS set a **TTL** (Time-To-Live). Infinite cache is forbidden.
- Use structured cache keys: `feature:entity:id`.
- **Handle Cache Stampede:** If a distributed cache is introduced in the future, add lock/coordination mechanisms for heavy concurrent queries.

---

## 10. Messaging and Event-Driven (cuando aplique)

- **Publishers:** Are `secondary-adapters`. Define `IMessagePublisher` in `application`.
- **Consumers:** Are `primary-adapters`. They act like Controllers.
- **Idempotency is MANDATORY:** Guarantee that receiving the same message twice is safe (Inbox pattern).
- Validate incoming message payloads via strict schemas before processing.
- If messaging is introduced, implement **Dead Letter Queues (DLQ)** for terminal failures instead of infinite retries.

---

## 11. Background Jobs and Cron

- Keep Job processors in `primary-adapters/jobs/`.
- Jobs must be completely **stateless**. Process in batches (e.g., chunk size 100) to avoid memory overflow.
- Jobs must log their lifecycle clearly: start time, total records, success/failure counts.
