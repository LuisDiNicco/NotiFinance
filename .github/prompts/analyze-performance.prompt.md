---
mode: agent
description: Analiza un bottleneck de performance específico, identifica la causa raíz y propone soluciones con impacto estimado.
tools:
  - codebase
  - run_in_terminal
---

# Analizar y resolver bottleneck de performance

Analizar: **[ENDPOINT / SERVICIO / QUERY / COMPONENTE / DESCRIPCIÓN DEL PROBLEMA]**

## Contexto obligatorio a leer primero

1. `.github/instructions/performance.instructions.md` — reglas de performance del proyecto
2. `.github/development_rules.md §5,§9,§11` — paginación, caché, jobs
3. El código del endpoint/servicio a analizar y sus dependencias (repositorios, servicios externos)

## Proceso de análisis

### Paso 1 — Identificar el síntoma con precisión

- ¿Es latencia alta (tiempo de respuesta lento)?
- ¿Es throughput bajo (pocas requests por segundo)?
- ¿Es uso elevado de memoria?
- ¿Es carga alta de CPU?
- ¿Es un job que tarda demasiado?
- ¿Cuál es la métrica baseline actual y cuál es el target?

### Paso 2 — Análisis del query plan (DB)

Para endpoints con acceso a DB:
- Identificar queries ejecutadas (logs del ORM con `logging: true` en dev)
- Buscar patrones N+1: ¿se ejecutan queries dentro de loops?
- Verificar índices en columnas de `WHERE`, `ORDER BY`, `JOIN ON`
- ¿Se retornan columnas innecesarias? (SELECT * en lugar de proyección)
- ¿Hay queries sin paginación que retornan datasets completos?

### Paso 3 — Análisis de caché

- ¿El dato es frecuentemente leído y pocas veces modificado? → candidato para caché
- ¿El caché existente tiene TTL apropiado?
- ¿Hay cache stampede? (muchas requests simultáneas al mismo key expirado)
- ¿Las claves de caché son lo suficientemente específicas para no cachear datos incorrectos?

### Paso 4 — Análisis de dependencias externas

- ¿Hay llamadas HTTP a APIs externas sin timeout?
- ¿Se hacen llamadas secuenciales que podrían ser paralelas?
- ¿Hay autenticación que pide nuevo token en cada request?

### Paso 5 — Frontend (si aplica)

- ¿Bundle size del chunk de la ruta está dentro de budget?
- ¿Hay re-renders innecesarios? (componentes que re-renderizan sin cambio de props)
- ¿Hay imágenes sin optimizar o sin lazy loading?
- ¿Web Vitals: LCP, CLS, INP dentro de targets?

## Deliverable

Para cada hallazgo, proponer:

1. **Causa raíz** — descripción precisa de la ineficiencia
2. **Impacto estimado** — HIGH / MEDIUM / LOW (con justificación)
3. **Solución propuesta** — cambio de código específico y accionable
4. **Trade-offs** — complejidad agregada, consistencia potencialmente afectada, etc.

Implementar las soluciones de impacto HIGH que no introduzcan complejidad desproporcionada.

Después de implementar: ejecutar tests y benchmark para validar la mejora.
