# Bielcar Automóviles — Portfolio research

## 1. Portfolio entry (exact format)

```ts
{
  title: "Bielcar Automóviles",
  type: "web",
  year: "2026",   // first commit 2026-08-27 → last commit 2026-09-20 (see open questions)
  link: "bielcar.vercel.app",
  linkHref: "https://bielcar.vercel.app",
  color: "#007F9E",
  secondaryColor: "#005E75",
  text1: "Bielcar Automóviles is a car dealership and official service workshop in Montevideo, Uruguay. It sells new cars from seven brands and used cars of any brand, and is the official service center for four of them. The new site lets visitors browse new, used and full inventory with filters and per-vehicle detail views, explore the brands, and book service or send an enquiry straight to WhatsApp through forms that pick the right line (sales or workshop).",
  text2: "Ventura rebuilt bielcar.com.uy from scratch as a static Astro 7 site in TypeScript, with plain CSS built on a custom design-token system and no UI framework or backend. The live inventory comes from Multiaviso, a third-party jQuery plugin. Ventura themed it to the brand's dark design purely through specificity-scoped CSS overrides and added a mobile filter sheet on top. Forms serialize into prefilled WhatsApp messages, and the site ships with schema.org AutomotiveBusiness JSON-LD, Open Graph cards, a generated sitemap and scroll-reveal motion.",
  tech: ["Astro 7", "TypeScript", "CSS Custom Properties", "Multiaviso", "WhatsApp deep links", "Schema.org JSON-LD", "Google Maps Embed", "Vercel"]
}
```

## 2. Product context

### Problem and users

Bielcar needed to replace its old site (`bielcar.com.uy`) with a modern catalog-first site (`README.md`, `CLAUDE.md`). The end users are car buyers looking at new or used vehicles and owners booking service. There are no user roles or logins: it's a public marketing and catalog site. Stock is managed by the dealership in the Multiaviso panel (`src/data/site.ts`).

### Client, industry, country

- Client: Bielcar Automóviles
- Industry: automotive retail plus service and bodywork
- Country: Montevideo, Uruguay
- Address: La Paz 2028
- Phone numbers use +598
- Source: `src/data/site.ts`

### Features by module

- **Catalog** (`/nuevos`, `/usados`, `/vehiculos`)
  - Inventory rendered by the Multiaviso plugin: listing, filters, pagination.
  - Vehicle detail shown in place via `?ma_carid=`. Detail URLs can be shared, and there's a share button (ShareThis, themed in `src/styles/multiaviso.css`).
  - Dark theme throughout.
  - Custom bottom-sheet filter modal on mobile.
  - Brand-filtered views (`?ma_brand=`) swap the hero title and banner to that brand, checked against a whitelist (`src/components/CatalogBrandSync.astro`).
  - Branded loading spinner.
- **Home** (`src/pages/index.astro`): hero with a photo of the showroom, scrolling strip of brand logos (each logo links to the filtered catalog), three access tiles (0km / Used / All), featured-vehicle carousel, services grid, service CTA.
- **Service** (`/service`)
  - Official-service brands strip (Geely, Lynk & Co, JAC, Mitsubishi). Each logo opens `/contacto` with the form already filled in.
  - What a service includes.
  - Booking form that sends to the workshop's WhatsApp.
- **Contact** (`/contacto`)
  - WhatsApp form whose "reason" select sends the message to sales or the workshop.
  - Separate phone lines for sales and service.
  - Dark-themed Google Maps embed.
- **About** (`/nosotros`): institutional text and photos of the dealership.
- **Global** (`src/layouts/Base.astro`, `src/pages/sitemap.xml.ts`, `public/robots.txt`)
  - Sticky header with a mobile drawer, footer with map, floating WhatsApp button.
  - Trade-in ("Permuta") band on catalog pages.
  - JSON-LD, Open Graph and Twitter cards, sitemap, robots.txt.

### Main routes (for screenshots)

- `/`
- `/nuevos`
- `/usados`
- `/vehiculos`
- `/vehiculos?ma_brand=geely`
- A vehicle detail page (`/usados?ma_carid=…`)
- `/service`
- `/contacto`
- `/nosotros`

The catalog only renders on `bielcar.vercel.app`, so screenshots have to be taken there, not on localhost.

### Status

- Live on `bielcar.vercel.app`. The README marks the catalog as "verified in production".
- The cutover to `bielcar.com.uy` is still pending:
  - Multiaviso hasn't whitelisted that domain yet.
  - The 301 redirects from old URLs aren't done.
  - The "Featured" carousel is provisional.
- It's a website, so there are no app stores or bundle IDs: NOT APPLICABLE.

## 3. Full tech stack

- **Frontend**
  - Astro `^7.2.7` with `output: 'static'`, `build.format: 'file'`, no integrations and no adapter (`package.json`, `astro.config.mjs`).
  - TypeScript `^6.0.3`, `@astrojs/check`.
  - Plain CSS with custom properties (`src/styles/tokens.css`, `base.css`, `multiaviso.css`). No Tailwind and no UI framework.
  - Small inline scripts only: IntersectionObserver for reveal-on-scroll, MutationObserver for the mobile filters.
  - Full page loads on every navigation. ClientRouter is disabled on purpose.
- **Backend / API / DB / auth**
  - None. Forms build `wa.me` links instead of POSTing.
  - Inventory data comes from Multiaviso's hosted service (`automotora.multiaviso.com/plugin.js?v=2.1`, together with jQuery 1.8.1 from the Google CDN). Source: `src/data/site.ts`.
