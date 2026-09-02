# Decision ledger — branch-main

> Append-only ledger of every writer-agent session that touches this task. Each `## Session N` block is one session. Earlier blocks are never edited; later blocks supersede earlier ones. See `.claude/change-log/README.md`.

---

## Session 1 — web-feature on `site` (started 2026-09-02T21:40:00Z)

```yaml
agent: web-feature
stack: site
session_started_utc: 2026-09-02T21:40:00Z
session_ended_utc: 2026-09-02T22:21:56Z
final_status: completed
handoff_slug: border-radius-imagenes
files_written:
  - src/styles/tokens.css
  - src/styles/multiaviso.css
  - src/components/HomeHero.astro
  - src/components/PhotoHero.astro
  - src/pages/nosotros.astro
  - documentation/DESIGN.md
```

### 1. Initial approved PLAN — 2026-09-02T22:00:00Z

**Pre-approval iterations:** una — el usuario/coordinador pidió proceder con el PLAN original pero respondió explícitamente las dos preguntas abiertas que el PLAN dejaba sin resolver antes de decir "proceed" (ver más abajo). No hubo rechazo del PLAN en sí, sí dos decisiones puntuales requeridas antes de poder implementar.

**Tarea:** introducir un radio de borde de 8px a nivel de sistema (`--radius-md`) sobre todas las superficies de imagen del sitio (catálogo, carrusel del home, detalle de vehículo, heroes, foto de `/nosotros`), con enmienda de `documentation/DESIGN.md` registrando el cambio de sistema. Decisiones ya tomadas por el usuario antes de esta sesión: alcance = cambio de sistema (no excepción del catálogo), valor = 8px (el más sutil de tres ofrecidos), detalle de vehículo = foto principal Y miniaturas.

**PLAN presentado (verbatim):**

a) Archivos a crear/modificar:
1. `src/styles/tokens.css` (líneas ~98-101) — agregar `--radius-md: 8px` entre `--radius-sm` y `--radius-full`; actualizar el comentario de `--radius-none` para sacarle "imágenes" y "tiles".
2. `src/styles/multiaviso.css` (REVIEW REQUIRED, solo verificable con `npm run deploy`):
   - L301 `.item`, L329 `.item-image`, L338 `.item-image a`, L422 `.carousel-item` → `var(--radius-none)` → `var(--radius-md)`.
   - Nuevas reglas en `.CarouselWrapper .carousel-item .item-image` y `...item-image a` (hoy sin radio) → `border-radius: var(--radius-md)`.
   - Nueva sección para `#MediaContainer` (foto principal) y `.thumbs-container` (miniaturas) del detalle — selectores de mejor esfuerzo, no verificados contra DOM real.
3. `src/components/AccessTiles.astro` — `.tile` → agregar `border-radius: var(--radius-md)` (conflicto marcado en el punto (ii) de abajo, resuelto en contra en la respuesta del coordinador).
4. `src/components/HomeHero.astro` — `.hero` → `border-radius: var(--radius-md)`.
5. `src/components/PhotoHero.astro` — `.hero` → `border-radius: var(--radius-md)`.
6. `src/pages/nosotros.astro` — `.sobre__media` → `border-radius: var(--radius-md)` (superficie encontrada por este agente, no listada por el triage).
7. `documentation/DESIGN.md` — enmienda de L29, L38 (sin borrar el original), escala L180-186, diagrama L253.
8. `.claude/change-log/branch-main.md` (ledger — la rama real es `main`, no matchea `^[A-Z][A-Z0-9]+-\d+$`, así que el nombre correcto por regla es `branch-main.md`, NO el `NOTASK.md` preexistente).

b) Interfaces/contratos: ninguno — CSS puro + un token + doc. Sin props de componente nuevas.
c) Server/client: no aplica (Astro sin React).
d) Comandos: `npm run check`, `npm run build` (sin `lint`/`unit_test` configurados). `npm run deploy` como único entorno de verificación visual del catálogo/detalle — no se corre en esta sesión salvo indicación explícita.
e) Contratos producidos: n/a. f) Contratos consumidos: n/a.

**(i) `#MediaContainer` — selectores sin verificar.** Nadie capturó nunca el DOM real de la foto principal/miniaturas del detalle (grep sobre `NOTASK.md` sin resultados, `multiaviso.css` solo tiene `.thumbs-container .swiper-button-prev/next`). No se puede conseguir ese HTML fuera de producción porque el plugin lo inyecta client-side. Pregunta abierta: ¿procedo con selectores de mejor esfuerzo (`#MediaContainer .swiper-slide`, `.thumbs-container .swiper-slide`) marcados como no verificados, o bloqueo hasta poder inspeccionar el DOM real?

