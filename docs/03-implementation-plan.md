# NotiFinance — Plan de Implementación v2.0 (Release 2)

**Versión:** 2.0  
**Fecha:** 2026-02-28  
**Estado:** Aprobado para desarrollo  

---

## Filosofía del Plan

- **Fases atómicas:** Cada fase tiene un entregable verificable y autocontenido.
- **Iterativo:** Cada fase cierra con build + test + lint en verde.
- **Incremental:** No se rompe funcionalidad existente; se enriquece.
- **Prioridad:** Datos confiables primero, luego UI, luego features nuevas.

---

## Resumen de Fases

| Fase | Nombre | Duración est. | Prioridad |
|---|---|---|---|
| R2-B01 | Provider Health Tracking | 1 día | Crítica |
| R2-B02 | Dólar — Nuevas fuentes y validación | 1-2 días | Crítica |
| R2-B03 | Acciones/CEDEARs — Scraper Rava | 2 días | Crítica |
| R2-B04 | Acciones/CEDEARs — Cliente BYMA Data | 1 día | Alta |
| R2-B05 | Provider Scoring y Orquestación | 1-2 días | Crítica |
| R2-B06 | Catálogo Dinámico y Limpieza de Activos | 1 día | Alta |
| R2-B07 | Renta Fija — TIR, TNA/TEA, Calendario de Cupones | 1-2 días | Alta |
| R2-B08 | MEP/CCL — Cálculo Propio | 1 día | Alta |
| R2-B09 | Datos Históricos — Backfill | 1-2 días | Alta |
| R2-B10 | Noticias — Módulo de Agregación RSS | 2 días | Media |
| R2-B11 | Enrichment de Cotizaciones (source, confidence) | 1 día | Alta |
| R2-B12 | Alertas — Validación E2E con Datos Reales | 1 día | Alta |
| R2-B13 | Portfolio — Precios Reales y Frescura | 0.5 días | Alta |
| R2-B14 | QA de Datos Automatizado | 1 día | Alta |
| R2-F01 | Componente FreshnessIndicator | 0.5 días | Alta |
| R2-F02 | Mensajes de Error Contextuales | 1 día | Alta |
| R2-F03 | Dashboard — Mejoras Dólar y Riesgo País | 1 día | Alta |
| R2-F04 | Dashboard — Top Movers y Estado de Mercado | 1 día | Alta |
| R2-F05 | Detalle de Activo — Acciones y CEDEARs | 1 día | Alta |
| R2-F06 | Detalle de Activo — Bonos y LECAPs | 1 día | Alta |
| R2-F07 | Widget de Noticias | 1 día | Media |
| R2-F08 | Panel de Salud de Providers | 0.5 días | Media |
| R2-F09 | Portfolio — Indicadores de Frescura | 0.5 días | Alta |
| R2-F10 | QA Visual y Testing E2E Frontend | 1 día | Alta |

**Estimación total:** ~22-26 días de trabajo

---

## Detalle de Fases — Backend

### R2-B01: Provider Health Tracking

**Objetivo:** Infraestructura base para monitorear el estado de todas las fuentes de datos.

**Entregables:**
1. Entidad `ProviderHealth` en `shared/domain/` o `market-data/domain/`.
2. Tabla `provider_health` con migración.
3. `IProviderHealthRepository` (interfaz) + `TypeOrmProviderHealthRepository` (implementación).
4. `ProviderHealthTracker` service: registra éxito/fallo de cada llamada HTTP a providers.
5. `ProviderHealthJob` (cron cada 5 min): actualiza métricas rolling de 24h.
6. Endpoint `GET /api/v1/health/providers`.
7. Tests unitarios del tracker y del job.
8. Test E2E del endpoint.

**Criterio de cierre:** Endpoint retorna estado de todos los providers registrados. Build + test verde.

---

### R2-B02: Dólar — Nuevas Fuentes y Validación

