# NotiFinance — Especificación de Requisitos de Software (SRS)

**Versión:** 1.0  
**Fecha:** 2026-02-26  
**Autor:** Arquitectura & Producto  
**Estado:** Aprobado para desarrollo  

---

## 1. Introducción

### 1.1 Propósito

Este documento define de forma exhaustiva los requisitos funcionales y no funcionales de **NotiFinance**, una plataforma web de tracking financiero del mercado argentino con sistema de alertas inteligentes en tiempo real. Sirve como contrato entre las áreas de producto, diseño y desarrollo.

### 1.2 Alcance del Producto

NotiFinance centraliza en una sola interfaz la información financiera que actualmente está dispersa en múltiples sitios: cotizaciones del dólar, acciones argentinas, CEDEARs, bonos soberanos, LECAPs/BONCAPs, obligaciones negociables y riesgo país. Integra un motor de notificaciones event-driven que alerta a los usuarios cuando se cumplen condiciones de mercado personalizadas.

**Lo que NotiFinance ES:**
- Un dashboard de tracking financiero con datos en tiempo real
- Un sistema de alertas y notificaciones configurable por el usuario
- Un portfolio tracker personal para seguir inversiones propias
- Una herramienta de análisis con gráficos históricos y tendencias

**Lo que NotiFinance NO ES:**
- Un broker o plataforma de trading (no ejecuta órdenes de compra/venta)
- Un robo-advisor o sistema de recomendación de inversiones
- Un sistema de pagos o transferencias

### 1.3 Audiencia

| Rol | Uso del documento |
|---|---|
| Desarrolladores Backend | Implementar APIs, servicios, integraciones con proveedores de datos |
| Desarrolladores Frontend | Implementar UI/UX, gráficos, sistema de notificaciones en el browser |
| QA / Testers | Diseñar casos de prueba funcionales y de aceptación |
| Recruiters / Evaluadores | Entender el alcance y sofisticación técnica del proyecto |

### 1.4 Definiciones y Acrónimos

| Término | Definición |
|---|---|
| **CEDEAR** | Certificado de Depósito Argentino — representa acciones extranjeras cotizando en la bolsa local |
| **LECAP** | Letra de Capitalización del Tesoro — instrumento de renta fija en pesos a corto plazo |
| **BONCAP** | Bono de Capitalización — similar a LECAP pero con plazo original mayor a 1 año |
| **ON** | Obligación Negociable — bono emitido por una empresa privada |
| **MEP** | Mercado Electrónico de Pagos — tipo de cambio dólar obtenido mediante operaciones bursátiles |
| **CCL** | Contado con Liquidación — tipo de cambio dólar obtenido mediante operaciones con bonos/acciones |
| **Riesgo País** | Indicador EMBI+ de JP Morgan que mide el spread de deuda soberana |
| **Ticker** | Código alfanumérico que identifica un activo financiero (ej: GGAL, AAPL) |
| **Watchlist** | Lista personalizada de activos que el usuario desea monitorear |
| **Alert** | Regla definida por el usuario que dispara una notificación cuando se cumple una condición |

---

## 2. Descripción General del Producto

### 2.1 Perspectiva del Producto

NotiFinance se compone de tres capas integradas:

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React/Next.js)               │
│  Dashboard · Gráficos · Watchlist · Portfolio · Alertas  │
├─────────────────────────────────────────────────────────┤
│              BACKEND (NestJS - Motor de Notificaciones)  │
│  API REST · WebSocket · Event Processing · Scheduling    │
├─────────────────────────────────────────────────────────┤
│              DATA LAYER (Market Data Providers)           │
│  APIs Financieras · Scraping · Cache · Persistencia      │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Funciones Principales del Producto

