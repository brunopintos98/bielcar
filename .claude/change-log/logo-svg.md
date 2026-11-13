# logo-svg

El logo pasa de PNG petróleo a SVG azul, con el centro del engranaje transparente.

## Session 1 — 2026-11-13

### Pedido

Cambiar los celestes por un azul parecido a `#35468c`, que la banda intermedia
del engranaje sea transparente (referencia visual de Bruno) y hacerlo en SVG,
con una variante para fondo claro y otra para fondo oscuro.

Decisiones del usuario en el STOP:

- **Solo el logo.** El resto del sitio sigue en petróleo (`--brand*`). Se
  acepta la divergencia y queda anotada en DESIGN.md §2.1.
- **Un solo azul** para el disco y el engranaje. "AUTOMÓVILES" va del mismo color
  que "BIELCAR" (negro / blanco), por pedido posterior de Bruno.
- **Fondo oscuro con azul más claro:** `#3764be` (matiz 220°, más azul que el 228° de `#35468c`;
  ~3.2:1 sobre `#171717`). Con `#35468c` daba ~2:1. Un primer intento, `#7283ca`,
  Bruno lo rechazó por demasiado claro y violeta.

### Implementación

- `public/img/logo.svg` y `public/img/logo-on-dark.svg`: viewBox 254x72, igual
  que el PNG, así que `LOGO.width/height` no cambian. El engranaje es la
  geometría de `public/favicon.svg` escalada, en un solo path evenodd. El
  wordmark está hecho con Source Sans 3 (OFL), glifo por glifo, en las
  posiciones medidas sobre `logo-original.jpg`, y convertido a paths.
- `public/img/logo.png` se regeneró desde `logo.svg` a 508x144 y se usa solo
  en el JSON-LD (`LOGO.raster`), porque Google no acepta SVG ahí.
- `src/data/site.ts`: `LOGO` apunta a los SVG y suma `raster`. Comentario
  reescrito.
- `src/layouts/Base.astro`: el JSON-LD usa `LOGO.raster`.
- DESIGN.md §2.1 y README actualizados.

### Alternativa descartada

Calcar el bitmap con potrace o vtracer: a 254px de ancho los bordes salen
deformes. Se eligió reconstruir con una fuente.

### Fuera de alcance / pendiente

- El vector oficial sigue pedido a Sebastián: esto es una reconstrucción.
- `og.png`, `favicon.svg/png`, `apple-touch-icon.png` y el loader del
  catálogo siguen en petróleo.
- `public/img/logo-on-dark.png` quedó sin uso, pero no se borró.
- El generador quedó fuera del repo (scratchpad de la sesión).

### Ajustes posteriores (misma sesión)

- `AUTOMÓVILES` pasa a negro / blanco, igual que `BIELCAR`.
- Buje del engranaje: el aro r1.28 con el punto r0.91 pasa a ser un agujero
  liso de r1.9 (escala 24), totalmente transparente. Ahora el centro difiere
  del favicon y del loader, que siguen con aro y punto.

## Session 2 (2026-11-13), favicon

- `public/favicon.svg`: colores de `#007F9E`/`#1F9CBF` a `#35468c`/`#3764be` (los azules del logo). Geometría sin tocar.
- `favicon.png` (512) y `apple-touch-icon.png` (180, disco de 120 sobre `#0D0D0D`) regenerados desde el SVG con sharp, mismo layout que antes.
- Siguen en petróleo: `og.png`, `theme-color` en Base.astro y el loader del catálogo (multiaviso.css §11).
- Después, a pedido del usuario: `og.png` regenerado desde `logo-on-dark.svg` (500px de ancho, centrado sobre `#0D0D0D`, mismo layout que el anterior); `theme-color` a `#35468c`; loader del catálogo a tokens nuevos `--logo-blue` / `--logo-blue-bright` (agregados en `tokens.css`). `npm run check` 0 errores, build ok.

## Session 3 (2026-11-13), rebrand del acento

- `tokens.css`: `--brand`/`--brand-bright` -> `var(--logo-blue-bright)` (#3764be), `--brand-deep` -> `var(--logo-blue)` (#35468c), `--brand-wash` -> #ECEFF8. Todo el acento del sitio pasa a azul; verde WhatsApp sin cambios.
- Contraste: #3764be como texto sobre oscuro da ~3.2-3.5:1, debajo de AA. Bruno lo eligió a la vista de #5b8ae0 (5.3:1, mismo matiz). Anotado en DESIGN.md §2.2 y en tokens.css.
- DESIGN.md §2 (bloque de tokens, nota de rebrand, tabla de contraste, resumen), PORTFOLIO.md y comentarios que decían petróleo actualizados.
- `npm run check` 0 errores, build ok, sin hex petróleo en `dist/`. No verificado en browser; el catálogo solo se ve en producción.
