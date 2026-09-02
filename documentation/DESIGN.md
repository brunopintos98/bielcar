# DESIGN.md — Bielcar Automóviles

Sistema de diseño derivado de los screenshots de referencia.
Input para Claude Code. No es un documento de marca, es un contrato de implementación.

**Referencias usadas**

| Sitio | Qué aporta |
|---|---|
| premiumcars.com.uy | Referencia principal. Misma plataforma (Multiaviso), mismo mercado, mismo tipo de contenido. Define el 80% del lenguaje visual. |
| porsche.com/usa | Solo el patrón de card de vehículo con hover y el uso de imagen full-bleed dentro de la card. |
| theelitecars.com | Solo el bloque de testimonios y el FAB de WhatsApp. Ambos opcionales. |

**Estado de los valores**

- **Color: resuelto.** El acento ya no es provisorio. Ver §2. Los hex de superficie y neutros siguen leídos a ojo de los screenshots y se pueden ajustar sin consecuencias.
- **Tipografía: sin resolver.** La familia real de premiumcars no está identificada. La propuesta de §3 es una aproximación.
- **Integración Multiaviso: resuelta.** Confirmada por Gabriel Madfes y verificada contra el staging andando en `bielcar.vercel.app`. Ver §6.

---

## 1. Decisiones de dirección

Se toma el lenguaje de premiumcars, no su contenido.

**Se copia:**
- Alternancia de bandas oscuras y bandas claras a ancho completo.
- Imagen full-bleed como protagonista, tipografía encima, sin cajas ni tarjetas flotantes.
- Radio 0 en casi todo. Sin sombras. La separación es por contraste de banda, no por elevación.
- Formularios con inputs de línea inferior, sin caja.
- Franja de marcas en negro, wordmarks en blanco, sin fondo por marca.
- Footer partido: datos a la izquierda, mapa de Google a la derecha, a ancho completo.

**No se copia:**
- La grilla 2x2 "Comprar / Vender / Permutar / Consignar". **Bielcar sí permuta, pero no consigna.** Se descarta la grilla porque queda coja con tres celdas de cuatro, no porque el contenido no aplique. La permuta se resuelve como CTA, ver §5.10.
- El split "Autos y camionetas / Tractores". No hay tractores.
- Los inputs con solo línea inferior y placeholder gris claro sobre fondo claro. Contraste insuficiente. Ver §5.4.
- Las cards redondeadas de Porsche. Mezclar radio 16px con el resto en radio 0 rompe el sistema. Se toma el patrón de composición, no el radio.

**El bloque que reemplaza al 2x2:** una grilla de 3 accesos (0km, Usados, Todos) con el mismo tratamiento de imagen full-bleed y label en la esquina inferior izquierda. Mismo patrón, contenido de Bielcar.

---

## 2. Color

**El acento de Bielcar es azul petróleo, no rojo.** Sale de dos mediciones independientes sobre el sitio actual: un tally de colores computados dio `rgb(0,127,158)` como el único color no heredado de Bootstrap, y un muestreo manual dio `#287f9f`. Prácticamente el mismo tono.

Todo lo demás en el sitio viejo (`#333` de texto, `#337ab7` de link) son defaults de Bootstrap 3, no decisiones de marca. Se descartan.

```css
:root {
  /* Superficies */
  --surface-dark:        #0D0D0D;  /* banda oscura, fondo por defecto */
  --surface-dark-raised: #171717;  /* header sticky, filtros, footer interno */
  --surface-light:       #F2F2F2;  /* banda clara: formularios, bloque de servicios */

  /* Texto sobre oscuro */
  --text-on-dark:        #FFFFFF;
  --text-on-dark-muted:  #B0B0B0;
  --text-on-dark-faint:  #6E6E6E;  /* labels de ficha técnica, metadatos */

  /* Texto sobre claro */
  --text-on-light:       #141414;
  --text-on-light-muted: #4A4A4A;

  /* Marca — azul petróleo Bielcar */
  --brand:               #007F9E;  /* superficies de marca, bordes, elementos grandes */
  --brand-deep:          #005E75;  /* hover sobre --brand, texto sobre claro */
  --brand-bright:        #1F9CBF;  /* TEXTO sobre oscuro: nav activo, año | km, "Volver al listado" */
  --brand-wash:          #E8F3F7;  /* fondo sutil sobre banda clara, chips */
  --brand-contrast:      #FFFFFF;

  /* WhatsApp — color de acción */
  --whatsapp:            #128C3E;
  --whatsapp-hover:      #0E7433;

  /* Bordes y reglas */
  --rule-on-dark:        rgba(255,255,255,0.10);
  --rule-on-light:       rgba(0,0,0,0.12);
  --rule-strong:         rgba(255,255,255,0.28); /* subrayado de títulos de ficha */
}
```

### 2.1 El conflicto petróleo / verde, y cómo se resuelve

Petróleo y verde WhatsApp están a unos 46° de matiz, los dos saturados y fríos. Un botón petróleo al lado de uno verde no lee como "marca + excepción", lee como paleta descuidada. Este problema no existía con el acento rojo provisorio.

**Resolución: se reparten roles en vez de competir.**

