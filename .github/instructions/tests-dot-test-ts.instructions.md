---
applyTo: "**/*.test.ts"
---
# Reglas de testing backend — unitarios e integración

> Ver `.github/development_rules/06_devops_git_testing.md` §18 para los estándares de cobertura y ubicación.

## Principios generales

- Cubrir el **comportamiento funcional** y los **escenarios de error** del módulo tocado, no la implementación interna.
- Mantener aislamiento de dependencias externas con mocks/fakes/stubs según el patrón del repositorio.
- Priorizar claridad de aserciones sobre volumen de casos. Un test fallido debe comunicar inmediatamente qué se rompió.
- Evitar introducir tests de funcionalidades no solicitadas ni tests de implementación ("white-box" destructivo).

## Tests basados en requisitos, no en implementación (regla crítica)

- Los tests se escriben desde la **especificación funcional** (`docs/`) o los **criterios de aceptación** del requisito, **nunca** leyendo la implementación primero para deducir qué testear. Eso sesga el test hacia los mismos errores que tiene el código.
- El input de un test es: *"dado este comportamiento esperado según los requisitos, ¿el sistema lo cumple?"*
- Si un test falla después de una implementación, el protocolo es:
  1. **Analizar primero si hay un bug en la implementación.** El test falla porque el comportamiento es incorrecto → corregir la implementación.
  2. **Solo si la implementación es correcta** y el requisito fue mal interpretado → ajustar el test Y documentar explícitamente en el commit por qué se ajustó (ej: `test: adjust expectation — implementation correct, spec was ambiguous`).
  3. **Nunca** ajustar un test silenciosamente para que pase sin analizar la discrepancia.
- Consecuencia: el agente **no debe leer el servicio para escribir los tests**. Debe leer los requisitos, escribir los tests, y luego ejecutarlos contra la implementación.

## Tests unitarios (`application/services`, `domain/entities`)

- Mockear todas las dependencias externas (repositorios, publishers, clientes HTTP, caché).
- Usar factories o builders para construir entidades de dominio de test: evitar repetición en `beforeEach`.
- Cubrir: ruta feliz, errores de dominio esperados, casos límite (null, empty, extreme values).
- **Cobertura basada en comportamientos, no en líneas:** el objetivo es cubrir todos los caminos de negocio relevantes, no alcanzar un porcentaje. El 80% de cobertura es el *suelo mínimo aceptable*, no el objetivo. Un test con `expect(result).toBeTruthy()` que infla coverage sin verificar nada concreto es peor que no tener test: da falsa seguridad. Prefiere menos tests con aserciones precisas sobre muchos tests vacíos.
- Si se alcanza el suelo del 80%: evaluar qué comportamientos quedan sin cubrir, no qué líneas faltan.
- Nomenclatura de describe/it: `describe('ClassName/methodName', () => { it('should [outcome] when [condition]')` }`.

## Tests de integración y API (Supertest)

- Testear el contrato HTTP completo: status codes, body shape, headers de seguridad.
- Usar una base de datos de test aislada o in-memory. Nunca la DB de desarrollo.
- Limpiar estado entre tests (`beforeEach` / `afterEach`) para garantizar determinismo.
- Verificar autenticación/autorización: que endpoints protegidos rechacen requests sin credenciales válidas.

## Tests de arquitectura

- Verificar que las reglas de dependencias entre capas se cumplan.
- **Herramienta preferida: `dependency-cruiser`** — activamente mantenida, altamente configurable, genera visualizaciones del grafo de dependencias. Configurar en `.dependency-cruiser.js` con las reglas de capas del proyecto.
- **Alternativa: `tsarch`** — más simple de configurar pero con mantenimiento esporádico. Usar si `dependency-cruiser` resulta excesivo para el proyecto.
- Un test roto acá indica una violación estructural que debe corregirse antes de hacer merge. Sin excepciones.

## Reglas de calidad de tests

- Tests determinísticos: el mismo test debe dar el mismo resultado 100% de las veces.
- Sin `console.log` ni dependencias de red real en unit tests.
- Sin `setTimeout` o delays arbitrarios. Usar fake timers cuando el tiempo es relevante.
- **Prohibido compartir instancias de mocks con estado entre archivos de test.** Una instancia compartida que acumula llamadas rompe el determinismo y hace que el orden de ejecución de los tests importe.
- **Permitido y recomendado: compartir mock factories** — funciones que crean un mock limpio cada vez que se llaman. Extraer factories a un directorio `test/factories/` o `test/helpers/` para eliminar duplicación sin sacrificar aislamiento.
  ```typescript
  // ✅ Factory compartida: cada test recibe una instancia limpia
  export const makeAlertRepositoryMock = (): jest.Mocked<IAlertRepository> => ({
    findById: jest.fn(),
    save: jest.fn(),
  });
  ```
- **Mutation testing (siguiente nivel):** una vez que la cobertura de comportamientos es sólida, considerar `Stryker.js` para verificar que los tests realmente detectan cambios en la lógica del código (mutation testing). Un test que no falla ante una mutación del código que testea no está verificando nada útil.
