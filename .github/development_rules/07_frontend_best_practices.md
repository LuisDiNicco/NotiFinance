# Mejores Prácticas de Frontend

**Contexto:** Frontends web utilizando TypeScript y frameworks modernos (React, Vue, Angular o similares).
**Objetivo:** Construir interfaces de usuario mantenibles, accesibles y con alto rendimiento, con un enfoque estricto en la excelencia visual, diseño editorial y calidad "Top-Tier Brand" (estilo Apple, Stripe, Linear).

---

## Arquitectura y Organización

- Mantener una clara separación entre **componentes de UI**, **gestión de estado** y **acceso a datos**.
- Preferir carpetas basadas en funcionalidades (ej. `features/checkout/`) con pruebas y estilos ubicados junto al componente.
- Utilizar un sistema de diseño o una biblioteca de componentes compartidos para asegurar consistencia y facilitar la reutilización.
- **Priorizar Librerías de UI:** Queda estrictamente prohibido crear componentes interactivos estándar (botones, modales, menús, selects) desde cero. Se debe priorizar SIEMPRE el uso de la biblioteca de componentes del proyecto (ej. `shadcn/ui`, `Radix`, `Headless UI`) para garantizar accesibilidad (WAI-ARIA) y comportamiento probado. Crear componentes desde cero solo está permitido para visualizaciones de datos hiper-específicas o elementos gráficos únicos que la librería no pueda cubrir.

---

## Seguridad de Tipado y Flujo de Datos

- Habilitar configuraciones estrictas de TypeScript; evitar el uso de `any` y utilizar `unknown` con guardias de tipo (type guards) cuando sea necesario.
- Validar los datos externos en los límites de la aplicación (respuestas de API) y mapearlos a modelos específicos de la aplicación.
- Preferir el flujo de datos unidireccional y el uso explícito de props/eventos por sobre estados globales implícitos.

---

## Calidad de UI y Accesibilidad

- Seguir los principios básicos de WCAG: HTML semántico, etiquetas adecuadas, navegación por teclado y estados de foco visibles.
- Utilizar diseños responsivos que funcionen correctamente en los puntos de quiebre comunes (móvil, tablet, escritorio).
- Mantener los componentes pequeños y enfocados; evitar árboles de componentes profundamente anidados.

---

## Rendimiento

- Cargar de forma diferida (lazy-load) rutas o componentes pesados y dividir los paquetes (bundles) por ruta.
- Optimizar imágenes (tamaños responsivos, formatos modernos) y evitar cambios de diseño inesperados (layout shifts).
- Utilizar la memoización solo cuando el perfilado (profiling) demuestre un beneficio real.

---

## Seguridad

- Tratar toda entrada del usuario como no confiable; sanitizar donde sea necesario.
- Nunca almacenar secretos en el código frontend; usar tokens del lado del servidor cuando sea requerido.
- Proteger contra ataques XSS escapando el contenido dinámico y evitando el uso de constructos como `dangerouslySetInnerHTML` a menos que sea estrictamente necesario.

---

## Pruebas y Herramientas

- Cubrir los flujos críticos con pruebas de integración (ej. Cypress/Playwright).
- Agregar pruebas unitarias para componentes complejos y lógica de estado.
- Imponer el formato y linting de manera consistente (Prettier + ESLint).

---

## Dirección de Arte, UI/UX y Estética "Top-Tier" (Anti "AI Default")

- **Diseño Sensible al Contexto (Smart Styling):**
  - *Vistas Operativas/Técnicas:* Diseño ultra-limpio, enfocado en legibilidad, alta densidad de datos y reducción de carga cognitiva. Contraste funcional.
  - *Vistas Emocionales/Hero:* Diseño audaz y profesional. Uso de tipografías display masivas, colores vibrantes, composiciones asimétricas (Bento grids) y elementos gráficos de alto impacto.

- **Layouts, Tensión Visual y Navegación (Editorial & App-Like):**
  - **Asimetría Intencional:** Evitar particiones aburridas de 50/50. Crear tensión visual usando proporciones áureas o asimétricas (ej. 70/30) para dirigir el foco del usuario.
  - **Abandonar el Navbar Genérico:** Implementar **Bottom Navigation Bars** en móviles, y **Sidebars minimalistas colapsables** o Paletas de Comandos (`Cmd/Ctrl + K`) en escritorio.

