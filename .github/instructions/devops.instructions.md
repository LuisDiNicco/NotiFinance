---
applyTo: "Dockerfile,docker-compose*,.github/workflows/**"
---
# Reglas de DevOps — Contenedores y CI/CD (agnóstico)

> Ver `development_rules.md §16` para reglas de Docker con ejemplos del proyecto actual.
> Ver `project-context.md` para los comandos reales de build, test, lint y e2e del proyecto.

## Docker — Buenas prácticas de contenedores

### Dockerfile

- **Multi-stage build obligatorio:** etapas `base` → `build` → `prod`. La imagen final solo contiene artefactos necesarios para ejecutar.
- La etapa final **NO debe incluir**: devDependencies, código fuente, archivos de test, `.env`, herramientas de compilación.
- Solo copiar al layer final: `dist/`, `package.json`, `node_modules` (solo producción).
- **Ejecutar como usuario no-root:** `USER node` (o equivalente no-privilegiado) en la etapa final. Nunca correr como `root` en producción.
- Fijar versión de imagen base: no usar `node:latest`. Usar `node:22-alpine` o similar con versión explícita.
- `.dockerignore` debe excluir: `node_modules/`, `.env`, `.env.*`, `coverage/`, `test/`, `.git/`.
- Nunca copiar ni compilar archivos `.env` dentro de la imagen.

### docker-compose

- Variables de entorno sensibles: usar `env_file` apuntando a `.env` local, nunca hardcodeadas en `docker-compose.yml`.
- Definir `healthcheck` para cada servicio con dependencias críticas (DB, cache, broker).
- Usar `depends_on` con `condition: service_healthy` para garantizar orden de arranque.
- En `docker-compose.prod.yml`: sin volúmenes de código fuente montados. Solo datos persistentes.
- Limitar recursos (`mem_limit`, `cpus`) en ambientes de producción para prevenir resource starvation.

## CI/CD — GitHub Actions / Pipeline genérico

### Gate obligatorio en cada PR

El pipeline debe ejecutar en este orden y bloquearse si algún paso falla:

1. **Install** — Instalar dependencias con lockfile (`npm ci`, `pnpm install --frozen-lockfile`, etc.)
2. **Lint** — Ejecutar `lint` según `project-context.md`. Warnings son errores en CI.
3. **Type check** — `tsc --noEmit`. Sin errores de tipado.
4. **Unit + Integration tests** — Con cobertura. Umbrales mínimos según `development_rules.md §18`.
5. **Build** — Verificar que el build de producción completa sin errores.
6. **Security scan** — `npm audit --audit-level=high`. Bloquear en vulnerabilidades high/critical.

### E2E (cuando aplique)

- Ejecutar en entorno aislado con servicios levantados via docker-compose de test.
- Siempre con timeout explícito. Artefactos de falla (screenshots, videos) guardados.
- Puede correr en paralelo al gate de PR pero no bloquear merge si el entorno de E2E es inestable (tratar como advisory en primera iteración).

### Principios de pipeline

- **Fail fast:** los pasos más rápidos (lint, type-check) van primero para dar feedback rápido.
- **Reproducibilidad:** el pipeline debe poder ejecutarse localmente con los mismos comandos que en CI.
- **Sin secretos en logs:** enmascarar variables sensibles. Nunca printear keys o tokens.
- **Artefactos:** guardar reportes de cobertura y resultados de tests como artifacts del workflow.
- **Cache de dependencias:** cachear `node_modules` por hash del lockfile para acelerar corridas.

## Observabilidad operacional

- `/health` endpoint respondiendo liveness y readiness antes de dar tráfico al contenedor.
- Logs estructurados (JSON) para facilitar ingesta en plataformas centralizadas.
- Correlation ID propagado en cada request para trazabilidad cross-service.
