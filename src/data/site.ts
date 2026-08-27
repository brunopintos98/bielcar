import geelyBanner from '../assets/banners/geely.jpg';
import lynkcoBanner from '../assets/banners/lynkco.png';
import hondaBanner from '../assets/banners/honda.png';
import jacBanner from '../assets/banners/jac.jpg';
import mitsubishiBanner from '../assets/banners/mitsubishi.webp';
import mgBanner from '../assets/banners/mg.jpg';
import volvoBanner from '../assets/banners/volvo.jpg';
import tileNuevosImg from '../assets/home/nuevos.webp';
import tileUsadosImg from '../assets/home/usados.webp';
import tileTodosImg from '../assets/home/todos.webp';
import serviceHeroImg from '../assets/service/hero2.png';
import contactHeroImg from '../assets/contacto/hero.png';
import local1 from '../assets/local/bielcar-1.webp';
import local2 from '../assets/local/bielcar-2.webp';
import local3 from '../assets/local/bielcar-3.webp';

/**
 * Fuente única de verdad de los datos del sitio.
 *
 * Los campos en `null` son datos que todavía no tenemos. NO los completes con
 * algo plausible: el componente <Placeholder> los renderiza como un bloque
 * amarillo imposible de ignorar, y `waLink()` devuelve null en vez de un href
 * roto. Ese es el mecanismo que impide que un dato inventado llegue a producción.
 *
 * Cuando llegue el dato real, se cambia acá y aparece en todo el sitio.
 */

/* --------------------------------------------------------- datos confirmados */

export const site = {
  name: 'Bielcar Automóviles',
  shortName: 'Bielcar',
  url: 'https://bielcar.vercel.app',

  /** Confirmado — figura en el panel de Multiaviso de Sebastián. */
  address: 'La Paz 2028, Montevideo',
  /**
   * Confirmado por Sebastián. Corrige el horario que figuraba en el panel de
   * Multiaviso ("Lunes a Viernes de 9:30 a 19 horas"), que no tenía el corte
   * del mediodía.
   */
  hours: 'Lunes a Viernes de 9 a 13 y de 14 a 19 horas',
} as const;

/**
 * Confirmado por Sebastián: NO abren sábados.
 *
 * No se dice en ninguna parte del sitio, a propósito: "Lunes a Viernes" ya lo
 * implica y recalcarlo con un "no abrimos sábados" pone el foco en lo que la
 * automotora no hace. Queda anotado acá para que el dato no se vuelva a
 * preguntar y para que nadie asuma que falta.
 */
export const OPENS_SATURDAYS = false;

/* --------------------------------------------------------------- contacto -- */

/**
 * Los canales de contacto, partidos en DOS líneas.
 *
 * Confirmado por Sebastián: ventas y taller atienden en números distintos.
 * Antes eran una sola lista de tres fijos más un celular, lo que hacía que
 * /service mostrara los tres teléfonos —incluidos los de ventas— bajo el
 * título "Contacto directo del taller". Era falso: dos de esos tres no son
 * del taller.
 *
 * **La distinción es la razón de ser de esta estructura.** Cada componente
 * tiene que elegir la línea que corresponde a lo que está ofreciendo, igual
 * que con SERVICE_BRANDS / SALES_BRANDS. Un botón que dice "Agendar service"
 * apuntando al WhatsApp de ventas obliga a que alguien reenvíe el mensaje a
 * mano, y en el medio se pierden consultas.
 *
 * El mail NO está acá: es uno solo para todo el negocio (ver SERVICE_EMAIL).
 */
export const CONTACT = {
  sales: {
    label: 'Ventas',
    /** Celular. Es la misma línea que el WhatsApp, por eso no se lista aparte. */
    mobile: '098 010 230',
    mobileHref: 'tel:+59898010230',
    /** En formato internacional sin `+`, como lo pide wa.me. */
    whatsapp: '59898010230',
    phones: [
      { display: '2403 2283', href: 'tel:+59824032283' },
      { display: '2401 8820', href: 'tel:+59824018820' },
    ],
  },
  service: {
    label: 'Service',
    mobile: '098 432 283',
    mobileHref: 'tel:+59898432283',
    whatsapp: '59898432283',
    phones: [{ display: '2403 2282', href: 'tel:+59824032282' }],
  },
} as const;

/** Cuál de las dos líneas. Los componentes lo reciben como prop o lo eligen. */
export type ContactLine = keyof typeof CONTACT;

/**
 * Todos los fijos, en el orden en que se listaban antes de partirlos.
 *
 * Solo para donde hace falta enumerar TODOS los teléfonos de la empresa sin
 * distinguir área: el `telephone` del JSON-LD y las meta descriptions. Para
 * mostrarlos en pantalla usar `CONTACT.sales` o `CONTACT.service`, no esto —
 * si no, se vuelve a perder la distinción que este módulo existe para marcar.
 */
export const ALL_PHONES = [...CONTACT.service.phones, ...CONTACT.sales.phones];

/** Config del plugin de terceros. Confirmada por Gabriel Madfes. */
export const multiaviso = {
  client: 'U2G4A329R575LH',
  containerSelector: '#MultiavisoContainer',
  pluginSrc: 'https://automotora.multiaviso.com/plugin.js?v=2.1',
  jquerySrc: 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js',
} as const;