| # | Función | Descripción |
|---|---|---|
| F1 | Dashboard de Mercado | Vista general con cotizaciones del dólar, riesgo país, mejores/peores del día |
| F2 | Explorador de Activos | Listado y búsqueda de todos los instrumentos financieros con filtros |
| F3 | Detalle de Activo | Gráfico histórico, estadísticas, análisis técnico básico, datos fundamentales |
| F4 | Watchlist | Lista personalizada de activos favoritos con seguimiento rápido |
| F5 | Portfolio Tracker | Registro de inversiones propias con P&L (ganancia/perdida) en tiempo real |
| F6 | Sistema de Alertas | Reglas configurables que disparan notificaciones por múltiples canales |
| F7 | Centro de Notificaciones | Inbox in-app con historial de todas las alertas recibidas |
| F8 | Preferencias de Usuario | Configuración de canales, frecuencias y tipos de alerta |

### 2.3 Clases de Usuario

| Usuario | Descripción | Nivel de acceso |
|---|---|---|
| **Visitante** | Persona que accede sin registrarse | Dashboard público, explorador de activos, detalle con datos limitados |
| **Usuario Registrado** | Persona autenticada | Todo lo del visitante + watchlist, portfolio, alertas, notificaciones, preferencias |
| **Recruiter** | Evaluador técnico del proyecto | Acceso completo sin registro (modo demo con datos reales precargados) |

### 2.4 Entorno Operativo

- **Navegadores soportados:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Dispositivos:** Desktop-first con diseño responsive para tablet y móvil
- **Servidor:** Node.js 20 LTS, PostgreSQL 16, Redis 7, RabbitMQ 3.13
- **Deploy:** Docker Compose (local) / Servicios gratuitos en la nube (Render, Railway, Vercel)

---

## 3. Requisitos Funcionales

### 3.1 Módulo: Dashboard de Mercado (F1)

#### RF-001: Panel de Cotizaciones del Dólar
- **Descripción:** El sistema debe mostrar en la pantalla principal las cotizaciones actualizadas de los distintos tipos de dólar en Argentina.
- **Datos requeridos:** Dólar Oficial (compra/venta), Dólar Blue (compra/venta), Dólar MEP (compra/venta), Dólar CCL (compra/venta), Dólar Tarjeta, Dólar Cripto.
- **Actualización:** Cada 5 minutos durante horario de mercado (10:00-17:00 ART), cada 30 minutos fuera de horario.
- **Indicadores visuales:** Flecha verde (sube), flecha roja (baja), variación porcentual diaria, timestamp de última actualización.
- **Prioridad:** Alta

#### RF-002: Indicador de Riesgo País
- **Descripción:** Mostrar el valor actual del riesgo país (EMBI+ Argentina) con su variación diaria.
- **Datos:** Valor en puntos básicos, variación absoluta, variación porcentual, mini-gráfico sparkline de los últimos 30 días.
- **Prioridad:** Alta

#### RF-003: Resumen de Mercado — Mejores y Peores del Día
- **Descripción:** Mostrar dos rankings: los 5 activos con mayor suba y los 5 con mayor baja del día.
- **Segmentación:** El usuario debe poder alternar entre Acciones Argentinas y CEDEARs.
- **Datos por activo:** Ticker, precio actual (ARS), variación porcentual diaria, precio en USD (si aplica).
- **Prioridad:** Alta

#### RF-004: Índices de Referencia
- **Descripción:** Mostrar los principales índices: S&P Merval, S&P 500, Nasdaq, Dow Jones.
- **Datos:** Valor actual, variación porcentual diaria, mini-sparkline de 5 días.
- **Prioridad:** Media

#### RF-005: Estado del Mercado
- **Descripción:** Indicador visual que muestre si el mercado argentino está abierto o cerrado.
- **Lógica:** Lunes a viernes, 11:00-17:00 ART (excluyendo feriados). Mostrar countdown al próximo cierre/apertura.
- **Prioridad:** Baja

---

### 3.2 Módulo: Explorador de Activos (F2)

#### RF-010: Listado de Acciones Argentinas
- **Descripción:** Tabla interactiva con todas las acciones que cotizan en BYMA (Bolsas y Mercados Argentinos).
- **Columnas:** Ticker, Nombre empresa, Precio ARS, Variación % diaria, Precio USD (si tiene CEDEAR), Volumen, botón favorito.
- **Filtros:** Por índice (Merval, General, Panel), por sector, por variación (solo positivas, solo negativas).
- **Ordenamiento:** Por cualquier columna, ascendente/descendente.
- **Búsqueda:** Por ticker o nombre de empresa, con autocompletado.
- **Prioridad:** Alta

