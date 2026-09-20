# filtros-mobile-modal

Los filtros del catálogo en mobile pasan de acordeón nativo del plugin a hoja
modal fija sobre el contenido.

## Session 1 — 2026-08-27

### Pedido

Referencia explícita: el panel de filtros de Mercado Libre mobile. Overlay
fijo por encima de todo, backdrop, y un botón para cerrar después de elegir.
Solo en mobile; desktop sin cambios.

Decisiones del usuario en el STOP:

- Después de la recarga que provoca cada filtro, la hoja queda **cerrada**
  (no se persiste el estado en `sessionStorage`).
- Barra inferior: **solo "Ver resultados"**, sin "Limpiar filtros".

### Divergencia con DESIGN.md — resuelta actualizando el documento

§8 pedía lo contrario: «en mobile dejar que el acordeón funcione». Se surfaceó
antes de escribir y el usuario aprobó el cambio, así que §8 se reescribió en
esta misma sesión — contrato y código no quedan divergentes.

De paso se corrigió un error preexistente de esa tabla: decía que los filtros
colapsan en 600–899, cuando la hoja del plugin los colapsa en **700**. Ese
número mal escrito es el que ya había llevado una vez a duplicar reglas del
plugin en 900px con tres `!important`.

### Archivos

| Archivo | Cambio |
|---|---|
| `src/styles/tokens.css` | `--z-filters: 550`, entre `--z-fab` (500) y `--z-drawer` (600). |
| `src/styles/multiaviso.css` | §7: la sección "Colapsado por defecto en mobile" pasa a "Mobile: los filtros son una hoja modal". `#FilterContent` → `position: fixed`; `#FiltersTitle` → botón; estilado del chrome propio. |
| `src/components/MultiavisoCatalog.astro` | Chrome propio (backdrop + barra superior + barra inferior) fuera de `#MultiavisoContainer`, y script tipado que sincroniza estado. |
| `documentation/DESIGN.md` | §8 reescrita. |

### Lo que se leyó antes de escribir

La hoja del plugin en vivo
(`https://automotora.multiaviso.com/Styles/plugin-style.css?v=7`), no de
memoria. Tres hechos que sostienen el enfoque:

1. `#MultiavisoWrapper` y `#ListWrapper` son `position: relative` **sin**
   `z-index`, y no hay `transform` / `filter` / `contain` en la cadena → no
   crean containing block, así que un `fixed` se ancla al viewport. Y por ser
   `fixed` escapa el `overflow: auto` de `#ListWrapper`.
2. En `max-width: 700px` el plugin pasa `#SortPopup` a `position: relative`
   → no se recorta dentro de la hoja con `overflow-y: auto`. Era el riesgo
   principal.
3. El plugin mantiene DOS señales de estado a la vez: la clase `.collapsed` en
   `#FiltersTitle` (la usa para rotar el chevron) y el `display` inline en
   `#FilterContent`. Por eso el script lee `getComputedStyle`, no el atributo.

### Decisiones de diseño

**El estado sigue siendo del plugin.** No se mantiene un flag propio: cerrar
despacha `click()` sobre `#FiltersTitle`. La alternativa —clase nuestra más
`!important`— dejaba dos fuentes de verdad, y el `display` inline de jQuery no
desaparece: el primer tap después de un cierre "nuestro" habría abierto en
falso. Toda la sección de CSS quedó **sin un solo `!important`**.

**Supuesto que carga el peso:** que `#FiltersTitle` es el único trigger y que
su handler (un `jQuery.on('click')` sobre un `<a>` sin `href`) atiende clicks
sintéticos. Si escuchara `touchstart`, el cierre por botón no anda.

**Observación que falsea el enfoque:** que en producción la hoja no se ancle
al viewport o quede recortada dentro del listado. Eso significaría que hay un
containing block que no aparece en la hoja del plugin, y entonces habría que
mover `#FilterContent` de lugar — exactamente lo que la regla 3 prohíbe.

### Gaps declarados

- **No es un dialog ARIA completo.** `role="dialog"` / `aria-modal` irían sobre
  nodo del plugin; el `inert` de `Header.astro` no se puede reusar porque acá el
  panel está enterrado en el árbol (inertar hermanos inertaría la propia hoja).
  Hay lock de scroll, foco en el ✕ al abrir y cierre con `Escape`.
- **`#FiltersTitle` es un `<a>` sin `href`** → no es focusable por teclado.
  Abrir la hoja con teclado no es posible sin tocar su markup.
- **Sin columna lateral de categorías** como ML (exige rearmar su DOM).
- **Sin conteo en el botón** ("Ver 79 resultados"): saldría de parsear
  `#Counts` ("1 a 12 de 79 resultados"). Frágil; se puede agregar después.

### Verificación

`npm run check` y `npm run build` limpios localmente. **La verificación real es
solo en producción:** el catálogo no renderiza en localhost ni en previews
(whitelist por dominio), así que ninguna de las reglas de esta sesión se puede
observar sin `npm run deploy` y mirarlo a ~390px.

## Session 2 — 2026-08-27

Dos correcciones sobre feedback de producción (primer deploy visto a ~390px).

### Problema 1 — la hoja ocupaba toda la pantalla

Pasa a **80svh anclada abajo**: `--ma-sheet-h: 80svh`, la barra superior
anclada por `bottom: calc(var(--ma-sheet-h) - var(--ma-sheet-head))` en vez de
`top: 0`. Anclar por abajo evita tener que restar de `100svh`.

