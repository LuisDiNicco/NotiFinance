# NotiFinance — Especificaciones Suplementarias v2.0 (Release 2)

**Versión:** 2.0  
**Fecha:** 2026-02-28  
**Estado:** Aprobado para desarrollo  

---

## 1. Seed Data Actualizado

### 1.1 Market Assets — Panel Líder Merval (Acciones)

Los 20 activos más líquidos del panel Merval al 28/02/2026. Fuente: BYMA.

| Ticker | Nombre | Sector | Tipo |
|---|---|---|---|
| GGAL | Grupo Financiero Galicia | Bancos | STOCK |
| YPF | YPF S.A. | Energía | STOCK |
| BMA | Banco Macro | Bancos | STOCK |
| SUPV | Grupo Supervielle | Bancos | STOCK |
| PAMP | Pampa Energía | Energía | STOCK |
| TXAR | Ternium Argentina | Siderurgia | STOCK |
| ALUA | Aluar | Siderurgia | STOCK |
| TECO2 | Telecom Argentina | Telecomunicaciones | STOCK |
| MIRG | Mirgor | Industrial | STOCK |
| CRES | Cresud | Agro | STOCK |
| LOMA | Loma Negra | Construcción | STOCK |
| EDN | Edenor | Energía/Utilities | STOCK |
| TGSU2 | TGS (Transp. Gas del Sur) | Energía/Gas | STOCK |
| TRAN | Transener | Energía/Transporte | STOCK |
| CEPU | Central Puerto | Energía/Generación | STOCK |
| COME | Sociedad Comercial del Plata | Holding | STOCK |
| VALO | Grupo Valores | Financiero | STOCK |
| BYMA | Bolsas y Mercados Argentinos | Financiero | STOCK |
| BBAR | BBVA Argentina | Bancos | STOCK |
| IRSA | IRSA Inversiones | Inmobiliario | STOCK |

### 1.2 CEDEARs — Top 20 por Volumen

| Ticker BA | Ticker US | Nombre | Ratio | Sector |
|---|---|---|---|---|
| MELI | MELI | MercadoLibre | 1:1 | E-commerce |
| AAPL | AAPL | Apple | 10:1 | Tecnología |
| MSFT | MSFT | Microsoft | 10:1 | Tecnología |
| AMZN | AMZN | Amazon | 18:1 | E-commerce |
| GOOGL | GOOGL | Alphabet | 14:1 | Tecnología |
| TSLA | TSLA | Tesla | 15:1 | Automotriz |
| NVDA | NVDA | NVIDIA | 10:1 | Semiconductores |
| META | META | Meta Platforms | 6:1 | Tecnología |
| BABA | BABA | Alibaba | 6:1 | E-commerce |
| KO | KO | Coca-Cola | 5:1 | Consumo |
| DIS | DIS | Walt Disney | 4:1 | Entretenimiento |
| GLOB | GLOB | Globant | 1:1 | Tecnología |
| WMT | WMT | Walmart | 5:1 | Retail |
| JPM | JPM | JPMorgan Chase | 3:1 | Bancos |
| V | V | Visa | 4:1 | Fintech |
| BA | BA | Boeing | 2:1 | Aeroespacial |
| GOLD | GOLD | Barrick Gold | 5:1 | Minería |
| PBR | PBR | Petrobras | 5:1 | Energía |
| DESP | DESP | Despegar | 3:1 | Turismo |
| VALE | VALE | Vale | 5:1 | Minería |

> **Nota:** Los ratios de conversión pueden cambiar. Verificar periódicamente contra BYMA.

### 1.3 Bonos Soberanos

| Ticker | Nombre | Moneda | Vencimiento | Cupón | Frecuencia |
|---|---|---|---|---|---|
| AL30 | Bonar 2030 Step-Up | ARS (dollar-linked) | 2030-07-09 | Step-up | Semestral |
| AL35 | Bonar 2035 | ARS | 2035-07-09 | 3.625% | Semestral |
| GD30 | Global 2030 | USD NY Law | 2030-07-09 | Step-up | Semestral |
| GD35 | Global 2035 | USD NY Law | 2035-07-09 | 3.625% | Semestral |
| GD38 | Global 2038 | USD NY Law | 2038-01-09 | 5.0% | Semestral |
| GD41 | Global 2041 | USD NY Law | 2041-07-09 | 3.5% | Semestral |
| GD46 | Global 2046 | USD NY Law | 2046-07-09 | 4.125% | Semestral |
| AL30D | Bonar 2030 (dólar, C) | USD | 2030-07-09 | Step-up | Semestral |
| GD30D | Global 2030 (dólar, D) | USD | 2030-07-09 | Step-up | Semestral |

