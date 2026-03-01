# NotiFinance — Especificación Técnica v2.0 (Release 2)

**Versión:** 2.0  
**Fecha:** 2026-02-28  
**Estado:** Aprobado para desarrollo — Release 2  

---

## 1. Vista General de Arquitectura

### 1.1 Stack Tecnológico (sin cambios)

| Capa | Tecnología | Versión |
|---|---|---|
| Backend framework | NestJS | 11.x |
| Runtime | Node.js | 22 LTS |
| Lenguaje | TypeScript | 5.7+ |
| Base de datos | PostgreSQL | 16 |
| Caché | Redis | 7 |
| Message broker | RabbitMQ | 3.13 |
| Frontend framework | Next.js | 15 |
| UI library | React | 19 |
| CSS | Tailwind CSS | v4 |
| Componentes | shadcn/ui | latest |
| State management | Zustand 5 + TanStack Query 5 | — |
| Charts | TradingView Lightweight Charts | 4.x |
| WebSocket | Socket.io | 4.x |
| ORM | TypeORM | 0.3.x |
| Testing backend | Jest | 29.x |
| Testing frontend | Vitest + Playwright | — |

### 1.2 Arquitectura Hexagonal (Clean Architecture)

El sistema sigue arquitectura hexagonal con inversión de dependencias. Cada módulo se organiza en:

```
src/modules/<module>/
├── domain/           # Entidades, value objects, interfaces de repositorio
├── application/      # Use cases, DTOs, interfaces de servicios externos
│   ├── dtos/
│   ├── interfaces/
│   └── use-cases/
└── infrastructure/   # Implementaciones concretas
    ├── primary-adapters/    # Controllers, Gateways (WebSocket)
    └── secondary-adapters/  # Repositories, HTTP clients, mailers
```

**Regla de dependencia:** `domain` ← `application` ← `infrastructure`. Nunca al revés.

### 1.3 Módulos del Sistema

| Módulo | Estado MVP | Cambios en R2 |
|---|---|---|
| `auth` | ✅ Completo | Sin cambios |
| `market-data` | ✅ Completo | **Cambios mayores:** nueva capa de providers, scoring, scraping, históricos |
| `alert` | ✅ Completo | Validación E2E con datos reales |
| `notification` | ✅ Completo | Sin cambios estructurales |
| `portfolio` | ✅ Completo | Indicadores de frescura de precios |
| `watchlist` | ✅ Completo | Sin cambios |
| `preferences` | ✅ Completo | Sin cambios |
| `template` | ✅ Completo | Sin cambios |
| `ingestion` | ✅ Completo | Nuevo endpoint health/providers |
| `news` | ❌ No existe | **NUEVO:** agregación RSS/scraping |

---

## 2. Fuentes de Datos — Arquitectura de Providers R2

### 2.1 Mapa de Fuentes

#### Dólar

| Fuente | URL base | Datos | Prioridad | Estado MVP |
|---|---|---|---|---|
| DolarApi | `https://dolarapi.com/v1` | Todos los tipos | Primaria | ✅ Activa |
| Bluelytics | `https://api.bluelytics.com.ar/v2` | Oficial, Blue | Secundaria | ✅ Activa |
| CriptoYa | `https://criptoya.com/api` | Cripto, tarjeta | Terciaria | ✅ Activa |
| ArgentinaDatos | `https://api.argentinadatos.com/v1` | Todos los tipos | Validación | 🆕 Nuevo |
| BCRA API | `https://api.bcra.gob.ar` | Oficial referencia | Validación | 🆕 Nuevo |

#### Acciones / CEDEARs / Bonos / LECAPs

| Fuente | URL base | Datos | Prioridad | Estado MVP |
|---|---|---|---|---|
| Data912 | `https://data912.com/live/` | arg_stocks, arg_cedears, arg_bonds, arg_corp, arg_notes | Primaria | ✅ Activa |
| Rava Bursátil | `https://www.rava.com` | Cotizaciones, TIR bonos, fundamentos | Secundaria | 🆕 Scraping |
| BYMA Data | `https://open.bymadata.com.ar` | API oficial de la bolsa | Terciaria | 🆕 Nuevo |
| Yahoo Finance | `finance.yahoo.com` | Históricos, subyacentes US de CEDEARs | Históricos | ✅ Activa (fallback) |

#### Riesgo País

