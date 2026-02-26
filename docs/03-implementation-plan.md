# NotiFinance — Plan de Implementación

**Versión:** 1.0  
**Fecha:** 2026-02-26  
**Autor:** Arquitectura  
**Estado:** Aprobado para desarrollo  

---

## 1. Análisis de Impacto en Backend Actual

### 1.1 Lo que se MANTIENE (sin cambios)

| Componente | Ubicación | Razón |
|---|---|---|
| Arquitectura Hexagonal | Todo el proyecto | Mismos principios, mismas capas |
| development_rules.md | `.agent/` | Reglas de código siguen vigentes |
| Shared Infrastructure | `src/shared/` | BaseRepository, Config pattern, Logger, Redis module, DB config |
| Docker Compose (infra) | `docker-compose.yml` | PostgreSQL, Redis, RabbitMQ siguen igual |
| Dockerfile | `Dockerfile` | Multi-stage build se mantiene |
| Test infrastructure | `test/jest-unit.json`, `test/jest-e2e.json` | Configuraciones de Jest se mantienen |
| RabbitMQ topology service | `infrastructure/message-brokers/` | Se expande pero la base queda |
| Global filters & interceptors | `shared/infrastructure/` | Exception filter, logging interceptor |
| TemplateCompilerService | `modules/template/` | El compilador de templates `{{}}` sigue funcionando exactamente igual |
| TemplateController | `modules/template/` | CRUD de templates se mantiene |
| Health checks | `/health` endpoint | Se mantiene, se agregan checks |

### 1.2 Lo que se MODIFICA

| Componente | Cambio | Detalle |
|---|---|---|
| **EventType enum** | Reemplazar valores | De `payment.success`, `security.login_alert`, etc. → A `market.quote.updated`, `market.dollar.updated`, `alert.triggered`, etc. |
| **EventPayload** | Expandir metadata | El campo `metadata` ahora contendrá datos financieros (ticker, price, changePct) |
| **DispatcherService** | Adaptar flujo | Ahora resuelve preferencias + compila template + envía a canales (la lógica se mantiene, cambian los event types) |
| **NotificationChannel enum** | Simplificar | Remover SMS y PUSH (no se implementan), dejar EMAIL + IN_APP |
| **UserPreference entity** | Expandir campos | Agregar `quietHoursStart`, `quietHoursEnd`, `digestFrequency` |
| **PreferencesService** | Expandir | Agregar lógica de quiet hours y digest frequency |
| **PreferencesController** | Expandir DTOs | Nuevos campos en request/response |
| **Ingestion module** | Renombrar/Adaptar | EventIngestionController se mantiene para recibir eventos de los cron jobs internos. Se elimina la idempotencia por Redis (los cron jobs no duplican). |
| **RabbitMQ topology** | Nuevas queues | Agregar `alert-evaluation-queue` + routing keys financieros |
| **app.module.ts** | Registrar nuevos modules | Auth, MarketData, Alert, Portfolio, Watchlist |
| **main.ts** | CORS + Swagger | Actualizar metadata de Swagger para NotiFinance |
| **package.json** | Nuevas dependencias | `@nestjs/schedule`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `yahoo-finance2`, `nodemailer`, `socket.io` |
| **Notification templates (DB seed)** | Contenido | Templates financieras: "GGAL superó $8.000", "Dólar MEP bajó de $1.400", etc. |

### 1.3 Lo que se AGREGA (nuevos módulos)

| Módulo | Complejidad | Entidades | Controllers | Services |
|---|---|---|---|---|
| `auth` | Media | User | AuthController | AuthService |
| `market-data` | Alta | Asset, MarketQuote, DollarQuote, CountryRisk | MarketController, AssetController, SearchController | MarketDataService |
| `alert` | Alta | Alert | AlertController | AlertService, AlertEvaluationEngine |
| `portfolio` | Alta | Portfolio, Trade, Holding | PortfolioController, TradeController | PortfolioService, TradeService, HoldingsCalculator |
| `watchlist` | Baja | WatchlistItem | WatchlistController | WatchlistService |
| Cron Jobs | Media | - | - | 6 fetch jobs |

### 1.4 Lo que se ELIMINA

| Componente | Razón |
|---|---|
| `noticore-admin/` (carpeta completa) | Se reemplaza por `notifinance-frontend/` |
| `noticore-client/` (carpeta completa) | Se reemplaza por `notifinance-frontend/` |
| Valores específicos del enum EventType (payment.success, etc.) | Se reemplazan por tipos financieros |

### 1.5 Migraciones de Base de Datos

Se necesitan las siguientes migraciones (en orden):

```
Migration 1: CreateUsersTable
Migration 2: CreateAssetsTable  
Migration 3: CreateMarketQuotesTable
Migration 4: CreateDollarQuotesTable
Migration 5: CreateCountryRiskTable
Migration 6: AlterUserPreferencesAddFields (quiet hours, digest)
Migration 7: CreatePortfoliosTable
Migration 8: CreateTradesTable
Migration 9: CreateWatchlistTable
Migration 10: CreateAlertsTable
Migration 11: CreateNotificationsTable
Migration 12: SeedAssetsData (catalogo de tickers)
Migration 13: SeedNotificationTemplates (templates financieros)
Migration 14: SeedDemoUser (usuario demo con portfolio)
```

---

## 2. Plan de Implementación — Backend

### Fase B1: Foundation & Auth (Estimación: 3-4 días)

