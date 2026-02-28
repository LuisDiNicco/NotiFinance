# Arquitectura de Puertos

## Configuración de Puertos

Para evitar conflictos entre el frontend y backend, se ha establecido la siguiente configuración:

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Backend (NestJS)** | 3000 | http://localhost:3000 |
| **Frontend (Next.js)** | 3001 | http://localhost:3001 |
| **PostgreSQL** | 5432 | localhost:5432 |
| **RabbitMQ** | 5672 | localhost:5672 |
| **RabbitMQ Management** | 15672 | http://localhost:15672 |
| **Redis** | 6379 | localhost:6379 |

## ¿Por qué esta configuración?

- **Backend (Puerto 3000)**: Es el puerto estándar para APIs REST y es donde el frontend espera encontrar la API.
- **Frontend (Puerto 3001)**: Next.js usa puerto 3000 por defecto, pero lo cambiamos a 3001 para evitar conflictos con el backend.

## Iniciar los servicios

### Backend
```bash
npm run start:dev
```
Este comando automáticamente:
1. Limpia el puerto 3000 si está ocupado
2. Inicia Docker (PostgreSQL, RabbitMQ, Redis)
3. Inicia el servidor NestJS en el puerto 3000

### Frontend
```bash
cd notifinance-frontend
npm run dev
```
Este comando inicia Next.js en el puerto 3001.

## Solución de problemas

### Error: "Port 3000 is already in use"

Si el backend no puede iniciarse porque el puerto 3000 está ocupado, puedes:

**Opción 1: Ejecutar el script de limpieza manualmente**
```bash
npm run kill:port
```

**Opción 2: Ejecutar el script de PowerShell directamente**
```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/kill-port-3000.ps1
```

**Opción 3: Matar el proceso manualmente**
```powershell
# 1. Encontrar el proceso
netstat -ano | findstr :3000

# 2. Matar el proceso (reemplaza PID con el número del proceso)
taskkill /PID <PID> /F
```

### Frontend no se conecta al Backend

Verifica que:
1. El archivo `.env.local` existe en `notifinance-frontend/` con:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
   NEXT_PUBLIC_WS_BASE_URL=http://localhost:3000
   ```
2. El backend está corriendo en el puerto 3000
3. El frontend está corriendo en el puerto 3001

## Configuración de CORS

El backend está configurado para aceptar solicitudes del frontend en `http://localhost:3001`.

Si necesitas cambiar esto, edita `src/main.ts`:

```typescript
const corsOrigins = configService.get<string[]>('app.cors.origins', [
  'http://localhost:3001', // Puerto del frontend
]);
```