### 1.4 LECAPs y BONCAPs (Ejemplo — Actualizar por Job de Catálogo)

> **IMPORTANTE:** Las LECAPs y BONCAPs se emiten y vencen frecuentemente. El `CatalogMaintenanceJob` debe marcar vencidas automáticamente. La lista de ejemplo solo incluye instrumentos vigentes a la fecha del seed.

| Ticker | Tipo | Vencimiento | Moneda | Notas |
|---|---|---|---|---|
| S31M5 | LECAP | 2025-03-31 | ARS | ⚠️ Verificar si vigente |
| S30J5 | LECAP | 2025-06-30 | ARS | ⚠️ Verificar si vigente |
| S29G5 | LECAP | 2025-08-29 | ARS | ⚠️ Verificar si vigente |
| S28N5 | LECAP | 2025-11-28 | ARS | ⚠️ Verificar si vigente |
| S30E6 | LECAP | 2026-01-30 | ARS | — |
| T15D5 | BONCAP | 2025-12-15 | ARS | ⚠️ Verificar si vigente |
| T13F6 | BONCAP | 2026-02-13 | ARS | ⚠️ Verificar si vigente |

> El seed debe incluir `maturity_date` para que el CatalogMaintenanceJob pueda marcar instrumentos vencidos.

### 1.5 Tipos de Dólar

| Key | Nombre en UI | Fuentes | Notas |
|---|---|---|---|
| `OFICIAL` | Dólar Oficial | DolarApi, Bluelytics, ArgentinaDatos, BCRA | BCRA como validación |
| `BLUE` | Dólar Blue | DolarApi, Bluelytics, CriptoYa | Consenso por mediana |
| `MEP` | Dólar MEP | Data912, DolarApi, **Cálculo propio** | Cálculo propio como validación |
| `CCL` | Dólar CCL | Data912, DolarApi, **Cálculo propio** | Cálculo propio como validación |
| `TARJETA` | Dólar Tarjeta | DolarApi | Oficial * 1.6 (impuestos) |
| `CRIPTO` | Dólar Cripto | CriptoYa | USDT/ARS en exchanges |

---

## 2. Contratos de API — Actualizaciones R2

### 2.1 Respuesta Enriquecida de Dólar

```
GET /api/v1/market-data/dollar
```

```json
{
  "data": {
    "oficial": {
      "buy": 1050.00,
      "sell": 1090.00,
      "source": "consensus:dolarapi,bluelytics,argentinadatos",
      "sourceTimestamp": "2026-02-28T14:30:00Z",
      "confidence": "HIGH",
      "bcraReference": 1070.00,
      "bcraDeviation": "0.9%"
    },
    "blue": {
      "buy": 1180.00,
      "sell": 1220.00,
      "source": "consensus:dolarapi,bluelytics",
      "sourceTimestamp": "2026-02-28T14:28:00Z",
      "confidence": "HIGH",
      "spreadVsOficial": "11.9%"
    },
    "mep": {
      "value": 1145.50,
      "source": "dolarapi",
      "sourceTimestamp": "2026-02-28T14:25:00Z",
      "confidence": "HIGH",
      "calculatedValue": 1147.20,
      "calculatedFrom": "AL30/AL30D"
    },
    "ccl": {
      "value": 1175.00,
      "source": "dolarapi",
      "sourceTimestamp": "2026-02-28T14:25:00Z",
      "confidence": "MEDIUM",
      "calculatedValue": 1173.80,
      "calculatedFrom": "GD30/GD30C"
    },
    "tarjeta": {
      "value": 1744.00,
      "source": "dolarapi",
      "sourceTimestamp": "2026-02-28T14:30:00Z",
      "confidence": "HIGH"
    },
    "cripto": {
      "value": 1190.00,
      "source": "criptoya",
      "sourceTimestamp": "2026-02-28T14:29:00Z",
      "confidence": "MEDIUM"
    }
  },
  "meta": {
    "fetchedAt": "2026-02-28T14:30:05Z",
    "nextUpdateIn": 300
  }
}
```

