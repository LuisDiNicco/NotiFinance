# Instrucciones de repositorio para GitHub Copilot (plantilla agnóstica)

Estas instrucciones se aplican automáticamente a todo el repositorio y están diseñadas para poder copiarse a otros proyectos con mínimos cambios.

## 1) Fuentes de verdad y prioridad

Antes de implementar:

1. Leer `.github/project-context.md` (si existe) para entender stack, alcance y rutas de documentación.
2. Si existe carpeta `docs/`, revisar primero especificación funcional, luego técnica, luego plan de implementación, luego estado/progreso.
3. Revisar reglas de desarrollo del repositorio (por ejemplo `development_rules.md` o equivalente).
4. Recién después analizar el código existente y decidir la estrategia de implementación.

Precedencia ante conflictos:
- Pedido explícito del usuario > documentación del repositorio > código existente.
- Si hay conflicto entre documentos, priorizar el más específico para el tema.

## 2) Principios de implementación

- No duplicar código ni introducir soluciones inconsistentes con el estilo del proyecto.
- Adaptar funcionalidades nuevas a la arquitectura y patrones ya existentes.
- Mantener cambios pequeños, cohesivos y verificables.
- Evitar inventar alcance no solicitado.

## 3) Flujo obligatorio por fase (implementación + auditoría)

Para tareas asociadas a una fase o bloque funcional, seguir este ciclo:

### Paso A — Entender antes de codificar
- Leer documentación y reglas primero.
- Analizar cómo se relaciona la funcionalidad pedida con el código actual.
- Definir el enfoque de implementación sin romper consistencia arquitectónica.
- Comenzar a codificar solo cuando el análisis previo esté completo.

### Paso B — Gate técnico (build/test/lint)
- Ejecutar `build`, `test` y `lint` con comandos del proyecto.
- Corregir errores y warnings.
- Repetir hasta quedar en verde o hasta detectar un bloqueo real que requiera decisión del usuario.

### Paso C — Auditoría de compliance y deuda técnica
- Contrastar lo implementado contra: requisitos, diseño técnico, plan de implementación y reglas de desarrollo.
- Identificar desvíos y deuda técnica en una lista explícita.
- Planificar corrección, implementarla y volver al Paso B.
- No cerrar la fase con discrepancias abiertas, salvo bloqueo justificado y comunicado al usuario.

### Paso D — Actualizar estado de implementación
- Actualizar el archivo de progreso del proyecto (por ejemplo `docs/implementation-progress.md`) con:
	- snapshot breve de lo implementado,
	- fase alcanzada,
	- estado actual del proyecto.

### Paso E — Code review experto y corrección iterativa
- Revisar calidad en: legibilidad, mantenibilidad, seguridad, rendimiento, eficiencia de recursos, robustez y UX/UI (si aplica).
- Corregir automáticamente mejoras que no contradigan documentación/reglas.
- Si hay conflicto entre mejora propuesta y reglas/docs, explicar trade-offs y pedir decisión del usuario.
- Repetir review-corrección hasta aprobar o hasta bloqueo con decisión pendiente.

### Paso F — Validación final (loop corto)
- Repetir Pasos B, C y D como validación final de cierre.

### Paso G — Higiene de repo y release readiness
- Verificar `.gitignore` y eliminar archivos temporales/basura creados durante el trabajo.
- Verificar que no se expongan secretos (`.env`, tokens, claves hardcodeadas).
- Confirmar que el repositorio queda listo para push.

### Paso H — Commits y push (cuando esté permitido)
- Usar Conventional Commits en inglés.
- Si la fase es larga, hacer commits parciales en puntos estratégicos (aprox. cada 500 líneas modificadas).
- Hacer push al cierre de cada fase.
- Si el entorno, permisos o políticas del agente no permiten commit/push automático, informar el bloqueo y proponer comandos exactos para ejecutar.

## 4) Ejecución de E2E (Playwright) sin bloqueos

- Siempre ejecutar Playwright con timeout explícito y/o modo no interactivo.
- Nunca dejar comandos esperando indefinidamente.
- Si hay timeout, recopilar salida parcial, diagnosticar y continuar con un siguiente intento acotado.

## 5) Idioma de respuesta

- Responder en español salvo pedido explícito del usuario en otro idioma.