**Objetivo:** Agregar ArgentinaDatos y BCRA como fuentes adicionales; validación cruzada.

**Entregables:**
1. `ArgentinaDatosClient` — cliente HTTP para `/v1/cotizaciones/dolares`.
2. `BCRAClient` — cliente HTTP para tipo de cambio de referencia del BCRA.
3. Integrar ambos en `MultiSourceDollarClient`:
   - ArgentinaDatos como fuente adicional en el consenso.
   - BCRA como referencia de validación (no consenso, solo validación de dólar oficial).
4. Lógica de validación: si diferencia entre consenso y BCRA > 2% para oficial, loguear warning.
5. Tests unitarios de cada nuevo client (con mocks HTTP).
6. Test de integración de `MultiSourceDollarClient` con 5 fuentes.
7. Actualizar `DollarUpdateJob` para incluir nuevas fuentes.

**Criterio de cierre:** Dólar usa 5 fuentes con validación. Tests verdes.

---

### R2-B03: Acciones/CEDEARs — Scraper Rava

**Objetivo:** Nueva fuente de datos de mercado argentino vía scraping de Rava Bursátil.

**Dependencias:** R2-B01 (health tracking).

**Entregables:**
1. Instalar `cheerio` como dependencia.
2. `RavaScraperClient` implementando `IMarketDataProvider`:
   - Parsea tabla HTML de cotizaciones de `/empresas/cotizaciones`.
   - Extrae: ticker, último precio, variación %, volumen.
   - Rate limiting interno: 1 req cada 10s.
   - User-Agent configurable.
3. Verificar `robots.txt` de Rava e implementar respeto.
4. Registrar en `ProviderHealthTracker`.
5. Tests unitarios con HTML fixture descargado.
6. NO integrar aún como fuente activa (eso es R2-B05).

**Criterio de cierre:** Scraper funcional con tests sobre HTML fixture. Build verde.

---

### R2-B04: Acciones/CEDEARs — Cliente BYMA Data

**Objetivo:** Agregar BYMA Data como fuente oficial de la bolsa argentina.

**Dependencias:** R2-B01.

**Entregables:**
1. `BYMADataClient` implementando `IMarketDataProvider`:
   - Consume `https://open.bymadata.com.ar` API pública.
   - Mapea respuesta a formato interno.
2. Registrar en `ProviderHealthTracker`.
3. Tests unitarios con response fixtures.
4. NO integrar aún como fuente activa.

**Criterio de cierre:** Client funcional con tests. Build verde.

---

### R2-B05: Provider Scoring y Orquestación

**Objetivo:** Sistema inteligente de selección de fuente basado en salud y confianza.

**Dependencias:** R2-B01, R2-B03, R2-B04.

**Entregables:**
1. `ProviderScorer` service:
   - Input: métricas de health de cada provider.
   - Output: score 0-100 y confidence level (HIGH/MEDIUM/LOW).
   - Factores: uptime_24h (40%), error_rate_1h (30%), avg_latency (20%), data_age (10%).
2. `ProviderOrchestrator` service:
   - Selecciona fuente primaria por scoring para cada tipo de dato.
   - Fallback automático si primaria falla.
   - Retorna siempre `{ data, source, confidence, timestamp }`.
3. Integrar en `MarketQuotesJob`: usar orchestrator en vez de client directo.
4. Integrar Rava y BYMA como fuentes secundaria/terciaria para acciones.
5. Tests unitarios: scoring algorithm, orchestrator fallback.
6. Test de integración: job con orquestación completa.

**Criterio de cierre:** Market data usa orquestación inteligente. Fallback funcional. Tests verdes.

---

### R2-B06: Catálogo Dinámico y Limpieza de Activos

**Objetivo:** Mantener el catálogo de activos actualizado automáticamente.