#### B1.1: Preparación del Proyecto
```
□ Instalar nuevas dependencias:
  npm install @nestjs/schedule @nestjs/jwt @nestjs/passport passport passport-jwt
  npm install bcrypt yahoo-finance2 nodemailer @nestjs/websockets @socket.io/admin-ui
  npm install socket.io axios cheerio
  npm install -D @types/bcrypt @types/passport-jwt @types/nodemailer

□ Crear configs con registerAs:
  - src/shared/infrastructure/base/config/auth.config.ts
    → JWT_SECRET, JWT_EXPIRATION, JWT_REFRESH_EXPIRATION
  - src/shared/infrastructure/base/config/market.config.ts
    → DOLAR_API_URL, YAHOO_FINANCE_ENABLED, ALPHA_VANTAGE_API_KEY, RESEND_API_KEY, EMAIL_FROM

□ Actualizar .env.example con todas las nuevas variables

□ Actualizar app.module.ts:
  - Importar ScheduleModule.forRoot()
  - Importar nuevos config factories
  - Registrar nuevos módulos conforme se crean
```

#### B1.2: Módulo Auth
```
□ Domain Layer:
  - src/modules/auth/domain/entities/User.ts
    → Properties: id, email, passwordHash, displayName, isDemo, createdAt
    → Method: verifyPassword(plain: string): boolean (NO — esto va en service con bcrypt)
  - src/modules/auth/domain/errors/InvalidCredentialsError.ts
  - src/modules/auth/domain/errors/EmailAlreadyExistsError.ts

□ Application Layer:
  - src/modules/auth/application/IUserRepository.ts
    → findByEmail(email): Promise<User | null>
    → save(user: User): Promise<User>
    → deleteExpiredDemoUsers(): Promise<number>
  - src/modules/auth/application/AuthService.ts
    → register(email, password, displayName): Promise<{ user, accessToken, refreshToken }>
    → login(email, password): Promise<{ user, accessToken, refreshToken }>
    → refreshToken(refreshToken): Promise<{ accessToken, refreshToken }>
    → createDemoSession(): Promise<{ user, accessToken }>
    → validateUser(userId): Promise<User>

□ Infrastructure Layer:
  - Database:
    → TypeORM entity: UserOrmEntity (maps to `users` table)
    → Mapper: UserMapper (toDomain / toPersistence)
    → Repository: TypeOrmUserRepository implements IUserRepository
    → Migration: CreateUsersTable
  - Auth:
    → JwtStrategy (passport-jwt strategy)
    → JwtAuthGuard (standard guard)
    → OptionalAuthGuard (public endpoints que opcionalmente leen el user)
  - HTTP:
    → AuthController: POST /auth/register, /auth/login, /auth/refresh, /auth/demo
    → Request DTOs: RegisterRequest, LoginRequest (class-validator)
    → Response DTOs: AuthResponse (token + user info)
  - Module:
    → auth.module.ts: JwtModule.registerAsync, PassportModule

□ Tests:
  - Unit: AuthService (register, login, demo session, refresh)
  - E2E: AuthController (registro, login, tokens, demo)

□ Actualizar Global Exception Filter:
  - Mapear InvalidCredentialsError → 401
  - Mapear EmailAlreadyExistsError → 409
```

### Fase B2: Market Data Module (Estimación: 4-5 días)

#### B2.1: Domain & Application
```
□ Domain Layer:
  - entities/Asset.ts
    → Properties: id, ticker, name, assetType, sector, yahooTicker, currency, description, metadata
  - entities/MarketQuote.ts
    → Properties: id, assetId, priceArs, priceUsd, open, high, low, close, volume, changePct, date
  - entities/DollarQuote.ts
    → Properties: id, type, buyPrice, sellPrice, timestamp, source
  - entities/CountryRisk.ts
    → Properties: id, value, changePct, timestamp
  - enums/AssetType.ts
    → STOCK, CEDEAR, BOND, LECAP, BONCAP, ON, INDEX, DOLLAR
  - enums/DollarType.ts
    → OFICIAL, BLUE, MEP, CCL, TARJETA, CRIPTO
  - errors/AssetNotFoundError.ts

□ Application Layer:
  - IAssetRepository.ts
    → findByTicker(ticker): Promise<Asset | null>
    → findPaginated(filters: AssetFilters): Promise<PaginatedResponse<Asset>>
    → searchByQuery(query: string, limit: number): Promise<Asset[]>
    → findTopGainers(type: AssetType, limit: number): Promise<Asset[]>
    → findTopLosers(type: AssetType, limit: number): Promise<Asset[]>
  - IQuoteRepository.ts
    → saveQuote(quote: MarketQuote): Promise<MarketQuote>
    → saveBulkQuotes(quotes: MarketQuote[]): Promise<void>
    → findByAssetAndPeriod(assetId, startDate, endDate): Promise<MarketQuote[]>
    → findLatestByAsset(assetId): Promise<MarketQuote | null>
  - IDollarProvider.ts (port para API externa)
    → fetchAllDollarQuotes(): Promise<DollarQuote[]>
  - IRiskProvider.ts
    → fetchCountryRisk(): Promise<CountryRisk>
  - IQuoteProvider.ts
    → fetchQuote(yahooTicker: string): Promise<MarketQuote>
    → fetchHistorical(yahooTicker: string, startDate, endDate): Promise<MarketQuote[]>
    → fetchBulkQuotes(yahooTickers: string[]): Promise<MarketQuote[]>
  - MarketDataService.ts
    → getDollarQuotes(): Promise<DollarQuote[]>
    → getDollarHistory(type, days): Promise<DollarQuote[]>
    → getCountryRisk(): Promise<CountryRisk>
    → getCountryRiskHistory(days): Promise<CountryRisk[]>
    → getAssetDetail(ticker): Promise<Asset>
    → getAssetQuotes(ticker, period): Promise<MarketQuote[]>
    → getAssetStats(ticker): Promise<AssetStats>
    → getMarketSummary(): Promise<MarketSummary>
    → getMarketStatus(): Promise<MarketStatus>
    → searchAssets(query, limit): Promise<Asset[]>
    → refreshDollarData(): Promise<void>   (llamado por cron)
    → refreshStockQuotes(): Promise<void>  (llamado por cron)
    → refreshRiskData(): Promise<void>     (llamado por cron)
```

