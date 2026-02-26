# NotiFinance — Especificación Técnica

**Versión:** 1.0  
**Fecha:** 2026-02-26  
**Autor:** Arquitectura  
**Estado:** Aprobado para desarrollo  

---

## 1. Visión General de Arquitectura

### 1.1 Diagrama de Arquitectura de Alto Nivel

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND                                          │
│                          React 19 + Next.js 15                                   │
│                                                                                  │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌─────────┐ ┌────────┐ ┌───────────┐  │
│  │Dashboard │ │ Explorer  │ │  Detail  │ │Watchlist│ │Portfo- │ │  Alerts   │  │
│  │  Page    │ │   Page    │ │   Page   │ │  Page   │ │  lio   │ │   Page    │  │
│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └────┬────┘ └───┬────┘ └─────┬─────┘  │
│       │              │            │             │          │             │         │
│  ┌────┴──────────────┴────────────┴─────────────┴──────────┴─────────────┴─────┐  │
│  │                    API Client (Axios/React Query)                           │  │
│  │                    WebSocket Client (Socket.io-client)                      │  │
│  └────────────────────────────────┬───────────────────────────────────────────┘  │
└───────────────────────────────────┼──────────────────────────────────────────────┘
                                    │ HTTPS + WSS
┌───────────────────────────────────┼──────────────────────────────────────────────┐
│                                BACKEND                                           │
│                            NestJS 11                                             │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                      PRIMARY ADAPTERS (Input)                               │  │
│  │  ┌───────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │  │
│  │  │ REST API  │  │  WebSocket │  │  RabbitMQ  │  │  Cron Scheduler       │ │  │
│  │  │Controllers│  │  Gateway   │  │  Consumers │  │  (Market Data Jobs)   │ │  │
│  │  └─────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────────┬────────────┘ │  │
│  └────────┼────────────────┼───────────────┼───────────────────┼──────────────┘  │
│           │                │               │                   │                  │
│  ┌────────┼────────────────┼───────────────┼───────────────────┼──────────────┐  │
│  │        ▼                ▼               ▼                   ▼               │  │
│  │                    APPLICATION LAYER                                        │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────────────┐  │  │
│  │  │ MarketData   │ │   Alert      │ │  Portfolio   │ │  Notification     │  │  │
│  │  │ Service      │ │   Engine     │ │  Service     │ │  Dispatcher       │  │  │
│  │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └───────┬───────────┘  │  │
│  │         │                │                │                  │              │  │
│  │  ┌──────┴────────────────┴────────────────┴──────────────────┴───────────┐  │  │
│  │  │                    DOMAIN LAYER                                        │  │  │
│  │  │  Entities: Asset, Alert, Portfolio, Holding, Trade, MarketQuote       │  │  │
│  │  │  Enums: AssetType, AlertCondition, AlertStatus, TradeType             │  │  │
│  │  │  Errors: AlertLimitExceeded, AssetNotFound, InsufficientHoldings      │  │  │
│  │  └───────────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                   SECONDARY ADAPTERS (Output)                               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │  │
│  │  │PostgreSQL│ │  Redis   │ │ RabbitMQ │ │  Email   │ │  External APIs   │ │  │
│  │  │  TypeORM │ │  Cache   │ │ Publisher│ │  SMTP    │ │  (Market Data)   │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼──────────────────────────────────────────────┐
│                         INFRAESTRUCTURA                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────────┐  │
│  │PostgreSQL│  │  Redis   │  │ RabbitMQ │  │     APIs Financieras Externas    │  │
│  │  16      │  │  7       │  │  3.13    │  │  DolarApi · Yahoo Finance · etc  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Patrón Arquitectónico

El sistema sigue **Arquitectura Hexagonal (Ports & Adapters)** con las siguientes reglas estrictas definidas en `development_rules.md`:

- **Domain Layer:** Entidades puras TypeScript sin dependencias de framework
- **Application Layer:** Servicios que orquestan lógica de negocio + interfaces (ports) para dependencias externas
- **Infrastructure Layer:** Implementaciones concretas (adapters) de los ports definidos en application

### 1.3 Comunicación entre Componentes

```
[Cron Job] ──fetch──→ [External API] ──response──→ [MarketDataService]
                                                         │
                                                    ┌────┴────┐
                                                    │ Persists│
                                                    │ in DB + │
                                                    │ Redis   │
                                                    └────┬────┘
                                                         │
                                                    Publishes event
                                                    to RabbitMQ
                                                         │
                                                    ┌────┴────┐
                                                    │ Alert   │
                                                    │ Engine  │
                                                    │Consumer │
                                                    └────┬────┘
                                                         │
                                                   Evaluates all
                                                   active alerts
                                                   for asset
                                                         │
                                                    ┌────┴────┐
                                                    │ For each│
                                                    │ matched │
                                                    │ alert:  │
                                                    └────┬────┘
                                                         │
                                                  Publishes notification
                                                  event to RabbitMQ
                                                         │
                                                    ┌────┴────┐
                                                    │Notif.   │
                                                    │Dispatch │
                                                    │Service  │
                                                    └────┬────┘
                                                         │
                                              ┌──────────┼──────────┐
                                              ▼          ▼          ▼
                                          [WebSocket] [Email]  [In-App DB]
                                          push to     SMTP     persist for
                                          client      send     inbox
```

---

## 2. Stack Tecnológico

### 2.1 Backend