#### RF-011: Listado de CEDEARs
- **Descripción:** Tabla interactiva con todos los CEDEARs disponibles.
- **Columnas:** Ticker, Nombre empresa, Precio ARS, Variación % ARS, Precio subyacente USD, Variación % USD, Tipo de cambio implícito, botón favorito.
- **Filtros predefinidos:** "Las 7 Magníficas" (AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA), Por sector (Tech, Health, Energy, Finance), Solo ETFs, Solo cripto-related.
- **Prioridad:** Alta

#### RF-012: Listado de Bonos Soberanos
- **Descripción:** Tabla con bonos soberanos en dólares.
- **Columnas:** Ticker, Ley (ARG/NY), Precio ARS, Precio USD, TIR estimada, Duration, Próximo cupón, Variación %.
- **Agrupación:** Por ley (Argentina vs New York).
- **Prioridad:** Alta

#### RF-013: Listado de LECAPs / BONCAPs
- **Descripción:** Tabla con letras y bonos de capitalización del tesoro.
- **Columnas:** Ticker, Fecha vencimiento, Días restantes, TNA (Tasa Nominal Anual), TEA (Tasa Efectiva Anual), Precio, Variación.
- **Ordenamiento default:** Por fecha de vencimiento ascendente.
- **Prioridad:** Alta

#### RF-014: Listado de Obligaciones Negociables (ONs)
- **Descripción:** Tabla con ONs en dólares.
- **Columnas:** Ticker, Empresa emisora, Moneda, TIR estimada, Próximo cupón, Fecha vencimiento, Precio.
- **Prioridad:** Media

#### RF-015: Búsqueda Global de Activos
- **Descripción:** Barra de búsqueda global (estilo Command Palette / Spotlight) accesible con `Ctrl+K`.
- **Comportamiento:** Búsqueda fuzzy por ticker y nombre. Resultados agrupados por categoría (Acción, CEDEAR, Bono, LECAP, ON). Al seleccionar un resultado, navegar al detalle del activo.
- **Prioridad:** Alta

---

### 3.3 Módulo: Detalle de Activo (F3)

#### RF-020: Gráfico de Precio Histórico
- **Descripción:** Gráfico interactivo (línea o velas) del precio del activo a lo largo del tiempo.
- **Períodos seleccionables:** 1D, 5D, 1M, 3M, 6M, 1A, 5A, MAX.
- **Datos:** Precio de apertura, cierre, máximo, mínimo, volumen por período.
- **Interactividad:** Tooltip con datos al pasar el mouse, zoom, paneo.
- **Prioridad:** Alta

#### RF-021: Estadísticas del Activo
- **Descripción:** Panel lateral con métricas resumen del activo.
- **Datos:** Precio actual, Variación diaria ($ y %), Apertura, Máximo del día, Mínimo del día, Máximo 52 semanas, Mínimo 52 semanas, Volumen promedio (30d), Market Cap (si aplica).
- **Prioridad:** Alta

#### RF-022: Indicadores Técnicos Básicos
- **Descripción:** Overlays opcionales sobre el gráfico principal.
- **Indicadores:** Media Móvil Simple (SMA 20, 50, 200), Media Móvil Exponencial (EMA 12, 26), RSI (Relative Strength Index), MACD, Bandas de Bollinger.
- **Comportamiento:** Toggle individual para activar/desactivar cada indicador.
- **Prioridad:** Media

#### RF-023: Información del Instrumento
- **Descripción:** Datos descriptivos del activo.
- **Para acciones:** Nombre completo, sector, descripción de la empresa, ratios: P/E, P/B (si la API lo provee).
- **Para CEDEARs:** Acción subyacente, ratio de conversión, exchange original, tipo de cambio implícito.
- **Para bonos:** Ley aplicable, flujo de fondos (calendario de cupones), TIR, duration, moneda de pago.
- **Para LECAPs/BONCAPs:** Fecha emisión, fecha vencimiento, TNA, TEA al precio actual, monto en circulación.
- **Prioridad:** Media