/**
 * Logo de Bielcar.
 *
 * El archivo que mandó Sebastián es un PNG de 254x72 SIN canal alpha: wordmark
 * negro y engranaje petróleo sobre blanco sólido, o sea inservible tal cual
 * sobre banda oscura. Las dos variantes de acá se derivaron de ese archivo
 * recuperando la cobertura de tinta —`a = (255 - min(r,g,b)) / 255`— en vez de
 * recortar por umbral, así conserva el antialias.
 *
 * `onDark` invierte SOLO los neutros: el engranaje queda con su teal original
 * porque no es un disco plano, tiene el dibujo interno en un teal más claro, y
 * aplanarlo a un color único lo convierte en un círculo liso.
 *
 * Dato lindo: el engranaje mide #007E9F, prácticamente idéntico al `--brand`
 * #007F9E que DESIGN.md §2 dedujo del sitio viejo. La paleta queda confirmada
 * contra el archivo de marca, no solo contra un muestreo de pantalla.
 *
 * Sigue siendo un bitmap de 254px de ancho: a 32px de alto da ~2.2x de densidad,
 * suficiente, pero el vector sigue pedido (README).
 */
export const LOGO = {
  light: '/img/logo.png',
  onDark: '/img/logo-on-dark.png',
  width: 254,
  height: 72,
} as const;

/* ---------------------------------------------------------------- marcas ---- */

/*
 * Son TRES listas distintas y no una. Confirmado por Sebastián.
 *
 * Meterlas en una sola fue el error de la primera pasada: "servicio oficial" y
 * "punto de venta" no son lo mismo, y afirmar que Bielcar hace service oficial
 * de Honda, MG o Volvo sería falso. Cada componente tiene que elegir la lista
 * que corresponde a lo que está diciendo.
 */

/** Marcas de las que Bielcar es SERVICIO OFICIAL. La franja de §5.6 usa esta. */
export const SERVICE_BRANDS = ['Geely', 'Lynk & Co', 'JAC', 'Mitsubishi'] as const;

/**
 * Marcas que Bielcar VENDE (punto de venta). Incluye las 4 de service más
 * Honda, MG y Volvo, que se venden pero NO tienen service oficial acá.
 *
 * **El orden importa**: es el de la franja de marcas, y va de las que más venden
 * a las que menos. Geely, Lynk & Co y Honda son las tres primeras por pedido de
 * Sebastián. No reordenar alfabéticamente.
 */
export const SALES_BRANDS = [
  'Geely',
  'Lynk & Co',
  'Honda',
  'JAC',
  'Mitsubishi',
  'MG',
  'Volvo',
] as const;

/**
 * Link al catálogo filtrado por marca. La franja de marcas es navegación: cada
 * logo entra al listado de esa marca.
 *
 * RESUELTO leyendo el DOM real del listado en producción: el plugin arma sus
 * propios filtros de marca en MINÚSCULAS.
 *
 *     ?ma_brand=geely     ?ma_brand=mitsubishi     ?ma_brand=lynk+%26+co
 *
 * Nosotros generábamos `?ma_brand=Geely`. §6.4 avisa exactamente de esto —
 * "replicar la forma que usa el propio plugin para ese filtro específico, no
 * normalizar"— y era la parte del documento que estaba sin cumplir.
 *
 * ⚠️  No sabemos si el plugin compara con o sin distinguir mayúsculas, así que
 * no sabemos si los links estaban rotos o funcionando por casualidad. Usar su
 * misma forma saca la pregunta del medio.
 */
export function brandFilterHref(brand: string): string {
  return `/vehiculos?ma_brand=${encodeURIComponent(brand.toLowerCase())}`;
}

/**
 * De un valor de `ma_brand` en la URL al nombre para mostrar.
 *
 * Devuelve `null` si no es una marca que vendemos. Es una LISTA BLANCA, no un
 * saneamiento: el string que se muestra sale siempre de `SALES_BRANDS`, nunca
 * de la URL. Si no, alguien podría armar `/vehiculos?ma_brand=<lo que sea>` y
 * mandarlo por ahí con un título falso encima del catálogo de Bielcar.
 *
 * La comparación ignora mayúsculas porque la URL puede venir del plugin
 * (minúsculas) o de un link viejo nuestro (capitalizado).
 */
export function brandFromParam(value: string | null): string | null {
  if (!value) return null;
  const needle = value.trim().toLowerCase();
  return SALES_BRANDS.find((b) => b.toLowerCase() === needle) ?? null;
}

/* --------------------------------------------------------------- servicios -- */

/**
 * Enumera una lista en prosa: "a, b y c".
 *
 * Vive acá y no en un componente porque los textos de `SERVICES` la necesitan
 * para interpolar las marcas, y esos textos son datos, no presentación. El "y"
 * antes del último es cosmético y no vale un helper aparte.
 */
export function list(xs: readonly string[]): string {
  if (xs.length === 0) return '';
  if (xs.length === 1) return xs[0];
  return xs.slice(0, -1).join(', ') + ' y ' + xs.at(-1);
}

