---
applyTo: "**/*"
---
# Contexto global obligatorio (agnóstico)

## Orden de lectura obligatorio antes de cualquier tarea

1. Leer `.github/project-context.md` — Identifica stack, comandos reales y scope del proyecto.
2. Si existe `docs/`, leer en orden: especificación funcional → técnica → plan de implementación → estado/progreso.
3. Leer `.github/development_rules.md` (y sub-carpeta `development_rules/` si existe) para reglas de implementación del proyecto.
4. Analizar el código existente relacionado con la tarea antes de escribir una sola línea.

## Reglas invariantes

- **No inventar alcance** fuera del pedido explícito ni de la documentación.
- **No duplicar código** ni introducir inconsistencias con el estilo del proyecto.
- Priorizar cambios pequeños, cohesivos y verificables sobre refactors masivos.
- Si hay desalineación entre docs y código, informar la diferencia y proponer la corrección mínima necesaria.
- Si se detecta deuda técnica fuera del alcance pedido, documentarla sin abordarla a menos que sea crítica.

## Flujo iterativo por fases (resumen)

Implementar → `build/test/lint` → Auditar compliance → Corregir → Repetir hasta verde o bloqueo justificado.
Ver flujo completo en `.github/copilot-instructions.md §3`.

## Eficiencia de contexto (resumen)

**Escalar el contexto leído al tamaño de la tarea.** No cargar todos los docs en cada pedido.
- Fix puntual → solo el archivo afectado y sus imports directos.
- Feature en módulo existente → project-context + módulo + sección relevante de docs/.
- Tests → leer docs/requisitos, **no** la implementación (evita sesgo).
- Las instrucciones `instructions/*.instructions.md` ya están en contexto. No releerlas.
- Usar búsqueda por término antes de leer archivos grandes completos.
- No releer archivos ya leídos en la misma conversación si no fueron modificados.

Ver mapa completo tarea→contexto en `.github/copilot-instructions.md §7`.

## Convenciones transversales

- Tipado estricto: prohibido `any`. Usar `unknown` + type guards cuando el payload es dinámico.
- Prohibido hardcodear secretos, tokens o PII en cualquier archivo del repositorio.
- Prohibido exponer datos sensibles (passwords, jwt tokens, PII) en logs.
- Todo código nuevo debe tener cobertura de test correspondiente.
- Respetar convenciones de naming del proyecto (`camelCase` variables/funciones, `PascalCase` clases/interfaces, `SCREAMING_SNAKE_CASE` constantes globales).