| Componente | Tecnología | Versión | Justificación |
|---|---|---|---|
| **Runtime** | Node.js | 20 LTS | Soporte largo plazo, compatibilidad NestJS |
| **Framework** | NestJS | 11.x | Ya en uso, modular, DI nativo, excelente ecosistema |
| **Lenguaje** | TypeScript | 5.x | Strict mode, type safety |
| **ORM** | TypeORM | 0.3.x | Ya en uso, migrations, QueryBuilder |
| **Base de Datos** | PostgreSQL | 16 | Ya en uso, soporte JSON, extensiones financieras |
| **Cache** | Redis | 7 | Ya en uso, pub/sub para WebSocket, cache de precios |
| **Message Broker** | RabbitMQ | 3.13 | Ya en uso, DLQ, routing flexible |
| **WebSocket** | @nestjs/websockets + Socket.io | 11.x | Real-time push de notificaciones y precios |
| **Scheduler** | @nestjs/schedule (cron) | 11.x | Jobs de ingesta de datos de mercado |
| **Auth** | @nestjs/jwt + @nestjs/passport | 11.x | JWT authentication + guards |
| **Email** | Nodemailer | 6.x | SMTP sending, templates HTML |
| **HTTP Client** | Axios | 1.x | Llamadas a APIs financieras externas |
| **Validation** | class-validator + class-transformer | 0.14.x | Ya en uso, decorators de validación |
| **Docs** | @nestjs/swagger | 11.x | Ya en uso, OpenAPI auto-generated |
| **Logger** | nestjs-pino + pino | 4.x | Ya en uso, structured JSON logging |
| **Health** | @nestjs/terminus | 11.x | Ya en uso, health checks |
| **Testing** | Jest + Supertest | 29.x | Ya en uso, unit + e2e |

### 2.2 Frontend

| Componente | Tecnología | Versión | Justificación |
|---|---|---|---|
| **Framework** | Next.js | 15.x | SSR/SSG para SEO, App Router, Server Components |
| **UI Library** | React | 19.x | Latest, Server Components support |
| **Lenguaje** | TypeScript | 5.x | Consistente con backend |
| **Styling** | Tailwind CSS | 4.x | Utility-first, rápido para prototipar, customizable |
| **Component Library** | shadcn/ui | latest | Componentes accesibles, customizables, no es dependencia |
| **Charts** | Lightweight Charts (TradingView) | 4.x | Gráficos financieros profesionales de TradingView |
| **Data Fetching** | TanStack Query (React Query) | 5.x | Cache, refetch automático, stale-while-revalidate |
| **HTTP Client** | Axios | 1.x | Interceptors, instance management |
| **WebSocket** | Socket.io-client | 4.x | Real-time updates, reconnection automática |
| **Forms** | React Hook Form + Zod | 7.x + 3.x | Validación declarativa, type-safe |
| **State** | Zustand | 5.x | Estado global ligero (auth, theme, websocket) |
| **Icons** | Lucide React | latest | Iconset consistente, estilo fintech |
| **Date** | date-fns | 3.x | Manipulación de fechas ligera |
| **Number Format** | Intl.NumberFormat (nativo) | - | Formateo de moneda sin dependencias |
| **Testing** | Vitest + Testing Library | 2.x | Fast, compatible con Vite |

### 2.3 Infraestructura

| Componente | Tecnología | Uso |
|---|---|---|
| **Containerización** | Docker + Docker Compose | Desarrollo local y producción |
| **DB** | PostgreSQL 16 | Persistencia principal |
| **Cache** | Redis 7 | Cache de precios, sesiones, pub/sub |
| **Queue** | RabbitMQ 3.13 | Event-driven processing |
| **Deploy Backend** | Render / Railway (free tier) | Producción gratuita |
| **Deploy Frontend** | Vercel (free tier) | Producción gratuita, edge network |
| **Email** | Resend (free tier: 100 emails/día) | Transactional email |

---

## 3. APIs Financieras Externas

### 3.1 Estrategia de Data Providers

Se usa un patrón de **fallback con múltiples proveedores** para garantizar disponibilidad:

```
Provider Primario → Falla? → Provider Secundario → Falla? → Cache (stale data)
```

### 3.2 Proveedores Seleccionados

#### Dólar Argentino

| API | Endpoint | Datos | Rate Limit | Documentación |
|---|---|---|---|---|
| **DolarApi.com** (primario) | `GET https://dolarapi.com/v1/dolares` | Oficial, Blue, MEP, CCL, Tarjeta, Cripto | Sin límite declarado | https://dolarapi.com |
| **Bluelytics** (fallback) | `GET https://api.bluelytics.com.ar/v2/latest` | Oficial, Blue | Sin límite declarado | https://bluelytics.com.ar |

**Formato de respuesta DolarApi (ejemplo):**
```json
[
  {
    "moneda": "USD",
    "casa": "oficial",
    "nombre": "Oficial",
    "compra": 1365.00,
    "venta": 1415.00,
    "fechaActualizacion": "2026-02-26T09:51:00.000Z"
  }
]
```

#### Acciones Argentinas, CEDEARs, Bonos, LECAPs, ONs

| API | Datos | Rate Limit | Auth | Documentación |
|---|---|---|---|---|
| **Yahoo Finance (vía yahoo-finance2 npm)** (primario) | Precios en tiempo real, históricos, quotes | ~2000/hora | No | https://github.com/gadicc/node-yahoo-finance2 |
| **Alpha Vantage** (fallback/complemento) | Precios US, fundamentals | 25 req/día (free) | API Key | https://www.alphavantage.co |
| **IOL API** (complemento para mercado AR) | Cotizaciones en BYMA | Requiere cuenta IOL | OAuth2 | https://api.invertironline.com |

**Notas sobre Yahoo Finance para mercado argentino:**
- Acciones BYMA usan sufijo `.BA` → Ejemplo: `GGAL.BA`, `YPFD.BA`
- CEDEARs son los mismos tickers que en BYMA con sufijo `.BA`
- Datos de velas (OHLCV) disponibles en intervals: 1d, 1wk, 1mo
- Datos intraday limitados a los últimos 7 días en el tier gratuito

#### Riesgo País