#### RF-024: Activos Relacionados
- **Descripción:** Sección que muestre activos del mismo sector o tipo.
- **Para CEDEARs:** Mostrar otros CEDEARs del mismo sector.
- **Para acciones:** Mostrar el CEDEAR correspondiente si existe (y viceversa).
- **Prioridad:** Baja

---

### 3.4 Módulo: Watchlist (F4)

#### RF-030: Crear y Gestionar Watchlist
- **Descripción:** El usuario registrado puede agregar cualquier activo a su lista de favoritos haciendo clic en el ícono de estrella.
- **Operaciones:** Agregar activo, eliminar activo, ver lista completa.
- **Persistencia:** La watchlist se almacena en el servidor asociada al usuario.
- **Prioridad:** Alta

#### RF-031: Vista de Watchlist
- **Descripción:** Pantalla dedicada que muestre todos los activos favoritos del usuario en formato tabla.
- **Columnas:** Ticker, Nombre, Precio actual, Variación %, Precio USD (si aplica), Tipo de activo.
- **Actualización:** Los precios se actualizan en tiempo real.
- **Prioridad:** Alta

#### RF-032: Watchlist desde el Dashboard (Widget)
- **Descripción:** En el dashboard principal, mostrar un widget compacto con los primeros 5-10 activos de la watchlist.
- **Prioridad:** Media

---

### 3.5 Módulo: Portfolio Tracker (F5)

#### RF-040: Registrar Operación de Compra
- **Descripción:** El usuario puede registrar una compra de un activo financiero.
- **Datos requeridos:** Activo (ticker), cantidad, precio de compra por unidad, fecha de compra, moneda (ARS/USD), comisión (opcional).
- **Validaciones:** Ticker debe existir en el sistema. Cantidad > 0. Precio > 0. Fecha no puede ser futura.
- **Prioridad:** Alta

#### RF-041: Registrar Operación de Venta
- **Descripción:** El usuario puede registrar una venta parcial o total de una tenencia.
- **Datos requeridos:** Activo, cantidad a vender (≤ tenencia actual), precio de venta, fecha de venta, comisión (opcional).
- **Cálculo:** FIFO (First In, First Out) para determinar el costo base de la venta.
- **Prioridad:** Alta

#### RF-042: Vista de Tenencias Actuales
- **Descripción:** Tabla resumen de todas las posiciones abiertas del usuario.
- **Columnas:** Ticker, Cantidad, Precio promedio de compra, Precio actual de mercado, P&L No Realizado ($), P&L No Realizado (%), Peso en portfolio (%).
- **Totales:** Valor total del portfolio, P&L total no realizado, variación % total del portfolio.
- **Prioridad:** Alta

#### RF-043: Performance del Portfolio en el Tiempo
- **Descripción:** Gráfico que muestre la evolución del valor total del portfolio a lo largo del tiempo.
- **Datos:** Valor diario calculado mark-to-market con precios de cierre.
- **Períodos:** 1M, 3M, 6M, 1A, Desde inicio.
- **Benchmark opcional:** Superponer rendimiento vs S&P Merval, vs Dólar MEP.
- **Prioridad:** Media

#### RF-044: Historial de Operaciones
- **Descripción:** Tabla con todas las compras y ventas realizadas ordenadas cronológicamente.
- **Columnas:** Fecha, Tipo (Compra/Venta), Ticker, Cantidad, Precio, Total, P&L Realizado (solo ventas).
- **Filtros:** Por ticker, por tipo de operación, por rango de fechas.
- **Prioridad:** Media

#### RF-045: Distribución del Portfolio
- **Descripción:** Gráfico circular (donut chart) mostrando la composición del portfolio.
- **Segmentaciones:** Por activo individual, por tipo de instrumento (Acción, CEDEAR, Bono, LECAP), por moneda (ARS vs USD exposure), por sector.
- **Prioridad:** Media