| Fuente | URL | Prioridad | Estado MVP |
|---|---|---|---|
| ArgentinaDatos | `/v1/finanzas/indices/riesgo-pais/ultimo` | Primaria | ✅ Activa |
| DolarApi | `/v1/riesgo-pais` | Secundaria | ✅ Activa |
| Ámbito Financiero | Ámbito scraping | Terciaria | ✅ Activa |

#### Noticias / Contexto

| Fuente | Mecanismo | Datos | Estado |
|---|---|---|---|
| Ámbito Financiero | RSS feed | Noticias económicas | 🆕 Nuevo |
| El Cronista | RSS feed | Noticias mercado | 🆕 Nuevo |
| Infobae Economía | RSS feed | Noticias generales | 🆕 Nuevo |

### 2.2 Arquitectura del Provider Manager

```
ProviderManager
├── ProviderRegistry        # Registro de todas las fuentes disponibles
├── ProviderHealthTracker   # Uptime, latencia, errores por fuente
├── ProviderScorer          # Confidence scoring basado en health
└── ProviderOrchestrator    # Selección de fuente y fallback automático

Flujo:
1. Orchestrator pide dato a fuente primaria
2. Si falla → health tracker registra fallo → intenta secundaria
3. Cada respuesta exitosa incluye {source, timestamp, confidence}
4. Confidence = f(uptime_24h, latency_avg, error_rate, data_age)
```

### 2.3 Modelo de Datos Enriquecido para Cotizaciones

Campos adicionales en respuestas de market-data:

```typescript
interface EnrichedQuote {
  // Campos existentes
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  
  // Campos nuevos R2
  source: string;            // "data912" | "rava" | "byma" | "dolarapi" | etc
  sourceTimestamp: Date;     // Timestamp del dato en la fuente original
  fetchedAt: Date;           // Timestamp de cuando lo obtuvimos
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  staleThresholdMinutes: number;  // Configurable por tipo de activo
}
```

---

## 3. Base de Datos — Cambios R2

### 3.1 Nuevas Tablas

#### `provider_health`

```sql
CREATE TABLE provider_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR(50) NOT NULL,
  provider_url VARCHAR(255),
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_error_message TEXT,
  success_count_24h INTEGER DEFAULT 0,
  failure_count_24h INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  status VARCHAR(20) DEFAULT 'UNKNOWN',  -- OK | DEGRADED | DOWN | UNKNOWN
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `news_articles`

```sql
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  source_name VARCHAR(100) NOT NULL,      -- "ambito" | "cronista" | "infobae"
  source_url VARCHAR(1000) NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  category VARCHAR(50),                    -- "mercado" | "economia" | "dolar" | "politica"
  related_tickers VARCHAR(500),            -- "GGAL,YPF,AL30" — para búsqueda
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_url)
);

CREATE INDEX idx_news_published ON news_articles(published_at DESC);
CREATE INDEX idx_news_category ON news_articles(category);
```

### 3.2 Cambios a Tablas Existentes

#### `market_assets` — Nuevos campos

```sql
ALTER TABLE market_assets ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE market_assets ADD COLUMN maturity_date DATE;            -- Para bonos/LECAPs
ALTER TABLE market_assets ADD COLUMN last_catalog_check TIMESTAMPTZ;
ALTER TABLE market_assets ADD COLUMN company_description TEXT;       -- Para acciones
ALTER TABLE market_assets ADD COLUMN cedear_ratio VARCHAR(20);       -- Ej: "1:1", "10:1"
ALTER TABLE market_assets ADD COLUMN cedear_underlying VARCHAR(20);  -- Ticker US
```

#### `market_quotes` — Nuevos campos

```sql
ALTER TABLE market_quotes ADD COLUMN source VARCHAR(50);
ALTER TABLE market_quotes ADD COLUMN source_timestamp TIMESTAMPTZ;
ALTER TABLE market_quotes ADD COLUMN confidence VARCHAR(10);  -- HIGH | MEDIUM | LOW
```

---

## 4. API — Cambios y Nuevos Endpoints R2

### 4.1 Endpoints Modificados

Todos los endpoints existentes de market-data incluyen `source`, `sourceTimestamp` y `confidence` en sus respuestas. No se rompe backward compatibility — son campos opcionales adicionales.

### 4.2 Nuevos Endpoints

#### Health de Providers

```
GET /api/v1/health/providers
```

```json
{
  "status": "OK",
  "providers": [
    {
      "name": "data912",
      "url": "https://data912.com",
      "status": "OK",
      "uptime24h": 98.5,
      "avgLatencyMs": 230,
      "lastSuccessAt": "2026-02-28T14:30:00Z",
      "lastFailureAt": null,
      "lastError": null
    }
  ],
  "summary": {
    "total": 8,
    "ok": 7,
    "degraded": 1,
    "down": 0
  }
}
```

#### Noticias

```
GET /api/v1/news?limit=10&category=mercado
GET /api/v1/news?ticker=GGAL&limit=5
```

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "El Merval avanzó 2.5% impulsado por bancos",
      "source": "ambito",
      "sourceUrl": "https://www.ambito.com/...",
      "publishedAt": "2026-02-28T14:00:00Z",
      "category": "mercado",
      "relatedTickers": ["GGAL", "BMA", "SUPV"]
    }
  ],
  "meta": { "total": 50, "limit": 10, "offset": 0 }
}
```

