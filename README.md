# Bielcar Automóviles

Sitio web de [Bielcar Automóviles](https://bielcar.vercel.app), automotora en Montevideo.
Rebuild completo de `bielcar.com.uy`.

Astro 7 con output estático, CSS plano con custom properties, sin frameworks de UI,
sin backend. El catálogo de vehículos lo renderiza el plugin de terceros de
**Multiaviso**.

**Dos documentos manda antes que este:**

- [`documentation/DESIGN.md`](documentation/DESIGN.md) — el contrato de implementación:
  paleta, tipografía, escala, componentes, composición por página y toda la integración
  con Multiaviso. Si una tarea lo contradice, se dice, no se elige por cuenta propia.
- [`CLAUDE.md`](CLAUDE.md) — las reglas del proyecto (nada de Tailwind, nada de
  ClientRouter, cómo se escriben los overrides del plugin) y el routing de agentes.

Este README es el estado del proyecto: qué anda, qué falta y qué no se puede probar
en local.

---

## Antes que nada: en `localhost` NO vas a ver vehículos

**Esto es esperado. No lo debuguees.**

El whitelist de Multiaviso es **por dominio** y el único habilitado es
`bielcar.vercel.app`. En cualquier otro host el contenedor queda vacío y hay un `404`
en `plugin/v3/list` en la consola.

| Dónde | ¿Muestra vehículos? |
|---|---|
| `localhost:4321` (`npm run dev`) | ❌ nunca |
| Preview deploys (`bielcar-xxxx.vercel.app`) | ❌ nunca — cada preview tiene hostname propio |
| `bielcar.vercel.app` (`npm run deploy`) | ✅ sí |

Layout, tipografía y navegación se trabajan en local. **El catálogo, los filtros, el
detalle y el carrusel del Home solo se verifican con `npm run deploy`.** Un screenshot
del dev server no prueba nada de eso.

---

## Comandos

```sh
npm install
npm run dev       # localhost:4321 — sin vehículos, ver arriba
npm run build     # genera dist/
npm run check     # astro check (typecheck)
npm run deploy    # vercel --prod → único entorno donde anda el catálogo
```

---

## Estructura

```
public/img/            logo (2 variantes con alpha), og.png, marcas/, home/, service/
src/
├── data/site.ts       FUENTE ÚNICA de datos, ROUTES, waLink(), las 2 listas de marcas
├── layouts/Base.astro html, head, meta social, JSON-LD, header, footer, FAB
├── components/        las piezas del sistema de §5 de DESIGN.md
├── pages/             una por ruta + sitemap.xml.ts (las URLs salen de ROUTES)
└── styles/
    ├── tokens.css     color, tipografía, layout, elevación
    ├── base.css       reset acotado — arranca con la lista de lo que NO se toca
    └── multiaviso.css overrides del plugin. Ruta de revisión obligatoria
```

`src/data/site.ts` es la fuente única: un dato se cambia ahí y aparece en todo el
sitio. Cuando falta algo, el campo queda en `null`, `waLink()` devuelve `null` y el
componente renderiza un `<Placeholder>` amarillo en vez de un link roto. **No se
completan esos campos con algo plausible** — el mecanismo existe para que un dato
inventado no llegue a producción. Hoy no queda ningún `null`.

---

## Lo que hay que saber para no romper nada

### Hay DOS líneas de contacto

Ventas y taller atienden en números distintos, confirmado por Sebastián.

| | Fijos | WhatsApp |
|---|---|---|
| **Ventas** | 2403 2283 · 2401 8820 | 098 010 230 |
| **Service / taller** | 2403 2282 | 098 432 283 |

Viven partidas en `CONTACT`. **No existe una constante `WHATSAPP` suelta a
propósito:** dejarla como alias del número de ventas invitaba a usarla desde un
componente de service sin notarlo. `waLink(mensaje, línea)` tiene `'sales'` por
defecto, así que **todo lo que sea taller pasa `'service'` explícitamente**.

El `<select>` de motivo de `/contacto` **enruta** (`routeField` / `routeMap` en
`WhatsAppForm`): "Service" va al taller, el resto a ventas. Si agregás una quinta
opción, decidí también a qué línea va — sin entrada en el mapa cae en ventas, que
puede ser correcto o puede ser un lead perdido.

`ALL_PHONES` junta los tres fijos y existe **solo** para el JSON-LD y las meta
descriptions, donde se describe a la empresa. Para mostrar en pantalla va
`CONTACT.sales` o `CONTACT.service`.

### Las marcas son DOS listas, no una

Confundirlas es afirmar algo falso.

| Constante | Qué es | Marcas |
|---|---|---|
| `SERVICE_BRANDS` | de las que es **servicio oficial** | Geely, Lynk & Co, JAC, Mitsubishi |
| `SALES_BRANDS` | las que **vende** | esas 4 + Honda, MG, Volvo |

**De Honda, MG y Volvo se vende pero NO hay service oficial.** La afirmación
"servicio oficial" vive solo en el ítem correspondiente del bloque de servicios, con
las 4 marcas nombradas. GWM quedó afuera de las dos.

Y son **dos franjas de logos distintas**, parecidas y con comportamiento opuesto:

| Componente | Marcas | Click |
|---|---|---|
| `BrandStrip` (marquee) | las 7 de venta | catálogo filtrado por marca |
| `ServiceBrands` (quieta, solo `/service`) | las 4 oficiales | `/contacto?service=<marca>` con el form precargado |

`ServiceBrands` no abre WhatsApp directo: precarga `/contacto` para que la persona
**vea qué va a mandar antes de mandarlo**. Esa precarga se resuelve **en el cliente**
(el sitio es estático: en build time `Astro.url.searchParams` viene siempre vacío) y
el parámetro **se valida contra `SERVICE_BRANDS`**. Por eso el link lleva la marca y
no el mensaje: un `?mensaje=` libre permitiría armar un link que precargue un texto
engañoso para que otra persona se lo envíe a Bielcar sin leerlo.

Los logos de `ServiceBrands` van pelados, así que **el `aria-label` de cada link es lo
único que dice a dónde lleva.** No se saca.

### Los formularios no hacen POST

No hay backend. `/service` y `/contacto` serializan sus campos al texto de un mensaje
de WhatsApp y abren `wa.me`. La fontanería está en `WhatsAppForm.astro`; el
tratamiento de campo, en `FormField.astro`. **Los inputs no llevan `placeholder` a
propósito** (§5.4): el placeholder-como-label desaparece en cuanto escribís.

### `ROUTES` es la lista de rutas, y el sitemap sale de ahí

El nav del header y `sitemap.xml.ts` leen la misma constante. Estaban separados, y así
es como una página nueva entra al nav —porque se ve— y queda fuera del XML durante
meses sin que nadie lo note.

---

## Estado

| # | Paso | Estado |
|---|---|---|
| 1 | Scaffold, tokens, layout, header, footer, FAB | ✅ |
| 2 | Catálogo (`/nuevos`, `/usados`, `/vehiculos`) + overrides del plugin | ✅ verificado en producción |
| 3 | Home (hero, accesos, carrusel, servicios, CTA) | ⚠️ ver carrusel abajo |
| 4 | `/service` | ✅ |
| 5 | `/contacto` y `/nosotros` | ⚠️ falta el equipo de ventas |
| 6 | SEO (OG, Twitter, JSON-LD, sitemap, robots) | ⚠️ faltan los 301 |
| 7 | Mobile y performance | ✅ |

Sobre el catálogo, dos cosas que conviene saber de entrada porque desvían de
`DESIGN.md` y están documentadas ahí:

- **Corre sobre fondo oscuro** (`data-surface="dark"`). Estuvo en claro una vuelta con
  el diagnóstico equivocado —"el plugin no se puede oscurecer"—; el problema real era
  **especificidad**, no color. Ver la cabecera de `multiaviso.css`.
- **En mobile los filtros son una hoja modal**, no el acordeón nativo del plugin
  (§8 de `DESIGN.md`).

---

## Pendientes

### De Sebastián (cliente)

- [ ] **Equipo de ventas** (nombres, roles y fotos). Es el **único `<Placeholder>` que
      renderiza en todo el sitio**, en `/nosotros`.
- [ ] **Confirmar dos promesas del texto de service.** No son descripciones, son
      compromisos: *"manteniendo la garantía vigente"* y *"nunca hacemos nada sin tu
      aprobación"*. Son estándar en un servicio oficial y por eso quedaron, pero si el
      taller no las sostiene son un problema, no un texto.
- [ ] **¿Hacen alineación y balanceo?** Se sacó del borrador de `/service`: implica
      alineadora y no está en la lista que confirmó. Si lo hacen, es una línea en
      `SERVICES`.
- [ ] **Dos servicios que el texto de `/nosotros` afirma y el sitio no lista:**
      trámites **con escribanos propios** y **financiación propia o bancaria**. Son
      diferenciales fuertes para una automotora. ¿Se agregan a `SERVICES`?
- [ ] **Logo en vector.** El PNG ya está integrado (fondo removido, dos variantes con
      alpha), pero mide 254x72: a 32px de alto en el header da ~2.2x de densidad y no
      da para más. No bloquea, es techo — y es el mismo techo de `og.png`, que se
      generó de ese logo.
- [ ] **Logos de marcas en SVG** (hoy son PNG de mapa de bits). **Si manda uno nuevo,
      tiene que tener transparencia real:** la franja los pasa a blanco con
      `filter: brightness(0) invert(1)`, que conserva el alfa, así que un PNG con fondo
      opaco se convierte en un bloque blanco. Ya pasó con Geely y con JAC.

### De Gabriel Madfes (Multiaviso)

- [ ] **Whitelist para `bielcar.com.uy` antes del corte de dominio.** Sin esto el
      catálogo deja de renderizar el día que se muda.
- [ ] **reCAPTCHA no habilitado en el dominio.** El form "Contactar ahora" del detalle
      tira `Invalid domain` y probablemente no envía. Es el único canal de leads del
      catálogo.
- [ ] **El plugin inyecta `<meta name="viewport" … user-scalable=no>`** en runtime, y
      desactiva el pinch zoom en las páginas de catálogo. Es accesibilidad y no se
      resuelve desde CSS. (Ya no afecta al resto del sitio: `Base.astro` declara su
      propio viewport sin esa directiva, y el HTML servido sale limpio.)
- [ ] **¿Se puede restilar o mover `#PoweredBy` al pie?**
- [ ] **Canonical duplicado — verificar antes de tocar.** El plugin inyecta el suyo en
      runtime y nosotros emitimos el nuestro en `Base.astro`; con más de uno Google
      ignora la directiva. En el DOM en vivo de la **vista de listado** hay **uno solo**,
      así que puede no estar ocurriendo. **Falta mirar el `<head>` de una URL con
      `?ma_carid=`**, que es la vista donde el plugin reescribe metadatos. Sacar el
      nuestro a ciegas dejaría sin canonical a `/nuevos`, `/usados` y `/vehiculos`.

### Nuestros

- [ ] **Los 301 de las URLs viejas.** No existe un inventario de la estructura de URLs
      de `bielcar.com.uy`, y sin esa lista un redirect es una adivinanza. **Hace falta
      un crawl del sitio actual o su sitemap.** Además `vercel.json` es ruta restringida
      (trabajo de `release-ci`) y el dominio todavía no se cortó, así que hoy no
      redirigirían nada.
- [ ] **El carrusel del Home corre en `listingType: 'ALL'` con el título diciendo
      "Destacados".** Provisorio y a pedido, pero el bloque promete selección sobre
      stock cualquiera. **Antes de mostrárselo al cliente hay que cerrarlo:** marcar
      destacados en el panel y volver a `'FEATURED'`, o cambiar el título. Las dos cosas
      van juntas — si vuelve a `'ALL'` de forma permanente, el `<Placeholder>` vuelve
      con él.
      ⚠️ Un fallback automático (`FEATURED` → reintentar con `ALL`) **no es posible: el
      plugin no tolera un segundo `initialize()` sobre el mismo contenedor.**
- [ ] **Acento cálido** (§2.1 de `DESIGN.md`). Sin él el precio compite con el resto
      del texto. Se resuelve mirando el Home con el carrusel cargado, o sea en
      producción.

### Conflicto abierto

El texto de "Servicio oficial" que mandó Sebastián nombra *"Mitsubishi, Geely, JAC y
GWM"* — con GWM y sin Lynk & Co, al revés de la lista que confirmó por separado.
Parece heredado del sitio viejo. **El sitio usa la lista confirmada** e interpola
`SERVICE_BRANDS` en ese texto. Si el que está bien es el texto, se corrige
`SERVICE_BRANDS` y cambia en todos lados de una.