---

### 3.6 Módulo: Sistema de Alertas (F6)

#### RF-050: Crear Alerta de Precio
- **Descripción:** El usuario puede definir una alerta que se dispare cuando el precio de un activo cruce un umbral.
- **Configuración:** Activo (ticker), condición (mayor que / menor que / cruza), valor umbral, canales de notificación.
- **Ejemplo:** "Notificarme por email y push cuando GGAL supere $8.000"
- **Prioridad:** Alta

#### RF-051: Crear Alerta de Variación Porcentual
- **Descripción:** Alerta que se dispara cuando un activo varía más de X% en un período dado.
- **Configuración:** Activo, porcentaje umbral, dirección (sube/baja/ambos), período (diario/semanal), canales.
- **Ejemplo:** "Notificarme cuando AAPL (CEDEAR) baje más de 5% en un día"
- **Prioridad:** Alta

#### RF-052: Crear Alerta de Dólar
- **Descripción:** Alerta específica para tipos de cambio.
- **Configuración:** Tipo de dólar (Oficial/Blue/MEP/CCL), condición, valor umbral, canales.
- **Ejemplo:** "Notificarme cuando el dólar MEP supere $1.500"
- **Prioridad:** Alta

#### RF-053: Crear Alerta de Riesgo País
- **Descripción:** Alerta para el indicador de riesgo país.
- **Configuración:** Condición (sube de / baja de), valor umbral en puntos, canales.
- **Ejemplo:** "Notificarme cuando el riesgo país baje de 500 puntos"
- **Prioridad:** Media

#### RF-054: Crear Alerta de Portfolio
- **Descripción:** Alerta basada en el rendimiento del portfolio propio.
- **Configuración:** Condición (portfolio sube/baja más de X% en un día).
- **Ejemplo:** "Notificarme si mi portfolio cae más de 3% en un día"
- **Prioridad:** Baja

#### RF-055: Gestión de Alertas
- **Descripción:** El usuario puede listar, editar, activar/desactivar y eliminar sus alertas.
- **Estados:** Activa, pausada, disparada (triggered), expirada.
- **Comportamiento post-disparo:** Configurable: una sola vez (se desactiva tras disparar) o recurrente (se rearma automáticamente).
- **Límite:** Máximo 20 alertas activas por usuario.
- **Prioridad:** Alta

---

### 3.7 Módulo: Centro de Notificaciones (F7)

#### RF-060: Inbox de Notificaciones In-App
- **Descripción:** Panel deslizable (drawer) accesible desde un ícono de campana en el header.
- **Contenido por notificación:** Ícono del tipo de alerta, título descriptivo, cuerpo con datos relevantes, timestamp ("hace 5 minutos"), estado leído/no leído.
- **Contador:** Badge numérico sobre el ícono con la cantidad de notificaciones no leídas.
- **Prioridad:** Alta

#### RF-061: Notificaciones en Tiempo Real
- **Descripción:** Las notificaciones aparecen instantáneamente sin necesidad de refrescar la página.
- **Mecanismo:** WebSocket (Socket.io o similar).
- **Visual:** Toast notification breve (5 segundos) cuando llega una nueva notificación.
- **Prioridad:** Alta

#### RF-062: Historial de Notificaciones
- **Descripción:** Página completa con historial paginado de todas las notificaciones.
- **Filtros:** Por tipo de alerta, por activo, por rango de fechas, solo no leídas.
- **Acciones:** Marcar como leída, marcar todas como leídas, eliminar.
- **Prioridad:** Media

#### RF-063: Notificaciones por Email
- **Descripción:** Enviar email con información detallada de la alerta disparada.
- **Template:** Subject con ticker + condición, body con precio actual, variación, link al activo en la plataforma.
- **Formato:** HTML responsivo con branding de NotiFinance.
- **Prioridad:** Alta

---

### 3.8 Módulo: Preferencias de Usuario (F8)