### 4.3 WebSocket — Nuevos Eventos

| Evento | Namespace | Payload adicional R2 |
|---|---|---|
| `market:dollar` | `/market` | +`source`, `confidence`, `fetchedAt` |
| `market:risk` | `/market` | +`source`, `confidence`, `fetchedAt` |
| `market:movers` | `/market` | +`source` por cada mover |
| `news:latest` | `/market` | 🆕 Nuevo: último titular publicado |

---

## 5. Jobs y Procesamiento Background — R2

### 5.1 Jobs Existentes (ajustes)

| Job | Cron actual | Cambio R2 |
|---|---|---|
| `DollarUpdateJob` | Cada 5 min | +Validación cruzada BCRA |
| `MarketQuotesJob` | Cada 5 min (mercado abierto) | +source/confidence en cada quote |
| `RiskCountryJob` | Cada 15 min | +Validación cruzada entre fuentes |
| `AlertEvaluationJob` | Cada 2 min | Tests E2E con datos reales |
| `StaleDataCleanupJob` | Diario 3 AM | Sin cambios |

### 5.2 Jobs Nuevos

| Job | Cron | Descripción |
|---|---|---|
| `CatalogMaintenanceJob` | Semanal (domingo 2 AM) | Marca vencidos, detecta nuevos instrumentos |
| `HistoricalBackfillJob` | Bajo demanda + diario (4 AM) | Llena gaps en datos históricos |
| `NewsAggregationJob` | Cada 30 min | Fetch RSS feeds, parsea, guarda en DB |
| `ProviderHealthJob` | Cada 5 min | Actualiza métricas por provider |
| `MEPCCLCalculationJob` | Cada 5 min (mercado abierto) | Calcula MEP/CCL con precios propios de bonos |

---

## 6. Scraping — Lineamientos Técnicos

### 6.1 Principios

- Todo scraping debe respetar `robots.txt` del sitio.
- Rate limiting: máximo 1 request cada 10 segundos por sitio.
- User-Agent descriptivo: `NotiFinance/2.0 (educational project)`.
- Fallback graceful: si el scraping falla, el sistema vuelve a la fuente anterior sin impacto en UX.
- Parsers desacoplados: cada scraper implementa una interfaz `IMarketDataProvider` para swap transparente.

### 6.2 Stack de Scraping

- HTTP client: `axios` (ya en el proyecto) con retry y timeout.
- HTML parsing: `cheerio` — ligero, sin headless browser.
- No usar Puppeteer/Playwright para scraping en producción (overhead prohibitivo para APIs gratuitas).

### 6.3 Scrapers Planificados

| Sitio | Datos | Parser |
|---|---|---|
| Rava Bursátil | Cotizaciones acciones, CEDEARs, bonos, TIR | HTML table parsing con cheerio |
| Ámbito Financiero | Riesgo país (existente), noticias | RSS XML parsing |
| El Cronista | Noticias mercado | RSS XML parsing |
| Infobae Economía | Noticias economía | RSS XML parsing |

---

## 7. Frontend — Cambios Técnicos R2

### 7.1 Nuevos Componentes

