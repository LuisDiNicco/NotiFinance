# NotiFinance — Especificaciones Complementarias

**Versión:** 1.0  
**Fecha:** 2026-02-26  
**Autor:** Arquitectura  
**Estado:** Aprobado para desarrollo  

Este documento contiene especificaciones de datos, contratos de API, catálogos de seeds, design tokens y variables de entorno que complementan los documentos 01, 02 y 03.

---

## 1. Catálogo de Assets (Seed Data)

### 1.1 Acciones Argentinas (~80 tickers)

Cada entrada sigue el formato:
```
{ ticker, name, yahoo_ticker, sector, asset_type: 'STOCK' }
```

| Ticker | Nombre | Yahoo Ticker | Sector |
|---|---|---|---|
| GGAL | Grupo Financiero Galicia | GGAL.BA | Financiero |
| YPFD | YPF | YPFD.BA | Energía |
| PAMP | Pampa Energía | PAMP.BA | Energía |
| BMA | Banco Macro | BMA.BA | Financiero |
| BBAR | BBVA Argentina | BBAR.BA | Financiero |
| SUPV | Supervielle | SUPV.BA | Financiero |
| TXAR | Ternium Argentina | TXAR.BA | Materiales |
| ALUA | Aluar | ALUA.BA | Materiales |
| CRES | Cresud | CRES.BA | Agro |
| TECO2 | Telecom Argentina | TECO2.BA | Telecomunicaciones |
| MIRG | Mirgor | MIRG.BA | Industria |
| TRAN | Transener | TRAN.BA | Energía |
| EDN | Edenor | EDN.BA | Energía |
| CEPU | Central Puerto | CEPU.BA | Energía |
| LOMA | Loma Negra | LOMA.BA | Materiales |
| COME | Comercial del Plata | COME.BA | Holding |
| VALO | Grupo Valores | VALO.BA | Financiero |
| BYMA | Bolsas y Mercados | BYMA.BA | Financiero |
| HARG | Holcim Argentina | HARG.BA | Materiales |
| AGRO | AGROMETAL | AGRO.BA | Industria |
| BOLT | Boldt | BOLT.BA | Tecnología |
| CARC | Carboclor | CARC.BA | Petroquímica |
| CELU | Celulosa | CELU.BA | Materiales |
| CGPA2 | Camuzzi Gas Pampeana | CGPA2.BA | Gas |
| CTIO | Consultatio | CTIO.BA | Real Estate |
| DGCU2 | Distribuidora de Gas Cuyana | DGCU2.BA | Gas |
| DYCA | Dycasa | DYCA.BA | Construcción |
| FERR | Ferrum | FERR.BA | Industria |
| FIPL | Fiplasto | FIPL.BA | Materiales |
| GAMI | Gamatec | GAMI.BA | Tecnología |
| GARO | Garovaglio | GARO.BA | Holding |
| GCLA | Grupo Clarin | GCLA.BA | Medios |
| GRIM | Grimoldi | GRIM.BA | Consumo |
| HAVA | Havanna | HAVA.BA | Consumo |
| INTR | Introductora | INTR.BA | Consumo |
| INVJ | Inversora Juramento | INVJ.BA | Agro |
| IRSA | IRSA | IRSA.BA | Real Estate |
| IRCP | IRSA Propiedades Comerciales | IRCP.BA | Real Estate |
| LONG | Longvie | LONG.BA | Industria |
| METR | Metrogas | METR.BA | Gas |
| MOLA | Molinos Agro | MOLA.BA | Agro |
| MOLI | Molinos Río de la Plata | MOLI.BA | Consumo |
| MORI | Morixe | MORI.BA | Consumo |
| PATA | Importadora y Exportadora de la Patagonia | PATA.BA | Consumo |
| POLL | Polledo | POLL.BA | Construcción |
| RICH | Laboratorios Richmond | RICH.BA | Salud |
| RIGO | Rigolleau | RIGO.BA | Materiales |
| ROSE | Instituto Rosenbusch | ROSE.BA | Salud |
| SAMI | San Miguel | SAMI.BA | Agro |
| SEMI | Molinos Juan Semino | SEMI.BA | Agro |
| TGNO4 | Transportadora de Gas del Norte | TGNO4.BA | Gas |
| TGSU2 | Transportadora de Gas del Sur | TGSU2.BA | Gas |

> **Nota para el agente implementador:** Completar con la lista completa buscando en BYMA o consultando la lista del panel general MERVAL. Los tickers listados son los principales. El yahoo_ticker siempre es `{TICKER}.BA`.

### 1.2 CEDEARs Principales (~50 más importantes)

| Ticker AR | Nombre | Yahoo Ticker (US) | Sector | Ratio |
|---|---|---|---|---|
| AAPL | Apple | AAPL | Tecnología | 10:1 |
| MSFT | Microsoft | MSFT | Tecnología | 10:1 |
| GOOGL | Alphabet | GOOGL | Tecnología | 23:1 |
| AMZN | Amazon | AMZN | Consumo | 36:1 |
| NVDA | NVIDIA | NVDA | Tecnología | 5:1 |
| META | Meta Platforms | META | Tecnología | 6:1 |
| TSLA | Tesla | TSLA | Automotriz | 15:1 |
| JPM | JPMorgan Chase | JPM | Financiero | 3:1 |
| V | Visa | V | Financiero | 4:1 |
| MA | Mastercard | MA | Financiero | 9:1 |
| JNJ | Johnson & Johnson | JNJ | Salud | 3:1 |
| UNH | UnitedHealth | UNH | Salud | 10:1 |
| WMT | Walmart | WMT | Consumo | 5:1 |
| PG | Procter & Gamble | PG | Consumo | 3:1 |
| HD | Home Depot | HD | Consumo | 6:1 |
| KO | Coca-Cola | KO | Consumo | 3:1 |
| PEP | PepsiCo | PEP | Consumo | 3:1 |
| MCD | McDonald's | MCD | Consumo | 4:1 |
| DIS | Walt Disney | DIS | Medios | 3:1 |
| NFLX | Netflix | NFLX | Medios | 9:1 |
| BABA | Alibaba | BABA | Tecnología | 3:1 |
| AMD | AMD | AMD | Tecnología | 3:1 |
| INTC | Intel | INTC | Tecnología | 1:1 |
| BA | Boeing | BA | Industrial | 3:1 |
| GE | General Electric | GE | Industrial | 3:1 |
| XOM | ExxonMobil | XOM | Energía | 2:1 |
| CVX | Chevron | CVX | Energía | 3:1 |
| PFE | Pfizer | PFE | Salud | 1:1 |
| ABBV | AbbVie | ABBV | Salud | 3:1 |
| GOLD | Barrick Gold | GOLD | Minería | 1:1 |
| NEM | Newmont | NEM | Minería | 1:1 |
| VALE | Vale | VALE | Minería | 1:1 |
| MELI | MercadoLibre | MELI | Tecnología | 60:1 |
| DESP | Despegar | DESP | Tecnología | 3:1 |
| GLOB | Globant | GLOB | Tecnología | 9:1 |
| COIN | Coinbase | COIN | Fintech | 6:1 |
| PYPL | PayPal | PYPL | Fintech | 3:1 |
| SQ | Block (Square) | SQ | Fintech | 3:1 |
| UBER | Uber | UBER | Tecnología | 3:1 |
| SPOT | Spotify | SPOT | Tecnología | 6:1 |
| SNAP | Snap | SNAP | Tecnología | 1:1 |
| SHOP | Shopify | SHOP | Tecnología | 3:1 |
| QCOM | Qualcomm | QCOM | Tecnología | 3:1 |
| ADBE | Adobe | ADBE | Tecnología | 6:1 |
| CRM | Salesforce | CRM | Tecnología | 3:1 |
| ORCL | Oracle | ORCL | Tecnología | 2:1 |
| IBM | IBM | IBM | Tecnología | 3:1 |
| SPY | SPDR S&P 500 ETF | SPY | ETF Index | 10:1 |
| QQQ | Invesco QQQ (Nasdaq) | QQQ | ETF Index | 10:1 |
| EEM | iShares MSCI EM | EEM | ETF EM | 2:1 |
| EWZ | iShares MSCI Brazil | EWZ | ETF Brasil | 1:1 |