**(ii) `AccessTiles` — tensión con el patrón "sin gap".** Los 3 tiles están pegados borde a borde sin gap (separación por borde de 1px, documentado en el propio componente). Redondear las 4 esquinas de cada tile deja esquinas enfrentadas sin gap real en cada divisor, revelando el fondo como un rombo. Pregunta abierta: ¿redondeo las 4 esquinas igual (default propuesto, consistencia de sistema) o excluyo esta superficie?

**g) Alternativa más fuerte considerada:** aplicar el radio como clase utilitaria en cada `<img>`/`<Image>` de cada componente en vez de un token de sistema + selectores por hoja de estilos — descartada porque exige tocar el markup de cada componente individualmente y rompe el patrón de centralizar decisiones de escala en `tokens.css`.

**h) Supuesto que carga el peso:** que un solo valor de 8px puede aplicarse parejo sobre superficies de tamaño muy distinto (hero a viewport completo, tile de cientos de px, card de catálogo, miniatura chica) sin necesidad de escalar el radio por contenedor.

**i) Observación que falsificaría el enfoque:** si al desplegar el detalle no muestra ningún cambio porque los selectores de `#MediaContainer`/`.thumbs-container` no matchean el DOM real, o si `AccessTiles` muestra un rombo de fondo visible en cada divisor entre tiles — cualquiera de las dos invalida "aplicar sin excepciones a todas las superficies listadas".

**Respuesta del coordinador a (i) y (ii), y token de aprobación:**

> "Plan aprobado. Proceed con estas dos respuestas... **1. (ii) AccessTiles: EXCLUIDO.** ... no apliques `--radius-md` a `.tile`... Consecuencia a registrar, no a discutir... anotá `AccessTiles` como excepción explícita del sistema de radio, con la razón... Lo mismo en el ledger. **2. (i) `#MediaContainer`: adelante con los selectores no verificados.** ... Escribí los selectores de mejor esfuerzo... con el `overflow: hidden` defensivo, y dejá el comentario NO VERIFICADO — confirmar contra DOM real en bielcar.vercel.app bien visible... El resto del plan queda tal cual... IMPLEMENTÁ y después VERIFICÁ... NO corras `npm run deploy`."

Con esto: **(ii) resuelto en contra de mi default propuesto** — `AccessTiles` queda excluida, radio 0, documentada como excepción explícita en `tokens.css` y en `DESIGN.md`. **(i) resuelto a favor del default propuesto** — selectores de mejor esfuerzo con comentario "NO VERIFICADO" visible. Deploy explícitamente fuera de alcance de esta sesión.

### 2. Implementation adjustment — n/a

No hubo correcciones fuera de plan durante la implementación: los 8 archivos se tocaron tal como estaba aprobado, con la única modificación de alcance ya cubierta arriba (exclusión de `AccessTiles`, decidida ANTES de escribir código, no descubierta durante la implementación).

### 3. Verification — 2026-09-02T22:21:56Z

- **`npm run check`** (`astro check`) → **0 errors, 0 warnings, 1 hint** sobre 36 archivos. El único hint (`src/data/site.ts:14`, `'local2' is declared but its value is never read`) es preexistente y no relacionado con esta sesión — no se tocó `site.ts`.
- **`npm run build`** → **Complete!** 7 páginas generadas (`contacto`, `nosotros`, `nuevos`, `service`, `usados`, `vehiculos`, `index` + `sitemap.xml`), sin errores. Confirma que las 3 llamadas nuevas a `border-radius: var(--radius-md)` en `.astro` (HomeHero, PhotoHero, nosotros) y el token nuevo en `tokens.css` compilan bien con Astro/Vite.
- **`npm run dev`** + capturas de pantalla headless (Chrome `--headless=new --screenshot`, sin tooling de browser dedicado disponible en este entorno) contra `localhost:4321`:
  - `/nosotros` — **confirma visualmente el radio de 8px** en `.sobre__media`: la foto del local tiene las 4 esquinas redondeadas, se ve limpio, sin artefactos (esta superficie tiene aire real alrededor — gap de grid — así que era el caso de menor riesgo).
  - `/` (HomeHero) y `/nuevos` (PhotoHero) — el mecanismo está aplicado (`.hero { border-radius: var(--radius-md) }`), pero el efecto visual es **imperceptible en la captura**: ambos hero son full-bleed a ancho de viewport completo, así que las esquinas superiores quedan tapadas por el header (sticky, con blur) y las esquinas inferiores caen sobre un cambio de sección donde el color de fondo de ambos lados es prácticamente el mismo `--surface-dark`. Esto es exactamente lo que se anticipó en el PLAN al razonar sobre por qué el radio en superficies edge-to-edge no iba a leerse igual que en una card con aire alrededor — no es un bug, es la naturaleza de aplicar 8px a un rectángulo del ancho del viewport. No se seguyó más porque el mecanismo (mismo `overflow:hidden` + `border-radius` en el contenedor que clipea) ya está probado funcionando en `/nosotros`.
  - El contenedor de Multiaviso apareció vacío en `/nuevos`, tal como se esperaba (whitelist por dominio, no se debuggeó).
  - Dev server detenido al terminar (`astro dev stop`).
