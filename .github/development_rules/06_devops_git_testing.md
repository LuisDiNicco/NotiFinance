# Backend Development Standards: DevOps, Git, Testing

## 16. Infrastructure as Code (Docker)

If generating or modifying Dockerfile:
- Use **Multi-stage builds** (base, build, prod) to keep final images small.
- Ensure the final execution runs as a **non-root user** (e.g., `USER node`).
- Only copy `dist/`, `package.json`, and `node_modules` to the final layer.
- Never compile or copy `.env` files into the image.

---

## 17. Git and Version Control Conventions

Follow **Conventional Commits**:
- `feat:` (New feature)
- `fix:` (Bug fix)
- `refactor:` (Refactoring code without changing behavior)
- `chore:` (Config, tooling, dependencies)
- `test:` (Adding/fixing tests)
- Messages must be in the **imperative mood** (e.g., "feat: add user creation endpoint").

---

## 18. Testing Standards

- **Unit Tests** (`test/unit/`): Required for `application/services` and `domain/entities`. Use Mocks to isolate logic. Target >80% coverage.
- **Integration Tests** (`test/integration/`): Required for API endpoints (Supertest preferred).
- **Architecture Tests** (`test/architecture/`): Enforce Clean Architecture rules using tools like `tsarch`.
