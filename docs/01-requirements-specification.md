# NotiFinance — Especificación de Requisitos v2.0 (Release 2)

**Versión:** 2.0  
**Fecha:** 2026-02-28  
**Estado:** Aprobado para desarrollo — Release 2: Confiabilidad y Calidad de Datos  

---

## 1. Introducción

### 1.1 Propósito

Este documento define los requisitos funcionales y no funcionales de **NotiFinance Release 2**, centrada en transformar el MVP existente en una plataforma confiable con datos financieros reales, precisos y verificables del mercado argentino.

### 1.2 Contexto de Release 2

Release 1 (MVP) entregó la estructura completa del sistema: backend hexagonal (NestJS 11), frontend (Next.js 15), módulos de auth/market-data/alert/portfolio/watchlist/notification/preferences/template/ingestion, event-driven con RabbitMQ y WebSocket. Sin embargo, el MVP presenta problemas críticos:

| Área | Problema detectado en MVP |
|---|---|
| **Datos de mercado** | Fuentes inestables (Data912 y Yahoo Finance fallan frecuentemente), datos stale, precios que no coinciden con la realidad del mercado |
| **Dólar** | Consenso multi-fuente funcional pero sin validación cruzada contra fuentes autoritativas; TARJETA y CRIPTO con datos inconsistentes |
| **Riesgo país** | Cadena de fallbacks frágil; valores a veces desactualizados por horas |
| **Históricos** | Datos históricos incompletos o inexistentes para muchos activos; gráficos vacíos con gaps |
| **LECAPs/Bonos/ONs** | Catálogo estático con instrumentos vencidos; datos de renta fija incompletos |
| **Frontend** | UI funcional pero estados de error genéricos; sin indicadores de frescura ni fuente de datos |
| **Alertas** | Motor de evaluación funcional en tests pero no validado end-to-end con datos reales |
| **Portfolio** | P&L depende de precios potencialmente stale o ausentes; sin indicador de antigüedad |
| **Análisis** | Sin contexto (noticias, tendencias, explicaciones de movimientos de mercado) |

### 1.3 Objetivos principales de Release 2

| # | Objetivo | Métrica de éxito |
|---|---|---|
| O1 | **Datos reales y verificables** | 95%+ de cotizaciones en dashboard coinciden con fuentes de referencia (±2%) |
| O2 | **Fuentes robustas y redundantes** | Cada dato crítico tiene ≥2 fuentes con fallback automático |
| O3 | **Calidad de análisis** | Cada activo muestra datos descriptivos reales, métricas calculadas correctamente |
| O4 | **UX honesta y clara** | Nunca mostrar un precio falso; preferir "sin datos" a dato incorrecto |
| O5 | **Orquestación confiable** | Flujo market→alert→notification funcional end-to-end con datos reales |
| O6 | **Frontend profesional** | Interfaz fintech con indicadores de frescura, timestamps, estados informativos |

### 1.4 Alcance del producto (sin cambios)

**Lo que NotiFinance ES:** Dashboard de tracking financiero argentino, sistema de alertas configurable, portfolio tracker personal, herramienta de análisis con gráficos e indicadores técnicos.

**Lo que NotiFinance NO ES:** Broker, robo-advisor, sistema de pagos.

### 1.5 Clases de usuario (sin cambios)

| Usuario | Nivel de acceso |
|---|---|
| **Visitante** | Dashboard público, explorador de activos, detalle con datos limitados |
| **Usuario Registrado** | Todo + watchlist, portfolio, alertas, notificaciones, preferencias |
| **Recruiter** | Acceso completo vía modo demo con datos reales precargados |

---

## 2. Requisitos Funcionales — Release 2

### 2.1 Bloque: Confiabilidad de Fuentes de Datos

#### RF-v2-001: Dólar — Fuentes Confiables y Validación

**Problema:** Consenso sin validación contra referencia autoritativa.

**Requisitos:**
- Mantener fuentes actuales: DolarApi, Bluelytics, CriptoYa.
- Agregar **ArgentinaDatos** (`https://api.argentinadatos.com/v1/cotizaciones/dolares`) como fuente adicional.
- Dólar oficial: validar contra tipo de cambio de referencia BCRA (`https://api.bcra.gob.ar`).
- MEP/CCL: implementar cálculo propio usando precio ARS/USD de bonos (AL30, GD30) de la propia app.
- Scoring de confianza por fuente basado en uptime últimas 24h.
- Cada cotización incluye: `source`, `timestamp`, `confidence` (HIGH/MEDIUM/LOW).
- **Prioridad:** Crítica

#### RF-v2-002: Acciones y CEDEARs — Fuentes Robustas

**Problema:** Data912 es inestable; Yahoo Finance falla con tickers `.BA`.