### 2.2 Respuesta de Acciones con Enrichment

```
GET /api/v1/market-data/assets/GGAL
```

```json
{
  "symbol": "GGAL",
  "name": "Grupo Financiero Galicia",
  "type": "STOCK",
  "sector": "Bancos",
  "description": "Grupo financiero líder en Argentina con operaciones bancarias, seguros y servicios financieros.",
  "isActive": true,
  "price": {
    "last": 7850.00,
    "change": 125.00,
    "changePercent": 1.62,
    "volume": 15234567,
    "source": "data912",
    "sourceTimestamp": "2026-02-28T16:45:00Z",
    "confidence": "HIGH"
  },
  "historical": {
    "available": true,
    "from": "2025-03-01",
    "to": "2026-02-28",
    "granularity": "daily"
  }
}
```

### 2.3 Respuesta de CEDEAR con Datos del Subyacente

```
GET /api/v1/market-data/assets/MELI
```

```json
{
  "symbol": "MELI",
  "name": "MercadoLibre",
  "type": "CEDEAR",
  "sector": "E-commerce",
  "isActive": true,
  "price": {
    "last": 2150000.00,
    "change": 35000.00,
    "changePercent": 1.65,
    "volume": 1234,
    "source": "data912",
    "sourceTimestamp": "2026-02-28T16:45:00Z",
    "confidence": "HIGH"
  },
  "cedearData": {
    "ratio": "1:1",
    "underlyingTicker": "MELI",
    "underlyingPriceUSD": 1850.00,
    "underlyingSource": "yahoo",
    "impliedExchangeRate": 1162.16
  }
}
```

### 2.4 Respuesta de Bono con Datos de Renta Fija

```
GET /api/v1/market-data/assets/AL30
```

```json
{
  "symbol": "AL30",
  "name": "Bonar 2030 Step-Up",
  "type": "BOND",
  "currency": "ARS",
  "isActive": true,
  "price": {
    "last": 76500.00,
    "change": 300.00,
    "changePercent": 0.39,
    "source": "data912",
    "sourceTimestamp": "2026-02-28T16:45:00Z",
    "confidence": "HIGH"
  },
  "bondData": {
    "maturityDate": "2030-07-09",
    "daysToMaturity": 1592,
    "couponRate": "step-up",
    "frequency": "semiannual",
    "yieldToMaturity": 12.5,
    "modifiedDuration": 3.2,
    "nextCouponDate": "2026-07-09",
    "nextCouponAmount": 0.75,
    "cashFlows": [
      { "date": "2026-07-09", "type": "coupon", "amount": 0.75 },
      { "date": "2027-01-09", "type": "coupon", "amount": 0.75 },
      { "date": "2027-07-09", "type": "coupon", "amount": 1.75 },
      { "date": "2030-07-09", "type": "coupon_principal", "amount": 101.75 }
    ]
  }
}
```

### 2.5 Respuesta de LECAP

```
GET /api/v1/market-data/assets/S30E6
```

```json
{
  "symbol": "S30E6",
  "name": "LECAP Enero 2026",
  "type": "LECAP",
  "currency": "ARS",
  "isActive": true,
  "price": {
    "last": 95200.00,
    "source": "data912",
    "sourceTimestamp": "2026-02-28T16:45:00Z",
    "confidence": "HIGH"
  },
  "lecapData": {
    "maturityDate": "2026-01-30",
    "daysToMaturity": 0,
    "faceValue": 100000,
    "tna": 72.5,
    "tea": 98.3,
    "isMatured": true
  }
}
```

### 2.6 Health de Providers

```
GET /api/v1/health/providers
```