- **`npm run deploy` — NO SE CORRIÓ**, por instrucción explícita del coordinador ("NO corras `npm run deploy`. El deploy a producción lo decide el usuario, no vos"). **Queda pendiente de verificación en producción:**
  - Listado (`/usados`, `/nuevos`, `/vehiculos`): las cards del grid (`#List .item`, `.item-image`) y el radio revertido de `--radius-none` a `--radius-md`.
  - Carrusel de destacados del Home (`.CarouselWrapper .carousel-item` y sus reglas nuevas de `.item-image`).
  - Detalle de vehículo (`?ma_carid=`): **crítico** — los selectores de `#MediaContainer .swiper-slide` y `.thumbs-container .swiper-slide` son de mejor esfuerzo y están marcados `NO VERIFICADO` en el código; si no matchean el DOM real, no va a pasar nada visualmente y hace falta una sesión de seguimiento con devtools contra `bielcar.vercel.app/...?ma_carid=...` para corregir el selector.

**Archivos escritos en esta sesión:**
- `src/styles/tokens.css`
- `src/styles/multiaviso.css` (review-required — diff pendiente de OK humano explícito, ver `agent-config.yaml`)
- `src/components/HomeHero.astro`
- `src/components/PhotoHero.astro`
- `src/pages/nosotros.astro`
- `documentation/DESIGN.md`
- `.claude/change-log/branch-main.md` (este archivo — no cuenta contra el set aprobado, pero se lista por transparencia)

**Sin cambios (excluido por decisión del coordinador):** `src/components/AccessTiles.astro`.

---

## Session 2 — web-feature on `site` (started 2026-09-02T22:25:00Z)

```yaml
agent: web-feature
stack: site
session_started_utc: 2026-09-02T22:25:00Z
session_ended_utc: 2026-09-02T22:34:00Z
final_status: completed
handoff_slug: null
files_written:
  - src/styles/multiaviso.css
```

### 1. Initial approved PLAN — 2026-09-02T22:30:00Z

**Pre-approval iterations:** una — el coordinador (no el usuario) señaló dos correcciones sobre el PLAN v1 antes de que llegara aprobación real: (1) el segundo par de selectores propuesto, `.catalog #MultiavisoWrapper .spinner`, era muerto — grep contra `plugin.js?v=2.1` mostró que `t.container` se resuelve UNA sola vez a `#MultiavisoContainer` y se reutiliza en los tres call-sites (listado, carrusel, formularios), así que ese selector nunca matchea y el comentario que lo acompañaba afirmaba un hecho falso; (2) agregar `position: relative` sin acotar el `top: 50%` inline de `.spinner` deja el loader centrado contra `--ma-reserve` completo (1250px en el listado), o sea a 625px del tope — debajo del fold en cualquier celular. Corregí ambos puntos (selector único + `top: min(50%, 200px) !important`) y volví a presentar el PLAN completo (v2) antes de que el coordinador transmitiera el "proceed" del usuario.

**Tarea:** reemplazar el spinner genérico de spin.js (barras grises) que Multiaviso muestra mientras carga el catálogo por el engranaje de marca de Bielcar girando, vía CSS puro sobre el nodo `.spinner` que el plugin inyecta en runtime.

**PLAN presentado (verbatim, v2 — la que recibió "proceed"):**

