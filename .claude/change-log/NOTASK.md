# Decision ledger — NOTASK

> Append-only ledger de cada sesión de escritura que toca esta tarea. Cada bloque `## Session N` es una sesión. Los bloques anteriores no se editan; los posteriores los sustituyen.
>
> Nombre `NOTASK.md` porque el proyecto todavía no es un repo git (`Is a git repository: false`), así que no hay branch de la que derivar una clave de tarea.

---

## Session 1 — main thread on `bielcar` (started 2026-08-26T16:00:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T16:00:00Z
session_ended_utc: 2026-08-26T16:17:09Z
final_status: completed
handoff_slug: home
files_written:
  - src/pages/index.astro
  - src/components/HomeHero.astro
  - src/components/AccessTiles.astro
  - src/components/FeaturedCarousel.astro
  - src/components/ServicesBlock.astro
  - src/components/ServiceCta.astro
  - src/components/MultiavisoCatalog.astro
  - src/components/Icon.astro
  - src/data/site.ts
  - README.md
```

### 1. PLAN — paso 3 del plan de construcción (Home)

Armar la composición de `DESIGN.md` §7 para `/`, reemplazando el `<Stub>` del scaffold:
hero full-bleed, 3 accesos, carrusel de destacados de Multiaviso, bloque de servicios
en banda clara y CTA de service por WhatsApp.

**Alternativa más fuerte considerada.** Meter el carrusel de destacados directamente en
`MultiavisoCatalog.astro` con un prop `viewMode`, en vez de un componente
`FeaturedCarousel` aparte. Se descartó porque el estado vacío de §7 (ocultar la sección
entera si el contenedor queda sin hijos) es exclusivo del carrusel: el listado vacío de
`/usados` tiene que seguir mostrando los filtros y el mensaje del plugin. Mezclar las
dos responsabilidades en un componente metía una rama de comportamiento en el único
punto del sitio que toca territorio ajeno.

**Supuesto que carga el peso.** Que el markup que el plugin inyecta en modo `CAROUSEL`
reutiliza las clases `.item` / `.item-image` / `.item-title` / `.item-price` del modo
`LIST`, y que por lo tanto los overrides que ya existen en `multiaviso.css` lo alcanzan
sin escribir selectores nuevos. §6.1 documenta la estructura del LISTADO, no la del
carrusel — no está verificada.

**Observación que lo falsaría.** Un deploy a `bielcar.vercel.app` donde el carrusel
aparezca con la tipografía del plugin (Open Sans / Jost), imágenes sin recortar a 16:10
o el azul propio del plugin en los links. Cualquiera de las tres significa que el
carrusel usa otras clases y que hace falta una sección nueva en `multiaviso.css`, escrita
contra el HTML capturado en producción y no contra el documento.

**Token de aprobación:** "dalen omas" (el usuario pidió avanzar sin la parada; también
descartó el paso previo de actualizar `CLAUDE.md`, que no estaba desactualizado).

### 2. Decisión — la franja de marcas no se duplica en el Home

`DESIGN.md` se contradice: §7 pone la franja en el cuerpo del Home, §5.8 la pone como
parte 1 del footer. Las dos juntas la dan dos veces en la misma página. Se dejó solo la
del footer, que ya existía desde el paso 1 y aparece en todas las rutas. Anotado como
decisión abierta en el README con la vuelta atrás explícita (renderizarla en
`index.astro` y suprimirla en `Footer.astro` solo para `/`).

**Qué enseña:** cuando el contrato se contradice, la salida no es elegir en silencio: es
elegir el default más barato de revertir y dejar escrito dónde se revierte.

### 3. Decisión — `listingType: 'ALL'` en el carrusel, no `'FEATURED'`

§6.4 fija `'FEATURED'` como config de producción, pero Sebastián no marcó destacados. Con
`'FEATURED'` hoy el contenedor vuelve vacío, el estado vacío de §7 se traga la sección y
el Home pierde su bloque de stock. §6.4 propone `'ALL'` justamente para probar mientras
tanto. Queda como valor único en `index.astro`, con el pendiente destildado en el README.

### 4. Decisión — 4 ítems de servicio y un `<Placeholder>`, no 6

§5.7 pide una grilla 2x3. Se pueden afirmar cuatro servicios sin inventar: 0km, usados,
permuta (§5.7 la nombra textual) y service oficial (tiene página propia en §7). Los dos
candidatos obvios que faltan —financiación, garantía, gestoría— no los confirmó nadie.

**Qué enseña:** la regla de no inventar datos no se limita a los campos `null` de
`site.ts`. Un servicio que la automotora no presta es el mismo tipo de dato falso que un
número de WhatsApp inventado, y encima con consecuencia comercial.

### 5. Ajuste de implementación — el estado vacío observa, no arranca oculto

No hay re-aprobación (en alcance). La lectura literal de §7 ("ocultar la sección si no
tiene hijos") invita a arrancar con `display: none` y revelar. Un carrusel de jQuery mide
anchos al inicializar y dentro de un `display: none` los mide en 0. La sección arranca
visible y en flujo, un `MutationObserver` la deja quieta apenas aparece el primer hijo, y
un timeout de 6s la oculta solo si de verdad quedó vacía.

**Qué enseña:** §6.2 dice que el riesgo no es reconstruir el layout sino romper lo que ya
anda. Eso aplica también a los estados que agregamos alrededor del plugin, no solo a los
selectores que le pisamos.

### 6. Verification — 2026-08-26T16:17:02Z

- `npm run check` (astro check): 28 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas, OK
- Orden de scripts en `dist/index.html`: `plugin.js` → jQuery → init inline, los tres
  en `<head>` y sin bundlear (`is:inline` respetado). Verificado sobre el HTML generado.
- `Multiaviso.initialize` emitido con `viewMode: 'CAROUSEL'`, `condition: 'ALL'`,
  `listingType: 'ALL'`, `carousel: { maxItems: 12 }` — coincide con §6.4.
- Un solo `#MultiavisoContainer` en el documento.
- **Sin verificar:** todo lo que dependa de que el plugin renderice. El whitelist es por
  dominio; requiere `npm run deploy`.

---

## Session 2 — main thread on `bielcar` (started 2026-08-26T16:35:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T16:35:00Z
session_ended_utc: 2026-08-26T16:52:00Z
final_status: completed
handoff_slug: home
files_written:
  - src/data/site.ts
  - src/components/BrandStrip.astro
  - src/components/Header.astro
  - src/components/Footer.astro
  - src/components/AccessTiles.astro
  - src/components/ServicesBlock.astro
  - public/img/logo.png
  - public/img/logo-on-dark.png
  - public/img/home/{nuevos,usados,todos}.webp
  - README.md
```

### 1. Contexto — llegaron datos que estaban bloqueando

Sebastián mandó: las 3 fotos de los tiles del Home, el número de WhatsApp
(098 010 230 / +59898010230), la lista de marcas (Geely, Lynk & Co, JAC,
Mitsubishi) y un logo. Siguen pendientes los destacados, los mails, las redes,
los sábados, la foto del local y la lista completa de servicios.

**Consecuencia no obvia:** la lista de marcas **cambió** respecto de lo que
asumía el scaffold. Great Wall estaba en `LEGACY_BRAND_LOGOS` porque su logo
existe en el sitio viejo, y no está en la lista confirmada. Entró Lynk & Co, de
la que no hay archivo. O sea que tener el logo nunca fue evidencia de la
relación comercial — que es exactamente lo que advertía el comentario del paso 1.

### 2. Decisión — el logo se procesa, no se usa crudo

El PNG que mandó es 254x72 RGB **sin canal alpha**: wordmark negro y engranaje
petróleo sobre blanco sólido. Sobre `--surface-dark-raised` eso es un rectángulo
blanco. Se generaron dos variantes con alpha derivadas del original, recuperando
la cobertura de tinta (`a = (255 - min(r,g,b)) / 255`) en vez de recortar por
umbral, para conservar el antialias.

**Alternativa más fuerte considerada.** `filter: brightness(0) invert(1)` en CSS,
que es lo que ya hace BrandStrip con los logos de marca. Se descartó porque
aplana el engranaje petróleo a blanco: en los logos de marca eso es justamente
lo que pide §5.6, pero el engranaje de Bielcar **es** el color de marca y perderlo
en el header es perder la única aparición del petróleo arriba de la página.

**Corrección durante la implementación.** La primera pasada recoloreaba todos los
píxeles cromáticos a `--brand-bright` uniforme, y el engranaje salió como un
círculo liso: no es un disco plano, tiene el dibujo interno en un teal más claro
(#009BC7 contra #007E9F) y un color único borra esa diferencia. La versión final
invierte **solo los neutros** y deja el engranaje intacto — §2.2 habilita ~4.2:1
para íconos grandes, que es exactamente este caso.

**Qué enseña:** antes de recolorear un asset hay que mirar de qué está hecho. El
"engranaje teal" eran dos teales, y el que llevaba el dibujo era el que se perdió.

**Hallazgo lateral.** El engranaje mide **#007E9F**, prácticamente idéntico al
`--brand` #007F9E que §2 dedujo de un tally de colores computados del sitio
viejo. La paleta queda confirmada contra el archivo de marca.

### 3. Decisión — la marca sin logo cae a wordmark tipográfico, no a hueco

Lynk & Co no tiene archivo. §5.6 pide "wordmarks en blanco": un wordmark
tipográfico blanco al 75% es una lectura literal de eso, no un provisorio falso,
así que la franja no se rompe. El `<Placeholder>` queda igual para que el archivo
real no se olvide.

**Qué enseña:** el placeholder amarillo es para datos que no tenemos, no para
fidelidad degradada. Cuando existe un fallback honesto, van los dos: el fallback
para que la página funcione y el placeholder para que no se dé por terminada.

### 4. Decisión — el hero del Home sigue sin foto

Las tres fotos son de vehículos y están nombradas por tile (`foto-nuevos`,
`foto-usados`, `foto-todos`). El hero de §5.2 pide el **local**. Poner ahí una de
las tres sería decidir por el cliente qué cara tiene su automotora en la primera
pantalla. Queda con `<Placeholder>` y se ofreció el swap provisorio en la
respuesta.

### 5. Implementation adjustment — los tiles pasan de background-image a `<img>`

No hay re-aprobación (en alcance). Con la foto real conviene `<img>` +
`object-fit: cover`: habilita `alt`, `loading` y `decoding`, que un
`background-image` no tiene. El `object-position: center 60%` sale de que las
tres fotos son apaisadas (1920x1080 y 1920x1280) contra un tile 3/4 vertical, y
el centro geométrico corta la carrocería.

**Qué enseña:** la elección entre background e `<img>` no es de estilo, depende de
si la imagen es contenido. Vacío era decoración; con foto real es contenido.

### 6. Verification — 2026-08-26T16:52:00Z

- `npm run check`: 28 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas, OK
- Variantes del logo revisadas compuestas sobre `--surface-dark`,
  `--surface-dark-raised` y `--surface-light`: dibujo del engranaje conservado en
  las tres, wordmark legible, "AUTOMÓVILES" en gris medio y no invisible
- `wa.me/59898010230` presente en el Home con los dos textos prellenados; el FAB
  renderiza como `<a class="fab">` y ya no como el marcador rojo
- Placeholders restantes en el build: mail de ventas, redes sociales, sábados,
  logo de Lynk & Co, foto del local, servicios faltantes. Ningún placeholder de
  WhatsApp ni de marcas
- **Sin verificar:** todo lo que dependa de que el plugin renderice

---

## Session 3 — main thread on `bielcar` (started 2026-08-26T17:05:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T17:05:00Z
session_ended_utc: 2026-08-26T17:20:00Z
final_status: completed
handoff_slug: home
files_written:
  - src/data/site.ts
  - src/components/TopBrands.astro
  - src/components/BrandStrip.astro
  - src/components/ServicesBlock.astro
  - src/components/Footer.astro
  - src/components/Icon.astro
  - src/components/AccessTiles.astro
  - src/pages/index.astro
  - README.md
```

### 1. Decisión — las marcas se parten en tres listas

Sebastián aclaró que "servicio oficial" y "punto de venta" no son lo mismo: son 4
marcas de service (Geely, Lynk & Co, JAC, Mitsubishi) y 7 de venta (esas más Honda,
MG y Volvo). Antes había una sola constante `OFFICIAL_BRANDS`, que con ese dato
pasaba a ser una afirmación falsa: el bloque de servicios habría dicho que Bielcar
hace service oficial de Volvo.

Quedan `SERVICE_BRANDS`, `SALES_BRANDS` y `TOP_BRANDS`. `BrandStrip` dejó de leer una
constante fija y ahora recibe la lista y un **título obligatorio** por prop: una franja
de logos sin decir de qué son es exactamente la ambigüedad que causó el problema.

**Qué enseña:** una lista de nombres no es un dato, es un dato *más un predicado*. Si el
predicado no está en el nombre de la constante, alguien la va a reusar bajo otro.

### 2. Conflicto de datos sin resolver — GWM en el texto de servicio oficial

El texto que mandó Sebastián para el ítem "Servicio oficial" dice "Mitsubishi, Geely,
JAC y GWM": tiene Great Wall, que él mismo dejó afuera, y le falta Lynk & Co, que él
mismo agregó. Parece copiado del sitio viejo.

Se interpola `SERVICE_BRANDS` en el texto en vez de transcribirlo literal, para que la
página no se contradiga a sí misma, y se marcó el conflicto en el componente, en el
README y en la respuesta al usuario. **No se resolvió por cuenta propia**: si el texto
es el correcto, se cambia `SERVICE_BRANDS` y se propaga solo.

### 3. Decisión — el acceso por marca va en wordmarks, no en logos

De las tres que más vende solo Geely tiene archivo de logo. Mezclar un logo bitmap con
dos wordmarks tipográficos se lee como un error, no como una decisión. Y el bloque no es
una vidriera de marcas —esa es la franja de §5.6— sino navegación: tres links grandes.
En texto queda coherente y no suma otro `<Placeholder>`.

**Qué enseña:** cuando falta un asset, conviene preguntarse qué es el componente antes
de marcar el hueco. Este era un menú, y un menú en texto no le falta nada.

### 4. Apuesta nueva — `ma_brand`

Los accesos por marca linkean a `/vehiculos?ma_brand=<marca>`. §6.4 lista el parámetro
pero no documenta el formato del valor, y avisa que el plugin no normaliza los suyos
(`ma_status=USED` y `ma_status=used` en el mismo documento), así que no hay regla que
deducir. Sin verificar hasta el deploy. El valor es un string por marca en `TOP_BRANDS`.

### 5. Implementation adjustment — el bloque de servicios pasa de 4 a 6 ítems

