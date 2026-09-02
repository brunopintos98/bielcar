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
- Comportamiento real: `npm run deploy` (plugin no renderiza en local)
