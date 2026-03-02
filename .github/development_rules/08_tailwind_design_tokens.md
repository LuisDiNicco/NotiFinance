# Estándares de Diseño y Tailwind CSS (Design Tokens)

**Contexto:** Configuración global de estilos, variables CSS y `tailwind.config.ts`.
**Objetivo:** Imponer un sistema de diseño rígido, escalable y con soporte nativo para Modo Oscuro, evitando valores "mágicos" o colores hardcodeados en los componentes.

---

## 1. Sistema de Colores y Modo Oscuro (Dark Mode)

- **Prohibido el uso de colores estáticos de Tailwind:** NUNCA utilizar clases como `bg-blue-500` o `text-gray-900` directamente en los componentes.
- **Variables CSS Semánticas:** Todo color debe referenciar a una variable CSS (`var(--nombre)`) definida en el archivo global de estilos (`global.css` o equivalente).
- **Esquema de Nomenclatura Estricto:** Utilizar una paleta semántica basada en la regla 60-30-10:
  - `background` y `foreground` (Estructura principal).
  - `primary` y `primary-foreground` (Acentos y CTAs).
  - `secondary` y `secondary-foreground` (Superficies menores).
  - `muted` y `muted-foreground` (Textos secundarios, bordes sutiles).
  - `accent`, `destructive`, `success`, `warning`.
- **Fondos en Modo Oscuro:** El fondo del modo oscuro NUNCA debe ser negro puro (`#000000`). Utilizar tonos profundos como `zinc-950` (`#09090b`) para evitar la fatiga visual severa.

---

## 2. Sombras, Profundidad y "Glassmorphism"

- **Sombras Multicapa (Smooth Shadows):** Las sombras por defecto de Tailwind suelen ser muy duras. Si se requiere modificar el tema, las sombras deben definirse utilizando múltiples capas de interpolación (ej. combinar 4 o 5 `box-shadow` sucesivos con baja opacidad) para lograr una caída de luz fotorealista.
- **Sombras de Color:** Para elementos interactivos primarios (como el botón principal), la sombra no debe ser negra/gris. Debe heredar el color del botón con una opacidad del 20-30% (ej. `shadow-primary/20`).
- **Desenfocado (Blur):** Utilizar `backdrop-blur-md` junto con fondos semitransparentes (`bg-background/60`) para modales, sidebars o cabeceras flotantes, imitando el cristal esmerilado nativo de los sistemas operativos modernos.

---

## 3. Escala Tipográfica y Fuentes

- **Variables de Fuente:** Definir las tipografías en el archivo CSS y extender Tailwind con variables como `font-sans` (para el cuerpo) y `font-display` (para encabezados impactantes).
- **Control de Interletrado (Tracking):** Los títulos masivos (`text-4xl` en adelante) DEBEN ir acompañados siempre de un tracking negativo (`tracking-tighter` o `tracking-tight`) para mantener el rigor editorial. Los textos en mayúsculas pequeñas (como *overline* o *badges*) DEBEN llevar tracking positivo (`tracking-widest`).
- **Interlineado (Leading):** Prohibido usar interlineados amplios en los títulos. Un `text-5xl` debe usar `leading-none` o `leading-tight`. El cuerpo de texto debe usar un interlineado relajado (`leading-relaxed` o `1.6`) para facilitar la lectura.

---

## 4. Radios de Borde (Border Radius) y Geometría

- **Variables de Radio:** Definir `--radius` en el CSS global. Los componentes deben usar clases derivadas como `rounded-lg` (igual a `var(--radius)`), `rounded-md` (radio - 2px) y `rounded-sm` (radio - 4px).
- **Consistencia Geométrica:** Nunca aplicar bordes redondeados directamente con píxeles arbitrarios (`rounded-[12px]`) en medio del código de un componente. Utilizar siempre la escala del sistema para asegurar la "geometría concéntrica".

---

## 5. Animaciones y Motion Framework

- **Extensión de Animaciones en Tailwind:** Configurar dentro de `tailwind.config.ts` animaciones clave de entrada y salida para no depender de librerías externas pesadas si no es necesario.
  - Ejemplos obligatorios: `accordion-down`, `accordion-up`, `fade-in`, `fade-out`, `slide-in-from-bottom`.
- **Físicas (Easings):** Sobrescribir o añadir transiciones con curvas bézier (Cubic Bezier) orientadas a interfaces fluidas. Ejemplo: evitar `ease-linear`, utilizar curvas expansivas (tipo resorte/spring) para interacciones táctiles.