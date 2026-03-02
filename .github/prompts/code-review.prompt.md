---
mode: agent
description: Realiza un code review estructurado y experto sobre el código indicado, cubriendo todas las dimensiones de calidad.
tools:
  - codebase
---

# Code Review estructurado

Realizar code review de: **[ARCHIVO(S) / PR / COMMIT / DESCRIPCIÓN]**

## Contexto obligatorio a leer primero

1. `.github/development_rules.md` — estándares de implementación del proyecto
2. `.github/instructions/security.instructions.md` — checklist de seguridad
3. `.github/instructions/performance.instructions.md` — checklist de performance
4. El código circundante para entender el contexto arquitectónico

## Dimensiones de revisión

### 🏗️ Arquitectura y diseño
- ¿Se respetan las capas? (domain sin imports de framework, application sin infra)
- ¿Hay lógica de negocio en controllers o adapters de entrada?
- ¿Se usan interfaces para comunicación entre capas?
- ¿Se introducen dependencias circulares?

### 🔒 Seguridad
- ¿Hay inputs sin validar que llegan a la DB, filesystem o comandos de shell?
- ¿Se exponen datos sensibles en logs o respuestas de error?
- ¿Los endpoints nuevos tienen guards de autenticación/autorización?
- ¿Hay secrets hardcodeados?

### ⚡ Performance
- ¿Hay queries N+1 o loops con queries a DB?
- ¿Las colecciones retornadas están paginadas?
- ¿Los valores en caché tienen TTL?
- ¿Las llamadas HTTP salientes tienen timeout?

### 🧪 Testing
- ¿El código nuevo tiene tests que cubran ruta feliz, errores y casos límite?
- ¿Los tests son determinísticos y sin dependencias de red?
- ¿La cobertura de los servicios afectados supera el 80%?

### 📖 Legibilidad y mantenibilidad
- ¿Los nombres de variables/funciones/clases son expresivos?
- ¿Hay comentarios explicando "qué" en lugar de "por qué"? (eliminar)
- ¿Hay duplicación de código que debería extraerse?
- ¿Los métodos y funciones siguen el principio de responsabilidad única?
- ¿Hay anti-patrones? (boolean params, magic numbers, mutable defaults)

### 📐 Convenciones del proyecto
- ¿Se sigue el naming convention del proyecto?
- ¿El código pasa `lint` y `typecheck` sin errores?
- ¿Los commits siguen Conventional Commits?

## Formato de salida

Para cada hallazgo, clasificar como:
- 🔴 **Bloqueante:** debe corregirse antes de merge (seguridad crítica, violación de arquitectura, bug)
- 🟡 **Recomendado:** mejora significativa, debería corregirse
- 🟢 **Opcional:** mejora menor o preferencia de estilo

Al final: resumen de estado — **APROBADO / APROBADO CON CAMBIOS / BLOQUEADO**.

Corregir automáticamente los hallazgos de tipo 🟡 y 🟢 que no contradigan documentación o reglas del proyecto.