a) Archivo a modificar: **`src/styles/multiaviso.css`** (único, `review_required` — diff mostrado y aprobado explícitamente antes de escribir). Tres cambios en ese archivo:
   1. Dos líneas `--ma-loader` en los bloques `.catalog[data-surface='dark']` (`var(--brand-bright)`) y `.catalog[data-surface='light']` (`var(--brand)`) — token separado de `--ma-link` porque ese usa `--brand-deep` en claro, no `--brand`.
   2. `position: relative` agregado a la regla existente `.catalog #MultiavisoContainer { min-height: var(--ma-reserve); width: 100%; }` — necesario porque `.spinner` (inyectado por spin.js) trae `left/top: 50%` inline y, sin esto, esas coordenadas se resuelven contra el ancestro posicionado más cercano fuera de este árbol (en el peor caso el viewport), ya que `#MultiavisoWrapper` — que SÍ es `position: relative` por el propio plugin — todavía no existe cuando el spinner está visible.
   3. Sección nueva "11. loader de carga" al final del archivo:
      - `.catalog #MultiavisoContainer > .spinner > div { display: none; }` — oculta las 11 barras grises (sin clase, sin `display` inline, así que no hace falta `!important`).
      - `.catalog #MultiavisoContainer > .spinner { top: min(50%, 200px) !important; }` — acota el `top: 50%` inline (caso reservado para `!important` por la regla 2 de la cabecera del archivo: pisa un inline). `min()` en vez de un valor fijo para que en el carrusel (reserva 400px, 50% real = 200px) el cap coincida con el centrado real y no rompa nada.
      - `.catalog #MultiavisoContainer > .spinner::before { ... }` — dibuja el engranaje de 48×48px vía `mask-image` con un data-URI SVG (path de 8 dientes construido a partir de proporciones medidas del favicon real) + `background-color: var(--ma-loader)`, centrado con `translate(-50%, -50%)`. Mismo patrón que el ícono de `#FiltersTitle::before` en §7 (precedente ya existente en el archivo).
      - `@keyframes ma-gear-spin` — rotación `linear` (no `var(--ease)`, que es una curva de aceleración/frenado pensada para transiciones finitas, no para loops infinitos).
      - `@media (prefers-reduced-motion: reduce) { ... animation: none; }` — guard explícito, aunque `base.css` ya fuerza `animation-iteration-count: 1` / `animation-duration: 0.01ms` global.

   Explícitamente FUERA de alcance por instrucción del coordinador: no se toca `MultiavisoCatalog.astro` (el usuario descartó agregar texto tipo "Cargando vehículos"), y el cambio queda en un solo archivo.

b) Interfaces/contratos: ninguno — CSS puro, sin componentes ni props nuevas.
c) Server/client: no aplica (Astro sin React).
d) Comandos: `npm run check` (sin `lint`/`unit_test` configurados). `npm run deploy` mencionado como el único entorno que puede confirmar el ocultado real de las barras y el centrado contra el DOM en vivo — **no se corre en esta sesión**, por instrucción explícita del coordinador.
e) Contratos producidos: n/a. f) Contratos consumidos: n/a — no hay otros specialists involucrados.

**g) Alternativa más fuerte considerada:** renderizar el chrome del loader como markup propio en `MultiavisoCatalog.astro` con un `MutationObserver` alternando su visibilidad — descartada porque exige JS reaccionando al DOM del plugin, exactamente el borde que la regla "no manipular el markup del plugin con JS" viene a prevenir.

**h) Supuesto que sostiene el enfoque:** que el markup que genera `spinner.spin()` (`.spinner` sin clase, `position:absolute` inline, 11 hijos sin `display`) es estable en las tres invocaciones del plugin — confirmado por grep contra el fuente real de `plugin.js?v=2.1` (única asignación de `t.container`), no solo supuesto.

**i) Observación que lo falsificaría:** abrir devtools contra `bielcar.vercel.app` mientras el catálogo carga (o al enviar el formulario de contacto) y ver que `.spinner` o sus hijos llevan una clase distinta, o un `display` inline — cualquiera de esas cosas rompería el selector. Solo `npm run deploy` puede confirmar o refutar esto; localhost no.

**Aprobación:** el coordinador transmitió `"proceed — el usuario aprobó el diff de la v2 tal cual, sin cambios de tamaño ni texto adicional"`, con instrucciones puntuales de implementación (engranaje a 48px, sin texto agregado, un solo archivo, correr `npm run check`, appendear el ledger, limpiar el scratchpad, y ser explícito en el reporte sobre qué se pudo verificar localmente y qué no).

### 2. Verification — 2026-09-02T22:33:00Z

- **`npm run check`** (`astro check`) → **0 errors, 0 warnings, 1 hint** sobre 36 archivos. El único hint (`src/data/site.ts:14`, `'local2' is declared but its value is never read`) es preexistente, no relacionado con esta sesión — no se tocó `site.ts`.
- **Verificado localmente, fuera de `astro check`:**
  - El path SVG del engranaje se renderizó con `qlmanage`/PIL contra el path real (no una aproximación) antes de pegarlo en el CSS: 8 dientes, agujero central, silueta reconocible contra el favicon ampliado.
  - Un harness en el scratchpad (fuera del repo, no commiteado) reprodujo a mano el markup real de spin.js — `.spinner` con 11 `div` hijos sin clase — dentro de un contenedor con la reserva REAL de `[data-view='list']` (1250px), con header (60px) y hero mobile (~150px) simulados encima, contra una guía de viewport de 667px (iPhone SE). Confirmó dos cosas: (1) sin el cap de `top`, el engranaje cae debajo de esa línea — reproduce el bug que señaló el coordinador; (2) con `top: min(50%, 200px) !important`, el engranaje queda bien arriba de la línea, visible de entrada. Las barras se ocultaron y el color cambió correctamente por `data-surface` en las dos pruebas.
  - `git status` después de implementar: solo `src/styles/multiaviso.css` aparece modificado. Ningún archivo del scratchpad (harness, scripts de generación del path, capturas PNG) tocó el working tree — vivieron todo el tiempo en `/private/tmp/.../scratchpad`, fuera del repo, así que no hizo falta limpieza dentro del repo.
