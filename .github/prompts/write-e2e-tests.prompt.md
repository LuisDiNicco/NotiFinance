---
mode: agent
description: Genera tests E2E con Playwright siguiendo el Page Object Model, para un flujo de usuario del frontend. Lee project-context.md para los comandos y configuración de E2E.
tools:
  - codebase
  - create_file
  - run_in_terminal
---

# Escribir tests E2E con Playwright

Genera tests E2E para el flujo: **[NOMBRE DEL FLUJO / FUNCIONALIDAD]**

## Contexto obligatorio a leer primero

1. `.github/project-context.md` — comando de e2e y timeout configurado
2. `notifinance-frontend/playwright.config.ts` (o equivalente) — configuración de Playwright
3. Tests E2E existentes en `e2e/` para reutilizar Page Objects y fixtures existentes
4. La especificación funcional del flujo en `docs/`

## Estructura a generar

### Page Object (si no existe para la página)

```typescript
// e2e/pages/<NombrePagina>.page.ts
export class NombrePaginaPage {
  constructor(private readonly page: Page) {}

  // Locators — preferir getByRole, getByLabel, getByText
  readonly submitButton = () => this.page.getByRole('button', { name: 'Submit' });

  // Actions
  async fillForm(data: FormData) { ... }
  async submit() { ... }

  // Assertions
  async expectSuccessMessage() { ... }
}
```

### Spec file

```typescript
// e2e/<feature>.spec.ts
test.describe('<Nombre del flujo>', () => {
  test.beforeEach(async ({ page }) => {
    // Login / setup de estado inicial
  });

  test('should [resultado] when [condición]', async ({ page }) => {
    const featurePage = new FeaturePage(page);
    // Arrange — navegar, setup
    // Act — interacciones del usuario
    // Assert — verificaciones observables
  });
});
```

## Reglas obligatorias

- **Timeout explícito** en cada test: usar el configurado en `playwright.config.ts`. Nunca `waitForTimeout(ms)`.
- **Locators resilientes:** `getByRole` > `getByLabel` > `getByText` > `data-testid`. NUNCA selectores CSS/XPath frágiles.
- **Estado limpio:** cada test debe poder correr independientemente en cualquier orden.
- **Sin red real en mocks:** si el test requiere API, usar `page.route()` para interceptar o levantar el backend real.
- Screenshots y video en falla: ya configurados en `playwright.config.ts`, no duplicar.

## Después de generar

Ejecutar con timeout explícito:
```bash
cd notifinance-frontend && npx playwright test <archivo> --reporter=line --timeout=45000
```
Si hay timeout, diagnosticar el paso que falla y proponer fix. No dejar el test en estado indefinido.