> **Nota para el agente implementador:** Para el catálogo completo de CEDEARs (~300), se puede obtener la lista actualizada de la web de BYMA o de invertironline.com/cedears. Los listados aquí son los de mayor volumen. El yahoo_ticker para la cotización AR es `{TICKER}D.BA` o se busca por el ticker US y se calcula con el ratio + tipo de cambio implícito.

### 1.3 Bonos Soberanos

| Ticker | Nombre | Moneda | Ley | Yahoo Ticker |
|---|---|---|---|---|
| AL29 | Bonares 2029 | USD | Argentina | AL29.BA |
| AL30 | Bonares 2030 | USD | Argentina | AL30.BA |
| AL35 | Bonares 2035 | USD | Argentina | AL35.BA |
| AL41 | Bonares 2041 | USD | Argentina | AL41.BA |
| AE38 | Bonares 2038 | USD | Argentina | AE38.BA |
| GD29 | Globales 2029 | USD | New York | GD29.BA |
| GD30 | Globales 2030 | USD | New York | GD30.BA |
| GD35 | Globales 2035 | USD | New York | GD35.BA |
| GD38 | Globales 2038 | USD | New York | GD38.BA |
| GD41 | Globales 2041 | USD | New York | GD41.BA |
| GD46 | Globales 2046 | USD | New York | GD46.BA |

### 1.4 LECAPs / BONCAPs (Instrumentos en pesos)

| Ticker | Descripción | Vencimiento | Tipo |
|---|---|---|---|
| S30E5 | LECAP Enero 2025 | 2025-01-30 | LECAP |
| S28F5 | LECAP Febrero 2025 | 2025-02-28 | LECAP |
| S31M5 | LECAP Marzo 2025 | 2025-03-31 | LECAP |
| S30A5 | LECAP Abril 2025 | 2025-04-30 | LECAP |
| S30J5 | LECAP Junio 2025 | 2025-06-30 | LECAP |
| S29G5 | LECAP Agosto 2025 | 2025-08-29 | LECAP |
| S28N5 | LECAP Noviembre 2025 | 2025-11-28 | LECAP |
| T30E5 | BONCAP Enero 2025 | 2025-01-30 | BONCAP |
| T13F5 | BONCAP Febrero 2025 | 2025-02-13 | BONCAP |

> **Nota para el agente implementador:** Los LECAPs y BONCAPs cambian frecuentemente (se emiten nuevos y vencen otros). Implementar un mecanismo para actualizar este catálogo. Se pueden obtener de la API de BYMA o scrapeando rava.com/letras/cotizaciones. Los tickers siguen el patrón S{DD}{M}{A} para LECAPs y T{DD}{M}{A} para BONCAPs.

---

## 2. Contratos de API (Request/Response Examples)

### 2.1 Auth

**POST /api/v1/auth/register**
```json
// Request
{
  "email": "juan@example.com",
  "password": "SecurePass123!",
  "displayName": "Juan Pérez"
}
// Response 201
{
  "user": {
    "id": "uuid-abc-123",
    "email": "juan@example.com",
    "displayName": "Juan Pérez",
    "isDemo": false,
    "createdAt": "2026-02-26T15:30:00Z"
  },
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

**POST /api/v1/auth/login**
```json
// Request
{
  "email": "juan@example.com",
  "password": "SecurePass123!"
}
// Response 200 — mismo shape que register response
```

**POST /api/v1/auth/refresh**
```json
// Request
{
  "refreshToken": "eyJhbGciOi..."
}
// Response 200
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

**POST /api/v1/auth/demo**
```json
// Request — sin body
// Response 201
{
  "user": {
    "id": "uuid-demo-456",
    "email": "demo-1708960200@notifinance.local",
    "displayName": "Usuario Demo",
    "isDemo": true,
    "createdAt": "2026-02-26T15:30:00Z"
  },
  "accessToken": "eyJhbGciOi..."
}
```

### 2.2 Market Data

**GET /api/v1/market/dollar**
```json
// Response 200
{
  "data": [
    {
      "type": "OFICIAL",
      "buyPrice": 1050.00,
      "sellPrice": 1100.00,
      "spread": 4.76,
      "source": "dolarapi.com",
      "timestamp": "2026-02-26T15:30:00Z"
    },
    {
      "type": "BLUE",
      "buyPrice": 1350.00,
      "sellPrice": 1380.00,
      "spread": 2.22,
      "source": "dolarapi.com",
      "timestamp": "2026-02-26T15:30:00Z"
    },
    {
      "type": "MEP",
      "buyPrice": 1320.00,
      "sellPrice": 1325.00,
      "spread": 0.38,
      "source": "dolarapi.com",
      "timestamp": "2026-02-26T15:30:00Z"
    },
    {
      "type": "CCL",
      "buyPrice": 1340.00,
      "sellPrice": 1348.00,
      "spread": 0.60,
      "source": "dolarapi.com",
      "timestamp": "2026-02-26T15:30:00Z"
    },
    {
      "type": "TARJETA",
      "buyPrice": null,
      "sellPrice": 1760.00,
      "spread": null,
      "source": "dolarapi.com",
      "timestamp": "2026-02-26T15:30:00Z"
    },
    {
      "type": "CRIPTO",
      "buyPrice": 1355.00,
      "sellPrice": 1360.00,
      "spread": 0.37,
      "source": "dolarapi.com",
      "timestamp": "2026-02-26T15:30:00Z"
    }
  ],
  "updatedAt": "2026-02-26T15:30:00Z"
}
```

