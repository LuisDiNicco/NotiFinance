# NotiFinance — Implementation Progress

**Fecha:** 2026-02-27
**Scope actual:** Frontend Fase F2 (Layout & Navigation) completada

## Estado general

- Plan total: **Backend cerrado, Frontend en progreso**
- Fase actual: **Frontend F2 completada**
- Última fase cerrada: **Frontend F2**

## Fases completadas (Frontend)

### ✅ F1 — Project Setup & Foundation

Implementado en frontend:
- Scaffold de Next.js 15 (App Router)
- Configuración de Tailwind CSS v4 y shadcn/ui
- Configuración de Zustand (authStore, themeStore)
- Configuración de TanStack Query (React Query)
- Configuración de Socket.io-client
- Configuración de Axios con interceptores (JWT refresh)
- Configuración de Vitest y ESLint 9 (Flat Config)
- Estructura base de providers y layouts
- Rutas placeholder para todas las páginas

Validación realizada:
- ✅ `npm run lint` (OK)
- ✅ `npm run test` (OK)
- ✅ `npm run build` (OK)

### ✅ F2 — Layout & Navigation

Implementado en frontend:
- Root layout (`app/layout.tsx`) con Inter font, metadata y providers
- Componente `Sidebar` con navegación pública y protegida
- Componente `MobileSidebar` (Sheet) para responsive
- Componente `Header` con barra superior
- Componente `ThemeToggle` para dark/light mode
- Componente `NotificationBell` con badge de no leídos
- Componente `UserMenu` con avatar y opciones de sesión
- Componente `CommandPalette` (Ctrl+K) con debounce y búsqueda agrupada
- Tests unitarios para componentes de layout (`Sidebar`, `UserMenu`, `NotificationBell`)

Validación realizada:
- ✅ `npm run lint` (OK)
- ✅ `npm run test` (OK)
- ✅ `npm run build` (OK)

## Fases completadas (Backend)

### ✅ B1 — Foundation & Auth

Implementado en backend:

- Dependencias de autenticación instaladas:
  - `@nestjs/jwt`
  - `@nestjs/passport`
  - `passport`
  - `passport-jwt`
  - `bcrypt`
- Nuevo módulo `auth` completo:
  - Domain:
    - `User`
    - `InvalidCredentialsError`
    - `EmailAlreadyExistsError`
  - Application:
    - `IUserRepository`
    - `AuthService` (register, login, refreshToken, createDemoSession, validateUser)
  - Infrastructure:
    - `UserEntity`, `UserMapper`, `UserRepository`
    - `JwtStrategy`
    - `JwtAuthGuard`, `OptionalJwtAuthGuard`
    - `AuthController` (`POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/demo`)
    - Response DTOs (`AuthResponse`, `RefreshTokenResponse`, `UserAuthResponse`)
    - Request DTOs (`RegisterRequest`, `LoginRequest`, `RefreshTokenRequest`)
- Configuración agregada:
  - `auth.config.ts`
  - integración en `AppModule` (`ConfigModule.load` + `AuthModule`)
  - variables JWT en `env.validation.ts` y `.env.example`
- Error handling:
  - Mapeo de `InvalidCredentialsError` => `401`
  - Mapeo de `EmailAlreadyExistsError` => `409`
- Swagger branding actualizado a NotiFinance API.
- Migración creada:
  - `1760000000001-CreateUsersTable.ts`

Validación realizada:

- ✅ `npm run build` (OK)
- ✅ `npx jest --config ./test/jest-unit.json --runInBand --coverage=false test/unit/modules/auth/application/AuthService.spec.ts` (OK)
- ✅ `npx jest --config ./test/jest-e2e.json --runInBand --coverage=false test/auth.e2e-spec.ts` (OK)

### ✅ B2 — Market Data Module (baseline + persistencia inicial)

Implementado en backend:

- Nuevo módulo `market-data` con arquitectura hexagonal:
  - Domain:
    - `Asset`, `DollarQuote`, `CountryRisk`
    - `AssetType`, `DollarType`
    - `AssetNotFoundError`
  - Application:
    - `IAssetRepository`, `IDollarProvider`, `IRiskProvider`
    - `IDollarQuoteRepository`, `ICountryRiskRepository`
    - `MarketDataService`
  - Infrastructure:
    - `TypeOrmAssetRepository` (reemplaza catálogo estático en runtime)
    - `TypeOrmDollarQuoteRepository`
    - `TypeOrmCountryRiskRepository`
    - entidades TypeORM: `AssetEntity`, `MarketQuoteEntity`, `DollarQuoteEntity`, `CountryRiskEntity`
    - `DolarApiClient` (consume `GET /dolares`)
    - `RiskProviderClient` (consume `GET /riesgo-pais`)
    - `YahooFinanceClient` (quotes e históricos por `yahoo-finance2`)
    - `TypeOrmQuoteRepository` para `market_quotes`
    - `MarketController` (`GET /market/dollar`, `/market/risk`, `/market/summary`)
    - `AssetController` (`GET /assets`, `GET /assets/:ticker`)
    - `SearchController` (`GET /search`)
    - DTOs de query con validación para assets/search
