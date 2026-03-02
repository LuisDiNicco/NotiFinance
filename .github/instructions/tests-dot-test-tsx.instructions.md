---
applyTo: "**/*.test.tsx"
---
# Reglas de testing frontend — componentes UI

> Ver `.github/project-context.md` para el framework de testing UI del proyecto (Vitest/Jest + Testing Library o equivalente).

## Principios generales

- Tests determinísticos: sin red real, sin APIs reales, sin timers reales no controlados.
- Reutilizar helpers, factories y wrapper providers existentes en el proyecto.
- Testear **comportamiento visible e interacción del usuario**, no detalles de implementación (no testear refs, state interno ni nombres de clases CSS).
- Evitar snapshots masivos. Si hay aserciones explícitas de comportamiento, el snapshot aporta poco valor.

## Qué testear

- Render correcto del componente con sus props: elementos clave visibles, textos, roles ARIA.
- Interacciones del usuario: clicks, inputs, submit de formularios — verificar el efecto observable resultante.
- Estados del componente: loading, error, vacío, con datos.
- Contratos de props: que props requeridas ausentes o malformadas generen comportamiento esperado.
- Accesibilidad básica: `getByRole`, `getByLabelText` sobre `getByTestId` donde sea posible.

## Mocking

- Mockear llamadas de API con interceptores (MSW) o mocks de módulo. Nunca usar la API real.
- Mockear módulos del router solo si afectan el comportamiento del componente bajo test.
- Proveer el contexto mínimo necesario (providers de tema, auth, i18n) mediante wrappers de test compartidos.

## Reglas de calidad

- Preferir queries de Testing Library en orden: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`.
- `waitFor` y `findBy*` para aserciones sobre comportamiento asíncrono. Nunca `setTimeout` en tests.
- Después de cada interacción asíncrona, esperar el efecto observable antes de hacer assertions.
- Un test falla por una sola causa: no combinar múltiples `act` complejos en un mismo `it`.