```json
{
  "status": "OK",
  "timestamp": "2026-02-28T14:30:00Z",
  "providers": [
    {
      "name": "data912",
      "url": "https://data912.com",
      "dataTypes": ["stocks", "cedears", "bonds", "lecaps", "mep", "ccl"],
      "status": "OK",
      "uptime24h": 98.5,
      "avgLatencyMs": 230,
      "lastSuccessAt": "2026-02-28T14:30:00Z",
      "lastFailureAt": "2026-02-28T02:15:00Z",
      "lastError": "Connection timeout"
    },
    {
      "name": "dolarapi",
      "url": "https://dolarapi.com",
      "dataTypes": ["dollar", "risk"],
      "status": "OK",
      "uptime24h": 99.9,
      "avgLatencyMs": 120,
      "lastSuccessAt": "2026-02-28T14:30:00Z",
      "lastFailureAt": null,
      "lastError": null
    },
    {
      "name": "rava-scraper",
      "url": "https://www.rava.com",
      "dataTypes": ["stocks", "cedears", "bonds"],
      "status": "DEGRADED",
      "uptime24h": 75.0,
      "avgLatencyMs": 850,
      "lastSuccessAt": "2026-02-28T14:20:00Z",
      "lastFailureAt": "2026-02-28T14:25:00Z",
      "lastError": "HTML structure changed, parser failed"
    }
  ],
  "summary": {
    "total": 8,
    "ok": 6,
    "degraded": 1,
    "down": 1
  }
}
```

### 2.7 Noticias

```
GET /api/v1/news?limit=5&category=mercado
```

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "El Merval avanzó 2.5% impulsado por acciones bancarias",
      "summary": null,
      "source": "ambito",
      "sourceUrl": "https://www.ambito.com/mercados/merval-avanzo-n123456",
      "publishedAt": "2026-02-28T14:00:00Z",
      "category": "mercado",
      "relatedTickers": ["GGAL", "BMA", "SUPV"]
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "YPF reportó ganancias récord en el cuarto trimestre",
      "summary": null,
      "source": "cronista",
      "sourceUrl": "https://www.cronista.com/finanzas/ypf-ganancias-n78901",
      "publishedAt": "2026-02-28T13:30:00Z",
      "category": "mercado",
      "relatedTickers": ["YPF"]
    }
  ],
  "meta": {
    "total": 42,
    "limit": 5,
    "offset": 0
  }
}
```

---

## 3. Plantillas de Notificación (sin cambios mayores)

Se mantienen las 7 plantillas del MVP:

| Template | Uso |
|---|---|
| `price_alert` | Alerta de precio alcanzado |
| `percent_alert` | Alerta de variación porcentual |
| `risk_country_alert` | Alerta de riesgo país |
| `dollar_alert` | Alerta de tipo de cambio |
| `welcome` | Bienvenida a nuevo usuario |
| `portfolio_summary` | Resumen diario de portfolio |
| `market_summary` | Resumen de cierre de mercado |

### Cambios R2 en plantillas:

- Todas las plantillas de alerta incluyen `source` y `timestamp` del dato que disparó la alerta.
- Template `market_summary` incluye variación respecto al cierre anterior para cada sección.

---

## 4. Feriados del Mercado Argentino 2026

Para el componente `MarketStatusBadge`. Feriados bursátiles (BYMA no opera):

```typescript
const FERIADOS_BURSATILES_2026: string[] = [
  '2026-01-01', // Año Nuevo
  '2026-02-16', // Carnaval
  '2026-02-17', // Carnaval
  '2026-03-24', // Día de la Memoria
  '2026-04-02', // Día del Veterano
  '2026-04-03', // Viernes Santo
  '2026-05-01', // Día del Trabajador
  '2026-05-25', // Revolución de Mayo
  '2026-06-15', // Paso a la Inmortalidad Güemes (bridge)
  '2026-06-20', // Día de la Bandera
  '2026-07-09', // Día de la Independencia
  '2026-08-17', // Paso a la Inmortalidad San Martín
  '2026-10-12', // Día del Respeto a la Diversidad Cultural
  '2026-11-23', // Día de la Soberanía Nacional
  '2026-12-08', // Inmaculada Concepción
  '2026-12-25', // Navidad
];
```

> **Nota:** Verificar y actualizar con el calendario oficial de BYMA cada año.

---

## 5. Horarios del Mercado BYMA

```typescript
const MARKET_HOURS = {
  preMarket: { start: '10:00', end: '11:00' },   // Subasta de apertura
  regular:   { start: '11:00', end: '17:00' },   // Rueda continua
  postMarket: { start: '17:00', end: '17:15' },  // Subasta de cierre
  timezone: 'America/Argentina/Buenos_Aires',
};
```

---

## 6. Variables de Entorno Completas

### Backend (.env)

```env
# --- Base de datos ---
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=notifinance
DB_PASSWORD=notifinance_dev
DB_NAME=notifinance