- **NO verificado, y no se puede verificar localmente:** el ocultado real de las 11 barras grises y el centrado del engranaje contra el DOM EN VIVO de `bielcar.vercel.app` — el catálogo no renderiza en localhost ni en preview deploys (whitelist por dominio). El harness reproduce el markup documentado de spin.js a mano, no el DOM real. **`npm run deploy` no se corrió** en esta sesión, por instrucción explícita del coordinador — queda pendiente de que el usuario lo corra y confirme contra producción.

**Archivos escritos en esta sesión:**
- `src/styles/multiaviso.css` (review-required — diff aprobado explícitamente antes de escribir)
- `.claude/change-log/branch-main.md` (este archivo — no cuenta contra el set aprobado, se lista por transparencia)

---

## Session 3 — web-feature on `site` (started 2026-09-02T22:36:00Z)

```yaml
agent: web-feature
stack: site
session_started_utc: 2026-09-02T22:36:00Z
session_ended_utc: 2026-09-02T22:41:00Z
final_status: completed
handoff_slug: null
files_written:
  - src/styles/multiaviso.css
```

### 1. Implementation adjustment — 2026-09-02T22:38:00Z

**No re-aprobación (in scope):** corrección de un dato incorrecto dentro de un archivo ya aprobado en la Sesión 2, sobre la MISMA sección ya escrita — no un cambio de alcance ni de enfoque (el mecanismo de `mask-image` + `::before`, el token `--ma-loader`, el `top: min(50%, 200px)` y el guard de `prefers-reduced-motion` quedan intactos). Es exactamente el tipo de corrección que la cabecera de este mismo archivo (líneas 5–15) pide dejar asentada cuando aparece.

**Qué se leyó mal:** la Sesión 2 documentó la silueta del engranaje como "4 dientes largos/angostos en los cardinales, alternando con 4 cortos/anchos en las diagonales". El coordinador comparó el path embebido contra `public/favicon.png` ampliado y encontró que no correspondía: el original tiene **8 dientes uniformes** (mismo ángulo y radio en los 8), un **cuerpo macizo grande**, y una **protrusión de diente corta** (~23% del radio del cuerpo, no ~50%). Tal como había quedado, el resultado se leía como un sol o un engranaje de relojería — no como el de Bielcar.

**Por qué se leyó mal:** la Sesión 2 midió las proporciones ampliando `public/favicon.png` (68×68 real) con vecino-más-cercano a 12×. A esa resolución, los dientes que caen sobre los ejes cardinales (0°/90°/180°/270°) quedan mejor definidos por el pixel grid que los que caen en diagonal (45°/135°/...), y esa diferencia de nitidez se interpretó como una diferencia REAL de forma (dientes largos vs. cortos). Era un artefacto de la rasterización a 68px, no una propiedad del dibujo original — el mismo modo de falla, aplicado a un asset en vez de a un selector, que la cabecera del archivo ya documenta para selectores que empatan en especificidad.

**Proporciones corregidas** (viewBox `0 0 24 24`, centro `12,12` — dejadas en el código para cuando llegue el vector oficial de Sebastián):
- Radio exterior (punta del diente): **9.5**
- Radio del cuerpo / fondo del valle: **7.7** (la punta sobresale ~1.23× el cuerpo — antes daba ~1.5×)
- Radio del agujero central: **1.8** (~0.19 del radio exterior)
- 8 dientes uniformes, paso de 45°, semiángulo de base 12° (~24° de paso) y semiángulo de punta 9.5° (~19°) — flancos apenas convergentes hacia afuera.

**Verificación antes de embeber (no solo cerrar los números):** se regeneró el path con el mismo script del scratchpad (ahora con ángulos/radios idénticos en las 8 posiciones, no alternados), se renderizó standalone con `qlmanage` a tamaño grande y a un tamaño cercano al real (~48–96px), y se comparó lado a lado contra `favicon-nn.png` (el favicon ampliado con vecino-más-cercano ya generado en la Sesión 2). A los dos tamaños la silueta se lee como el mismo engranaje: disco macizo, dientes cortos y parejos, agujero chico centrado — ya no como un sol.

