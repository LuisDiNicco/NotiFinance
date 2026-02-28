# Plantilla portable de `.github` para Copilot

Esta carpeta está diseñada para copiarse entre repositorios y usarla como base.

## Qué incluye

- `copilot-instructions.md`: reglas globales + flujo obligatorio por fases (implementación, validación, auditoría, code review, cierre).
- `project-context.md`: plantilla editable para declarar contexto del proyecto, rutas de docs y comandos reales.
- `development_rules.md` (opcional): reglas específicas del repositorio.
- `instructions/00-global.instructions.md`: reglas base aplicables a todo archivo.
- `instructions/backend.instructions.md`: guía backend reutilizable.
- `instructions/frontend.instructions.md`: guía frontend reutilizable.
- `instructions/tests*.instructions.md`: guías de testing reutilizables.
- `prompts/`: prompts reutilizables del equipo.
- `chatmodes/`: modos de chat personalizados.
- `skills/`: skills/capacidades reutilizables del agente.
- `workflows/`: automatizaciones CI/CD (GitHub Actions).
- `ISSUE_TEMPLATE/` y `DISCUSSION_TEMPLATE/`: plantillas de colaboración.

## Qué afecta directamente al agente

- Sí, directo: `copilot-instructions.md`, `instructions/*.instructions.md`.
- Depende del entorno: `prompts/`, `chatmodes/`, `skills/`.
- Indirecto (proceso/calidad): `workflows/`, `ISSUE_TEMPLATE/`, `DISCUSSION_TEMPLATE/`.

Carpetas vacías no deberían afectar comportamiento por sí solas; el impacto aparece cuando agregás archivos con formato reconocido.

## Cómo usarla en un proyecto nuevo

1. Copiar toda la carpeta `.github`.
2. Editar `project-context.md` con rutas reales de documentación y comandos (`build`, `test`, `lint`, `e2e`).
3. Revisar `applyTo` de archivos en `instructions/` para adaptarlos a la estructura del repo.
4. Si existe una guía técnica propia, actualizar `development_rules.md`.

## Recomendaciones

- Mantener una única fuente de verdad para requisitos y diseño (idealmente `docs/`).
- Evitar reglas duplicadas o contradictorias entre archivos.
- En E2E/Playwright usar siempre timeout explícito para evitar bloqueos.