- Integración en `AppModule`:
  - `MarketDataModule`
  - `market.config.ts`
  - variable de entorno `DOLAR_API_URL`
- Persistencia y migraciones de mercado agregadas:
  - `1760000000002-CreateMarketDataTables.ts`
  - `1760000000003-SeedInitialAssets.ts`
- Estrategia de resiliencia en `MarketDataService`:
  - fallback a datos persistidos cuando falla proveedor de dólar o riesgo
  - fallback a datos persistidos para históricos de activos por ticker
- Endpoint agregado:
  - `GET /assets/:ticker/quotes?days=30` (histórico por activo)
- Jobs de actualización agregados:
  - `DollarFetchJob` (`*/5 * * * *`)
  - `RiskFetchJob` (`*/10 * * * *`)
  - `StockQuoteFetchJob` (`*/5 10-17 * * 1-5`)
  - `CedearQuoteFetchJob` (`*/5 10-17 * * 1-5`)
  - `BondQuoteFetchJob` (`*/15 10-17 * * 1-5`)
- Publicación de eventos de mercado al broker desde `MarketDataService`:
  - `market.dollar.updated`
  - `market.risk.updated`
  - `market.quote.updated` (por activo actualizado)
- `ScheduleModule.forRoot()` habilitado en `AppModule`.
- `IngestionModule` exporta `EVENT_PUBLISHER` para reutilización inter-módulo.
- Endpoint agregado:
  - `GET /market/status` (estado de mercado, cron schedules y timestamps de última actualización)
  - `GET /market/top-movers?type=STOCK&limit=5` (gainers/losers por tipo de activo + metadata de asset)
- Refactor de refresh de quotes:
  - procesamiento por chunks por tipo de activo para stocks/cedears/bonos
  - retry exponencial por quote (backoff) + delay configurable entre chunks
  - nuevos parámetros de configuración:
    - `MARKET_CHUNK_DELAY_MS`
    - `MARKET_QUOTE_RETRY_ATTEMPTS`
    - `MARKET_QUOTE_RETRY_BASE_DELAY_MS`
- Cache Redis aplicado:
  - `market:status` (TTL configurable)
  - `market:top-movers:{type}:{limit}` (TTL configurable)
  - nuevos parámetros: `MARKET_STATUS_CACHE_TTL_SECONDS`, `MARKET_TOP_MOVERS_CACHE_TTL_SECONDS`
- Error handling:
  - Mapeo de `AssetNotFoundError` => `404`
- Dependencias agregadas para fase de mercado:
  - `@nestjs/schedule`, `axios`, `yahoo-finance2`, `cheerio`

Validación realizada:

- ✅ `npm run build` (OK)
- ✅ `npx jest --config ./test/jest-unit.json --runInBand --coverage=false test/unit/modules/market-data/application/MarketDataService.spec.ts` (OK)
- ✅ `npx jest --config ./test/jest-e2e.json --runInBand --coverage=false test/market-data.e2e-spec.ts` (OK)

### ✅ B3 — Alert Module (base funcional)

Implementado en backend:

- Nuevo módulo `alert` con arquitectura hexagonal:
  - Domain:
    - `Alert`
    - `AlertType`, `AlertCondition`, `AlertStatus`
    - `AlertLimitExceededError`, `AlertNotFoundError`
  - Application:
    - `IAlertRepository`
    - `AlertService` (create/list/update/status/delete)
    - `AlertEvaluationEngine` (asset/dollar/risk)
  - Infrastructure:
    - `AlertEntity`, `AlertMapper`, `TypeOrmAlertRepository`
    - `AlertController` protegido con `JwtAuthGuard`
    - `AlertEvaluationConsumer` para eventos de mercado
    - DTOs request para create/update/status
- Integración en `AppModule`:
  - `AlertModule`
- Eventos:
  - `EventType.ALERT_TRIGGERED` agregado
  - publicación de `alert.triggered` cuando se dispara una alerta
- Migración creada:
  - `1760000000004-CreateAlertsTable.ts`
- Error handling:
  - Mapeo de `AlertNotFoundError` => `404`
  - Mapeo de `AlertLimitExceededError` => `409`

Validación realizada:

- ✅ `npm run build` (OK)
- ✅ `npx jest --config ./test/jest-unit.json --runInBand --coverage=false test/unit/modules/alert/application/AlertService.spec.ts test/unit/modules/alert/application/AlertEvaluationEngine.spec.ts test/unit/modules/alert/domain/entities/Alert.spec.ts` (OK)
- ✅ `npx jest --config ./test/jest-e2e.json --runInBand --coverage=false test/alert.e2e-spec.ts` (OK)