#### B2.2: Infrastructure — External API Clients
```
□ HTTP Clients (secondary-adapters/http/clients/):
  - DolarApiClient.ts (implements IDollarProvider)
    → GET https://dolarapi.com/v1/dolares → parse → DollarQuote[]
    → Fallback: Bluelytics API
    → Cache: Redis TTL 5min
    → Error handling: circuit breaker pattern
  
  - YahooFinanceClient.ts (implements IQuoteProvider) 
    → Usa librería yahoo-finance2
    → quoteSummary() para datos actuales
    → historical() para datos históricos
    → Manejo de rate limit (sleep entre requests)
    → Mapeo de tickers AR: agregar sufijo .BA
    → Cache: Redis TTL 5min para quotes, 1h para historicals

  - AlphaVantageClient.ts (fallback, implements IQuoteProvider)
    → Solo para datos US (CEDEARs subyacentes)
    → 25 req/día gratis → usar con criterio
```

#### B2.3: Infrastructure — Cron Jobs
```
□ Jobs (primary-adapters/jobs/):
  - DollarFetchJob.ts
    → @Cron('*/5 * * * *')
    → Llama MarketDataService.refreshDollarData()
    → Publica evento 'market.dollar.updated' al broker
    → Log: inicio, duración, datos actualizados, errores

  - RiskFetchJob.ts
    → @Cron('*/10 * * * *')
    → Llama MarketDataService.refreshRiskData()
    → Publica evento 'market.risk.updated'

  - StockQuoteFetchJob.ts
    → @Cron('*/5 10-17 * * 1-5') — solo horario de mercado AR
    → Fetch batch de ~80 acciones argentinas
    → Procesa en chunks de 10 con delay entre chunks
    → Publica evento 'market.quote.updated' por cada activo actualizado

  - CedearQuoteFetchJob.ts
    → @Cron('*/5 10-17 * * 1-5')
    → Fetch batch de ~300 CEDEARs (en chunks de 20)
    → Misma lógica que StockQuoteFetchJob

  - BondQuoteFetchJob.ts
    → @Cron('*/15 10-17 * * 1-5')
    → Fetch de bonos, LECAPs, ONs
    → Menos frecuente (menos volátiles)

  - HistoricalDataJob.ts
    → @Cron('0 18 * * 1-5') — después del cierre
    → Consolida datos OHLCV diarios para todos los activos
    → Limpieza de datos intraday si aplica
```

#### B2.4: Infrastructure — HTTP Controllers
```
□ Controllers:
  - MarketController.ts
    → GET /api/v1/market/dollar
    → GET /api/v1/market/dollar/:type
    → GET /api/v1/market/dollar/history
    → GET /api/v1/market/risk
    → GET /api/v1/market/risk/history
    → GET /api/v1/market/summary
    → GET /api/v1/market/status

  - AssetController.ts
    → GET /api/v1/assets (paginado, filtrado)
    → GET /api/v1/assets/:ticker
    → GET /api/v1/assets/:ticker/quotes
    → GET /api/v1/assets/:ticker/stats
    → GET /api/v1/assets/:ticker/related
    → GET /api/v1/assets/top/gainers
    → GET /api/v1/assets/top/losers

  - SearchController.ts
    → GET /api/v1/search?q=...&limit=10

□ DTOs para cada endpoint (request + response)
□ Swagger decorators completos
```

#### B2.5: Database Migrations & Seeds
```
□ Migraciones:
  - CreateAssetsTable
  - CreateMarketQuotesTable
  - CreateDollarQuotesTable
  - CreateCountryRiskTable

□ Seeds:
  - seed-assets.ts: Insertar catálogo completo de tickers
    → ~80 acciones argentinas (GGAL, YPFD, PAMP, BMA, etc.)
    → ~300 CEDEARs (AAPL, MSFT, GOOGL, etc.)
    → ~10 bonos soberanos (AL30, GD30, etc.)
    → ~15 LECAPs/BONCAPs
    → ~20 ONs principales
    → Incluir yahoo_ticker para cada uno
```

#### B2.6: Tests
```
□ Unit tests:
  - MarketDataService (mock de repositories y providers)
  - Asset entity (si tiene business logic)
  
□ E2E tests:
  - MarketController (mock de MarketDataService)
  - AssetController (mock de MarketDataService)
  - SearchController
```

### Fase B3: Alert Module (Estimación: 3-4 días)

