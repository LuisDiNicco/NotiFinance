---
applyTo: "**/*.test.tsx"
---
# Reglas de testing frontend (UI)

- Mantener tests de UI determinísticos y sin red real.
- Reutilizar helpers/utilidades de testing existentes.
- Validar comportamiento visible, interacción de usuario, accesibilidad básica y contratos de props/eventos.
- Evitar snapshots masivos si ya hay aserciones explícitas de comportamiento.