## Pendiente inmediato (siguiente fase)

### ✅ B4 — Notification Module Expansion (base funcional)

Implementado en backend:

- Persistencia de notificaciones:
  - Domain: `Notification`
  - Application: `INotificationRepository`, `NotificationService`
  - Infrastructure: `NotificationEntity`, `NotificationMapper`, `TypeOrmNotificationRepository`
- HTTP autenticado:
  - `NotificationController`
  - endpoints:
    - `GET /notifications`
    - `GET /notifications/count`
    - `PATCH /notifications/:id/read`
    - `PATCH /notifications/read-all`
    - `DELETE /notifications/:id`
- Integración en flujo existente:
  - `DispatcherService` persiste notificación antes de enviar por canales
- Migración creada:
  - `1760000000005-CreateNotificationsTable.ts`

Validación realizada:

- ✅ `npm run build` (OK)
- ✅ `npx jest --config ./test/jest-unit.json --runInBand --coverage=false test/unit/modules/notification/application/services/DispatcherService.spec.ts` (OK)
- ✅ `npx jest --config ./test/jest-e2e.json --runInBand --coverage=false test/notification.e2e-spec.ts` (OK)

### ✅ B5 — Portfolio & Watchlist (completado)

Próximos entregables técnicos a implementar:

1. `Watchlist` implementado (entidad/servicio/controller/repository + migración + tests).
2. Base de `Portfolio` y `Trade` implementada (dominio + persistencia inicial + migración).
3. Endpoints protegidos para portafolios/trades implementados (base CRUD + record trade).
4. Cálculo inicial de holdings y valorización básica. ✅
5. Hardening de reglas de negocio de trades (SELL/FIFO/validaciones). ✅

Detalle Watchlist ya implementado:

- Nuevo módulo `watchlist`:
  - Domain: `WatchlistItem`
  - Application: `IWatchlistRepository`, `WatchlistService`
  - Infrastructure: `WatchlistItemEntity`, mapper, repo TypeORM, `WatchlistController`
- Endpoints autenticados:
  - `GET /watchlist`
  - `POST /watchlist`
  - `DELETE /watchlist/:ticker`
- Migración creada:
  - `1760000000006-CreateWatchlistItemsTable.ts`

Validación realizada:

- ✅ `npm run build` (OK)
- ✅ `npx jest --config ./test/jest-unit.json --runInBand --coverage=false test/unit/modules/watchlist/application/WatchlistService.spec.ts` (OK)
- ✅ `npx jest --config ./test/jest-e2e.json --runInBand --coverage=false test/watchlist.e2e-spec.ts` (OK)

Detalle Portfolio base ya implementado:

- Nuevo módulo `portfolio`:
  - Domain: `Portfolio`, `Trade`, `TradeType`
  - Application: `PortfolioService`, `TradeService`, `IPortfolioRepository`, `ITradeRepository`
  - Infrastructure: entidades/mappers/repos TypeORM para portfolio y trades, `PortfolioController`
- Endpoints autenticados:
  - `POST /portfolios`
  - `GET /portfolios`
  - `GET /portfolios/:id`
  - `DELETE /portfolios/:id`
  - `POST /portfolios/:id/trades`
  - `GET /portfolios/:id/trades`
- Migración creada:
  - `1760000000007-CreatePortfolioTables.ts`

Validación realizada:

- ✅ `npm run build` (OK)
- ✅ `npx jest --config ./test/jest-unit.json --runInBand --coverage=false test/unit/modules/portfolio/application/PortfolioService.spec.ts` (OK)
- ✅ `npx jest --config ./test/jest-e2e.json --runInBand --coverage=false test/portfolio.e2e-spec.ts` (OK)

Detalle Portfolio hardening implementado:

- Validaciones de negocio sobre trades:
  - `TradeService` valida ownership de portfolio por usuario.
  - para `SELL` se valida disponibilidad de cantidad usando cálculo FIFO.
  - nuevos errores de dominio: `PortfolioNotFoundError`, `InsufficientHoldingsError`.
- Cálculo de holdings y distribución:
  - `HoldingsCalculator` implementa lotes FIFO y valorización por precio actual.
  - `PortfolioService` expone cálculo de holdings y weights de distribución.
  - nuevos endpoints: `GET /portfolios/:id/holdings` y `GET /portfolios/:id/distribution`.
- Error handling global:
  - mapeo de `PortfolioNotFoundError` => `404`
  - mapeo de `InsufficientHoldingsError` => `409`

Validación realizada:

- ✅ `npm run build` (OK)
- ✅ `npx jest --config ./test/jest-unit.json --runInBand --coverage=false test/unit/modules/portfolio/application/PortfolioService.spec.ts` (OK)
- ✅ `npx jest --config ./test/jest-e2e.json --runInBand --coverage=false test/portfolio.e2e-spec.ts` (OK)

### ✅ B6 — EventType Migration & Integration

Implementado en backend:

- Migración de tipos de evento:
  - removidos tipos legacy (`payment.success`, `security.login_alert`, etc.)
  - agregados tipos financieros `market.*` y `alert.*` específicos (price/dollar/risk/pct)
- RabbitMQ topology actualizada:
  - exchange topic `notifinance.events`
  - colas dedicadas `alert-evaluation-queue` y `notification-events-queue`
  - bindings `market.*`/`market.#` y `alert.*`/`alert.#`
  - DLQ por cola
- Integración de consumidores/publicador:
  - market events entran por `market.*`
  - alert events se publican en tipos `alert.*` específicos según condición
- Seeds financieras de templates:
  - nueva migración `1760000000008-SeedFinancialNotificationTemplates.ts`
  - upsert para templates de `alert.price.*`, `alert.dollar.*`, `alert.risk.*`, `alert.pct.*`
- Test de integración de flujo agregado:
  - `test/event-flow.e2e-spec.ts` valida chain market→alert→notification.

Validación realizada:

- ✅ `npm run build` (OK)
- ✅ `npx jest --config ./test/jest-unit.json --runInBand --coverage=false test/unit/modules/ingestion/application/EventIngestionService.spec.ts test/unit/modules/notification/application/services/DispatcherService.spec.ts test/unit/modules/preferences/application/PreferencesService.spec.ts test/unit/modules/preferences/domain/entities/UserPreference.spec.ts` (OK)
- ✅ `npx jest --config ./test/jest-e2e.json --runInBand --coverage=false test/ingestion.e2e-spec.ts test/event-flow.e2e-spec.ts test/app.e2e-spec.ts test/notification.e2e-spec.ts` (OK)

### ✅ B7 — Demo Mode & Seeds

Implementado en backend:

- Nuevo `DemoSeedService` en auth:
  - crea usuario demo
  - crea portfolio demo con posiciones iniciales (acciones, CEDEARs y bonos)
  - crea watchlist demo con 10 activos
  - crea 3 alertas demo (precio, dólar, riesgo)
  - crea 5 notificaciones de ejemplo
- `AuthService.createDemoSession()` actualizado:
  - delega seed al `DemoSeedService`
  - retorna token de acceso demo con TTL 24h (sin refresh)
- Limpieza automática de demos:
  - nuevo `DemoUsersCleanupJob` con `@Cron('0 4 * * *')`
  - elimina usuarios demo con más de 24h vía `deleteExpiredDemoUsers`
- Wiring de módulo:
  - `AuthModule` integra dependencias de portfolio/watchlist/alert/notification/market para seeding.

Validación realizada:

- ✅ `npx nest build` (OK) *(fallback porque Docker daemon no estaba activo para `npm run build`)*
- ✅ `npx jest --config ./test/jest-unit.json --runInBand --coverage=false test/unit/modules/auth/application/AuthService.spec.ts test/unit/modules/auth/application/DemoSeedService.spec.ts test/unit/modules/auth/application/DemoUsersCleanupJob.spec.ts` (OK)
- ✅ `npx jest --config ./test/jest-e2e.json --runInBand --coverage=false test/auth.e2e-spec.ts` (OK)

### ✅ B8 — Testing & Quality

Implementado en backend:

- Nuevos unit tests agregados:
  - `HoldingsCalculator` (FIFO, valorización y pesos)
  - `TradeService` (BUY y validación de SELL por holdings)
  - `NotificationService` (create/read/delete con ownership)
  - entidad `User` y value object `Holding`
- E2E ampliados:
  - `portfolio.e2e-spec.ts` con endpoints `GET /portfolios/:id/holdings` y `GET /portfolios/:id/distribution`
  - `market-data.e2e-spec.ts` con `GET /market/summary` y `GET /assets/:ticker`
- Architecture test reforzado:
  - validación de existencia de módulos core del backend
  - regla de acoplamiento application→infrastructure ajustada para detectar imports de infraestructura de módulos.

Validación realizada:

- ✅ `npx nest build` (OK)
- ✅ `npx jest --config ./test/jest-unit.json --runInBand --coverage=false test/unit/modules/portfolio/application/HoldingsCalculator.spec.ts test/unit/modules/portfolio/application/TradeService.spec.ts test/unit/modules/notification/application/services/NotificationService.spec.ts test/unit/modules/auth/domain/entities/User.spec.ts test/unit/modules/portfolio/domain/entities/Holding.spec.ts` (OK)
- ✅ `npx jest --config ./test/jest-e2e.json --runInBand --coverage=false test/portfolio.e2e-spec.ts test/market-data.e2e-spec.ts` (OK)
- ✅ `npx jest --runInBand test/architecture/clean-architecture.spec.ts` (OK)