#### RF-070: Configuración de Canales de Notificación
- **Descripción:** El usuario elige por qué canales quiere recibir alertas.
- **Canales:** In-App (siempre activo), Email (toggle), Push Browser (toggle).
- **Prioridad:** Alta

#### RF-071: Frecuencia de Notificaciones
- **Descripción:** El usuario puede configurar la frecuencia máxima de alertas para evitar spam.
- **Opciones:** En tiempo real (cada alerta individual), Resumen horario, Resumen diario.
- **Prioridad:** Media

#### RF-072: Horario de Notificaciones
- **Descripción:** El usuario puede silenciar notificaciones fuera de ciertas horas.
- **Configuración:** Hora de inicio, hora de fin, días de la semana.
- **Prioridad:** Baja

---

### 3.9 Módulo: Autenticación y Usuarios (F9)

#### RF-080: Registro de Usuario
- **Descripción:** Registro con email y contraseña.
- **Campos:** Email (único), contraseña (mínimo 8 caracteres, al menos una mayúscula y un número), nombre o alias (display name).
- **Flujo:** Registro → Verificación por email (opcional en v1) → Acceso completo.
- **Prioridad:** Alta

#### RF-081: Login
- **Descripción:** Autenticación con email y contraseña.
- **Mecanismo:** JWT (Access Token + Refresh Token).
- **Seguridad:** Brute-force protection (máximo 5 intentos, luego lockout de 15 minutos).
- **Prioridad:** Alta

#### RF-082: Modo Demo para Recruiters
- **Descripción:** Al acceder a la plataforma sin registro, se muestra un botón "Probar Demo".
- **Comportamiento:** Crea una sesión temporal con datos de portfolio precargados, alertas de ejemplo activas, y watchlist con activos populares.
- **Datos de demo:** Portfolio diversificado (3 acciones, 3 CEDEARs, 2 bonos), 3 alertas configuradas y activas, watchlist con 10 activos.
- **Sin persistencia:** Los datos de demo no se guardan entre sesiones.
- **Prioridad:** Alta

---

### 3.10 Módulo: Datos de Mercado (Interno)

#### RF-090: Ingesta de Datos del Dólar
- **Descripción:** El sistema debe consumir APIs externas para obtener cotizaciones del dólar argentino.
- **Fuentes:** API pública de dólar (DolarApi.com, Bluelytics, o similar).
- **Frecuencia:** Cada 5 minutos.
- **Almacenamiento:** Caché en Redis (TTL 5 min) + persistencia en PostgreSQL (historial diario).
- **Prioridad:** Alta

#### RF-091: Ingesta de Datos de Acciones y CEDEARs
- **Descripción:** Obtener precios actuales e históricos de acciones argentinas y CEDEARs.
- **Fuentes:** IOL API, Alpha Vantage, Yahoo Finance, o APIs del BYMA.
- **Datos:** Precio apertura, cierre, máximo, mínimo, volumen, variación.
- **Frecuencia:** Cada 5 minutos (precios actuales), diaria al cierre (datos históricos).
- **Prioridad:** Alta

#### RF-092: Ingesta de Datos de Renta Fija
- **Descripción:** Obtener datos de bonos, LECAPs, BONCAPs y ONs.
- **Datos:** Precio, TIR, duration, próximo cupón, flujo de fondos.
- **Frecuencia:** Cada 15 minutos (precios), diaria (datos de referencia).
- **Prioridad:** Alta

#### RF-093: Ingesta de Riesgo País
- **Descripción:** Obtener el valor del EMBI+ Argentina.
- **Fuentes:** Ámbito Financiero API, scraping de fuentes públicas.
- **Frecuencia:** Cada 10 minutos.
- **Prioridad:** Alta

#### RF-094: Motor de Evaluación de Alertas
- **Descripción:** Cada vez que se actualicen los datos de mercado, el sistema debe evaluar todas las alertas activas de los usuarios para determinar si alguna condición se cumplió.
- **Proceso:** Dato nuevo ingresado → Publicar evento al message broker → Worker evalúa alertas matching → Si cumple condición → Emitir evento de notificación → Dispatcher envía por canales configurados.
- **Performance:** Debe evaluar hasta 10.000 alertas en menos de 5 segundos.
- **Prioridad:** Alta

