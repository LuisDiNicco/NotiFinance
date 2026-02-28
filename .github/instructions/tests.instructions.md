---
applyTo: "**/*spec.ts"
---
# Reglas de testing (plantilla)

- Cubrir comportamiento de negocio y casos límite del módulo afectado.
- Mantener tests enfocados, determinísticos y fáciles de mantener.
- Seguir el stack de test del repositorio (Jest/Vitest/Playwright o equivalente).
- Evitar agregar tests fuera de alcance.
- Si se ejecutan E2E (Playwright), usar timeout explícito y evitar corridas indefinidas.