**Entregables:**
1. Agregar campos a `market_assets`: `is_active`, `maturity_date`, `last_catalog_check`.
2. Migración de base de datos.
3. `CatalogMaintenanceJob` (cron semanal):
   - Marca `is_active = false` instrumentos con `maturity_date` pasada.
   - Compara catálogo local vs Data912 live: detecta tickers nuevos (log para revisión manual).
   - Actualiza `last_catalog_check`.
4. Filtrar activos inactivos en queries de listado (salvo que se pida explícitamente).
5. Tests unitarios del job.
6. Seed actualizado: marcar LECAPs/BONCAPs vencidas, agregar `maturity_date` a bonos conocidos.

**Criterio de cierre:** Job detecta y marca vencidos. Catálogo limpio. Tests verdes.

---

### R2-B07: Renta Fija — TIR, TNA/TEA, Calendario de Cupones

**Objetivo:** Datos descriptivos reales para bonos y LECAPs.

**Dependencias:** R2-B06.

**Entregables:**
1. Funciones de cálculo financiero:
   - `calculateYTM(price, couponRate, faceValue, maturityDate, frequency)` — TIR para bonos.
   - `calculateTNATEA(price, faceValue, maturityDate)` — Para LECAPs/BONCAPs (zero coupon).
2. Data estática de calendario de cupones para bonos principales: AL30, AL35, GD30, GD35, GD38, GD41, GD46.
3. Endpoint enriquecido: `GET /api/v1/market-data/assets/:symbol` retorna campos de renta fija cuando aplica.
4. Tests unitarios con valores conocidos verificados manualmente.

**Criterio de cierre:** Datos de renta fija reales y verificables. Tests verdes.

---

### R2-B08: MEP/CCL — Cálculo Propio

**Objetivo:** Calcular dólar MEP y CCL con precios reales de bonos de la propia app.

**Dependencias:** R2-B05 (precios de bonos confiables).

**Entregables:**
1. `MEPCCLCalculationService`:
   - MEP = Precio ARS del bono (ej AL30) / Precio USD del bono (ej AL30D).
   - CCL = Precio ARS / Precio en NYSE (para GD30).
   - Usa precios del `ProviderOrchestrator`.
2. `MEPCCLCalculationJob` (cron cada 5 min, mercado abierto):
   - Calcula y publica vía WebSocket.
   - Persiste como quote tipo `DOLLAR_MEP_CALC` y `DOLLAR_CCL_CALC`.
3. Validación cruzada: comparar MEP calculado vs MEP de DolarApi/Data912, loguear diferencia.
4. Tests unitarios con precios estáticos conocidos.

**Criterio de cierre:** MEP/CCL calculado con bonos propios, validado contra fuentes. Tests verdes.

---

### R2-B09: Datos Históricos — Backfill

**Objetivo:** Llenar gaps en datos históricos para que los gráficos sean útiles.

**Entregables:**
1. `HistoricalBackfillService`:
   - Yahoo Finance: OHLC diario para tickers `.BA` (top acciones argentinas) + US (CEDEARs subyacentes).
   - Data912 historical endpoints: `/historical/{type}/{symbol}`.
   - Persiste en `market_quotes` con granularidad diaria.
2. `HistoricalBackfillJob`:
   - Cron diario (4 AM): verifica gaps y rellena.
   - Bajo demanda: endpoint admin `POST /api/v1/market-data/backfill/:symbol` (opcional, solo admin).
3. Priorización: top 20 acciones panel Merval, top 20 CEDEARs por volumen.
4. Tests unitarios del dedup/merge al persistir.

**Criterio de cierre:** Gráficos con ≥ 1 año de datos para top activos. Tests verdes.

---

### R2-B10: Noticias — Módulo de Agregación RSS

**Objetivo:** Nuevo módulo de noticias para dar contexto al dashboard.