### ✅ B9 — Documentation & Polish

Implementado en backend:

- Swagger polish:
  - normalización de `@ApiTags` a formato consistente por dominio (`Auth`, `Market`, `Assets`, `Watchlist`, `Portfolio`, `Alerts`, `Notifications`, etc.)
- README renovado:
  - renombrado y enfocado en NotiFinance
  - quick start actualizado
  - resumen de endpoints disponibles
  - referencia de variables de entorno
  - comandos de testing y enlaces de arquitectura/progreso
- `.env.example` actualizado:
  - unificado con variables efectivamente validadas y consumidas por configuración (`DATABASE_URL`, `REDIS_URL`, `RABBITMQ_URL`, auth y market tunables).

Validación realizada:

- ✅ `npx nest build` (OK)
- ✅ `npx jest --runInBand test/architecture/clean-architecture.spec.ts` (OK)

## Notas de implementación

- Se respetó estructura hexagonal y tokens de inyección.
- Se mantuvo compatibilidad con módulos existentes.
- Los comandos de tests con coverage global por archivo aislado no son representativos del total del proyecto, por eso se ejecutaron validaciones focalizadas sin coverage para control incremental.
- Para evitar bloqueos por cambios parciales, se aplica flujo incremental: lote corto de cambios → `npm run build` → tests focalizados del módulo antes de continuar.

## Cierre final backend (2026-02-26)

Estado de calidad consolidado tras hardening final:

- ✅ Lint global limpio:
  - `npm run lint` → **0 errors, 0 warnings**
- ✅ Build:
  - `npm run build` (OK)
- ✅ Unit tests + coverage:
  - `npm run test:unit:cov` (OK)
  - suites: **19/19 pass**
  - tests: **120/120 pass**
  - global coverage: **Branches 80.42%**
- ✅ E2E:
  - `npm run test:e2e` (OK)
  - suites: **9/9 pass**
  - tests: **38/38 pass**

- ✅ Validación final adicional de release candidate:
  - `npm test` (OK)
  - suites: **20/20 pass**
  - tests: **124/124 pass**

Hardening aplicado en cierre:

- Correcciones de tipado seguro y `no-unsafe-*` en consumers/interceptor de broker y capa HTTP.
- Eliminación de deuda `unbound-method`, `require-await`, `await-thenable`, `no-base-to-string` en módulos backend.
- Ajuste de reglas de ESLint para tests (`test/**/*.ts`) para reducir ruido de tipado dinámico propio de mocks/supertest.
- Reforzadas pruebas unitarias en template rendering para cubrir ramas de serialización segura.

## Última revisión de cumplimiento backend (code review final)

**Fecha:** 2026-02-26  
**Resultado:** backend funcionalmente cerrado para alcance B1–B9, con **3 desvíos de contrato/diseño** a corregir para conformidad estricta con la especificación complementaria.

### Cumplimientos confirmados

- Seguridad y robustez:
  - lockout de login por intentos fallidos con Redis y mapeo HTTP 429.
  - throttling diferenciado público/autenticado.
  - validación global estricta, CORS y headers de seguridad.
- Integración de módulos planificados:
  - auth, market-data, alert, notification, preferences, portfolio, watchlist.
  - jobs de mercado + publicación de eventos + consumo por colas dedicadas.
- Flujo event-driven:
  - market `market.*` → evaluación alertas → dispatch notificaciones `alert.*`.
- Calidad:
  - lint limpio y suites unit/e2e en verde en el último cierre.

### Desvíos detectados (a corregir)

1. **Versionado de API no alineado con spec**
   - La especificación define rutas bajo `/api/v1/...`.
   - Implementación actual expone rutas sin prefijo global (`/auth`, `/market`, `/assets`, etc.).

2. **Contrato HTTP de market parcialmente diferente al documento complementario**
   - `GET /market/dollar` devuelve array plano, no objeto `{ data, updatedAt }`.
   - `GET /market/dollar/history` devuelve array plano, no `{ type, data }`.
   - `GET /market/summary` implementa estructura enriquecida propia (`topMovers`, `marketStatus`) que no matchea 1:1 el ejemplo contractual (`merval`, bloques de dólar por clave, etc.).

3. **WebSocket de notificaciones sin validación de identidad al suscribirse**
   - El cliente se une a rooms por `join(userId)` sin comprobación de JWT en handshake.
   - Riesgo: suscripción a room ajeno si un cliente envía otro `userId`.

### Recomendación de cierre

