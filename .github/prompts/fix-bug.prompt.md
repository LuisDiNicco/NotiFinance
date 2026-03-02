---
mode: agent
description: Diagnostica y corrige un bug de forma sistemática, incluyendo test de regresión.
tools:
  - codebase
  - run_in_terminal
  - create_file
---

# Diagnosticar y corregir bug

Bug a resolver: **[DESCRIPCIÓN DEL BUG / SÍNTOMA / MENSAJE DE ERROR]**

## Proceso de diagnóstico

### Paso 1 — Reproducir
1. Identificar exactamente los pasos para reproducir el comportamiento incorrecto.
2. Ejecutar el test fallido (si existe) o añadir logs temporales para observar el estado.
3. Registrar: ¿qué comportamiento se observa? ¿Qué comportamiento se espera?

### Paso 2 — Localizar la causa raíz
1. Leer el stack trace completo desde la causa raíz, no desde la primera línea.
2. Trazar el flujo: entrada → validación → servicio → repositorio → respuesta.
3. Identificar en qué capa y en qué condición específica falla el invariante.
4. Preguntar: ¿el bug está en el dominio, en la aplicación, en la infraestructura o en el contrato de la API?

### Paso 3 — Proponer la corrección mínima

- **Mínima:** solo cambiar lo necesario para corregir la causa raíz. No aprovechar para refactors no relacionados.
- Si la corrección toca lógica de negocio: verificar si el dominio tiene el invariante correcto.
- Si la corrección toca validación: verificar que el DTO rechaza el input incorrecto en el borde.
- Si la corrección toca la DB: verificar que no se rompen otros flujos que usen el mismo método/query.

### Paso 4 — Test de regresión

**Obligatorio:** agregar o modificar un test que:
1. Reproduzca la condición exacta del bug (el test debe FALLAR antes del fix)
2. Verifica el comportamiento correcto (el test debe PASAR después del fix)

### Paso 5 — Verificación

```bash
# Ejecutar el test de regresión
npm run test -- --testPathPattern=<archivo>

# Ejecutar el suite completo del módulo afectado
npm run test -- --testPathPattern=<módulo>

# Lint y build
npm run lint && npm run build
```

Corregir cualquier error secundario que aparezca. Solo cerrar el bug cuando todos los pasos estén en verde.

## Deliverable

- Fix implementado con causa raíz identificada
- Test de regresión añadido
- Todos los tests del módulo en verde
- Commit tipo `fix(<scope>): <descripción>` con mensaje que explique qué se corrigió y por qué