/**
 * Los seis servicios. Cuatro son texto de Sebastián, transcrito tal cual salvo
 * dos correcciones ortográficas: "Mecanica" → "Mecánica" y "dale la mejor
 * opción" → "darle".
 *
 * ─── Por qué están acá y no en ServicesBlock.astro ─────────────────────────
 * Los consumen DOS páginas: el bloque de servicios del Home (los seis) y
 * /service (los cuatro de taller). Copiar los párrafos de Sebastián en dos
 * archivos es exactamente la clase de duplicación que produce el conflicto que
 * ya tenemos abierto más abajo — dos versiones del mismo texto que se
 * desincronizan sin que nadie lo note.
 *
 * ─── `scope` no es una categoría de marketing ──────────────────────────────
 * Es qué página puede afirmar cada ítem. `comercial` es lo que se vende y se
 * permuta, y vive en el Home. `taller` es lo que hace el taller, y es lo único
 * que /service puede listar como "qué incluye". Un filtro positivo y no una
 * exclusión de venta/permuta: si mañana entra un servicio nuevo, tiene que
 * decidir a qué página pertenece en vez de aparecer en /service por descarte.
 *
 * ─── El `icon` va con `as const` a propósito ───────────────────────────────
 * Así el literal queda asignable a `IconName` de Icon.astro sin que este módulo
 * de datos tenga que importar un componente. La verificación la hace
 * `npm run check` igual: si alguien escribe un ícono que no existe en el set,
 * el <Icon> no compila.
 *
 * ⚠️  CONFLICTO ABIERTO EN "Servicio oficial". El texto que mandó Sebastián
 * decía "Mitsubishi, Geely, JAC y GWM": con Great Wall y SIN Lynk & Co, al
 * revés de la lista que confirmó por separado. Parece heredado del sitio viejo.
 * Se interpola SERVICE_BRANDS para que el sitio no se contradiga a sí mismo. Si
 * el que está bien es el texto, se corrige SERVICE_BRANDS y cambia en el Home,
 * en /service y en la franja del footer de una sola vez.
 *
 * ─── `line` vs. `blurb` ─────────────────────────────────────────────────────
 * `line` es el párrafo completo de Sebastián (o su equivalente sin marca para
 * permuta) y es el único texto que /service puede renderizar como "qué
 * incluye" — ahí sigue exactamente como llegó, sin recortar.
 *
 * `blurb` es la versión de una sola oración (~100 caracteres, ±10, medidos
 * sobre el string YA interpolado) que consume el grid de servicios del Home
 * (ServicesBlock.astro). Es un SUBCONJUNTO ESTRICTO de las palabras de `line`:
 * nada de marcas nuevas, capacidades, superlativos ni afirmaciones que
 * Sebastián no escribió, solo recorte (y, en un caso, reordenamiento sin
 * agregar palabras) para que entre en una oración. Si un servicio no daba para
 * 100 caracteres sin inventar contenido, `blurb` quedó más corto en vez de
 * rellenarse (ver `permuta`, en 87).
 *
 * `oficial` mantiene la interpolación de SERVICE_BRANDS en su `blurb`, igual
 * que `venta` la mantiene con SALES_BRANDS: ninguna marca va hardcodeada acá,
 * las dos siguen resolviéndose contra las listas confirmadas.
 */
export const SERVICES = [
  {
    id: 'venta',
    scope: 'comercial',
    icon: 'car-front',
    title: 'Venta',
    line: `0km y usados seleccionados. Somos punto de venta de ${list(SALES_BRANDS)}.`,
    blurb: `0km y usados seleccionados. Somos punto de venta de ${list(SALES_BRANDS)}.`,
  },
  {
    id: 'permuta',
    scope: 'comercial',
    icon: 'repeat',
    title: 'Permuta',
    /* Va sin la pregunta con la que Sebastián lo escribió ("¿Querés tu auto
       nuevo hoy?"): el título del ítem ya dice de qué se trata y los otros
       cinco son descripciones, no preguntas. */
    line: 'Entregue el suyo como parte de pago y llévese el que sueña, rápido y sin complicaciones.',
    blurb: 'Entregue el suyo como parte de pago y llévese el que sueña, rápido y sin complicaciones.',
  },
  {
    id: 'oficial',
    scope: 'taller',
    icon: 'shield-check',
    title: 'Servicio oficial',
    line: `Para que su ${list(SERVICE_BRANDS)} sigan siendo originales, contamos con los mejores equipos y técnicos especializados para realizar periódicamente el chequeo y mantenimiento de su vehículo.`,
    blurb: `Equipos y técnicos especializados para que su ${list(SERVICE_BRANDS)} sigan siendo originales.`,
  },
  {
    id: 'mecanica',
    scope: 'taller',
    icon: 'wrench',
    title: 'Mecánica general',
    line: 'Nuestro amplio taller multimarca brinda la posibilidad de atender su automóvil por mantenimiento general o cualquier tipo de desperfecto. Todo nuestro personal está a su disposición para asesorarlo y darle la mejor opción.',
    blurb: 'Nuestro amplio taller multimarca atiende su automóvil por mantenimiento general o cualquier desperfecto.',
  },
  {
    id: 'chapa',
    scope: 'taller',
    icon: 'paint-roller',
    title: 'Chapa y pintura',
    line: 'Ya sea para cuidar la estética de su automóvil o reparar un siniestro, contamos con dos cabinas de pintura de última generación que junto con nuestros especialistas y los mejores productos, logramos trabajos que se destacan por su alta calidad.',
    blurb: 'Para cuidar la estética o reparar un siniestro, contamos con dos cabinas de pintura de última generación.',
  },
  {
    id: 'seguros',
    scope: 'taller',
    icon: 'file-text',
    title: 'Seguros',
    line: 'Tenemos convenios con varias compañías aseguradoras, por lo que a la hora de un siniestro nosotros también nos encargamos de la reparación de su automóvil.',
    blurb: 'Tenemos convenios con compañías aseguradoras y, a la hora de un siniestro, nos encargamos de la reparación.',
  },
] as const;

/* ------------------------------------------------------------ datos que faltan */

/*
 * Los números de WhatsApp viven en CONTACT (arriba), uno por línea. No hay una
 * constante WHATSAPP suelta a propósito: existía cuando había un solo número, y
 * dejarla como alias de `CONTACT.sales.whatsapp` invitaría a usarla desde un
 * componente de service sin notarlo. Si falta un número, el `null` lo devuelve
 * `waLink()`.
 */

/** CONFIRMADO por Sebastián. */
export const SALES_EMAIL: string | null = 'bielcar@bielcar.com.uy';