| API | Endpoint | Datos | Documentación |
|---|---|---|---|
| **Ámbito Financiero** (scraping) | `https://www.ambito.com/contenidos/riesgo-pais-702.html` | EMBI+ puntos | Web scraping con Cheerio |
| **DolarApi.com** (alternativa) | `GET https://dolarapi.com/v1/riesgo-pais` | Riesgo país en puntos | https://dolarapi.com |

#### Índices de Referencia

| Índice | Yahoo Finance Ticker |
|---|---|
| S&P Merval | `^MERV` |
| S&P 500 | `^GSPC` |
| Nasdaq Composite | `^IXIC` |
| Dow Jones | `^DJI` |

### 3.3 Catálogo de Activos

El sistema mantiene un **catálogo estático** de activos en la base de datos (seeded al inicio), que incluye:

| Tipo | Cantidad aprox. | Fuente del catálogo |
|---|---|---|
| Acciones Argentinas | ~80 tickers | Panel General BYMA |
| CEDEARs | ~300 tickers | BYMA |
| Bonos Soberanos USD | ~10 tickers | AL30, GD30, AL35, GD35, AL41, GD41, GD46, etc. |
| LECAPs / BONCAPs | ~15-20 tickers | Se actualizan con cada licitación |
| ONs | ~20-30 tickers principales | Principales emisores (YPF, Pampa, IRSA, etc.) |

Los tickers se almacenan en la tabla `assets` y se actualizan manualmente cuando el BYMA agrega/quita instrumentos. El sistema NO descubre activos automáticamente.

---

## 4. Diseño de Base de Datos

### 4.1 Diagrama Entidad-Relación

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│   users     │       │  user_preferences│       │    watchlists    │
│─────────────│       │─────────────────│       │──────────────────│
│ id (PK)     │──1:1──│ id (PK)         │       │ id (PK)          │
│ email       │       │ user_id (FK)    │       │ user_id (FK)     │
│ password    │       │ opt_in_channels │       │ asset_id (FK)    │
│ display_name│       │ disabled_events │       │ created_at       │
│ created_at  │       │ quiet_hours_*   │       └──────────────────┘
│ updated_at  │       │ digest_frequency│
└──────┬──────┘       └─────────────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐       ┌────────────────────┐
│    portfolios    │       │      trades        │
│──────────────────│       │────────────────────│
│ id (PK)          │──1:N──│ id (PK)            │
│ user_id (FK)     │       │ portfolio_id (FK)  │
│ name             │       │ asset_id (FK)      │
│ description      │       │ type (BUY/SELL)    │
│ created_at       │       │ quantity           │
│ updated_at       │       │ price_per_unit     │
└──────────────────┘       │ currency (ARS/USD) │
                           │ commission         │
       │                   │ executed_at        │
       │ 1:N               │ created_at         │
       ▼                   └────────────────────┘
┌──────────────────┐
│     alerts       │
│──────────────────│
│ id (PK)          │
│ user_id (FK)     │
│ asset_id (FK)    │ (nullable para alertas de portfolio)
│ condition        │ (ABOVE, BELOW, CROSSES, PCT_CHANGE_UP, PCT_CHANGE_DOWN)
│ threshold        │
│ period           │ (DAILY, WEEKLY — solo para % change)
│ channels[]       │ (IN_APP, EMAIL)
│ is_recurring     │
│ status           │ (ACTIVE, PAUSED, TRIGGERED, EXPIRED)
│ last_triggered_at│
│ created_at       │
│ updated_at       │
└──────────────────┘

┌──────────────────┐       ┌────────────────────────┐
│     assets       │       │    market_quotes       │
│──────────────────│       │────────────────────────│
│ id (PK)          │──1:N──│ id (PK)                │
│ ticker           │       │ asset_id (FK)          │
│ name             │       │ price_ars              │
│ asset_type       │       │ price_usd              │
│ sector           │       │ open                   │
│ yahoo_ticker     │       │ high                   │
│ description      │       │ low                    │
│ metadata (JSONB) │       │ close                  │
│ created_at       │       │ volume                 │
│ updated_at       │       │ change_pct             │
└──────────────────┘       │ date                   │
                           │ created_at             │
                           └────────────────────────┘

┌────────────────────────┐       ┌──────────────────────────┐
│   dollar_quotes        │       │   notifications          │
│────────────────────────│       │──────────────────────────│
│ id (PK)                │       │ id (PK)                  │
│ type                   │       │ user_id (FK)             │
│ buy_price              │       │ alert_id (FK) nullable   │
│ sell_price             │       │ title                    │
│ timestamp              │       │ body                     │
│ source                 │       │ type                     │
│ created_at             │       │ metadata (JSONB)         │
└────────────────────────┘       │ is_read                  │
                                 │ read_at                  │
┌────────────────────────┐       │ created_at               │
│ country_risk           │       └──────────────────────────┘
│────────────────────────│
│ id (PK)                │       ┌──────────────────────────┐
│ value                  │       │ notification_templates    │
│ change_pct             │       │──────────────────────────│
│ timestamp              │       │ id (PK)                  │
│ created_at             │       │ name                     │
└────────────────────────┘       │ event_type               │
                                 │ subject_template         │
                                 │ body_template            │
                                 │ created_at               │
                                 │ updated_at               │
                                 └──────────────────────────┘
```

### 4.2 Tablas Principales

#### `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

#### `assets`
```sql
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- STOCK, CEDEAR, BOND, LECAP, BONCAP, ON, INDEX, DOLLAR
    sector VARCHAR(100),
    yahoo_ticker VARCHAR(30),        -- e.g., GGAL.BA, AAPL
    currency VARCHAR(3) DEFAULT 'ARS',
    description TEXT,
    metadata JSONB DEFAULT '{}',     -- Datos adicionales variables por tipo
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_ticker ON assets(ticker);
CREATE INDEX idx_assets_type ON assets(asset_type);
```