- **Integrations**
  - Multiaviso: inventory plugin.
  - WhatsApp: `wa.me` links on two lines.
  - Google Maps: iframe embed.
  - Google Fonts.
  - ShareThis: comes in through the plugin.
  - reCAPTCHA: comes in through the plugin's contact form. It's currently failing on the domain (`README.md`).
  - Social profiles: Instagram, Facebook, Mercado Libre.
  - Analytics or crash reporting: NOT FOUND.
- **Infrastructure**
  - Vercel static hosting (`vercel.json`: `cleanUrls`, `framework: astro`).
  - Deployed manually with `npm run deploy` (`vercel --prod`).
  - CI workflows: NOT FOUND.
- **Quality**
  - `astro check` (typecheck).
  - Tests and linters: NOT FOUND.

## 4. Notable technical highlights

1. **Theming a third-party plugin without touching its DOM.** Every override is the plugin's own selector prefixed with `.catalog #MultiavisoWrapper`, which wins by exactly one point of specificity, without `!important`, against a stylesheet that's injected at runtime. That's what made the dark catalog possible (`src/styles/multiaviso.css`, `src/components/MultiavisoCatalog.astro`).
2. **Mobile filter sheet laid over the plugin's accordion.** The plugin's filters were turned into a bottom-sheet modal. Ventura only inserts its own nodes, keeps the insertion idempotent, and guards it against MutationObserver loops (`CLAUDE.md`, `src/components/MultiavisoCatalog.astro`).
3. **A single source of truth for the site's data.** All client data, routes, brands and contact lines live in `src/data/site.ts`. The nav and the sitemap read the same `ROUTES` list, and a `<Placeholder>` mechanism keeps unconfirmed data out of production.
4. **WhatsApp as the conversion channel.** Forms serialize into prefilled messages and go to the sales or workshop line depending on the reason. Brand pre-fills are checked against a whitelist so nobody can craft a link that pre-fills a misleading message (`README.md`, `src/data/site.ts`).
5. **SEO for a static site whose catalog renders on the client.** It ships AutomotiveBusiness JSON-LD (split opening hours, brands, `sameAs` profiles), OG and Twitter cards, a generated sitemap, and `robots.txt` that leaves `?ma_carid=` URLs indexable.
6. **Performance and accessibility.** Images are optimized at build time with `astro:assets`. Fonts load without blocking render. Reveal-on-scroll still shows all content if JS fails. There's a skip link, and the viewport fix restores pinch-zoom on pages that don't load the plugin.

## 5. Team / history

- **First commit:** 2026-08-27. It's a 111-file import of about 22k lines, so earlier work isn't in git.
- **Last commit:** 2026-09-20.
- **Commits:** 18 in total, from 2 contributors in git: `brunopintos98` (12) and `dinpa` / juanpadin7 (6).
- **Milestones:**
  - 2026-08-27: initial import.
  - 2026-09-02: mobile navbar and filter animations by `dinpa`.
  - 2026-09-02: image radius, branded catalog loader, reveal-on-scroll, vector favicon set.
  - 2026-09-20: mobile filter sheet reworked and share button.
  - 2026-09-20: banner added to `/nosotros`.
- **Remote:** `github.com/brunopintos98/bielcar`.

## 6. Brand assets found

- **Logo:** `public/img/logo.png` and `public/img/logo-on-dark.png` (254×72 PNG with alpha, derived from `public/img/logo-original.jpg`).
- **Favicon / app icon:** `public/favicon.svg`, `public/favicon.png` (512), `public/apple-touch-icon.png`.
- **OG image:** `public/img/og.png` (1200×630).
- **Splash:** none (it's a website).
- **Brand images:**
  - Showroom photos: `src/assets/local/salon-{1,2}.jpg` (interior) and `fachada.jpg` (facade)
  - Home tiles: `src/assets/home/*.webp`
  - Brand banners: `src/assets/banners/*`
  - Car brand logos: `public/img/marcas/*.png`
  - The `/service` and `/contacto` heroes are stock photos (`src/assets/service/hero2.png` carries an Unsplash+ watermark according to `src/data/site.ts`).

### Palette (`src/styles/tokens.css`)

| Token | Hex |
|---|---|
| `--brand` | `#007F9E` |
| `--brand-deep` | `#005E75` |
| `--brand-bright` | `#1F9CBF` |
| `--brand-wash` | `#E8F3F7` |
| `--whatsapp` | `#128C3E` |
| `--whatsapp-hover` | `#0E7433` |
| `--surface-dark` | `#0D0D0D` |
| `--surface-dark-raised` | `#171717` |
| `--surface-light` | `#F2F2F2` |
| `--text-on-dark` | `#FFFFFF` |
| `--text-on-dark-muted` | `#B0B0B0` |
| `--text-on-dark-faint` | `#6E6E6E` |
| `--text-on-light` | `#141414` |
| `--text-on-light-muted` | `#4A4A4A` |

### Fonts

- **Space Grotesk** 400/500: display and prices.
- **Inter** 400/500/600: body text.
- Both are loaded from Google Fonts (`src/layouts/Base.astro`).

## 7. Open questions

1. **Public URL:** Should the portfolio point to `bielcar.vercel.app` or to `bielcar.com.uy`? The cutover is still pending.
2. **Year:** Should it say "2026" or "2026 — Present"? The last commit was 2026-09-20, and the launch and maintenance status can't be told from the repo.
3. **Ventura's role:** Was it a full design and build? The DESIGN.md is based on reference sites. Is `dinpa` part of Ventura?
4. **Work before git:** When did work actually start? The first commit is already a complete import.
5. **Naming the client:** Can the client be named and its photos and logos used publicly?
6. **Stock photo:** The `/service` hero still carries an Unsplash+ watermark according to the code. Has the licensed export replaced it? Don't screenshot it until then.
7. **Analytics, CI, tests:** None found. Confirm whether they exist outside the repo.
