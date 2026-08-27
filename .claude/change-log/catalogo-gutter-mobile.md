# catalogo-gutter-mobile

El listado de vehículos en mobile pasa de ~31px de espacio lateral a 8px, para
que la card —y sobre todo su foto— use el ancho de la pantalla.

## Session 1 — 2026-08-27

### Pedido

Textual: «en la parte del catalogo de /nuevos /usados y /vehiculos podemos
achicar el espacio de la izquierda y derecha? quiero que las cards sean mas
grandes o sea esten mas pegadas al borde del telefono». Con captura de mobile.

Decisión del usuario en el STOP: **8px por lado**, sobre la alternativa de 0
(full-bleed, cards tocando el vidrio).

### El hallazgo

El espacio lateral no lo daba una regla sino **tres sumadas**, y esa es la
razón por la que un intento intuitivo (bajar `--gutter`) se habría leído como
que no pasó nada:

| Capa | Mobile | Dueño |
|---|---|---|
| `.catalog__inner` `padding-inline` | 16px (`--gutter`) | nuestro |
| `#MultiavisoWrapper` `padding` | 5px | plugin |
| `#ListWrapper` `padding` | 5px 10px | plugin |

~31px por lado sobre un viewport de ~390px: 16% del ancho.

### Cambio

Un solo archivo: `src/styles/multiaviso.css`, un bloque nuevo
`@media (max-width: 699px)` inmediatamente después de `.catalog__inner`.

1. `.catalog[data-view='list'] .catalog__inner { padding-inline: var(--space-2) }`
2. `padding-inline: 0` en los cinco contenedores del plugin
   (`#MultiavisoWrapper`, `#ListContainer`, `#ListWrapper`, `#ItemContainer`,
   `#ItemWrapper`), prefijados con `.catalog[data-view='list']`. Sin
   `!important`: gana por especificidad, regla 1 de la cabecera del archivo.

`padding-block` intacto — ese ritmo separa la grilla de la barra de filtros y
del borde inferior, y estaba bien.

### Por qué NO se tocó el token `--gutter`

Lo consumen `.container` y `.container-wide` en `base.css`: header, footer,
heroes, todas las páginas. `DESIGN.md` lo fija en 24px / 16px mobile. La
desviación es deliberada y local al listado; el sistema no cambia.

### Por qué `[data-view='list']` y no `.catalog`

El carrusel de destacados del Home comparte `.catalog__inner`. Ahí el gutter
tiene que seguir siendo el del sitio: es una banda entre bandas, no el
contenido de la página.

### Los cinco contenedores, no tres

`/usados` y la ficha de un vehículo son la misma URL (§6.4). Neutralizar solo
los del listado habría dejado el detalle con otro margen, y pasar de una vista
a la otra se vería como un salto.

### Consecuencias asumidas (declaradas antes de escribir, no descubiertas después)

- **El `<PageHero>` no se movió.** Sigue en `.container` (16px), así que su
  texto y el borde de las cards desalinean por 8px. El hero es tipografía y
  necesita el margen; la grilla no.
- **La hoja de filtros de §7 mantiene los 16px del sitio.** Son labels y
  controles, no imágenes.
- **`--ma-reserve: 1250px` sin tocar.** Las cards más anchas dan una foto 16:10
  más alta, pero en mobile 12 cards en una columna ya excedían los 1250px antes
  de este cambio: esa reserva está dimensionada para 2 columnas. No es una
  regresión introducida acá. Si el salto de carga en mobile molesta, es tarea
  aparte.

### Un paso del plan que se cayó, y por qué

El plan aprobado incluía subir la card de `98%` a `100%` con `margin-inline: 0`
en el tramo 401–600px. **No se hizo.** La tabla de §6 documenta —leído de la
hoja del plugin, no inferido— que en mobile el plugin fija esos márgenes con
`!important`, y la estrategia del archivo es acompañar sus márgenes en vez de
pelearlos. Son ~4px por lado; el costo de romper esa estrategia por 4px no lo
paga. Los teléfonos de ≤400px CSS no están afectados: ahí el margen del plugin
ya es 0 y el gutter efectivo son los 8px exactos.

### Verificación

- `npm run build` limpio (7 páginas).
- Reglas confirmadas en el CSS emitido
  (`dist/_astro/MultiavisoCatalog.*.css`) — no las dropeó el minificador.
- **Pendiente: `npm run deploy`.** El catálogo no renderiza en localhost ni en
  preview (whitelist de Multiaviso por dominio), así que el resultado en un
  teléfono real solo se ve en `bielcar.vercel.app`.

### Lo que falsaría el enfoque

Que después del deploy siga sobrando espacio. Significaría que el padding del
plugin viene con `!important`, o que hay un contenedor más en la cadena — el
candidato es el `<td>` de la tabla con la que maqueta. En ese caso se vuelve
por `policy` y el dueño es `debug-triage`.
