# redirects-sitio-viejo

## Session 1 — 2026-11-24

- **Problema:** links del sitio viejo (`/vehiculo/nuevo?ma_carid=...`) daban 404 en el sitio nuevo.
- **Cambio:** `redirects` permanentes en `vercel.json` para las rutas viejas confirmadas en web.archive.org (CDX): `/vehiculo/nuevo`, `/vehiculo/usado`, `/vehiculo/lista-usados`, `/usados.php`, `/0km.html`, `/site/contacto`, `/contacto.html`, `/site/taller`, `/taller.html`, `/quienessomos.html`, `/site/index`, `/index.php`. Vercel conserva el query string, así que `ma_carid` llega a `/nuevos` o `/usados`.
- **Alternativa descartada:** comodín `/vehiculo/:path*`. Nuevo y usado van a páginas distintas, y `/vehiculo/get-imagen` no debería ir a un listado.
- **Temporal:** el origen de los links viejos parece ser la config de Multiaviso. Bruno va a pedirles que actualicen las URLs.