/**
 * CONFIRMADO: es el MISMO que el de ventas.
 *
 * El pendiente estaba redactado como "mail de service (si es otro)", o sea que
 * la pregunta abierta no era el valor sino si existía una segunda casilla. No
 * existe: Bielcar atiende todo en `bielcar@bielcar.com.uy`.
 *
 * Queda como constante propia en vez de borrarse y usar SALES_EMAIL en todos
 * lados. Dos motivos: los componentes que dicen "escribinos por service"
 * siguen expresando QUÉ mail están mostrando y no a cuál apuntan hoy, y si
 * mañana abren una casilla de taller se cambia acá y nada más. El costo de
 * mantener la distinción es una línea; el de perderla es buscar por todo el
 * sitio cuál de los `SALES_EMAIL` era en realidad el de service.
 *
 * Ojo: /contacto detecta que son iguales y muestra UNA fila en vez de dos con
 * la misma dirección. Si algún día se separan, esa vista vuelve sola a dos.
 */
export const SERVICE_EMAIL: string | null = SALES_EMAIL;

/**
 * Redes y perfiles públicos. CONFIRMADO por Sebastián.
 *
 * ─── Los cuatro son glifos de `Icon.astro` ─────────────────────────────────
 * Se pintan con `currentColor`, así que heredan el color de la fila y no
 * necesitan ningún filtro.
 *
 * Mercado Libre llegó a estar como <img> del logo a color, y después con
 * `grayscale(1)`. Las dos etapas quedaron obsoletas cuando apareció el
 * line-art oficial: siendo trazo, se colorea como cualquier otro ícono.
 *
 * Queda anotado por si vuelve a aparecer un logo de marca en PNG: el filtro
 * `brightness(0) invert(1)` que usan las franjas de marcas NO sirve para un
 * logo con relleno opaco —aplasta todo a blanco conservando el alfa, y de un
 * óvalo lleno deja un óvalo blanco liso—. Para eso sirve `grayscale`, que
 * mapea a luminancia y conserva el dibujo. Pero lo mejor es conseguir el
 * line-art y no filtrar nada.
 *
 * ─── `profile` separa perfil de canal de contacto ──────────────────────────
 * Solo los perfiles van al `sameAs` del JSON-LD: `sameAs` describe "la misma
 * entidad en otro lado de la web". Un `wa.me` no es un perfil, es una forma de
 * escribirle — meterlo ahí le dice a Google algo que no es cierto.
 */
export const SOCIAL: {
  label: string;
  href: string;
  /** Glifo de Icon.astro. */
  icon: 'instagram' | 'facebook' | 'whatsapp' | 'mercadolibre';
  /**
   * Alto en px. Por defecto 24, como pide §5.8.
   *
   * Existe por Mercado Libre y por un motivo geométrico, no de gusto: su marca
   * es un óvalo BAJO. En una caja de 24 ocupa 19.5 de ancho pero solo 13 de
   * alto, mientras Instagram ocupa 20x20 — así que a 24px se ve chico al lado
   * del resto aunque la caja sea la misma. A 32px queda en 26x17.3, que es
   * donde la fila se empareja ópticamente.
   */
  size?: number;
  /** true = perfil público (va al sameAs). false = canal de contacto. */
  profile: boolean;
}[] | null = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/bielcarautomoviles/',
    icon: 'instagram',
    profile: true,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/BielcarAutomoviles/',
    icon: 'facebook',
    profile: true,
  },
  {
    label: 'Mercado Libre',
    href: 'https://vehiculos.mercadolibre.com.uy/_CustId_167771165',
    icon: 'mercadolibre',
    /* Ver la nota de `size`: el óvalo es bajo y a 24px se ve chico. */
    size: 32,
    profile: true,
  },
  {
    label: 'WhatsApp',
    /* La línea de ventas. `waLink()` está declarado más abajo pero es una
       `function`, o sea que está hoisteada y se puede llamar acá. */
    href: waLink('Hola, quiero hacer una consulta.', 'sales') ?? '',
    icon: 'whatsapp',
    profile: false,
  },
];

/** Los perfiles públicos, para el `sameAs` del JSON-LD. Ver la nota de arriba. */
export const SOCIAL_PROFILES = (SOCIAL ?? []).filter((s) => s.profile && s.href);

/**
 * Fotos del Home.
 *
 * Los tres tiles ya tienen la foto que mandó Sebastián. El hero sigue en null:
 * ese pide una foto del LOCAL, y poner ahí un auto de catálogo sería otra cosa.
 *
 * Los componentes que las consumen (HomeHero, AccessTiles) tienen armada la
 * composición completa —encuadre, degradado de legibilidad, posición del
 * título— y caen a un fondo neutro + <Placeholder> mientras el valor sea null.
 *
 * Las del local YA LLEGARON (`homeHero`, `aboutLocal`). La regla que las
 * mantuvo en null hasta ahora sigue valiendo para cualquier foto futura: NO
 * poner una de stock genérica, porque una automotora mostrando un local que no
 * es el suyo es exactamente el tipo de dato falso que este mecanismo existe
 * para impedir.
 */
export interface Photo {
  /**
   * Imagen IMPORTADA de `src/assets`, no una ruta de `public/`.
   *
   * La diferencia es todo el punto: importándola, Astro la procesa con sharp
   * en el build y genera variantes por resolución más webp/avif. Una ruta a
   * `public/` se sirve tal cual — que es como llegamos a un banner de 8 MB.
   *
   * `width`, `height` y `format` vienen dentro del propio ImageMetadata, así
   * que ya no hay que anotarlos a mano (y no pueden quedar desactualizados,
   * que es lo que pasó cuando el hero de service declaraba 1171x781 sobre un
   * archivo de 1500x527).
   */
  src: ImageMetadata;
  alt: string;
}