Efecto lateral que hubo que arreglar: con la hoja ya no cubriendo todo, su
borde superior era invisible — el backdrop al 60% sobre banda oscura da casi el
mismo negro que `--surface-dark`. Las tres superficies de la hoja (barras y
panel) pasan a `--ma-bg-raised` (#171717).

### Problema 2 — el contenido no scrolleaba

Causa: **jQuery deja `overflow: hidden` INLINE en `#FilterContent`** después de
animar (se ve en el DOM capturado: `style="overflow: hidden; display: block;"`),
y lo inline le gana a nuestro `overflow-y: auto`. Los últimos bloques de filtro
quedaban cortados sin forma de llegar a ellos.

Fix: `overflow-y: auto !important` — el primer y único `!important` del
archivo, y es exactamente el caso que la regla 2 de su cabecera reserva
("`!important` queda reservado para donde el plugin usa estilos inline"). Solo
el eje Y; el X sigue en `hidden`.

### Un regalo del cambio de anclaje

El alto ahora se declara con `height` y la caja está anclada por `bottom`.
jQuery anima `height` inline, así que mientras anima la caja crece **hacia
arriba**: la animación del plugin se lee como una hoja que sube desde el borde
inferior. Sin una sola transición nuestra. En la Session 1 esto figuraba como
riesgo ("se va a plegar hacia arriba, puede verse raro") — se resolvió solo al
cambiar el anclaje.

### Cierre

Sin cambios: cierran el backdrop, el ✕, "Ver resultados" y `Escape`. El trigger
`#FiltersTitle` queda detrás del backdrop, así que no hay forma de cerrar de
más. Las tres piezas de la hoja son contiguas en vertical, o sea que no hay
huecos por donde un tap llegue al backdrop sin querer.

## Session 3 — 2026-08-27

Bug reportado con screenshots: al pasarse del final del scroll (arriba o abajo)
el rebote dejaba ver el contenido de la página detrás de la hoja.

### Causa

No era un hueco de layout — las tres piezas son contiguas, se verificó. Es el
rubber-band de iOS: **el background de un contenedor scrolleable se pinta junto
con el contenido durante el rebote**, y el fondo estaba en `#FilterContent`, que
es justamente el que scrollea. `-webkit-overflow-scrolling: touch` lo agrava
(crea una capa de composición propia) y además está obsoleto desde iOS 13, donde
el momentum ya es nativo.

### Fix

1. `.ma-sheet__surface` — caja fija nueva, del alto exacto de la hoja, que no
   scrollea nunca. El fondo vive ahí.
2. Fuera `-webkit-overflow-scrolling: touch`.

El orden de capas queda documentado en el CSS:

    -2  backdrop          atenúa la página
    -1  __surface         fondo opaco de la hoja
     0  #FilterContent    el panel del plugin, scrolleable
    +1  __head / __foot   chrome

El `background` de `#FilterContent` se dejó: es el mismo `--ma-bg-raised`, así
que si en el rebote se corre, atrás está la superficie del mismo color y no se
nota. Sacarlo también funcionaría; dejarlo es una capa de redundancia gratis.

La superficie NO lleva `pointer-events: none` a propósito: queda tapada por el
panel y las barras, y si algún tap llegara igual, que no haga nada es mejor que
que se cuele al backdrop y cierre la hoja de más.

## Session 4 — 2026-08-27

Pedido: sacar el padding del `div.catalog` en /nuevos, /usados y /vehiculos.

`.catalog` solo declara `padding-block: var(--section-y)` (96px, 56px en
mobile), así que "el padding" es ese. Los `padding-inline` son de
`.catalog__inner`, que es otro div, y los de adentro son del plugin
(`#MultiavisoWrapper` 5px, `#ListWrapper` 20px / 5px 10px) — no se tocaron.

**No se pudo sacar global:** `.catalog` lo comparten las tres páginas de listado
Y `FeaturedCarousel` (el carrusel del home), que sí es una banda entre bandas y
necesita su ritmo vertical.

Solución: prop `flush` en `MultiavisoCatalog` → `data-flush` en `.catalog` →
`.catalog[data-flush] { padding-block: 0 }`. Default CON padding, porque §4
trata `.catalog` como banda; las páginas de listado optan por salirse.

Se eligió prop y no un `:has()` sobre el markup del plugin para distinguir
listado de carrusel: quién paga el ritmo vertical lo decide el contexto, y así
se lee en el call site en vez de inferirse de un selector frágil.

Verificado en `dist/`: `data-flush` presente en nuevos/usados/vehiculos,
ausente en index.

## Session 5 — 2026-08-27

`.filter-block-label` pasa de `--ma-text-muted` (#B0B0B0) a `--ma-text`
(#FFFFFF). Es la regla base, o sea desktop y mobile de una.

Motivo: es el título del grupo de filtros, no un metadato. En muted competía
con los items del propio filtro —que sí van muted— y el grupo no se leía como
encabezado. El contraste lo aporta el peso y las mayúsculas, no el gris.

En superficie clara resuelve solo a `--text-on-light` (#141414), así que el
switch de `data-surface` sigue funcionando sin una segunda regla.

## Session 6 — 2026-08-27

`#SpecsDescription` (cuerpo, `p`, `span`, `div`) pasa de
`--text-on-dark-muted` (#B0B0B0) a `--text-on-dark` (#FFFFFF).

La regla ya existía con `!important` — el bloque que §6.3 autoriza, porque el
texto viene del panel de Multiaviso con `style=` inline. Solo cambió el token.

Motivo: fue muted por la regla general de que la prosa larga no va en blanco
pleno, pero acá no aplica. No es prosa nuestra maquetada a nuestro ancho: es la
ficha del vehículo, con listas de equipamiento larguísimas a 12pt, y es el
contenido por el que la persona entró a la página.

Efecto lateral aceptado: `strong` ya usaba `--text-on-dark`, así que ahora el
negrita se diferencia solo por peso y no por color. Con 12pt el peso alcanza.

**Queda sin resolver, no pedido:** el `h1` de la descripción trae
`color: #11437f` inline (azul marino) y lo pisamos a `--text-on-dark`, pero el
`#firmacontainer` y el `.multiaviso-copyright` traen `#333` inline y NO están
cubiertos por estos selectores en todos los casos — el copyright tiene su propia
clase. Sobre #0D0D0D el #333 es casi invisible. Verificar en el detalle.

## Session 7 — 2026-08-27

Bug: el plugin inyecta su markup en runtime tras un fetch, así que
`#MultiavisoContainer` arranca con alto 0 y todo lo que va DEBAJO (banda de
permuta, footer) se dibuja arriba y salta cuando llegan los datos.

### Fix

`min-height` reservado en `#MultiavisoContainer`, vía `--ma-reserve`:

    list      1250px   12 cards en 2 columnas, y también el detalle
    carousel   400px   una fila de tarjetas

Números redondos a propósito: el punto es reservar de sobra, no acertar el alto
final.

### `width: 100vw` → `width: 100%`

Pedido original: `100vw`. Se planteó el problema y el usuario confirmó `100%`.
`#MultiavisoContainer` vive dentro de `.catalog__inner`, que tiene
`max-width: var(--container-wide)` y `padding-inline`: con `100vw` se sale del
contenedor centrado, y además `100vw` incluye el ancho de la scrollbar → barra
horizontal en toda la página. Un div de bloque ya mide el 100% de su columna.

### Reserva incondicional — tradeoff aceptado

No se suelta cuando llega el contenido. En un listado con pocos resultados
(`?ma_brand=Volvo`, un auto) sobra espacio vacío abajo.

Se eligió así porque la alternativa obvia —`:has()` para soltar la reserva
cuando aparece contenido— la suelta cuando el plugin inyecta su ESQUELETO, que
es ANTES de que llegue el fetch: reintroduce exactamente el salto que esto viene
a arreglar. Verificar en producción si el hueco molesta; si molesta, la salida
es un valor más bajo, no `:has()`.

### `flush` → `view`

El prop `flush` de la Session 4 se colapsó en `view: 'list' | 'carousel'`:
distinguía lo mismo dos veces, y el alto reservado necesitaba la misma
distinción. Gobierna el `padding-block` de la banda y `--ma-reserve`. Default
`'list'` (tres páginas contra un carrusel), así que el caso especial es el que
se declara: `FeaturedCarousel` pasa `view="carousel"`.

`view` NO es el `viewMode` de `MultiavisoScripts` — tienen que coincidir, pero
son componentes distintos (uno va en <head>) y el plugin no expone su modo al
DOM. Queda anotado en el JSDoc del prop.

## Session 8 — 2026-08-27

Bug: en mobile, tocar una marca del `BrandStrip` → navegar al listado de esa
marca → volver con el back → la franja de marcas queda clavada, sin moverse.

### Causa — NO era el hover

El `:hover` ya estaba correctamente gateado con `@media (hover: hover)` de una
pasada anterior. El culpable era la otra regla, sin gatear:

    .brands__track:focus-within { animation-play-state: paused }

Al tocar una marca el link recibe FOCO, el tap navega, y **al volver con el
back el navegador RESTAURA el foco a ese link**. La home se volvía a dibujar
con el track ya en `:focus-within` y el marquee no arrancaba nunca más.

El comentario que había ahí decía "en touch no molesta porque el foco llega
junto con el tap y el tap navega". Era verdad para la ida y falso para la
vuelta — quedó anotado en el código, porque es el razonamiento que hay que no
repetir.

### Fix

    .brands__track:has(:focus-visible) { animation-play-state: paused }

No se saca la pausa por foco: tabular hasta un logo y que siga moviéndose bajo
el anillo de foco es inusable con teclado. La distinción correcta no es
hover-capability sino `:focus-visible`, que matchea cuando el navegador decide
que el foco merece indicarse (teclado) y no cuando llegó por tap o click.
`:has()` lo traduce de "el link está enfocado" a "el track contiene algo
enfocado".

Queda FUERA de `@media (hover: hover)` a propósito: el teclado no depende de que
el dispositivo pueda hacer hover.

Verificado en el bundle: `:hover` sigue dentro del media query, el
`:has(:focus-visible)` afuera, y `focus-within` ya no aparece.

## Session 9 — 2026-08-27

Tres pedidos de mobile. El primero destapó un bug de interpretación que venía
de dos sesiones atrás.

### 1. Carrusel del home: las tarjetas ocupaban ~44% del ancho

**Las keys de `carousel.breakpoints` son `max-width`, NO `min-width`.**

El Swiper que bundlea el plugin es de la era 4 (usa `.swiper-container`, que en
Swiper 6 pasó a `.swiper`). Su resolver, leído de plugin-sripts.min.js:

    bf = function (n) {
      ...t.sort(ascending);
      for (u = 0; u < t.length; u += 1) {
        f = t[u];
        f >= i.innerWidth && !r && (r = f);   // la key MÁS CHICA que sea >= innerWidth
      }
      return r || "max"
    }

O sea que `{ 400: 1, 700: 2, 940: 3 }` NO significa "desde 400px, 1 slide" sino
"hasta 400px, 1 slide; hasta 700px, 2; hasta 940px, 3".

Consecuencia: un teléfono de 412 o 430px CSS —o sea casi cualquiera hoy— no cae
en la key 400 sino en la 700, y salía con `slidesPerView: 2`. De ahí el ~44% con
la siguiente tarjeta asomando cortada.

Y explica algo que quedó registrado como arreglado y no lo estaba: la corrección
de `1.3 → 1` de una sesión anterior apuntaba a la key 400, que solo aplica a
teléfonos de ≤400px. En el dispositivo del usuario no cambió nada.

Nueva tabla: `{ 400: 1.11, 767: 1.11, 940: 3, 1500: 4, 4000: 5 }`

- `1.11` da ~90% del ancho (1 / 1.11): la tarjeta casi entera con un sliver de
  la siguiente a cada lado. Ese sliver es lo que comunica que hay más; a ancho
  completo exacto no hay señal de que el carrusel se deslice.
- El `700` se corre a `767` para alinearlo con el corte que el plugin YA usa
  para pasar a bullets + `centeredSlides` (`s = o <= 767` en plugin.js).
- 940 / 1500 / 4000 se conservan: desktop funciona y no es lo que se arregla.
  El único bucket que cambia de valor es el de teléfonos. El tramo 701–767 pasa
  de 3 a 1.11, que es una mejora colateral (3 tarjetas en 750px era ilegible).

El comentario del bloque en MultiavisoScripts.astro se reescribió con el código
del resolver pegado como evidencia. El comentario viejo afirmaba la semántica
min-width, y es lo que causó el bug — no alcanzaba con cambiar el número.

### 2. ServiceCta centrado en mobile

`align-items: flex-start` → `center` más `text-align: center` en el ≤899px que
ya existía. Apilado y a la izquierda, el botón colgaba del borde con todo el
ancho libre a la derecha: se leía como desalineado, no como jerarquía.

### 3. ServicesBlock centrado en mobile

Nuevo `@media (max-width: 899px)` — el mismo corte que usa el resto del sitio
(nav, ServiceCta), no los 1099 ni los 599 que ya tenía el componente para otras
cosas.

`.services__intro { text-align: center }` y `.service { display: flex;
flex-direction: column; align-items: center; text-align: center }`.

El flex y no solo `text-align`: el ícono es un `<svg>` y centrarlo por texto
depende de que quede inline. Con la columna flex se centra pase lo que pase con
su `display`.

## Session 10 — 2026-08-27

Corrección de la Session 9: el centrado de `ServicesBlock` se revierte.

### ServicesBlock: izquierda, pero 2 columnas en mobile

El centrado de la Session 9 se descartó a pedido — cada ítem tiraba el ojo al
margen en vez de al ícono, y rompía la alineación a la izquierda del resto del
sitio (§4). Se sacó el bloque `@media (max-width: 899px)` entero.

El problema real no era la alineación sino el ALTO: con
`grid-template-columns: 1fr` abajo de 599px los seis ítems eran seis bloques de
ancho completo y la sección medía varias pantallas de scroll.

Fix: **la grilla ya no colapsa a una columna.** Se quitó el
`grid-template-columns: 1fr` del `@media (max-width: 599px)`, así que se queda
en `repeat(2, 1fr)` en todos los anchos. Misma información, la mitad de alto, y
el blurb se lee como etiqueta corta en vez de párrafo.

Dos ajustes que el cambio obliga:

- El gap de columna baja de `--space-8` a `--space-4`: con 32px, en un teléfono
  de 393px cada columna quedaba en ~164px y los títulos de dos palabras
  cortaban.
- `.service__line { max-width: none }` en mobile. El tope de 46ch existe para la
  columna ancha de desktop; en ~170px no hace nada, pero se neutraliza para que
  no quede como sospechoso si alguien redimensiona la grilla después.

### PermutaBand centrada en mobile

Se había centrado `ServiceCta` en la Session 9 y esta banda quedó sin centrar —
son las dos bandas de CTA del sitio y tenían que comportarse igual.

Va por `text-align: center` sobre `.permuta .container` y NO por `align-items`:
`.container` es un bloque, no un flex. El `<Button>` es `inline-flex`, así que
se centra como texto.

## Session 11 — 2026-09-02

Riel de categorías estilo Mercado Libre + "Limpiar filtros" + reabrir la hoja
tras aplicar un filtro. El usuario pidió acumular sin recargar; se investigó en
producción y se descartó: la taxonomía es progresiva (Marca → Modelo) y los
contadores se recalculan por recarga. La alternativa aprobada: cada filtro sigue
siendo un link que recarga, pero la hoja se reabre sola en la misma categoría.

### Archivos

| Archivo | Cambio |
|---|---|
| `src/components/MultiavisoCatalog.astro` | `.ma-sheet__rail` (nav vacío, botones generados en runtime); pie con "Limpiar filtros" si hay `ma_*`; `sessionStorage` + `html[data-ma-cat]` para riel y reapertura. |
| `src/styles/multiaviso.css` | `--ma-rail-w: 116px`; `#FilterContent` con `left: var(--ma-rail-w)`; show/hide por `:nth-child(N)`; estilos del riel y del link limpiar. **review_required** |
| `documentation/DESIGN.md` | §8: taxonomía progresiva, reapertura, riel sí (CSS-only), pie con Limpiar + Ver resultados. |

### Verificación previa (Session 10 tap targets, producción)

Filas `.filter-block-item` 48–49px; "Más opciones" revela filas de 49px con
`display: block` sin inline style — la trampa jQuery no se materializó.

### Verificación post-implementación

- `npm run check` — 0 errores
- `npm run build` — OK
- Catálogo en producción: requiere `npm run deploy` (plugin no renderiza en local)

### Approval token

Pendiente revisión humana del diff en `src/styles/multiaviso.css` (review_required).

## Session 12 — 2026-09-02

Deferred apply. El usuario vio Session 11 en el teléfono y rechazó la recarga
al toque: el filtro no se aplica hasta "Ver resultados". Se borra la
reapertura por `sessionStorage`.

Trade-offs documentados en §8: contadores stale, Marca → Modelo recién después
de confirmar.

### Archivos

| Archivo | Cambio |
|---|---|
| `src/components/MultiavisoCatalog.astro` | `preventDefault` en captura; `selections` + `wipeAll`; commit en "Ver resultados"; X/backdrop descarta; Limpiar es botón. |
| `src/styles/multiaviso.css` | `[data-ma-pending]` en opciones; punto en el riel; `clear[hidden]`. **review_required** |
| `documentation/DESIGN.md` | §8: aplicar al final, trade-offs, sin reapertura. |

### Verificación

- `npm run check` / `npm run build` — locales
- Catálogo en producción: requiere `npm run deploy` (plugin no renderiza en local)

### Approval token

Pendiente revisión humana del diff en `src/styles/multiaviso.css` (review_required).

## Session 13 — 2026-09-02

Chips de `#CurrentFilters` ocultos en mobile (con el drawer no aportan) y
trigger compacto estilo ML: fit-content, ícono, "Filtros", recuento `(N)`
leído de los chips y pintado vía `--ma-filter-count` en nuestro `.catalog`.

Desktop no se toca: ahí no hay hoja y el chip sigue siendo cómo se saca un
filtro suelto.

### Archivos

| Archivo | Cambio |
|---|---|
| `src/styles/multiaviso.css` | `#CurrentFilters { display: none }` en ≤699px; `#FiltersTitle` fit-content + ::before ícono + ::after label. **review_required** |
| `src/components/MultiavisoCatalog.astro` | `syncFilterCount()` |
| `documentation/DESIGN.md` | §6.1 árbol (`#CurrentFilters` en `td#List`); §8 trigger compacto y chips ocultos. |

---

## Session 14 — web-feature on `site` (started 2026-09-19T21:10:00Z)

```yaml
agent: web-feature
stack: site
session_started_utc: 2026-09-19T21:10:00Z
session_ended_utc: 2026-09-19T21:26:00Z
final_status: completed
handoff_slug: null
files_written:
  - src/styles/multiaviso.css
  - src/components/MultiavisoCatalog.astro
  - documentation/DESIGN.md
  - .claude/change-log/filtros-mobile-modal.md
```

### 1. Initial approved PLAN — 2026-09-19T21:10:00Z

**Pre-approval iterations:** n/a — the plan arrived already approved. The launching
context stated explicitly that `policy` had triaged the request, the user had
already said "proceed" on the plan below, and this session should implement
directly without re-running PLAN/STOP. No fresh STOP happened in this session;
what follows is the plan as handed off, reproduced verbatim in substance.

**The plan:**

Master-detail (riel + panel que muestra SOLO la sección activa) → scroll
continuo con riel como índice + scrollspy.

CSS (`src/styles/multiaviso.css`, `@media (max-width: 699px)`):
1. Reemplazar el `display: none` + 11 reglas `html[data-ma-cat='N'] … :nth-child(N)`
   por `> .filter-block { display: flex }` + `:nth-child(1) { display: block }`
   — muestra TODOS los bloques, elimina el tope de 12.
2. Dejar de ocultar `.filter-block-label` en bloques ≥2; darle estilo de
   encabezado (separación superior, distinción de peso/tamaño, filete entre
   secciones).
3. `scroll-margin-top` en `> .filter-block` para que el scroll por ancla no
   pegue la sección al borde superior.
4. `.ma-sheet__rail`: `overflow-y: auto` + `overscroll-behavior: contain`
   (solo si desborda).
5. Actualizar los comentarios que describen el mecanismo viejo.

JS (`src/components/MultiavisoCatalog.astro`):
6. Partir `selectCategory` en pintar riel (`aria-pressed`) vs. scrollear al
   bloque; el click hace ambas, el scrollspy solo pinta.
7. Scroll suave con `scrollTo({ top, behavior })` sobre `#FilterContent`
   (NO el viewport), respetando `prefers-reduced-motion` vía `matchMedia`.
8. Scrollspy: listener `scroll` en `#FilterContent`, coalescido con rAF;
   último bloque cuyo top cruzó un umbral; forzar la última sección al llegar
   al fondo (`scrollTop + clientHeight >= scrollHeight - epsilon`).
9. Suprimir el scrollspy durante el scroll programático (flag + apagado al
   acercarse al target, con fallback por timeout).
10. Al marcar un ítem, `scrollIntoView({ block: 'nearest' })` sobre ese botón
    del riel.
11. Eliminar `document.documentElement.dataset.maCat` por completo (incl.
    `apply` y `close`).
12. Al abrir la hoja: scroll del panel arriba, riel con la primera sección
    marcada.

Documentación:
13. Actualizar DESIGN.md §8 (describe el mecanismo viejo textualmente).
14. Append a este ledger.

Restricciones duras (heredadas de reglas de proyecto, no propias de esta
tarea): nada de Tailwind/ClientRouter; overrides prefijados con
`.catalog #MultiavisoWrapper`, ganar por especificidad no `!important` (el
único `!important` existente — `overflow-y: auto` en `#FilterContent` — tiene
que seguir siendo el único); no manipular markup del plugin con JS (lectura,
observación y scroll sobre sus nodos sí; escribir atributos nuevos no — el
único write existente es `data-ma-pending`); no inventar labels (salen del
`textContent` del plugin); TS tipado dentro del `<script>` del `.astro`.

**Contratos producidos:** ninguno — cambio de comportamiento interno del
chrome de filtros, sin nueva superficie pública ni tipos consumidos por otros
specialists.

**Contratos consumidos:** ninguno.

**Strongest alternative considered:** mantener el master-detail pero subir el
tope de 12 bloques (cambio trivial de una constante/lista). Se descartó
porque el problema real no era el tope — con 8 bloques nunca se llegaba a
12 — sino que ver otra categoría exigía un tap de modo antes de poder leerla;
el scroll continuo ataca eso directamente.

**Load-bearing assumption:** `#FilterContent` sigue siendo el único
contenedor que scrollea y sus `.filter-block` siguen siendo hijos directos
planos (ya verificado en producción en sesiones anteriores). Todo el cálculo
de scroll (`offsetTop`, `scrollHeight`, `scrollTop`) asume esa forma; si el
plugin alguna vez anida o pagina los bloques, el cálculo por índice se rompe.

**Falsifying observation:** en producción, tocar una categoría del riel no
deja el propio riel marcado en esa categoría al terminar el scroll suave (el
scrollspy se reactiva tarde o temprano y pinta otra cosa), o el riel parpadea
por las categorías intermedias durante el scroll programático. Cualquiera de
las dos señala que el umbral/supresión de `activeCategoryForScroll` /
`onPanelScroll` necesita otra afinación, o que hay una interferencia del
`MutationObserver` existente que no se previó.

**Approval token:** "El usuario ya dijo 'proceed' sobre el plan que sigue —
NO vuelvas a parar para pedir aprobación del plan; implementalo" (instrucción
literal del contexto que lanzó esta sesión).

### 2. Verification — 2026-09-19T21:24Z

- `npm run check` (`astro check`) — 0 errors, 0 warnings, 1 pre-existing hint
  unrelated to this change (`src/data/site.ts:14`, unused `local2` import).
- `npm run build` — 7 pages built, no errors. Confirmed the modified
  `<script>` bundled into
  `dist/_astro/MultiavisoCatalog.astro_astro_type_script_index_0_lang.*.js`
  (grepped for `ma-sheet__rail-item`).
- Catalog behavior NOT verified visually: per project rule, Multiaviso only
  renders on `bielcar.vercel.app` (domain whitelist). Empty container in dev
  and 404 on `plugin/v3/list` are expected, not debugged.
- **Pending human review:** the diff in `src/styles/multiaviso.css`
  (`review_required_paths`) and real-device verification of the scrollspy
  timing/threshold (`SPY_THRESHOLD = 12`, `SCROLL_SETTLE_FALLBACK_MS = 500`)
  after `npm run deploy`, which this session did not run.

### Decisiones no explícitas en el plan, tomadas al implementar

- **`.ma-sheet__rail` ya tenía `overflow-y: auto` + `overscroll-behavior:
  contain`** desde una sesión anterior (Session 11) — el plan pedía
  agregarlo; se verificó y no hizo falta tocar nada (documentado en el diff
  conceptual de abajo, no en el CSS).
- **El riel ya NO recuerda la última categoría activa entre aperturas.** El
  código viejo de `buildRail` preservaba `activeCat` si seguía siendo válido
  al reabrir; el ítem 12 del plan pide explícitamente "arranca arriba /
  primera sección marcada", así que se simplificó a siempre-primera-entrada.
  Es una pérdida de estado que existía antes; se prioriza la instrucción
  explícita del plan por sobre preservar ese comportamiento no pedido.
- **Guard `scrollBound`** para no duplicar el listener de `scroll` en
  `#FilterContent` si `buildRail` corre más de una vez sobre el mismo nodo
  (se re-ejecuta en cada apertura de la hoja, y el nodo del plugin persiste
  entre aperturas dentro del mismo page load).
- **Limpieza de `programmaticScroll`/`scrollFallback` en `close()` y en la
  rama `else` de `apply()`**, no pedida palabra por palabra pero directamente
  al servicio del ítem 9 (evita que el flag de supresión quede prendido si la
  hoja se cierra a mitad de un scroll suave).

### Diff conceptual por archivo

| Archivo | Cambio |
|---|---|
| `src/styles/multiaviso.css` | Sección "Riel de categorías" reescrita: `> .filter-block` pasa de `display: none` + 11 reglas `html[data-ma-cat='N']` a `display: flex` (todos visibles) + excepción `:nth-child(1)` en `block`; `scroll-margin-top: var(--space-4)` en cada bloque; el label de `:nth-child(n+2)` deja de ocultarse y gana `margin-top` + `padding-top` + `border-top` como encabezado de sección. Comentarios reescritos para describir el mecanismo nuevo y por qué reemplaza al viejo. **review_required**. |
| `src/components/MultiavisoCatalog.astro` | Nuevo `reduceMotionMq`; nuevo estado (`programmaticScroll`, `scrollTarget`, `scrollFallback`, `scrollBound`, `spyQueued`); nuevo helper `categoryBlocks()` (única fuente para riel y scrollspy); `selectCategory` partido en `paintCategory` (pinta `aria-pressed` + `scrollIntoView('nearest')` en el botón del riel) y `scrollToCategory` (scrollea `#FilterContent`, lee `scroll-margin-top` de CSS, respeta reduced-motion); nuevas `activeCategoryForScroll` + `onPanelScroll` (scrollspy coalescido con rAF, forzado al fondo); `buildRail` resetea `panel.scrollTop = 0` y adjunta el listener de scroll una sola vez; `document.documentElement.dataset.maCat` eliminado por completo (`buildRail`, `apply`, `close`). |
| `documentation/DESIGN.md` | §8: el bullet de "columna lateral de categorías" reescrito para describir scroll continuo + riel como índice + scrollspy, con un párrafo aparte explicando qué mecanismo reemplaza y por qué. |
| `.claude/change-log/filtros-mobile-modal.md` | Este bloque. |

---

## Session 15 — debug-triage on `site` (started 2026-09-20T14:34:27Z)

```yaml
agent: debug-triage
stack: site
session_started_utc: 2026-09-20T14:34:27Z
session_ended_utc: 2026-09-20T14:46:00Z
final_status: completed
handoff_slug: null
files_written:
  - src/components/MultiavisoCatalog.astro
  - src/styles/multiaviso.css
  - documentation/DESIGN.md
```

### 1. Initial approved PLAN — 2026-09-20T14:34:27Z

**Pre-approval iterations:** tres. (1) El PLAN original trataba el mapa fijo
`ma_* -> "Marca"` como mecanismo principal para nombrar las categorías
aplicadas; el usuario no pudo conseguir el mapeo key->label (no hay forma de
leer el DOM en vivo: el catálogo lo pinta jQuery en runtime y la whitelist es
por dominio) y apareció una ambigüedad real —un chip "Autos y Camionetas" que
no corresponde a ninguna de las ocho categorías, lo que abre que `ma_type` sea
el nivel superior y "Carrocería" sea `ma_subtype`—, así que el mecanismo
principal pasó a ser el aprendizaje en runtime. (2) El usuario aportó que
existe `ma_model` (label "Modelo"), que NO figura en la superficie de URL de
DESIGN.md §6.4, y que las categorías del panel son dinámicas: refuerza el
aprendizaje (un mapa a mano nunca podría haber contenido `ma_model`) y obliga a
indexar lo persistido por key y no por posición. (3) Sobre §2.5 del PLAN, el
usuario eligió que la ✕ del badge CONSERVE lo pendiente en vez de replicar
exactamente el ✕ de desktop.

**El PLAN aprobado, verbatim:**

Diagnóstico confirmado (no hipótesis): en `MultiavisoCatalog.astro:254`,
`if (intersection.size === union.size) return union;`. Con un `ma_*` en la URL
todos los links de un bloque cargan la key propia Y la del contexto, unión ==
intersección, se dispara el escape y el bloque "posee" también la key de
contexto. `paintPending` evalúa `sliceOwned(composed, ownedKeys(block)).size > 0`
con `composed` arrancando en `baselineMa()`, así que TODA categoría se enciende.
Simulado contra ocho formas de bloque antes de proponer.

Tres defectos latentes del mismo hilo, incluidos en el fix:
- La rama no-escape (`union − intersection`) excluye la key que sí varía pero
  está en todos los links: el bloque de rango posee `ma_min_price` y no
  `ma_max_price`, así que `compose()` no lo borra al cambiar de rango.
- `selections.set(nth, null)` (deselección) hace que `compose()` borre las keys
  de contexto: tocar la opción de orden ya activa con `?ma_status=USED` navega
  a `/usados` sin `ma_status`.
- `multiaviso.css:1112-1113` usa `var(--fs-small)` / `var(--lh-small)`, que no
  existen en ningún archivo de `src/styles/`: los labels del riel caen al
  heredado (15px en mobile) en vez de a un tamaño chico.

Archivos y cambios:

| Archivo | Cambio |
|---|---|
| `src/components/MultiavisoCatalog.astro` | `ownedKeys` reescrita (la key propia es la que VARÍA entre las opciones; fallback por diferencia con la URL para bloques de una sola opción; comparación case-insensitive por §6.4); guard `owned.size === 0` en `selectFilter`; cache de labels key->label en `sessionStorage` + `learnLabels()`; `appliedFilters()` leyendo `#CurrentFilters`; `buildRail` reescrita a filas (`.ma-sheet__rail-row`), sintetizadas primero; badge con ✕; pintado inicial sobre la primera fila navegable. |
| `src/styles/multiaviso.css` **(review_required)** | `--ma-rail-w: 116px -> 140px`; padding-inline del ítem 16 -> 12; tipografía a `--fs-label`/`--lh-label`; nuevas `.ma-sheet__rail-row`, `--static`, `.ma-sheet__rail-static`, `.ma-sheet__rail-badge` (+ ✕ por mask SVG); el punto cubre `[data-ma-filled]` y `[data-ma-applied]`; badge sumado al bloque `prefers-reduced-motion`. Cero `!important` nuevos. |
| `documentation/DESIGN.md` | §8: fila a dos líneas, badge, filas sintetizadas, semántica del punto corregida, riel 140px, labels aprendidos + fallback, y la divergencia de la ✕ respecto de desktop. §6.4: `ma_model` + nota de que la lista es un piso, no un techo. |
| `.claude/change-log/filtros-mobile-modal.md` | Este bloque. |

Decisiones de forma: las filas sintetizadas NO son botón (no hay bloque al que
scrollear; un botón que no hace nada es peor affordance que una fila de
lectura, y el riel ya enseñó que tocar una fila lleva a su sección). El control
es el badge entero, 44px de alto por ~116px de ancho útil: la ✕ es la
afordancia adentro del target, no un target aparte. Las sintetizadas van arriba
de todo: su bloque no existe, no hay posición "correcta" en la secuencia del
panel, y el estado aplicado es lo primero que se quiere leer al abrir.

Labels: orden de resolución `aprendido -> sin nombre`. NO se escribe una
constante seed vacía (código muerto que invita a llenarse a ojo). Sin label
aprendido, la fila muestra SOLO el valor (`Honda ✕`), nunca una categoría
adivinada. Esquema: clave `bielcar:ma-labels:v1`, valor `Record<ma_key, label>`
en JSON, lectura y escritura en `try/catch` con validación de forma (objeto
plano, clave `/^ma_[a-z0-9_]+$/`, valor string 1..60, tope 32 entradas), espejo
en memoria para el load actual si el storage tira (modo privado de iOS), se
invalida sobreescribiéndose y muere con la pestaña. Indexado por key `ma_*` y
nunca por `nth`: los índices posicionales se corren entre page loads cuando un
bloque aparece o desaparece (`ma_model` es el caso vivo).

Filtro huérfano (`ma_model` sin `ma_brand`): se replica el comportamiento del
plugin, no se agrega lógica de cascada que borre `ma_model`. No se puede
verificar sin deployar; queda como ítem del checklist de producción.

Contracts touched: ninguno. No hay `.claude/handoffs/` en este proyecto y el
cambio no produce ni consume tipos de otro specialist.

Verificación: `npm run check` y `npm run build` (el stack `site` no declara
`lint` ni `unit_test` — no se inventan). Lo visual SOLO con `npm run deploy`,
que esta sesión NO corre: lo decide el usuario.

**Strongest alternative considered:** dejar `ownedKeys` como está y arreglar
solo `paintPending`, haciéndole derivar el punto de `baselineMa()` en vez de
`compose()` — una línea, apaga el síntoma reportado. Descartada porque
`ownedKeys` no la usa solo el punto: la usan `compose()` y `selectFilter()`,
que arman la URL de "Ver resultados". Apagar el punto dejaría vivos los dos
defectos latentes —filtros que se caen o quedan pegados al confirmar—, que son
peores que el síntoma visual y mucho más difíciles de atribuir después.

**Load-bearing assumption:** que dentro de UN bloque los links del plugin
difieren solo en la key propia de ese bloque, viajando el contexto idéntico
(salvo la variación de mayúsculas de §6.4, que la comparación case-insensitive
absorbe), y que `#CurrentFilters .current-filter > a` sigue apuntando a la URL
sin ese parámetro (verificado en DOM real, documentado en
`CatalogBrandSync.astro:17-19`, pero hace varias sesiones).

**Falsifying observation:** en producción, con un filtro aplicado, que SIGA
apareciendo el punto en categorías sin selección propia, o que un badge muestre
un nombre de categoría que no corresponde al valor que tiene al lado (p. ej.
"Carrocería" sobre "Honda"). Cualquiera de las dos significa que "una key
propia por bloque, derivable de la variación entre sus links" es falso, y
entonces no alcanza con afinar `ownedKeys`.

**Approval token:** "PROCEED. El usuario aprobó el plan completo", más el OK
explícito sobre el diff de `src/styles/multiaviso.css` (`review_required_paths`),
más dos decisiones del usuario: la ✕ conserva lo pendiente, y no se escribe la
constante seed vacía.

### 2. Implementation adjustment — 2026-09-20T14:36:00Z

**No re-approval (in scope).** El PLAN decía que `syncFilterCount()` iba a
reusar `appliedFilters()`. No se hace: `syncFilterCount` queda contando nodos
`.current-filter` como hasta ahora.

**Motivo:** `appliedFilters()` descarta chips de los que no puede derivar una
key (diff vacío contra `location.href`) o un valor de texto. Para el badge eso
es correcto —sin key no hay nada que sacar—, pero el recuento `(N)` del trigger
es una superficie distinta y visible, y bajarlo de "(2)" a "(1)" por un chip
que no sabemos parsear sería una regresión en una ruta que no se puede
verificar sin deployar.

**What this teaches:** reusar un helper nuevo porque "lee lo mismo" ignora que
el nuevo trae filtros propios. Dos consumidores del mismo DOM con tolerancias
distintas al dato malformado no comparten función; el que ya funcionaba se
queda como está.

### 3. Implementation adjustment — 2026-09-20T14:44:00Z

**No re-approval (in scope).** Una línea más en `buildRail`, en la salida
temprana `!mq.matches || !rail`: junto con vaciar el riel se limpia
`rail.dataset.sig`.

**Motivo:** esa rama vaciaba el `innerHTML` pero dejaba la firma vieja, así que
una llamada posterior con las mismas categorías habría hecho match contra la
firma y saltado el rebuild, dejando el riel VACÍO. En la práctica es
inalcanzable —`buildRail` solo se llama desde `apply()` cuando la hoja se abre,
y eso exige `mq.matches`—, pero la rama existe justamente como red para una
carrera entre el cambio de viewport y el tick del observer, y una red que deja
el riel vacío no es red.

**What this teaches:** un cache invalidado por firma tiene que borrar la firma
en TODOS los caminos que borran el contenido que la firma describe. Vaciar el
DOM sin vaciar la clave deja el cache mintiendo — y la rama donde eso pasa suele
ser la defensiva, que es la que nadie prueba.

### 4. Verification — 2026-09-20T14:46:00Z

- `npm run check` (`astro check`, el único comando de verificación que declara
  el stack `site`) — **0 errors, 0 warnings, 1 hint**. El hint es preexistente y
  ajeno a este cambio: `src/data/site.ts:14`, `local2` importado y no usado. Ya
  figuraba así en la verificación de la Session 14.
- `npm run build` — **7 páginas, sin errores**. Verificado en `dist/` que el
  script bundleado contiene lo nuevo (`bielcar:ma-labels:v1`,
  `ma-sheet__rail-row`, `ma-sheet__rail-static`, `data-ma-applied`,
  `Quitar filtro`) y que el CSS construido trae `--ma-rail-w: 140px`,
  `.ma-sheet__rail-badge` y la regla de `[data-ma-applied]`.
- `lint` / `unit_test`: **no existen en este proyecto** (omitidos a propósito en
  `agent-config.yaml`). No se inventan.
- `!important` agregados por esta sesión en `src/styles/multiaviso.css`: **0**
  (verificado sobre el diff). El de `overflow-y` sigue siendo el único de la
  sección de la hoja. Todos los hunks caen adentro del
  `@media (max-width: 699px)`.
- **NO se deployó.** Lo decide el usuario.

#### Lo que NO se pudo verificar localmente

Nada del comportamiento del catálogo. El plugin no renderiza en localhost ni en
previews (whitelist por dominio), así que el fix del punto, el badge, el
aprendizaje de labels y el ancho del riel **no se observaron ni una vez**. En
particular quedan sin comprobar: la forma exacta del texto del chip (si el ✕
viene como nodo de texto o como `<i class="fa">`), qué label queda bajo cada
key `ma_*`, y qué hace el plugin con un `ma_model` huérfano. Checklist de
producción para `npm run deploy`, a ~390px y ~360px:

1. `/usados` sin filtros → **ningún punto** en el riel; ocho filas, ninguna
   sintetizada. (Acá se cae o se confirma el bug reportado.)
2. Aplicar una categoría → al reabrir, **solo** esa categoría trae fila
   sintetizada + badge + punto; el resto sin punto.
3. Tocar una opción sin confirmar → se prende el punto de **esa sola**
   categoría.
4. El badge muestra el valor limpio, sin ✕ duplicada ni restos del ícono del
   chip.
5. ✕ del badge sin nada pendiente → misma URL que el chip de desktop. ✕ con una
   selección pendiente → la selección **sobrevive**. Con Marca+Modelo
   aplicados, sacar Marca: anotar qué hace el plugin con el `ma_model`
   huérfano.
6. Labels: aplicar un filtro y confirmar que el badge trae el nombre aprendido;
   después abrir el mismo link filtrado en una pestaña nueva (sesión limpia) y
   confirmar que cae a **valor solo**, sin categoría inventada.
7. A 360px, el panel de opciones sin desbordes; mirar si alguna opción de orden
   envuelve.

---

## Session 16 — debug-triage on `site` (started 2026-09-20T14:51:33Z)

```yaml
agent: debug-triage
stack: site
session_started_utc: 2026-09-20T14:51:33Z
session_ended_utc: 2026-09-20T14:56:00Z
final_status: completed
handoff_slug: null
files_written:
  - src/components/MultiavisoCatalog.astro
  - documentation/DESIGN.md
```

### 1. Initial approved PLAN — 2026-09-20T14:51:33Z

**Reporte de producción que abre la sesión.** La Session 15 se deployó. La parte
A anda ("funcionando muchísimo mejor"). La parte B es invisible: en
`https://bielcar.vercel.app/vehiculos?ma_brand=Honda` el riel muestra las ocho
categorías sin Marca, sin badge "Honda ✕" y sin ningún puntito, pese a que el
filtro está aplicado (13 resultados y apareció el bloque Modelo).

**Pre-approval iterations:** una, y fue una corrección a un error mío de
método. En el diagnóstico afirmé que el recuento del trigger ("Filtros" vs
"Filtros (1)") era una sonda gratis porque "ya está en la captura" — y yo nunca
vi esa captura. El coordinador la revisó: la hoja está abierta y tapa el
trigger. **Di por verificado algo que había inferido.** Es la segunda vez en
esta tarea. Consecuencias registradas acá y respetadas en lo que se escribió:
si el plugin emite o no un chip para marca **sigue sin determinarse**, no se
escribe en DESIGN.md que `#CurrentFilters` sea una superficie parcial (solo que
su cobertura NO está verificada), y el ítem del recuento del trigger entra
**por decisión del usuario**, no porque la hipótesis esté confirmada.

**Diagnóstico, verbatim del PLAN aprobado:**

La ausencia de puntitos NO es un síntoma aparte y no discrimina entre
hipótesis. En esa URL, con la `ownedKeys` corregida, ninguno de los bloques
presentes posee `ma_brand` —el único que lo poseía era Marca, y el plugin lo
sacó del panel—, así que cero puntitos es el comportamiento correcto. El único
lugar donde `ma_brand` podía encender un punto era la fila sintetizada, que no
existe porque no hay badge: **puntito y badge son el mismo síntoma**.

De ahí que las cuatro hipótesis del coordinador sean indistinguibles leyendo el
código: las cuatro terminan en "no se crea la fila huérfana". Descartes: el
timing queda descartado con confianza (el plugin pinta `td#Filters` y `td#List`
en la misma inyección, y `buildRail` corre recién cuando el usuario abre la
hoja); el bug de construcción es el menos probable pero no está descartado (no
encontré el fallo, lo cual no es lo mismo); las otras dos siguen vivas. Se
agregó una quinta, propia: `chipText()` recorría solo los nodos de texto
directos del `<a>`, así que un `<span>` alrededor del valor lo vaciaba y el
chip se descartaba. En total `appliedFilters()` tenía **cinco puntos de
descarte silencioso**, y ese es el defecto de diseño real.

**Fix aprobado: los filtros aplicados se derivan de la URL, no de los chips.**
Es correcto gane la hipótesis que gane, porque la URL es la única fuente que no
puede faltar. Ítems:

1. `appliedFilters()` sobre `baselineMa()`. `readMa` ya excluye `ma_page` y
   `ma_carid`.
2. Agrupamiento de keys en categorías: por label aprendido (que es agrupar por
   bloque, porque el aprendizaje registra el label para cada key del
   `ownedKeys`); si no hay label, `ma_min_X` + `ma_max_X` por el nombre del
   parámetro; si no, una key = una categoría. **El rango es UN badge**: sacar
   solo el mínimo dejaría un "hasta 20.000" que nadie pidió.
3. Texto: el del chip si hay chip; si no, el valor crudo de la URL, ya
   percent-decodificado por `URLSearchParams`. **Sin title-case, sin
   diccionario, sin capitalización inventada.** Rango sin chip: los valores
   unidos por guion en orden min → max, sin moneda ni separadores.
4. `ma_sort` excluido de los badges por constante explícita: el orden no es un
   filtro que se saque, su bloque está siempre en el panel, y sacarlo revierte
   a un default que el usuario nunca eligió.
5. Guarda de `ma_carid`: en la vista de detalle no hay badges. Sin esto, abrir
   un vehículo compartido (`?ma_carid=...&ma_status=USED`, §6.4) dibujaría un
   badge "USED ✕" arriba de la ficha.
6. `chipText` pasa a `textContent`. Es seguro **porque** ya no es load-bearing:
   si sale vacío, el badge cae al valor de la URL en vez de no dibujarse.
7. `syncFilterCount()` pasa a contar los grupos derivados de la URL.

El agrupamiento a fila real vs. sintetizada NO cambia: sigue siendo "¿algún
bloque presente tiene una key en común con este grupo?".

`src/styles/multiaviso.css` **no se toca**: los estilos del badge y de la fila
sintetizada ya existen y son correctos; el problema es que el nodo nunca se
crea. Esta pasada no dispara `review_required`.

**Strongest alternative considered:** arreglar el lector de chips en vez de
cambiar de fuente (aflojar `chipText`, tolerar que `.current-filter` sea el
propio `<a>`, dejar de descartar cuando `keys` viene vacío). Descartada porque
es una apuesta a una hipótesis que no puedo confirmar: si el plugin no emite
chip para marca, ese trabajo no arregla nada y me entero recién después del
segundo deploy.

**Load-bearing assumption:** que toda key `ma_*` de la URL (fuera de
`ma_page`, `ma_carid` y `ma_sort`) corresponde a un filtro que el usuario puede
querer sacar, y que su valor crudo es presentable. Si el plugin usara
parámetros internos con valores tipo código (`ma_type=3`), el badge mostraría
un número sin significado en la entrada en frío.

**Falsifying observation:** que después de deployar esto el badge SIGA sin
aparecer en `/vehiculos?ma_brand=Honda`. Eso descartaría de una todas las
hipótesis sobre la lectura del chip y dejaría en pie una sola: la construcción
de la fila en `buildRail` o su CSS. El diagnóstico se movería de "de dónde sale
el dato" a "por qué el nodo no llega a la pantalla".

**Approval token:** "PROCEED con todo. El usuario aprobó el plan completo sin
vetos", con el §2.8 incluido por decisión explícita del usuario.

### 2. Plan revision — 2026-09-20T14:52:00Z

**Trigger:** corrección del coordinador antes de escribir una línea: la sonda
que declaré disponible (el recuento del trigger en la captura) no existe, la
hoja abierta lo tapa.

**What changed:** nada del fix —la URL manda en los dos casos, que es el
argumento con el que se aprobó—, pero sí lo que se puede AFIRMAR. En §6.1 de
DESIGN.md se anota que la cobertura de `#CurrentFilters` **no está verificada**,
nunca que sea parcial. El ítem 7 (recuento del trigger) se registra como
decisión del usuario y no como consecuencia de una hipótesis confirmada.

**What this teaches:** "es gratis leerlo, ya está en la captura" fue una
inferencia sobre un artefacto que nunca vi, presentada como hecho. El supuesto
load-bearing del diagnóstico no cambió, pero mi vara para escribir "verificado"
sí: solo lo que yo leí, o lo que otro afirma haber leído y queda atribuido a
esa persona. Todo lo demás es hipótesis, y se escribe como hipótesis.

**Approval token:** "PROCEED con todo" (misma aprobación; la revisión no
cambia el alcance del fix, solo lo que se documenta como sabido).

### 3. Implementation adjustment — 2026-09-20T14:53:00Z

**No re-approval (in scope).** Dos correcciones adentro de ítems ya aprobados.

**(a)** El strip del glifo final en `chipText` deja de incluir `x` / `X`. Con
`textContent` completo, un valor que termina en equis —"Matrix"— quedaba como
"Matri". Solo se sacan `×`, `✕` y `✖`.

**(b)** En el tick del observer, `learnLabels()` pasa a correr ANTES de
`syncFilterCount()`. Con el recuento derivado de la URL, el agrupamiento
necesita los labels: en el primer tick con cache frío, un rango aplicado se
contaba como dos filtros en vez de uno.

**What this teaches:** ampliar la fuente de un dato (de nodos de texto a
`textContent`) amplía también lo que un saneamiento heredado puede romper —el
strip se escribió cuando la entrada era otra. Y convertir un contador en
derivado de otro cálculo lo ata al orden de ese cálculo: lo que antes era una
lectura independiente del DOM ahora tiene una dependencia que el orden del tick
tiene que respetar.

### 4. Verification — 2026-09-20T14:56:00Z

- `npm run check` — **0 errors, 0 warnings, 1 hint**. El hint es el mismo
  preexistente y ajeno de siempre: `src/data/site.ts:14`, `local2` sin usar.
- `npm run build` — **7 páginas, sin errores**.
- Bundle: `ma_sort` ×1 (la exclusión), `ma_carid` ×2 (`IGNORED_PARAMS` + la
  guarda de detalle), `current-filter` ×1 — o sea que `#CurrentFilters` se
  consulta en UN solo lugar, `chipIndex()`, que es puramente decorativo.
- `src/styles/multiaviso.css` **no se tocó en esta sesión** (verificado por
  mtime: 11:37 de la Session 15, contra 11:53 de los archivos de esta). Su `M`
  en `git status` viene de la sesión anterior, sin commitear. **No se disparó
  `review_required`.**
- **NO se deployó.**

#### Lo que NO se pudo verificar localmente

Todo lo que importa. El plugin no renderiza fuera de `bielcar.vercel.app`, así
que el badge sigue sin haberse visto funcionar ni una vez. Y hay dos cosas que
esta sesión **explícitamente no resolvió**:

1. **Si el plugin emite o no un chip para marca: sigue sin determinarse.** La
   sonda que propuse (el recuento del trigger en la captura) no existe — la
   hoja abierta lo tapa. El fix no depende de la respuesta, pero la pregunta
   queda abierta y así está anotada en DESIGN.md §6.1.
2. **Cuál de las cuatro causas hacía fallar el lector de chips.** El fix las
   vuelve irrelevantes en vez de distinguirlas. Si el badge aparece tras el
   deploy, la pregunta muere sin respuesta; si NO aparece, la causa está en
   `buildRail` o en el CSS y el diagnóstico se mueve de "de dónde sale el dato"
   a "por qué el nodo no llega a la pantalla".

#### Checklist de producción (`npm run deploy`, a ~390px y ~360px)

1. `/vehiculos?ma_brand=Honda` → fila **"Marca" + badge "Honda ✕"** arriba del
   riel, con punto. **Es la prueba del fix.**
2. La ✕ de ese badge → `/vehiculos`. Con una selección pendiente sin confirmar,
   la selección **sobrevive**.
3. Esa misma URL en pestaña nueva (sesión limpia) → badge **"Honda ✕" sin la
   palabra "Marca"**. Nunca un nombre adivinado.
4. Un rango aplicado → **un** badge, no dos.
5. Elegir un orden → **ningún** badge de orden; el punto en "Ordenar vehículos"
   sí.
6. Abrir un vehículo (`?ma_carid=`) → **ningún** badge en la hoja.
7. El trigger: con un filtro aplicado tiene que decir **"Filtros (1)"**. Si
   antes decía "Filtros" a secas, eso responde de paso la pregunta del punto 1
   de arriba (el plugin no emitía chip).
8. Sin regresionar: `/vehiculos` sin filtros → **cero puntitos**.

---

## Session 17 — debug-triage on `site` (started 2026-09-20T15:02:00Z)

```yaml
agent: debug-triage
stack: site
session_started_utc: 2026-09-20T15:02:00Z
session_ended_utc: 2026-09-20T15:16:00Z
final_status: completed
handoff_slug: null
files_written:
  - src/components/MultiavisoCatalog.astro
  - src/styles/multiaviso.css
  - documentation/DESIGN.md
```

### 1. Initial approved PLAN — 2026-09-20T15:02:00Z

**Contexto:** la Session 16 se validó en producción — el badge aparece y la
fila sintetizada "Marca" con su punto también.

**Pre-approval iterations:** ninguna. El usuario aprobó el QUÉ explícitamente
y pidió implementar directo, sin otra ronda de PLAN + STOP.

**El pedido:** el badge se muda del riel a la columna derecha. "Marca" y su
punto se quedan en el riel, donde están. Es, en esencia, la barra de aplicados
que se descartó al principio de la tarea; encaja ahora porque el riel ya nombra
la categoría y el badge dejó de necesitar estar pegado al nombre.

**Restricción central:** la columna derecha es `#FilterContent`, markup del
plugin. No se le inyecta nada. La barra es markup nuestro dentro de `.ma-sheet`,
fija, de `left: var(--ma-rail-w)` a `right: 0`, justo debajo de
`.ma-sheet__head`.

**El alto, que es la parte difícil:** `#FilterContent` está anclado por
`bottom` con un `height` calculado; una barra encima sin ajustar el panel le
tapa el arranque. El alto de la barra no es constante, así que se mide en JS y
se publica como custom property en `.catalog` —el patrón que ya existe con
`--ma-filter-count`, no uno nuevo— y el panel lo descuenta en su `calc`.

**Decisiones que quedaron a mi criterio, con la aritmética:**

1. **Scroll horizontal, no wrap.** Con 3-4 filtros y valores largos a 360px una
   barra que envuelve puede llegar a tres líneas (~150px) y se come un tercio
   del panel de una hoja de 80svh. En una sola línea el costo es constante
   (~60px) y predecible. Los badges van `nowrap` y sin truncar: un valor largo
   ensancha el badge y la barra scrollea. El riesgo —un badge fuera de vista a
   la derecha— está cubierto por el punto del riel, que es quien dice qué
   categorías tienen selección.
2. **`--ma-rail-w` vuelve a 116px.** A 13px (`--fs-label`) y con 12px de padding
   por lado quedan 92px útiles contra 116px. Medido contra los ocho labels
   reales: "Rango de kilometraje" (~126px) envuelve **en los dos anchos**, y lo
   mismo "Rango de precios"; "Carrocería" (~63px), "Combustible" y
   "Transmisión" (~69px) entran en los dos. El único que cambia es "Ordenar
   vehículos" (~107px), que pasa de una línea a dos. Ese es el precio de
   devolverle 24px de ancho al panel, que justo ahora pierde alto por la barra.
3. **Fila sintetizada sin label: deja de existir.** Antes, sin label aprendido,
   la fila se dibujaba igual con el badge solo. Con el badge afuera, esa fila
   quedaría vacía — un artefacto sin significado. Ahora no se emite: el riel es
   un índice de nombres y no puede indexar lo que no sabe nombrar. El badge
   sigue en la barra y se puede sacar igual.

**Contracts touched:** ninguno.

**Approval token:** "el usuario ya aprobó el QUÉ explícitamente, implementá
directamente — no hace falta otra ronda de PLAN + STOP", con OK explícito para
el diff de `src/styles/multiaviso.css` (`review_required_paths`). El deploy NO
lo corro yo.

### 2. Implementation adjustment — 2026-09-20T15:14:00Z

**No re-approval (in scope).** Cuatro cosas que el plan no nombraba una por una
y salieron de mover el badge:

1. **`.ma-sheet__rail-row` y `--static` se borraron.** Existían solo para
   apilar el badge debajo del botón sin meter un `<a>` adentro de un
   `<button>`. Sin badge en el riel quedaban como contenedores de un único
   hijo. El riel vuelve a ser una lista plana: botones y spans directos.
2. **`.ma-sheet__rail-badge` pasó a llamarse `.ma-sheet__applied-badge`.** Ya
   no vive en el riel; el nombre viejo mentía.
3. **El reparto `claimed` / `orphans` se simplificó a un `filter`.** Antes
   decidía dónde colgar cada badge; ahora los badges van todos a la barra y el
   reparto solo responde "¿le falta al riel una fila para esta categoría?".
   `claimed` quedaba poblado y sin leer.
4. **La transición duplicada de la barra se sacó.** La regla compartida de las
   cajas fijas ya declara `transform` + `transition`; repetirla en
   `.ma-sheet__applied` era ruido con el mismo valor.

**What this teaches:** mover una pieza deja atrás la estructura que existía
para sostenerla en el lugar viejo. La fila contenedora, el nombre de la clase y
el reparto por categoría no eran decisiones independientes: eran consecuencias
de que el badge viviera adentro del riel, y al mudarlo hay que ir a buscarlas
una por una o quedan como andamio.

### 3. Verification — 2026-09-20T15:16:00Z

- `npm run check` — **0 errors, 0 warnings, 1 hint** (el preexistente y ajeno
  de `src/data/site.ts:14`, `local2` sin usar).
- `npm run build` — **7 páginas, sin errores**.
- Geometría verificada **en el CSS construido**, no en el fuente:
  - barra → `left: var(--ma-rail-w)`, `bottom: calc(var(--ma-sheet-h) - var(--ma-sheet-head) - var(--ma-applied-h))`
  - panel → `bottom: var(--ma-sheet-foot)`, `height: calc(var(--ma-sheet-h) - var(--ma-sheet-head) - var(--ma-sheet-foot) - var(--ma-applied-h,0px))`
  - o sea: `__head` ocupa `[H-head, H]`, la barra `[H-head-barra, H-head]` y el
    panel `[foot, H-head-barra]`. Encajan sin hueco ni solape.
  - **El riel no cambia de alto** (`[foot, H-head]`, como antes) y la barra
    arranca en `--ma-rail-w`, así que nunca lo cubre. Confirmado.
- Bundle JS: `data-ma-applied-bar`, `ma-applied-h`, `ma-sheet__applied-badge` y
  `ResizeObserver` presentes. CSS construido: `--ma-rail-w: 116px`,
  `--ma-applied-h: 0px`, y **cero** reglas `ma-sheet__rail-row`.
- `!important` agregados en esta sesión: **0**.
- **NO se deployó.** Lo corre el usuario.

#### Lo que NO se pudo verificar localmente

Todo lo visual, como siempre: el plugin no renderiza fuera de
`bielcar.vercel.app`. En particular **nada de la aritmética del alto se vio
funcionando**: que la barra no tape el arranque del panel, que el panel
recupere su alto al no haber filtros, y que la medición del `ResizeObserver`
llegue a tiempo en la primera apertura, son cálculos verificados en el CSS
construido pero nunca observados en pantalla. Tampoco se vio si "Ordenar
vehículos" a 116px envuelve tan feo como para querer volver a 140.

#### Checklist de producción (`npm run deploy`, ~390px y ~360px)

1. `/vehiculos?ma_brand=Geely` → **"Marca •" en el riel**, y **"Geely ✕" en la
   barra de arriba a la derecha**, nunca adentro del riel.
2. El panel arranca **debajo** de la barra: se lee entero "1 a 12 de N
   resultados" y el título de la primera categoría.
3. `/vehiculos` sin filtros → **no hay barra**, y el panel llega hasta abajo de
   la barra superior (recupera el alto).
4. Con 3-4 filtros aplicados y valores largos → la barra **scrollea en
   horizontal**, se mantiene en una línea, y el panel no pierde más alto.
5. La ✕ de un badge de la barra saca ese filtro y **conserva lo pendiente**.
6. El riel: "Ordenar vehículos" a 116px — mirar si envuelve a dos líneas y si
   molesta. Si molesta, el número está en un solo lugar (`--ma-rail-w`).
7. Sin regresionar: cero puntitos falsos, `?ma_carid=` sin barra ni badges,
   rango = un solo badge.

---

## Session 18 — debug-triage on `site` (started 2026-09-20T15:22:00Z)

```yaml
agent: debug-triage
stack: site
session_started_utc: 2026-09-20T15:22:00Z
session_ended_utc: 2026-09-20T21:00:00Z
final_status: completed
handoff_slug: null
files_written:
  - src/components/MultiavisoCatalog.astro
  - src/styles/multiaviso.css
  - documentation/DESIGN.md
```

### 1. Initial approved PLAN — 2026-09-20T15:22:00Z

**Contexto:** la Session 17 se deployó y el usuario la vio en producción con
`/vehiculos?ma_brand=Geely&ma_type=suv`. Funciona. Pide tres cambios, todos con
el QUÉ ya aprobado por él (eligió la disposición con un preview a la vista), así
que se implementan directo.

**Pre-approval iterations:** ninguna en esta sesión. Una advertencia explícita
del coordinador que sí cambia lo que se implementa: el preview que el usuario
eligió mostraba el riel con el orden VIEJO (aplicadas primero, Ordenar después).
Ese preview ilustraba la disposición de los badges, **no el orden**. El orden
que manda es el del cambio 3.

**Cambio 1 — los badges se apilan con el título de su categoría.** La columna
derecha pasa de una fila horizontal de badges a un bloque vertical: por cada
filtro aplicado, un encabezado con el nombre de la categoría y debajo su badge.
El encabezado imita el estilo de `.filter-block-label` del plugin (uppercase,
`--fs-eyebrow`, `--tracking-caps`, `--ma-text`) para que la columna se lea
continua, pero es **markup nuestro**: no se toca un solo nodo del plugin. El
nombre queda escrito dos veces —en el riel y acá— y el usuario lo eligió
sabiéndolo. Sin label aprendido, el badge va solo, sin encabezado.

**Cambio 2 — capitalizar la primera letra del valor.** `suv` → `Suv`, por CSS
sobre el span del valor. El dato sigue saliendo crudo de la URL o del chip y el
`href` de remoción no se toca.

**Cambio 3 — orden del riel:** "Ordenar vehículos" siempre primera, después las
categorías con filtro aplicado, después el resto.

**Contracts touched:** ninguno.

**Approval token:** "El QUÉ ya está aprobado por él (eligió la disposición con
un preview a la vista), así que implementá directamente", con OK para
`multiaviso.css`. El deploy NO lo corro yo.

### 2. Plan revision — 2026-09-20T20:55:00Z

**Trigger:** a mitad de implementación, el usuario aclaró el modelo completo y
lo pedido resultó no ser implementable con la zona de aplicados como caja fija
arriba. Quería, en la columna derecha y en un solo scroll: bloque de orden,
después las secciones de activos, después el resto de los filtros del plugin; y
el riel en ese mismo orden, con sus filas anclando también a las secciones de
activos.

**El choque:** nuestras secciones tendrían que quedar ENTRE el bloque de orden
y los demás bloques, y los tres viven en el flujo scrolleable de
`#FilterContent`, que es árbol del plugin. Una caja `position: fixed` por fuera
solo puede ir arriba de todo.

**Las dos salidas analizadas:**

- **A — insertar un contenedor nuestro como hijo de `#FilterContent`.** Cumple
  lo pedido exacto. Rompe la regla de CLAUDE.md de no manipular con JS el
  markup del plugin.
- **B — dejar la caja fija arriba**, con orden visual activos -> orden -> resto
  y el riel copiándolo. No toca el árbol ajeno; el bloque de orden queda
  segundo y las filas de activas no pueden ser anclaje.

**Hallazgo técnico que salió del análisis y cambia la forma de A:** la variante
que se había descrito —`#FilterContent` en `display: flex` + `order` sobre los
hijos— **no es viable**. jQuery abre el panel escribiendo `display: block`
INLINE, que le gana a la hoja: el panel nunca sería flex y `order` no haría
nada. Forzarlo con `display: flex !important` (permitido por §6.3 para estilos
inline) haría que el `display: none` del cierre también quedara pisado, y
`isOpen()` —que lee `getComputedStyle(panel).display`— nunca leería el panel
como cerrado: se rompe la máquina de apertura. La variante real era A′:
`insertBefore` después del bloque de orden, sin flex, sin `order` y sin
`!important` nuevo. Con una condición dura: el contenedor NO puede llevar la
clase `.filter-block`, porque `getBlocks()` es `:scope > .filter-block` y sus
índices son posicionales — un nodo nuestro ahí adentro correría el `nth` de
todos los bloques y rompería `selections`, `data-ma-cat`, el scrollspy y
`compose()` de una.

**Los números que se le pasaron al usuario para decidir** (zona apilada, ~70px
por categoría más separación; caja = 82N + 12):

| Filtros | Caja | 390x844 (hoja 675px) | 360x640 (hoja 512px) |
|---|---|---|---|
| 1 | 94px | 14% — panel 453px | 18% — panel 290px |
| 2 | 176px | 26% — panel 371px | 34% — panel 208px |
| 3 | 258px | 38% — panel 289px | **50%** — panel 126px |
| 4 | 340px | **50%** — panel 207px | **66%** — panel 44px |

**Decisión del usuario: B, con tope de altura.** La tomó con los números a la
vista, sabiendo que el bloque de orden queda segundo, que las filas de activas
no anclan, y que la variante `flex` + `order` que se le había descrito no era
viable. **Su razón: no tocar el árbol del plugin.** La regla se respeta tal como
está escrita.

**What this teaches:** una restricción de arquitectura —"esto es markup ajeno"—
no limita solo CÓMO se implementa: limita QUÉ se puede pedir. El orden de tres
piezas en una columna parece una decisión de diseño libre, y resultó ser una
consecuencia de quién es dueño del contenedor. Conviene detectarlo antes de
ofrecer la forma, no después.

**Approval token:** "DECISIÓN FINAL DEL USUARIO, con tus números a la vista: B,
con tope de altura en la zona de aplicados", con OK para `multiaviso.css`.

### 3. Implementation adjustment — 2026-09-20T20:58:00Z

**No re-approval (in scope).** El orden del riel quedó invertido ANTES de que
llegara la decisión final —se había aplicado siguiendo la instrucción previa
("Ordenar vehículos primera") y después se dio vuelta cuando esa instrucción se
revocó—. Con B confirmada, el orden que ya estaba escrito (activas -> orden ->
resto) es el correcto y **no se volvió a tocar**.

También quedó sin tocar `paintCategory` al abrir: pinta `entries[0]`, la primera
categoría **en orden de bloque** (el bloque de orden), no la primera fila del
riel. Son cosas distintas desde que el riel se reordena, y es a propósito: el
panel arranca en `scrollTop = 0`, donde lo que se ve es el bloque de orden.
Marcar la primera fila del riel —una categoría aplicada cuyo bloque está más
abajo— diría una cosa mientras el panel muestra otra, y el primer evento de
scroll lo corregiría con un parpadeo.

**What this teaches:** cuando el orden visual de un índice deja de coincidir con
el orden del contenido que indexa, "el primero" se vuelve ambiguo y hay que
elegir explícitamente contra cuál de los dos se resuelve. Acá manda el
contenido, porque es lo que el ojo está viendo.

### 4. Verification — 2026-09-20T21:00:00Z

- `npm run check` — **0 errors, 0 warnings, 1 hint** (el preexistente y ajeno de
  `src/data/site.ts:14`, `local2` sin usar).
- `npm run build` — **7 páginas, sin errores**.
- Tope verificado en el CSS construido: `max-height: calc(var(--ma-sheet-h)/3)`
  con `overflow-y: auto` y `overscroll-behavior: contain` en
  `.ma-sheet__applied`.
- Clampeo de `--ma-applied-h`: se mide `offsetHeight` (alto renderizado, ya
  limitado por el `max-height`; la caja está fuera de `#MultiavisoWrapper`, así
  que vale el `border-box` global y el tope incluye el padding). Queda escrito
  en el código que medir `scrollHeight` reintroduciría el bug.
- `!important` agregados en esta sesión: **0**.
- **NO se deployó.**

#### Lo que NO se pudo verificar localmente

Todo lo visual: el plugin no renderiza fuera de `bielcar.vercel.app`. En
particular no se vio funcionar el tope —ni cuántas categorías entran antes de
que la caja scrollee, ni si el corte de la última sección visible se lee como
scroll o como bug—, ni el apilado con encabezados, ni el nuevo orden del riel.

**Pendiente de decisión del usuario, no implementado:** en un teléfono de
360x640 con exactamente 2 filtros, la caja mide 176px contra un tope de 171px, o
sea que scrollea por ~5px y el corte queda como una astilla. Es el caso que
puede leerse como bug en vez de como scroll. Dos remedios posibles, ninguno
aplicado por cuenta propia: subir el tope a `calc(var(--ma-sheet-h) * 0.36)`
(entran dos categorías enteras en los dos tamaños), o agregar un degradado al
borde inferior de la caja como afordancia de "hay más abajo".

#### Checklist de producción (`npm run deploy`, ~390px y ~360px)

1. `/vehiculos?ma_brand=Geely&ma_type=suv` → arriba a la derecha, dos secciones
   apiladas: `MARCA` / `Geely ✕` y `CARROCERÍA` / `Suv ✕`. Valor con inicial
   mayúscula.
2. El encabezado tiene que leerse igual que `ORDENAR VEHÍCULOS` del panel de
   abajo: misma caja tipográfica, mismo color.
3. El panel arranca **debajo** de la zona: se lee entero "1 a 12 de N
   resultados".
4. Riel, de arriba a abajo: **Marca, Carrocería** (las activas), **Ordenar
   vehículos**, y después el resto.
5. Con 3-4 filtros aplicados: la zona **deja de crecer** y scrollea por dentro;
   el panel conserva al menos dos tercios menos head/foot.
6. Tocar una fila de categoría activa que el plugin SÍ sigue ofreciendo →
   scrollea a su bloque. Tocar una sintetizada → no hace nada (aceptado).
7. Sin regresionar: cero puntitos falsos, `?ma_carid=` sin zona de aplicados, la
   ✕ conserva lo pendiente, rango = un solo badge.

---

## Session 19 — debug-triage on `site` (started 2026-09-20T21:10:00Z)

```yaml
agent: debug-triage
stack: site
session_started_utc: 2026-09-20T21:10:00Z
session_ended_utc: 2026-09-20T21:40:00Z
final_status: completed
handoff_slug: null
files_written:
  - src/components/MultiavisoCatalog.astro
  - src/styles/multiaviso.css
  - documentation/DESIGN.md
  - CLAUDE.md
```

### 1. Initial approved PLAN — 2026-09-20T21:10:00Z

**El cambio de decisión.** La Session 18 (opción B: zona de aplicados como caja
fija arriba, con tope de altura) se deployó y el usuario la vio funcionando.
Pidió que la zona deje de ser fija y **scrollee junto con la lista de filtros**.
Eso es exactamente A′ — lo que había descartado dos sesiones atrás. Se le
explicó que era A′, que la alternativa sin tocar el plugin (sincronizar el
scroll por JS) tiende a temblar en iOS, y que implica **cambiar la regla de
CLAUDE.md**. Eligió A′ sabiéndolo.

Vale dejar registrado por qué el ida y vuelta no fue criterio inestable: B se
eligió sobre una descripción, A′ se eligió sobre B **funcionando en el
teléfono**. Lo que cambió no fue la preferencia sino la información.

**Qué se implementa (el análisis de A′ ya estaba hecho en la Session 18):**

1. `insertBefore` de un contenedor NUESTRO después del bloque de orden, dentro
   de `#FilterContent`. Sin `flex`, sin `order`, sin `!important` nuevo. Orden
   resultante en la columna derecha: `#Counts`, orden, nuestras activas, el
   resto.
2. El contenedor **no lleva la clase `.filter-block`**. Es la condición que lo
   hace invisible para `getBlocks()`, los índices `nth`, `selections`,
   `data-ma-cat`, el scrollspy y `compose()`.
3. `ensureAppliedNode()` idempotente, llamado desde el tick de rAF que ya
   existe. Idempotencia y NO un flag "estoy mutando": el callback del
   MutationObserver llega como microtask, así que un flag sincrónico sería una
   carrera.
4. Se elimina TODO el andamiaje de la caja fija: `--ma-applied-h`, el
   `ResizeObserver`, `measureApplied()`, la resta de altura del panel, el
   `position: fixed`, el tope y su `overflow`, y la entrada en la regla
   compartida de `transform` del chrome. El nodo pasa a vivir dentro de
   `#MultiavisoWrapper`, así que no lleva transform propio.
5. El orden del riel vuelve a "Ordenar vehículos" → activas → resto, para copiar
   lo que ahora se ve a la derecha.
6. Las filas sintetizadas vuelven a ser navegables: ahora tienen destino.

**Approval token:** "El usuario cambió de decisión con el resultado a la vista:
va A′. (…) Eligió A′ sabiendo que cambia la regla de CLAUDE.md. Implementá
directamente", más autorización explícita para editar `CLAUDE.md`. El deploy NO
lo corro yo.

### 2. Implementation adjustment — 2026-09-20T21:35:00Z

**No re-approval (in scope).** Cinco cosas que salieron de implementar la
inserción, ninguna prevista palabra por palabra en el plan.

**(a) El `display: none` de desktop habría ocultado la zona SIEMPRE.** La regla
que la muestra vive adentro de `@media (max-width: 699px)` y usa
`.catalog #MultiavisoWrapper #FilterContent > .ma-sheet__applied`. La regla que
la esconde en desktop, escrita después en el archivo con la MISMA
especificidad, le ganaba también abajo de 700px. Se encerró en
`@media (min-width: 700px)`. `.ma-sheet` puede darse el lujo de un
`display: none` suelto porque su regla de mobile tiene una clase más; esta no.

**(b) El atributo `hidden` tampoco hacía nada** por lo mismo: `[hidden]` pelado
perdía contra un selector con dos IDs. La regla se reescribió con el mismo
prefijo más `[hidden]`.

**(c) El scrollspy pasó a ordenar por `offsetTop`.** Antes recorría las
categorías por índice de bloque y se quedaba con la última que cruzó el umbral;
eso valía porque el orden visual coincidía con el de los índices. Con un nodo
nuestro intercalado esa garantía se debilita, así que `spySections()` arma la
lista de secciones y la ordena por geometría. De paso elimina la suposición
implícita en vez de heredarla.

**(d) Las filas del riel tienen ahora dos atributos.** `data-ma-target` (a qué
sección scrollea: un `nth` o `applied`) y `data-ma-cat` (qué bloque del plugin
le corresponde, que `paintPending` usa para el punto). Las filas de categorías
ya filtradas tienen target pero no tienen bloque, y por eso no alcanzaba con
uno solo.

**(e) Dos afirmaciones viejas de DESIGN.md quedaron falsas** con la excepción y
se corrigieron: §6 abría con "Solo CSS" sin matices, y §8 decía "el único write
al árbol del plugin es `data-ma-pending`". Las dos ahora remiten a la excepción
acotada.

**What this teaches:** una regla nueva que convive con otra vieja del mismo
peso se decide por orden de aparición, no por intención. Al mover un nodo a un
contenedor con más especificidad de contexto, TODAS las reglas que lo
gobernaban desde afuera —incluido algo tan básico como `[hidden]`— dejan de
alcanzar. El cambio de padre no es solo un cambio de layout: es un cambio de
quién gana.

### 3. Verification — 2026-09-20T21:40:00Z

- `npm run check` — **0 errors, 0 warnings, 1 hint** (el preexistente y ajeno de
  `src/data/site.ts:14`).
- `npm run build` — **7 páginas, sin errores**.
- Andamiaje viejo: **no queda nada**. `grep` de `--ma-applied-h`,
  `measureApplied`, `ResizeObserver` y `rail-static` sobre los dos archivos da
  cero ocurrencias de código; la única aparición de `--ma-applied-h` es una
  mención histórica adentro de un comentario que explica qué se sacó y por qué.
- CSS construido: `#FilterContent` volvió a
  `height: calc(var(--ma-sheet-h) - var(--ma-sheet-head) - var(--ma-sheet-foot))`,
  sin resta. La zona quedó como `display: flex` en el flujo dentro del media
  query de mobile, y `display: none` dentro de `@media (width>=700px)`.
- HTML construido: el nodo es `<div class="ma-sheet__applied" data-ma-applied-bar hidden>`
  — **sin `.filter-block`**, que es la condición que lo hace invisible para
  `getBlocks()` y los índices.
- Las dos reglas `:nth-child` del panel siguen en pie: el minificador dejó
  `:first-child` para `#Counts` (equivalente, y sigue siendo el primer hijo
  porque insertamos DESPUÉS del bloque de orden) y `:nth-child(n+2)` para el
  filete, que sigue aplicando a todos los bloques posteriores.
- Bundle: `insertBefore` ×1, `previousElementSibling` ×1 (la guarda de
  idempotencia), `maTarget` ×3.
- `!important` agregados: **0**.
- **NO se deployó.**

#### Lo que NO se pudo verificar localmente

Todo lo que importa de esta sesión, y esta vez es más que de costumbre: el
plugin no renderiza fuera de `bielcar.vercel.app`, así que **la inserción nunca
se ejecutó**. No se vio que `#FilterContent` exista con el bloque `#Sort`
adentro, ni que el nodo caiga en la posición correcta, ni que la guarda de
idempotencia corte el ciclo del `MutationObserver` en un tick, ni que el
scrollspy marque bien al pasar por encima de nuestra zona, ni que las filas de
activas anclen. Todo eso está razonado contra el DOM documentado en §6.1 y
contra el código, no observado.

**Riesgo residual anotado:** si en producción `#FilterContent` no tuviera un
hijo directo `#Sort`, el fallback recorre los bloques buscando el que controla
`ma_sort`; si tampoco lo encontrara, la zona se inserta como PRIMER hijo, o sea
arriba de `#Counts`. No rompe nada —el orden sería otro— pero es el primer
lugar donde mirar si el resultado no se ve como el diagrama de §8.

#### Fuera del set de archivos: algo que quedó desactualizado y NO toqué

`.claude/agent-config.yaml`, en el bloque `multiaviso:`, dice: *"Agents may
restyle it via CSS but must NEVER manipulate it with JavaScript"*. Con la
excepción aprobada, eso quedó incompleto. **No lo edité**: ese archivo es
propiedad de `/calibrate` y estaba fuera del set autorizado. Conviene correr
`/recalibrate` o pedir el cambio explícito, o el próximo agente va a leer la
versión absoluta de la regla y a "arreglar" esta sesión.

#### Checklist de producción (`npm run deploy`, ~390px y ~360px)

1. `/vehiculos?ma_brand=Geely&ma_type=suv` → la columna derecha, en un solo
   scroll: "1 a 12 de N resultados", "ORDENAR VEHÍCULOS", después **MARCA /
   Geely ✕** y **CARROCERÍA / Suv ✕**, después el resto de los filtros.
2. Scrollear la columna hasta el fondo: **la zona de aplicados se va con el
   scroll**, no queda pegada arriba.
3. Riel, de arriba a abajo: **Ordenar vehículos**, Marca, Carrocería, el resto.
4. Tocar "Marca" en el riel → scrollea hasta la zona de aplicados. Tocar
   "Combustible" → scrollea a su bloque, como siempre.
5. Scrollear a mano y mirar el riel: al pasar por la zona de aplicados tiene que
   marcarse una fila de activa, y al seguir bajando, la categoría que
   corresponda. Que no se quede marcando "Ordenar vehículos" de más.
6. Abrir y cerrar la hoja tres o cuatro veces: la zona tiene que seguir en su
   lugar (la guarda de idempotencia) y no aparecer duplicada.
7. En desktop (>=700px): la zona **no se ve** en la sidebar del plugin; ahí
   siguen los chips de `#CurrentFilters`.
8. Sin regresionar: cero puntitos falsos, `?ma_carid=` sin zona, la ✕ conserva
   lo pendiente, rango = un solo badge, el valor capitalizado.