- **Jerarquía y Tipografía como Imagen:**
  - Limitar el proyecto a un máximo de 2 familias tipográficas.
  - Utilizar una **escala tipográfica modular** (ej. ratio de 1.250). Los títulos H1/H2 deben ser masivos, con interletrado ajustado (`tracking-tighter`). Tratar la tipografía grande como un elemento gráfico (Type as Image), permitiendo recortes sutiles o superposiciones.
  - El texto de soporte debe usar un contraste drástico mediante opacidad (`text-muted-foreground`), no solo cambiando a color gris.

- **Materialidad, Geometría y Profundidad (Diseño Físico):**
  - **Geometría Concéntrica Obligatoria:** Si un contenedor tiene bordes redondeados, los elementos internos deben tener un radio menor para encajar visualmente perfecto (Fórmula: `Radio Interno = Radio Externo - Padding`).
  - **Hairlines en lugar de Bordes:** Evitar bordes sólidos (`border-gray-200`). Utilizar bordes de 1px con opacidad extremadamente baja (`border-white/10` o `border-black/5`) para simular reflejos de luz física.
  - **Textura y Ruido:** Eliminar la sensación de "plástico digital" aplicando texturas de ruido sutil (grain) a los fondos principales o gradientes.

- **Manejo de la Frustración y Físicas Naturales (Motion Design):**
  - Implementar *Skeleton Loaders* estructurales. Prohibidos los spinners genéricos a pantalla completa.
  - Diseñar *Empty States* estéticos con ilustraciones sutiles y CTAs claros. Nunca dejar pantallas en blanco con solo texto.
  - Animaciones obligatorias en estados (`:hover`, `:active`) usando físicas naturales/resortes (springs) o curvas `ease-out`/`ease-in`. Prohibido transiciones `linear`.

---

## Principios Académicos de Diseño Gráfico, UX y Accesibilidad

- **Leyes Universales de UX Obligatorias:**
  - **Ley de Hick (Carga Cognitiva):** A mayor cantidad de opciones, más tiempo tarda el usuario en decidir. Agrupar configuraciones secundarias bajo menús desplegables o botones de "Ver más".
  - **Ley de Fitts (Áreas de Interacción):** Los elementos interactivos (botones, enlaces) deben tener un tamaño físico táctil mínimo de `44x44px` (mobile) y estar ubicados en áreas de fácil alcance.
  - **Ley de Miller:** Agrupar la información (menús, tarjetas, listas de características) en bloques de no más de 5 a 7 elementos para no sobrecargar la memoria a corto plazo del usuario.

- **Micro-Tipografía y Alineación:**
  - **Longitud de Línea (Line Length):** Los párrafos de lectura nunca deben extenderse de lado a lado de la pantalla. Limitar el ancho de los bloques de texto a un máximo de 60-75 caracteres (usar clases como `max-w-prose` en Tailwind) para evitar la fatiga visual.
  - **Alineación Estricta:** Queda **estrictamente prohibido el uso de texto justificado** en la web (`text-justify`), ya que crea "ríos" de espacio en blanco ilegibles. Alinear el texto de lectura a la izquierda. Centrar el texto únicamente para encabezados cortos (1-3 líneas) o llamadas a la acción (CTAs).

- **Psicología y Semántica del Color:**
  - Los colores deben tener significado, no solo ser decorativos. Usar rojos/naranjas exclusivamente para acciones destructivas o errores; verdes para éxito/completado.
  - Respetar el contraste WCAG (mínimo 4.5:1 para texto normal).
  - Ajustar la saturación de la paleta según la temática de la app (ej. colores vibrantes y de alto contraste para energía/fitness, colores desaturados y pasteles para relajación/finanzas corporativas).

- **Ciencia del Modo Oscuro (Dark Mode):**
  - **Prohibido el Negro Absoluto:** Nunca utilizar `#000000` puro como fondo ni `#FFFFFF` puro para el texto en modo oscuro; esta combinación produce "halo effect" (astigmatismo) y fatiga visual severa. Utilizar grises extremadamente oscuros (ej. `#09090b` o `zinc-950`) para fondos y blancos ligeramente apagados (ej. `slate-200`) para textos.

- **Iconografía Estructural y Coherencia:**
  - Utilizar una única librería de iconos (ej. Lucide, Radix, Phosphor) para todo el proyecto.
  - Mantener una consistencia absoluta en el **peso del trazo** (`stroke-width`) y el **estilo** (no mezclar iconos rellenos / *solid* con iconos de línea / *outline* a menos que indique un estado de "activo/inactivo").
