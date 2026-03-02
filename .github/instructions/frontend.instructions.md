---
applyTo: "**/*.{tsx,jsx}"
---
# Reglas y Estándares de Frontend (agnóstico — ver `project-context.md` para el framework específico)

> Leer `.github/development_rules/07_frontend_best_practices.md` para las reglas detalladas de UI/UX, arte y accesibilidad.
> Leer `.github/project-context.md` para framework, design system y librerías del proyecto actual.

## Alcance

- Aplica a todos los componentes de interfaz gráfica e interacción (`tsx/jsx`).
- Los archivos `.ts` de frontend (hooks, stores, servicios) deben respetar las mismas reglas de consistencia.

## Reglas de implementación

- Respetar los requisitos funcionales y las restricciones de UX/UI documentadas para el proyecto.
- Mantener coherencia estricta con la arquitectura del frontend existente (sistemas de ruteo, manejo de estado, estructura de componentes, hooks personalizados y servicios).
- Evitar introducir flujos de usuario, pantallas o componentes que no hayan sido explícitamente solicitados.
- Priorizar la accesibilidad web (WCAG), la legibilidad del código, el rendimiento del renderizado y la creación de componentes altamente reutilizables.
- Mantener un tipado estricto en TypeScript y establecer contratos de datos inquebrantables entre la interfaz de usuario y la capa de consumo de datos.
- Prohibido reinventar la rueda: Priorizar SIEMPRE el uso y composición de componentes de la librería base del proyecto (ej. `shadcn/ui`) antes que construir componentes interactivos desde cero con Tailwind/CSS puro, salvo excepciones altamente justificadas por diseño.

## Seguridad de tipado y flujo de datos

- Prohibido `any`. Usar `unknown` con type guards cuando el payload es dinámico.
- Validar datos externos (respuestas de API) en los límites de la aplicación y mapearlos a modelos internos.
- Preferir flujo de datos unidireccional y uso explícito de props/eventos sobre estado global implícito.
- Nunca almacenar secretos en el código frontend. Usar tokens del lado del servidor.

## Calidad de UI y Accesibilidad

- HTML semántico, etiquetas adecuadas, navegación por teclado, estados de foco visibles.
- Layouts responsivos (mobile, tablet, desktop). Elementos interactivos: tamaño táctil mínimo 44×44px.
- Componentes pequeños y enfocados. Evitar árboles de componentes profundamente anidados.

## Performance

- Lazy-load de rutas y componentes pesados. Code splitting por ruta.
- Optimizar imágenes (tamaños responsivos, formatos modernos). Evitar layout shifts.
- Usar memoización solo cuando el profiling demuestre un beneficio real medible.

## Dirección de Arte y Motion Design Estricto (Anti "AI Default")

- **Diseño Sensible al Contexto:** Decisión dinámica entre diseño funcional/limpio vs. audaz/emocional según el contexto de la vista.
- Aplicar principios de diseño gráfico profesional (regla 60-30-10, Gestalt, jerarquía tipográfica extrema mediante contraste de pesos).
- Animaciones con físicas naturales (easing/springs). Prohibidas las transiciones `linear`.
- El diseño debe sentirse premium, moderno, con uso experto del espacio negativo (macro-whitespace) y profundidad (capas y sombras difusas).
- Skeleton loaders estructurales. Prohibidos spinners genéricos a pantalla completa.
- Empty states estéticos con ilustraciones sutiles y CTAs claros. Nunca pantallas en blanco con solo texto.

Ver `.github/development_rules/07_frontend_best_practices.md` para las reglas completas de: tipografía modular, geometría concéntrica, hairlines, modo oscuro, leyes de UX (Hick, Fitts, Miller), iconografía, micro-tipografía y psicología del color.
