---
mode: agent
description: Genera un componente React/Next.js de nivel profesional con diseño premium, siguiendo las reglas de arte, accesibilidad y performance del proyecto.
tools:
  - codebase
  - create_file
  - run_in_terminal
---

# Crear componente frontend

Crear el componente: **[NOMBRE Y DESCRIPCIÓN DEL COMPONENTE]**

## Contexto obligatorio a leer primero

1. `.github/project-context.md` — framework, design system y librerías de UI
2. `.github/development_rules/07_frontend_best_practices.md` — reglas de arte, tipografía, motion design
3. `.github/instructions/frontend.instructions.md` — reglas de accesibilidad, performance, seguridad
4. Componentes existentes similares en `src/components/` para mantener consistencia de estilo
5. Design tokens / variables CSS / tema del proyecto

## Qué generar

### El componente

- TypeScript estricto: props tipadas con interfaz explícita, sin `any`
- Exportación nombrada, no default exports
- Usar componentes de la librería base del proyecto (shadcn/ui o equivalente) como base. No reinventar wheels.
- Props opcionales con defaults sensatos

### Accesibilidad (obligatorio)

- HTML semántico: `button` para acciones, `a` para navegación, `h1-h6` con jerarquía correcta
- Atributos ARIA donde sea necesario: `aria-label`, `aria-expanded`, `role`
- Navegación por teclado funcional: foco visible, orden lógico, `Tab`/`Enter`/`Escape` donde corresponda
- Contraste mínimo 4.5:1 para texto normal (WCAG AA)

### Diseño (anti "AI Default")

- Aplicar los 3 principios obligatorios de `07_frontend_best_practices.md`:
  - Geometría concéntrica: radio interno = radio externo - padding
  - Hairlines en lugar de bordes sólidos
  - Tipografía con escala modular, no tamaños arbitrarios
- Skeleton loader si el componente carga datos
- Estado vacío estético si muestra listas

### Animaciones

- Transiciones en hover/active/focus con `ease-out` o spring
- Prohibidas: `transition: all`, `transition: linear`
- Usar clases de Tailwind o CSS variables del tema, no valores hardcodeados

### Test del componente

- Test en `*.test.tsx` cubriendo: render correcto, estados (loading/error/vacío/con datos), interacciones clave
- Sin `getByTestId` si hay alternativa por role o label

## Criterios de aceptación

- Pasa `npm run lint` sin errores ni warnings
- Pasa los tests generados
- Responsive (mobile-first)
- Sin props de tipo `any`
- No introduce librería externa no declarada en `project-context.md`