No hay re-aprobación (en alcance). Llegaron los cuatro textos que faltaban, así que el
`<Placeholder>` de servicios desapareció y la grilla llegó al 2x3 de §5.7. Los ítems
"0km" y "Usados" se fusionaron en "Venta" por pedido explícito.

**DESVIACIÓN de §5.7:** el doc pide "una línea de descripción" por ítem y cuatro de los
seis vienen con párrafos de dos a tres renglones escritos por el cliente. Se ajustó la
grilla (más aire, medida tope de 46ch), no el texto: recortar contenido real del cliente
para que entre en una medida que nadie pidió es la peor de las dos opciones.

Correcciones al texto del cliente, ambas tipográficas: "Mecanica" → "Mecánica" y
"dale la mejor opción" → "darle".

### 6. Verification — 2026-08-26T17:20:00Z

- `npm run check`: 29 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas, OK
- Los tres links de marca salen en el HTML con el querystring bien escapado
  (`ma_brand=Lynk%20%26%20Co`)
- Placeholders restantes en el Home: hero del local, logos de marca, mail de ventas,
  redes, sábados. Ninguno de servicios
- **Sin verificar:** `ma_brand`, y todo lo que dependa de que el plugin renderice

---

## Session 4 — main thread on `bielcar` (started 2026-08-26T17:35:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T17:35:00Z
session_ended_utc: 2026-08-26T17:42:00Z
final_status: completed
handoff_slug: home
files_written:
  - public/img/marcas/logo-geely.png
  - src/data/site.ts
  - src/components/BrandStrip.astro
  - README.md
```

### 1. Hallazgo — el logo de Geely rompía la franja

Sebastián agregó `logo-linkco.png` y de paso reemplazó `logo-geely.png`. Al auditar los
cuatro archivos apareció que el nuevo Geely es **PNG paletizado sin transparencia**:
negro sobre blanco opaco, 52% de píxeles blancos sólidos.

La franja los pasa a blanco con `filter: brightness(0) invert(1)`, que conserva el alpha.
Con matte alpha eso da el wordmark en blanco; con fondo blanco opaco da un **rectángulo
blanco sólido**. O sea que el archivo no se veía mal, se veía como una mancha.

Se le sacó el fondo con el mismo método que al logo de Bielcar (`a = 255 - min(r,g,b)`)
y se reescribió como RGBA en su lugar. Los otros tres estaban bien: JAC ya venía en
blanco con matte, Lynk & Co es gray+alpha con 88% transparente, Mitsubishi es RGBA.

Se documentó el requisito en `BRAND_LOGOS` y en el README, porque el próximo logo que
llegue puede venir igual y el síntoma no se parece a la causa.

**Qué enseña:** un asset nuevo no se registra, se audita. "Tiene alpha" tampoco alcanza
como chequeo: el canal puede existir y estar todo opaco.

### 2. Decisión — la franja normaliza por caja, no por alto

Con los cuatro logos reales aparecieron aspectos muy distintos: Lynk & Co es 4:1 (837x210)
y el emblema de Mitsubishi casi cuadrado (500x546). Igualando solo el alto a 56px, el
wordmark de Lynk & Co queda cuatro veces más ancho que Mitsubishi y la fila se desbalancea.
Pasó a una caja fija de 140x56 con `object-fit: contain`.

De paso, los `<img>` tenían `width="120" height="131"` hardcodeados para todos, que era
falso para los cuatro. Ahora las medidas reales viven en `BRAND_LOGOS` y se emiten por
archivo, que es lo que hace que la reserva de espacio sirva para algo.

### 3. Verification — 2026-08-26T17:42:00Z

- `npm run check`: 29 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas, OK
- Los cuatro logos simulados con el tratamiento real de la franja (caja 140x56 `contain`,
  `brightness(0) invert(1)`, `opacity .75`, sobre `--surface-dark`): los cuatro se leen
  en blanco, ninguno da bloque sólido
- El `<Placeholder>` de logos de marca desapareció del Home y del footer

---

## Session 5 — main thread on `bielcar` (started 2026-08-26T17:52:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T17:52:00Z
session_ended_utc: 2026-08-26T18:00:00Z
final_status: completed
handoff_slug: home
files_written:
  - src/pages/index.astro
  - src/components/Footer.astro
  - src/components/PermutaBand.astro
  - README.md
files_deleted:
  - src/components/TopBrands.astro
```

### 1. Revert — se saca el acceso por marca del Home

Sebastián no quiso la sección "Las que más vendemos" que se agregó en la sesión 3.
Se borró el componente y el Home vuelve a ir de los 3 tiles directo al carrusel. La
constante `TOP_BRANDS` queda en `site.ts`: el dato sigue siendo cierto y no cuesta nada.

Consecuencia: **Honda, MG y Volvo dejan de aparecer en el Home.** La franja es la de
servicio oficial y son 4. Los siete se nombran en el ítem "Venta" del bloque de
servicios, que es el único lugar donde quedan.

**Qué enseña:** la sección resolvía un problema real (las 7 marcas no aparecían en
ningún lado) pero se agregó sin preguntar, en la misma pasada que el pedido original.
Un agregado propio dentro de un pedido ajeno es difícil de rechazar por separado.

### 2. Se resuelve la contradicción §7 vs §5.8 — la franja va arriba en el Home

Preguntado y respondido: la franja va **debajo del hero en el Home**, que es donde la
pone §7 y la referencia. `Footer.astro` la suprime cuando `cleanPath(pathname) === '/'`,
así que sigue habiendo exactamente una por página. En el resto de las rutas no cambia
nada.

Esto cierra la decisión que la sesión 1 había dejado abierta en el README, y lo hace en
la dirección contraria a la que había elegido el default. El default estaba puesto por
ser el más barato de revertir, y revertirlo costó dos líneas.

### 3. Copy de la banda de permuta

§5.10 propone "¿Tenés un usado?" + "Lo tomamos como parte del pago." Sebastián pidió algo
más extenso y mandó el texto. Se parafraseó apenas: voseo ("Entregá", "llevate") para
sostener el registro del resto del sitio, y "sin inconvenientes" → "sin complicaciones".
Se le puso tope de medida de 52ch, que antes no hacía falta porque era una línea.

### 4. Verification — 2026-08-26T18:00:00Z

- `npm run check`: 28 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas, OK
- Orden de secciones del Home: hero → brands → tiles → featured → services → service-cta
- `class="brands"` aparece exactamente 1 vez en `/` y 1 vez en `/usados`: no hay
  duplicado en ninguna ruta

---

## Session 6 — main thread on `bielcar` (started 2026-08-26T18:02:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T18:02:00Z
session_ended_utc: 2026-08-26T18:05:00Z
final_status: completed
handoff_slug: home
files_written:
  - src/data/site.ts
  - src/components/Footer.astro
  - README.md
```

### 1. Dato — horario confirmado, y corrige al panel

Sebastián confirmó: **Lunes a Viernes de 9 a 13 y de 14 a 19**, y **no abren sábados**.

Esto **corrige** el horario que el paso 1 había tomado del panel de Multiaviso
("Lunes a Viernes de 9:30 a 19 horas"), que no tenía el corte del mediodía. O sea que el
dato del panel estaba mal, no incompleto.

Se agregó `site.hoursNote` en vez de meter los sábados dentro de `site.hours`: el string
de horario lo consume también el bloque de servicios en minúscula y dentro de una
oración, y "no abrimos sábados" ahí no entra. §9 de DESIGN.md marcaba explícitamente que
un horario de automotora sin decir nada de sábados era raro; ahora lo dice.

**Qué enseña:** un dato que ya estaba cargado en una herramienta de terceros no es un
dato confirmado. Valía como base, no como verdad.

### 2. Verification — 2026-08-26T18:05:00Z

- `npm run check`: 28 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas, OK
- El horario nuevo sale en el HTML y el `<Placeholder>` de sábados desapareció de las 7
- Placeholders vivos en todo el sitio: mail de ventas, redes sociales, foto del local
  (hero y /nosotros), y los de /nosotros que son del paso 5

---

## Session 7 — main thread on `bielcar` (started 2026-08-26T18:08:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T18:08:00Z
session_ended_utc: 2026-08-26T18:10:00Z
final_status: completed
handoff_slug: home
files_written:
  - src/data/site.ts
  - src/components/Footer.astro
  - README.md
```

### 1. Corrección — el sitio no dice "no abrimos sábados"

Supersede a la sesión 6, que había puesto `site.hoursNote` en el footer. Sebastián lo
sacó: "Lunes a Viernes" ya lo implica y recalcarlo pone el foco en lo que la automotora
no hace. El dato pasa a `OPENS_SATURDAYS = false`, que no se renderiza en ningún lado.

**Qué enseña:** que un dato esté confirmado no significa que tenga que aparecer. §9 de
DESIGN.md marcaba la ausencia de los sábados como un hueco a llenar, y la lectura
correcta era llenarlo en los datos, no en la página. Un dato faltante y un dato que se
decide no mostrar se ven igual desde el código, y por eso el `false` va con comentario:
sin él, la próxima pasada lo vuelve a agregar.

### 2. Verification — 2026-08-26T18:10:00Z

- `npm run check`: 28 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas, OK
- La palabra "sábados" no aparece en ninguna de las 7 páginas generadas
- El footer muestra solo "Lunes a Viernes de 9 a 13 y de 14 a 19 horas"

---