| Color | Rol | Dónde |
|---|---|---|
| Petróleo | Marca, navegación, énfasis de texto | Logo, item activo del nav, "año \| km", "Volver al listado", focus de inputs, subrayados |
| Verde | Acción | Todos los botones sólidos de conversión |
| Fantasma | Acción secundaria | Botones no-WhatsApp: borde `--rule-strong`, fondo transparente |

La lógica: en este sitio casi toda conversión termina en WhatsApp (consultar vehículo, agendar service, contacto de ventas). Si el verde es el color de acción, deja de ser una excepción que hay que justificar y pasa a ser una regla. Y los pocos botones que no son WhatsApp no necesitan ser sólidos.

Consecuencia sobre §5.3: **no hay botón primario sólido petróleo.** Si aparece un caso que lo pida, es señal de que ese CTA debería ser WhatsApp o fantasma.

**Alternativa si esto no convence:** agregar un acento cálido (ámbar tipo `#F59E0B`) para precios y CTA no-WhatsApp. Resuelve el choque y le da salto visual al precio, pero rompe la disciplina de "dos superficies, un acento" y suma un color que no viene de la marca. Decisión abierta.

### 2.2 Contraste

Ratios calculados a mano contra `--surface-dark` (`#0D0D0D`). **Verificar con un checker antes de fijar**, son aproximaciones.

| Color | Ratio aprox. | Veredicto |
|---|---|---|
| `--brand` `#007F9E` | ~4.2:1 | **No usar para texto chico.** Solo fondos, bordes, íconos grandes |
| `--brand-bright` `#1F9CBF` | ~6.1:1 | Apto para texto de 13px en adelante |
| `--whatsapp` `#128C3E` | ~3.4:1 | Solo como fondo de botón con texto blanco encima |
| `--text-on-dark-faint` `#6E6E6E` | ~3.5:1 | Solo labels 12-13px en fichas, nunca prosa |

Sobre `--surface-light` (`#F2F2F2`), usar `--brand-deep` para texto, no `--brand`.

### 2.3 Convivencia con el CSS del plugin

El plugin trae su propio azul para links y para el botón "Contactar ahora" del detalle. Si no se pisa, van a convivir dos azules distintos en la misma pantalla. **Es un override obligatorio, no opcional.** Ver §6.3.

---

## 3. Tipografía

### Lo que se ve en la referencia

La display de premiumcars es una sans geométrica **ancha**, de peso ligero a regular, con contrapunzones grandes y terminaciones rectas. Se usa en tamaños grandes con `letter-spacing` levemente negativo en minúscula, y positivo cuando va en mayúscula (`CORPORATIVOS`, `TEST DRIVE`, `GESTORÍA Y ESCRIBANÍA`).

**No pude identificar la familia exacta desde screenshots.** Puede ser una licenciada. No la voy a nombrar a ojo.

### Propuesta

```css
--font-display: 'Sora', system-ui, sans-serif;   /* h1-h3, precios, wordmark */
--font-body:    'Inter', system-ui, sans-serif;  /* prosa, labels, UI */
```

Sora reproduce el ancho y el aire de la display de la referencia y es gratuita (Google Fonts). Alternativa igual de válida: **Space Grotesk**, un poco más técnica y con más carácter en los números, que es donde más se ve (precios grandes).

Si al mirar premiumcars en vivo con devtools aparece el `font-family` real y es gratuita, usar esa y descartar esta propuesta.

### Escala

Base 16px. Escala 1.25 en desktop, comprimida a 1.2 en mobile.

| Rol | Desktop | Mobile | Peso | Tracking | Familia |
|---|---|---|---|---|---|
| Hero h1 | 56px / 1.1 | 34px / 1.15 | 400 | -0.01em | display |
| h2 sección | 40px / 1.15 | 28px / 1.2 | 400 | -0.01em | display |
| h3 bloque | 28px / 1.25 | 22px | 400 | 0 | display |
| Precio destacado | 34px / 1 | 26px | 500 | 0 | display |
| Título de card | 20px / 1.3 | 18px | 600 | 0 | body |
| Eyebrow / caps | 13px / 1.4 | 12px | 500 | +0.12em | body, uppercase |
| Cuerpo | 16px / 1.65 | 15px / 1.6 | 400 | 0 | body |
| Cuerpo chico | 14px / 1.6 | 14px | 400 | 0 | body |
| Label de ficha | 13px / 1.5 | 13px | 400 | 0 | body |
| Botón | 15px / 1 | 15px | 500 | +0.02em | body |

**Regla:** los subtítulos de hero de la referencia van en `--text-on-dark-muted` y peso 400, nunca en blanco puro. Es lo que hace que el h1 respire.

Cargar solo los pesos usados: display 400/500, body 400/500/600. Dos familias, cinco cortes. `font-display: swap`.

---

## 4. Layout, espaciado, forma

```css
--container:      1280px;  /* contenido tipografiado */
--container-wide: 1600px;  /* grillas de vehículos */
--gutter:         24px;    /* 16px en mobile */
```

Muchos bloques van a **ancho de viewport completo** (héroes, tiles de imagen, franja de marcas, footer). Solo el texto y los formularios se meten en `--container`.