**GET /api/v1/market/dollar/history?type=MEP&days=30**
```json
// Response 200
{
  "type": "MEP",
  "data": [
    { "date": "2026-01-27", "buyPrice": 1280.00, "sellPrice": 1285.00 },
    { "date": "2026-01-28", "buyPrice": 1290.00, "sellPrice": 1295.00 },
    // ... 30 entries
  ]
}
```

**GET /api/v1/market/risk**
```json
// Response 200
{
  "value": 682,
  "changePct": -1.44,
  "previousValue": 692,
  "timestamp": "2026-02-26T15:30:00Z"
}
```

**GET /api/v1/market/summary**
```json
// Response 200
{
  "merval": {
    "value": 2145320.50,
    "changePct": 1.23,
    "volume": 15680000000
  },
  "dollar": {
    "official": { "sell": 1100.00, "changePct": 0.0 },
    "blue": { "sell": 1380.00, "changePct": -0.72 },
    "mep": { "sell": 1325.00, "changePct": 0.38 }
  },
  "risk": {
    "value": 682,
    "changePct": -1.44
  },
  "marketStatus": {
    "isOpen": true,
    "closesAt": "2026-02-26T17:00:00-03:00",
    "nextOpen": null
  }
}
```

**GET /api/v1/market/status**
```json
// Response 200
{
  "isOpen": true,
  "currentPhase": "CONTINUOUS_TRADING",
  "closesAt": "2026-02-26T17:00:00-03:00",
  "nextOpen": null,
  "timezone": "America/Argentina/Buenos_Aires"
}
```

### 2.3 Assets

**GET /api/v1/assets?type=STOCK&page=1&limit=20&sort=changePct&order=desc**
```json
// Response 200
{
  "data": [
    {
      "id": "uuid-asset-1",
      "ticker": "GGAL",
      "name": "Grupo Financiero Galicia",
      "assetType": "STOCK",
      "sector": "Financiero",
      "latestQuote": {
        "priceArs": 7850.00,
        "priceUsd": null,
        "changePct": 3.45,
        "volume": 1250000,
        "date": "2026-02-26"
      }
    },
    // ... more assets
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 78,
    "totalPages": 4
  }
}
```

**GET /api/v1/assets/GGAL**
```json
// Response 200
{
  "id": "uuid-asset-1",
  "ticker": "GGAL",
  "name": "Grupo Financiero Galicia",
  "assetType": "STOCK",
  "sector": "Financiero",
  "currency": "ARS",
  "description": "Grupo financiero líder en Argentina...",
  "latestQuote": {
    "priceArs": 7850.00,
    "open": 7700.00,
    "high": 7920.00,
    "low": 7680.00,
    "close": 7850.00,
    "volume": 1250000,
    "changePct": 3.45,
    "date": "2026-02-26"
  },
  "stats": {
    "high52w": 9200.00,
    "low52w": 3100.00,
    "avgVolume30d": 980000,
    "marketCap": null,
    "pe": null
  },
  "isFavorite": true
}
```

**GET /api/v1/assets/GGAL/quotes?period=1M**
```json
// Response 200
{
  "ticker": "GGAL",
  "period": "1M",
  "data": [
    {
      "date": "2026-01-27",
      "open": 6500.00,
      "high": 6620.00,
      "low": 6450.00,
      "close": 6580.00,
      "volume": 1100000
    },
    // ... daily data for 1 month (~20 trading days)
  ]
}
```

**GET /api/v1/assets/top/gainers?type=STOCK&limit=5**
```json
// Response 200
{
  "data": [
    { "ticker": "GGAL", "name": "Galicia", "priceArs": 7850.00, "changePct": 3.45 },
    { "ticker": "PAMP", "name": "Pampa Energía", "priceArs": 4200.00, "changePct": 2.87 },
    // ... 5 items
  ]
}
```

**GET /api/v1/search?q=gal&limit=10**
```json
// Response 200
{
  "data": [
    { "ticker": "GGAL", "name": "Grupo Financiero Galicia", "assetType": "STOCK" },
    { "ticker": "GOLD", "name": "Barrick Gold (CEDEAR)", "assetType": "CEDEAR" },
    { "ticker": "GOOGL", "name": "Alphabet (CEDEAR)", "assetType": "CEDEAR" }
  ]
}
```

### 2.4 Watchlist

**GET /api/v1/watchlist** (authenticated)
```json
// Response 200
{
  "data": [
    {
      "id": "uuid-wl-1",
      "asset": {
        "ticker": "GGAL",
        "name": "Galicia",
        "assetType": "STOCK",
        "latestQuote": {
          "priceArs": 7850.00,
          "changePct": 3.45
        }
      },
      "addedAt": "2026-02-20T10:00:00Z"
    },
    // ...
  ]
}
```

**POST /api/v1/watchlist**
```json
// Request
{ "ticker": "GGAL" }
// Response 201
{
  "id": "uuid-wl-1",
  "ticker": "GGAL",
  "addedAt": "2026-02-26T15:30:00Z"
}
```

**DELETE /api/v1/watchlist/GGAL**
```json
// Response 204 — No Content
```

### 2.5 Portfolio

**POST /api/v1/portfolios**
```json
// Request
{
  "name": "Mi Portfolio Principal",
  "description": "Acciones argentinas y CEDEARs"
}
// Response 201
{
  "id": "uuid-port-1",
  "name": "Mi Portfolio Principal",
  "description": "Acciones argentinas y CEDEARs",
  "createdAt": "2026-02-26T15:30:00Z"
}
```

**GET /api/v1/portfolios** (authenticated)
```json
// Response 200
{
  "data": [
    {
      "id": "uuid-port-1",
      "name": "Mi Portfolio Principal",
      "description": "Acciones argentinas y CEDEARs",
      "summary": {
        "totalValueArs": 2500000.00,
        "totalCostArs": 2200000.00,
        "unrealizedPnl": 300000.00,
        "unrealizedPnlPct": 13.64,
        "holdingsCount": 9
      },
      "createdAt": "2026-02-26T15:30:00Z"
    }
  ]
}
```

**GET /api/v1/portfolios/:id/holdings**
```json
// Response 200
{
  "portfolioId": "uuid-port-1",
  "totalValueArs": 2500000.00,
  "totalCostArs": 2200000.00,
  "unrealizedPnl": 300000.00,
  "unrealizedPnlPct": 13.64,
  "holdings": [
    {
      "ticker": "GGAL",
      "name": "Galicia",
      "assetType": "STOCK",
      "quantity": 100,
      "avgCostBasis": 6200.00,
      "currentPrice": 7850.00,
      "totalCost": 620000.00,
      "currentValue": 785000.00,
      "unrealizedPnl": 165000.00,
      "unrealizedPnlPct": 26.61,
      "weight": 31.40
    },
    {
      "ticker": "AAPL",
      "name": "Apple (CEDEAR)",
      "assetType": "CEDEAR",
      "quantity": 50,
      "avgCostBasis": 15000.00,
      "currentPrice": 17200.00,
      "totalCost": 750000.00,
      "currentValue": 860000.00,
      "unrealizedPnl": 110000.00,
      "unrealizedPnlPct": 14.67,
      "weight": 34.40
    },
    // ... more holdings
  ]
}
```