#### B3.1: Domain & Application
```
□ Domain:
  - entities/Alert.ts
    → Properties: id, userId, assetId, alertType, condition, threshold, period, channels, isRecurring, status, lastTriggeredAt
    → Methods:
      → evaluate(currentValue: number): boolean
      → trigger(): void (marca como triggered, actualiza lastTriggeredAt)
      → canTrigger(): boolean (es ACTIVE y no está en cooldown)
  - enums/AlertType.ts → PRICE, PCT_CHANGE, DOLLAR, RISK, PORTFOLIO
  - enums/AlertCondition.ts → ABOVE, BELOW, CROSSES, PCT_UP, PCT_DOWN
  - enums/AlertStatus.ts → ACTIVE, PAUSED, TRIGGERED, EXPIRED
  - errors/AlertLimitExceededError.ts
  - errors/AlertNotFoundError.ts

□ Application:
  - AlertService.ts
    → createAlert(userId, data): Promise<Alert>
      → Validar límite de 20 alertas activas
      → Validar que el asset existe
    → getUserAlerts(userId): Promise<Alert[]>
    → updateAlert(userId, alertId, data): Promise<Alert>
    → changeStatus(userId, alertId, status): Promise<Alert>
    → deleteAlert(userId, alertId): Promise<void>
  
  - AlertEvaluationEngine.ts
    → evaluateAlertsForAsset(assetId, currentPrice): Promise<Alert[]>
      → Query alertas ACTIVE para ese asset
      → Para cada una: alert.evaluate(currentPrice)
      → Retornar las que se cumplieron
    → evaluateAlertsForDollar(dollarType, currentPrice): Promise<Alert[]>
    → evaluateAlertsForRisk(currentValue): Promise<Alert[]>

  - IAlertRepository.ts
    → findByUserIdPaginated(userId, page, limit): Promise<PaginatedResponse<Alert>>
    → findActiveByAssetId(assetId): Promise<Alert[]>
    → findActiveByType(alertType): Promise<Alert[]>
    → countActiveByUserId(userId): Promise<number>
    → save(alert): Promise<Alert>
    → delete(id): Promise<void>
```

#### B3.2: Infrastructure
```
□ Database:
  - AlertOrmEntity, AlertMapper, TypeOrmAlertRepository
  - Migration: CreateAlertsTable

□ RabbitMQ Consumer (primary-adapter):
  - AlertEvaluationConsumer.ts
    → Consume from: alert-evaluation-queue
    → Routing keys: market.quote.updated, market.dollar.updated, market.risk.updated
    → On message → AlertEvaluationEngine.evaluateAlerts*(...)
    → For each triggered alert → Publish 'alert.triggered' event
    → ACK: siempre (evaluación es best-effort)

□ HTTP Controller:
  - AlertController.ts (protegido por JwtAuthGuard)
    → CRUD de alertas del usuario autenticado
    → Swagger completo

□ Tests:
  - Unit: AlertService, AlertEvaluationEngine, Alert.evaluate()
  - E2E: AlertController CRUD
```

### Fase B4: Notification Module Expansion (Estimación: 2-3 días)

#### B4.1: Expand Existing Module
```
□ Domain:
  - entities/Notification.ts (NUEVA)
    → Properties: id, userId, alertId, title, body, type, metadata, isRead, readAt, createdAt
    → Method: markAsRead(): void

□ Application:
  - NotificationService.ts (NUEVO)
    → getUserNotifications(userId, filters): Promise<PaginatedResponse<Notification>>
    → getUnreadCount(userId): Promise<number>
    → markAsRead(userId, notificationId): Promise<void>
    → markAllAsRead(userId): Promise<void>
    → deleteNotification(userId, notificationId): Promise<void>
  - INotificationRepository.ts (NUEVO)
    → findByUserPaginated(userId, unreadOnly, page, limit): PaginatedResponse
    → countUnread(userId): number
    → save(notification): Notification

□ Infrastructure:
  - NotificationController.ts (NUEVO)
    → GET /api/v1/notifications
    → GET /api/v1/notifications/count
    → PATCH /api/v1/notifications/:id/read
    → PATCH /api/v1/notifications/read-all
    → DELETE /api/v1/notifications/:id

  - NotificationGateway.ts (EXPANDIR WebSocket)
    → Namespace: /notifications
    → Autenticación: JWT en handshake
    → Eventos: 'notification:new', 'notification:count'
    → Al recibir evento alert.triggered: persist + push via WS + email

  - MarketGateway.ts (NUEVO WebSocket)
    → Namespace: /market
    → Sin auth (datos públicos)
    → Eventos: 'market:dollar', 'market:risk', 'market:quote'
    → Rooms: market:all, market:STOCK, market:CEDEAR

  - EmailChannelAdapter.ts (ACTUALIZAR)
    → Implementar envío real con Nodemailer/Resend
    → HTML template responsivo con branding NotiFinance
    → Subject: "[NotiFinance] GGAL superó $8.000"

  - InAppChannelAdapter.ts (ACTUALIZAR)
    → Persistir notificación en tabla notifications
    → Push via WebSocket gateway

  - Migration: CreateNotificationsTable

□ Actualizar DispatcherService:
  - Adaptar el flujo existente para que:
    1. Compile template (ya funciona con {{metadata.ticker}})
    2. Resuelva preferencias (ya funciona)
    3. Persista en tabla notifications (NUEVO step)
    4. Envíe por canales: WebSocket + Email

□ Actualizar templates (seed):
  - event_type: 'alert.price.above'
    subject: '{{metadata.ticker}} superó {{metadata.threshold}}'
    body: '{{metadata.ticker}} alcanzó ${{metadata.currentPrice}} (umbral: ${{metadata.threshold}})'
  - event_type: 'alert.price.below'
  - event_type: 'alert.dollar.above'
  - event_type: 'alert.dollar.below'
  - event_type: 'alert.risk.above'
  - event_type: 'alert.risk.below'
  - event_type: 'alert.pct.up'
  - event_type: 'alert.pct.down'
```

### Fase B5: Portfolio & Watchlist (Estimación: 3-4 días)

#### B5.1: Watchlist Module
```
□ Domain:
  - entities/WatchlistItem.ts → userId, assetId, createdAt

□ Application:
  - WatchlistService.ts
    → getUserWatchlist(userId): Promise<WatchlistItem[]>
    → addToWatchlist(userId, ticker): Promise<WatchlistItem>
    → removeFromWatchlist(userId, ticker): Promise<void>
  - IWatchlistRepository.ts

□ Infrastructure:
  - WatchlistController.ts (protegido)
  - DB entities + mapper + repository + migration

□ Tests: Unit + E2E
```