**Entregables:**
1. Módulo `news` con estructura hexagonal completa:
   - Domain: `NewsArticle` entity.
   - Application: `INewsRepository` interface, `FetchLatestNewsUseCase`, `GetNewsByTickerUseCase`.
   - Infrastructure: `TypeOrmNewsRepository`, `RSSFeedClient`.
2. Tabla `news_articles` con migración.
3. `RSSFeedClient`:
   - Parsea RSS/Atom XML de Ámbito, Cronista, Infobae.
   - Extrae: título, URL, fecha de publicación, categoría (si disponible).
   - Detección básica de tickers mencionados en título (regex contra catálogo de tickers).
4. `NewsAggregationJob` (cron cada 30 min, configurable):
   - Fetch feeds → deduplica por URL → persiste nuevos.
   - TTL: limpia noticias > 7 días.
5. Endpoints: `GET /api/v1/news`, `GET /api/v1/news?ticker=GGAL`.
6. Evento WebSocket `news:latest` cuando se detectan noticias nuevas.
7. Tests unitarios: parsing RSS fixture, deduplicación, ticker detection.
8. Test E2E: endpoint de noticias.

**Criterio de cierre:** Noticias de 3 fuentes RSS accesibles vía API. Tests verdes.

---

### R2-B11: Enrichment de Cotizaciones

**Objetivo:** Todas las cotizaciones incluyen metadatos de fuente y confianza.

**Dependencias:** R2-B05.

**Entregables:**
1. Agregar campos `source`, `source_timestamp`, `confidence` a `market_quotes` (migración).
2. Actualizar todos los DTOs de response de market-data para incluir campos de enrichment.
3. Actualizar `MarketDataGateway` (WebSocket) para emitir datos enriquecidos.
4. Backward compatible: campos nuevos son opcionales en responses.
5. Tests de DTOs y serialización.

**Criterio de cierre:** Toda cotización visible tiene fuente y timestamp. Tests verdes.

---

### R2-B12: Alertas — Validación E2E con Datos Reales

**Objetivo:** Confirmar que el flujo market→alert→notification funciona end-to-end.

**Entregables:**
1. Test E2E que:
   - Crea alerta de precio para activo real.
   - Simula cron de market data con dato real.
   - Verifica que RabbitMQ recibe evento.
   - Verifica que notificación se persiste en DB.
   - Verifica que WebSocket emite al usuario.
2. Métricas de logging: tiempo de evaluación por ciclo, alertas evaluadas/disparadas.
3. Smoke test script: `scripts/alert-flow-smoke.js` para validación manual/CI.

**Criterio de cierre:** Flujo completo funcional con datos reales. Test E2E verde.

---

### R2-B13: Portfolio — Precios Reales y Frescura

**Objetivo:** P&L usa precios reales y muestra antigüedad.

**Dependencias:** R2-B11.

**Entregables:**
1. `PortfolioService.calculatePerformance()` usa precio más reciente de `market_quotes` con `source_timestamp`.
2. Response de portfolio incluye `priceAge` por holding (minutos desde último precio).
3. Si precio stale (> threshold), flag `isStale: true`.
4. Interpolación: días sin datos mantienen último valor conocido (no 0).
5. Tests unitarios de performance calculation con precios stale.

**Criterio de cierre:** P&L con precios reales. Stale flag funcional. Tests verdes.

---

### R2-B14: QA de Datos Automatizado

**Objetivo:** Scripts que validen calidad de datos en runtime.

**Entregables:**
1. Actualizar `scripts/market-data-quality.js`:
   - Comparar cotizaciones contra fuente de referencia (Rava public data).
   - Report: desviaciones > 3%, activos sin precio, datos > 30 min.
2. Actualizar `scripts/market-assets-quality.js`:
   - Verificar que no haya activos vencidos como activos.
   - Verificar cobertura del panel Merval.
3. Nuevo `scripts/provider-health-check.js`:
   - Ping a cada provider y reportar estado.
4. Comando unificado: `npm run verify:data:quality`.