**Cambios aplicados, un solo archivo:**
- Reemplazado el data-URI del path en las DOS declaraciones (`-webkit-mask` y `mask`) de `.catalog #MultiavisoContainer > .spinner::before`, con el path de 8 dientes uniformes de arriba.
- Reescrito el comentario que documentaba la geometría (dentro de la sección "11. loader de carga") para reflejar la geometría real, dejar registrado que la lectura alternada fue un artefacto de rasterización — no una decisión de diseño — y por qué, con las proporciones exactas medidas.
- Sin cambios en: los tokens `--ma-loader`, `position: relative` en `#MultiavisoContainer`, `top: min(50%, 200px) !important`, el tamaño de 48×48px del loader, la animación `ma-gear-spin` (`linear`, 1.1s), ni el guard de `prefers-reduced-motion`. Tampoco se tocó `MultiavisoCatalog.astro` ni ningún otro archivo.

### 2. Verification — 2026-09-02T22:40:00Z

- **`npm run check`** (`astro check`) → **0 errors, 0 warnings, 1 hint** sobre 36 archivos — el mismo hint preexistente de `src/data/site.ts:14` (`local2` sin usar), no relacionado con esta sesión.
- **Verificado localmente:** el path SVG corregido se renderizó standalone (`qlmanage`) a tamaño grande y a un tamaño cercano al real de uso (48–96px) y se comparó lado a lado contra el favicon real ampliado — la silueta se lee como el mismo engranaje a los dos tamaños. Las mediciones (9.5 / 7.7 / 1.8 / semiángulos 12°-9.5°) se tomaron tal como las pasó el coordinador y se usaron directamente en el generador del path — no se remidieron desde cero, así que su exactitud depende de esa medición previa.
- **NO verificado, y no se puede verificar localmente:** cómo se ve el engranaje corregido contra el DOM real de `bielcar.vercel.app` (color de marca real, tamaño real dentro del `::before`, contraste sobre el fondo real de la página). El catálogo no renderiza en localhost ni en preview deploys. **`npm run deploy` no se corrió** en esta sesión — sigue pendiente de que el usuario lo corra y confirme, tanto esto como lo que ya quedó pendiente de la Sesión 2 (ocultado real de las barras grises, centrado del loader).
- `git status` → solo `src/styles/multiaviso.css` y este ledger aparecen modificados. Nada del scratchpad (script generador, SVGs standalone, comparativas PNG) tocó el working tree — vivió todo en `/private/tmp/.../scratchpad`, fuera del repo.

**Archivos escritos en esta sesión:**
- `src/styles/multiaviso.css` (review-required — cambio acotado a las dos declaraciones de data-URI y su comentario, sin tocar el resto de la sección 11 ni el resto del archivo)
- `.claude/change-log/branch-main.md` (este archivo — no cuenta contra el set aprobado, se lista por transparencia)

---

## Session 4 — web-feature on `site` (started 2026-09-02T21:00:00Z)

```yaml
agent: web-feature
stack: site
session_started_utc: 2026-09-02T21:00:00Z
session_ended_utc: 2026-09-02T22:51:06Z
final_status: completed
handoff_slug: null
files_written:
  - documentation/DESIGN.md
  - src/styles/tokens.css
  - src/styles/base.css
  - src/layouts/Base.astro
  - src/components/HomeHero.astro
  - src/components/PageHero.astro
  - src/components/PhotoHero.astro
  - src/components/AccessTiles.astro
  - src/components/BrandStrip.astro
  - src/components/FeaturedCarousel.astro
  - src/components/ServicesBlock.astro
  - src/components/ServiceCta.astro
  - src/components/PermutaBand.astro
  - src/components/ServiceBrands.astro
  - src/components/ServiceForm.astro
  - src/components/Footer.astro
  - src/components/Header.astro
  - src/components/WhatsAppFab.astro
  - src/pages/nosotros.astro
  - src/pages/contacto.astro
  - src/pages/service.astro
```

### 1. Initial approved PLAN — 2026-09-02T21:55:00Z

**Tarea:** modernizar el sitio con movimiento — reveal on scroll de textos/secciones/botones, con algún elemento entrando desde el costado, "ágil, smooth y profesional". Alcance completo, intensidad contenida, ya aprobados por el usuario antes de esta sesión (routing de `policy`).

**Conflicto de contrato ya resuelto por el usuario, antes del PLAN:** `documentation/DESIGN.md` §4 y el comentario de `base.css:215-216` prohibían "reveal on scroll ni transiciones de página". El usuario, dueño del documento, revirtió esa línea — precedente conocido, ya lo había hecho antes con la línea de "aplicar-al-final" de §8. El PLAN incluyó explícitamente la enmienda a §4 y la reescritura del comentario de `base.css`, para no dejar el documento ni el comentario mintiendo.