- Estado actual: **release candidate técnico válido para backend interno**.
- Para conformidad estricta con documentación externa/contrato público:
  1) aplicar prefijo global `/api/v1`,
  2) normalizar response DTOs de market según spec,
  3) asegurar autenticación/autorización en gateway WS de notificaciones.

## Iteración de remediación final (2026-02-26)

**Estado:** ✅ desvíos de la revisión final corregidos y revalidados.

Correcciones aplicadas en esta iteración:

- API versionada global:
  - bootstrap con `app.setGlobalPrefix('api/v1')` (excepto `GET /health`).
- Contratos `market` alineados:
  - `GET /market/dollar` → `{ data, updatedAt }`.
  - `GET /market/dollar/history/:type` y `/market/dollar/history?type=...` → `{ type, data[] }`.
  - `GET /market/risk` → incluye `previousValue` y `timestamp` serializado.
  - `GET /market/summary` → estructura contractual (`merval`, `dollar` por clave, `risk`, `marketStatus` con `isOpen/closesAt/nextOpen`).
- Ingestion HTTP:
  - removido interceptor de idempotencia en controller para evitar comportamiento fuera de contrato en `POST /events`.
- WebSocket notifications:
  - validación de JWT en handshake.
  - room join automático por `sub` del token (sin `join(userId)` arbitrario).
- E2E adaptados a `/api/v1` y mocks sincronizados con métodos nuevos de `MarketDataService`.

Validación de cierre de iteración:

- ✅ `npm run lint` (OK)
- ✅ `npm run test:e2e` (OK) — **9/9 suites**, **38/38 tests**
- ✅ `npm test` (OK) — **20/20 suites**, **124/124 tests**

## Iteración de remediación adicional (2026-02-26)

**Estado:** ✅ nuevos desvíos de contrato detectados y corregidos.

Correcciones aplicadas:

- WebSocket de notificaciones alineado a contrato docs:
  - namespace explícito `/notifications`.
  - evento emitido: `notification:new` (reemplaza `new_notification`).
  - evento de contador: `notification:count`.
  - payload emitido desde notificación persistida (`id`, `title`, `body`, `type`, `metadata`, `createdAt`).
- Seguridad WS:
  - eliminado fallback inseguro de secreto JWT hardcodeado en gateway.
- Market status HTTP alineado:
  - `GET /market/status` ahora responde `isOpen`, `currentPhase`, `closesAt`, `nextOpen`, `timezone`.
- Colecciones HTTP normalizadas (docs + reglas agent):
  - `GET /assets` → `{ data, meta }`.
  - `GET /search` → `{ data }`.
  - `GET /alerts` → `{ data, meta }`.
  - `GET /notifications` → `{ data, meta }`.
  - `GET /watchlist` → `{ data }`.
  - `GET /portfolios` → `{ data }`.
- Endpoints faltantes agregados:
  - `GET /alerts/:alertId`.
  - `GET /portfolios/:id/performance`.
- Contratos portfolio enriquecidos:
  - `GET /portfolios/:id/holdings` retorna resumen + `holdings`.
  - `GET /portfolios/:id/distribution` retorna `byAsset/byType/bySector/byCurrency` con agregación real por tipo/sector/moneda.
  - `GET /portfolios` retorna `data[]` con `summary` por portfolio.
- Contratos watchlist y notifications afinados:
  - `GET /watchlist` retorna `{ data }` y `DELETE /watchlist/:ticker` responde `204`.
  - `GET /notifications/count` retorna `{ unreadCount }`.
  - `PATCH /notifications/:id/read` retorna `{ id, isRead, readAt }`.
  - `PATCH /notifications/read-all` retorna `{ updatedCount }`.
- WS notifications afinado a docs:
  - rooms privadas con convención `user:{userId}`.
  - handler `subscribe` para compatibilidad explícita del cliente.
- Ajuste de robustez de reglas de desarrollo:
  - reemplazado catch silencioso en `MarketController` por log explícito y fallback controlado.

Validación de esta iteración:

- ✅ `npm run lint` (OK)
- ✅ `npm run test:e2e` (OK) — **9/9 suites**, **40/40 tests**
- ✅ `npm test` (OK) — **20/20 suites**, **124/124 tests**

## Iteración de remediación WS market (2026-02-26)

**Estado:** ✅ contrato WebSocket de mercado alineado y revalidado.

Correcciones aplicadas:

- `market:quote` alineado al contrato documental:
  - se eliminó payload agregado (`scope`, `updatedCount`, `refreshedAt`).
  - ahora se emite por activo con payload `{ ticker, priceArs, changePct, volume, timestamp }`.
