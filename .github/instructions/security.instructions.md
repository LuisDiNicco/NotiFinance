---
applyTo: "**/*.{ts,tsx,js,jsx,mjs,cjs}"
---
# Reglas de Seguridad (código fuente — agnóstico)

> Aplica a todos los archivos de código fuente (TS, JS, JSX, TSX).
> Las reglas de secrets/PII que aplican a **cualquier archivo** del repo (incluyendo configs, markdowns) están en `00-global.instructions.md`.
> Ver `development_rules.md §14` para reglas de seguridad backend detalladas con ejemplos del framework actual.

## Principios fundamentales (OWASP Top 10 aplicado)

- **A01 Broken Access Control:** Verificar autorización en CADA endpoint/acción. No asumir que el frontend valida. Implementar RBAC/ABAC con guardias a nivel de servicio, no solo de controlador.
- **A02 Cryptographic Failures:** Nunca almacenar passwords en texto plano. Usar hashing fuerte (bcrypt, argon2). Nunca exponer secretos, tokens o claves en logs, respuestas de error ni código fuente.
- **A03 Injection:** Usar ORMs o query builders con parámetros. NUNCA concatenar strings con input del usuario para construir queries SQL, comandos de shell o expresiones de evaluación dinámica.
- **A05 Security Misconfiguration:** Headers de seguridad activos (Helmet o equivalente). CORS con orígenes explícitos. No exponer stack traces completos al cliente en producción.
- **A06 Vulnerable Components:** No agregar dependencias sin revisar su estado de mantenimiento y vulnerabilidades conocidas. Ejecutar `npm audit` como parte del CI.
- **A07 Authentication Failures:** JWT con expiración explícita y corta. Refresh tokens en httpOnly cookies. Rate limiting en endpoints de auth.
- **A09 Security Logging Failures:** Loguear intentos de autenticación fallidos, accesos no autorizados y errores de validación. Nunca loguear el password ni el token completo.

## Reglas invariantes de código

- **Prohibido hardcodear** secretos, tokens, claves de API, connection strings o PII en cualquier archivo del repositorio (incluyendo tests).
- **Prohibido exponer** en logs o respuestas de error: passwords, JWT tokens completos, datos bancarios, datos de salud, email + identificador combinados.
- **Prohibido `eval()`** y construcción dinámica de código con input del usuario.
- **Prohibido `dangerouslySetInnerHTML`** (o equivalente en el framework) sin sanitización explícita y justificación.
- Variables de entorno: declarar en `.env.example` sin valores reales. El `.env` real nunca va al repositorio.

## Validación de inputs

- Validar en el **borde de entrada** (controller/endpoint): tipo, formato, longitud máxima, caracteres permitidos.
- Usar `whitelist: true` y `forbidNonWhitelisted: true` en el ValidationPipe global (o equivalente).
- Rechazar explícitamente campos no declarados en el DTO para prevenir Mass Assignment.
- Sanitizar strings de entrada que se renderizarán en UI para prevenir XSS.

## Autenticación y autorización

- Autenticación via JWT con guards en rutas protegidas.
- Role-based access via decoradores custom (`@Roles()`, `@Permissions()`).
- Refresh token rotativo: invalidar el anterior al emitir uno nuevo.
- Implementar rate limiting global y específico en endpoints de auth, registro y reset de password.

## Gestión de secretos

- NUNCA leer `process.env` directamente en servicios. Usar un módulo de configuración tipado.
- En CI/CD: secretos en el vault del proveedor (GitHub Secrets, etc.), nunca en archivos comiteados.
- Rotar secretos comprometidos inmediatamente y revocar sesiones activas.

## Checklist de seguridad antes de hacer merge

- [ ] Sin secretos hardcodeados nuevos (`git grep` o herramienta de secret scanning)
- [ ] Sin `any` nuevo que deshabilite validación de tipo
- [ ] Endpoints nuevos tienen guard de autenticación si corresponde
- [ ] Rate limiting presente en endpoints públicos nuevos
- [ ] Inputs validados y sanitizados en el borde
- [ ] Sin datos sensibles en logs nuevos
