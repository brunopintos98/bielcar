import type { APIRoute } from 'astro';
import { site, ROUTES } from '../data/site';

/**
 * Sitemap escrito a mano.
 *
 * ─── Por qué no `@astrojs/sitemap` ─────────────────────────────────────────
 * La integración obliga a tocar `package.json` y `astro.config.mjs`, que son
 * los dos rutas restringidas del proyecto, y a sumar una dependencia — todo
 * para generar un archivo de siete URLs que no va a cambiar de forma. Un
 * endpoint `.ts` no toca ninguna de las dos y cumple `typescript_first`
 * nativamente (`.ts` para endpoints, ver el `typescript_first_note` de
 * agent-config.yaml).
 *
 * ─── Las URLs van limpias ──────────────────────────────────────────────────
 * `build.format: 'file'` genera `usados.html`, pero Vercel sirve `/usados`
 * (`cleanUrls: true` en vercel.json). El sitemap tiene que declarar la forma
 * que se sirve, no la que se genera, o cada URL sería un redirect. Los `path`
 * de ROUTES ya están en forma canónica.
 *
 * ─── No hay URLs de vehículo ───────────────────────────────────────────────
 * El detalle lo renderiza el plugin in-place con `?ma_carid=` sobre la misma
 * URL del listado, así que no son páginas nuestras y su inventario cambia con
 * el stock. Listarlas requeriría leer el feed de Multiaviso en build time, que
 * es otro proyecto. Los vehículos igual son indexables: son URLs reales y
 * compartibles (DESIGN §6.4), solo que se descubren por los links del listado
 * y no por acá.
 *
 * `prerender = true` es explícito aunque el proyecto sea `output: 'static'`:
 * si algún día se agrega un adapter, este endpoint tiene que seguir siendo un
 * archivo y no una función.
 */
export const prerender = true;

export const GET: APIRoute = () => {
  /* Fecha del build. Un `lastmod` por ruta necesitaría fecha de modificación
     real por archivo, que no tenemos, y poner la misma fecha en todas es
     igual de informativo y no finge una precisión que no hay. */
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = ROUTES.map((route) => {
    const loc = new URL(route.path, site.url).href;
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <priority>${route.priority.toFixed(1)}</priority>`,
      '  </url>',
    ].join('\n');
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