**Escala de espaciado**, base 4px: `4 8 12 16 24 32 48 64 96 128`.

```css
--section-y:        96px;  /* padding vertical de banda, desktop */
--section-y-mobile: 56px;
```

**Forma**

```css
--radius-none:  0;      /* imágenes, cards de vehículo, tiles, inputs */
--radius-sm:    2px;    /* botones */
--radius-full:  9999px; /* solo FAB de WhatsApp y pills de filtro activo */
```

Sin `box-shadow` en ningún componente estático. La única sombra permitida es la del FAB flotante, porque flota de verdad:
`box-shadow: 0 4px 16px rgba(0,0,0,0.35)`.

**Movimiento**

```css
--ease: cubic-bezier(0.2, 0, 0, 1);
--dur:  220ms;
--dur-drawer: 400ms;
```

- Hover de card: `transform: scale(1.03)` sobre la imagen, dentro de un contenedor con `overflow: hidden`. La card no se mueve, solo la foto.
- Hover de link de nav y de filtro: cambio de color a `--brand-bright`, sin subrayado animado.
- Nav mobile: hamburguesa de dos líneas desiguales (abajo ~2/3, alineadas a la derecha). Morphan a cruz en `--dur`. El drawer entra desde la derecha (`translateX`) en `--dur-drawer`, más lento a propósito.
- Hoja de filtros mobile: el chrome (backdrop, superficie, barras) entra en `--dur-drawer`. Backdrop en fade; superficie y barras en `translateY(--ma-sheet-h)` desde abajo. **No** se aplica `transform` al wrapper `.ma-sheet` ni a ningún ancestro de `#MultiavisoWrapper` — eso crearía containing block y desanclaría el `position: fixed` del panel. `#FilterContent` sigue creciendo con la animación de `height` de jQuery.
- Press: `:active { transform: scale(0.97) }` en botones, FAB y hamburguesa. Con `prefers-reduced-motion: reduce` el scale no se aplica.
- Nada de reveal on scroll ni transiciones de página. En un sitio de catálogo agrega latencia percibida sin aportar.
- Respetar `prefers-reduced-motion: reduce` desactivando el scale de las cards, el press, y las transiciones del drawer / hamburguesa / hoja de filtros (el reset de `base.css` ya anula `transition-duration`).

---

## 5. Componentes

### 5.1 Header

Sticky, `--surface-dark-raised` con `backdrop-filter: blur(8px)` y fondo a 85% de opacidad, altura 72px desktop / 60px mobile. Logo a la izquierda. En premiumcars el nav está partido en dos grupos (catálogo a la izquierda, institucional a la derecha); para Bielcar conviene un solo grupo alineado a la derecha porque hay menos items.

Item activo en `--brand-bright`. Hover en blanco. Mobile: hamburguesa de dos líneas desiguales, ancladas a la derecha (la de abajo más corta). Al abrir, el mismo botón morpha a cruz y el drawer entra desde la derecha (`translateX(100%) → 0`, `--dur-drawer`) sobre un overlay `--surface-dark` semitransparente con `backdrop-filter`. El header permanece visible y por encima del drawer; skip-link, main, footer y FAB quedan `inert`. No hay botón de cierre duplicado.

### 5.2 Hero de página interna

Banda `--surface-dark`, `padding: 88px 0 64px`, h1 + subtítulo en `--text-on-dark-muted`. Sin imagen. Es el patrón de "Autos y camionetas 0km, listos para estrenar." y funciona como separador entre el header y el listado del plugin. **Usar exactamente este patrón encima de cada página con Multiaviso**, porque le da un marco propio a un contenido que no controlamos.

Hero de home sí lleva imagen o video full-bleed con el h1 sobre el tercio inferior y un degradado `linear-gradient(to top, rgba(0,0,0,.75), transparent 60%)` para asegurar legibilidad.

### 5.3 Botones

Según §2.1, el color de acción es el verde. **No hay variante sólida petróleo.**

| Variante | Uso | Estilo |
|---|---|---|
| Acción (WhatsApp) | Agendar service, Consultar por este vehículo, Contacto de ventas | fondo `--whatsapp`, texto blanco, ícono a la izquierda, `padding: 16px 32px`, radio 2px |
| Fantasma sobre oscuro | Más información, Sobre nosotros, Ver todos | borde 1px `--rule-strong`, texto blanco, fondo transparente. Hover: borde `--brand-bright` |
| Fantasma sobre claro | secundario en banda clara | borde 1px `--rule-on-light`, texto `--text-on-light`. Hover: borde y texto `--brand-deep` |
| Texto | Volver al listado | texto `--brand-bright` con chevron a la izquierda |

Si un botón parece necesitar ser sólido y no es WhatsApp, revisar el contenido: probablemente ese CTA debería ir a WhatsApp, o no merece jerarquía primaria.

Sin uppercase forzado en botones. Sentence case, verbo en primera posición: "Agendar service", no "Service".

### 5.4 Formularios

Fondo `--surface-light`. Inputs sin caja, solo `border-bottom: 1px solid var(--rule-on-light)`, `padding: 12px 0`, sin radio.

