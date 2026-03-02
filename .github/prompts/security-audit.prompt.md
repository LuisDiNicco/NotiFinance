---
mode: agent
description: Auditoría de seguridad estructurada sobre un módulo, endpoint o flujo específico, usando OWASP como referencia.
tools:
  - codebase
---

# Auditoría de seguridad

Auditar: **[MÓDULO / ENDPOINT / FLUJO / ARCHIVO]**

## Contexto obligatorio a leer primero

1. `.github/instructions/security.instructions.md` — reglas de seguridad del proyecto
2. `.github/development_rules.md §14` — configuración de seguridad del framework
3. El código del módulo a auditar y sus dependencias inmediatas

## Checklist de auditoría

### A01 — Control de Acceso
- [ ] ¿Cada endpoint verifica autenticación?
- [ ] ¿Cada endpoint verifica autorización específica (roles/permisos)?
- [ ] ¿Se valida que el usuario solo accede a sus propios recursos?
- [ ] ¿Las rutas administrativas están protegidas con roles específicos?

### A02 — Fallos Criptográficos
- [ ] ¿Hay datos sensibles almacenados en texto plano en DB o caché?
- [ ] ¿Hay secretos, tokens o claves en el código fuente?
- [ ] ¿Los tokens tienen expiración corta y adecuada?
- [ ] ¿Los refresh tokens están en httpOnly cookies (no localStorage)?

### A03 — Inyección
- [ ] ¿Hay concatenación de strings con input de usuario en queries SQL?
- [ ] ¿Se usa el ORM o query builder con parámetros correctamente?
- [ ] ¿Hay uso de `eval()` o ejecución dinámica de código con input externo?
- [ ] ¿Los comandos de shell (si aplica) usan shell escaping?

### A05 — Mala Configuración de Seguridad
- [ ] ¿CORS configurado con orígenes explícitos (no `*`)?
- [ ] ¿Headers de seguridad activos (Helmet o equivalente)?
- [ ] ¿Stack traces NO expuestos en respuestas de error de producción?
- [ ] ¿Rate limiting en endpoints público y de auth?

### A07 — Fallos de Autenticación
- [ ] ¿Rate limiting en login/registro/reset-password?
- [ ] ¿Lockout o backoff tras intentos fallidos?
- [ ] ¿El mensaje de error de auth no revela si el usuario existe o no?

### A09 — Logging y Monitoreo
- [ ] ¿Se loguean intentos de auth fallidos y accesos no autorizados?
- [ ] ¿Los logs NO contienen passwords, tokens completos ni PII?
- [ ] ¿Hay correlationId trazable en los logs de seguridad?

### Validación de inputs
- [ ] ¿Los DTOs usan `whitelist: true` y `forbidNonWhitelisted: true`?
- [ ] ¿Los tipos, formatos y longitudes máximas están validados?
- [ ] ¿El `Content-Type` de request se valida donde es crítico?

## Formato de salida

Para cada hallazgo:
- **Severidad:** CRÍTICA / ALTA / MEDIA / BAJA / INFORMATIVO
- **Descripción:** qué vulnerabilidad existe y dónde
- **Evidencia:** línea(s) de código específica(s)
- **Recomendación:** cómo corregirlo

Al final: **ESTADO GENERAL** — SEGURO / OBSERVACIONES MENORES / VULNERABILIDADES A CORREGIR.

Corregir automáticamente vulnerabilidades de severidad ALTA y CRÍTICA.