export const PHOTOS: {
  /** Hero del Home. Ya NO es nullable: las fotos del local llegaron. */
  homeHero: Photo;
  /** Split de /nosotros. Otra toma, para no repetir la misma foto en el sitio. */
  aboutLocal: Photo;
  /* `w` y `h` son las medidas REALES del archivo. Van al <img> para reservar
     el espacio: sin ellas la página salta cuando carga la foto. Las necesitan
     los heroes, que muestran la imagen a ancho completo. */
  tileNuevos: Photo | null;
  tileUsados: Photo | null;
  tileTodos: Photo | null;
  serviceHero: Photo;
  /** Hero de /contacto. Segunda foto de stock — ver la nota en el valor. */
  contactHero: Photo;
} = {
  /**
   * Fachada de La Paz 2028 con el salón a la vista.
   *
   * Se eligió entre las tres tomas mirando el RECORTE real del hero, que es
   * casi 2.3:1 sobre una foto 4:3: el auto blanco en la vidriera es lo que
   * hace que la imagen se lea como automotora de entrada, y el h1 cae sobre la
   * zona oscura del interior.
   */
  homeHero: { src: local1, alt: 'Frente de Bielcar Automóviles en La Paz 2028, Montevideo' },

  /**
   * La fachada completa en ángulo. Va en /nosotros, donde el contenedor es 4:3
   * — el mismo aspecto que el archivo, o sea que entra ENTERA, sin recorte.
   *
   * Es una toma distinta a la del Home a propósito: son las dos únicas fotos
   * grandes del local en el sitio y repetir la misma se nota.
   *
   * (Queda una tercera, `bielcar-2`, sin usar: muestra el lado de chapa y
   * pintura. Sirve el día que /service o /nosotros necesiten una foto propia.)
   */
  aboutLocal: { src: local3, alt: 'Fachada de Bielcar Automóviles en La Paz 2028, Montevideo' },

  tileNuevos: { src: tileNuevosImg, alt: 'Lynk & Co 02 rojo' },
  tileUsados: { src: tileUsadosImg, alt: 'Honda CR-V blanco en ruta' },
  tileTodos: { src: tileTodosImg, alt: 'Geely EX2 verde claro' },

  /**
   * Única excepción de foto de stock en `PHOTOS`. Decisión explícita del
   * usuario para el hero de `/service` (ver ledger, sesión 15): a diferencia
   * de `homeHero` —que NO puede caer en stock porque afirmaría "este es
   * nuestro local" sobre un lugar que no lo es— acá la foto es un taller
   * genérico y el `alt` no afirma que sea el de Bielcar. No nullable, como
   * las tiles de arriba: el archivo ya está, no es un dato pendiente.
   *
   * TODO: `public/img/service/hero2.png` tiene la marca de agua
   * "Unsplash+" visible en toda la superficie. Es un reemplazo drop-in ya
   * decidido — sobrescribir ESE archivo con el export licenciado antes de
   * `npm run deploy`. No cambiar esta referencia ni el nombre del archivo.
   */
  serviceHero: {
    src: serviceHeroImg,
    alt: 'Mecánico revisando la parte inferior de un auto sobre un elevador de taller',
  },

  /**
   * Segunda —y por ahora última— foto de stock de `PHOTOS`, para el hero de
   * /contacto. La mandó el usuario como `banner-contacto.png`.
   *
   * Vale por el mismo motivo que `serviceHero` y NO por el de `homeHero`: la
   * imagen es un mostrador genérico —manos marcando en un teléfono, salón
   * desenfocado atrás— y el `alt` describe eso, sin afirmar que sea el
   * mostrador de Bielcar. Si el `alt` dijera "recepción de Bielcar", esto
   * pasaría a ser un dato inventado y no podría ir.
   *
   * ⚠️  El archivo es 1983x793 (2.5:1). El hero es más apaisado que eso en
   * desktop, así que `object-fit: cover` recorta un poco arriba y abajo; en
   * mobile recorta a los costados y queda el teléfono, que está al centro.
   * Si cambia el alto de PhotoHero, revisar el encuadre.
   */
  contactHero: {
    src: contactHeroImg,
    alt: 'Manos marcando un número en un teléfono de mostrador, con el salón de una automotora desenfocado atrás',
  },
};

/**
 * Los archivos de logo que tenemos, por nombre de marca. Una marca que no está
 * acá cae al wordmark tipográfico en la franja (ver BrandStrip.astro).
 *
 * `w` y `h` son las medidas REALES del archivo. Van al `<img>` para reservar el
 * espacio: los cuatro tienen aspectos muy distintos (Lynk & Co es 4:1, el
 * emblema de Mitsubishi es casi cuadrado) y un valor inventado igual para todos
 * produce salto de layout al cargar.
 *
 * ─── Requisito del archivo: matte alpha, no fondo blanco ────────────────────
 * La franja los pasa a blanco con `filter: brightness(0) invert(1)`, que
 * conserva el alpha. Un PNG con fondo blanco OPACO se convierte en un
 * rectángulo blanco sólido. Le pasó a `logo-geely.png`, que llegó negro sobre
 * blanco sin canal alpha: se le sacó el fondo recuperando la cobertura de tinta
 * (`a = 255 - min(r,g,b)`), igual que al logo de Bielcar, y se reescribió el
 * archivo como RGBA. JAC ya venía en blanco con matte, y Lynk & Co y Mitsubishi
 * con matte correcto.
 *
 * **Si llega un logo nuevo, verificar que tenga transparencia real antes de
 * sumarlo acá.** El síntoma es un bloque blanco en la franja. El de Honda llegó
 * como `.jpg`, que por formato no puede tener alpha: se convirtió a PNG.
 *
 * ─── Están recortados al glifo, no al lienzo original ──────────────────────
 * La franja usa `object-fit: contain` en una caja fija, o sea que ajusta el
 * LIENZO. Volvo venía como un wordmark chiquito en el medio de un cuadrado de
 * 400x400 (92% transparente) y se renderizaba tres veces más chico que JAC
 * aunque el archivo fuera más grande. A todos se les recortó el padding
 * transparente al bounding box del alpha, así `contain` compara glifos con
 * glifos y la fila queda ópticamente pareja. Si se reemplaza alguno, hay que
 * recortarlo igual o va a desentonar.
 *
 * Siguen siendo bitmaps. §5.6 pide SVG y tiene razón: se van a ver blandos en
 * pantallas densas.
 *
 * `logo-great-wall.png` ya no está: Great Wall no está en ninguna de las listas.
 */