- `market:status` implementado en gateway y emisión activa desde jobs (`stocks`, `cedears`, `bonds`, `dollar`, `risk`) con payload `{ isOpen, phase }`.
- `MarketDataService` de refresh de cotizaciones devuelve estructura enriquecida `{ updatedCount, updates[] }` para desacoplar la generación de updates del transporte WS.
- Jobs de mercado adaptados al nuevo contrato WS sin romper capas:
  - emiten cada `market:quote` desde `updates[]`.
  - emiten `market:status` post-refresh.
- Tests unitarios de `MarketDataService` actualizados al nuevo contrato de retorno de refresh.

Validación de esta iteración:

- ✅ `npm run lint` (OK)
- ✅ `npm test -- --runInBand` (OK) — **20/20 suites**, **124/124 tests**
- ✅ `npm run test:e2e` (OK) — **9/9 suites**, **40/40 tests**

## Matriz final de cumplimiento (endpoint/evento)

Base de comparación usada en esta matriz:

- Contratos HTTP/WS detallados: `docs/04-supplementary-specs.md`.
- Catálogo técnico de endpoints: `docs/02-technical-specification.md`.
- Reglas de diseño/response/paginación: `.agent/development_rules.md`.

### HTTP público

| Contrato | Estado | Implementación actual |
|---|---|---|
| `POST /api/v1/auth/register` | ✅ | `AuthController` (`POST /auth/register`) + prefijo global `api/v1` |
| `POST /api/v1/auth/login` | ✅ | `AuthController` (`POST /auth/login`) |
| `POST /api/v1/auth/refresh` | ✅ | `AuthController` (`POST /auth/refresh`) |
| `POST /api/v1/auth/demo` | ✅ | `AuthController` (`POST /auth/demo`) |
| `GET /api/v1/market/dollar` | ✅ | `MarketController.getDollarQuotes()` devuelve `{ data, updatedAt }` |
| `GET /api/v1/market/dollar/history/:type` | ✅ | `MarketController.getDollarHistory()` devuelve `{ type, data[] }` |
| `GET /api/v1/market/risk` | ✅ | `MarketController.getCountryRisk()` devuelve `{ value, changePct, previousValue, timestamp }` |
| `GET /api/v1/market/summary` | ✅ | `MarketController.getMarketSummary()` con shape contractual normalizado |
| `GET /api/v1/market/status` | ✅ | `MarketController.getMarketStatus()` devuelve `isOpen/currentPhase/closesAt/nextOpen/timezone` |
| `GET /api/v1/assets` | ✅ | `AssetController.getAssets()` devuelve `{ data, meta }` |
| `GET /api/v1/search` | ✅ | `SearchController.search()` devuelve `{ data }` |

### HTTP autenticado

| Contrato | Estado | Implementación actual |
|---|---|---|
| `GET /api/v1/watchlist` | ✅ | `WatchlistController.getWatchlist()` devuelve `{ data }` |
| `POST /api/v1/watchlist` | ✅ | `WatchlistController.addToWatchlist()` (`{ ticker }` en body) |
| `DELETE /api/v1/watchlist/:ticker` | ✅ | `WatchlistController.removeFromWatchlist()` con `204` |
| `GET /api/v1/portfolios` | ✅ | `PortfolioController.getUserPortfolios()` devuelve `{ data }` |
| `GET /api/v1/portfolios/:id` | ✅ | `PortfolioController.getPortfolio()` |
| `GET /api/v1/portfolios/:id/holdings` | ✅ | `PortfolioController.getHoldings()` |
| `GET /api/v1/portfolios/:id/distribution` | ✅ | `PortfolioController.getDistribution()` (`byAsset/byType/bySector/byCurrency`) |
| `GET /api/v1/portfolios/:id/performance` | ✅ | `PortfolioController.getPerformance()` |
| `POST /api/v1/portfolios/:id/trades` | ✅ | `PortfolioController.recordTrade()` |
| `GET /api/v1/portfolios/:id/trades` | ✅ | `PortfolioController.getTradeHistory()` |
| `GET /api/v1/alerts` | ✅ | `AlertController.getUserAlerts()` devuelve `{ data, meta }` |
| `GET /api/v1/alerts/:id` | ✅ | `AlertController.getAlertById()` |
| `POST /api/v1/alerts` | ✅ | `AlertController.createAlert()` |
| `PATCH /api/v1/alerts/:id` | ✅ | `AlertController.updateAlert()` |
| `PATCH /api/v1/alerts/:id/status` | ✅ | `AlertController.changeStatus()` |
| `DELETE /api/v1/alerts/:id` | ✅ | `AlertController.deleteAlert()` |
| `GET /api/v1/notifications` | ✅ | `NotificationController.getNotifications()` devuelve `{ data, meta }` |
| `GET /api/v1/notifications/count` | ✅ | `NotificationController.getUnreadCount()` devuelve `{ unreadCount }` |
| `PATCH /api/v1/notifications/:id/read` | ✅ | `NotificationController.markAsRead()` devuelve `{ id, isRead, readAt }` |
| `PATCH /api/v1/notifications/read-all` | ✅ | `NotificationController.markAllAsRead()` devuelve `{ updatedCount }` |
| `DELETE /api/v1/notifications/:id` | ✅ | `NotificationController.deleteNotification()` |
| `GET /api/v1/preferences` | ✅ | `PreferencesController.getPreferences()` |
| `PUT /api/v1/preferences` | ✅ | `PreferencesController.updatePreferences()` |

