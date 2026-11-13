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