**Corrección respecto a la referencia:** premiumcars usa placeholder como label. En cuanto escribís, perdés el nombre del campo, y el placeholder gris sobre gris claro no llega a contraste. Usar **label persistente arriba del input** en 13px `--text-on-light-muted`, más el input vacío sin placeholder. Focus: `border-bottom-color: var(--brand)` de 2px y `outline` visible por teclado.

El formulario de service arma un link `wa.me` prellenado, no hace POST. Los campos son marca, modelo, kilometraje, nombre y teléfono, y se serializan al texto del mensaje.

### 5.5 Card de vehículo (la nuestra, para el carrusel de destacados)

Esta es la única card que controlamos. La del listado la genera el plugin, ver §6.

```
┌────────────────────────┐
│                        │
│      imagen 16:10      │  full-bleed, sin radio, overflow hidden
│                        │
├────────────────────────┤
│ Mitsubishi Outlander   │  20px / 600 / body
│ 4x4 Plus 2.5 Gris      │  15px / --text-on-dark-muted
│ 2025  |  6.300 km      │  13px / --brand-bright
│                        │
│ USD 49.990             │  34px / display / 500
└────────────────────────┘
```

Toda la card es un link. Hover: `scale(1.03)` en la imagen. Sin borde, sin fondo propio: se apoya en `--surface-dark`.

De Porsche se toma únicamente la idea de que los CTA aparezcan en hover en lugar de estar siempre visibles, y **solo si** el carrusel de destacados termina necesitando dos acciones por card. Si es una sola acción (ver detalle), la card entera es el link y no hay botón.

### 5.6 Franja de marcas de servicio oficial

Banda `--surface-dark`, `padding: 48px 0`, wordmarks en blanco puro a `opacity: 0.75`, hover a 1. Distribución en flex con `gap: 64px` y `justify-content: center`, wrap en mobile.

**Parcialmente bloqueado.** Los logos que hoy usa el sitio viejo están disponibles acá:

```
https://bielcar.com.uy/img/logo-mitsubishi.png
https://bielcar.com.uy/img/logo-geely.png
https://bielcar.com.uy/img/logo-jac.png
https://bielcar.com.uy/img/logo-linkco.png
https://bielcar.com.uy/img/logo.jpg        ← logo Bielcar, JPG con fondo blanco
https://bielcar.com.uy/img/favicon.png
```

Sirven como respaldo, pero son PNG de mapa de bits. Para la franja monocroma de §5.6 conviene reemplazarlos por SVG.

El logo principal de Bielcar es `.jpg`, o sea fondo blanco quemado: **inutilizable sobre banda oscura**. Pedirle a Sebastián el original en vector o PNG con transparencia. Es bloqueante para el header.

Honda aparece en los sliders del sitio viejo pero no en la franja de marcas. **La lista sigue sin confirmar por Sebastián.** En el audio menciona Mitsubishi y dos marcas más que no se entienden. No inventar la lista.

### 5.7 Bloque de servicios con íconos

Dos columnas. Izquierda: h2, párrafo, botón de acción. Derecha: grilla 2x3 de ítems, cada uno con ícono lineal 40px, título 18px y una línea de descripción. Banda `--surface-light`.

**Uno de los seis ítems es la permuta** ("Tomamos tu usado en parte de pago"). En el Home la permuta vive acá, no como banda propia. Ver §5.10.

Íconos: trazo 1.5px, sin relleno, mismo peso óptico entre todos. Lucide sirve. No mezclar sets.

### 5.8 Footer

Tres partes apiladas, todas a ancho completo:

1. Franja de marcas (§5.6) sobre `--surface-dark`.
2. Fila de íconos sociales centrados, 24px, `--text-on-dark-muted`.
3. Split 50/50: izquierda `--surface-dark-raised` con logo, horarios, WhatsApp, email y dirección; derecha iframe de Google Maps a la misma altura, sin borde.
4. Barra de copyright, 14px `--text-on-dark-faint`, con "Volver arriba" a la derecha.

El mapa a media pantalla y altura completa es el detalle que más carácter le da al footer de la referencia. Vale copiarlo.

### 5.9 FAB de WhatsApp

Círculo 56px, `--whatsapp`, ícono blanco 28px, fijo abajo a la derecha con `24px` de margen, `z-index` por encima del header. En mobile subir a `bottom: 88px` si hay barra de acción inferior. Un solo FAB. No agregar chat widget además, como hace theelitecars: dos burbujas flotantes en la misma pantalla es ruido.

### 5.10 Banda de permuta

Bielcar toma usados en parte de pago. Es una línea de negocio real y necesita lugar propio en el sitio.

**Dónde va:** banda a ancho completo **debajo del contenedor de Multiaviso** en `/nuevos`, `/usados` y `/vehiculos`. Es el momento exacto en que alguien mira autos y piensa en el que tiene. Poner esto arriba del listado sería interrumpir; abajo, es la pregunta natural que sigue.

**Qué es:** banda `--surface-light`, `padding: 64px 0`, una línea de h2 y un botón de acción. Nada más. No es un formulario.

```
┌──────────────────────────────────────────────┐
│  ¿Tenés un usado?                            │   h2, display
│  Lo tomamos como parte del pago.                │   16px, --text-on-light-muted
│                                              │
│  [ Consultar por permuta ]                   │   botón WhatsApp
└──────────────────────────────────────────────┘
```

