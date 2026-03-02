---
applyTo: "**/*spec.ts"
---
# Reglas de testing E2E / especificaciones

> Ver `.github/project-context.md` para los comandos de E2E y el framework de test del proyecto.

## Principios generales

- Cubrir **flujos de usuario completos** y contratos de integración end-to-end, no detalles de implementación.
- Tests enfocados, determinísticos y fáciles de mantener. Un spec fallido debe comunicar exactamente qué flujo se rompió.
- Seguir el stack de test del repositorio (Jest/Vitest/Playwright o equivalente declarado en `project-context.md`).
- Evitar agregar tests fuera del alcance solicitado.
- **Tests basados en requisitos:** igual que en unit tests, los specs se escriben desde la especificación funcional (`docs/`), no desde la implementación ni los logs del sistema. Si un spec falla, analizar primero si es un bug antes de ajustar el test.

## Tests de compilación y análisis estático (obligatorio como gate de CI)

- **TypeScript:** ejecutar `tsc --noEmit` como primer paso del pipeline — detecta errores de tipo que no aparecen en runtime hasta que se ejecuta el código.
- **Lint:** ejecutar `eslint` con configuración estricta. Los warnings son errores en CI.
- **Architecture tests:** `dependency-cruiser` (preferido — activo, configurable, genera visualizaciones del grafo) o `tsarch` (más simple pero mantenimiento esporádico) verifican que las reglas de dependencias entre capas no se violen. Un fallo acá bloquea el merge inmediatamente.
- Estos checks deben correr en < 30 segundos. Son los más rápidos y dan feedback inmediato al desarrollador.
- Un error de compilación en CI es siempre un bloqueante de merge, sin excepciones.

## Tests de smoke (sanidad básica del sistema)

- Son tests de **integración mínima** que verifican que el sistema arranca y los flujos más críticos responden correctamente. No testean lógica de negocio en profundidad.
- Deben poder ejecutarse en < 2 minutos en CI.
- Cubrir obligatoriamente:
  - El sistema arranca sin errores de configuración
  - El endpoint `/health` responde `200` y todas las dependencias (DB, cache, broker) están `up`
  - El endpoint de autenticación responde (no necesariamente con credenciales válidas)
  - Al menos un endpoint crítico de cada módulo principal responde con el status code esperado
- Si los smoke tests fallan, no tiene sentido ejecutar el resto del pipeline. Deben ir primero.

## Tests de integración con sistemas externos

- Testear la **superficie de contacto** con cada sistema externo (APIs de terceros, brokers de mensajería, servicios de email/SMS, etc.).
- Estrategia según ambiente:
  - **CI/Unit level:** usar dobles de test (mocks/stubs del adapter) que simulan respuestas reales del sistema externo. Cubrir: respuesta exitosa, timeout, error del servidor externo (5xx), rate limit (429).
  - **Integration level (ambiente dedicado):** usar la API real del sistema externo con credenciales de sandbox/test. Nunca las credenciales de producción.
  - **Contract testing:** documentar el esquema esperado de cada response externo. Si la API externa cambia su contrato, los tests de contrato lo detectan antes que el sistema en producción. Herramienta recomendada para consumer-driven contracts: **Pact.io** — permite a cada consumidor definir sus expectativas del proveedor y verificarlas de forma independiente.
- Para mensajería (RabbitMQ, Kafka): testear que los mensajes publicados tienen el schema correcto y que el consumer procesa correctamente mensajes con el formato esperado.
- Para cada cliente HTTP externo: testear qué pasa cuando el sistema externo no está disponible (Circuit Breaker + fallback).
- Aislar estos tests de los unit tests: deben poder ejecutarse selectivamente (con una tag o en un directorio `test/integration/`).

## Detección de regresiones en errores HTTP

- Todo endpoint debe tener al menos un test que verifique que **no retorna 500** ante inputs que el sistema debería manejar gracefully (inputs vacíos, recursos inexistentes, usuarios sin permisos).
- Ante un bug de producción: el primer paso es agregar un test que lo reproduzca (fallará) y luego corregir la implementación (el test pasa). Esto garantiza que el bug no vuelva.

## E2E con Playwright (cuando aplique)

- **Siempre** ejecutar con timeout explícito: `--timeout=45000` o configurado en `playwright.config.ts`.
- **Nunca** dejar corridas indefinidas. Si hay timeout, recopilar salida parcial, diagnosticar y proponer fix acotado.
- Usar **Page Object Model (POM)**: cada página/feature tiene su propia clase con locators y acciones encapsuladas.
- Locators: preferir `getByRole`, `getByLabel`, `getByText` sobre selectores CSS o XPath frágiles.
- **Nunca** usar `page.waitForTimeout(ms)` (espera fija). Usar `waitForSelector`, `waitForResponse` o `waitForLoadState`.
- Limpiar estado (DB, sesión, localStorage) entre tests. Cada spec debe ser autocontenido.
- Screenshots y videos de falla habilitados en CI para diagnóstico.

## Tests de arquitectura (spec de estructura)

- Verificar reglas de dependencias entre capas usando herramientas de análisis estático.
- **Herramienta preferida: `dependency-cruiser`**. Alternativa: `tsarch` (usar si `dependency-cruiser` resulta excesivo, pero verificar que esté actualizada).
- Ejecutar como parte del gate de CI. Un fallo acá bloquea el merge.

## Reglas de calidad

- Setup y teardown explícitos: `beforeAll`/`afterAll` para estado costoso de crear (DB seed), `beforeEach`/`afterEach` para estado rápido.
- Sin dependencias entre specs: el orden de ejecución no debe importar.
- Prohibido `console.log` en specs de CI. Usar reporters del framework.