**POST /api/v1/portfolios/:id/trades**
```json
// Request
{
  "ticker": "GGAL",
  "tradeType": "BUY",
  "quantity": 50,
  "pricePerUnit": 7800.00,
  "currency": "ARS",
  "commission": 2340.00,
  "executedAt": "2026-02-26T14:30:00Z"
}
// Response 201
{
  "id": "uuid-trade-1",
  "portfolioId": "uuid-port-1",
  "ticker": "GGAL",
  "tradeType": "BUY",
  "quantity": 50,
  "pricePerUnit": 7800.00,
  "totalAmount": 390000.00,
  "currency": "ARS",
  "commission": 2340.00,
  "executedAt": "2026-02-26T14:30:00Z"
}
```

**GET /api/v1/portfolios/:id/performance?period=3M**
```json
// Response 200
{
  "portfolioId": "uuid-port-1",
  "period": "3M",
  "startValue": 1800000.00,
  "endValue": 2500000.00,
  "totalReturn": 38.89,
  "dataPoints": [
    { "date": "2025-11-26", "value": 1800000.00 },
    { "date": "2025-11-27", "value": 1815000.00 },
    // ... daily data points
  ],
  "benchmarks": {
    "merval": { "startValue": 100, "endValue": 125.5, "return": 25.5 },
    "dollarMep": { "startValue": 100, "endValue": 103.2, "return": 3.2 }
  }
}
```

**GET /api/v1/portfolios/:id/distribution**
```json
// Response 200
{
  "byAsset": [
    { "ticker": "GGAL", "value": 785000, "weight": 31.40 },
    { "ticker": "AAPL", "value": 860000, "weight": 34.40 },
    // ...
  ],
  "byType": [
    { "type": "STOCK", "value": 1200000, "weight": 48.00 },
    { "type": "CEDEAR", "value": 1000000, "weight": 40.00 },
    { "type": "BOND", "value": 300000, "weight": 12.00 }
  ],
  "bySector": [
    { "sector": "Financiero", "value": 900000, "weight": 36.00 },
    { "sector": "Tecnología", "value": 860000, "weight": 34.40 },
    { "sector": "Energía", "value": 440000, "weight": 17.60 },
    // ...
  ],
  "byCurrency": [
    { "currency": "ARS", "value": 1200000, "weight": 48.00 },
    { "currency": "USD", "value": 1300000, "weight": 52.00 }
  ]
}
```

### 2.6 Alerts

**POST /api/v1/alerts** (authenticated)
```json
// Request — Alerta de precio
{
  "ticker": "GGAL",
  "alertType": "PRICE",
  "condition": "ABOVE",
  "threshold": 8000.00,
  "channels": ["IN_APP", "EMAIL"],
  "isRecurring": false
}
// Response 201
{
  "id": "uuid-alert-1",
  "ticker": "GGAL",
  "assetName": "Grupo Financiero Galicia",
  "alertType": "PRICE",
  "condition": "ABOVE",
  "threshold": 8000.00,
  "channels": ["IN_APP", "EMAIL"],
  "isRecurring": false,
  "status": "ACTIVE",
  "createdAt": "2026-02-26T15:30:00Z"
}
```

```json
// Request — Alerta de dólar
{
  "alertType": "DOLLAR",
  "dollarType": "MEP",
  "condition": "ABOVE",
  "threshold": 1500.00,
  "channels": ["IN_APP"],
  "isRecurring": true
}
```

```json
// Request — Alerta de variación porcentual
{
  "ticker": "YPFD",
  "alertType": "PCT_CHANGE",
  "condition": "PCT_DOWN",
  "threshold": 5.00,
  "period": "DAILY",
  "channels": ["IN_APP", "EMAIL"],
  "isRecurring": true
}
```

**GET /api/v1/alerts** (authenticated)
```json
// Response 200
{
  "data": [
    {
      "id": "uuid-alert-1",
      "ticker": "GGAL",
      "assetName": "Grupo Financiero Galicia",
      "alertType": "PRICE",
      "condition": "ABOVE",
      "threshold": 8000.00,
      "channels": ["IN_APP", "EMAIL"],
      "isRecurring": false,
      "status": "ACTIVE",
      "lastTriggeredAt": null,
      "createdAt": "2026-02-26T15:30:00Z"
    },
    // ...
  ],
  "meta": {
    "activeCount": 3,
    "maxAlerts": 20
  }
}
```

**PATCH /api/v1/alerts/:id/status**
```json
// Request
{ "status": "PAUSED" }
// Response 200
{ "id": "uuid-alert-1", "status": "PAUSED" }
```

### 2.7 Notifications