**Requisitos:**
- **Primaria:** Data912 (`/live/arg_stocks`, `/live/arg_cedears`) — mejor cobertura del mercado argentino gratis.
- **Secundaria (nueva):** Scraping de **Rava Bursátil** (`https://www.rava.com/empresas/cotizaciones`) — fuente de referencia del mercado argentino.
- **Terciaria (nueva):** **BYMA Data** (`https://open.bymadata.com.ar`) — fuente oficial de la bolsa argentina.
- **Yahoo Finance:** Solo para datos históricos y subyacentes US de CEDEARs.
- Cada cotización debe incluir: `source`, `timestamp`, `confidence`.
- **Prioridad:** Crítica

#### RF-v2-003: Bonos, LECAPs y ONs — Catálogo Dinámico

**Problema:** Catálogo estático con instrumentos vencidos.

**Requisitos:**
- Data912 se mantiene como fuente principal de precios.
- Rava Bursátil como fuente de validación (TIR, duration, flujos para bonos).
- Job semanal de actualización de catálogo: marca `is_active = false` instrumentos vencidos, detecta nuevos.
- Para LECAPs/BONCAPs: cálculo automático de TNA/TEA desde precio y fecha de vencimiento.
- Para bonos: calendario de cupones real (scrapeado o estático verificable).
- **Prioridad:** Alta

#### RF-v2-004: Riesgo País — Validación Cruzada

**Problema:** Cadena de fallbacks frágil.

**Requisitos:**
- Mantener: ArgentinaDatos, DolarApi, Ámbito Financiero.
- Si diferencia entre fuentes > 5%, loguear warning y usar mediana.
- Mostrar hora exacta del dato y fuente utilizada en el dashboard.
- **Prioridad:** Alta

#### RF-v2-005: Datos Históricos Completos

**Problema:** Gráficos vacíos para muchos activos.

**Requisitos:**
- Job de backfill histórico: Yahoo Finance para tickers `.BA` y US (periodos 1Y, 5Y).
- Data912 historical endpoints para OHLC.
- Persistencia en `market_quotes` con granularidad diaria.
- Frontend muestra mensaje claro cuando no hay datos para un período (no gráfico vacío).
- Cobertura mínima: datos diarios de 1 año para top 20 acciones y top 20 CEDEARs.
- **Prioridad:** Alta

### 2.2 Bloque: Indicadores de Calidad en la UI

#### RF-v2-006: Indicadores de Frescura y Confianza

**Requisitos:**
- Cada dato en dashboard incluye:
  - Timestamp: "Actualizado hace X min" con tooltip de hora exacta.
  - Indicador visual de frescura: Verde (< 10 min), Amarillo (10-30 min), Rojo (> 30 min), Gris ("Sin datos recientes").
  - Fuente: sub-texto o tooltip ("vía DolarApi", "vía Data912").
- Banner de advertencia si datos > 1 hora de antigüedad.
- **Prioridad:** Alta

#### RF-v2-007: Estados de Error Informativos

**Requisitos:**
- Reemplazar mensajes genéricos ("Error al cargar") por mensajes contextuales ("No pudimos obtener la cotización del dólar MEP. Última cotización conocida: $X hace Y min").
- Cada sección del dashboard debe poder fallar independientemente sin romper el resto.
- Retry automático con botón manual visible.
- **Prioridad:** Alta

### 2.3 Bloque: Mejoras en la Interfaz

#### RF-v2-008: Dashboard Mejorado

**Requisitos:**
- Panel de dólar: mostrar spread/brecha blue-oficial en %, además de compra/venta.
- Riesgo país: contexto "±X pts respecto al cierre anterior", sparkline 7 días.
- Top movers: expandible a top 10; agregar volumen como indicador de liquidez.
- Índices: agregar dato de volumen negociado del Merval.
- Estado del mercado: granular (pre-market, abierto, post-market, cerrado) + feriados argentinos.
- **Prioridad:** Alta

#### RF-v2-009: Detalle de Activo Mejorado

**Requisitos:**
- Descripciones reales de empresas (estáticas en seed o vía Yahoo Finance).
- CEDEARs: ratio de conversión, precio subyacente USD, tipo de cambio implícito calculado en tiempo real.
- Bonos: tabla de flujo de fondos con fechas de cupones, TIR y duration reales.
- LECAPs/BONCAPs: TNA y TEA calculadas al precio actual.
- Indicadores técnicos: tests unitarios verificando correctitud de SMA, EMA, RSI, MACD, Bollinger.
- **Prioridad:** Alta

#### RF-v2-010: Noticias y Contexto Financiero (Feature Nueva)

**Requisitos:**
- Nuevo módulo backend de agregación de noticias vía RSS/scraping:
  - Ámbito Financiero, El Cronista, Infobae Economía (RSS feeds públicos).
- Datos por noticia: titular, fuente, timestamp, URL original, categoría.
- Widget en dashboard: últimas 5 noticias del día.
- En detalle de activo: noticias que mencionen el ticker/empresa.
- **Prioridad:** Media

### 2.4 Bloque: Orquestación Confiable

#### RF-v2-011: Validación E2E del Motor de Alertas

**Requisitos:**
- Flujo validado end-to-end: cron → precio real → RabbitMQ → evaluación → disparo → WS + DB.
- Métricas: tiempo de evaluación, alertas evaluadas/disparadas por ciclo.
- Smoke test automático que valide el flujo diariamente.
- **Prioridad:** Alta