**Criterio de cierre:** Scripts ejecutables y verificando datos reales.

---

## Detalle de Fases — Frontend

### R2-F01: Componente FreshnessIndicator

**Objetivo:** Componente reutilizable para indicar frescura de datos.

**Entregables:**
1. `components/common/FreshnessIndicator.tsx`:
   - Props: `fetchedAt: Date`, `source?: string`, `thresholds?: { green, yellow, red }`.
   - Badge: dot verde/amarillo/rojo/gris.
   - Tooltip: "Actualizado hace X min vía [fuente]".
2. `components/common/StaleDataBanner.tsx`:
   - Aparece si algún dato del dashboard > 1 hora.
   - Texto: "Algunos datos pueden estar desactualizados. Última actualización: [hora]."
3. Hook `useFreshness(fetchedAt: Date)` → retorna `{ status, label, color }`.
4. Tests unitarios del hook y snapshot tests del componente.

**Criterio de cierre:** Componente funcional con tests. Build verde.

---

### R2-F02: Mensajes de Error Contextuales

**Objetivo:** Reemplazar errores genéricos por mensajes útiles.

**Entregables:**
1. `components/common/ContextualErrorCard.tsx`:
   - Props: `section: string`, `lastKnownValue?: number`, `lastKnownAt?: Date`, `onRetry: () => void`.
   - Muestra: "No pudimos obtener [sección]. Última cotización: $X (hace Y min). [Reintentar]".
2. Actualizar error boundaries en cada sección del dashboard para usar `ContextualErrorCard`.
3. Cada sección del dashboard maneja errores independientemente (una sección can fall without affecting others).
4. Tests: renderizado con distintos estados de error.

**Criterio de cierre:** Errores contextuales en todas las secciones. Tests verdes.

---

### R2-F03: Dashboard — Mejoras Dólar y Riesgo País

**Dependencias:** R2-F01, R2-B11.

**Entregables:**
1. Panel dólar:
   - Agregar brecha blue-oficial en % (componente `SpreadIndicator`).
   - Agregar MEP y CCL calculados (R2-B08).
   - FreshnessIndicator en cada tipo de dólar.
2. Panel riesgo país:
   - Mostrar "±X pts vs cierre anterior".
   - Sparkline de 7 días (usando datos históricos de DB existentes).
   - FreshnessIndicator con fuente.
3. Tests de componentes actualizados.

**Criterio de cierre:** Dólar y riesgo país con datos enriquecidos. Build + test verde.

---

### R2-F04: Dashboard — Top Movers y Estado de Mercado

**Dependencias:** R2-F01.

**Entregables:**
1. Top movers:
   - Expandible a top 10 (colapsable).
   - Columna de volumen.
   - FreshnessIndicator.
2. Estado del mercado:
   - Componente `MarketStatusBadge`:
   - Evalúa hora actual vs horarios BYMA: pre-market (10:00-11:00), abierto (11:00-17:00), post-market (17:00-17:15), cerrado.
   - Calendario de feriados argentinos (data estática).
   - Badge: "Mercado abierto", "Cerrado — abre lunes 11:00", etc.
3. Tests del cálculo de estado de mercado.

**Criterio de cierre:** Top movers mejorado y estado de mercado funcional. Tests verdes.

---

### R2-F05: Detalle de Activo — Acciones y CEDEARs

**Dependencias:** R2-B11, R2-B09.

**Entregables:**
1. Acciones:
   - Descripción de empresa (desde `company_description` del backend).
   - Gráfico histórico con datos reales (no vacío).
3. CEDEARs:
   - Ratio de conversión visible.
   - Precio subyacente USD.
   - Tipo de cambio implícito calculado: `precioARS / (precioUSD * ratio)`.
4. FreshnessIndicator en precio principal.
5. Tests de cálculos y rendering.

**Criterio de cierre:** Detalle de acciones y CEDEARs con datos reales. Tests verdes.