#### `market_quotes`
```sql
CREATE TABLE market_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id),
    price_ars DECIMAL(18,4),
    price_usd DECIMAL(18,4),
    open_price DECIMAL(18,4),
    high_price DECIMAL(18,4),
    low_price DECIMAL(18,4),
    close_price DECIMAL(18,4),
    volume BIGINT,
    change_pct DECIMAL(8,4),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_id, date)
);

CREATE INDEX idx_quotes_asset_date ON market_quotes(asset_id, date DESC);
```

#### `alerts`
```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    asset_id UUID REFERENCES assets(id),       -- NULL for portfolio alerts
    alert_type VARCHAR(50) NOT NULL,            -- PRICE, PCT_CHANGE, DOLLAR, RISK, PORTFOLIO
    condition VARCHAR(20) NOT NULL,             -- ABOVE, BELOW, CROSSES, PCT_UP, PCT_DOWN
    threshold DECIMAL(18,4) NOT NULL,
    period VARCHAR(20),                         -- DAILY, WEEKLY (for % change)
    channels TEXT[] NOT NULL DEFAULT '{IN_APP}',
    is_recurring BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_asset_status ON alerts(asset_id, status);
```

#### `trades`
```sql
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id),
    asset_id UUID NOT NULL REFERENCES assets(id),
    trade_type VARCHAR(4) NOT NULL,         -- BUY, SELL
    quantity DECIMAL(18,8) NOT NULL,
    price_per_unit DECIMAL(18,4) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
    commission DECIMAL(18,4) DEFAULT 0,
    executed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trades_portfolio ON trades(portfolio_id);
CREATE INDEX idx_trades_asset ON trades(asset_id);
```