# --- Redis ---
REDIS_HOST=localhost
REDIS_PORT=6379

# --- RabbitMQ ---
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# --- Auth ---
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# --- Fuentes de datos existentes ---
DATA912_BASE_URL=https://data912.com
DOLAR_API_BASE_URL=https://dolarapi.com/v1
BLUELYTICS_BASE_URL=https://api.bluelytics.com.ar/v2
CRIPTOYA_BASE_URL=https://criptoya.com/api
ARGENTINA_DATOS_BASE_URL=https://api.argentinadatos.com/v1
AMBITO_BASE_URL=https://mercados.ambito.com

# --- Nuevas fuentes R2 ---
BCRA_API_BASE_URL=https://api.bcra.gob.ar
BYMA_DATA_BASE_URL=https://open.bymadata.com.ar
RAVA_BASE_URL=https://www.rava.com

# --- Yahoo Finance (históricos) ---
YAHOO_FINANCE_ENABLED=true

# --- Scraping R2 ---
SCRAPING_RATE_LIMIT_MS=10000
SCRAPING_USER_AGENT=NotiFinance/2.0 (educational project)

# --- Noticias R2 ---
NEWS_FETCH_INTERVAL_MINUTES=30
NEWS_MAX_AGE_DAYS=7
AMBITO_RSS_URL=https://www.ambito.com/rss/economia.xml
CRONISTA_RSS_URL=https://www.cronista.com/files/rss/mercados.xml
INFOBAE_RSS_URL=https://www.infobae.com/feeds/rss/economia/

# --- Provider Health R2 ---
PROVIDER_HEALTH_CHECK_INTERVAL_MINUTES=5
PROVIDER_DEGRADED_THRESHOLD_PERCENT=80
PROVIDER_DOWN_THRESHOLD_PERCENT=50

# --- Data Quality R2 ---
DATA_STALE_THRESHOLD_MINUTES=30
DATA_WARNING_THRESHOLD_MINUTES=60
DOLLAR_CROSS_VALIDATION_THRESHOLD_PERCENT=2

# --- App ---
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
DEMO_MODE=true
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NotiFinance
NEXT_PUBLIC_DEMO_MODE=true
```

---

## 7. RSS Feed URLs para Módulo de Noticias

| Fuente | URL RSS | Categoría | Formato | Notas |
|---|---|---|---|---|
| Ámbito Financiero — Economía | `https://www.ambito.com/rss/economia.xml` | economia | RSS 2.0 | ⚠️ Verificar URL exacta |
| Ámbito Financiero — Mercados | `https://www.ambito.com/rss/mercados.xml` | mercado | RSS 2.0 | ⚠️ Verificar URL exacta |
| El Cronista — Finanzas | `https://www.cronista.com/files/rss/mercados.xml` | mercado | RSS 2.0 | ⚠️ Verificar URL exacta |
| Infobae — Economía | `https://www.infobae.com/feeds/rss/economia/` | economia | RSS 2.0 | ⚠️ Verificar URL exacta |

> **Nota:** Las URLs de RSS feeds pueden cambiar sin previo aviso. El `NewsAggregationJob` debe manejar 404/cambios gracefully. Verificar las URLs antes de implementar.

---

## 8. Design Tokens (sin cambios — referencia a `development_rules/08_tailwind_design_tokens.md`)

Se mantienen todos los design tokens del MVP. No hay cambios de diseño visual en R2, solo adiciones:

### Tokens nuevos R2

```css
/* Freshness indicator colors */
--freshness-green: var(--color-green-500);
--freshness-yellow: var(--color-yellow-500);
--freshness-red: var(--color-red-500);
--freshness-gray: var(--color-gray-400);

/* Stale data banner */
--stale-banner-bg: var(--color-yellow-50);
--stale-banner-border: var(--color-yellow-400);
--stale-banner-text: var(--color-yellow-800);
```