---

## 4. Requisitos No Funcionales

### 4.1 Rendimiento

| ID | Requisito | Métrica |
|---|---|---|
| RNF-001 | Tiempo de carga inicial del dashboard | ≤ 2 segundos (LCP) |
| RNF-002 | Tiempo de respuesta de API REST | p95 ≤ 200ms para endpoints de lectura |
| RNF-003 | Latencia de notificaciones WebSocket | ≤ 1 segundo desde que el dato se actualiza hasta que el usuario lo ve |
| RNF-004 | Evaluación de alertas | Procesar batch de hasta 10.000 reglas en ≤ 5 segundos |
| RNF-005 | Renderizado de gráficos | Cargar gráfico con 1 año de datos diarios en ≤ 500ms |

### 4.2 Escalabilidad

| ID | Requisito |
|---|---|
| RNF-010 | Soportar hasta 1.000 usuarios concurrentes con WebSocket activo |
| RNF-011 | Soportar hasta 50.000 alertas activas totales |
| RNF-012 | Colas de mensajes deben ser escalables horizontalmente (múltiples consumers) |

### 4.3 Disponibilidad

| ID | Requisito |
|---|---|
| RNF-020 | Uptime objetivo: 99.5% (excluyendo mantenimiento programado) |
| RNF-021 | Degradación graceful: si una fuente de datos falla, mostrar datos en caché con timestamp |
| RNF-022 | Health checks activos para todos los servicios (DB, Redis, RabbitMQ, APIs externas) |

### 4.4 Seguridad

| ID | Requisito |
|---|---|
| RNF-030 | Autenticación vía JWT con tokens de acceso (15 min TTL) y refresh tokens (7 días) |
| RNF-031 | Contraseñas hasheadas con bcrypt (cost factor ≥ 10) |
| RNF-032 | HTTPS obligatorio en producción |
| RNF-033 | Rate limiting: máximo 100 requests/minuto por IP sin autenticación, 300 autenticado |
| RNF-034 | CORS configurado con whitelist de dominios permitidos |
| RNF-035 | Headers de seguridad HTTP (Helmet): CSP, X-Frame-Options, HSTS |
| RNF-036 | Validación estricta de inputs en todos los endpoints (whitelist de campos) |

### 4.5 Mantenibilidad

| ID | Requisito |
|---|---|
| RNF-040 | Cobertura de tests unitarios ≥ 80% en capas domain y application del backend |
| RNF-041 | Tests E2E para todos los flujos críticos (alertas, portfolio CRUD, autenticación) |
| RNF-042 | Documentación Swagger completa y actualizada para todas las APIs |
| RNF-043 | README con instrucciones de setup en ≤ 5 minutos (Docker) |
| RNF-044 | Arquitectura hexagonal con tests de arquitectura automatizados |

### 4.6 Usabilidad

| ID | Requisito |
|---|---|
| RNF-050 | Interfaz intuitiva: un nuevo usuario debe poder crear su primera alerta en ≤ 2 minutos |
| RNF-051 | Diseño responsive: todas las vistas funcionales en viewport ≥ 768px |
| RNF-052 | Tema visual: dark mode por defecto (estándar fintech), con toggle a light mode |
| RNF-053 | Feedback visual: loading states, empty states, error states para todas las vistas |
| RNF-054 | Accesibilidad: contraste WCAG AA, navegación por teclado en elementos principales |

### 4.7 Compatibilidad y Despliegue

| ID | Requisito |
|---|---|
| RNF-060 | Ejecutable localmente con un solo comando: `docker compose up` |
| RNF-061 | Desplegable en servicios gratuitos (Vercel/Render/Railway) |
| RNF-062 | Variables de entorno documentadas en `.env.example` |
| RNF-063 | Migraciones de base de datos automáticas al iniciar la aplicación |

### 4.8 Observabilidad

