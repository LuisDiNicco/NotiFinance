# NotiFinance — Arquitectura de Puertos

**Versión:** 2.0  
**Fecha:** 2026-02-28  

---

## Puertos de Servicios

| Servicio | Puerto | Protocolo | Notas |
|---|---|---|---|
| **Backend NestJS** | 3000 | HTTP + WS | API REST + Socket.io |
| **Frontend Next.js** | 3001 | HTTP | Dev server |
| **PostgreSQL** | 5432 | TCP | Base de datos principal |
| **Redis** | 6379 | TCP | Caché + pub/sub |
| **RabbitMQ** | 5672 | AMQP | Message broker |
| **RabbitMQ Management** | 15672 | HTTP | UI de administración |

## WebSocket Namespaces

| Namespace | Propósito | Auth requerida |
|---|---|---|
| `/notifications` | Alertas y notificaciones personales | JWT |
| `/market` | Datos de mercado en tiempo real | JWT |

## Endpoints Base

| Ruta | Descripción |
|---|---|
| `GET /api/v1/health` | Health check del backend |
| `GET /api/v1/health/providers` | 🆕 R2: Estado de fuentes de datos |
| `GET /api/v1/docs` | Swagger UI (solo desarrollo) |

## Docker Compose

- `docker-compose.yml` — Desarrollo local (PostgreSQL + Redis + RabbitMQ)
- `docker-compose.prod.yml` — Producción (con backend y frontend)

### Comandos

```bash
# Levantar infraestructura de desarrollo
docker compose up -d

# Levantar todo (producción)
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose logs -f

# Parar todo
docker compose down
```

## Scripts de Verificación

```bash
# Smoke test de endpoints
node scripts/endpoint-smoke.js

# Calidad de datos de mercado
node scripts/market-data-quality.js

# Calidad de catálogo de activos
node scripts/market-assets-quality.js

# Todo junto
npm run verify:backend:runtime
```