#### B5.2: Portfolio Module
```
□ Domain:
  - entities/Portfolio.ts → id, userId, name, description
  - entities/Trade.ts → id, portfolioId, assetId, tradeType, quantity, pricePerUnit, currency, commission, executedAt
  - entities/Holding.ts (value object, no persistido directamente)
    → assetId, ticker, quantity, avgCostBasis, currentPrice, unrealizedPnl, unrealizedPnlPct, weight
  - enums/TradeType.ts → BUY, SELL
  - errors/InsufficientHoldingsError.ts
  - errors/PortfolioNotFoundError.ts

□ Application:
  - PortfolioService.ts
    → createPortfolio(userId, name, description): Promise<Portfolio>
    → getUserPortfolios(userId): Promise<Portfolio[]>
    → getPortfolioDetail(userId, portfolioId): Promise<PortfolioDetail>
    → deletePortfolio(userId, portfolioId): Promise<void>
  
  - TradeService.ts
    → recordTrade(userId, portfolioId, tradeData): Promise<Trade>
      → Si SELL: validar que hay sufficient holdings (FIFO)
    → getTradeHistory(userId, portfolioId, filters): Promise<PaginatedResponse<Trade>>

  - HoldingsCalculator.ts
    → calculateHoldings(trades: Trade[], currentPrices: Map<string, number>): Holding[]
      → FIFO para cost basis
      → Calcular P&L por posición
      → Calcular peso en portfolio
    → calculatePerformance(trades: Trade[], historicalPrices, period): PerformancePoint[]
    → calculateDistribution(holdings: Holding[]): Distribution

□ Infrastructure:
  - PortfolioController.ts
    → CRUD de portfolios
    → GET holdings, performance, distribution
  - TradeController.ts
    → POST trade, GET trade history
  - DB: entities, mappers, repositories, 2 migraciones

□ Tests:
  - Unit: HoldingsCalculator (FIFO, P&L), TradeService (validation), PortfolioService
  - E2E: Portfolio CRUD + Trade recording
```

### Fase B6: EventType Migration & Integration (Estimación: 1-2 días)

```
□ Actualizar EventType enum:
  - REMOVER: PAYMENT_SUCCESS, SECURITY_LOGIN_ALERT, MARKETING_PROMO, TRANSFER_RECEIVED
  - AGREGAR: MARKET_QUOTE_UPDATED, MARKET_DOLLAR_UPDATED, MARKET_RISK_UPDATED,
             ALERT_PRICE_ABOVE, ALERT_PRICE_BELOW, ALERT_DOLLAR_ABOVE, ALERT_DOLLAR_BELOW,
             ALERT_RISK_ABOVE, ALERT_RISK_BELOW, ALERT_PCT_UP, ALERT_PCT_DOWN

□ Actualizar RabbitMQ topology:
  - Exchange: notifinance.events (topic) ← renombrar de 'notifications'
  - Nueva queue: alert-evaluation-queue
  - Routing keys: market.*, alert.*
  - Mantener DLQ

□ Actualizar seed de notification_templates con templates financieras

□ Integration test completo:
  - Simular: CronJob actualiza precio → Evento publicado → Alert evaluado → Notificación enviada
  - Verificar flujo end-to-end con mocks de API externa
```

### Fase B7: Demo Mode & Seeds (Estimación: 1 día)

```
□ Implementar DemoSeedService:
  - Crea usuario demo con portfolio precargado:
    → 3 acciones argentinas (GGAL, YPFD, PAMP)
    → 4 CEDEARs (AAPL, MSFT, GOOGL, NVDA)
    → 2 bonos (AL30, GD30)
  - Crea watchlist con 10 activos populares
  - Crea 3 alertas activas:
    → "GGAL supera $8.000" (precio)
    → "Dólar MEP supera $1.500" (dólar)
    → "Riesgo país baja de 500" (riesgo)
  - Crea 5 notificaciones de ejemplo

□ CronJob de limpieza:
  - @Cron('0 4 * * *') → Eliminar usuarios demo con createdAt > 24h

□ AuthController.demo():
  - Llama DemoSeedService
  - Retorna JWT con TTL 24h
```

### Fase B8: Testing & Quality (Estimación: 2-3 días)

```
□ Unit Tests (target >80%):
  - AuthService (register, login, refresh, demo)
  - MarketDataService (fetch, cache, fallback)
  - AlertService (CRUD, límite 20)
  - AlertEvaluationEngine (evaluate conditions: ABOVE, BELOW, PCT)
  - Alert.evaluate() domain logic
  - HoldingsCalculator (FIFO, P&L, distribution)
  - TradeService (buy, sell validation)
  - WatchlistService (add, remove)
  - NotificationService (CRUD, mark read)
  - User entity & Holding value object

□ E2E Tests:
  - Auth: register → login → refresh → protected endpoint
  - Market: GET /market/dollar, /market/risk, /market/summary
  - Assets: GET /assets, /assets/:ticker, /assets/:ticker/quotes
  - Search: GET /search?q=
  - Watchlist: POST → GET → DELETE
  - Portfolio: Create → Add trades → Get holdings → Get performance
  - Alerts: CRUD + status change
  - Notifications: GET inbox, mark read, count

□ Architecture Tests:
  - Actualizar para cubrir nuevos módulos
  - Validar que ningún domain importa infraestructura

□ Coverage:
  - npm run test:unit:cov → >80% en application + domain
  - npm run test:e2e:cov → >80% en controllers
```