El botón abre `wa.me` con texto prellenado tipo "Hola, quiero consultar por una permuta." Sin campos: el que quiere permutar tiene un auto puntual y va a describirlo mejor escribiendo libre que llenando un form.

**No repetir la banda en el Home.** Ahí la permuta entra como un item del bloque de servicios de §5.7, no como banda propia. Dos apariciones del mismo CTA en una sola vista lo devalúa.

**Lo que NO se hace:** una sección de tasación con formulario de marca/modelo/año/km. Es el patrón obvio y es una trampa: sin backend no se puede tasar nada, y un formulario que solo manda un WhatsApp con datos que el vendedor va a repreguntar igual agrega fricción sin agregar información. Si más adelante Sebastián quiere tasación real, es otro proyecto.

---

### 5.11 Nota sobre consignación

**Bielcar no consigna.** Confirmado por Sebastián en la conversación inicial, en contraste con premiumcars que sí tiene esa sección. No agregar nada de consignación en ninguna página, aunque aparezca en los screenshots de referencia.

---

## 6. Territorio Multiaviso

Todo lo que vive dentro de `#MultiavisoContainer` es markup ajeno. Solo CSS. Esta sección es la parte del documento que hay que respetar literalmente.

### 6.1 Estructura real generada

Verificada contra el HTML capturado de `bielcar.vercel.app/usados.html`:

```
#MultiavisoContainer
└── #MultiavisoWrapper
    └── #ListWrapper
        └── #ListContainer
            └── table#ListTable
                ├── tr > td#Filters
                │   ├── a#FiltersTitle          "Filtros y Orden"
                │   └── #FilterContent
                │       ├── .filter-block > #Counts        "1 a 24 de 40 resultados"
                │       ├── #CurrentFilters > .current-filter
                │       ├── .filter-block#Sort
                │       │   ├── #SortDisplay
                │       │   └── #SortPopup > #SortPopupInner
                │       └── .filter-block (xN)
                │           ├── .filter-block-label        "Marca"
                │           ├── a.filter-block-item[.hidden]
                │           └── a.filter-block-more        "Más opciones"
                ├── tr > td#List
                │   └── div
                │       ├── .item (xN)
                │       │   ├── .item-image > a[style=background-image]
                │       │   ├── .item-title > a
                │       │   ├── .item-subtitle > a
                │       │   ├── .item-specs > a            "2025 | 6.300 km"
                │       │   └── .item-price > a            "USD 49.990"
                │       ├── div[style="clear: both"]
                │       └── #Pagination > a[.current], a#LnkPaginationNext
                └── tr > td[colspan=2] > #PoweredBy
```

### 6.2 Hallazgos que condicionan la implementación

**El plugin YA es responsive, y funciona.** Verificado en capturas de `bielcar.vercel.app/usados.html` a ~390px: colapsa a una columna, los filtros se pliegan bajo el acordeón `#FiltersTitle`, las tarjetas se apilan. No hay nada roto que arreglar.

Esto invierte la estrategia. **El riesgo no es reconstruir el layout, es romper lo que ya anda.** El trabajo es restilar, no rearmar. Toda modificación estructural tiene que justificarse contra lo que ya funciona.

**Es una tabla.** `#ListTable` con `td#Filters` y `td#List` en el primer `tr`, y `#PoweredBy` con `colspan=2` en el segundo. Si en algún momento hace falta cambiar la disposición de las dos columnas, el grid va **sobre el `tr`**, no sobre `#ListContainer`:

```css
/* Correcto: los td son hijos del tr */
#MultiavisoWrapper #ListTable tbody tr:first-child {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 40px;
}
```

`#ListContainer` no sirve como contenedor de grid porque su único hijo es la tabla. Y el `tr:first-child` es necesario para no afectar la fila de `#PoweredBy`.

**Solo hacer esto si el layout nativo no alcanza.** Probar primero sin tocar el display de tabla.

**Las cards son floats, no grid.** Hay `div[style="clear: both"]` como hermanos de `.item`, y `#Pagination` al final del mismo contenedor.

En desktop ancho el plugin muestra 4 columnas. Si se quieren 3, hay dos caminos y no son equivalentes:

*Opción A, mínima invasión (recomendada para empezar):* ajustar el ancho de `.item` por media query y dejar el float intacto.

```css
#MultiavisoWrapper #List .item { width: calc(33.333% - 22px); }
```

Conserva todo el comportamiento responsive nativo del plugin, incluidos los breakpoints que no conocemos.

*Opción B, grid:* da control real de gaps y alturas, pero **hay que reimplementar todos los breakpoints**, porque los del plugin dejan de aplicar.

```css
#MultiavisoWrapper #List > div { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
#MultiavisoWrapper #List > div > div[style*="clear"] { display: none; }
#MultiavisoWrapper #Pagination { grid-column: 1 / -1; }
```

Elegir A primero. Pasar a B solo si A no da el resultado buscado, y en ese caso hacer una pasada completa de mobile.

**La imagen es un background inline.** `.item-image > a` trae `style="background-image: url(...)"`. No se puede cambiar la fuente, solo el encuadre:

