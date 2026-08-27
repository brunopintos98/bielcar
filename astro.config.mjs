import { defineConfig } from 'astro/config';

// Sin integraciones, sin adapter, sin ClientRouter.
//
// - `output: 'static'` — Vercel sirve dist/ directamente. Un adapter no aporta
//   nada acá y suma superficie.
// - `build.format: 'file'` — genera dist/usados.html en vez de dist/usados/index.html.
//   Esto hace que las URLs viejas del staging (/usados.html?ma_carid=...) sigan
//   resolviendo, que importa porque los vehículos se comparten por link (DESIGN §6.4).
// - `trailingSlash: 'never'` — el plugin arma los links de detalle sobre la URL
//   actual con ?ma_carid=. Un redirect de más entre /usados/ y /usados es una
//   oportunidad de perder el querystring.
// - NO se habilita ViewTransitions / ClientRouter: el routing client-side re-monta
//   el DOM y el plugin de Multiaviso no se reinicializa.
export default defineConfig({
  site: 'https://bielcar.vercel.app',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  devToolbar: {
    enabled: false,
  },
});
