# Bielcar — project router

Sitio de Bielcar Automóviles, automotora en Montevideo. Rebuild completo de `bielcar.com.uy`.

**Astro con output estático**, CSS plano con custom properties, sin frameworks de UI, sin backend. Deploy en Vercel (`bielcar.vercel.app`). El catálogo de vehículos lo renderiza un plugin jQuery de terceros: **Multiaviso**.

```sh
npm run dev       # localhost:4321 — el catálogo NO se ve acá, ver abajo
npm run build
npm run check     # astro check
npm run deploy    # vercel --prod — único entorno donde anda el catálogo
```

**El contrato de implementación es [`documentation/DESIGN.md`](documentation/DESIGN.md)** — paleta, tipografía, escala, componentes, composición por página, y toda la integración con Multiaviso. Está registrado como `requirements.path` en `agent-config.yaml`, así que los especialistas lo consultan antes de proponer trabajo de UI. No es un documento de estética: si una tarea contradice el documento, decilo en vez de elegir por tu cuenta.

Estado de construcción, pendientes del cliente y limitaciones de entorno: [`README.md`](README.md).

---

## Session routing contract — read this first

**Every session must hop through the `policy` subagent before any Edit / Write / Bash.**

`policy` is the triage router. It reads `.claude/agent-config.yaml`, classifies the request, names the affected files, flags restricted-path hits, and returns a `RECOMMENDED NEXT AGENT`. The main thread then delegates to that specialist.

This is enforced, not advisory: `.claude/hooks/policy-gate.sh` (a `PreToolUse` hook) blocks Edit/Write/MultiEdit/Bash until the marker `.claude/.policy-ran` exists, which a `SubagentStop` hook creates when `policy` finishes. If you're blocked, delegate to `policy` — don't work around the gate.

The lifecycle slash commands (`/calibrate`, `/recalibrate`, `/map`, `/start-task`) pre-create the marker and run without the hop.

---

## The specialist loop

Every writer agent follows the same shape:

**READ → PLAN → STOP (wait for "proceed") → IMPLEMENT → VERIFY**

- The **PLAN** names every file it will touch, plus three reasoning fields: the strongest alternative considered, the load-bearing assumption, and the observation that would falsify the approach. A plan missing those isn't ready.
- The **STOP** is real. Nothing is written before you say "proceed".
- Each writing session appends to a decision ledger at `.claude/change-log/<task>.md` — append-only, one `## Session N` block per session.
- Work that crosses specialists persists its type contracts under `.claude/handoffs/`.

---

## Slash commands

| Command | What it does |
|---------|--------------|
| `/calibrate` | Scan the repo and rewrite `.claude/agent-config.yaml` to match reality. Run once per project. |
| `/recalibrate` | Update the config after a structural change (new folder, new toolchain, new library). |
| `/map` | Architecture report. No args = whole project, persisted to `.claude/map/LAST.md`. With an area (`/map nav`) = focused read-only trace. |
| `/start-task <name>` | Check the tree is clean, check out (or create) the branch, name the ledger. |

---

## Agents

| # | Agent | When |
|---|-------|------|
| 00 | `policy` | Always first. Triage + routing. |
| 15 | `debug-triage` | Something is broken: bug, crash, error, regression. |
| 17 | `coherence` | After a multi-specialist feature — verifies the wiring actually lines up. |
| 20 | `test` | Tests only. Never touches source. |
| 30–33 | `ts-feature`, `state`, `navigation`, `api-networking` | React Native stacks. Not used by this project today. |
| 40–41 | `ios-native`, `android-native` | Native mobile. Not used by this project today. |
| 50 | `release-ci` | CI workflows, deploy config, version bumps. HIGH-RISK. |
| 55 | `dependencies` | `package.json` bumps, audit, CVE patching. HIGH-RISK. |
| 60 | `security` | Read-only audit: secrets, auth, PII, dependency CVEs. |
| 70–73 | `web-feature`, `web-state`, `web-routing`, `web-api` | React web stacks. `web-feature` es el que hace el trabajo de UI acá. |
| 80–81 | `node-api`, `node-data` | Node backend. Not used by this project today. |