### Fase B9: Documentation & Polish (Estimación: 1 día)

```
□ Swagger:
  - Todos los endpoints con @ApiTags, @ApiOperation, @ApiResponse
  - Todos los DTOs con @ApiProperty (type, description, example)
  - Organizado por tags: Auth, Market, Assets, Watchlist, Portfolio, Alerts, Notifications

□ README.md:
  - Actualizar nombre: NotiFinance
  - Descripción del proyecto
  - Quick Start (docker compose up → app running)
  - Available endpoints summary
  - Environment variables reference
  - Testing commands
  - Architecture overview link

□ .env.example actualizado con todas las variables

□ Postman/Insomnia collection (opcional pero recomendado):
  - Export de todos los endpoints con examples
```

---

## 3. Plan de Implementación — Frontend

### Fase F1: Project Setup (Estimación: 1 día)

```
□ Eliminar carpetas noticore-admin/ y noticore-client/

□ Crear proyecto Next.js 15:
  npx create-next-app@latest notifinance-frontend --typescript --tailwind --eslint --app --src-dir

□ Instalar dependencias:
  npm install @tanstack/react-query axios socket.io-client zustand
  npm install lightweight-charts react-hook-form @hookform/resolvers zod
  npm install lucide-react date-fns clsx tailwind-merge
  npx shadcn@latest init (dark theme, slate color)
  npx shadcn@latest add button card dialog dropdown-menu input label
  npx shadcn@latest add select sheet table tabs toast badge separator
  npx shadcn@latest add command popover scroll-area skeleton switch toggle

□ Configurar estructura de carpetas según spec técnica
□ Configurar Tailwind con paleta fintech dark theme
□ Configurar providers: QueryProvider, ThemeProvider, SocketProvider
□ Configurar Axios instance con interceptors (token, refresh, error handling)
□ Configurar Socket.io client
□ Crear tipos TypeScript para API (types/)
□ Crear helpers de formato (lib/format.ts): formatCurrency, formatPercent, formatDate
□ Crear store de auth (Zustand)
□ Crear store de theme (Zustand)
```

### Fase F2: Layout & Navigation (Estimación: 1-2 días)

```
□ Root layout (app/layout.tsx):
  - Font: Inter (Google Fonts)
  - Metadata: title, description, og:image
  - Providers wrapper

□ Sidebar:
  - Logo NotiFinance
  - Navigation links:
    → Dashboard (Home icon)
    → Acciones (TrendingUp icon)
    → CEDEARs (Globe icon)
    → Bonos (Landmark icon)
    → Watchlist (Star icon) — requiere auth
    → Portfolio (Briefcase icon) — requiere auth
    → Alertas (Bell icon) — requiere auth
  - Colapsable en mobile
  - Active state highlighting

□ Header:
  - Barra de búsqueda global (Ctrl+K trigger)
  - Botón tema dark/light
  - NotificationBell (campana con badge)
  - User menu (avatar → settings, logout) o botón Login/Demo

□ CommandPalette:
  - Dialog modal con input de búsqueda
  - Fetch a /api/v1/search en debounce (300ms)
  - Resultados agrupados por tipo
  - Navegación con keyboard (arrow keys + enter)

□ Responsive:
  - Sidebar → drawer en mobile
  - Header → hamburger menu
```

### Fase F3: Dashboard Page (Estimación: 2-3 días)

```
□ DollarPanel:
  - 6 cards (Oficial, Blue, MEP, CCL, Tarjeta, Cripto)
  - Cada card: nombre, compra, venta, variación % con color
  - WebSocket update: 'market:dollar' events
  - Skeleton loader mientras carga
  - "Actualizado hace X minutos" timestamp

□ RiskCountryCard:
  - Valor grande con puntos
  - Variación con flecha y color
  - Sparkline de 30 días (lightweight-charts)
  - WebSocket update: 'market:risk'

□ MarketStatusBadge:
  - Badge verde "Mercado Abierto" o rojo "Mercado Cerrado"
  - Countdown "Cierra en 2h 15m" o "Abre en 16h 30m"

□ IndexCards:
  - S&P Merval, S&P 500, Nasdaq, Dow Jones
  - Valor + variación % + sparkline 5 días

□ TopMoversTable:
  - Tabs: Acciones | CEDEARs
  - Sub-tabs: Mejores | Peores
  - Tabla: Ticker, Precio, Variación %, enlace a detalle
  - 5 items por categoría

□ WatchlistWidget (si autenticado):
  - Primeros 5-10 activos del watchlist
  - Precios actualizados en real-time
  - Link "Ver todos" → /watchlist
  - Empty state si no hay favoritos
```

### Fase F4: Asset Explorer (Estimación: 2-3 días)

```
□ Asset Explorer Page (/assets):
  - Tabs: Acciones | CEDEARs | Bonos | LECAPs | ONs
  - Cada tab carga datos del endpoint correspondiente

□ AssetTable (componente reutilizable):
  - Columnas configurables por tipo de activo
  - Sorting por click en header
  - Pagination (server-side)
  - Row clickeable → navega a /assets/[ticker]
  - Favorito (estrella) toggle en última columna

□ AssetFilters:
  - Para acciones: Por índice (Merval, General)
  - Para CEDEARs: "7 Magníficas", por sector, Solo ETFs
  - Para bonos: Por ley (ARG / NY)
  - Filtro común: Solo positivos, solo negativos

□ FavoriteButton:
  - Estrella toggle (amarillo si favorito)
  - Optimistic update + API call
  - Si no autenticado → mostrar tooltip "Inicia sesión"

□ PriceDisplay component:
  - Formato moneda AR: $1.234,56
  - Color verde si positivo, rojo si negativo
  - Flecha arriba/abajo

□ PercentBadge component:
  - Badge con +2.5% (verde) o -1.3% (rojo)
  - Redondeado a 2 decimales
```