#### RF-v2-012: Portfolio con Precios Reales

**Requisitos:**
- Holdings usan precio más reciente de `market_quotes`.
- Si precio stale, UI marca "Último precio: [fecha]".
- Performance interpola días sin datos (mantener último valor, no 0).
- **Prioridad:** Alta

#### RF-v2-013: Monitoreo de Salud de Providers

**Requisitos:**
- Endpoint `GET /api/v1/health/providers` con estado de cada fuente: nombre, URL, último éxito, último fallo, uptime 24h, latencia promedio, estado (OK/DEGRADED/DOWN).
- Dashboard interno o sección en `/health` para monitoring.
- **Prioridad:** Media

---

## 3. Requisitos No Funcionales v2

### 3.1 Calidad de Datos (NUEVO)

| ID | Requisito | Métrica |
|---|---|---|
| RNF-v2-001 | Precisión dólar | < 2% de diferencia vs fuentes de referencia |
| RNF-v2-002 | Precisión acciones/CEDEARs | < 3% de diferencia vs Rava/BYMA |
| RNF-v2-003 | Frescura en horario de mercado | 95% de datos con timestamp < 10 min |
| RNF-v2-004 | Cobertura catálogo | 100% del panel líder Merval con precio actualizado |
| RNF-v2-005 | Históricos | Datos diarios ≥ 1 año para top 20 acciones y CEDEARs |
| RNF-v2-006 | Principio de honestidad | NUNCA mostrar dato inventado; preferir "sin datos" |

### 3.2 Confiabilidad (NUEVO)

| ID | Requisito | Métrica |
|---|---|---|
| RNF-v2-010 | Disponibilidad datos dólar | 99% del tiempo ≥1 fuente activa |
| RNF-v2-011 | Disponibilidad datos acciones | 95% del tiempo ≥1 fuente activa |
| RNF-v2-012 | Fallback automático | Switch a fuente secundaria < 30 seg |
| RNF-v2-013 | Trazabilidad | Todo dato tiene source + timestamp |

### 3.3 Rendimiento (ajustados)

| ID | Requisito | Métrica |
|---|---|---|
| RNF-001 | LCP dashboard | ≤ 2s |
| RNF-002 | API response time | p95 ≤ 300ms (ajustado por validación multi-fuente) |
| RNF-003 | Latencia WebSocket | ≤ 2s (ajustado para priorizar precisión) |
| RNF-004 | Evaluación alertas | ≤ 5s batch completo |

### 3.4 Seguridad, Mantenibilidad, Usabilidad

Se mantienen todos los RNFs de v1 (RNF-030 a RNF-072). Adiciones:

| ID | Requisito |
|---|---|
| RNF-v2-020 | Scripts de QA automatizados para calidad de datos runtime |
| RNF-v2-021 | Tests E2E del flujo market→alert→notification con datos reales |
| RNF-v2-022 | Documentación de cada fuente de datos (URL, formato, limitaciones, fallback) |

---

## 4. Restricciones (actualizadas)

| # | Restricción | Razón |
|---|---|---|
| C-001 | No operaciones de compra/venta reales | Es tracker, no broker |
| C-002 | APIs públicas/gratuitas | Presupuesto $0 |
| C-003 | Delay hasta 15 min vs mercado real | Limitación de APIs gratis |
| C-004 | Máximo 20 alertas por usuario | Control de abuso |
| C-005 | Histórico limitado a APIs | No generamos data |
| C-006 | Preferir "sin datos" a dato incorrecto | Honestidad informativa |
| C-007 | Todo dato debe tener fuente y timestamp | Trazabilidad obligatoria |

---

## 5. Criterios de Aceptación Release 2

### Calidad de Datos
- [ ] Cotizaciones dólar (Oficial, Blue, MEP, CCL) ±2% vs Rava/Ámbito
- [ ] Top movers coinciden con acuantoesta.com.ar / Rava Bursátil
- [ ] Acciones del panel Merval ±3% vs fuentes de referencia
- [ ] LECAPs vencidas no aparecen en catálogo activo
- [ ] Gráficos históricos con datos reales para top 20 acciones

### Confiabilidad
- [ ] Fallback funcional si Data912 cae
- [ ] Nunca dato mock/inventado en producción
- [ ] Timestamps visibles en toda la UI

### Motor de Alertas
- [ ] Alerta de precio con dato real se dispara end-to-end
- [ ] Notificación llega por WebSocket al usuario
- [ ] Notificación persistida en DB

### Portfolio
- [ ] P&L con precio real más reciente
- [ ] Indicador claro si precio stale

### Frontend
- [ ] Indicadores de frescura (verde/amarillo/rojo)
- [ ] Mensajes de error contextuales (no genéricos)
- [ ] Timestamps visibles en cada sección

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-02-26 | Documento inicial completo (Release 1 / MVP) |
| 2.0 | 2026-02-28 | Reescritura para Release 2: confiabilidad y calidad de datos |