export const BRAND_LOGOS: Record<string, { src: string; w: number; h: number }> = {
  Geely: { src: '/img/marcas/logo-geely.png', w: 292, h: 159 },
  'Lynk & Co': { src: '/img/marcas/logo-linkco.png', w: 338, h: 53 },
  Honda: { src: '/img/marcas/logo-honda.png', w: 360, h: 292 },
  JAC: { src: '/img/marcas/logo-jac.png', w: 2856, h: 2812 },
  Mitsubishi: { src: '/img/marcas/logo-mitsubishi.png', w: 360, h: 310 },
  MG: { src: '/img/marcas/logo-mg.png', w: 360, h: 360 },
  Volvo: { src: '/img/marcas/logo-volvo.png', w: 360, h: 53 },
};

/**
 * Link a /contacto con el formulario precargado para agendar service de una
 * marca. Lo usa la franja de /service.
 *
 * ─── Por qué el parámetro es la marca y no el mensaje ──────────────────────
 * `?service=Geely` y no `?mensaje=Quiero%20agendar...`. Dos motivos:
 *
 *  1. El copy queda en el código, en un solo lugar. Si mañana cambia el texto,
 *     los links viejos que alguien haya guardado siguen produciendo el texto
 *     nuevo en vez de quedar congelados con el viejo.
 *  2. **Seguridad.** Un parámetro que se vuelca al formulario tiene que ser
 *     validable. Con un nombre de marca se contrasta contra SERVICE_BRANDS y
 *     lo que no esté en la lista se descarta. Con un mensaje libre, cualquiera
 *     podría armar un `/contacto?mensaje=…` que precargue un texto engañoso y
 *     mandárselo a otra persona para que se lo envíe a Bielcar sin leerlo.
 *
 * La validación ocurre del lado del cliente (ver ContactForm.astro): el sitio
 * es estático, así que en build time no hay query string que leer.
 */
export function serviceEnquiryHref(brand: string): string {
  return `/contacto?service=${encodeURIComponent(brand)}`;
}

/**
 * El mensaje que se precarga, con `{marca}` donde va el nombre.
 *
 * Vive acá y no en el componente porque lo necesitan los dos lados: el
 * formulario para armarlo y cualquiera que quiera saber qué texto produce un
 * link de la franja sin leer JavaScript.
 */
export const SERVICE_ENQUIRY_MESSAGE = 'Quiero agendar un service oficial de {marca}.';

/** El valor exacto de la opción "Service" del select de motivo en /contacto. */
export const SERVICE_ENQUIRY_MOTIVO = 'Service';

/* ---------------------------------------------- qué incluye un service ----- */

/**
 * El detalle del mantenimiento programado, para /service.
 *
 * Era el `<Placeholder>` más importante del sitio: es el dato que alguien que
 * entra a /service viene a buscar, y hasta ahora no se podía afirmar nada.
 *
 * ─── Por qué este texto SÍ se puede publicar ───────────────────────────────
 * Porque no afirma un checklist propio de Bielcar. `SCHEDULE_NOTE` aclara
 * primero que **cada marca define su plan según modelo y kilometraje**, y
 * recién después enumera lo que un service incluye "en líneas generales". Esa
 * salvedad es lo que lo vuelve verificable en vez de inventado: describe cómo
 * funciona el mantenimiento programado, no promete un contenido puntual que
 * después no coincida con la libreta del fabricante.
 *
 * Si alguien borra esa línea y deja la lista sola, el bloque pasa a afirmar un
 * checklist fijo. No la borres.
 *
 * ⚠️  Dos frases son PROMESAS al cliente, no descripciones, y conviene que
 * Sebastián las confirme:
 *   · "manteniendo la garantía vigente" (SERVICE_OFFICIAL_NOTE)
 *   · "Nunca hacemos nada sin tu aprobación" (SERVICE_APPROVAL_NOTE)
 * Las dos son estándar en un servicio oficial y por eso quedaron, pero si el
 * taller no las sostiene son un problema, no un texto.
 */
export const SERVICE_OFFICIAL_NOTE =
  'Su vehículo se atiende con repuestos originales, técnicos capacitados por la marca y equipamiento de diagnóstico oficial, cumpliendo el plan de mantenimiento del fabricante y manteniendo la garantía vigente.';

/** La salvedad que hace publicable a la lista. Ver la nota de arriba. */
export const SERVICE_SCHEDULE_NOTE =
  'Cada marca define su propio plan según el modelo y el kilometraje. En líneas generales, un service incluye:';

export const SERVICE_INCLUDES = [
  'Cambio de aceite de motor y filtro',
  'Reemplazo de filtros según corresponda al kilometraje',
  'Control y completado de niveles',
  'Inspección de frenos, suspensión, dirección y neumáticos',
  'Diagnóstico electrónico con equipamiento oficial de la marca',
  'Registro del service en la libreta de mantenimiento',
] as const;