### Fase F5: Asset Detail Page (Estimación: 3-4 días)

```
□ Asset Detail Page (/assets/[ticker]):
  - Fetch asset info + quotes

□ PriceChart (componente principal):
  - TradingView Lightweight Charts
  - Line chart por defecto, toggle a Candlestick
  - Period selector: 1D, 5D, 1M, 3M, 6M, 1Y, 5Y, MAX
  - Cada período cambia el fetch
  - Tooltip on hover con OHLCV
  - Overlays opcionales: SMA 20/50/200, EMA, Bollinger
  - Responsive width

□ AssetStatsPanel:
  - Card lateral con métricas:
    → Precio actual (grande)
    → Variación diaria ($ y %)
    → Apertura, Máximo, Mínimo del día
    → Máximo 52 semanas, Mínimo 52 semanas
    → Volumen promedio 30d
    → Tipo de cambio implícito (solo CEDEARs)

□ Asset Info Section:
  - Nombre completo, sector, descripción
  - Para CEDEARs: subyacente, ratio, exchange
  - Para bonos: ley, TIR, duration, flujo de fondos (tabla)
  - Para LECAPs: vencimiento, TNA, TEA

□ Indicadores Técnicos:
  - Toggle buttons para activar/desactivar:
    → SMA 20 (azul), SMA 50 (naranja), SMA 200 (rojo)
    → EMA 12, EMA 26
    → Bollinger Bands
  - Cálculos hechos en frontend con los datos del gráfico
  - Panel separado para RSI y MACD (debajo del chart principal)

□ Related Assets:
  - Sección colapsable
  - Otros activos del mismo sector o tipo
  - Cards pequeños con ticker + precio + variación
```

### Fase F6: Auth Pages (Estimación: 1 día)

```
□ Login Page (/login):
  - Form: email + password
  - Validación con react-hook-form + zod
  - Botón "Probar Demo" prominente (sin registro)
  - Link a /register
  - Error handling: credenciales inválidas, rate limit

□ Register Page (/register):
  - Form: display name + email + password + confirm password
  - Validación strength del password
  - Redirect a /dashboard post-registro

□ Auth middleware (Next.js middleware.ts):
  - Proteger rutas /watchlist, /portfolio, /alerts, /settings
  - Redirect a /login si no autenticado

□ Hook useAuth:
  - login(email, password)
  - register(email, password, displayName)
  - startDemo()
  - logout()
  - refreshToken() automático
  - isAuthenticated computed
```

### Fase F7: Watchlist & Portfolio (Estimación: 3-4 días)

```
□ Watchlist Page (/watchlist):
  - Tabla con todos los favoritos del usuario
  - Columnas: Ticker, Nombre, Precio, Var %, Tipo, Acciones (quitar)
  - Precios actualizados via WebSocket
  - Empty state: "No tenés favoritos. Explorá activos →"
  - Botón "Agregar" → búsqueda inline

□ Portfolio Page (/portfolio):
  - Lista de portfolios del usuario
  - Card por portfolio: nombre, valor total, P&L total, variación %
  - Botón "Crear portfolio"
  - Create dialog: nombre + descripción

□ Portfolio Detail Page (/portfolio/[id]):
  - Tab 1: Tenencias
    → HoldingsTable: Ticker, Cantidad, Precio promedio, Precio actual, P&L ($), P&L (%), Peso (%)
    → Totales en footer: Valor total, P&L total
    → Botón "Registrar operación"
  
  - Tab 2: Performance
    → PerformanceChart: evolución del valor del portfolio
    → Period selector: 1M, 3M, 6M, 1Y, ALL
    → Benchmark overlay: vs Merval, vs Dólar MEP

  - Tab 3: Distribución
    → DonutChart: por activo, por tipo, por sector, por moneda
    → Toggle entre vistas

  - Tab 4: Operaciones
    → TradeHistory: tabla cronológica de compras/ventas
    → Filtros: por ticker, tipo, fecha

□ TradeForm (dialog):
  - Tipo: Compra / Venta
  - Activo: Autocomplete search
  - Cantidad
  - Precio por unidad
  - Moneda: ARS / USD
  - Fecha
  - Comisión (opcional)
  - Validación: ticker existe, cantidad > 0, si venta ≤ tenencia actual
```

### Fase F8: Alerts & Notifications (Estimación: 2-3 días)

```
□ Alerts Page (/alerts):
  - Lista de alertas del usuario
  - AlertCard por alerta:
    → Ícono por tipo (price/dollar/risk/pct/portfolio)
    → Descripción: "GGAL supera $8.000"
    → Estado: badge (Activa/Pausada/Disparada)
    → Toggle pausa/activar
    → Botones: editar, eliminar
  - Botón "Crear alerta" → AlertForm dialog
  - Contador: "3/20 alertas activas"

□ AlertForm (dialog con steps o tabs):
  - Step 1: Tipo de alerta
    → Precio de activo | Variación % | Dólar | Riesgo País | Portfolio
  - Step 2: Configuración
    → Seleccionar activo (si aplica)
    → Condición: Mayor que / Menor que / Cruza
    → Valor umbral
    → Período (si % change): Diario / Semanal
  - Step 3: Notificación
    → Canales: In-App (siempre) + Email (toggle)
    → Tipo: Una sola vez / Recurrente
  - Preview: "Te notificaremos cuando GGAL supere $8.000 por email e in-app"

□ NotificationBell (header):
  - Ícono campana con badge de count
  - Click → dropdown con últimas 5 notificaciones
  - Cada notif: título, preview body, "hace X tiempo", dot no leída
  - Link "Ver todas" → /notifications
  - WebSocket: actualización en real-time

□ Notifications Page (/notifications):
  - Lista paginada de todas las notificaciones
  - Filtros: Todas / No leídas / Por tipo
  - Botón "Marcar todas como leídas"
  - Cada notif clickeable → navega al activo relacionado

□ Toast notifications:
  - Cuando llega una nueva notificación por WebSocket
  - Toast breve (5seg) en esquina inferior derecha
  - Click en toast → navega al detalle
```

