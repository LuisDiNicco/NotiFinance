---
applyTo: "**/*"
---
# Contexto global obligatorio (agnóstico)

Para cualquier tarea:

1. Leer `.github/project-context.md` si existe.
2. Si existe carpeta `docs/`, usarla como base primaria de requisitos y diseño.
3. Leer reglas de desarrollo del repositorio (`development_rules.md` o equivalente).
4. Analizar el código actual antes de implementar para evitar duplicación e inconsistencias.

Reglas:
- No inventar alcance fuera del pedido/documentación.
- Priorizar cambios pequeños, coherentes y verificables.
- Si hay desalineación entre docs y código, informar y proponer corrección mínima.
- Para trabajo por fases, aplicar ciclo iterativo: implementar -> build/test/lint -> auditar compliance -> corregir -> repetir hasta cierre o bloqueo justificado.
