---
mode: agent
description: Genera tests unitarios e de integración para un servicio o módulo backend existente, siguiendo las reglas de testing del proyecto.
tools:
  - codebase
  - create_file
  - run_in_terminal
---

# Escribir tests unitarios backend

Genera tests para: **[NOMBRE DEL SERVICIO / MÓDULO]**

## Contexto obligatorio a leer primero

1. El archivo del servicio que se va a testear
2. Las interfaces de repositorios que usa el servicio (para construir los mocks)
3. Los errores de dominio que puede lanzar el servicio
4. Tests existentes en `test/unit/` para mantener coherencia de estructura y helpers

## Tests unitarios requeridos

Para cada método público del servicio, cubrir:

### Ruta feliz (happy path)
- Input válido → output esperado
- Verificar que se llamaron los mocks con los argumentos correctos

### Errores de dominio
- Cada condición de error documentada en el servicio
- Verificar que el error correcto se lanza con el mensaje correcto

### Casos límite (edge cases)
- Colecciones vacías, valores null/undefined donde aplique
- Valores en el extremo de rangos válidos

## Estructura esperada

```typescript
describe('NombreServicio', () => {
  let service: NombreServicio;
  let repoMock: jest.Mocked<INombreRepository>;

  beforeEach(async () => {
    // Setup del módulo de test con mocks
  });

  describe('nombreMetodo', () => {
    it('should [resultado esperado] when [condición]', async () => {
      // Arrange — setup del mock
      // Act — llamada al método
      // Assert — verificaciones
    });
  });
});
```

## Reglas

- Mock de todas las dependencias externas (repo, publisher, cache, HTTP client)
- Sin dependencias de red, DB ni sistema de archivos reales
- Tests determinísticos: mismo resultado siempre
- Aserciones explícitas sobre valores, no solo "toBeTruthy()"
- Después de generar: ejecutar `npm run test -- --testPathPattern=<archivo>` y corregir hasta verde