**Mecanismo decidido de antemano por el coordinador (no re-litigado):** `IntersectionObserver` + CSS, sin librerías nuevas (`package.json` es ruta restringida). Tokens nuevos en `tokens.css` reusando `--ease`: `--dur-reveal: 560ms`, `--reveal-shift: 20px`, `--reveal-step: 70ms`. Opt-in por atributo `data-reveal` (nunca una regla global — mismo error que el preflight de Tailwind, en sentido inverso). Fail-safe obligatorio: `opacity: 0` solo bajo `html.js-reveal`, clase que agrega un único script `is:inline` en `<head>`; sin JS, todo se ve. Un solo observer en `Base.astro`, `threshold: 0.15`, `rootMargin: '0px 0px -10% 0px'`, `unobserve` al disparar. `prefers-reduced-motion` cae a visible sin movimiento, sin flash.

**PLAN presentado (verbatim, resumido — ver el mensaje completo del turno anterior para el detalle línea por línea de cada archivo):**

a) Archivos a tocar: `documentation/DESIGN.md` (enmienda §4), `src/styles/tokens.css`, `src/styles/base.css`, `src/layouts/Base.astro` (script fail-safe + observer), `HomeHero.astro`, `PageHero.astro`, `PhotoHero.astro`, `AccessTiles.astro`, `BrandStrip.astro`, `FeaturedCarousel.astro`, `ServicesBlock.astro`, `ServiceCta.astro`, `PermutaBand.astro`, `ServiceBrands.astro`, `ServiceForm.astro`, `Footer.astro`, `Header.astro` (condensación al scroll), `WhatsAppFab.astro` (entrada + hide/show por dirección de scroll), `nosotros.astro`, `contacto.astro`, `service.astro`. Sin cambios en `index.astro`, `nuevos.astro`, `usados.astro`, `vehiculos.astro`, `MultiavisoCatalog.astro`, `multiaviso.css`, `CatalogBrandSync.astro`, `FormField.astro`, `WhatsAppForm.astro`, `Button.astro`.

b) Interfaces/contratos: ninguno nuevo — sin props de componente, solo atributos `data-*` y CSS. El stagger de `ServiceForm` ("suave", 40ms/8px) se resuelve con un helper `.reveal-fields` en `base.css` + `data-reveal="group"`, para no tocar `FormField`/`WhatsAppForm` (compartidos con `/contacto`, que no lleva este tratamiento).

c) Server/client: no aplica (Astro sin React).

d) Comandos: `npm run check`, `npm run build`.

e) Contratos producidos / f) consumidos: n/a — trabajo contenido en el stack `site`.

g) **Alternativa más fuerte considerada:** un componente `RevealFields` genérico reusable por `ContactForm` también, en vez de la clase `.reveal-fields` acoplada a `ServiceForm`. Descartada porque `/contacto` no pidió stagger de campos y generalizar el mecanismo ahí sería motion no solicitado.

h) **Supuesto que sostiene el enfoque:** que ningún elemento con `data-reveal` (ni sus wrappers) es ancestro de `#MultiavisoWrapper` en el árbol renderizado — verificado componente por componente (Header/Footer/WhatsAppFab son hermanos de `<main>`; en las páginas de catálogo el contenido animado son bandas *debajo* de `MultiavisoCatalog`, nunca alrededor).

i) **Observación que lo falsificaría:** si en producción (`bielcar.vercel.app`) la hoja de filtros mobile deja de anclarse al fondo o el header sticky se comporta raro al abrir filtros, indicaría que algún `transform`/`will-change` sí quedó en un ancestro del wrapper pese a la revisión.

**Dos hallazgos de lectura, presentados junto con el PLAN:**
1. El hero real de `/nuevos`, `/usados`, `/vehiculos`, `/service` y `/contacto` es `PhotoHero`, no `PageHero` (`PageHero` es solo fallback sin foto). El on-load se aplicó a los dos.
2. `HomeHero` no tiene eyebrow en el markup actual — el stagger on-load quedó en 3 pasos (h1 → lede → botón), sin inventar un eyebrow nuevo (sería contenido, no motion).

**Dos extrapolaciones marcadas explícitamente para confirmación:**
1. El botón de `PermutaBand` reusa el delay de 120ms de `ServiceCta` (el mensaje no daba un número para esta banda; ambas son el mismo patrón de CTA del sitio).
2. El mapa del `Footer` también en `data-reveal="fade"` (sin translate), por la misma razón que se pidió explícitamente para el de `/contacto`: "un iframe moviéndose se ve barato".

**Aprobación del coordinador:** "Proceda. El usuario aprobó el plan completo, sin recortes." — confirmando explícitamente las dos extrapolaciones, los dos hallazgos de lectura, y la enmienda a `DESIGN.md` §4 manteniendo la prohibición de `ClientRouter`/transiciones de página. Recordatorios de ejecución reiterados (ya cubiertos por el PLAN): `transform` siempre en el elemento animado, nunca `will-change`/`overflow: hidden` en un ancestro de `#MultiavisoWrapper`; no tocar `multiaviso.css` ni nodos del plugin; fail-safe obligatorio; sin dependencias nuevas.