Los agentes de RN / nativo / Node se conservan a propósito — no cuestan nada mientras están ociosos y están ahí si este proyecto (o el próximo al que se copie este `.claude/`) crece.

Nota: los agentes `web-*` conocen Next, Vite+React Router y Remix, pero **no conocen Astro**. Sus secciones de framework no aplican tal cual; el contrato real de este proyecto es `DESIGN.md` más las reglas de acá abajo.

---

## Reglas del proyecto

Cada una tiene una falla concreta detrás. No son preferencias.

**No inventar datos.** Falta información que solo puede dar el cliente (número de WhatsApp, mails, marcas de service, fotos, redes). Donde falte, va un `<Placeholder what="..." />` — un bloque amarillo imposible de pasar por alto — y se lista al final de la respuesta. Nada de textos institucionales, marcas, testimonios ni nombres de vendedores plausibles pero falsos. `src/data/site.ts` es la fuente única: los datos que faltan están en `null` y `waLink()` devuelve `null` en vez de un href roto.

**TypeScript sí, pero `.astro` es el formato de los componentes.** `typescript_first: true` acá significa "código tipado, nada de `.js` nuevo" — NO "todo archivo termina en `.ts`". `.astro` para páginas, layouts y componentes; `.ts` para utilidades, módulos de datos y endpoints. Ver `typescript_first_note` en `agent-config.yaml`.

**Nada de Tailwind.** Su preflight resetea elementos globalmente y el CSS del plugin espera comportamiento default del browser; además el plugin usa `class="hidden"` en sus filtros, que colisiona exacto con la utilidad `.hidden`.

**Nuestro reset tampoco puede comportarse como un preflight.** `src/styles/base.css` abre con la lista de lo que no se toca: nunca resetear `table` / `tr` / `td`, nunca reglas globales sueltas de `a` o `img`. El plugin maqueta con tablas. `box-sizing: border-box` es global pero `multiaviso.css` lo devuelve a `content-box` dentro de `#MultiavisoWrapper`.

**Nada de ClientRouter / view transitions.** El routing client-side re-monta el DOM y el plugin no se reinicializa. Page loads completos siempre.

**Los scripts del plugin van con `is:inline`**, en `<head>`, en este orden: `plugin.js` → jQuery → `jQuery(document).ready()` con el `initialize` adentro. Es contraintuitivo y está verificado contra el staging. Sin `is:inline`, Astro los bundlea y rompe el orden de carga y el scope global. Todo eso vive en `src/components/MultiavisoScripts.astro`.

**Los overrides del plugin van prefijados con `#MultiavisoWrapper`.** Nunca un selector suelto como `.item-title`: son clases genéricas y chocan con el resto del sitio. Ganar por especificidad de ID, no por `!important`. No usar el nombre de variable `--screen-height`: el plugin ya lo define.

**No manipular con JavaScript el markup del plugin.** Si algo hay que ajustar, es CSS.

**No hay páginas de detalle de vehículo.** El plugin lo renderiza in-place sobre la misma URL con `?ma_carid=`. `/usados` y el detalle de un auto son el mismo archivo.

**El catálogo no renderiza en localhost ni en preview deploys.** El whitelist de Multiaviso es por dominio y solo `bielcar.vercel.app` está habilitado. Un contenedor vacío en dev y un `404` en `plugin/v3/list` son ESPERADOS. No lo debuguees, no busques workarounds. Se verifica con `npm run deploy`.

**El contenido va en español** (`<html lang="es">`).

**`.vercel/` es estado de deploy — nunca editarlo.**

Full harness docs: [.claude/SETUP.md](.claude/SETUP.md) · [.claude/CALIBRATION.md](.claude/CALIBRATION.md) · [.claude/MAINTENANCE.md](.claude/MAINTENANCE.md)
