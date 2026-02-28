---
applyTo: "**/*.{tsx,jsx}"
---
# Reglas frontend (plantilla)

- Respetar requisitos funcionales y restricciones de UX/UI documentadas.
- Mantener consistencia con la arquitectura del frontend existente (ruteo, estado, componentes, hooks, servicios).
- Evitar introducir flujos o componentes no solicitados.
- Priorizar accesibilidad, legibilidad, performance y reutilización.
- Mantener tipado estricto y contratos claros entre UI y capa de datos.

Nota de portabilidad:
- Este archivo aplica a componentes de interfaz (`tsx/jsx`).
- Si el proyecto frontend usa también archivos `.ts` para hooks/stores/servicios, crear una regla adicional con `applyTo` específico del frontend (por ejemplo `frontend/src/**/*.{ts,tsx}`).
