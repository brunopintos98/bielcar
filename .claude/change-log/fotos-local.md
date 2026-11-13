# fotos-local

## Session 1 (2026-11-13)

- 4 HEIC del interior (5712x4284) convertidos con `sips` a JPEG q92, 2560px de lado largo, en `src/assets/local/`: `salon-1` (IMG_0918), `salon-2` (IMG_0917), `exhibidor-1` (IMG_0387), `exhibidor-2` (IMG_0388, vertical). Rotación EXIF aplicada a los píxeles con sharp (IMG_0388 venía con orientation 6).
- `PHOTOS.homeHero` → `salon-1`, `PHOTOS.aboutHero` → `salon-2`. `aboutLocal` se queda con la fachada `bielcar-3` por decisión del usuario: es la única foto del frente que queda en el sitio.
- `exhibidor-1/2` convertidas pero sin usar (pedido del usuario: convertir todas). `bielcar-1/2.webp` quedan sin referencias.
- HEIC borrados del root.
- Alternativa considerada: exhibidor Geely en el split de /nosotros. Descartada por el usuario.
- Supuesto: el recorte del hero es centrado (`object-position: center`). Lo falsificaría un hero que no deje ver los letreros en mobile.
- Verificado: `npm run check` 0 errores, `npm run build` ok, recorte 2.3:1 simulado.

## Session 2 (2026-11-13)

- El usuario cambió de idea: `PHOTOS.aboutLocal` pasa de la fachada `bielcar-3` a `exhibidor-1`. El sitio ya no muestra ninguna foto del frente. `bielcar-1/2/3.webp` quedan sin referencias.

## Session 3 (2026-11-13)

- `HomeHero.astro`: `object-position` de `center` a `center 65%`, para mostrar menos techo y más autos de `salon-1` sin perder las vigas. Verificado con recorte 2.3:1 simulado; `npm run check` 0 errores.

## Session 4 (2026-11-13)

- El usuario vuelve a la fachada: `PHOTOS.aboutLocal` = `bielcar-3` otra vez (en vez de `exhibidor-1`). `exhibidor-1/2` y `bielcar-1/2` quedan sin referencias.

## Session 5 (2026-11-13)

- Foto nueva del frente (`Modern Bielcar Dealership Showroom.png`, 1086x1448, vertical) convertida a `src/assets/local/fachada.jpg` (JPEG q92, tamaño nativo, sin upscale). `PHOTOS.aboutLocal` = `fachada`; `bielcar-3` queda sin referencias.
- Recorte 4:3 centrado simulado: entran los cuatro carteles y la vidriera. Sin cambios de CSS.
- Alternativa considerada: split vertical 3:4 en desktop. Descartada, rompe el layout de la sección.

## Session 6 (2026-11-13)

- `nosotros.astro`: `.sobre__media` pasa de `aspect-ratio: 4 / 3` a `4 / 5` para recortar menos la fachada vertical. Desvío de DESIGN.md (el split era 4:3), pedido explícito del usuario.

## Session 7 (2026-11-13)

- `.sobre__media` a `aspect-ratio: 3 / 4` (igual que la foto, sin recorte) y `margin-top: var(--space-16)` solo en desktop (>=900px) para bajarla respecto del texto. Pedido del usuario.
