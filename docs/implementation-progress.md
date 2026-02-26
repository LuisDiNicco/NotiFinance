# NotiFinance — Implementation Progress

**Fecha:** 2026-02-26  
**Scope actual:** Backend Fases B1 + B3 (B3 base completada)

## Estado general

- Plan total: iniciado
- Fase actual: **B5 (Portfolio & Watchlist)** en progreso
- Última fase cerrada: **B4**

## Fases completadas

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

### ⏳ B5 — Portfolio & Watchlist (en progreso)

Próximos entregables técnicos a implementar:

1. `Watchlist` implementado (entidad/servicio/controller/repository + migración + tests).
2. Base de `Portfolio` y `Trade` implementada (dominio + persistencia inicial + migración).
3. Endpoints protegidos para portafolios/trades implementados (base CRUD + record trade).
4. Cálculo inicial de holdings y valorización básica.
5. Hardening de reglas de negocio de trades (SELL/FIFO/validaciones).

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

## Notas de implementación

- Se respetó estructura hexagonal y tokens de inyección.
- Se mantuvo compatibilidad con módulos existentes.
- Los comandos de tests con coverage global por archivo aislado no son representativos del total del proyecto, por eso se ejecutaron validaciones focalizadas sin coverage para control incremental.
- Para evitar bloqueos por cambios parciales, se aplica flujo incremental: lote corto de cambios → `npm run build` → tests focalizados del módulo antes de continuar.