| ID | Requisito |
|---|---|
| RNF-070 | Logging estructurado (JSON) con correlation IDs en todas las operaciones |
| RNF-071 | Health endpoint `/health` con estado de todas las dependencias |
| RNF-072 | Métricas de los jobs de ingesta: tiempo de ejecución, registros procesados, errores |

---

## 5. Restricciones

| # | Restricción | Razón |
|---|---|---|
| C-001 | No se ejecutan operaciones de compra/venta reales | Fuera de scope: es tracker, no broker |
| C-002 | Los datos provienen de APIs públicas/gratuitas | Presupuesto $0 para data providers |
| C-003 | Los datos pueden tener delay de hasta 15 minutos vs. mercado real | Limitación de APIs gratuitas |
| C-004 | Máximo 20 alertas por usuario | Evitar abuso en el tier gratuito |
| C-005 | Histórico de precios limitado a lo que la API provea | No se genera data propia de mercado |

---

## 6. Supuestos

1. Las APIs financieras gratuitas seleccionadas mantendrán disponibilidad razonable durante el periodo de desarrollo y evaluación.
2. El volumen de usuarios será limitado (< 100 concurrentes) dado que es un proyecto de portfolio.
3. Los datos del mercado argentino están disponibles vía APIs públicas (dólar, acciones BYMA, bonos).
4. El usuario entiende que los datos mostrados pueden tener delay y no deben usarse para decisiones de inversión en tiempo real.

---

## 7. Criterios de Aceptación (por Feature)

### Dashboard (F1)
- [ ] Al cargar la página, se muestran las cotizaciones del dólar actualizadas
- [ ] Los valores muestran variación porcentual con color verde/rojo
- [ ] El riesgo país se muestra con sparkline de 30 días
- [ ] Los mejores/peores del día se actualizan correctamente

### Explorador (F2)
- [ ] Se listan todos los tipos de activos con sus datos
- [ ] Los filtros y ordenamientos funcionan correctamente
- [ ] La búsqueda global (`Ctrl+K`) retorna resultados relevantes
- [ ] Se puede agregar/quitar favoritos desde la tabla

### Detalle de Activo (F3)
- [ ] El gráfico carga datos históricos para todos los períodos
- [ ] Los indicadores técnicos se superponen correctamente
- [ ] Las estadísticas laterales coinciden con los datos del gráfico

### Watchlist (F4)
- [ ] Los activos se agregan y quitan correctamente
- [ ] Los precios se actualizan en la vista de watchlist
- [ ] La watchlist persiste entre sesiones

### Portfolio (F5)
- [ ] Se pueden registrar compras y ventas
- [ ] El P&L se calcula correctamente con precios actuales
- [ ] El gráfico de evolución refleja el historial de operaciones
- [ ] La distribución (donut) muestra los porcentajes correctos

### Alertas (F6)
- [ ] Se puede crear una alerta de precio y esta se dispara correctamente
- [ ] La notificación llega por los canales seleccionados
- [ ] Las alertas recurrentes se rearman tras dispararse
- [ ] Una alerta "una sola vez" se desactiva tras dispararse

### Modo Demo (RF-082)
- [ ] Un recruiter puede usar la plataforma completa sin registrarse
- [ ] Los datos de demo son realistas y están precargados
- [ ] Todas las features son visibles y funcionales en modo demo

---

## 8. Trazabilidad de Requisitos

| Módulo Backend | Requisitos que cubre |
|---|---|
| `market-data` (nuevo) | RF-090, RF-091, RF-092, RF-093 |
| `alert` (nuevo) | RF-050 a RF-055, RF-094 |
| `portfolio` (nuevo) | RF-040 a RF-045 |
| `watchlist` (nuevo) | RF-030 a RF-032 |
| `auth` (nuevo) | RF-080 a RF-082 |
| `notification` (existente, expandido) | RF-060 a RF-063 |
| `preferences` (existente, expandido) | RF-070 a RF-072 |
| `template` (existente, adaptado) | Todos (templates de alertas financieras) |
| `ingestion` (existente, adaptado) | RF-094 (ingesta de eventos de alerta) |

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-02-26 | Documento inicial completo |