### 2. Implementation adjustment — 2026-09-02T22:20:00Z

**No re-aprobación (in scope):** durante la implementación de `ServiceForm.astro` apareció un problema de diseño que el PLAN no había resuelto en el nivel de detalle de "cómo, exactamente": el helper `.reveal-fields` necesitaba selectores `html.js-reveal .sform__form :global(.field)` para respetar el fail-safe, pero escritos dentro de un `<style>` scopeado de Astro esos selectores no matchean — Astro le agrega el atributo de scope a CADA segmento del selector compuesto, incluido `html`, que el componente no renderiza, así que la regla nunca aplicaría. Es una corrección de "dónde vive el CSS", no un cambio de comportamiento visual ni de qué se anima: el helper se movió de un `:global()` inline en `ServiceForm.astro` a una clase `.reveal-fields` plana en `base.css` (ya unscoped, ya el lugar de las primitivas compartidas como `.band`/`.container`), aplicada vía `class="sform__form reveal-fields" data-reveal="group"` en el markup. El resultado visual y el mecanismo (`data-reveal="group"` dispara el observer, los hijos animan en cascada vía `.is-revealed`) son exactamente los del PLAN.

**Qué this enseña:** un selector que necesita alcanzar `<html>` o cualquier ancestro fuera del propio markup del componente no puede vivir en un `<style>` scopeado de Astro sin `:global()` en TODOS los segmentos, incluido el que no pertenece al componente — más simple y más a tono con el resto del proyecto (que ya centraliza primitivas compartidas en `base.css`) es no pelear con el scoping y poner el helper donde ya viven `.band`, `.container`, `.visually-hidden`.

### 3. Verification — 2026-09-02T22:51:06Z

- **`npm run check`** (`astro check`) → **0 errors, 0 warnings, 1 hint** sobre 36 archivos. El único hint (`src/data/site.ts:14`, `'local2' is declared but its value is never read`) es preexistente, no relacionado con esta sesión (no se tocó `site.ts`).
- **`npm run build`** → **Complete!** 7 páginas + `sitemap.xml`, 811ms, sin errores ni warnings.
- **Verificación estática del resultado del build** (`dist/*.html`, grep + inspección de fragmentos):
  - `document.documentElement.classList.add('js-reveal')` presente y es el ÚNICO punto del que depende el fail-safe — confirmado en `index.html`.
  - El observer (`IntersectionObserver`, `threshold: 0.15`, `rootMargin: '0px 0px -10% 0px'`) presente una sola vez, en `Base.astro`.
  - **Cero `data-reveal` cerca de `#MultiavisoContainer` / `.catalog` / `.ma-sheet`** en `nuevos.html` — se inspeccionó el fragmento de HTML alrededor de `id="MultiavisoContainer"` directamente y no aparece el atributo en ningún ancestro ni dentro del contenedor. El único contenido animado en las páginas de catálogo es `PhotoHero` (on-load, vía `animation`, sin `data-reveal`) y `PermutaBand` (después del catálogo, con `data-reveal`/`data-reveal="right"`).
  - Conteos de `data-reveal` por página razonables contra lo esperado por componente (home ~16 nodos reales + 1 referencia dentro del script del observer; `/nuevos`/`/usados`/`/vehiculos` con 4 nodos reales — `PermutaBand` × 2 + `Footer` × 2 — más la misma referencia de script).
- **No verificado y no verificable en este entorno:** el comportamiento visual real contra `bielcar.vercel.app` — el catálogo no renderiza en `localhost` ni en preview deploys (whitelist por dominio, DESIGN §6.2), así que la interacción entre la hoja de filtros mobile y CUALQUIER cosa de esta sesión (aunque el diseño la evitó a propósito, ver el supuesto (h) del PLAN) solo se puede confirmar con `npm run deploy`, que no se corrió en esta sesión — no fue pedido explícitamente. Tampoco se verificó visualmente en un navegador real la condensación del header, el hide/show del FAB, ni el timing de los stagger — la verificación de esta sesión fue `check` + `build` + inspección estática del HTML generado, tal como se pidió.

**Archivos escritos en esta sesión:** ver `files_written` arriba.

**Sin cambios, confirmado explícitamente (no solo omitido):** `src/pages/index.astro`, `nuevos.astro`, `usados.astro`, `vehiculos.astro`, `src/components/MultiavisoCatalog.astro`, `src/styles/multiaviso.css`, `CatalogBrandSync.astro`, `Icon.astro`, `Placeholder.astro`, `WhatsAppForm.astro`, `FormField.astro`, `Button.astro`, `package.json`.