**GET /api/v1/notifications?page=1&limit=20&unreadOnly=false**
```json
// Response 200
{
  "data": [
    {
      "id": "uuid-notif-1",
      "title": "GGAL superó $8.000",
      "body": "Grupo Financiero Galicia alcanzó $8.150,00 (umbral: $8.000,00)",
      "type": "alert.price.above",
      "metadata": {
        "ticker": "GGAL",
        "currentPrice": 8150.00,
        "threshold": 8000.00,
        "alertId": "uuid-alert-1"
      },
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-02-26T15:35:00Z"
    },
    {
      "id": "uuid-notif-2",
      "title": "Dólar MEP bajó de $1.300",
      "body": "El dólar MEP cotiza a $1.295,00 (umbral: $1.300,00)",
      "type": "alert.dollar.below",
      "metadata": {
        "dollarType": "MEP",
        "currentPrice": 1295.00,
        "threshold": 1300.00,
        "alertId": "uuid-alert-2"
      },
      "isRead": true,
      "readAt": "2026-02-26T16:00:00Z",
      "createdAt": "2026-02-26T14:20:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

**GET /api/v1/notifications/count**
```json
// Response 200
{ "unreadCount": 5 }
```

**PATCH /api/v1/notifications/:id/read**
```json
// Response 200
{ "id": "uuid-notif-1", "isRead": true, "readAt": "2026-02-26T16:05:00Z" }
```

**PATCH /api/v1/notifications/read-all**
```json
// Response 200
{ "updatedCount": 5 }
```

### 2.8 Preferences

**GET /api/v1/preferences** (authenticated)
```json
// Response 200
{
  "userId": "uuid-abc-123",
  "channels": {
    "inApp": true,
    "email": true
  },
  "disabledEventTypes": [],
  "digestFrequency": "REALTIME",
  "quietHours": {
    "enabled": false,
    "start": "23:00",
    "end": "08:00"
  }
}
```

**PUT /api/v1/preferences**
```json
// Request
{
  "channels": { "inApp": true, "email": false },
  "digestFrequency": "HOURLY",
  "quietHours": { "enabled": true, "start": "23:00", "end": "08:00" }
}
// Response 200 — mismo shape que GET
```

---

## 3. Notification Templates (Seed Data)

Estas son las plantillas que deben insertarse en la tabla `notification_templates` durante la migración de seed.

```typescript
const notificationTemplates = [
  // Price Alerts
  {
    eventType: 'alert.price.above',
    channel: 'IN_APP',
    subject: '{{metadata.ticker}} superó ${{metadata.threshold}}',
    body: '{{metadata.ticker}} ({{metadata.assetName}}) alcanzó ${{metadata.currentPrice}}. Tu umbral era ${{metadata.threshold}}.',
  },
  {
    eventType: 'alert.price.above',
    channel: 'EMAIL',
    subject: '[NotiFinance] {{metadata.ticker}} superó ${{metadata.threshold}}',
    body: 'Hola {{metadata.userName}},\n\n{{metadata.ticker}} ({{metadata.assetName}}) alcanzó un precio de ${{metadata.currentPrice}}.\n\nTu alerta estaba configurada para notificarte cuando superara ${{metadata.threshold}}.\n\nVer detalle: {{metadata.assetUrl}}\n\n— NotiFinance',
  },
  {
    eventType: 'alert.price.below',
    channel: 'IN_APP',
    subject: '{{metadata.ticker}} bajó de ${{metadata.threshold}}',
    body: '{{metadata.ticker}} ({{metadata.assetName}}) cayó a ${{metadata.currentPrice}}. Tu umbral era ${{metadata.threshold}}.',
  },
  {
    eventType: 'alert.price.below',
    channel: 'EMAIL',
    subject: '[NotiFinance] {{metadata.ticker}} bajó de ${{metadata.threshold}}',
    body: 'Hola {{metadata.userName}},\n\n{{metadata.ticker}} ({{metadata.assetName}}) cayó a un precio de ${{metadata.currentPrice}}.\n\nTu alerta estaba configurada para notificarte cuando bajara de ${{metadata.threshold}}.\n\nVer detalle: {{metadata.assetUrl}}\n\n— NotiFinance',
  },

  // Dollar Alerts
  {
    eventType: 'alert.dollar.above',
    channel: 'IN_APP',
    subject: 'Dólar {{metadata.dollarType}} superó ${{metadata.threshold}}',
    body: 'El dólar {{metadata.dollarType}} cotiza a ${{metadata.currentPrice}} (venta). Tu umbral era ${{metadata.threshold}}.',
  },
  {
    eventType: 'alert.dollar.above',
    channel: 'EMAIL',
    subject: '[NotiFinance] Dólar {{metadata.dollarType}} superó ${{metadata.threshold}}',
    body: 'Hola {{metadata.userName}},\n\nEl dólar {{metadata.dollarType}} alcanzó ${{metadata.currentPrice}} (venta).\n\nTu alerta estaba configurada para ${{metadata.threshold}}.\n\n— NotiFinance',
  },
  {
    eventType: 'alert.dollar.below',
    channel: 'IN_APP',
    subject: 'Dólar {{metadata.dollarType}} bajó de ${{metadata.threshold}}',
    body: 'El dólar {{metadata.dollarType}} cotiza a ${{metadata.currentPrice}} (venta). Tu umbral era ${{metadata.threshold}}.',
  },
  {
    eventType: 'alert.dollar.below',
    channel: 'EMAIL',
    subject: '[NotiFinance] Dólar {{metadata.dollarType}} bajó de ${{metadata.threshold}}',
    body: 'Hola {{metadata.userName}},\n\nEl dólar {{metadata.dollarType}} bajó a ${{metadata.currentPrice}} (venta).\n\nTu alerta estaba configurada para ${{metadata.threshold}}.\n\n— NotiFinance',
  },

  // Country Risk Alerts
  {
    eventType: 'alert.risk.above',
    channel: 'IN_APP',
    subject: 'Riesgo país superó {{metadata.threshold}} puntos',
    body: 'El riesgo país alcanzó {{metadata.currentValue}} puntos (variación: {{metadata.changePct}}%). Tu umbral era {{metadata.threshold}}.',
  },
  {
    eventType: 'alert.risk.above',
    channel: 'EMAIL',
    subject: '[NotiFinance] Riesgo país superó {{metadata.threshold}} puntos',
    body: 'Hola {{metadata.userName}},\n\nEl riesgo país alcanzó {{metadata.currentValue}} puntos.\n\nTu alerta estaba configurada para {{metadata.threshold}} puntos.\n\n— NotiFinance',
  },
  {
    eventType: 'alert.risk.below',
    channel: 'IN_APP',
    subject: 'Riesgo país bajó de {{metadata.threshold}} puntos',
    body: 'El riesgo país bajó a {{metadata.currentValue}} puntos (variación: {{metadata.changePct}}%). Tu umbral era {{metadata.threshold}}.',
  },
  {
    eventType: 'alert.risk.below',
    channel: 'EMAIL',
    subject: '[NotiFinance] Riesgo país bajó de {{metadata.threshold}} puntos',
    body: 'Hola {{metadata.userName}},\n\nEl riesgo país bajó a {{metadata.currentValue}} puntos.\n\nTu alerta estaba configurada para {{metadata.threshold}} puntos.\n\n— NotiFinance',
  },

  // Percentage Change Alerts
  {
    eventType: 'alert.pct.up',
    channel: 'IN_APP',
    subject: '{{metadata.ticker}} subió {{metadata.currentPct}}%',
    body: '{{metadata.ticker}} subió {{metadata.currentPct}}% ({{metadata.period}}). Tu umbral era {{metadata.threshold}}%.',
  },
  {
    eventType: 'alert.pct.up',
    channel: 'EMAIL',
    subject: '[NotiFinance] {{metadata.ticker}} subió {{metadata.currentPct}}%',
    body: 'Hola {{metadata.userName}},\n\n{{metadata.ticker}} ({{metadata.assetName}}) subió un {{metadata.currentPct}}% en el período {{metadata.period}}.\n\nTu alerta estaba configurada para una suba mayor al {{metadata.threshold}}%.\n\n— NotiFinance',
  },
  {
    eventType: 'alert.pct.down',
    channel: 'IN_APP',
    subject: '{{metadata.ticker}} cayó {{metadata.currentPct}}%',
    body: '{{metadata.ticker}} cayó {{metadata.currentPct}}% ({{metadata.period}}). Tu umbral era {{metadata.threshold}}%.',
  },
  {
    eventType: 'alert.pct.down',
    channel: 'EMAIL',
    subject: '[NotiFinance] {{metadata.ticker}} cayó {{metadata.currentPct}}%',
    body: 'Hola {{metadata.userName}},\n\n{{metadata.ticker}} ({{metadata.assetName}}) cayó un {{metadata.currentPct}}% en el período {{metadata.period}}.\n\nTu alerta estaba configurada para una baja mayor al {{metadata.threshold}}%.\n\n— NotiFinance',
  },
];
```

---

## 4. Demo Mode Seed Data

Datos exactos que el `DemoSeedService` debe crear al llamar `POST /auth/demo`:

### 4.1 Usuario Demo
```json
{
  "email": "demo-{timestamp}@notifinance.local",
  "displayName": "Usuario Demo",
  "isDemo": true,
  "passwordHash": null
}
```

### 4.2 Portfolio Demo
```json
{
  "name": "Portfolio Demo",
  "description": "Portfolio de ejemplo con activos diversificados",
  "trades": [
    { "ticker": "GGAL", "type": "BUY", "quantity": 100, "price": 6200.00, "date": "2025-06-15" },
    { "ticker": "YPFD", "type": "BUY", "quantity": 50, "price": 32000.00, "date": "2025-07-01" },
    { "ticker": "PAMP", "type": "BUY", "quantity": 200, "price": 3500.00, "date": "2025-08-10" },
    { "ticker": "AAPL", "type": "BUY", "quantity": 30, "price": 15200.00, "date": "2025-06-20" },
    { "ticker": "MSFT", "type": "BUY", "quantity": 20, "price": 12800.00, "date": "2025-07-15" },
    { "ticker": "GOOGL", "type": "BUY", "quantity": 15, "price": 8500.00, "date": "2025-08-01" },
    { "ticker": "NVDA", "type": "BUY", "quantity": 25, "price": 14000.00, "date": "2025-09-01" },
    { "ticker": "AL30", "type": "BUY", "quantity": 500, "price": 450.00, "date": "2025-10-01" },
    { "ticker": "GD30", "type": "BUY", "quantity": 300, "price": 520.00, "date": "2025-10-15" }
  ]
}
```

### 4.3 Watchlist Demo
```json
{
  "tickers": ["GGAL", "YPFD", "PAMP", "BMA", "AAPL", "MSFT", "NVDA", "MELI", "AL30", "GD30"]
}
```

### 4.4 Alertas Demo
```json
{
  "alerts": [
    {
      "ticker": "GGAL",
      "alertType": "PRICE",
      "condition": "ABOVE",
      "threshold": 9000.00,
      "channels": ["IN_APP", "EMAIL"],
      "isRecurring": false,
      "status": "ACTIVE"
    },
    {
      "alertType": "DOLLAR",
      "dollarType": "MEP",
      "condition": "ABOVE",
      "threshold": 1500.00,
      "channels": ["IN_APP"],
      "isRecurring": true,
      "status": "ACTIVE"
    },
    {
      "alertType": "RISK",
      "condition": "BELOW",
      "threshold": 500,
      "channels": ["IN_APP", "EMAIL"],
      "isRecurring": false,
      "status": "ACTIVE"
    }
  ]
}
```

### 4.5 Notificaciones Demo (pre-creadas)
```json
{
  "notifications": [
    {
      "title": "GGAL superó $7.500",
      "body": "Grupo Financiero Galicia alcanzó $7.850,00. Tu umbral era $7.500,00.",
      "type": "alert.price.above",
      "isRead": true,
      "createdAt": "-2h"
    },
    {
      "title": "Dólar MEP superó $1.320",
      "body": "El dólar MEP cotiza a $1.325,00 (venta). Tu umbral era $1.320,00.",
      "type": "alert.dollar.above",
      "isRead": true,
      "createdAt": "-5h"
    },
    {
      "title": "NVDA subió 4.2%",
      "body": "NVIDIA subió 4.2% (diario). Tu umbral era 3%.",
      "type": "alert.pct.up",
      "isRead": false,
      "createdAt": "-1h"
    },
    {
      "title": "Riesgo país bajó de 700 puntos",
      "body": "El riesgo país bajó a 682 puntos (variación: -1.44%). Tu umbral era 700.",
      "type": "alert.risk.below",
      "isRead": false,
      "createdAt": "-30m"
    },
    {
      "title": "YPFD cayó 3.1%",
      "body": "YPF cayó 3.1% (diario). Tu umbral era 3%.",
      "type": "alert.pct.down",
      "isRead": false,
      "createdAt": "-15m"
    }
  ]
}
```

---

## 5. Design Tokens & Theme

### 5.1 Color Palette

```typescript
// tailwind.config.ts — extend theme.colors
const notifinanceColors = {
  // Base (Dark Mode)
  background: {
    DEFAULT: '#0A0A0F',      // Deep dark base
    card: '#12121A',          // Card surfaces
    elevated: '#1A1A25',      // Elevated elements (modals, dropdowns)
    hover: '#22222E',         // Hover state
  },

  // Borders
  border: {
    DEFAULT: '#2A2A3A',       // Default borders
    subtle: '#1E1E2E',        // Subtle separators
    focus: '#3B82F6',         // Focus ring (blue-500)
  },

  // Text
  foreground: {
    DEFAULT: '#F0F0F5',       // Primary text
    secondary: '#9CA3AF',     // Secondary text (gray-400)
    muted: '#6B7280',         // Muted text (gray-500)
    inverse: '#0A0A0F',       // Text on light backgrounds
  },

  // Brand
  brand: {
    DEFAULT: '#3B82F6',       // Primary blue
    hover: '#2563EB',         // Blue-600
    light: '#60A5FA',         // Blue-400 (links, accents)
    faint: '#1E3A5F',         // Blue tinted background
  },

  // Semantic
  success: {
    DEFAULT: '#10B981',       // Green (positive %, gains)
    light: '#34D399',
    bg: '#064E3B',            // Green tinted background
  },
  danger: {
    DEFAULT: '#EF4444',       // Red (negative %, losses)
    light: '#F87171',
    bg: '#450A0A',            // Red tinted background
  },
  warning: {
    DEFAULT: '#F59E0B',       // Amber (warnings)
    light: '#FBBF24',
    bg: '#451A03',
  },
  info: {
    DEFAULT: '#3B82F6',       // Blue (info)
    light: '#60A5FA',
    bg: '#172554',
  },

  // Chart Colors (for multi-series)
  chart: {
    blue: '#3B82F6',
    emerald: '#10B981',
    violet: '#8B5CF6',
    amber: '#F59E0B',
    rose: '#F43F5E',
    cyan: '#06B6D4',
    orange: '#F97316',
    lime: '#84CC16',
  },

  // Specific financial
  bullish: '#10B981',         // Green — subidas
  bearish: '#EF4444',         // Red — bajas
  neutral: '#6B7280',         // Gray — sin cambio
};
```

### 5.2 Typography

```typescript
// Font: Inter (Google Fonts)
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'], // Para precios/números
  },
  fontSize: {
    'price-xl': ['2.5rem', { lineHeight: '1', fontWeight: '700' }],    // Hero prices
    'price-lg': ['1.75rem', { lineHeight: '1', fontWeight: '600' }],   // Card prices
    'price-md': ['1.125rem', { lineHeight: '1', fontWeight: '600' }],  // Table prices
    'price-sm': ['0.875rem', { lineHeight: '1', fontWeight: '500' }],  // Compact prices
  },
};
```

### 5.3 Light Mode Overrides

```typescript
// Para light mode, invertir los backgrounds:
const lightOverrides = {
  background: {
    DEFAULT: '#FFFFFF',
    card: '#F9FAFB',
    elevated: '#FFFFFF',
    hover: '#F3F4F6',
  },
  border: {
    DEFAULT: '#E5E7EB',
    subtle: '#F3F4F6',
  },
  foreground: {
    DEFAULT: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },
  // success, danger, brand se mantienen iguales
};
```

### 5.4 Component Styling Conventions

```
Cards:
  - bg: background.card
  - border: 1px border.DEFAULT
  - borderRadius: 12px (rounded-xl)
  - padding: 24px (p-6)
  - hover: border.focus transition-colors 150ms