| Componente | Descripción |
|---|---|
| `FreshnessIndicator` | Badge verde/amarillo/rojo con tooltip de timestamp y fuente |
| `StaleDataBanner` | Banner de advertencia para datos > 1 hora |
| `ContextualErrorCard` | Reemplaza mensajes genéricos con contexto útil y retry |
| `NewsTicker` / `NewsWidget` | Widget de noticias para dashboard y detalle de activo |
| `ProviderHealthPanel` | Panel de estado de fuentes (admin/debug) |
| `SpreadIndicator` | Muestra brecha blue-oficial en % |
| `MarketStatusBadge` | Estado del mercado: abierto/cerrado/pre-market con hora |

### 7.2 Hooks Nuevos/Modificados

| Hook | Cambio |
|---|---|
| `useMarketData` | Retorna `source`, `confidence`, `fetchedAt` |
| `useFreshness` | 🆕 Calcula estado de frescura (green/yellow/red) a partir de `fetchedAt` |
| `useNews` | 🆕 TanStack Query para noticias con polling cada 5 min |
| `useProviderHealth` | 🆕 Estado de providers para panel de salud |

### 7.3 Regla de UI: "Dato Honesto"

```
SI dato.fetchedAt < 10 min → mostrar normalmente (badge verde)
SI dato.fetchedAt entre 10-30 min → mostrar con badge amarillo
SI dato.fetchedAt entre 30-60 min → badge rojo + nota "Dato desactualizado"
SI dato.fetchedAt > 60 min → banner de advertencia prominente
SI no hay dato → "Sin datos disponibles" (NUNCA inventar o mostrar 0)
```

---

## 8. Seguridad (sin cambios mayores)

Se mantiene la arquitectura de seguridad del MVP:
- JWT con RS256, access token 15 min, refresh token 7 días.
- Argon2 para hash de passwords.
- Rate limiting por IP y por usuario.
- Helmet, CORS configurado, sanitización de inputs.
- Las nuevas fuentes (scraping) no requieren autenticación del usuario.
- Los feeds RSS son públicos — sin credenciales.
- Los endpoints de noticias y health de providers son públicos (no requieren auth).

---

## 9. Configuración — Variables de Entorno Nuevas

```env
# --- Nuevas fuentes R2 ---
BCRA_API_BASE_URL=https://api.bcra.gob.ar
ARGENTINA_DATOS_BASE_URL=https://api.argentinadatos.com/v1
BYMA_DATA_BASE_URL=https://open.bymadata.com.ar
RAVA_BASE_URL=https://www.rava.com

# --- Scraping ---
SCRAPING_RATE_LIMIT_MS=10000
SCRAPING_USER_AGENT=NotiFinance/2.0 (educational project)

# --- Noticias ---
NEWS_FETCH_INTERVAL_MINUTES=30
NEWS_MAX_AGE_DAYS=7

# --- Provider health ---
PROVIDER_HEALTH_CHECK_INTERVAL_MINUTES=5
PROVIDER_DEGRADED_THRESHOLD_PERCENT=80
PROVIDER_DOWN_THRESHOLD_PERCENT=50

# --- Data quality ---
DATA_STALE_THRESHOLD_MINUTES=30
DATA_WARNING_THRESHOLD_MINUTES=60
DOLLAR_CROSS_VALIDATION_THRESHOLD_PERCENT=2
```

---

## 10. Testing R2 — Estrategia

### 10.1 Tests Unitarios Nuevos

- Provider scoring algorithm
- Freshness calculation logic
- MEP/CCL calculation from bond prices
- LECAP TNA/TEA calculation
- RSS parsing y normalización de noticias
- Catalog maintenance logic (vencimiento detection)
- Indicadores técnicos (SMA, EMA, RSI, MACD, Bollinger) — correctitud numérica

### 10.2 Tests de Integración Nuevos

- Scraper de Rava con HTML fixture
- BYMA Data client con response mocks
- BCRA API client
- NewsAggregation service (RSS fixtures)

### 10.3 Tests E2E Nuevos

- Flujo completo: precio real → alerta → notificación → WebSocket
- Health de providers endpoint
- News endpoint

### 10.4 Scripts de QA de Datos (runtime)

Se mantienen y amplían los scripts existentes:
- `scripts/market-data-quality.js` — Verifica precisión vs fuentes de referencia
- `scripts/market-assets-quality.js` — Verifica catálogo de activos
- 🆕 `scripts/provider-health-check.js` — Estado de todas las fuentes

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-02-26 | Especificación técnica completa del MVP |
| 2.0 | 2026-02-28 | Reescritura para R2: providers, scoring, scraping, noticias, freshness |