#### `notifications`
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    alert_id UUID REFERENCES alerts(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
```

---

## 5. Diseño de API REST

### 5.1 Convenciones Generales

- **Base URL:** `/api/v1`
- **Formato:** JSON
- **Auth:** Bearer JWT en header `Authorization`
- **Paginación:** `?page=1&limit=20&sortBy=field&sortOrder=ASC`
- **Errores:** Formato consistente `{ statusCode, message, error, timestamp, path }`
- **Versionado:** URL-based (`/api/v1/...`)

### 5.2 Endpoints Públicos (sin autenticación)

#### Market Data

```
GET    /api/v1/market/dollar                    → Cotizaciones del dólar (todos los tipos)
GET    /api/v1/market/dollar/:type              → Cotización específica (oficial, blue, mep, ccl)
GET    /api/v1/market/dollar/history?days=30    → Historial de cotizaciones

GET    /api/v1/market/risk                      → Riesgo país actual
GET    /api/v1/market/risk/history?days=30      → Historial riesgo país

GET    /api/v1/market/summary                   → Resumen: dolar + riesgo + top gainers/losers
GET    /api/v1/market/status                    → Estado del mercado (open/closed + countdown)
```

#### Assets

```
GET    /api/v1/assets                           → Listado paginado de activos
       ?type=STOCK|CEDEAR|BOND|LECAP|ON
       &sector=technology
       &search=AAPL
       &page=1&limit=20&sortBy=ticker

GET    /api/v1/assets/:ticker                   → Detalle del activo
GET    /api/v1/assets/:ticker/quotes            → Histórico de precios
       ?period=1D|5D|1M|3M|6M|1Y|5Y|MAX
GET    /api/v1/assets/:ticker/stats             → Estadísticas calculadas (52w high/low, avg vol, etc.)
GET    /api/v1/assets/:ticker/related           → Activos relacionados

GET    /api/v1/assets/top/gainers?type=STOCK    → Top 5 subas del día
GET    /api/v1/assets/top/losers?type=CEDEAR    → Top 5 bajas del día
```

#### Search

```
GET    /api/v1/search?q=galicia&limit=10        → Búsqueda global fuzzy
```

#### Auth

```
POST   /api/v1/auth/register                    → Registro de usuario
POST   /api/v1/auth/login                       → Login, retorna access + refresh tokens
POST   /api/v1/auth/refresh                     → Renovar access token
POST   /api/v1/auth/demo                        → Crear sesión demo (recruiter)
```

### 5.3 Endpoints Protegidos (requieren JWT)

#### Watchlist

```
GET    /api/v1/watchlist                        → Lista de favoritos del usuario
POST   /api/v1/watchlist/:ticker                → Agregar activo a favoritos
DELETE /api/v1/watchlist/:ticker                 → Quitar activo de favoritos
```

#### Portfolio

```
GET    /api/v1/portfolios                       → Listar portfolios del usuario
POST   /api/v1/portfolios                       → Crear portfolio
GET    /api/v1/portfolios/:id                   → Detalle de portfolio (holdings + value)
DELETE /api/v1/portfolios/:id                   → Eliminar portfolio

GET    /api/v1/portfolios/:id/holdings          → Tenencias actuales con P&L
GET    /api/v1/portfolios/:id/trades            → Historial de operaciones
POST   /api/v1/portfolios/:id/trades            → Registrar operación (buy/sell)

GET    /api/v1/portfolios/:id/performance       → Evolución del valor en el tiempo
       ?period=1M|3M|6M|1Y|ALL
GET    /api/v1/portfolios/:id/distribution      → Composición por tipo/sector/moneda
```

#### Alerts

```
GET    /api/v1/alerts                           → Listar alertas del usuario
POST   /api/v1/alerts                           → Crear alerta
GET    /api/v1/alerts/:id                       → Detalle de alerta
PATCH  /api/v1/alerts/:id                       → Editar alerta
PATCH  /api/v1/alerts/:id/status                → Cambiar estado (pause/activate)
DELETE /api/v1/alerts/:id                       → Eliminar alerta
```

#### Notifications

```
GET    /api/v1/notifications                    → Inbox paginado
       ?unreadOnly=true
GET    /api/v1/notifications/count              → Contador de no leídas
PATCH  /api/v1/notifications/:id/read           → Marcar como leída
PATCH  /api/v1/notifications/read-all           → Marcar todas como leídas
DELETE /api/v1/notifications/:id                → Eliminar notificación
```

#### Preferences

```
GET    /api/v1/preferences                      → Obtener preferencias del usuario
PUT    /api/v1/preferences                      → Actualizar preferencias
```

---

## 6. Diseño de Eventos y Message Broker

### 6.1 Topología RabbitMQ

```
Exchange: notifinance.events (topic)
├── Routing Key: market.quote.updated
│   └── Queue: alert-evaluation-queue
│       └── Consumer: AlertEvaluationConsumer
│
├── Routing Key: market.dollar.updated
│   └── Queue: alert-evaluation-queue (mismo consumer evalúa)
│
├── Routing Key: market.risk.updated
│   └── Queue: alert-evaluation-queue
│
├── Routing Key: alert.triggered
│   └── Queue: notification-dispatch-queue
│       └── Consumer: NotificationDispatchConsumer (ya existente, adaptado)
│
└── Dead Letter Exchange: notifinance.dlx
    └── Queue: notifinance.dlq
```

### 6.2 Formatos de Eventos

#### Evento: market.quote.updated
```json
{
  "eventId": "uuid",
  "eventType": "market.quote.updated",
  "timestamp": "2026-02-26T14:30:00Z",
  "payload": {
    "assetId": "uuid",
    "ticker": "GGAL",
    "assetType": "STOCK",
    "priceArs": 7055.00,
    "priceUsd": 4.95,
    "changePct": -1.78,
    "volume": 150000
  }
}
```

#### Evento: market.dollar.updated
```json
{
  "eventId": "uuid",
  "eventType": "market.dollar.updated",
  "timestamp": "2026-02-26T14:30:00Z",
  "payload": {
    "type": "MEP",
    "buyPrice": 1422.80,
    "sellPrice": 1428.70,
    "changePct": 0.35
  }
}
```

#### Evento: alert.triggered
```json
{
  "eventId": "uuid",
  "eventType": "alert.triggered",
  "timestamp": "2026-02-26T14:30:00Z",
  "payload": {
    "alertId": "uuid",
    "userId": "uuid",
    "recipientId": "uuid",
    "ticker": "GGAL",
    "condition": "ABOVE",
    "threshold": 7000,
    "currentValue": 7055,
    "channels": ["IN_APP", "EMAIL"]
  },
  "metadata": {
    "ticker": "GGAL",
    "currentPrice": "7055.00",
    "threshold": "7000.00",
    "condition": "superó"
  }
}
```

### 6.3 Flujo de Procesamiento

```
1. CronJob (cada 5 min) → MarketDataService.fetchAndUpdateQuotes()
2. MarketDataService → Persist to DB + Update Redis cache
3. MarketDataService → Publish "market.quote.updated" per updated asset
4. AlertEvaluationConsumer → Consume from alert-evaluation-queue
5. AlertEngine.evaluateAlertsForAsset(assetId, newPrice)
   → Query: SELECT * FROM alerts WHERE asset_id = ? AND status = 'ACTIVE'
   → For each alert: check if condition met
   → If met: Publish "alert.triggered" event
   → If recurring: keep ACTIVE; if one-time: set TRIGGERED
6. NotificationDispatchConsumer → Consume from notification-dispatch-queue
7. DispatcherService → Compile template → Resolve preferences → Send via channels
8. Channels: WebSocket push + Email + Persist to notifications table
```

---

## 7. Diseño de WebSocket

### 7.1 Gateway

```typescript
// Namespace: /notifications
// Events emitidos al cliente:
'notification:new'     → { id, title, body, type, createdAt }
'notification:count'   → { unreadCount: number }

// Namespace: /market  
// Events emitidos al cliente:
'market:dollar'        → { type, buy, sell, changePct, updatedAt }
'market:risk'          → { value, changePct, updatedAt }
'market:quote'         → { ticker, price, changePct, volume }

// Autenticación:
// Client envía JWT en handshake: { auth: { token: 'Bearer xxx' } }
// Para namespace /market: permite conexión sin auth (datos públicos)
// Para namespace /notifications: requiere JWT válido
```

### 7.2 Estrategia de Rooms (para actualizaciones selectivas)

```
- Room 'market:all'           → Todos los updates de mercado
- Room 'market:STOCK'         → Solo acciones argentinas
- Room 'market:CEDEAR'        → Solo CEDEARs
- Room 'user:{userId}'        → Notificaciones privadas del usuario
```

---

## 8. Diseño de Jobs de Ingesta (Cron)

### 8.1 Jobs Programados

| Job | Cron Expression | Descripción | Concurrencia |
|---|---|---|---|
| `DollarFetchJob` | `*/5 * * * *` | Obtener cotizaciones del dólar | Singleton |
| `RiskFetchJob` | `*/10 * * * *` | Obtener riesgo país | Singleton |
| `StockQuoteFetchJob` | `*/5 10-17 * * 1-5` | Obtener precios acciones AR (horario mercado) | Singleton |
| `CedearQuoteFetchJob` | `*/5 10-17 * * 1-5` | Obtener precios CEDEARs | Singleton |
| `BondQuoteFetchJob` | `*/15 10-17 * * 1-5` | Obtener precios bonos | Singleton |
| `HistoricalDataJob` | `0 18 * * 1-5` | Consolidar datos diarios al cierre | Singleton |
| `StaleAlertCleanupJob` | `0 3 * * *` | Limpiar alertas expiradas/antiguas | Singleton |

### 8.2 Patrón de Implementación de Jobs

```typescript
// Cada job sigue este patrón:
@Injectable()
export class DollarFetchJob {
    @Cron('*/5 * * * *')
    async execute(): Promise<void> {
        // 1. Log inicio con timestamp
        // 2. Fetch desde provider primario
        // 3. Si falla → intentar provider secundario
        // 4. Si falla → log warning, usar cache stale
        // 5. Si éxito → persist DB + update Redis
        // 6. Publish evento al broker
        // 7. Log fin con duration y registros procesados
    }
}
```

---

## 9. Autenticación y Autorización

### 9.1 Flujo JWT

```
1. POST /auth/login { email, password }
2. Validar credenciales vs DB (bcrypt compare)
3. Generar Access Token (JWT, 15 min TTL, payload: { sub: userId, email })
4. Generar Refresh Token (JWT, 7 días TTL, stored in httpOnly cookie)
5. Response: { accessToken, user: { id, email, displayName } }

Refresh flow:
1. POST /auth/refresh (cookie con refresh token)
2. Validar refresh token
3. Emitir nuevo access token + rotar refresh token
4. Response: { accessToken }
```

### 9.2 Guards

```typescript
// JwtAuthGuard → Valida el access token en Authorization header
// OptionalAuthGuard → Permite requests sin auth (datos públicos) pero inyecta user si hay token
// DemoGuard → Permite operaciones en modo demo con restricciones
```

### 9.3 Modo Demo

```
POST /auth/demo → 
  1. Crear usuario temporal (is_demo: true)
  2. Seed portfolio con trades de ejemplo
  3. Seed watchlist con 10 activos populares
  4. Seed 3 alertas activas
  5. Retornar JWT con TTL = 24 horas
  6. CronJob nocturno limpia usuarios demo expirados
```

---

## 10. Estructura de Módulos Backend

### 10.1 Mapa de Módulos NestJS

```
src/
├── main.ts
├── app.module.ts
│
├── modules/
│   ├── auth/                          # NUEVO
│   │   ├── auth.module.ts
│   │   ├── application/
│   │   │   ├── AuthService.ts
│   │   │   ├── IUserRepository.ts
│   │   │   └── ITokenService.ts
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── User.ts
│   │   │   ├── enums/
│   │   │   └── errors/
│   │   │       ├── InvalidCredentialsError.ts
│   │   │       └── EmailAlreadyExistsError.ts
│   │   └── infrastructure/
│   │       ├── primary-adapters/
│   │       │   └── http/
│   │       │       ├── controllers/AuthController.ts
│   │       │       └── guards/
│   │       │           ├── JwtAuthGuard.ts
│   │       │           ├── OptionalAuthGuard.ts
│   │       │           └── JwtStrategy.ts
│   │       └── secondary-adapters/
│   │           └── database/
│   │               ├── entities/UserOrmEntity.ts
│   │               ├── maps/UserMapper.ts
│   │               └── repositories/TypeOrmUserRepository.ts
│   │
│   ├── market-data/                   # NUEVO
│   │   ├── market-data.module.ts
│   │   ├── application/
│   │   │   ├── MarketDataService.ts
│   │   │   ├── IAssetRepository.ts
│   │   │   ├── IQuoteRepository.ts
│   │   │   ├── IDollarProvider.ts
│   │   │   ├── IRiskProvider.ts
│   │   │   └── IQuoteProvider.ts
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── Asset.ts
│   │   │   │   ├── MarketQuote.ts
│   │   │   │   ├── DollarQuote.ts
│   │   │   │   └── CountryRisk.ts
│   │   │   ├── enums/
│   │   │   │   ├── AssetType.ts
│   │   │   │   └── DollarType.ts
│   │   │   └── errors/
│   │   │       └── AssetNotFoundError.ts
│   │   └── infrastructure/
│   │       ├── primary-adapters/
│   │       │   ├── http/
│   │       │   │   └── controllers/
│   │       │   │       ├── MarketController.ts
│   │       │   │       ├── AssetController.ts
│   │       │   │       └── SearchController.ts
│   │       │   └── jobs/
│   │       │       ├── DollarFetchJob.ts
│   │       │       ├── RiskFetchJob.ts
│   │       │       ├── StockQuoteFetchJob.ts
│   │       │       ├── CedearQuoteFetchJob.ts
│   │       │       ├── BondQuoteFetchJob.ts
│   │       │       └── HistoricalDataJob.ts
│   │       └── secondary-adapters/
│   │           ├── database/
│   │           │   ├── entities/
│   │           │   ├── maps/
│   │           │   └── repositories/
│   │           └── http/
│   │               ├── clients/
│   │               │   ├── DolarApiClient.ts
│   │               │   ├── YahooFinanceClient.ts
│   │               │   └── AlphaVantageClient.ts
│   │               └── dto/
│   │                   ├── DolarApiResponse.ts
│   │                   └── YahooQuoteResponse.ts
│   │
│   ├── alert/                         # NUEVO
│   │   ├── alert.module.ts
│   │   ├── application/
│   │   │   ├── AlertService.ts
│   │   │   ├── AlertEvaluationEngine.ts
│   │   │   └── IAlertRepository.ts
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── Alert.ts
│   │   │   ├── enums/
│   │   │   │   ├── AlertType.ts
│   │   │   │   ├── AlertCondition.ts
│   │   │   │   └── AlertStatus.ts
│   │   │   └── errors/
│   │   │       ├── AlertLimitExceededError.ts
│   │   │       └── AlertNotFoundError.ts
│   │   └── infrastructure/
│   │       ├── primary-adapters/
│   │       │   ├── http/controllers/AlertController.ts
│   │       │   └── message-brokers/
│   │       │       └── consumers/AlertEvaluationConsumer.ts
│   │       └── secondary-adapters/
│   │           └── database/
│   │
│   ├── portfolio/                     # NUEVO
│   │   ├── portfolio.module.ts
│   │   ├── application/
│   │   │   ├── PortfolioService.ts
│   │   │   ├── TradeService.ts
│   │   │   ├── HoldingsCalculator.ts
│   │   │   ├── IPortfolioRepository.ts
│   │   │   └── ITradeRepository.ts
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── Portfolio.ts
│   │   │   │   ├── Trade.ts
│   │   │   │   └── Holding.ts
│   │   │   ├── enums/
│   │   │   │   └── TradeType.ts
│   │   │   └── errors/
│   │   │       ├── InsufficientHoldingsError.ts
│   │   │       └── PortfolioNotFoundError.ts  
│   │   └── infrastructure/
│   │       ├── primary-adapters/
│   │       │   └── http/controllers/
│   │       │       ├── PortfolioController.ts
│   │       │       └── TradeController.ts
│   │       └── secondary-adapters/
│   │           └── database/
│   │
│   ├── watchlist/                     # NUEVO
│   │   ├── watchlist.module.ts
│   │   ├── application/
│   │   │   ├── WatchlistService.ts
│   │   │   └── IWatchlistRepository.ts
│   │   ├── domain/
│   │   │   └── entities/
│   │   │       └── WatchlistItem.ts
│   │   └── infrastructure/
│   │       ├── primary-adapters/
│   │       │   └── http/controllers/WatchlistController.ts
│   │       └── secondary-adapters/
│   │           └── database/
│   │
│   ├── notification/                  # EXISTENTE — EXPANDIDO
│   │   ├── notification.module.ts
│   │   ├── application/
│   │   │   ├── services/
│   │   │   │   ├── DispatcherService.ts         # Adaptado
│   │   │   │   ├── NotificationService.ts       # NUEVO: CRUD inbox
│   │   │   │   └── IChannelProvider.ts
│   │   │   └── INotificationRepository.ts       # NUEVO
│   │   ├── domain/
│   │   │   └── entities/
│   │   │       └── Notification.ts              # NUEVO: entidad de dominio
│   │   └── infrastructure/
│   │       ├── primary-adapters/
│   │       │   ├── http/controllers/
│   │       │   │   └── NotificationController.ts # NUEVO: inbox API
│   │       │   ├── message-brokers/
│   │       │   └── websockets/
│   │       │       └── NotificationGateway.ts    # Adaptado
│   │       └── secondary-adapters/
│   │           ├── database/                     # NUEVO: persist notifs
│   │           ├── websockets/
│   │           └── workers/
│   │
│   ├── preferences/                   # EXISTENTE — EXPANDIDO
│   │   └── ...                        # Agregar: quiet_hours, digest_frequency
│   │
│   ├── template/                      # EXISTENTE — MANTENIDO
│   │   └── ...                        # Templates ahora son financieros
│   │
│   └── ingestion/                     # EXISTENTE — ADAPTADO
│       └── ...                        # EventType cambia a tipos financieros
│
└── shared/
    ├── application/
    │   └── interfaces/
    │       └── IBaseRepository.ts
    └── infrastructure/
        ├── base/
        │   ├── config/
        │   │   ├── app.config.ts
        │   │   ├── integrations.config.ts
        │   │   ├── auth.config.ts           # NUEVO
        │   │   └── market.config.ts         # NUEVO
        │   ├── database/
        │   ├── logger/
        │   └── redis/
        └── primary-adapters/
            └── http/
```

---

## 11. Estructura Frontend

### 11.1 Estructura del Proyecto (Next.js 15 App Router)

```
noticore-admin/   →   Se REEMPLAZA por:

notifinance-frontend/
├── public/
│   ├── favicon.ico
│   └── og-image.png
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (ThemeProvider, QueryProvider, SocketProvider)
│   │   ├── page.tsx                      # Landing → redirect to /dashboard
│   │   ├── globals.css
│   │   │
│   │   ├── (public)/                     # Grupo de rutas públicas
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx              # Dashboard principal (F1)
│   │   │   ├── assets/
│   │   │   │   ├── page.tsx              # Explorer con tabs por tipo (F2)
│   │   │   │   └── [ticker]/
│   │   │   │       └── page.tsx          # Detalle de activo (F3)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   └── (protected)/                  # Grupo de rutas protegidas (requiere auth)
│   │       ├── watchlist/
│   │       │   └── page.tsx              # Watchlist (F4)
│   │       ├── portfolio/
│   │       │   ├── page.tsx              # Resumen de portfolios (F5)
│   │       │   └── [id]/
│   │       │       └── page.tsx          # Detalle de portfolio
│   │       ├── alerts/
│   │       │   └── page.tsx              # Gestión de alertas (F6)
│   │       ├── notifications/
│   │       │   └── page.tsx              # Historial completo (F7)
│   │       └── settings/
│   │           └── page.tsx              # Preferencias del usuario (F8)
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components (Button, Card, Dialog, etc.)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx               # Navegación lateral
│   │   │   ├── Header.tsx                # Top bar con búsqueda + notif bell + user menu
│   │   │   ├── NotificationBell.tsx      # Ícono con badge + dropdown
│   │   │   └── CommandPalette.tsx        # Ctrl+K search
│   │   ├── dashboard/
│   │   │   ├── DollarPanel.tsx           # Panel de cotizaciones dólar
│   │   │   ├── RiskCountryCard.tsx       # Card de riesgo país con sparkline
│   │   │   ├── TopMoversTable.tsx        # Mejores/Peores del día
│   │   │   ├── IndexCard.tsx             # Card de índice (Merval, S&P, etc.)
│   │   │   ├── MarketStatusBadge.tsx     # Open/Closed indicator
│   │   │   └── WatchlistWidget.tsx       # Widget compacto de favoritos
│   │   ├── assets/
│   │   │   ├── AssetTable.tsx            # Tabla reutilizable de activos
│   │   │   ├── AssetFilters.tsx          # Panel de filtros
│   │   │   └── FavoriteButton.tsx        # Estrella toggle
│   │   ├── charts/
│   │   │   ├── PriceChart.tsx            # Gráfico TradingView Lightweight Charts
│   │   │   ├── SparklineChart.tsx        # Mini gráfico inline
│   │   │   ├── DonutChart.tsx            # Distribución del portfolio
│   │   │   └── PerformanceChart.tsx      # Evolución del portfolio
│   │   ├── portfolio/
│   │   │   ├── HoldingsTable.tsx
│   │   │   ├── TradeForm.tsx
│   │   │   ├── TradeHistory.tsx
│   │   │   └── PortfolioSummaryCard.tsx
│   │   ├── alerts/
│   │   │   ├── AlertForm.tsx
│   │   │   ├── AlertCard.tsx
│   │   │   └── AlertList.tsx
│   │   └── common/
│   │       ├── PriceDisplay.tsx          # Formato moneda con color verde/rojo
│   │       ├── PercentBadge.tsx          # Badge de variación %
│   │       ├── LoadingState.tsx
│   │       ├── EmptyState.tsx
│   │       └── ErrorState.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   ├── useMarketData.ts
│   │   ├── useNotifications.ts
│   │   └── useDebounce.ts
│   │
│   ├── lib/
│   │   ├── api.ts                        # Axios instance con interceptors
│   │   ├── socket.ts                     # Socket.io client instance
│   │   ├── format.ts                     # Formateo de moneda, %, fechas
│   │   └── utils.ts                      # cn() y utilidades generales
│   │
│   ├── stores/
│   │   ├── authStore.ts                  # Zustand: user, token, isAuthenticated
│   │   └── themeStore.ts                 # Zustand: dark/light mode
│   │
│   ├── types/
│   │   ├── api.ts                        # Tipos de respuesta de la API
│   │   ├── market.ts                     # DollarQuote, MarketQuote, Asset, etc.
│   │   ├── portfolio.ts                  # Portfolio, Trade, Holding
│   │   ├── alert.ts                      # Alert, AlertCondition, AlertType
│   │   └── notification.ts              # Notification
│   │
│   └── providers/
│       ├── QueryProvider.tsx             # TanStack Query provider
│       ├── SocketProvider.tsx            # Socket.io context provider
│       └── ThemeProvider.tsx             # Dark/Light theme provider
│
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local.example
```

### 11.2 Paleta de Colores (Dark Theme Fintech)

```css
/* Design tokens */
--background: #0a0a0f;           /* Fondo principal (casi negro) */
--surface: #12121a;              /* Cards y paneles */
--surface-hover: #1a1a2e;       /* Hover state */
--border: #1e1e2e;              /* Bordes sutiles */
--text-primary: #e4e4e7;        /* Texto principal */
--text-secondary: #71717a;      /* Texto secundario */
--accent: #6366f1;              /* Indigo - accent principal */
--accent-hover: #818cf8;        /* Accent hover */
--positive: #22c55e;            /* Verde - sube */
--negative: #ef4444;            /* Rojo - baja */
--warning: #f59e0b;             /* Amarillo - warning */
--chart-line: #6366f1;          /* Color línea de gráfico */
--chart-area: rgba(99,102,241,0.1); /* Área bajo la curva */
```

---

## 12. Seguridad

### 12.1 Backend

| Medida | Implementación |
|---|---|
| Password hashing | bcrypt con salt rounds = 12 |
| JWT signing | RS256 con key pair, o HS256 con secret rotable |
| Rate limiting | @nestjs/throttler: 100 req/min anónimo, 300 autenticado |
| Input validation | ValidationPipe global con whitelist + forbidNonWhitelisted |
| SQL injection | TypeORM parameterized queries exclusivamente |
| CORS | Whitelist de orígenes explícitos vía config |
| HTTP headers | Helmet middleware (CSP, HSTS, X-Frame-Options) |
| Secrets | Inyectados vía ConfigService, nunca hardcodeados |
| Brute force | Throttle específico en /auth/login: 5 intentos/15 min |

### 12.2 Frontend

| Medida | Implementación |
|---|---|
| Token storage | Access token en memoria (Zustand), Refresh en httpOnly cookie |
| XSS prevention | React escaping por defecto + CSP headers |
| Route protection | Middleware de Next.js para rutas protegidas |
| API calls | Axios interceptor agrega Authorization header automáticamente |

---

## 13. Deployment

### 13.1 Docker Compose (Desarrollo Local)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    # ... (ya existente)
  redis:
    image: redis:7-alpine
    # ... (ya existente)
  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    # ... (ya existente)

# docker-compose.prod.yml (adicional)
services:
  backend:
    build: .
    depends_on: [postgres, redis, rabbitmq]
  frontend:
    build: ./notifinance-frontend
    depends_on: [backend]
```

### 13.2 Deploy Gratuito en la Nube

| Servicio | Plataforma | Tier |
|---|---|---|
| Frontend | Vercel | Free (100GB bandwidth) |
| Backend | Render / Railway | Free (750h/mes) |
| PostgreSQL | Render / Supabase | Free (1GB) |
| Redis | Upstash | Free (10K commands/día) |
| RabbitMQ | CloudAMQP | Free (Lemur: 1M msgs/mes) |
| Email | Resend | Free (100 emails/día) |

### 13.3 Variables de Entorno

```env
# === Application ===
PORT=3000
NODE_ENV=production
CORS_ORIGINS=https://notifinance.vercel.app

# === Database ===
DATABASE_URL=postgresql://user:pass@host:5432/notifinance
RUN_MIGRATIONS=true

# === Redis ===
REDIS_URL=redis://host:6379

# === RabbitMQ ===
RABBITMQ_URL=amqp://user:pass@host:5672

# === Auth ===
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# === Market Data ===
YAHOO_FINANCE_ENABLED=true
ALPHA_VANTAGE_API_KEY=your-key
DOLAR_API_URL=https://dolarapi.com/v1

# === Email ===
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=alerts@notifinance.app
```

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-02-26 | Documento inicial completo |
