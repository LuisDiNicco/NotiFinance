# Instrucciones de repositorio para GitHub Copilot (plantilla agnóstica)

Estas instrucciones se aplican automáticamente a todo el repositorio y están diseñadas para poder copiarse a otros proyectos con mínimos cambios.

---

## 0) Diseño agnostico y portabilidad

Esta carpeta `.github` está diseñada como una **plantilla portable y agnóstica**. Puede copiarse entre proyectos con mínimos cambios. El agente debe operar en dos capas:

### Capa 1 — Reglas universales (este archivo + `instructions/`)
Principios de ingeniería que aplican a cualquier proyecto: arquitectura limpia, testing, seguridad, performance, convenciones de código, flujo de trabajo. No mencionan frameworks ni dependencias específicas.

### Capa 2 — Contexto específico del proyecto (`project-context.md` + `docs/`)
Todo lo particular del proyecto corriente: stack tecnológico elegido, comandos reales, módulos en scope, rutas de documentación. El agente lee esta capa **después** de cargar las reglas universales.

### Cómo personalizar esta plantilla para un proyecto nuevo
1. Editar `.github/project-context.md` con: stack, comandos (`build`, `test`, `lint`, `e2e`), módulos en scope y restricciones específicas.
2. Si existe `docs/`: agregar allí la especificación funcional, técnica y el plan de implementación. El agente los lee automáticamente cuando se los indica en `project-context.md`.
3. Opcionalmente, actualizar `.github/development_rules.md` si el proyecto requiere patrones de implementación distintos a los estándar (ej: ORM diferente, framework alternativo).
4. No tocar los archivos de `instructions/` salvo que se quiera cambiar el comportamiento agnóstico base.

### Regla de prioridad de personalización
`project-context.md` > `docs/` > `development_rules.md` > `instructions/` (base universal)

---

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

---

## 6) Referencias de instrucciones especializadas

El agente carga automáticamente los archivos `instructions/*.instructions.md` según el patrón `applyTo` de cada archivo. Resumen de cobertura:

| Archivo instrucción | Aplica a | Contenido |
|---|---|---|
| `00-global.instructions.md` | `**/*` | Contexto general, lectura de docs |
| `backend.instructions.md` | `src/**/*.ts` | Arquitectura, patrones, capas |
| `frontend.instructions.md` | `**/*.{tsx,jsx}` | UI, accesibilidad, diseño |
| `tests-dot-test-ts.instructions.md` | `**/*.test.ts` | Tests unitarios/integración |
| `tests-dot-test-tsx.instructions.md` | `**/*.test.tsx` | Tests UI |
| `tests.instructions.md` | `**/*spec.ts` | Tests E2E/spec |
| `security.instructions.md` | `**/*.{ts,tsx,js,jsx,mjs,cjs}` | Seguridad de código fuente |
| `performance.instructions.md` | `**/*` | Performance transversal |
| `devops.instructions.md` | `Dockerfile,docker-compose*,.github/workflows/**` | CI/CD, contenedores |
| `git.instructions.md` | `**/*` | Convenciones de versión y commits |
| `api-design.instructions.md` | `src/**/*.ts` | Diseño REST, paginación, errores |
| `observability.instructions.md` | `src/**/*.ts` | Logging, trazabilidad, health |

Para prompts reutilizables ver `.github/prompts/`. Para modos de chat especializados ver `.github/chatmodes/`.

---

## 7) Eficiencia de contexto — lectura mínima necesaria

El agente debe escalar el contexto que consume al tamaño y tipo de la tarea. Cargar todo en cada pedido es la causa principal de consumo excesivo de tokens sin mejora en la calidad de la respuesta.

### Principio base: lectura on-demand, no upfront

No pre-leer todos los documentos antes de cada tarea. Leer solo lo que la tarea requiere, en el orden en que se necesita.

### Mapa tarea → contexto mínimo necesario

| Tipo de tarea | Qué leer | Qué NO leer |
|---|---|---|
| Fix puntual / bug small | Solo el archivo afectado + sus imports directos | docs/, architecture, development_rules completo |
| Feature en módulo existente | project-context + módulo afectado + sección relevante de docs/ | Otros módulos no relacionados |
| Módulo nuevo desde cero | project-context + architecture.md + docs/ requisitos + development_rules/01 | Los demás development_rules hasta que sean necesarios |
| Escribir tests | docs/ (requisitos del módulo) + interfaces del módulo | La implementación del servicio (sesga el test) |
| Code review | El PR completo + development_rules relevante + instructions/security + instructions/performance | docs/ completos, architecture |
| Decisión de arquitectura | architecture.md + development_rules/01 + project-context | Archivos de implementación individual |
| Audit de seguridad | security.instructions + los archivos específicos bajo auditoría | Otros módulos no relacionados |
| Análisis de performance | performance.instructions + el endpoint/servicio específico | Resto del codebase |

### Reglas de lectura eficiente

1. **Búsqueda antes que lectura completa.** Usar búsqueda por término o patrón para encontrar la sección relevante de un archivo grande, en lugar de leerlo completo. Solo leer el rango de líneas que contiene la información necesaria.

2. **No releer lo ya leído en la misma conversación.** Si un archivo fue leído en un turno anterior y el usuario no lo modificó, su contenido sigue válido. No volver a cargarlo.

3. **Las instrucciones ya están en contexto.** Los archivos `instructions/*.instructions.md` son inyectados automáticamente por el sistema. No leerlos manualmente — ya están disponibles.

4. **`development_rules/` es granular por diseño.** Leer solo el sub-archivo relevante para la tarea actual, no los 7 archivos completos. Ejemplo: para una decisión de tipado, leer solo `02_typing_dtos_patterns.md`.

5. **Leer la primera sección antes de decidir si leer más.** Para archivos desconocidos, leer las primeras 30-50 líneas para entender la estructura y decidir si el resto es necesario para la tarea actual.

6. **Un módulo relacionado, no todos los módulos.** Para entender un patrón o convención, leer **un** módulo existente similar como referencia, no todos.

7. **`docs/implementation-progress.md` solo cuando la tarea lo requiere.** Útil para entender qué está completo y qué no, pero innecesario para un bug fix en un módulo terminado.