Tables:
  - header: background.elevated, foreground.secondary, text-xs uppercase tracking-wider
  - rows: background.card, hover: background.hover
  - dividers: border.subtle
  - prices: font-mono

Badges:
  - Positive: bg-success/10, text-success
  - Negative: bg-danger/10, text-danger  
  - Neutral: bg-foreground-muted/10, text-foreground-muted

Buttons:
  - Primary: bg-brand, hover:bg-brand-hover, text-white
  - Secondary: bg-background-elevated, border, hover:bg-background-hover
  - Ghost: transparent, hover:bg-background-hover
  - Danger: bg-danger, hover:bg-danger-light

Charts:
  - Background: transparent (inherits card bg)
  - Grid lines: border.subtle (10% opacity)
  - Crosshair: foreground.secondary
  - Price line: brand.DEFAULT
  - Volume bars: brand.DEFAULT (30% opacity)
```

---

## 6. WebSocket Events Reference

### 6.1 Namespace: /notifications (Authenticated)

**Client → Server:**
```
'subscribe' → No payload needed (auto-subscribe on connect)
```

**Server → Client:**
```
'notification:new' → {
  id: string,
  title: string,
  body: string,
  type: string,
  metadata: Record<string, unknown>,
  createdAt: string
}

'notification:count' → {
  unreadCount: number
}
```

### 6.2 Namespace: /market (Public)

**Client → Server:**
```
'join:room' → { room: 'market:all' | 'market:STOCK' | 'market:CEDEAR' | 'market:dollar' }
'leave:room' → { room: string }
```

**Server → Client:**
```
'market:dollar' → {
  quotes: Array<{ type: string, buyPrice: number, sellPrice: number }>,
  timestamp: string
}