export const SERVICE_APPROVAL_NOTE =
  'Los trabajos adicionales que surjan de la inspección se le informan y presupuestan antes de realizarlos. Nunca hacemos nada sin su aprobación.';

/* -------------------------------------------------- texto institucional ---- */

/**
 * Texto institucional de /nosotros. Escrito por Sebastián.
 *
 * Se transcribe tal cual salvo una corrección de puntuación: el original tenía
 * "toda la atención que necesita, realizamos los trámites" —coma empalmando dos
 * oraciones— y va con dos puntos. Mismo criterio que con "Mecanica" → "Mecánica"
 * en SERVICES: se corrige ortografía y puntuación, nunca contenido.
 *
 * Va partido en párrafos y no en un bloque: son cuatro ideas distintas (quiénes
 * son, qué resuelven en la compra, el taller, y el cierre) y de corrido son
 * ciento sesenta palabras sin respiro.
 *
 * ⚠️  Está escrito en USTED y el resto del sitio habla de VOS ("Tocá tu marca",
 * "Escribinos"). El sitio ya mezcla los dos registros porque los textos de
 * SERVICES vienen igual. No se unificó por cuenta propia: cambiar el registro
 * de un texto institucional es reescribir la voz de la empresa, y eso lo decide
 * Sebastián. Anotado en el README.
 *
 * ⚠️  Este texto AFIRMA DOS SERVICIOS que no están en `SERVICES`: trámites con
 * escribanos propios y financiación propia o bancaria. Los dos son
 * diferenciales fuertes para una automotora y hoy no aparecen en el bloque de
 * servicios del Home ni en ninguna otra parte. Ver el README.
 */
export const ABOUT_PARAGRAPHS = [
  'Bielcar Automóviles se destaca por brindar un servicio integral y personalizado a sus clientes. En un tiempo donde se está perdiendo lo tradicional, la empresa es atendida por sus propios dueños.',
  'Nuestro objetivo es lograr que pueda cumplir la experiencia de adquirir un vehículo 0km o usado multimarca, brindándole toda la atención que necesita: realizamos los trámites necesarios con nuestro equipo de escribanos, le facilitamos el pago a través de financiaciones propias o bancarias, y tomamos su unidad usada como permuta.',
  'Contamos con un amplio taller de mecánica, chapa y pintura, donde le ofrecemos la tecnología y productos de la más alta calidad que sumado a nuestro personal altamente capacitado nos permiten ofrecerle desde el más simple chequeo, hasta la reparación de choques o ajustes de motor.',
  'Para que finalmente a la hora de cambiar su vehículo nos vuelva a elegir como su concesionario de confianza.',
] as const;

/* ------------------------------------------------------- banners de marca -- */

/**
 * Foto de hero por marca, para cuando el catálogo viene filtrado.
 *
 * La clave es el nombre de `SALES_BRANDS` — si alguna vez se agrega una marca
 * sin banner, el hero se queda con el default y no rompe nada.
 *
 * ─── Los formatos están mezclados, y es a propósito ────────────────────────
 * Cuatro son webp y dos jpg. `sips` (lo único disponible en esta máquina) LEE
 * webp pero no lo ESCRIBE, así que pasar las jpg a webp no se puede desde acá,
 * y pasar las webp a jpg las haría más pesadas. Cada una quedó en el mejor
 * formato posible con las herramientas que hay.
 *
 * La única que se re-encodeó es Volvo: venía como PNG de 1.7 MB —más que todas
 * las demás juntas— y como es una foto, no un gráfico, el PNG estaba de más.
 * A jpg calidad 70 quedó en 296 KB sin banding visible en el degradado del
 * cielo, que es donde primero se nota.
 *
 * ⚠️  JAC mide 1024px de ancho, la mitad que el resto. En un monitor grande el
 * hero es full-bleed, así que va a escalar ~2x y se va a ver más blanda que
 * las otras. Si Sebastián consigue una más grande, se reemplaza el archivo.
 *
 * ⚠️  Los aspectos van de 1.50:1 (Geely, Volvo) a 2.52:1 (Lynk & Co). El hero
 * es mucho más apaisado que todos, así que `object-fit: cover` recorta arriba
 * y abajo — más agresivo cuanto más cuadrada la foto. En las de 1.5:1 se ve
 * poco más que la franja central.
 */
export const BRAND_BANNERS: Record<string, Photo> = {
  Geely: { src: geelyBanner, alt: 'Geely' },
  'Lynk & Co': { src: lynkcoBanner, alt: 'Lynk & Co' },
  Honda: { src: hondaBanner, alt: 'Honda' },
  JAC: { src: jacBanner, alt: 'JAC' },
  Mitsubishi: { src: mitsubishiBanner, alt: 'Mitsubishi' },
  MG: { src: mgBanner, alt: 'MG' },
  Volvo: { src: volvoBanner, alt: 'Volvo' },
};

/* ------------------------------------------------------------------ rutas -- */

/**
 * El sitemap del sitio, en un solo lugar.
 *
 * Lo consumen el nav del header y `sitemap.xml.ts`. Estaban separados y esa es
 * la forma clásica de que una página nueva quede fuera del sitemap durante
 * meses sin que nadie lo note: se agrega al header porque se ve, y el XML no
 * se mira nunca.
 *
 * `nav: false` en '/' porque al Home se entra por el logo, no por un ítem de
 * navegación repetido.
 *
 * Los `path` van en forma canónica y SIN extensión. `build.format: 'file'`
 * genera `usados.html` pero Vercel sirve `/usados` (cleanUrls), y `cleanPath()`
 * normaliza a esta forma — que es la que tiene que salir en el sitemap y la que
 * compara el estado activo del nav.
 *
 * NO hay entradas de detalle de vehículo: las renderiza el plugin in-place con
 * `?ma_carid=` sobre la misma URL y su inventario cambia todo el tiempo. Un
 * sitemap de vehículos tendría que salir del feed de Multiaviso, que es otro
 * proyecto.
 */