---

## 9. Documentación de Fuentes de Datos

### 9.1 Data912

| Campo | Valor |
|---|---|
| URL | `https://data912.com` |
| Tipo | API REST gratuita |
| Auth | Ninguna |
| Rate limit | No documentado (usar con prudencia: max 1 req/5s) |
| Endpoints | `/live/arg_stocks`, `/live/arg_cedears`, `/live/arg_bonds`, `/live/arg_corp`, `/live/arg_notes`, `/live/mep`, `/live/ccl`, `/historical/{type}/{symbol}` |
| Formato respuesta | JSON |
| Disclaimer | "Datos con fines educativos" |
| Confiabilidad observada | ~95% uptime, caídas esporádicas nocturnas |
| Datos proporcionados | Precio, variación, volumen para acciones locales, CEDEARs, bonos, ONs, LECAPs |

### 9.2 DolarApi

| Campo | Valor |
|---|---|
| URL | `https://dolarapi.com/v1` |
| Tipo | API REST gratuita (open source) |
| Auth | Ninguna |
| Rate limit | Razonable (no documentado) |
| Endpoints | `/dolares`, `/dolares/oficial`, `/dolares/blue`, `/dolares/bolsa`, `/cotizaciones`, `/riesgo-pais` |
| Formato | JSON |
| Licencia | MIT |
| Confiabilidad | ~99% uptime |

### 9.3 Bluelytics

| Campo | Valor |
|---|---|
| URL | `https://api.bluelytics.com.ar/v2` |
| Tipo | API REST gratuita |
| Auth | Ninguna |
| Endpoints | `/latest` (oficial + blue + euro), `/evolution.json` |
| Formato | JSON: `{oficial: {value_avg, value_sell, value_buy}, blue: {...}}` |
| Confiabilidad | ~98% uptime |

### 9.4 CriptoYa

| Campo | Valor |
|---|---|
| URL | `https://criptoya.com/api` |
| Tipo | API REST gratuita |
| Auth | Ninguna |
| Endpoints | `/usdt/ars`, `/dolar` |
| Datos | Precio USDT/ARS en exchanges argentinos, dólar tarjeta |
| Confiabilidad | ~95% uptime |

### 9.5 ArgentinaDatos

| Campo | Valor |
|---|---|
| URL | `https://api.argentinadatos.com/v1` |
| Tipo | API REST gratuita |
| Auth | Ninguna |
| Endpoints | `/cotizaciones/dolares`, `/finanzas/indices/riesgo-pais/ultimo` |
| Confiabilidad | ~90% uptime (intermitente) |

### 9.6 BCRA API (nueva R2)

| Campo | Valor |
|---|---|
| URL | `https://api.bcra.gob.ar` |
| Tipo | API REST pública oficial |
| Auth | Ninguna |
| Endpoints | Tipo de cambio de referencia |
| Uso en NotiFinance | Solo validación de dólar oficial (no como fuente de consenso) |

### 9.7 Rava Bursátil (nueva R2 — scraping)

| Campo | Valor |
|---|---|
| URL | `https://www.rava.com` |
| Tipo | Web scraping con cheerio |
| Auth | Ninguna (sitio público) |
| Páginas a scrapear | `/empresas/cotizaciones`, `/empresas/perfil/{ticker}` |
| Rate limit | 1 req cada 10s (auto-impuesto) |
| Datos | Cotizaciones, TIR de bonos, info de CEDEARs |
| Riesgo | Cambios de HTML pueden romper parser |
| Mitigación | Tests con fixture; fallback a Data912 |

### 9.8 BYMA Data (nueva R2)

| Campo | Valor |
|---|---|
| URL | `https://open.bymadata.com.ar` |
| Tipo | API pública oficial de la bolsa |
| Auth | Posible requerir registro gratuito |
| Datos | Cotizaciones oficiales BYMA |
| Estado | Verificar disponibilidad y formato antes de implementar |

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-02-26 | Especificaciones suplementarias completas del MVP |
| 2.0 | 2026-02-28 | Reescritura para R2: seed actualizado, contratos enriquecidos, fuentes documentadas |