'market:risk' → {
  value: number,
  changePct: number,
  timestamp: string
}

'market:quote' → {
  ticker: string,
  priceArs: number,
  changePct: number,
  volume: number,
  timestamp: string
}

'market:status' → {
  isOpen: boolean,
  phase: string
}
```

---

## 7. Environment Variables Reference

### 7.1 Backend (.env)

```bash
# ── Application ──
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
ALLOWED_ORIGINS=http://localhost:3001

# ── Database ──
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=notifinance
DB_PASSWORD=notifinance_dev
DB_NAME=notifinance
DB_SYNCHRONIZE=false
DB_LOGGING=true

# ── Redis ──
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ── RabbitMQ ──
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VHOST=/
RABBITMQ_EXCHANGE=notifinance.events

# ── JWT Auth ──
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRATION=7d
DEMO_USER_TTL_HOURS=24

# ── Market Data APIs ──
DOLAR_API_URL=https://dolarapi.com/v1
DOLAR_API_FALLBACK_URL=https://api.bluelytics.com.ar/v2/latest
YAHOO_FINANCE_ENABLED=true
ALPHA_VANTAGE_API_KEY=
ALPHA_VANTAGE_ENABLED=false

# ── Email ──
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=alerts@notifinance.app
EMAIL_FROM_NAME=NotiFinance

# ── Cron ──
CRON_DOLLAR_INTERVAL=*/5 * * * *
CRON_RISK_INTERVAL=*/10 * * * *
CRON_STOCKS_INTERVAL=*/5 10-17 * * 1-5
CRON_CEDEARS_INTERVAL=*/5 10-17 * * 1-5
CRON_BONDS_INTERVAL=*/15 10-17 * * 1-5
CRON_HISTORICAL_INTERVAL=0 18 * * 1-5
CRON_DEMO_CLEANUP_INTERVAL=0 4 * * *

# ── Feature Flags ──
FEATURE_EMAIL_ENABLED=false
FEATURE_DEMO_MODE=true
FEATURE_CRON_JOBS=true
```

### 7.2 Frontend (.env.local)

```bash
# ── API ──
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3000

# ── App ──
NEXT_PUBLIC_APP_NAME=NotiFinance
NEXT_PUBLIC_APP_URL=http://localhost:3001

# ── Feature Flags ──
NEXT_PUBLIC_DEMO_MODE=true
```

### 7.3 Production Overrides

```bash
# Backend (Render/Railway)
NODE_ENV=production
DB_SYNCHRONIZE=false
DB_LOGGING=false
FEATURE_EMAIL_ENABLED=true
ALLOWED_ORIGINS=https://notifinance.vercel.app

# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://notifinance-api.onrender.com/api/v1
NEXT_PUBLIC_WS_URL=https://notifinance-api.onrender.com
NEXT_PUBLIC_APP_URL=https://notifinance.vercel.app
```

---

## 8. Horarios del Mercado Argentino

Referencia para la lógica de `MarketStatus` y los cron jobs:

```typescript
const MARKET_SCHEDULE = {
  timezone: 'America/Argentina/Buenos_Aires',
  tradingDays: [1, 2, 3, 4, 5], // Lunes a Viernes
  
  phases: {
    PRE_OPEN: { start: '09:30', end: '10:00' },
    CONTINUOUS_TRADING: { start: '10:00', end: '17:00' },
    POST_CLOSE: { start: '17:00', end: '17:15' },
  },

  // Feriados cambieros 2025 (actualizar anualmente)
  holidays: [
    '2025-01-01', // Año Nuevo
    '2025-03-03', // Carnaval
    '2025-03-04', // Carnaval
    '2025-03-24', // Día de la Memoria
    '2025-04-02', // Día del Veterano
    '2025-04-17', // Jueves Santo
    '2025-04-18', // Viernes Santo
    '2025-05-01', // Día del Trabajador
    '2025-05-25', // Revolución de Mayo
    '2025-06-16', // Güemes (puente)
    '2025-06-20', // Día de la Bandera
    '2025-07-09', // Día de la Independencia
    '2025-08-18', // San Martín (puente)
    '2025-10-12', // Diversidad Cultural
    '2025-11-24', // Soberanía Nacional
    '2025-12-08', // Inmaculada Concepción
    '2025-12-25', // Navidad
  ],
};
```

---

## 9. Error Codes Reference

Códigos de error estandarizados para la API:

| Code | HTTP | Error | Description |
|---|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | InvalidCredentialsError | Email o password incorrectos |
| `AUTH_EMAIL_EXISTS` | 409 | EmailAlreadyExistsError | Email ya registrado |
| `AUTH_TOKEN_EXPIRED` | 401 | TokenExpiredError | JWT expirado |
| `AUTH_TOKEN_INVALID` | 401 | UnauthorizedException | JWT inválido |
| `ASSET_NOT_FOUND` | 404 | AssetNotFoundError | Ticker no existe en catálogo |
| `ALERT_NOT_FOUND` | 404 | AlertNotFoundError | Alerta no existe o no es del user |
| `ALERT_LIMIT_EXCEEDED` | 400 | AlertLimitExceededError | Superó 20 alertas activas |
| `PORTFOLIO_NOT_FOUND` | 404 | PortfolioNotFoundError | Portfolio no existe o no es del user |
| `INSUFFICIENT_HOLDINGS` | 400 | InsufficientHoldingsError | Intent vender más de lo que tiene |
| `TEMPLATE_NOT_FOUND` | 404 | TemplateNotFoundError | Template de notificación no existe |
| `VALIDATION_ERROR` | 400 | BadRequestException | Campos de request inválidos |
| `RATE_LIMIT` | 429 | ThrottlerException | Rate limit excedido |
| `INTERNAL_ERROR` | 500 | InternalServerError | Error inesperado |

**Formato estándar de error response:**
```json
{
  "statusCode": 400,
  "error": "ALERT_LIMIT_EXCEEDED",
  "message": "Has alcanzado el límite de 20 alertas activas. Desactiva o elimina alguna para crear nuevas.",
  "timestamp": "2026-02-26T15:30:00Z",
  "path": "/api/v1/alerts"
}
```

---

## 10. Frontend File Structure (Completa)

```
notifinance-frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── og-image.png
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (providers, fonts)
│   │   ├── page.tsx                   # Dashboard (ruta /)
│   │   ├── globals.css                # Tailwind imports + custom CSS
│   │   ├── loading.tsx                # Root loading state
│   │   ├── error.tsx                  # Root error boundary
│   │   ├── not-found.tsx              # 404 page
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── assets/
│   │   │   ├── page.tsx               # Asset explorer (tabs: acciones, cedears, bonos...)
│   │   │   ├── loading.tsx
│   │   │   └── [ticker]/
│   │   │       ├── page.tsx           # Asset detail + chart
│   │   │       └── loading.tsx
│   │   ├── watchlist/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── portfolio/
│   │   │   ├── page.tsx               # Portfolio list
│   │   │   ├── loading.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # Portfolio detail (tabs: holdings, perf, dist, trades)
│   │   │       └── loading.tsx
│   │   ├── alerts/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── notifications/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── ... (all shadcn components)
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarItem.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DollarPanel.tsx
│   │   │   ├── DollarCard.tsx
│   │   │   ├── RiskCountryCard.tsx
│   │   │   ├── MarketStatusBadge.tsx
│   │   │   ├── IndexCards.tsx
│   │   │   ├── TopMoversTable.tsx
│   │   │   └── WatchlistWidget.tsx
│   │   │
│   │   ├── market/
│   │   │   ├── PriceDisplay.tsx
│   │   │   ├── PercentBadge.tsx
│   │   │   ├── Sparkline.tsx
│   │   │   ├── AssetTable.tsx
│   │   │   ├── AssetFilters.tsx
│   │   │   └── FavoriteButton.tsx
│   │   │
│   │   ├── charts/
│   │   │   ├── PriceChart.tsx          # TradingView Lightweight Charts wrapper
│   │   │   ├── CandlestickChart.tsx
│   │   │   ├── VolumeChart.tsx
│   │   │   ├── PerformanceChart.tsx
│   │   │   ├── DonutChart.tsx
│   │   │   ├── PeriodSelector.tsx
│   │   │   └── IndicatorToggle.tsx
│   │   │
│   │   ├── asset-detail/
│   │   │   ├── AssetHeader.tsx
│   │   │   ├── AssetStatsPanel.tsx
│   │   │   ├── AssetInfoSection.tsx
│   │   │   ├── RelatedAssets.tsx
│   │   │   └── TechnicalIndicators.tsx
│   │   │
│   │   ├── portfolio/
│   │   │   ├── PortfolioCard.tsx
│   │   │   ├── PortfolioCreateDialog.tsx
│   │   │   ├── HoldingsTable.tsx
│   │   │   ├── TradeForm.tsx
│   │   │   ├── TradeHistory.tsx
│   │   │   └── DistributionPanel.tsx
│   │   │
│   │   ├── alerts/
│   │   │   ├── AlertCard.tsx
│   │   │   ├── AlertForm.tsx
│   │   │   └── AlertStatusBadge.tsx
│   │   │
│   │   ├── notifications/
│   │   │   ├── NotificationItem.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   └── NotificationToast.tsx
│   │   │
│   │   └── shared/
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       ├── Pagination.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   ├── useMarketData.ts
│   │   ├── useAsset.ts
│   │   ├── useWatchlist.ts
│   │   ├── usePortfolio.ts
│   │   ├── useAlerts.ts
│   │   ├── useNotifications.ts
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── useKeyboardShortcut.ts
│   │
│   ├── lib/
│   │   ├── api.ts                     # Axios instance + interceptors
│   │   ├── socket.ts                  # Socket.io client instance
│   │   ├── format.ts                  # formatCurrency, formatPercent, formatDate, etc.
│   │   ├── utils.ts                   # cn() helper (shadcn)
│   │   ├── validators.ts             # Zod schemas
│   │   └── constants.ts              # PERIOD_OPTIONS, DOLLAR_TYPES, etc.
│   │
│   ├── stores/
│   │   ├── auth-store.ts             # Zustand: user, tokens, isAuthenticated
│   │   ├── theme-store.ts            # Zustand: dark/light mode
│   │   └── market-store.ts           # Zustand: live market data from WS
│   │
│   ├── types/
│   │   ├── api.ts                     # Generic API types (PaginatedResponse, ErrorResponse)
│   │   ├── auth.ts                    # User, AuthResponse
│   │   ├── market.ts                  # DollarQuote, MarketQuote, CountryRisk, MarketSummary
│   │   ├── asset.ts                   # Asset, AssetType, AssetStats
│   │   ├── portfolio.ts              # Portfolio, Trade, Holding, Distribution
│   │   ├── alert.ts                   # Alert, AlertType, AlertCondition, AlertStatus
│   │   └── notification.ts            # Notification
│   │
│   └── providers/
│       ├── QueryProvider.tsx          # TanStack Query
│       ├── ThemeProvider.tsx          # next-themes
│       └── SocketProvider.tsx         # Socket.io context
│
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-02-26 | Especificaciones complementarias completas |