## Session 8 — main thread on `bielcar` (started 2026-08-26T18:20:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T18:20:00Z
session_ended_utc: 2026-08-26T18:44:00Z
final_status: completed
handoff_slug: home
files_written:
  - src/data/site.ts
  - src/components/BrandStrip.astro
  - src/components/Footer.astro
  - src/pages/index.astro
  - public/img/marcas/*.png
  - README.md
```

### 1. La franja de marcas pasa de vidriera a navegación

Pedido de Sebastián: en vez de "Servicio oficial" con 4 logos, muestra las **7 marcas que
vende** ordenadas de la que más vende a la que menos, **sin título**, y cada logo entra al
catálogo filtrado por esa marca. Va arriba en el Home y en el footer del resto.

Consecuencia que hay que sostener: la franja ya no afirma "servicio oficial". Esa
afirmación quedó SOLO en el ítem "Servicio oficial" del bloque de servicios, con las 4
marcas nombradas. De Honda, MG y Volvo Bielcar no es servicio oficial, así que la franja
no puede volver a titularse de esa manera mientras muestre las 7.

Los 7 links dependen de `ma_brand`, sin verificar. Es la apuesta más grande viva del
proyecto: si el valor está mal, la franja entera no filtra.

### 2. Los logos hay que recortarlos al glifo, no solo tener alpha

`object-fit: contain` ajusta el LIENZO, no el glifo. Volvo venía como un wordmark chico en
el medio de un cuadrado de 400x400 (92% transparente) y se renderizaba tres veces más
chico que JAC, aunque el archivo fuera más grande. Se recortó cada logo al bounding box
del alpha y recién ahí `contain` empezó a comparar glifos con glifos.

El downscale va con box filter en espacio **premultiplicado**: promediar RGB sin
premultiplicar arrastra el color de los píxeles transparentes al borde y deja halo.

### 3. Error propio — sobrescribir assets de origen en el lugar

Se procesaron los PNG escribiendo sobre el mismo archivo. Con `logo-jac.png` eso salió
mal: la primera pasada le sacó el fondo asumiendo blanco, pero el fondo era gris claro
(#E7E7E7), así que quedó al 9% de opacidad en vez de transparente — un rectángulo gris en
la franja. La segunda pasada, con umbral, corrió sobre la salida de la primera en vez de
sobre el original y dejó el archivo opaco. El original ya no existía para reintentar.

Lo resolvió Sebastián reemplazando el archivo.

**Qué enseña:** un asset que llega del cliente es entrada, no espacio de trabajo. Lo
derivado va a otra ruta, o al menos el original se copia antes de tocarlo. Sin eso no hay
segundo intento, y con procesamiento de imágenes el segundo intento es la norma: el
primer supuesto sobre el fondo casi nunca es el correcto.

Corolario del mismo error: `sips -Z` sobre `logo-mitsubishi.png` lo **agrandó** de 500x546
a 2400x2070 en vez de achicarlo, y como fue en el lugar, el original se perdió. El
downscale propio lo dejó en 360x310 sin pérdida visible, pero es la misma falla.

### 4. Verification — 2026-08-26T18:44:00Z

- `npm run check`: 28 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas, OK
- Los 7 links de marca salen en `/` con el querystring escapado
- `brands__title` no aparece en ninguna página: la franja va sin encabezado
- Los 7 logos verificados compuestos con el tratamiento real de la franja
- `public/img/marcas` bajó de 496K a 140K

---

## Session 9 — main thread on `bielcar` (started 2026-08-26T18:46:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T18:46:00Z
session_ended_utc: 2026-08-26T18:47:00Z
final_status: completed
handoff_slug: home
files_written:
  - src/components/BrandStrip.astro
```

### 1. La franja pasa a marquee, en CSS puro

Pedido: que la fila se desplace sola, que frene al pasar el mouse por un logo y que ese
logo se ilumine.

Sin JavaScript. La lista se renderiza dos veces dentro de un track que se traslada; cuando
la primera copia terminó de salir, la segunda está donde estaba la primera al empezar.

El desplazamiento es `calc(-50% - var(--brands-gap) / 2)`, no `-50%`. La mitad del track
son 7 logos más 6 gaps y medio, y la costura solo queda pareja si son 7 logos más 7 gaps.
Con `-50%` a secas el loop pega un saltito cada vuelta. Por eso el gap es variable CSS y
no un número suelto: entra en el cálculo.

La copia va con `aria-hidden` y sus links con `tabindex="-1"`. Son los mismos siete logos:
un lector de pantalla o un tabulador no tienen por qué recorrer catorce marcas.

`animation-play-state: paused` va en `:hover` **y** en `:focus-within`: sin lo segundo,
tabular hasta un logo lo deja moviéndose abajo del anillo de foco.

### 2. DESVIACIÓN de §5.6 — opacidad en reposo 0.55 y no 0.75

El hover tiene que hacer dos cosas a la vez, frenar la fila y destacar el logo. Desde 0.75
el salto a blanco pleno casi no se percibe y la única señal queda siendo que la fila se
detuvo.

### 3. Verification — 2026-08-26T18:47:00Z

- `npm run check`: 28 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas, OK
- En `/`: 1 track, 2 listas, 14 links de marca, 7 con `tabindex="-1"` (la copia)
- `prefers-reduced-motion`: la copia se oculta y la fila vuelve a franja estática centrada

---

## Session 10 — main thread on `bielcar` (started 2026-08-26T18:52:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T18:52:00Z
session_ended_utc: 2026-08-26T18:55:00Z
final_status: completed
handoff_slug: home
files_written:
  - src/components/BrandStrip.astro
```

### 1. Reporte — "el carrusel no anda": las dos copias apiladas

Síntoma en el screenshot de localhost:4321: dos filas de 7 logos, una abajo de la otra,
sin movimiento.

Diagnóstico sobre los artefactos generados, no sobre el navegador:

- `dist/index.html` tiene el markup correcto: un `.brands__track` con las copias adentro.
- En `dist/_astro/Base.*.css`, la regla base `.brands__track{display:flex;width:max-content}`
  sale **global**, y la de `flex-wrap:wrap` está correctamente dentro de
  `@media (prefers-reduced-motion:reduce)`.

O sea que el CSS compilado está bien. Y el síntoma es exactamente cómo se ve la página si
`.brands__track` no tiene NINGUNA regla: dos `<ul>` como bloques apilados. Antes de este
cambio ese `div` no existía, así que la hipótesis es CSS viejo servido por el dev server.

Se descarta `prefers-reduced-motion` activo: en ese caso la copia estaría oculta por
`display:none` y el screenshot muestra las dos.

**No se pudo confirmar en un navegador** — no tengo forma de abrir uno acá. Lo que se
verificó es que el HTML y el CSS que produce el build son coherentes entre sí.

### 2. Endurecimiento del componente

Tres cambios, todos contra el mismo modo de falla —que las copias se apilen— y contra el
hueco en pantallas anchas:

- `flex-wrap: nowrap` explícito en el track. Es el default, pero es EL modo de falla de
  este componente: si envuelve, el marquee deja de existir.
- `flex: 0 0 auto` en cada copia. Si algún ancestro restringe el ancho, las copias se
  encogen y dejan de medir lo mismo, que es lo único que sostiene el loop.
- Tres copias en vez de dos. Con dos el track mide ~2.6k px y en un ultrawide se ve el
  hueco. El desplazamiento pasa a `calc(-100% / 3 - var(--brands-gap) / 3)`.

### 3. Verification — 2026-08-26T18:55:00Z

- `npm run check`: 28 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas, OK
- 3 copias de `.brands__list` en `/`
- Regla base del track confirmada fuera de todo `@media`; la de reduced-motion, adentro

---

## Session 11 — main thread on `bielcar` (started 2026-08-26T18:58:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T18:58:00Z
session_ended_utc: 2026-08-26T19:05:00Z
final_status: completed
handoff_slug: home
files_written:
  - src/components/AccessTiles.astro
  - src/components/Footer.astro
  - src/data/site.ts
  - src/pages/contacto.astro
  - README.md
```

### 1. Confirmado: el carrusel andaba, era CSS viejo del dev server

Cierra el diagnóstico de la sesión 10. El endurecimiento que se hizo ahí (nowrap
explícito, `flex: 0 0 auto`, tres copias) queda igual: no era la causa, pero sí eran
fragilidades reales.

### 2. Legibilidad de los tiles

Reporte: el texto sobre las fotos no se lee. Tres cambios, medidos y no a ojo:

- `filter: brightness(0.82)` en la foto. Se baja el brillo de la imagen en vez de llevar
  el degradado a negro pleno, para no perder el color del auto — que es lo que el tile
  vende.
- Degradado de **cuatro** paradas en vez de dos. §5.2 propone
  `rgba(0,0,0,.75) → transparent 60%`, pero para llegar a la opacidad que hace falta
  abajo, un degradado de dos paradas se ve como una banda cortada a mitad de la foto.
- Título de `--fs-h3` a `--fs-h2`, línea de `--fs-body-sm` a `--fs-body`, y la línea pasa
  de `--text-on-dark-muted` a blanco pleno: sobre foto el gris queda blando aunque el
  degradado lo tape, y la jerarquía contra el título la puede dar el tamaño.

**Verificación numérica** — se simuló el pipeline completo (cover 3/2 → brightness →
degradado) y se midió la luminancia en la banda donde cae el label:

| tile | fondo medio | peor píxel |
|---|---|---|
| nuevos | 16.4:1 | 7.7:1 |
| usados | 15.7:1 | 6.4:1 |
| todos | 15.5:1 | 6.3:1 |

El peor píxel de cada foto supera AA para texto normal (4.5:1) y también AAA para texto
grande (4.5:1). Antes del cambio el peor caso caía por debajo de AA.

### 3. Datos nuevos — y el panel de Multiaviso falla otra vez

Mail de ventas: `bielcar@bielcar.com.uy`. Teléfonos fijos: 2403 2282, 2403 2283 y
2401 8820, además del celular/WhatsApp.

`site.phone` era el celular, tomado del panel de Multiaviso. **Faltaban las tres líneas
fijas.** Es la segunda vez que un dato del panel resulta incompleto o incorrecto, después
del horario. `site.phones` (fijas) y `site.mobile` (celular) ahora están separados, y el
celular no se lista en el footer porque es el mismo número que el WhatsApp que ya figura
abajo — repetirlo no agrega un canal.

**Qué enseña:** ya son dos de dos. Lo que queda del panel sin verificar es la dirección.
Hay que preguntarla explícitamente en vez de asumir que esa sí está bien.

### 4. Verification — 2026-08-26T19:05:00Z

- `npm run check`: 28 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas, OK
- Los 3 `tel:` y el `mailto:` salen en el HTML
- Placeholders vivos: foto del local (hero y /nosotros), redes sociales, y los de
  /nosotros que son del paso 5. Ninguno de contacto salvo redes

---

## Session 12 — main thread on `bielcar` (started 2026-08-26T19:20:00Z)

**Pedido:** "make the cars less black, so a little more bright, just a little" —
con captura de la franja de accesos (`AccessTiles`).

### 1. Diagnóstico

Los tiles se oscurecían por dos capas superpuestas, no una:

- `.tile__img { filter: brightness(0.82) }` — sobre toda la foto
- `.tile::after` — degradado de 4 paradas a negro

Las dos se sumaban, así que el 0.82 se leía más oscuro de lo que sugiere el número.
La carrocería, que es lo que el tile vende, quedaba casi sin color.

### 2. Cambio — `src/components/AccessTiles.astro`

- `brightness(0.82)` → `brightness(0.92)`
- Degradado: la parada de 32% baja de `.62` a `.55`, la de 66% de `.18` a `.10`.
  La parada de 0% queda en `.92` — es la que sostiene el contraste del label.

Ajuste chico a propósito ("just a little"). No se tocó la base del degradado
para no perder legibilidad de eyebrow y título.

### 3. Verification — 2026-08-26T19:22:00Z

- `npm run build`: 7 páginas, OK
- Sin cambios en markup ni en `#MultiavisoWrapper`

---

## Session 13 — main thread on `bielcar` (started 2026-08-26T19:15:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T19:15:00Z
session_ended_utc: 2026-08-26T19:36:00Z
final_status: completed
handoff_slug: pasos-4-7
files_written:
  - src/pages/service.astro
  - src/pages/contacto.astro
  - src/pages/nosotros.astro
  - src/pages/sitemap.xml.ts
  - src/components/ServiceForm.astro
  - src/components/ContactForm.astro
  - src/components/WhatsAppForm.astro
  - src/components/FormField.astro
  - src/components/ServicesBlock.astro
  - src/components/BrandStrip.astro
  - src/components/Footer.astro
  - src/components/Header.astro
  - src/layouts/Base.astro
  - src/styles/base.css
  - src/data/site.ts
  - public/robots.txt
  - public/img/og.png
  - README.md
```

### 1. PLAN — pasos 4 a 7 del plan de construcción

`/service`, `/contacto`, `/nosotros`, SEO y la pasada de mobile/performance. Triage por
`policy`: agente recomendado `web-feature`, con `release-ci` como seguimiento solo para
`vercel.json`.

**Alternativa más fuerte considerada.** Un único `ContactForm.astro` parametrizado por
lista de campos para los dos formularios. Se descartó el motor genérico, pero SÍ se
compartió la fontanería: `WhatsAppForm.astro` lleva grilla, botón, apertura de `wa.me` y
fallback de popup bloqueado, y los campos entran por slot como markup explícito de cada
formulario. O sea que la decisión final quedó a mitad de camino de lo aprobado — se
comparte lo que era idéntico, no lo que era distinto.

**Supuesto que carga el peso.** Que `BrandStrip` andaba tal cual con 4 marcas en vez de 7.

**Observación que lo falsaría.** Un hueco visible en el marquee antes de reiniciar, en
pantallas anchas. **SE CUMPLIÓ** — ver §2.

**Token de aprobación:** "procede".

### 2. Corrección — el marquee de marcas tenía un agujero en ultrawide

El supuesto era falso y el propio plan decía cómo detectarlo. `BrandStrip` renderizaba
TRES copias fijas, calibradas para 7 marcas (~1370px por copia, ~4100px de track). Con
las 4 marcas de `/service` una copia mide ~780px y el track ~2350px: en un monitor de
2560px se ve el corte del ciclo. Y la velocidad, fija en 60s, recorría poco más de la
mitad de distancia en el mismo tiempo, así que además se arrastraba.

Se reemplazó el literal `[false, true, true]` por un piso de ítems visibles
(`MIN_VISIBLE_ITEMS = 21`, mínimo 3 copias) y se generalizó el keyframe de `-100%/3` a
`-100%/var(--brands-copies)`. La velocidad escala con el ancho de una copia. Con 7
marcas da 3 copias / 60s, o sea el comportamiento anterior exacto; con 4 da 6 / 34s.

**Qué enseña:** el campo "observación que lo falsaría" del plan sirve para algo cuando
se va a mirar de verdad. Acá la aritmética alcanzó — no hizo falta ver la pantalla.

### 3. Decisión — el footer se suprime por ruta, y ahora en dos ejes

Ya existía `isHome` para no repetir la franja de marcas en el Home. Se generalizó a dos
listas de rutas:

- `OWN_BRAND_STRIP = ['/', '/service']` — `/service` muestra las CUATRO marcas de
  servicio oficial bajo ese título. Si el footer sumara además las siete de venta, la
  página tendría dos franjas afirmando cosas distintas sobre las mismas marcas a media
  pantalla de distancia.
- `OWN_CONTACT_BLOCK = ['/contacto']` — el bloque datos + mapa del footer es una tarjeta
  de contacto condensada, y en la página de contacto sería el mismo dato y el mismo mapa
  dos veces en la misma pantalla.

**Qué enseña:** el footer del sitio es un resumen de otras páginas. Cada vez que se
construye la página que resume, hay que preguntarse si el resumen sigue aportando.

### 4. Decisión — el copy de servicios se movió a `site.ts`

Los seis ítems estaban inline en `ServicesBlock.astro` y `/service` necesitaba cuatro de
ellos. Se movieron a `SERVICES`, con un campo `scope` (`comercial` | `taller`) que dice
qué página puede afirmar cada uno. Filtro positivo y no exclusión de venta/permuta: un
servicio nuevo tiene que decidir a qué página pertenece en vez de aparecer en `/service`
por descarte.

Motivo directo: ya hay un conflicto abierto por texto de cliente desincronizado (el de
"Servicio oficial" nombra GWM y omite Lynk & Co). Copiar esos párrafos a un segundo
archivo era garantizar el próximo.

### 5. Decisión — `/nosotros` se entrega vacía a propósito

Es la página más bloqueada del sitio: foto del local, texto institucional y equipo de
ventas son tres `<Placeholder>`. Lo único afirmado sale de `site.ts` — dirección, marcas
que vende, marcas de las que es servicio oficial, taller.

Es también la página donde más tienta romper la regla: "más de X años en plaza",
"empresa familiar", "atención personalizada" son frases que suenan verdaderas y que
nadie confirmó. La estructura quedó completa para que el día que llegue el contenido sea
rellenar y no construir.

### 6. Ajuste de implementación — el submit no puede usar la clase `.btn`

No hay re-aprobación (en alcance). `Button.astro` renderiza un `<a>` y sus estilos están
scopeados; los formularios necesitan un `<button type="submit">`. La salida obvia —subir
`.btn` a `base.css` como primitiva global— es la que NO se puede tomar: `.btn` es una
clase de Bootstrap y el plugin de Multiaviso es Bootstrap 3, así que una regla global se
filtraría dentro de su markup. Es la regla "nunca un selector suelto como `.item-title`"
en sentido inverso, y por el mismo motivo se resolvió con clases scopeadas
(`.waform__submit`, `.field__control`) en vez de globales.

**Qué enseña:** `base.css` ya tiene `.container`, que también es una clase de Bootstrap.
Es un riesgo latente preexistente y conviene no agrandarlo.

### 7. Hallazgo — hay DOS `<link rel="canonical">` en las páginas de catálogo

El plugin inyecta el suyo apuntando a la URL actual (§6.2) y `Base.astro` emite el
nuestro. Google ignora la directiva entera cuando hay más de un canonical, así que puede
estar anulando los dos — incluido el de las URLs de vehículo con `?ma_carid=`, que son
las compartibles.

**No se tocó.** Sacar el nuestro dejaría sin canonical a `/nuevos`, `/usados` y
`/vehiculos` si el plugin cambia. Hay que mirar el `<head>` de una URL con `?ma_carid=`
en producción antes de decidir, y después preguntarle a Madfes si se puede desactivar la
inyección. Anotado en `Base.astro` y en el README.

### 8. Fuera de alcance — los redirects 301

No existe inventario de las URLs viejas de `bielcar.com.uy` en el repo. Además
`vercel.json` es ruta restringida (`release-ci`) y el dominio no se cortó todavía.
Bloqueado por falta de dato, no por falta de tiempo.

### 9. Verification — 2026-08-26T19:36:00Z

- `npm run check` (astro check): 33 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + `sitemap.xml`, OK
- Orden de scripts del plugin en `<head>` verificado sobre el HTML generado de
  `usados.html` e `index.html` tras reescribir el `<head>`: `plugin.js` → jQuery →
  init inline, los tres sin bundlear
- JSON-LD parseado y validado: `AutomotiveBusiness`, dos tramos de horario (el corte del
  mediodía no se aplanó), 7 marcas, sin `geo` / `priceRange` / `sameAs` inventados
- `sitemap.xml`: 7 URLs limpias, sin `.html`
- Sin franjas ni mapas duplicados: `/contacto` con 1 mapa y 0 `footer__split`; `/service`
  con solo las 4 marcas de servicio oficial (24 `<img>` = 6 copias × 4)
- Home sin cambios de comportamiento tras mover el copy: 6 servicios, 3 copias, 60s,
  7 marcas
- **Sin verificar:** todo lo que dependa de que el plugin renderice, más el canonical
  duplicado de §7. Requiere `npm run deploy`.

---

## Session 14 — web-feature on `site` (started 2026-08-26T19:40:00Z)

```yaml
agent: web-feature
stack: site
session_started_utc: 2026-08-26T19:40:00Z
session_ended_utc: 2026-08-26T20:05:00Z
final_status: completed
handoff_slug: null
files_written:
  - src/data/site.ts
  - src/components/ServicesBlock.astro
```

### 1. Initial approved PLAN — 2026-08-26T19:42:00Z

Tarea: el grid 2x3 de servicios del Home (`ServicesBlock.astro`) usaba `SERVICES[].line`
— el párrafo largo de Sebastián, 4-5 renglones por ítem — como descripción. §5.7 pide
una sola línea por ítem. Se agrega un campo nuevo `blurb` (una oración, ~100 caracteres
±10, medida sobre el string ya interpolado) para el grid del Home, dejando `line` intacto
para que `/service` lo siga renderizando tal cual llegó del cliente.

**Archivos:**
- `src/data/site.ts` — campo `blurb: string` en los 6 objetos de `SERVICES`; JSDoc
  reescrito documentando `line` vs. `blurb`. `line`, `SALES_BRANDS`, `SERVICE_BRANDS` y
  `list()` sin tocar.
- `src/components/ServicesBlock.astro` — render de `item.blurb` en vez de `item.line`;
  reescritura del comentario "DESVIACIÓN de §5.7" del frontmatter (documentaba la
  política opuesta a la que el código sigue ahora) y del comentario de
  `.service__line { max-width: 46ch }` (justificaba párrafos multi-línea que ya no
  existen).
- `src/pages/service.astro` — NO se toca.

**Los 6 blurbs (longitud renderizada):**

| id | blurb | chars |
|---|---|---|
| `venta` | `0km y usados seleccionados. Somos punto de venta de Geely, Lynk & Co, Honda, JAC, Mitsubishi, MG y Volvo.` | 105 — es `line` verbatim, ya era corto |
| `permuta` | `Entregá el tuyo como parte de pago y llevate el que soñás, rápido y sin complicaciones.` | 87 — es `line` verbatim; 3 bajo el piso de −10, no se rellena para no inventar |
| `oficial` | `Equipos y técnicos especializados para que su Geely, Lynk & Co, JAC y Mitsubishi sigan siendo originales.` | 105 — mantiene interpolación de `SERVICE_BRANDS`; requirió reordenar la cláusula (no solo recortar) para entrar bajo 110 con la lista completa |
| `mecanica` | `Nuestro amplio taller multimarca atiende su automóvil por mantenimiento general o cualquier desperfecto.` | 104 — "atiende" reemplaza "brinda la posibilidad de atender" |
| `chapa` | `Para cuidar la estética o reparar un siniestro, contamos con dos cabinas de pintura de última generación.` | 105 — recorte puro, izquierda a derecha |
| `seguros` | `Tenemos convenios con compañías aseguradoras y, a la hora de un siniestro, nos encargamos de la reparación.` | 107 — recorte puro, conserva el verbo "Tenemos" |

**Contratos producidos:** ninguno — dato de presentación inerte, no lo consume
`web-state` / `web-api` / `web-routing`.

**Contratos consumidos:** ninguno.

**Alternativa más fuerte considerada.** Mantener `item.line` en el grid y recortarlo
visualmente con `line-clamp`. Se descartó: trunca la oración real del cliente en un
punto arbitrario (posible corte a mitad de palabra al redimensionar) en vez de elegir
deliberadamente una oración completa y con sentido, y además deja a `/service` leyendo
el mismo texto sin recortar, así que no resuelve nada estructuralmente.

**Supuesto que carga el peso.** Una versión estrictamente más corta y de mismo
significado de cada oración del cliente (con `oficial` reordenando en vez de solo
recortar para conservar su interpolación de marca bajo el presupuesto de caracteres)
sigue diciendo lo que el cliente quiso decir, solo que más breve — ninguno de los seis
pierde una afirmación que el cliente no hizo.

**Observación que lo falsaría.** Si Sebastián/el usuario lee alguna de las seis
versiones cortas —especialmente el reordenamiento de `oficial`, o el "atiende" de
`mecanica`— como un cambio de lo que se promete (no solo un acortamiento), este enfoque
está mal para ese ítem y hace falta renegociar por servicio en vez de aplicar una regla
uniforme de recorte/reordenamiento.

**Token de aprobación:** "proceed" — "El usuario aprobó el PLAN tal como lo
presentaste — los 6 blurbs con esos textos y esos conteos, incluyendo Permuta en 87
chars, el reorden de `oficial` y el 'atiende' de `mecanica`."

### 2. Verification — 2026-08-26T20:04:00Z

- `npm run check` (astro check): 33 archivos, 0 errores, 0 warnings, 0 hints.
- Conteo de caracteres de los 6 `blurb` re-verificado ejecutando `list()` en Node contra
  el string ya interpolado (con `SALES_BRANDS` / `SERVICE_BRANDS` reales): coincide
  exactamente con la tabla del PLAN (105 / 87 / 105 / 104 / 105 / 107).
- `grep` confirma que `src/pages/service.astro` sigue renderizando `item.line` sin
  cambios, y que `SALES_BRANDS` / `SERVICE_BRANDS` / `list()` no se tocaron.
- `npm run deploy` no se corrió — no aplica, el catálogo de Multiaviso no está en juego
  en este cambio.

---

## Session 14 — main thread on `bielcar` (started 2026-08-26T20:05:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T20:05:00Z
session_ended_utc: 2026-08-26T20:22:00Z
final_status: completed
handoff_slug: service-brands
files_written:
  - src/components/ServiceBrands.astro
  - src/components/BrandStrip.astro
  - src/pages/service.astro
  - README.md
```

### 1. Cambio pedido — la franja de /service se separa de BrandStrip

Pedido textual: en `/service`, una franja distinta a la del Home, **que no se mueva**,
solo las 4 marcas una atrás de la otra, y cada click abre WhatsApp con
*"Hola, quiero agendar un service oficial de \<marca\>"*.

Se hizo componente nuevo (`ServiceBrands.astro`) en vez de un prop más en `BrandStrip`.
Comparten el markup y nada más: uno es navegación decorativa de 7 marcas en movimiento,
el otro son 4 CTAs de conversión quietos. Un `variant="static-whatsapp"` habría metido
dos comportamientos en un componente cuya única razón de existir es el marquee.

Efecto lateral bueno: esta franja es **§5.6 tal como está escrito** —banda oscura,
padding 48px, wordmarks blancos a 0.75 que suben a 1, flex con gap 64px centrado, wrap
en mobile. El marquee siempre fue la desviación.

### 2. Decisión — cada logo lleva "Agendar" con el ícono de WhatsApp

§5.6 describe wordmarks pelados y para una vidriera estática está bien. Acá no: en el
mismo sitio hay otra fila de logos —la del footer— donde el click lleva al catálogo
filtrado. Dos filas casi idénticas con comportamiento distinto y sin ninguna pista
visual es una trampa, no minimalismo.

**Qué enseña:** cuando cambia lo que un elemento HACE, la referencia visual deja de
aplicar aunque el elemento se vea igual.

### 3. Decisión — se mantiene la supresión del footer en /service

`OWN_BRAND_STRIP` sigue incluyendo `/service`. El motivo original era "dos franjas
afirmando cosas distintas sobre las mismas marcas"; ahora es más fuerte, porque además
tienen destinos distintos. Anotado en el README cómo revertirlo (una línea) por si
Sebastián prefiere conservar la navegación por marca ahí abajo.

### 4. Ajuste — los comentarios de BrandStrip quedaron mintiendo

La parametrización de copias/velocidad de la sesión 13 se justificaba citando la franja
de `/service`, que ya no la usa. Se corrigió el texto sin revertir el código: `brands`
sigue siendo un prop público y sin el cálculo vuelve el agujero en ultrawide para quien
lo pase con pocas marcas. Con el default de 7 da 3 copias y 60s, o sea el comportamiento
original exacto.

### 5. Verification — 2026-08-26T20:22:00Z

- `npm run check`: 34 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- Los 4 links de `/service` verificados sobre el HTML generado, con el texto decodificado:
  Geely, Lynk & Co, JAC y Mitsubishi, cada uno con su mensaje. "Lynk & Co" sobrevive el
  round-trip de encoding
- `/service`: 0 ocurrencias de `brands__track` (ni franja propia en movimiento ni la del
  footer), 4 logos
- Home sin cambios: marquee presente, 3 copias, 60s, 7 marcas
- **Sin verificar:** que los logos se vean bien en la fila estática. Los cuatro archivos
  tienen alpha verificado, pero el encuadre a `contain` en caja fija solo se confirma
  mirándolo

---

## Session 15 — web-feature on `site` (started 2026-08-26T20:25:00Z)

```yaml
agent: web-feature
stack: site
session_started_utc: 2026-08-26T20:25:00Z
session_ended_utc: 2026-08-26T20:55:00Z
final_status: completed
handoff_slug: null
files_written:
  - public/img/service/hero.avif
  - src/data/site.ts
  - src/components/ServiceHero.astro
  - src/pages/service.astro
```

### 1. Initial approved PLAN — 2026-08-26T20:32:00Z

Tarea: hero full-bleed con foto en `/service` (h1+lede encima, degradado de legibilidad),
excepción explícita del usuario a §5.2/§7 (que piden hero interior SIN imagen). Insumo:
`service.avif` en la raíz del repo (1171×781, AVIF, 99 KB, con marca de agua "Unsplash+"
visible — el usuario ya avisó que lo va a reemplazar por el export licenciado en el mismo
path antes de deployear).

**Archivos:**
- `service.avif` → `public/img/service/hero.avif` (mover, sin re-encodear). Sigue la
  convención de subcarpeta por página de `public/img/home/*.webp`.
- `src/data/site.ts` — nuevo campo `PHOTOS.serviceHero: { src: string; alt: string }`,
  NO nullable (a diferencia de `PHOTOS.homeHero`, que sí lo es y no puede caer en stock).
  Comentario explicando por qué esta es la única excepción de stock permitida en
  `PHOTOS`, más el `TODO` del watermark.
- `src/components/ServiceHero.astro` (nuevo) — hero full-bleed, tratamiento de
  §5.2/`HomeHero` (degradado `linear-gradient(to top, rgba(0,0,0,.75), transparent
  60%)`, h1+lede sobre el tercio inferior), `<img>` real con `alt` (no
  `background-image` decorativo como en `HomeHero`, porque acá la foto SÍ es contenido
  informativo de la página).
- `src/pages/service.astro` — cambia `PageHero` por `ServiceHero`; se reescribe la nota
  de "alternancia de bandas" del frontmatter para que refleje que el hero ya no es una
  banda plana.
- `PageHero.astro` queda intacto, en uso por `/nuevos`, `/usados`, `/vehiculos`.

**Alt propuesto y aprobado:** "Mecánico revisando la parte inferior de un auto sobre un
elevador de taller" — describe la escena sin afirmar que es el taller de Bielcar.

**Contratos producidos:** ninguno — página estática sin estado, sin fetch, sin routing
dinámico; no hay contrato cross-specialist que persistir en `.claude/handoffs/`.

**Contratos consumidos:** ninguno.

**Alternativa más fuerte considerada.** Agregar un prop opcional `image?: { src, alt }`
a `PageHero.astro` en vez de un componente nuevo. Se descarta: convertiría en trivial
(un prop) reintroducir imagen en `/nuevos`, `/usados` o `/vehiculos`, que es exactamente
lo que §5.2 prohíbe porque esas páginas necesitan un hero-marco neutro para el contenido
inyectado por Multiaviso.

**Supuesto que carga el peso.** Que un `<img>` real con `object-fit: cover` + `alt`
descriptivo es preferible a un `background-image` decorativo (como en `HomeHero`) para
esta foto puntual, porque acá la imagen es contenido informativo de la página (un
taller) y no un fondo ambiental detrás de un h1 que ya lo explica todo.

**Observación que lo falsaría.** Que en `npm run dev` el recorte de `object-fit: cover`
(foto 1171×781 contra un hero a viewport completo, mucho más angosto que la foto en
mobile) corte al mecánico fuera de encuadre y haga falta ajustar `object-position`. Ver
§3 — se verificó explícitamente y no hizo falta ajustarlo.

**Pre-approval iterations:** una. El PLAN original proponía `min-height: 420px` (desktop)
/ `320px` (mobile) para el hero —una altura más compacta tipo `PageHero` con foto
encima—, en vez de ocupar el viewport completo. El usuario pidió copiar literal el alto
de `HomeHero` (`min-height: max(560px, calc(100svh - var(--header-h)))`, con el piso de
`440px` en mobile) "para que sea el mismo tratamiento que el hero del Home", y pidió
explícitamente NO inventar un ajuste de mobile propio sino replicar el de `HomeHero`.

**Token de aprobación:** "proceed" — relayed vía coordinator: *"El usuario aprobó el
PLAN, con un cambio sobre el alto: Hero a viewport completo, igual que el Home (...)
Todo lo demás queda tal como lo planteaste"* — instrucción explícita de revisar en
`npm run dev` el recorte de la foto en mobile antes de cerrar la tarea (ver §3).

### 2. Hallazgo — `service.astro` había avanzado desde que se leyó para el PLAN

Entre que se armó el PLAN y la implementación, otra sesión (Session 14, "main thread",
20:05–20:22Z, ver bloque anterior) reemplazó `<BrandStrip>` por `<ServiceBrands>` en
`/service` — franja de conversión propia, no la del Home. El primer intento de `Edit`
sobre el bloque de imports falló porque el `old_string` ya no coincidía con el archivo.

Se releyó `service.astro` completo antes de reintentar (tal como pidió el coordinator) y
se aplicó el cambio aprobado —swap de `PageHero` por `ServiceHero`, reescritura de la
nota de alternancia de bandas— contra el contenido real y vigente, sin revertir nada de
la sesión 14. `ServiceBrands.astro` también renderiza sobre `--surface-dark`, así que no
cambia el razonamiento de bandas del PLAN (ver nota reescrita en el frontmatter, §7 de la
página).

**Qué enseña:** en un ledger sin git y con sesiones concurrentes, "releer antes de
escribir" no es una formalidad — el archivo objetivo cambió de verdad entre el PLAN y el
IMPLEMENT, y el `old_string` exacto capturado durante el READ ya no era válido.

### 3. Verificación de encuadre — `object-position` sin browser

No hay navegador disponible en este entorno. Se simuló el `object-fit: cover` del CSS
con `sips` (herramienta nativa de macOS) sobre el archivo REAL (no una maqueta): resample
por la dimensión dominante + crop centrado, para dos viewports representativos:

- **Desktop** (1440×744, viewport 1440×816 menos header 72px): resample a ancho 1440,
  crop a 744 de alto. Resultado: se pierden ~88px arriba y abajo (watermark superior y
  parte del piso); el mecánico completo, la linterna, ambas manos y buena parte del auto
  elevado quedan dentro de cuadro.
- **Mobile** (375×752, viewport 375×812 menos header 60px): resample a alto 752 (ancho
  resultante 1127px), crop a 375 de ancho centrado — sobrevive ~1/3 del ancho original.
  Es el caso agresivo previsto en la observación falsificadora del PLAN. Resultado:
  el mecánico queda centrado en el archivo original, así que el recorte deja cara,
  linterna, las dos manos levantadas y el tramo de auto sobre el que trabaja
  perfectamente dentro de cuadro. Se pierden las ruedas y el fondo lateral (cajas,
  ventanas), que no aportan a la escena.

**No hizo falta tocar `object-position`.** Queda en `center` (el valor por default que
ya estaba en el PLAN). Las dos imágenes simuladas se guardaron en el scratchpad de la
sesión, no en el repo.

**Qué enseña:** una observación falsificadora sirve cuando de verdad se la busca. Acá se
pudo resolver sin navegador porque la pregunta era sobre el archivo (dónde cae el sujeto
dentro del cuadro), no sobre el layout — el mismo principio que la sesión 11 usó para
verificar contraste sin abrir un browser.

### 4. Verification — 2026-08-26T20:55:00Z

- `npm run check` (astro check): 35 archivos, 0 errores, 0 warnings, 0 hints.
- `npm run build`: 7 páginas + `sitemap.xml`, OK.
- `dist/service.html`: `<img class="hero__media" src="/img/service/hero.avif"
  alt="Mecánico revisando la parte inferior de un auto sobre un elevador de taller"
  width="1171" height="781" loading="eager" decoding="async">` — un solo `<img>` de hero,
  atributos correctos.
- `dist/_astro/service.*.css`: `object-fit:cover;object-position:center`,
  `min-height:max(560px, calc(100svh - var(--header-h))` y
  `min-height:max(440px, calc(100svh - var(--header-h))` (mobile) presentes;
  `linear-gradient(#0000 40%,#000000bf)` — equivalente minificado de
  `linear-gradient(to top, rgba(0,0,0,.75), transparent 60%)` (reversión de paradas con
  dirección implícita `to bottom`, mismo resultado visual que `HomeHero`).
- `dist/service.html`: 0 ocurrencias de `MultiavisoContainer` (correcto, `/service` no
  tiene catálogo). `dist/usados.html`: `class="page-hero"` presente — `PageHero` sigue
  intacto y en uso ahí.
- **Sin verificar:** el `npm run deploy` (no corresponde, no hay nada que dependa del
  plugin en este cambio) y la versión final sin watermark de la foto — ver `TODO` en
  `PHOTOS.serviceHero` (`src/data/site.ts`) y en el frontmatter de `ServiceHero.astro`.

---

## Session 15 — main thread on `bielcar` (started 2026-08-26T20:30:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T20:30:00Z
session_ended_utc: 2026-08-26T20:40:00Z
final_status: completed
handoff_slug: service-hero-altura
files_written:
  - src/components/ServiceHero.astro
  - src/components/ServiceBrands.astro
  - src/components/PageHero.astro
  - README.md
```

### 1. Cambio pedido — el hero de /service no puede ocupar el viewport

`ServiceHero.astro` (agregado por otra sesión) copiaba literal la altura de HomeHero:
`max(560px, 100svh - header)`. En el Home eso está bien porque el hero ES la portada; en
/service es un encabezado con contenido inmediatamente abajo, y a pantalla completa la
página no da ninguna señal de que sigue.

Pasa a `clamp(300px, 42svh, 440px)` en desktop y `clamp(260px, 34svh, 340px)` en mobile:
escala con la pantalla pero nunca la llena. En un viewport de 1440×900 el bloque
siguiente asoma ~170px; en un portátil de 720px de alto, ~70px.

**Falso arranque anotado:** se leyó "el banner" como el `PageHero` y se le agregó un prop
`compact` antes de mirar el archivo. `/service` ya no usa `PageHero`. El prop se revirtió
entero — no quedó API muerta.

**Qué enseña:** el repo cambió entre sesiones. Leer el archivo antes de editarlo no es
opcional aunque uno crea que lo escribió.

### 2. Cambio pedido — el logo es el link, sin etiqueta

Se sacó la línea "Agendar" + ícono de WhatsApp que la sesión 14 había puesto debajo de
cada logo. Queda como §5.6: wordmarks pelados. La comprensión ahora la sostienen el lede
de la franja y el `aria-label` de cada link — anotado en el componente y en el README que
el lede no se borra.

### 3. Bug encontrado — las medidas del hero estaban mal

`ServiceHero` declaraba `width="1171" height="781"`. El archivo real es **1500×527**.
Consecuencias: la reserva de espacio antes de la carga era de un alto equivocado (salto
de layout), y el análisis de `object-position` del comentario —que decía estar verificado
contra el archivo real— se había hecho sobre medidas que no son las del archivo, así que
su conclusión no valía.

Se corrigieron los atributos y se rehizo la simulación de `cover` con las medidas reales
para las cajas que produce la altura nueva: 1440×420 conserva 100% del ancho y 83% del
alto; 375×300 conserva 44% del ancho y 100% del alto, y lo que queda es el sujeto.
`object-position: center` sirve en los dos.

### 4. Corrección — el TODO de la marca de agua no se corresponde con el archivo

La nota decía que `hero2.png` tenía marca de agua "Unsplash+" en toda la superficie. El
archivo que está hoy no la tiene. Se reemplazó el TODO por lo que sí sigue en pie: es
stock, no es el taller de Bielcar, hay que confirmar la licencia antes de deployar, y es
provisorio hasta que Sebastián mande fotos del local.

### 5. Verification — 2026-08-26T20:40:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- `min-height` compilado: `clamp(300px,42svh,440px)` / `clamp(260px,34svh,340px)`
- `<img>` del hero con `width="1500" height="527"`
- Franja: 4 logos, 0 ocurrencias de "Agendar" como texto visible, 0 de `sbrand__action`.
  Los 4 mensajes de WhatsApp intactos, "Lynk & Co" incluido
- `PageHero.astro` sin rastros de `compact`
- **Sin verificar:** cómo se ve. Las alturas y los recortes están calculados, no vistos

---

## Session 16 — main thread on `bielcar` (started 2026-08-26T20:45:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T20:45:00Z
session_ended_utc: 2026-08-26T20:52:00Z
final_status: completed
handoff_slug: mail-de-service
files_written:
  - src/data/site.ts
  - src/pages/contacto.astro
  - README.md
```

### 1. Pedido — cargar el WhatsApp y el mail donde haya `<Placeholder>`

Se auditó primero en vez de editar. Resultado: **el número de WhatsApp y el mail de
ventas ya estaban cargados desde la sesión 12** (`WHATSAPP = '59898010230'`,
`SALES_EMAIL = 'bielcar@bielcar.com.uy'`). Los `<Placeholder what="número de WhatsApp">`
y `what="mail de ventas"` que aparecen en 6 archivos son **ramas de fallback que nunca
renderizan** — el mecanismo, no la salida. Confirmado contra el HTML generado de las 7
páginas: cero ocurrencias de esos dos textos.

El único que sí renderizaba era `mail de service`, en /service y /contacto.

**Qué enseña:** "reemplazá el placeholder" no siempre quiere decir que hay un placeholder
visible. Grepear el `dist/` distingue el hueco real del mecanismo que lo cubre, y evita
"arreglar" código que ya estaba bien.

### 2. Dato nuevo — el mail de service es el mismo que el de ventas

El pendiente estaba redactado como "mail de service (si es otro)": la pregunta abierta
era si existía una segunda casilla, no cuál era. No existe.

`SERVICE_EMAIL = SALES_EMAIL`, y la constante se conserva en vez de borrarse. Los
componentes que dicen "escribinos por service" siguen expresando QUÉ mail muestran, no a
cuál apuntan hoy; si mañana abren una casilla de taller se cambia en un lugar.

### 3. Consecuencia de UI — /contacto colapsa las dos filas de mail

Con las dos constantes iguales, la columna de datos mostraba "Ventas:
bielcar@bielcar.com.uy" y "Service: bielcar@bielcar.com.uy" una debajo de la otra: la
persona lee dos veces para descubrir que son iguales, y sugiere una separación de canales
que no existe. Ahora es una sola fila "Email".

La condición compara los valores, no un booleano escrito a mano, así que el día que se
separen la vista vuelve sola a dos filas.

### 4. Verification — 2026-08-26T20:52:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- `[FALTA: mail de service]` ya no aparece en ninguna página
- /contacto: 5 filas de datos — Dirección, Horario, Teléfonos (los 3), WhatsApp
  (098 010 230) y **una sola** fila Email
- /service: `mailto:bielcar@bielcar.com.uy`
- `wa.me/59898010230` presente en Home, /service y /contacto. El `wa.me/` sin número que
  aparece en el grep es el template literal `https://wa.me/${t}` del script del
  formulario, resuelto en runtime — no es un link roto
- Placeholders que quedan, todos legítimos: redes sociales, foto del local, texto
  institucional, equipo de ventas, qué incluye un service

---

## Session 17 — main thread on `bielcar` (started 2026-08-26T20:58:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T20:58:00Z
session_ended_utc: 2026-08-26T21:08:00Z
final_status: completed
handoff_slug: service-precarga-contacto
files_written:
  - src/components/ServiceBrands.astro
  - src/components/ContactForm.astro
  - src/data/site.ts
  - src/pages/service.astro
  - README.md
```

### 1. Cambio pedido — la franja de service ya no abre WhatsApp

Tocar un logo ahora navega a `/contacto?service=<marca>` y el formulario aparece con el
motivo en "Service" y el mensaje escrito. Razón del pedido, textual: abrir WhatsApp de
una es invasivo. Y es correcto — sacaba a la persona del sitio a una app sin preguntarle
nada y con un texto que no había leído. Ahora ve qué va a mandar antes de mandarlo.

Efecto lateral: la franja dejó de ser conversión y pasó a ser navegación interna. Un
click ahí ya no cuesta nada.

También se sacó la línea "Somos servicio oficial de estas cuatro marcas…", por pedido.
La franja queda como §5.6: wordmarks pelados.

### 2. Decisión — el link lleva la MARCA, no el mensaje

`?service=Geely` y no `?mensaje=Quiero%20agendar…`. Dos motivos:

1. El copy queda en el código. Si cambia el texto, los links viejos producen el texto
   nuevo en vez de quedar congelados.
2. **Suplantación.** Un parámetro que se vuelca al formulario tiene que ser validable.
   Con un nombre de marca se contrasta contra `SERVICE_BRANDS` y lo que no esté se
   descarta. Con un mensaje libre, cualquiera podría armar un `/contacto?mensaje=…` con
   un texto engañoso y mandárselo a otra persona para que se lo envíe a Bielcar sin
   leerlo. No es XSS —se asigna a `.value`, no a `innerHTML`— pero el resultado es que
   Bielcar recibe un mensaje que su remitente nunca escribió.

Verificado: rechaza `Ferrari`, `Geely<script>` y vacío; acepta `Lynk & Co` a través del
round-trip de encoding (`Lynk%20%26%20Co`).

### 3. Trampa evitada — el query param NO se puede leer en el frontmatter

El proyecto es `output: 'static'`. Las páginas se prerenderizan, así que en build time
`Astro.url.searchParams` viene vacío **siempre**. Un
`Astro.url.searchParams.get('service')` en el frontmatter compila, no tira error y no
anda nunca: es el modo de falla silencioso de mezclar reflejos de SSR con un sitio
estático. La precarga va en un `<script>` de cliente, y está anotado en el componente
para que nadie lo "simplifique" moviéndolo arriba.

### 4. Detalle de implementación — el foco va a "Nombre"

Al llegar precargado, el foco va al primer campo que la persona TIENE que completar, no
al principio del formulario: motivo y mensaje ya están escritos y lo que falta es quién
es y a qué teléfono llamarla. Además el foco arrastra el scroll, así que el formulario
queda a la vista sin scrollear a mano ni animar nada.

### 5. Verification — 2026-08-26T21:08:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- Los 4 links: `/contacto?service=Geely`, `…=Lynk%20%26%20Co`, `…=JAC`, `…=Mitsubishi`
- 0 ocurrencias de `wa.me` en la franja y 0 de `sbrands__lede`
- `/contacto` emite `data-service-brands="Geely|Lynk & Co|JAC|Mitsubishi"`,
  la plantilla y el motivo
- Los tres IDs que toca el script (`#cf-motivo`, `#cf-mensaje`, `#cf-nombre`) existen, y
  el `<option value="Service">` también
- Validación probada en node con marcas válidas, inválidas y vacío
- **Sin verificar en browser:** que el foco y el scroll se comporten como se espera al
  llegar desde /service

---

## Session 18 — main thread on `bielcar` (started 2026-08-26T21:15:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T21:15:00Z
session_ended_utc: 2026-08-26T21:32:00Z
final_status: completed
handoff_slug: dos-lineas-de-contacto
files_written:
  - src/data/site.ts
  - src/components/WhatsAppForm.astro
  - src/components/ContactForm.astro
  - src/components/ServiceForm.astro
  - src/components/ServiceCta.astro
  - src/components/WhatsAppFab.astro
  - src/components/Footer.astro
  - src/layouts/Base.astro
  - src/pages/contacto.astro
  - src/pages/service.astro
  - README.md
```

### 1. Dato nuevo — ventas y taller atienden en números distintos

| | Fijos | Celular / WhatsApp |
|---|---|---|
| Ventas | 2403 2283 · 2401 8820 | 098 010 230 |
| Service | 2403 2282 | 098 432 283 |

El celular de ventas ya estaba; lo nuevo es el segundo WhatsApp y el reparto de los tres
fijos, que hasta ahora vivían en una sola lista `site.phones`.

### 2. Bug que el dato nuevo destapó

`/service` tiene un bloque titulado **"Contacto directo del taller"** que listaba
`site.phones` — los tres. Dos de esos tres son de ventas. Era una afirmación falsa con
consecuencia práctica: alguien llama para agendar un service, cae en ventas, y hay que
pasarle con otro. Ahora sale de `CONTACT.service` y el título dice la verdad.

**Qué enseña:** el bug no estaba en el código, estaba en la forma del dato. Una sola
lista de teléfonos hacía que "los teléfonos de la empresa" y "los teléfonos del taller"
fueran indistinguibles, así que cualquier componente podía afirmar lo segundo mostrando
lo primero. Partir el dato hizo imposible seguir escribiéndolo mal.

### 3. Decisión — NO existe una constante `WHATSAPP` suelta

Se borró en vez de dejarla como alias de `CONTACT.sales.whatsapp`. Un alias habría dejado
compilar todos los call sites viejos, incluidos los de service, apuntando en silencio al
número equivocado. Sacarla hizo que `astro check` marcara **15 errores en 5 archivos**,
que son exactamente los lugares que había que revisar uno por uno.

**Qué enseña:** cuando un dato se parte en dos, romper a propósito los consumidores es
más barato que un default que compila. El typechecker se vuelve la lista de tareas.

### 4. Decisión — el `<select>` de motivo de /contacto ahora enruta

Era informativo: viajaba escrito en el mensaje y nada más. Con dos líneas, dejarlo así
mandaría todas las consultas de service al WhatsApp de ventas. `WhatsAppForm` recibió
`routeField` + `routeMap`: el valor de un campo elige el número en el momento del envío.
El mapa se resuelve a **números** en el servidor y viaja resuelto, así el script del
cliente hace un lookup y no necesita conocer `CONTACT` ni el concepto de "línea".

Un valor que no esté en el mapa cae en el default en vez de romper.

### 5. Decisión — el FAB cambia de línea en /service

El botón flotante va a ventas en todo el sitio menos en `/service`, donde va al taller.
Quien está leyendo esa página y toca el botón verde quiere agendar. Se sostiene porque el
mensaje prellenado también cambia: quien lo recibe ve una consulta de service, no un
texto genérico que no explica por qué le llegó.

### 6. Consecuencia de UI — footer y /contacto listan las dos líneas

Con dos números, una fila mezclada obliga a la persona a adivinar a cuál llamar. Las dos
vistas ahora las muestran separadas y etiquetadas "Ventas" / "Service". El celular no se
lista aparte del WhatsApp: es el mismo número y duplicarlo sugiere dos canales.

### 7. Verification — 2026-08-26T21:32:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- **Ruteo verificado sobre el HTML generado, link por link:**
  - FAB: ventas en /, /usados, /contacto, /nosotros; **taller en /service**
  - CTA de service del Home → taller (`59898432283`)
  - Banda de permuta → ventas
  - Formulario de /service → `data-wa="59898432283"`
  - Formulario de /contacto → default ventas, `data-wa-route-map={"Service":"59898432283"}`
- /service, "Contacto directo del taller": solo `2403 2282` y `098 432 283`
- Footer: `Ventas → 2403 2283 · 2401 8820 · WhatsApp 098 010 230` /
  `Service → 2403 2282 · WhatsApp 098 432 283`
- /contacto: filas Dirección, Horario, Ventas, Service, Email
- JSON-LD `telephone`: los tres fijos
- **Sin verificar:** el envío real de cada formulario en un browser

---

## Session 19 — main thread on `bielcar` (started 2026-08-26T21:40:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T21:40:00Z
session_ended_utc: 2026-08-26T21:52:00Z
final_status: completed
handoff_slug: redes-sociales
files_written:
  - src/data/site.ts
  - src/components/Icon.astro
  - src/components/Footer.astro
  - src/layouts/Base.astro
  - README.md
```

### 1. Dato nuevo — las redes sociales

Instagram, Facebook, Mercado Libre y el WhatsApp de ventas. Se cargaron en `SOCIAL`
(site.ts), se renderizan en la fila del footer (§5.8, parte 2) y los perfiles entran al
`sameAs` del JSON-LD.

Con esto `/nuevos`, `/usados`, `/vehiculos` y `/contacto` quedan **sin ningún
`<Placeholder>`**.

### 2. Decisión — los íconos no se descargan, se dibujan inline

El usuario preguntó si hacían falta archivos. No: `Icon.astro` son SVG inline, sin
dependencias ni requests. Instagram y Facebook están en Lucide (heredados de Feather),
así que entran sin romper la regla de "no mezclar sets" y con el mismo trazo 1.5.

**Se verificaron antes de escribirlos en el componente**, renderizando los paths a PNG
con `qlmanage` y mirándolos. Un path de marca escrito de memoria que sale mal no falla
—renderiza un borrón— y nadie lo nota hasta producción.

### 3. Decisión — Mercado Libre va como wordmark, no como ícono genérico

No hay glifo de Mercado Libre en Lucide. Las dos salidas fáciles eran malas: un path
dibujado de memoria sale como un borrón, y un ícono genérico de "tienda" no se lee como
Mercado Libre — que en Uruguay se reconoce por su logo amarillo o por el nombre, no por
una metáfora. Va el nombre, que es el mismo fallback de wordmark que `BrandStrip` ya usa
para una marca sin archivo.

`icon: null` en `SOCIAL` es la señal, y está documentado cómo cambiarlo si llega el SVG.

### 4. Decisión — el WhatsApp NO entra al `sameAs`

`sameAs` significa "la misma entidad en otro lado de la web". Un `wa.me` es una forma de
escribirle a la empresa, no un perfil suyo. Meterlo ahí le afirma a Google algo que no es
cierto. El campo `profile` de `SOCIAL` hace el corte y `SOCIAL_PROFILES` lo aplica.

### 5. Nota abierta — el WhatsApp aparece tres veces en el footer

En la fila de redes, en la línea "Ventas" de la columna de datos, y en el FAB flotante.
Los tres en el mismo viewport. Se dejó porque el usuario lo listó explícitamente entre
las redes, pero está señalado para que decida: sacarlo de la fila de redes es borrar una
entrada de `SOCIAL`.

### 6. Verification — 2026-08-26T21:52:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- Fila del footer verificada sobre el HTML generado: Instagram (ícono), Facebook (ícono),
  Mercado Libre (wordmark), WhatsApp (ícono) → `wa.me/59898010230`
- `sameAs`: los tres perfiles, sin el `wa.me`
- Placeholders restantes solo en / (foto del hero), /service (checklist) y /nosotros
  (foto, texto institucional, equipo). Las otras cuatro páginas quedaron limpias
- Íconos de Instagram y Facebook renderizados a PNG y revisados antes de integrarlos
- **Sin verificar:** el peso óptico de la fila mezclando tres glifos con un wordmark

---

## Session 20 — main thread on `bielcar` (started 2026-08-26T21:55:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T21:55:00Z
session_ended_utc: 2026-08-26T22:12:00Z
final_status: completed
handoff_slug: logos-y-textos
files_written:
  - src/components/ServiceBrands.astro
  - src/pages/nosotros.astro
  - src/pages/service.astro
  - src/data/site.ts
  - README.md
```

### 1. Bug visual — el `object-fit: contain` de la franja de /service no aplicaba

Reportado con captura: los cuatro logos desalineados, JAC y Mitsubishi más grandes y más
bajos que Geely. Con `contain` en cajas iguales, Geely, JAC y Mitsubishi tenían que medir
los tres 52px de alto; en la captura JAC medía ~46% más.

Causa: `.sbrand__media` era un contenedor de grid con `place-items: center` y el `<img>`
llevaba `width/height: 100%`. El porcentaje no resuelve de forma confiable contra la caja
en ese caso y la imagen se quedaba con su tamaño intrínseco. **`BrandStrip` nunca tuvo el
problema porque siempre usó píxeles explícitos sobre el `<img>`** — la corrección fue
copiar ese patrón, no inventar otro.

**Qué enseña:** había un componente del mismo repo haciendo lo mismo bien. Cuando se
escribe un hermano de algo que ya funciona, la variación gratuita en el CSS es deuda.

### 2. Mejora — tope de alto por proporción

Aun con `contain` arreglado, un emblema casi cuadrado llena el alto de la caja mientras un
wordmark 6:1 como Lynk & Co queda a menos de la mitad: geométricamente centrados, a la
vista los emblemas se comen la fila. En el marquee del Home se disimula (siete logos en
movimiento); acá son cuatro y quietos.

Se le baja el techo a los emblemas (44px) en vez de agrandar los wordmarks, que son
bitmaps y se pixelarían. **Verificado componiendo la fila con los archivos reales y
mirándola**, no a ojo: el primer intento con 44 → 40 dejaba a JAC tan chico que sus textos
internos ("JAC", "MOTORS") no se leían.

### 3. Texto institucional de /nosotros

Lo mandó Sebastián. Va en `ABOUT_PARAGRAPHS`, partido en cuatro párrafos (de corrido son
160 palabras sin respiro). Una sola corrección de puntuación —una coma empalmando dos
oraciones pasó a dos puntos— con el mismo criterio que "Mecanica" → "Mecánica".

Se recortó la bajada que ya existía: decía "además tenemos taller multimarca, chapa y
pintura, y tomamos usados en parte de pago", que es exactamente lo que dicen los párrafos
2 y 3 del texto nuevo. Quedó solo con lo que el texto institucional NO dice: qué marcas.

**Dos hallazgos anotados en el README:** el texto afirma **escribanos propios** y
**financiación propia o bancaria**, dos servicios que no están en `SERVICES` ni en el
bloque del Home. Y está escrito en *usted* mientras la interfaz habla de *vos*.

### 4. "Qué incluye un service" — se publicó, y por qué se pudo

Era el `<Placeholder>` más importante del sitio. El borrador que llegó resuelve el
problema que lo bloqueaba: **arranca aclarando que cada marca define su plan según modelo
y kilometraje**, y recién después enumera "en líneas generales". Esa salvedad convierte la
lista en una descripción de cómo funciona el mantenimiento programado en vez de una
promesa de contenido puntual. Está anotado en `site.ts` que si alguien la borra, el bloque
cambia de naturaleza.

**Qué se dejó afuera del borrador, y por qué:**

| Sección | Motivo |
|---|---|
| "SERVICIO OFICIAL" + intro | La página ya lo dice tres veces: el hero, la franja de 4 logos y el ítem "Servicio oficial" de la grilla |
| "TAMBIÉN HACEMOS" | Duplica el ítem "Mecánica general". Y **"alineación y balanceo" no está en la lista de Sebastián** — implica alineadora, es un servicio puntual sin confirmar |
| "AGENDÁ TU SERVICE" + botón | `ServiceForm` ya está abajo y pide exactamente marca, modelo y kilometraje |
| Horarios y dirección | Ya están en el bloque "Contacto directo del taller" |

**Dos frases quedaron marcadas como promesas, no descripciones:** "manteniendo la garantía
vigente" y "nunca hacemos nada sin tu aprobación". Son estándar en un servicio oficial y
por eso se publicaron, pero si el taller no las sostiene son un problema y no un texto.

### 5. Verification — 2026-08-26T22:12:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- Alturas emitidas por logo: Geely 48, Lynk & Co 48, JAC 44, Mitsubishi 44; CSS con
  `--logo-w: 150px`, `align-items: center` y las medidas en píxeles sobre el `<img>`
- Fila compuesta con los archivos reales y revisada visualmente en dos variantes antes de
  fijar el tope
- /nosotros: los cuatro párrafos presentes, `[FALTA: texto institucional]` eliminado
- /service: bloque "Mantenimiento programado" con la salvedad, los 6 ítems y la nota de
  aprobación; `[FALTA: qué incluye un service]` eliminado
- **Quedan solo dos placeholders en todo el sitio**: foto del local (Home y /nosotros) y
  equipo de ventas
- **Sin verificar:** la fila en el browser real; la simulación usó los archivos y las
  mismas medidas, pero no es el motor de layout

---

## Session 21 — main thread on `bielcar` (started 2026-08-26T22:15:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T22:15:00Z
session_ended_utc: 2026-08-26T22:24:00Z
final_status: completed
handoff_slug: redes-blanco-y-mercadolibre
files_written:
  - src/data/site.ts
  - src/components/Footer.astro
  - public/img/redes/logo-mercado-libre.png
  - README.md
```

### 1. Los tres glifos de redes pasan a blanco

Estaban en `--text-on-dark-muted` (#B0B0B0) con hover a blanco. Pedido: blanco.
El hover pasó a trabajar con opacidad (0.85 → 1) porque desde blanco pleno no queda a
dónde subir con color.

### 2. Mercado Libre entra como imagen A COLOR, no como glifo blanco

El archivo lo dejó el usuario en la raíz del repo; se movió a `public/img/redes/`.

**No se pasó a blanco, y no es una omisión.** El logo es el apretón de manos: óvalo azul
marino, relleno amarillo, manos blancas con contorno azul. El filtro
`brightness(0) invert(1)` que usan las franjas de marcas conserva el alfa, y como acá
TODO el óvalo es opaco, el resultado es un óvalo blanco liso sin dibujo — el mismo modo
de falla que ya documenta `BRAND_LOGOS` para los PNG con fondo opaco, pero peor, porque
acá el color no es un fondo: es el logo.

La única forma de tener una versión monocroma sería fabricarla mapeando luminancia a alfa
(el navy queda opaco, el amarillo casi transparente). Eso es un logo de marca modificado
por nosotros y no se hace sin pedirlo.

Se verificó componiendo la fila real —tres glifos blancos más el archivo a 24px— y
mirándola: el óvalo amarillo se reconoce al instante y no desentona.

### 3. Detalle de accesibilidad

El `aria-label` está en el `<a>` y el `<img>` lleva `alt=""`. Con texto en los dos, un
lector de pantalla anunciaría "Mercado Libre Mercado Libre".

### 4. Verification — 2026-08-26T22:24:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- Fila verificada sobre el HTML generado: Instagram, Facebook y WhatsApp como glifo
  blanco; Mercado Libre como `<img>` a color
- `dist/img/redes/logo-mercado-libre.png` presente
- Fila compuesta con el archivo real y revisada visualmente
- **Nota:** Mercado Libre mide 35px de ancho contra 24 de los glifos (el óvalo es
  ~1.45:1) y además es el único a color, así que pesa un poco más en la fila. Es
  deliberado; bajarle el alto a ~21px lo empareja si molesta

---

## Session 22 — main thread on `bielcar` (started 2026-08-26T22:30:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T22:30:00Z
session_ended_utc: 2026-08-26T22:42:00Z
final_status: completed
handoff_slug: footer-logo-y-mapa
files_written:
  - src/components/Footer.astro
  - src/pages/contacto.astro
  - src/styles/tokens.css
```

### 1. Bug — el logo del footer salía estirado a lo ancho

Reportado con captura: el logo ocupaba media pantalla, deformado.

Causa: `.footer__data` es `display: flex; flex-direction: column` **sin declarar
`align-items`**, o sea `stretch` por default. Eso estira a los hijos a lo ancho del
contenedor, y un `<img>` con `height: 40px` fijo estirado en el eje transversal pierde la
proporción. **`width: auto` no protege del estirado por `align-items`** — es el malentendido
del bug.

Fix: `align-self: flex-start` en el logo.

**Es el mismo tipo de falla que la franja de /service de la sesión 20**: una medida que
parece fija y que el layout de arriba pisa. Se hizo una auditoría del repo buscando
`<img>` que sean hijos de un flex en columna: **este era el único**.

### 2. El mapa se veía apagado, como deshabilitado

El filtro era `grayscale(1) invert(0.92) hue-rotate(180deg)`. Cuentas: el fondo blanco de
Google queda en ~#141414 y las calles en ~#292929 — **20 puntos de separación sobre 255**.
No es que estuviera oscuro, es que no tenía contraste interno.

Se agregó `brightness(1.75)`: fondo ~#242424, calles ~#4A4A4A, etiquetas empujadas a
blanco pleno.

**Calibrado sobre la captura del usuario, no a ojo.** La captura ya tiene el filtro actual
aplicado, así que aplicarle un `brightness` extra simula exactamente el resultado de
sumarlo al CSS. Se compararon 1.5, 1.75 y 1.75 con piso, renderizando las cuatro variantes
juntas. 1.5 quedaba corto; el piso levantaba los negros sin ganar legibilidad.

### 3. El filtro pasa a ser un token

Estaba escrito dos veces —footer y /contacto— con la misma tuning no obvia. Ahora es
`--map-filter` en tokens.css. Dos vistas del mismo mapa que se separan porque alguien
ajustó una sola es un problema esperando.

Se sacó el `hue-rotate(180deg)`: después de `grayscale(1)` no queda matiz que rotar. Era
un no-op y el comentario que lo justificaba ("devuelve los azules del agua a su lado del
círculo") describía algo que no pasaba.

### 4. Verification — 2026-08-26T22:42:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- `.footer__logo` compilado con `align-self: flex-start`
- `--map-filter` definido una vez en `:root` y consumido por los dos mapas: el del footer
  en `Base.css`, el de /contacto inline en su HTML (Astro inlinea las hojas chicas)
- Auditoría de `<img>` dentro de flex en columna: sin otros casos
- **Sin verificar:** los dos arreglos en el browser. El del logo es determinista; el del
  mapa se calibró sobre la captura real, que es el mismo pixel que produce el filtro

---

## Session 23 — main thread on `bielcar` (started 2026-08-26T22:50:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T22:50:00Z
session_ended_utc: 2026-08-26T23:04:00Z
final_status: completed
handoff_slug: pin-del-mapa-y-mercadolibre
files_written:
  - src/styles/tokens.css
  - src/components/Footer.astro
  - src/data/site.ts
```

### 1. Pregunta — ¿se le puede poner el color de marca al pin del mapa?

Respuesta corta: **no se puede apuntarle al pin.** El mapa es un iframe de otro origen;
el filtro CSS cae sobre todos los píxeles por igual y no hay selector que entre.

Pero hay una casualidad aritmética que sirve: **el pin de Google es rojo, el inverso del
rojo es cian, y la marca de Bielcar es petróleo.** Sacando el `grayscale(1)` del filtro,
`invert(0.92)` deja el pin en #26B2BE — a 23 unidades de `--brand-bright` (#1F9CBF). Con
el `brightness(1.75)` que ya estaba queda en ~#43FFFF: cian vivo, no blanco.

Se le presentaron al usuario tres caminos con sus costos (probar sin grayscale / pasar a
Static Maps API con `markers=color:0x007F9E` y API key / dejarlo). Eligió probar.

**Corrección sobre la propuesta:** el preview ofrecía `brightness(1.2)`, que habría
desecho la legibilidad ganada en la sesión 22. Se mantuvo 1.75 y se avisó — a ese brillo
el pin igual sale cian.

**Costo aceptado y anotado en el token:** sin grayscale, todos los colores sobreviven a la
inversión. El agua queda marrón anaranjada y los parques violeta. En esta vista —centro de
Montevideo— no hay agua y el único verde es Plaza Liber Seregni. **Si alguna vez se
recentra el mapa cerca de la rambla, el Río de la Plata va a salir marrón.**

### 2. Mercado Libre pasa a escala de grises

Pedido del usuario, después de haberlo dejado a color. Se aplica `grayscale(1)`.

**El detalle que importa:** en la sesión 21 se documentó que "pasarlo a blanco lo
destruye". Eso era cierto de la técnica de las franjas de marcas —`brightness(0)
invert(1)`, que aplasta todo a blanco conservando el alfa y sobre un óvalo opaco da un
óvalo blanco liso— pero **no de `grayscale`**, que mapea cada color a su luminancia y
conserva el dibujo: azul marino oscuro, amarillo claro, apretón de manos visible.

La nota vieja quedaba afirmando algo falso, así que se reescribió en `site.ts` explicando
que los dos filtros suenan igual y hacen cosas opuestas sobre este archivo.

Verificado renderizando el PNG real con los dos filtros y mirándolos, no deduciéndolo.

### 3. Verification — 2026-08-26T23:04:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- `--map-filter: invert(.92) brightness(1.75)` en el CSS compilado, sin grayscale
- `.footer__social-img` con `filter: grayscale()` (el minificador lo escribe sin el 1,
  que es equivalente)
- Fila de redes compuesta con el archivo real y revisada: los cuatro elementos leen
  monocromos y el apretón de manos se distingue a 24px
- **SIN VERIFICAR — el mapa.** La captura del usuario ya venía con `grayscale` aplicado,
  así que el color es irrecuperable y no se pudo previsualizar el resultado. Las cuentas
  del pin son firmes; cómo queda el mapa entero con color sobreviviendo a la inversión
  hay que mirarlo en `npm run dev`

---

## Session 24 — main thread on `bielcar` (started 2026-08-26T23:10:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T23:10:00Z
session_ended_utc: 2026-08-26T23:14:00Z
final_status: completed
handoff_slug: revertir-grayscale-mapa
files_written:
  - src/styles/tokens.css
```

### 1. Revertido — el mapa vuelve a grayscale

La sesión 23 sacó el `grayscale(1)` del filtro del mapa para aprovechar que el pin rojo de
Google, invertido, cae en un cian de la familia de la marca. El usuario lo miró y decidió
volver atrás: sin grayscale todos los colores sobreviven a la inversión, y un mapa con el
agua marrón y los parques violeta cuesta más de lo que vale un pin del color correcto.

`--map-filter: grayscale(1) invert(0.92) brightness(1.75)`. O sea el estado de la sesión
22 —el brillo que arregló la legibilidad se conserva—, solo se repuso el grayscale.

**El comentario del token se reescribió en vez de borrarse.** Queda documentado que se
probó, por qué era tentador y por qué no funcionó, más el camino real si algún día se
quiere el pin en color de marca (Static Maps API con `markers=color:0x007F9E`, que además
borraría todo el filtro, a cambio de una API key con facturación y perder el pan/zoom).
Sin esa nota, el próximo que lea el filtro va a tener la misma idea y repetir el
experimento.

### 2. Lo que NO se tocó

El `grayscale(1)` del logo de Mercado Libre en la fila de redes queda como estaba: el
pedido era solo por el mapa. Verificado en el CSS compilado.

### 3. Verification — 2026-08-26T23:14:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- `--map-filter: grayscale(1) invert(.92) brightness(1.75)` en el CSS compilado
- `.footer__social-img` sigue con `filter: grayscale()`

---

## Session 25 — main thread on `bielcar` (started 2026-08-26T23:20:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T23:20:00Z
session_ended_utc: 2026-08-26T23:32:00Z
final_status: completed
handoff_slug: mercadolibre-line-art
files_written:
  - src/components/Icon.astro
  - src/components/Footer.astro
  - src/data/site.ts
  - README.md
files_deleted:
  - public/img/redes/logo-mercado-libre.png
  - mercado-libre.svg
```

### 1. Mercado Libre pasa a ser un glifo como los otros tres

El usuario subió el line-art oficial en SVG. Siendo trazo, se colorea con `currentColor`
y no necesita ni `<img>` ni filtro: se integra a `Icon.astro` como cualquier otro ícono.

Esto cierra un ciclo de tres intentos —`<img>` a color, `<img>` con `grayscale(1)`, y
ahora glifo— que existía solo porque el único archivo disponible era un PNG con relleno
opaco. **La conclusión que quedó escrita en el README: cuando un logo de marca no se
puede monocromizar, la respuesta no es buscar el filtro correcto, es conseguir el
line-art.**

### 2. Dos decisiones dentro del ícono

**`transform: scale(0.5)` en vez de reescribir coordenadas.** El archivo viene en un
viewBox de 48 y el componente usa 24. Escalar el grupo es exacto y no toca ninguna
coordenada; reescribir los nueve paths a mano son nueve oportunidades de equivocarse.

**Trazo efectivo 1.0, no el 1.5 del set.** Esta es una desviación consciente. Se
renderizaron 1.5, 1.2, 1.0 y 0.85 al tamaño real (24px) y se miraron: con 1.5 los dedos
del apretón se empastan en una mancha, y 0.85 queda notoriamente más liviano que
Instagram al lado. 1.0 es donde el dibujo se lee sin romper la fila. Es el precio de
meter un dibujo denso en una caja de 24px, y está anotado en el componente para que no se
"corrija" a 1.5 por consistencia.

### 3. Limpieza

Se borraron el PNG (103 KB que se deployaban sin usarse), el directorio `public/img/redes/`
que quedó vacío, y el SVG de origen en la raíz del repo — su contenido ahora vive inline
en `Icon.astro`, que es la fuente. Verificado que `dist/` ya no incluye ninguno.

### 4. Verification — 2026-08-26T23:32:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- Los cuatro elementos de la fila salen como `<svg>` en el HTML generado, ninguno `<img>`
- `transform="scale(0.5)"` y `stroke-width="2"` presentes en el markup emitido
- Fila final compuesta **extrayendo los SVG del HTML generado** (no del código fuente) y
  revisada visualmente: los cuatro leen como un set consistente
- Sin referencias colgadas a `social-img`, `social-word`, `s.image` ni `redes/logo`
- `dist/img/redes/` no existe

---

## Session 26 — main thread on `bielcar` (started 2026-08-26T23:40:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-26T23:40:00Z
session_ended_utc: 2026-08-26T23:56:00Z
final_status: completed
handoff_slug: icono-ml-tamano-y-label-mapa
files_written:
  - src/components/Icon.astro
  - src/components/Footer.astro
  - src/pages/contacto.astro
  - src/data/site.ts
  - README.md
```

### 1. El ícono de Mercado Libre se veía chico — la causa no era el `scale(0.5)`

El usuario pidió sacar el `transform: scale(0.5)` porque "está muy chico". El scale no era
la causa: era la conversión del viewBox de 48 al de 24, y sin él el ícono se dibujaría al
doble y quedaría recortado por el propio viewBox.

**La causa real es la proporción.** La marca de Mercado Libre es un óvalo BAJO: en una
caja de 24 ocupa 19.5 de ancho y solo 13 de alto, mientras Instagram ocupa 20x20. Misma
caja, la mitad de masa vertical.

Se hicieron las dos cosas:

- **Se sacó el `scale(0.5)`**, reemplazado por soporte de viewBox por ícono
  (`iconViewBox` / `iconStroke` en Icon.astro). Es más limpio: sin wrapper y sin factor
  mental, el ícono conserva su viewBox nativo.
- **Se arregló el tamaño de verdad**: `size: 32` en su entrada de `SOCIAL`. Se compararon
  24, 28, 32 y 36 renderizados junto a Instagram; 32 es donde empareja sin verse más
  grande.

**Qué enseña:** cuando alguien reporta un síntoma y además propone la causa, conviene
verificar la causa. Sacar el scale sin tocar el tamaño habría dejado el ícono igual de
chico — o roto.

### 2. El mapa se titula con el nombre, no con la calle

Pedido: que la tarjeta del embed diga "Bielcar" y la dirección debajo, en vez de "La Paz
2028".

La query del embed pasó a llevar el nombre antes de la dirección. **Depende de que exista
la ficha de Google Business y NO está verificado** — si no existe, Google cae al geocoder
y el título vuelve a ser la dirección, o sea que el peor caso es el comportamiento
anterior. Quedó anotada la salida determinista (sintaxis `q=lat,lng(Etiqueta)`, que no
depende de ninguna ficha pero necesita las coordenadas del local).

De paso, la URL del embed estaba escrita dos veces con el mismo template. Ahora es
`mapEmbedSrc()` en site.ts, igual que se hizo con `--map-filter`.

### 3. Nota sobre la verificación visual

El primer render de control mostró el ícono de Mercado Libre como un cuadrado blanco
sólido. **Era una limitación de `qlmanage` con `<svg>` anidados de distinto viewBox, no un
problema del sitio**: se inspeccionó el markup emitido (`fill="none"
stroke="currentColor"`, formas correctas) y se rehízo el render aplanando los grupos en
vez de anidar svg. Ahí se vio bien.

Vale anotarlo: la herramienta de verificación también puede fallar, y un resultado raro
merece comprobar el markup antes de "arreglar" código que estaba bien.

### 4. Verification — 2026-08-26T23:56:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- Fila emitida: Instagram 24px/vb24/trazo 1.5 · Facebook ídem · **Mercado Libre
  32px/vb48/trazo 2** · WhatsApp 24px/vb24/fill
- `scale(0.5)` ya no aparece en el HTML generado
- Query del mapa: `Bielcar Automóviles, La Paz 2028, Montevideo, Uruguay`, en las dos
  vistas, desde una sola función
- Fila final compuesta desde el HTML generado y revisada
- **SIN VERIFICAR:** el título de la tarjeta del mapa. Depende de la ficha de Google
  Business de Bielcar, que no controlamos

---

## Session 27 — main thread on `bielcar` (started 2026-08-27T00:05:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-27T00:05:00Z
session_ended_utc: 2026-08-27T00:20:00Z
final_status: completed
handoff_slug: heroes-con-foto-en-catalogo
files_written:
  - src/components/PhotoHero.astro
  - src/pages/nuevos.astro
  - src/pages/usados.astro
  - src/pages/vehiculos.astro
  - src/pages/service.astro
  - src/data/site.ts
  - README.md
files_deleted:
  - src/components/ServiceHero.astro
```

### 1. Pedido — heroes con foto en las tres páginas de catálogo

Las mismas fotos que los tiles del Home: `/nuevos` → Lynk & Co, `/usados` → Honda CR-V,
`/vehiculos` → Geely. Así el acceso del Home y la página que abre se corresponden.

**Es desviación de §5.2** y se avisó antes de hacerlo, con el riesgo concreto: el detalle
de cada vehículo se renderiza in-place sobre esa MISMA URL con `?ma_carid=` (§6.4), así
que la foto queda arriba de la ficha de un auto que no es ese. Alguien mirando un Geely va
a tener una Honda CR-V encima. El usuario decidió igual; queda anotado en `PhotoHero` y en
el README con la vuelta atrás (una línea por página).

### 2. `ServiceHero` se generalizó a `PhotoHero`

El componente existía separado *a propósito*: su comentario decía que un prop `image` en
PageHero "queda a un solo import de distancia de usarse en /nuevos, /usados o /vehiculos",
y que separarlo obligaba a copiar código para hacer eso mal.

Ese uso es justamente el que se pidió, así que la separación dejó de proteger nada y
mantenerla habría significado duplicar el componente. Se generalizó y `ServiceHero.astro`
se borró.

**Qué enseña:** una barrera puesta contra un uso concreto deja de tener sentido cuando ese
uso se aprueba. Lo que hay que conservar no es la barrera sino la ADVERTENCIA — por eso el
⚠️ sobre el detalle de vehículo se movió a `PhotoHero` en vez de desaparecer con el
archivo.

### 3. Fallback en vez de `!`

El primer intento pasó `PHOTOS.tileNuevos!` — las fotos de tile son `Photo | null` porque
las manda Sebastián. Un `!` ahí afirma que existen y le miente al typechecker.

Se cambió por render condicional: si hay foto va `<PhotoHero>`, si no va `<PageHero>`.
Además de ser honesto, el fallback es **literalmente lo que §5.2 pide** para esas páginas,
así que el caso degradado es el comportamiento correcto del documento.

### 4. `PHOTOS` gana medidas reales

Los tiles tenían solo `src` y `alt`. Un hero muestra la imagen a ancho completo y sin
`width`/`height` la página salta al cargar. Se agregó la interfaz `Photo` con `w` y `h`
medidos de los archivos: 1920x1080 (nuevos), 1920x1280 (usados y todos), 1500x527
(service).

### 5. Verification — 2026-08-27T00:20:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- Las cuatro páginas emiten `<img class="hero__media">` con su foto y sus medidas reales
- Sin referencias colgadas a `ServiceHero` fuera de dos notas históricas
- **Encuadre verificado con los archivos reales**, simulando el `cover` para la caja de
  1440x420: los tres conservan 100% del ancho y 44-52% del alto, y en los tres el auto
  entero queda dentro con `object-position: center`. El degradado deja legible el h1
- **Sin verificar:** cómo se ve el hero arriba del DETALLE de un vehículo. Requiere
  `npm run deploy`, porque el plugin no renderiza fuera de bielcar.vercel.app — y es
  justamente el caso que el ⚠️ señala

---

## Session 28 — main thread on `bielcar` (started 2026-08-27T00:30:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-27T00:30:00Z
session_ended_utc: 2026-08-27T00:42:00Z
final_status: completed
handoff_slug: revertir-franja-y-subir-hero
files_written:
  - src/pages/nuevos.astro
  - src/pages/usados.astro
  - src/pages/vehiculos.astro
  - src/components/Footer.astro
  - src/components/PhotoHero.astro
```

### 1. Revertido — la franja de marcas en las páginas de catálogo

Se pidió agregar el marquee del Home arriba del listado en /nuevos, /usados y /vehiculos,
y al verlo se descartó ("para mejor no pongas nada"). Se quitó de las tres páginas y
`OWN_BRAND_STRIP` volvió a `['/', '/service']`, o sea que el footer vuelve a mostrarla en
esas rutas.

Queda una línea en el comentario de `OWN_BRAND_STRIP` diciendo que se probó y por qué se
descartó: entre el hero con foto y el listado del plugin, una fila de logos más era ruido.
Sin esa nota el próximo que mire la página va a proponer lo mismo.

### 2. El hero con foto sube de alto

`clamp(300px, 42svh, 440px)` → `clamp(380px, 52svh, 560px)` en desktop, y
`clamp(260px, 34svh, 340px)` → `clamp(320px, 42svh, 420px)` en mobile.

Es el **segundo** ajuste de este número, y por eso el comentario del componente ahora
documenta la regla en vez del valor: arrancó copiando el viewport entero de HomeHero (mal:
no se veía que hubiera scroll), bajó demasiado (la foto quedaba en una franja) y quedó
acá. **La condición que lo gobierna es que el bloque siguiente asome** — en una pantalla
de 900px de alto esto deja ~310px de contenido visible debajo del hero.

Afecta también a /service, que comparte el componente. Es deseable: las cuatro páginas con
foto tienen que verse igual.

### 3. Encuadre re-verificado, porque el propio componente lo pide

El comentario de `PhotoHero` dice que si cambia el alto hay que volver a mirar el recorte,
porque `object-fit: cover` depende del aspecto de la CAJA y no del archivo. Se rehízo la
simulación con los cuatro archivos reales para la caja nueva (1440x468):

| foto | conserva |
|---|---|
| nuevos | 100% ancho, 58% alto |
| usados | 100% ancho, 49% alto |
| todos | 100% ancho, 49% alto |
| service | 100% ancho, 93% alto |

En los cuatro el sujeto queda entero con `object-position: center` — y se ve MÁS foto que
antes, porque la caja es menos apaisada. No hizo falta tocar el encuadre.

### 4. Verification — 2026-08-27T00:42:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- Los nuevos `clamp()` presentes en las cuatro páginas con foto
- Ninguna página de catálogo importa ya `BrandStrip`; el Home sigue siendo el único que lo
  usa en el cuerpo
- Recortes renderizados con los archivos reales y revisados

---

## Session 29 — main thread on `bielcar` (started 2026-08-27T01:00:00Z)

```yaml
agent: main
stack: bielcar
session_started_utc: 2026-08-27T01:00:00Z
session_ended_utc: 2026-08-27T01:20:00Z
final_status: completed
handoff_slug: catalogo-contra-dom-real
files_written:
  - src/styles/multiaviso.css
  - src/components/MultiavisoCatalog.astro
  - README.md
```

### 1. Primer deploy: el catálogo se vio por primera vez

El usuario deployó y pasó capturas del listado y del detalle **más el DOM completo**. Es la
primera vez en todo el proyecto que se puede trabajar contra el markup real en vez de
contra §6.1.

### 2. §6.3 resuelto — el catálogo va sobre fondo CLARO

La decisión estaba abierta desde el paso 2, con la instrucción explícita de "decidir con el
resultado a la vista". El resultado:

- El plugin pinta el cuerpo de las tarjetas en **blanco** y gana la batalla de
  especificidad contra nuestro `background: transparent`.
- Todo lo que pinta en gris oscuro —`.filter-block-label`, `#Counts`, `.spec-value`,
  `.ItemTitle`— quedaba invisible sobre `--surface-dark`.

O sea, textualmente el escenario que §6.3 describe. `data-surface` por defecto pasa a
`light`. **El carrusel del Home sigue en `dark`** y pasa el prop explícito: ahí solo hay
tarjetas, sin filtros ni ficha, y una tarjeta blanca sobre banda oscura se lee perfecto.

### 3. Bug encontrado — la sección del detalle apuntaba a nodos que no existen

La hoja pisaba `.btn-contact`, `#BtnContact` e `input[type='submit']`. Los nodos reales son
`a#ContactNow` e `input#BtnMASubmit`, **que es `type="button"`, no `submit`**. Por eso el
CTA del detalle seguía saliendo con el azul del plugin: el override nunca matcheó.

**Qué enseña:** un selector que no matchea no rompe nada, y por eso no se nota. El
comentario del archivo lo declaraba como apuesta —"puede no aplicar a nada, no rompe"— y
esa misma frase es la que hizo que nadie lo revisara. Capturar el DOM antes de escribir el
override no es opcional.

La sección 9 se reescribió entera contra la estructura real: `#Multiaviso-back`,
`.ItemTitle`, `#ItemYearKM`, `#ItemPrice`, `.contact-item`, `.specs-title`, `.spec-label`,
`.spec-value`, `span.spec`, `.ContactField`, `#BtnMASubmit`.

### 4. La apuesta de las 3 columnas se descarta

`width: calc(33.333% - 22px)`, donde el 22 era una suposición sobre el margen del plugin.
Visto en producción, **las 4 columnas nativas se ven bien y parejas**, y cambiar el ancho
de un float con un margen no medido arriesga el apilado en breakpoints que el plugin trae
y nosotros no conocemos. Se sacó la regla. Si algún día se quieren 3, primero hay que
MEDIR el margin en devtools.

Es §6.2 aplicado: "el riesgo no es reconstruir el layout, es romper lo que ya anda".

### 5. Otros ajustes con selectores reales

- Se sacan los bordes de `#ListContainer` / `#ListWrapper` / `#ItemContainer` /
  `#ItemWrapper`, que dibujaban un recuadro flotando dentro de la banda.
- El contador de cada filtro (`.filter-block-item span`) baja a `--ma-text-faint`, como
  pide §6.3.
- `.filter-block-more` ("Más opciones") es un `<a>` SIN href, así que no heredaba el color
  de link. Se le da color y cursor.
- `#SpecsDescription` recibe tope de medida. **No se le pisan los colores**: ese texto lo
  carga Sebastián en el panel con estilos inline propios, así que es contenido y no markup
  del plugin. Si mañana lo edita, gana lo que escriba.

### 6. Lo que NO se tocó, y por qué

El formulario del detalle no recibe el tratamiento de §5.4 (label persistente, línea
inferior). Su markup es del plugin, los campos son placeholder-only y no hay `<label>` que
mostrar: aplicarle nuestro sistema sería reconstruir markup ajeno. Se lo alinea en
tipografía y radio, nada más.

Y sigue **sin enviar**: reCAPTCHA da `Invalid domain` para bielcar.vercel.app. Es el único
canal de leads del catálogo, depende de Madfes y no se arregla con CSS.

### 7. Verification — 2026-08-27T01:20:00Z

- `npm run check`: 35 archivos, 0 errores, 0 warnings, 0 hints
- `npm run build`: 7 páginas + sitemap, OK
- `data-surface="light"` en las páginas de catálogo, `"dark"` en el Home
- Los selectores nuevos presentes en el CSS compilado: `#ContactNow`, `#BtnMASubmit`,
  `.ItemTitle`, `#ItemPrice`, `.spec-value`, `.filter-block-more`
- **Sin verificar:** el resultado. Requiere otro `npm run deploy` — es la misma limitación
  de siempre, pero ahora los selectores salen del DOM y no de una deducción

---

## Session 30 — main thread on `bielcar` (started 2026-08-27T01:40:00Z)

### 1. Carrusel del Home: `FEATURED` → `ALL`, provisorio

Se intentó un fallback automático (arrancar en `FEATURED`, y si el contenedor quedaba
vacío reinicializar el plugin con `ALL`). **No funciona: el plugin no tolera un segundo
`Multiaviso.initialize()` sobre el mismo contenedor.** Queda anotado en
`FeaturedCarousel.astro` para que nadie lo reintente. El código del reintento se sacó en
vez de dejarlo dormido.

Corre en `'ALL'` a pedido, con el título todavía en "Destacados". ⚠️ Mientras esté así el
bloque promete selección sobre stock cualquiera. Cerrar antes de mostrárselo al cliente:
marcar destacados y volver a `FEATURED`, o cambiar el título.

### 2. La franja de marcas queda SOLO en el Home

Se sacó de `/nuevos`, `/usados`, `/vehiculos`, `/nosotros` y `/contacto`. Como el footer
dejó de renderizarla en toda ruta, la lista `OWN_BRAND_STRIP` no distinguía nada y se
eliminó junto con la franja en vez de quedar como una condición que siempre da lo mismo.
`/service` conserva `ServiceBrands`, que es otro componente.

### 3. `/contacto`: banner con foto y dark mode

Banner nuevo (`assets/contacto/hero.png`, 1983x793) vía `PhotoHero`. Es la SEGUNDA foto de
stock del sitio: el `alt` describe un mostrador genérico y no afirma que sea el de Bielcar,
igual que `serviceHero`.

La banda pasó a `band--dark`. `FormField` y `WhatsAppForm` tenían los colores cableados a
superficie clara y los comparte `/service`, que sigue clara — se hicieron sensibles a la
superficie con custom properties (`--field-*`) definidas en `.band--light` / `.band--dark`.
Heredan por el DOM, así que cruzan el scope de Astro sin `:global()` ni una prop nueva. Los
valores del lado claro son los de antes: `/service` no cambió.

`color-scheme: dark` va en `.contacto` y NO en `.band--dark`: el popup del `<select>` es
nativo y no lo alcanza el CSS, pero `.band--dark` también envuelve controles del plugin,
que no se pueden verificar en dev.

### 4. BUG: tres páginas se maquetaban como desktop en mobile

`Base.astro` NO declaraba `<meta name="viewport">`, con este razonamiento escrito:
"el plugin inyecta el suyo y pisa cualquiera que pongamos".

**El razonamiento solo valía en las 4 páginas que cargan el plugin.** En `/service`,
`/nosotros` y `/contacto` no había nadie inyectando nada: quedaban sin viewport, y los
navegadores móviles asumían ~980px. Eso era la nav completa sin hamburguesa y las grillas
en dos columnas que se veían en el teléfono. Ahora se declara siempre, **sin
`user-scalable=no`** — esa restricción es el problema abierto con Madfes y no hay motivo
para replicarla.

### 5. BUG: la foto de los tiles no llenaba su caja

`.tile__img` era un grid item con `height: 100%`, o sea un porcentaje contra una pista
`auto` — indefinida. Medido en Chrome headless a 393px: caja de 220px, imagen de **262**.
`object-fit: cover` nunca entraba en juego y el recorte lo hacía el `overflow:hidden`,
comiéndose 42px POR ABAJO en vez de recortar parejo. En iOS Safari se manifestaba al revés:
quedaba una franja de `--surface-dark` arriba de la foto, y se leía como una línea más
CLARA que el resto porque el degradado de `.tile::after` deja el pie del tile anterior en
2/255 contra el 13/255 del fondo. Eso era "la línea que no está negreada".

Fix: `position: absolute; inset: 0` en `.tile__img`. Saca el alto de la ecuación del grid.
`.tile__media` sigue siendo grid para centrar el `<Icon>` del fallback.

### 6. Verification — 2026-08-27T01:55:00Z

- `npm run check`: 36 archivos, 0 errores
- `npm run build`: 7 páginas, OK
- **Medido en Chrome headless** (no deducido) a 393 / 700 / 1400px:
  `topGap=0.0 botOverflow=0.0` en los tres tiles, contra `botOverflow=41.9` antes.
- Análisis de píxeles del screenshot del usuario: banda uniforme de `#0D0D0D` de 41px
  (17.5 CSS px) entre el borde y la foto. Después del fix, esa banda no existe: el borde
  de 1px (gris 37 = `rgba(255,255,255,.10)` sobre `#0D0D0D`) pasa directo a la foto.
- `/nosotros` auditado por el mismo patrón: sano, la imagen llena exacto.