### Fase F9: Settings & Polish (Estimación: 1-2 días)

```
□ Settings Page (/settings):
  - Sección: Perfil (display name, email — read only)
  - Sección: Canales de notificación (In-App toggle, Email toggle)
  - Sección: Frecuencia (Real-time / Resumen horario / Resumen diario)
  - Sección: Horario silencioso (hora inicio, hora fin)
  - Sección: Tema (Dark / Light toggle)
  - Botón guardar con feedback

□ Loading States:
  - Skeleton loaders en todas las tablas y cards
  - Spinner en botones durante acciones

□ Empty States:
  - Ilustraciones SVG minimalistas para:
    → Watchlist vacía
    → Portfolio vacío
    → Sin alertas
    → Sin notificaciones
    → Sin resultados de búsqueda

□ Error States:
  - Toast para errores de red
  - Retry button
  - Fallback UI para errores de componente

□ Responsive:
  - Verificar todas las vistas en 768px, 1024px, 1440px
  - Tablas responsive: scroll horizontal en mobile
  - Charts responsive: ancho auto
```

### Fase F10: Testing & Final QA (Estimación: 2 días)

```
□ Component tests (Vitest + Testing Library):
  - PriceDisplay (formato correcto, colores)
  - PercentBadge (positivo/negativo/zero)
  - FavoriteButton (toggle, auth required)
  - AlertForm (validación, submit)
  - TradeForm (validación, FIFO check)

□ Integration tests:
  - Dashboard carga datos correctamente
  - Asset detail muestra gráfico
  - Portfolio muestra P&L correcto
  - Alert creation flow completo

□ Manual QA checklist:
  - [ ] Dashboard muestra datos reales
  - [ ] Búsqueda global funciona
  - [ ] Gráficos cargan para todos los períodos
  - [ ] Favoritos se persisten
  - [ ] Portfolio P&L es correcto
  - [ ] Alertas se configuran y disparan
  - [ ] Notificaciones llegan en real-time
  - [ ] Demo mode funciona sin registro
  - [ ] Dark/Light theme toggle funciona
  - [ ] Responsive en tablet
  - [ ] Auth flow completo (register → login → protected routes)
```

---

## 4. Configuraciones Transversales

### 4.1 Docker Compose Update

```
□ Actualizar docker-compose.yml:
  - Mantener postgres, redis, rabbitmq
  - No cambios necesarios (misma infraestructura)

□ Actualizar docker-compose.prod.yml:
  - Service backend: build context .
  - Service frontend: build context ./notifinance-frontend
  - Nginx reverse proxy (opcional para local)

□ Actualizar scripts/docker-setup.js:
  - Verificar que .env tiene las nuevas variables
  - Health check para los 3 servicios
```

### 4.2 CI/CD (Opcional pero recomendado)

```
□ GitHub Actions workflow:
  - On push to main:
    1. npm ci
    2. npm run lint
    3. npm run test:unit:cov
    4. npm run test:e2e:cov
    5. npx nest build
    6. (Si deploy) → deploy to Render/Vercel
```

### 4.3 Swagger / API Documentation

```
□ Configurar Swagger en main.ts:
  - Title: "NotiFinance API"
  - Description: "Financial tracking & notification engine API"
  - Version: "1.0"
  - Bearer auth scheme
  - Tags organizados por módulo
  - Server URLs: localhost + producción

□ Swagger UI accesible en: GET /api
```

### 4.4 README.md

```
□ Estructura del README:
  - Logo/Banner NotiFinance
  - Descripción one-liner
  - Screenshots (dashboard, portfolio, alerts)
  - Tech stack badges
  - Quick Start (3 pasos: clone → docker up → open browser)
  - Features list
  - Architecture overview
  - API documentation link (/api)
  - Environment variables reference
  - Testing
  - Deployment options
  - License
```

---

## 5. Orden de Ejecución Recomendado

```
SEMANA 1: Foundation
├── B1: Auth module + config setup
├── B2.1-B2.2: Market Data domain + API clients
└── F1: Frontend project setup

SEMANA 2: Core Data
├── B2.3-B2.5: Cron jobs + controllers + migrations + seeds
├── B2.6: Market Data tests
├── F2: Layout & Navigation
└── F3: Dashboard page

SEMANA 3: Features
├── B3: Alert module completo
├── B4: Notification module expansion
├── F4: Asset Explorer
└── F5: Asset Detail page (gráficos)

SEMANA 4: Portfolio & Integration
├── B5: Portfolio & Watchlist modules
├── B6: EventType migration & integration
├── F6: Auth pages
└── F7: Watchlist & Portfolio pages

SEMANA 5: Polish & Ship
├── B7: Demo mode & seeds
├── B8: Testing & quality
├── B9: Documentation
├── F8: Alerts & Notifications pages
├── F9: Settings & polish
└── F10: Final QA

Total estimado: 5 semanas de desarrollo
```

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-02-26 | Plan de implementación completo |