export const ROUTES = [
  { path: '/', label: 'Inicio', nav: false, priority: 1.0 },
  { path: '/nuevos', label: '0km', nav: true, priority: 0.9 },
  { path: '/usados', label: 'Usados', nav: true, priority: 0.9 },
  { path: '/vehiculos', label: 'Vehículos', nav: true, priority: 0.9 },
  { path: '/service', label: 'Service', nav: true, priority: 0.8 },
  { path: '/nosotros', label: 'Nosotros', nav: true, priority: 0.5 },
  { path: '/contacto', label: 'Contacto', nav: true, priority: 0.7 },
] as const;

/* ------------------------------------------------------- datos estructurados */

/**
 * `site.address` descompuesto para schema.org. Es el MISMO dato en otra forma,
 * no un dato nuevo: si cambia la dirección hay que cambiar los dos, y por eso
 * están pegados.
 *
 * `country` sale de que la automotora está en Montevideo y los teléfonos son
 * uruguayos (+598). No es una suposición sobre algo que no sabemos.
 */
export const ADDRESS_PARTS = {
  street: 'La Paz 2028',
  locality: 'Montevideo',
  country: 'UY',
} as const;

/**
 * `site.hours` en la forma que pide `OpeningHoursSpecification`.
 *
 * Son DOS tramos y no uno: el horario confirmado por Sebastián tiene corte de
 * mediodía ("de 9 a 13 y de 14 a 19"). Declararlo como un solo tramo 9-19 le
 * diría a Google que atienden a las 13:30, que es cuando está cerrado.
 *
 * Lunes a viernes, sin sábados — ver OPENS_SATURDAYS.
 */
export const HOURS_SPEC = [
  { opens: '09:00', closes: '13:00' },
  { opens: '14:00', closes: '19:00' },
] as const;

/** Los días que abre, en el vocabulario de schema.org. */
export const OPEN_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
] as const;

/**
 * Imagen de Open Graph.
 *
 * Generada del logo sobre la superficie oscura de marca, con `sips`, sin
 * dependencias nuevas. NO es una foto: la foto del local sigue pendiente
 * (PHOTOS.homeHero) y una tarjeta con un auto de catálogo diría que ese auto
 * es Bielcar.
 *
 * ⚠️  Sale un poco blanda: el archivo de origen mide 254px de ancho y acá se
 * escala ~2x. Es el mismo techo que el logo del header. Cuando llegue el
 * vector, esta imagen se regenera y mejora sola.
 */
export const OG_IMAGE = {
  src: '/img/og.png',
  width: 1200,
  height: 630,
} as const;

/* -------------------------------------------------------------- mapa ------ */

/**
 * URL del mapa embebido. La usan el footer y /contacto.
 *
 * Estaba escrita dos veces con el mismo template. Ahora es una sola función:
 * si cambia la dirección o la forma de la query, cambia en los dos lados.
 *
 * ─── Por qué la query lleva el NOMBRE y no solo la dirección ───────────────
 * Con `q=La Paz 2028, Montevideo` la tarjeta del mapa se titula "La Paz 2028",
 * o sea la calle. Anteponiendo el nombre, si Bielcar tiene ficha de Google
 * Business el mapa la resuelve y muestra "Bielcar Automóviles" arriba con la
 * dirección debajo, que es lo que se quiere.
 *
 * ⚠️  NO ESTÁ VERIFICADO, y depende de un dato que no controlamos: que exista
 * esa ficha. Si no existe, Google cae al geocoder y el título vuelve a ser la
 * dirección — o sea que el peor caso es el comportamiento anterior, no algo
 * roto. Hay que MIRARLO en el navegador.
 *
 * Si no funciona, la salida determinista es la sintaxis de etiqueta del embed
 * clásico, que necesita coordenadas:
 *
 *     maps?q=-34.8xxxx,-56.1xxxx(Bielcar+Automóviles)&output=embed
 *
 * Ahí el título lo ponemos nosotros y no depende de ninguna ficha. Falta el
 * par lat/lng del local — se saca abriendo el punto en Google Maps.
 */
export function mapEmbedSrc(): string {
  const query = `${site.name}, ${site.address}, Uruguay`;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

/* ------------------------------------------------------------------ helpers */

/**
 * Normaliza un pathname a su forma canónica.
 *
 * `build.format: 'file'` hace que Astro.url.pathname sea '/usados.html', pero
 * Vercel sirve '/usados' (cleanUrls). Sin esta normalización el <link rel=canonical>
 * apunta a la variante con extensión y el estado activo del nav nunca matchea.
 */
export function cleanPath(pathname: string): string {
  const p = pathname.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');
  return p || '/';
}

/**
 * Arma un link de WhatsApp prellenado para una de las dos líneas.
 *
 * `line` es obligatorio pensarlo, no adivinarlo: el default es 'sales' porque
 * es el canal general, pero **todo lo que sea taller tiene que pasar
 * 'service'** o la consulta cae en ventas y alguien la reenvía a mano. Ver la
 * nota de CONTACT.
 *
 * Devuelve `null` si no hay número para esa línea — quien lo consume debe
 * renderizar un <Placeholder> en vez del botón. Nunca un href a la nada.
 */
export function waLink(message: string, line: ContactLine = 'sales'): string | null {
  const number = CONTACT[line].whatsapp;
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
