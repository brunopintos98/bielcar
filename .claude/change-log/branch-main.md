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