```css
#MultiavisoWrapper .item-image a {
  display: block;
  aspect-ratio: 16 / 10;
  background-size: cover;
  background-position: center;
  transition: transform var(--dur) var(--ease);
}
```

**El plugin inyecta su propio viewport meta:** `<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">`. Desactiva el pinch zoom en todo el sitio, no solo en el listado. Es un problema de accesibilidad y no lo controlamos desde CSS. **Preguntar a Gabriel Madfes si se puede desactivar esa inyección.** Si no se puede, es una limitación que hay que aceptar y documentar.

**El plugin inyecta gtag** (`G-S271T1SB8M`, propiedad de ellos) y un `<link rel="canonical">` apuntando a la URL actual. Verificar qué canonical pone en la vista de detalle con `?ma_carid=`: si canonicaliza cada vehículo a sí mismo con querystring, conviene saberlo antes de armar el sitemap.

**El plugin define `:root { --screen-height: 880px }`.** No usar ese nombre en nuestros tokens.

Nota: `:root` y `html` son el mismo elemento, así que declarar los tokens en `html` no aísla nada. La única protección real es no repetir nombres de variables. Con el prefijo de marca de §2 no hay riesgo.

**Whitelist por dominio, no por URL.** Confirmado por Madfes. Se pueden agregar rutas nuevas sin pedir permiso. Pero cada preview deploy de Vercel tiene hostname propio (`bielcar-xxxx-....vercel.app`), o sea otro dominio: **los previews no van a mostrar vehículos nunca.** Trabajar siempre contra el alias de producción con `vercel --prod`. Documentarlo en el README para no perder una tarde debuggeando esto.

**Font Awesome: resuelto, renderiza.** El plugin carga `font-awesome.min.css` y `fonts.min.css` por su cuenta en runtime, además de Open Sans y Jost desde Google Fonts. En las capturas del staging los chevrons de "Filtros y Orden" y de "Más relevantes" se ven bien.

Consecuencias: los íconos del plugin son de otro set que los nuestros (§5.7 propone Lucide), y sus tipografías conviven con las nuestras salvo que las pisemos explícitamente dentro de `#MultiavisoWrapper`. Ninguna de las dos cosas es grave, pero hay que decidirlas, no dejarlas pasar.

**El formulario de contacto del detalle está roto en staging.** En las capturas del detalle de vehículo aparece abajo a la derecha un error de reCAPTCHA (`Invalid domain`). Las site keys de reCAPTCHA se restringen por dominio igual que el whitelist del plugin, pero se configuran aparte. Gabriel habilitó `bielcar.vercel.app` en Multiaviso pero aparentemente no en reCAPTCHA.

Impacto: **"Contactar ahora" es el único canal de leads del catálogo.** Si reCAPTCHA no valida, es probable que el formulario no envíe. Hay que avisarle a Madfes ahora y volver a pedirlo para `bielcar.com.uy` el día del corte.

**`#PoweredBy`** es el crédito de Multiaviso. No ocultarlo por decisión propia. Preguntar si se puede restilar o mover al pie.

### 6.3 Estrategia de override

- Prefijar **todo** con `#MultiavisoWrapper`. Nunca escribir un selector suelto como `.item-title`: son clases genéricas y van a chocar con el resto del sitio.
- La hoja del plugin se inyecta en `<head>` en runtime, después de nuestros estilos. Ganar por especificidad de ID, no por `!important`. Reservar `!important` para casos donde el plugin usa estilos inline.
- Definir las variables en `html` o en un scope propio, no en `:root` compartido con el plugin.
- Objetivo del override: que `.item` termine visualmente igual a la card de §5.5, y que `.filter-block-item` se lea como los filtros de premiumcars (texto plano, contador entre paréntesis en `--text-on-dark-faint`, activo en `--brand-bright`).

**Overrides obligatorios, no opcionales:**

| Qué | Por qué |
|---|---|
| Azul de links del plugin → `--brand-bright` | Si no, hay dos azules distintos en pantalla |
| Botón "Contactar ahora" del detalle → `--whatsapp` | Es un CTA de conversión, va con el color de acción de §2.1 |
| Open Sans / Jost del plugin → `--font-body` dentro de `#MultiavisoWrapper` | El plugin carga sus propias fuentes de Google |
| Fondos claros del plugin → `--surface-dark` | El plugin asume fondo blanco; el sitio es oscuro |

Ese último es el que más trabajo va a dar y el que hay que probar primero: el plugin fue diseñado para fondo claro y todos sus grises de texto están calculados para eso. **Si tras probarlo el listado sobre banda oscura queda ilegible o requiere pelear cada selector, la salida sensata es hacer las páginas de catálogo sobre `--surface-light`** y reservar el oscuro para home, service, nosotros y footer. Es una desviación de la referencia, pero es mejor que un override frágil que se rompe con cada update del plugin. Decidir con el resultado a la vista, no antes.

### 6.4 Superficie de parámetros de URL

Útil para armar links de entrada propios desde el header o la home:

`ma_status` · `ma_brand` · `ma_type` · `ma_subtype` · `ma_sort` · `ma_min_price` · `ma_max_price` · `ma_min_km` · `ma_max_km` · `ma_fuel` · `ma_transmission` · `ma_page` · `ma_carid`

