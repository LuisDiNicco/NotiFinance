---
applyTo: "**/*"
---
# Reglas de Git y Control de Versiones (agnóstico)

> Ver `development_rules.md §17` y `project-context.md §5` para la política de commits y push del proyecto actual.

## Conventional Commits (obligatorio)

Formato: `<tipo>(<scope opcional>): <descripción en imperativo>`

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad visible para el usuario |
| `fix` | Corrección de bug |
| `refactor` | Cambio de código sin cambio de comportamiento ni corrección de bug |
| `test` | Agregar o corregir tests |
| `chore` | Tooling, dependencias, configuración, CI |
| `docs` | Solo documentación |
| `perf` | Mejora de performance medible |
| `style` | Formatting, sin cambio lógico (Prettier, lint) |
| `build` | Sistema de build o dependencias externas |
| `ci` | Cambios en archivos/scripts de CI/CD |

### Reglas de mensaje

- **Modo imperativo:** "add user endpoint", NO "added" ni "adding".
- **Minúsculas** en la descripción: `feat: add pagination to market data endpoint`.
- **Sin punto final** en la descripción corta.
- Descripción ≤ 72 caracteres. Si necesita más contexto, usar el cuerpo del commit (línea en blanco, luego párrafo).
- El scope es opcional pero recomendado en repos con múltiples módulos: `feat(auth):`, `fix(notification):`.

### Breaking changes

- Agregar `!` después del tipo: `feat(api)!: change pagination response schema`.
- O usar footer: `BREAKING CHANGE: description of what breaks and migration path`.

## Estrategia de branching

- Rama principal protegida (`main`/`master`). Nunca commitear directo.
- Feature branches: `feature/<descripción-corta>` o `feat/<scope>-<descripción>`.
- Fix branches: `fix/<descripción>` o `hotfix/<descripción>` para fixes urgentes.
- Release branches (si aplica): `release/<versión>`.

## Política de commits para el agente

- Commitear al cierre de cada fase (ver `copilot-instructions.md §3H`).
- En fases largas: commits parciales cada ~500 líneas modificadas para trazabilidad y rollback granular.
- Nunca commitear: archivos `.env`, secretos, artefactos de build (`dist/`, `coverage/`), archivos temporales.
- Si commit/push no es posible por permisos, informar el bloqueo y proponer los comandos exactos.

## Reglas de calidad del repositorio

- `.gitignore` actualizado antes de cada merge: verificar que no entren artefactos indeseados.
- Sin archivos de configuración de IDE o editor personal (`.vscode/settings.json` personal, `.idea/`).
- Sin `console.log` de debugging comiteados en código de producción.
- Verificar con `git diff --stat` antes de cada commit que solo están los archivos esperados.
