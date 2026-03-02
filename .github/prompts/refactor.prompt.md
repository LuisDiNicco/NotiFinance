---
mode: agent
description: Refactoriza código existente para mejorar legibilidad, eliminar deuda técnica y alinear con los estándares del proyecto, sin cambiar el comportamiento observable.
tools:
  - codebase
  - run_in_terminal
---

# Refactorizar código

Refactorizar: **[ARCHIVO / MÓDULO / DESCRIPCIÓN DE LA DEUDA TÉCNICA]**

## Contrato fundamental de refactoring

> **El comportamiento observable del código NO puede cambiar.** Los tests existentes deben pasar antes y después del refactor. Si algún test falla después del refactor, es un bug introducido, no un refactor.

## Proceso obligatorio

### Paso 1 — Estado inicial verde
```bash
# Verificar que los tests pasan ANTES de empezar
npm run test -- --testPathPattern=<módulo>
```
Si fallan tests antes del refactor: documentarlo y no continuar hasta que estén claros (pueden ser bugs preexistentes, no del refactor).

### Paso 2 — Identificar objetivos de refactor

Analizar el código y clasificar:
- **Complejidad ciclomática alta:** funciones con muchos `if/else` anidados → extraer a methods/helpers
- **Duplicación (DRY):** código repetido que puede reemplazarse con una abstracción bien nombrada
- **Nombres poco expresivos:** variables como `data`, `result`, `temp` → renombrar con significado de dominio
- **God services/classes:** servicios con demasiadas responsabilidades → dividir con SRP
- **Anti-patrones:** boolean params, magic numbers, comentarios descriptivos en lugar de código expresivo
- **Violaciones de arquitectura:** imports incorrectos entre capas

### Paso 3 — Refactorizar en pasos atómicos

Cada paso debe ser un cambio único y verificable:
1. Renombrar → test
2. Extraer método → test
3. Mover a capa correcta → test

No hacer todos los cambios a la vez.

### Paso 4 — Estado final verde
```bash
npm run test -- --testPathPattern=<módulo>
npm run lint
npm run build
```
Todos deben estar en verde. Si alguno falla: diagnosticar y corregir antes de continuar.

## Reglas del refactor

- Sin cambios de comportamiento sin documentación explícita
- Sin agregar funcionalidad nueva durante el refactor (eso es un `feat`, no un `refactor`)
- Sin eliminar tests existentes para "hacer pasar el build"
- Commit tipo `refactor(<scope>): <descripción>`