Ojo: el plugin genera `ma_status=USED` en unos links y `ma_status=used` en otros dentro del mismo documento. Al construir links a mano, replicar la forma que usa el propio plugin para ese filtro específico, no normalizar.

El detalle de vehículo se renderiza in-place con `?ma_carid=` sobre la misma URL. O sea: la página de listado y la de detalle son el mismo archivo. El hero de §5.2 se va a ver también arriba del detalle. En premiumcars pasa exactamente eso y funciona.

**Navegación verificada en staging, los dos casos andan bien:**

- El botón "atrás" del navegador vuelve al listado. No saca del sitio.
- `bielcar.vercel.app/usados.html?ma_carid=eey92m6f&ma_status=USED` abre el detalle directo en otro navegador. **Los vehículos son compartibles por link**, que para una automotora es funcionalidad central: mandar un auto por WhatsApp es media venta.

Consecuencia de diseño: el botón "Compartir" que el plugin ya trae en el detalle (con Facebook, X, WhatsApp y copiar link) funciona de verdad. No hace falta construir uno propio, sí restilarlo.

**Configuración confirmada por Madfes:**

```js
condition: 'ALL'   // listado combinado nuevos + usados, para /vehiculos
```

```js
// Carrusel de destacados del Home
Multiaviso.initialize({
  client: 'U2G4A329R575LH',
  containerSelector: '#MultiavisoContainer',
  viewMode: 'CAROUSEL',
  condition: 'ALL',
  listingType: 'FEATURED',   // usar 'ALL' para probar mientras no haya destacados
  carousel: { maxItems: 12 }
});
```

---

## 7. Composición por página

```
/                Hero full-bleed + h1
                 Franja de marcas de servicio oficial
                 3 accesos (0km / Usados / Todos) — tiles full-bleed
                 Carrusel de destacados (Multiaviso, formato carrusel)
                 Bloque de servicios con íconos (banda clara) — incluye permuta
                 CTA de service por WhatsApp
                 Footer

/nuevos          Hero de página interna + contenedor Multiaviso (condition NEW)
                 Banda de permuta (§5.10)
/usados          Hero de página interna + contenedor Multiaviso (condition USED)
                 Banda de permuta (§5.10)
/vehiculos       Hero de página interna + contenedor Multiaviso (condition ALL)
                 Banda de permuta (§5.10)

/service         Hero + marcas oficiales + qué incluye + formulario que arma link wa.me
/nosotros        Hero + split imagen/texto + equipo de ventas
/contacto        Split formulario / datos + mapa
```

**Ojo con la banda de permuta en las páginas de catálogo:** el detalle de vehículo se renderiza in-place sobre la misma URL, así que esa banda también va a aparecer debajo del detalle. Eso está bien y hasta mejora: alguien mirando un auto puntual es el mejor momento para ofrecerle tomarle el suyo.

El carrusel de destacados de la home **queda vacío si Sebastián no marca vehículos como destacados en el panel de Multiaviso.** Diseñar un estado vacío: si el contenedor no tiene hijos después de la inicialización, ocultar la sección entera en vez de dejar un hueco.

---

## 8. Responsive

| Breakpoint | Grilla de vehículos | Filtros | Nav |
|---|---|---|---|
| ≥1280 | 3 columnas | sidebar 260px fija | horizontal |
| 900–1279 | 2 columnas | sidebar 240px | horizontal |
| 700–899 | 2 columnas | sidebar (el plugin la fuerza abierta) | hamburguesa |
| 400–699 | 2 columnas | **hoja modal fija** | hamburguesa |
| <400 | 1 columna | **hoja modal fija** | hamburguesa |

**El breakpoint de los filtros es 700, no 900.** No es una decisión nuestra: la hoja del plugin oculta `#FiltersTitle` globalmente, lo muestra en `max-width: 700px` y fuerza `#FilterContent { display: block !important }` en `min-width: 700px`. O sea que el cambio sidebar → acordeón ya ocurre en 700, y en desktop no hay nada que forzar. Una versión anterior de esta tabla decía 600–899 y llevó a duplicar las reglas del plugin en 900px con tres `!important`, sembrando una discrepancia entre 700 y 900. Los breakpoints de la grilla (400 / 600 / 699) también son suyos. La columna "Nav" sí es nuestra y sigue rompiendo en 899.

Debajo de 700px los filtros **no** son el acordeón nativo del plugin: son una **hoja modal fija** sobre el resto del contenido — backdrop, barra superior con título y ✕, y barra inferior sticky con "Ver resultados". El patrón es el de Mercado Libre mobile.