---

### R2-F06: Detalle de Activo — Bonos y LECAPs

**Dependencias:** R2-B07.

**Entregables:**
1. Bonos:
   - Tabla de flujo de fondos: fechas de cupones, montos, moneda.
   - TIR real mostrada.
   - Duration.
2. LECAPs/BONCAPs:
   - TNA y TEA mostradas.
   - Fecha de vencimiento prominente.
   - Indicador "Días al vencimiento: X".
3. Tests de rendering con datos financieros reales.

**Criterio de cierre:** Detalle de renta fija con datos reales. Tests verdes.

---

### R2-F07: Widget de Noticias

**Dependencias:** R2-B10.

**Entregables:**
1. `components/dashboard/NewsWidget.tsx`:
   - Últimas 5 noticias del día.
   - Cada item: título (link externo), fuente, hora relativa.
   - Polling cada 5 min (TanStack Query).
2. En detalle de activo: noticias filtradas por ticker.
3. Hook `useNews({ ticker?, limit?, category? })`.
4. Tests del componente y hook.

**Criterio de cierre:** Noticias visibles en dashboard y detalle. Tests verdes.

---

### R2-F08: Panel de Salud de Providers

**Dependencias:** R2-B01.

**Entregables:**
1. `components/common/ProviderHealthPanel.tsx`:
   - Tabla: nombre, estado (badge color), uptime 24h, latencia, último éxito/fallo.
   - Accesible desde footer o sección de settings/debug.
2. Hook `useProviderHealth()`.
3. Tests del componente.

**Criterio de cierre:** Panel funcional visible. Tests verdes.

---

### R2-F09: Portfolio — Indicadores de Frescura

**Dependencias:** R2-F01, R2-B13.

**Entregables:**
1. Cada holding muestra `FreshnessIndicator` junto al precio.
2. Si precio stale, nota inline: "Último precio: [fecha]".
3. Totales del portfolio marcan si algún componente tiene precio stale.
4. Tests de rendering con holdings stale vs fresh.

**Criterio de cierre:** Portfolio con indicadores de frescura. Tests verdes.

---

### R2-F10: QA Visual y Testing E2E Frontend

**Objetivo:** Validación final de todos los cambios de UI en R2.

**Entregables:**
1. Actualizar tests unitarios de Vitest para componentes modificados.
2. Actualizar Playwright E2E:
   - Verificar FreshnessIndicator visible en dashboard.
   - Verificar error contextual se muestra al simular fallo de API.
   - Verificar noticias se renderizan.
3. Visual QA checklist:
   - [ ] Dashboard con datos reales se ve profesional.
   - [ ] Indicadores de frescura visibles y correctos.
   - [ ] Errores contextuales informativos.
   - [ ] Gráficos con datos (no vacíos para activos del Merval).
   - [ ] Responsive funcional en mobile.

**Criterio de cierre:** Todos los tests frontend verdes. QA visual aprobado.

---

## Orden de Ejecución Recomendado

```
SEMANA 1 — Infraestructura de providers:
  R2-B01 → R2-B02 → R2-B03 → R2-B04 → R2-B05

SEMANA 2 — Datos confiables:
  R2-B06 → R2-B07 → R2-B08 → R2-B09

SEMANA 3 — Backend features + QA:
  R2-B10 → R2-B11 → R2-B12 → R2-B13 → R2-B14

SEMANA 4 — Frontend R2:
  R2-F01 → R2-F02 → R2-F03 → R2-F04

SEMANA 5 — Frontend R2 cont:
  R2-F05 → R2-F06 → R2-F07 → R2-F08 → R2-F09 → R2-F10
```

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-02-26 | Plan de implementación original: fases B1-B9, F1-F10 |
| 2.0 | 2026-02-28 | Reescritura completa: fases atómicas R2, foco en confiabilidad de datos |