### WebSocket — notifications (`/notifications`)

| Contrato | Estado | Implementación actual |
|---|---|---|
| Handshake JWT requerido | ✅ | `NotificationGateway.handleConnection()` valida token y `sub` |
| `subscribe` (client → server) | ✅ | `@SubscribeMessage('subscribe')` soportado |
| `notification:new` (server → client) | ✅ | Payload `{ id, title, body, type, metadata, createdAt }` |
| `notification:count` (server → client) | ✅ | Payload `{ unreadCount }` |
| Room privada por usuario | ✅ | Convención `user:{userId}` |

### WebSocket — market (`/market`)

| Contrato | Estado | Implementación actual |
|---|---|---|
| `join:room` | ✅ | `MarketGateway.handleJoinRoom()` con validación prefijo `market:` |
| `leave:room` | ✅ | `MarketGateway.handleLeaveRoom()` |
| `market:dollar` | ✅ | Payload `{ quotes: [{type,buyPrice,sellPrice}], timestamp }` |
| `market:risk` | ✅ | Payload `{ value, changePct, timestamp }` |
| `market:quote` | ✅ | Payload `{ ticker, priceArs, changePct, volume, timestamp }` |
| `market:status` | ✅ | Emitido por jobs con `{ isOpen, phase }` |

### Observaciones de consistencia documental

- `docs/02-technical-specification.md` (sección WebSocket 7.1) usa nombres de campos legacy para `market:dollar/market:risk/market:quote` (`buy/sell/updatedAt`, `price`, etc.).
- `docs/04-supplementary-specs.md` define el contrato detallado vigente (`buyPrice/sellPrice/timestamp`, `priceArs`, y evento `market:status`), que es el contrato que se implementó y validó.
- Con esta base, el estado de cumplimiento contractual operativo queda en **100%** para endpoints/eventos del backend actual.

## Frontend — Fase F1 (Project Setup) completada (2026-02-27)

**Estado:** ✅ F1 completada con validación técnica y compliance de fase.

Implementación realizada en esta fase:

- Reemplazo de frontend legacy según plan:
  - eliminadas carpetas `noticore-admin/` y `noticore-client/`.
  - creado nuevo proyecto `notifinance-frontend/` con Next.js App Router + TypeScript + Tailwind + ESLint.
- Stack F1 instalado y configurado:
  - dependencias core de datos/estado/form/ws (`@tanstack/react-query`, `axios`, `socket.io-client`, `zustand`, `react-hook-form`, `zod`, etc.).
  - setup de `shadcn` con base color `slate`.
  - nota: componente `toast` de shadcn deprecado; se usa `sonner` como reemplazo oficial.
- Estructura base alineada a spec técnica:
  - rutas base públicas/protegidas creadas en `src/app` (placeholders sin lógica de fases posteriores).
  - carpetas técnicas creadas: `hooks/`, `providers/`, `stores/`, `types/`, `components/*`.
- Fundación técnica F1 implementada:
  - `QueryProvider`, `ThemeProvider`, `SocketProvider` conectados en root layout.
  - `apiClient` con interceptores (token bearer, refresh automático, manejo de 401).
  - `socket` client para namespaces `/market` y `/notifications`.
  - stores Zustand: auth/theme.
  - tipos iniciales API y dominio frontend (market/portfolio/alert/notification).
  - helpers de formato en `lib/format.ts`.
  - `/` redirige a `/dashboard`.
  - `.env.local.example` agregado para URLs de API y WS.

Loop de validación de fase (compliance flow):

- Iteración 1:
  - se detectaron desvíos en lint (`eslint-config-next`) y ausencia de script `test`.
  - se corrigió configuración ESLint, se agregó Vitest + Testing Library, alias `@` en vitest y test inicial de helpers.
- Iteración 2 (cierre):
  - ✅ `npm run lint` (OK, sin warnings)
  - ✅ `npm run test` (OK)
  - ✅ `npm run build` (OK)

Comparación doc/rules vs implementación (F1):

- ✅ Checklist F1 de `docs/03-implementation-plan.md` cubierto.
- ✅ Estructura base de `docs/02-technical-specification.md` iniciada y preparada para F2+.
- ✅ Reglas de desarrollo aplicadas con tipado estricto, separación de responsabilidades y validación de fase previa al avance.