La hoja mide **80svh y está anclada abajo**: el 20% de arriba deja ver el listado atenuado, para que se lea como una capa sobre los resultados y no como otra página. Sus superficies van en `--ma-bg-raised` (#171717), no en `--ma-bg`: sobre el backdrop al 60% el contenido atenuado queda casi del mismo negro que `--surface-dark` y el borde de la hoja desaparecía.

Esto revierte lo que este documento pedía antes ("en mobile dejar que el acordeón funcione"). El motivo: con ocho bloques de filtro el acordeón abierto mide varias pantallas y empuja el listado fuera de vista, así que después de elegir un filtro había que scrollear a ciegas para volver a los resultados.

Cómo se implementa, porque acota lo que se puede pedir después:

- **El toggle sigue siendo del plugin.** `#FiltersTitle` es su trigger y `#FilterContent` se abre con el `display: block` inline que escribe jQuery. Nosotros solo reposicionamos el panel con `position: fixed` (no hay containing block en la cadena, y por ser `fixed` escapa el `overflow: auto` de `#ListWrapper`).
- **Un solo `!important`, y es el caso que la regla lo reserva:** `overflow-y: auto !important` en `#FilterContent`. jQuery deja `overflow: hidden` INLINE después de animar, y sin eso el contenido no scrollea y los últimos bloques de filtro quedan cortados. Solo el eje Y.
- **El fondo de la hoja es una capa aparte** (`.ma-sheet__surface`), fija y del alto exacto de la hoja. No puede vivir en `#FilterContent`: ese es el contenedor que scrollea, y en el rebote de iOS su background se pinta junto con el contenido, así que al pasarse del final aparecía el listado de atrás. Por lo mismo la hoja no lleva `-webkit-overflow-scrolling: touch` (obsoleto desde iOS 13, y era el disparador).
- **El alto va por `height`, no por `top` + `bottom`.** Además de evitar restar de `100svh`, aprovecha que jQuery anima `height` inline: con la caja anclada por `bottom`, la animación del plugin se lee como una hoja que sube desde el borde inferior. El chrome nuestro (backdrop, superficie, head, foot) entra en paralelo, `--dur-drawer` (400ms, el default de `slideToggle` de jQuery): fade el backdrop, `translateY` las tres cajas fijas. El `transform` va en cada hijo, nunca en `.ma-sheet` ni en un ancestro de `#MultiavisoWrapper`.
- **El chrome es markup nuestro**, en `MultiavisoCatalog.astro`, fuera de `#MultiavisoContainer`. Cerrar despacha un click sobre `#FiltersTitle`: no se escribe en el DOM del plugin.
- **Cada filtro es un link que recarga la página**, así que no hay "aplicar al final". La hoja queda cerrada después de la recarga y "Ver resultados" es, en la práctica, el botón de cerrar.
- **No hay columna lateral de categorías** como en ML: exigiría rearmar el DOM del plugin en secciones navegables, que es exactamente lo que §6.2 prohíbe.
- **No es un dialog ARIA completo.** `role="dialog"` / `aria-modal` irían sobre `#FilterContent`, que es nodo del plugin, y el `inert` del Header no se puede reusar porque acá el panel está enterrado en el árbol. Hay lock de scroll, foco en el ✕ al abrir y cierre con `Escape`. El gap es conocido, no un olvido.

---

## 9. Pendientes que bloquean

### Resuelto desde la última versión

| Item | Resultado |
|---|---|
| Paleta de Bielcar | Petróleo `#007F9E`. §2 |
| Listado combinado | `condition: 'ALL'` |
| Script de carrusel | Confirmado, ver §6.4 |
| Whitelist | Por dominio. Previews de Vercel no funcionan |
| Detalle de vehículo | In-place, botón atrás OK, links compartibles OK |
| Responsive del plugin | Ya funciona. No rearmar, solo restilar |
| Font Awesome | Renderiza, el plugin la carga solo |

### Sigue bloqueando

| Bloqueo | Impacto | De quién depende |
|---|---|---|
| Logo Bielcar en vector o PNG transparente | Header inutilizable. El único que hay es JPG con fondo blanco | Sebastián |
| Lista textual de marcas de servicio oficial | §5.6 y toda la página /service | Sebastián |
| Logos de esas marcas en SVG | La franja monocroma no se puede hacer bien con los PNG actuales | Sebastián |
| Vehículos marcados como destacados | El carrusel del Home sale vacío. Es lo primero que se ve al entrar | Sebastián |
| Fotos del local | Hero de home y /nosotros. Sin esto se cae en stock genérico | Sebastián |
| Número de WhatsApp y mails de ventas / service | Todos los CTA del sitio | Sebastián |
| reCAPTCHA no habilitado en el dominio | El form del catálogo no envía. Único canal de leads del listado | Madfes |
| Viewport meta con `user-scalable=no` inyectado por el plugin | Desactiva pinch zoom en todo el sitio. Accesibilidad | Madfes |
| `#PoweredBy`: ¿se puede restilar o mover? | Footer del listado | Madfes |
| `font-family` real de premiumcars | Confirma o descarta la propuesta de §3 | Devtools, 2 minutos |

### Datos parciales que ya tenemos

El detalle de vehículo del plugin ya muestra estos datos, cargados por Sebastián en su panel:

```
La Paz 2028, Montevideo
098 010 230
Lunes a Viernes de 9:30 a 19 horas
```

Sirven como base para el footer, pero hay que confirmarlos. Los horarios en particular no dicen nada de sábados, que para una automotora es raro.

### Decisión abierta

El acento cálido de §2.1. Sin él, el precio compite con el resto del texto y los botones no-WhatsApp quedan todos fantasma. Con él, se suma un color que no viene de la marca. Resolver mirando el Home armado, no antes.
