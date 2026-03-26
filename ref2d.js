(function(){
  const $ = s => document.querySelector(s);
  const viewport = $("#ref2dViewport"),
        plane    = $("#ref2dPlane");
  // PERF:
  if (plane) {
    plane.style.willChange = 'transform';
  }
  const search  = $("#ref2dSearch"),
        count   = $("#ref2dCount");
  const searchClearBtn = $("#ref2dSearchClear");
  const suggestionsBox = $("#ref2dSuggestions");
  const catPanel = $("#ref2dCatPanel");
  const catGrid  = $("#ref2dCatGrid");
  const catToggle = $("#ref2dCatToggle");
  const mobileCatToggle = $("#ref2dMobileCatToggle");
  const overlay = $("#ref2dOverlay"),
        modal   = document.querySelector(".ref2d__modal");
  const closeBtn = $("#sheetClose");
  const sheetImg = $("#sheetImg"),
        sheetFig = document.querySelector(".sheet__figure");
  const sTitle  = $("#sheetTitle"),
        sAuthor = $("#sheetAuthor"),
        sRole   = $("#sheetRole"),
        sCredits = $("#sheetCredits"),
        sArea   = $("#sheetArea"),
        sYear   = $("#sheetYear"),
        sTags   = $("#sheetTags"),
        sLink   = $("#sheetLink");
  const sheetCitation = $("#sheetCitation");
  const sheetCitationToggle = $("#sheetCitationToggle");
  const sheetCitationPanel = $("#sheetCitationPanel");
  const sheetCitationText = $("#sheetCitationText");
  const sheetCitationCopy = $("#sheetCitationCopy");
  const sheetSupportToggle = $("#sheetSupportToggle");
  const sheetSupportOptions = $("#sheetSupportOptions");
  const sheetReportActions = $("#sheetReportActions");
  const sheetRequestPanel = $("#sheetRequestPanel");
  const sheetRequestTitle = $("#sheetRequestTitle");
  const sheetRequestMessage = $("#sheetRequestMessage");
  const sheetRequestEmail = $("#sheetRequestEmail");
  const sheetRequestStatus = $("#sheetRequestStatus");
  const sheetRequestClose = $("#sheetRequestClose");
  const sheetRequestSend = $("#sheetRequestSend");
  const sheetRequestCancel = $("#sheetRequestCancel");
  const bentoControls = $("#ref2dBentoControls");
  const btnCenter = $("#ref2dCenter");
  const btnZoomOut = $("#ref2dZoomOut");
  const btnZoomIn = $("#ref2dZoomIn");
  const brand     = document.querySelector(".ref2d__brand");
  const viewToggle = $("#ref2dViewToggle");
  const viewMenu = $("#ref2dViewMenu");
  const multiGrid = $("#ref2dMultiGrid");
  const indexList = $("#ref2dIndexList");
  const indexBody = $("#ref2dIndexBody");
  const simpleView = $("#ref2dSimpleView");
  const simpleGrid = $("#ref2dSimpleGrid");
  const btnSimpleRefresh = $("#ref2dSimpleRefresh");
  const btnRandom = $("#ref2dRandom");
  const btnSearchRandom = $("#ref2dSearchRandom");
  const headerMoreBtn = $("#ref2dHeaderMore");
  const headerMoreDropdown = $("#ref2dHeaderMoreDropdown");
  const MOBILE_MAX_WIDTH = 768;
  const MOBILE_ALLOWED_VIEWS = new Set(['grid', 'index']);
  const DESKTOP_ALLOWED_VIEWS = new Set(['bento', 'grid', 'index']);
  const REQUESTS_STORAGE_KEY = "ref2d_admin_requests_v1";
  const REQUESTS_API_URL = "https://script.google.com/macros/s/AKfycbwxazNeMlGlw2aFNLCF1L3B-ceWtH54qWYa_7FHRs8GjN0V3zmzXYgosdCP4cjGEWdjWQ/exec";
  const REQUESTS_API_KEY = "ref123.teca";
  const REQUEST_EMAIL_ENDPOINT = "https://formsubmit.co/referencioteca.cl@gmail.com";
  const REQUEST_TYPES = {
    modify: {
      title: "Modificar Información",
      subject: "Solicitud de modificación de proyecto",
      prompt: "Indica qué información debemos corregir o actualizar."
    },
    remove: {
      title: "Solicitud de Baja",
      subject: "Solicitud de baja de proyecto",
      prompt: "Describe brevemente por qué solicitas la baja."
    },
    link: {
      title: "Notificar Enlace con Error",
      subject: "Reporte de enlace con error",
      prompt: "Indica qué enlace falla y, si existe, comparte el enlace correcto."
    }
  };
  let activeRequestType = "";
  let activeSpotlightMeta = null;
  let isRequestSending = false;
  let sheetCitationFeedbackTimer = null;

  /* Si falta el contenedor principal, salimos en silencio (para no romper otras páginas) */
  if (!viewport || !plane) {
    return;
  }

  /* Estado inicial: overlay cerrado */
  if (overlay) {
    overlay.setAttribute('hidden','');
  }
  document.body.style.overflow = '';

  /* ---- TAGS (filtros canónicos visibles en la interfaz) ---- */
  const TAGS = [
    'Editorial','Ilustración','Dirección de arte','Tipografía','Experimental',
    'Publicación digital','Impresión','Curaduría','Señalética','Iluminación',
    'Música','Visuales','Merchandising','Afiche','Moda','Motion Graphics',
    'Sitio Web','Educación','Exhibición','Museografía','Branding','Fotografía',
    'Gráfico','Animación','Audiovisual','Arte','Espacio','UX UI','Packaging',
    'Producto','Industrial','Mobiliario','Textil','Artesanía','Biomateriales',
    'Investigación','Pub. Académica','Videojuego','Teatro','Social','Salud',
    'Muralismo','Infografía','RRSS','Web','Cover Art','Portafolio'
  ];

  /* ---- SUGERENCIAS DE BÚSQUEDA ---- */
  const SUGGESTIONS = [
    // Editorial
    'editorial','diagramación','layout','maquetación','fanzine','zine',
    'objeto editorial','libro de artista','publicación digital','publicacion digital',
    'infantil','risografía','risografia','riso','impresión','impresion',

    // Identidad / Branding
    'branding','identidad visual','identidad gráfica','identidad grafica',
    'imagen corporativa','marca',

    // Gráfico / Comunicación visual
    'gráfico','grafico','diseño gráfico','comunicación visual','comunicacion visual',
    'graphic design',

    // Ilustración
    'ilustración','ilustracion','dibujo','ilustración editorial','ilustración infantil',

    // Tipografía
    'tipografía','tipografia','lettering','caligrafía','caligrafia','type design','fuente',

    // Fotografía
    'fotografía','fotografia','fotografía de moda','fotografia de moda',
    'fotografía editorial','fotografía de producto',

    // Animación / Motion / Audiovisual
    'animación','animacion','motion graphics','motion','diseño en movimiento',
    'audiovisual','stop-motion','stop motion','animación 2d','animacion 2d',
    'animación 3d','animacion 3d',

    // Web / Digital
    'sitio web','web','diseño web','web design','responsivo','responsive',
    'landing page','front-end','one pager','ux','ui','ux ui',

    // Espacio / Interior
    'espacio','arquitectura interior','interiorismo','diseño interior',

    // Exhibición / Museografía
    'exhibición','exhibicion','exposición','exposicion','exposición de arte',
    'exposicion de arte','museografía','museografia','museo','curaduría','curaduria',
    'montaje','instalación','instalacion','señalética','señaletica','wayfinding',

    // Moda / Textil
    'moda','vestuario','indumentaria','textil','diseño textil','patronaje',
    'fotografía de moda','fotografia de moda','costume design',

    // Publicación académica
    'publicación académica','publicacion academica','pub. académica','pub academica',
    'artículo académico','articulo academico','paper','tesis','revista académica',

    // Música / Visuales
    'música','musica','cover art','portada de disco','visuales','vjing',

    // Afiche / Poster
    'afiche','afiche digital','afiche impreso','poster','póster','cartel',

    // Diseño de servicio
    'diseño servicio','diseno servicio','service design','diseño de servicios',

    // Espacio público / Social
    'muralismo','mural','arte urbano','street art','diseño social','social',
    'accesibilidad',

    // Investigación / Experimental
    'experimental','investigación','investigacion','research','diseño especulativo',
    'speculative design','design research','archivo',

    // Producto / Industrial
    'producto','diseño de producto','product design','industrial','diseño industrial',
    'packaging','embalaje','envase','empaque','mobiliario','furniture',

    // Salud / Educación
    'salud','health design','educación','educacion',

    // Teatro / Videojuego / Arte
    'teatro','escenografía','escenografia','artes escénicas',
    'videojuego','game design','video game','gaming',
    'arte','artes visuales','arte digital','arte generativo',

    // Infografía / Datos
    'infografía','infografia','infographic','data viz','visualización de datos',

    // RRSS
    'rrss','redes sociales','social media','contenido digital',

    // Artesanía / Biomateriales
    'artesanía','artesania','craft','oficios','biomateriales','materiales sustentables',

    // Lettering / Portafolio
    'lettering','portafolio',
  ];

  /* Helpers */
  const norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const PALETTE = ["#ff6b6b","#ffd93d","#6bcBef","#b084f6","#26de81","#ff9f1a","#f368e0","#00d2d3","#10ac84","#a29bfe","#fd79a8","#81ecec"];
    /* =================== TAG NORMALIZATION (dedupe + Titlecase + aliases) =================== */

  // Alias: la clave debe ir normalizada (sin tildes, en minúsculas) porque canonicalTagKey usa norm().
  const TAG_ALIASES = {
    // Editorial
    "diagramacion": "editorial",
    "layout": "editorial",
    "maquetacion": "editorial",
    "fanzine": "editorial",
    "zine": "editorial",
    "objeto editorial": "editorial",
    "libro de artista": "editorial",
    "publicacion digital": "editorial",
    "book design": "editorial",

    // Branding / Identidad
    "identidad visual": "branding",
    "identidad grafica": "branding",
    "imagen corporativa": "branding",
    "marca": "branding",
    "logo": "branding",
    "logos": "branding",
    "rebranding": "branding",
    "brand": "branding",
    "brand strategy": "branding",

    // Web / Digital
    "sitio web": "web",
    "digital": "web",
    "responsivo": "web",
    "responsive": "web",
    "desarrollo web": "web",
    "portafolio web": "web",
    "ecommerce": "web",
    "landing page": "web",
    "one pager": "web",
    "front-end": "web",
    "web design": "web",
    "diseno web": "web",

    // UX / UI
    "ux": "ux ui",
    "ui": "ux ui",
    "ux/ui": "ux ui",
    "ui/ux": "ux ui",
    "interfaz": "ux ui",
    "interaction design": "ux ui",
    "diseno de interfaz": "ux ui",
    "experiencia de usuario": "ux ui",

    // Diseño servicio
    "servicio": "diseno servicio",
    "servicios": "diseno servicio",
    "diseno servicio": "diseno servicio",
    "diseno de servicio": "diseno servicio",
    "diseno de servicios": "diseno servicio",
    "service design": "diseno servicio",
    "deporte": "diseno servicio",
    "deportes": "diseno servicio",

    // Animación / Motion / Audiovisual
    "motion graphics": "animación",
    "motion": "animación",
    "animacion": "animación",
    "animacion 2d": "animación",
    "animacion 3d": "animación",
    "diseno en movimiento": "animación",
    "audiovisual": "animación",
    "stop-motion": "animación",
    "stop motion": "animación",

    // Visuales / VJ
    "vjing": "visuales",
    "vj": "visuales",
    "vjing (visuales)": "visuales",
    "artes visuales": "visuales",
    "arte digital": "visuales",
    "arte generativo": "visuales",

    // Espacio
    "espacios": "espacio",
    "espacio": "espacio",
    "estudio": "espacio",
    "arquitectura interior": "espacio",
    "interiorismo": "espacio",
    "diseno interior": "espacio",

    // Exhibición
    "exhibicion": "exhibicion",
    "exphibicion": "exhibicion",
    "exposicion": "exhibicion",
    "expo arte": "exhibicion",
    "exposicion de arte": "exhibicion",
    "identidad exposicion": "exhibicion",

    // Fotografía
    "fotografia": "fotografia",
    "fotografia de moda": "fotografia",
    "fotografia editorial": "fotografia",
    "fotografia de producto": "fotografia",
    "photo": "fotografia",

    // Impreso
    "risografia": "impreso",
    "riso": "impreso",
    "serigrafia": "impreso",
    "impresion": "impreso",
    "print": "impreso",
    "grafica impresa": "impreso",

    // Moda / Textil
    "vestuario": "textil",
    "indumentaria": "textil",
    "patronaje": "textil",
    "diseno textil": "textil",
    "textile design": "textil",
    "upcycling": "ecologia",
    "bordado": "textil",
    "costume design": "textil",
    "fashion": "moda",
    "diseno de moda": "moda",
    "styling": "estilismo",
    "stylist": "estilismo",

    // Museografía
    "museografia": "museografía",
    "instalacion": "museografía",
    "iluminacion museografica": "museografía",
    "diseno de exposiciones": "museografía",
    "montaje": "museografía",
    "heritage design": "museografía",
    "heritage": "museografía",

    // Señalética
    "senaletica": "señalética",
    "wayfinding": "señalética",
    "senalizacion": "señalética",
    "diseno de senales": "señalética",

    // Publicación académica
    "articulo academico": "pub academica",
    "articulo academica": "pub academica",
    "paper": "pub academica",
    "tesis": "pub academica",
    "publicacion academica": "pub academica",
    "revista academica": "pub academica",

    // Biomateriales / Artesanía
    "biomaterial": "biomateriales",
    "biomateriales": "biomateriales",
    "materiales sustentables": "biomateriales",
    "biofabricacion": "biomateriales",
    "artesania": "artesania",
    "craft": "artesania",
    "oficios": "artesania",
    "artes y oficios": "artesania",
    "soundscape": "investigacion",

    // Afiche / Poster
    "afiche": "afiche",
    "afiche impreso": "afiche",
    "afiche digital": "afiche",
    "poster": "afiche",
    "cartel": "afiche",

    // Cover art / Portada
    "disco": "cover art",
    "ep": "cover art",
    "portada de disco": "cover art",
    "portada de discos": "cover art",
    "arte de tapa": "cover art",
    "arte de portada": "cover art",
    "portada musical": "cover art",

    // Gráfico / Comunicación visual
    "grafico": "gráfico",
    "diseno grafico": "gráfico",
    "comunicacion visual": "gráfico",
    "graphic design": "gráfico",

    // Ilustración
    "ilustracion": "ilustración",
    "dibujo": "ilustración",
    "drawing": "ilustración",
    "ilustracion editorial": "ilustración",
    "ilustracion infantil": "ilustración",

    // Tipografía
    "tipografia": "tipografía",
    "lettering": "tipografía",
    "caligrafia": "tipografía",
    "type design": "tipografía",
    "fuente": "tipografía",

    // Infografía / Datos
    "infografia": "infografía",
    "infographic": "infografía",
    "data viz": "infografía",
    "visualizacion de datos": "infografía",

    // Muralismo / Arte urbano
    "mural": "muralismo",
    "arte urbano": "muralismo",
    "street art": "muralismo",
    "grafiti": "muralismo",

    // Teatro
    "escenografia": "teatro",
    "artes escenicas": "teatro",

    // Videojuego
    "game design": "videojuego",
    "video game": "videojuego",
    "gaming": "videojuego",
    "juego digital": "videojuego",

    // Producto / Industrial / Packaging
    "diseno de producto": "producto",
    "product design": "producto",
    "product": "producto",
    "prototipo": "producto",
    "embalaje": "packaging",
    "envase": "packaging",
    "empaque": "packaging",
    "diseno de envase": "packaging",
    "furniture": "mobiliario",
    "diseno de mobiliario": "mobiliario",
    "diseno de muebles": "mobiliario",

    // Salud / Social
    "health design": "salud",
    "salud publica": "salud",
    "diseno sanitario": "salud",
    "diseno medico": "salud",
    "diseno social": "social",
    "accesibilidad": "social",

    // Investigación / Experimental
    "investigacion": "investigacion",
    "research": "investigacion",
    "diseno especulativo": "investigacion",
    "speculative design": "investigacion",
    "design research": "investigacion",
    "critical design": "investigacion",
    "diseno critico": "investigacion",
    "archivo": "investigacion",

    // RRSS
    "redes sociales": "rrss",
    "social media": "rrss",
    "contenido digital": "rrss",
    "instagram": "rrss",
    "tiktok": "rrss",

    // Música
    "musica": "música",
  };

  // SAFE snapshot (pre-import): se mantiene para rollback rápido.
  const TAXONOMY_SAFE = Object.freeze({
    tags: TAGS.slice(),
    suggestions: SUGGESTIONS.slice(),
    aliases: Object.freeze({ ...TAG_ALIASES })
  });
  if (typeof window !== "undefined") {
    window.REF2D_TAXONOMY_SAFE = TAXONOMY_SAFE;
  }

  function mergeTaxonomyPayload(payload) {
    if (!payload || typeof payload !== "object") return;

    const dedupePush = (list, value) => {
      const raw = String(value || "").trim();
      if (!raw) return;
      const key = norm(raw);
      if (!key) return;
      if (list.some((item) => norm(item) === key)) return;
      list.push(raw);
    };

    const canonicalForMerge = (value) => {
      const key = norm(value);
      return norm(TAG_ALIASES[key] || key);
    };

    if (payload.aliases && typeof payload.aliases === "object") {
      Object.entries(payload.aliases).forEach(([rawAlias, rawTarget]) => {
        const alias = norm(rawAlias);
        const target = canonicalForMerge(rawTarget);
        if (!alias || !target) return;
        TAG_ALIASES[alias] = target;
      });
    }

    // Por defecto NO importamos sugerencias ni tags visibles:
    // este payload expande lenguaje para búsqueda sin ensuciar el autosuggest.
    if (payload.importSuggestions === true && Array.isArray(payload.suggestions)) {
      payload.suggestions.forEach((item) => dedupePush(SUGGESTIONS, item));
    }

    if (payload.importProjectTags === true && Array.isArray(payload.projectTags)) {
      payload.projectTags.forEach((item) => dedupePush(TAGS, item));
    }
  }

  function applyTaxonomyEnhancementsFromWindow() {
    if (typeof window === "undefined") return;
    mergeTaxonomyPayload(window.REF2D_TAXONOMY_ENHANCEMENTS);
    mergeTaxonomyPayload(window.REF2D_TAXONOMY_OVERRIDES);
  }

  applyTaxonomyEnhancementsFromWindow();

  /* ---- TAG DISPLAY (cómo se muestran los canónicos) ---- */
  const TAG_DISPLAY = {
    "editorial":          "Editorial",
    "ilustracion":        "Ilustración",
    "ilustración":        "Ilustración",
    "tipografia":         "Tipografía",
    "tipografía":         "Tipografía",
    "lettering":          "Tipografía",
    "experimental":       "Experimental",
    "infantil":           "Infantil",
    "impresion":          "Impresión",
    "impresión":          "Impresión",
    "impreso":            "Impreso",
    "curaduria":          "Curaduría",
    "curaduría":          "Curaduría",
    "branding":           "Branding",
    "senaletica":         "Señalética",
    "señaletica":         "Señalética",
    "señalética":         "Señalética",
    "fotografia":         "Fotografía",
    "fotografía":         "Fotografía",
    "exhibicion":         "Exhibición",
    "espacio":            "Espacio",
    "ux ui":              "UX UI",
    "ux":                 "UX UI",
    "ui":                 "UX UI",
    "diseno servicio":    "Diseño Servicio",
    "portada disco":      "Portada Disco",
    "cover art":          "Cover Art",
    "textil":             "Textil",
    "pub academica":      "Pub. Académica",
    "biomateriales":      "Biomateriales",
    "artesania":          "Artesanía",
    "artesanía":          "Artesanía",
    "moda":               "Moda",
    "vestuario":          "Moda",
    "musica":             "Música",
    "música":             "Música",
    "museografia":        "Museografía",
    "museografía":        "Museografía",
    "web":                "Web",
    "animación":          "Animación",
    "animacion":          "Animación",
    "gráfico":            "Gráfico",
    "grafico":            "Gráfico",
    "producto":           "Producto",
    "servicio":           "Servicio",
    "salud":              "Salud",
    "investigacion":      "Investigación",
    "investigación":      "Investigación",
    "packaging":          "Packaging",
    "serigrafia":         "Serigrafía",
    "serigrafía":         "Serigrafía",
    "industrial":         "Industrial",
    "mobiliario":         "Mobiliario",
    "espacios":           "Espacio",
    "social":             "Social",
    "afiche":             "Afiche",
    "iluminacion":        "Iluminación",
    "iluminación":        "Iluminación",
    "rrss":               "RRSS",
    "infografia":         "Infografía",
    "infografía":         "Infografía",
    "muralismo":          "Muralismo",
    "teatro":             "Teatro",
    "videojuego":         "Videojuego",
    "visuales":           "Visuales",
    "arte":               "Arte",
    "3d":                 "3D",
    "app":                "App",
    "cultura":            "Cultura",
    "direccion creativa": "Dirección Creativa",
    "direccion de arte":  "Dirección de Arte",
    "diseno integral":    "Diseño Integral",
    "diseno conceptual":  "Diseño Conceptual",
    "diseno de informacion":"Diseño de Información",
    "ecologia":           "Ecología",
    "estilismo":          "Estilismo",
    "styling":            "Estilismo",
    "experiencia":        "Experiencia",
    "galeria":            "Galería",
    "innovacion":         "Innovación",
    "juego de mesa":      "Juego de Mesa",
    "objeto":             "Objeto",
    "portada":            "Portada",
    "dirección de arte":  "Dirección de Arte",
    "portafolio":         "Portafolio",
    "vitrinaje":          "Vitrinaje",
    "educacion":          "Educación",
    "educación":          "Educación",
    "diseño servicio":    "Diseño Servicio",
  };

  const canonicalTagKey = (tag) => {
    const k = norm(tag);
    return norm(TAG_ALIASES[k] || k);
  };

  const prettyTag = (canonicalKey) => {
    return TAG_DISPLAY[canonicalKey] ||
      (canonicalKey ? canonicalKey.charAt(0).toUpperCase() + canonicalKey.slice(1) : "—");
  };

  const ROLE_FORMS = {
    "designer": {
      singular: { female: "Diseñadora", male: "Diseñador", mixed: "Diseñador/a" },
      plural: { female: "Diseñadoras", male: "Diseñadores", mixed: "Diseñadores/as" }
    },
    "photographer": {
      singular: { female: "Fotógrafa", male: "Fotógrafo", mixed: "Fotógrafo/a" },
      plural: { female: "Fotógrafas", male: "Fotógrafos", mixed: "Fotógrafos/as" }
    },
    "illustrator": {
      singular: { female: "Ilustradora", male: "Ilustrador", mixed: "Ilustrador/a" },
      plural: { female: "Ilustradoras", male: "Ilustradores", mixed: "Ilustradores/as" }
    },
    "art director": {
      singular: { female: "Directora de arte", male: "Director de arte", mixed: "Director/a de arte" },
      plural: { female: "Directoras de arte", male: "Directores de arte", mixed: "Directores/as de arte" }
    },
    "creative director": {
      singular: { female: "Directora creativa", male: "Director creativo", mixed: "Director/a creativo/a" },
      plural: { female: "Directoras creativas", male: "Directores creativos", mixed: "Directores/as creativos/as" }
    },
    "editor": {
      singular: { female: "Editora", male: "Editor", mixed: "Editor/a" },
      plural: { female: "Editoras", male: "Editores", mixed: "Editores/as" }
    },
    "curator": {
      singular: { female: "Curadora", male: "Curador", mixed: "Curador/a" },
      plural: { female: "Curadoras", male: "Curadores", mixed: "Curadores/as" }
    },
    "researcher": {
      singular: { female: "Investigadora", male: "Investigador", mixed: "Investigador/a" },
      plural: { female: "Investigadoras", male: "Investigadores", mixed: "Investigadores/as" }
    },
    "web developer": {
      singular: { female: "Desarrolladora web", male: "Desarrollador web", mixed: "Desarrollador/a web" },
      plural: { female: "Desarrolladoras web", male: "Desarrolladores web", mixed: "Desarrolladores/as web" }
    },
    "director": {
      singular: { female: "Directora", male: "Director", mixed: "Director/a" },
      plural: { female: "Directoras", male: "Directores", mixed: "Directores/as" }
    },
    "producer": {
      singular: { female: "Productora", male: "Productor", mixed: "Productor/a" },
      plural: { female: "Productoras", male: "Productores", mixed: "Productores/as" }
    },
    "author": {
      singular: { female: "Autora", male: "Autor", mixed: "Autor/a" },
      plural: { female: "Autoras", male: "Autores", mixed: "Autores/as" }
    },
    "co-author": {
      singular: { female: "Coautora", male: "Coautor", mixed: "Coautor/a" },
      plural: { female: "Coautoras", male: "Coautores", mixed: "Coautores/as" }
    },
    "typographer": {
      singular: { female: "Tipógrafa", male: "Tipógrafo", mixed: "Tipógrafo/a" },
      plural: { female: "Tipógrafas", male: "Tipógrafos", mixed: "Tipógrafos/as" }
    },
    "guide": {
      singular: { female: "Guía", male: "Guía", mixed: "Guía" },
      plural: { female: "Guías", male: "Guías", mixed: "Guías" }
    },
    "lighting designer": {
      singular: { female: "Iluminadora", male: "Iluminador", mixed: "Iluminador/a" },
      plural: { female: "Iluminadoras", male: "Iluminadores", mixed: "Iluminadores/as" }
    },
  };

  const FEMALE_NAME_HINTS = new Set([
    "alejandra", "antonia", "antonella", "aranda", "bernardita", "camila", "carola",
    "carolina", "catalina", "chiara", "colomba", "constanza", "daniela", "elisa",
    "emilia", "fernanda", "felicidad", "florencia", "gabriela", "gracia", "ignacia",
    "isabel", "javiera", "josefa", "josefina", "julie", "karina", "kimberly", "magdalena",
    "macarena", "manuela", "marisol", "martina", "maria", "naomi", "nicole", "paula",
    "paulina", "pilar", "rafaella", "sara", "sofia", "sophia", "tamara", "teresita",
    "trinidad", "valentina", "vanessa", "victoria", "yasmin", "yazmin"
  ]);

  const MALE_NAME_HINTS = new Set([
    "alejandro", "andres", "antonino", "benjamin", "camilo", "carlos", "clemente",
    "cristobal", "damian", "daniel", "domingo", "esteban", "felipe", "francisco",
    "franco", "gianfranco", "gonzalo", "hugo", "joaquin", "jose", "juan",
    "leon", "lukas", "marcos", "martin", "matias", "maximiliano", "nicolas", "pablo",
    "patricio", "pedro", "rodrigo", "sergio", "tomas", "vicente"
  ]);

  const MALE_A_EXCEPTIONS = new Set(["luca", "nikita"]);
  const FEMALE_O_EXCEPTIONS = new Set(["consuelo"]);

  const ROLE_ALIASES = {
    "disenador": "designer",
    "disenadora": "designer",
    "diseñador": "designer",
    "diseñadora": "designer",
    "diseno": "designer",
    "diseño": "designer",
    "design": "designer",
    "graphic design": "designer",
    "identidad grafica": "designer",
    "identidad gráfica": "designer",
    "diagramacion": "designer",
    "diagramación": "designer",
    "fotografia": "photographer",
    "fotografía": "photographer",
    "ilustracion": "illustrator",
    "ilustración": "illustrator",
    "direccion de arte": "art director",
    "dirección de arte": "art director",
    "art direction": "art director",
    "creative direction": "creative director",
    "direccion creativa": "creative director",
    "dirección creativa": "creative director",
    "curaduria": "curator",
    "curaduría": "curator",
    "investigacion": "researcher",
    "investigación": "researcher",
    "research": "researcher",
    "desarrollo web": "web developer",
    "web development": "web developer",
    "director": "director",
    "direccion": "director",
    "dirección": "director",
    "produccion": "producer",
    "producción": "producer",
    "editor": "editor",
    "editores": "editor",
    "editorial": "editor",
    "autor": "author",
    "autora": "author",
    "autores": "author",
    "autoras": "author",
    "coautor": "co-author",
    "co autora": "co-author",
    "co-autora": "co-author",
    "co-autor": "co-author",
    "coautora": "co-author",
    "typography": "typographer",
    "tipografia": "typographer",
    "tipografía": "typographer",
    "guiatura": "guide",
    "guia": "guide",
    "guía": "guide",
    "iluminacion": "lighting designer",
    "iluminación": "lighting designer",
  };

  const CREDIT_STOP_WORDS = new Set([
    "y", "and", "con", "por", "de", "del", "la", "el", "los", "las", "the",
    "autor", "autora", "autores", "autoras", "coautor", "coautora", "coautores",
    "fotografia", "ilustracion", "ilustraciones", "diagramacion", "diseno", "design",
    "graphic", "creative", "direction", "editor", "editorial", "investigacion",
    "curaduria", "guiatura", "produccion", "desarrollo", "web", "proyecto", "trabajo",
    "realizado", "studio", "estudio"
  ]);

  function splitCreditSegments(raw) {
    const normalized = String(raw || "").replace(/\s+/g, " ").trim();
    if (!normalized) return [];
    const withBreaks = normalized
      .replace(/\s*\|\s*/g, "\n")
      .replace(/;\s+(?=[A-Za-zÁÉÍÓÚÜÑ@][^:]{1,70}:)/g, "\n")
      .replace(/\.\s+(?=[A-Za-zÁÉÍÓÚÜÑ@][^:]{1,70}:)/g, "\n");
    return withBreaks
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function cleanAuthorName(raw) {
    const cleaned = String(raw || "")
      .replace(/\(([^)]*)\)/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s+,/g, ",")
      .replace(/,\s*$/, "")
      .trim();

    if (!cleaned) return "";

    const lower = cleaned.toLocaleLowerCase("es-CL");
    const upper = cleaned.toLocaleUpperCase("es-CL");
    const needsCaseNormalization = cleaned === lower || cleaned === upper;
    if (!needsCaseNormalization) return cleaned;

    const particles = new Set(["y", "and", "de", "del", "la", "las", "los", "da", "do", "dos", "van", "von"]);
    return lower.replace(/@?[\p{L}][\p{L}'’.-]*/gu, (word) => {
      const normalizedWord = String(word || "");
      const key = normalizedWord.toLocaleLowerCase("es-CL");
      if (particles.has(key)) return key;
      return key.charAt(0).toLocaleUpperCase("es-CL") + key.slice(1);
    });
  }

  function splitAuthorNames(raw) {
    return cleanAuthorName(raw)
      .split(/\s*(?:,|\/| y | and | & )\s*/i)
      .map((name) => name.trim())
      .filter(Boolean);
  }

  function inferNameGender(rawName) {
    const firstName = norm(String(rawName || "").trim())
      .replace(/^@/, "")
      .split(/\s+/)
      .filter(Boolean)[0] || "";
    if (!firstName) return "unknown";
    if (FEMALE_NAME_HINTS.has(firstName)) return "female";
    if (MALE_NAME_HINTS.has(firstName)) return "male";
    if (firstName.endsWith("a") && !MALE_A_EXCEPTIONS.has(firstName)) return "female";
    if (firstName.endsWith("o") && !FEMALE_O_EXCEPTIONS.has(firstName)) return "male";
    return "unknown";
  }

  function getAuthorGenderProfile(authorRaw) {
    const names = splitAuthorNames(authorRaw);
    if (!names.length) {
      return { group: "mixed", isPlural: false };
    }
    const counts = { female: 0, male: 0, unknown: 0 };
    names.forEach((name) => {
      const gender = inferNameGender(name);
      counts[gender] += 1;
    });
    if (counts.female > 0 && counts.male === 0 && counts.unknown === 0) {
      return { group: "female", isPlural: names.length > 1 };
    }
    if (counts.male > 0 && counts.female === 0 && counts.unknown === 0) {
      return { group: "male", isPlural: names.length > 1 };
    }
    return { group: "mixed", isPlural: names.length > 1 };
  }

  function roleLabelFromCanonical(canonical, authorRaw) {
    const key = canonical || "designer";
    const forms = ROLE_FORMS[key] || ROLE_FORMS.designer;
    const profile = getAuthorGenderProfile(authorRaw);
    const bucket = profile.isPlural ? forms.plural : forms.singular;
    return bucket[profile.group] || bucket.mixed || "Diseñador/a";
  }

  function toNameKey(value) {
    return norm(value)
      .replace(/[^a-z0-9@]+/g, " ")
      .trim();
  }

  const PERSON_NAME_PARTICLES = new Set([
    "de", "del", "la", "las", "los", "y", "da", "do", "dos", "van", "von", "di"
  ]);

  const PERSON_BLACKLIST_KEYS = new Set([
    "direccion", "direccion de arte", "direccion creativa", "diseno", "diseño",
    "operacion", "produccion", "produccion ejecutiva", "produccion general",
    "colaboracion", "colaboracion con", "cofundadora", "cofundador", "fundadora",
    "fundador", "proyecto", "proyecto de titulo", "ano", "año", "subsecretaria",
    "secretaria", "ministerio", "universidad", "fundacion", "estudio", "modelo",
    "maquillaje", "fotografia", "fotografía", "confeccion", "confección",
    "estilismo", "guiatura", "programador", "disenadora", "disenador",
    "ilustradora", "ilustrador", "artista", "visualista", "vjing", "show",
    "shows", "backup", "entorno", "3d", "zooma", "lab", "adeu", "itera", "bt",
    "festival de vina del mar", "lollapaloozacl", "elfestivaldevina"
  ]);

  const PERSON_BLACKLIST_WORDS = new Set([
    "cliente", "clientes", "desarrollado", "desarrollada", "desarrollados", "desarrolladas",
    "realizado", "realizada", "realizados", "realizadas", "equipo", "creative", "creativo",
    "creativa", "produccion", "production", "direccion", "diseno", "diseño", "programador",
    "programadora", "editorial", "estudio", "studio", "fundacion", "fundación", "ministerio",
    "universidad", "empresa", "marca", "secretaria", "subsecretaria", "servicio", "proyecto",
    "campana", "campaña", "fotografia", "fotografía", "maquillaje", "modelo", "confeccion",
    "confección", "estilismo", "guiatura", "identidad", "visuales", "autor", "autora",
    "autores", "autoras", "libro", "isbn", "isbnn", "producido", "producida", "producer",
    "produced", "producido por", "desarrollado por", "colaboracion", "colaboración",
    "colaborador", "colaboradora", "colaboradores", "colaboradoras",
    "coordinacion", "coordinación", "creacion", "creación", "edicion", "edición",
    "impreso", "impresa", "impresion", "impresión", "diseno sonoro", "mezcla", "programacion",
    "programación", "direccion y creacion", "dirección y creación", "logo", "logos",
    "revista", "revistas"
  ]);

  function normalizeWordToken(value) {
    return norm(value).replace(/[^a-z0-9@]+/g, "");
  }

  function canonicalPersonLabel(raw) {
    const value = String(raw || "").replace(/\s+/g, " ").trim();
    if (!value) return "";
    if (value.startsWith("@")) {
      const clean = value.replace(/[^@A-Za-z0-9._-]+/g, "");
      return clean || "";
    }
    return cleanAuthorName(value);
  }

  function isLikelyPersonCandidate(raw) {
    const value = canonicalPersonLabel(raw);
    if (!value) return false;
    if (/https?:\/\//i.test(value)) return false;
    if (/\.(com|cl|org|net|io|gov|edu)\b/i.test(value)) return false;
    if (value.startsWith("@")) return value.length >= 3;
    if (/\d/.test(value)) return false;

    const key = toNameKey(value);
    if (!key || PERSON_BLACKLIST_KEYS.has(key)) return false;
    if (key.includes("festival de ")) return false;
    if (key.includes("ministerio de ")) return false;
    if (key.includes("fundacion ")) return false;
    if (key.includes("universidad ")) return false;
    if (key.length < 3) return false;

    const words = value.split(/\s+/).filter(Boolean);
    if (!words.length || words.length > 6) return false;

    // Debe tener al menos 1 token con mayúscula inicial real.
    const hasUpperToken = words.some((word) => /^[A-ZÁÉÍÓÚÜÑ]/u.test(word));
    if (!hasUpperToken) return false;

    if (words.length === 1) {
      // Para evitar falsos positivos (Autores, Libro, etc.) solo aceptamos
      // palabra única cuando es handle tipo @usuario.
      return false;
    } else {
      const valid = words.every((word) => {
        const low = normalizeWordToken(word);
        if (PERSON_NAME_PARTICLES.has(low)) return true;
        if (PERSON_BLACKLIST_WORDS.has(low)) return false;
        if (!/^[A-ZÁÉÍÓÚÜÑ][\p{L}'’.-]*$/u.test(word)) return false;
        // Evita siglas o palabras totalmente en mayúsculas tipo ISBNN.
        if (word.length > 2 && word === word.toLocaleUpperCase("es-CL")) return false;
        return true;
      });
      if (!valid) return false;
      const significantWords = words.filter((word) => {
        const low = normalizeWordToken(word);
        return !PERSON_NAME_PARTICLES.has(low);
      });
      if (significantWords.length < 2) return false;
      if (significantWords.some((word) => PERSON_BLACKLIST_WORDS.has(normalizeWordToken(word)))) return false;
    }

    return true;
  }

  function extractPersonCandidates(rawText) {
    const text = String(rawText || "")
      .replace(/\.\s+(?=[A-ZÁÉÍÓÚÜÑ@])/g, "\n")
      .replace(/;\s+(?=[A-ZÁÉÍÓÚÜÑ@])/g, "\n");
    if (!text.trim()) return [];
    const matches = text.match(/@[A-Za-z0-9._-]{2,}|[A-ZÁÉÍÓÚÜÑ][\p{L}'’-]+(?:\s+(?:de|del|la|las|los|y|da|do|dos|van|von|di)\s+[A-ZÁÉÍÓÚÜÑ][\p{L}'’-]+|\s+[A-ZÁÉÍÓÚÜÑ][\p{L}'’-]+){0,3}/gu) || [];
    const out = [];
    const seen = new Set();
    const trimTrailingNoise = (value) => {
      const words = String(value || "").split(/\s+/).filter(Boolean);
      while (words.length) {
        const last = normalizeWordToken(words[words.length - 1]);
        if (!last) {
          words.pop();
          continue;
        }
        if (PERSON_BLACKLIST_WORDS.has(last)) {
          words.pop();
          continue;
        }
        break;
      }
      while (words.length) {
        const last = normalizeWordToken(words[words.length - 1]);
        if (last === "y" || last === "and" || last === "&") {
          words.pop();
          continue;
        }
        break;
      }
      return words.join(" ").trim();
    };
    matches.forEach((match) => {
      const fragments = String(match || "")
        .split(/\s+(?:y|and|&)\s+/i)
        .map((part) => trimTrailingNoise(part))
        .filter(Boolean);
      fragments.forEach((fragment) => {
        const candidate = canonicalPersonLabel(fragment);
        const key = toNameKey(candidate);
        if (!candidate || !key || seen.has(key)) return;
        if (!isLikelyPersonCandidate(candidate)) return;
        seen.add(key);
        out.push(candidate);
      });
    });
    return out;
  }

  function extractPeopleFromCredits(creditsRaw) {
    const list = [];
    const seen = new Set();
    splitCreditSegments(creditsRaw).forEach((segment) => {
      const labeled = extractCreditLabel(segment);
      const source = labeled ? labeled.details : segment;
      extractPersonCandidates(source).forEach((name) => {
        const key = toNameKey(name);
        if (!key || seen.has(key)) return;
        seen.add(key);
        list.push(name);
      });
    });
    return list;
  }

  function deriveProjectPeople(meta, displayAuthor, displayCredits) {
    const people = [];
    const seen = new Set();
    const addPerson = (raw) => {
      const label = canonicalPersonLabel(raw);
      const key = toNameKey(label);
      if (!label || !key || seen.has(key)) return;
      if (!isLikelyPersonCandidate(label)) return;
      seen.add(key);
      people.push(label);
    };

    splitAuthorNames(displayAuthor || meta.author || "").forEach(addPerson);
    extractPeopleFromCredits(displayCredits || meta.collab || "").forEach(addPerson);
    extractPersonCandidates(meta.collab || "").forEach(addPerson);

    return {
      names: people,
      keys: people.map((name) => toNameKey(name)).filter(Boolean)
    };
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeRoleLabel(raw) {
    const key = norm(raw)
      .replace(/[^a-z0-9/&+\s-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!key) return "";
    if (ROLE_ALIASES[key]) return ROLE_ALIASES[key];
    if (key.includes("coautor") || key.includes("co autor")) return "co-author";
    if (key.includes("autor") || key.includes("author")) return "author";
    if (key.includes("fotografia") || key.includes("photo")) return "photographer";
    if (key.includes("ilustr")) return "illustrator";
    if (key.includes("curadur")) return "curator";
    if (key.includes("investig") || key.includes("research")) return "researcher";
    if (key.includes("tipograf") || key.includes("typograph")) return "typographer";
    if (key.includes("iluminacion") || key.includes("lighting")) return "lighting designer";
    if (key.includes("desarrollo web") || key.includes("web development")) return "web developer";
    if (key.includes("guiatura") || key.includes("guia") || key.includes("guide")) return "guide";
    if (key.includes("direction") || key.includes("direccion")) {
      if (key.includes("creative") || key.includes("creativa")) return "creative director";
      if (key.includes("arte") || key.includes("art")) return "art director";
      return "director";
    }
    if (key.includes("editor")) return "editor";
    if (key.includes("produccion") || key.includes("production")) return "producer";
    if (
      key.includes("diseno") ||
      key.includes("design") ||
      key.includes("diagramacion") ||
      key.includes("branding") ||
      key.includes("identidad")
    ) return "designer";
    return "";
  }

  function inferRoleFromTags(rawTags) {
    const tags = Array.isArray(rawTags) ? rawTags : [];
    const keys = tags.map((tag) => norm(tag));
    if (keys.some((k) => k.includes("iluminacion"))) return "lighting designer";
    if (keys.some((k) => k.includes("ilustracion"))) return "illustrator";
    if (keys.some((k) => k.includes("fotografia"))) return "photographer";
    if (keys.some((k) => k.includes("tipografia"))) return "typographer";
    if (keys.some((k) => k.includes("direccion de arte"))) return "art director";
    if (keys.some((k) => k.includes("direccion creativa"))) return "creative director";
    if (keys.some((k) => k.includes("curaduria"))) return "curator";
    if (keys.some((k) => k.includes("investigacion"))) return "researcher";
    if (keys.some((k) => k.includes("desarrollo web") || k === "web")) return "web developer";
    return "";
  }

  function extractCreditLabel(segment) {
    const colonMatch = String(segment || "").match(/^([^:]{2,80}):\s*(.+)$/);
    if (colonMatch) {
      return { label: colonMatch[1].trim(), details: colonMatch[2].trim() };
    }
    const roleMatch = String(segment || "").match(/^(.{2,60}?)\s+(?:por|de)\s+(.+)$/i);
    if (!roleMatch) return null;
    if (!normalizeRoleLabel(roleMatch[1])) return null;
    return { label: roleMatch[1].trim(), details: roleMatch[2].trim() };
  }

  function isLikelyBareNameCredit(segment) {
    const value = String(segment || "").trim();
    if (!value) return false;
    if (value.includes(":")) return false;
    if (/[.;|]/.test(value)) return false;
    if (/\d/.test(value)) return false;
    if (
      /\b(cliente|proyecto|trabajo|desarrollado|realizado|curso|banda|editorial|institucion|institución|fundacion|fundación|universidad|ministerio|isbn|presentado|financiado|encargo|estudio|studio)\b/i.test(value)
    ) return false;
    const tokens = value.split(/\s+/).filter(Boolean);
    if (!tokens.length || tokens.length > 6) return false;
    return tokens.every((token) => /^@?[A-ZÁÉÍÓÚÜÑ][\p{L}'’.\-]*$/u.test(token));
  }

  function normalizeBareCreditSegment(segment) {
    const value = String(segment || "").trim();
    if (!isLikelyBareNameCredit(value)) return value;
    if (/[,&]/.test(value) || /\s+y\s+/i.test(value) || /\s+and\s+/i.test(value)) {
      return `Colaboradores/as: ${value}`;
    }
    return `Colaborador/a: ${value}`;
  }

  function stripAuthorFromCredit(text, authorKeys) {
    let cleaned = norm(text)
      .replace(/[^a-z0-9@]+/g, " ")
      .trim();
    authorKeys.forEach((key) => {
      if (!key || key.length < 4) return;
      cleaned = cleaned.replace(new RegExp(`\\b${escapeRegExp(key)}\\b`, "g"), " ");
    });
    cleaned = cleaned
      .split(/\s+/)
      .filter((token) => token && !CREDIT_STOP_WORDS.has(token))
      .join(" ")
      .trim();
    return cleaned;
  }

  function deriveDisplayPeople(meta) {
    const authorName = cleanAuthorName(meta.author) || "—";
    const manualRoleRaw = String(meta.role || "").replace(/\s+/g, " ").trim();
    const hasManualRole = Boolean(manualRoleRaw);
    const authorKeys = splitAuthorNames(meta.author)
      .map(toNameKey)
      .filter((key) => key.length >= 4);
    const authorRoleMatch = String(meta.author || "").match(/\(([^)]*)\)/);
    let roleCanonical = hasManualRole ? "" : normalizeRoleLabel(meta.role || "");
    if (!hasManualRole && !roleCanonical && authorRoleMatch) {
      roleCanonical = normalizeRoleLabel(authorRoleMatch[1]);
    }

    const credits = [];
    const seenCreditLines = new Set();
    splitCreditSegments(meta.collab).forEach((segment) => {
      const normalizedSegment = toNameKey(segment);
      const segmentHasAuthor = authorKeys.some((name) => normalizedSegment.includes(name));
      const labeled = extractCreditLabel(segment);
      const segmentRole = labeled ? normalizeRoleLabel(labeled.label) : "";

      if (!hasManualRole && !roleCanonical && segmentHasAuthor && segmentRole && segmentRole !== "author") {
        roleCanonical = segmentRole;
      }

      let keepSegment = true;
      if (segmentHasAuthor && segmentRole) {
        const segmentDetails = labeled ? labeled.details : segment;
        const residue = stripAuthorFromCredit(segmentDetails, authorKeys);
        if (!residue) keepSegment = false;
      }
      if (segmentHasAuthor && !labeled) {
        const residue = stripAuthorFromCredit(segment, authorKeys);
        if (!residue) keepSegment = false;
      }

      if (!keepSegment) return;
      const outputSegment = labeled ? segment : normalizeBareCreditSegment(segment);
      const dedupeKey = toNameKey(outputSegment);
      if (!dedupeKey || seenCreditLines.has(dedupeKey)) return;
      seenCreditLines.add(dedupeKey);
      credits.push(outputSegment);
    });

    if (!hasManualRole && (!roleCanonical || roleCanonical === "designer" || roleCanonical === "author")) {
      const tagRole = inferRoleFromTags(meta.tags);
      roleCanonical = tagRole || "designer";
    }
    const roleLabel = hasManualRole
      ? manualRoleRaw
      : roleLabelFromCanonical(roleCanonical, meta.author);

    return {
      author: authorName,
      role: roleLabel,
      credits: credits.join("\n")
    };
  }

  function normalizeProjectTags(p) {
    const people = deriveDisplayPeople(p);
    p.author = people.author || p.author || "—";
    p._displayAuthor = people.author || "—";
    p._displayRole = people.role || "Diseñador/a";
    p._displayCredits = people.credits || "";
    const projectPeople = deriveProjectPeople(p, p._displayAuthor, p._displayCredits);
    p._peopleNames = projectPeople.names;
    p._peopleKeys = projectPeople.keys;

    const rawPrimary = Array.isArray(p.primaryCategories)
      ? p.primaryCategories.slice()
      : (Array.isArray(p.tags) ? p.tags.slice() : []);
    const rawSecondary = Array.isArray(p.secondaryTags) ? p.secondaryTags.slice() : [];
    const rawKeywords = Array.isArray(p.keywords) ? p.keywords.slice() : [];

    const primaryKeys = [];
    const primarySeen = new Set();
    rawPrimary.forEach((t) => {
      const k = canonicalTagKey(t);
      if (!k || primarySeen.has(k)) return;
      primarySeen.add(k);
      primaryKeys.push(k);
    });

    const secondaryKeys = [];
    const secondarySeen = new Set(primaryKeys);
    rawSecondary.forEach((t) => {
      const k = canonicalTagKey(t);
      if (!k || secondarySeen.has(k)) return;
      secondarySeen.add(k);
      secondaryKeys.push(k);
    });

    const keywordValues = rawKeywords
      .map((v) => String(v || "").trim())
      .filter(Boolean);

    // Capa visible (principal)
    p._tagKeys = primaryKeys;
    p.primaryCategories = primaryKeys.map(prettyTag);
    p.tags = p.primaryCategories.slice();

    // Capa no visible (secundaria) para futura expansión y búsqueda.
    p._secondaryTagKeys = secondaryKeys;
    p.secondaryTags = secondaryKeys.map(prettyTag);
    p.keywords = keywordValues;

    // índice de búsqueda (incluye metadatos visibles + secundarios)
    const metadataText = (p.metadata && typeof p.metadata === "object")
      ? Object.values(p.metadata).map((v) => String(v || "")).join(" ")
      : "";
    const hay = [
      p.title || "",
      p.author || "",
      p._displayAuthor || "",
      p._displayRole || "",
      p.area || "",
      p.collab || "",
      p._displayCredits || "",
      p._peopleNames.join(" "),
      p._peopleKeys.join(" "),
      rawPrimary.join(" "),
      rawSecondary.join(" "),
      rawKeywords.join(" "),
      p.tags.join(" "),
      p.secondaryTags.join(" "),
      primaryKeys.join(" "),
      secondaryKeys.join(" "),
      metadataText
    ].join(" ");
    p._search = norm(hay);
  }

    /* Mapeo de labels para categorías (normalizado) */
    const CAT_LABELS = {
      "all": "ALL",
      "editorial": "Editorial",
      "ilustración": "Ilustración",
      "ilustracion": "Ilustración",
      "dirección de arte": "Dirección de arte",
      "direccion de arte": "Dirección de arte",
      "tipografía": "Tipografía",
      "tipografia": "Tipografía",
      "experimental": "Experimental",
      "infantil": "Infantil",
      "impresión": "Impresión",
      "impresion": "Impresión",
      "curaduría": "Curaduría",
      "curaduria": "Curaduría",
      "branding": "Branding",
      "señalética": "Señalética",
      "senaletica": "Señalética",
      "museografía": "Museografía",
      "museografia": "Museografía",
      "web": "Web",
      "ux ui": "UX UI",
      "diseno servicio": "Diseño servicio",
      "espacio": "Espacio",
      "exhibicion": "Exhibición",
      "portada disco": "Portada disco",
      "impreso": "Impreso",
      "textil": "Textil",
      "pub academica": "Pub. Académica",
      "biomateriales": "Biomateriales",
      "artesania": "Artesanía",
      "ux": "UX",
      "ui": "UI",
      "animación": "Animación",
      "animacion": "Animación",
      "fotografía": "Fotografía",
      "fotografia": "Fotografía",
      "moda": "Moda",
      "vestuario": "Vestuario",
      "música": "Música",
      "musica": "Música",
      "gráfico": "Gráfico",
      "grafico": "Gráfico",
      "producto": "Producto",
      "servicio": "Servicio",
      "salud": "Salud",
      "investigación": "Investigación",
      "investigacion": "Investigación",
      "packaging": "Packaging",
      "serigrafía": "Serigrafía",
      "serigrafia": "Serigrafía",
      "industrial": "Industrial",
      "mobiliario": "Mobiliario",
      "espacios": "Espacios",
      "social": "Social",
      "afiche": "Afiche",
      "estilismo": "Estilismo",
      "styling": "Estilismo"
    };

  /* Config desde CSS */
  const getPlanePadding = () => {
    const raw = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--plane-padding'), 10);
    return Number.isFinite(raw) ? raw : 2000;
  };
  let COL_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--colw'));
  let GAP   = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap'));
  let planePadding = getPlanePadding();
  let yTopLimit = -planePadding;
  let yBotLimit = planePadding;
  function resetPlaneLimits() {
    planePadding = getPlanePadding();
    yTopLimit = -planePadding;
    yBotLimit = planePadding;
  }

  /* Cámara 2D */
  let camX = 0, camY = 0;
  let camScale = 1;
  const CAM_SCALE_MAX = 1;
  const CAM_SCALE_MIN = 0.38;
  const CAM_SCALE_STEP = 0.08;
  const CAM_LOD_FAR = 0.56;
  const CAM_LOD_MID = 0.74;
  let viewportWidth = viewport.clientWidth || 0;
  let viewportHeight = viewport.clientHeight || 0;
  const refreshViewportSize = () => {
    viewportWidth = viewport.clientWidth || 0;
    viewportHeight = viewport.clientHeight || 0;
  };
  const clampCamScale = (value) => Math.min(CAM_SCALE_MAX, Math.max(CAM_SCALE_MIN, value));
  let currentLodMode = '';
  const updateBentoLOD = () => {
    if (!plane) return;
    const nextMode = camScale <= CAM_LOD_FAR ? 'far' : (camScale <= CAM_LOD_MID ? 'mid' : 'near');
    if (nextMode === currentLodMode) return;
    currentLodMode = nextMode;
    plane.classList.toggle('is-lod-far', nextMode === 'far');
    plane.classList.toggle('is-lod-mid', nextMode === 'mid');
    plane.classList.toggle('is-lod-near', nextMode === 'near');
  };
  const setInteractionActive = (active) => {
    if (isInteractionActive === active) return;
    isInteractionActive = active;
    if (plane) plane.classList.toggle('is-interacting', active);
  };
  const scheduleInteractionSettle = () => {
    lastInteractionTs = performance.now();
    setInteractionActive(true);
    if (interactionSettleTimer !== null) return;
    const tick = () => {
      const elapsed = performance.now() - lastInteractionTs;
      const remaining = BENTO_INTERACTION_SETTLE_MS - elapsed;
      if (remaining <= 0) {
        interactionSettleTimer = null;
        setInteractionActive(false);
        requestFillAround(false);
        return;
      }
      interactionSettleTimer = setTimeout(tick, Math.min(remaining, BENTO_INTERACTION_SETTLE_MS));
    };
    interactionSettleTimer = setTimeout(tick, BENTO_INTERACTION_SETTLE_MS);
  };
  const applyTransform = ()=> {
    plane.style.transform = `translate3d(${camX}px, ${camY}px, 0) scale(${camScale})`;
    if (activeView === 'bento') updateBentoLOD();
  };

  /* Columnas (masonry por columna) */
  const columns = new Map();
  const ensureColumn = (i)=>{
    if(columns.has(i)) return columns.get(i);
    const x = i*(COL_W+GAP);
    const col = { pos:x, yUp:0, yDown:0 };
    columns.set(i,col); return col;
  };

  /* =================== BASE DE DATOS (solo proyectos reales) =================== */
  const DB = [
    /* ------------- Ignacia Santillán ------------- */
    {
      src: "IMG/webp/001_Santillan_1_42c355fa4f.webp",
      srcAvif: "IMG/avif/001_Santillan_1_42c355fa4f.avif",
      srcSetAvif: "IMG/avif/variants/001_Santillan_1_42c355fa4f-640.avif 640w, IMG/avif/variants/001_Santillan_1_42c355fa4f-1280.avif 1280w, IMG/avif/001_Santillan_1_42c355fa4f.avif 2752w",
      srcSetWebp: "IMG/webp/variants/001_Santillan_1_42c355fa4f-640.webp 640w, IMG/webp/variants/001_Santillan_1_42c355fa4f-1280.webp 1280w, IMG/webp/001_Santillan_1_42c355fa4f.webp 2752w",
      srcOriginal: "IMG/remote-originals/001_Santillan_1.jpg",
      orientation: "v",
      span: 1,
      tags: ["Editorial","Experimental","Fanzine","Objeto editorial","Gráfico"],
      title: "Encontrarse en la forma",
      author: "Ignacia Santillán",
      role: "Diseñadora",
      collab: "",
      area: "Editorial / Experimental / Fanzine / Objeto editorial / Gráfico",
      year: "2022",
      url: "https://www.behance.net/gallery/160223073/encontrarse-en-la-forma"
    },

    /* ------------------ L'uccello — Weichi He (2016) ------------------ */
    {
      src: "IMG/webp/002_2016_Luccello_22d7a1affc.webp",
      srcAvif: "IMG/avif/002_2016_Luccello_22d7a1affc.avif",
      srcSetAvif: "IMG/avif/variants/002_2016_Luccello_22d7a1affc-640.avif 640w, IMG/avif/variants/002_2016_Luccello_22d7a1affc-1280.avif 1280w, IMG/avif/002_2016_Luccello_22d7a1affc.avif 1333w",
      srcSetWebp: "IMG/webp/variants/002_2016_Luccello_22d7a1affc-640.webp 640w, IMG/webp/variants/002_2016_Luccello_22d7a1affc-1280.webp 1280w, IMG/webp/002_2016_Luccello_22d7a1affc.webp 1333w",
      srcOriginal: "IMG/remote-originals/002_2016_Luccello.jpg",
      orientation: "h",
      span: 2,
      tags: ["Identidad visual","Identidad gráfica","branding"],
      title: "L'uccello",
      author: "Weichi He",
      role: "Diseñador",
      collab: "Pablo González",
      area: "Identidad visual / Identidad gráfica / Branding",
      year: "2016",
      url: "https://weichi.works/L-ucello"
    },

    /* ------------------ Max Fett Specimen — Weichi He (2020) ------------------ */
    {
      src: "IMG/webp/003_MaxFett_4_6822b7ea71.webp",
      srcAvif: "IMG/avif/003_MaxFett_4_6822b7ea71.avif",
      srcSetAvif: "IMG/avif/variants/003_MaxFett_4_6822b7ea71-640.avif 640w, IMG/avif/variants/003_MaxFett_4_6822b7ea71-1280.avif 1280w, IMG/avif/003_MaxFett_4_6822b7ea71.avif 2000w",
      srcSetWebp: "IMG/webp/variants/003_MaxFett_4_6822b7ea71-640.webp 640w, IMG/webp/variants/003_MaxFett_4_6822b7ea71-1280.webp 1280w, IMG/webp/003_MaxFett_4_6822b7ea71.webp 2000w",
      srcOriginal: "IMG/remote-originals/003_MaxFett_4.jpg",
      orientation: "v",
      span: 1,
      tags: ["editorial","tipografía","gráfico","impreso"],
      title: "Max Fett Specimen",
      author: "Weichi He",
      role: "Diseñador",
      collab: "Max Fett",
      area: "Editorial / Tipografía / Gráfico / Impreso",
      year: "2020",
      url: "https://weichi.works/Max-Fett-Specimen"
    },

    {
      src: "IMG/webp/004_Santillan_2_81d3dcf105.webp",
      srcAvif: "IMG/avif/004_Santillan_2_81d3dcf105.avif",
      srcSetAvif: "IMG/avif/variants/004_Santillan_2_81d3dcf105-640.avif 640w, IMG/avif/variants/004_Santillan_2_81d3dcf105-1280.avif 1280w, IMG/avif/004_Santillan_2_81d3dcf105.avif 1512w",
      srcSetWebp: "IMG/webp/variants/004_Santillan_2_81d3dcf105-640.webp 640w, IMG/webp/variants/004_Santillan_2_81d3dcf105-1280.webp 1280w, IMG/webp/004_Santillan_2_81d3dcf105.webp 1512w",
      srcOriginal: "IMG/remote-originals/004_Santillan_2.jpg",
      orientation: "v",
      span: 1,
      tags: ["Afiche","Afiche digital","risografía","Gráfico"],
      title: "Me gusta mucho aquí",
      author: "Ignacia Santillán",
      role: "Diseñadora",
      collab: "Malhumor Studio",
      area: "Afiche / Gráfico",
      year: "2025",
      url: "https://www.instagram.com/p/DPEx3F9j9wF/"
    },
    {
      src: "IMG/webp/005_Santillan_3_03b4a917c0.webp",
      srcAvif: "IMG/avif/005_Santillan_3_03b4a917c0.avif",
      srcSetAvif: "IMG/avif/005_Santillan_3_03b4a917c0.avif 438w",
      srcSetWebp: "IMG/webp/005_Santillan_3_03b4a917c0.webp 438w",
      srcOriginal: "IMG/remote-originals/005_Santillan_3.jpg",
      orientation: "v",
      span: 1,
      tags: ["Editorial","Experimental","Fanzine","Objeto editorial","Gráfico"],
      title: "Otras formas de medir el tiempo",
      author: "Ignacia Santillán",
      role: "Diseñadora",
      collab: "Malhumor Studio",
      area: "Editorial / Experimental / Fanzine / Objeto editorial / Gráfico",
      year: "2025",
      url: "https://www.instagram.com/reel/DQ4wuXaD_i9/?igsh=dTFpaWQ2OHgzMTRq"
    },

    /* ------------- Gracia González / FIT ------------- */
    {
      src: "IMG/webp/006_Gonzalez-g_1_558bc87672.webp",
      srcAvif: "IMG/avif/006_Gonzalez-g_1_558bc87672.avif",
      srcSetAvif: "IMG/avif/variants/006_Gonzalez-g_1_558bc87672-640.avif 640w, IMG/avif/variants/006_Gonzalez-g_1_558bc87672-1280.avif 1280w, IMG/avif/006_Gonzalez-g_1_558bc87672.avif 1723w",
      srcSetWebp: "IMG/webp/variants/006_Gonzalez-g_1_558bc87672-640.webp 640w, IMG/webp/variants/006_Gonzalez-g_1_558bc87672-1280.webp 1280w, IMG/webp/006_Gonzalez-g_1_558bc87672.webp 1723w",
      srcOriginal: "IMG/remote-originals/006_Gonzalez-g_1.jpg",
      orientation: "v",
      span: 1,
      tags: ["Editorial","Objeto editorial","Gráfico","Infantil"],
      title: "Rayo de luz",
      author: "Gracia González",
      role: "Diseñadora",
      collab: "",
      area: "Editorial / Infantil",
      year: "2022",
      url: "https://graciastudio.cl/15/"
    },
    {
      src: "IMG/webp/007_gonzalez-g_2_89642b84d8.webp",
      srcAvif: "IMG/avif/007_gonzalez-g_2_89642b84d8.avif",
      srcSetAvif: "IMG/avif/variants/007_gonzalez-g_2_89642b84d8-640.avif 640w, IMG/avif/007_gonzalez-g_2_89642b84d8.avif 984w",
      srcSetWebp: "IMG/webp/variants/007_gonzalez-g_2_89642b84d8-640.webp 640w, IMG/webp/007_gonzalez-g_2_89642b84d8.webp 984w",
      srcOriginal: "IMG/remote-originals/007_gonzalez-g_2.png",
      orientation: "h",
      span: 1,
      tags: ["Identidad visual","Identidad gráfica","branding"],
      title: "Fundación FIT",
      author: "Gracia González",
      role: "Diseñadora",
      collab: "",
      area: "Identidad visual / Branding",
      year: "2025",
      url: "https://graciastudio.cl/68/"
    },

    /* ------------- RETORNO — Andrés Miquel  (2 vistas) ------------- */
    {
      src: "IMG/webp/008_miquel_1_6e94fd42d7.webp",
      srcAvif: "IMG/avif/008_miquel_1_6e94fd42d7.avif",
      srcSetAvif: "IMG/avif/variants/008_miquel_1_6e94fd42d7-640.avif 640w, IMG/avif/variants/008_miquel_1_6e94fd42d7-1280.avif 1280w, IMG/avif/008_miquel_1_6e94fd42d7.avif 1330w",
      srcSetWebp: "IMG/webp/variants/008_miquel_1_6e94fd42d7-640.webp 640w, IMG/webp/variants/008_miquel_1_6e94fd42d7-1280.webp 1280w, IMG/webp/008_miquel_1_6e94fd42d7.webp 1330w",
      srcOriginal: "IMG/remote-originals/008_miquel_1.png",
      orientation: "v",
      span: 2,
      tags: ["Moda","Editorial","fotografía de moda","dirección de arte","vestuario"],
      title: "Retorno",
      author: "Catalina Uribe, Andres Miquel, Fernanda Gutiérrez",
      role: "Directora de arte",
      collab: "Schön! Magazine",
      area: "Editorial / Moda / Vestuario",
      year: "2025",
      url: ["https://www.instagram.com/p/DPO39QgDY3z/?img_index=0", "https://schonmagazine.com/retorno/"]
    },
    {
      src: "IMG/webp/009_Captura-de-pantalla-2025-10-01-a-las-18.22.21_ad4c2ab325.webp",
      srcAvif: "IMG/avif/009_Captura-de-pantalla-2025-10-01-a-las-18.22.21_ad4c2ab325.avif",
      srcSetAvif: "IMG/avif/variants/009_Captura-de-pantalla-2025-10-01-a-las-18.22.21_ad4c2ab325-640.avif 640w, IMG/avif/variants/009_Captura-de-pantalla-2025-10-01-a-las-18.22.21_ad4c2ab325-1280.avif 1280w, IMG/avif/009_Captura-de-pantalla-2025-10-01-a-las-18.22.21_ad4c2ab325.avif 1472w",
      srcSetWebp: "IMG/webp/variants/009_Captura-de-pantalla-2025-10-01-a-las-18.22.21_ad4c2ab325-640.webp 640w, IMG/webp/variants/009_Captura-de-pantalla-2025-10-01-a-las-18.22.21_ad4c2ab325-1280.webp 1280w, IMG/webp/009_Captura-de-pantalla-2025-10-01-a-las-18.22.21_ad4c2ab325.webp 1472w",
      srcOriginal: "IMG/remote-originals/009_Captura-de-pantalla-2025-10-01-a-las-18.22.21.png",
      orientation: "v",
      span: 1,
      tags: ["Moda","Editorial","fotografía de moda","dirección de arte","vestuario"],
      title: "Retorno",
      author: "Andres Miquel, Catalina Uribe, Fernanda Gutiérrez",
      role: "Director de arte",
      collab: "Schön! Magazine",
      area: "Editorial / Moda / Vestuario",
      year: "2025",
      url: ["https://www.instagram.com/p/DPO39QgDY3z/?img_index=1", "https://schonmagazine.com/retorno/"]
    },

    {
      src: "IMG/webp/010_gutierrez-fernanda-1_da83b99fe1.webp",
      srcAvif: "IMG/avif/010_gutierrez-fernanda-1_da83b99fe1.avif",
      srcSetAvif: "IMG/avif/variants/010_gutierrez-fernanda-1_da83b99fe1-640.avif 640w, IMG/avif/010_gutierrez-fernanda-1_da83b99fe1.avif 828w",
      srcSetWebp: "IMG/webp/variants/010_gutierrez-fernanda-1_da83b99fe1-640.webp 640w, IMG/webp/010_gutierrez-fernanda-1_da83b99fe1.webp 828w",
      srcOriginal: "IMG/remote-originals/010_gutierrez-fernanda-1.jpg",
      orientation: "v",
      span: 1,
      tags: ["Moda","Editorial","fotografía de moda","dirección de arte","vestuario"],
      title: "Retorno",
      author: "Fernanda Gutiérrez, Andres Miquel, Catalina Uribe",
      role: "Directora de arte",
      collab: "Schön! Magazine",
      area: "Editorial / Moda / Vestuario",
      year: "2025",
      url: ["https://www.instagram.com/p/DPO39QgDY3z/?img_index=1", "https://schonmagazine.com/retorno/"]
    },
    /* ------------- Paula Santa María ------------- */
    {
      src: "IMG/webp/011_santa-maria_1_d25c25a850.webp",
      srcAvif: "IMG/avif/011_santa-maria_1_d25c25a850.avif",
      srcSetAvif: "IMG/avif/variants/011_santa-maria_1_d25c25a850-640.avif 640w, IMG/avif/variants/011_santa-maria_1_d25c25a850-1280.avif 1280w, IMG/avif/011_santa-maria_1_d25c25a850.avif 1962w",
      srcSetWebp: "IMG/webp/variants/011_santa-maria_1_d25c25a850-640.webp 640w, IMG/webp/variants/011_santa-maria_1_d25c25a850-1280.webp 1280w, IMG/webp/011_santa-maria_1_d25c25a850.webp 1962w",
      srcOriginal: "IMG/remote-originals/011_santa-maria_1.jpg",
      orientation: "h",
      span: 2,
      tags: ["Videojuego","animación","arte"],
      title: "A Life in a Year",
      author: "Paula Santa María",
      role: "Diseñadora",
      collab: "",
      area: "Videojuego / Animación / Arte",
      year: "2024",
      url: "https://paulasantamaria.netlify.app/"
    },

    /* ------------- Bombus Chilensis ------------- */
    {
      src: "IMG/webp/012_Pinto_1_4aae3852b5.webp",
      srcAvif: "IMG/avif/012_Pinto_1_4aae3852b5.avif",
      srcSetAvif: "IMG/avif/variants/012_Pinto_1_4aae3852b5-640.avif 640w, IMG/avif/variants/012_Pinto_1_4aae3852b5-1280.avif 1280w, IMG/avif/012_Pinto_1_4aae3852b5.avif 2042w",
      srcSetWebp: "IMG/webp/variants/012_Pinto_1_4aae3852b5-640.webp 640w, IMG/webp/variants/012_Pinto_1_4aae3852b5-1280.webp 1280w, IMG/webp/012_Pinto_1_4aae3852b5.webp 2042w",
      srcOriginal: "IMG/remote-originals/012_Pinto_1.jpg",
      orientation: "h",
      span: 2,
      tags: ["Audiovisual","animación","stop-motion","Teatro"],
      title: "Bombus Chilensis",
      author: "María Jesús Pinto, Victoria De la Maza",
      role: "Diseñadora",
      collab: "",
      area: "Audiovisual / Animación / Teatro",
      year: "2023",
      url: [
        "https://www.instagram.com/bombuschilensis",
        "https://www.behance.net/gallery/204989195/Bombus-Chilensis"
      ]
    },

    /* ------------- Matías Vial / Il mato ------------- */
    {
      src: "IMG/webp/013_ilmato_1_1b04858ba7.webp",
      srcAvif: "IMG/avif/013_ilmato_1_1b04858ba7.avif",
      srcSetAvif: "IMG/avif/variants/013_ilmato_1_1b04858ba7-640.avif 640w, IMG/avif/013_ilmato_1_1b04858ba7.avif 1256w",
      srcSetWebp: "IMG/webp/variants/013_ilmato_1_1b04858ba7-640.webp 640w, IMG/webp/013_ilmato_1_1b04858ba7.webp 1256w",
      srcOriginal: "IMG/remote-originals/013_ilmato_1.jpg",
      orientation: "v",
      span: 1,
      tags: ["dirección creativa","fotografía","gráfico"],
      title: "Misc",
      author: "Matías Vial",
      role: "Diseñador",
      collab: "Il Mato",
      area: "Dirección creativa / Fotografía",
      year: "2022",
      url: "https://ilmato.com/paloma-mami-1"
    },
    /* ------------------ Acuerdo de Escazú — Carolina Pinochet ------------------ */
{
  src: "IMG/webp/014_Pinochet-Carolina-Captura-de-pantalla-2026-03-10-a-las-19.38.36_3d8d79867c.webp",
  srcAvif: "IMG/avif/014_Pinochet-Carolina-Captura-de-pantalla-2026-03-10-a-las-19.38.36_3d8d79867c.avif",
  srcSetAvif: "IMG/avif/variants/014_Pinochet-Carolina-Captura-de-pantalla-2026-03-10-a-las-19.38.36_3d8d79867c-640.avif 640w, IMG/avif/014_Pinochet-Carolina-Captura-de-pantalla-2026-03-10-a-las-19.38.36_3d8d79867c.avif 1276w",
  srcSetWebp: "IMG/webp/variants/014_Pinochet-Carolina-Captura-de-pantalla-2026-03-10-a-las-19.38.36_3d8d79867c-640.webp 640w, IMG/webp/014_Pinochet-Carolina-Captura-de-pantalla-2026-03-10-a-las-19.38.36_3d8d79867c.webp 1276w",
  srcOriginal: "IMG/remote-originals/014_Pinochet-Carolina-Captura-de-pantalla-2026-03-10-a-las-19.38.36.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Acuerdo de Escazú",
  author: "Carolina Pinochet",
  role: "Diseñadora/directora",
  collab: "Trabajo para Ministerio de Medio Ambiente. Proyecto desarrollado en Estudio Postal",
  area: "Branding / Identidad visual / Gráfico",
  year: "2023",
  url: "https://www.estudiopostal.cl/portfolio-collections/ilustracion/acuerdo-de-escazu"
},

/* ------------------ Agenda Palpa — Macarena Valdés Domínguez ------------------ */
{
  src: "IMG/webp/015_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.00.33_017b0820ea.webp",
  srcAvif: "IMG/avif/015_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.00.33_017b0820ea.avif",
  srcSetAvif: "IMG/avif/variants/015_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.00.33_017b0820ea-640.avif 640w, IMG/avif/variants/015_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.00.33_017b0820ea-1280.avif 1280w, IMG/avif/015_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.00.33_017b0820ea.avif 1992w",
  srcSetWebp: "IMG/webp/variants/015_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.00.33_017b0820ea-640.webp 640w, IMG/webp/variants/015_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.00.33_017b0820ea-1280.webp 1280w, IMG/webp/015_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.00.33_017b0820ea.webp 1992w",
  srcOriginal: "IMG/remote-originals/015_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.00.33.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","editorial","gráfico"],
  title: "Agenda Palpa",
  author: "Macarena Valdés Domínguez",
  role: "Diseñadora",
  collab: "Proyecto desarrollado en Qüina Studio",
  area: "Ilustración / Editorial / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/216455243/Agenda-Palpa-2025"
},

/* ------------------ La Roi (Packaging) — Macarena Valdés Domínguez ------------------ */
{
  src: "IMG/webp/016_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.02.56_748b960456.webp",
  srcAvif: "IMG/avif/016_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.02.56_748b960456.avif",
  srcSetAvif: "IMG/avif/variants/016_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.02.56_748b960456-640.avif 640w, IMG/avif/variants/016_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.02.56_748b960456-1280.avif 1280w, IMG/avif/016_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.02.56_748b960456.avif 1994w",
  srcSetWebp: "IMG/webp/variants/016_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.02.56_748b960456-640.webp 640w, IMG/webp/variants/016_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.02.56_748b960456-1280.webp 1280w, IMG/webp/016_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.02.56_748b960456.webp 1994w",
  srcOriginal: "IMG/remote-originals/016_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.02.56.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico","packaging"],
  title: "La Roi",
  author: "Macarena Valdés Domínguez",
  role: "Diseñadora",
  collab: "Proyecto desarrollado en Qüina Studio",
  area: "Ilustración / Gráfico / Packaging",
  year: "2024",
  url: "https://www.behance.net/gallery/199970619/Diseno-de-packaging-Chocolate-Le-Roi-Chocolat"
},

/* ------------------ EMG-One — Franco Gnecco ------------------ */
{
  src: "IMG/webp/017_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.17.16_4ad0ef69d3.webp",
  srcAvif: "IMG/avif/017_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.17.16_4ad0ef69d3.avif",
  srcSetAvif: "IMG/avif/variants/017_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.17.16_4ad0ef69d3-640.avif 640w, IMG/avif/variants/017_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.17.16_4ad0ef69d3-1280.avif 1280w, IMG/avif/017_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.17.16_4ad0ef69d3.avif 1692w",
  srcSetWebp: "IMG/webp/variants/017_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.17.16_4ad0ef69d3-640.webp 640w, IMG/webp/variants/017_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.17.16_4ad0ef69d3-1280.webp 1280w, IMG/webp/017_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.17.16_4ad0ef69d3.webp 1692w",
  srcOriginal: "IMG/remote-originals/017_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.17.16.png",
  orientation: "sq",
  span: 1,
  tags: ["producto","industrial","salud"],
  title: "EMG-One",
  author: "Franco Gnecco",
  role: "Diseñador",
  collab: "Equipo: Lorena O’Ryan, Alejandro Durán, Franco Gnecco",
  area: "Producto / Industrial / Salud",
  year: "2025",
  url: "https://www.instagram.com/p/DKD2iZENyWz/?img_index=1"
},

/* ------------------ Materia Lignum — Catalina Fuenzalida ------------------ */
{
  src: "IMG/webp/018_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.23.25_204b8fd396.webp",
  srcAvif: "IMG/avif/018_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.23.25_204b8fd396.avif",
  srcSetAvif: "IMG/avif/variants/018_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.23.25_204b8fd396-640.avif 640w, IMG/avif/018_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.23.25_204b8fd396.avif 1062w",
  srcSetWebp: "IMG/webp/variants/018_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.23.25_204b8fd396-640.webp 640w, IMG/webp/018_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.23.25_204b8fd396.webp 1062w",
  srcOriginal: "IMG/remote-originals/018_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.23.25.png",
  orientation: "h",
  span: 2,
  tags: ["museografía","exhibición","investigación","biomaterial"],
  title: "Materia Lignum",
  author: "Catalina Fuenzalida",
  role: "Diseñadora/investigadora",
  collab: "Desarrollado por Spectro Studio, conformado por Franco Gnecco, Damian Araos y Catalina Fuenzalida",
  area: "Museografía / Exhibición / Investigación / Biomaterial",
  year: "2024",
  url: "https://www.instagram.com/p/C3770iKu8ye/?img_index=1"
},

/* ------------------ Materia Lignum — Franco Gnecco ------------------ */
{
  src: "IMG/webp/019_Fuenzalida-Catalina-Captura-de-pantalla-2026-03-11-a-las-10.23.05_9c77fc2d40.webp",
  srcAvif: "IMG/avif/019_Fuenzalida-Catalina-Captura-de-pantalla-2026-03-11-a-las-10.23.05_9c77fc2d40.avif",
  srcSetAvif: "IMG/avif/variants/019_Fuenzalida-Catalina-Captura-de-pantalla-2026-03-11-a-las-10.23.05_9c77fc2d40-640.avif 640w, IMG/avif/019_Fuenzalida-Catalina-Captura-de-pantalla-2026-03-11-a-las-10.23.05_9c77fc2d40.avif 1044w",
  srcSetWebp: "IMG/webp/variants/019_Fuenzalida-Catalina-Captura-de-pantalla-2026-03-11-a-las-10.23.05_9c77fc2d40-640.webp 640w, IMG/webp/019_Fuenzalida-Catalina-Captura-de-pantalla-2026-03-11-a-las-10.23.05_9c77fc2d40.webp 1044w",
  srcOriginal: "IMG/remote-originals/019_Fuenzalida-Catalina-Captura-de-pantalla-2026-03-11-a-las-10.23.05.png",
  orientation: "h",
  span: 1,
  tags: ["museografía","exhibición","investigación","biomaterial"],
  title: "Materia Lignum",
  author: "Franco Gnecco",
  role: "Diseñador/investigador",
  collab: "Desarrollado por Spectro Studio, conformado por Franco Gnecco, Damian Araos y Catalina Fuenzalida",
  area: "Museografía / Exhibición / Investigación / Biomaterial",
  year: "2024",
  url: "https://www.instagram.com/p/C3770iKu8ye/?img_index=1"
},

/* ------------------ Materia Lignum — Damian Araos ------------------ */
{
  src: "IMG/webp/020_Araos-Damina-Captura-de-pantalla-2026-03-11-a-las-10.20.21_763badebb1.webp",
  srcAvif: "IMG/avif/020_Araos-Damina-Captura-de-pantalla-2026-03-11-a-las-10.20.21_763badebb1.avif",
  srcSetAvif: "IMG/avif/variants/020_Araos-Damina-Captura-de-pantalla-2026-03-11-a-las-10.20.21_763badebb1-640.avif 640w, IMG/avif/variants/020_Araos-Damina-Captura-de-pantalla-2026-03-11-a-las-10.20.21_763badebb1-1280.avif 1280w, IMG/avif/020_Araos-Damina-Captura-de-pantalla-2026-03-11-a-las-10.20.21_763badebb1.avif 1768w",
  srcSetWebp: "IMG/webp/variants/020_Araos-Damina-Captura-de-pantalla-2026-03-11-a-las-10.20.21_763badebb1-640.webp 640w, IMG/webp/variants/020_Araos-Damina-Captura-de-pantalla-2026-03-11-a-las-10.20.21_763badebb1-1280.webp 1280w, IMG/webp/020_Araos-Damina-Captura-de-pantalla-2026-03-11-a-las-10.20.21_763badebb1.webp 1768w",
  srcOriginal: "IMG/remote-originals/020_Araos-Damina-Captura-de-pantalla-2026-03-11-a-las-10.20.21.png",
  orientation: "h",
  span: 1,
  tags: ["museografía","exhibición","investigación","biomaterial"],
  title: "Materia Lignum",
  author: "Damian Araos",
  role: "Diseñador/investigador",
  collab: "Desarrollado por Spectro Studio, conformado por Franco Gnecco, Damian Araos y Catalina Fuenzalida",
  area: "Museografía / Exhibición / Investigación / Biomaterial",
  year: "2024",
  url: "https://www.instagram.com/p/C3770iKu8ye/?img_index=1"
},

/* ------------------ Cómo diseñar una revolución. La vía chilena al diseño — Yazmin Jiménez ------------------ */
{
  src: "IMG/webp/021_Banner-web-_-Lanzamiento-de-libro-CDUR-scaled_c3dc609357.webp",
  srcAvif: "IMG/avif/021_Banner-web-_-Lanzamiento-de-libro-CDUR-scaled_c3dc609357.avif",
  srcSetAvif: "IMG/avif/variants/021_Banner-web-_-Lanzamiento-de-libro-CDUR-scaled_c3dc609357-640.avif 640w, IMG/avif/variants/021_Banner-web-_-Lanzamiento-de-libro-CDUR-scaled_c3dc609357-1280.avif 1280w, IMG/avif/021_Banner-web-_-Lanzamiento-de-libro-CDUR-scaled_c3dc609357.avif 2560w",
  srcSetWebp: "IMG/webp/variants/021_Banner-web-_-Lanzamiento-de-libro-CDUR-scaled_c3dc609357-640.webp 640w, IMG/webp/variants/021_Banner-web-_-Lanzamiento-de-libro-CDUR-scaled_c3dc609357-1280.webp 1280w, IMG/webp/021_Banner-web-_-Lanzamiento-de-libro-CDUR-scaled_c3dc609357.webp 2560w",
  srcOriginal: "IMG/remote-originals/021_Banner-web-_-Lanzamiento-de-libro-CDUR-scaled.jpg",
  orientation: "h",
  span: 2,
  tags: ["editorial","investigación","exposición"],
  title: "Cómo diseñar una revolución. La vía chilena al diseño",
  author: "Yazmin Jiménez",
  role: "Diseñadora",
  collab: "Autores: Eden Medina, Pedro Ignacio Alonso, Hugo Palmarola. Diseño: Yazmín González. Editores: Lars Müller Publishers",
  area: "Editorial / Investigación / Exposición",
  year: "2023",
  url: ["https://www.behance.net/gallery/233641951/Libro-Como-disenar-una-revolucion","https://www.cclm.cl/exposicion/como-disenar-una-revolucion/"]
},

/* ------------------ Cómo diseñar una revolución. La vía chilena al diseño — Pedro Álvarez ------------------ */
{
  src: "IMG/webp/022_153819_4051bd4c94.webp",
  srcAvif: "IMG/avif/022_153819_4051bd4c94.avif",
  srcSetAvif: "IMG/avif/variants/022_153819_4051bd4c94-640.avif 640w, IMG/avif/022_153819_4051bd4c94.avif 643w",
  srcSetWebp: "IMG/webp/variants/022_153819_4051bd4c94-640.webp 640w, IMG/webp/022_153819_4051bd4c94.webp 643w",
  srcOriginal: "IMG/remote-originals/022_153819.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial","investigación","exposición"],
  title: "Cómo diseñar una revolución. La vía chilena al diseño",
  author: "Pedro Álvarez",
  role: "Investigador/editor",
  collab: "Autores: Eden Medina, Pedro Ignacio Alonso, Hugo Palmarola. Diseño: Yazmín González. Editores: Lars Müller Publishers",
  area: "Editorial / Investigación / Exposición",
  year: "2023",
  url: "https://www.cclm.cl/exposicion/como-disenar-una-revolucion/"
},
/* ------------------ Escuela Global — Dominga Olavarría Schuh ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-17-a-las-12.34.04_c1eeee34d9.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-17-a-las-12.34.04_c1eeee34d9.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-12.34.04_c1eeee34d9-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-12.34.04_c1eeee34d9-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-17-a-las-12.34.04_c1eeee34d9.avif 1914w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-12.34.04_c1eeee34d9-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-12.34.04_c1eeee34d9-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-17-a-las-12.34.04_c1eeee34d9.webp 1914w",
  srcOriginal: "https://freight.cargo.site/t/original/i/M2846130404079476651128609256131/Captura-de-pantalla-2026-03-17-a-las-12.34.04.png",
  orientation: "h",
  span: 1,
  tags: ["branding", "gráfico", "educación"],
  title: "Escuela Global",
  author: "Dominga Olavarría Schuh",
  role: "",
  collab: "",
  area: "Branding / Gráfico / Educación",
  year: "2023",
  url: "https://www.behance.net/gallery/182285675/Brand-Identity"
},

/* ------------------ Puente Textil — Josefina Boggio ------------------ */
{
  src: "IMG/webp/7798fa4f-b5cf-4c01-8e91-fc3043244124_rw_3840_b6cd6fe345.webp",
  srcAvif: "IMG/avif/7798fa4f-b5cf-4c01-8e91-fc3043244124_rw_3840_b6cd6fe345.avif",
  srcSetAvif: "IMG/avif/variants/7798fa4f-b5cf-4c01-8e91-fc3043244124_rw_3840_b6cd6fe345-640.avif 640w, IMG/avif/variants/7798fa4f-b5cf-4c01-8e91-fc3043244124_rw_3840_b6cd6fe345-1280.avif 1280w, IMG/avif/7798fa4f-b5cf-4c01-8e91-fc3043244124_rw_3840_b6cd6fe345.avif 3840w",
  srcSetWebp: "IMG/webp/variants/7798fa4f-b5cf-4c01-8e91-fc3043244124_rw_3840_b6cd6fe345-640.webp 640w, IMG/webp/variants/7798fa4f-b5cf-4c01-8e91-fc3043244124_rw_3840_b6cd6fe345-1280.webp 1280w, IMG/webp/7798fa4f-b5cf-4c01-8e91-fc3043244124_rw_3840_b6cd6fe345.webp 3840w",
  srcOriginal: "https://freight.cargo.site/t/original/i/H2846130182626314046245442106051/7798fa4f-b5cf-4c01-8e91-fc3043244124_rw_3840.jpg",
  orientation: "v",
  span: 1,
  tags: ["exhibición", "cultura", "experiencia"],
  title: "Puente Textil",
  author: "Josefina Boggio",
  role: "",
  collab: "Proyecto de título",
  area: "Exhibición / Cultura / Experiencia",
  year: "2025",
  url: "https://josefinaboggio.myportfolio.com/copy-of-habitar-cuerpos-reales"
},

/* ------------------ ARQUEOLOGÍA PERSONAL — Josefina Boggio ------------------ */
{
  src: "IMG/webp/e83bcadd-da64-44da-a493-c8dacd67f9a0_4cf2db79e1.webp",
  srcAvif: "IMG/avif/e83bcadd-da64-44da-a493-c8dacd67f9a0_4cf2db79e1.avif",
  srcSetAvif: "IMG/avif/variants/e83bcadd-da64-44da-a493-c8dacd67f9a0_4cf2db79e1-640.avif 640w, IMG/avif/variants/e83bcadd-da64-44da-a493-c8dacd67f9a0_4cf2db79e1-1280.avif 1280w, IMG/avif/e83bcadd-da64-44da-a493-c8dacd67f9a0_4cf2db79e1.avif 2854w",
  srcSetWebp: "IMG/webp/variants/e83bcadd-da64-44da-a493-c8dacd67f9a0_4cf2db79e1-640.webp 640w, IMG/webp/variants/e83bcadd-da64-44da-a493-c8dacd67f9a0_4cf2db79e1-1280.webp 1280w, IMG/webp/e83bcadd-da64-44da-a493-c8dacd67f9a0_4cf2db79e1.webp 2854w",
  srcOriginal: "https://freight.cargo.site/t/original/i/N2846130182700101022540280312515/e83bcadd-da64-44da-a493-c8dacd67f9a0.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial", "cultura"],
  title: "ARQUEOLOGÍA PERSONAL",
  author: "Josefina Boggio",
  role: "",
  collab: "",
  area: "Editorial / Cultura",
  year: "2023",
  url: "https://josefinaboggio.myportfolio.com/arqueologia-personal"
},

/* ------------------ Memoria Luz que Enseña — Alejandra Garcia Huidobro ------------------ */
{
  src: "IMG/webp/IMGP0054_2x_c90616a1c6.webp",
  srcAvif: "IMG/avif/IMGP0054_2x_c90616a1c6.avif",
  srcSetAvif: "IMG/avif/variants/IMGP0054_2x_c90616a1c6-640.avif 640w, IMG/avif/variants/IMGP0054_2x_c90616a1c6-1280.avif 1280w, IMG/avif/IMGP0054_2x_c90616a1c6.avif 1340w",
  srcSetWebp: "IMG/webp/variants/IMGP0054_2x_c90616a1c6-640.webp 640w, IMG/webp/variants/IMGP0054_2x_c90616a1c6-1280.webp 1280w, IMG/webp/IMGP0054_2x_c90616a1c6.webp 1340w",
  srcOriginal: "https://freight.cargo.site/t/original/i/C2846130182681654278466570760899/IMGP0054_2x.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial", "cultura"],
  title: "Memoria Luz que Enseña",
  author: "Alejandra Garcia Huidobro",
  role: "",
  collab: "",
  area: "Editorial / Cultura",
  year: "2014",
  url: "https://cargocollective.com/alegarciahuidobro/MEMORIA-LUZ-QUE-ENSENA"
},

/* ------------------ Luz que enseña — Alejandra Garcia Huidobro ------------------ */
{
  src: "IMG/webp/1_2x_9e75ce3af0.webp",
  srcAvif: "IMG/avif/1_2x_9e75ce3af0.avif",
  srcSetAvif: "IMG/avif/variants/1_2x_9e75ce3af0-640.avif 640w, IMG/avif/variants/1_2x_9e75ce3af0-1280.avif 1280w, IMG/avif/1_2x_9e75ce3af0.avif 1340w",
  srcSetWebp: "IMG/webp/variants/1_2x_9e75ce3af0-640.webp 640w, IMG/webp/variants/1_2x_9e75ce3af0-1280.webp 1280w, IMG/webp/1_2x_9e75ce3af0.webp 1340w",
  srcOriginal: "https://freight.cargo.site/t/original/i/W2846130182663207534392861209283/1_2x.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial", "cultura"],
  title: "Luz que enseña",
  author: "Alejandra Garcia Huidobro",
  role: "",
  collab: "",
  area: "Editorial / Cultura",
  year: "2014",
  url: "https://cargocollective.com/alegarciahuidobro/LUZ-QUE-ENSENA"
},

/* ------------------ Protagonistas en Palabras — Lucas Góngora Rocha ------------------ */
{
  src: "IMG/webp/95962b21-1d6f-4e7b-b9a1-0492feaca812_rw_1920_52c6a88d34.webp",
  srcAvif: "IMG/avif/95962b21-1d6f-4e7b-b9a1-0492feaca812_rw_1920_52c6a88d34.avif",
  srcSetAvif: "IMG/avif/variants/95962b21-1d6f-4e7b-b9a1-0492feaca812_rw_1920_52c6a88d34-640.avif 640w, IMG/avif/variants/95962b21-1d6f-4e7b-b9a1-0492feaca812_rw_1920_52c6a88d34-1280.avif 1280w, IMG/avif/95962b21-1d6f-4e7b-b9a1-0492feaca812_rw_1920_52c6a88d34.avif 1920w",
  srcSetWebp: "IMG/webp/variants/95962b21-1d6f-4e7b-b9a1-0492feaca812_rw_1920_52c6a88d34-640.webp 640w, IMG/webp/variants/95962b21-1d6f-4e7b-b9a1-0492feaca812_rw_1920_52c6a88d34-1280.webp 1280w, IMG/webp/95962b21-1d6f-4e7b-b9a1-0492feaca812_rw_1920_52c6a88d34.webp 1920w",
  srcOriginal: "https://freight.cargo.site/t/original/i/J2846130182644760790319151657667/95962b21-1d6f-4e7b-b9a1-0492feaca812_rw_1920.jpg",
  orientation: "h",
  span: 1,
  tags: ["servicio", "editorial", "educación"],
  title: "Protagonistas en Palabras",
  author: "Lucas Góngora Rocha",
  role: "",
  collab: "Desarrollado en conjunto: Andrés Navarro, Denisse Hernández, Javiera Sánchez, Magdalena Manríquez, Martín Cáceres, Michelle Serni y Ximena Silva.",
  area: "Servicio / Editorial / Educación",
  year: "2025",
  url: "https://lucasgongorarocha.myportfolio.com/protagonistas-en-palabras-1"
},

/* ------------------ LA MADRE DEL CORDERO — María Cristina Adasme ------------------ */
{
  src: "IMG/webp/SET_b3dd6026fd.webp",
  srcAvif: "IMG/avif/SET_b3dd6026fd.avif",
  srcSetAvif: "IMG/avif/variants/SET_b3dd6026fd-640.avif 640w, IMG/avif/SET_b3dd6026fd.avif 670w",
  srcSetWebp: "IMG/webp/variants/SET_b3dd6026fd-640.webp 640w, IMG/webp/SET_b3dd6026fd.webp 670w",
  srcOriginal: "https://freight.cargo.site/t/original/i/J2846188941944102492891972580035/SET.png",
  orientation: "h",
  span: 1,
  tags: ["afiche", "ilustración", "gráfico"],
  title: "LA MADRE DEL CORDERO",
  author: "María Cristina Adasme",
  role: "Diseñadora / Ilustradora",
  collab: "Película dirigida por Diego Ayala y Aníbal Jofré. Ilustraciones y gráficas para afiches por: María Cristina Adasme.",
  area: "Afiche / Ilustración / Gráfico",
  year: "2014",
  url: "https://cargocollective.com/mariacristo/LA-MADRE-DEL-CORDERO"
},

/* ------------------ Volantín Cortao — María Cristina Adasme ------------------ */
{
  src: "IMG/webp/poster_volantin_horizontal_670_4d4bdd55b5.webp",
  srcAvif: "IMG/avif/poster_volantin_horizontal_670_4d4bdd55b5.avif",
  srcSetAvif: "IMG/avif/variants/poster_volantin_horizontal_670_4d4bdd55b5-640.avif 640w, IMG/avif/poster_volantin_horizontal_670_4d4bdd55b5.avif 670w",
  srcSetWebp: "IMG/webp/variants/poster_volantin_horizontal_670_4d4bdd55b5-640.webp 640w, IMG/webp/poster_volantin_horizontal_670_4d4bdd55b5.webp 670w",
  srcOriginal: "https://freight.cargo.site/t/original/i/Y2846188941925655748818263028419/poster_volantin_horizontal_670.png",
  orientation: "h",
  span: 1,
  tags: ["afiche", "ilustración", "gráfico"],
  title: "Volantín Cortao",
  author: "María Cristina Adasme",
  role: "Diseñadora / Ilustradora",
  collab: "Película co-dirigida por Enrique Farías y Rosario Espinosa. Ilustraciones y gráficas para afiches por: María Cristina Adasme.",
  area: "Afiche / Ilustración / Gráfico",
  year: "2013",
  url: "https://cargocollective.com/mariacristo/VOLANTIN-CORTAO"
},

/* ------------------ 50 años después: Golpe en la memoria — María Cristina Adasme ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.19.19_44240ad115.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.19.19_44240ad115.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.19.19_44240ad115-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.19.19_44240ad115-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.19.19_44240ad115.avif 1746w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.19.19_44240ad115-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.19.19_44240ad115-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.19.19_44240ad115.webp 1746w",
  srcOriginal: "https://freight.cargo.site/t/original/i/N2846189121486262562307038458563/Captura-de-pantalla-2026-03-18-a-las-15.19.19.png",
  orientation: "h",
  span: 1,
  tags: ["museografía", "exhibición"],
  title: "50 años después: Golpe en la memoria",
  author: "María Cristina Adasme",
  role: "",
  collab: "Desarrollado en Segundo Nombre. Museografía: Paulina Montero y Nicolás Maturana. Diseño gráfico: Mayela Cerda @mayyyela y Leonor Tapia @leonor_th. Construcción y producción: Cromolux @cromolux_fg y Amaya Rojas @amayarojasarnal.",
  area: "Museografía / Exhibición",
  year: "2023",
  url: "https://www.instagram.com/p/DAjJHymu9Ds/?img_index=1"
},

/* ------------------ Variations 1 and 2 for Chanting vessels project — leonor tapia ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.59.04_8c12ca3eed.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.59.04_8c12ca3eed.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.59.04_8c12ca3eed-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.59.04_8c12ca3eed.avif 1180w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.59.04_8c12ca3eed-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.59.04_8c12ca3eed.webp 1180w",
  srcOriginal: "https://freight.cargo.site/t/original/i/H2846191855072373357178073330371/Captura-de-pantalla-2026-03-18-a-las-15.59.04.png",
  orientation: "h",
  span: 1,
  tags: ["diseño conceptual", "artesanía", "3D"],
  title: "Variations 1 and 2 for Chanting vessels project",
  author: "leonor tapia",
  role: "",
  collab: "",
  area: "Diseño conceptual / Artesanía / 3D",
  year: "2022",
  url: "https://www.instagram.com/p/CaC9y0wvtCh/"
},

/* ------------------ Sin Nombre — leonor tapia ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.22.17_7de3d24fbf.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.22.17_7de3d24fbf.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.22.17_7de3d24fbf-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.22.17_7de3d24fbf-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.22.17_7de3d24fbf.avif 1700w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.22.17_7de3d24fbf-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.22.17_7de3d24fbf-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.22.17_7de3d24fbf.webp 1700w",
  srcOriginal: "https://freight.cargo.site/t/original/i/Y2846189121633836514896714871491/Captura-de-pantalla-2026-03-18-a-las-15.22.17.png",
  orientation: "h",
  span: 1,
  tags: ["diseño conceptual", "artesanía", "3D"],
  title: "Sin Nombre",
  author: "leonor tapia",
  role: "",
  collab: "",
  area: "Diseño conceptual / Artesanía / 3D",
  year: "2022",
  url: "https://www.instagram.com/p/CaU1C_8li6x/"
},

/* ------------------ Tótem, Fuente para Abejas — Lucas Margotta ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.28.05_115e375ff4.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.28.05_115e375ff4.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.28.05_115e375ff4-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.28.05_115e375ff4.avif 1166w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.28.05_115e375ff4-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.28.05_115e375ff4.webp 1166w",
  srcOriginal: "https://freight.cargo.site/t/original/i/W2846189121615389770823005319875/Captura-de-pantalla-2026-03-18-a-las-15.28.05.png",
  orientation: "h",
  span: 1,
  tags: ["objeto", "artesanía", "exhibición"],
  title: "Tótem, Fuente para Abejas",
  author: "Lucas Margotta",
  role: "Diseñador",
  collab: "Desarrollado en Sistema Simple Studio",
  area: "Objeto / Artesanía / Exhibición",
  year: "2022",
  url: "https://www.instagram.com/p/CmFX14AJcVT/?img_index=2"
},

/* ------------------ Pabellón de Chile / London Design Biennale 2021 — Lucas Margotta ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.30.17_40e84b9dba.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.30.17_40e84b9dba.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.30.17_40e84b9dba-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.30.17_40e84b9dba-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.30.17_40e84b9dba.avif 1380w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.30.17_40e84b9dba-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.30.17_40e84b9dba-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.30.17_40e84b9dba.webp 1380w",
  srcOriginal: "https://freight.cargo.site/t/original/i/P2846189121596943026749295768259/Captura-de-pantalla-2026-03-18-a-las-15.30.17.png",
  orientation: "h",
  span: 1,
  tags: ["exhibición", "cultura", "experiencia"],
  title: "Pabellón de Chile / London Design Biennale 2021. ‘Resonancias Tectónicas desde el Sur: Del diseño centrado en el usuario al diseño orientado en el planeta’.",
  author: "Lucas Margotta",
  role: "Diseñador / Sistema SimpleStudio",
  collab: "Proyecto desarrollado por Marcos Chilet, Pablo Hermansen, Carola Ureta, Martin Tironi. En colaboración con Macarena Irarrázaval, Sistema Simple Studio, Design Systems International, Valentina Aliaga.",
  area: "Exhibición / Cultura / Experiencia",
  year: "2021",
  url: "https://www.instagram.com/p/CRHZFD1jD5z/?img_index=2"
},

/* ------------------ (Mobiliario) Librero Rubén — Diego Gajardo ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.33.20_572241b67f.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.33.20_572241b67f.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.33.20_572241b67f-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.33.20_572241b67f-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.33.20_572241b67f.avif 1312w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.33.20_572241b67f-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.33.20_572241b67f-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.33.20_572241b67f.webp 1312w",
  srcOriginal: "https://freight.cargo.site/t/original/i/R2846189121560049538601876665027/Captura-de-pantalla-2026-03-18-a-las-15.33.20.png",
  orientation: "v",
  span: 1,
  tags: ["mobiliario", "objeto", "industrial"],
  title: "(Mobiliario) Librero Rubén",
  author: "Diego Gajardo",
  role: "Diseñador / Fundador",
  collab: "Desarrollado en ardo™︎ studio.",
  area: "Mobiliario / Objeto / Industrial",
  year: "2025",
  url: "https://www.instagram.com/p/DReznSODaPH/?img_index=1"
},

/* ------------------ [Banca Cafecito] — Diego Gajardo ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.36.53_1de787e417.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.36.53_1de787e417.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.36.53_1de787e417-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.36.53_1de787e417-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.36.53_1de787e417.avif 1314w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.36.53_1de787e417-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.36.53_1de787e417-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.36.53_1de787e417.webp 1314w",
  srcOriginal: "https://freight.cargo.site/t/original/i/L2846189121541602794528167113411/Captura-de-pantalla-2026-03-18-a-las-15.36.53.png",
  orientation: "v",
  span: 1,
  tags: ["mobiliario", "objeto", "industrial"],
  title: "[Banca Cafecito]",
  author: "Diego Gajardo",
  role: "Diseñador / Fundador",
  collab: "Diseñada en 2025 para la -tienda, cafetería y espacio de arte- @piso2stgo x C.Miller. Desarrollado en ardo™︎ studio.",
  area: "Mobiliario / Objeto / Industrial",
  year: "2025",
  url: "https://www.instagram.com/p/DU1ufwgDo0z/?img_index=2"
},

/* ------------------ José Vidal & Co - Tacto y Contacto — Lucía Rosselot Valdés ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.44.07_49ca08005d.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.44.07_49ca08005d.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.44.07_49ca08005d-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.44.07_49ca08005d-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.44.07_49ca08005d.avif 2566w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.44.07_49ca08005d-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.44.07_49ca08005d-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.44.07_49ca08005d.webp 2566w",
  srcOriginal: "https://freight.cargo.site/t/original/i/L2846189121523156050454457561795/Captura-de-pantalla-2026-03-18-a-las-15.44.07.png",
  orientation: "h",
  span: 1,
  tags: ["objeto", "editorial"],
  title: "José Vidal & Co - Tacto y Contacto",
  author: "Lucía Rosselot Valdés",
  role: "Diseñadora",
  collab: "Libro objeto para José Vidal & Co.",
  area: "Objeto / Editorial",
  year: "2018",
  url: "https://luciarosselotv.myportfolio.com/tacto-y-contacto"
},

/* ------------------ Modelo A04 — Lucía Rosselot Valdés ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.59.22_a485679667.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.59.22_a485679667.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.59.22_a485679667-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.59.22_a485679667.avif 1126w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.59.22_a485679667-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.59.22_a485679667.webp 1126w",
  srcOriginal: "https://freight.cargo.site/t/original/i/T2846191855090820101251782881987/Captura-de-pantalla-2026-03-18-a-las-15.59.22.png",
  orientation: "h",
  span: 1,
  tags: ["objeto", "indumentaria", "moda"],
  title: "Modelo A04",
  author: "Lucía Rosselot Valdés",
  role: "",
  collab: "",
  area: "Objeto / Indumentaria / Moda",
  year: "2023",
  url: "https://www.instagram.com/p/Cq_n5vYuUe_/?img_index=1"
},

/* ------------------ Intergenerationality and Flexibility — Daniela Moyano ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.55.37_8c2e3d82d0.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.55.37_8c2e3d82d0.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.55.37_8c2e3d82d0-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-18-a-las-15.55.37_8c2e3d82d0-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-18-a-las-15.55.37_8c2e3d82d0.avif 1962w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.55.37_8c2e3d82d0-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-18-a-las-15.55.37_8c2e3d82d0-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-18-a-las-15.55.37_8c2e3d82d0.webp 1962w",
  srcOriginal: "https://freight.cargo.site/t/original/i/Z2846189121504709306380748010179/Captura-de-pantalla-2026-03-18-a-las-15.55.37.png",
  orientation: "h",
  span: 1,
  tags: ["diseño de información"],
  title: "Intergenerationality and Flexibility: A Guide for the Inclusion of 50+ Workers in Formal Workplaces",
  author: "Daniela Moyano",
  role: "Diseñadora",
  collab: "Illustrations by Camila Valencia (@mellamocamilinda)",
  area: "Diseño de información",
  year: "2024",
  url: "https://www.behance.net/gallery/213942821/Guide-for-the-Inclusion-of-50-Workers-in-Workplaces"
},

/* ------------------ Cómo diseñar una revolución. La vía chilena al diseño — Hugo Palmarola ------------------ */
{
  src: "IMG/webp/023_Gonzalez-Yazmin_22db5bedc7.webp",
  srcAvif: "IMG/avif/023_Gonzalez-Yazmin_22db5bedc7.avif",
  srcSetAvif: "IMG/avif/023_Gonzalez-Yazmin_22db5bedc7.avif 511w",
  srcSetWebp: "IMG/webp/023_Gonzalez-Yazmin_22db5bedc7.webp 511w",
  srcOriginal: "IMG/remote-originals/023_Gonzalez-Yazmin.jpeg",
  orientation: "sq",
  span: 1,
  tags: ["editorial","investigación","exposición"],
  title: "Cómo diseñar una revolución. La vía chilena al diseño",
  author: "Hugo Palmarola",
  role: "Investigador/autor",
  collab: "Autores: Eden Medina, Pedro Ignacio Alonso, Hugo Palmarola. Diseño: Yazmín González. Editores: Lars Müller Publishers",
  area: "Editorial / Investigación / Exposición",
  year: "2023",
  url: "https://www.cclm.cl/exposicion/como-disenar-una-revolucion/"
},

/* ------------------ DASON — Patricio Fuentes ------------------ */
{
  src: "IMG/webp/024_fuentes-PAtricio-IMG_5086-scaled_45a6a1f603.webp",
  srcAvif: "IMG/avif/024_fuentes-PAtricio-IMG_5086-scaled_45a6a1f603.avif",
  srcSetAvif: "IMG/avif/variants/024_fuentes-PAtricio-IMG_5086-scaled_45a6a1f603-640.avif 640w, IMG/avif/variants/024_fuentes-PAtricio-IMG_5086-scaled_45a6a1f603-1280.avif 1280w, IMG/avif/024_fuentes-PAtricio-IMG_5086-scaled_45a6a1f603.avif 1920w",
  srcSetWebp: "IMG/webp/variants/024_fuentes-PAtricio-IMG_5086-scaled_45a6a1f603-640.webp 640w, IMG/webp/variants/024_fuentes-PAtricio-IMG_5086-scaled_45a6a1f603-1280.webp 1280w, IMG/webp/024_fuentes-PAtricio-IMG_5086-scaled_45a6a1f603.webp 1920w",
  srcOriginal: "IMG/remote-originals/024_fuentes-PAtricio-IMG_5086-scaled.jpeg",
  orientation: "v",
  span: 2,
  tags: ["producto","salud","investigación"],
  title: "DASON",
  author: "Patricio Fuentes",
  role: "Diseñador/investigador",
  collab: "Desarrollado en colaboración con Stanford University",
  area: "Producto / Salud / Investigación",
  year: "2025",
  url: "https://diseno.uc.cl/2025/05/proyecto-dason-innovacion-frugal-desde-diseno-uc-para-la-salud-pediatrica-global/"
},

/* ------------------ Galería de Arte Gráfico A3 — Alejandra Amenábar ------------------ */
{
  src: "IMG/webp/025_A3-Amenabar-Alejandra-Captura-de-pantalla-2026-03-11-a-las-11.34.26_1b3c7039c3.webp",
  srcAvif: "IMG/avif/025_A3-Amenabar-Alejandra-Captura-de-pantalla-2026-03-11-a-las-11.34.26_1b3c7039c3.avif",
  srcSetAvif: "IMG/avif/variants/025_A3-Amenabar-Alejandra-Captura-de-pantalla-2026-03-11-a-las-11.34.26_1b3c7039c3-640.avif 640w, IMG/avif/variants/025_A3-Amenabar-Alejandra-Captura-de-pantalla-2026-03-11-a-las-11.34.26_1b3c7039c3-1280.avif 1280w, IMG/avif/025_A3-Amenabar-Alejandra-Captura-de-pantalla-2026-03-11-a-las-11.34.26_1b3c7039c3.avif 1610w",
  srcSetWebp: "IMG/webp/variants/025_A3-Amenabar-Alejandra-Captura-de-pantalla-2026-03-11-a-las-11.34.26_1b3c7039c3-640.webp 640w, IMG/webp/variants/025_A3-Amenabar-Alejandra-Captura-de-pantalla-2026-03-11-a-las-11.34.26_1b3c7039c3-1280.webp 1280w, IMG/webp/025_A3-Amenabar-Alejandra-Captura-de-pantalla-2026-03-11-a-las-11.34.26_1b3c7039c3.webp 1610w",
  srcOriginal: "IMG/remote-originals/025_A3-Amenabar-Alejandra-Captura-de-pantalla-2026-03-11-a-las-11.34.26.png",
  orientation: "v",
  span: 1,
  tags: ["arte","galería"],
  title: "Galería de Arte Gráfico A3",
  author: "Alejandra Amenábar",
  role: "Diseñadora/Fundadora",
  collab: "Socia fundadora",
  area: "Arte / Galería",
  year: "N/A",
  url: "https://a3press.com"
},

/* ------------------ Olivia y el Terremoto Invisible — Antonia Piña ------------------ */
{
  src: "IMG/webp/026_pina-antonia-MV5BNTZjYTczNmQtZjJlZS00NmJiLWFiMTctYzMxMThhZDRhNzdjXkEyXkFqcGc._V1_FMjpg_UX1000__fe98033335.webp",
  srcAvif: "IMG/avif/026_pina-antonia-MV5BNTZjYTczNmQtZjJlZS00NmJiLWFiMTctYzMxMThhZDRhNzdjXkEyXkFqcGc._V1_FMjpg_UX1000__fe98033335.avif",
  srcSetAvif: "IMG/avif/variants/026_pina-antonia-MV5BNTZjYTczNmQtZjJlZS00NmJiLWFiMTctYzMxMThhZDRhNzdjXkEyXkFqcGc._V1_FMjpg_UX1000__fe98033335-640.avif 640w, IMG/avif/026_pina-antonia-MV5BNTZjYTczNmQtZjJlZS00NmJiLWFiMTctYzMxMThhZDRhNzdjXkEyXkFqcGc._V1_FMjpg_UX1000__fe98033335.avif 1000w",
  srcSetWebp: "IMG/webp/variants/026_pina-antonia-MV5BNTZjYTczNmQtZjJlZS00NmJiLWFiMTctYzMxMThhZDRhNzdjXkEyXkFqcGc._V1_FMjpg_UX1000__fe98033335-640.webp 640w, IMG/webp/026_pina-antonia-MV5BNTZjYTczNmQtZjJlZS00NmJiLWFiMTctYzMxMThhZDRhNzdjXkEyXkFqcGc._V1_FMjpg_UX1000__fe98033335.webp 1000w",
  srcOriginal: "IMG/remote-originals/026_pina-antonia-MV5BNTZjYTczNmQtZjJlZS00NmJiLWFiMTctYzMxMThhZDRhNzdjXkEyXkFqcGc._V1_FMjpg_UX1000_.jpeg",
  orientation: "v",
  span: 2,
  tags: ["dirección creativa","dirección de arte","animación"],
  title: "Olivia y el Terremoto Invisible",
  author: "Antonia Piña",
  role: "Directora de arte",
  collab: "Dirección: Irene Iborra. Supervisión de arte en Pájaro Pip",
  area: "Dirección creativa / Dirección de arte / Animación",
  year: "2025",
  url: ["https://www.instagram.com/p/DTk-PIijiUK/?hl=es&img_index=1","https://pajaro.cl"]
},

/* ------------------ EXVIVO — Julie Carles ------------------ */
{
  src: "IMG/webp/027_Julie-Carles-Captura-de-pantalla-2026-03-11-a-las-11.14.07_19a6f3c0e4.webp",
  srcAvif: "IMG/avif/027_Julie-Carles-Captura-de-pantalla-2026-03-11-a-las-11.14.07_19a6f3c0e4.avif",
  srcSetAvif: "IMG/avif/variants/027_Julie-Carles-Captura-de-pantalla-2026-03-11-a-las-11.14.07_19a6f3c0e4-640.avif 640w, IMG/avif/variants/027_Julie-Carles-Captura-de-pantalla-2026-03-11-a-las-11.14.07_19a6f3c0e4-1280.avif 1280w, IMG/avif/027_Julie-Carles-Captura-de-pantalla-2026-03-11-a-las-11.14.07_19a6f3c0e4.avif 2404w",
  srcSetWebp: "IMG/webp/variants/027_Julie-Carles-Captura-de-pantalla-2026-03-11-a-las-11.14.07_19a6f3c0e4-640.webp 640w, IMG/webp/variants/027_Julie-Carles-Captura-de-pantalla-2026-03-11-a-las-11.14.07_19a6f3c0e4-1280.webp 1280w, IMG/webp/027_Julie-Carles-Captura-de-pantalla-2026-03-11-a-las-11.14.07_19a6f3c0e4.webp 2404w",
  srcOriginal: "IMG/remote-originals/027_Julie-Carles-Captura-de-pantalla-2026-03-11-a-las-11.14.07.png",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "EXVIVO",
  author: "Julie Carles",
  role: "Diseñadora",
  collab: "Proyecto desarrollado en Draft Estudio",
  area: "Branding / Identidad visual / Gráfico",
  year: "2025",
  url: "https://draft.cl/work/project-ex-vivo/"
},

/* ------------------ DENSE — Vicente Carmona ------------------ */
{
  src: "IMG/webp/028_Carmona-Vicente-Captura-de-pantalla-2026-03-11-a-las-11.19.36_1783e1d771.webp",
  srcAvif: "IMG/avif/028_Carmona-Vicente-Captura-de-pantalla-2026-03-11-a-las-11.19.36_1783e1d771.avif",
  srcSetAvif: "IMG/avif/variants/028_Carmona-Vicente-Captura-de-pantalla-2026-03-11-a-las-11.19.36_1783e1d771-640.avif 640w, IMG/avif/variants/028_Carmona-Vicente-Captura-de-pantalla-2026-03-11-a-las-11.19.36_1783e1d771-1280.avif 1280w, IMG/avif/028_Carmona-Vicente-Captura-de-pantalla-2026-03-11-a-las-11.19.36_1783e1d771.avif 1868w",
  srcSetWebp: "IMG/webp/variants/028_Carmona-Vicente-Captura-de-pantalla-2026-03-11-a-las-11.19.36_1783e1d771-640.webp 640w, IMG/webp/variants/028_Carmona-Vicente-Captura-de-pantalla-2026-03-11-a-las-11.19.36_1783e1d771-1280.webp 1280w, IMG/webp/028_Carmona-Vicente-Captura-de-pantalla-2026-03-11-a-las-11.19.36_1783e1d771.webp 1868w",
  srcOriginal: "IMG/remote-originals/028_Carmona-Vicente-Captura-de-pantalla-2026-03-11-a-las-11.19.36.png",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","investigación"],
  title: "DENSE",
  author: "Vicente Carmona",
  role: "Diseñador",
  collab: "",
  area: "Producto / Industrial / Investigación",
  year: "2023",
  url: "https://viscente.design/dense"
},

/* ------------------ Fintual — Valentina Andrea Pavez Benítez ------------------ */
{
  src: "IMG/webp/029_Captura-de-pantalla-2026-03-11-a-las-13.16.23_a52d358153.webp",
  srcAvif: "IMG/avif/029_Captura-de-pantalla-2026-03-11-a-las-13.16.23_a52d358153.avif",
  srcSetAvif: "IMG/avif/variants/029_Captura-de-pantalla-2026-03-11-a-las-13.16.23_a52d358153-640.avif 640w, IMG/avif/variants/029_Captura-de-pantalla-2026-03-11-a-las-13.16.23_a52d358153-1280.avif 1280w, IMG/avif/029_Captura-de-pantalla-2026-03-11-a-las-13.16.23_a52d358153.avif 2052w",
  srcSetWebp: "IMG/webp/variants/029_Captura-de-pantalla-2026-03-11-a-las-13.16.23_a52d358153-640.webp 640w, IMG/webp/variants/029_Captura-de-pantalla-2026-03-11-a-las-13.16.23_a52d358153-1280.webp 1280w, IMG/webp/029_Captura-de-pantalla-2026-03-11-a-las-13.16.23_a52d358153.webp 2052w",
  srcOriginal: "IMG/remote-originals/029_Captura-de-pantalla-2026-03-11-a-las-13.16.23.png",
  orientation: "h",
  span: 1,
  tags: ["ux","ui","web"],
  title: "Fintual",
  author: "Valentina Andrea Pavez Benítez",
  role: "Diseñadora",
  collab: "",
  area: "UX / UI / Web",
  year: "2025",
  url: "https://www.behance.net/gallery/223316221/Caso-Estudio-Fintual"
},

/* ------------------ Hackathon Junior — Sophia López Pinoleo ------------------ */
{
  src: "IMG/webp/030_hackathon_7a4c47e80e.webp",
  srcAvif: "IMG/avif/030_hackathon_7a4c47e80e.avif",
  srcSetAvif: "IMG/avif/variants/030_hackathon_7a4c47e80e-640.avif 640w, IMG/avif/variants/030_hackathon_7a4c47e80e-1280.avif 1280w, IMG/avif/030_hackathon_7a4c47e80e.avif 1870w",
  srcSetWebp: "IMG/webp/variants/030_hackathon_7a4c47e80e-640.webp 640w, IMG/webp/variants/030_hackathon_7a4c47e80e-1280.webp 1280w, IMG/webp/030_hackathon_7a4c47e80e.webp 1870w",
  srcOriginal: "IMG/remote-originals/030_hackathon.png",
  orientation: "h",
  span: 1,
  tags: ["gráfico","ilustración"],
  title: "Hackathon Junior",
  author: "Sophia López Pinoleo",
  role: "Diseñadora",
  collab: "",
  area: "Gráfico / Ilustración",
  year: "2025",
  url: "https://www.behance.net/gallery/228796131/DIPLOMAS-HACKATHON-JUNIOR-CHICAS-SUPERPODEROSAS"
},

/* ------------------ Descartadas — Vanessa Vásquez ------------------ */
{
  src: "IMG/webp/031_vasquez-Vanessa-7a2b2e29-3d63-4564-9627-504ab6a59e1b_3ba5c7af42.webp",
  srcAvif: "IMG/avif/031_vasquez-Vanessa-7a2b2e29-3d63-4564-9627-504ab6a59e1b_3ba5c7af42.avif",
  srcSetAvif: "IMG/avif/variants/031_vasquez-Vanessa-7a2b2e29-3d63-4564-9627-504ab6a59e1b_3ba5c7af42-640.avif 640w, IMG/avif/variants/031_vasquez-Vanessa-7a2b2e29-3d63-4564-9627-504ab6a59e1b_3ba5c7af42-1280.avif 1280w, IMG/avif/031_vasquez-Vanessa-7a2b2e29-3d63-4564-9627-504ab6a59e1b_3ba5c7af42.avif 4000w",
  srcSetWebp: "IMG/webp/variants/031_vasquez-Vanessa-7a2b2e29-3d63-4564-9627-504ab6a59e1b_3ba5c7af42-640.webp 640w, IMG/webp/variants/031_vasquez-Vanessa-7a2b2e29-3d63-4564-9627-504ab6a59e1b_3ba5c7af42-1280.webp 1280w, IMG/webp/031_vasquez-Vanessa-7a2b2e29-3d63-4564-9627-504ab6a59e1b_3ba5c7af42.webp 4000w",
  srcOriginal: "IMG/remote-originals/031_vasquez-Vanessa-7a2b2e29-3d63-4564-9627-504ab6a59e1b.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Descartadas",
  author: "Vanessa Vásquez",
  role: "Diseñadora",
  collab: "",
  area: "Branding / Identidad visual / Gráfico",
  year: "N/A",
  url: "https://vvasquezzumaran15fd.myportfolio.com/descartadas-identidad-grafica"
},
/* ------------------ Indigno de ser humano — Javiera Vaccaro ------------------ */
{
  src: "IMG/webp/97396d_d193cc8440d94b3ba44e3030ab00242bmv2_f3cd08ea79.webp",
  srcAvif: "IMG/avif/97396d_d193cc8440d94b3ba44e3030ab00242bmv2_f3cd08ea79.avif",
  srcSetAvif: "IMG/avif/variants/97396d_d193cc8440d94b3ba44e3030ab00242bmv2_f3cd08ea79-640.avif 640w, IMG/avif/97396d_d193cc8440d94b3ba44e3030ab00242bmv2_f3cd08ea79.avif 1166w",
  srcSetWebp: "IMG/webp/variants/97396d_d193cc8440d94b3ba44e3030ab00242bmv2_f3cd08ea79-640.webp 640w, IMG/webp/97396d_d193cc8440d94b3ba44e3030ab00242bmv2_f3cd08ea79.webp 1166w",
  srcOriginal: "https://freight.cargo.site/t/original/i/G2844239123198440217689050264259/97396d_d193cc8440d94b3ba44e3030ab00242bmv2.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial", "ilustración"],
  title: "Indigno de ser humano",
  author: "Javiera Vaccaro",
  role: "Diseñadora / Ilustradora",
  collab: "Desarrollado en Abducción Editorial.",
  area: "Editorial / Ilustración",
  year: "2026",
  url: "https://www.abduccioneditorial.cl/product-page/indigno-de-ser-humano-osamu-dazai-1"
},

/* ------------------ Visualización de productos para página web — Álvaro Magalhães ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.02.51_5feafe39e5.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.02.51_5feafe39e5.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.02.51_5feafe39e5-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.02.51_5feafe39e5-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.02.51_5feafe39e5.avif 1730w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.02.51_5feafe39e5-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.02.51_5feafe39e5-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.02.51_5feafe39e5.webp 1730w",
  srcOriginal: "https://freight.cargo.site/t/original/i/N2844237192285504302141734859459/Captura-de-pantalla-2026-03-17-a-las-10.02.51.png",
  orientation: "h",
  span: 1,
  tags: ["diseño conceptual", "3D"],
  title: "Visualización de productos para página web",
  author: "Álvaro Magalhães",
  role: "Diseñador",
  collab: "Desarrollado en Mundigo - Diseño",
  area: "Diseño Conceptual / 3D",
  year: "2026",
  url: "https://www.instagram.com/p/DTQh37hlVke/?img_index=1"
},

/* ------------------ Diseño de soportes y montaje para @genoveva_scl y @bronca.stgo en la tienda de @cdl___stgo — Clemente Mackay ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.07.54_e4eed2baad.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.07.54_e4eed2baad.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.07.54_e4eed2baad-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.07.54_e4eed2baad.avif 1186w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.07.54_e4eed2baad-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.07.54_e4eed2baad.webp 1186w",
  srcOriginal: "https://freight.cargo.site/t/original/i/H2844237192414631510657701720771/Captura-de-pantalla-2026-03-17-a-las-10.07.54.png",
  orientation: "h",
  span: 1,
  tags: ["industrial", "objeto"],
  title: "Diseño de soportes y montaje para @genoveva_scl y @bronca.stgo en la tienda de @cdl___stgo",
  author: "Clemente Mackay",
  role: "Diseñador",
  collab: "Diseño y montaje: Clemente Mackay y Sebastián Cobo. Fotos de Ignacio Squella.",
  area: "Industrial / Objeto",
  year: "2025",
  url: "https://www.instagram.com/p/DTyuD4gFefE/?img_index=1"
},

/* ------------------ DTAD — Clemente Mackay ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.09.28_4c3e3a2799.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.09.28_4c3e3a2799.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.09.28_4c3e3a2799-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.09.28_4c3e3a2799-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.09.28_4c3e3a2799.avif 1378w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.09.28_4c3e3a2799-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.09.28_4c3e3a2799-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.09.28_4c3e3a2799.webp 1378w",
  srcOriginal: "https://freight.cargo.site/t/original/i/E2844237192396184766583992169155/Captura-de-pantalla-2026-03-17-a-las-10.09.28.png",
  orientation: "h",
  span: 1,
  tags: ["industrial", "objeto"],
  title: "DTAD",
  author: "Clemente Mackay",
  role: "Diseñador",
  collab: "",
  area: "Industrial / Objeto",
  year: "2024",
  url: "https://www.instagram.com/p/DDsppBEyNgw/?img_index=1"
},

/* ------------------ Ignacio Squella — Ignacio Squella ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.15.56_bc90f99918.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.15.56_bc90f99918.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.15.56_bc90f99918-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.15.56_bc90f99918.avif 946w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.15.56_bc90f99918-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.15.56_bc90f99918.webp 946w",
  srcOriginal: "https://freight.cargo.site/t/original/i/E2844237192359291278436573065923/Captura-de-pantalla-2026-03-17-a-las-10.15.56.png",
  orientation: "h",
  span: 1,
  tags: ["fotografía", "dirección de arte"],
  title: "Ignacio Squella",
  author: "Ignacio Squella",
  role: "Diseñador / fotógrafo",
  collab: "",
  area: "Fotografía / Dirección de arte",
  year: "n/a",
  url: "https://ignaciosquella.cl"
},

/* ------------------ Fotografía producto - Caluet.cl — Ignacio Squella ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.15.47_75d542c018.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.15.47_75d542c018.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.15.47_75d542c018-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.15.47_75d542c018-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.15.47_75d542c018.avif 1572w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.15.47_75d542c018-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.15.47_75d542c018-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.15.47_75d542c018.webp 1572w",
  srcOriginal: "https://freight.cargo.site/t/original/i/Z2844237192377738022510282617539/Captura-de-pantalla-2026-03-17-a-las-10.15.47.png",
  orientation: "h",
  span: 1,
  tags: ["fotografía", "dirección de arte"],
  title: "Fotografía producto - Caluet.cl",
  author: "Ignacio Squella",
  role: "Diseñador / fotógrafo",
  collab: "",
  area: "Fotografía / Dirección de arte",
  year: "2025",
  url: "https://www.behance.net/gallery/226249599/Fotografia-producto-Caluetcl"
},

/* ------------------ Proyecto sin título — Sofía Jiménez ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.27.24_257e6f54de.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.27.24_257e6f54de.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.27.24_257e6f54de-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.27.24_257e6f54de-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.27.24_257e6f54de.avif 1356w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.27.24_257e6f54de-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.27.24_257e6f54de-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.27.24_257e6f54de.webp 1356w",
  srcOriginal: "https://freight.cargo.site/t/original/i/A2844237192340844534362863514307/Captura-de-pantalla-2026-03-17-a-las-10.27.24.png",
  orientation: "v",
  span: 1,
  tags: ["estilismo", "moda", "dirección de arte"],
  title: "",
  author: "Sofía Jiménez",
  role: "",
  collab: "",
  area: "Estilismo / Moda / Dirección de arte",
  year: "2024",
  url: "https://www.instagram.com/p/C7AMr_8pWUE/?img_index=1"
},

/* ------------------ Proyecto sin título — Sofía Jiménez ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.28.05_5b6a1a5387.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.28.05_5b6a1a5387.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.28.05_5b6a1a5387-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.28.05_5b6a1a5387-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.28.05_5b6a1a5387.avif 1344w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.28.05_5b6a1a5387-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.28.05_5b6a1a5387-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.28.05_5b6a1a5387.webp 1344w",
  srcOriginal: "https://freight.cargo.site/t/original/i/D2844237192322397790289153962691/Captura-de-pantalla-2026-03-17-a-las-10.28.05.png",
  orientation: "v",
  span: 1,
  tags: ["estilismo", "moda", "dirección de arte"],
  title: "",
  author: "Sofía Jiménez",
  role: "",
  collab: "",
  area: "Estilismo / Moda / Dirección de arte",
  year: "2024",
  url: "https://www.instagram.com/p/DC9MfyCpSoO/?img_index=1"
},

/* ------------------ Topsy Studio — Malú Fernández Aspillaga ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.32.38_6cc03a3840.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.32.38_6cc03a3840.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.32.38_6cc03a3840-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-17-a-las-10.32.38_6cc03a3840-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-17-a-las-10.32.38_6cc03a3840.avif 1478w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.32.38_6cc03a3840-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-17-a-las-10.32.38_6cc03a3840-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-17-a-las-10.32.38_6cc03a3840.webp 1478w",
  srcOriginal: "https://freight.cargo.site/t/original/i/F2844237192303951046215444411075/Captura-de-pantalla-2026-03-17-a-las-10.32.38.png",
  orientation: "h",
  span: 1,
  tags: ["dirección creativa", "rrss"],
  title: "Topsy Studio",
  author: "Malú Fernández Aspillaga",
  role: "Diseñadora / Fundadora",
  collab: "Directora Creativa en Topsy Studio",
  area: "Dirección creativa / RRSS",
  year: "n/a",
  url: "https://www.topsystudio.com"
},

/* ------------------ Orniflor viaja a Chiloé — Valentina Rey Carmona ------------------ */
{
  src: "IMG/webp/032_Rey-Valentin-aportada-chiloe2_e408b33688.webp",
  srcAvif: "IMG/avif/032_Rey-Valentin-aportada-chiloe2_e408b33688.avif",
  srcSetAvif: "IMG/avif/variants/032_Rey-Valentin-aportada-chiloe2_e408b33688-640.avif 640w, IMG/avif/032_Rey-Valentin-aportada-chiloe2_e408b33688.avif 1000w",
  srcSetWebp: "IMG/webp/variants/032_Rey-Valentin-aportada-chiloe2_e408b33688-640.webp 640w, IMG/webp/032_Rey-Valentin-aportada-chiloe2_e408b33688.webp 1000w",
  srcOriginal: "IMG/remote-originals/032_Rey-Valentin-aportada-chiloe2.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial","gráfico","diagramación"],
  title: "Orniflor viaja a Chiloé",
  author: "Valentina Rey Carmona",
  role: "",
  collab: "Proyecto para Fundación Juntos Incluimos",
  area: "Editorial / Gráfico / Diagramación",
  year: "2024",
  url: "https://www.behance.net/gallery/173198799/Orniflor-viaja-a-chilo"
},

/* ------------------ Libro infantil — Valentina Rey Carmona ------------------ */
{
  src: "IMG/webp/033_Rey-Valentina_666e2be24a.webp",
  srcAvif: "IMG/avif/033_Rey-Valentina_666e2be24a.avif",
  srcSetAvif: "IMG/avif/variants/033_Rey-Valentina_666e2be24a-640.avif 640w, IMG/avif/variants/033_Rey-Valentina_666e2be24a-1280.avif 1280w, IMG/avif/033_Rey-Valentina_666e2be24a.avif 1486w",
  srcSetWebp: "IMG/webp/variants/033_Rey-Valentina_666e2be24a-640.webp 640w, IMG/webp/variants/033_Rey-Valentina_666e2be24a-1280.webp 1280w, IMG/webp/033_Rey-Valentina_666e2be24a.webp 1486w",
  srcOriginal: "IMG/remote-originals/033_Rey-Valentina.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","infantil"],
  title: "Libro infantil",
  author: "Valentina Rey Carmona",
  role: "",
  collab: "",
  area: "Ilustración / Infantil",
  year: "2024",
  url: "https://www.behance.net/gallery/182931307/Ilustraciones-editoriales"
},

/* ------------------ Cartas de Póker (Coca-Cola) — Tamara Santibáñez ------------------ */
{
  src: "IMG/webp/034_Santibanez-Tamara_42aa8ee5c2.webp",
  srcAvif: "IMG/avif/034_Santibanez-Tamara_42aa8ee5c2.avif",
  srcSetAvif: "IMG/avif/variants/034_Santibanez-Tamara_42aa8ee5c2-640.avif 640w, IMG/avif/variants/034_Santibanez-Tamara_42aa8ee5c2-1280.avif 1280w, IMG/avif/034_Santibanez-Tamara_42aa8ee5c2.avif 2516w",
  srcSetWebp: "IMG/webp/variants/034_Santibanez-Tamara_42aa8ee5c2-640.webp 640w, IMG/webp/variants/034_Santibanez-Tamara_42aa8ee5c2-1280.webp 1280w, IMG/webp/034_Santibanez-Tamara_42aa8ee5c2.webp 2516w",
  srcOriginal: "IMG/remote-originals/034_Santibanez-Tamara.png",
  orientation: "h",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Cartas de Póker (Coca-Cola)",
  author: "Tamara Santibáñez",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/233763201/Cartas-de-poker-para-Coca-Cola"
},

/* ------------------ Descargables Imanix — Sofía Daza Urzúa ------------------ */
{
  src: "IMG/webp/035_Daza-Sofia_952ecf3642.webp",
  srcAvif: "IMG/avif/035_Daza-Sofia_952ecf3642.avif",
  srcSetAvif: "IMG/avif/variants/035_Daza-Sofia_952ecf3642-640.avif 640w, IMG/avif/variants/035_Daza-Sofia_952ecf3642-1280.avif 1280w, IMG/avif/035_Daza-Sofia_952ecf3642.avif 1536w",
  srcSetWebp: "IMG/webp/variants/035_Daza-Sofia_952ecf3642-640.webp 640w, IMG/webp/variants/035_Daza-Sofia_952ecf3642-1280.webp 1280w, IMG/webp/035_Daza-Sofia_952ecf3642.webp 1536w",
  srcOriginal: "IMG/remote-originals/035_Daza-Sofia.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","editorial","gráfico"],
  title: "Descargables Imanix",
  author: "Sofía Daza Urzúa",
  role: "Diseñadora/ilustradora",
  collab: "",
  area: "Ilustración / Editorial / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/225293267/Descargables-Imanix"
},

/* ------------------ Talana (UX/UI) — Rafaella Espildora ------------------ */
{
  src: "IMG/webp/036_Espildora-Rafella_0c46ba0d56.webp",
  srcAvif: "IMG/avif/036_Espildora-Rafella_0c46ba0d56.avif",
  srcSetAvif: "IMG/avif/variants/036_Espildora-Rafella_0c46ba0d56-640.avif 640w, IMG/avif/variants/036_Espildora-Rafella_0c46ba0d56-1280.avif 1280w, IMG/avif/036_Espildora-Rafella_0c46ba0d56.avif 1412w",
  srcSetWebp: "IMG/webp/variants/036_Espildora-Rafella_0c46ba0d56-640.webp 640w, IMG/webp/variants/036_Espildora-Rafella_0c46ba0d56-1280.webp 1280w, IMG/webp/036_Espildora-Rafella_0c46ba0d56.webp 1412w",
  srcOriginal: "IMG/remote-originals/036_Espildora-Rafella.png",
  orientation: "h",
  span: 1,
  tags: ["ux","ui","servicio"],
  title: "Talana",
  author: "Rafaella Espildora",
  role: "",
  collab: "",
  area: "UX / UI / Servicio",
  year: "2024",
  url: "https://www.behance.net/gallery/196546331/UXUI-SaaS-HR"
},

/* ------------------ Revista N°2 Museo Histórico de Carabineros — Paulina Padilla ------------------ */
{
  src: "IMG/webp/037_PADILLA-PAULINA-1f75b2_fd084dd76c2b4662b346409b24ab3b7b_09d47651af.webp",
  srcAvif: "IMG/avif/037_PADILLA-PAULINA-1f75b2_fd084dd76c2b4662b346409b24ab3b7b_09d47651af.avif",
  srcSetAvif: "IMG/avif/037_PADILLA-PAULINA-1f75b2_fd084dd76c2b4662b346409b24ab3b7b_09d47651af.avif 544w",
  srcSetWebp: "IMG/webp/037_PADILLA-PAULINA-1f75b2_fd084dd76c2b4662b346409b24ab3b7b_09d47651af.webp 544w",
  srcOriginal: "IMG/remote-originals/037_PADILLA-PAULINA-1f75b2_fd084dd76c2b4662b346409b24ab3b7b.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial"],
  title: "Revista N°2 Museo Histórico de Carabineros de Chile",
  author: "Paulina Padilla",
  role: "",
  collab: "",
  area: "Editorial",
  year: "2013",
  url: "https://www.paulinapadilla.cl/editorial"
},

/* ------------------ Aralí — Aranda Feres Ojeda ------------------ */
{
  src: "IMG/webp/038_feres-aranda-5_77c650d6-239f-407d-a6a8-8d316462fe81_7ae47a6aec.webp",
  srcAvif: "IMG/avif/038_feres-aranda-5_77c650d6-239f-407d-a6a8-8d316462fe81_7ae47a6aec.avif",
  srcSetAvif: "IMG/avif/variants/038_feres-aranda-5_77c650d6-239f-407d-a6a8-8d316462fe81_7ae47a6aec-640.avif 640w, IMG/avif/variants/038_feres-aranda-5_77c650d6-239f-407d-a6a8-8d316462fe81_7ae47a6aec-1280.avif 1280w, IMG/avif/038_feres-aranda-5_77c650d6-239f-407d-a6a8-8d316462fe81_7ae47a6aec.avif 2890w",
  srcSetWebp: "IMG/webp/variants/038_feres-aranda-5_77c650d6-239f-407d-a6a8-8d316462fe81_7ae47a6aec-640.webp 640w, IMG/webp/variants/038_feres-aranda-5_77c650d6-239f-407d-a6a8-8d316462fe81_7ae47a6aec-1280.webp 1280w, IMG/webp/038_feres-aranda-5_77c650d6-239f-407d-a6a8-8d316462fe81_7ae47a6aec.webp 2890w",
  srcOriginal: "IMG/remote-originals/038_feres-aranda-5_77c650d6-239f-407d-a6a8-8d316462fe81.jpeg",
  orientation: "v",
  span: 1,
  tags: ["producto","artesanía"],
  title: "Aralí",
  author: "Aranda Feres Ojeda",
  role: "Diseñadora/orfebre",
  collab: "",
  area: "Producto / Artesanía",
  year: "2024",
  url: "https://arali.store/collections/aranda-1"
},

/* ------------------ Afiche n°1 — Gianfranco Music Wachtendorff ------------------ */
{
  src: "IMG/webp/039_Gianfranco-Music-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_aeb21e8cd0.webp",
  srcAvif: "IMG/avif/039_Gianfranco-Music-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_aeb21e8cd0.avif",
  srcSetAvif: "IMG/avif/variants/039_Gianfranco-Music-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_aeb21e8cd0-640.avif 640w, IMG/avif/variants/039_Gianfranco-Music-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_aeb21e8cd0-1280.avif 1280w, IMG/avif/039_Gianfranco-Music-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_aeb21e8cd0.avif 1920w",
  srcSetWebp: "IMG/webp/variants/039_Gianfranco-Music-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_aeb21e8cd0-640.webp 640w, IMG/webp/variants/039_Gianfranco-Music-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_aeb21e8cd0-1280.webp 1280w, IMG/webp/039_Gianfranco-Music-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_aeb21e8cd0.webp 1920w",
  srcOriginal: "IMG/remote-originals/039_Gianfranco-Music-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920.png",
  orientation: "sq",
  span: 2,
  tags: ["afiche","afiche digital","gráfico"],
  title: "Afiche n°1",
  author: "Gianfranco Music Wachtendorff",
  role: "",
  collab: "",
  area: "Afiche / Afiche digital / Gráfico",
  year: "2025",
  url: "https://gianfrancomw.myportfolio.com/posters-semana-novata-2023"
},

/* ------------------ Vestuario obra "Hotel O'clock" — María Soledad Albornoz ------------------ */
{
  src: "IMG/webp/040_albornoz-soledad-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_38fa110367.webp",
  srcAvif: "IMG/avif/040_albornoz-soledad-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_38fa110367.avif",
  srcSetAvif: "IMG/avif/variants/040_albornoz-soledad-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_38fa110367-640.avif 640w, IMG/avif/variants/040_albornoz-soledad-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_38fa110367-1280.avif 1280w, IMG/avif/040_albornoz-soledad-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_38fa110367.avif 1920w",
  srcSetWebp: "IMG/webp/variants/040_albornoz-soledad-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_38fa110367-640.webp 640w, IMG/webp/variants/040_albornoz-soledad-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_38fa110367-1280.webp 1280w, IMG/webp/040_albornoz-soledad-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_38fa110367.webp 1920w",
  srcOriginal: "IMG/remote-originals/040_albornoz-soledad-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920.jpeg",
  orientation: "h",
  span: 2,
  tags: ["vestuario","teatro","indumentaria"],
  title: "Vestuario obra 'Hotel O'clock'",
  author: "María Soledad Albornoz",
  role: "",
  collab: "Diseño técnico, patronaje y confección de vestuario de once personajes. Estreno: Academia Club de Teatro Fernando González, julio 2025",
  area: "Vestuario / Teatro / Indumentaria",
  year: "2025",
  url: "https://solealbornoz.myportfolio.com/copia-de-escarlata"
},

/* ------------------ Vestuario obra "Bailame" — María Soledad Albornoz ------------------ */
{
  src: "IMG/webp/041_albornoz-soledad-2-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_8b1bf51254.webp",
  srcAvif: "IMG/avif/041_albornoz-soledad-2-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_8b1bf51254.avif",
  srcSetAvif: "IMG/avif/variants/041_albornoz-soledad-2-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_8b1bf51254-640.avif 640w, IMG/avif/041_albornoz-soledad-2-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_8b1bf51254.avif 1152w",
  srcSetWebp: "IMG/webp/variants/041_albornoz-soledad-2-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_8b1bf51254-640.webp 640w, IMG/webp/041_albornoz-soledad-2-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920_8b1bf51254.webp 1152w",
  srcOriginal: "IMG/remote-originals/041_albornoz-soledad-2-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920.jpeg",
  orientation: "h",
  span: 1,
  tags: ["vestuario","teatro","indumentaria"],
  title: "Vestuario obra 'Bailame'",
  author: "María Soledad Albornoz",
  role: "",
  collab: "Diseño técnico, patronaje y confección de vestuario de siete personajes",
  area: "Vestuario / Teatro / Indumentaria",
  year: "2025",
  url: "https://solealbornoz.myportfolio.com/copia-de-vestuario-obra-hotel-oclock"
},

/* ------------------ Colaboración cervecería LOA — María Jesús Lafuente ------------------ */
{
  src: "IMG/webp/042_Lafuente-Captura-de-pantalla-2026-03-12-a-las-10.27.11_2737e68236.webp",
  srcAvif: "IMG/avif/042_Lafuente-Captura-de-pantalla-2026-03-12-a-las-10.27.11_2737e68236.avif",
  srcSetAvif: "IMG/avif/variants/042_Lafuente-Captura-de-pantalla-2026-03-12-a-las-10.27.11_2737e68236-640.avif 640w, IMG/avif/042_Lafuente-Captura-de-pantalla-2026-03-12-a-las-10.27.11_2737e68236.avif 1226w",
  srcSetWebp: "IMG/webp/variants/042_Lafuente-Captura-de-pantalla-2026-03-12-a-las-10.27.11_2737e68236-640.webp 640w, IMG/webp/042_Lafuente-Captura-de-pantalla-2026-03-12-a-las-10.27.11_2737e68236.webp 1226w",
  srcOriginal: "IMG/remote-originals/042_Lafuente-Captura-de-pantalla-2026-03-12-a-las-10.27.11.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","packaging","gráfico"],
  title: "Colaboración cervecería LOA",
  author: "María Jesús Lafuente",
  role: "",
  collab: "Ilustración para etiqueta de cerveza experimental. Cervecería LOA",
  area: "Ilustración / Packaging / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/206548179/Cerveza-LOA"
},

/* ------------------ Arrebol Spa — María Jesús Lafuente ------------------ */
{
  src: "IMG/webp/043_arrebolCaptura-de-pantalla-2026-03-12-a-las-10.30.04_a289c4cd37.webp",
  srcAvif: "IMG/avif/043_arrebolCaptura-de-pantalla-2026-03-12-a-las-10.30.04_a289c4cd37.avif",
  srcSetAvif: "IMG/avif/variants/043_arrebolCaptura-de-pantalla-2026-03-12-a-las-10.30.04_a289c4cd37-640.avif 640w, IMG/avif/variants/043_arrebolCaptura-de-pantalla-2026-03-12-a-las-10.30.04_a289c4cd37-1280.avif 1280w, IMG/avif/043_arrebolCaptura-de-pantalla-2026-03-12-a-las-10.30.04_a289c4cd37.avif 2284w",
  srcSetWebp: "IMG/webp/variants/043_arrebolCaptura-de-pantalla-2026-03-12-a-las-10.30.04_a289c4cd37-640.webp 640w, IMG/webp/variants/043_arrebolCaptura-de-pantalla-2026-03-12-a-las-10.30.04_a289c4cd37-1280.webp 1280w, IMG/webp/043_arrebolCaptura-de-pantalla-2026-03-12-a-las-10.30.04_a289c4cd37.webp 2284w",
  srcOriginal: "IMG/remote-originals/043_arrebolCaptura-de-pantalla-2026-03-12-a-las-10.30.04.png",
  orientation: "h",
  span: 1,
  tags: ["afiche","ilustración","gráfico"],
  title: "Arrebol Spa",
  author: "María Jesús Lafuente",
  role: "",
  collab: "",
  area: "Afiche / Ilustración / Gráfico",
  year: "2024",
  url: "https://www.behance.net/gallery/215849417/Arrebol-Spa"
},

/* ------------------ alegría alegría (fotografía) — María Inés Alarcón ------------------ */
{
  src: "IMG/webp/044_Alarcon-MariaInes-1Captura-de-pantalla-2026-03-12-a-las-10.53.27_57b7189cab.webp",
  srcAvif: "IMG/avif/044_Alarcon-MariaInes-1Captura-de-pantalla-2026-03-12-a-las-10.53.27_57b7189cab.avif",
  srcSetAvif: "IMG/avif/variants/044_Alarcon-MariaInes-1Captura-de-pantalla-2026-03-12-a-las-10.53.27_57b7189cab-640.avif 640w, IMG/avif/variants/044_Alarcon-MariaInes-1Captura-de-pantalla-2026-03-12-a-las-10.53.27_57b7189cab-1280.avif 1280w, IMG/avif/044_Alarcon-MariaInes-1Captura-de-pantalla-2026-03-12-a-las-10.53.27_57b7189cab.avif 2374w",
  srcSetWebp: "IMG/webp/variants/044_Alarcon-MariaInes-1Captura-de-pantalla-2026-03-12-a-las-10.53.27_57b7189cab-640.webp 640w, IMG/webp/variants/044_Alarcon-MariaInes-1Captura-de-pantalla-2026-03-12-a-las-10.53.27_57b7189cab-1280.webp 1280w, IMG/webp/044_Alarcon-MariaInes-1Captura-de-pantalla-2026-03-12-a-las-10.53.27_57b7189cab.webp 2374w",
  srcOriginal: "IMG/remote-originals/044_Alarcon-MariaInes-1Captura-de-pantalla-2026-03-12-a-las-10.53.27.png",
  orientation: "h",
  span: 1,
  tags: ["fotografía"],
  title: "alegría alegría",
  author: "María Inés Alarcón",
  role: "",
  collab: "Creadora y fundadora: María Inés Alarcón",
  area: "Fotografía",
  year: "N/A",
  url: ["https://www.alegria-alegria.com/portfolio","https://www.instagram.com/alegria___alegria/"]
},

/* ------------------ Rediseño portada Juan Salvador Gaviota — María Inés Alarcón ------------------ */
{
  src: "IMG/webp/045_Alarcon-MariaInes-2Captura-de-pantalla-2026-03-12-a-las-10.56.05_a51e1aaf8a.webp",
  srcAvif: "IMG/avif/045_Alarcon-MariaInes-2Captura-de-pantalla-2026-03-12-a-las-10.56.05_a51e1aaf8a.avif",
  srcSetAvif: "IMG/avif/variants/045_Alarcon-MariaInes-2Captura-de-pantalla-2026-03-12-a-las-10.56.05_a51e1aaf8a-640.avif 640w, IMG/avif/variants/045_Alarcon-MariaInes-2Captura-de-pantalla-2026-03-12-a-las-10.56.05_a51e1aaf8a-1280.avif 1280w, IMG/avif/045_Alarcon-MariaInes-2Captura-de-pantalla-2026-03-12-a-las-10.56.05_a51e1aaf8a.avif 2282w",
  srcSetWebp: "IMG/webp/variants/045_Alarcon-MariaInes-2Captura-de-pantalla-2026-03-12-a-las-10.56.05_a51e1aaf8a-640.webp 640w, IMG/webp/variants/045_Alarcon-MariaInes-2Captura-de-pantalla-2026-03-12-a-las-10.56.05_a51e1aaf8a-1280.webp 1280w, IMG/webp/045_Alarcon-MariaInes-2Captura-de-pantalla-2026-03-12-a-las-10.56.05_a51e1aaf8a.webp 2282w",
  srcOriginal: "IMG/remote-originals/045_Alarcon-MariaInes-2Captura-de-pantalla-2026-03-12-a-las-10.56.05.png",
  orientation: "sq",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Rediseño portada Juan Salvador Gaviota",
  author: "María Inés Alarcón",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2018",
  url: "https://www.behance.net/gallery/67251153/Rediseno-portada-Juan-Salvador-Gaviota-Richard-Bach"
},

/* ------------------ Circular Pet — León Quesney Cox ------------------ */
{
  src: "IMG/webp/046_Quesneyb9f9ce_c2d979ca09e44dfd8158696da129e7e2_mv2.jpg_73bb55f4f7.webp",
  srcAvif: "IMG/avif/046_Quesneyb9f9ce_c2d979ca09e44dfd8158696da129e7e2_mv2.jpg_73bb55f4f7.avif",
  srcSetAvif: "IMG/avif/variants/046_Quesneyb9f9ce_c2d979ca09e44dfd8158696da129e7e2_mv2.jpg_73bb55f4f7-640.avif 640w, IMG/avif/variants/046_Quesneyb9f9ce_c2d979ca09e44dfd8158696da129e7e2_mv2.jpg_73bb55f4f7-1280.avif 1280w, IMG/avif/046_Quesneyb9f9ce_c2d979ca09e44dfd8158696da129e7e2_mv2.jpg_73bb55f4f7.avif 1732w",
  srcSetWebp: "IMG/webp/variants/046_Quesneyb9f9ce_c2d979ca09e44dfd8158696da129e7e2_mv2.jpg_73bb55f4f7-640.webp 640w, IMG/webp/variants/046_Quesneyb9f9ce_c2d979ca09e44dfd8158696da129e7e2_mv2.jpg_73bb55f4f7-1280.webp 1280w, IMG/webp/046_Quesneyb9f9ce_c2d979ca09e44dfd8158696da129e7e2_mv2.jpg_73bb55f4f7.webp 1732w",
  srcOriginal: "IMG/remote-originals/046_Quesneyb9f9ce_c2d979ca09e44dfd8158696da129e7e2_mv2.jpg.jpg",
  orientation: "h",
  span: 1,
  tags: ["packaging","servicio"],
  title: "Circular Pet",
  author: "León Quesney Cox",
  role: "",
  collab: "Desarrollado en Periferi.co",
  area: "Packaging / Servicio",
  year: "2021",
  url: ["https://www.behance.net/gallery/129565533/Pentawards-London-2021","https://www.periferi.co/services-1"]
},

/* ------------------ La Batea Deco — Josefina Stückrath ------------------ */
{
  src: "IMG/webp/047_Josefina-Stuckrath-1Captura-de-pantalla-2026-03-12-a-las-11.05.59_cd885d46c5.webp",
  srcAvif: "IMG/avif/047_Josefina-Stuckrath-1Captura-de-pantalla-2026-03-12-a-las-11.05.59_cd885d46c5.avif",
  srcSetAvif: "IMG/avif/variants/047_Josefina-Stuckrath-1Captura-de-pantalla-2026-03-12-a-las-11.05.59_cd885d46c5-640.avif 640w, IMG/avif/variants/047_Josefina-Stuckrath-1Captura-de-pantalla-2026-03-12-a-las-11.05.59_cd885d46c5-1280.avif 1280w, IMG/avif/047_Josefina-Stuckrath-1Captura-de-pantalla-2026-03-12-a-las-11.05.59_cd885d46c5.avif 1938w",
  srcSetWebp: "IMG/webp/variants/047_Josefina-Stuckrath-1Captura-de-pantalla-2026-03-12-a-las-11.05.59_cd885d46c5-640.webp 640w, IMG/webp/variants/047_Josefina-Stuckrath-1Captura-de-pantalla-2026-03-12-a-las-11.05.59_cd885d46c5-1280.webp 1280w, IMG/webp/047_Josefina-Stuckrath-1Captura-de-pantalla-2026-03-12-a-las-11.05.59_cd885d46c5.webp 1938w",
  srcOriginal: "IMG/remote-originals/047_Josefina-Stuckrath-1Captura-de-pantalla-2026-03-12-a-las-11.05.59.png",
  orientation: "v",
  span: 1,
  tags: ["branding","gráfico","web"],
  title: "La Batea Deco",
  author: "Josefina Stückrath",
  role: "",
  collab: "",
  area: "Branding / Gráfico / Web",
  year: "2026",
  url: "https://www.behance.net/gallery/241350377/Diseno-grafico-web-y-fotografia-La-Batea-Deco"
},

/* ------------------ Tere Gott — Josefina Stückrath ------------------ */
{
  src: "IMG/webp/048_Josefina-Stuckrath-2Captura-de-pantalla-2026-03-12-a-las-11.07.34_3b3b88d5b3.webp",
  srcAvif: "IMG/avif/048_Josefina-Stuckrath-2Captura-de-pantalla-2026-03-12-a-las-11.07.34_3b3b88d5b3.avif",
  srcSetAvif: "IMG/avif/variants/048_Josefina-Stuckrath-2Captura-de-pantalla-2026-03-12-a-las-11.07.34_3b3b88d5b3-640.avif 640w, IMG/avif/variants/048_Josefina-Stuckrath-2Captura-de-pantalla-2026-03-12-a-las-11.07.34_3b3b88d5b3-1280.avif 1280w, IMG/avif/048_Josefina-Stuckrath-2Captura-de-pantalla-2026-03-12-a-las-11.07.34_3b3b88d5b3.avif 2824w",
  srcSetWebp: "IMG/webp/variants/048_Josefina-Stuckrath-2Captura-de-pantalla-2026-03-12-a-las-11.07.34_3b3b88d5b3-640.webp 640w, IMG/webp/variants/048_Josefina-Stuckrath-2Captura-de-pantalla-2026-03-12-a-las-11.07.34_3b3b88d5b3-1280.webp 1280w, IMG/webp/048_Josefina-Stuckrath-2Captura-de-pantalla-2026-03-12-a-las-11.07.34_3b3b88d5b3.webp 2824w",
  srcOriginal: "IMG/remote-originals/048_Josefina-Stuckrath-2Captura-de-pantalla-2026-03-12-a-las-11.07.34.png",
  orientation: "h",
  span: 1,
  tags: ["branding","gráfico","web"],
  title: "Tere Gott",
  author: "Josefina Stückrath",
  role: "",
  collab: "Diseño gráfico, web y fotografía: Josefina Stückrath",
  area: "Branding / Gráfico / Web",
  year: "2025",
  url: "https://www.behance.net/gallery/241036857/Diseno-grafico-web-y-fotografia-Tere-Gott"
},

/* ------------------ ALBADELUX — Josefa González Gil ------------------ */
{
  src: "IMG/webp/049_Gonzalez-Josefa-Captura-de-pantalla-2026-03-12-a-las-11.13.55_3a7c0da800.webp",
  srcAvif: "IMG/avif/049_Gonzalez-Josefa-Captura-de-pantalla-2026-03-12-a-las-11.13.55_3a7c0da800.avif",
  srcSetAvif: "IMG/avif/variants/049_Gonzalez-Josefa-Captura-de-pantalla-2026-03-12-a-las-11.13.55_3a7c0da800-640.avif 640w, IMG/avif/variants/049_Gonzalez-Josefa-Captura-de-pantalla-2026-03-12-a-las-11.13.55_3a7c0da800-1280.avif 1280w, IMG/avif/049_Gonzalez-Josefa-Captura-de-pantalla-2026-03-12-a-las-11.13.55_3a7c0da800.avif 2518w",
  srcSetWebp: "IMG/webp/variants/049_Gonzalez-Josefa-Captura-de-pantalla-2026-03-12-a-las-11.13.55_3a7c0da800-640.webp 640w, IMG/webp/variants/049_Gonzalez-Josefa-Captura-de-pantalla-2026-03-12-a-las-11.13.55_3a7c0da800-1280.webp 1280w, IMG/webp/049_Gonzalez-Josefa-Captura-de-pantalla-2026-03-12-a-las-11.13.55_3a7c0da800.webp 2518w",
  srcOriginal: "IMG/remote-originals/049_Gonzalez-Josefa-Captura-de-pantalla-2026-03-12-a-las-11.13.55.png",
  orientation: "v",
  span: 1,
  tags: ["branding","packaging","gráfico"],
  title: "ALBADELUX",
  author: "Josefa González Gil",
  role: "",
  collab: "Rediseño de identidad corporativa ALBADELUX. Implementación en desarrollo de packaging",
  area: "Branding / Packaging / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/175998049/Packaging-Iluminacion-Industrial"
},

/* ------------------ Cajas de Puzzles (varias) — Florencia Rodríguez Errázuriz ------------------ */
{
  src: "IMG/webp/050_Florencia-Rodriguez-ErrazurizCaptura-de-pantalla-2026-03-12-a-las-11.15.31_380907207d.webp",
  srcAvif: "IMG/avif/050_Florencia-Rodriguez-ErrazurizCaptura-de-pantalla-2026-03-12-a-las-11.15.31_380907207d.avif",
  srcSetAvif: "IMG/avif/variants/050_Florencia-Rodriguez-ErrazurizCaptura-de-pantalla-2026-03-12-a-las-11.15.31_380907207d-640.avif 640w, IMG/avif/variants/050_Florencia-Rodriguez-ErrazurizCaptura-de-pantalla-2026-03-12-a-las-11.15.31_380907207d-1280.avif 1280w, IMG/avif/050_Florencia-Rodriguez-ErrazurizCaptura-de-pantalla-2026-03-12-a-las-11.15.31_380907207d.avif 2510w",
  srcSetWebp: "IMG/webp/variants/050_Florencia-Rodriguez-ErrazurizCaptura-de-pantalla-2026-03-12-a-las-11.15.31_380907207d-640.webp 640w, IMG/webp/variants/050_Florencia-Rodriguez-ErrazurizCaptura-de-pantalla-2026-03-12-a-las-11.15.31_380907207d-1280.webp 1280w, IMG/webp/050_Florencia-Rodriguez-ErrazurizCaptura-de-pantalla-2026-03-12-a-las-11.15.31_380907207d.webp 2510w",
  srcOriginal: "IMG/remote-originals/050_Florencia-Rodriguez-ErrazurizCaptura-de-pantalla-2026-03-12-a-las-11.15.31.png",
  orientation: "h",
  span: 1,
  tags: ["branding","packaging","gráfico"],
  title: "Cajas de Puzzles (varias)",
  author: "Florencia Rodríguez Errázuriz",
  role: "",
  collab: "",
  area: "Branding / Packaging / Gráfico",
  year: "2020",
  url: "https://www.behance.net/gallery/100930229/Diseno-de-cajas-para-puzzles"
},

/* ------------------ Real Travel App — Colomba Plass ------------------ */
{
  src: "IMG/webp/051_Plass-colombaCaptura-de-pantalla-2026-03-12-a-las-11.21.45_ffcdd23af8.webp",
  srcAvif: "IMG/avif/051_Plass-colombaCaptura-de-pantalla-2026-03-12-a-las-11.21.45_ffcdd23af8.avif",
  srcSetAvif: "IMG/avif/variants/051_Plass-colombaCaptura-de-pantalla-2026-03-12-a-las-11.21.45_ffcdd23af8-640.avif 640w, IMG/avif/051_Plass-colombaCaptura-de-pantalla-2026-03-12-a-las-11.21.45_ffcdd23af8.avif 1052w",
  srcSetWebp: "IMG/webp/variants/051_Plass-colombaCaptura-de-pantalla-2026-03-12-a-las-11.21.45_ffcdd23af8-640.webp 640w, IMG/webp/051_Plass-colombaCaptura-de-pantalla-2026-03-12-a-las-11.21.45_ffcdd23af8.webp 1052w",
  srcOriginal: "IMG/remote-originals/051_Plass-colombaCaptura-de-pantalla-2026-03-12-a-las-11.21.45.png",
  orientation: "h",
  span: 1,
  tags: ["audiovisual","fotografía","dirección creativa"],
  title: "Real Travel App",
  author: "Colomba Plass",
  role: "diseñadora",
  collab: "Desarrollado en Cinco Estudio. Pieza audiovisual publicitaria para Real Travel",
  area: "Audiovisual / Fotografía / Dirección creativa",
  year: "N/A",
  url: "https://cinco-estudio.com/real-travel"
},

/* ------------------ Silla Mudra — Chiara Antillo Heilenkötter ------------------ */
{
  src: "IMG/webp/052_Chiara-Antillosilla-mudra-madera-escultural2_886efddeaf.webp",
  srcAvif: "IMG/avif/052_Chiara-Antillosilla-mudra-madera-escultural2_886efddeaf.avif",
  srcSetAvif: "IMG/avif/variants/052_Chiara-Antillosilla-mudra-madera-escultural2_886efddeaf-640.avif 640w, IMG/avif/variants/052_Chiara-Antillosilla-mudra-madera-escultural2_886efddeaf-1280.avif 1280w, IMG/avif/052_Chiara-Antillosilla-mudra-madera-escultural2_886efddeaf.avif 1860w",
  srcSetWebp: "IMG/webp/variants/052_Chiara-Antillosilla-mudra-madera-escultural2_886efddeaf-640.webp 640w, IMG/webp/variants/052_Chiara-Antillosilla-mudra-madera-escultural2_886efddeaf-1280.webp 1280w, IMG/webp/052_Chiara-Antillosilla-mudra-madera-escultural2_886efddeaf.webp 1860w",
  srcOriginal: "IMG/remote-originals/052_Chiara-Antillosilla-mudra-madera-escultural2.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","objeto"],
  title: "Silla Mudra",
  author: "Chiara Antillo Heilenkötter",
  role: "",
  collab: "Desarrollado en Anka Taller",
  area: "Producto / Industrial / Objeto",
  year: "N/A",
  url: ["https://www.instagram.com/p/DRj3ScXkWvl/?img_index=1","https://www.ankataller.com/collections/sillas/products/silla-mudra"]
},

/* ------------------ Silla alta Pliego — Chiara Antillo Heilenkötter ------------------ */
{
  src: "IMG/webp/053_Chiara-Antillosilla-2_2ff13a7a71.webp",
  srcAvif: "IMG/avif/053_Chiara-Antillosilla-2_2ff13a7a71.avif",
  srcSetAvif: "IMG/avif/variants/053_Chiara-Antillosilla-2_2ff13a7a71-640.avif 640w, IMG/avif/variants/053_Chiara-Antillosilla-2_2ff13a7a71-1280.avif 1280w, IMG/avif/053_Chiara-Antillosilla-2_2ff13a7a71.avif 1860w",
  srcSetWebp: "IMG/webp/variants/053_Chiara-Antillosilla-2_2ff13a7a71-640.webp 640w, IMG/webp/variants/053_Chiara-Antillosilla-2_2ff13a7a71-1280.webp 1280w, IMG/webp/053_Chiara-Antillosilla-2_2ff13a7a71.webp 1860w",
  srcOriginal: "IMG/remote-originals/053_Chiara-Antillosilla-2.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","objeto"],
  title: "Silla alta Pliego",
  author: "Chiara Antillo Heilenkötter",
  role: "",
  collab: "Desarrollado en Anka Taller",
  area: "Producto / Industrial / Objeto",
  year: "N/A",
  url: ["https://www.instagram.com/p/DRj3ScXkWvl/?img_index=1","https://www.ankataller.com/collections/sillas/products/silla-alta-pliego-taburete"]
},

/* ------------------ Historia de la infografía en Chile (2018) — Gonzalo Morales ------------------ */
{
  src: "IMG/webp/054_Captura-de-pantalla-2026-03-12-a-las-11.32.10_ace6f75341.webp",
  srcAvif: "IMG/avif/054_Captura-de-pantalla-2026-03-12-a-las-11.32.10_ace6f75341.avif",
  srcSetAvif: "IMG/avif/variants/054_Captura-de-pantalla-2026-03-12-a-las-11.32.10_ace6f75341-640.avif 640w, IMG/avif/variants/054_Captura-de-pantalla-2026-03-12-a-las-11.32.10_ace6f75341-1280.avif 1280w, IMG/avif/054_Captura-de-pantalla-2026-03-12-a-las-11.32.10_ace6f75341.avif 1696w",
  srcSetWebp: "IMG/webp/variants/054_Captura-de-pantalla-2026-03-12-a-las-11.32.10_ace6f75341-640.webp 640w, IMG/webp/variants/054_Captura-de-pantalla-2026-03-12-a-las-11.32.10_ace6f75341-1280.webp 1280w, IMG/webp/054_Captura-de-pantalla-2026-03-12-a-las-11.32.10_ace6f75341.webp 1696w",
  srcOriginal: "IMG/remote-originals/054_Captura-de-pantalla-2026-03-12-a-las-11.32.10.png",
  orientation: "sq",
  span: 2,
  tags: ["investigación","publicación académica"],
  title: "Historia de la infografía en Chile (2018)",
  author: "Gonzalo Morales",
  role: "",
  collab: "",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://www.academia.edu/36534358/Gonzalo_Morales_Historia_de_la_Infografía_en_Chile_2018_pdf"
},

/* ------------------ Afiche n°2 — Gianfranco Music Wachtendorff ------------------ */
{
  src: "IMG/webp/055_Gianfranco-Music-Wachtendorff-7485022f-8fb6-4b6e-888d-2462ee018664_rw_1200_55a85e3126.webp",
  srcAvif: "IMG/avif/055_Gianfranco-Music-Wachtendorff-7485022f-8fb6-4b6e-888d-2462ee018664_rw_1200_55a85e3126.avif",
  srcSetAvif: "IMG/avif/variants/055_Gianfranco-Music-Wachtendorff-7485022f-8fb6-4b6e-888d-2462ee018664_rw_1200_55a85e3126-640.avif 640w, IMG/avif/055_Gianfranco-Music-Wachtendorff-7485022f-8fb6-4b6e-888d-2462ee018664_rw_1200_55a85e3126.avif 1080w",
  srcSetWebp: "IMG/webp/variants/055_Gianfranco-Music-Wachtendorff-7485022f-8fb6-4b6e-888d-2462ee018664_rw_1200_55a85e3126-640.webp 640w, IMG/webp/055_Gianfranco-Music-Wachtendorff-7485022f-8fb6-4b6e-888d-2462ee018664_rw_1200_55a85e3126.webp 1080w",
  srcOriginal: "IMG/remote-originals/055_Gianfranco-Music-Wachtendorff-7485022f-8fb6-4b6e-888d-2462ee018664_rw_1200.jpeg",
  orientation: "sq",
  span: 2,
  tags: ["afiche","afiche digital","gráfico"],
  title: "Afiche n°2",
  author: "Gianfranco Music Wachtendorff",
  role: "",
  collab: "",
  area: "Afiche / Afiche digital / Gráfico",
  year: "2025",
  url: "https://gianfrancomw.myportfolio.com/posters-semana-novata-2023"
},

/* ------------------ Sin nombre — Gianfranco Music Wachtendorff ------------------ */
{
  src: "IMG/webp/056_Gianfranco-Music-3-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_6588d49517.webp",
  srcAvif: "IMG/avif/056_Gianfranco-Music-3-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_6588d49517.avif",
  srcSetAvif: "IMG/avif/variants/056_Gianfranco-Music-3-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_6588d49517-640.avif 640w, IMG/avif/variants/056_Gianfranco-Music-3-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_6588d49517-1280.avif 1280w, IMG/avif/056_Gianfranco-Music-3-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_6588d49517.avif 1920w",
  srcSetWebp: "IMG/webp/variants/056_Gianfranco-Music-3-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_6588d49517-640.webp 640w, IMG/webp/variants/056_Gianfranco-Music-3-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_6588d49517-1280.webp 1280w, IMG/webp/056_Gianfranco-Music-3-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920_6588d49517.webp 1920w",
  srcOriginal: "IMG/remote-originals/056_Gianfranco-Music-3-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920.jpeg",
  orientation: "v",
  span: 1,
  tags: ["fotografía","moda","editorial"],
  title: "Sin nombre",
  author: "Gianfranco Music Wachtendorff",
  role: "",
  collab: "",
  area: "Fotografía / Moda / Editorial",
  year: "N/A",
  url: "https://gianfrancomw.myportfolio.com/varios"
},

/* ------------------ Colección 3 Chol1: Bichos — Antonino Reinoso ------------------ */
{
  src: "IMG/webp/057_Captura-de-pantalla-2026-03-11-a-las-15.39.07_8270ae0d9b.webp",
  srcAvif: "IMG/avif/057_Captura-de-pantalla-2026-03-11-a-las-15.39.07_8270ae0d9b.avif",
  srcSetAvif: "IMG/avif/variants/057_Captura-de-pantalla-2026-03-11-a-las-15.39.07_8270ae0d9b-640.avif 640w, IMG/avif/variants/057_Captura-de-pantalla-2026-03-11-a-las-15.39.07_8270ae0d9b-1280.avif 1280w, IMG/avif/057_Captura-de-pantalla-2026-03-11-a-las-15.39.07_8270ae0d9b.avif 1942w",
  srcSetWebp: "IMG/webp/variants/057_Captura-de-pantalla-2026-03-11-a-las-15.39.07_8270ae0d9b-640.webp 640w, IMG/webp/variants/057_Captura-de-pantalla-2026-03-11-a-las-15.39.07_8270ae0d9b-1280.webp 1280w, IMG/webp/057_Captura-de-pantalla-2026-03-11-a-las-15.39.07_8270ae0d9b.webp 1942w",
  srcOriginal: "IMG/remote-originals/057_Captura-de-pantalla-2026-03-11-a-las-15.39.07.png",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial"],
  title: "Colección 3 Chol1: Bichos",
  author: "Antonino Reinoso",
  role: "",
  collab: "Producido en Chol1",
  area: "Producto / Industrial",
  year: "2019",
  url: "https://www.behance.net/gallery/84664443/Coleccion-3-Chol1-Bichos"
},

/* ------------------ Taboo* — Emilia Ferrari ------------------ */
{
  src: "IMG/webp/058_Captura-de-pantalla-2026-03-11-a-las-16.08.04_550eb1d1f0.webp",
  srcAvif: "IMG/avif/058_Captura-de-pantalla-2026-03-11-a-las-16.08.04_550eb1d1f0.avif",
  srcSetAvif: "IMG/avif/variants/058_Captura-de-pantalla-2026-03-11-a-las-16.08.04_550eb1d1f0-640.avif 640w, IMG/avif/variants/058_Captura-de-pantalla-2026-03-11-a-las-16.08.04_550eb1d1f0-1280.avif 1280w, IMG/avif/058_Captura-de-pantalla-2026-03-11-a-las-16.08.04_550eb1d1f0.avif 1756w",
  srcSetWebp: "IMG/webp/variants/058_Captura-de-pantalla-2026-03-11-a-las-16.08.04_550eb1d1f0-640.webp 640w, IMG/webp/variants/058_Captura-de-pantalla-2026-03-11-a-las-16.08.04_550eb1d1f0-1280.webp 1280w, IMG/webp/058_Captura-de-pantalla-2026-03-11-a-las-16.08.04_550eb1d1f0.webp 1756w",
  srcOriginal: "IMG/remote-originals/058_Captura-de-pantalla-2026-03-11-a-las-16.08.04.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Taboo*",
  author: "Emilia Ferrari",
  role: "",
  collab: "",
  area: "Branding / Identidad visual / Gráfico",
  year: "2024",
  url: "https://jueves13.work/taboo"
},

/* ------------------ dos2 — Emilia Ferrari ------------------ */
{
  src: "IMG/webp/059_Captura-de-pantalla-2026-03-11-a-las-15.42.59_7c4029b2e3.webp",
  srcAvif: "IMG/avif/059_Captura-de-pantalla-2026-03-11-a-las-15.42.59_7c4029b2e3.avif",
  srcSetAvif: "IMG/avif/variants/059_Captura-de-pantalla-2026-03-11-a-las-15.42.59_7c4029b2e3-640.avif 640w, IMG/avif/variants/059_Captura-de-pantalla-2026-03-11-a-las-15.42.59_7c4029b2e3-1280.avif 1280w, IMG/avif/059_Captura-de-pantalla-2026-03-11-a-las-15.42.59_7c4029b2e3.avif 1644w",
  srcSetWebp: "IMG/webp/variants/059_Captura-de-pantalla-2026-03-11-a-las-15.42.59_7c4029b2e3-640.webp 640w, IMG/webp/variants/059_Captura-de-pantalla-2026-03-11-a-las-15.42.59_7c4029b2e3-1280.webp 1280w, IMG/webp/059_Captura-de-pantalla-2026-03-11-a-las-15.42.59_7c4029b2e3.webp 1644w",
  srcOriginal: "IMG/remote-originals/059_Captura-de-pantalla-2026-03-11-a-las-15.42.59.png",
  orientation: "v",
  span: 1,
  tags: ["ux","ui","servicio"],
  title: "dos2",
  author: "Emilia Ferrari",
  role: "",
  collab: "Proyecto de título",
  area: "UX / UI / Servicio",
  year: "2025",
  url: "https://www.behance.net/gallery/225638573/dos2"
},

/* ------------------ Mueble Don Melchor — Carolina Planas ------------------ */
{
  src: "IMG/webp/060_43fef9_efcf8eedf8d33bba27b941bb467583a7.jpg_1fa9c788a2.webp",
  srcAvif: "IMG/avif/060_43fef9_efcf8eedf8d33bba27b941bb467583a7.jpg_1fa9c788a2.avif",
  srcSetAvif: "IMG/avif/variants/060_43fef9_efcf8eedf8d33bba27b941bb467583a7.jpg_1fa9c788a2-640.avif 640w, IMG/avif/variants/060_43fef9_efcf8eedf8d33bba27b941bb467583a7.jpg_1fa9c788a2-1280.avif 1280w, IMG/avif/060_43fef9_efcf8eedf8d33bba27b941bb467583a7.jpg_1fa9c788a2.avif 2106w",
  srcSetWebp: "IMG/webp/variants/060_43fef9_efcf8eedf8d33bba27b941bb467583a7.jpg_1fa9c788a2-640.webp 640w, IMG/webp/variants/060_43fef9_efcf8eedf8d33bba27b941bb467583a7.jpg_1fa9c788a2-1280.webp 1280w, IMG/webp/060_43fef9_efcf8eedf8d33bba27b941bb467583a7.jpg_1fa9c788a2.webp 2106w",
  srcOriginal: "IMG/remote-originals/060_43fef9_efcf8eedf8d33bba27b941bb467583a7.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["industrial","espacios","vitrinaje"],
  title: "Mueble Don Melchor",
  author: "Carolina Planas",
  role: "",
  collab: "",
  area: "Industrial / Espacios / Vitrinaje",
  year: "N/A",
  url: "https://caroplanas.wixsite.com/caroplanasi"
},

/* ------------------ RRSS - Viela — Antonella Vila Garcia ------------------ */
{
  src: "IMG/webp/061_Captura-de-pantalla-2026-03-11-a-las-15.47.30_f0f76b49fc.webp",
  srcAvif: "IMG/avif/061_Captura-de-pantalla-2026-03-11-a-las-15.47.30_f0f76b49fc.avif",
  srcSetAvif: "IMG/avif/variants/061_Captura-de-pantalla-2026-03-11-a-las-15.47.30_f0f76b49fc-640.avif 640w, IMG/avif/061_Captura-de-pantalla-2026-03-11-a-las-15.47.30_f0f76b49fc.avif 1118w",
  srcSetWebp: "IMG/webp/variants/061_Captura-de-pantalla-2026-03-11-a-las-15.47.30_f0f76b49fc-640.webp 640w, IMG/webp/061_Captura-de-pantalla-2026-03-11-a-las-15.47.30_f0f76b49fc.webp 1118w",
  srcOriginal: "IMG/remote-originals/061_Captura-de-pantalla-2026-03-11-a-las-15.47.30.png",
  orientation: "v",
  span: 1,
  tags: ["rrss","gráfico"],
  title: "RRSS - Viela",
  author: "Antonella Vila Garcia",
  role: "",
  collab: "",
  area: "RRSS / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/172562123/Post-historias-de-instagram"
},

/* ------------------ Viella — Antonella Vila Garcia ------------------ */
{
  src: "IMG/webp/062_Captura-de-pantalla-2026-03-11-a-las-15.48.30_1f7c922a6a.webp",
  srcAvif: "IMG/avif/062_Captura-de-pantalla-2026-03-11-a-las-15.48.30_1f7c922a6a.avif",
  srcSetAvif: "IMG/avif/variants/062_Captura-de-pantalla-2026-03-11-a-las-15.48.30_1f7c922a6a-640.avif 640w, IMG/avif/variants/062_Captura-de-pantalla-2026-03-11-a-las-15.48.30_1f7c922a6a-1280.avif 1280w, IMG/avif/062_Captura-de-pantalla-2026-03-11-a-las-15.48.30_1f7c922a6a.avif 1430w",
  srcSetWebp: "IMG/webp/variants/062_Captura-de-pantalla-2026-03-11-a-las-15.48.30_1f7c922a6a-640.webp 640w, IMG/webp/variants/062_Captura-de-pantalla-2026-03-11-a-las-15.48.30_1f7c922a6a-1280.webp 1280w, IMG/webp/062_Captura-de-pantalla-2026-03-11-a-las-15.48.30_1f7c922a6a.webp 1430w",
  srcOriginal: "IMG/remote-originals/062_Captura-de-pantalla-2026-03-11-a-las-15.48.30.png",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Viella",
  author: "Antonella Vila Garcia",
  role: "",
  collab: "",
  area: "Branding / Identidad visual / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/161160095/Identidad-Viella"
},

/* ------------------ Proust Cerámica — Magdalena Proust Iligaray ------------------ */
{
  src: "IMG/webp/063_Captura-de-pantalla-2026-03-11-a-las-15.53.10_e892972327.webp",
  srcAvif: "IMG/avif/063_Captura-de-pantalla-2026-03-11-a-las-15.53.10_e892972327.avif",
  srcSetAvif: "IMG/avif/variants/063_Captura-de-pantalla-2026-03-11-a-las-15.53.10_e892972327-640.avif 640w, IMG/avif/variants/063_Captura-de-pantalla-2026-03-11-a-las-15.53.10_e892972327-1280.avif 1280w, IMG/avif/063_Captura-de-pantalla-2026-03-11-a-las-15.53.10_e892972327.avif 1900w",
  srcSetWebp: "IMG/webp/variants/063_Captura-de-pantalla-2026-03-11-a-las-15.53.10_e892972327-640.webp 640w, IMG/webp/variants/063_Captura-de-pantalla-2026-03-11-a-las-15.53.10_e892972327-1280.webp 1280w, IMG/webp/063_Captura-de-pantalla-2026-03-11-a-las-15.53.10_e892972327.webp 1900w",
  srcOriginal: "IMG/remote-originals/063_Captura-de-pantalla-2026-03-11-a-las-15.53.10.png",
  orientation: "v",
  span: 1,
  tags: ["producto","artesanía"],
  title: "Proust Cerámica",
  author: "Magdalena Proust Iligaray",
  role: "diseñadora/ceramista",
  collab: "",
  area: "Producto / Artesanía",
  year: "N/A",
  url: "https://www.instagram.com/proust.ceramica/"
},

/* ------------------ COSTA — Andrés Valdivieso Vera ------------------ */
{
  src: "IMG/webp/064_Captura-de-pantalla-2026-03-11-a-las-16.03.13_53df16302f.webp",
  srcAvif: "IMG/avif/064_Captura-de-pantalla-2026-03-11-a-las-16.03.13_53df16302f.avif",
  srcSetAvif: "IMG/avif/variants/064_Captura-de-pantalla-2026-03-11-a-las-16.03.13_53df16302f-640.avif 640w, IMG/avif/variants/064_Captura-de-pantalla-2026-03-11-a-las-16.03.13_53df16302f-1280.avif 1280w, IMG/avif/064_Captura-de-pantalla-2026-03-11-a-las-16.03.13_53df16302f.avif 1950w",
  srcSetWebp: "IMG/webp/variants/064_Captura-de-pantalla-2026-03-11-a-las-16.03.13_53df16302f-640.webp 640w, IMG/webp/variants/064_Captura-de-pantalla-2026-03-11-a-las-16.03.13_53df16302f-1280.webp 1280w, IMG/webp/064_Captura-de-pantalla-2026-03-11-a-las-16.03.13_53df16302f.webp 1950w",
  srcOriginal: "IMG/remote-originals/064_Captura-de-pantalla-2026-03-11-a-las-16.03.13.png",
  orientation: "v",
  span: 1,
  tags: ["producto"],
  title: "COSTA",
  author: "Andrés Valdivieso Vera",
  role: "",
  collab: "Claudia Marcano",
  area: "Producto",
  year: "2025",
  url: "https://www.behance.net/gallery/218091267/COSTA-Designed-with-HyphaLite"
},
/* ------------------ Campaña Funa y Acoso — Pilar Saavedra ------------------ */
{
  src: "IMG/webp/065_Saavedra-Pilar-Captura-de-pantalla-2026-03-11-a-las-13.10.59_c9b3301eb9.webp",
  srcAvif: "IMG/avif/065_Saavedra-Pilar-Captura-de-pantalla-2026-03-11-a-las-13.10.59_c9b3301eb9.avif",
  srcSetAvif: "IMG/avif/065_Saavedra-Pilar-Captura-de-pantalla-2026-03-11-a-las-13.10.59_c9b3301eb9.avif 616w",
  srcSetWebp: "IMG/webp/065_Saavedra-Pilar-Captura-de-pantalla-2026-03-11-a-las-13.10.59_c9b3301eb9.webp 616w",
  srcOriginal: "IMG/remote-originals/065_Saavedra-Pilar-Captura-de-pantalla-2026-03-11-a-las-13.10.59.png",
  orientation: "v",
  span: 2,
  tags: ["afiche"],
  title: "Campaña Funa y Acoso",
  author: "Pilar Saavedra",
  role: "",
  collab: "",
  area: "Afiche",
  year: "2023",
  url: "https://pilar-fundamental.com/campana-ugn"
},

/* ------------------ Pequén — Elisa Aguirre ------------------ */
{
  src: "IMG/webp/066_Aguirre-Elisa-3c82918c-ebd6-4a47-892e-220fb1ee7cba_rw_3840_b8a11ecdd5.webp",
  srcAvif: "IMG/avif/066_Aguirre-Elisa-3c82918c-ebd6-4a47-892e-220fb1ee7cba_rw_3840_b8a11ecdd5.avif",
  srcSetAvif: "IMG/avif/variants/066_Aguirre-Elisa-3c82918c-ebd6-4a47-892e-220fb1ee7cba_rw_3840_b8a11ecdd5-640.avif 640w, IMG/avif/variants/066_Aguirre-Elisa-3c82918c-ebd6-4a47-892e-220fb1ee7cba_rw_3840_b8a11ecdd5-1280.avif 1280w, IMG/avif/066_Aguirre-Elisa-3c82918c-ebd6-4a47-892e-220fb1ee7cba_rw_3840_b8a11ecdd5.avif 3840w",
  srcSetWebp: "IMG/webp/variants/066_Aguirre-Elisa-3c82918c-ebd6-4a47-892e-220fb1ee7cba_rw_3840_b8a11ecdd5-640.webp 640w, IMG/webp/variants/066_Aguirre-Elisa-3c82918c-ebd6-4a47-892e-220fb1ee7cba_rw_3840_b8a11ecdd5-1280.webp 1280w, IMG/webp/066_Aguirre-Elisa-3c82918c-ebd6-4a47-892e-220fb1ee7cba_rw_3840_b8a11ecdd5.webp 3840w",
  srcOriginal: "IMG/remote-originals/066_Aguirre-Elisa-3c82918c-ebd6-4a47-892e-220fb1ee7cba_rw_3840.png",
  orientation: "h",
  span: 1,
  tags: ["branding","gráfico","educación"],
  title: "Pequén",
  author: "Elisa Aguirre",
  role: "",
  collab: "Proyecto estudiantil",
  area: "Branding / Gráfico / Educación",
  year: "2025",
  url: "https://elisaaguirred.myportfolio.com/pequen"
},

/* ------------------ Paneles Voladores — Hugo Palmarola ------------------ */
{
  src: "IMG/webp/067_a-740x1024-1_f086e52547.webp",
  srcAvif: "IMG/avif/067_a-740x1024-1_f086e52547.avif",
  srcSetAvif: "IMG/avif/variants/067_a-740x1024-1_f086e52547-640.avif 640w, IMG/avif/067_a-740x1024-1_f086e52547.avif 740w",
  srcSetWebp: "IMG/webp/variants/067_a-740x1024-1_f086e52547-640.webp 640w, IMG/webp/067_a-740x1024-1_f086e52547.webp 740w",
  srcOriginal: "IMG/remote-originals/067_a-740x1024-1.png",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Paneles Voladores",
  author: "Hugo Palmarola",
  role: "",
  collab: "Pedro Ignacio Alonso (coautor). Libro ISBN: 9789561424135",
  area: "Investigación / Publicación académica",
  year: "2019",
  url: [
    "https://www.academia.edu/43825467/Pedro_Alonso_y_Hugo_Palmarola_editores_Paneles_Voladores_Cómo_los_paneles_de_hormigón_cambiaron_el_mundo_Dom_Publishers_Ediciones_UC_Berlín_2019_Indice_Prefacio_Biografías_",
    "https://diseno.uc.cl/2020/05/libro-paneles-voladores/"
  ]
},

/* ------------------ Cosmopolitical encounters — Pablo Hermansen ------------------ */
{
  src: "IMG/webp/068_rjce_a_1433705_f0002_c_1c688705cb.webp",
  srcAvif: "IMG/avif/068_rjce_a_1433705_f0002_c_1c688705cb.avif",
  srcSetAvif: "IMG/avif/068_rjce_a_1433705_f0002_c_1c688705cb.avif 311w",
  srcSetWebp: "IMG/webp/068_rjce_a_1433705_f0002_c_1c688705cb.webp 311w",
  srcOriginal: "IMG/remote-originals/068_rjce_a_1433705_f0002_c.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Cosmopolitical encounters: Prototyping at the National Zoo",
  author: "Pablo Hermansen",
  role: "",
  collab: "Coautor: Martín Tironi. Journal of Cultural Economy 11:4",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: [
    "https://repositorio.uc.cl/handle/11534/28039",
    "https://www.researchgate.net/publication/323367706_Cosmopolitical_encounters_Prototyping_at_the_National_Zoo_in_Santiago_Chile"
  ]
},

/* ------------------ Hacer y componer — Francisco Gálvez ------------------ */
{
  src: "IMG/webp/069_hacer_y_componer-1-768x1121_b8178929ce.webp",
  srcAvif: "IMG/avif/069_hacer_y_componer-1-768x1121_b8178929ce.avif",
  srcSetAvif: "IMG/avif/variants/069_hacer_y_componer-1-768x1121_b8178929ce-640.avif 640w, IMG/avif/069_hacer_y_componer-1-768x1121_b8178929ce.avif 768w",
  srcSetWebp: "IMG/webp/variants/069_hacer_y_componer-1-768x1121_b8178929ce-640.webp 640w, IMG/webp/069_hacer_y_componer-1-768x1121_b8178929ce.webp 768w",
  srcOriginal: "IMG/remote-originals/069_hacer_y_componer-1-768x1121.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Hacer y componer: una introducción a la tipografía",
  author: "Francisco Gálvez",
  role: "Diseñador/autor",
  collab: "",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://catalogoadquisiciondelibros.cultura.gob.cl/libro/hacer-y-componer/"
},

/* ------------------ Hacer y componer 2.0 — Francisco Gálvez ------------------ */
{
  src: "IMG/webp/070_51iAgF1DOuL._AC_UF1000-1000_QL80__cf3339ef14.webp",
  srcAvif: "IMG/avif/070_51iAgF1DOuL._AC_UF1000-1000_QL80__cf3339ef14.avif",
  srcSetAvif: "IMG/avif/variants/070_51iAgF1DOuL._AC_UF1000-1000_QL80__cf3339ef14-640.avif 640w, IMG/avif/070_51iAgF1DOuL._AC_UF1000-1000_QL80__cf3339ef14.avif 699w",
  srcSetWebp: "IMG/webp/variants/070_51iAgF1DOuL._AC_UF1000-1000_QL80__cf3339ef14-640.webp 640w, IMG/webp/070_51iAgF1DOuL._AC_UF1000-1000_QL80__cf3339ef14.webp 699w",
  srcOriginal: "IMG/remote-originals/070_51iAgF1DOuL._AC_UF1000-1000_QL80_.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Hacer y componer: una introducción a la tipografía 2.0",
  author: "Francisco Gálvez",
  role: "Diseñador/autor",
  collab: "",
  area: "Investigación / Publicación académica",
  year: "2024",
  url: "https://diseno.uc.cl/2025/05/lanzamiento-hacer-componer-2-0-una-introduccion-a-la-tipografia/"
},

/* ------------------ Pedagogías para habitar el jardín infantil — Patricia Manns ------------------ */
{
  src: "IMG/webp/071_813k52dMx9L._AC_UF1000-1000_QL80__768b5722c2.webp",
  srcAvif: "IMG/avif/071_813k52dMx9L._AC_UF1000-1000_QL80__768b5722c2.avif",
  srcSetAvif: "IMG/avif/variants/071_813k52dMx9L._AC_UF1000-1000_QL80__768b5722c2-640.avif 640w, IMG/avif/071_813k52dMx9L._AC_UF1000-1000_QL80__768b5722c2.avif 750w",
  srcSetWebp: "IMG/webp/variants/071_813k52dMx9L._AC_UF1000-1000_QL80__768b5722c2-640.webp 640w, IMG/webp/071_813k52dMx9L._AC_UF1000-1000_QL80__768b5722c2.webp 750w",
  srcOriginal: "IMG/remote-originals/071_813k52dMx9L._AC_UF1000-1000_QL80_.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Pedagogías para habitar el jardín infantil",
  author: "Patricia Manns",
  role: "",
  collab: "Autores: Patricia Manns, Cynthia Adlerstein, Alberto González. Editorial: Ediciones UC",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://lea.uc.cl/pedagogias-para-habitar-el-jardin-infantil-reimpresion-primera-edicion-2018/p"
},

/* ------------------ Pedagogías para habitar el jardín infantil — Alberto González ------------------ */
{
  src: "IMG/webp/072_158400-1200-auto_590ba6fc4a.webp",
  srcAvif: "IMG/avif/072_158400-1200-auto_590ba6fc4a.avif",
  srcSetAvif: "IMG/avif/variants/072_158400-1200-auto_590ba6fc4a-640.avif 640w, IMG/avif/072_158400-1200-auto_590ba6fc4a.avif 1000w",
  srcSetWebp: "IMG/webp/variants/072_158400-1200-auto_590ba6fc4a-640.webp 640w, IMG/webp/072_158400-1200-auto_590ba6fc4a.webp 1000w",
  srcOriginal: "IMG/remote-originals/072_158400-1200-auto.jpg",
  orientation: "sq",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Pedagogías para habitar el jardín infantil",
  author: "Alberto González",
  role: "",
  collab: "Autores: Patricia Manns, Cynthia Adlerstein, Alberto González. Editorial: Ediciones UC",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://lea.uc.cl/pedagogias-para-habitar-el-jardin-infantil-reimpresion-primera-edicion-2018/p"
},

/* ------------------ RutaCL Typeface — Rodrigo Ramírez ------------------ */
{
  src: "IMG/webp/073_mini_magick20180818-12931-p4pb7n_74f1782d00.webp",
  srcAvif: "IMG/avif/073_mini_magick20180818-12931-p4pb7n_74f1782d00.avif",
  srcSetAvif: "IMG/avif/variants/073_mini_magick20180818-12931-p4pb7n_74f1782d00-640.avif 640w, IMG/avif/variants/073_mini_magick20180818-12931-p4pb7n_74f1782d00-1280.avif 1280w, IMG/avif/073_mini_magick20180818-12931-p4pb7n_74f1782d00.avif 1304w",
  srcSetWebp: "IMG/webp/variants/073_mini_magick20180818-12931-p4pb7n_74f1782d00-640.webp 640w, IMG/webp/variants/073_mini_magick20180818-12931-p4pb7n_74f1782d00-1280.webp 1280w, IMG/webp/073_mini_magick20180818-12931-p4pb7n_74f1782d00.webp 1304w",
  srcOriginal: "IMG/remote-originals/073_mini_magick20180818-12931-p4pb7n.png",
  orientation: "h",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "The design of RutaCL: Developing and measuring performance for highway typeface",
  author: "Rodrigo Ramírez",
  role: "",
  collab: "Autores: Francisco Gálvez Pizarro, Victoria Gallardo, Rodrigo Ramírez Montecinos",
  area: "Investigación / Publicación académica",
  year: "2016",
  url: [
    "https://bibliotecadigital.oducal.com/Record/ir-11534-38819",
    "https://repositorio.uc.cl/handle/11534/38819"
  ]
},

/* ------------------ Resistencia gráfica. Dictadura en Chile (APJ – Tallersol) — Nicole Cristi ------------------ */
{
  src: "IMG/webp/074_Cristi-Nicole-Captura-de-pantalla-2026-03-11-a-las-11.25.22_cabf93b65f.webp",
  srcAvif: "IMG/avif/074_Cristi-Nicole-Captura-de-pantalla-2026-03-11-a-las-11.25.22_cabf93b65f.avif",
  srcSetAvif: "IMG/avif/variants/074_Cristi-Nicole-Captura-de-pantalla-2026-03-11-a-las-11.25.22_cabf93b65f-640.avif 640w, IMG/avif/074_Cristi-Nicole-Captura-de-pantalla-2026-03-11-a-las-11.25.22_cabf93b65f.avif 780w",
  srcSetWebp: "IMG/webp/variants/074_Cristi-Nicole-Captura-de-pantalla-2026-03-11-a-las-11.25.22_cabf93b65f-640.webp 640w, IMG/webp/074_Cristi-Nicole-Captura-de-pantalla-2026-03-11-a-las-11.25.22_cabf93b65f.webp 780w",
  srcOriginal: "IMG/remote-originals/074_Cristi-Nicole-Captura-de-pantalla-2026-03-11-a-las-11.25.22.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","investigación"],
  title: "Resistencia gráfica. Dictadura en Chile (APJ – Tallersol)",
  author: "Nicole Cristi",
  role: "",
  collab: "Co-autora: Javiera Manzi",
  area: "Editorial / Investigación",
  year: "2016",
  url: [
    "https://www.uc.cl/agenda/actividad/presentacion-de-investigacion-resistencia-grafica-dictadura-en-chile-apj-tallersol",
    "https://artishockrevista.com/2016/06/13/resistencia-grafica-dictadura-chile-apj-tallersol"
  ]
},

    /* ------------- Sofía Garrido ------------- */
    {
      src: "IMG/webp/075_Sofia-Garrido_f2cb8169b6.webp",
      srcAvif: "IMG/avif/075_Sofia-Garrido_f2cb8169b6.avif",
      srcSetAvif: "IMG/avif/variants/075_Sofia-Garrido_f2cb8169b6-640.avif 640w, IMG/avif/variants/075_Sofia-Garrido_f2cb8169b6-1280.avif 1280w, IMG/avif/075_Sofia-Garrido_f2cb8169b6.avif 2251w",
      srcSetWebp: "IMG/webp/variants/075_Sofia-Garrido_f2cb8169b6-640.webp 640w, IMG/webp/variants/075_Sofia-Garrido_f2cb8169b6-1280.webp 1280w, IMG/webp/075_Sofia-Garrido_f2cb8169b6.webp 2251w",
      srcOriginal: "IMG/remote-originals/075_Sofia-Garrido.jpg",
      orientation: "h",
      span: 2,
      tags: ["editorial"],
      title: "INSTRUCCIONES PARA DIBUJAR SU CAMINAR",
      author: "Sofía Garrido",
      role: "",
      collab: "",
      area: "Editorial",
      year: "2020",
      url: "https://sofiagarrido.work/Instrucciones"
    },
    {
      src: "IMG/webp/076_sofia-garrido-2_91a8b39eb6.webp",
      srcAvif: "IMG/avif/076_sofia-garrido-2_91a8b39eb6.avif",
      srcSetAvif: "IMG/avif/variants/076_sofia-garrido-2_91a8b39eb6-640.avif 640w, IMG/avif/variants/076_sofia-garrido-2_91a8b39eb6-1280.avif 1280w, IMG/avif/076_sofia-garrido-2_91a8b39eb6.avif 1453w",
      srcSetWebp: "IMG/webp/variants/076_sofia-garrido-2_91a8b39eb6-640.webp 640w, IMG/webp/variants/076_sofia-garrido-2_91a8b39eb6-1280.webp 1280w, IMG/webp/076_sofia-garrido-2_91a8b39eb6.webp 1453w",
      srcOriginal: "IMG/remote-originals/076_sofia-garrido-2.jpg",
      orientation: "v",
      span: 2,
      tags: ["editorial","Publicación digital"],
      title: "Magma Magazine",
      author: "Sofía Garrido",
      role: "",
      collab: "Magdalena Derosas, Esteban Sandoval",
      area: "Editorial",
      year: "2021",
      url: "https://sofiagarrido.work/Magma-Magazine"
    },

    /* ------------- Música — Vicente Acuña ------------- */
    {
      src: "IMG/webp/077_600x600bf-60_744d5a9ad3.webp",
      srcAvif: "IMG/avif/077_600x600bf-60_744d5a9ad3.avif",
      srcSetAvif: "IMG/avif/077_600x600bf-60_744d5a9ad3.avif 600w",
      srcSetWebp: "IMG/webp/077_600x600bf-60_744d5a9ad3.webp 600w",
      srcOriginal: "IMG/remote-originals/077_600x600bf-60.jpg",
      orientation: "sq",
      span: 2,
      tags: ["Música","dirección de arte","Portada de disco"],
      title: "Consideraciones Generales",
      author: "Vicente Acuña",
      role: "",
      collab: "Fosfenos",
      area: "Música",
      year: "2024",
      url: "https://open.spotify.com/intl-es/album/6b3ijspHJK294Ao2HM5eWJ?si=e_KzcDHuTmabWIE5BYPMFA"
    },

    /* ------------- felicidad — Vicente Acuña ------------- */
    {
      src: "IMG/webp/078_Acuna-Vicente-SSF_CASE_Felicidadpublica_19_e9a9c069d9.webp",
      srcAvif: "IMG/avif/078_Acuna-Vicente-SSF_CASE_Felicidadpublica_19_e9a9c069d9.avif",
      srcSetAvif: "IMG/avif/variants/078_Acuna-Vicente-SSF_CASE_Felicidadpublica_19_e9a9c069d9-640.avif 640w, IMG/avif/078_Acuna-Vicente-SSF_CASE_Felicidadpublica_19_e9a9c069d9.avif 1161w",
      srcSetWebp: "IMG/webp/variants/078_Acuna-Vicente-SSF_CASE_Felicidadpublica_19_e9a9c069d9-640.webp 640w, IMG/webp/078_Acuna-Vicente-SSF_CASE_Felicidadpublica_19_e9a9c069d9.webp 1161w",
      srcOriginal: "IMG/remote-originals/078_Acuna-Vicente-SSF_CASE_Felicidadpublica_19.png",
      orientation: "v",
      span: 2,
      tags: ["Gráfico","Branding"],
      title: "Museum Site Santa Fe",
      author: "Vicente Acuña",
      role: "Diseñador",
      collab: "Desarrollado en: Felicidad Pública. Design Direction: Simón Sepúlveda, Piedad Rivadeneira. Creative Direction: Simón Sepúlveda. Graphic Design: Pau Geis, Antonia Guzmán, Vicente Acuña",
      area: "Gráfico / Branding",
      year: "2022",
      url: "https://felicidadpublica.cl/project/site-santa-fe/"
    },

    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-16-a-las-17.56.23_0ae367c7f7.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-16-a-las-17.56.23_0ae367c7f7.avif",
      srcSetAvif: "IMG/avif/Captura-de-pantalla-2026-03-16-a-las-17.56.23_0ae367c7f7.avif 634w",
      srcSetWebp: "IMG/webp/Captura-de-pantalla-2026-03-16-a-las-17.56.23_0ae367c7f7.webp 634w",
      srcOriginal: "https://freight.cargo.site/t/original/i/U2843133799052803512373283861187/Captura-de-pantalla-2026-03-16-a-las-17.56.23.png",
      orientation: "v",
      span: 2,
      tags: ["animación","Motion Graphics"],
      title: "The Name Club",
      author: "Vicente Acuña",
      role: "Diseñador",
      collab: "Desarrollado en: Otros Pérez.",
      area: "Gráfico / animación / Motion Graphics",
      year: "2025",
      url: "https://www.instagram.com/reel/DKxHrSQRn7Z/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    

    /* ------------- Gracia González — SIENTO EL VIENTO ------------- */
    {
      src: "IMG/webp/079_Captura-de-pantalla-2025-10-01-a-las-14.33.36_79420c1d28.webp",
      srcAvif: "IMG/avif/079_Captura-de-pantalla-2025-10-01-a-las-14.33.36_79420c1d28.avif",
      srcSetAvif: "IMG/avif/variants/079_Captura-de-pantalla-2025-10-01-a-las-14.33.36_79420c1d28-640.avif 640w, IMG/avif/079_Captura-de-pantalla-2025-10-01-a-las-14.33.36_79420c1d28.avif 734w",
      srcSetWebp: "IMG/webp/variants/079_Captura-de-pantalla-2025-10-01-a-las-14.33.36_79420c1d28-640.webp 640w, IMG/webp/079_Captura-de-pantalla-2025-10-01-a-las-14.33.36_79420c1d28.webp 734w",
      srcOriginal: "IMG/remote-originals/079_Captura-de-pantalla-2025-10-01-a-las-14.33.36.png",
      orientation: "h",
      span: 2,
      tags: ["editorial","Experimental","educación"],
      title: "SIENTO EL VIENTO",
      author: "Gracia González",
      role: "",
      collab: "Editorial Amanuta (colaboración editorial)",
      area: "Editorial / Experimental / Educación",
      year: "2022",
      url: "https://graciastudio.cl/"
    },

    /* ------------- DIÁLOGOS IMPRESOS ------------- */
    {
      src: "IMG/webp/080_IL-POSO_e4f7d7f99c.webp",
      srcAvif: "IMG/avif/080_IL-POSO_e4f7d7f99c.avif",
      srcSetAvif: "IMG/avif/variants/080_IL-POSO_e4f7d7f99c-640.avif 640w, IMG/avif/variants/080_IL-POSO_e4f7d7f99c-1280.avif 1280w, IMG/avif/080_IL-POSO_e4f7d7f99c.avif 2022w",
      srcSetWebp: "IMG/webp/variants/080_IL-POSO_e4f7d7f99c-640.webp 640w, IMG/webp/variants/080_IL-POSO_e4f7d7f99c-1280.webp 1280w, IMG/webp/080_IL-POSO_e4f7d7f99c.webp 2022w",
      srcOriginal: "IMG/remote-originals/080_IL-POSO.jpg",
      orientation: "h",
      span: 2,
      tags: ["Museografia","Exposición de arte","editorial"],
      title: "DIÁLOGOS IMPRESOS",
      author: "Gracia González, Alejandra Amenábar",
      role: "",
      collab: "Taller UC, Il Posto",
      area: "Museografía / Exposición / Editorial",
      year: "2024",
      url: [
        "https://graciastudio.cl/35/",
        "https://diseno.uc.cl/2024/11/estudiantes-de-diseno-uc-crean-exposicion-para-il-posto/"
      ]
    },

    /* =================== NUEVOS PROYECTOS =================== */

    /* ------------- 60 años Kérastase ------------- */
    {
      src: "IMG/webp/081_finat_1_98080c7111.webp",
      srcAvif: "IMG/avif/081_finat_1_98080c7111.avif",
      srcSetAvif: "IMG/avif/variants/081_finat_1_98080c7111-640.avif 640w, IMG/avif/variants/081_finat_1_98080c7111-1280.avif 1280w, IMG/avif/081_finat_1_98080c7111.avif 1442w",
      srcSetWebp: "IMG/webp/variants/081_finat_1_98080c7111-640.webp 640w, IMG/webp/variants/081_finat_1_98080c7111-1280.webp 1280w, IMG/webp/081_finat_1_98080c7111.webp 1442w",
      srcOriginal: "IMG/remote-originals/081_finat_1.jpg",
      orientation: "sq",
      span: 1,
      tags: ["Fotografía"],
      title: "60 años Kérastase",
      author: "Francisco Finat (fotografía)",
      role: "",
      collab: "Fotografía: Francisco Finat",
      area: "Fotografía",
      year: "2025",
      url: "https://www.instagram.com/p/DG1Km0yyJsd/?hl=es&img_index=1"
    },

    /* ------------- Avita — imagen Bustos ------------- */
    {
      src: "IMG/webp/082_bustos_1_4c7f23baf4.webp",
      srcAvif: "IMG/avif/082_bustos_1_4c7f23baf4.avif",
      srcSetAvif: "IMG/avif/variants/082_bustos_1_4c7f23baf4-640.avif 640w, IMG/avif/082_bustos_1_4c7f23baf4.avif 1032w",
      srcSetWebp: "IMG/webp/variants/082_bustos_1_4c7f23baf4-640.webp 640w, IMG/webp/082_bustos_1_4c7f23baf4.webp 1032w",
      srcOriginal: "IMG/remote-originals/082_bustos_1.png",
      orientation: "v",
      span: 1,
      tags: ["Dirección de arte","Dirección creativa","Moda"],
      title: "Avita",
      author: "María Fernanda Gonzalez",
      role: "",
      collab: "Josefa Bustos, Ferni González",
      area: "Arte / Dirección creativa / Moda",
      year: "—",
      url: "https://individual-frame-992587.framer.app/art-direction"
    },
    /* ------------------ Biosfera Somos Agua — Josefina Carvalho ------------------ */
{
  src: "IMG/webp/083_Captura-de-pantalla-2026-03-12-a-las-19.28.41_c0ef9c7b93.webp",
  srcAvif: "IMG/avif/083_Captura-de-pantalla-2026-03-12-a-las-19.28.41_c0ef9c7b93.avif",
  srcSetAvif: "IMG/avif/variants/083_Captura-de-pantalla-2026-03-12-a-las-19.28.41_c0ef9c7b93-640.avif 640w, IMG/avif/083_Captura-de-pantalla-2026-03-12-a-las-19.28.41_c0ef9c7b93.avif 1234w",
  srcSetWebp: "IMG/webp/variants/083_Captura-de-pantalla-2026-03-12-a-las-19.28.41_c0ef9c7b93-640.webp 640w, IMG/webp/083_Captura-de-pantalla-2026-03-12-a-las-19.28.41_c0ef9c7b93.webp 1234w",
  srcOriginal: "IMG/remote-originals/083_Captura-de-pantalla-2026-03-12-a-las-19.28.41.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Biosfera Somos Agua",
  author: "Josefina Carvalho",
  role: "",
  collab: "Autor del libro: Juan Pablo Orrego. Diagramación e ilustración: Josefina Carvalho, Magdalena Larraín",
  area: "Editorial / Ilustración / Ecología",
  year: "2021",
  url: "https://www.instagram.com/p/CQG4mvRDHNH/?img_index=1"
},

/* ------------------ Biosfera Somos Agua — Magdalena Larraín ------------------ */
{
  src: "IMG/webp/084_Captura-de-pantalla-2026-03-12-a-las-19.28.49_4b59b2c024.webp",
  srcAvif: "IMG/avif/084_Captura-de-pantalla-2026-03-12-a-las-19.28.49_4b59b2c024.avif",
  srcSetAvif: "IMG/avif/variants/084_Captura-de-pantalla-2026-03-12-a-las-19.28.49_4b59b2c024-640.avif 640w, IMG/avif/variants/084_Captura-de-pantalla-2026-03-12-a-las-19.28.49_4b59b2c024-1280.avif 1280w, IMG/avif/084_Captura-de-pantalla-2026-03-12-a-las-19.28.49_4b59b2c024.avif 1492w",
  srcSetWebp: "IMG/webp/variants/084_Captura-de-pantalla-2026-03-12-a-las-19.28.49_4b59b2c024-640.webp 640w, IMG/webp/variants/084_Captura-de-pantalla-2026-03-12-a-las-19.28.49_4b59b2c024-1280.webp 1280w, IMG/webp/084_Captura-de-pantalla-2026-03-12-a-las-19.28.49_4b59b2c024.webp 1492w",
  srcOriginal: "IMG/remote-originals/084_Captura-de-pantalla-2026-03-12-a-las-19.28.49.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Biosfera Somos Agua",
  author: "Magdalena Larraín",
  role: "",
  collab: "Autor del libro: Juan Pablo Orrego. Diagramación e ilustración: Josefina Carvalho, Magdalena Larraín",
  area: "Editorial / Ilustración / Ecología",
  year: "2021",
  url: "https://www.instagram.com/p/CQG4mvRDHNH/?img_index=1"
},

    /* ------------- Avita — imagen González ------------- */
    {
      src: "IMG/webp/085_gonzalez-m_1_c23b3b83ba.webp",
      srcAvif: "IMG/avif/085_gonzalez-m_1_c23b3b83ba.avif",
      srcSetAvif: "IMG/avif/variants/085_gonzalez-m_1_c23b3b83ba-640.avif 640w, IMG/avif/085_gonzalez-m_1_c23b3b83ba.avif 1032w",
      srcSetWebp: "IMG/webp/variants/085_gonzalez-m_1_c23b3b83ba-640.webp 640w, IMG/webp/085_gonzalez-m_1_c23b3b83ba.webp 1032w",
      srcOriginal: "IMG/remote-originals/085_gonzalez-m_1.png",
      orientation: "v",
      span: 1,
      tags: ["Dirección de arte","Dirección creativa","Moda"],
      title: "Avita",
      author: "María Fernanda Gonzalez",
      role: "",
      collab: "Josefa Bustos, Ferni González",
      area: "Arte / Dirección creativa / Moda",
      year: "—",
      url: "https://individual-frame-992587.framer.app/art-direction"
    },

    /* ------------- Guided by the Moon ------------- */
    {
      src: "IMG/webp/086_vidosola_1_6bdf2fa63d.webp",
      srcAvif: "IMG/avif/086_vidosola_1_6bdf2fa63d.avif",
      srcSetAvif: "IMG/avif/variants/086_vidosola_1_6bdf2fa63d-640.avif 640w, IMG/avif/086_vidosola_1_6bdf2fa63d.avif 1200w",
      srcSetWebp: "IMG/webp/variants/086_vidosola_1_6bdf2fa63d-640.webp 640w, IMG/webp/086_vidosola_1_6bdf2fa63d.webp 1200w",
      srcOriginal: "IMG/remote-originals/086_vidosola_1.png",
      orientation: "v",
      span: 1,
      tags: ["Editorial","gráfico","diagramación"],
      title: "Guided by the Moon",
      author: "Florencia Vildósola",
      role: "",
      collab: "Fembith",
      area: "Editorial / Gráfico / Diagramación",
      year: "2022",
      url: "https://florenciavildosola.myportfolio.com/guiado-por-la-luna"
    },

    /* ------------- PC Factory — UX/UI ------------- */
    {
      src: "IMG/webp/087_morales-const_1_75c06d7666.webp",
      srcAvif: "IMG/avif/087_morales-const_1_75c06d7666.avif",
      srcSetAvif: "IMG/avif/variants/087_morales-const_1_75c06d7666-640.avif 640w, IMG/avif/087_morales-const_1_75c06d7666.avif 1200w",
      srcSetWebp: "IMG/webp/variants/087_morales-const_1_75c06d7666-640.webp 640w, IMG/webp/087_morales-const_1_75c06d7666.webp 1200w",
      srcOriginal: "IMG/remote-originals/087_morales-const_1.png",
      orientation: "sq",
      span: 1,
      tags: ["UX","UI","Web","Responsivo"],
      title: "PC Factory",
      author: "Constanza Morales",
      role: "",
      collab: "PC Factory",
      area: "UX / UI / Web",
      year: "2021",
      url: "https://www.constanzamorales.com/projects/pcfactory"
    },

    /* ------------------ Manual Verde — Sergio Ramírez ------------------ */
    {
      src: "IMG/webp/088_ramirez-s_1_79117932de.webp",
      srcAvif: "IMG/avif/088_ramirez-s_1_79117932de.avif",
      srcSetAvif: "IMG/avif/variants/088_ramirez-s_1_79117932de-640.avif 640w, IMG/avif/088_ramirez-s_1_79117932de.avif 1237w",
      srcSetWebp: "IMG/webp/variants/088_ramirez-s_1_79117932de-640.webp 640w, IMG/webp/088_ramirez-s_1_79117932de.webp 1237w",
      srcOriginal: "IMG/remote-originals/088_ramirez-s_1.png",
      orientation: "v",
      span: 2,
      tags: ["editorial","diagramación","gráfico","ilustración"],
      title: "Manual Verde",
      author: "Sergio Ramírez Flores",
      role: "Diseñador",
      collab: "Ilustraciones de Javiera Infante y diagramación de Florencia Vildósola",
      area: "Editorial / Diagramación / Ilustración / Gráfico",
      year: "2024",
      url: "https://www.ramirezflores.cl/el-manual-verde/"
    },

    /* ------------------ Museo Histórico Nacional — Sergio Ramírez ------------------ */
    {
      src: "IMG/webp/089_ramirez-s_2_212c5fb2b8.webp",
      srcAvif: "IMG/avif/089_ramirez-s_2_212c5fb2b8.avif",
      srcSetAvif: "IMG/avif/variants/089_ramirez-s_2_212c5fb2b8-640.avif 640w, IMG/avif/variants/089_ramirez-s_2_212c5fb2b8-1280.avif 1280w, IMG/avif/089_ramirez-s_2_212c5fb2b8.avif 1542w",
      srcSetWebp: "IMG/webp/variants/089_ramirez-s_2_212c5fb2b8-640.webp 640w, IMG/webp/variants/089_ramirez-s_2_212c5fb2b8-1280.webp 1280w, IMG/webp/089_ramirez-s_2_212c5fb2b8.webp 1542w",
      srcOriginal: "IMG/remote-originals/089_ramirez-s_2.jpeg",
      orientation: "h",
      span: 2,
      tags: ["Identidad visual","Identidad gráfica","branding"],
      title: "Museo Histórico Nacional",
      author: "Sergio Ramírez Flores",
      role: "Diseñador",
      collab: "Gaggeroworks",
      area: "Identidad visual / Branding",
      year: "2021",
      url: "https://www.ramirezflores.cl/museo-historico-nacional/"
    },

    /* ------------------ TYPE SPECIMEN FANZINE — Jose Chaud ------------------ */
    {
      src: "IMG/webp/090_chaud_1_c7fa3fed2d.webp",
      srcAvif: "IMG/avif/090_chaud_1_c7fa3fed2d.avif",
      srcSetAvif: "IMG/avif/variants/090_chaud_1_c7fa3fed2d-640.avif 640w, IMG/avif/090_chaud_1_c7fa3fed2d.avif 1128w",
      srcSetWebp: "IMG/webp/variants/090_chaud_1_c7fa3fed2d-640.webp 640w, IMG/webp/090_chaud_1_c7fa3fed2d.webp 1128w",
      srcOriginal: "IMG/remote-originals/090_chaud_1.png",
      orientation: "v",
      span: 1,
      tags: ["Afiche","Afiche digital","Gráfico","Fanzine"],
      title: "TYPE SPECIMEN FANZINE",
      author: "Jose Chaud",
      role: "",
      collab: "",
      area: "Afiche / Fanzine / Gráfico",
      year: "2024",
      url: "https://okeykul.com/3/"
    },

    /* ------------------ TYPE SPECIMEN FANZINE — Jose Chaud ------------------ */
    {
      src: "IMG/webp/091_Trinidad-Bustos-2-portfolio-baby-kine-simulation-doll-muneco-simulacion-IA-AI-2_5815a5215f.webp",
      srcAvif: "IMG/avif/091_Trinidad-Bustos-2-portfolio-baby-kine-simulation-doll-muneco-simulacion-IA-AI-2_5815a5215f.avif",
      srcSetAvif: "IMG/avif/variants/091_Trinidad-Bustos-2-portfolio-baby-kine-simulation-doll-muneco-simulacion-IA-AI-2_5815a5215f-640.avif 640w, IMG/avif/091_Trinidad-Bustos-2-portfolio-baby-kine-simulation-doll-muneco-simulacion-IA-AI-2_5815a5215f.avif 901w",
      srcSetWebp: "IMG/webp/variants/091_Trinidad-Bustos-2-portfolio-baby-kine-simulation-doll-muneco-simulacion-IA-AI-2_5815a5215f-640.webp 640w, IMG/webp/091_Trinidad-Bustos-2-portfolio-baby-kine-simulation-doll-muneco-simulacion-IA-AI-2_5815a5215f.webp 901w",
      srcOriginal: "IMG/remote-originals/091_Trinidad-Bustos-2-portfolio-baby-kine-simulation-doll-muneco-simulacion-IA-AI-2.png",
      orientation: "v",
      span: 2,
      tags: ["Servicio","Salud","Producto"],
      title: "Baby.kine",
      author: "Trinidad Burgos",
      role: "",
      collab: "Co-autor:Iván Caro",
      area: "Servicio / Salud / Producto",
      year: "N/A",
      url: "https://trinidadburgos.com/baby-kine-en/"
    },

    /* ------------------ Emprendekit — Kimberly McCartney ------------------ */
    {
      src: "IMG/webp/092_Kim_1_2b3f52e425.webp",
      srcAvif: "IMG/avif/092_Kim_1_2b3f52e425.avif",
      srcSetAvif: "IMG/avif/variants/092_Kim_1_2b3f52e425-640.avif 640w, IMG/avif/variants/092_Kim_1_2b3f52e425-1280.avif 1280w, IMG/avif/092_Kim_1_2b3f52e425.avif 1914w",
      srcSetWebp: "IMG/webp/variants/092_Kim_1_2b3f52e425-640.webp 640w, IMG/webp/variants/092_Kim_1_2b3f52e425-1280.webp 1280w, IMG/webp/092_Kim_1_2b3f52e425.webp 1914w",
      srcOriginal: "IMG/remote-originals/092_Kim_1.png",
      orientation: "v",
      span: 1,
      tags: ["diseño de servicio","ux/ui"],
      title: "Emprendekit",
      author: "Kimberly McCartney",
      role: "",
      collab: "",
      area: "Diseño de servicio / UX/UI",
      year: "2025",
      url: "https://www.kimberlymccartney.com/5/"
    },

    /* ------------------ FPO Módulo Bienal Arquitectura — Catalina Pérez ------------------ */
    {
      src: "IMG/webp/093_perez-c_1_169643a6bd.webp",
      srcAvif: "IMG/avif/093_perez-c_1_169643a6bd.avif",
      srcSetAvif: "IMG/avif/variants/093_perez-c_1_169643a6bd-640.avif 640w, IMG/avif/093_perez-c_1_169643a6bd.avif 961w",
      srcSetWebp: "IMG/webp/variants/093_perez-c_1_169643a6bd-640.webp 640w, IMG/webp/093_perez-c_1_169643a6bd.webp 961w",
      srcOriginal: "IMG/remote-originals/093_perez-c_1.png",
      orientation: "h",
      span: 1,
      tags: ["identidad visual","Identidad gráfica","branding","museografía","instalación","exposición"],
      title: "FPO Módulo — Bienal de Arquitectura",
      author: "Catalina Pérez",
      role: "diseñadora / Socia fundadora",
      collab: "Otros Pérez, Fernando Pérez",
      area: "Identidad visual / Museografía / Exposición",
      year: "2023",
      url: "https://otrosperez.com/portfolio/home/fpo/"
    },

    {
      id: "pastelito",
      title: "Pastelito",
      author: "Naomi Altmann",
      role: "",
      collab: "",
      area: "Branding / Identidad visual",
      year: 2024,
      tags: ["branding", "identidad visual", "gráfico"],
      src: "IMG/webp/094_Stickers_Pastelito_b64665826d.webp",
      srcAvif: "IMG/avif/094_Stickers_Pastelito_b64665826d.avif",
      srcSetAvif: "IMG/avif/variants/094_Stickers_Pastelito_b64665826d-640.avif 640w, IMG/avif/variants/094_Stickers_Pastelito_b64665826d-1280.avif 1280w, IMG/avif/094_Stickers_Pastelito_b64665826d.avif 1500w",
      srcSetWebp: "IMG/webp/variants/094_Stickers_Pastelito_b64665826d-640.webp 640w, IMG/webp/variants/094_Stickers_Pastelito_b64665826d-1280.webp 1280w, IMG/webp/094_Stickers_Pastelito_b64665826d.webp 1500w",
      srcOriginal: "IMG/remote-originals/094_Stickers_Pastelito.jpg",
      url: "https://naomialtmann.cargo.site/pastelito"
    },
    {
      id: "add",
      orientation: "h",
      span: 2,
      title: "ADD",
      author: "Fernanda González",
      role: "Diseñadora/investigación",
      collab: "1º Lugar Premios Chile Diseño 2025, categoría Diseño de Servicios / Ponente en Congreso Intesecciones 2025 / Ponente en IV Encuentro de Creación e Investigación 2025",
      area: "Servicio / Salud",
      year: 2024,
      tags: ["salud", "servicio"],
      src: "IMG/webp/095_Captura-de-pantalla-2026-01-02-a-las-13.33.28_9eddbce323.webp",
      srcAvif: "IMG/avif/095_Captura-de-pantalla-2026-01-02-a-las-13.33.28_9eddbce323.avif",
      srcSetAvif: "IMG/avif/variants/095_Captura-de-pantalla-2026-01-02-a-las-13.33.28_9eddbce323-640.avif 640w, IMG/avif/variants/095_Captura-de-pantalla-2026-01-02-a-las-13.33.28_9eddbce323-1280.avif 1280w, IMG/avif/095_Captura-de-pantalla-2026-01-02-a-las-13.33.28_9eddbce323.avif 3082w",
      srcSetWebp: "IMG/webp/variants/095_Captura-de-pantalla-2026-01-02-a-las-13.33.28_9eddbce323-640.webp 640w, IMG/webp/variants/095_Captura-de-pantalla-2026-01-02-a-las-13.33.28_9eddbce323-1280.webp 1280w, IMG/webp/095_Captura-de-pantalla-2026-01-02-a-las-13.33.28_9eddbce323.webp 3082w",
      srcOriginal: "IMG/remote-originals/095_Captura-de-pantalla-2026-01-02-a-las-13.33.28.png",
      url: "https://fernandagn.myportfolio.com/add-proyecto-de-titulo"
    },
    /* ------------------ LOYALTTY — Juan Pablo Valenzuela ------------------ */
{
  src: "IMG/webp/59cb6462-ee27-43ff-9915-b824fcb67c4e_rw_3840_7be43640fc.webp",
  srcAvif: "IMG/avif/59cb6462-ee27-43ff-9915-b824fcb67c4e_rw_3840_7be43640fc.avif",
  srcSetAvif: "IMG/avif/variants/59cb6462-ee27-43ff-9915-b824fcb67c4e_rw_3840_7be43640fc-640.avif 640w, IMG/avif/variants/59cb6462-ee27-43ff-9915-b824fcb67c4e_rw_3840_7be43640fc-1280.avif 1280w, IMG/avif/59cb6462-ee27-43ff-9915-b824fcb67c4e_rw_3840_7be43640fc.avif 3840w",
  srcSetWebp: "IMG/webp/variants/59cb6462-ee27-43ff-9915-b824fcb67c4e_rw_3840_7be43640fc-640.webp 640w, IMG/webp/variants/59cb6462-ee27-43ff-9915-b824fcb67c4e_rw_3840_7be43640fc-1280.webp 1280w, IMG/webp/59cb6462-ee27-43ff-9915-b824fcb67c4e_rw_3840_7be43640fc.webp 3840w",
  srcOriginal: "https://freight.cargo.site/t/original/i/A2843377305187268050867133559491/59cb6462-ee27-43ff-9915-b824fcb67c4e_rw_3840.jpg",
  orientation: "v",
  span: 1,
  tags: ["objeto", "artesanía", "moda", "indumentaria"],
  title: "LOYALTTY",
  author: "Juan Pablo Valenzuela",
  role: "Diseñador",
  collab: "Desarrollado en The Glass Lab @theglasslab.cl",
  area: "Objeto / Artesanía / Moda / Indumentaria",
  year: "2024",
  url: "https://yeipivalenzuela.myportfolio.com/loyaltty"
},

/* ------------------ Black — Juan Pablo Valenzuela ------------------ */
{
  src: "IMG/webp/5bfec8f9-e5ea-409e-9aed-efe06707094a_rw_3840_1690e8f13c.webp",
  srcAvif: "IMG/avif/5bfec8f9-e5ea-409e-9aed-efe06707094a_rw_3840_1690e8f13c.avif",
  srcSetAvif: "IMG/avif/variants/5bfec8f9-e5ea-409e-9aed-efe06707094a_rw_3840_1690e8f13c-640.avif 640w, IMG/avif/variants/5bfec8f9-e5ea-409e-9aed-efe06707094a_rw_3840_1690e8f13c-1280.avif 1280w, IMG/avif/5bfec8f9-e5ea-409e-9aed-efe06707094a_rw_3840_1690e8f13c.avif 3840w",
  srcSetWebp: "IMG/webp/variants/5bfec8f9-e5ea-409e-9aed-efe06707094a_rw_3840_1690e8f13c-640.webp 640w, IMG/webp/variants/5bfec8f9-e5ea-409e-9aed-efe06707094a_rw_3840_1690e8f13c-1280.webp 1280w, IMG/webp/5bfec8f9-e5ea-409e-9aed-efe06707094a_rw_3840_1690e8f13c.webp 3840w",
  srcOriginal: "https://freight.cargo.site/t/original/i/I2843377305205714794940843111107/5bfec8f9-e5ea-409e-9aed-efe06707094a_rw_3840.png",
  orientation: "v",
  span: 1,
  tags: ["objeto", "artesanía", "moda", "indumentaria"],
  title: "Black",
  author: "Juan Pablo Valenzuela",
  role: "Diseñador",
  collab: "Desarrollado en The Glass Lab @theglasslab.cl",
  area: "Objeto / Artesanía / Moda / Indumentaria",
  year: "2024",
  url: "https://yeipivalenzuela.myportfolio.com/black"
},
    {
      id: "una-clase-de-bichos",
      orientation: "v",
      span: 1,
      title: "Una Clase de Bichos",
      author: "Cristóbal Sprätz",
      role: "",
      collab: "Ilustraciones por Magdalena Pérez",
      area: "Ilustración / Editorial / Infantil",
      year: 2024,
      tags: ["ilustración", "editorial", "infantil"],
      src: "IMG/webp/096_Captura-de-pantalla-2026-01-02-a-las-13.42.40_548a0942c2.webp",
      srcAvif: "IMG/avif/096_Captura-de-pantalla-2026-01-02-a-las-13.42.40_548a0942c2.avif",
      srcSetAvif: "IMG/avif/096_Captura-de-pantalla-2026-01-02-a-las-13.42.40_548a0942c2.avif 430w",
      srcSetWebp: "IMG/webp/096_Captura-de-pantalla-2026-01-02-a-las-13.42.40_548a0942c2.webp 430w",
      srcOriginal: "IMG/remote-originals/096_Captura-de-pantalla-2026-01-02-a-las-13.42.40.png",
      url: [
        "https://www.magdalenaperezv.com/Una-Clase-de-Bichos",
        "https://www.instagram.com/magdalenaperezv"
      ]
    },
    /* ------------------ Papel Lustre — Matías Prado ------------------ */
{
  src: "IMG/webp/097_SARA-GUBBINS-Captura-de-pantalla-2026-01-04-a-las-13.07.13_b2ee713abb.webp",
  srcAvif: "IMG/avif/097_SARA-GUBBINS-Captura-de-pantalla-2026-01-04-a-las-13.07.13_b2ee713abb.avif",
  srcSetAvif: "IMG/avif/variants/097_SARA-GUBBINS-Captura-de-pantalla-2026-01-04-a-las-13.07.13_b2ee713abb-640.avif 640w, IMG/avif/097_SARA-GUBBINS-Captura-de-pantalla-2026-01-04-a-las-13.07.13_b2ee713abb.avif 1058w",
  srcSetWebp: "IMG/webp/variants/097_SARA-GUBBINS-Captura-de-pantalla-2026-01-04-a-las-13.07.13_b2ee713abb-640.webp 640w, IMG/webp/097_SARA-GUBBINS-Captura-de-pantalla-2026-01-04-a-las-13.07.13_b2ee713abb.webp 1058w",
  srcOriginal: "IMG/remote-originals/097_SARA-GUBBINS-Captura-de-pantalla-2026-01-04-a-las-13.07.13.png",
  orientation: "v",
  span: 1,
  tags: ["gráfico", "ilustración"],
  title: "Papel Lustre",
  author: "Sara Gubbins",
  role: "Diseñadora",
  collab: "Autor: Matías Prado en Feoperohermoso.cl",
  area: "Gráfico / Ilustración",
  year: "2025",
  url: "https://www.feoperohermoso.cl/products/papel-lustre-12-x-12-cm"
},

/* ------------------ Joyas Maite Araia — Javiera Naranjo ------------------ */
{
  src: "IMG/webp/098_Javiera-Naranjo-image-66e65f5b-1715-43e0-ae6a-1c34883b472c_0aaf641214.webp",
  srcAvif: "IMG/avif/098_Javiera-Naranjo-image-66e65f5b-1715-43e0-ae6a-1c34883b472c_0aaf641214.avif",
  srcSetAvif: "IMG/avif/098_Javiera-Naranjo-image-66e65f5b-1715-43e0-ae6a-1c34883b472c_0aaf641214.avif 502w",
  srcSetWebp: "IMG/webp/098_Javiera-Naranjo-image-66e65f5b-1715-43e0-ae6a-1c34883b472c_0aaf641214.webp 502w",
  srcOriginal: "IMG/remote-originals/098_Javiera-Naranjo-image-66e65f5b-1715-43e0-ae6a-1c34883b472c.jpg",
  orientation: "v",
  span: 0,
  tags: ["fotografía", "moda", "editorial"],
  title: "Joyas Maite Araia",
  author: "Javiera Naranjo",
  role: "",
  collab: "Fotografía por: Javiera Naranjo",
  area: "Fotografía / Moda / Editorial",
  year: "2025",
  url: "https://readymag.website/u2667837699/JavieraNaranjoPortafolio/"
},

/* ------------------ INEDEBLE — Javiera Naranjo, Paulina Carrasco ------------------ */
{
  src: "IMG/webp/099_Javiera-Naranjo-image-723d4605-f436-4ccd-bc6f-8cdfee64515f_ae2f3b04ea.webp",
  srcAvif: "IMG/avif/099_Javiera-Naranjo-image-723d4605-f436-4ccd-bc6f-8cdfee64515f_ae2f3b04ea.avif",
  srcSetAvif: "IMG/avif/099_Javiera-Naranjo-image-723d4605-f436-4ccd-bc6f-8cdfee64515f_ae2f3b04ea.avif 548w",
  srcSetWebp: "IMG/webp/099_Javiera-Naranjo-image-723d4605-f436-4ccd-bc6f-8cdfee64515f_ae2f3b04ea.webp 548w",
  srcOriginal: "IMG/remote-originals/099_Javiera-Naranjo-image-723d4605-f436-4ccd-bc6f-8cdfee64515f.jpg",
  orientation: "v",
  span: 0,
  tags: ["fotografía", "moda", "dirección creativa", "editorial"],
  title: "INEDEBLE",
  author: "Javiera Naranjo, Paulina Carrasco",
  role: "",
  collab: "",
  area: "Fotografía / Moda / Dirección Creativa / Editorial",
  year: "2025",
  url: "https://readymag.website/u2667837699/JavieraNaranjoPortafolio/"
},

/* ------------------ Raíces vivas: nuestra fusión — Magdalena Leigh ------------------ */
{
  src: "IMG/webp/100_Magdalena-Leigh-Captura-de-pantalla-2026-01-04-a-las-13.22.37_84466aae7d.webp",
  srcAvif: "IMG/avif/100_Magdalena-Leigh-Captura-de-pantalla-2026-01-04-a-las-13.22.37_84466aae7d.avif",
  srcSetAvif: "IMG/avif/variants/100_Magdalena-Leigh-Captura-de-pantalla-2026-01-04-a-las-13.22.37_84466aae7d-640.avif 640w, IMG/avif/variants/100_Magdalena-Leigh-Captura-de-pantalla-2026-01-04-a-las-13.22.37_84466aae7d-1280.avif 1280w, IMG/avif/100_Magdalena-Leigh-Captura-de-pantalla-2026-01-04-a-las-13.22.37_84466aae7d.avif 1348w",
  srcSetWebp: "IMG/webp/variants/100_Magdalena-Leigh-Captura-de-pantalla-2026-01-04-a-las-13.22.37_84466aae7d-640.webp 640w, IMG/webp/variants/100_Magdalena-Leigh-Captura-de-pantalla-2026-01-04-a-las-13.22.37_84466aae7d-1280.webp 1280w, IMG/webp/100_Magdalena-Leigh-Captura-de-pantalla-2026-01-04-a-las-13.22.37_84466aae7d.webp 1348w",
  srcOriginal: "IMG/remote-originals/100_Magdalena-Leigh-Captura-de-pantalla-2026-01-04-a-las-13.22.37.png",
  orientation: "v",
  span: 1,
  tags: ["fotografía", "moda", "editorial"],
  title: "Raíces vivas: nuestra fusión",
  author: "Magdalena Leigh",
  role: "",
  collab: "Fotografía por: Magdalena Leigh",
  area: "Fotografía / Moda / Editorial",
  year: "2023",
  url: "https://www.instagram.com/p/CzmeLffJDVQ/"
},

    {
      id: "la-mesa-latina",
      title: "La Mesa Latina",
      author: "Ciudad Emergente",
      role: "",
      collab: "Ilustraciones por Magdalena Pérez",
      area: "Ilustración / Editorial",
      year: 2019,
      tags: ["ilustración", "editorial", "gráfico"],
      src: "IMG/webp/101_Captura-de-pantalla-2026-01-02-a-las-14.00.36_0e272d2020.webp",
      srcAvif: "IMG/avif/101_Captura-de-pantalla-2026-01-02-a-las-14.00.36_0e272d2020.avif",
      srcSetAvif: "IMG/avif/variants/101_Captura-de-pantalla-2026-01-02-a-las-14.00.36_0e272d2020-640.avif 640w, IMG/avif/101_Captura-de-pantalla-2026-01-02-a-las-14.00.36_0e272d2020.avif 1206w",
      srcSetWebp: "IMG/webp/variants/101_Captura-de-pantalla-2026-01-02-a-las-14.00.36_0e272d2020-640.webp 640w, IMG/webp/101_Captura-de-pantalla-2026-01-02-a-las-14.00.36_0e272d2020.webp 1206w",
      srcOriginal: "IMG/remote-originals/101_Captura-de-pantalla-2026-01-02-a-las-14.00.36.png",
      url: [
        "https://www.magdalenaperezv.com/La-Mesa-Latina",
        "https://ciudademergente.org/construir-tacticas/2020/9/22/kit-la-mesa-latina"
      ]
    },
    {
      id: "red-apa",
      orientation: "h",
      span: 2,
      title: "Red APA",
      author: "Fernanda Romagnoli",
      role: "",
      collab: "",
      area: "Servicio / Salud / Social",
      year: "N/A",
      tags: ["servicio", "salud", "social"],
      src: "IMG/webp/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66.webp",
      srcAvif: "IMG/avif/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66.avif",
      srcSetAvif: "IMG/avif/variants/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66-640.avif 640w, IMG/avif/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66.avif 1050w",
      srcSetWebp: "IMG/webp/variants/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66-640.webp 640w, IMG/webp/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66.webp 1050w",
      srcOriginal: "IMG/remote-originals/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31.png",
      url: "https://feromagnoli.framer.website/cases/red-apa"
    },
    {
      id: "catastro-prevencion",
      title: "Catastro Modelo de Prevención",
      author: "Pilar Saavedra",
      role: "",
      collab: "Cliente: Corporación de Universidades Privadas",
      area: "Editorial / Dirección de arte",
      year: 2025,
      tags: ["editorial", "dirección de arte", "ilustración"],
      src: "IMG/webp/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66.webp",
      srcAvif: "IMG/avif/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66.avif",
      srcSetAvif: "IMG/avif/variants/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66-640.avif 640w, IMG/avif/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66.avif 1050w",
      srcSetWebp: "IMG/webp/variants/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66-640.webp 640w, IMG/webp/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31_df65e19b66.webp 1050w",
      srcOriginal: "IMG/remote-originals/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31.png",
      url: "https://pilar-fundamental.com/ugm-catastro"
    },
    {
      id: "espacio-ede",
      title: "Espacio EDE",
      author: "Pilar Saavedra",
      role: "",
      collab: "Cliente: Estudio EDE",
      area: "Identidad visual",
      year: 2023,
      tags: ["identidad visual", "branding", "gráfico"],
      src: "IMG/webp/103_Captura-de-pantalla-2026-01-02-a-las-13.57.55_c4cc6bd737.webp",
      srcAvif: "IMG/avif/103_Captura-de-pantalla-2026-01-02-a-las-13.57.55_c4cc6bd737.avif",
      srcSetAvif: "IMG/avif/variants/103_Captura-de-pantalla-2026-01-02-a-las-13.57.55_c4cc6bd737-640.avif 640w, IMG/avif/103_Captura-de-pantalla-2026-01-02-a-las-13.57.55_c4cc6bd737.avif 1158w",
      srcSetWebp: "IMG/webp/variants/103_Captura-de-pantalla-2026-01-02-a-las-13.57.55_c4cc6bd737-640.webp 640w, IMG/webp/103_Captura-de-pantalla-2026-01-02-a-las-13.57.55_c4cc6bd737.webp 1158w",
      srcOriginal: "IMG/remote-originals/103_Captura-de-pantalla-2026-01-02-a-las-13.57.55.png",
      url: "https://pilar-fundamental.com/espacioede"
    },
    {
      id: "loie-fuller",
      title: "Löie Füller",
      author: "Pilar Saavedra",
      role: "",
      collab: "Proyecto personal",
      area: "Ilustración / Editorial",
      year: 2021,
      tags: ["ilustración", "editorial", "gráfico"],
      src: "IMG/webp/104_Captura-de-pantalla-2026-01-02-a-las-13.58.22_1392795aa1.webp",
      srcAvif: "IMG/avif/104_Captura-de-pantalla-2026-01-02-a-las-13.58.22_1392795aa1.avif",
      srcSetAvif: "IMG/avif/variants/104_Captura-de-pantalla-2026-01-02-a-las-13.58.22_1392795aa1-640.avif 640w, IMG/avif/104_Captura-de-pantalla-2026-01-02-a-las-13.58.22_1392795aa1.avif 1182w",
      srcSetWebp: "IMG/webp/variants/104_Captura-de-pantalla-2026-01-02-a-las-13.58.22_1392795aa1-640.webp 640w, IMG/webp/104_Captura-de-pantalla-2026-01-02-a-las-13.58.22_1392795aa1.webp 1182w",
      srcOriginal: "IMG/remote-originals/104_Captura-de-pantalla-2026-01-02-a-las-13.58.22.png",
      url: "https://pilar-fundamental.com/loie-fuller"
    },
    {
      id: "expo-fireflies-patagonia",
      title: "Expo Fireflies Patagonia",
      author: "Constanza Gahona",
      role: "",
      collab: "Fireflies Patagonia",
      area: "Afiche / Gráfico",
      year: 2022,
      tags: ["afiche", "diagramación", "gráfico"],
      src: "IMG/webp/105_Captura-de-pantalla-2026-01-02-a-las-14.03.58_7f9460c487.webp",
      srcAvif: "IMG/avif/105_Captura-de-pantalla-2026-01-02-a-las-14.03.58_7f9460c487.avif",
      srcSetAvif: "IMG/avif/variants/105_Captura-de-pantalla-2026-01-02-a-las-14.03.58_7f9460c487-640.avif 640w, IMG/avif/105_Captura-de-pantalla-2026-01-02-a-las-14.03.58_7f9460c487.avif 766w",
      srcSetWebp: "IMG/webp/variants/105_Captura-de-pantalla-2026-01-02-a-las-14.03.58_7f9460c487-640.webp 640w, IMG/webp/105_Captura-de-pantalla-2026-01-02-a-las-14.03.58_7f9460c487.webp 766w",
      srcOriginal: "IMG/remote-originals/105_Captura-de-pantalla-2026-01-02-a-las-14.03.58.png",
      url: "https://www.behance.net/gallery/156824561/Expo-Fireflies-Patagonia"
    },
    {
      id: "encuentro-entre-cerros",
      title: "Encuentro entre cerros",
      author: "Camila Correa",
      role: "",
      collab: "",
      area: "Identidad visual",
      year: "N/A",
      tags: ["identidad visual", "branding", "gráfico"],
      src: "IMG/webp/106_Copia-de-avatar_ig_400_94d6a2c749.webp",
      srcAvif: "IMG/avif/106_Copia-de-avatar_ig_400_94d6a2c749.avif",
      srcSetAvif: "IMG/avif/106_Copia-de-avatar_ig_400_94d6a2c749.avif 400w",
      srcSetWebp: "IMG/webp/106_Copia-de-avatar_ig_400_94d6a2c749.webp 400w",
      srcOriginal: "IMG/remote-originals/106_Copia-de-avatar_ig_400.jpg",
      url: "https://cargocollective.com/ccharnecker/Imagen-de-marca"
    },
    {
      id: "revolucion-solar",
      title: "Revolución Solar",
      author: "Camila Correa",
      role: "",
      collab: "Kittsy Flor",
      area: "Música / Dirección de arte",
      year: "N/A",
      tags: ["música", "gráfico", "dirección de arte", "portada"],
      src: "IMG/webp/107_kittsy_DANZA_OTONO_v6_800_474a1895d0.webp",
      srcAvif: "IMG/avif/107_kittsy_DANZA_OTONO_v6_800_474a1895d0.avif",
      srcSetAvif: "IMG/avif/variants/107_kittsy_DANZA_OTONO_v6_800_474a1895d0-640.avif 640w, IMG/avif/107_kittsy_DANZA_OTONO_v6_800_474a1895d0.avif 800w",
      srcSetWebp: "IMG/webp/variants/107_kittsy_DANZA_OTONO_v6_800_474a1895d0-640.webp 640w, IMG/webp/107_kittsy_DANZA_OTONO_v6_800_474a1895d0.webp 800w",
      srcOriginal: "IMG/remote-originals/107_kittsy_DANZA_OTONO_v6_800.png",
      url: "https://cargocollective.com/ccharnecker/Arte-discos-1"
    },
    {
      id: "ilustraciones-quanticas",
      title: "Ilustraciones Quánticas",
      author: "Camila Correa",
      orientation: "v",
      span: 1,
      role: "",
      collab: "Cliente: Quántica",
      area: "Ilustración",
      year: "N/A",
      tags: ["ilustración", "gráfico"],
      src: "IMG/webp/108_fisica1_2-botella-globo_1000_2d19b0f4cb.webp",
      srcAvif: "IMG/avif/108_fisica1_2-botella-globo_1000_2d19b0f4cb.avif",
      srcSetAvif: "IMG/avif/variants/108_fisica1_2-botella-globo_1000_2d19b0f4cb-640.avif 640w, IMG/avif/108_fisica1_2-botella-globo_1000_2d19b0f4cb.avif 1000w",
      srcSetWebp: "IMG/webp/variants/108_fisica1_2-botella-globo_1000_2d19b0f4cb-640.webp 640w, IMG/webp/108_fisica1_2-botella-globo_1000_2d19b0f4cb.webp 1000w",
      srcOriginal: "IMG/remote-originals/108_fisica1_2-botella-globo_1000.jpg",
      url: "https://cargocollective.com/ccharnecker/Ilustraciones-Quantica"
    },
    {
      id: "de-mukachevo",
      title: "De Mukachevo al fin del mundo",
      author: "Marisol Zemon Vergara",
      role: "",
      collab: "Colomba Medina",
      area: "Editorial / Gráfico",
      year: "N/A",
      tags: ["editorial", "diagramación", "gráfico"],
      src: "IMG/webp/109_d4acb2d4-a35f-4c33-b786-81974f5c3e20_rw_1920_d0fc29920f.webp",
      srcAvif: "IMG/avif/109_d4acb2d4-a35f-4c33-b786-81974f5c3e20_rw_1920_d0fc29920f.avif",
      srcSetAvif: "IMG/avif/variants/109_d4acb2d4-a35f-4c33-b786-81974f5c3e20_rw_1920_d0fc29920f-640.avif 640w, IMG/avif/variants/109_d4acb2d4-a35f-4c33-b786-81974f5c3e20_rw_1920_d0fc29920f-1280.avif 1280w, IMG/avif/109_d4acb2d4-a35f-4c33-b786-81974f5c3e20_rw_1920_d0fc29920f.avif 1800w",
      srcSetWebp: "IMG/webp/variants/109_d4acb2d4-a35f-4c33-b786-81974f5c3e20_rw_1920_d0fc29920f-640.webp 640w, IMG/webp/variants/109_d4acb2d4-a35f-4c33-b786-81974f5c3e20_rw_1920_d0fc29920f-1280.webp 1280w, IMG/webp/109_d4acb2d4-a35f-4c33-b786-81974f5c3e20_rw_1920_d0fc29920f.webp 1800w",
      srcOriginal: "IMG/remote-originals/109_d4acb2d4-a35f-4c33-b786-81974f5c3e20_rw_1920.jpg",
      url: "https://colombamedina.myportfolio.com/copia-de-de-mukachevo-al-fin-del-mundo"
    },
    {
      id: "milatelier",
      title: "Milatelier",
      author: "Colomba Medina",
      role: "",
      collab: "Cliente: Milatelier",
      area: "Identidad visual",
      year: "N/A",
      tags: ["identidad visual", "branding", "gráfico"],
      src: "IMG/webp/110_4521c585-4a16-4ab5-9b1f-d76b06ca8705_rw_3840_5f46ad356f.webp",
      srcAvif: "IMG/avif/110_4521c585-4a16-4ab5-9b1f-d76b06ca8705_rw_3840_5f46ad356f.avif",
      srcSetAvif: "IMG/avif/variants/110_4521c585-4a16-4ab5-9b1f-d76b06ca8705_rw_3840_5f46ad356f-640.avif 640w, IMG/avif/variants/110_4521c585-4a16-4ab5-9b1f-d76b06ca8705_rw_3840_5f46ad356f-1280.avif 1280w, IMG/avif/110_4521c585-4a16-4ab5-9b1f-d76b06ca8705_rw_3840_5f46ad356f.avif 3840w",
      srcSetWebp: "IMG/webp/variants/110_4521c585-4a16-4ab5-9b1f-d76b06ca8705_rw_3840_5f46ad356f-640.webp 640w, IMG/webp/variants/110_4521c585-4a16-4ab5-9b1f-d76b06ca8705_rw_3840_5f46ad356f-1280.webp 1280w, IMG/webp/110_4521c585-4a16-4ab5-9b1f-d76b06ca8705_rw_3840_5f46ad356f.webp 3840w",
      srcOriginal: "IMG/remote-originals/110_4521c585-4a16-4ab5-9b1f-d76b06ca8705_rw_3840.png",
      url: "https://colombamedina.myportfolio.com/identida-de-marca"
    },
    {
      id: "serie-matera",
      orientation: "v",
      span: 1,
      title: "1/2 Serie Matera",
      author: "Martina Abello",
      role: "",
      collab: "",
      area: "Fotografía / Risografía",
      year: "N/A",
      tags: ["fotografía", "risografía"],
      src: "IMG/webp/111_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.19.58_ea1a92829c.webp",
      srcAvif: "IMG/avif/111_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.19.58_ea1a92829c.avif",
      srcSetAvif: "IMG/avif/variants/111_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.19.58_ea1a92829c-640.avif 640w, IMG/avif/111_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.19.58_ea1a92829c.avif 1158w",
      srcSetWebp: "IMG/webp/variants/111_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.19.58_ea1a92829c-640.webp 640w, IMG/webp/111_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.19.58_ea1a92829c.webp 1158w",
      srcOriginal: "IMG/remote-originals/111_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.19.58.png",
      url: "https://mabellov.myportfolio.com/riso-1"
    },
    {
      id: "mitologia-chiloe",
      orientation: "v",
      span: 2,
      title: "Serie mitología Chiloé",
      author: "Martina Abello",
      role: "",
      collab: "Myriam Aguirre",
      area: "Risografía",
      year: 2022,
      tags: ["risografía"],
      src: "IMG/webp/112_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.59_b1f23a1594.webp",
      srcAvif: "IMG/avif/112_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.59_b1f23a1594.avif",
      srcSetAvif: "IMG/avif/variants/112_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.59_b1f23a1594-640.avif 640w, IMG/avif/112_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.59_b1f23a1594.avif 1268w",
      srcSetWebp: "IMG/webp/variants/112_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.59_b1f23a1594-640.webp 640w, IMG/webp/112_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.59_b1f23a1594.webp 1268w",
      srcOriginal: "IMG/remote-originals/112_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.59.png",
      url: "https://mabellov.myportfolio.com/riso-2"
    },
    /* ------------------ No tengo amigos tengo amores — Andrés Miquel ------------------ */
{
  src: "IMG/webp/113_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.36.36_1de640c0a4.webp",
  srcAvif: "IMG/avif/113_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.36.36_1de640c0a4.avif",
  srcSetAvif: "IMG/avif/variants/113_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.36.36_1de640c0a4-640.avif 640w, IMG/avif/variants/113_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.36.36_1de640c0a4-1280.avif 1280w, IMG/avif/113_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.36.36_1de640c0a4.avif 1494w",
  srcSetWebp: "IMG/webp/variants/113_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.36.36_1de640c0a4-640.webp 640w, IMG/webp/variants/113_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.36.36_1de640c0a4-1280.webp 1280w, IMG/webp/113_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.36.36_1de640c0a4.webp 1494w",
  srcOriginal: "IMG/remote-originals/113_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.36.36.png",
  orientation: "v",
  span: 2,
  tags: ["ilustración", "gráfico"],
  title: "No tengo amigos tengo amores",
  author: "Andrés Miquel",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/224616103/Poster-No-tengo-amigos-tengo-amores"
},

/* ------------------ Los Mil Nombres de María Camaleón — Andrés Miquel ------------------ */
{
  src: "IMG/webp/114_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.38.08_1d651ef43c.webp",
  srcAvif: "IMG/avif/114_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.38.08_1d651ef43c.avif",
  srcSetAvif: "IMG/avif/variants/114_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.38.08_1d651ef43c-640.avif 640w, IMG/avif/variants/114_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.38.08_1d651ef43c-1280.avif 1280w, IMG/avif/114_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.38.08_1d651ef43c.avif 1574w",
  srcSetWebp: "IMG/webp/variants/114_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.38.08_1d651ef43c-640.webp 640w, IMG/webp/variants/114_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.38.08_1d651ef43c-1280.webp 1280w, IMG/webp/114_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.38.08_1d651ef43c.webp 1574w",
  srcOriginal: "IMG/remote-originals/114_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.38.08.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración", "gráfico"],
  title: "Los Mil Nombres de María Camaleón",
  author: "Andrés Miquel",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/203999631/Afiche-Los-Mil-Nombres-de-Maria-Camaleon"
},

/* ------------------ Chini and the Technicians — Karina Hyland ------------------ */
{
  src: "IMG/webp/115_Karina-Hyland-02625b89-857f-4d69-9f47-edb7a081e016_rw_1920_843d6a0305.webp",
  srcAvif: "IMG/avif/115_Karina-Hyland-02625b89-857f-4d69-9f47-edb7a081e016_rw_1920_843d6a0305.avif",
  srcSetAvif: "IMG/avif/variants/115_Karina-Hyland-02625b89-857f-4d69-9f47-edb7a081e016_rw_1920_843d6a0305-640.avif 640w, IMG/avif/variants/115_Karina-Hyland-02625b89-857f-4d69-9f47-edb7a081e016_rw_1920_843d6a0305-1280.avif 1280w, IMG/avif/115_Karina-Hyland-02625b89-857f-4d69-9f47-edb7a081e016_rw_1920_843d6a0305.avif 1920w",
  srcSetWebp: "IMG/webp/variants/115_Karina-Hyland-02625b89-857f-4d69-9f47-edb7a081e016_rw_1920_843d6a0305-640.webp 640w, IMG/webp/variants/115_Karina-Hyland-02625b89-857f-4d69-9f47-edb7a081e016_rw_1920_843d6a0305-1280.webp 1280w, IMG/webp/115_Karina-Hyland-02625b89-857f-4d69-9f47-edb7a081e016_rw_1920_843d6a0305.webp 1920w",
  srcOriginal: "IMG/remote-originals/115_Karina-Hyland-02625b89-857f-4d69-9f47-edb7a081e016_rw_1920.jpg",
  orientation: "h",
  span: 0,
  tags: ["iluminación"],
  title: "Chini and the Technicians",
  author: "Karina Hyland",
  role: "",
  collab: "Iluminación por: Karina Hyland",
  area: "Iluminación",
  year: "2018",
  url: "https://karinahy.cl/stage"
},

/* ------------------ DEFAULT — Manuela Garretón, Tomás Ossandón ------------------ */
{
  src: "IMG/webp/116_Karina-Hyland-a7f3c303-c16e-4b68-bc30-df77e99a0763_7c317dd2a3.webp",
  srcAvif: "IMG/avif/116_Karina-Hyland-a7f3c303-c16e-4b68-bc30-df77e99a0763_7c317dd2a3.avif",
  srcSetAvif: "IMG/avif/variants/116_Karina-Hyland-a7f3c303-c16e-4b68-bc30-df77e99a0763_7c317dd2a3-640.avif 640w, IMG/avif/116_Karina-Hyland-a7f3c303-c16e-4b68-bc30-df77e99a0763_7c317dd2a3.avif 960w",
  srcSetWebp: "IMG/webp/variants/116_Karina-Hyland-a7f3c303-c16e-4b68-bc30-df77e99a0763_7c317dd2a3-640.webp 640w, IMG/webp/116_Karina-Hyland-a7f3c303-c16e-4b68-bc30-df77e99a0763_7c317dd2a3.webp 960w",
  srcOriginal: "IMG/remote-originals/116_Karina-Hyland-a7f3c303-c16e-4b68-bc30-df77e99a0763.jpg",
  orientation: "h",
  span: 1,
  tags: ["instalación", "web", "iluminación", "investigación"],
  title: "DEFAULT",
  author: "Karina Hyland",
  role: "Iluminación, diseño",
  collab: "Autores: Manuela Garretón, Tomás Ossandón. Iluminación, diseño y asistencia de investigación por: Karina Hyland",
  area: "Instalación / Web / Iluminación / Investigación",
  year: "2017",
  url: [
    "https://xdefault.cl/#proyecto",
    "https://karinahy.cl/default"
  ]
},

/* ------------------ P/H<25> — Vicente Puig ------------------ */
{
  src: "IMG/webp/117_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.56.10_041571fe0e.webp",
  srcAvif: "IMG/avif/117_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.56.10_041571fe0e.avif",
  srcSetAvif: "IMG/avif/variants/117_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.56.10_041571fe0e-640.avif 640w, IMG/avif/117_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.56.10_041571fe0e.avif 1250w",
  srcSetWebp: "IMG/webp/variants/117_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.56.10_041571fe0e-640.webp 640w, IMG/webp/117_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.56.10_041571fe0e.webp 1250w",
  srcOriginal: "IMG/remote-originals/117_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.56.10.png",
  orientation: "h",
  span: 0,
  tags: ["branding", "identidad visual", "gráfico"],
  title: "P/H<25>",
  author: "Vicente Puig",
  role: "",
  collab: "Puchworks",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2025",
  url: "https://www.instagram.com/p/DRVgPzziXWx/"
},

/* ------------------ REITE: rebranding — Vicente Puig ------------------ */
{
  src: "IMG/webp/118_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.59.20_9b7cfa3068.webp",
  srcAvif: "IMG/avif/118_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.59.20_9b7cfa3068.avif",
  srcSetAvif: "IMG/avif/variants/118_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.59.20_9b7cfa3068-640.avif 640w, IMG/avif/variants/118_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.59.20_9b7cfa3068-1280.avif 1280w, IMG/avif/118_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.59.20_9b7cfa3068.avif 1376w",
  srcSetWebp: "IMG/webp/variants/118_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.59.20_9b7cfa3068-640.webp 640w, IMG/webp/variants/118_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.59.20_9b7cfa3068-1280.webp 1280w, IMG/webp/118_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.59.20_9b7cfa3068.webp 1376w",
  srcOriginal: "IMG/remote-originals/118_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.59.20.png",
  orientation: "v",
  span: 1,
  tags: ["branding", "identidad visual", "gráfico"],
  title: "REITE: rebranding",
  author: "Vicente Puig",
  role: "",
  collab: "Puchworks",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2025",
  url: "https://www.instagram.com/p/DQsJH1jCevq/"
},

/* ------------------ DRP_01 — Benjamín Becerra ------------------ */
{
  src: "IMG/webp/119_Benjamin-Becerra-Captura-de-pantalla-2026-01-04-a-las-14.02.30_0c73ee20fc.webp",
  srcAvif: "IMG/avif/119_Benjamin-Becerra-Captura-de-pantalla-2026-01-04-a-las-14.02.30_0c73ee20fc.avif",
  srcSetAvif: "IMG/avif/variants/119_Benjamin-Becerra-Captura-de-pantalla-2026-01-04-a-las-14.02.30_0c73ee20fc-640.avif 640w, IMG/avif/119_Benjamin-Becerra-Captura-de-pantalla-2026-01-04-a-las-14.02.30_0c73ee20fc.avif 1206w",
  srcSetWebp: "IMG/webp/variants/119_Benjamin-Becerra-Captura-de-pantalla-2026-01-04-a-las-14.02.30_0c73ee20fc-640.webp 640w, IMG/webp/119_Benjamin-Becerra-Captura-de-pantalla-2026-01-04-a-las-14.02.30_0c73ee20fc.webp 1206w",
  srcOriginal: "IMG/remote-originals/119_Benjamin-Becerra-Captura-de-pantalla-2026-01-04-a-las-14.02.30.png",
  orientation: "v",
  span: 1,
  tags: ["vestuario", "moda"],
  title: "DRP_01",
  author: "Benjamín Becerra",
  role: "",
  collab: "Hostil",
  area: "Vestuario / Moda",
  year: "2025",
  url: "https://hostil-streetwear.com/products/hoodie_core"
},

    {
      id: "anthology",
      title: "Anthology",
      author: "Martina Abello",
      orientation: "v",
  span: 2,
      role: "",
      collab: "Curso VNC-2371-A Arts Books and Abstract Comics – SVA",
      area: "Risografía",
      year: "N/A",
      tags: ["risografía"],
      src: "IMG/webp/120_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.33_7b3aa70099.webp",
      srcAvif: "IMG/avif/120_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.33_7b3aa70099.avif",
      srcSetAvif: "IMG/avif/variants/120_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.33_7b3aa70099-640.avif 640w, IMG/avif/120_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.33_7b3aa70099.avif 1020w",
      srcSetWebp: "IMG/webp/variants/120_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.33_7b3aa70099-640.webp 640w, IMG/webp/120_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.33_7b3aa70099.webp 1020w",
      srcOriginal: "IMG/remote-originals/120_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.33.png",
      url: "https://mabellov.myportfolio.com/riso-3"
    },
    {
      id: "ilustraciones-mojonas",
      title: "Ilustraciones Mojonas",
      author: "Sofía Álvarez",
      role: "",
      collab: "Vans",
      area: "Ilustración / Muralismo",
      year: 2024,
      tags: ["ilustración", "muralismo"],
      src: "IMG/webp/121_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.08_d19ef4f35e.webp",
      srcAvif: "IMG/avif/121_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.08_d19ef4f35e.avif",
      srcSetAvif: "IMG/avif/variants/121_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.08_d19ef4f35e-640.avif 640w, IMG/avif/variants/121_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.08_d19ef4f35e-1280.avif 1280w, IMG/avif/121_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.08_d19ef4f35e.avif 2000w",
      srcSetWebp: "IMG/webp/variants/121_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.08_d19ef4f35e-640.webp 640w, IMG/webp/variants/121_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.08_d19ef4f35e-1280.webp 1280w, IMG/webp/121_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.08_d19ef4f35e.webp 2000w",
      srcOriginal: "IMG/remote-originals/121_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.08.png",
      url: "https://readymag.website/u3068913620/portafoliomojona/proyectomojona/"
    },
    {
      id: "toyng",
      title: "Toyng",
      author: "Sofía Álvarez",
      role: "",
      collab: "Toyng Travel Games",
      area: "Producto",
      year: "2024/2025",
      tags: ["producto"],
      src: "IMG/webp/122_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.18_cac2d551c0.webp",
      srcAvif: "IMG/avif/122_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.18_cac2d551c0.avif",
      srcSetAvif: "IMG/avif/variants/122_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.18_cac2d551c0-640.avif 640w, IMG/avif/variants/122_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.18_cac2d551c0-1280.avif 1280w, IMG/avif/122_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.18_cac2d551c0.avif 1424w",
      srcSetWebp: "IMG/webp/variants/122_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.18_cac2d551c0-640.webp 640w, IMG/webp/variants/122_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.18_cac2d551c0-1280.webp 1280w, IMG/webp/122_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.18_cac2d551c0.webp 1424w",
      srcOriginal: "IMG/remote-originals/122_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.18.png",
      url: "https://readymag.website/u3068913620/portafoliomojona/proyectotoyngtravelgames/"
    },
/* ------------------ De Cancelling — Domingo Smart ------------------ */
{
  src: "IMG/webp/123_Smart-Domingo_781aad8edb.webp",
  srcAvif: "IMG/avif/123_Smart-Domingo_781aad8edb.avif",
  srcSetAvif: "IMG/avif/variants/123_Smart-Domingo_781aad8edb-640.avif 640w, IMG/avif/123_Smart-Domingo_781aad8edb.avif 874w",
  srcSetWebp: "IMG/webp/variants/123_Smart-Domingo_781aad8edb-640.webp 640w, IMG/webp/123_Smart-Domingo_781aad8edb.webp 874w",
  srcOriginal: "IMG/remote-originals/123_Smart-Domingo.png",
  orientation: "v",
  span: 2,
  tags: ["soundscape","experimental","investigación","museografía"],
  title: "De Cancelling",
  author: "Domingo Smart",
  role: "",
  collab: "Guiatura: Nicolás Morales. Colaboradores: Manuel Larraín, Lukas Yunge",
  area: "Soundscape / Investigación / Museografía",
  year: "2025",
  url: "https://www.estudioample.com/003"
},

/* ------------------ PACKAGING FL-01 — Domingo Smart ------------------ */
{
  src: "IMG/webp/124_Smart-Domingo-1_675fb18f32.webp",
  srcAvif: "IMG/avif/124_Smart-Domingo-1_675fb18f32.avif",
  srcSetAvif: "IMG/avif/variants/124_Smart-Domingo-1_675fb18f32-640.avif 640w, IMG/avif/124_Smart-Domingo-1_675fb18f32.avif 750w",
  srcSetWebp: "IMG/webp/variants/124_Smart-Domingo-1_675fb18f32-640.webp 640w, IMG/webp/124_Smart-Domingo-1_675fb18f32.webp 750w",
  srcOriginal: "IMG/remote-originals/124_Smart-Domingo-1.jpg",
  orientation: "v",
  span: 1,
  tags: ["packaging","serigrafía","industrial"],
  title: "PACKAGING FL-01",
  author: "Domingo Smart",
  role: "",
  collab: "Artista: Martín Jiménez",
  area: "Packaging / Serigrafía / Industrial",
  year: "2024",
  url: "https://www.estudioample.com/002"
},

/* ------------------ Mesa Lateral — Domingo Smart ------------------ */
{
  src: "IMG/webp/125_Smart-Domingo-3_2e2439bbed.webp",
  srcAvif: "IMG/avif/125_Smart-Domingo-3_2e2439bbed.avif",
  srcSetAvif: "IMG/avif/variants/125_Smart-Domingo-3_2e2439bbed-640.avif 640w, IMG/avif/variants/125_Smart-Domingo-3_2e2439bbed-1280.avif 1280w, IMG/avif/125_Smart-Domingo-3_2e2439bbed.avif 3875w",
  srcSetWebp: "IMG/webp/variants/125_Smart-Domingo-3_2e2439bbed-640.webp 640w, IMG/webp/variants/125_Smart-Domingo-3_2e2439bbed-1280.webp 1280w, IMG/webp/125_Smart-Domingo-3_2e2439bbed.webp 3875w",
  srcOriginal: "IMG/remote-originals/125_Smart-Domingo-3.jpg",
  orientation: "v",
  span: 2,
  tags: ["mobiliario","industrial","producto"],
  title: "Mesa Lateral",
  author: "Domingo Smart",
  role: "",
  collab: "Estudio: Ample",
  area: "Mobiliario / Producto / Industrial",
  year: "2024",
  url: "https://www.estudioample.com/001"
},

/* ------------------ Axigo — Tomás Sánchez ------------------ */
{
  src: "IMG/webp/126_Sanchez-Tomas_a8c429f54f.webp",
  srcAvif: "IMG/avif/126_Sanchez-Tomas_a8c429f54f.avif",
  srcSetAvif: "IMG/avif/variants/126_Sanchez-Tomas_a8c429f54f-640.avif 640w, IMG/avif/variants/126_Sanchez-Tomas_a8c429f54f-1280.avif 1280w, IMG/avif/126_Sanchez-Tomas_a8c429f54f.avif 1982w",
  srcSetWebp: "IMG/webp/variants/126_Sanchez-Tomas_a8c429f54f-640.webp 640w, IMG/webp/variants/126_Sanchez-Tomas_a8c429f54f-1280.webp 1280w, IMG/webp/126_Sanchez-Tomas_a8c429f54f.webp 1982w",
  srcOriginal: "IMG/remote-originals/126_Sanchez-Tomas.png",
  orientation: "h",
  span: 2,
  tags: ["servicio","deportes","salud"],
  title: "Axigo",
  author: "Tomás Sánchez",
  role: "",
  collab: "Guiatura: Tomás Vivanco",
  area: "Servicio / Deportes / Salud",
  year: "2023",
  url: "https://tomassanchezsilva.myportfolio.com/axigo"
},

/* ------------------ Centralcorp — Francisco Poulsen ------------------ */
{
  src: "IMG/webp/127_Poulsen-Francisco-1_a3c5cbc7b4.webp",
  srcAvif: "IMG/avif/127_Poulsen-Francisco-1_a3c5cbc7b4.avif",
  srcSetAvif: "IMG/avif/variants/127_Poulsen-Francisco-1_a3c5cbc7b4-640.avif 640w, IMG/avif/variants/127_Poulsen-Francisco-1_a3c5cbc7b4-1280.avif 1280w, IMG/avif/127_Poulsen-Francisco-1_a3c5cbc7b4.avif 3512w",
  srcSetWebp: "IMG/webp/variants/127_Poulsen-Francisco-1_a3c5cbc7b4-640.webp 640w, IMG/webp/variants/127_Poulsen-Francisco-1_a3c5cbc7b4-1280.webp 1280w, IMG/webp/127_Poulsen-Francisco-1_a3c5cbc7b4.webp 3512w",
  srcOriginal: "IMG/remote-originals/127_Poulsen-Francisco-1.jpg",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Centralcorp",
  author: "Francisco Poulsen",
  role: "",
  collab: "Trabajo realizado en IV estudio",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/229770149/Centralcorp"
},

/* ------------------ Olivo — Francisco Poulsen ------------------ */
{
  src: "IMG/webp/128_Poulsen-Francisco-2_b682796b17.webp",
  srcAvif: "IMG/avif/128_Poulsen-Francisco-2_b682796b17.avif",
  srcSetAvif: "IMG/avif/variants/128_Poulsen-Francisco-2_b682796b17-640.avif 640w, IMG/avif/variants/128_Poulsen-Francisco-2_b682796b17-1280.avif 1280w, IMG/avif/128_Poulsen-Francisco-2_b682796b17.avif 4317w",
  srcSetWebp: "IMG/webp/variants/128_Poulsen-Francisco-2_b682796b17-640.webp 640w, IMG/webp/variants/128_Poulsen-Francisco-2_b682796b17-1280.webp 1280w, IMG/webp/128_Poulsen-Francisco-2_b682796b17.webp 4317w",
  srcOriginal: "IMG/remote-originals/128_Poulsen-Francisco-2.jpg",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Olivo",
  author: "Francisco Poulsen",
  role: "",
  collab: "Trabajo realizado en IV estudio",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2026",
  url: "https://www.behance.net/gallery/241545075/Olivo"
},

/* ------------------ Délano — Francisco Poulsen ------------------ */
{
  src: "IMG/webp/129_Poulsen-Francisco-3_3ff00231bf.webp",
  srcAvif: "IMG/avif/129_Poulsen-Francisco-3_3ff00231bf.avif",
  srcSetAvif: "IMG/avif/variants/129_Poulsen-Francisco-3_3ff00231bf-640.avif 640w, IMG/avif/129_Poulsen-Francisco-3_3ff00231bf.avif 891w",
  srcSetWebp: "IMG/webp/variants/129_Poulsen-Francisco-3_3ff00231bf-640.webp 640w, IMG/webp/129_Poulsen-Francisco-3_3ff00231bf.webp 891w",
  srcOriginal: "IMG/remote-originals/129_Poulsen-Francisco-3.jpg",
  orientation: "h",
  span: 1,
  tags: ["branding","web","gráfico"],
  title: "Délano",
  author: "Francisco Poulsen",
  role: "",
  collab: "Co-autor: Francisco Poulsen",
  area: "Branding / Web / Gráfico",
  year: "-",
  url: "https://www.behance.net/gallery/238927891/Dlano"
},

/* ------------------ Sala simulación AVD — Valentina Navarrete ------------------ */
{
  src: "IMG/webp/130_Navarrete-Valentina_d890f1d31c.webp",
  srcAvif: "IMG/avif/130_Navarrete-Valentina_d890f1d31c.avif",
  srcSetAvif: "IMG/avif/variants/130_Navarrete-Valentina_d890f1d31c-640.avif 640w, IMG/avif/130_Navarrete-Valentina_d890f1d31c.avif 1280w",
  srcSetWebp: "IMG/webp/variants/130_Navarrete-Valentina_d890f1d31c-640.webp 640w, IMG/webp/130_Navarrete-Valentina_d890f1d31c.webp 1280w",
  srcOriginal: "IMG/remote-originals/130_Navarrete-Valentina.jpg",
  orientation: "h",
  span: 1,
  tags: ["industrial","espacios","salud"],
  title: "Sala simulación AVD",
  author: "María Fernanda Gonzalez, Clemente López, Valentina Navarrete",
  role: "",
  collab: "",
  area: "Industrial / Espacios / Salud",
  year: "2025",
  url: "https://sites.google.com/view/valenavarrete-portafolio/sala-simulaci%C3%B3n-avd?"
},

/* ------------------ Salud oportuna en el sistema público de Chile — Felipe Vilches Ivelić ------------------ */
{
  src: "IMG/webp/131_Vilches-Felipe-04_da5c71dd36.webp",
  srcAvif: "IMG/avif/131_Vilches-Felipe-04_da5c71dd36.avif",
  srcSetAvif: "IMG/avif/variants/131_Vilches-Felipe-04_da5c71dd36-640.avif 640w, IMG/avif/variants/131_Vilches-Felipe-04_da5c71dd36-1280.avif 1280w, IMG/avif/131_Vilches-Felipe-04_da5c71dd36.avif 3910w",
  srcSetWebp: "IMG/webp/variants/131_Vilches-Felipe-04_da5c71dd36-640.webp 640w, IMG/webp/variants/131_Vilches-Felipe-04_da5c71dd36-1280.webp 1280w, IMG/webp/131_Vilches-Felipe-04_da5c71dd36.webp 3910w",
  srcOriginal: "IMG/remote-originals/131_Vilches-Felipe-04.jpg",
  orientation: "h",
  span: 2,
  tags: ["animación","audiovisual","motion graphics","salud"],
  title: "Salud oportuna en el sistema público de Chile",
  author: "Felipe Vilches Ivelić",
  role: "",
  collab: "Encargo: LIP UC, Ministerio de Salud, Banco Interamericano de Desarrollo",
  area: "Animación / Audiovisual / Motion Graphics",
  year: "2020",
  url: "https://felipevilchesinc.com/trabajo/salud-oportuna"
},

/* ------------------ El delantal vestido — Felipe Vilches Ivelić ------------------ */
{
  src: "IMG/webp/132_Vilches-Felipe_6c262e12da.webp",
  srcAvif: "IMG/avif/132_Vilches-Felipe_6c262e12da.avif",
  srcSetAvif: "IMG/avif/variants/132_Vilches-Felipe_6c262e12da-640.avif 640w, IMG/avif/variants/132_Vilches-Felipe_6c262e12da-1280.avif 1280w, IMG/avif/132_Vilches-Felipe_6c262e12da.avif 2366w",
  srcSetWebp: "IMG/webp/variants/132_Vilches-Felipe_6c262e12da-640.webp 640w, IMG/webp/variants/132_Vilches-Felipe_6c262e12da-1280.webp 1280w, IMG/webp/132_Vilches-Felipe_6c262e12da.webp 2366w",
  srcOriginal: "IMG/remote-originals/132_Vilches-Felipe.png",
  orientation: "h",
  span: 2,
  tags: ["animación","audiovisual","motion graphics","museografía"],
  title: "El delantal vestido",
  author: "Felipe Vilches Ivelić",
  role: "",
  collab: "Curaduría: Camila Ríos Erazo. Identidad gráfica: Sergio Ramírez Flores",
  area: "Animación / Audiovisual / Motion Graphics",
  year: "2024",
  url: "https://felipevilchesinc.com/trabajo/delantal-vestido"
},

/* ------------------ De Este a Oeste, de Norte a Sur — Felipe Vilches Ivelić ------------------ */
{
  src: "IMG/webp/133_Vilches-Felipe-05_c5ecf441e5.webp",
  srcAvif: "IMG/avif/133_Vilches-Felipe-05_c5ecf441e5.avif",
  srcSetAvif: "IMG/avif/variants/133_Vilches-Felipe-05_c5ecf441e5-640.avif 640w, IMG/avif/variants/133_Vilches-Felipe-05_c5ecf441e5-1280.avif 1280w, IMG/avif/133_Vilches-Felipe-05_c5ecf441e5.avif 3910w",
  srcSetWebp: "IMG/webp/variants/133_Vilches-Felipe-05_c5ecf441e5-640.webp 640w, IMG/webp/variants/133_Vilches-Felipe-05_c5ecf441e5-1280.webp 1280w, IMG/webp/133_Vilches-Felipe-05_c5ecf441e5.webp 3910w",
  srcOriginal: "IMG/remote-originals/133_Vilches-Felipe-05.jpg",
  orientation: "v",
  span: 1,
  tags: ["animación","audiovisual","motion graphics"],
  title: "De Este a Oeste, de Norte a Sur",
  author: "Felipe Vilches Ivelić",
  role: "",
  collab: "Dirección: Domingo Abelli. Producción: Goroka TV",
  area: "Animación / Motion Graphics / Audiovisual",
  year: "2022",
  url: "https://felipevilchesinc.com/trabajo/titulos-deaodnas-documental"
},

/* ------------------ Péndulo — Daniela Reyes Muñoz ------------------ */
{
  src: "IMG/webp/134_Reyes-Daniela_9e69d51995.webp",
  srcAvif: "IMG/avif/134_Reyes-Daniela_9e69d51995.avif",
  srcSetAvif: "IMG/avif/variants/134_Reyes-Daniela_9e69d51995-640.avif 640w, IMG/avif/variants/134_Reyes-Daniela_9e69d51995-1280.avif 1280w, IMG/avif/134_Reyes-Daniela_9e69d51995.avif 2210w",
  srcSetWebp: "IMG/webp/variants/134_Reyes-Daniela_9e69d51995-640.webp 640w, IMG/webp/variants/134_Reyes-Daniela_9e69d51995-1280.webp 1280w, IMG/webp/134_Reyes-Daniela_9e69d51995.webp 2210w",
  srcOriginal: "IMG/remote-originals/134_Reyes-Daniela.png",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Péndulo",
  author: "Daniela Reyes Muñoz",
  role: "",
  collab: "",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2024",
  url: "https://www.behance.net/gallery/211077763/PENDULO"
},

/* ------------------ Cositas Fanzine — Daniela Reyes Muñoz ------------------ */
{
  src: "IMG/webp/135_Reyes-Daniela-cositas1_670_61ad02fc7e.webp",
  srcAvif: "IMG/avif/135_Reyes-Daniela-cositas1_670_61ad02fc7e.avif",
  srcSetAvif: "IMG/avif/variants/135_Reyes-Daniela-cositas1_670_61ad02fc7e-640.avif 640w, IMG/avif/135_Reyes-Daniela-cositas1_670_61ad02fc7e.avif 670w",
  srcSetWebp: "IMG/webp/variants/135_Reyes-Daniela-cositas1_670_61ad02fc7e-640.webp 640w, IMG/webp/135_Reyes-Daniela-cositas1_670_61ad02fc7e.webp 670w",
  srcOriginal: "IMG/remote-originals/135_Reyes-Daniela-cositas1_670.jpg",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "Cositas Fanzine",
  author: "Daniela Reyes Muñoz",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2024",
  url: "https://danielawilliam.com/Fanzine-Cositas"
},

/* ------------------ Mujeres Inspiradoras — Daniela Reyes Muñoz ------------------ */
{
  src: "IMG/webp/136_Reyes-Daniela-STEM2_670_0a009ba044.webp",
  srcAvif: "IMG/avif/136_Reyes-Daniela-STEM2_670_0a009ba044.avif",
  srcSetAvif: "IMG/avif/variants/136_Reyes-Daniela-STEM2_670_0a009ba044-640.avif 640w, IMG/avif/136_Reyes-Daniela-STEM2_670_0a009ba044.avif 670w",
  srcSetWebp: "IMG/webp/variants/136_Reyes-Daniela-STEM2_670_0a009ba044-640.webp 640w, IMG/webp/136_Reyes-Daniela-STEM2_670_0a009ba044.webp 670w",
  srcOriginal: "IMG/remote-originals/136_Reyes-Daniela-STEM2_670.jpg",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "Mujeres Inspiradoras",
  author: "Daniela Reyes Muñoz",
  role: "",
  collab: "Proyecto con Mujeres Bacanas",
  area: "Ilustración / Gráfico",
  year: "2023",
  url: "https://danielawilliam.com/Illustration-work/STEM"
},

/* ------------------ Los Heroes Magazine Covers — Daniela Reyes Muñoz ------------------ */
{
  src: "IMG/webp/137_Reyes-Daniela-abril2023_670_08e85af890.webp",
  srcAvif: "IMG/avif/137_Reyes-Daniela-abril2023_670_08e85af890.avif",
  srcSetAvif: "IMG/avif/variants/137_Reyes-Daniela-abril2023_670_08e85af890-640.avif 640w, IMG/avif/137_Reyes-Daniela-abril2023_670_08e85af890.avif 670w",
  srcSetWebp: "IMG/webp/variants/137_Reyes-Daniela-abril2023_670_08e85af890-640.webp 640w, IMG/webp/137_Reyes-Daniela-abril2023_670_08e85af890.webp 670w",
  srcOriginal: "IMG/remote-originals/137_Reyes-Daniela-abril2023_670.jpg",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "Los Heroes Magazine Covers",
  author: "Daniela Reyes Muñoz",
  role: "",
  collab: "Revista Los Héroes",
  area: "Ilustración / Editorial",
  year: "2023",
  url: "https://danielawilliam.com/Illustration-work/Los-Heroes-2023"
},

/* ------------------ Disonia — Joaquín Gajardo ------------------ */
{
  src: "IMG/webp/138_Gajardo-Joaquin-6624043949c81673fb06bf59_Mesa-de-trabajo-18-copia-9_734e9bbeca.webp",
  srcAvif: "IMG/avif/138_Gajardo-Joaquin-6624043949c81673fb06bf59_Mesa-de-trabajo-18-copia-9_734e9bbeca.avif",
  srcSetAvif: "IMG/avif/variants/138_Gajardo-Joaquin-6624043949c81673fb06bf59_Mesa-de-trabajo-18-copia-9_734e9bbeca-640.avif 640w, IMG/avif/variants/138_Gajardo-Joaquin-6624043949c81673fb06bf59_Mesa-de-trabajo-18-copia-9_734e9bbeca-1280.avif 1280w, IMG/avif/138_Gajardo-Joaquin-6624043949c81673fb06bf59_Mesa-de-trabajo-18-copia-9_734e9bbeca.avif 2226w",
  srcSetWebp: "IMG/webp/variants/138_Gajardo-Joaquin-6624043949c81673fb06bf59_Mesa-de-trabajo-18-copia-9_734e9bbeca-640.webp 640w, IMG/webp/variants/138_Gajardo-Joaquin-6624043949c81673fb06bf59_Mesa-de-trabajo-18-copia-9_734e9bbeca-1280.webp 1280w, IMG/webp/138_Gajardo-Joaquin-6624043949c81673fb06bf59_Mesa-de-trabajo-18-copia-9_734e9bbeca.webp 2226w",
  srcOriginal: "IMG/remote-originals/138_Gajardo-Joaquin-6624043949c81673fb06bf59_Mesa-de-trabajo-18-copia-9.jpg",
  orientation: "h",
  span: 1,
  tags: ["desarrollo web","servicios","portafolio"],
  title: "Disonia",
  author: "Joaquín Gajardo",
  role: "",
  collab: "Cliente: DISONIA. Trabajo realizado en Gaja Studio",
  area: "Desarrollo Web / Servicios",
  year: "2023",
  url: "https://www.gaja.studio/proyectos/topo-colectivo"
},

/* ------------------ TOPO COLECTIVO — Joaquín Gajardo ------------------ */
{
  src: "IMG/webp/139_Gajardo-Joaquin-66831724e1980d57e502d3b2_Mesa-de-trabajo-18-copia-4_526844a5de.webp",
  srcAvif: "IMG/avif/139_Gajardo-Joaquin-66831724e1980d57e502d3b2_Mesa-de-trabajo-18-copia-4_526844a5de.avif",
  srcSetAvif: "IMG/avif/variants/139_Gajardo-Joaquin-66831724e1980d57e502d3b2_Mesa-de-trabajo-18-copia-4_526844a5de-640.avif 640w, IMG/avif/variants/139_Gajardo-Joaquin-66831724e1980d57e502d3b2_Mesa-de-trabajo-18-copia-4_526844a5de-1280.avif 1280w, IMG/avif/139_Gajardo-Joaquin-66831724e1980d57e502d3b2_Mesa-de-trabajo-18-copia-4_526844a5de.avif 2226w",
  srcSetWebp: "IMG/webp/variants/139_Gajardo-Joaquin-66831724e1980d57e502d3b2_Mesa-de-trabajo-18-copia-4_526844a5de-640.webp 640w, IMG/webp/variants/139_Gajardo-Joaquin-66831724e1980d57e502d3b2_Mesa-de-trabajo-18-copia-4_526844a5de-1280.webp 1280w, IMG/webp/139_Gajardo-Joaquin-66831724e1980d57e502d3b2_Mesa-de-trabajo-18-copia-4_526844a5de.webp 2226w",
  srcOriginal: "IMG/remote-originals/139_Gajardo-Joaquin-66831724e1980d57e502d3b2_Mesa-de-trabajo-18-copia-4.jpg",
  orientation: "h",
  span: 1,
  tags: ["desarrollo web","servicios","ecommerce"],
  title: "TOPO COLECTIVO",
  author: "Joaquín Gajardo",
  role: "",
  collab: "Cliente: TOPO COLECTIVO. Trabajo realizado en Gaja Studio",
  area: "Desarrollo Web / Ecommerce",
  year: "2023",
  url: "https://www.gaja.studio/proyectos/jose-maiza"
},
/* ------------------ La Raíz del Aire — Florencia Caro / Colomba Acosta ------------------ */
{
  src: "IMG/webp/140_Caro-Florencia-Captura-de-pantalla-2026-03-09-a-las-16.27.21_fad9ff57ce.webp",
  srcAvif: "IMG/avif/140_Caro-Florencia-Captura-de-pantalla-2026-03-09-a-las-16.27.21_fad9ff57ce.avif",
  srcSetAvif: "IMG/avif/variants/140_Caro-Florencia-Captura-de-pantalla-2026-03-09-a-las-16.27.21_fad9ff57ce-640.avif 640w, IMG/avif/variants/140_Caro-Florencia-Captura-de-pantalla-2026-03-09-a-las-16.27.21_fad9ff57ce-1280.avif 1280w, IMG/avif/140_Caro-Florencia-Captura-de-pantalla-2026-03-09-a-las-16.27.21_fad9ff57ce.avif 1602w",
  srcSetWebp: "IMG/webp/variants/140_Caro-Florencia-Captura-de-pantalla-2026-03-09-a-las-16.27.21_fad9ff57ce-640.webp 640w, IMG/webp/variants/140_Caro-Florencia-Captura-de-pantalla-2026-03-09-a-las-16.27.21_fad9ff57ce-1280.webp 1280w, IMG/webp/140_Caro-Florencia-Captura-de-pantalla-2026-03-09-a-las-16.27.21_fad9ff57ce.webp 1602w",
  srcOriginal: "IMG/remote-originals/140_Caro-Florencia-Captura-de-pantalla-2026-03-09-a-las-16.27.21.png",
  orientation: "h",
  span: 1,
  tags: ["editorial","diagramación","gráfico"],
  title: "La Raíz del Aire",
  author: "Florencia Caro, Colomba Acosta",
  role: "",
  collab: "Fotografía: G. Vivanco. Realizado en Mucha Trama Estudio",
  area: "Editorial / Diagramación / Gráfico",
  year: "2025",
  url: "https://muchatrama.wixsite.com/muchatrama/portfolio-collections/my-portfolio/project-title-5"
},

/* ------------------ Raíz Rituales — Colomba Acosta / Florencia Caro ------------------ */
{
  src: "IMG/webp/141_Acosta--Colomba-Captura-de-pantalla-2026-03-09-a-las-16.30.34_7b27476236.webp",
  srcAvif: "IMG/avif/141_Acosta--Colomba-Captura-de-pantalla-2026-03-09-a-las-16.30.34_7b27476236.avif",
  srcSetAvif: "IMG/avif/variants/141_Acosta--Colomba-Captura-de-pantalla-2026-03-09-a-las-16.30.34_7b27476236-640.avif 640w, IMG/avif/141_Acosta--Colomba-Captura-de-pantalla-2026-03-09-a-las-16.30.34_7b27476236.avif 1276w",
  srcSetWebp: "IMG/webp/variants/141_Acosta--Colomba-Captura-de-pantalla-2026-03-09-a-las-16.30.34_7b27476236-640.webp 640w, IMG/webp/141_Acosta--Colomba-Captura-de-pantalla-2026-03-09-a-las-16.30.34_7b27476236.webp 1276w",
  srcOriginal: "IMG/remote-originals/141_Acosta--Colomba-Captura-de-pantalla-2026-03-09-a-las-16.30.34.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","fanzine","impresión"],
  title: "Raíz Rituales",
  author: "Colomba Acosta, Florencia Caro",
  role: "",
  collab: "Proyecto de diseño para Raíz Rituales. Realizado en Mucha Trama Estudio",
  area: "Editorial / Fanzine / Impreso",
  year: "2025",
  url: "https://muchatrama.wixsite.com/muchatrama/portfolio-collections/my-portfolio/project-title-6-1"
},

/* ------------------ Decide Chile — Constanza Morales ------------------ */
{
  src: "IMG/webp/142_morales-constanza-1_be0507456b.webp",
  srcAvif: "IMG/avif/142_morales-constanza-1_be0507456b.avif",
  srcSetAvif: "IMG/avif/variants/142_morales-constanza-1_be0507456b-640.avif 640w, IMG/avif/142_morales-constanza-1_be0507456b.avif 1200w",
  srcSetWebp: "IMG/webp/variants/142_morales-constanza-1_be0507456b-640.webp 640w, IMG/webp/142_morales-constanza-1_be0507456b.webp 1200w",
  srcOriginal: "IMG/remote-originals/142_morales-constanza-1.jpg",
  orientation: "v",
  span: 1,
  tags: ["ux","ui","web","responsivo"],
  title: "Decide Chile",
  author: "Constanza Morales",
  role: "",
  collab: "Colaboradoras: Natalia Rojo, Camila Navarrete",
  area: "UX / UI / Web",
  year: "2020",
  url: "https://www.constanzamorales.com/projects/decidechile"
},

/* ------------------ Antagonista — Bernardita Hoffmann ------------------ */
{
  src: "IMG/webp/143_Hoffmann-Bernardita-1_d011ee7d0b.webp",
  srcAvif: "IMG/avif/143_Hoffmann-Bernardita-1_d011ee7d0b.avif",
  srcSetAvif: "IMG/avif/variants/143_Hoffmann-Bernardita-1_d011ee7d0b-640.avif 640w, IMG/avif/variants/143_Hoffmann-Bernardita-1_d011ee7d0b-1280.avif 1280w, IMG/avif/143_Hoffmann-Bernardita-1_d011ee7d0b.avif 1920w",
  srcSetWebp: "IMG/webp/variants/143_Hoffmann-Bernardita-1_d011ee7d0b-640.webp 640w, IMG/webp/variants/143_Hoffmann-Bernardita-1_d011ee7d0b-1280.webp 1280w, IMG/webp/143_Hoffmann-Bernardita-1_d011ee7d0b.webp 1920w",
  srcOriginal: "IMG/remote-originals/143_Hoffmann-Bernardita-1.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","packaging"],
  title: "Antagonista",
  author: "Bernardita Hoffmann",
  role: "",
  collab: "",
  area: "Producto / Industrial / Packaging",
  year: "2023",
  url: "https://bhbouchon.myportfolio.com/antagonista"
},

/* ------------------ Batallas en el barrio — Magdalena Leigh ------------------ */
{
  src: "IMG/webp/144_leigh-magdalena_82c39226e4.webp",
  srcAvif: "IMG/avif/144_leigh-magdalena_82c39226e4.avif",
  srcSetAvif: "IMG/avif/variants/144_leigh-magdalena_82c39226e4-640.avif 640w, IMG/avif/variants/144_leigh-magdalena_82c39226e4-1280.avif 1280w, IMG/avif/144_leigh-magdalena_82c39226e4.avif 2048w",
  srcSetWebp: "IMG/webp/variants/144_leigh-magdalena_82c39226e4-640.webp 640w, IMG/webp/variants/144_leigh-magdalena_82c39226e4-1280.webp 1280w, IMG/webp/144_leigh-magdalena_82c39226e4.webp 2048w",
  srcOriginal: "IMG/remote-originals/144_leigh-magdalena.jpeg",
  orientation: "v",
  span: 1,
  tags: ["cultura","museografía","investigación"],
  title: "Batallas en el barrio",
  author: "Magdalena Leigh",
  role: "",
  collab: "Investigación: Magdalena Leigh. Guiatura: Pedro Álvarez",
  area: "Cultura / Museografía / Investigación",
  year: "2025",
  url: "https://www.linkedin.com/posts/magdalena-leigh-maturana-b586aa27b_despu%C3%A9s-de-varios-meses-de-investigaci%C3%B3n-activity-7415374998154207232-lamk"
},

/* ------------------ POLKA DOT — Fernanda Gutiérrez ------------------ */
{
  src: "IMG/webp/145_gutierrez-fernanda-2_71bfe0a4b0.webp",
  srcAvif: "IMG/avif/145_gutierrez-fernanda-2_71bfe0a4b0.avif",
  srcSetAvif: "IMG/avif/variants/145_gutierrez-fernanda-2_71bfe0a4b0-640.avif 640w, IMG/avif/145_gutierrez-fernanda-2_71bfe0a4b0.avif 841w",
  srcSetWebp: "IMG/webp/variants/145_gutierrez-fernanda-2_71bfe0a4b0-640.webp 640w, IMG/webp/145_gutierrez-fernanda-2_71bfe0a4b0.webp 841w",
  srcOriginal: "IMG/remote-originals/145_gutierrez-fernanda-2.jpg",
  orientation: "v",
  span: 1,
  tags: ["dirección de arte","moda","fotografía"],
  title: "POLKA DOT",
  author: "Fernanda Gutiérrez",
  role: "",
  collab: "Dirección creativa: @fgtzzz_, @javinaranjot. Fotografía: @diegoaguilera.p. Modelo: @agustinazegers. Estilismo: @manuela.eyz",
  area: "Dirección de arte / Moda / Fotografía",
  year: "2025",
  url: "https://readymag.website/u1773068245/6079251/2/"
},

/* ------------------ Fresca Rebeca (producto) — Fernanda Gutiérrez ------------------ */
{
  src: "IMG/webp/146_gutierrez-fernanda-3.jpg_03d8d32406.webp",
  srcAvif: "IMG/avif/146_gutierrez-fernanda-3.jpg_03d8d32406.avif",
  srcSetAvif: "IMG/avif/variants/146_gutierrez-fernanda-3.jpg_03d8d32406-640.avif 640w, IMG/avif/146_gutierrez-fernanda-3.jpg_03d8d32406.avif 825w",
  srcSetWebp: "IMG/webp/variants/146_gutierrez-fernanda-3.jpg_03d8d32406-640.webp 640w, IMG/webp/146_gutierrez-fernanda-3.jpg_03d8d32406.webp 825w",
  srcOriginal: "IMG/remote-originals/146_gutierrez-fernanda-3.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["dirección de arte","moda","fotografía"],
  title: "Fresca Rebeca",
  author: "Fernanda Gutiérrez",
  role: "",
  collab: "Dirección de arte: @fgtzzz_. Fotografía: @crisa.a. Asistente producción: @javinaranjot",
  area: "Dirección de arte / Moda / Fotografía",
  year: "2025",
  url: "https://readymag.website/u1773068245/6079251/2/"
},

/* ------------------ Presente — Daniela Gajardo ------------------ */
{
  src: "IMG/webp/147_Gajardo-Daniela-Captura-de-pantalla-2026-03-09-a-las-17.02.33_07857abb62.webp",
  srcAvif: "IMG/avif/147_Gajardo-Daniela-Captura-de-pantalla-2026-03-09-a-las-17.02.33_07857abb62.avif",
  srcSetAvif: "IMG/avif/variants/147_Gajardo-Daniela-Captura-de-pantalla-2026-03-09-a-las-17.02.33_07857abb62-640.avif 640w, IMG/avif/147_Gajardo-Daniela-Captura-de-pantalla-2026-03-09-a-las-17.02.33_07857abb62.avif 922w",
  srcSetWebp: "IMG/webp/variants/147_Gajardo-Daniela-Captura-de-pantalla-2026-03-09-a-las-17.02.33_07857abb62-640.webp 640w, IMG/webp/147_Gajardo-Daniela-Captura-de-pantalla-2026-03-09-a-las-17.02.33_07857abb62.webp 922w",
  srcOriginal: "IMG/remote-originals/147_Gajardo-Daniela-Captura-de-pantalla-2026-03-09-a-las-17.02.33.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","textil","gráfico","afiche"],
  title: "Presente",
  author: "Daniela Gajardo",
  role: "",
  collab: "Idea original: Diamela Burboa, Elisa Modak, Isidora Modak, Isidora Montalván, Josefina Stuardo. Post-producción: Carlos Nauto",
  area: "Editorial / Textil / Gráfico / Afiche",
  year: "2025",
  url: "https://www.behance.net/gallery/224614769/2025-PORTAFOLIO-DISENO-DG"
},

/* ------------------ Las piedras — Daniel Riveros (Gepe) ------------------ */
{
  src: "IMG/webp/ab67616d0000b273f73874ab4b03ad2a23876e0c_d6a934c0b8.webp",
  srcAvif: "IMG/avif/ab67616d0000b273f73874ab4b03ad2a23876e0c_d6a934c0b8.avif",
  srcSetAvif: "IMG/avif/ab67616d0000b273f73874ab4b03ad2a23876e0c_d6a934c0b8.avif 640w",
  srcSetWebp: "IMG/webp/ab67616d0000b273f73874ab4b03ad2a23876e0c_d6a934c0b8.webp 640w",
  srcOriginal: "https://freight.cargo.site/t/original/i/C2855431241926796885038952035011/ab67616d0000b273f73874ab4b03ad2a23876e0c.jpeg",
  orientation: "sq",
  span: 1,
  tags: ["portada de disco", "música"],
  title: "Las piedras",
  author: "Daniel Riveros (Gepe)",
  role: "Diseñador / Músico",
  collab: "Diseñado por Daniel Riveros (Gepe)",
  area: "Portada de disco / Música",
  year: "2007",
  url: "https://www.discogs.com/release/1565503-Gepe-Las-Piedras?srsltid=AfmBOopK1cqpOPpW1z8HEra8cLp8fOq3n8wttN5Id0Fna5EIwMoxCpnG"
},

/* ------------------ Logo sello Jacobino Discos — Daniel Riveros (Gepe) ------------------ */
{
  src: "IMG/webp/Logo-Jacobino-Discos_3dad796b76.webp",
  srcAvif: "IMG/avif/Logo-Jacobino-Discos_3dad796b76.avif",
  srcSetAvif: "IMG/avif/Logo-Jacobino-Discos_3dad796b76.avif 621w",
  srcSetWebp: "IMG/webp/Logo-Jacobino-Discos_3dad796b76.webp 621w",
  srcOriginal: "https://freight.cargo.site/t/original/i/M2855431241945243629112661586627/Logo-Jacobino-Discos.jpg",
  orientation: "v",
  span: 1,
  tags: ["logo", "música"],
  title: "Logo sello Jacobino Discos",
  author: "Daniel Riveros (Gepe)",
  role: "Diseñador / Músico",
  collab: "Diseñado por Daniel Riveros y finalmente trazado y retocado por Rodrigo Araya.",
  area: "Logo / Música",
  year: "2008",
  url: "https://jacobinodiscos.cl/about-us/"
},

/* ------------------ Hungría — Daniel Riveros (Gepe) ------------------ */
{
  src: "IMG/webp/0x1900-000000-80-0-0_3673e4b4f9.webp",
  srcAvif: "IMG/avif/0x1900-000000-80-0-0_3673e4b4f9.avif",
  srcSetAvif: "IMG/avif/variants/0x1900-000000-80-0-0_3673e4b4f9-640.avif 640w, IMG/avif/0x1900-000000-80-0-0_3673e4b4f9.avif 1200w",
  srcSetWebp: "IMG/webp/variants/0x1900-000000-80-0-0_3673e4b4f9-640.webp 640w, IMG/webp/0x1900-000000-80-0-0_3673e4b4f9.webp 1200w",
  srcOriginal: "https://freight.cargo.site/t/original/i/U2855431241963690373186371138243/0x1900-000000-80-0-0.jpg",
  orientation: "sq",
  span: 1,
  tags: ["portada de disco", "música"],
  title: "Hungría",
  author: "Daniel Riveros (Gepe)",
  role: "Diseñador / Músico",
  collab: "",
  area: "Portada de disco / Música",
  year: "2008",
  url: "https://es.wikipedia.org/wiki/Hungría_(álbum)"
},

/* ------------------ Ciencia Exacta — Daniel Riveros (Gepe) ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-24-a-las-11.10.11_6b94897ca9.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-24-a-las-11.10.11_6b94897ca9.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-24-a-las-11.10.11_6b94897ca9-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-24-a-las-11.10.11_6b94897ca9.avif 956w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-24-a-las-11.10.11_6b94897ca9-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-24-a-las-11.10.11_6b94897ca9.webp 956w",
  srcOriginal: "https://freight.cargo.site/t/original/i/Y2855434570752445450369798451907/Captura-de-pantalla-2026-03-24-a-las-11.10.11.png",
  orientation: "sq",
  span: 1,
  tags: ["portada de disco", "música"],
  title: "Ciencia Exacta",
  author: "Daniel Riveros (Gepe)",
  role: "Diseñador / Músico",
  collab: "Diseño y Arte del disco: Camilo Huinca y Gepe. Logo e Ilustraciones: Camilo Huinca.",
  area: "Portada de disco / Música",
  year: "2017",
  url: "https://www.youtube.com/watch?app=desktop&v=KWIJqE8Rqrc"
},

/* ------------------ Afiche Voy y Vuelvo (Chancho en Piedra) — Felipe Ilabaca ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-24-a-las-10.50.06_2bbff29ced.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-24-a-las-10.50.06_2bbff29ced.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-24-a-las-10.50.06_2bbff29ced-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-24-a-las-10.50.06_2bbff29ced.avif 958w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-24-a-las-10.50.06_2bbff29ced-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-24-a-las-10.50.06_2bbff29ced.webp 958w",
  srcOriginal: "https://freight.cargo.site/t/original/i/J2855431065243882147048866656963/Captura-de-pantalla-2026-03-24-a-las-10.50.06.png",
  orientation: "v",
  span: 1,
  tags: ["afiche", "ilustración", "gráfico", "música"],
  title: "Afiche Voy y Vuelvo (Chancho en Piedra)",
  author: "Felipe Ilabaca",
  role: "",
  collab: "",
  area: "Afiche / Ilustración / Gráfico / Música",
  year: "2023",
  url: "https://www.instagram.com/p/CuvPhZfOdyW/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ=="
},

/* ------------------ Ciencia Ficción (Obra de teatro) — Felipe Ilabaca ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-24-a-las-10.56.20_d57328dc2b.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-24-a-las-10.56.20_d57328dc2b.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-24-a-las-10.56.20_d57328dc2b-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-24-a-las-10.56.20_d57328dc2b.avif 1054w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-24-a-las-10.56.20_d57328dc2b-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-24-a-las-10.56.20_d57328dc2b.webp 1054w",
  srcOriginal: "https://freight.cargo.site/t/original/i/F2855431065262328891122576208579/Captura-de-pantalla-2026-03-24-a-las-10.56.20.png",
  orientation: "v",
  span: 1,
  tags: ["música", "teatro"],
  title: "Ciencia Ficción (Obra de teatro)",
  author: "Felipe Ilabaca",
  role: "",
  collab: "Música: Felipe Ilabaca y elenco. Diseño de escenografía Luis Cifuentes. Diseño de iluminación Claudio Rojas.",
  area: "Música / Teatro",
  year: "2012",
  url: "https://www.uc.cl/site/assets/files/15652/revista-universitaria-167.pdf"
},
/* ------------------ Restaurant KrossBar — Catalina Harasic ------------------ */
{
  src: "IMG/webp/148_Harasic-Catalina_b6af6f4f43.webp",
  srcAvif: "IMG/avif/148_Harasic-Catalina_b6af6f4f43.avif",
  srcSetAvif: "IMG/avif/variants/148_Harasic-Catalina_b6af6f4f43-640.avif 640w, IMG/avif/148_Harasic-Catalina_b6af6f4f43.avif 800w",
  srcSetWebp: "IMG/webp/variants/148_Harasic-Catalina_b6af6f4f43-640.webp 640w, IMG/webp/148_Harasic-Catalina_b6af6f4f43.webp 800w",
  srcOriginal: "IMG/remote-originals/148_Harasic-Catalina.jpeg",
  orientation: "v",
  span: 1,
  tags: ["iluminación","industrial","espacio"],
  title: "Restaurant KrossBar",
  author: "Catalina Harasic",
  role: "",
  collab: "Iluminación: Harasic Diseño e Iluminación. Proyecto liderado por Diagrama Arquitectos",
  area: "Iluminación / Industrial / Espacios",
  year: "2025",
  url: "https://www.linkedin.com/in/catalina-harasic-gil-9239a844/details/projects/?profileUrn=urn%3Ali%3Afsd_profile%3AACoAAAlm0SsBad8u2IpnSwXl7YUI3xvZq3sFM20"
},
/* ------------------ Dynamics of coastal picoeukaryote communities — Alejandro Durán ------------------ */
{
  src: "IMG/webp/149_X01411136_0ecb46748d.webp",
  srcAvif: "IMG/avif/149_X01411136_0ecb46748d.avif",
  srcSetAvif: "IMG/avif/149_X01411136_0ecb46748d.avif 576w",
  srcSetWebp: "IMG/webp/149_X01411136_0ecb46748d.webp 576w",
  srcOriginal: "IMG/remote-originals/149_X01411136.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Dynamics of coastal picoeukaryote communities in response to oil spill disturbances",
  author: "Alejandro Durán",
  role: "",
  collab: "Desarrollado con: Benjamín Glasner, Isidora Morel-Letelier, Esteban Osses, Camilo Gálvez-Aracena, Rodrigo De la Iglesia",
  area: "Investigación / Publicación académica",
  year: "2026",
  url: "https://www.sciencedirect.com/science/article/abs/pii/S0141113625008050"
},

/* ------------------ Flora Nativa — María José Carmona ------------------ */
{
  src: "IMG/webp/150_nativa_f63461c3fd.webp",
  srcAvif: "IMG/avif/150_nativa_f63461c3fd.avif",
  srcSetAvif: "IMG/avif/variants/150_nativa_f63461c3fd-640.avif 640w, IMG/avif/150_nativa_f63461c3fd.avif 800w",
  srcSetWebp: "IMG/webp/variants/150_nativa_f63461c3fd-640.webp 640w, IMG/webp/150_nativa_f63461c3fd.webp 800w",
  srcOriginal: "IMG/remote-originals/150_nativa.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Flora Nativa",
  author: "María José Carmona",
  role: "",
  collab: "Autores: Juan Vidal y colaboradores. Ilustraciones: María José Carmona. Editorial Amanuta. Institución: IEB Senda Darwin CNCA",
  area: "Editorial / Ilustración / Ecología",
  year: "2016",
  url: "https://mjcarmona.com/libros-publicados"
},

/* ------------------ Al agua — María José Carmona ------------------ */
{
  src: "IMG/webp/151_824f334f-4c26-48e3-93ee-95d5a45b865b_rw_3840_38a25c5393.webp",
  srcAvif: "IMG/avif/151_824f334f-4c26-48e3-93ee-95d5a45b865b_rw_3840_38a25c5393.avif",
  srcSetAvif: "IMG/avif/variants/151_824f334f-4c26-48e3-93ee-95d5a45b865b_rw_3840_38a25c5393-640.avif 640w, IMG/avif/variants/151_824f334f-4c26-48e3-93ee-95d5a45b865b_rw_3840_38a25c5393-1280.avif 1280w, IMG/avif/151_824f334f-4c26-48e3-93ee-95d5a45b865b_rw_3840_38a25c5393.avif 3024w",
  srcSetWebp: "IMG/webp/variants/151_824f334f-4c26-48e3-93ee-95d5a45b865b_rw_3840_38a25c5393-640.webp 640w, IMG/webp/variants/151_824f334f-4c26-48e3-93ee-95d5a45b865b_rw_3840_38a25c5393-1280.webp 1280w, IMG/webp/151_824f334f-4c26-48e3-93ee-95d5a45b865b_rw_3840_38a25c5393.webp 3024w",
  srcOriginal: "IMG/remote-originals/151_824f334f-4c26-48e3-93ee-95d5a45b865b_rw_3840.JPG",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Al agua",
  author: "María José Carmona",
  role: "",
  collab: "Ilustrado junto a Loreto Salinas. Texto: Sam García. Editorial Manivela",
  area: "Editorial / Ilustración / Ecología",
  year: "2021",
  url: "https://mjcarmona.com/libros-publicados"
},

/* ------------------ Panchita recorre Chiloé — Gabriela Sandoval ------------------ */
{
  src: "IMG/webp/152_plantilla-13_215c569989.webp",
  srcAvif: "IMG/avif/152_plantilla-13_215c569989.avif",
  srcSetAvif: "IMG/avif/variants/152_plantilla-13_215c569989-640.avif 640w, IMG/avif/152_plantilla-13_215c569989.avif 1000w",
  srcSetWebp: "IMG/webp/variants/152_plantilla-13_215c569989-640.webp 640w, IMG/webp/152_plantilla-13_215c569989.webp 1000w",
  srcOriginal: "IMG/remote-originals/152_plantilla-13.jpeg",
  orientation: "h",
  span: 2,
  tags: ["exhibición","cultura","experiencia","artesanía"],
  title: "Panchita recorre Chiloé",
  author: "Gabriela Sandoval",
  role: "",
  collab: "Creado por: Malvina García, Gabriela Sandoval",
  area: "Exhibición / Cultura / Experiencia",
  year: "2021–2023",
  url: "https://panchitarecorrechiloe.cl"
},

/* ------------------ Mou Studio — Martina Palominos ------------------ */
{
  src: "IMG/webp/153_Diseno-sin-titulo-4-1_21db338786.webp",
  srcAvif: "IMG/avif/153_Diseno-sin-titulo-4-1_21db338786.avif",
  srcSetAvif: "IMG/avif/variants/153_Diseno-sin-titulo-4-1_21db338786-640.avif 640w, IMG/avif/153_Diseno-sin-titulo-4-1_21db338786.avif 1000w",
  srcSetWebp: "IMG/webp/variants/153_Diseno-sin-titulo-4-1_21db338786-640.webp 640w, IMG/webp/153_Diseno-sin-titulo-4-1_21db338786.webp 1000w",
  srcOriginal: "IMG/remote-originals/153_Diseno-sin-titulo-4-1.jpg",
  orientation: "v",
  span: 1,
  tags: ["textil","indumentaria","moda"],
  title: "Mou Studio",
  author: "Martina Palominos",
  role: "",
  collab: "",
  area: "Textil / Indumentaria / Moda",
  year: "N/A",
  url: [
    "https://www.ed.cl/archivo/recomendados/mou-studio-el-taller-textil-donde-el-color-y-el-oficio-se-encuentran/",
    "https://www.instagram.com/moustudio/?hl=es"
  ]
},

/* ------------------ Misión Korex — Teresita Reymond ------------------ */
{
  src: "IMG/webp/154_mision-korex_0a8dfef548.webp",
  srcAvif: "IMG/avif/154_mision-korex_0a8dfef548.avif",
  srcSetAvif: "IMG/avif/variants/154_mision-korex_0a8dfef548-640.avif 640w, IMG/avif/154_mision-korex_0a8dfef548.avif 700w",
  srcSetWebp: "IMG/webp/variants/154_mision-korex_0a8dfef548-640.webp 640w, IMG/webp/154_mision-korex_0a8dfef548.webp 700w",
  srcOriginal: "IMG/remote-originals/154_mision-korex.jpg",
  orientation: "v",
  span: 1,
  tags: ["servicio","innovación","educación"],
  title: "Misión Korex: Estrategia gamificada para potenciar la actividad física en escolares",
  author: "Teresita de Jesús Reymond",
  role: "",
  collab: "Guiatura: Patricia Manns",
  area: "Servicio / Innovación / Educación",
  year: "2024",
  url: [
    "https://www.uc.cl/noticias/estudiantes-uc-se-adjudican-financiamiento-publico-para-convertir-sus-tesis-en-innovaciones-con-impacto-social/",
    "https://diseno.uc.cl/2025/09/teresita-reymond-disenadora-uc-se-adjudico-concurso-viu-2025-con-su-proyecto-de-tesis/"
  ]
},

/* ------------------ El Pescador de Chiloé — Gabriela Sandoval ------------------ */
{
  src: "IMG/webp/155_En-que-consiste_Set-Pescador-compress_c7ba2f076d.webp",
  srcAvif: "IMG/avif/155_En-que-consiste_Set-Pescador-compress_c7ba2f076d.avif",
  srcSetAvif: "IMG/avif/variants/155_En-que-consiste_Set-Pescador-compress_c7ba2f076d-640.avif 640w, IMG/avif/variants/155_En-que-consiste_Set-Pescador-compress_c7ba2f076d-1280.avif 1280w, IMG/avif/155_En-que-consiste_Set-Pescador-compress_c7ba2f076d.avif 1920w",
  srcSetWebp: "IMG/webp/variants/155_En-que-consiste_Set-Pescador-compress_c7ba2f076d-640.webp 640w, IMG/webp/variants/155_En-que-consiste_Set-Pescador-compress_c7ba2f076d-1280.webp 1280w, IMG/webp/155_En-que-consiste_Set-Pescador-compress_c7ba2f076d.webp 1920w",
  srcOriginal: "IMG/remote-originals/155_En-que-consiste_Set-Pescador-compress.jpg",
  orientation: "h",
  span: 1,
  tags: ["exhibición","cultura","experiencia","artesanía"],
  title: "El Pescador de Chiloé",
  author: "Gabriela Sandoval",
  role: "",
  collab: "Autoras: Gabriela Sandoval, Magdalena Schroeder, Malvina García",
  area: "Exhibición / Cultura / Experiencia",
  year: "2025",
  url: [
    "https://panchitarecorrechiloe.cl/pescador-de-chiloe/",
    "https://panchitarecorrechiloe.cl"
  ]
},

/* ------------------ Ari-test — Macarena Silva ------------------ */
{
  src: "IMG/webp/156_WhatsApp-Image-2023-09-01-at-12.49.38_5498c8d720.webp",
  srcAvif: "IMG/avif/156_WhatsApp-Image-2023-09-01-at-12.49.38_5498c8d720.avif",
  srcSetAvif: "IMG/avif/variants/156_WhatsApp-Image-2023-09-01-at-12.49.38_5498c8d720-640.avif 640w, IMG/avif/156_WhatsApp-Image-2023-09-01-at-12.49.38_5498c8d720.avif 1280w",
  srcSetWebp: "IMG/webp/variants/156_WhatsApp-Image-2023-09-01-at-12.49.38_5498c8d720-640.webp 640w, IMG/webp/156_WhatsApp-Image-2023-09-01-at-12.49.38_5498c8d720.webp 1280w",
  srcOriginal: "IMG/remote-originals/156_WhatsApp-Image-2023-09-01-at-12.49.38.jpeg",
  orientation: "h",
  span: 1,
  tags: ["investigación","salud","servicio"],
  title: "Ari-test",
  author: "Macarena Silva",
  role: "",
  collab: "Liderado por Macarena Silva. Desarrollado en Ari Health Design",
  area: "Investigación / Salud / Servicio",
  year: "2022",
  url: "https://alumni.uc.cl/actualidad/iniciativa-para-la-deteccion-del-vph-creada-por-disenadora-uc-macarena-silva-obtiene-premio-latinoamericano/"
},
/* ------------------ Deseo, Carne y Voluntad — Javiera Donoso ------------------ */
{
  src: "IMG/webp/157_a3407688467_16_19ddb6a74e.webp",
  srcAvif: "IMG/avif/157_a3407688467_16_19ddb6a74e.avif",
  srcSetAvif: "IMG/avif/variants/157_a3407688467_16_19ddb6a74e-640.avif 640w, IMG/avif/157_a3407688467_16_19ddb6a74e.avif 700w",
  srcSetWebp: "IMG/webp/variants/157_a3407688467_16_19ddb6a74e-640.webp 640w, IMG/webp/157_a3407688467_16_19ddb6a74e.webp 700w",
  srcOriginal: "IMG/remote-originals/157_a3407688467_16.jpg",
  orientation: "sq",
  span: 2,
  tags: ["cover art","dirección de arte"],
  title: "Deseo, Carne y Voluntad",
  author: "Javiera Donoso",
  role: "",
  collab: "Banda: Candelabro",
  area: "Cover Art / Dirección de arte",
  year: "2025",
  url: "https://soloartistaschilenos.cl/deseo-carne-y-voluntad-de-candelabro-un-abrazo-a-la-espiritualidad-y-una-feroz-demostracion-de-madurez-musical/"
},

/* ------------------ Ahora o nunca — Javiera Donoso ------------------ */
{
  src: "IMG/webp/158_Captura-de-pantalla-2026-03-13-a-las-16.43.15_f501b57e70.webp",
  srcAvif: "IMG/avif/158_Captura-de-pantalla-2026-03-13-a-las-16.43.15_f501b57e70.avif",
  srcSetAvif: "IMG/avif/variants/158_Captura-de-pantalla-2026-03-13-a-las-16.43.15_f501b57e70-640.avif 640w, IMG/avif/158_Captura-de-pantalla-2026-03-13-a-las-16.43.15_f501b57e70.avif 1246w",
  srcSetWebp: "IMG/webp/variants/158_Captura-de-pantalla-2026-03-13-a-las-16.43.15_f501b57e70-640.webp 640w, IMG/webp/158_Captura-de-pantalla-2026-03-13-a-las-16.43.15_f501b57e70.webp 1246w",
  srcOriginal: "IMG/remote-originals/158_Captura-de-pantalla-2026-03-13-a-las-16.43.15.png",
  orientation: "sq",
  span: 1,
  tags: ["cover art","dirección de arte"],
  title: "Ahora o nunca",
  author: "Javiera Donoso",
  role: "",
  collab: "Banda: Candelabro",
  area: "Cover Art / Dirección de arte",
  year: "2024",
  url: "https://www.instagram.com/p/C2vNeBzvoNz/"
},
/* ------------------ The Art of Talking About Art — María Jesús Vidal Lynch ------------------ */
{
  src: "IMG/webp/159_Captura-de-pantalla-2026-03-14-a-las-11.12.16_c8c0d30957.webp",
  srcAvif: "IMG/avif/159_Captura-de-pantalla-2026-03-14-a-las-11.12.16_c8c0d30957.avif",
  srcSetAvif: "IMG/avif/variants/159_Captura-de-pantalla-2026-03-14-a-las-11.12.16_c8c0d30957-640.avif 640w, IMG/avif/159_Captura-de-pantalla-2026-03-14-a-las-11.12.16_c8c0d30957.avif 1114w",
  srcSetWebp: "IMG/webp/variants/159_Captura-de-pantalla-2026-03-14-a-las-11.12.16_c8c0d30957-640.webp 640w, IMG/webp/159_Captura-de-pantalla-2026-03-14-a-las-11.12.16_c8c0d30957.webp 1114w",
  srcOriginal: "IMG/remote-originals/159_Captura-de-pantalla-2026-03-14-a-las-11.12.16.png",
  orientation: "v",
  span: 1,
  tags: ["servicio","cultura","exhibición"],
  title: "The Art of Talking About Art",
  author: "María Jesús Vidal Lynch",
  role: "",
  collab: "Research & design of the overall project",
  area: "Servicio / Cultura / Exhibición",
  year: "2023",
  url: "https://mjvidallynch.myportfolio.com/the-art-of-talking-about-art"
},

/* ------------------ Refugia — Constanza Weinreich Siraqyan ------------------ */
{
  src: "IMG/webp/160_1770321553813_7fb9ea54c8.webp",
  srcAvif: "IMG/avif/160_1770321553813_7fb9ea54c8.avif",
  srcSetAvif: "IMG/avif/variants/160_1770321553813_7fb9ea54c8-640.avif 640w, IMG/avif/variants/160_1770321553813_7fb9ea54c8-1280.avif 1280w, IMG/avif/160_1770321553813_7fb9ea54c8.avif 2048w",
  srcSetWebp: "IMG/webp/variants/160_1770321553813_7fb9ea54c8-640.webp 640w, IMG/webp/variants/160_1770321553813_7fb9ea54c8-1280.webp 1280w, IMG/webp/160_1770321553813_7fb9ea54c8.webp 2048w",
  srcOriginal: "IMG/remote-originals/160_1770321553813.jpeg",
  orientation: "v",
  span: 1,
  tags: ["dirección creativa","identidad visual"],
  title: "Refugia",
  author: "Constanza Weinreich Siraqyan",
  role: "",
  collab: "Vomva: branding y dirección. Constanza Weinreich: diseño visual y dirección",
  area: "Dirección creativa / Identidad visual",
  year: "2025",
  url: "https://www.linkedin.com/posts/c-weinreich_dise%C3%B1o-de-identidad-visual-y-marca-de-refugia-activity-7425266784230084608-_xkG"
},

/* ------------------ MUDA — Ignacia Bianchi ------------------ */
{
  src: "IMG/webp/161_Captura-de-pantalla-2026-03-14-a-las-10.44.05_9c564c9005.webp",
  srcAvif: "IMG/avif/161_Captura-de-pantalla-2026-03-14-a-las-10.44.05_9c564c9005.avif",
  srcSetAvif: "IMG/avif/variants/161_Captura-de-pantalla-2026-03-14-a-las-10.44.05_9c564c9005-640.avif 640w, IMG/avif/variants/161_Captura-de-pantalla-2026-03-14-a-las-10.44.05_9c564c9005-1280.avif 1280w, IMG/avif/161_Captura-de-pantalla-2026-03-14-a-las-10.44.05_9c564c9005.avif 1284w",
  srcSetWebp: "IMG/webp/variants/161_Captura-de-pantalla-2026-03-14-a-las-10.44.05_9c564c9005-640.webp 640w, IMG/webp/variants/161_Captura-de-pantalla-2026-03-14-a-las-10.44.05_9c564c9005-1280.webp 1280w, IMG/webp/161_Captura-de-pantalla-2026-03-14-a-las-10.44.05_9c564c9005.webp 1284w",
  srcOriginal: "IMG/remote-originals/161_Captura-de-pantalla-2026-03-14-a-las-10.44.05.png",
  orientation: "v",
  span: 1,
  tags: ["indumentaria","objeto","textil"],
  title: "MUDA",
  author: "Ignacia Bianchi",
  role: "",
  collab: "Fotografía: Dillan González",
  area: "Indumentaria / Objeto / Textil",
  year: "2025",
  url: [
    "https://ignaciabianchi.myportfolio.com/muda",
    "https://www.linkedin.com/posts/ignacia-bianchi-977853372_muy-feliz-de-contarles-que-el-pasado-22-de-activity-7415438031157186560-Xggu"
  ]
},

/* ------------------ Regularidad Irregular — Ignacia Bianchi ------------------ */
{
  src: "IMG/webp/162_d422a906-7be4-4738-bae6-211bf10a9bfb_rw_1920_6178d20594.webp",
  srcAvif: "IMG/avif/162_d422a906-7be4-4738-bae6-211bf10a9bfb_rw_1920_6178d20594.avif",
  srcSetAvif: "IMG/avif/variants/162_d422a906-7be4-4738-bae6-211bf10a9bfb_rw_1920_6178d20594-640.avif 640w, IMG/avif/variants/162_d422a906-7be4-4738-bae6-211bf10a9bfb_rw_1920_6178d20594-1280.avif 1280w, IMG/avif/162_d422a906-7be4-4738-bae6-211bf10a9bfb_rw_1920_6178d20594.avif 1920w",
  srcSetWebp: "IMG/webp/variants/162_d422a906-7be4-4738-bae6-211bf10a9bfb_rw_1920_6178d20594-640.webp 640w, IMG/webp/variants/162_d422a906-7be4-4738-bae6-211bf10a9bfb_rw_1920_6178d20594-1280.webp 1280w, IMG/webp/162_d422a906-7be4-4738-bae6-211bf10a9bfb_rw_1920_6178d20594.webp 1920w",
  srcOriginal: "IMG/remote-originals/162_d422a906-7be4-4738-bae6-211bf10a9bfb_rw_1920.jpg",
  orientation: "v",
  span: 1,
  tags: ["indumentaria","objeto","textil"],
  title: "Regularidad Irregular",
  author: "Ignacia Bianchi",
  role: "",
  collab: "",
  area: "Indumentaria / Objeto / Textil",
  year: "2024",
  url: "https://ignaciabianchi.myportfolio.com/pleats-pleats-pleats"
},

/* ------------------ Hati: El Equilibrio de los Espíritus — Clara Valenzuela Lowey ------------------ */
{
  src: "IMG/webp/163_625530226_17872909344521833_8996592620757902267_n_04a1016300.webp",
  srcAvif: "IMG/avif/163_625530226_17872909344521833_8996592620757902267_n_04a1016300.avif",
  srcSetAvif: "IMG/avif/variants/163_625530226_17872909344521833_8996592620757902267_n_04a1016300-640.avif 640w, IMG/avif/163_625530226_17872909344521833_8996592620757902267_n_04a1016300.avif 1011w",
  srcSetWebp: "IMG/webp/variants/163_625530226_17872909344521833_8996592620757902267_n_04a1016300-640.webp 640w, IMG/webp/163_625530226_17872909344521833_8996592620757902267_n_04a1016300.webp 1011w",
  srcOriginal: "IMG/remote-originals/163_625530226_17872909344521833_8996592620757902267_n.jpg",
  orientation: "v",
  span: 1,
  tags: ["juego de mesa","producto"],
  title: "Hati: El Equilibrio de los Espíritus",
  author: "Clara Valenzuela Lowey",
  role: "",
  collab: "Financiado por FONDART",
  area: "Juego de mesa / Producto",
  year: "2024",
  url: "https://www.instagram.com/p/DV11EWUFhSp/"
},

/* ------------------ La ciudad como texto — Carola Ureta ------------------ */
{
  src: "IMG/webp/164_Captura-de-pantalla-2026-03-14-a-las-11.12.54_9a82fafbfe.webp",
  srcAvif: "IMG/avif/164_Captura-de-pantalla-2026-03-14-a-las-11.12.54_9a82fafbfe.avif",
  srcSetAvif: "IMG/avif/variants/164_Captura-de-pantalla-2026-03-14-a-las-11.12.54_9a82fafbfe-640.avif 640w, IMG/avif/variants/164_Captura-de-pantalla-2026-03-14-a-las-11.12.54_9a82fafbfe-1280.avif 1280w, IMG/avif/164_Captura-de-pantalla-2026-03-14-a-las-11.12.54_9a82fafbfe.avif 3452w",
  srcSetWebp: "IMG/webp/variants/164_Captura-de-pantalla-2026-03-14-a-las-11.12.54_9a82fafbfe-640.webp 640w, IMG/webp/variants/164_Captura-de-pantalla-2026-03-14-a-las-11.12.54_9a82fafbfe-1280.webp 1280w, IMG/webp/164_Captura-de-pantalla-2026-03-14-a-las-11.12.54_9a82fafbfe.webp 3452w",
  srcOriginal: "IMG/remote-originals/164_Captura-de-pantalla-2026-03-14-a-las-11.12.54.png",
  orientation: "v",
  span: 1,
  tags: ["web","experiencia","cultura"],
  title: "La ciudad como texto",
  author: "Carola Ureta",
  role: "",
  collab: "Desarrollo web: Felipe Sologuren",
  area: "Web / Experiencia / Cultura",
  year: "2020",
  url: [
    "https://www.laciudadcomotexto.cl",
    "https://www.instagram.com/laciudadcomotexto"
  ]
},

/* ------------------ Metanoien — Tomás Corvalán Azócar ------------------ */
{
  src: "IMG/webp/165_DSC_2551-e1531948324611_e4ab109eff.webp",
  srcAvif: "IMG/avif/165_DSC_2551-e1531948324611_e4ab109eff.avif",
  srcSetAvif: "IMG/avif/variants/165_DSC_2551-e1531948324611_e4ab109eff-640.avif 640w, IMG/avif/165_DSC_2551-e1531948324611_e4ab109eff.avif 1000w",
  srcSetWebp: "IMG/webp/variants/165_DSC_2551-e1531948324611_e4ab109eff-640.webp 640w, IMG/webp/165_DSC_2551-e1531948324611_e4ab109eff.webp 1000w",
  srcOriginal: "IMG/remote-originals/165_DSC_2551-e1531948324611.jpg",
  orientation: "v",
  span: 1,
  tags: ["moda","indumentaria","cultura"],
  title: "Metanoien",
  author: "Tomás Corvalán Azócar",
  role: "",
  collab: "",
  area: "Moda / Indumentaria / Cultura",
  year: "2018",
  url: "https://pousta.com/tomas-corvalan-azocar-metanoien/"
},

/* ------------------ Diseño basado en Simbiogénesis — Daniela Rojas-Levy ------------------ */
{
  src: "IMG/webp/166_cover_issue_305_es_ES_8f29c82cc6.webp",
  srcAvif: "IMG/avif/166_cover_issue_305_es_ES_8f29c82cc6.avif",
  srcSetAvif: "IMG/avif/166_cover_issue_305_es_ES_8f29c82cc6.avif 482w",
  srcSetWebp: "IMG/webp/166_cover_issue_305_es_ES_8f29c82cc6.webp 482w",
  srcOriginal: "IMG/remote-originals/166_cover_issue_305_es_ES.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Desde la bio-imitación a la bioextrapolación: Diseño basado en Simbiogénesis",
  author: "Daniela Rojas-Levy",
  role: "co-autora",
  collab: "Alejandro Durán, Daniela Rojas-Levy (2021)",
  area: "Investigación / Publicación académica",
  year: "2021",
  url: "https://dspace.palermo.edu/ojs/index.php/cdc/article/view/5004"
},

/* ------------------ Humanidad Teenager — Benjamín Saíz ------------------ */
{
  src: "IMG/webp/167_Captura-de-pantalla-2026-03-14-a-las-11.17.17_85266948e8.webp",
  srcAvif: "IMG/avif/167_Captura-de-pantalla-2026-03-14-a-las-11.17.17_85266948e8.avif",
  srcSetAvif: "IMG/avif/variants/167_Captura-de-pantalla-2026-03-14-a-las-11.17.17_85266948e8-640.avif 640w, IMG/avif/variants/167_Captura-de-pantalla-2026-03-14-a-las-11.17.17_85266948e8-1280.avif 1280w, IMG/avif/167_Captura-de-pantalla-2026-03-14-a-las-11.17.17_85266948e8.avif 1954w",
  srcSetWebp: "IMG/webp/variants/167_Captura-de-pantalla-2026-03-14-a-las-11.17.17_85266948e8-640.webp 640w, IMG/webp/variants/167_Captura-de-pantalla-2026-03-14-a-las-11.17.17_85266948e8-1280.webp 1280w, IMG/webp/167_Captura-de-pantalla-2026-03-14-a-las-11.17.17_85266948e8.webp 1954w",
  srcOriginal: "IMG/remote-originals/167_Captura-de-pantalla-2026-03-14-a-las-11.17.17.png",
  orientation: "h",
  span: 1,
  tags: ["cover art","dirección de arte"],
  title: "Humanidad Teenager",
  author: "Benjamín Saíz",
  role: "",
  collab: "",
  area: "Cover Art / Dirección de arte",
  year: "2021",
  url: "https://www.behance.net/gallery/111240593/Humanidad-Teenager-Portada-y-Animaciones"
},

/* ------------------ CHT Lab — Benjamín Saíz ------------------ */
{
  src: "IMG/webp/168_Captura-de-pantalla-2026-03-14-a-las-11.18.22_98bb615719.webp",
  srcAvif: "IMG/avif/168_Captura-de-pantalla-2026-03-14-a-las-11.18.22_98bb615719.avif",
  srcSetAvif: "IMG/avif/variants/168_Captura-de-pantalla-2026-03-14-a-las-11.18.22_98bb615719-640.avif 640w, IMG/avif/168_Captura-de-pantalla-2026-03-14-a-las-11.18.22_98bb615719.avif 776w",
  srcSetWebp: "IMG/webp/variants/168_Captura-de-pantalla-2026-03-14-a-las-11.18.22_98bb615719-640.webp 640w, IMG/webp/168_Captura-de-pantalla-2026-03-14-a-las-11.18.22_98bb615719.webp 776w",
  srcOriginal: "IMG/remote-originals/168_Captura-de-pantalla-2026-03-14-a-las-11.18.22.png",
  orientation: "h",
  span: 1,
  tags: ["identidad visual"],
  title: "CHT Lab",
  author: "Benjamín Saíz",
  role: "",
  collab: "",
  area: "Identidad visual",
  year: "2021",
  url: "https://www.behance.net/gallery/111241797/CHT-Lab-2021"
},

/* ------------------ Si el mundo se acabara hoy — Pablo González ------------------ */
{
  src: "IMG/webp/169_66725_d24c10ee53.webp",
  srcAvif: "IMG/avif/169_66725_d24c10ee53.avif",
  srcSetAvif: "IMG/avif/169_66725_d24c10ee53.avif 430w",
  srcSetWebp: "IMG/webp/169_66725_d24c10ee53.webp 430w",
  srcOriginal: "IMG/remote-originals/169_66725.jpg",
  orientation: "sq",
  span: 1,
  tags: ["cover art","dirección de arte"],
  title: "Si el mundo se acabara hoy",
  author: "Pablo González",
  role: "",
  collab: "Banda: Ad Portas",
  area: "Cover Art / Dirección de arte",
  year: "2025",
  url: "https://portaldisc.com/contenido/single-adportas-si-el-mundo-acaba-hoy"
},

/* ------------------ Resonancias Tectónicas — Marcos Chillet ------------------ */
{
  src: "IMG/webp/170_Captura-de-pantalla-2026-03-13-a-las-16.31.45_bed09de15d.webp",
  srcAvif: "IMG/avif/170_Captura-de-pantalla-2026-03-13-a-las-16.31.45_bed09de15d.avif",
  srcSetAvif: "IMG/avif/variants/170_Captura-de-pantalla-2026-03-13-a-las-16.31.45_bed09de15d-640.avif 640w, IMG/avif/170_Captura-de-pantalla-2026-03-13-a-las-16.31.45_bed09de15d.avif 810w",
  srcSetWebp: "IMG/webp/variants/170_Captura-de-pantalla-2026-03-13-a-las-16.31.45_bed09de15d-640.webp 640w, IMG/webp/170_Captura-de-pantalla-2026-03-13-a-las-16.31.45_bed09de15d.webp 810w",
  srcOriginal: "IMG/remote-originals/170_Captura-de-pantalla-2026-03-13-a-las-16.31.45.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","investigación"],
  title: "Resonancias Tectónicas",
  author: "Marcos Chilet",
  role: "",
  collab: "Autores: Pablo Hermansen, Martín Tironi, Carlos Chilet, Carola Ureta. Editorial: Ediciones UC",
  area: "Editorial / Investigación",
  year: "2024",
  url: [
    "https://artishockrevista.com/2021/06/14/resonancias-tectonicas-chile-bienal-diseno-londres-2021/",
    "https://lea.uc.cl/resonancias-tectonicas/p"
  ]
},

/* ------------------ Salud Oportuna — Sara Riveros ------------------ */
{
  src: "IMG/webp/171_Group-147.png_1c96e6e12c.webp",
  srcAvif: "IMG/avif/171_Group-147.png_1c96e6e12c.avif",
  srcSetAvif: "IMG/avif/variants/171_Group-147.png_1c96e6e12c-640.avif 640w, IMG/avif/variants/171_Group-147.png_1c96e6e12c-1280.avif 1280w, IMG/avif/171_Group-147.png_1c96e6e12c.avif 1512w",
  srcSetWebp: "IMG/webp/variants/171_Group-147.png_1c96e6e12c-640.webp 640w, IMG/webp/variants/171_Group-147.png_1c96e6e12c-1280.webp 1280w, IMG/webp/171_Group-147.png_1c96e6e12c.webp 1512w",
  srcOriginal: "IMG/remote-originals/171_Group-147.png.jpg",
  orientation: "h",
  span: 1,
  tags: ["servicio","innovación","investigación"],
  title: "Salud Oportuna",
  author: "Sara Riveros",
  role: "",
  collab: "Desarrollado en Laboratorio de Innovación Pública UC (LIP)",
  area: "Servicio / Innovación / Investigación",
  year: "2019–en curso",
  url: "https://www.saludoportuna.cl/soluciones"
},

/* ------------------ GOLDFISH — María Jesús Contreras ------------------ */
{
  src: "IMG/webp/172_Captura-de-pantalla-2026-03-13-a-las-16.00.11_56108896af.webp",
  srcAvif: "IMG/avif/172_Captura-de-pantalla-2026-03-13-a-las-16.00.11_56108896af.avif",
  srcSetAvif: "IMG/avif/variants/172_Captura-de-pantalla-2026-03-13-a-las-16.00.11_56108896af-640.avif 640w, IMG/avif/variants/172_Captura-de-pantalla-2026-03-13-a-las-16.00.11_56108896af-1280.avif 1280w, IMG/avif/172_Captura-de-pantalla-2026-03-13-a-las-16.00.11_56108896af.avif 1342w",
  srcSetWebp: "IMG/webp/variants/172_Captura-de-pantalla-2026-03-13-a-las-16.00.11_56108896af-640.webp 640w, IMG/webp/variants/172_Captura-de-pantalla-2026-03-13-a-las-16.00.11_56108896af-1280.webp 1280w, IMG/webp/172_Captura-de-pantalla-2026-03-13-a-las-16.00.11_56108896af.webp 1342w",
  srcOriginal: "IMG/remote-originals/172_Captura-de-pantalla-2026-03-13-a-las-16.00.11.png",
  orientation: "sq",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "GOLDFISH",
  author: "María Jesús Contreras",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ Stilllife 1 — María Jesús Contreras ------------------ */
{
  src: "IMG/webp/173_Captura-de-pantalla-2026-03-13-a-las-16.00.27_8ca636bd14.webp",
  srcAvif: "IMG/avif/173_Captura-de-pantalla-2026-03-13-a-las-16.00.27_8ca636bd14.avif",
  srcSetAvif: "IMG/avif/variants/173_Captura-de-pantalla-2026-03-13-a-las-16.00.27_8ca636bd14-640.avif 640w, IMG/avif/variants/173_Captura-de-pantalla-2026-03-13-a-las-16.00.27_8ca636bd14-1280.avif 1280w, IMG/avif/173_Captura-de-pantalla-2026-03-13-a-las-16.00.27_8ca636bd14.avif 1586w",
  srcSetWebp: "IMG/webp/variants/173_Captura-de-pantalla-2026-03-13-a-las-16.00.27_8ca636bd14-640.webp 640w, IMG/webp/variants/173_Captura-de-pantalla-2026-03-13-a-las-16.00.27_8ca636bd14-1280.webp 1280w, IMG/webp/173_Captura-de-pantalla-2026-03-13-a-las-16.00.27_8ca636bd14.webp 1586w",
  srcOriginal: "IMG/remote-originals/173_Captura-de-pantalla-2026-03-13-a-las-16.00.27.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Stilllife 1",
  author: "María Jesús Contreras",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ 30 Grad Mag — María Jesús Contreras ------------------ */
{
  src: "IMG/webp/174_Captura-de-pantalla-2026-03-13-a-las-16.01.50_4fc7f6292e.webp",
  srcAvif: "IMG/avif/174_Captura-de-pantalla-2026-03-13-a-las-16.01.50_4fc7f6292e.avif",
  srcSetAvif: "IMG/avif/variants/174_Captura-de-pantalla-2026-03-13-a-las-16.01.50_4fc7f6292e-640.avif 640w, IMG/avif/variants/174_Captura-de-pantalla-2026-03-13-a-las-16.01.50_4fc7f6292e-1280.avif 1280w, IMG/avif/174_Captura-de-pantalla-2026-03-13-a-las-16.01.50_4fc7f6292e.avif 2050w",
  srcSetWebp: "IMG/webp/variants/174_Captura-de-pantalla-2026-03-13-a-las-16.01.50_4fc7f6292e-640.webp 640w, IMG/webp/variants/174_Captura-de-pantalla-2026-03-13-a-las-16.01.50_4fc7f6292e-1280.webp 1280w, IMG/webp/174_Captura-de-pantalla-2026-03-13-a-las-16.01.50_4fc7f6292e.webp 2050w",
  srcOriginal: "IMG/remote-originals/174_Captura-de-pantalla-2026-03-13-a-las-16.01.50.png",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "30 Grad Mag",
  author: "María Jesús Contreras",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ Frog Party — María Jesús Contreras ------------------ */
{
  src: "IMG/webp/175_Captura-de-pantalla-2026-03-13-a-las-16.02.20_f6c557cab3.webp",
  srcAvif: "IMG/avif/175_Captura-de-pantalla-2026-03-13-a-las-16.02.20_f6c557cab3.avif",
  srcSetAvif: "IMG/avif/variants/175_Captura-de-pantalla-2026-03-13-a-las-16.02.20_f6c557cab3-640.avif 640w, IMG/avif/variants/175_Captura-de-pantalla-2026-03-13-a-las-16.02.20_f6c557cab3-1280.avif 1280w, IMG/avif/175_Captura-de-pantalla-2026-03-13-a-las-16.02.20_f6c557cab3.avif 1316w",
  srcSetWebp: "IMG/webp/variants/175_Captura-de-pantalla-2026-03-13-a-las-16.02.20_f6c557cab3-640.webp 640w, IMG/webp/variants/175_Captura-de-pantalla-2026-03-13-a-las-16.02.20_f6c557cab3-1280.webp 1280w, IMG/webp/175_Captura-de-pantalla-2026-03-13-a-las-16.02.20_f6c557cab3.webp 1316w",
  srcOriginal: "IMG/remote-originals/175_Captura-de-pantalla-2026-03-13-a-las-16.02.20.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Frog Party",
  author: "María Jesús Contreras",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ Metro 21 — Josefina Andreu ------------------ */
{
  src: "IMG/webp/176_metro21-4_1ec8d78d05.webp",
  srcAvif: "IMG/avif/176_metro21-4_1ec8d78d05.avif",
  srcSetAvif: "IMG/avif/variants/176_metro21-4_1ec8d78d05-640.avif 640w, IMG/avif/variants/176_metro21-4_1ec8d78d05-1280.avif 1280w, IMG/avif/176_metro21-4_1ec8d78d05.avif 1440w",
  srcSetWebp: "IMG/webp/variants/176_metro21-4_1ec8d78d05-640.webp 640w, IMG/webp/variants/176_metro21-4_1ec8d78d05-1280.webp 1280w, IMG/webp/176_metro21-4_1ec8d78d05.webp 1440w",
  srcOriginal: "IMG/remote-originals/176_metro21-4.jpg",
  orientation: "v",
  span: 1,
  tags: ["galería","cultura"],
  title: "Metro 21",
  author: "Josefina Andreu",
  role: "",
  collab: "Directora: Josefina Andreu",
  area: "Galería / Cultura",
  year: "2021",
  url: [
    "https://www.metro21.cl",
    "https://amosantiago.cl/galeria-metro-21-arte-conceptual-a-la-calle/"
  ]
},

/* ------------------ Confluencia — Josefina Andreu ------------------ */
{
  src: "IMG/webp/177_IMG-PAG-04_3cac22e1fb.webp",
  srcAvif: "IMG/avif/177_IMG-PAG-04_3cac22e1fb.avif",
  srcSetAvif: "IMG/avif/variants/177_IMG-PAG-04_3cac22e1fb-640.avif 640w, IMG/avif/variants/177_IMG-PAG-04_3cac22e1fb-1280.avif 1280w, IMG/avif/177_IMG-PAG-04_3cac22e1fb.avif 1502w",
  srcSetWebp: "IMG/webp/variants/177_IMG-PAG-04_3cac22e1fb-640.webp 640w, IMG/webp/variants/177_IMG-PAG-04_3cac22e1fb-1280.webp 1280w, IMG/webp/177_IMG-PAG-04_3cac22e1fb.webp 1502w",
  srcOriginal: "IMG/remote-originals/177_IMG-PAG-04.jpg",
  orientation: "h",
  span: 2,
  tags: ["editorial","dirección creativa"],
  title: "Confluencia: Ruta de 52 murales en la Región Metropolitana",
  author: "Josefina Andreu",
  role: "",
  collab: "",
  area: "Editorial / Dirección creativa",
  year: "2024",
  url: "https://www.metro21.cl/proyectos/confluencia-ruta-de-murales-de-la-region-metropolitana/"
},

/* ------------------ Borrowed Matter / Materia Prestada — Sofía Guridi ------------------ */
{
  src: "IMG/webp/178_Materia-Prestada-11_f90f33c23a.webp",
  srcAvif: "IMG/avif/178_Materia-Prestada-11_f90f33c23a.avif",
  srcSetAvif: "IMG/avif/variants/178_Materia-Prestada-11_f90f33c23a-640.avif 640w, IMG/avif/178_Materia-Prestada-11_f90f33c23a.avif 700w",
  srcSetWebp: "IMG/webp/variants/178_Materia-Prestada-11_f90f33c23a-640.webp 640w, IMG/webp/178_Materia-Prestada-11_f90f33c23a.webp 700w",
  srcOriginal: "IMG/remote-originals/178_Materia-Prestada-11.jpg",
  orientation: "v",
  span: 1,
  tags: ["exhibición","cultura","experiencia"],
  title: "Borrowed Matter / Materia Prestada",
  author: "Sofía Guridi",
  role: "",
  collab: "Curador: Juan Pablo Vergara. Bienal de Diseño de Londres 2023",
  area: "Exhibición / Cultura / Experiencia",
  year: "2023",
  url: [
    "https://sofiaguridi.xyz/borrowed-mattermateria-prestada",
    "https://www.zancada.com/materia-prestada-borrowed-matter/"
  ]
},

/* ------------------ Dissolvable Biotextile Keyboard — Sofía Guridi ------------------ */
{
  src: "IMG/webp/179_756dfc7d-4a2c-4280-8ce0-a60bb348ce95_rw_3840_5032c120d3.webp",
  srcAvif: "IMG/avif/179_756dfc7d-4a2c-4280-8ce0-a60bb348ce95_rw_3840_5032c120d3.avif",
  srcSetAvif: "IMG/avif/variants/179_756dfc7d-4a2c-4280-8ce0-a60bb348ce95_rw_3840_5032c120d3-640.avif 640w, IMG/avif/variants/179_756dfc7d-4a2c-4280-8ce0-a60bb348ce95_rw_3840_5032c120d3-1280.avif 1280w, IMG/avif/179_756dfc7d-4a2c-4280-8ce0-a60bb348ce95_rw_3840_5032c120d3.avif 3840w",
  srcSetWebp: "IMG/webp/variants/179_756dfc7d-4a2c-4280-8ce0-a60bb348ce95_rw_3840_5032c120d3-640.webp 640w, IMG/webp/variants/179_756dfc7d-4a2c-4280-8ce0-a60bb348ce95_rw_3840_5032c120d3-1280.webp 1280w, IMG/webp/179_756dfc7d-4a2c-4280-8ce0-a60bb348ce95_rw_3840_5032c120d3.webp 3840w",
  srcOriginal: "IMG/remote-originals/179_756dfc7d-4a2c-4280-8ce0-a60bb348ce95_rw_3840.jpg",
  orientation: "h",
  span: 2,
  tags: ["exhibición","objeto","experiencia"],
  title: "Dissolvable Biotextile Keyboard",
  author: "Sofía Guridi",
  role: "",
  collab: "Fotografía: Vertti Virasjoki. Presentado en Dutch Design Week 2024",
  area: "Objeto / Exhibición",
  year: "2024",
  url: "https://sofiaguridi.xyz/dissolvable-biotextile-keyboard"
},

/* ------------------ Palpa — Josefa Cortés ------------------ */
{
  src: "IMG/webp/180_Palpa_5fec375baf.webp",
  srcAvif: "IMG/avif/180_Palpa_5fec375baf.avif",
  srcSetAvif: "IMG/avif/variants/180_Palpa_5fec375baf-640.avif 640w, IMG/avif/180_Palpa_5fec375baf.avif 1200w",
  srcSetWebp: "IMG/webp/variants/180_Palpa_5fec375baf-640.webp 640w, IMG/webp/180_Palpa_5fec375baf.webp 1200w",
  srcOriginal: "IMG/remote-originals/180_Palpa.jpg",
  orientation: "v",
  span: 1,
  tags: ["salud","servicio","investigación","producto"],
  title: "Palpa",
  author: "Josefa Cortés",
  role: "",
  collab: "",
  area: "Salud / Servicio / Investigación / Producto",
  year: "2019–en curso",
  url: [
    "https://palpa.cl",
    "https://alumni.uc.cl/actualidad/josefa-cortes-disenadora-uc-dentro-de-losas-100-jovenes-lideres-2020/"
  ]
},

/* ------------------ El Delantal Vestido (Iluminación) — Catalina Harasic ------------------ */
{
  src: "IMG/webp/181_Harasic-Catalina-2_fbebdbfba5.webp",
  srcAvif: "IMG/avif/181_Harasic-Catalina-2_fbebdbfba5.avif",
  srcSetAvif: "IMG/avif/variants/181_Harasic-Catalina-2_fbebdbfba5-640.avif 640w, IMG/avif/181_Harasic-Catalina-2_fbebdbfba5.avif 800w",
  srcSetWebp: "IMG/webp/variants/181_Harasic-Catalina-2_fbebdbfba5-640.webp 640w, IMG/webp/181_Harasic-Catalina-2_fbebdbfba5.webp 800w",
  srcOriginal: "IMG/remote-originals/181_Harasic-Catalina-2.jpeg",
  orientation: "v",
  span: 1,
  tags: ["iluminación","industrial","espacio"],
  title: "El Delantal Vestido",
  author: "Catalina Harasic",
  role: "",
  collab: "Curaduría e investigación: Camila Ríos Erazo. Fotografía: Valentina Osnovikoff",
  area: "Iluminación / Industrial / Espacios",
  year: "2024",
  url: "https://www.linkedin.com/in/catalina-harasic-gil-9239a844/details/projects/?profileUrn=urn%3Ali%3Afsd_profile%3AACoAAAlm0SsBad8u2IpnSwXl7YUI3xvZq3sFM21"
},

/* ------------------ Zipi — Maximiliano Contreras ------------------ */
{
  src: "IMG/webp/182_Contreras-Maximiliano-Captura-de-pantalla-2026-03-09-a-las-17.24.59_0f188fc364.webp",
  srcAvif: "IMG/avif/182_Contreras-Maximiliano-Captura-de-pantalla-2026-03-09-a-las-17.24.59_0f188fc364.avif",
  srcSetAvif: "IMG/avif/variants/182_Contreras-Maximiliano-Captura-de-pantalla-2026-03-09-a-las-17.24.59_0f188fc364-640.avif 640w, IMG/avif/variants/182_Contreras-Maximiliano-Captura-de-pantalla-2026-03-09-a-las-17.24.59_0f188fc364-1280.avif 1280w, IMG/avif/182_Contreras-Maximiliano-Captura-de-pantalla-2026-03-09-a-las-17.24.59_0f188fc364.avif 1420w",
  srcSetWebp: "IMG/webp/variants/182_Contreras-Maximiliano-Captura-de-pantalla-2026-03-09-a-las-17.24.59_0f188fc364-640.webp 640w, IMG/webp/variants/182_Contreras-Maximiliano-Captura-de-pantalla-2026-03-09-a-las-17.24.59_0f188fc364-1280.webp 1280w, IMG/webp/182_Contreras-Maximiliano-Captura-de-pantalla-2026-03-09-a-las-17.24.59_0f188fc364.webp 1420w",
  srcOriginal: "IMG/remote-originals/182_Contreras-Maximiliano-Captura-de-pantalla-2026-03-09-a-las-17.24.59.png",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial"],
  title: "Zipi",
  author: "Maximiliano Contreras",
  role: "",
  collab: "",
  area: "Producto / Industrial",
  year: "2026",
  url: "https://www.instagram.com/zipi.cl/"
},
/* ------------------ Dulces Paula — Paulina Astudillo ------------------ */
{
  src: "IMG/webp/183_Astudillo-Paulina-Captura-de-pantalla-2026-03-09-a-las-17.37.51_6eb9057ece.webp",
  srcAvif: "IMG/avif/183_Astudillo-Paulina-Captura-de-pantalla-2026-03-09-a-las-17.37.51_6eb9057ece.avif",
  srcSetAvif: "IMG/avif/variants/183_Astudillo-Paulina-Captura-de-pantalla-2026-03-09-a-las-17.37.51_6eb9057ece-640.avif 640w, IMG/avif/183_Astudillo-Paulina-Captura-de-pantalla-2026-03-09-a-las-17.37.51_6eb9057ece.avif 1272w",
  srcSetWebp: "IMG/webp/variants/183_Astudillo-Paulina-Captura-de-pantalla-2026-03-09-a-las-17.37.51_6eb9057ece-640.webp 640w, IMG/webp/183_Astudillo-Paulina-Captura-de-pantalla-2026-03-09-a-las-17.37.51_6eb9057ece.webp 1272w",
  srcOriginal: "IMG/remote-originals/183_Astudillo-Paulina-Captura-de-pantalla-2026-03-09-a-las-17.37.51.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Postres Paula",
  author: "Paulina Astudillo",
  role: "",
  collab: "Diseño gráfico: Paulina Astudillo y equipo Otros Pérez. Identidad desarrollada en Otros Pérez",
  area: "Branding / Identidad visual / Gráfico",
  year: "2026",
  url: "https://www.instagram.com/p/DU3QMA-kVtX/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
},

/* ------------------ Vestigios — Carolina Pacheco ------------------ */
{
  src: "IMG/webp/184_pacheco-Carolina-16_1411c9d208.webp",
  srcAvif: "IMG/avif/184_pacheco-Carolina-16_1411c9d208.avif",
  srcSetAvif: "IMG/avif/variants/184_pacheco-Carolina-16_1411c9d208-640.avif 640w, IMG/avif/variants/184_pacheco-Carolina-16_1411c9d208-1280.avif 1280w, IMG/avif/184_pacheco-Carolina-16_1411c9d208.avif 2248w",
  srcSetWebp: "IMG/webp/variants/184_pacheco-Carolina-16_1411c9d208-640.webp 640w, IMG/webp/variants/184_pacheco-Carolina-16_1411c9d208-1280.webp 1280w, IMG/webp/184_pacheco-Carolina-16_1411c9d208.webp 2248w",
  srcOriginal: "IMG/remote-originals/184_pacheco-Carolina-16.jpg",
  orientation: "v",
  span: 1,
  tags: ["museografía","exhibición","investigación"],
  title: "Vestigios",
  author: "Carolina Pacheco",
  role: "",
  collab: "Idea original, investigación, dirección creativa y ejecución: Colectivo Ronda (Yael Berkowitz, Aníbal Fuentes, Natalia Cerda, Carolina Pacheco, Francisca Feijoo, Loreto Leiva). Fotografías: Benjamín Salazar",
  area: "Museografía / Exhibición / Investigación",
  year: "2022",
  url: "https://www.caropacheco.work/vestigios"
},

/* ------------------ El Delantal Vestido — Camila Ríos ------------------ */
{
  src: "IMG/webp/185_Rios-camila-Captura-de-Pantalla-2024-11-27-a-las-14.46.28.jpg_d20a8c433c.webp",
  srcAvif: "IMG/avif/185_Rios-camila-Captura-de-Pantalla-2024-11-27-a-las-14.46.28.jpg_d20a8c433c.avif",
  srcSetAvif: "IMG/avif/variants/185_Rios-camila-Captura-de-Pantalla-2024-11-27-a-las-14.46.28.jpg_d20a8c433c-640.avif 640w, IMG/avif/185_Rios-camila-Captura-de-Pantalla-2024-11-27-a-las-14.46.28.jpg_d20a8c433c.avif 784w",
  srcSetWebp: "IMG/webp/variants/185_Rios-camila-Captura-de-Pantalla-2024-11-27-a-las-14.46.28.jpg_d20a8c433c-640.webp 640w, IMG/webp/185_Rios-camila-Captura-de-Pantalla-2024-11-27-a-las-14.46.28.jpg_d20a8c433c.webp 784w",
  srcOriginal: "IMG/remote-originals/185_Rios-camila-Captura-de-Pantalla-2024-11-27-a-las-14.46.28.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["museografía","exhibición","investigación"],
  title: "El Delantal Vestido",
  author: "Camila Ríos",
  role: "",
  collab: "Curaduría: Camila Ríos Erazo. Diseño, investigación y desarrollo etapa Textiles domésticos: Camila Ríos Erazo y Loreto Casanueva Reyes",
  area: "Museografía / Exhibición / Investigación",
  year: "2024",
  url: ["https://camilarios.com/el-delantal-vestido","https://www.instagram.com/p/DB2ONWqujBV/?img_index=1"]
},

/* ------------------ Sonic Ecologies 2.0 — Joaquín Rosas ------------------ */
{
  src: "IMG/webp/186_rosas-joaquin-1_45a35d5a03.webp",
  srcAvif: "IMG/avif/186_rosas-joaquin-1_45a35d5a03.avif",
  srcSetAvif: "IMG/avif/variants/186_rosas-joaquin-1_45a35d5a03-640.avif 640w, IMG/avif/186_rosas-joaquin-1_45a35d5a03.avif 670w",
  srcSetWebp: "IMG/webp/variants/186_rosas-joaquin-1_45a35d5a03-640.webp 640w, IMG/webp/186_rosas-joaquin-1_45a35d5a03.webp 670w",
  srcOriginal: "IMG/remote-originals/186_rosas-joaquin-1.png",
  orientation: "v",
  span: 1,
  tags: ["museografía","exhibición","investigación"],
  title: "Sonic Ecologies 2.0",
  author: "Joaquín Rosas",
  role: "",
  collab: "Moving Works + Low Studio. Universidad Adolfo Ibáñez (2023). Fotografías: Hurto Visual",
  area: "Museografía / Exhibición / Investigación",
  year: "2023",
  url: "https://joaquinrosas.com/SONIC-ECOLOGIES-EXHIBITION"
},

/* ------------------ Gubii Bags — Joaquín Rosas ------------------ */
{
  src: "IMG/webp/187_ROSAS-JOAQUIN2-Gubbi-Sesion-Jun-7_1340_c_e98164f2c3.webp",
  srcAvif: "IMG/avif/187_ROSAS-JOAQUIN2-Gubbi-Sesion-Jun-7_1340_c_e98164f2c3.avif",
  srcSetAvif: "IMG/avif/variants/187_ROSAS-JOAQUIN2-Gubbi-Sesion-Jun-7_1340_c_e98164f2c3-640.avif 640w, IMG/avif/variants/187_ROSAS-JOAQUIN2-Gubbi-Sesion-Jun-7_1340_c_e98164f2c3-1280.avif 1280w, IMG/avif/187_ROSAS-JOAQUIN2-Gubbi-Sesion-Jun-7_1340_c_e98164f2c3.avif 1340w",
  srcSetWebp: "IMG/webp/variants/187_ROSAS-JOAQUIN2-Gubbi-Sesion-Jun-7_1340_c_e98164f2c3-640.webp 640w, IMG/webp/variants/187_ROSAS-JOAQUIN2-Gubbi-Sesion-Jun-7_1340_c_e98164f2c3-1280.webp 1280w, IMG/webp/187_ROSAS-JOAQUIN2-Gubbi-Sesion-Jun-7_1340_c_e98164f2c3.webp 1340w",
  srcOriginal: "IMG/remote-originals/187_ROSAS-JOAQUIN2-Gubbi-Sesion-Jun-7_1340_c.jpeg",
  orientation: "v",
  span: 1,
  tags: ["producto","packaging","textil"],
  title: "Gubii Bags",
  author: "Joaquín Rosas",
  role: "",
  collab: "Diseño de mochila infantil para la marca Gubii. Incluye: diseño de logo, identidad gráfica y sistema visual. Ilustraciones de animales chilenos",
  area: "Producto / Packaging / Textil",
  year: "2025",
  url: "https://joaquinrosas.com/GUBII-BAGS"
},

/* ------------------ Antiquity Collection — Sebastián Errázuriz ------------------ */
{
  src: "IMG/webp/The-Antiquity-Shelf-by-Sebastian-Errazuriz-1.jpg_796553c1b3.webp",
  srcAvif: "IMG/avif/The-Antiquity-Shelf-by-Sebastian-Errazuriz-1.jpg_796553c1b3.avif",
  srcSetAvif: "IMG/avif/variants/The-Antiquity-Shelf-by-Sebastian-Errazuriz-1.jpg_796553c1b3-640.avif 640w, IMG/avif/variants/The-Antiquity-Shelf-by-Sebastian-Errazuriz-1.jpg_796553c1b3-1280.avif 1280w, IMG/avif/The-Antiquity-Shelf-by-Sebastian-Errazuriz-1.jpg_796553c1b3.avif 2499w",
  srcSetWebp: "IMG/webp/variants/The-Antiquity-Shelf-by-Sebastian-Errazuriz-1.jpg_796553c1b3-640.webp 640w, IMG/webp/variants/The-Antiquity-Shelf-by-Sebastian-Errazuriz-1.jpg_796553c1b3-1280.webp 1280w, IMG/webp/The-Antiquity-Shelf-by-Sebastian-Errazuriz-1.jpg_796553c1b3.webp 2499w",
  srcOriginal: "https://freight.cargo.site/t/original/i/I2854633759702593391334728872643/The-Antiquity-Shelf-by-Sebastian-Errazuriz-1.jpg.jpg",
  orientation: "h",
  span: 1,
  tags: ["objeto", "diseño conceptual"],
  title: "Antiquity Collection",
  author: "Sebastián Errázuriz",
  role: "",
  collab: "Desarrollado en Sebastian Studio",
  area: "Objeto / Diseño conceptual",
  year: "2021",
  url: "https://sebastian.studio/storage-antiquity-bookshelf"
},

/* ------------------ IMAGINE ARTIFICIAL GENERAL INTELLIGENCE — Sebastián Errázuriz ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-22.57.22_0a9e3b3b4b.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-22.57.22_0a9e3b3b4b.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-22.57.22_0a9e3b3b4b-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-22.57.22_0a9e3b3b4b-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-22.57.22_0a9e3b3b4b.avif 1772w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-22.57.22_0a9e3b3b4b-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-22.57.22_0a9e3b3b4b-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-22.57.22_0a9e3b3b4b.webp 1772w",
  srcOriginal: "https://freight.cargo.site/t/original/i/R2854632112943303187209346560707/Captura-de-pantalla-2026-03-23-a-las-22.57.22.png",
  orientation: "h",
  span: 1,
  tags: ["editorial"],
  title: "IMAGINE ARTIFICIAL GENERAL INTELLIGENCE",
  author: "Sebastián Errázuriz",
  role: "",
  collab: "Desarrollado en Sebastian Studio",
  area: "Editorial",
  year: "2025",
  url: "https://sebastian.studio/imagine-book"
},

/* ------------------ Melissa + Sebastián — Sebastián Errázuriz ------------------ */
{
  src: "IMG/webp/melissa.jpeg_3348960dc4.webp",
  srcAvif: "IMG/avif/melissa.jpeg_3348960dc4.avif",
  srcSetAvif: "IMG/avif/variants/melissa.jpeg_3348960dc4-640.avif 640w, IMG/avif/variants/melissa.jpeg_3348960dc4-1280.avif 1280w, IMG/avif/melissa.jpeg_3348960dc4.avif 2500w",
  srcSetWebp: "IMG/webp/variants/melissa.jpeg_3348960dc4-640.webp 640w, IMG/webp/variants/melissa.jpeg_3348960dc4-1280.webp 1280w, IMG/webp/melissa.jpeg_3348960dc4.webp 2500w",
  srcOriginal: "https://freight.cargo.site/t/original/i/H2854633759757933623555857527491/melissa.jpeg.jpg",
  orientation: "h",
  span: 1,
  tags: ["objeto", "indumentaria", "moda"],
  title: "Melissa + Sebastián",
  author: "Sebastián Errázuriz",
  role: "",
  collab: "Melissa plastic shoes. Desarrollado en Sebastian Studio",
  area: "Objeto / Indumentaria / Moda",
  year: "2015",
  url: "https://sebastian.studio/brands-melissa-sebastian"
},

/* ------------------ Encuentros — Ignacia Murtagh ------------------ */
{
  src: "IMG/webp/Volume-3.jpg_fdcdfdceee.webp",
  srcAvif: "IMG/avif/Volume-3.jpg_fdcdfdceee.avif",
  srcSetAvif: "IMG/avif/variants/Volume-3.jpg_fdcdfdceee-640.avif 640w, IMG/avif/variants/Volume-3.jpg_fdcdfdceee-1280.avif 1280w, IMG/avif/Volume-3.jpg_fdcdfdceee.avif 2500w",
  srcSetWebp: "IMG/webp/variants/Volume-3.jpg_fdcdfdceee-640.webp 640w, IMG/webp/variants/Volume-3.jpg_fdcdfdceee-1280.webp 1280w, IMG/webp/Volume-3.jpg_fdcdfdceee.webp 2500w",
  srcOriginal: "https://freight.cargo.site/t/original/i/M2854633759739486879482147975875/Volume-3.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["objeto", "artesanía", "exhibición"],
  title: "Encuentros",
  author: "Ignacia Murtagh",
  role: "",
  collab: "",
  area: "Objeto / Artesanía / Exhibición",
  year: "n/a",
  url: "https://ignaciamurtagh.com/collections/#/encuentros/"
},

/* ------------------ Bancas Lapis. Palacio Pereira — Ignacia Murtagh ------------------ */
{
  src: "IMG/webp/Lapis-2.jpg_0385068d32.webp",
  srcAvif: "IMG/avif/Lapis-2.jpg_0385068d32.avif",
  srcSetAvif: "IMG/avif/variants/Lapis-2.jpg_0385068d32-640.avif 640w, IMG/avif/variants/Lapis-2.jpg_0385068d32-1280.avif 1280w, IMG/avif/Lapis-2.jpg_0385068d32.avif 2048w",
  srcSetWebp: "IMG/webp/variants/Lapis-2.jpg_0385068d32-640.webp 640w, IMG/webp/variants/Lapis-2.jpg_0385068d32-1280.webp 1280w, IMG/webp/Lapis-2.jpg_0385068d32.webp 2048w",
  srcOriginal: "https://freight.cargo.site/t/original/i/F2854633759721040135408438424259/Lapis-2.jpg.jpg",
  orientation: "h",
  span: 1,
  tags: ["objeto", "artesanía", "exhibición"],
  title: "Bancas Lapis. Palacio Pereira",
  author: "Ignacia Murtagh",
  role: "",
  collab: "",
  area: "Objeto / Artesanía / Exhibición",
  year: "n/a",
  url: "https://ignaciamurtagh.com/collections#/palacio-pereira/"
},

/* ------------------ Woven Landscapes. Gallura — Ignacia Murtagh ------------------ */
{
  src: "IMG/webp/Screen-Shot-2025-04-02-at-22.22.07_14b54c12cf.webp",
  srcAvif: "IMG/avif/Screen-Shot-2025-04-02-at-22.22.07_14b54c12cf.avif",
  srcSetAvif: "IMG/avif/variants/Screen-Shot-2025-04-02-at-22.22.07_14b54c12cf-640.avif 640w, IMG/avif/variants/Screen-Shot-2025-04-02-at-22.22.07_14b54c12cf-1280.avif 1280w, IMG/avif/Screen-Shot-2025-04-02-at-22.22.07_14b54c12cf.avif 1318w",
  srcSetWebp: "IMG/webp/variants/Screen-Shot-2025-04-02-at-22.22.07_14b54c12cf-640.webp 640w, IMG/webp/variants/Screen-Shot-2025-04-02-at-22.22.07_14b54c12cf-1280.webp 1280w, IMG/webp/Screen-Shot-2025-04-02-at-22.22.07_14b54c12cf.webp 1318w",
  srcOriginal: "https://freight.cargo.site/t/original/i/G2854632390308547079506164658883/Screen-Shot-2025-04-02-at-22.22.07.png",
  orientation: "h",
  span: 1,
  tags: ["objeto", "artesanía", "exhibición"],
  title: "Woven Landscapes. Gallura",
  author: "Ignacia Murtagh",
  role: "",
  collab: "",
  area: "Objeto / Artesanía / Exhibición",
  year: "n/a",
  url: "https://ignaciamurtagh.com/collections#/woven-landscapes/"
},

/* ------------------ Across Andes 2025 Volcano Edition — Joaquín Rosas ------------------ */
{
  src: "IMG/webp/188_rosas-joaquin-MAPAAA-2025-Final_1340_c_88c38ba8b8.webp",
  srcAvif: "IMG/avif/188_rosas-joaquin-MAPAAA-2025-Final_1340_c_88c38ba8b8.avif",
  srcSetAvif: "IMG/avif/variants/188_rosas-joaquin-MAPAAA-2025-Final_1340_c_88c38ba8b8-640.avif 640w, IMG/avif/variants/188_rosas-joaquin-MAPAAA-2025-Final_1340_c_88c38ba8b8-1280.avif 1280w, IMG/avif/188_rosas-joaquin-MAPAAA-2025-Final_1340_c_88c38ba8b8.avif 1340w",
  srcSetWebp: "IMG/webp/variants/188_rosas-joaquin-MAPAAA-2025-Final_1340_c_88c38ba8b8-640.webp 640w, IMG/webp/variants/188_rosas-joaquin-MAPAAA-2025-Final_1340_c_88c38ba8b8-1280.webp 1280w, IMG/webp/188_rosas-joaquin-MAPAAA-2025-Final_1340_c_88c38ba8b8.webp 1340w",
  srcOriginal: "IMG/remote-originals/188_rosas-joaquin-MAPAAA-2025-Final_1340_c.jpeg",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Across Andes 2025 Volcano Edition",
  author: "Joaquín Rosas",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://joaquinrosas.com/ACROSS-ANDES-MAP"
},

/* ------------------ Natural Killer — Leopoldo Herrera ------------------ */
{
  src: "IMG/webp/189_herrera-leopoldo_741bae2dbe.webp",
  srcAvif: "IMG/avif/189_herrera-leopoldo_741bae2dbe.avif",
  srcSetAvif: "IMG/avif/variants/189_herrera-leopoldo_741bae2dbe-640.avif 640w, IMG/avif/variants/189_herrera-leopoldo_741bae2dbe-1280.avif 1280w, IMG/avif/189_herrera-leopoldo_741bae2dbe.avif 1296w",
  srcSetWebp: "IMG/webp/variants/189_herrera-leopoldo_741bae2dbe-640.webp 640w, IMG/webp/variants/189_herrera-leopoldo_741bae2dbe-1280.webp 1280w, IMG/webp/189_herrera-leopoldo_741bae2dbe.webp 1296w",
  srcOriginal: "IMG/remote-originals/189_herrera-leopoldo.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","juego de mesa"],
  title: "Natural Killer",
  author: "Leopoldo Herrera",
  role: "",
  collab: "Co-creador: Leopoldo Herrera",
  area: "Producto / Juego de mesa",
  year: "2024",
  url: "https://www.behance.net/gallery/210222175/Natural-Killer-Boardgame"
},

/* ------------------ Con Devuelta — Isabel Díaz-del Río ------------------ */
{
  src: "IMG/webp/190_rios-isabel_f51edf8225.webp",
  srcAvif: "IMG/avif/190_rios-isabel_f51edf8225.avif",
  srcSetAvif: "IMG/avif/variants/190_rios-isabel_f51edf8225-640.avif 640w, IMG/avif/190_rios-isabel_f51edf8225.avif 700w",
  srcSetWebp: "IMG/webp/variants/190_rios-isabel_f51edf8225-640.webp 640w, IMG/webp/190_rios-isabel_f51edf8225.webp 700w",
  srcOriginal: "IMG/remote-originals/190_rios-isabel.jpg",
  orientation: "sq",
  span: 1,
  tags: ["servicio","social","ecología"],
  title: "Con Devuelta",
  author: "Isabel Díaz-del Río",
  role: "Diseñadora",
  collab: "",
  area: "Servicio / Social / Ecología",
  year: "2022",
  url: ["https://condevuelta.cl","https://www.elmostrador.cl/agenda-pais/agenda-innovacion/2023/08/31/con-devuelta-la-startup-que-busca-eliminar-el-packaging-desechable-en-los-locales-de-comida/"]
},

/* ------------------ Calcáreo — Carolina Pacheco ------------------ */
{
  src: "IMG/webp/191_pacheco-carolina-2-2-5-lateral_a1b7114877.webp",
  srcAvif: "IMG/avif/191_pacheco-carolina-2-2-5-lateral_a1b7114877.avif",
  srcSetAvif: "IMG/avif/191_pacheco-carolina-2-2-5-lateral_a1b7114877.avif 500w",
  srcSetWebp: "IMG/webp/191_pacheco-carolina-2-2-5-lateral_a1b7114877.webp 500w",
  srcOriginal: "IMG/remote-originals/191_pacheco-carolina-2-2-5-lateral.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","biomaterial","investigación"],
  title: "Calcáreo",
  author: "Carolina Pacheco",
  role: "Diseñadora",
  collab: "Proyecto de título en Diseño UC. Profesores guía: Alejandro Durán, María José Besoaín, Aníbal Fuentes, Alejandro Weiss. Fotografías: Omar Faundez, Antonia Valencia, Carolina Pacheco",
  area: "Producto / Biomaterial / Investigación",
  year: "2019",
  url: "https://www.caropacheco.work/calcareo"
},

/* ------------------ AjuarParn — Camila Ríos ------------------ */
{
  src: "IMG/webp/192_Rios-Camila-21949970_10155734500863430_4521371404219177019_o.jpg_283036fac6.webp",
  srcAvif: "IMG/avif/192_Rios-Camila-21949970_10155734500863430_4521371404219177019_o.jpg_283036fac6.avif",
  srcSetAvif: "IMG/avif/variants/192_Rios-Camila-21949970_10155734500863430_4521371404219177019_o.jpg_283036fac6-640.avif 640w, IMG/avif/192_Rios-Camila-21949970_10155734500863430_4521371404219177019_o.jpg_283036fac6.avif 1100w",
  srcSetWebp: "IMG/webp/variants/192_Rios-Camila-21949970_10155734500863430_4521371404219177019_o.jpg_283036fac6-640.webp 640w, IMG/webp/192_Rios-Camila-21949970_10155734500863430_4521371404219177019_o.jpg_283036fac6.webp 1100w",
  srcOriginal: "IMG/remote-originals/192_Rios-Camila-21949970_10155734500863430_4521371404219177019_o.jpg.jpg",
  orientation: "h",
  span: 2,
  tags: ["producto","packaging","textil"],
  title: "AjuarParn",
  author: "Camila Ríos",
  role: "",
  collab: "",
  area: "Producto / Packaging / Textil",
  year: "2017",
  url: "https://camilarios.com/parn"
},
/* ------------------ Guaico — Joaquín Gajardo ------------------ */
{
  src: "IMG/webp/193_Gajardo-Joaquin-65f0f31b0ed2f6147a720a72_GUAICO-STUDIO-1_f2326b741a.webp",
  srcAvif: "IMG/avif/193_Gajardo-Joaquin-65f0f31b0ed2f6147a720a72_GUAICO-STUDIO-1_f2326b741a.avif",
  srcSetAvif: "IMG/avif/variants/193_Gajardo-Joaquin-65f0f31b0ed2f6147a720a72_GUAICO-STUDIO-1_f2326b741a-640.avif 640w, IMG/avif/variants/193_Gajardo-Joaquin-65f0f31b0ed2f6147a720a72_GUAICO-STUDIO-1_f2326b741a-1280.avif 1280w, IMG/avif/193_Gajardo-Joaquin-65f0f31b0ed2f6147a720a72_GUAICO-STUDIO-1_f2326b741a.avif 2243w",
  srcSetWebp: "IMG/webp/variants/193_Gajardo-Joaquin-65f0f31b0ed2f6147a720a72_GUAICO-STUDIO-1_f2326b741a-640.webp 640w, IMG/webp/variants/193_Gajardo-Joaquin-65f0f31b0ed2f6147a720a72_GUAICO-STUDIO-1_f2326b741a-1280.webp 1280w, IMG/webp/193_Gajardo-Joaquin-65f0f31b0ed2f6147a720a72_GUAICO-STUDIO-1_f2326b741a.webp 2243w",
  srcOriginal: "IMG/remote-originals/193_Gajardo-Joaquin-65f0f31b0ed2f6147a720a72_GUAICO-STUDIO-1.jpg",
  orientation: "h",
  span: 2,
  tags: ["desarrollo web","servicios","ecommerce"],
  title: "Guaico",
  author: "Joaquín Gajardo",
  role: "",
  collab: "Cliente: GUAICO. Trabajo realizado en Gaja Studio",
  area: "Desarrollo Web / Ecommerce",
  year: "2023",
  url: "https://www.gaja.studio/proyectos/proyecto-guaico"
},

/* ------------------ A Punto — María José Díaz ------------------ */
{
  src: "IMG/webp/194_Captura-de-pantalla-2026-03-14-a-las-20.16.15_461d0ff7fb.webp",
  srcAvif: "IMG/avif/194_Captura-de-pantalla-2026-03-14-a-las-20.16.15_461d0ff7fb.avif",
  srcSetAvif: "IMG/avif/variants/194_Captura-de-pantalla-2026-03-14-a-las-20.16.15_461d0ff7fb-640.avif 640w, IMG/avif/variants/194_Captura-de-pantalla-2026-03-14-a-las-20.16.15_461d0ff7fb-1280.avif 1280w, IMG/avif/194_Captura-de-pantalla-2026-03-14-a-las-20.16.15_461d0ff7fb.avif 2784w",
  srcSetWebp: "IMG/webp/variants/194_Captura-de-pantalla-2026-03-14-a-las-20.16.15_461d0ff7fb-640.webp 640w, IMG/webp/variants/194_Captura-de-pantalla-2026-03-14-a-las-20.16.15_461d0ff7fb-1280.webp 1280w, IMG/webp/194_Captura-de-pantalla-2026-03-14-a-las-20.16.15_461d0ff7fb.webp 2784w",
  srcOriginal: "IMG/remote-originals/194_Captura-de-pantalla-2026-03-14-a-las-20.16.15.png",
  orientation: "h",
  span: 1,
  tags: ["identidad visual","dirección creativa"],
  title: "A Punto",
  author: "María José Díaz",
  role: "",
  collab: "Desarrollado en Blanca Estudio. Branding Manager: María José Díaz",
  area: "Identidad visual / Dirección creativa",
  year: "2017",
  url: "https://www.blancaestudio.com/apunto"
},

/* ------------------ VSPT — María José Díaz ------------------ */
{
  src: "IMG/webp/195_Captura-de-pantalla-2026-03-14-a-las-19.39.31_55a8f0f638.webp",
  srcAvif: "IMG/avif/195_Captura-de-pantalla-2026-03-14-a-las-19.39.31_55a8f0f638.avif",
  srcSetAvif: "IMG/avif/variants/195_Captura-de-pantalla-2026-03-14-a-las-19.39.31_55a8f0f638-640.avif 640w, IMG/avif/195_Captura-de-pantalla-2026-03-14-a-las-19.39.31_55a8f0f638.avif 1266w",
  srcSetWebp: "IMG/webp/variants/195_Captura-de-pantalla-2026-03-14-a-las-19.39.31_55a8f0f638-640.webp 640w, IMG/webp/195_Captura-de-pantalla-2026-03-14-a-las-19.39.31_55a8f0f638.webp 1266w",
  srcOriginal: "IMG/remote-originals/195_Captura-de-pantalla-2026-03-14-a-las-19.39.31.png",
  orientation: "h",
  span: 1,
  tags: ["identidad visual","dirección creativa"],
  title: "VSPT",
  author: "María José Díaz",
  role: "",
  collab: "Desarrollado en Blanca Estudio. Branding Manager: María José Díaz",
  area: "Identidad visual / Dirección creativa",
  year: "2020",
  url: "https://www.blancaestudio.com/vspt"
},

/* ------------------ Resurgir: un poema a las raíces — Magdalena Sáez ------------------ */
{
  src: "IMG/webp/196_Captura-de-pantalla-2026-03-14-a-las-20.15.40_48102de150.webp",
  srcAvif: "IMG/avif/196_Captura-de-pantalla-2026-03-14-a-las-20.15.40_48102de150.avif",
  srcSetAvif: "IMG/avif/196_Captura-de-pantalla-2026-03-14-a-las-20.15.40_48102de150.avif 328w",
  srcSetWebp: "IMG/webp/196_Captura-de-pantalla-2026-03-14-a-las-20.15.40_48102de150.webp 328w",
  srcOriginal: "IMG/remote-originals/196_Captura-de-pantalla-2026-03-14-a-las-20.15.40.png",
  orientation: "sq",
  span: 1,
  tags: ["dirección creativa","objeto","moda","fotografía"],
  title: "Resurgir: un poema a las raíces",
  author: "Magdalena Sáez",
  role: "Directora de arte",
  collab: "Campaña colaborativa entre las marcas Exo y Adeu. Equipo creativo: Giuliana Mellafe, Magdalena Sáenz, Sebastián Tala, María Jesús Vallejos, Josefina Véliz",
  area: "Dirección creativa / Objeto / Moda / Fotografía",
  year: "2023",
  url: "https://www.behance.net/gallery/234618837/Resurgir"
},

/* ------------------ Resurgir: un poema a las raíces — María Jesús Vallejos ------------------ */
{
  src: "IMG/webp/197_Captura-de-pantalla-2026-03-14-a-las-20.15.27_9a78bc4f91.webp",
  srcAvif: "IMG/avif/197_Captura-de-pantalla-2026-03-14-a-las-20.15.27_9a78bc4f91.avif",
  srcSetAvif: "IMG/avif/197_Captura-de-pantalla-2026-03-14-a-las-20.15.27_9a78bc4f91.avif 336w",
  srcSetWebp: "IMG/webp/197_Captura-de-pantalla-2026-03-14-a-las-20.15.27_9a78bc4f91.webp 336w",
  srcOriginal: "IMG/remote-originals/197_Captura-de-pantalla-2026-03-14-a-las-20.15.27.png",
  orientation: "sq",
  span: 1,
  tags: ["dirección creativa","objeto","moda","fotografía"],
  title: "Resurgir: un poema a las raíces",
  author: "María Jesús Vallejos",
  role: "Directora de arte",
  collab: "Campaña colaborativa entre las marcas Exo y Adeu. Equipo creativo: Giuliana Mellafe, Magdalena Sáenz, Sebastián Tala, María Jesús Vallejos, Josefina Véliz",
  area: "Dirección creativa / Objeto / Moda / Fotografía",
  year: "2023",
  url: "https://www.behance.net/gallery/234618837/Resurgir"
},

/* ------------------ Resurgir: un poema a las raíces — Sebastián Tala ------------------ */
{
  src: "IMG/webp/198_Captura-de-pantalla-2026-03-14-a-las-20.15.33_fecf94616c.webp",
  srcAvif: "IMG/avif/198_Captura-de-pantalla-2026-03-14-a-las-20.15.33_fecf94616c.avif",
  srcSetAvif: "IMG/avif/198_Captura-de-pantalla-2026-03-14-a-las-20.15.33_fecf94616c.avif 330w",
  srcSetWebp: "IMG/webp/198_Captura-de-pantalla-2026-03-14-a-las-20.15.33_fecf94616c.webp 330w",
  srcOriginal: "IMG/remote-originals/198_Captura-de-pantalla-2026-03-14-a-las-20.15.33.png",
  orientation: "sq",
  span: 1,
  tags: ["dirección creativa","objeto","moda","fotografía"],
  title: "Resurgir: un poema a las raíces",
  author: "Sebastián Tala",
  role: "Director de arte",
  collab: "Campaña colaborativa entre las marcas Exo y Adeu. Equipo creativo: Giuliana Mellafe, Magdalena Sáenz, Sebastián Tala, María Jesús Vallejos, Josefina Véliz",
  area: "Dirección creativa / Objeto / Moda / Fotografía",
  year: "2023",
  url: "https://www.behance.net/gallery/234618837/Resurgir"
},

/* ------------------ Resurgir: un poema a las raíces — Giuliana Mellafe ------------------ */
{
  src: "IMG/webp/199_Captura-de-pantalla-2026-03-14-a-las-20.15.21_8b509d6267.webp",
  srcAvif: "IMG/avif/199_Captura-de-pantalla-2026-03-14-a-las-20.15.21_8b509d6267.avif",
  srcSetAvif: "IMG/avif/199_Captura-de-pantalla-2026-03-14-a-las-20.15.21_8b509d6267.avif 334w",
  srcSetWebp: "IMG/webp/199_Captura-de-pantalla-2026-03-14-a-las-20.15.21_8b509d6267.webp 334w",
  srcOriginal: "IMG/remote-originals/199_Captura-de-pantalla-2026-03-14-a-las-20.15.21.png",
  orientation: "sq",
  span: 1,
  tags: ["dirección creativa","objeto","moda","fotografía"],
  title: "Resurgir: un poema a las raíces",
  author: "Giuliana Mellafe",
  role: "Directora de arte",
  collab: "Campaña colaborativa entre las marcas Exo y Adeu. Equipo creativo: Giuliana Mellafe, Magdalena Sáenz, Sebastián Tala, María Jesús Vallejos, Josefina Véliz",
  area: "Dirección creativa / Objeto / Moda / Fotografía",
  year: "2023",
  url: "https://www.behance.net/gallery/234618837/Resurgir"
},

/* ------------------ Resurgir: un poema a las raíces — Josefina Véliz ------------------ */
{
  src: "IMG/webp/200_Captura-de-pantalla-2026-03-14-a-las-20.15.47_861e95fff3.webp",
  srcAvif: "IMG/avif/200_Captura-de-pantalla-2026-03-14-a-las-20.15.47_861e95fff3.avif",
  srcSetAvif: "IMG/avif/200_Captura-de-pantalla-2026-03-14-a-las-20.15.47_861e95fff3.avif 332w",
  srcSetWebp: "IMG/webp/200_Captura-de-pantalla-2026-03-14-a-las-20.15.47_861e95fff3.webp 332w",
  srcOriginal: "IMG/remote-originals/200_Captura-de-pantalla-2026-03-14-a-las-20.15.47.png",
  orientation: "sq",
  span: 1,
  tags: ["dirección creativa","objeto","moda","fotografía"],
  title: "Resurgir: un poema a las raíces",
  author: "Josefina Véliz",
  role: "Directora de arte",
  collab: "Campaña colaborativa entre las marcas Exo y Adeu. Equipo creativo: Giuliana Mellafe, Magdalena Sáenz, Sebastián Tala, María Jesús Vallejos, Josefina Véliz",
  area: "Dirección creativa / Objeto / Moda / Fotografía",
  year: "2023",
  url: "https://www.behance.net/gallery/234618837/Resurgir"
},

/* ------------------ Bote de pesca — Alejandra Echeverría ------------------ */
{
  src: "IMG/webp/Alejandra-Echeverria_895ad76d03.webp",
  srcAvif: "IMG/avif/Alejandra-Echeverria_895ad76d03.avif",
  srcSetAvif: "IMG/avif/variants/Alejandra-Echeverria_895ad76d03-640.avif 640w, IMG/avif/Alejandra-Echeverria_895ad76d03.avif 700w",
  srcSetWebp: "IMG/webp/variants/Alejandra-Echeverria_895ad76d03-640.webp 640w, IMG/webp/Alejandra-Echeverria_895ad76d03.webp 700w",
  srcOriginal: "https://freight.cargo.site/t/original/i/Q2842814634021795767848800826051/Alejandra-Echeverria.png",
  orientation: "sq",
  span: 1,
  tags: ["identidad visual"],
  title: "Bote de pesca",
  author: "Alejandra Echeverría",
  role: "Diseñadora",
  collab: "",
  area: "Identidad visual",
  year: "2021",
  url: "https://www.behance.net/gallery/201814673/BDPManual-de-Marca"
},

/* ------------------ Candelabro Lollapalooza 2026 — Carlos Nauto Paez ------------------ */
{
  src: "IMG/webp/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.53.47_6a8b04deca.webp",
  srcAvif: "IMG/avif/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.53.47_6a8b04deca.avif",
  srcSetAvif: "IMG/avif/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.53.47_6a8b04deca-640.avif 640w, IMG/avif/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.53.47_6a8b04deca-1280.avif 1280w, IMG/avif/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.53.47_6a8b04deca.avif 1750w",
  srcSetWebp: "IMG/webp/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.53.47_6a8b04deca-640.webp 640w, IMG/webp/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.53.47_6a8b04deca-1280.webp 1280w, IMG/webp/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.53.47_6a8b04deca.webp 1750w",
  srcOriginal: "https://freight.cargo.site/t/original/i/K2842814634040242511922510377667/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.53.47.png",
  orientation: "h",
  span: 2,
  tags: ["vjing","visuales","música"],
  title: "Candelabro Lollapalooza 2026",
  author: "Carlos Nauto Paez",
  role: "Visualista / Diseñador",
  collab: "Diseño y operación de visuales para el show de @candelabro.candelabro en @lollapaloozacl.",
  area: "Vjing (visuales) / Música",
  year: "2026",
  url: "https://www.instagram.com/p/DV6uYi7Cek4/?img_index=8"
},

/* ------------------ Pedro Ruminot - Festival de Viña del Mar 2027 — Carlos Nauto Paez ------------------ */
{
  src: "IMG/webp/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.58.03_2c7b51ede2.webp",
  srcAvif: "IMG/avif/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.58.03_2c7b51ede2.avif",
  srcSetAvif: "IMG/avif/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.58.03_2c7b51ede2-640.avif 640w, IMG/avif/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.58.03_2c7b51ede2-1280.avif 1280w, IMG/avif/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.58.03_2c7b51ede2.avif 1358w",
  srcSetWebp: "IMG/webp/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.58.03_2c7b51ede2-640.webp 640w, IMG/webp/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.58.03_2c7b51ede2-1280.webp 1280w, IMG/webp/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.58.03_2c7b51ede2.webp 1358w",
  srcOriginal: "https://freight.cargo.site/t/original/i/S2842814634077136000069929480899/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.58.03.png",
  orientation: "sq",
  span: 1,
  tags: ["vjing","visuales"],
  title: "Pedro Ruminot - Festival de Viña del Mar 2027",
  author: "Carlos Nauto Paez",
  role: "Visualista / Diseñador",
  collab: "Diseño de entorno 3D, visuales, operación de backup de visuales y asistencia en diseño para @pedroruminot en el @elfestivaldevina 2025.",
  area: "Vjing (visuales) / gráfico / Shows",
  year: "2025",
  url: "https://www.instagram.com/p/DGt_-6PuOwo/?img_index=1"
},

/* ------------------ Juan Pablo López - Festival de Viña del Mar 2026 — Carlos Nauto Paez ------------------ */
{
  src: "IMG/webp/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-13.00.33_afb8b281f8.webp",
  srcAvif: "IMG/avif/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-13.00.33_afb8b281f8.avif",
  srcSetAvif: "IMG/avif/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-13.00.33_afb8b281f8-640.avif 640w, IMG/avif/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-13.00.33_afb8b281f8-1280.avif 1280w, IMG/avif/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-13.00.33_afb8b281f8.avif 1380w",
  srcSetWebp: "IMG/webp/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-13.00.33_afb8b281f8-640.webp 640w, IMG/webp/variants/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-13.00.33_afb8b281f8-1280.webp 1280w, IMG/webp/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-13.00.33_afb8b281f8.webp 1380w",
  srcOriginal: "https://freight.cargo.site/t/original/i/E2842814634058689255996219929283/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-13.00.33.png",
  orientation: "h",
  span: 1,
  tags: ["vjing","visuales","música"],
  title: "Juan Pablo López - Festival de Viña del Mar 2026",
  author: "Carlos Nauto Paez",
  role: "Visualista / Diseñador",
  collab: "Dirección creativa, visuales y operación de visuales junto a María José Tapia.",
  area: "Vjing (visuales) / gráfico / Shows",
  year: "2025",
  url: "https://www.instagram.com/p/DGouSMEu-Dc/?img_index=1"
},

/* ------------------ Palabras marchitas — Aribel González ------------------ */
{
  src: "IMG/webp/DSC_0095_380ec4ff63.webp",
  srcAvif: "IMG/avif/DSC_0095_380ec4ff63.avif",
  srcSetAvif: "IMG/avif/variants/DSC_0095_380ec4ff63-640.avif 640w, IMG/avif/variants/DSC_0095_380ec4ff63-1280.avif 1280w, IMG/avif/DSC_0095_380ec4ff63.avif 2000w",
  srcSetWebp: "IMG/webp/variants/DSC_0095_380ec4ff63-640.webp 640w, IMG/webp/variants/DSC_0095_380ec4ff63-1280.webp 1280w, IMG/webp/DSC_0095_380ec4ff63.webp 2000w",
  srcOriginal: "https://freight.cargo.site/t/original/i/F2842920037112566209814003659459/DSC_0095.jpg",
  orientation: "h",
  span: 1,
  tags: ["editorial"],
  title: "Palabras marchitas",
  author: "Aribel González",
  role: "Diseñadora",
  collab: "Poemas: Simón Pešutic. Proyecto desarrollado desde estudio Otros Pérez.",
  area: "Editorial",
  year: "2023",
  url: "https://ariariari.com/Palabras-Marchitas"
},

/* ------------------ Aguas Andinas — Aribel González ------------------ */
{
  src: "IMG/webp/portadillas-05_5212189198.webp",
  srcAvif: "IMG/avif/portadillas-05_5212189198.avif",
  srcSetAvif: "IMG/avif/variants/portadillas-05_5212189198-640.avif 640w, IMG/avif/variants/portadillas-05_5212189198-1280.avif 1280w, IMG/avif/portadillas-05_5212189198.avif 2000w",
  srcSetWebp: "IMG/webp/variants/portadillas-05_5212189198-640.webp 640w, IMG/webp/variants/portadillas-05_5212189198-1280.webp 1280w, IMG/webp/portadillas-05_5212189198.webp 2000w",
  srcOriginal: "https://freight.cargo.site/t/original/i/W2842920037075672721666584556227/portadillas-05.png",
  orientation: "h",
  span: 1,
  tags: ["infografía"],
  title: "Aguas Andinas",
  author: "Aribel González",
  role: "",
  collab: "Diseño de la memoria anual de Aguas Andinas 2017 y sus filiales. Diseño editorial, infografías e ilustraciones. Proyecto desarrollado desde estudio Otros Pérez.",
  area: "Infografía",
  year: "2018",
  url: "https://ariariari.com/Aguas-Andinas"
},

/* ------------------ INTRÉPIDA ATELIER — Hyemin An ------------------ */
{
  src: "IMG/webp/intrepida_1_c281191f-4945-4cb2-ba82-bd107a8b3f06_acdb2c4d21.webp",
  srcAvif: "IMG/avif/intrepida_1_c281191f-4945-4cb2-ba82-bd107a8b3f06_acdb2c4d21.avif",
  srcSetAvif: "IMG/avif/variants/intrepida_1_c281191f-4945-4cb2-ba82-bd107a8b3f06_acdb2c4d21-640.avif 640w, IMG/avif/intrepida_1_c281191f-4945-4cb2-ba82-bd107a8b3f06_acdb2c4d21.avif 832w",
  srcSetWebp: "IMG/webp/variants/intrepida_1_c281191f-4945-4cb2-ba82-bd107a8b3f06_acdb2c4d21-640.webp 640w, IMG/webp/intrepida_1_c281191f-4945-4cb2-ba82-bd107a8b3f06_acdb2c4d21.webp 832w",
  srcOriginal: "https://freight.cargo.site/t/original/i/M2842920037094119465740294107843/intrepida_1_c281191f-4945-4cb2-ba82-bd107a8b3f06.jpg",
  orientation: "h",
  span: 1,
  tags: ["producto","experiencia"],
  title: "INTRÉPIDA ATELIER",
  author: "Hyemin An",
  role: "Diseñadora / Fundadora",
  collab: "Intrépida Atelier",
  area: "Producto / Experiencia",
  year: "N/A",
  url: "https://intrepidaatelier.com"
},

/* ------------------ Movimiento, vida, huellas / Libro de Artista — Hyemin An ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-16-a-las-13.41.00_7e617e1a82.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-16-a-las-13.41.00_7e617e1a82.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-13.41.00_7e617e1a82-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-13.41.00_7e617e1a82-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-16-a-las-13.41.00_7e617e1a82.avif 2368w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-13.41.00_7e617e1a82-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-13.41.00_7e617e1a82-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-16-a-las-13.41.00_7e617e1a82.webp 2368w",
  srcOriginal: "https://freight.cargo.site/t/original/i/I2842920177953457212586430247619/Captura-de-pantalla-2026-03-16-a-las-13.41.00.png",
  orientation: "h",
  span: 1,
  tags: ["editorial","objeto"],
  title: "Movimiento, vida, huellas / Libro de Artista",
  author: "Hyemin An",
  role: "Diseñadora",
  collab: "",
  area: "Editorial / Objeto",
  year: "2017",
  url: "https://www.behance.net/gallery/57938283/Movimiento-vida-huellas-Libro-de-Artista"
},

/* ------------------ Theragun PRO Plus - By Therabody — Nicolás Robertson ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-16-a-las-13.51.39_c032ca460d.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-16-a-las-13.51.39_c032ca460d.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-13.51.39_c032ca460d-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-13.51.39_c032ca460d-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-16-a-las-13.51.39_c032ca460d.avif 2622w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-13.51.39_c032ca460d-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-13.51.39_c032ca460d-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-16-a-las-13.51.39_c032ca460d.webp 2622w",
  srcOriginal: "https://freight.cargo.site/t/original/i/L2842920177971903956660139799235/Captura-de-pantalla-2026-03-16-a-las-13.51.39.png",
  orientation: "h",
  span: 1,
  tags: ["objeto","producto"],
  title: "Theragun PRO Plus - By Therabody",
  author: "Nicolás Robertson",
  role: "Diseñador",
  collab: "Agency: DNGR | @dngr.ltd. Addt'l CMF: Nicolás Robertson | @nicordf.",
  area: "Objeto / Producto",
  year: "2023",
  url: "https://www.behance.net/gallery/182010403/Theragun-PRO-Plus-By-Therabody"
},

/* ------------------ PHOTOVOLTAIC TRAINING BENCH — Nicolás Robertson ------------------ */
{
  src: "IMG/webp/banco-de-entrenamiento-1_b50276023f.webp",
  srcAvif: "IMG/avif/banco-de-entrenamiento-1_b50276023f.avif",
  srcSetAvif: "IMG/avif/variants/banco-de-entrenamiento-1_b50276023f-640.avif 640w, IMG/avif/variants/banco-de-entrenamiento-1_b50276023f-1280.avif 1280w, IMG/avif/banco-de-entrenamiento-1_b50276023f.avif 1723w",
  srcSetWebp: "IMG/webp/variants/banco-de-entrenamiento-1_b50276023f-640.webp 640w, IMG/webp/variants/banco-de-entrenamiento-1_b50276023f-1280.webp 1280w, IMG/webp/banco-de-entrenamiento-1_b50276023f.webp 1723w",
  srcOriginal: "https://freight.cargo.site/t/original/i/Z2842921988630515255694888219331/banco-de-entrenamiento-1.jpg",
  orientation: "h",
  span: 1,
  tags: ["diseño conceptual"],
  title: "PHOTOVOLTAIC TRAINING BENCH",
  author: "Nicolás Robertson",
  role: "",
  collab: "Cliente: Phineal (in-house project). Servicio: Concept design, 3D modelling y DFM.",
  area: "Diseño conceptual",
  year: "2018",
  url: "https://nicolasrobertson.com/index.php/project/giz-pv-training-module/"
},

/* ------------------ Dominó — Shuting Zhong Xie ------------------ */
{
  src: "IMG/webp/Domino-2-1_07a44d89c2.webp",
  srcAvif: "IMG/avif/Domino-2-1_07a44d89c2.avif",
  srcSetAvif: "IMG/avif/variants/Domino-2-1_07a44d89c2-640.avif 640w, IMG/avif/variants/Domino-2-1_07a44d89c2-1280.avif 1280w, IMG/avif/Domino-2-1_07a44d89c2.avif 1500w",
  srcSetWebp: "IMG/webp/variants/Domino-2-1_07a44d89c2-640.webp 640w, IMG/webp/variants/Domino-2-1_07a44d89c2-1280.webp 1280w, IMG/webp/Domino-2-1_07a44d89c2.webp 1500w",
  srcOriginal: "https://freight.cargo.site/t/original/i/O2842920037057225977592875004611/Domino-2-1.jpg",
  orientation: "h",
  span: 1,
  tags: ["dirección de arte"],
  title: "Dominó",
  author: "Shuting Zhong Xie",
  role: "Diseñadora / Directora de arte",
  collab: "Desarrollado en Sabado Sabado Estudio.",
  area: "Dirección de arte",
  year: "2025",
  url: "https://sabadosabado.com/proyectos/domino/"
},

/* ------------------ Night - Cranberry Mag — Emiliana Montes ------------------ */
{
  src: "IMG/webp/IMG_1511_JPG.jpg_31fbc13729.webp",
  srcAvif: "IMG/avif/IMG_1511_JPG.jpg_31fbc13729.avif",
  srcSetAvif: "IMG/avif/variants/IMG_1511_JPG.jpg_31fbc13729-640.avif 640w, IMG/avif/IMG_1511_JPG.jpg_31fbc13729.avif 1256w",
  srcSetWebp: "IMG/webp/variants/IMG_1511_JPG.jpg_31fbc13729-640.webp 640w, IMG/webp/IMG_1511_JPG.jpg_31fbc13729.webp 1256w",
  srcOriginal: "https://freight.cargo.site/t/original/i/D2842924084069961564657694487235/IMG_1511_JPG.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["estilismo","moda"],
  title: "Night - Cranberry Mag",
  author: "Emiliana Montes",
  role: "Estilista de moda / Diseñadora",
  collab: "Cranberry Chic. Foto: @paolavelasquezdiaz. Asistencia foto: @pepo_fernandez. Styling: @saralavinh.",
  area: "Estilismo / Moda",
  year: "N/A",
  url: "https://www.emilianamontes.com/copia-de-rodrigo-2"
},

/* ------------------ Revista Ya - mariana di girolamo — Emiliana Montes ------------------ */
{
  src: "IMG/webp/RVYA001Y2002.jpg_21fb3023e8.webp",
  srcAvif: "IMG/avif/RVYA001Y2002.jpg_21fb3023e8.avif",
  srcSetAvif: "IMG/avif/variants/RVYA001Y2002.jpg_21fb3023e8-640.avif 640w, IMG/avif/RVYA001Y2002.jpg_21fb3023e8.avif 1256w",
  srcSetWebp: "IMG/webp/variants/RVYA001Y2002.jpg_21fb3023e8-640.webp 640w, IMG/webp/RVYA001Y2002.jpg_21fb3023e8.webp 1256w",
  srcOriginal: "https://freight.cargo.site/t/original/i/O2842924084088408308731404038851/RVYA001Y2002.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["estilismo","moda"],
  title: "Revista Ya - mariana di girolamo",
  author: "Emiliana Montes",
  role: "Estilista de moda / Diseñadora",
  collab: "Revista YA. Foto: @sergio.a.lopez. Styling: @kemilyheart.hills. Asistencia styling: @venvusvenus.",
  area: "Estilismo / Moda",
  year: "2024",
  url: "https://www.emilianamontes.com/copia-de-rodrigo-1"
},

/* ------------------ CANTAR EL OLVIDO — Esteban Millar ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-16-a-las-14.38.40_a000a3e9fd.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-16-a-las-14.38.40_a000a3e9fd.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-14.38.40_a000a3e9fd-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-14.38.40_a000a3e9fd-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-16-a-las-14.38.40_a000a3e9fd.avif 1450w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-14.38.40_a000a3e9fd-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-14.38.40_a000a3e9fd-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-16-a-las-14.38.40_a000a3e9fd.webp 1450w",
  srcOriginal: "https://freight.cargo.site/t/original/i/N2842920177990350700733849350851/Captura-de-pantalla-2026-03-16-a-las-14.38.40.png",
  orientation: "h",
  span: 1,
  tags: ["cover art","dirección de arte","música"],
  title: "CANTAR EL OLVIDO",
  author: "Esteban Millar",
  role: "Diseñador",
  collab: "Diseño, diagramación y dirección de arte: Esteban Millar. Fotografía: Luis Vicente Fresno.",
  area: "Cover art / Dirección de arte / Música",
  year: "2021",
  url: "https://www.linkedin.com/posts/esteban-millar-k_portafolio-2026-brief-activity-7414781774389563392-b6-h?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro"
},

/* ------------------ EMPLEOS VERDES — Esteban Millar ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-16-a-las-14.46.15_68ba28f099.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-16-a-las-14.46.15_68ba28f099.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-14.46.15_68ba28f099-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-14.46.15_68ba28f099-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-16-a-las-14.46.15_68ba28f099.avif 2220w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-14.46.15_68ba28f099-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-14.46.15_68ba28f099-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-16-a-las-14.46.15_68ba28f099.webp 2220w",
  srcOriginal: "https://freight.cargo.site/t/original/i/R2842923341772980038585337459395/Captura-de-pantalla-2026-03-16-a-las-14.46.15.png",
  orientation: "h",
  span: 1,
  tags: ["editorial","dirección creativa"],
  title: "EMPLEOS VERDES",
  author: "Esteban Millar",
  role: "Diseñador",
  collab: "Diseño, diagramación y dirección de arte: Esteban Millar, Joce Quezada. Diseño de información: Esteban Millar. Fotografía: Gregorio Valdés.",
  area: "Editorial / Dirección creativa",
  year: "2023",
  url: "https://www.linkedin.com/posts/esteban-millar-k_portafolio-2026-brief-activity-7414781774389563392-b6-h?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro"
},

/* ------------------ Know Your Tools: Neuroscience and Service Design — Gaspar Jarry ------------------ */
{
  src: "IMG/webp/touchpoint.15-2_ae747d1ba9.webp",
  srcAvif: "IMG/avif/touchpoint.15-2_ae747d1ba9.avif",
  srcSetAvif: "IMG/avif/variants/touchpoint.15-2_ae747d1ba9-640.avif 640w, IMG/avif/touchpoint.15-2_ae747d1ba9.avif 755w",
  srcSetWebp: "IMG/webp/variants/touchpoint.15-2_ae747d1ba9-640.webp 640w, IMG/webp/touchpoint.15-2_ae747d1ba9.webp 755w",
  srcOriginal: "https://freight.cargo.site/t/original/i/U2843099405430519474241067758275/touchpoint.15-2.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Know Your Tools: Neuroscience and Service Design",
  author: "Gaspar Jarry",
  role: "",
  collab: "Autores: Paula Wuth, Gaspar Jarry, Catalina Meza, Andrés Couve.",
  area: "Investigación / Publicación académica",
  year: "2024",
  url: "https://www.logos-verlag.de/cgi-bin/engpapermid?doi=10.30819/touchpoint.15-2.10&lng=deu&id="
},

/* ------------------ Know Your Tools: Neuroscience and Service Design — Catalina Meza ------------------ */
{
  src: "IMG/webp/touchpoint.15-2_ae747d1ba9.webp",
  srcAvif: "IMG/avif/touchpoint.15-2_ae747d1ba9.avif",
  srcSetAvif: "IMG/avif/variants/touchpoint.15-2_ae747d1ba9-640.avif 640w, IMG/avif/touchpoint.15-2_ae747d1ba9.avif 755w",
  srcSetWebp: "IMG/webp/variants/touchpoint.15-2_ae747d1ba9-640.webp 640w, IMG/webp/touchpoint.15-2_ae747d1ba9.webp 755w",
  srcOriginal: "https://freight.cargo.site/t/original/i/U2843099405430519474241067758275/touchpoint.15-2.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Know Your Tools: Neuroscience and Service Design",
  author: "Catalina Meza",
  role: "",
  collab: "Autores: Paula Wuth, Gaspar Jarry, Catalina Meza, Andrés Couve.",
  area: "Investigación / Publicación académica",
  year: "2024",
  url: [
    "https://www.logos-verlag.de/cgi-bin/engpapermid?doi=10.30819/touchpoint.15-2.10&lng=deu&id=",
    "https://www.instagram.com/p/DASD2BmNpsw/?img_index=1"
  ]
},

/* ------------------ Ecualizando futuros — Gaspar Jarry ------------------ */
{
  src: "IMG/webp/1ecd9621-90b1-4c41-89cb-f876083d0e31_rw_1920_3b86ea71ef.webp",
  srcAvif: "IMG/avif/1ecd9621-90b1-4c41-89cb-f876083d0e31_rw_1920_3b86ea71ef.avif",
  srcSetAvif: "IMG/avif/variants/1ecd9621-90b1-4c41-89cb-f876083d0e31_rw_1920_3b86ea71ef-640.avif 640w, IMG/avif/variants/1ecd9621-90b1-4c41-89cb-f876083d0e31_rw_1920_3b86ea71ef-1280.avif 1280w, IMG/avif/1ecd9621-90b1-4c41-89cb-f876083d0e31_rw_1920_3b86ea71ef.avif 1920w",
  srcSetWebp: "IMG/webp/variants/1ecd9621-90b1-4c41-89cb-f876083d0e31_rw_1920_3b86ea71ef-640.webp 640w, IMG/webp/variants/1ecd9621-90b1-4c41-89cb-f876083d0e31_rw_1920_3b86ea71ef-1280.webp 1280w, IMG/webp/1ecd9621-90b1-4c41-89cb-f876083d0e31_rw_1920_3b86ea71ef.webp 1920w",
  srcOriginal: "https://freight.cargo.site/t/original/i/J2843099405412072730167358206659/1ecd9621-90b1-4c41-89cb-f876083d0e31_rw_1920.jpg",
  orientation: "h",
  span: 1,
  tags: ["servicio","cultura","investigación"],
  title: "Ecualizando futuros",
  author: "Gaspar Jarry",
  role: "",
  collab: "Guiatura: Manuela Garretón.",
  area: "Servicio / Cultura / Investigación",
  year: "2023",
  url: "https://gasparjarry.myportfolio.com/ecualizando-futuros"
},

/* ------------------ ¿Dónde viven tus monstruos? — Isidora Silva ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-16-a-las-16.54.59_2f9ac9c9d5.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-16-a-las-16.54.59_2f9ac9c9d5.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-16.54.59_2f9ac9c9d5-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-16.54.59_2f9ac9c9d5-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-16-a-las-16.54.59_2f9ac9c9d5.avif 1658w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-16.54.59_2f9ac9c9d5-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-16.54.59_2f9ac9c9d5-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-16-a-las-16.54.59_2f9ac9c9d5.webp 1658w",
  srcOriginal: "https://freight.cargo.site/t/original/i/W2843102067221902334234527740611/Captura-de-pantalla-2026-03-16-a-las-16.54.59.png",
  orientation: "h",
  span: 1,
  tags: ["editorial","ilustración","infantil"],
  title: "¿Dónde viven tus monstruos?",
  author: "Isidora Silva",
  role: "",
  collab: "",
  area: "Editorial / Ilustración / Infantil",
  year: "2020",
  url: "https://www.behance.net/gallery/110237953/Donde-viven-tus-monstruos"
},

/* ------------------ La naturaleza de la tecnología — Isidora Silva ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-16-a-las-16.56.28_c07d309b9a.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-16-a-las-16.56.28_c07d309b9a.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-16.56.28_c07d309b9a-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-16.56.28_c07d309b9a-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-16-a-las-16.56.28_c07d309b9a.avif 1396w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-16.56.28_c07d309b9a-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-16.56.28_c07d309b9a-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-16-a-las-16.56.28_c07d309b9a.webp 1396w",
  srcOriginal: "https://freight.cargo.site/t/original/i/Q2843102067258795822381946843843/Captura-de-pantalla-2026-03-16-a-las-16.56.28.png",
  orientation: "h",
  span: 1,
  tags: ["editorial","experimental","digital"],
  title: "La naturaleza de la tecnología",
  author: "Isidora Silva",
  role: "",
  collab: "Por Isidora Silva y Antonia Van de Wyngard - 2021.",
  area: "Editorial / Experimental / Digital",
  year: "2021",
  url: "https://www.behance.net/gallery/168081973/La-naturaleza-de-la-tecnologia-Publicacion-Digital"
},

/* ------------------ Aurora Botánica — Javiera Palma ------------------ */
{
  src: "IMG/webp/IMG_5697.jpg_6ccb8d34c6.webp",
  srcAvif: "IMG/avif/IMG_5697.jpg_6ccb8d34c6.avif",
  srcSetAvif: "IMG/avif/variants/IMG_5697.jpg_6ccb8d34c6-640.avif 640w, IMG/avif/IMG_5697.jpg_6ccb8d34c6.avif 1070w",
  srcSetWebp: "IMG/webp/variants/IMG_5697.jpg_6ccb8d34c6-640.webp 640w, IMG/webp/IMG_5697.jpg_6ccb8d34c6.webp 1070w",
  srcOriginal: "https://freight.cargo.site/t/original/i/L2843099748337045060427922748099/IMG_5697.jpg.jpg",
  orientation: "h",
  span: 1,
  tags: ["ecología","producto","innovación"],
  title: "Aurora Botánica",
  author: "Javiera Palma",
  role: "Diseñadora / Fundadora",
  collab: "",
  area: "Ecología / Producto / Innovación",
  year: "2021",
  url: [
    "https://aurorabotanica.cl",
    "https://www.instagram.com/aurorabotanica.cl"
  ]
},

{
  src: "IMG/webp/461857978_1514275622555722_4416919289787104457_n_d94fa7f434.webp",
  srcAvif: "IMG/avif/461857978_1514275622555722_4416919289787104457_n_d94fa7f434.avif",
  srcSetAvif: "IMG/avif/variants/461857978_1514275622555722_4416919289787104457_n_d94fa7f434-640.avif 640w, IMG/avif/461857978_1514275622555722_4416919289787104457_n_d94fa7f434.avif 1080w",
  srcSetWebp: "IMG/webp/variants/461857978_1514275622555722_4416919289787104457_n_d94fa7f434-640.webp 640w, IMG/webp/461857978_1514275622555722_4416919289787104457_n_d94fa7f434.webp 1080w",
  srcOriginal: "https://freight.cargo.site/t/original/i/F2843129278512147553184274395843/461857978_1514275622555722_4416919289787104457_n.jpg",
  orientation: "h",
  span: 1,
  tags: ["gráfico","editorial","branding"],
  title: "Otros Pérez",
  author: "Catalina Pérez",
  role: "Diseñadora / Fundadora",
  collab: "",
  area: "Estudio / Branding",
  year: "N/A",
  url: [
    "http://otrosperez.com",
    "https://www.instagram.com/otrosperez/"
  ]
},
/* ------------------ Emotional Patches — Felipe Orellana Fuentealba ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.27.15_651b1dbeb5.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.27.15_651b1dbeb5.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.27.15_651b1dbeb5-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.27.15_651b1dbeb5-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.27.15_651b1dbeb5.avif 1420w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.27.15_651b1dbeb5-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.27.15_651b1dbeb5-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.27.15_651b1dbeb5.webp 1420w",
  srcOriginal: "https://freight.cargo.site/t/original/i/A2854371739087610904627789640387/Captura-de-pantalla-2026-03-23-a-las-16.27.15.png",
  orientation: "h",
  span: 1,
  tags: ["moda", "fotografía"],
  title: "Emotional Patches",
  author: "Felipe Orellana Fuentealba",
  role: "",
  collab: "Team: @felipeorellanaf, @vallechi_, @tony_evan. Talents: @joana__nobre, @paquetenojai, @pedronuno_, @bellabellux, @4getmenot__, @thempresents, @leandroreitz.",
  area: "Moda / Fotografía",
  year: "2023",
  url: "https://www.dazeddigital.com/art-photography/article/59888/1/felipe-orellana-these-photos-disclose-their-subjects-most-traumatic-secrets"
},

/* ------------------ Prints — Renata Scanavini Grazioli ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.31.27_89edb74ff0.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.31.27_89edb74ff0.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.31.27_89edb74ff0-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.31.27_89edb74ff0-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.31.27_89edb74ff0.avif 1666w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.31.27_89edb74ff0-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.31.27_89edb74ff0-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.31.27_89edb74ff0.webp 1666w",
  srcOriginal: "https://freight.cargo.site/t/original/i/T2854371739327418577586013811395/Captura-de-pantalla-2026-03-23-a-las-16.31.27.png",
  orientation: "h",
  span: 1,
  tags: ["ilustración"],
  title: "Prints",
  author: "Renata Scanavini Grazioli",
  role: "",
  collab: "",
  area: "Ilustración",
  year: "n/a",
  url: "https://www.renatascanavini.com/copia-de-amazonia-swimwear-1"
},

/* ------------------ Diseñadora Deco Hogar, Menaje — Renata Scanavini Grazioli ------------------ */
{
  src: "IMG/webp/paris-menaje-02.jpg_919d87a38b.webp",
  srcAvif: "IMG/avif/paris-menaje-02.jpg_919d87a38b.avif",
  srcSetAvif: "IMG/avif/variants/paris-menaje-02.jpg_919d87a38b-640.avif 640w, IMG/avif/paris-menaje-02.jpg_919d87a38b.avif 940w",
  srcSetWebp: "IMG/webp/variants/paris-menaje-02.jpg_919d87a38b-640.webp 640w, IMG/webp/paris-menaje-02.jpg_919d87a38b.webp 940w",
  srcOriginal: "https://freight.cargo.site/t/original/i/T2854371395959724389556420031171/paris-menaje-02.jpg.jpg",
  orientation: "h",
  span: 1,
  tags: ["producto", "ilustración"],
  title: "Diseñadora Deco Hogar, Menaje",
  author: "Renata Scanavini Grazioli",
  role: "",
  collab: "Marcas Alaniz Home, Sarah Miller, Attimo y Umbrale en Paris Cencosud Retail S.A.",
  area: "Producto / Ilustración",
  year: "2020",
  url: "https://www.renatascanavini.com/copia-de-amazonia-swimwear"
},

/* ------------------ ConservationReserves.org – Explora — Magdalena Aboitiz ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.39.31_ad1a44a936.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.39.31_ad1a44a936.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.39.31_ad1a44a936-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.39.31_ad1a44a936-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.39.31_ad1a44a936.avif 3416w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.39.31_ad1a44a936-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.39.31_ad1a44a936-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.39.31_ad1a44a936.webp 3416w",
  srcOriginal: "https://freight.cargo.site/t/original/i/D2854371739308971833512304259779/Captura-de-pantalla-2026-03-23-a-las-16.39.31.png",
  orientation: "h",
  span: 1,
  tags: ["web", "ux ui"],
  title: "ConservationReserves.org – Explora",
  author: "Magdalena Aboitiz",
  role: "",
  collab: "",
  area: "Web / UX UI",
  year: "2025",
  url: "https://www.behance.net/gallery/227399221/Diseno-web-para-ConservationReservesorg-Explora"
},

/* ------------------ Anillo Palmerae — Magdalena Aboitiz ------------------ */
{
  src: "IMG/webp/Anillopalmeraemaialen.jpg_e6cba622cb.webp",
  srcAvif: "IMG/avif/Anillopalmeraemaialen.jpg_e6cba622cb.avif",
  srcSetAvif: "IMG/avif/variants/Anillopalmeraemaialen.jpg_e6cba622cb-640.avif 640w, IMG/avif/Anillopalmeraemaialen.jpg_e6cba622cb.avif 700w",
  srcSetWebp: "IMG/webp/variants/Anillopalmeraemaialen.jpg_e6cba622cb-640.webp 640w, IMG/webp/Anillopalmeraemaialen.jpg_e6cba622cb.webp 700w",
  srcOriginal: "https://freight.cargo.site/t/original/i/W2854371395849043925114162721475/Anillopalmeraemaialen.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["artesanía", "orfebre"],
  title: "Anillo Palmerae",
  author: "Magdalena Aboitiz",
  role: "",
  collab: "",
  area: "Artesanía / Orfebre",
  year: "n/a",
  url: "https://sagara.cl/products/anillo-palmerae"
},

/* ------------------ Living Bajamar — Maria Jesus Arestizabal ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.46.04_c94e86855d.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.46.04_c94e86855d.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.46.04_c94e86855d-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.46.04_c94e86855d-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.46.04_c94e86855d.avif 1848w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.46.04_c94e86855d-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.46.04_c94e86855d-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.46.04_c94e86855d.webp 1848w",
  srcOriginal: "https://freight.cargo.site/t/original/i/F2854371739290525089438594708163/Captura-de-pantalla-2026-03-23-a-las-16.46.04.png",
  orientation: "h",
  span: 1,
  tags: ["diseño interior", "estudio"],
  title: "Living Bajamar",
  author: "Maria Jesus Arestizabal",
  role: "",
  collab: "",
  area: "Diseño interior / Estudio",
  year: "n/a",
  url: "https://www.jainteriorismo.cl/living-bajamar.html"
},

/* ------------------ Quincho Pinares — Maria Jesus Arestizabal ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.47.30_3e56a38db8.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.47.30_3e56a38db8.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.47.30_3e56a38db8-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.47.30_3e56a38db8-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.47.30_3e56a38db8.avif 1944w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.47.30_3e56a38db8-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.47.30_3e56a38db8-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.47.30_3e56a38db8.webp 1944w",
  srcOriginal: "https://freight.cargo.site/t/original/i/G2854371739272078345364885156547/Captura-de-pantalla-2026-03-23-a-las-16.47.30.png",
  orientation: "h",
  span: 1,
  tags: ["diseño interior", "estudio"],
  title: "Quincho Pinares",
  author: "Maria Jesus Arestizabal",
  role: "",
  collab: "",
  area: "Diseño interior / Estudio",
  year: "n/a",
  url: "https://www.jainteriorismo.cl/quincho-pinares.html"
},

/* ------------------ Living Bosques de Montemar — Maria Jesus Arestizabal ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.48.18_2a81c13221.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.48.18_2a81c13221.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.48.18_2a81c13221-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-16.48.18_2a81c13221-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-16.48.18_2a81c13221.avif 1944w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.48.18_2a81c13221-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-16.48.18_2a81c13221-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-16.48.18_2a81c13221.webp 1944w",
  srcOriginal: "https://freight.cargo.site/t/original/i/T2854371739253631601291175604931/Captura-de-pantalla-2026-03-23-a-las-16.48.18.png",
  orientation: "h",
  span: 1,
  tags: ["diseño interior", "estudio"],
  title: "Living Bosques de Montemar",
  author: "Maria Jesus Arestizabal",
  role: "",
  collab: "",
  area: "Diseño interior / Estudio",
  year: "n/a",
  url: "https://www.jainteriorismo.cl/living-bosques.html"
},

/* ------------------ Pantalón Sintra Vichy — María Jesús Correa Ortúzar ------------------ */
{
  src: "IMG/webp/maco_BM_99_046a333d-1298-4d88-af26-7ab27a30b0d6.jpg_aac4e4d6de.webp",
  srcAvif: "IMG/avif/maco_BM_99_046a333d-1298-4d88-af26-7ab27a30b0d6.jpg_aac4e4d6de.avif",
  srcSetAvif: "IMG/avif/variants/maco_BM_99_046a333d-1298-4d88-af26-7ab27a30b0d6.jpg_aac4e4d6de-640.avif 640w, IMG/avif/variants/maco_BM_99_046a333d-1298-4d88-af26-7ab27a30b0d6.jpg_aac4e4d6de-1280.avif 1280w, IMG/avif/maco_BM_99_046a333d-1298-4d88-af26-7ab27a30b0d6.jpg_aac4e4d6de.avif 2784w",
  srcSetWebp: "IMG/webp/variants/maco_BM_99_046a333d-1298-4d88-af26-7ab27a30b0d6.jpg_aac4e4d6de-640.webp 640w, IMG/webp/variants/maco_BM_99_046a333d-1298-4d88-af26-7ab27a30b0d6.jpg_aac4e4d6de-1280.webp 1280w, IMG/webp/maco_BM_99_046a333d-1298-4d88-af26-7ab27a30b0d6.jpg_aac4e4d6de.webp 2784w",
  srcOriginal: "https://freight.cargo.site/t/original/i/N2854371395904384157335291376323/maco_BM_99_046a333d-1298-4d88-af26-7ab27a30b0d6.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["moda", "textil", "indumentaria"],
  title: "Pantalón Sintra Vichy",
  author: "María Jesús Correa Ortúzar",
  role: "",
  collab: "",
  area: "Moda / Textil / Indumentaria",
  year: "n/a",
  url: "https://macodesign.cl/collections/pantalones/products/pantalon-sintra-vichy"
},

/* ------------------ SERENGETI — Gracia Covarrubias Prieto ------------------ */
{
  src: "IMG/webp/0b5183_f152a57dbd2f4a9f90a98ce6cc9f1483_mv2.jpg_ad887a69d0.webp",
  srcAvif: "IMG/avif/0b5183_f152a57dbd2f4a9f90a98ce6cc9f1483_mv2.jpg_ad887a69d0.avif",
  srcSetAvif: "IMG/avif/variants/0b5183_f152a57dbd2f4a9f90a98ce6cc9f1483_mv2.jpg_ad887a69d0-640.avif 640w, IMG/avif/0b5183_f152a57dbd2f4a9f90a98ce6cc9f1483_mv2.jpg_ad887a69d0.avif 976w",
  srcSetWebp: "IMG/webp/variants/0b5183_f152a57dbd2f4a9f90a98ce6cc9f1483_mv2.jpg_ad887a69d0-640.webp 640w, IMG/webp/0b5183_f152a57dbd2f4a9f90a98ce6cc9f1483_mv2.jpg_ad887a69d0.webp 976w",
  srcOriginal: "https://freight.cargo.site/t/original/i/I2854371395941277645482710479555/0b5183_f152a57dbd2f4a9f90a98ce6cc9f1483_mv2.jpg.jpg",
  orientation: "h",
  span: 1,
  tags: ["juego de mesa", "producto"],
  title: "SERENGETI",
  author: "Gracia Covarrubias Prieto",
  role: "",
  collab: "Game created by Teresita Irarrázaval and Agustin Gómez in Santiago, Chile",
  area: "Juego de mesa / Producto",
  year: "2020",
  url: "https://www.graciacovarrubias.com/serengueti"
},

/* ------------------ camino del ayuntamiento — Andrea Krauss ------------------ */
{
  src: "IMG/webp/e705e0_2514d333a77c4522beb53ac4182aca30_mv2.jpg_fd2e2e4807.webp",
  srcAvif: "IMG/avif/e705e0_2514d333a77c4522beb53ac4182aca30_mv2.jpg_fd2e2e4807.avif",
  srcSetAvif: "IMG/avif/variants/e705e0_2514d333a77c4522beb53ac4182aca30_mv2.jpg_fd2e2e4807-640.avif 640w, IMG/avif/variants/e705e0_2514d333a77c4522beb53ac4182aca30_mv2.jpg_fd2e2e4807-1280.avif 1280w, IMG/avif/e705e0_2514d333a77c4522beb53ac4182aca30_mv2.jpg_fd2e2e4807.avif 3456w",
  srcSetWebp: "IMG/webp/variants/e705e0_2514d333a77c4522beb53ac4182aca30_mv2.jpg_fd2e2e4807-640.webp 640w, IMG/webp/variants/e705e0_2514d333a77c4522beb53ac4182aca30_mv2.jpg_fd2e2e4807-1280.webp 1280w, IMG/webp/e705e0_2514d333a77c4522beb53ac4182aca30_mv2.jpg_fd2e2e4807.webp 3456w",
  srcOriginal: "https://freight.cargo.site/t/original/i/S2854371395922830901409000927939/e705e0_2514d333a77c4522beb53ac4182aca30_mv2.jpg.jpg",
  orientation: "h",
  span: 1,
  tags: ["diseño interior", "estudio"],
  title: "camino del ayuntamiento",
  author: "Andrea Krauss",
  role: "Diseñadora / Fundadora",
  collab: "Desarrollado en Krauss Studio",
  area: "Diseño interior / Estudio",
  year: "n/a",
  url: "https://www.studiokrauss.com/caminodelayuntamiento"
},

/* ------------------ Dormitorio | Brabanzón — Andrea Krauss ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-17.04.32_eb5dec9cbf.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-17.04.32_eb5dec9cbf.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-17.04.32_eb5dec9cbf-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-17.04.32_eb5dec9cbf-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-17.04.32_eb5dec9cbf.avif 1646w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-17.04.32_eb5dec9cbf-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-17.04.32_eb5dec9cbf-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-17.04.32_eb5dec9cbf.webp 1646w",
  srcOriginal: "https://freight.cargo.site/t/original/i/J2854371739235184857217466053315/Captura-de-pantalla-2026-03-23-a-las-17.04.32.png",
  orientation: "sq",
  span: 1,
  tags: ["diseño interior", "estudio"],
  title: "Dormitorio | Brabanzón",
  author: "Andrea Krauss",
  role: "Diseñadora / Fundadora",
  collab: "Desarrollado en Krauss Studio",
  area: "Diseño interior / Estudio",
  year: "2026",
  url: "https://www.instagram.com/p/DWM6a8qkVKF/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
},

/* ------------------ LIVING | PIEDRA ROJA — Andrea Krauss ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-17.05.33_b0aac19aa2.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-17.05.33_b0aac19aa2.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-17.05.33_b0aac19aa2-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-17.05.33_b0aac19aa2-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-17.05.33_b0aac19aa2.avif 1510w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-17.05.33_b0aac19aa2-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-17.05.33_b0aac19aa2-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-17.05.33_b0aac19aa2.webp 1510w",
  srcOriginal: "https://freight.cargo.site/t/original/i/Y2854371739216738113143756501699/Captura-de-pantalla-2026-03-23-a-las-17.05.33.png",
  orientation: "h",
  span: 1,
  tags: ["diseño interior", "estudio"],
  title: "LIVING | PIEDRA ROJA",
  author: "Andrea Krauss",
  role: "Diseñadora / Fundadora",
  collab: "Desarrollado en Krauss Studio",
  area: "Diseño interior / Estudio",
  year: "2026",
  url: "https://www.instagram.com/p/DVW5TTPES-n/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
},

/* ------------------ Publicidad en Aeropuerto de Santiago — Catalina Lagos ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-17.11.37_173e8eca1a.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-17.11.37_173e8eca1a.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-17.11.37_173e8eca1a-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-17.11.37_173e8eca1a.avif 948w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-17.11.37_173e8eca1a-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-17.11.37_173e8eca1a.webp 948w",
  srcOriginal: "https://freight.cargo.site/t/original/i/D2854371739198291369070046950083/Captura-de-pantalla-2026-03-23-a-las-17.11.37.png",
  orientation: "h",
  span: 1,
  tags: ["diseño gráfico"],
  title: "Publicidad en Aeropuerto de Santiago",
  author: "Catalina Lagos",
  role: "",
  collab: "CLIENTE: Nuevo Capital",
  area: "Diseño gráfico",
  year: "2019",
  url: "https://www.cslagos.cl/portfolio-1/publicidad-en-aeropuerto-de-santiago"
},

/* ------------------ Bikini Bottom Cala Bordo — Magdalena Maiz Hohlberg ------------------ */
{
  src: "IMG/webp/Captura_de_Pantalla_2025-11-07_a_la_s_16.47.08.png_fddeaff69f.webp",
  srcAvif: "IMG/avif/Captura_de_Pantalla_2025-11-07_a_la_s_16.47.08.png_fddeaff69f.avif",
  srcSetAvif: "IMG/avif/variants/Captura_de_Pantalla_2025-11-07_a_la_s_16.47.08.png_fddeaff69f-640.avif 640w, IMG/avif/Captura_de_Pantalla_2025-11-07_a_la_s_16.47.08.png_fddeaff69f.avif 982w",
  srcSetWebp: "IMG/webp/variants/Captura_de_Pantalla_2025-11-07_a_la_s_16.47.08.png_fddeaff69f-640.webp 640w, IMG/webp/Captura_de_Pantalla_2025-11-07_a_la_s_16.47.08.png_fddeaff69f.webp 982w",
  srcOriginal: "https://freight.cargo.site/t/original/i/I2854371395867490669187872273091/Captura_de_Pantalla_2025-11-07_a_la_s_16.47.08.png.jpg",
  orientation: "v",
  span: 1,
  tags: ["moda", "textil", "indumentaria"],
  title: "Bikini Bottom Cala Bordo",
  author: "Magdalena Maiz Hohlberg",
  role: "Diseñadora / Fundadora",
  collab: "Desarrollado en MARÊ.",
  area: "Moda / Textil / Indumentaria",
  year: "2021",
  url: "https://mare.cl/products/bikini-bottom-cala-bordo"
},

/* ------------------ Raffia Bag Palma Cacao Brown — Magdalena Maiz Hohlberg ------------------ */
{
  src: "IMG/webp/WhatsApp_Image_2026-01-16_at_8.27.09_PM_1_95a129074d.webp",
  srcAvif: "IMG/avif/WhatsApp_Image_2026-01-16_at_8.27.09_PM_1_95a129074d.avif",
  srcSetAvif: "IMG/avif/variants/WhatsApp_Image_2026-01-16_at_8.27.09_PM_1_95a129074d-640.avif 640w, IMG/avif/WhatsApp_Image_2026-01-16_at_8.27.09_PM_1_95a129074d.avif 720w",
  srcSetWebp: "IMG/webp/variants/WhatsApp_Image_2026-01-16_at_8.27.09_PM_1_95a129074d-640.webp 640w, IMG/webp/WhatsApp_Image_2026-01-16_at_8.27.09_PM_1_95a129074d.webp 720w",
  srcOriginal: "https://freight.cargo.site/t/original/i/I2854370133040284871179387744963/WhatsApp_Image_2026-01-16_at_8.27.09_PM_1.jpg",
  orientation: "v",
  span: 1,
  tags: ["moda", "textil", "indumentaria"],
  title: "Raffia Bag Palma Cacao Brown",
  author: "Magdalena Maiz Hohlberg",
  role: "Diseñadora / Fundadora",
  collab: "Desarrollado en MARÊ.",
  area: "Moda / Textil / Indumentaria",
  year: "n/a",
  url: "https://mare.cl/products/raffia-bag-palma-cacao-brown"
},

/* ------------------ Peto Crop Top Terracota Rib — Magdalena Maiz Hohlberg ------------------ */
{
  src: "IMG/webp/Peto-deportivo-mujer-naranjo.jpg_ec46e3ebda.webp",
  srcAvif: "IMG/avif/Peto-deportivo-mujer-naranjo.jpg_ec46e3ebda.avif",
  srcSetAvif: "IMG/avif/variants/Peto-deportivo-mujer-naranjo.jpg_ec46e3ebda-640.avif 640w, IMG/avif/Peto-deportivo-mujer-naranjo.jpg_ec46e3ebda.avif 1049w",
  srcSetWebp: "IMG/webp/variants/Peto-deportivo-mujer-naranjo.jpg_ec46e3ebda-640.webp 640w, IMG/webp/Peto-deportivo-mujer-naranjo.jpg_ec46e3ebda.webp 1049w",
  srcOriginal: "https://freight.cargo.site/t/original/i/U2854371395885937413261581824707/Peto-deportivo-mujer-naranjo.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["moda", "textil", "indumentaria"],
  title: "Peto Crop Top Terracota Rib",
  author: "Magdalena Maiz Hohlberg",
  role: "Diseñadora / Fundadora",
  collab: "Desarrollado en MARÊ.",
  area: "Moda / Textil / Indumentaria",
  year: "n/a",
  url: "https://mare.cl/products/peto-crop-top-terracora-rib"
},

/* ------------------ Mobiliario Escenográfico — José Miguel Pumpin ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-17.27.29_38be57961b.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-17.27.29_38be57961b.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-17.27.29_38be57961b-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-17.27.29_38be57961b.avif 1240w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-17.27.29_38be57961b-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-17.27.29_38be57961b.webp 1240w",
  srcOriginal: "https://freight.cargo.site/t/original/i/L2854371739179844624996337398467/Captura-de-pantalla-2026-03-23-a-las-17.27.29.png",
  orientation: "v",
  span: 1,
  tags: ["mobiliario", "teatro"],
  title: "Mobiliario Escenográfico",
  author: "José Miguel Pumpin",
  role: "",
  collab: "Mobiliario diseñado y construido para escenografía de la obra \"Bodas de Sangre\" de la Escuela de Teatro UC",
  area: "Mobiliario / Teatro",
  year: "2021",
  url: "https://www.behance.net/gallery/115804405/Mobiliaro-escenografico"
},

/* ------------------ The Umbrella Academy en Netflix Chile — Javiera Valiente ------------------ */
{
  src: "IMG/webp/4_KlausyReggietw_800_13c306464c.webp",
  srcAvif: "IMG/avif/4_KlausyReggietw_800_13c306464c.avif",
  srcSetAvif: "IMG/avif/variants/4_KlausyReggietw_800_13c306464c-640.avif 640w, IMG/avif/4_KlausyReggietw_800_13c306464c.avif 800w",
  srcSetWebp: "IMG/webp/variants/4_KlausyReggietw_800_13c306464c-640.webp 640w, IMG/webp/4_KlausyReggietw_800_13c306464c.webp 800w",
  srcOriginal: "https://freight.cargo.site/t/original/i/H2854370133021838127105678193347/4_KlausyReggietw_800.jpg",
  orientation: "sq",
  span: 1,
  tags: ["ilustración"],
  title: "The Umbrella Academy en Netflix Chile",
  author: "Javiera Valiente",
  role: "",
  collab: "Netflix Chile",
  area: "Ilustración",
  year: "2022",
  url: "https://cargocollective.com/javieravaliente/The-Umbrella-Academy-Ilustraciones-para-Netflix-Chile"
},

/* ------------------ Días Nublados - Novela Gráfica — Javiera Valiente ------------------ */
{
  src: "IMG/webp/7e2db477036851.5c7c482df3229_1200_f1761c0c48.webp",
  srcAvif: "IMG/avif/7e2db477036851.5c7c482df3229_1200_f1761c0c48.avif",
  srcSetAvif: "IMG/avif/variants/7e2db477036851.5c7c482df3229_1200_f1761c0c48-640.avif 640w, IMG/avif/7e2db477036851.5c7c482df3229_1200_f1761c0c48.avif 1200w",
  srcSetWebp: "IMG/webp/variants/7e2db477036851.5c7c482df3229_1200_f1761c0c48-640.webp 640w, IMG/webp/7e2db477036851.5c7c482df3229_1200_f1761c0c48.webp 1200w",
  srcOriginal: "https://freight.cargo.site/t/original/i/Y2854370133003391383031968641731/7e2db477036851.5c7c482df3229_1200.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración"],
  title: "Días Nublados - Novela Gráfica",
  author: "Javiera Valiente",
  role: "",
  collab: "",
  area: "Ilustración",
  year: "2018",
  url: "https://cargocollective.com/javieravaliente/Dias-Nublados-Novela-Grafica"
},

/* ------------------ PETRA Y EL SOL — Javiera Valiente ------------------ */
{
  src: "IMG/webp/process_1000_b838a4dea2.webp",
  srcAvif: "IMG/avif/process_1000_b838a4dea2.avif",
  srcSetAvif: "IMG/avif/variants/process_1000_b838a4dea2-640.avif 640w, IMG/avif/process_1000_b838a4dea2.avif 1000w",
  srcSetWebp: "IMG/webp/variants/process_1000_b838a4dea2-640.webp 640w, IMG/webp/process_1000_b838a4dea2.webp 1000w",
  srcOriginal: "https://freight.cargo.site/t/original/i/A2854370132984944638958259090115/process_1000.png",
  orientation: "h",
  span: 1,
  tags: ["animación", "stop motion"],
  title: "PETRA Y EL SOL",
  author: "Javiera Valiente",
  role: "",
  collab: "Dirección: Stefania Malacchini y Malu Furche. Dirección de Arte: Antonia Piña. Construcción de set y props: Carla Calzadillas, Mercedes Castillo, Paula Baccelliere. Dirección de Fotografía: Paula Ramírez. Animador Stop Motion: Kike Ortega. Asistente de Dirección: Gabriela Villalobos. Vestuario: Andrea Arancibia, Elio Vallejos, Mota. Asistente de Arte: Javiera Valiente. Fabricación moldes cabezas: Milodón Estudio.",
  area: "Animación / Stop motion",
  year: "2023",
  url: "https://cargocollective.com/javieravaliente/filter/development/Petra-y-el-Sol-Asistencia-de-Arte-Stop-Motion"
},

/* ------------------ Sucursal Volvo — Tamara Schwarz Appelt ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-18.54.11_d8da3a4788.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-18.54.11_d8da3a4788.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-18.54.11_d8da3a4788-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-18.54.11_d8da3a4788-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-18.54.11_d8da3a4788.avif 1828w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-18.54.11_d8da3a4788-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-18.54.11_d8da3a4788-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-18.54.11_d8da3a4788.webp 1828w",
  srcOriginal: "https://freight.cargo.site/t/original/i/O2854371739161397880922627846851/Captura-de-pantalla-2026-03-23-a-las-18.54.11.png",
  orientation: "h",
  span: 1,
  tags: ["diseño interior", "estudio"],
  title: "Sucursal Volvo",
  author: "Tamara Schwarz Appelt",
  role: "",
  collab: "Directora de Diseño en Schwarz-Haus. Arquitecto: Siente Cinco. Fotografía: Equipo SH, Siente Cinco.",
  area: "Diseño interior / Estudio",
  year: "n/a",
  url: "https://schwarzhaus.cl/pages/sucursales-volvo"
},

/* ------------------ Elaboración de un simulador de trauma torácico a partir de un torso cadavérico utilizando tecnología de imágenes digitales e impresión 3D — Sebastian Spoerer ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-18.58.50_d5ebc542b8.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-18.58.50_d5ebc542b8.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-18.58.50_d5ebc542b8-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-18.58.50_d5ebc542b8.avif 1194w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-18.58.50_d5ebc542b8-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-18.58.50_d5ebc542b8.webp 1194w",
  srcOriginal: "https://freight.cargo.site/t/original/i/E2854371739142951136848918295235/Captura-de-pantalla-2026-03-23-a-las-18.58.50.png",
  orientation: "v",
  span: 1,
  tags: ["investigación", "publicación académica"],
  title: "Elaboración de un simulador de trauma torácico a partir de un torso cadavérico utilizando tecnología de imágenes digitales e impresión 3D",
  author: "Sebastian Spoerer",
  role: "",
  collab: "",
  area: "Investigación / Publicación académica",
  year: "2021",
  url: "https://www.researchgate.net/profile/Sebastian_Spoerer"
},

/* ------------------ Web Design - KE-ZU Furniture — Maria Jesus Sotoluque ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-19.00.22_a09a870abc.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-19.00.22_a09a870abc.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-19.00.22_a09a870abc-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-19.00.22_a09a870abc-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-19.00.22_a09a870abc.avif 2080w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-19.00.22_a09a870abc-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-19.00.22_a09a870abc-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-19.00.22_a09a870abc.webp 2080w",
  srcOriginal: "https://freight.cargo.site/t/original/i/F2854371739124504392775208743619/Captura-de-pantalla-2026-03-23-a-las-19.00.22.png",
  orientation: "h",
  span: 1,
  tags: ["web", "ux ui"],
  title: "Web Design - KE-ZU Furniture",
  author: "Maria Jesus Sotoluque",
  role: "",
  collab: "",
  area: "Web / UX UI",
  year: "2025",
  url: "https://www.behance.net/gallery/222464357/Web-Design-KE-ZU-Furniture"
},

/* ------------------ “Poner en valor a los objetos”, en: Diseña, 9 (2015): 190-191 — Lilian Calderón ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-23-a-las-19.06.03_d3bd1798dc.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-23-a-las-19.06.03_d3bd1798dc.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-19.06.03_d3bd1798dc-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-23-a-las-19.06.03_d3bd1798dc-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-23-a-las-19.06.03_d3bd1798dc.avif 1534w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-19.06.03_d3bd1798dc-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-23-a-las-19.06.03_d3bd1798dc-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-23-a-las-19.06.03_d3bd1798dc.webp 1534w",
  srcOriginal: "https://freight.cargo.site/t/original/i/A2854371739106057648701499192003/Captura-de-pantalla-2026-03-23-a-las-19.06.03.png",
  orientation: "v",
  span: 1,
  tags: ["investigación", "publicación académica"],
  title: "“Poner en valor a los objetos”, en: Diseña, 9 (2015): 190-191",
  author: "Lilian Calderón",
  role: "Colaboración en publicación junto a Nicole Cristi y Hugo Palmarola",
  collab: "",
  area: "Investigación / Publicación académica",
  year: "2015",
  url: "https://www.linkedin.com/in/lilian-calderon-aguirre-b3371814b/overlay/1607973714450/single-media-viewer/?type=DOCUMENT&profileId=ACoAACQ8UVcBMG3tdkfLOMXUc70s1j93g7UGL10"
},

/* ------------------ Un origen desconocido del diseño industrial — Lilian Calderón ------------------ */
{
  src: "IMG/webp/1755358947622_bfc8129ff8.webp",
  srcAvif: "IMG/avif/1755358947622_bfc8129ff8.avif",
  srcSetAvif: "IMG/avif/variants/1755358947622_bfc8129ff8-640.avif 640w, IMG/avif/1755358947622_bfc8129ff8.avif 800w",
  srcSetWebp: "IMG/webp/variants/1755358947622_bfc8129ff8-640.webp 640w, IMG/webp/1755358947622_bfc8129ff8.webp 800w",
  srcOriginal: "https://freight.cargo.site/t/original/i/S2854370132966497894884549538499/1755358947622.jpeg",
  orientation: "v",
  span: 1,
  tags: ["investigación", "publicación académica"],
  title: "Un origen desconocido del diseño industrial",
  author: "Lilian Calderón",
  role: "Investigadora / Diseñadora",
  collab: "Colaboración en conjunto a Federico Monroy",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://foroalfa.org/articulos/un-origen-desconocido-del-diseno-industrial"
},

/* ------------------ Línea de Ensamble — Vicente Múñoz ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/J2855459556498358408483271291587/Captura-de-pantalla-2026-03-24-a-las-11.32.45.png",
  orientation: "h",
  span: 1,
  tags: ["web", "investigación", "diseño industrial"],
  title: "Línea de Ensamble",
  author: "Vicente Múñoz",
  role: "Profesor Guía: Nicolás Morales",
  collab: "",
  area: "Web / Investigación / Diseño Industrial",
  year: "2025",
  url: "https://chilean-design-chronicles.lovable.app/"
},

/* ------------------ La fête de la vie — Rosario Balmaceda Espinosa ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/A2856199837158523504017759744707/1774382425609.jpeg",
  orientation: "h",
  span: 1,
  tags: ["diseño gráfico", "producto"],
  title: "La fête de la vie",
  author: "Rosario Balmaceda Espinosa",
  role: "Desarrollado en La Fête Chocolat Chile",
  collab: "",
  area: "Diseño gráfico / Producto",
  year: "2026",
  url: "https://www.linkedin.com/posts/rosariobe_campa%C3%B1a-pascua-de-resurrecci%C3%B3n-la-f%C3%AAte-activity-7442299314976112640-xQu0?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro"
},

/* ------------------ La Fête de L'Amour — Rosario Balmaceda Espinosa ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/G2856199837195416992165178847939/1769178432698.jpeg",
  orientation: "h",
  span: 1,
  tags: ["diseño gráfico", "producto"],
  title: "La Fête de L'Amour",
  author: "Rosario Balmaceda Espinosa",
  role: "Desarrollado en La Fête Chocolat Chile",
  collab: "",
  area: "Diseño gráfico / Producto",
  year: "2026",
  url: "https://www.linkedin.com/posts/angeles-alvarez-casta%C3%B1o-b289311b9_campa%C3%B1a-la-f%C3%AAte-de-lamour-muy-emocionada-ugcPost-7420472189377826816-wATc?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro"
},

/* ------------------ EL SOL IMPLORA (Video Oficial) — Juan Pablo Bustamante ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/T2856199837176970248091469296323/unnamed-2.jpg",
  orientation: "h",
  span: 1,
  tags: ["styling"],
  title: "EL SOL IMPLORA (Video Oficial)",
  author: "Juan Pablo Bustamante",
  role: "",
  collab: "Dirección: @ramozz_dir @juanjoramozz_. Concepto Original: @_jambeau. Produccion: @hi.marlyc & @jacoinsignares. Asistencia de Produccion: @alejandro_vanegasr @el.rolo__. DP/Color: @ramozz_dir. Gaffer/Fotofija: @mari.gargo. Styling: @_jambeau. Producción Musical: @exilesdreams.",
  area: "Styling",
  year: "2026",
  url: "https://www.youtube.com/watch?v=ZgqHKwb2Gnk"
},

/* ------------------ Patitas Perdidas — Nicole Cavada ------------------ */
{
  src: "IMG/webp/Captura-de-pantalla-2026-03-16-a-las-17.05.28_b690ae7d46.webp",
  srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-16-a-las-17.05.28_b690ae7d46.avif",
  srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-17.05.28_b690ae7d46-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-16-a-las-17.05.28_b690ae7d46-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-16-a-las-17.05.28_b690ae7d46.avif 1744w",
  srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-17.05.28_b690ae7d46-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-16-a-las-17.05.28_b690ae7d46-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-16-a-las-17.05.28_b690ae7d46.webp 1744w",
  srcOriginal: "https://freight.cargo.site/t/original/i/E2843102067240349078308237292227/Captura-de-pantalla-2026-03-16-a-las-17.05.28.png",
  orientation: "h",
  span: 1,
  tags: ["ux ui","app","servicio"],
  title: "Patitas Perdidas",
  author: "Nicole Cavada",
  role: "Diseñadora",
  collab: "",
  area: "UX UI / App / Servicio",
  year: "2024",
  url: "https://www.behance.net/gallery/189928253/Patitas-perdidas"
},

/* ------------------ Audio Rutas de Barrio — Paz Osorio Schmied ------------------ */
{
  src: "IMG/webp/Mesa-de-trabajo-6-3-1024x1024-1_e67c78226f.webp",
  srcAvif: "IMG/avif/Mesa-de-trabajo-6-3-1024x1024-1_e67c78226f.avif",
  srcSetAvif: "IMG/avif/variants/Mesa-de-trabajo-6-3-1024x1024-1_e67c78226f-640.avif 640w, IMG/avif/Mesa-de-trabajo-6-3-1024x1024-1_e67c78226f.avif 1024w",
  srcSetWebp: "IMG/webp/variants/Mesa-de-trabajo-6-3-1024x1024-1_e67c78226f-640.webp 640w, IMG/webp/Mesa-de-trabajo-6-3-1024x1024-1_e67c78226f.webp 1024w",
  srcOriginal: "https://freight.cargo.site/t/original/i/O2843099405393625986093648655043/Mesa-de-trabajo-6-3-1024x1024-1.png",
  orientation: "sq",
  span: 1,
  tags: ["innovación","cultura","servicio"],
  title: "Audio Rutas de Barrio",
  author: "Paz Osorio Schmied",
  role: "Diseñadora / Directora de diseño",
  collab: "Idea y gestión: Marchantes. Cofinanciamiento: Fondart Regional 2022 (MINCAP).",
  area: "Innovación / Cultura / Servicio",
  year: "2022",
  url: [
    "https://marchantes.cl/audiorutas/",
    "https://www.instagram.com/Marchantes.cl"
  ]
},

/* ------------------ Viajes Lectores — Francisca Torres ------------------ */
{
  src: "IMG/webp/close-up-colorful-books-pile-1200x900_2d9e631a05.webp",
  srcAvif: "IMG/avif/close-up-colorful-books-pile-1200x900_2d9e631a05.avif",
  srcSetAvif: "IMG/avif/variants/close-up-colorful-books-pile-1200x900_2d9e631a05-640.avif 640w, IMG/avif/close-up-colorful-books-pile-1200x900_2d9e631a05.avif 1200w",
  srcSetWebp: "IMG/webp/variants/close-up-colorful-books-pile-1200x900_2d9e631a05-640.webp 640w, IMG/webp/close-up-colorful-books-pile-1200x900_2d9e631a05.webp 1200w",
  srcOriginal: "https://freight.cargo.site/t/original/i/G2843101258535088886881494446787/close-up-colorful-books-pile-1200x900.jpg",
  orientation: "h",
  span: 1,
  tags: ["educación","servicio","cultura"],
  title: "Viajes Lectores",
  author: "Francisca Torres",
  role: "",
  collab: "",
  area: "Educación / Servicio / Cultura",
  year: "2023",
  url: "https://www.instagram.com/viajeslectores?igsh=MnNvNzR1aDNxdXNj"
},

/* ------------------ Redes sociales: NewFuture — Victoria Garcia ------------------ */
{
  src: "IMG/webp/e2ad85a3-cea4-4cbd-9ec2-40b793c45789_rw_3840_3b0ff4f54a.webp",
  srcAvif: "IMG/avif/e2ad85a3-cea4-4cbd-9ec2-40b793c45789_rw_3840_3b0ff4f54a.avif",
  srcSetAvif: "IMG/avif/variants/e2ad85a3-cea4-4cbd-9ec2-40b793c45789_rw_3840_3b0ff4f54a-640.avif 640w, IMG/avif/variants/e2ad85a3-cea4-4cbd-9ec2-40b793c45789_rw_3840_3b0ff4f54a-1280.avif 1280w, IMG/avif/e2ad85a3-cea4-4cbd-9ec2-40b793c45789_rw_3840_3b0ff4f54a.avif 3840w",
  srcSetWebp: "IMG/webp/variants/e2ad85a3-cea4-4cbd-9ec2-40b793c45789_rw_3840_3b0ff4f54a-640.webp 640w, IMG/webp/variants/e2ad85a3-cea4-4cbd-9ec2-40b793c45789_rw_3840_3b0ff4f54a-1280.webp 1280w, IMG/webp/e2ad85a3-cea4-4cbd-9ec2-40b793c45789_rw_3840_3b0ff4f54a.webp 3840w",
  srcOriginal: "https://freight.cargo.site/t/original/i/T2843099405356732497946229551811/e2ad85a3-cea4-4cbd-9ec2-40b793c45789_rw_3840.png",
  orientation: "h",
  span: 1,
  tags: ["rrss","identidad visual"],
  title: "Redes sociales: NewFuture",
  author: "Victoria Garcia",
  role: "",
  collab: "Entidad de desarrollo: NewFuture. Equipo: Paula Wuth, Victoria García. Año: 2022-2025.",
  area: "RRSS / Identidad visual",
  year: "2022",
  url: "https://victoriagarciast.myportfolio.com/redes-sociales-newfuture"
},

/* ------------------ Escuela sin Fronteras — Catalina Hepp ------------------ */
{
  src: "IMG/webp/DSCF1870-scaled_b2a01100af.webp",
  srcAvif: "IMG/avif/DSCF1870-scaled_b2a01100af.avif",
  srcSetAvif: "IMG/avif/variants/DSCF1870-scaled_b2a01100af-640.avif 640w, IMG/avif/variants/DSCF1870-scaled_b2a01100af-1280.avif 1280w, IMG/avif/DSCF1870-scaled_b2a01100af.avif 2560w",
  srcSetWebp: "IMG/webp/variants/DSCF1870-scaled_b2a01100af-640.webp 640w, IMG/webp/variants/DSCF1870-scaled_b2a01100af-1280.webp 1280w, IMG/webp/DSCF1870-scaled_b2a01100af.webp 2560w",
  srcOriginal: "https://freight.cargo.site/t/original/i/B2843099405375179242019939103427/DSCF1870-scaled.jpg",
  orientation: "h",
  span: 1,
  tags: ["servicio","innovación","educación"],
  title: "Escuela sin Fronteras",
  author: "Catalina Hepp",
  role: "",
  collab: "Service Design Award 2020/21 Winner. Best Student Project.",
  area: "Servicio / Innovación / Educación",
  year: "2020",
  url: "https://www.service-design-network.org/community-knowledge/escuela-sin-fronteras"
},

/* ------------------ Viajes Lectores — Victoria Garcia ------------------ */
{
  src: "IMG/webp/376d35fd-1f19-4e45-8588-b6a9872068da_rw_3840_bf6f5b1a39.webp",
  srcAvif: "IMG/avif/376d35fd-1f19-4e45-8588-b6a9872068da_rw_3840_bf6f5b1a39.avif",
  srcSetAvif: "IMG/avif/variants/376d35fd-1f19-4e45-8588-b6a9872068da_rw_3840_bf6f5b1a39-640.avif 640w, IMG/avif/variants/376d35fd-1f19-4e45-8588-b6a9872068da_rw_3840_bf6f5b1a39-1280.avif 1280w, IMG/avif/376d35fd-1f19-4e45-8588-b6a9872068da_rw_3840_bf6f5b1a39.avif 3840w",
  srcSetWebp: "IMG/webp/variants/376d35fd-1f19-4e45-8588-b6a9872068da_rw_3840_bf6f5b1a39-640.webp 640w, IMG/webp/variants/376d35fd-1f19-4e45-8588-b6a9872068da_rw_3840_bf6f5b1a39-1280.webp 1280w, IMG/webp/376d35fd-1f19-4e45-8588-b6a9872068da_rw_3840_bf6f5b1a39.webp 3840w",
  srcOriginal: "https://freight.cargo.site/t/original/i/R2843099405338285753872520000195/376d35fd-1f19-4e45-8588-b6a9872068da_rw_3840.png",
  orientation: "h",
  span: 1,
  tags: ["identidad visual","ilustración","educación"],
  title: "Viajes Lectores",
  author: "Victoria Garcia",
  role: "",
  collab: "Entidad de desarrollo: NewFuture. Financiamiento: Proyecto financiado por Innova FOSIS. Equipo: Catalina Hepp, Camila Silva, Maili Ow, Joaquín Rosas, Natalia Hevia, Victoria García, Mariana Zeballos, Trinidad Borghero, Tomás Sanchez.",
  area: "Identidad visual / Ilustración / Educación",
  year: "2023",
  url: "https://victoriagarciast.myportfolio.com/viajes-lectores"
},

    /* ------------------ Campaña día del niño — Francisca Torres ------------------ */
    {
      id: "campana-dia-del-nino",
      title: "Campaña día del niño",
      author: "Francisca Torres",
      role: "",
      collab: "Entrekids.cl",
      area: "Branding / Identidad visual",
      year: 2022,
      tags: ["branding", "identidad visual", "gráfico"],
      src: "IMG/webp/201_Francisca-Torres-Captura-de-pantalla-2026-01-02-a-las-14.35.51_f16fd9208e.webp",
      srcAvif: "IMG/avif/201_Francisca-Torres-Captura-de-pantalla-2026-01-02-a-las-14.35.51_f16fd9208e.avif",
      srcSetAvif: "IMG/avif/variants/201_Francisca-Torres-Captura-de-pantalla-2026-01-02-a-las-14.35.51_f16fd9208e-640.avif 640w, IMG/avif/variants/201_Francisca-Torres-Captura-de-pantalla-2026-01-02-a-las-14.35.51_f16fd9208e-1280.avif 1280w, IMG/avif/201_Francisca-Torres-Captura-de-pantalla-2026-01-02-a-las-14.35.51_f16fd9208e.avif 2160w",
      srcSetWebp: "IMG/webp/variants/201_Francisca-Torres-Captura-de-pantalla-2026-01-02-a-las-14.35.51_f16fd9208e-640.webp 640w, IMG/webp/variants/201_Francisca-Torres-Captura-de-pantalla-2026-01-02-a-las-14.35.51_f16fd9208e-1280.webp 1280w, IMG/webp/201_Francisca-Torres-Captura-de-pantalla-2026-01-02-a-las-14.35.51_f16fd9208e.webp 2160w",
      srcOriginal: "IMG/remote-originals/201_Francisca-Torres-Captura-de-pantalla-2026-01-02-a-las-14.35.51.png",
      url: "https://flen.es/campana-dia-del-nino"
    },

    /* ------------------ Ketal — Sebastián Castro ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-10.28.18_317f0492fb.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-10.28.18_317f0492fb.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-10.28.18_317f0492fb-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-10.28.18_317f0492fb.avif 896w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-10.28.18_317f0492fb-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-10.28.18_317f0492fb.webp 896w",
      srcOriginal: "https://freight.cargo.site/t/original/i/S2848001385960420189766764933827/Captura-de-pantalla-2026-03-19-a-las-10.28.18.png",
      orientation: "h",
      span: 1,
      tags: ["identidad visual", "servicio"],
      title: "Ketal",
      author: "Sebastián Castro",
      role: "Diseñador",
      collab: "Proyecto en colaboración con Vicente Barría, Antonia Catalán, Fernanda Pineda, María José Vega. Desarrollado por Nodo Sur.",
      area: "Identidad visual / Servicio",
      year: "2025",
      url: "https://sebastiancastrog.myportfolio.com/portafolio-2026"
    },

    /* ------------------ La Mesa — Magdalena Fontaine ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-10.37.04_235ab8b7fa.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-10.37.04_235ab8b7fa.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-10.37.04_235ab8b7fa-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-10.37.04_235ab8b7fa-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-10.37.04_235ab8b7fa.avif 1440w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-10.37.04_235ab8b7fa-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-10.37.04_235ab8b7fa-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-10.37.04_235ab8b7fa.webp 1440w",
      srcOriginal: "https://freight.cargo.site/t/original/i/W2848001385941973445693055382211/Captura-de-pantalla-2026-03-19-a-las-10.37.04.png",
      orientation: "h",
      span: 1,
      tags: ["logo", "identidad visual", "branding"],
      title: "La Mesa",
      author: "Magdalena Fontaine",
      role: "",
      collab: "La Mesa. Logo Sal Condimentada de Cahuil.",
      area: "Logo / Identidad visual / Branding",
      year: "2022",
      url: "https://www.behance.net/gallery/141549371/La-Mesa"
    },

    /* ------------------ Maremagnum — Beatriz Luna ------------------ */
    {
      src: "IMG/webp/d645c253-e6d4-4750-b906-e31b46e59e98_rw_1920_7c1ec0a74c.webp",
      srcAvif: "IMG/avif/d645c253-e6d4-4750-b906-e31b46e59e98_rw_1920_7c1ec0a74c.avif",
      srcSetAvif: "IMG/avif/variants/d645c253-e6d4-4750-b906-e31b46e59e98_rw_1920_7c1ec0a74c-640.avif 640w, IMG/avif/variants/d645c253-e6d4-4750-b906-e31b46e59e98_rw_1920_7c1ec0a74c-1280.avif 1280w, IMG/avif/d645c253-e6d4-4750-b906-e31b46e59e98_rw_1920_7c1ec0a74c.avif 1920w",
      srcSetWebp: "IMG/webp/variants/d645c253-e6d4-4750-b906-e31b46e59e98_rw_1920_7c1ec0a74c-640.webp 640w, IMG/webp/variants/d645c253-e6d4-4750-b906-e31b46e59e98_rw_1920_7c1ec0a74c-1280.webp 1280w, IMG/webp/d645c253-e6d4-4750-b906-e31b46e59e98_rw_1920_7c1ec0a74c.webp 1920w",
      srcOriginal: "https://freight.cargo.site/t/original/i/E2848006640958191443701571990211/d645c253-e6d4-4750-b906-e31b46e59e98_rw_1920.png",
      orientation: "h",
      span: 1,
      tags: ["diseño textil", "indumentaria", "ilustración"],
      title: "Maremagnum",
      author: "Beatriz Luna",
      role: "Diseñadora / Ilustradora",
      collab: "Juegos Panamericanos Santiago 2023",
      area: "Diseño textil / Indumentaria / Ilustración",
      year: "2023",
      url: "https://beatrizluna.myportfolio.com/maremagnum"
    },

    /* ------------------ Canción del Ciervo y el Niño — Antonella Rosati ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-15.37.19_a716916814.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-15.37.19_a716916814.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-15.37.19_a716916814-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-15.37.19_a716916814-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-15.37.19_a716916814.avif 1502w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-15.37.19_a716916814-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-15.37.19_a716916814-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-15.37.19_a716916814.webp 1502w",
      srcOriginal: "https://freight.cargo.site/t/original/i/V2848001385923526701619345830595/Captura-de-pantalla-2026-03-19-a-las-15.37.19.png",
      orientation: "h",
      span: 1,
      tags: ["afiche", "ilustración", "gráfico"],
      title: "Canción del Ciervo y el Niño",
      author: "Antonella Rosati",
      role: "",
      collab: "",
      area: "Afiche / Ilustración / Gráfico",
      year: "2024",
      url: "https://www.behance.net/gallery/221101819/Afiche-para-Cancion-del-Ciervo-y-el-Nino"
    },

    /* ------------------ Fiesta de La Tirana — Francisca Valenzuela Chamorro ------------------ */
    {
      src: "IMG/webp/7B5KqvI2mj1XaPoMpTu3obWbr2U_c76c7ca321.webp",
      srcAvif: "IMG/avif/7B5KqvI2mj1XaPoMpTu3obWbr2U_c76c7ca321.avif",
      srcSetAvif: "IMG/avif/variants/7B5KqvI2mj1XaPoMpTu3obWbr2U_c76c7ca321-640.avif 640w, IMG/avif/7B5KqvI2mj1XaPoMpTu3obWbr2U_c76c7ca321.avif 1240w",
      srcSetWebp: "IMG/webp/variants/7B5KqvI2mj1XaPoMpTu3obWbr2U_c76c7ca321-640.webp 640w, IMG/webp/7B5KqvI2mj1XaPoMpTu3obWbr2U_c76c7ca321.webp 1240w",
      srcOriginal: "https://freight.cargo.site/t/original/i/P2847999343629150069013757768387/7B5KqvI2mj1XaPoMpTu3obWbr2U.png",
      orientation: "v",
      span: 1,
      tags: ["afiche", "ilustración", "gráfico"],
      title: "Fiesta de La Tirana",
      author: "Francisca Valenzuela Chamorro",
      role: "",
      collab: "",
      area: "Afiche / Ilustración / Gráfico",
      year: "2025",
      url: "https://franvalenzuela.framer.website/la-fiesta-de-la-tirana"
    },

    /* ------------------ CANASTOS ORIETA — Fernanda González ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-15.45.47_8954bf5145.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-15.45.47_8954bf5145.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-15.45.47_8954bf5145-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-15.45.47_8954bf5145-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-15.45.47_8954bf5145.avif 2648w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-15.45.47_8954bf5145-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-15.45.47_8954bf5145-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-15.45.47_8954bf5145.webp 2648w",
      srcOriginal: "https://freight.cargo.site/t/original/i/Q2848001385905079957545636278979/Captura-de-pantalla-2026-03-19-a-las-15.45.47.png",
      orientation: "h",
      span: 1,
      tags: ["identidad visual", "logo"],
      title: "CANASTOS ORIETA",
      author: "Fernanda González",
      role: "",
      collab: "Práctica de servicio en Parley for the Oceans",
      area: "Identidad visual / Logo",
      year: "n/a",
      url: "https://fernandagn.myportfolio.com/canastos-orieta"
    },

    /* ------------------ Finca Estudio — Andrea Balmaceda Vicuña ------------------ */
    {
      src: "IMG/webp/561314050_18054938429268251_3112647212846362856_n_2627d5b13f.webp",
      srcAvif: "IMG/avif/561314050_18054938429268251_3112647212846362856_n_2627d5b13f.avif",
      srcSetAvif: "IMG/avif/variants/561314050_18054938429268251_3112647212846362856_n_2627d5b13f-640.avif 640w, IMG/avif/561314050_18054938429268251_3112647212846362856_n_2627d5b13f.avif 1080w",
      srcSetWebp: "IMG/webp/variants/561314050_18054938429268251_3112647212846362856_n_2627d5b13f-640.webp 640w, IMG/webp/561314050_18054938429268251_3112647212846362856_n_2627d5b13f.webp 1080w",
      srcOriginal: "https://freight.cargo.site/t/original/i/R2847999343647596813087467320003/561314050_18054938429268251_3112647212846362856_n.jpg",
      orientation: "v",
      span: 1,
      tags: ["diseño interior", "estudio"],
      title: "Finca Estudio",
      author: "Andrea Balmaceda Vicuña",
      role: "",
      collab: "Desarrollado en Finca Estudio",
      area: "Diseño interior / Estudio",
      year: "2016",
      url: "https://www.instagram.com/finca.estudio/"
    },

    /* ------------------ Landing page Impacto Neto Positivo — Paula Alvarado Echeverría ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-17.01.20_8d58693818.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-17.01.20_8d58693818.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-17.01.20_8d58693818-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-17.01.20_8d58693818-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-17.01.20_8d58693818.avif 1428w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-17.01.20_8d58693818-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-17.01.20_8d58693818-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-17.01.20_8d58693818.webp 1428w",
      srcOriginal: "https://freight.cargo.site/t/original/i/Z2848001385886633213471926727363/Captura-de-pantalla-2026-03-19-a-las-17.01.20.png",
      orientation: "h",
      span: 1,
      tags: ["web", "ux ui"],
      title: "Landing page Impacto Neto Positivo",
      author: "Paula Alvarado Echeverría",
      role: "",
      collab: "",
      area: "Web / UX UI",
      year: "2024",
      url: "https://www.impactonetopositivo.com/landing/"
    },

    /* ------------------ Rediseño website greenticket — Paula Alvarado Echeverría ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-17.02.57_eb34bf99e3.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-17.02.57_eb34bf99e3.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-17.02.57_eb34bf99e3-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-17.02.57_eb34bf99e3-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-17.02.57_eb34bf99e3.avif 2640w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-17.02.57_eb34bf99e3-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-17.02.57_eb34bf99e3-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-17.02.57_eb34bf99e3.webp 2640w",
      srcOriginal: "https://freight.cargo.site/t/original/i/T2848001385868186469398217175747/Captura-de-pantalla-2026-03-19-a-las-17.02.57.png",
      orientation: "h",
      span: 1,
      tags: ["web", "ux ui"],
      title: "Rediseño website greenticket",
      author: "Paula Alvarado Echeverría",
      role: "",
      collab: "",
      area: "Web / UX UI",
      year: "2024",
      url: "https://www.greenticket.cl/"
    },

    /* ------------------ Lumi: Juego para niños con Discapacidad Visual — Daniela Fernández Luengas ------------------ */
    {
      src: "IMG/webp/cc52c147171561.5872d8e96589c_3fa4f132b1.webp",
      srcAvif: "IMG/avif/cc52c147171561.5872d8e96589c_3fa4f132b1.avif",
      srcSetAvif: "IMG/avif/variants/cc52c147171561.5872d8e96589c_3fa4f132b1-640.avif 640w, IMG/avif/variants/cc52c147171561.5872d8e96589c_3fa4f132b1-1280.avif 1280w, IMG/avif/cc52c147171561.5872d8e96589c_3fa4f132b1.avif 3840w",
      srcSetWebp: "IMG/webp/variants/cc52c147171561.5872d8e96589c_3fa4f132b1-640.webp 640w, IMG/webp/variants/cc52c147171561.5872d8e96589c_3fa4f132b1-1280.webp 1280w, IMG/webp/cc52c147171561.5872d8e96589c_3fa4f132b1.webp 3840w",
      srcOriginal: "https://freight.cargo.site/t/original/i/G2848008019077547702394754118339/cc52c147171561.5872d8e96589c.jpg",
      orientation: "h",
      span: 1,
      tags: ["educación", "juego de mesa"],
      title: "Lumi: Juego para niños con Discapacidad Visual",
      author: "Daniela Fernández Luengas",
      role: "",
      collab: "Proyecto de título",
      area: "Educación / Juego de mesa",
      year: "2016",
      url: "https://www.behance.net/gallery/47171561/Lumi-Juego-para-ninos-con-Discapacidad-Visual"
    },

    /* ------------------ Cerámicas — Antonia Grunefeld ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.32.32_34f36c9d60.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.32.32_34f36c9d60.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.32.32_34f36c9d60-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.32.32_34f36c9d60-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.32.32_34f36c9d60.avif 1358w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.32.32_34f36c9d60-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.32.32_34f36c9d60-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.32.32_34f36c9d60.webp 1358w",
      srcOriginal: "https://freight.cargo.site/t/original/i/V2848001385849739725324507624131/Captura-de-pantalla-2026-03-19-a-las-18.32.32.png",
      orientation: "h",
      span: 1,
      tags: ["artesanía"],
      title: "Cerámicas",
      author: "Antonia Grunefeld",
      role: "Diseñadora",
      collab: "",
      area: "Artesanía",
      year: "2025",
      url: "https://antoniagrunefeld.com/ceramics-i"
    },

    /* ------------------ Ilustraciones — Antonia Grunefeld ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.33.37_d4a5bf7b6f.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.33.37_d4a5bf7b6f.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.33.37_d4a5bf7b6f-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.33.37_d4a5bf7b6f-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.33.37_d4a5bf7b6f.avif 1360w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.33.37_d4a5bf7b6f-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.33.37_d4a5bf7b6f-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.33.37_d4a5bf7b6f.webp 1360w",
      srcOriginal: "https://freight.cargo.site/t/original/i/E2848001385831292981250798072515/Captura-de-pantalla-2026-03-19-a-las-18.33.37.png",
      orientation: "h",
      span: 1,
      tags: ["ilustración"],
      title: "Ilustraciones",
      author: "Antonia Grunefeld",
      role: "Diseñadora",
      collab: "",
      area: "Ilustración",
      year: "n/a",
      url: "https://antoniagrunefeld.com/ilus"
    },

    /* ------------------ Ilustraciones — Juan de Dios Urrutia Izquierdo ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.43.03_30323bceea.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.43.03_30323bceea.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.43.03_30323bceea-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.43.03_30323bceea-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.43.03_30323bceea.avif 1424w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.43.03_30323bceea-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.43.03_30323bceea-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.43.03_30323bceea.webp 1424w",
      srcOriginal: "https://freight.cargo.site/t/original/i/H2848001385812846237177088520899/Captura-de-pantalla-2026-03-19-a-las-18.43.03.png",
      orientation: "h",
      span: 1,
      tags: ["ilustración"],
      title: "Ilustraciones",
      author: "Juan de Dios Urrutia Izquierdo",
      role: "diseñador / ilustrador",
      collab: "",
      area: "Ilustración",
      year: "2025",
      url: "https://dribbble.com/juandedios/shots"
    },

    /* ------------------ BOHO — MANUELA VILLANUEVA WALKER ------------------ */
    {
      src: "IMG/webp/Captura-de-Pantalla-2023-01-12-a-la_s_-22_55_36.png_ad2dc768ec.webp",
      srcAvif: "IMG/avif/Captura-de-Pantalla-2023-01-12-a-la_s_-22_55_36.png_ad2dc768ec.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-Pantalla-2023-01-12-a-la_s_-22_55_36.png_ad2dc768ec-640.avif 640w, IMG/avif/Captura-de-Pantalla-2023-01-12-a-la_s_-22_55_36.png_ad2dc768ec.avif 1050w",
      srcSetWebp: "IMG/webp/variants/Captura-de-Pantalla-2023-01-12-a-la_s_-22_55_36.png_ad2dc768ec-640.webp 640w, IMG/webp/Captura-de-Pantalla-2023-01-12-a-la_s_-22_55_36.png_ad2dc768ec.webp 1050w",
      srcOriginal: "https://freight.cargo.site/t/original/i/L2848000653827594648308370846403/Captura-de-Pantalla-2023-01-12-a-la_s_-22_55_36.png.jpg",
      orientation: "h",
      span: 1,
      tags: ["moda", "indumentaria", "dirección creativa"],
      title: "BOHO",
      author: "MANUELA VILLANUEVA WALKER",
      role: "",
      collab: "Lounge",
      area: "Moda / Indumentaria / Dirección creativa",
      year: "n/a",
      url: "https://manuelavillanueva9.wixsite.com/mvwdesign/boho-lounge"
    },

    /* ------------------ DREAMY WINTER 22 — MANUELA VILLANUEVA WALKER ------------------ */
    {
      src: "IMG/webp/c1d4c5_2fecf120d07d4edcbc2e4f654eea64e6_mv2.png_93d973a38a.webp",
      srcAvif: "IMG/avif/c1d4c5_2fecf120d07d4edcbc2e4f654eea64e6_mv2.png_93d973a38a.avif",
      srcSetAvif: "IMG/avif/variants/c1d4c5_2fecf120d07d4edcbc2e4f654eea64e6_mv2.png_93d973a38a-640.avif 640w, IMG/avif/c1d4c5_2fecf120d07d4edcbc2e4f654eea64e6_mv2.png_93d973a38a.avif 979w",
      srcSetWebp: "IMG/webp/variants/c1d4c5_2fecf120d07d4edcbc2e4f654eea64e6_mv2.png_93d973a38a-640.webp 640w, IMG/webp/c1d4c5_2fecf120d07d4edcbc2e4f654eea64e6_mv2.png_93d973a38a.webp 979w",
      srcOriginal: "https://freight.cargo.site/t/original/i/E2848000225309729816035486806723/c1d4c5_2fecf120d07d4edcbc2e4f654eea64e6_mv2.png.jpg",
      orientation: "h",
      span: 1,
      tags: ["moda", "indumentaria", "dirección creativa"],
      title: "DREAMY WINTER 22",
      author: "MANUELA VILLANUEVA WALKER",
      role: "",
      collab: "Lounge",
      area: "Moda / Indumentaria / Dirección creativa",
      year: "2022",
      url: "https://manuelavillanueva9.wixsite.com/mvwdesign/lounge-dreamy-w22"
    },

    /* ------------------ LOUNGE HOME S23 — MANUELA VILLANUEVA WALKER ------------------ */
    {
      src: "IMG/webp/c1d4c5_9c88194a79b7451391aa4d7d02c62f69_mv2.png_cb7e72b6ee.webp",
      srcAvif: "IMG/avif/c1d4c5_9c88194a79b7451391aa4d7d02c62f69_mv2.png_cb7e72b6ee.avif",
      srcSetAvif: "IMG/avif/variants/c1d4c5_9c88194a79b7451391aa4d7d02c62f69_mv2.png_cb7e72b6ee-640.avif 640w, IMG/avif/c1d4c5_9c88194a79b7451391aa4d7d02c62f69_mv2.png_cb7e72b6ee.avif 659w",
      srcSetWebp: "IMG/webp/variants/c1d4c5_9c88194a79b7451391aa4d7d02c62f69_mv2.png_cb7e72b6ee-640.webp 640w, IMG/webp/c1d4c5_9c88194a79b7451391aa4d7d02c62f69_mv2.png_cb7e72b6ee.webp 659w",
      srcOriginal: "https://freight.cargo.site/t/original/i/N2848000225291283071961777255107/c1d4c5_9c88194a79b7451391aa4d7d02c62f69_mv2.png.jpg",
      orientation: "v",
      span: 1,
      tags: ["moda", "indumentaria", "dirección creativa"],
      title: "LOUNGE HOME S23",
      author: "MANUELA VILLANUEVA WALKER",
      role: "",
      collab: "Lounge",
      area: "Moda / Indumentaria / Dirección creativa",
      year: "2023",
      url: "https://manuelavillanueva9.wixsite.com/mvwdesign/lounge-home-s23"
    },

    /* ------------------ Armenté — Francisca Villela Armenté ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-19.17.10_09e1a61917.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-19.17.10_09e1a61917.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-19.17.10_09e1a61917-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-19.17.10_09e1a61917-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-19.17.10_09e1a61917.avif 1498w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-19.17.10_09e1a61917-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-19.17.10_09e1a61917-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-19.17.10_09e1a61917.webp 1498w",
      srcOriginal: "https://freight.cargo.site/t/original/i/A2848004591045309508653939110595/Captura-de-pantalla-2026-03-19-a-las-19.17.10.png",
      orientation: "v",
      span: 1,
      tags: ["moda", "indumentaria", "dirección creativa"],
      title: "Armenté",
      author: "Francisca Villela Armenté",
      role: "",
      collab: "",
      area: "Moda / Indumentaria / Dirección creativa",
      year: "2019",
      url: "https://www.instagram.com/armenteofficial/"
    },

    /* ------------------ Japo Set — Francisca Villela Armenté ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.53.25_ff1e1ded03.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.53.25_ff1e1ded03.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.53.25_ff1e1ded03-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.53.25_ff1e1ded03-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.53.25_ff1e1ded03.avif 1414w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.53.25_ff1e1ded03-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.53.25_ff1e1ded03-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.53.25_ff1e1ded03.webp 1414w",
      srcOriginal: "https://freight.cargo.site/t/original/i/X2848001385794399493103378969283/Captura-de-pantalla-2026-03-19-a-las-18.53.25.png",
      orientation: "v",
      span: 1,
      tags: ["moda", "indumentaria", "ecología", "upcycling"],
      title: "Japo Set",
      author: "Francisca Villela Armenté",
      role: "",
      collab: "Ph @sampedrobraga Asist @anafardy. St @matiosale. Mua @xinaarodriguez. Models @violeta.silvestre_. x @armenteofficial @ftvillela.",
      area: "Moda / Indumentaria / Ecología / Upcycling",
      year: "2024",
      url: "https://www.instagram.com/p/C74bWQuitaA/?img_index=1"
    },

    /* ------------------ BEST SELLER — Francisca Villela Armenté ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.55.17_343394c64e.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.55.17_343394c64e.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.55.17_343394c64e-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.55.17_343394c64e-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.55.17_343394c64e.avif 1428w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.55.17_343394c64e-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.55.17_343394c64e-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.55.17_343394c64e.webp 1428w",
      srcOriginal: "https://freight.cargo.site/t/original/i/Q2848001385775952749029669417667/Captura-de-pantalla-2026-03-19-a-las-18.55.17.png",
      orientation: "v",
      span: 1,
      tags: ["moda", "indumentaria", "ecología", "upcycling"],
      title: "BEST SELLER",
      author: "Francisca Villela Armenté",
      role: "",
      collab: "Ph @sampedrobraga Asist @anafardy. St @matiosale. Mua @xinaarodriguez. Models @teo_silguero. x @armenteofficial @ftvillela.",
      area: "Moda / Indumentaria / Ecología / Upcycling",
      year: "2024",
      url: "https://www.instagram.com/p/C8oyZ1gCXr6/?img_index=1"
    },

    /* ------------------ Top Nostalgia — Francisca Villela Armenté ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.56.46_ffbca33dac.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.56.46_ffbca33dac.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.56.46_ffbca33dac-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.56.46_ffbca33dac-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.56.46_ffbca33dac.avif 1378w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.56.46_ffbca33dac-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.56.46_ffbca33dac-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.56.46_ffbca33dac.webp 1378w",
      srcOriginal: "https://freight.cargo.site/t/original/i/X2848001385757506004955959866051/Captura-de-pantalla-2026-03-19-a-las-18.56.46.png",
      orientation: "v",
      span: 1,
      tags: ["moda", "indumentaria", "ecología", "upcycling"],
      title: "Top Nostalgia",
      author: "Francisca Villela Armenté",
      role: "",
      collab: "Falda: @georgielastudio. Fotos: @lacomunevintage.",
      area: "Moda / Indumentaria / Ecología / Upcycling",
      year: "2023",
      url: "https://www.instagram.com/p/C1HdKDrtb2X/?img_index=1"
    },

    /* ------------------ NoJockey — Francisca Villela Armenté ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.57.36_15921fb424.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.57.36_15921fb424.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.57.36_15921fb424-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-18.57.36_15921fb424-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-18.57.36_15921fb424.avif 1438w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.57.36_15921fb424-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-18.57.36_15921fb424-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-18.57.36_15921fb424.webp 1438w",
      srcOriginal: "https://freight.cargo.site/t/original/i/F2848001385739059260882250314435/Captura-de-pantalla-2026-03-19-a-las-18.57.36.png",
      orientation: "v",
      span: 1,
      tags: ["moda", "indumentaria", "ecología", "upcycling"],
      title: "NoJockey",
      author: "Francisca Villela Armenté",
      role: "",
      collab: "",
      area: "Moda / Indumentaria / Ecología / Upcycling",
      year: "2023",
      url: "https://www.instagram.com/p/CwhvIPGII_c/?img_index=1"
    },

    /* ------------------ Señalética Club Manquehue — Carolina Correa ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-19.03.56_c44e3b6aff.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-19.03.56_c44e3b6aff.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-19.03.56_c44e3b6aff-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-19.03.56_c44e3b6aff-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-19.03.56_c44e3b6aff.avif 2350w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-19.03.56_c44e3b6aff-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-19.03.56_c44e3b6aff-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-19.03.56_c44e3b6aff.webp 2350w",
      srcOriginal: "https://freight.cargo.site/t/original/i/M2848001385720612516808540762819/Captura-de-pantalla-2026-03-19-a-las-19.03.56.png",
      orientation: "h",
      span: 1,
      tags: ["wayfinding", "señaletica", "diseño de información"],
      title: "Señalética Club Manquehue",
      author: "Carolina Correa",
      role: "",
      collab: "Equipo Wayfinding Consultores: Carolina Correa, José Manuel Allard, Carola Zurob.",
      area: "Wayfinding / Señalética / Diseño de información",
      year: "2025",
      url: "https://carocorrea.com/senaletica-club-manquehue"
    },

    /* ------------------ Tawa Refugio del Puelo — Carolina Correa ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-19.05.27_860437249b.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-19.05.27_860437249b.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-19.05.27_860437249b-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-19.05.27_860437249b.avif 764w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-19.05.27_860437249b-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-19.05.27_860437249b.webp 764w",
      srcOriginal: "https://freight.cargo.site/t/original/i/F2848001385702165772734831211203/Captura-de-pantalla-2026-03-19-a-las-19.05.27.png",
      orientation: "h",
      span: 1,
      tags: ["diseño integral", "branding", "gráfico"],
      title: "Tawa Refugio del Puelo",
      author: "Carolina Correa",
      role: "",
      collab: "Junto al equipo de Rimaya Lab se realizó la conceptualización de marca.",
      area: "Diseño integral / Branding / Gráfico",
      year: "n/a",
      url: "https://carocorrea.com/tawa-refugio-del-puelo"
    },

    /* ------------------ Adagio Teas® | Rebranding — Carla Marrazzo ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-19.08.02_68660e2140.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-19.08.02_68660e2140.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-19.08.02_68660e2140-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-19.08.02_68660e2140-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-19.08.02_68660e2140.avif 1794w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-19.08.02_68660e2140-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-19.08.02_68660e2140-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-19.08.02_68660e2140.webp 1794w",
      srcOriginal: "https://freight.cargo.site/t/original/i/F2848001385683719028661121659587/Captura-de-pantalla-2026-03-19-a-las-19.08.02.png",
      orientation: "h",
      span: 1,
      tags: ["branding", "identidad visual"],
      title: "Adagio Teas® | Rebranding",
      author: "Carla Marrazzo",
      role: "",
      collab: "Desarrollado por Corsicana. Branding: Carla Marrazzo. Estrategia: Sapiens Branding.",
      area: "Branding / Identidad visual",
      year: "2020",
      url: "https://www.behance.net/gallery/161640559/Adagio-Teas-Rebranding"
    },

    /* ------------------ MODO — Carla Marrazzo ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-19-a-las-19.09.51_a35bb8d930.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-19-a-las-19.09.51_a35bb8d930.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-19.09.51_a35bb8d930-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-19-a-las-19.09.51_a35bb8d930-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-19-a-las-19.09.51_a35bb8d930.avif 2800w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-19.09.51_a35bb8d930-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-19-a-las-19.09.51_a35bb8d930-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-19-a-las-19.09.51_a35bb8d930.webp 2800w",
      srcOriginal: "https://freight.cargo.site/t/original/i/G2848001385665272284587412107971/Captura-de-pantalla-2026-03-19-a-las-19.09.51.png",
      orientation: "h",
      span: 1,
      tags: ["branding", "identidad visual"],
      title: "MODO",
      author: "Carla Marrazzo",
      role: "",
      collab: "Desarrollado por Corsicana. Branding: Carla Marrazzo. Estrategia: Sapiens Branding.",
      area: "Branding / Identidad visual",
      year: "2024",
      url: "https://www.behance.net/gallery/220938527/MODO-Branding-Strategy"
    },

    /* ------------------ They were friends — Antonia Berger ------------------ */
    {
      src: "IMG/webp/Lifelong-Friends-Part-1_9c91f1d0e9.webp",
      srcAvif: "IMG/avif/Lifelong-Friends-Part-1_9c91f1d0e9.avif",
      srcSetAvif: "IMG/avif/variants/Lifelong-Friends-Part-1_9c91f1d0e9-640.avif 640w, IMG/avif/Lifelong-Friends-Part-1_9c91f1d0e9.avif 1229w",
      srcSetWebp: "IMG/webp/variants/Lifelong-Friends-Part-1_9c91f1d0e9-640.webp 640w, IMG/webp/Lifelong-Friends-Part-1_9c91f1d0e9.webp 1229w",
      srcOriginal: "https://freight.cargo.site/t/original/i/S2849442492904910184930297197251/Lifelong-Friends-Part-1.png",
      orientation: "h",
      span: 1,
      tags: ["ilustración", "gráfico"],
      title: "They were friends",
      author: "Antonia Berger",
      role: "",
      collab: "",
      area: "Ilustración / Gráfico",
      year: "2024",
      url: "https://antoniaberger.com"
    },

    /* ------------------ Sonder — Antonia Berger ------------------ */
    {
      src: "IMG/webp/Sonder_HalfRes_dc03014223.webp",
      srcAvif: "IMG/avif/Sonder_HalfRes_dc03014223.avif",
      srcSetAvif: "IMG/avif/variants/Sonder_HalfRes_dc03014223-640.avif 640w, IMG/avif/variants/Sonder_HalfRes_dc03014223-1280.avif 1280w, IMG/avif/Sonder_HalfRes_dc03014223.avif 1772w",
      srcSetWebp: "IMG/webp/variants/Sonder_HalfRes_dc03014223-640.webp 640w, IMG/webp/variants/Sonder_HalfRes_dc03014223-1280.webp 1280w, IMG/webp/Sonder_HalfRes_dc03014223.webp 1772w",
      srcOriginal: "https://freight.cargo.site/t/original/i/B2849442492886463440856587645635/Sonder_HalfRes.jpg",
      orientation: "h",
      span: 1,
      tags: ["ilustración", "gráfico"],
      title: "Sonder",
      author: "Antonia Berger",
      role: "",
      collab: "",
      area: "Ilustración / Gráfico",
      year: "2024",
      url: "https://antoniaberger.com"
    },

    /* ------------------ Comic for ministry of education chile 2023 — Antonia Berger ------------------ */
    {
      src: "IMG/webp/comic-chat-gpt_a25fd8cacc.webp",
      srcAvif: "IMG/avif/comic-chat-gpt_a25fd8cacc.avif",
      srcSetAvif: "IMG/avif/variants/comic-chat-gpt_a25fd8cacc-640.avif 640w, IMG/avif/comic-chat-gpt_a25fd8cacc.avif 1080w",
      srcSetWebp: "IMG/webp/variants/comic-chat-gpt_a25fd8cacc-640.webp 640w, IMG/webp/comic-chat-gpt_a25fd8cacc.webp 1080w",
      srcOriginal: "https://freight.cargo.site/t/original/i/F2849442492868016696782878094019/comic-chat-gpt.png",
      orientation: "h",
      span: 1,
      tags: ["ilustración", "gráfico"],
      title: "Comic for ministry of education chile 2023",
      author: "Antonia Berger",
      role: "",
      collab: "",
      area: "Ilustración / Gráfico",
      year: "2023",
      url: ""
    },

    /* ------------------ Escena Silvestre — Cristina Tapia Robles ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.21.50_3f9d2be00a.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.21.50_3f9d2be00a.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.21.50_3f9d2be00a-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.21.50_3f9d2be00a-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.21.50_3f9d2be00a.avif 1354w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.21.50_3f9d2be00a-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.21.50_3f9d2be00a-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.21.50_3f9d2be00a.webp 1354w",
      srcOriginal: "https://freight.cargo.site/t/original/i/R2849442848262988020871099527875/Captura-de-pantalla-2026-03-20-a-las-16.21.50.png",
      orientation: "h",
      span: 1,
      tags: ["espacio", "servicio", "innovación"],
      title: "Escena Silvestre",
      author: "Cristina Tapia Robles",
      role: "",
      collab: "",
      area: "Espacio / Servicio / Innovación",
      year: "2025",
      url: "https://laderasur.com/articulo/biodiversidad-que-sana-proyecto-artistico-lleva-la-fauna-silvestre-a-dos-hospitales-de-chile-a-traves-de-murales/"
    },

    /* ------------------ Afiche Día de los Patrimonios 2024 — Cristina Tapia Robles ------------------ */
    {
      src: "IMG/webp/312ff7244196121.69925f9773b6d.png_dbdf2d3404.webp",
      srcAvif: "IMG/avif/312ff7244196121.69925f9773b6d.png_dbdf2d3404.avif",
      srcSetAvif: "IMG/avif/variants/312ff7244196121.69925f9773b6d.png_dbdf2d3404-640.avif 640w, IMG/avif/variants/312ff7244196121.69925f9773b6d.png_dbdf2d3404-1280.avif 1280w, IMG/avif/312ff7244196121.69925f9773b6d.png_dbdf2d3404.avif 2800w",
      srcSetWebp: "IMG/webp/variants/312ff7244196121.69925f9773b6d.png_dbdf2d3404-640.webp 640w, IMG/webp/variants/312ff7244196121.69925f9773b6d.png_dbdf2d3404-1280.webp 1280w, IMG/webp/312ff7244196121.69925f9773b6d.png_dbdf2d3404.webp 2800w",
      srcOriginal: "https://freight.cargo.site/t/original/i/S2849442492831123208635458990787/312ff7244196121.69925f9773b6d.png.jpg",
      orientation: "h",
      span: 1,
      tags: ["ilustración", "gráfico", "afiche"],
      title: "Afiche Día de los Patrimonios 2024",
      author: "Cristina Tapia Robles",
      role: "",
      collab: "Ministerio de las Culturas, las Artes y el Patrimonio. Secretaría de Comunicaciones. Director del Departamento Creativo y Dirección de Arte: Maximiliano Andrade. Ilustraciones de apoyo y lettering: Carla Marrazo.",
      area: "Ilustración / Gráfico / Afiche",
      year: "2024",
      url: "https://www.behance.net/gallery/244196121/Afiche-Dia-de-los-Patrimonios-2024"
    },

    /* ------------------ Cuenta Pública 2024 (gráfica) — Cristina Tapia Robles ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.26.04_80199ec066.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.26.04_80199ec066.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.26.04_80199ec066-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.26.04_80199ec066-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.26.04_80199ec066.avif 1382w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.26.04_80199ec066-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.26.04_80199ec066-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.26.04_80199ec066.webp 1382w",
      srcOriginal: "https://freight.cargo.site/t/original/i/U2849442848465902205681904595651/Captura-de-pantalla-2026-03-20-a-las-16.26.04.png",
      orientation: "h",
      span: 1,
      tags: ["identidad visual", "dirección creativa"],
      title: "Cuenta Pública 2024 (gráfica)",
      author: "Cristina Tapia Robles",
      role: "",
      collab: "Año 2024. Subcreteraría de Comunicaciones de Gobierno. Director Creativo: Maximiliano Andrade. Apoyo en diseño de Redes Sociales: Camilo Castillo.",
      area: "Identidad visual / Dirección creativa",
      year: "2024",
      url: "https://www.behance.net/gallery/243783229/Linea-grafica-Cuenta-Publica-2024"
    },

    /* ------------------ La Distancia Adecuada entre Dos Puntos — Sebastián Cobo ------------------ */
    {
      src: "IMG/webp/KSTNINAU_acce78b5ec.webp",
      srcAvif: "IMG/avif/KSTNINAU_acce78b5ec.avif",
      srcSetAvif: "IMG/avif/variants/KSTNINAU_acce78b5ec-640.avif 640w, IMG/avif/KSTNINAU_acce78b5ec.avif 1080w",
      srcSetWebp: "IMG/webp/variants/KSTNINAU_acce78b5ec-640.webp 640w, IMG/webp/KSTNINAU_acce78b5ec.webp 1080w",
      srcOriginal: "https://freight.cargo.site/t/original/i/U2849442492849569952709168542403/KSTNINAU.jpg",
      orientation: "v",
      span: 1,
      tags: ["arte", "exhibición"],
      title: "La Distancia Adecuada entre Dos Puntos",
      author: "Sebastián Cobo",
      role: "Diseñador / Artista",
      collab: "",
      area: "Arte / Exhibición",
      year: "2024",
      url: "https://sebastiancobo.com/Work"
    },

    /* ------------------ DIOPTRÍA -397 — Sebastián Cobo ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.40.28_8d627722c4.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.40.28_8d627722c4.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.40.28_8d627722c4-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.40.28_8d627722c4-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.40.28_8d627722c4.avif 1394w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.40.28_8d627722c4-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.40.28_8d627722c4-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.40.28_8d627722c4.webp 1394w",
      srcOriginal: "https://freight.cargo.site/t/original/i/W2849442848429008717534485492419/Captura-de-pantalla-2026-03-20-a-las-16.40.28.png",
      orientation: "h",
      span: 1,
      tags: ["arte", "exhibición", "luminaria", "objeto"],
      title: "DIOPTRÍA -397",
      author: "Sebastián Cobo",
      role: "Diseñador / Artista",
      collab: "Arte, Diseño y Dirección Proyecto: Sebastián Cobo. Arquitecto Colaborador: Victoria Mohr (@vmohrf). Construcción: Arturo Parada + Sebastián Cobo. Montaje: Carlos León + Sebastián Cobo. Fotografía: Felipe Ugalde (@fugalde).",
      area: "Arte / Exhibición / Luminaria / Objeto",
      year: "2023",
      url: "https://sebastiancobo.com/Work"
    },

    /* ------------------ Diagrama del Agua I y Diagrama del Agua II (Incompleto) — Sebastián Cobo ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.41.34_d75f7bad4a.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.41.34_d75f7bad4a.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.41.34_d75f7bad4a-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.41.34_d75f7bad4a-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.41.34_d75f7bad4a.avif 1418w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.41.34_d75f7bad4a-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.41.34_d75f7bad4a-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.41.34_d75f7bad4a.webp 1418w",
      srcOriginal: "https://freight.cargo.site/t/original/i/Q2849442848410561973460775940803/Captura-de-pantalla-2026-03-20-a-las-16.41.34.png",
      orientation: "h",
      span: 1,
      tags: ["arte", "exhibición"],
      title: "Diagrama del Agua I y Diagrama del Agua II (Incompleto)",
      author: "Sebastián Cobo",
      role: "Diseñador / Artista",
      collab: "Editados e Impresos por Diego Romo. Registros por Felipe Ugalde (@fugalde) y Pia Bahamondes (@plataforma_visual).",
      area: "Arte / Exhibición",
      year: "2022",
      url: "https://sebastiancobo.com/Work"
    },

    /* ------------------ Campo Difuso — Exposición Colectiva Taller Las Nieves — Sebastián Cobo ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.42.51_19a3979456.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.42.51_19a3979456.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.42.51_19a3979456-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.42.51_19a3979456-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.42.51_19a3979456.avif 1504w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.42.51_19a3979456-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.42.51_19a3979456-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.42.51_19a3979456.webp 1504w",
      srcOriginal: "https://freight.cargo.site/t/original/i/D2849442848392115229387066389187/Captura-de-pantalla-2026-03-20-a-las-16.42.51.png",
      orientation: "h",
      span: 1,
      tags: ["arte", "exhibición"],
      title: "Campo Difuso — Exposición Colectiva Taller Las Nieves",
      author: "Sebastián Cobo",
      role: "Diseñador / Artista",
      collab: "",
      area: "Arte / Exhibición",
      year: "2022",
      url: "https://sebastiancobo.com/Work"
    },

    /* ------------------ Wildscapes - Manquehue — Juan Croxatto ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.47.05_7bb5444ddb.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.47.05_7bb5444ddb.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.47.05_7bb5444ddb-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.47.05_7bb5444ddb-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.47.05_7bb5444ddb.avif 2854w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.47.05_7bb5444ddb-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.47.05_7bb5444ddb-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.47.05_7bb5444ddb.webp 2854w",
      srcOriginal: "https://freight.cargo.site/t/original/i/U2849442848373668485313356837571/Captura-de-pantalla-2026-03-20-a-las-16.47.05.png",
      orientation: "h",
      span: 1,
      tags: ["audiovisual", "fotografía", "dirección creativa"],
      title: "Wildscapes - Manquehue",
      author: "Juan Croxatto",
      role: "Diseñador",
      collab: "",
      area: "Audiovisual / Fotografía / Dirección creativa",
      year: "2025",
      url: "https://www.youtube.com/watch?v=BrlIZ78BVPs"
    },

    /* ------------------ Fotografía producto — josefa diaz moller ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.49.49_e002462c17.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.49.49_e002462c17.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.49.49_e002462c17-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.49.49_e002462c17.avif 1194w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.49.49_e002462c17-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.49.49_e002462c17.webp 1194w",
      srcOriginal: "https://freight.cargo.site/t/original/i/D2849442848355221741239647285955/Captura-de-pantalla-2026-03-20-a-las-16.49.49.png",
      orientation: "h",
      span: 1,
      tags: ["fotografía"],
      title: "Fotografía producto",
      author: "josefa diaz moller",
      role: "Diseñadora / fotógrafa",
      collab: "",
      area: "Fotografía",
      year: "n/a",
      url: "https://josefadiaz.cl/producto/"
    },

    /* ------------------ Fotografía producto — josefa diaz moller ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.52.52_7ce23b7290.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.52.52_7ce23b7290.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.52.52_7ce23b7290-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.52.52_7ce23b7290-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.52.52_7ce23b7290.avif 1510w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.52.52_7ce23b7290-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.52.52_7ce23b7290-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.52.52_7ce23b7290.webp 1510w",
      srcOriginal: "https://freight.cargo.site/t/original/i/R2849442848336774997165937734339/Captura-de-pantalla-2026-03-20-a-las-16.52.52.png",
      orientation: "h",
      span: 1,
      tags: ["fotografía"],
      title: "Fotografía producto",
      author: "josefa diaz moller",
      role: "Diseñadora / fotógrafa",
      collab: "",
      area: "Fotografía",
      year: "n/a",
      url: "https://josefadiaz.cl/moda/"
    },

    /* ------------------ Fotografía gastronomía — josefa diaz moller ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.53.26_7f0fd20e45.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.53.26_7f0fd20e45.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.53.26_7f0fd20e45-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.53.26_7f0fd20e45.avif 672w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.53.26_7f0fd20e45-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.53.26_7f0fd20e45.webp 672w",
      srcOriginal: "https://freight.cargo.site/t/original/i/T2849442848318328253092228182723/Captura-de-pantalla-2026-03-20-a-las-16.53.26.png",
      orientation: "h",
      span: 1,
      tags: ["fotografía"],
      title: "Fotografía gastronomía",
      author: "josefa diaz moller",
      role: "Diseñadora / fotógrafa",
      collab: "",
      area: "Fotografía",
      year: "n/a",
      url: "https://josefadiaz.cl/gastronomia/"
    },

    /* ------------------ Fotografía montaña — josefa diaz moller ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.55.06_5330f112bf.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.55.06_5330f112bf.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.55.06_5330f112bf-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.55.06_5330f112bf.avif 1150w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.55.06_5330f112bf-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.55.06_5330f112bf.webp 1150w",
      srcOriginal: "https://freight.cargo.site/t/original/i/J2849442848299881509018518631107/Captura-de-pantalla-2026-03-20-a-las-16.55.06.png",
      orientation: "h",
      span: 1,
      tags: ["fotografía"],
      title: "Fotografía montaña",
      author: "josefa diaz moller",
      role: "Diseñadora / fotógrafa",
      collab: "",
      area: "Fotografía",
      year: "n/a",
      url: "https://josefadiaz.cl/montana/"
    },

    /* ------------------ Fotografía interiores — josefa diaz moller ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.55.22_cc4cc5b5f3.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.55.22_cc4cc5b5f3.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-20-a-las-16.55.22_cc4cc5b5f3-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-20-a-las-16.55.22_cc4cc5b5f3.avif 1146w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-20-a-las-16.55.22_cc4cc5b5f3-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-20-a-las-16.55.22_cc4cc5b5f3.webp 1146w",
      srcOriginal: "https://freight.cargo.site/t/original/i/F2849442848281434764944809079491/Captura-de-pantalla-2026-03-20-a-las-16.55.22.png",
      orientation: "h",
      span: 1,
      tags: ["fotografía"],
      title: "Fotografía interiores",
      author: "josefa diaz moller",
      role: "Diseñadora / fotógrafa",
      collab: "",
      area: "Fotografía",
      year: "n/a",
      url: "https://josefadiaz.cl/interiores/"
    },

    /* ------------------ Infografías para el Parque Humedal del Río Maipo — Catalina Hildebrandt ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2025-03-12-a-las-20.40.12.png_0c487ee9b0.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2025-03-12-a-las-20.40.12.png_0c487ee9b0.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2025-03-12-a-las-20.40.12.png_0c487ee9b0-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2025-03-12-a-las-20.40.12.png_0c487ee9b0-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2025-03-12-a-las-20.40.12.png_0c487ee9b0.avif 2500w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2025-03-12-a-las-20.40.12.png_0c487ee9b0-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2025-03-12-a-las-20.40.12.png_0c487ee9b0-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2025-03-12-a-las-20.40.12.png_0c487ee9b0.webp 2500w",
      srcOriginal: "https://freight.cargo.site/t/original/i/J2850922353802367897247599243971/Captura-de-pantalla-2025-03-12-a-las-20.40.12.png.jpg",
      orientation: "h",
      span: 1,
      tags: ["infografía", "ilustración", "editorial"],
      title: "Infografías para el Parque Humedal del Río Maipo",
      author: "Catalina Hildebrandt",
      role: "Diseñadora / Ilustradora",
      collab: "Dirección de arte: Camila Pascual.",
      area: "Infografía / Ilustración / Editorial",
      year: "n/a",
      url: "https://www.catalinahildebrandt.com/phrm-infographics-1"
    },

    /* ------------------ Proyecto de Preservación de Tradiciones Chilenas — Catalina Hildebrandt ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2025-03-13-a-las-18.05.50.png_eebeef280f.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2025-03-13-a-las-18.05.50.png_eebeef280f.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2025-03-13-a-las-18.05.50.png_eebeef280f-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2025-03-13-a-las-18.05.50.png_eebeef280f-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2025-03-13-a-las-18.05.50.png_eebeef280f.avif 1634w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2025-03-13-a-las-18.05.50.png_eebeef280f-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2025-03-13-a-las-18.05.50.png_eebeef280f-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2025-03-13-a-las-18.05.50.png_eebeef280f.webp 1634w",
      srcOriginal: "https://freight.cargo.site/t/original/i/A2850922353820814641321308795587/Captura-de-pantalla-2025-03-13-a-las-18.05.50.png.jpg",
      orientation: "h",
      span: 1,
      tags: ["ilustración", "gráfico"],
      title: "Proyecto de Preservación de Tradiciones Chilenas",
      author: "Catalina Hildebrandt",
      role: "Diseñadora / Ilustradora",
      collab: "Colaboración con la FAO (Organización de las Naciones Unidas para la Alimentación y la Agricultura)",
      area: "Ilustración / Gráfico",
      year: "n/a",
      url: "https://www.catalinahildebrandt.com/un-project"
    },

    /* ------------------ Chincol — Catalina Hildebrandt ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-21-a-las-14.44.41_eca9b00c2a.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-21-a-las-14.44.41_eca9b00c2a.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-21-a-las-14.44.41_eca9b00c2a-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-21-a-las-14.44.41_eca9b00c2a-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-21-a-las-14.44.41_eca9b00c2a.avif 1884w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-21-a-las-14.44.41_eca9b00c2a-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-21-a-las-14.44.41_eca9b00c2a-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-21-a-las-14.44.41_eca9b00c2a.webp 1884w",
      srcOriginal: "https://freight.cargo.site/t/original/i/I2850921871604477810479920001731/Captura-de-pantalla-2026-03-21-a-las-14.44.41.png",
      orientation: "h",
      span: 1,
      tags: ["ilustración", "gráfico"],
      title: "Chincol",
      author: "Catalina Hildebrandt",
      role: "Diseñadora / Ilustradora",
      collab: "",
      area: "Ilustración / Gráfico",
      year: "2025",
      url: "https://www.instagram.com/p/DS0WTRfgF8y/"
    },

    /* ------------------ Vestido Letualle Pesto — Luz María Hurtado ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-21-a-las-14.48.43_52eeb8be5c.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-21-a-las-14.48.43_52eeb8be5c.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-21-a-las-14.48.43_52eeb8be5c-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-21-a-las-14.48.43_52eeb8be5c.avif 1070w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-21-a-las-14.48.43_52eeb8be5c-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-21-a-las-14.48.43_52eeb8be5c.webp 1070w",
      srcOriginal: "https://freight.cargo.site/t/original/i/W2850921871715158274922177311427/Captura-de-pantalla-2026-03-21-a-las-14.48.43.png",
      orientation: "h",
      span: 1,
      tags: ["moda", "textil", "indumentaria"],
      title: "Vestido Letualle Pesto",
      author: "Luz María Hurtado",
      role: "Diseñadora / Fundadora",
      collab: "Desarrollado en Luz Hurtado",
      area: "Moda / Textil / Indumentaria",
      year: "2025",
      url: "https://luzhurtado.cl/products/vestido-arles-pesto"
    },

    /* ------------------ Traje Velour Negro — Luz María Hurtado ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-21-a-las-14.50.50_96c2019b0a.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-21-a-las-14.50.50_96c2019b0a.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-21-a-las-14.50.50_96c2019b0a-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-21-a-las-14.50.50_96c2019b0a.avif 1072w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-21-a-las-14.50.50_96c2019b0a-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-21-a-las-14.50.50_96c2019b0a.webp 1072w",
      srcOriginal: "https://freight.cargo.site/t/original/i/J2850921871696711530848467759811/Captura-de-pantalla-2026-03-21-a-las-14.50.50.png",
      orientation: "h",
      span: 1,
      tags: ["moda", "textil", "indumentaria"],
      title: "Traje Velour Negro",
      author: "Luz María Hurtado",
      role: "Diseñadora / Fundadora",
      collab: "Desarrollado en Luz Hurtado",
      area: "Moda / Textil / Indumentaria",
      year: "2025",
      url: "https://luzhurtado.cl/products/traje-avignon-negro"
    },

    /* ------------------ Vestido Lune Rosa print — Luz María Hurtado ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-21-a-las-14.51.46_a71e56e14b.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-21-a-las-14.51.46_a71e56e14b.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-21-a-las-14.51.46_a71e56e14b-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-21-a-las-14.51.46_a71e56e14b.avif 690w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-21-a-las-14.51.46_a71e56e14b-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-21-a-las-14.51.46_a71e56e14b.webp 690w",
      srcOriginal: "https://freight.cargo.site/t/original/i/A2850921871678264786774758208195/Captura-de-pantalla-2026-03-21-a-las-14.51.46.png",
      orientation: "h",
      span: 1,
      tags: ["moda", "textil", "indumentaria"],
      title: "Vestido Lune Rosa print",
      author: "Luz María Hurtado",
      role: "Diseñadora / Fundadora",
      collab: "Desarrollado en Luz Hurtado",
      area: "Moda / Textil / Indumentaria",
      year: "2025",
      url: "https://luzhurtado.cl/products/vestido-vence-rosa-print"
    },

    /* ------------------ Terraneo — Jacinta Navarro ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-21-a-las-14.56.39_225d4d9d70.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-21-a-las-14.56.39_225d4d9d70.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-21-a-las-14.56.39_225d4d9d70-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-21-a-las-14.56.39_225d4d9d70.avif 994w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-21-a-las-14.56.39_225d4d9d70-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-21-a-las-14.56.39_225d4d9d70.webp 994w",
      srcOriginal: "https://freight.cargo.site/t/original/i/S2850921871659818042701048656579/Captura-de-pantalla-2026-03-21-a-las-14.56.39.png",
      orientation: "h",
      span: 1,
      tags: ["branding", "identidad visual"],
      title: "Terraneo",
      author: "Jacinta Navarro",
      role: "",
      collab: "",
      area: "Branding / Identidad visual",
      year: "n/a",
      url: "https://www.jacintanavarro.com/branding"
    },

    /* ------------------ CAFEXPRESS (Rebranding y diseño de servicio) — Antonia Paulsen ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-21-a-las-15.01.13_010b0e2d51.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-21-a-las-15.01.13_010b0e2d51.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-21-a-las-15.01.13_010b0e2d51-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-21-a-las-15.01.13_010b0e2d51.avif 1204w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-21-a-las-15.01.13_010b0e2d51-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-21-a-las-15.01.13_010b0e2d51.webp 1204w",
      srcOriginal: "https://freight.cargo.site/t/original/i/E2850921871641371298627339104963/Captura-de-pantalla-2026-03-21-a-las-15.01.13.png",
      orientation: "h",
      span: 1,
      tags: ["branding", "identidad visual", "diseño de servicio"],
      title: "CAFEXPRESS (Rebranding y diseño de servicio)",
      author: "Antonia Paulsen",
      role: "",
      collab: "Desarrollado en Zooma.design estudio",
      area: "Branding / Identidad visual / Diseño de servicio",
      year: "2025",
      url: "https://www.linkedin.com/feed/update/urn:li:activity:7440397315829440512/"
    },

    /* ------------------ Educación Ciudadana — Antonia Paulsen ------------------ */
    {
      src: "IMG/webp/12_d021726e6b.webp",
      srcAvif: "IMG/avif/12_d021726e6b.avif",
      srcSetAvif: "IMG/avif/variants/12_d021726e6b-640.avif 640w, IMG/avif/variants/12_d021726e6b-1280.avif 1280w, IMG/avif/12_d021726e6b.avif 1920w",
      srcSetWebp: "IMG/webp/variants/12_d021726e6b-640.webp 640w, IMG/webp/variants/12_d021726e6b-1280.webp 1280w, IMG/webp/12_d021726e6b.webp 1920w",
      srcOriginal: "https://freight.cargo.site/t/original/i/J2850921671881579724426604655299/12.jpg",
      orientation: "h",
      span: 1,
      tags: ["editorial", "ilustración"],
      title: "Educación Ciudadana",
      author: "Antonia Paulsen",
      role: "",
      collab: "Desarrollado en Zooma.design estudio",
      area: "Editorial / Ilustración",
      year: "n/a",
      url: "https://www.zooma.cl/proyecto_post/educacion-ciudadana/"
    },

    /* ------------------ mycoloop — Ana Schacht ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-21-a-las-15.10.36_8b3af43d7b.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-21-a-las-15.10.36_8b3af43d7b.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-21-a-las-15.10.36_8b3af43d7b-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-21-a-las-15.10.36_8b3af43d7b-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-21-a-las-15.10.36_8b3af43d7b.avif 1814w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-21-a-las-15.10.36_8b3af43d7b-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-21-a-las-15.10.36_8b3af43d7b-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-21-a-las-15.10.36_8b3af43d7b.webp 1814w",
      srcOriginal: "https://freight.cargo.site/t/original/i/V2850921871622924554553629553347/Captura-de-pantalla-2026-03-21-a-las-15.10.36.png",
      orientation: "h",
      span: 1,
      tags: ["investigación", "biomaterial", "innovación"],
      title: "mycoloop",
      author: "Ana Schacht",
      role: "",
      collab: "",
      area: "Investigación / Biomaterial / Innovación",
      year: "2023",
      url: "https://www.instagram.com/p/Cs0aovjIXRN/?img_index=1"
    },

    /* ------------------ Hack The Waste — Rayén Espinoza ------------------ */
    {
      src: "IMG/webp/511533155_17844286302519564_1167360669655593300_n_819e324d57.webp",
      srcAvif: "IMG/avif/511533155_17844286302519564_1167360669655593300_n_819e324d57.avif",
      srcSetAvif: "IMG/avif/variants/511533155_17844286302519564_1167360669655593300_n_819e324d57-640.avif 640w, IMG/avif/511533155_17844286302519564_1167360669655593300_n_819e324d57.avif 1023w",
      srcSetWebp: "IMG/webp/variants/511533155_17844286302519564_1167360669655593300_n_819e324d57-640.webp 640w, IMG/webp/511533155_17844286302519564_1167360669655593300_n_819e324d57.webp 1023w",
      srcOriginal: "https://freight.cargo.site/t/original/i/N2852815603559739549928730866371/511533155_17844286302519564_1167360669655593300_n.jpg",
      orientation: "sq",
      span: 1,
      tags: ["investigación", "innovación", "tecnología"],
      title: "Hack The Waste",
      author: "Rayén Espinoza",
      role: "",
      collab: "Proyecto de título. Guiatura por: Tomás Vivanco",
      area: "Investigación / Innovación / Tecnología",
      year: "2025",
      url: ["https://sprightly-scone-49459d.netlify.app", "https://www.instagram.com/reel/DLiuXM4MEfh/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="]
    },

    /* ------------------ THE ART OF DESTRUCTION — Sebastián Tala ------------------ */
    {
      src: "IMG/webp/2131a770-aa3d-445d-a090-c91ec342000f_rw_1920_748c6801cd.webp",
      srcAvif: "IMG/avif/2131a770-aa3d-445d-a090-c91ec342000f_rw_1920_748c6801cd.avif",
      srcSetAvif: "IMG/avif/variants/2131a770-aa3d-445d-a090-c91ec342000f_rw_1920_748c6801cd-640.avif 640w, IMG/avif/variants/2131a770-aa3d-445d-a090-c91ec342000f_rw_1920_748c6801cd-1280.avif 1280w, IMG/avif/2131a770-aa3d-445d-a090-c91ec342000f_rw_1920_748c6801cd.avif 1365w",
      srcSetWebp: "IMG/webp/variants/2131a770-aa3d-445d-a090-c91ec342000f_rw_1920_748c6801cd-640.webp 640w, IMG/webp/variants/2131a770-aa3d-445d-a090-c91ec342000f_rw_1920_748c6801cd-1280.webp 1280w, IMG/webp/2131a770-aa3d-445d-a090-c91ec342000f_rw_1920_748c6801cd.webp 1365w",
      srcOriginal: "https://freight.cargo.site/t/original/i/O2852814018873743153835989742275/2131a770-aa3d-445d-a090-c91ec342000f_rw_1920.jpg",
      orientation: "v",
      span: 1,
      tags: ["indumentaria", "textil", "moda"],
      title: "THE ART OF DESTRUCTION",
      author: "Sebastián Tala",
      role: "",
      collab: "Modelo & MAquillaje: Pascale Blanchard. Diseño, Confección, Fotografía & ESTILISMO: Sebastián Tala.",
      area: "Indumentaria / Textil / Moda",
      year: "2023",
      url: "https://sebatala.myportfolio.com/the-art-of-destruction"
    },

    /* ------------------ Under Armour Chile Tienda Online — Victoria Schuwirth Montero ------------------ */
    {
      src: "IMG/webp/1764867718402_ac2420b8d1.webp",
      srcAvif: "IMG/avif/1764867718402_ac2420b8d1.avif",
      srcSetAvif: "IMG/avif/variants/1764867718402_ac2420b8d1-640.avif 640w, IMG/avif/variants/1764867718402_ac2420b8d1-1280.avif 1280w, IMG/avif/1764867718402_ac2420b8d1.avif 1835w",
      srcSetWebp: "IMG/webp/variants/1764867718402_ac2420b8d1-640.webp 640w, IMG/webp/variants/1764867718402_ac2420b8d1-1280.webp 1280w, IMG/webp/1764867718402_ac2420b8d1.webp 1835w",
      srcOriginal: "https://freight.cargo.site/t/original/i/D2852814018855296409762280190659/1764867718402.jpeg",
      orientation: "h",
      span: 1,
      tags: ["web", "tienda online"],
      title: "Under Armour Chile Tienda Online",
      author: "Victoria Schuwirth Montero",
      role: "",
      collab: "Desarrollado en LAB 51. Victoria Schuwirth Montero: UX/UI designer, product manager.",
      area: "Web / Tienda online",
      year: "2025",
      url: "https://www.linkedin.com/posts/lab51-chile_lab51-shopifyplus-ecommerce-activity-7402440321755783168-CT6J?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro"
    },

    /* ------------------ Rediseño tarjetas banco ripley — Andrés Valdivieso Vera ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-22-a-las-18.18.16_4fcf9fc643.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-22-a-las-18.18.16_4fcf9fc643.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-18.18.16_4fcf9fc643-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-22-a-las-18.18.16_4fcf9fc643.avif 740w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-18.18.16_4fcf9fc643-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-22-a-las-18.18.16_4fcf9fc643.webp 740w",
      srcOriginal: "https://freight.cargo.site/t/original/i/I2852814227893800253038919103171/Captura-de-pantalla-2026-03-22-a-las-18.18.16.png",
      orientation: "h",
      span: 1,
      tags: ["diseño gráfico", "producto"],
      title: "Rediseño tarjetas banco ripley",
      author: "Andrés Valdivieso Vera",
      role: "",
      collab: "",
      area: "Diseño gráfico / Producto",
      year: "2022",
      url: "https://www.behance.net/gallery/136507291/Rediseno-tarjetas-banco-ripley"
    },

    /* ------------------ Sin Nombre — Andrés Valdivieso Vera ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-22-a-las-19.44.55_5372f1d386.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-22-a-las-19.44.55_5372f1d386.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-19.44.55_5372f1d386-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-22-a-las-19.44.55_5372f1d386.avif 1188w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-19.44.55_5372f1d386-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-22-a-las-19.44.55_5372f1d386.webp 1188w",
      srcOriginal: "https://freight.cargo.site/t/original/i/D2852816694961352670954352227011/Captura-de-pantalla-2026-03-22-a-las-19.44.55.png",
      orientation: "h",
      span: 1,
      tags: ["ilustración"],
      title: "Sin Nombre",
      author: "Andrés Valdivieso Vera",
      role: "",
      collab: "",
      area: "Ilustración",
      year: "2023",
      url: "https://www.instagram.com/p/CxRHxY2Jq3Z/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },

    /* ------------------ Axis 1.1 — Pablo Gutiérrez ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-22-a-las-18.21.11_650544f058.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-22-a-las-18.21.11_650544f058.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-18.21.11_650544f058-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-22-a-las-18.21.11_650544f058.avif 658w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-18.21.11_650544f058-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-22-a-las-18.21.11_650544f058.webp 658w",
      srcOriginal: "https://freight.cargo.site/t/original/i/G2852814228059820949702305067715/Captura-de-pantalla-2026-03-22-a-las-18.21.11.png",
      orientation: "v",
      span: 1,
      tags: ["producto", "3D", "objeto"],
      title: "Axis 1.1",
      author: "Pablo Gutiérrez",
      role: "Diseñador / Cofundador",
      collab: "Desarrollado en Itera Studio",
      area: "Producto / 3D / Objeto",
      year: "2026",
      url: ["https://www.instagram.com/p/DV9rbzLFeOa/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "https://drive.google.com/file/d/1UwALiYZEpGeHibhGB-oHQfw3eYkwN7YY/view?fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnAuwvC8CldrBtZxAcBrM4dPhmg0fBMGWpnQK2NYRiSYRVzxdWksDjYWCVQus_aem_DW5z4OxsLm2uIWMMfrodJA"]
    },

    /* ------------------ ABC Pediatrics Book — Claudia Zavala ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-22-a-las-18.27.43_32e135a381.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-22-a-las-18.27.43_32e135a381.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-18.27.43_32e135a381-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-18.27.43_32e135a381-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-22-a-las-18.27.43_32e135a381.avif 2670w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-18.27.43_32e135a381-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-18.27.43_32e135a381-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-22-a-las-18.27.43_32e135a381.webp 2670w",
      srcOriginal: "https://freight.cargo.site/t/original/i/K2852814228041374205628595516099/Captura-de-pantalla-2026-03-22-a-las-18.27.43.png",
      orientation: "h",
      span: 1,
      tags: ["ilustración", "editorial"],
      title: "ABC Pediatrics Book",
      author: "Claudia Zavala",
      role: "Diseñadora / Ilustradora",
      collab: "",
      area: "Ilustración / Editorial",
      year: "2023",
      url: "https://www.behance.net/gallery/163952093/ABC-Pediatrics-Book"
    },

    /* ------------------ Minie The Squirrel - Picture Book — Claudia Zavala ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-22-a-las-18.29.27_3aa46b8e31.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-22-a-las-18.29.27_3aa46b8e31.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-18.29.27_3aa46b8e31-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-18.29.27_3aa46b8e31-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-22-a-las-18.29.27_3aa46b8e31.avif 1488w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-18.29.27_3aa46b8e31-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-18.29.27_3aa46b8e31-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-22-a-las-18.29.27_3aa46b8e31.webp 1488w",
      srcOriginal: "https://freight.cargo.site/t/original/i/H2852814228022927461554885964483/Captura-de-pantalla-2026-03-22-a-las-18.29.27.png",
      orientation: "h",
      span: 1,
      tags: ["ilustración", "editorial"],
      title: "Minie The Squirrel - Picture Book",
      author: "Claudia Zavala",
      role: "Diseñadora / Ilustradora",
      collab: "",
      area: "Ilustración / Editorial",
      year: "2022",
      url: "https://www.behance.net/gallery/152520679/Minie-The-Squirrel-Picture-Book"
    },

    /* ------------------ Hacia un habitar regenerativo en la Patagonia: guía de diseño para Conjuntos Residenciales Rurales — Martita Apel ------------------ */
    {
      src: "IMG/webp/1759151436277_9126a73eb7.webp",
      srcAvif: "IMG/avif/1759151436277_9126a73eb7.avif",
      srcSetAvif: "IMG/avif/variants/1759151436277_9126a73eb7-640.avif 640w, IMG/avif/variants/1759151436277_9126a73eb7-1280.avif 1280w, IMG/avif/1759151436277_9126a73eb7.avif 1600w",
      srcSetWebp: "IMG/webp/variants/1759151436277_9126a73eb7-640.webp 640w, IMG/webp/variants/1759151436277_9126a73eb7-1280.webp 1280w, IMG/webp/1759151436277_9126a73eb7.webp 1600w",
      srcOriginal: "https://freight.cargo.site/t/original/i/I2852814018836849665688570639043/1759151436277.jpeg",
      orientation: "h",
      span: 1,
      tags: ["editorial"],
      title: "Hacia un habitar regenerativo en la Patagonia: guía de diseño para Conjuntos Residenciales Rurales",
      author: "Martita Apel",
      role: "",
      collab: "Desarrollada junto a Queule en Estudio Postal.",
      area: "Editorial",
      year: "2025",
      url: "https://www.linkedin.com/posts/estudio-postal_diseaehoeditorial-estudiopostal-diseaehograerfico-ugcPost-7378415926003798016-zkUo?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro"
    },

    /* ------------------ Ediciones ARQ - Portadas Nº 116-117-118 — Martita Apel ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-22-a-las-18.36.49_515aca71ed.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-22-a-las-18.36.49_515aca71ed.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-18.36.49_515aca71ed-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-18.36.49_515aca71ed-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-22-a-las-18.36.49_515aca71ed.avif 2370w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-18.36.49_515aca71ed-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-18.36.49_515aca71ed-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-22-a-las-18.36.49_515aca71ed.webp 2370w",
      srcOriginal: "https://freight.cargo.site/t/original/i/D2852814228004480717481176412867/Captura-de-pantalla-2026-03-22-a-las-18.36.49.png",
      orientation: "h",
      span: 1,
      tags: ["editorial"],
      title: "Ediciones ARQ - Portadas Nº 116-117-118",
      author: "Martita Apel",
      role: "",
      collab: "",
      area: "Editorial",
      year: "2024",
      url: "https://www.behance.net/gallery/233567245/Ediciones-ARQ-Portadas-N-116-117-118"
    },

    /* ------------------ Informe 8 años Meric — Antonio Batlle Lathrop ------------------ */
    {
      src: "IMG/webp/fd757cff-a94d-4766-9369-786372051f8d_rw_1920_e2bb161c8f.webp",
      srcAvif: "IMG/avif/fd757cff-a94d-4766-9369-786372051f8d_rw_1920_e2bb161c8f.avif",
      srcSetAvif: "IMG/avif/variants/fd757cff-a94d-4766-9369-786372051f8d_rw_1920_e2bb161c8f-640.avif 640w, IMG/avif/variants/fd757cff-a94d-4766-9369-786372051f8d_rw_1920_e2bb161c8f-1280.avif 1280w, IMG/avif/fd757cff-a94d-4766-9369-786372051f8d_rw_1920_e2bb161c8f.avif 1920w",
      srcSetWebp: "IMG/webp/variants/fd757cff-a94d-4766-9369-786372051f8d_rw_1920_e2bb161c8f-640.webp 640w, IMG/webp/variants/fd757cff-a94d-4766-9369-786372051f8d_rw_1920_e2bb161c8f-1280.webp 1280w, IMG/webp/fd757cff-a94d-4766-9369-786372051f8d_rw_1920_e2bb161c8f.webp 1920w",
      srcOriginal: "https://freight.cargo.site/t/original/i/I2852814018818402921614861087427/fd757cff-a94d-4766-9369-786372051f8d_rw_1920.png",
      orientation: "h",
      span: 1,
      tags: ["editorial"],
      title: "Informe 8 años Meric",
      author: "Antonio Batlle Lathrop",
      role: "",
      collab: "",
      area: "Editorial",
      year: "n/a",
      url: "https://batlle.work/diseno-editorial-informe-10-anos-meric"
    },

    /* ------------------ Manual de Gestión APR - Fundación Huella Local — Antonio Batlle Lathrop ------------------ */
    {
      src: "IMG/webp/13ef0933-9b95-4b11-aec2-ef96906a6450_rw_1920_cc732e5b8b.webp",
      srcAvif: "IMG/avif/13ef0933-9b95-4b11-aec2-ef96906a6450_rw_1920_cc732e5b8b.avif",
      srcSetAvif: "IMG/avif/variants/13ef0933-9b95-4b11-aec2-ef96906a6450_rw_1920_cc732e5b8b-640.avif 640w, IMG/avif/variants/13ef0933-9b95-4b11-aec2-ef96906a6450_rw_1920_cc732e5b8b-1280.avif 1280w, IMG/avif/13ef0933-9b95-4b11-aec2-ef96906a6450_rw_1920_cc732e5b8b.avif 1920w",
      srcSetWebp: "IMG/webp/variants/13ef0933-9b95-4b11-aec2-ef96906a6450_rw_1920_cc732e5b8b-640.webp 640w, IMG/webp/variants/13ef0933-9b95-4b11-aec2-ef96906a6450_rw_1920_cc732e5b8b-1280.webp 1280w, IMG/webp/13ef0933-9b95-4b11-aec2-ef96906a6450_rw_1920_cc732e5b8b.webp 1920w",
      srcOriginal: "https://freight.cargo.site/t/original/i/V2852814018799956177541151535811/13ef0933-9b95-4b11-aec2-ef96906a6450_rw_1920.png",
      orientation: "h",
      span: 1,
      tags: ["editorial"],
      title: "Manual de Gestión APR - Fundación Huella Local",
      author: "Antonio Batlle Lathrop",
      role: "",
      collab: "",
      area: "Editorial",
      year: "n/a",
      url: "https://batlle.work/manual-de-gestion-apr-fundacion-huella-local"
    },

    /* ------------------ NICOPOLY UX/UI - WEB DESIGN — Consuelo Burotto Sánchez ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-22-a-las-19.08.42_405e339a20.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-22-a-las-19.08.42_405e339a20.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-19.08.42_405e339a20-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-19.08.42_405e339a20-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-22-a-las-19.08.42_405e339a20.avif 2562w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-19.08.42_405e339a20-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-19.08.42_405e339a20-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-22-a-las-19.08.42_405e339a20.webp 2562w",
      srcOriginal: "https://freight.cargo.site/t/original/i/V2852814227986033973407466861251/Captura-de-pantalla-2026-03-22-a-las-19.08.42.png",
      orientation: "h",
      span: 1,
      tags: ["web", "tienda online"],
      title: "NICOPOLY UX/UI - WEB DESIGN",
      author: "Consuelo Burotto Sánchez",
      role: "",
      collab: "",
      area: "Web / Tienda online",
      year: "2022",
      url: "https://www.behance.net/gallery/140604569/NICOPOLY-UXUI-WEB-DESIGN"
    },

    /* ------------------ Audioteca Gabriela Mistral — Carmen di Girolamo Arteaga ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-22-a-las-19.15.25_649d9f2614.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-22-a-las-19.15.25_649d9f2614.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-19.15.25_649d9f2614-640.avif 640w, IMG/avif/Captura-de-pantalla-2026-03-22-a-las-19.15.25_649d9f2614.avif 954w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-19.15.25_649d9f2614-640.webp 640w, IMG/webp/Captura-de-pantalla-2026-03-22-a-las-19.15.25_649d9f2614.webp 954w",
      srcOriginal: "https://freight.cargo.site/t/original/i/P2852814227967587229333757309635/Captura-de-pantalla-2026-03-22-a-las-19.15.25.png",
      orientation: "sq",
      span: 1,
      tags: ["innovación", "cultura"],
      title: "Audioteca Gabriela Mistral",
      author: "Carmen di Girolamo Arteaga",
      role: "",
      collab: "Dirección y creación: Diego Boggioni.\nProducción ejecutiva: BT Cultura & Medios.\nProducción general: Diego Boggioni, Carmen Di Girolamo.\nDiseño sonoro y mezcla: David Capdepont, Diego Boggioni / colaboración Santiago Jara.\nDiseñadora gráfica: Carmen di Girolamo.\nProgramador: David Jiménez Lazo.",
      area: "Innovación / Cultura",
      year: "2025",
      url: ["https://www.linkedin.com/posts/carmen-di-girolamo-arteaga-580275b9_no-me-hab%C3%ADa-dado-el-tiempo-de-sentarme-a-activity-7417601780492124160-Bcw3?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro", "https://audiotecagm.cl"]
    },

    /* ------------------ PANTALÓN BEX — Maureen Echeverria Cox ------------------ */
    {
      src: "IMG/webp/2L2A8101_resized_9166c410-1a49-4af8-a202-8936eb9721d6.jpg_dde1113d8d.webp",
      srcAvif: "IMG/avif/2L2A8101_resized_9166c410-1a49-4af8-a202-8936eb9721d6.jpg_dde1113d8d.avif",
      srcSetAvif: "IMG/avif/variants/2L2A8101_resized_9166c410-1a49-4af8-a202-8936eb9721d6.jpg_dde1113d8d-640.avif 640w, IMG/avif/variants/2L2A8101_resized_9166c410-1a49-4af8-a202-8936eb9721d6.jpg_dde1113d8d-1280.avif 1280w, IMG/avif/2L2A8101_resized_9166c410-1a49-4af8-a202-8936eb9721d6.jpg_dde1113d8d.avif 1600w",
      srcSetWebp: "IMG/webp/variants/2L2A8101_resized_9166c410-1a49-4af8-a202-8936eb9721d6.jpg_dde1113d8d-640.webp 640w, IMG/webp/variants/2L2A8101_resized_9166c410-1a49-4af8-a202-8936eb9721d6.jpg_dde1113d8d-1280.webp 1280w, IMG/webp/2L2A8101_resized_9166c410-1a49-4af8-a202-8936eb9721d6.jpg_dde1113d8d.webp 1600w",
      srcOriginal: "https://freight.cargo.site/t/original/i/O2852814018763062689393732432579/2L2A8101_resized_9166c410-1a49-4af8-a202-8936eb9721d6.jpg.jpg",
      orientation: "v",
      span: 1,
      tags: ["moda", "textil", "indumentaria"],
      title: "PANTALÓN BEX",
      author: "Maureen Echeverria Cox",
      role: "Diseñadora / coFundadora",
      collab: "Cofundadora Adeu",
      area: "Moda / Textil / Indumentaria",
      year: "2019",
      url: "https://www.adeu.cl/products/pantalon-bex-crudo"
    },

    /* ------------------ chaqueta indi — Maureen Echeverria Cox ------------------ */
    {
      src: "IMG/webp/Sin_titulo-1-10.jpg_571fb56b4c.webp",
      srcAvif: "IMG/avif/Sin_titulo-1-10.jpg_571fb56b4c.avif",
      srcSetAvif: "IMG/avif/variants/Sin_titulo-1-10.jpg_571fb56b4c-640.avif 640w, IMG/avif/variants/Sin_titulo-1-10.jpg_571fb56b4c-1280.avif 1280w, IMG/avif/Sin_titulo-1-10.jpg_571fb56b4c.avif 2400w",
      srcSetWebp: "IMG/webp/variants/Sin_titulo-1-10.jpg_571fb56b4c-640.webp 640w, IMG/webp/variants/Sin_titulo-1-10.jpg_571fb56b4c-1280.webp 1280w, IMG/webp/Sin_titulo-1-10.jpg_571fb56b4c.webp 2400w",
      srcOriginal: "https://freight.cargo.site/t/original/i/I2852814018744615945320022880963/Sin_titulo-1-10.jpg.jpg",
      orientation: "v",
      span: 1,
      tags: ["moda", "textil", "indumentaria"],
      title: "chaqueta indi",
      author: "Maureen Echeverria Cox",
      role: "Diseñadora / coFundadora",
      collab: "Cofundadora Adeu",
      area: "Moda / Textil / Indumentaria",
      year: "2019",
      url: ["https://www.adeu.cl/products/chaqueta-indi-negra", "https://freight.cargo.site/t/original/i/O2852814018763062689393732432579/2L2A8101_resized_9166c410-1a49-4af8-a202-8936eb9721d6.jpg.jpg"]
    },

    /* ------------------ CHAQUETA KIOTO — Maureen Echeverria Cox ------------------ */
    {
      src: "IMG/webp/lino_pantalon_chaqueta-51.jpg_ba2772e420.webp",
      srcAvif: "IMG/avif/lino_pantalon_chaqueta-51.jpg_ba2772e420.avif",
      srcSetAvif: "IMG/avif/variants/lino_pantalon_chaqueta-51.jpg_ba2772e420-640.avif 640w, IMG/avif/variants/lino_pantalon_chaqueta-51.jpg_ba2772e420-1280.avif 1280w, IMG/avif/lino_pantalon_chaqueta-51.jpg_ba2772e420.avif 2400w",
      srcSetWebp: "IMG/webp/variants/lino_pantalon_chaqueta-51.jpg_ba2772e420-640.webp 640w, IMG/webp/variants/lino_pantalon_chaqueta-51.jpg_ba2772e420-1280.webp 1280w, IMG/webp/lino_pantalon_chaqueta-51.jpg_ba2772e420.webp 2400w",
      srcOriginal: "https://freight.cargo.site/t/original/i/N2852814018726169201246313329347/lino_pantalon_chaqueta-51.jpg.jpg",
      orientation: "v",
      span: 1,
      tags: ["moda", "textil", "indumentaria"],
      title: "CHAQUETA KIOTO",
      author: "Maureen Echeverria Cox",
      role: "Diseñadora / coFundadora",
      collab: "Cofundadora Adeu",
      area: "Moda / Textil / Indumentaria",
      year: "2019",
      url: "https://www.adeu.cl/products/chaqueta-kioto-negro?pr_prod_strat=e5_desc&pr_rec_id=83040df97&pr_rec_pid=7931505574108&pr_ref_pid=8930887598300&pr_seq=uniform"
    },

    /* ------------------ Vestido Aranua flores rojo — Trinidad Murtagh ------------------ */
    {
      src: "IMG/webp/MUTH_72591_d6d6c9dc21.webp",
      srcAvif: "IMG/avif/MUTH_72591_d6d6c9dc21.avif",
      srcSetAvif: "IMG/avif/variants/MUTH_72591_d6d6c9dc21-640.avif 640w, IMG/avif/variants/MUTH_72591_d6d6c9dc21-1280.avif 1280w, IMG/avif/MUTH_72591_d6d6c9dc21.avif 3335w",
      srcSetWebp: "IMG/webp/variants/MUTH_72591_d6d6c9dc21-640.webp 640w, IMG/webp/variants/MUTH_72591_d6d6c9dc21-1280.webp 1280w, IMG/webp/MUTH_72591_d6d6c9dc21.webp 3335w",
      srcOriginal: "https://freight.cargo.site/t/original/i/G2852814018781509433467441984195/MUTH_72591.jpg",
      orientation: "v",
      span: 1,
      tags: ["moda", "textil", "indumentaria"],
      title: "Vestido Aranua flores rojo",
      author: "Trinidad Murtagh",
      role: "",
      collab: "",
      area: "Moda / Textil / Indumentaria",
      year: "2025",
      url: "https://www.muthboutique.cl/products/vestido-aranua-flores-rojo?variant=45041238048905"
    },

    /* ------------------ Vest Anea café — Trinidad Murtagh ------------------ */
    {
      src: "IMG/webp/Captura-de-pantalla-2026-03-22-a-las-19.47.35_b2a949d9ef.webp",
      srcAvif: "IMG/avif/Captura-de-pantalla-2026-03-22-a-las-19.47.35_b2a949d9ef.avif",
      srcSetAvif: "IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-19.47.35_b2a949d9ef-640.avif 640w, IMG/avif/variants/Captura-de-pantalla-2026-03-22-a-las-19.47.35_b2a949d9ef-1280.avif 1280w, IMG/avif/Captura-de-pantalla-2026-03-22-a-las-19.47.35_b2a949d9ef.avif 1356w",
      srcSetWebp: "IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-19.47.35_b2a949d9ef-640.webp 640w, IMG/webp/variants/Captura-de-pantalla-2026-03-22-a-las-19.47.35_b2a949d9ef-1280.webp 1280w, IMG/webp/Captura-de-pantalla-2026-03-22-a-las-19.47.35_b2a949d9ef.webp 1356w",
      srcOriginal: "https://freight.cargo.site/t/original/i/N2852819639836470086094591308483/Captura-de-pantalla-2026-03-22-a-las-19.47.35.png",
      orientation: "v",
      span: 1,
      tags: ["moda", "textil", "indumentaria"],
      title: "Vest Anea café",
      author: "Trinidad Murtagh",
      role: "",
      collab: "",
      area: "Moda / Textil / Indumentaria",
      year: "2025",
      url: "https://www.muthboutique.cl/products/vest-anea-cafe?variant=45046068510857"
    },

    /* ------------------ OKWU — Consuelo Yávar Larraín ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/A2858616679576384489717603185347/1730141673143.jpeg",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["diseño interior", "estudio"],
      keywords: [],
      title: "OKWU",
      author: "Consuelo Yávar Larraín",
      role: "Diseñadora / coFundadora Flux",
      collab: "Proyecto diseñado por DAW GLOBAL, implementado por CROMOLUX. Muebles y equipamientos con cubiertas Flux.",
      area: "diseño interior",
      year: "2026",
      url: [
        "https://www.linkedin.com/posts/consueloyavarlarrain_cuando-nos-embarcamos-en-el-proyecto-de-las-activity-7442659278425047040-uTXT?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro",
        "https://www.linkedin.com/posts/consueloyavarlarrain_circularidad-sin-renuncia-dado-que-la-circularidad-activity-7256740148552372226-cbKi?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro"
      ]
    },

    /* ------------------ Majen — Consuelo Yávar Larraín ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/T2858622597199649615373213840067/1772131344479.jpeg",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["diseño interior", "estudio"],
      keywords: [],
      title: "Majen",
      author: "Consuelo Yávar Larraín",
      role: "Diseñadora / coFundadora Flux",
      collab: "Diseño: DAW GLOBAL. Desarrollado por Flux.",
      area: "diseño interior",
      year: "2025",
      url: [
        "https://www.linkedin.com/posts/consueloyavarlarrain_el-dise%C3%B1o-no-es-decoraci%C3%B3n-es-conversi%C3%B3n-activity-7432857595671044096-9M4T?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro"
      ]
    },

    /* ------------------ María y el fuego — Josefina M. Gajardo ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/R2858617561533665397844975497923/Captura-de-pantalla-2026-03-25-a-las-19.31.42.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["editorial"],
      keywords: ["portada de libro", "fotomontaje digital"],
      title: "María y el fuego",
      author: "Josefina M. Gajardo",
      role: "",
      collab: "",
      area: "editorial",
      year: "2022",
      url: [
        "https://www.behance.net/gallery/157906793/Maria-y-el-fuego"
      ]
    },

    /* ------------------ Mona — Josefina M. Gajardo ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/O2858617561275410980813041775299/Captura-de-pantalla-2026-03-25-a-las-19.31.24.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["editorial", "ilustración"],
      keywords: ["portada de libro", "ilustración digital"],
      title: "Mona",
      author: "Josefina M. Gajardo",
      role: "",
      collab: "",
      area: "editorial",
      year: "2022",
      url: [
        "https://www.behance.net/gallery/157681053/Mona"
      ]
    },

    /* ------------------ APP Fuerza de Ventas — Isidora Hernández ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/X2858622147984537932398212887235/Mockup-_3_.png.jpg",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["app"],
      keywords: ["retail"],
      title: "APP Fuerza de Ventas",
      author: "Isidora Hernández",
      role: "",
      collab: "",
      area: "app",
      year: "n/a",
      url: [
        "https://www.isidorahernandez.com/proyecto-fuerza-de-ventas"
      ]
    },

    /* ------------------ APP Canal Moderno — Isidora Hernández ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/S2858617204127998969722412937923/82f8e9_f32cea179cff4ddba5b95b34b1492b36_mv2.png.jpg",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["app"],
      keywords: ["retail"],
      title: "APP Canal Moderno",
      author: "Isidora Hernández",
      role: "",
      collab: "",
      area: "app",
      year: "n/a",
      url: [
        "https://www.isidorahernandez.com/proyecto-canal-moderno"
      ]
    },

    /* ------------------ VIO — Sofia Hinostroza ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/L2858617561515218653771265946307/Captura-de-pantalla-2026-03-25-a-las-19.40.34.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["investigación", "biomaterial", "innovación"],
      keywords: [],
      title: "VIO",
      author: "Sofia Hinostroza",
      role: "",
      collab: "Guiatura: Lina Cárdenas",
      area: "investigación",
      year: "2019",
      url: [
        "https://www.instagram.com/p/CrjCEJgOpP-/?img_index=1",
        "https://diseno.uc.cl/memorias/pdf/memoria_dno_uc_2019_1_HINOSTROZA_MONTECINO_S.pdf"
      ]
    },

    /* ------------------ DISEÑO DE VESTUARIO WILD LAMA — Alejandra Lange ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/Q2858617561496771909697556394691/Captura-de-pantalla-2026-03-25-a-las-19.42.37.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["indumentaria", "textil", "moda"],
      keywords: ["ropa retail"],
      title: "DISEÑO DE VESTUARIO WILD LAMA",
      author: "Alejandra Lange",
      role: "",
      collab: "Desarrollado en Wild Lama",
      area: "indumentaria",
      year: "2025",
      url: [
        "https://www.behance.net/gallery/219375411/DISENO-DE-VESTUARIO-WILD-LAMA"
      ]
    },

    /* ------------------ DISEÑO DE VESTUARIO MUJER Y HOMBRE - BAJO VERANO 2025 — Alejandra Lange ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/X2858617561478325165623846843075/Captura-de-pantalla-2026-03-25-a-las-19.44.31.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["indumentaria", "textil", "moda"],
      keywords: ["ropa retail"],
      title: "DISEÑO DE VESTUARIO MUJER Y HOMBRE - BAJO VERANO 2025",
      author: "Alejandra Lange",
      role: "",
      collab: "Desarrollado en Wild Lama",
      area: "indumentaria",
      year: "2025",
      url: [
        "https://www.behance.net/gallery/233144891/DISENO-DE-VESTUARIO-WILD-LAMA"
      ]
    },

    /* ------------------ Museo del Holocausto - RECORRIDO HOLOCAUSTO (SHOÁ) — Camila Minzer ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/V2858617561441431677476427739843/Captura-de-pantalla-2026-03-25-a-las-19.49.16.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["museografía", "exhibición"],
      keywords: ["exposición", "historia"],
      title: "Museo del Holocausto - RECORRIDO HOLOCAUSTO (SHOÁ)",
      author: "Camila Minzer",
      role: "Dirección de arte y diseño",
      collab: "Jefatura del proyecto: Sofía Cohen. Curatoría: Beate Wenker, Deborah Roitman.",
      area: "museografía",
      year: "2020",
      url: [
        "https://www.behance.net/gallery/96172895/Museo-del-Holocausto",
        "https://museojudio.cl/recorrido-holocausto/"
      ]
    },

    /* ------------------ REVERSE — Camila Minzer ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/X2858617561422984933402718188227/Captura-de-pantalla-2026-03-25-a-las-19.54.09.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["objeto", "producto"],
      keywords: [],
      title: "REVERSE",
      author: "Camila Minzer",
      role: "",
      collab: "",
      area: "objeto",
      year: "2020",
      url: [
        "https://www.behance.net/gallery/96173081/Reverse"
      ]
    },

    /* ------------------ Patrimonio cultural en cifras — Isidora Val Valdivielso ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/Y2858617561404538189329008636611/Captura-de-pantalla-2026-03-25-a-las-19.58.59.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["editorial"],
      keywords: ["memoria institucional", "informa"],
      title: "Patrimonio cultural en cifras",
      author: "Isidora Val Valdivielso",
      role: "",
      collab: "",
      area: "editorial",
      year: "2022",
      url: [
        "https://www.archivonacional.gob.cl/sites/www.archivonacional.gob.cl/files/2023-12/Patrimonio%20cultural%20en%20cifras%202022.pdf"
      ]
    },

    /* ------------------ Derecho de la Competencia — Isidora Val Valdivielso ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/P2858617561386091445255299084995/Captura-de-pantalla-2026-03-25-a-las-20.01.11.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["editorial"],
      keywords: [],
      title: "Derecho de la Competencia",
      author: "Isidora Val Valdivielso",
      role: "",
      collab: "Una guía global. David J. Gerber. Investigación Centro Competencia UAI.",
      area: "editorial",
      year: "2024",
      url: [
        "https://www.behance.net/gallery/212458209/Libro-Derecho-de-la-competencia"
      ]
    },

    /* ------------------ Dialogos sobre Patrimonios — Isidora Val Valdivielso ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/A2858617561367644701181589533379/Captura-de-pantalla-2026-03-25-a-las-20.01.49.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["editorial"],
      keywords: [],
      title: "Dialogos sobre Patrimonios",
      author: "Isidora Val Valdivielso",
      role: "",
      collab: "Departamento de Estudios y Educación Patrimonial, Subsecretaría del Patrimonio Cultural",
      area: "editorial",
      year: "2022",
      url: [
        "https://www.behance.net/gallery/159140225/Dialogos-sobre-Patrimonio"
      ]
    },

    /* ------------------ Atlas del Patrimonio Cultural en Chile — Isidora Val Valdivielso ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/Z2858617561349197957107879981763/Captura-de-pantalla-2026-03-25-a-las-20.02.30.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["editorial"],
      keywords: [],
      title: "Atlas del Patrimonio Cultural en Chile",
      author: "Isidora Val Valdivielso",
      role: "",
      collab: "",
      area: "editorial",
      year: "2023",
      url: [
        "https://www.behance.net/gallery/235654997/Atlas-del-Patrimonio-en-Chile"
      ]
    },

    /* ------------------ Sin Nombre — Daniela Collarte ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/P2858617561330751213034170430147/Captura-de-pantalla-2026-03-25-a-las-20.05.25.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["artesanía"],
      keywords: ["cerámica", "cerámica grez"],
      title: "Sin Nombre",
      author: "Daniela Collarte",
      role: "",
      collab: "",
      area: "artesanía",
      year: "2025",
      url: [
        "https://www.instagram.com/p/DEvYHQIy8Hw/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
      ]
    },

    /* ------------------ Sin Nombre — Daniela Collarte ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/Q2858617561312304468960460878531/Captura-de-pantalla-2026-03-25-a-las-20.05.54.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["artesanía"],
      keywords: ["cerámica", "cerámica grez"],
      title: "Sin Nombre",
      author: "Daniela Collarte",
      role: "",
      collab: "",
      area: "artesanía",
      year: "2025",
      url: [
        "https://www.instagram.com/p/C-AxgNSpNxQ/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
      ]
    },

    /* ------------------ Plan Maestro Zona de Interés Público Arenal – Talcahuano — Isidora Millas Simosen ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/J2858616679594831233791312736963/1773157773235.jpeg",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["diseño gráfico"],
      keywords: ["tríptico informativo"],
      title: "Plan Maestro Zona de Interés Público Arenal – Talcahuano",
      author: "Isidora Millas Simosen",
      role: "",
      collab: "",
      area: "diseño gráfico",
      year: "2025",
      url: [
        "https://www.linkedin.com/posts/isidoramilllas_como-dise%C3%B1adora-en-la-direcci%C3%B3n-de-extensi%C3%B3n-activity-7437162747932577794-UmQn?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro"
      ]
    },

    /* ------------------ Vans — Florencia Alcalde R. ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/T2858616679613277977865022288579/4f00b34f-7ccc-4708-b99d-f8893a3283c7_rw_1920.jpg",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["fotografía", "dirección de arte"],
      keywords: ["retail"],
      title: "Vans",
      author: "Florencia Alcalde R.",
      role: "",
      collab: "Modelo: @gabriel_torresj. Estilista: @ariedelpalma. Maquillaje: @maquillajetereyavar. Asistente fotografía: @manealcalder. Video: @agustinmunozrocha, @davidperlaza, @domingo_streeter. Art: @jotawork_, @jisepulve. Equipo Vans: @agus7ita, @negra_ipinza, @diegosoruco, @tomaasguzmaan.",
      area: "fotografía",
      year: "2025",
      url: [
        "https://farfotografia.myportfolio.com/vans",
        "https://www.instagram.com/p/DH7AqcLv_JH/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
      ]
    },

    /* ------------------ Madre Tierra — Florencia Alcalde R. ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/I2858616679631724721938731840195/4ea73515-6866-4fc1-bf06-6f365e977345_rw_3840.jpg",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["fotografía", "dirección de arte"],
      keywords: [],
      title: "Madre Tierra",
      author: "Florencia Alcalde R.",
      role: "",
      collab: "Editorial cuatro elementos, conexión profunda con la naturaleza y sus fuerzas elementales. Modelo: @simonamaass. Maquillaje y pelo: @marsss.makeup. Estilismo: @ariedelpalma. Estudio: @toomanyflash.",
      area: "fotografía",
      year: "2024",
      url: [
        "https://farfotografia.myportfolio.com/madre-tierra"
      ]
    },

    /* ------------------ Summer Collection — María Jesús Aldunce ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/P2858617561293857724886751326915/Captura-de-pantalla-2026-03-26-a-las-10.52.57.png",
      srcOriginal: "",
      orientation: "h",
      span: 1,
      tags: ["styling", "dirección de arte"],
      keywords: ["moda"],
      title: "Summer Collection",
      author: "María Jesús Aldunce",
      role: "",
      collab: "",
      area: "styling",
      year: "2025",
      url: [
        "https://www.behance.net/gallery/235148269/Portafolio"
      ]
    }
    
  ];
    // Normalizar tags + crear índice de búsqueda
    DB.forEach(normalizeProjectTags);

  function buildPeopleIndex(projects) {
    const byKey = new Map();
    (projects || []).forEach((project) => {
      const names = Array.isArray(project && project._peopleNames) ? project._peopleNames : [];
      names.forEach((name) => {
        const key = toNameKey(name);
        if (!key) return;
        if (!byKey.has(key)) byKey.set(key, name);
      });
    });
    return byKey;
  }

  let PEOPLE_BY_KEY = buildPeopleIndex(DB);

  /* ===== Reordenamiento de proyectos al cargar ===== */
  // Opción A: Shuffle aleatorio (Fisher-Yates)
  // Opción B: Rotación persistente (por defecto)
  const USE_RANDOM_SHUFFLE = false; // Cambiar a true para usar shuffle aleatorio
  const ROTATION_STEP = 7; // Ajusta este valor para cambiar el "paso" de rotación (cuántos items se mueven por carga)

  function shuffleArray(array) {
    const shuffled = array.slice(); // Clonar para no mutar el original
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function rotateArray(array, step) {
    // Obtener el offset actual del localStorage
    let currentOffset = parseInt(localStorage.getItem('ref2d_rotation_offset') || '0', 10);
    
    // Aumentar el offset con el paso
    currentOffset = (currentOffset + step) % array.length;
    
    // Guardar el nuevo offset
    localStorage.setItem('ref2d_rotation_offset', currentOffset.toString());
    
    // Rotar el array: tomar desde offset hasta el final, luego desde inicio hasta offset
    return array.slice(currentOffset).concat(array.slice(0, currentOffset));
  }

  // Aplicar reordenamiento según la opción seleccionada
  let DB_ORDERED = USE_RANDOM_SHUFFLE 
    ? shuffleArray(DB) 
    : rotateArray(DB, ROTATION_STEP);
  const BENTO_SPAN_MODE = "all1"; // "all1" | "random2" | "dataset"
  const BENTO_RANDOM_SPAN2_RATIO = 0.14;
  const BENTO_RANDOM_SPAN2_MAX = 48;
  let bentoSpanByMeta = new WeakMap();

  function getDatasetSpan(meta) {
    return Number(meta && meta.span) === 2 ? 2 : 1;
  }

  function rebuildBentoRandomSpans() {
    bentoSpanByMeta = new WeakMap();
    DB.forEach((meta) => bentoSpanByMeta.set(meta, 1));
    if (BENTO_SPAN_MODE !== "random2" || !DB.length) return;

    const shuffled = shuffleArray(DB);
    const target = Math.max(
      1,
      Math.min(BENTO_RANDOM_SPAN2_MAX, Math.round(DB.length * BENTO_RANDOM_SPAN2_RATIO))
    );
    for (let i = 0; i < target && i < shuffled.length; i++) {
      bentoSpanByMeta.set(shuffled[i], 2);
    }
  }

  function getBentoSpan(meta) {
    if (BENTO_SPAN_MODE === "dataset") return getDatasetSpan(meta);
    if (BENTO_SPAN_MODE === "random2") return bentoSpanByMeta.get(meta) === 2 ? 2 : 1;
    return 1;
  }

  const DEFAULT_RESPONSIVE_SIZES = "(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 33vw";

  function getProjectImageCandidates(meta) {
    if (!meta) return [];
    const seen = new Set();
    const list = [];
    [meta.srcAvif, meta.src, meta.srcOriginal].forEach((raw) => {
      const src = String(raw || "").trim();
      if (!src || seen.has(src)) return;
      seen.add(src);
      list.push(src);
    });
    return list;
  }

  function getProjectPrimarySrc(meta) {
    const list = getProjectImageCandidates(meta);
    return list[0] || "";
  }

  function getProjectFallbackSrc(meta) {
    const list = getProjectImageCandidates(meta);
    return list[1] || "";
  }

  function setImageSrcChain(img, sources) {
    if (!img) return;
    const queue = Array.isArray(sources)
      ? sources.map((v) => String(v || "").trim()).filter(Boolean)
      : [];
    if (!queue.length) return;
    let index = 0;
    const load = (nextIndex) => {
      index = nextIndex;
      img.src = queue[nextIndex];
    };
    img.onerror = () => {
      if (index + 1 >= queue.length) {
        img.onerror = null;
        return;
      }
      load(index + 1);
    };
    load(0);
  }

  function setImageSrcWithFallback(img, meta) {
    setImageSrcChain(img, getProjectImageCandidates(meta));
  }

  function createProjectPicture(meta, altText, onImageLoad) {
    const picture = document.createElement('picture');
    picture.style.display = 'block';
    picture.style.width = '100%';
    picture.style.height = '100%';

    const avifSet = String(meta?.srcSetAvif || '').trim();
    const webpSet = String(meta?.srcSetWebp || '').trim();
    const sizes = String(meta?.srcSizes || '').trim() || DEFAULT_RESPONSIVE_SIZES;

    if (avifSet) {
      const sourceAvif = document.createElement('source');
      sourceAvif.type = 'image/avif';
      sourceAvif.srcset = avifSet;
      sourceAvif.sizes = sizes;
      picture.appendChild(sourceAvif);
    }

    if (webpSet) {
      const sourceWebp = document.createElement('source');
      sourceWebp.type = 'image/webp';
      sourceWebp.srcset = webpSet;
      sourceWebp.sizes = sizes;
      picture.appendChild(sourceWebp);
    }

    const img = new Image();
    img.loading = 'lazy';
    img.decoding = 'async';
    img.fetchPriority = 'low';
    img.alt = altText || '';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';

    if (webpSet) {
      img.srcset = webpSet;
      img.sizes = sizes;
    }

    if (typeof onImageLoad === 'function') {
      img.addEventListener('load', onImageLoad);
      img.addEventListener('error', onImageLoad);
    }

    setImageSrcChain(img, [meta?.src || '', meta?.srcOriginal || '']);
    picture.appendChild(img);
    return { picture, img };
  }

  rebuildBentoRandomSpans();

  /* Activo + generador circular */
  let activeList = DB_ORDERED.slice();
  let genPtr = 0;
  let activeView = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches ? 'grid' : 'bento';
  let masonryRaf = null;
  let listSortKey = '';
  let listSortDir = 1;
  let gridRenderToken = 0;
  let filterDebounceTimer = null;
  let activeTagFilterKeys = new Set();
  let activePersonFilterKeys = new Set();
  const FILTER_DEBOUNCE_MS = 220;
  let fillAroundRaf = null;
  let fillAroundLiteTimer = null;
  let fillAroundSettleTimer = null;
  let interactionSettleTimer = null;
  let lastInteractionTs = 0;
  let fillAroundNeedsFullPass = false;
  let isInteractionActive = false;
  let lastLiteFillCamX = 0;
  let lastLiteFillCamY = 0;
  const BENTO_PREFETCH_X = 1.35;
  const BENTO_PREFETCH_Y = 1.35;
  const BENTO_PREFETCH_MIN_X = 1.06;
  const BENTO_PREFETCH_MIN_Y = 1.06;
  const BENTO_LITE_PREFETCH_MIN_X = 1.0;
  const BENTO_LITE_PREFETCH_MIN_Y = 1.0;
  // PERF:
  const BENTO_CULL_MARGIN = 1800;
  // PERF:
  const BENTO_MAX_ITEMS_IN_DOM = 400;
  const BENTO_MAX_NEW_PER_PASS = 140;
  const BENTO_MAX_NEW_PER_PASS_MIN = 56;
  const BENTO_MAX_NEW_PER_PASS_LITE = 28;
  const BENTO_MAX_NEW_PER_PASS_LITE_MIN = 10;
  const BENTO_LITE_FILL_INTERVAL_MS = 180;
  const BENTO_SETTLE_FULL_DELAY_MS = 160;
  const BENTO_INTERACTION_SETTLE_MS = 120;
  const BENTO_LITE_MIN_MOVE_SCREEN = 30;
  const BENTO_LITE_MIN_MOVE_SCREEN_SQ = BENTO_LITE_MIN_MOVE_SCREEN * BENTO_LITE_MIN_MOVE_SCREEN;
  const SIMPLE_CARD_COUNT = 3;
  const nextMeta = ()=> activeList.length ? activeList[(genPtr++) % activeList.length] : null;
  const ORIENTATION_RATIO = { h: 4 / 3, v: 3 / 4, sq: 1 };
  const ORIENTATION_ASPECT_CSS = { h: '4 / 3', v: '3 / 4', sq: '1 / 1' };
  const normalizeOrientation = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'v' || raw === 'sq' || raw === 'h') return raw;
    return 'h';
  };
  const getOrientationFromDimensions = (width, height) => {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return "";
    const ratio = width / height;
    if (Math.abs(ratio - 1) <= 0.08) return 'sq';
    return ratio > 1 ? 'h' : 'v';
  };
  const getOrientationFromElement = (el) => {
    if (!el || !el.classList) return "";
    if (el.classList.contains('ratio-sq') || el.classList.contains('is-sq')) return 'sq';
    if (el.classList.contains('ratio-v') || el.classList.contains('is-v')) return 'v';
    if (el.classList.contains('ratio-h') || el.classList.contains('is-h')) return 'h';
    return "";
  };
  let transformRaf = null;
  const requestTransform = () => {
    if (transformRaf !== null) return;
    transformRaf = requestAnimationFrame(() => {
      transformRaf = null;
      applyTransform();
    });
  };
  const updateZoomButtons = () => {
    if (btnZoomOut) btnZoomOut.disabled = camScale <= CAM_SCALE_MIN + 0.001;
    if (btnZoomIn) btnZoomIn.disabled = camScale >= CAM_SCALE_MAX - 0.001;
  };
  const getZoomProgress = () => {
    if (CAM_SCALE_MAX === CAM_SCALE_MIN) return 1;
    const t = (camScale - CAM_SCALE_MIN) / (CAM_SCALE_MAX - CAM_SCALE_MIN);
    return Math.max(0, Math.min(1, t));
  };
  const getDynamicPrefetch = (lite = false) => {
    const t = getZoomProgress();
    const baseX = lite ? BENTO_LITE_PREFETCH_MIN_X : BENTO_PREFETCH_MIN_X;
    const baseY = lite ? BENTO_LITE_PREFETCH_MIN_Y : BENTO_PREFETCH_MIN_Y;
    return {
      x: baseX + ((BENTO_PREFETCH_X - baseX) * t),
      y: baseY + ((BENTO_PREFETCH_Y - baseY) * t)
    };
  };
  const getDynamicMaxNewPerPass = (lite = false) => {
    const t = getZoomProgress();
    if (lite) {
      return Math.round(BENTO_MAX_NEW_PER_PASS_LITE_MIN + ((BENTO_MAX_NEW_PER_PASS_LITE - BENTO_MAX_NEW_PER_PASS_LITE_MIN) * t));
    }
    return Math.round(BENTO_MAX_NEW_PER_PASS_MIN + ((BENTO_MAX_NEW_PER_PASS - BENTO_MAX_NEW_PER_PASS_MIN) * t));
  };
  const zoomTo = (targetScale, clientX, clientY, useLiteFill = false) => {
    const nextScale = clampCamScale(targetScale);
    if (Math.abs(nextScale - camScale) < 0.0001) {
      updateZoomButtons();
      return;
    }
    const rect = viewport.getBoundingClientRect();
    const focusX = Number.isFinite(clientX) ? (clientX - rect.left) : (viewport.clientWidth * 0.5);
    const focusY = Number.isFinite(clientY) ? (clientY - rect.top) : (viewport.clientHeight * 0.5);
    const worldX = (focusX - camX) / camScale;
    const worldY = (focusY - camY) / camScale;
    camScale = nextScale;
    camX = focusX - (worldX * camScale);
    camY = focusY - (worldY * camScale);
    requestTransform();
    if (useLiteFill) requestFillAroundLiteIfNeeded(true);
    else requestFillAround(false);
    updateZoomButtons();
  };
  const zoomBy = (deltaScale, useLiteFill = true) => {
    zoomTo(camScale + deltaScale, undefined, undefined, useLiteFill);
  };

  /* Crear tarjeta */
  let globalId = 0;
  // PERF:
  function makeCard(i, dir, meta, fragment){
    if(!meta) return;
    const orient = normalizeOrientation(meta.orientation);
    const span2  = getBentoSpan(meta) === 2;
    const tags   = (meta.tags||[]);

    const w = span2 ? (COL_W*2+GAP) : COL_W;
    const ratio = ORIENTATION_RATIO[orient];
    const h = Math.round(w/ratio);

    // columnas involucradas
    const colA = ensureColumn(i);
    const colB = span2 ? ensureColumn(i+1) : null;

    let y;
    if(dir==='down'){
      if(span2){
        // ocupa dos columnas: alinea a la más "alta" y empuja ambas
        const start = Math.max(colA.yDown, colB.yDown);
        y = start;
        const next = start + h + GAP;
        colA.yDown = next;
        colB.yDown = next;
      } else {
        y = colA.yDown;
        colA.yDown += h + GAP;
      }
    } else {
      // dir === 'up'
      if(span2){
        const start = Math.min(colA.yUp, colB.yUp) - h - GAP;
        y = start;
        colA.yUp = start;
        colB.yUp = start;
      } else {
        y = colA.yUp - h - GAP;
        colA.yUp = y;
      }
    }

    const el = document.createElement('article');
    el.className = `ref2d__item ${span2?'span-2':'norm'} ratio-${orient}`;
    el.style.left = colA.pos + "px";
    el.style.top  = y + "px";
    el.style.background = meta.src ? "#000" : PALETTE[globalId % PALETTE.length];
    el.dataset.y       = String(y);
    el.dataset.h       = String(h);
    el._y = y;
    el._h = h;
    el.dataset.id      = meta.id ?? globalId;
    el.dataset.tags    = tags.join(' | ');
    el.dataset.title   = meta.title || '—';
    el.dataset.author  = meta._displayAuthor || meta.author || '—';
    el.dataset.role    = meta._displayRole || 'Diseñador/a';
    el.dataset.area    = meta.area || '—';
    el.dataset.year    = meta.year || '—';
    el.dataset.url     = Array.isArray(meta.url) ? meta.url[0] : (meta.url || '');
    el.dataset.collab  = meta._displayCredits || meta.collab || '';
    el.dataset.credits = meta._displayCredits || meta.collab || '';
    el._meta = meta;

    const proxy = document.createElement('div');
    proxy.className='ratio-proxy';
    el.appendChild(proxy);

    if (getProjectPrimarySrc(meta)) {
      const media = createProjectPicture(meta, meta.title || "");
      Object.assign(media.picture.style, { position: 'absolute', inset: '0' });
      el.appendChild(media.picture);
    }

    const metaBox = document.createElement('div');
    metaBox.className='ref2d__meta';
    if (Array.isArray(meta._peopleNames) && meta._peopleNames.length) {
      const personName = meta._peopleNames[0];
      const personKey = toNameKey(personName);
      if (personKey) {
        const personChip = document.createElement('span');
        personChip.className = 'ref2d__chip ref2d__chip--person';
        personChip.textContent = personName;
        personChip.setAttribute('data-person', personName);
        personChip.dataset.personKey = personKey;
        if (activePersonFilterKeys.has(personKey)) {
          personChip.classList.add('ref2d__chip--active');
        }
        personChip.addEventListener('click', (e) => {
          if (performance.now() < suppressClickUntil) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          togglePersonFilter(personName);
        });
        metaBox.appendChild(personChip);
      }
    }
    tags.slice(0,3).forEach(t=>{
      const c=document.createElement('span');
      c.className='ref2d__chip';
      c.textContent=t;
      c.setAttribute('data-tag', t);
      const chipKey = norm(canonicalTagKey(t));
      c.dataset.tagKey = chipKey;
      if (activeTagFilterKeys.has(chipKey)) {
        c.classList.add('ref2d__chip--active');
      }
      // Etiquetas de la grilla también son clickeables
      c.addEventListener('click', (e)=>{
        // Suprimir click si acabamos de hacer drag
        if(performance.now() < suppressClickUntil){
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        e.preventDefault();
        e.stopPropagation(); // Evita que se abra el modal al hacer click en la etiqueta
        toggleTagFilter(t);
      }); // Sin capture phase
      metaBox.appendChild(c);
    });
    el.appendChild(metaBox);
    // PERF:
    if (fragment) fragment.appendChild(el);
    else plane.appendChild(el);
    globalId++;
  }

  function getCitationYear(meta) {
    const raw = String(meta && meta.year != null ? meta.year : '').trim();
    const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? yearMatch[0] : 's.f.';
  }

  function getCitationAuthor(meta) {
    return (meta && (meta._displayAuthor || meta.author) ? (meta._displayAuthor || meta.author) : 'Autor/Diseñador').trim();
  }

  function getCitationTitle(meta) {
    const value = (meta && meta.title ? String(meta.title) : '').trim();
    return value || 'Proyecto sin título';
  }

  function getCitationUrl(meta) {
    const fromMeta = Array.isArray(meta && meta.url) ? meta.url[0] : (meta && meta.url);
    const cleanMeta = String(fromMeta || '').trim();
    if (cleanMeta) return cleanMeta;
    return window.location.href.split('#')[0];
  }

  function buildApaCitation(meta, urlOverride) {
    const author = getCitationAuthor(meta);
    const year = getCitationYear(meta);
    const title = getCitationTitle(meta);
    const url = String(urlOverride || '').trim() || getCitationUrl(meta);
    return `${author}. (${year}). ${title}. Referencioteca. ${url}`;
  }

  function copyToClipboardText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      helper.style.pointerEvents = 'none';
      document.body.appendChild(helper);
      helper.select();
      helper.setSelectionRange(0, helper.value.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(helper);
      if (ok) resolve();
      else reject(new Error('No fue posible copiar.'));
    });
  }

  function renderSheetCitation(meta) {
    if (!sheetCitation || !sheetCitationText || !sheetCitationCopy || !sheetCitationPanel || !sheetCitationToggle) return;
    if (!meta) {
      sheetCitation.hidden = true;
      return;
    }
    const firstUrl = Array.isArray(meta.urls) ? (meta.urls[0] || "") : (meta.url || "");
    const citation = buildApaCitation(meta, firstUrl);
    sheetCitationText.textContent = citation;
    sheetCitationCopy.dataset.citation = citation;
    sheetCitationCopy.textContent = "Copiar cita APA";
    sheetCitationCopy.classList.remove("is-error");
    sheetCitationPanel.hidden = true;
    sheetCitationToggle.setAttribute("aria-expanded", "false");
    sheetCitation.hidden = false;
  }

  if (sheetCitationToggle && sheetCitationPanel) {
    sheetCitationToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const willOpen = sheetCitationPanel.hidden;
      sheetCitationPanel.hidden = !willOpen;
      sheetCitationToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  }

  if (sheetCitationCopy) {
    sheetCitationCopy.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const citation = String(sheetCitationCopy.dataset.citation || "").trim();
      if (!citation) return;
      clearTimeout(sheetCitationFeedbackTimer);
      try {
        await copyToClipboardText(citation);
        sheetCitationCopy.textContent = "Copiado";
        sheetCitationCopy.classList.remove("is-error");
      } catch (_err) {
        sheetCitationCopy.textContent = "No se pudo copiar";
        sheetCitationCopy.classList.add("is-error");
      }
      sheetCitationFeedbackTimer = setTimeout(() => {
        sheetCitationCopy.textContent = "Copiar cita APA";
        sheetCitationCopy.classList.remove("is-error");
      }, 1800);
    });
  }

  function getPersonDisplayName(key) {
    return PEOPLE_BY_KEY.get(key) || key;
  }

  function createPersonChip(name, className = '') {
    const key = toNameKey(name);
    if (!key) return null;
    const chip = document.createElement('span');
    chip.className = `ref2d__chip ref2d__chip--person ${className}`.trim();
    chip.textContent = getPersonDisplayName(key);
    chip.setAttribute('data-person', getPersonDisplayName(key));
    chip.dataset.personKey = key;
    if (activePersonFilterKeys.has(key)) {
      chip.classList.add('ref2d__chip--active');
    }
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePersonFilter(getPersonDisplayName(key));
    });
    return chip;
  }

  function renderPeopleInContainer(container, names) {
    if (!container) return;
    container.innerHTML = "";
    const people = Array.isArray(names) ? names : [];
    if (!people.length) {
      container.textContent = "—";
      return;
    }
    const frag = document.createDocumentFragment();
    people.forEach((name, idx) => {
      const chip = createPersonChip(name, 'ref2d__chip--inline');
      if (!chip) return;
      if (idx > 0 && frag.childNodes.length > 0) {
        frag.appendChild(document.createTextNode(" "));
      }
      frag.appendChild(chip);
    });
    if (!frag.childNodes.length) {
      container.textContent = "—";
      return;
    }
    container.appendChild(frag);
  }

  function renderCreditsWithClickablePeople(container, rawCredits, projectPeople) {
    if (!container) return;
    container.innerHTML = "";
    const lines = splitCreditSegments(rawCredits);
    if (!lines.length) {
      container.textContent = "—";
      return;
    }
    const candidates = (Array.isArray(projectPeople) ? projectPeople : [])
      .map((name) => canonicalPersonLabel(name))
      .filter(Boolean);
    const uniqueCandidates = Array.from(new Set(candidates.map((n) => toNameKey(n))))
      .map((key) => getPersonDisplayName(key))
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    const regex = uniqueCandidates.length
      ? new RegExp(uniqueCandidates.map((name) => escapeRegExp(name)).join("|"), "gi")
      : null;

    const frag = document.createDocumentFragment();
    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) frag.appendChild(document.createElement("br"));
      if (!regex) {
        frag.appendChild(document.createTextNode(line));
        return;
      }
      let cursor = 0;
      line.replace(regex, (match, offset) => {
        if (offset > cursor) {
          frag.appendChild(document.createTextNode(line.slice(cursor, offset)));
        }
        const chip = createPersonChip(match, 'ref2d__chip--inline');
        if (chip) frag.appendChild(chip);
        else frag.appendChild(document.createTextNode(match));
        cursor = offset + match.length;
        return match;
      });
      if (cursor < line.length) {
        frag.appendChild(document.createTextNode(line.slice(cursor)));
      }
    });
    if (!frag.childNodes.length) {
      container.textContent = "—";
      return;
    }
    container.appendChild(frag);
  }

  function createSharedCardElement(meta, className, options = {}) {
    const maxTags = Number.isFinite(options.maxTags) ? options.maxTags : 4;
    const onImageLoad = typeof options.onImageLoad === 'function' ? options.onImageLoad : null;
    const el = document.createElement('article');
    const orient = normalizeOrientation(meta.orientation);
    const isFeatured = getBentoSpan(meta) === 2;
    el.className = `${className} is-${orient} ${isFeatured ? 'is-featured' : ''}`;
    el.dataset.tags   = (meta.tags || []).join(' | ');
    el.dataset.title  = meta.title || '—';
    el.dataset.author = meta._displayAuthor || meta.author || '—';
    el.dataset.role   = meta._displayRole || 'Diseñador/a';
    el.dataset.area   = meta.area || '—';
    el.dataset.year   = meta.year || '—';
    el.dataset.url    = Array.isArray(meta.url) ? meta.url[0] : (meta.url || '');
    el.dataset.collab = meta._displayCredits || meta.collab || '';
    el.dataset.credits = meta._displayCredits || meta.collab || '';
    el._meta = meta;

    const body = document.createElement('div');
    body.className = 'ref2d__view-card-body';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'ref2d__view-card-figure';
    imgWrap.style.aspectRatio = ORIENTATION_ASPECT_CSS[orient];
    if (getProjectPrimarySrc(meta)) {
      const media = createProjectPicture(meta, meta.title || '', onImageLoad);
      imgWrap.appendChild(media.picture);
    }
    body.appendChild(imgWrap);

    const head = document.createElement('div');
    head.className = 'ref2d__view-card-head';
    const title = document.createElement('h3');
    title.textContent = meta.title || '—';
    const author = document.createElement('p');
    author.className = 'ref2d__view-card-author';
    renderPeopleInContainer(author, [meta._displayAuthor || meta.author || '—']);
    const role = document.createElement('p');
    role.className = 'ref2d__view-card-role';
    role.textContent = `Rol: ${meta._displayRole || 'Diseñador/a'}`;
    head.appendChild(title);
    head.appendChild(author);
    head.appendChild(role);
    body.appendChild(head);

    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'ref2d__view-card-tags';
    (meta.tags || []).slice(0, maxTags).forEach((t) => {
      const chip = document.createElement('span');
      chip.className = 'ref2d__chip';
      chip.textContent = t;
      chip.setAttribute('data-tag', t);
      const chipKey = norm(canonicalTagKey(t));
      chip.dataset.tagKey = chipKey;
      if (activeTagFilterKeys.has(chipKey)) {
        chip.classList.add('ref2d__chip--active');
      }
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTagFilter(t);
      });
      tagsWrap.appendChild(chip);
    });
    body.appendChild(tagsWrap);

    el.appendChild(body);

    el.addEventListener('click', () => openSpotlight(el));
    return el;
  }

  function layoutMultiGridMasonry() {
    if (!multiGrid || activeView !== 'grid' || multiGrid.hidden) return;

    const styles = getComputedStyle(multiGrid);
    const rowUnit = parseFloat(styles.getPropertyValue('grid-auto-rows'));
    const rowGap = parseFloat(styles.getPropertyValue('row-gap'));
    if (!rowUnit) return;

    multiGrid.querySelectorAll('.ref2d__view-card').forEach((card) => {
      const content = card.querySelector('.ref2d__view-card-body');
      if (!content) return;
      const span = Math.ceil((content.getBoundingClientRect().height + rowGap) / (rowUnit + rowGap));
      card.style.gridRowEnd = `span ${Math.max(span, 1)}`;
    });
  }

  function scheduleMultiGridLayout() {
    if (masonryRaf !== null) return;
    masonryRaf = requestAnimationFrame(() => {
      masonryRaf = null;
      layoutMultiGridMasonry();
    });
  }

  function renderMultiGridView() {
    if (!multiGrid) return;
    const renderToken = ++gridRenderToken;
    multiGrid.innerHTML = '';

    if (!activeList.length) {
      multiGrid.innerHTML = '<p class="ref2d__empty">Sin resultados para esta búsqueda.</p>';
      return;
    }

    const BATCH_SIZE = 28;
    let cursor = 0;

    const appendBatch = () => {
      if (renderToken !== gridRenderToken || activeView !== 'grid' || !multiGrid) return;
      const frag = document.createDocumentFragment();
      const end = Math.min(cursor + BATCH_SIZE, activeList.length);
      while (cursor < end) {
        const meta = activeList[cursor++];
        const card = createSharedCardElement(meta, 'ref2d__view-card', { onImageLoad: scheduleMultiGridLayout });
        frag.appendChild(card);
      }
      multiGrid.appendChild(frag);
      scheduleMultiGridLayout();
      if (cursor < activeList.length) {
        requestAnimationFrame(appendBatch);
      }
    };

    appendBatch();
  }

  function getSimpleSelectionFromCategories(projects, amount = SIMPLE_CARD_COUNT) {
    if (!projects.length) return [];
    const target = Math.min(amount, projects.length);
    const byCategory = new Map();

    projects.forEach((meta) => {
      const keys = (meta._tagKeys && meta._tagKeys.length)
        ? meta._tagKeys
        : (meta.tags || []).map(canonicalTagKey).filter(Boolean);
      const uniqueKeys = Array.from(new Set(keys));
      if (!uniqueKeys.length) {
        if (!byCategory.has('all')) byCategory.set('all', []);
        byCategory.get('all').push(meta);
        return;
      }
      uniqueKeys.forEach((key) => {
        if (!byCategory.has(key)) byCategory.set(key, []);
        byCategory.get(key).push(meta);
      });
    });

    const selected = [];
    const usedProjects = new Set();
    const entries = shuffleArray(Array.from(byCategory.entries()).filter(([, list]) => list.length));

    for (let i = 0; i < entries.length && selected.length < target; i++) {
      const [key, list] = entries[i];
      const shuffledList = shuffleArray(list);
      const candidate = shuffledList.find((item) => !usedProjects.has(item)) || shuffledList[0];
      if (!candidate || usedProjects.has(candidate)) continue;
      usedProjects.add(candidate);
      selected.push({
        meta: candidate,
        categoryKey: key,
        categoryLabel: CAT_LABELS[key] || prettyTag(key)
      });
    }

    if (selected.length < target) {
      const backup = shuffleArray(projects);
      for (let i = 0; i < backup.length && selected.length < target; i++) {
        const candidate = backup[i];
        if (usedProjects.has(candidate)) continue;
        usedProjects.add(candidate);
        selected.push({
          meta: candidate,
          categoryKey: '',
          categoryLabel: ''
        });
      }
    }

    return selected;
  }

  function createSimpleCardElement(entry) {
    const card = createSharedCardElement(entry.meta, 'ref2d__simple-card');
    const body = card.querySelector('.ref2d__view-card-body');
    const head = card.querySelector('.ref2d__view-card-head');
    if (body && head && entry.categoryLabel) {
      const category = document.createElement('span');
      category.className = 'ref2d__simple-card-cat';
      category.textContent = entry.categoryLabel;
      body.insertBefore(category, head);
    }
    return card;
  }

  function renderSimpleView() {
    if (!simpleGrid) return;
    simpleGrid.innerHTML = '';

    if (!activeList.length) {
      simpleGrid.innerHTML = '<p class="ref2d__empty">Sin resultados para esta búsqueda.</p>';
      if (btnSimpleRefresh) btnSimpleRefresh.disabled = true;
      return;
    }
    if (btnSimpleRefresh) btnSimpleRefresh.disabled = false;

    const picks = getSimpleSelectionFromCategories(activeList, SIMPLE_CARD_COUNT);
    const frag = document.createDocumentFragment();
    picks.forEach((entry) => {
      frag.appendChild(createSimpleCardElement(entry));
    });
    simpleGrid.appendChild(frag);
  }

  function normalizedTextValue(value) {
    return norm((value || '').toString());
  }

  function parseYearValue(value) {
    const match = (value || '').toString().match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
  }

  function compareIndexItems(a, b) {
    if (listSortKey === 'year') {
      const yearA = parseYearValue(a.year);
      const yearB = parseYearValue(b.year);
      if (yearA === null && yearB !== null) return 1;
      if (yearA !== null && yearB === null) return -1;
      if (yearA !== null && yearB !== null) {
        if (yearA < yearB) return -1 * listSortDir;
        if (yearA > yearB) return 1 * listSortDir;
      }
      const fallback = normalizedTextValue(a.title).localeCompare(normalizedTextValue(b.title), 'es');
      return fallback * listSortDir;
    }

    const valueA = listSortKey === 'author' ? (a._displayAuthor || a.author) : a.title;
    const valueB = listSortKey === 'author' ? (b._displayAuthor || b.author) : b.title;
    return normalizedTextValue(valueA).localeCompare(normalizedTextValue(valueB), 'es') * listSortDir;
  }

  function getSortedIndexList() {
    const list = activeList.slice();
    if (!listSortKey) return list;
    return list.sort(compareIndexItems);
  }

  function updateIndexSortUI() {
    if (!indexList) return;
    const headers = indexList.querySelectorAll('.ref2d__indexTable th[data-sort]');
    headers.forEach((th) => {
      th.classList.remove('sort-asc', 'sort-desc');
      if (th.dataset.sort !== listSortKey) return;
      th.classList.add(listSortDir === 1 ? 'sort-asc' : 'sort-desc');
    });
  }

  function renderIndexListView() {
    if (!indexBody) return;
    indexBody.innerHTML = '';
    updateIndexSortUI();

    if (!activeList.length) {
      indexBody.innerHTML = '<tr><td colspan="6" class="ref2d__index-empty">Sin resultados para esta búsqueda.</td></tr>';
      return;
    }

    const list = getSortedIndexList();
    const frag = document.createDocumentFragment();
    list.forEach((meta) => {
      const tr = document.createElement('tr');
      const firstUrl = Array.isArray(meta.url) ? meta.url[0] : (meta.url || '');
      tr.innerHTML = `
        <td>${meta.title || '—'}</td>
        <td>${meta._displayAuthor || meta.author || '—'}</td>
        <td>${meta._displayRole || 'Diseñador/a'}</td>
        <td>${meta.area || '—'}</td>
        <td>${meta.year || '—'}</td>
        <td>${firstUrl ? `<a href="${firstUrl}" target="_blank" rel="noopener">↗</a>` : '—'}</td>
      `;
      tr.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const ghost = document.createElement('div');
        ghost.dataset.tags = (meta.tags || []).join(' | ');
        ghost.dataset.title = meta.title || '—';
        ghost.dataset.author = meta._displayAuthor || meta.author || '—';
        ghost.dataset.role = meta._displayRole || 'Diseñador/a';
        ghost.dataset.area = meta.area || '—';
        ghost.dataset.year = meta.year || '—';
        ghost.dataset.url = firstUrl;
        ghost.dataset.collab = meta._displayCredits || meta.collab || '';
        ghost.dataset.credits = meta._displayCredits || meta.collab || '';
        ghost._meta = meta;
        openSpotlight(ghost);
      });
      frag.appendChild(tr);
    });
    indexBody.appendChild(frag);
  }

  function renderActiveView() {
    if (activeView === 'bento') {
      resetWorld();
      return;
    }
    if (activeView === 'grid') {
      renderMultiGridView();
      updateCount();
      return;
    }
    renderIndexListView();
    updateCount();
  }

  function setView(view) {
    if (filterDebounceTimer !== null) {
      clearTimeout(filterDebounceTimer);
      filterDebounceTimer = null;
    }
    view = sanitizeViewForViewport(view);
    const viewMap = {
      bento: 'Vista: Infinita',
      grid: 'Vista: Grilla',
      index: 'Vista: Lista'
    };
    activeView = viewMap[view] ? view : 'bento';

    const isBento = activeView === 'bento';
    const isGrid = activeView === 'grid';
    const isIndex = activeView === 'index';

    if (viewToggle) viewToggle.textContent = viewMap[activeView];
    if (viewport) viewport.hidden = !isBento;
    if (multiGrid) multiGrid.hidden = !isGrid;
    if (indexList) indexList.hidden = !isIndex;
    if (simpleView) simpleView.hidden = true;
    if (bentoControls) bentoControls.hidden = !isBento;
    if (btnCenter) btnCenter.hidden = !isBento;
    if (btnRandom) btnRandom.hidden = !isGrid;
    if (count) count.hidden = false;
    if (!isGrid) {
      gridRenderToken += 1;
    }
    if (btnSearchRandom) {
      btnSearchRandom.hidden = !isGrid;
      btnSearchRandom.textContent = 'Aleatorio';
    }
    if (btnSimpleRefresh) btnSimpleRefresh.hidden = true;
    updateZoomButtons();
    if (isBento) refreshViewportSize();
    if (!isBento && plane) {
      plane.classList.remove('is-lod-far', 'is-lod-mid', 'is-lod-near');
      currentLodMode = '';
      setInteractionActive(false);
      if (interactionSettleTimer !== null) {
        clearTimeout(interactionSettleTimer);
        interactionSettleTimer = null;
      }
    }

    renderActiveView();
  }

  function getViewportBounds() {
    const scale = camScale || 1;
    const screenW = viewportWidth;
    const screenH = viewportHeight;
    const vw = screenW / scale;
    const vh = screenH / scale;
    const top = (-camY) / scale;
    const bottom = top + vh;
    const left = (-camX) / scale;
    const right = left + vw;
    return { vw, vh, top, bottom, left, right };
  }

  function cullFarItems() {
    if (!plane || activeView !== 'bento') return;
    const children = plane.children;
    const total = children.length;
    if (!total) return;

    const { top, bottom } = getViewportBounds();
    const minVisible = top - BENTO_CULL_MARGIN;
    const maxVisible = bottom + BENTO_CULL_MARGIN;
    const dynamicMaxItemsInDom = Math.round(300 + (340 * getZoomProgress()));
    let removed = 0;
    const aggressive = total > dynamicMaxItemsInDom;
    const removeLimit = aggressive ? 220 : 70;

    for (let idx = children.length - 1; idx >= 0; idx--) {
      const el = children[idx];
      const y = Number.isFinite(el._y) ? el._y : parseFloat(el.dataset.y || '');
      const h = Number.isFinite(el._h) ? el._h : parseFloat(el.dataset.h || '');
      if (!Number.isFinite(y) || !Number.isFinite(h)) continue;
      if (!Number.isFinite(el._y)) el._y = y;
      if (!Number.isFinite(el._h)) el._h = h;
      const isOut = (y + h) < minVisible || y > maxVisible;
      if (!isOut) continue;
      el.remove();
      removed++;
      if (removed >= removeLimit) break;
    }
  }

  /* Relleno alrededor de la vista */
  function fillAround(lite = false){
    if(activeList.length===0) return;
    // PERF:
    const fragment = document.createDocumentFragment();
    const { vw, vh, top, left, right } = getViewportBounds();
    const prefetch = getDynamicPrefetch(lite);
    const maxNewPerPass = getDynamicMaxNewPerPass(lite);
    const leftBound = left - vw * (prefetch.x - 1);
    const rightBound = right + vw * (prefetch.x - 1);
    const topV  = top - vh * (prefetch.y - 1);
    const bottom = top + vh * prefetch.y;
    const startIdx = Math.floor((leftBound)  / (COL_W+GAP)) - 2;
    const endIdx   = Math.floor((rightBound) / (COL_W+GAP)) + 2;
    let created = 0;

    for(let i=startIdx; i<=endIdx; i++){
      const col = ensureColumn(i);
      while(col.yDown < bottom){
        // PERF:
        makeCard(i,'down', nextMeta(), fragment);
        created++;
        if(col.yDown > yBotLimit-(COL_W*2)) yBotLimit += 1500;
        if (created >= maxNewPerPass) {
          // PERF:
          if (fragment.childElementCount > 0) plane.appendChild(fragment);
          if (!lite) cullFarItems();
          if (lite) requestFillAroundLite();
          else requestFillAround();
          return;
        }
      }
      while(col.yUp > topV){
        // PERF:
        makeCard(i,'up',   nextMeta(), fragment);
        created++;
        if(col.yUp   < yTopLimit+(COL_W*2)) yTopLimit -= 1500;
        if (created >= maxNewPerPass) {
          // PERF:
          if (fragment.childElementCount > 0) plane.appendChild(fragment);
          if (!lite) cullFarItems();
          if (lite) requestFillAroundLite();
          else requestFillAround();
          return;
        }
      }
    }
    // PERF:
    if (fragment.childElementCount > 0) plane.appendChild(fragment);
    if (!lite) cullFarItems();
  }

  function requestFillAround(lite = false) {
    if (!lite && fillAroundLiteTimer !== null) {
      clearTimeout(fillAroundLiteTimer);
      fillAroundLiteTimer = null;
    }
    if (!lite && fillAroundSettleTimer !== null) {
      clearTimeout(fillAroundSettleTimer);
      fillAroundSettleTimer = null;
    }
    if (fillAroundRaf !== null) {
      if (!lite) fillAroundNeedsFullPass = true;
      return;
    }
    fillAroundRaf = requestAnimationFrame(() => {
      fillAroundRaf = null;
      fillAround(lite);
      if (!lite) {
        lastLiteFillCamX = camX;
        lastLiteFillCamY = camY;
      }
      if (fillAroundNeedsFullPass) {
        fillAroundNeedsFullPass = false;
        requestFillAround(false);
      }
    });
  }

  function queueFullFillAfterInteraction() {
    if (fillAroundSettleTimer !== null) {
      clearTimeout(fillAroundSettleTimer);
    }
    fillAroundSettleTimer = setTimeout(() => {
      fillAroundSettleTimer = null;
      requestFillAround(false);
    }, BENTO_SETTLE_FULL_DELAY_MS);
  }

  function requestFillAroundLiteIfNeeded(force = false, scheduleSettle = true) {
    if (force) {
      lastLiteFillCamX = camX;
      lastLiteFillCamY = camY;
      requestFillAroundLite();
      if (scheduleSettle && !isInteractionActive) queueFullFillAfterInteraction();
      return;
    }
    const dx = camX - lastLiteFillCamX;
    const dy = camY - lastLiteFillCamY;
    if ((dx * dx) + (dy * dy) >= BENTO_LITE_MIN_MOVE_SCREEN_SQ) {
      lastLiteFillCamX = camX;
      lastLiteFillCamY = camY;
      requestFillAroundLite();
    }
    if (scheduleSettle && !isInteractionActive) queueFullFillAfterInteraction();
  }

  function requestFillAroundLite() {
    if (fillAroundNeedsFullPass || fillAroundLiteTimer !== null || fillAroundRaf !== null) return;
    fillAroundLiteTimer = setTimeout(() => {
      fillAroundLiteTimer = null;
      requestFillAround(true);
    }, BENTO_LITE_FILL_INTERVAL_MS);
  }

  /* Reset/reordenar mundo */
  function resetWorld(){
    if (fillAroundRaf !== null) {
      cancelAnimationFrame(fillAroundRaf);
      fillAroundRaf = null;
    }
    if (fillAroundLiteTimer !== null) {
      clearTimeout(fillAroundLiteTimer);
      fillAroundLiteTimer = null;
    }
    if (fillAroundSettleTimer !== null) {
      clearTimeout(fillAroundSettleTimer);
      fillAroundSettleTimer = null;
    }
    if (interactionSettleTimer !== null) {
      clearTimeout(interactionSettleTimer);
      interactionSettleTimer = null;
    }
    fillAroundNeedsFullPass = false;
    setInteractionActive(false);
    resetPlaneLimits();
    plane.innerHTML = "";
    columns.clear();
    globalId = 0;
    genPtr = 0;
    applyTransform();
    lastLiteFillCamX = camX;
    lastLiteFillCamY = camY;
    if (activeList.length === 0) {
      updateCount();
      return;
    }
    const scale = camScale || 1;
    const vw = viewportWidth / scale;
    const vh = viewportHeight / scale;
    const startIdx = Math.floor((-vw*0.5) / (COL_W+GAP)) - 2;
    const endIdx   = Math.floor((vw*1.5) / (COL_W+GAP)) + 2;
    for(let i=startIdx; i<=endIdx; i++){
      const col = ensureColumn(i);
      while(col.yDown < vh*1.15) makeCard(i,'down', nextMeta());
      while(col.yUp   > -vh*1.15) makeCard(i,'up',   nextMeta());
    }
    updateCount();
    requestFillAround();
  }
  function getUniqueDesignersCount(projects) {
    const source = Array.isArray(projects) ? projects : [];
    const seen = new Set();
    source.forEach((project) => {
      const authorRaw = project && (project._displayAuthor || project.author);
      splitAuthorNames(authorRaw).forEach((name) => {
        const key = toNameKey(name);
        if (key) seen.add(key);
      });
    });
    return seen.size;
  }

  function formatCountLine(projectTotal, designersTotal) {
    const projectLabel = projectTotal === 1 ? "proyecto" : "proyectos";
    const designerLabel = designersTotal === 1 ? "Diseñador UC" : "Diseñadores UC";
    return `${projectTotal} ${projectLabel} · ${designersTotal} ${designerLabel}`;
  }

  const updateCount = ()=> {
    if (!count) return;
    count.textContent = formatCountLine(activeList.length, getUniqueDesignersCount(activeList));
  };

  /* ===== Pan 2D mejorado: drag vs click ===== */
  const DRAG_THRESHOLD = 10; // px - umbral para distinguir drag de click (ajustado para desktop)
  let isDown = false;
  let isDragging = false;
  let startX = 0, startY = 0;
  let lastX = 0, lastY = 0;
  let downTarget = null;
  let activePid = null;
  let suppressClickUntil = 0; // Para evitar clicks fantasma después de drag
  const CARD_CONTEXT_BLOCK_SELECTOR = '.ref2d__item, .ref2d__view-card, .ref2d__simple-card';
  
  function resetPointerState(){
    isDown = false;
    isDragging = false;
    downTarget = null;
    activePid = null;
    viewport.classList.remove('is-dragging', 'is-panning');
  }
  
  // Handler de pointerdown
  function onPointerDown(e){
    if (activeView !== 'bento') return;
    // Ignorar clicks en elementos interactivos (botones, links, etc.)
    if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('.ref2d__chip')){
      return;
    }
    
    isDown = true;
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;
    activePid = e.pointerId;
    downTarget = e.target.closest('.ref2d__item');
    
    // Agregar clase de panning
    viewport.classList.add('is-panning');
    scheduleInteractionSettle();
  }
  
  // Handler de pointermove
  function onPointerMove(e){
    if (activeView !== 'bento') return;
    if(!isDown || activePid === null || e.pointerId !== activePid) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    // Calcular desplazamiento desde el inicio
    const totalDx = currentX - startX;
    const totalDy = currentY - startY;
    const totalDistance = Math.hypot(totalDx, totalDy);
    
    // Si supera el umbral, activar drag
    if(!isDragging && totalDistance > DRAG_THRESHOLD){
      isDragging = true;
      viewport.classList.add('is-dragging');
      // Si había un target, cancelarlo porque ahora es drag
      if(downTarget){
        downTarget = null;
      }
      // Suprimir clicks por un tiempo después de iniciar drag
      suppressClickUntil = performance.now() + 200;
    }
    
    // Si estamos arrastrando, aplicar pan
    if(isDragging){
      const dx = currentX - lastX;
      const dy = currentY - lastY;
      
      camX += dx;
      camY += dy;
      requestTransform();
      requestFillAroundLiteIfNeeded(false, false);
      scheduleInteractionSettle();
      
      lastX = currentX;
      lastY = currentY;
      
    }
  }
  
  // Handler de pointerup
  function onPointerUp(e){
    if (activeView !== 'bento') return;
    if(activePid === null || e.pointerId !== activePid) return;
    const hadDrag = isDragging;
    
    // Si hubo drag, suprimir clicks por un tiempo
    if(isDragging){
      suppressClickUntil = performance.now() + 200;
    }
    
    resetPointerState();
    if (hadDrag) {
      scheduleInteractionSettle();
    } else {
      setInteractionActive(false);
    }
  }
  
  // Handler de pointercancel
  function onPointerCancel(e){
    if (activeView !== 'bento') return;
    if(activePid === null || e.pointerId !== activePid) return;
    resetPointerState();
    scheduleInteractionSettle();
  }
  
  // Agregar listeners normales
  viewport.addEventListener('pointerdown', onPointerDown, { passive: false });
  // PERF:
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: false });
  window.addEventListener('pointercancel', onPointerCancel, { passive: false });
  
  // Bloqueo de click derecho / arrastre en imágenes de tarjetas (infinita, grilla, simple)
  document.addEventListener('contextmenu', (e) => {
    if (e.target && e.target.closest(CARD_CONTEXT_BLOCK_SELECTOR)) {
      e.preventDefault();
    }
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target && e.target.closest(CARD_CONTEXT_BLOCK_SELECTOR)) {
      e.preventDefault();
    }
  });
  
  // Handler de click para abrir popup (solo si no hubo drag)
  viewport.addEventListener('click', (e) => {
    if (activeView !== 'bento') return;
    // Si el click fue en una etiqueta o botón, no interferir
    if(e.target.closest('button') || e.target.closest('a') || e.target.closest('.ref2d__chip')){
      return;
    }

    // Suprimir click si acabamos de hacer drag o si isDragging estaba activo
    if(performance.now() < suppressClickUntil || isDragging){
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Buscar el item clickeado
    const item = e.target.closest('.ref2d__item');
    if(item){
      e.preventDefault();
      e.stopPropagation();
      openSpotlight(item);
    }
  });
  viewport.addEventListener('wheel',(e)=>{
    if (activeView !== 'bento') return;
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = Math.exp(-e.deltaY * 0.0015);
      zoomTo(camScale * zoomFactor, e.clientX, e.clientY, true);
      scheduleInteractionSettle();
      return;
    }
    camX -= e.deltaX; camY -= e.deltaY;
    requestTransform();
    requestFillAroundLiteIfNeeded(false, true);
    scheduleInteractionSettle();
  },{passive:false});
  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', ()=>{
      if (activeView !== 'bento') return;
      zoomBy(-CAM_SCALE_STEP, true);
    });
  }
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', ()=>{
      if (activeView !== 'bento') return;
      zoomBy(CAM_SCALE_STEP, true);
    });
  }
  if (btnCenter) {
    btnCenter.addEventListener('click', ()=>{
      if (activeView !== 'bento') return;
      camX=camY=0;
      camScale = CAM_SCALE_MAX;
      updateZoomButtons();
      resetWorld();
    });
  
  // Logo REFERENCIOTECA: recargar página completa para reordenar proyectos
  if (brand) {
    brand.addEventListener('click', (e) => {
      e.preventDefault(); // Prevenir el comportamiento por defecto del link
      // Recargar la página completamente para reordenar proyectos aleatoriamente
      window.location.reload();
    });
  }
  }

  /* ===== Spotlight - tamaño controlado por CSS responsivo ===== */
  let _onResizeWhileOpen = null;
  function sizeSheetByImage(nw, nh){
    // Ya no establecemos tamaños fijos - el CSS responsivo controla el tamaño
    // Esta función se mantiene por compatibilidad pero no hace nada
    // El CSS con max-width, max-height y object-fit: contain se encarga de todo
  }

  function closeRequestPanel() {
    isRequestSending = false;
    activeRequestType = "";
    if (sheetRequestPanel) sheetRequestPanel.hidden = true;
    if (sheetRequestEmail) sheetRequestEmail.value = "";
    if (sheetRequestMessage) sheetRequestMessage.value = "";
    if (sheetRequestStatus) {
      sheetRequestStatus.hidden = true;
      sheetRequestStatus.classList.remove('is-error');
      sheetRequestStatus.classList.remove('is-loading');
      sheetRequestStatus.textContent = "";
    }
    if (sheetRequestSend) {
      sheetRequestSend.disabled = false;
      sheetRequestSend.textContent = "Enviar solicitud";
    }
    if (sheetRequestCancel) sheetRequestCancel.disabled = false;
    if (sheetRequestClose) sheetRequestClose.disabled = false;
    if (sheetRequestEmail) sheetRequestEmail.disabled = false;
    if (sheetRequestMessage) sheetRequestMessage.disabled = false;
  }

  function setSupportOptionsOpen(isOpen) {
    if (sheetSupportOptions) sheetSupportOptions.hidden = !isOpen;
    if (sheetSupportToggle) sheetSupportToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  setSupportOptionsOpen(false);

  function buildRequestBaseText(typeKey) {
    const cfg = REQUEST_TYPES[typeKey] || REQUEST_TYPES.modify;
    const meta = activeSpotlightMeta || {};
    const urls = Array.isArray(meta.urls) ? meta.urls.filter(Boolean) : [];
    const firstUrl = urls[0] || meta.url || "";

    if (typeKey === "remove") {
      return `${cfg.prompt}\n`;
    }

    if (typeKey === "link") {
      return [
        firstUrl ? `Link a revisar: ${firstUrl}` : "Link a revisar:",
        "Detalle del problema:",
        ""
      ].join("\n");
    }

    const base = [
      `[Tipo] ${cfg.title}`,
      `[Proyecto] ${meta.title || "—"}`,
      `[Autor] ${meta.author || "—"}`,
      `[Año] ${meta.year || "—"}`,
      `[Área] ${meta.area || "—"}`,
      `[Link actual] ${firstUrl || "Sin link"}`,
      "",
      `${cfg.prompt}`,
      ""
    ];
    return base.join("\n");
  }

  function openRequestPanel(typeKey) {
    const cfg = REQUEST_TYPES[typeKey];
    if (!cfg || !sheetRequestPanel || !sheetRequestMessage) return;
    activeRequestType = typeKey;
    if (sheetRequestTitle) sheetRequestTitle.textContent = cfg.title;
    sheetRequestMessage.value = buildRequestBaseText(typeKey);
    if (sheetRequestEmail) sheetRequestEmail.required = true;
    if (sheetRequestStatus) {
      sheetRequestStatus.hidden = true;
      sheetRequestStatus.classList.remove('is-error');
      sheetRequestStatus.classList.remove('is-loading');
      sheetRequestStatus.textContent = "";
    }
    setSupportOptionsOpen(true);
    sheetRequestPanel.hidden = false;
    requestAnimationFrame(() => sheetRequestMessage.focus());
  }

  function sendRequestEmail() {
    if (isRequestSending) return;
    if (!activeRequestType || !sheetRequestMessage) return;
    const cfg = REQUEST_TYPES[activeRequestType] || REQUEST_TYPES.modify;
    const meta = activeSpotlightMeta || {};
    const requesterEmail = (sheetRequestEmail && sheetRequestEmail.value.trim()) ? sheetRequestEmail.value.trim() : "";
    if (!requesterEmail) {
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.add('is-error');
        sheetRequestStatus.textContent = "Ingresa tu correo para enviar la solicitud.";
      }
      if (sheetRequestEmail) sheetRequestEmail.focus();
      return;
    }
    if (sheetRequestEmail && !sheetRequestEmail.checkValidity()) {
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.add('is-error');
        sheetRequestStatus.textContent = "Revisa el formato del correo.";
      }
      sheetRequestEmail.reportValidity();
      return;
    }
    const message = (sheetRequestMessage.value || "").trim();
    if (!message) {
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.add('is-error');
        sheetRequestStatus.textContent = "Agrega un detalle antes de enviar.";
      }
      return;
    }

    const urls = Array.isArray(meta.urls) ? meta.urls.filter(Boolean) : [];
    const firstUrl = urls[0] || meta.url || "";
    const ticket = {
      id: `rq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      type: activeRequestType,
      typeLabel: cfg.title,
      projectTitle: meta.title || "Proyecto sin título",
      projectAuthor: meta.author || "—",
      projectYear: meta.year || "—",
      projectArea: meta.area || "—",
      projectUrl: firstUrl || "",
      requesterEmail,
      message,
      status: "open"
    };

    let savedOk = false;
    try {
      const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const nextList = Array.isArray(list) ? list : [];
      nextList.unshift(ticket);
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(nextList.slice(0, 2000)));
      savedOk = true;
    } catch (_) {
      savedOk = false;
    }

    if (!savedOk) {
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.add('is-error');
        sheetRequestStatus.textContent = "No se pudo guardar la solicitud. Intenta nuevamente.";
      }
      return;
    }

    const onSuccess = (msg) => {
      isRequestSending = false;
      if (sheetRequestSend) {
        sheetRequestSend.disabled = false;
        sheetRequestSend.textContent = "Enviar solicitud";
      }
      if (sheetRequestCancel) sheetRequestCancel.disabled = false;
      if (sheetRequestClose) sheetRequestClose.disabled = false;
      if (sheetRequestEmail) sheetRequestEmail.disabled = false;
      if (sheetRequestMessage) sheetRequestMessage.disabled = false;
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.remove('is-error');
        sheetRequestStatus.classList.remove('is-loading');
        sheetRequestStatus.textContent = msg;
      }
      if (sheetRequestMessage) {
        sheetRequestMessage.value = "";
      }
    };
    const onError = (msg) => {
      isRequestSending = false;
      if (sheetRequestSend) {
        sheetRequestSend.disabled = false;
        sheetRequestSend.textContent = "Enviar solicitud";
      }
      if (sheetRequestCancel) sheetRequestCancel.disabled = false;
      if (sheetRequestClose) sheetRequestClose.disabled = false;
      if (sheetRequestEmail) sheetRequestEmail.disabled = false;
      if (sheetRequestMessage) sheetRequestMessage.disabled = false;
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.add('is-error');
        sheetRequestStatus.classList.remove('is-loading');
        sheetRequestStatus.textContent = msg;
      }
    };

    isRequestSending = true;
    if (sheetRequestSend) {
      sheetRequestSend.disabled = true;
      sheetRequestSend.textContent = "Enviando...";
    }
    if (sheetRequestCancel) sheetRequestCancel.disabled = true;
    if (sheetRequestClose) sheetRequestClose.disabled = true;
    if (sheetRequestEmail) sheetRequestEmail.disabled = true;
    if (sheetRequestMessage) sheetRequestMessage.disabled = true;
    if (sheetRequestStatus) {
      sheetRequestStatus.hidden = false;
      sheetRequestStatus.classList.remove('is-error');
      sheetRequestStatus.classList.add('is-loading');
      sheetRequestStatus.textContent = "Enviando solicitud";
    }

    const sendEmailFallback = () => {
      const formData = new URLSearchParams();
      formData.set("_subject", `[Referencioteca] ${cfg.title}: ${ticket.projectTitle}`);
      formData.set("_captcha", "false");
      formData.set("_template", "table");
      formData.set("Tipo", ticket.typeLabel || ticket.type || "Solicitud");
      formData.set("Proyecto", ticket.projectTitle || "—");
      formData.set("Autor", ticket.projectAuthor || "—");
      formData.set("Año", ticket.projectYear || "—");
      formData.set("Área", ticket.projectArea || "—");
      formData.set("Link", ticket.projectUrl || "—");
      formData.set("Email solicitante", ticket.requesterEmail || "—");
      formData.set("Detalle", ticket.message || "");
      formData.set("ID Solicitud", ticket.id || "");
      formData.set("Fecha", ticket.createdAt || "");

      return fetch(REQUEST_EMAIL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: formData.toString()
      });
    };

    const sendCentral = () => {
      if (!REQUESTS_API_URL) return Promise.resolve({ skipped: true });
      const payload = new URLSearchParams();
      payload.set("mode", "create");
      payload.set("apiKey", REQUESTS_API_KEY || "");
      payload.set("id", ticket.id || "");
      payload.set("createdAt", ticket.createdAt || "");
      payload.set("type", ticket.type || "");
      payload.set("typeLabel", ticket.typeLabel || "");
      payload.set("projectTitle", ticket.projectTitle || "");
      payload.set("projectAuthor", ticket.projectAuthor || "");
      payload.set("projectYear", String(ticket.projectYear || ""));
      payload.set("projectArea", ticket.projectArea || "");
      payload.set("projectUrl", ticket.projectUrl || "");
      payload.set("requesterEmail", ticket.requesterEmail || "");
      payload.set("message", ticket.message || "");
      payload.set("status", ticket.status || "open");

      return fetch(REQUESTS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "Accept": "application/json"
        },
        body: payload.toString()
      }).then((res) => {
        if (!res.ok) throw new Error("central_send_failed");
        return res.json().catch(() => ({}));
      });
    };

    sendCentral()
      .then((data) => {
        if (data && data.skipped) {
          return sendEmailFallback().then((res) => {
            if (!res.ok) throw new Error("request_email_failed");
            onSuccess("Solicitud enviada correctamente al correo de Referencioteca.");
          });
        }
        onSuccess("Solicitud enviada correctamente al panel de solicitudes.");
      })
      .catch(() => sendEmailFallback().then((res) => {
        if (!res.ok) throw new Error("request_email_failed");
        onSuccess("Solicitud enviada al correo (falló panel central).");
      }).catch(() => {
        onError("Se guardó localmente, pero falló el envío.");
      }));
  }

  function openSpotlight(el){
    resetPointerState(); // por si quedó un drag “medio”
    const meta = el._meta || {};
    activeSpotlightMeta = {
      title: el.dataset.title || meta.title || "—",
      author: el.dataset.author || meta._displayAuthor || meta.author || "—",
      year: el.dataset.year || meta.year || "—",
      area: el.dataset.area || meta.area || "—",
      url: meta.url || el.dataset.url || "",
      urls: Array.isArray(meta.url) ? meta.url.slice() : [meta.url || el.dataset.url || ""].filter(Boolean)
    };
    closeRequestPanel();
    setSupportOptionsOpen(false);

    sTitle.textContent  = el.dataset.title  || meta.title  || "—";
    const authorText = el.dataset.author || meta._displayAuthor || meta.author || "—";
    renderPeopleInContainer(sAuthor, splitAuthorNames(authorText));
    if (sRole) {
      sRole.textContent = el.dataset.role || meta._displayRole || "Diseñador/a";
    }

    const creditsText = meta._displayCredits || el.dataset.credits || meta.collab || el.dataset.collab || "";
    if (sCredits) {
      renderCreditsWithClickablePeople(sCredits, creditsText, meta._peopleNames || []);
    }

    sArea.textContent   = el.dataset.area   || meta.area   || "—";
    sYear.textContent   = el.dataset.year   || meta.year   || "—";

    // Tags clicables → activan filtro (igual que en la grilla)
    sTags.innerHTML = "";
    (el.dataset.tags||"")
      .split("|")
      .map(s=>s.trim())
      .filter(Boolean)
      .forEach(t=>{
        const chip = document.createElement('span');
        chip.className="ref2d__chip";
        chip.textContent=t;
        chip.setAttribute('data-tag', t);
        const chipKey = norm(canonicalTagKey(t));
        chip.dataset.tagKey = chipKey;
        if (activeTagFilterKeys.has(chipKey)) {
          chip.classList.add('ref2d__chip--active');
        }
        chip.addEventListener('click', (e)=>{
          e.stopPropagation(); // Evita que el click cierre el modal de otra forma
          toggleTagFilter(t); // Esta función ya cierra el modal automáticamente
        });
        sTags.appendChild(chip);
      });

    // --------- Links (1 o varios) ----------
    // Limpia cualquier link extra generado antes
    document.querySelectorAll(".sheet__link.extra").forEach(a => a.remove());

    // Normalizamos el dato: puede venir como string o como array
    let urls = meta.url || el.dataset.url || "";
    if (!Array.isArray(urls)) {
      urls = urls ? [urls] : [];
    }

    if (!urls.length || !sLink) {
      // No hay links → escondemos el botón principal
      if (sLink) {
        sLink.style.display = "none";
      }
    } else {
      // Siempre mostramos el primer link como "Abrir proyecto ↗"
      sLink.href = urls[0];
      sLink.style.display = "inline-block";
      sLink.target = "_blank";
      sLink.rel = "noopener";
      sLink.textContent = "Abrir proyecto ↗";

      // Si hay links adicionales, creamos botones extra
      for (let i = 1; i < urls.length; i++) {
        const a = document.createElement("a");
        a.className = "sheet__link extra";
        a.href = urls[i];
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "Otro enlace ↗";
        sLink.insertAdjacentElement("afterend", a);
      }
    }

    renderSheetCitation(activeSpotlightMeta);

    // Imagen - prioriza la miniatura existente y cae a meta.src (clave para vista lista)
    const imgNode = el.querySelector("img");
    const src =
      imgNode?.currentSrc ||
      imgNode?.src ||
      getProjectPrimarySrc(meta) ||
      el.dataset.src ||
      "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
    const orientFromCard = getOrientationFromElement(el);
    const orientFromImage = imgNode ? getOrientationFromDimensions(imgNode.naturalWidth, imgNode.naturalHeight) : "";
    const orientFromMeta = normalizeOrientation(meta.orientation || "");
    const orientHint = orientFromCard || orientFromImage || orientFromMeta || 'h';

    if (sheetFig) {
      sheetFig.style.aspectRatio = ORIENTATION_ASPECT_CSS[orientHint] || ORIENTATION_ASPECT_CSS.h;
    }

    sheetImg.alt = el.dataset.title || meta.title || "";
    if (sheetImg.src !== src) {
      const sourceChain = [];
      if (src) sourceChain.push(src);
      getProjectImageCandidates(meta).forEach((candidate) => {
        if (!sourceChain.includes(candidate)) sourceChain.push(candidate);
      });
      setImageSrcChain(sheetImg, sourceChain);
    }
    // Ya no necesitamos calcular tamaños - el CSS se encarga de todo
    // Mantenemos el listener de resize por si se necesita en el futuro
    _onResizeWhileOpen = null;

    if (overlay) {
      overlay.removeAttribute('hidden');
    }
    document.body.style.overflow = "hidden";
    // Agregar clase para ocultar botones flotantes en mobile
    document.body.classList.add('is-modal-open');
  }

  function closeSpotlight(){
    closeRequestPanel();
    setSupportOptionsOpen(false);
    activeSpotlightMeta = null;
    renderSheetCitation(null);
    if (overlay) {
      overlay.setAttribute('hidden','');
    }
    document.body.style.overflow = "";
    // Remover clase para mostrar botones flotantes en mobile
    document.body.classList.remove('is-modal-open');
    if(_onResizeWhileOpen){
      window.removeEventListener('resize', _onResizeWhileOpen);
      _onResizeWhileOpen = null;
    }
  }

  if (overlay && modal) {
    overlay.addEventListener('click',(e)=>{
      if(!modal.contains(e.target)) closeSpotlight();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click',(e)=>{
      e.stopPropagation();
      closeSpotlight();
    });
  }
  if (sheetReportActions) {
    sheetReportActions.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-request-type]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      openRequestPanel(btn.dataset.requestType || "");
    });
  }
  if (sheetSupportToggle) {
    sheetSupportToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const expanded = sheetSupportToggle.getAttribute('aria-expanded') === 'true';
      setSupportOptionsOpen(!expanded);
    });
  }
  if (sheetRequestSend) {
    sheetRequestSend.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      sendRequestEmail();
    });
  }
  if (sheetRequestCancel) {
    sheetRequestCancel.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeRequestPanel();
    });
  }
  if (sheetRequestClose) {
    sheetRequestClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeRequestPanel();
    });
  }
  
  // Cerrar modal de proyecto con tecla Escape
  document.addEventListener('keydown', (e) => {
    // Solo cerrar si el modal de proyecto está abierto y no hay otros modales abiertos
    if (e.key === 'Escape' && overlay && !overlay.hidden) {
      if (sheetRequestPanel && !sheetRequestPanel.hidden) {
        e.preventDefault();
        closeRequestPanel();
        return;
      }
      // Verificar que no esté abierto el modal de categorías ni el modal institucional
      const catPanelOpen = catPanel && !catPanel.hidden;
      const wipOverlayOpen = wipOverlay && !wipOverlay.hidden;
      
      if (!catPanelOpen && !wipOverlayOpen) {
        e.preventDefault();
        closeSpotlight();
      }
    }
  });

  /* ===== Sugerencias de búsqueda ===== */
  let activeSuggestIndex = -1;

  function buildSuggestionGroups(query) {
    const q = norm(query).trim();
    if (!q) return [];

    const MAX_PER_GROUP = 6;
    const dedupeGlobal = new Set();

    const buildGroup = (type, title, values) => {
      const starts = [];
      const includes = [];
      values.forEach((raw) => {
        const value = String(raw || "").trim();
        if (!value) return;
        const key = norm(value);
        if (!key || dedupeGlobal.has(`${type}:${key}`)) return;
        if (key.startsWith(q)) starts.push(value);
        else if (key.includes(q)) includes.push(value);
      });
      const items = starts.concat(includes).slice(0, MAX_PER_GROUP);
      items.forEach((value) => dedupeGlobal.add(`${type}:${norm(value)}`));
      if (!items.length) return null;
      return { type, title, items };
    };

    const categoryLabels = Array.from(new Set(
      DB.flatMap((project) => getProjectTagKeys(project).map((key) => prettyTag(key)))
    ));
    const personLabels = Array.from(PEOPLE_BY_KEY.values());
    const projectTitles = DB.map((project) => project.title || "").filter(Boolean);

    return [
      buildGroup('category', 'Categorías', categoryLabels.concat(SUGGESTIONS)),
      buildGroup('person', 'Nombres', personLabels),
      buildGroup('project', 'Proyectos', projectTitles)
    ].filter(Boolean);
  }

  function showSuggestions(query) {
    if (!suggestionsBox) return;

    // Resetear índice activo cuando cambian las sugerencias
    activeSuggestIndex = -1;

    const groups = buildSuggestionGroups(query);
    if (!groups.length) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.hidden = true;
      return;
    }

    suggestionsBox.innerHTML = groups.map((group) => {
      const items = group.items.map((value) => (
        `<div class="ref2d__suggestion-item" data-suggestion="${value}" data-kind="${group.type}" role="option" tabindex="-1">${value}</div>`
      )).join('');
      return `<div class="ref2d__suggestion-group"><div class="ref2d__suggestion-groupTitle">${group.title}</div>${items}</div>`;
    }).join('');

    suggestionsBox.hidden = false;
    suggestionsBox.setAttribute('role', 'listbox');
  }

  // Función para aplicar una sugerencia (reutilizable desde click y teclado)
  function applySuggestion(value, kind = '') {
    if (!search) return;
    const clean = String(value || '').trim();
    if (!clean) return;
    const normalizedKind = String(kind || '').trim();

    if (normalizedKind === 'person') {
      const key = normalizePersonKey(clean);
      if (isKnownPersonKey(key)) {
        setActivePersonFilters([key]);
        updateSearchWithActiveFilters();
        applyFilter({
          tagKeys: Array.from(activeTagFilterKeys),
          personKeys: Array.from(activePersonFilterKeys)
        });
      } else {
        search.value = clean;
        queueFilter(clean, true);
      }
    } else if (normalizedKind === 'category') {
      const key = normalizeTagKey(clean);
      if (isKnownTagKey(key)) {
        setActiveTagFilters([key]);
        updateSearchWithActiveFilters();
        applyFilter({
          tagKeys: Array.from(activeTagFilterKeys),
          personKeys: Array.from(activePersonFilterKeys)
        });
      } else {
        search.value = clean;
        queueFilter(clean, true);
      }
    } else {
      search.value = clean;
      queueFilter(clean, true);
    }

    if (suggestionsBox) {
      suggestionsBox.hidden = true;
    }
    activeSuggestIndex = -1;
  }

  // Actualizar la sugerencia activa visualmente
  function updateActiveSuggestion(items) {
    if (!items || items.length === 0) return;
    
    items.forEach((el, i) => {
      if (i === activeSuggestIndex) {
        el.classList.add('is-active');
        el.setAttribute('aria-selected', 'true');
        // Scroll automático para mantener visible el item activo
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        el.classList.remove('is-active');
        el.removeAttribute('aria-selected');
      }
    });
  }

  // Cerrar sugerencias y resetear estado
  function closeSuggestions() {
    if (!suggestionsBox) return;
    suggestionsBox.hidden = true;
    activeSuggestIndex = -1;
    
    // Limpiar clase activa de todos los items
    const items = suggestionsBox.querySelectorAll('.ref2d__suggestion-item');
    items.forEach(el => {
      el.classList.remove('is-active');
      el.removeAttribute('aria-selected');
    });
  }

  function updateSearchClearVisibility() {
    if (!searchClearBtn || !search) return;
    searchClearBtn.hidden = !search.value.trim();
  }

  function queueFilter(term, immediate = false) {
    if (filterDebounceTimer !== null) {
      clearTimeout(filterDebounceTimer);
      filterDebounceTimer = null;
    }
    if (immediate || activeView !== 'bento') {
      applyFilter(term);
      return;
    }
    filterDebounceTimer = setTimeout(() => {
      filterDebounceTimer = null;
      applyFilter(term);
    }, FILTER_DEBOUNCE_MS);
  }

  function normalizeTagKey(term) {
    const normalized = norm(term).replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    return norm(canonicalTagKey(normalized));
  }

  function normalizePersonKey(term) {
    return toNameKey(canonicalPersonLabel(term));
  }

  function getProjectPersonKeys(project) {
    return (project && Array.isArray(project._peopleKeys)) ? project._peopleKeys : [];
  }

  function isKnownPersonKey(personKey) {
    if (!personKey) return false;
    return PEOPLE_BY_KEY.has(personKey);
  }

  function getActiveTagKeysFromTerm(term) {
    const normalized = norm(term).replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    const parts = normalized
      .split(/\s*\+\s*|,/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length <= 1) return [];

    const keys = parts.map((part) => normalizeTagKey(part)).filter(Boolean);
    if (!keys.length) return [];
    const allKnown = keys.every((key) => isKnownTagKey(key));
    return allKnown ? Array.from(new Set(keys)) : [];
  }

  function syncActiveTagChips() {
    const chips = document.querySelectorAll('.ref2d__chip[data-tag]');
    chips.forEach((chip) => {
      const rawTag = chip.dataset.tag || chip.textContent || '';
      const chipKey = normalizeTagKey(rawTag);
      chip.classList.toggle('ref2d__chip--active', !!chipKey && activeTagFilterKeys.has(chipKey));
    });
  }

  function syncActivePersonChips() {
    const chips = document.querySelectorAll('.ref2d__chip[data-person]');
    chips.forEach((chip) => {
      const rawPerson = chip.dataset.person || chip.textContent || '';
      const chipKey = normalizePersonKey(rawPerson);
      chip.classList.toggle('ref2d__chip--active', !!chipKey && activePersonFilterKeys.has(chipKey));
    });
  }

  function setActiveTagFilters(keys) {
    const next = Array.isArray(keys) ? keys.map((k) => normalizeTagKey(k)).filter(Boolean) : [];
    activeTagFilterKeys = new Set(next);
    syncActiveTagChips();
  }

  function setActivePersonFilters(keys) {
    const next = Array.isArray(keys) ? keys.map((k) => normalizePersonKey(k)).filter(Boolean) : [];
    activePersonFilterKeys = new Set(next);
    syncActivePersonChips();
  }

  function getProjectTagKeys(project) {
    return (project._tagKeys && project._tagKeys.length)
      ? project._tagKeys
      : (project.tags || []).map(canonicalTagKey).filter(Boolean);
  }

  function filterProjectsByTagKeys(tagKeys) {
    const keys = Array.isArray(tagKeys) ? tagKeys.map((k) => normalizeTagKey(k)).filter(Boolean) : [];
    if (!keys.length) return DB_ORDERED.slice();
    return DB_ORDERED.filter((project) => {
      const projectKeys = getProjectTagKeys(project).map((k) => normalizeTagKey(k)).filter(Boolean);
      return keys.every((key) => projectKeys.includes(key));
    });
  }

  function filterProjectsByTagAndPersonKeys(tagKeys, personKeys) {
    const normTagKeys = Array.isArray(tagKeys) ? tagKeys.map((k) => normalizeTagKey(k)).filter(Boolean) : [];
    const normPersonKeys = Array.isArray(personKeys) ? personKeys.map((k) => normalizePersonKey(k)).filter(Boolean) : [];
    if (!normTagKeys.length && !normPersonKeys.length) return DB_ORDERED.slice();
    return DB_ORDERED.filter((project) => {
      const projectTagKeys = getProjectTagKeys(project).map((k) => normalizeTagKey(k)).filter(Boolean);
      const projectPersonKeys = getProjectPersonKeys(project).map((k) => normalizePersonKey(k)).filter(Boolean);
      const matchesTags = normTagKeys.every((key) => projectTagKeys.includes(key));
      const matchesPeople = normPersonKeys.every((key) => projectPersonKeys.includes(key));
      return matchesTags && matchesPeople;
    });
  }

  function filterProjectsByTagKey(tagKey) {
    return filterProjectsByTagKeys([tagKey]);
  }

  function isKnownTagKey(tagKey) {
    if (!tagKey) return false;
    if (tagKey !== 'all' && Object.prototype.hasOwnProperty.call(CAT_LABELS, tagKey)) return true;
    return DB.some((project) => getProjectTagKeys(project).includes(tagKey));
  }

  function getCombinedKeysFromTerm(term) {
    const normalized = String(term || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return { tagKeys: [], personKeys: [] };
    const parts = normalized
      .split(/\s*\+\s*|,/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length <= 1) return { tagKeys: [], personKeys: [] };

    const tagKeys = [];
    const personKeys = [];
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      const tagKey = normalizeTagKey(part);
      if (isKnownTagKey(tagKey)) {
        if (!tagKeys.includes(tagKey)) tagKeys.push(tagKey);
        continue;
      }
      const personKey = normalizePersonKey(part);
      if (isKnownPersonKey(personKey)) {
        if (!personKeys.includes(personKey)) personKeys.push(personKey);
        continue;
      }
      return { tagKeys: [], personKeys: [] };
    }
    return { tagKeys, personKeys };
  }

  function tokenizeSearchTerm(term) {
    const normalized = norm(term).replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    // Prioriza alias de frase completa para búsquedas semánticas:
    // ej. "poster" -> "afiche", "stop motion" -> "animación".
    const fullCanonical = canonicalTagKey(normalized);
    if (fullCanonical && fullCanonical !== normalized) {
      return [norm(fullCanonical)];
    }

    const tokens = normalized
      .split(/\s+/)
      .map((t) => norm(canonicalTagKey(t.trim())))
      .filter(Boolean);

    return Array.from(new Set(tokens));
  }

  function updateSearchWithActiveFilters() {
    if (!search) return;
    const tagLabels = Array.from(activeTagFilterKeys).map((key) => prettyTag(key));
    const personLabels = Array.from(activePersonFilterKeys).map((key) => getPersonDisplayName(key));
    const labels = tagLabels.concat(personLabels);
    search.value = labels.join(' + ');
    updateSearchClearVisibility();
  }

  function toggleTagFilter(tag) {
    const key = normalizeTagKey(tag);
    if (!key) return;
    const next = new Set(activeTagFilterKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setActiveTagFilters(Array.from(next));
    updateSearchWithActiveFilters();
    applyFilter({
      tagKeys: Array.from(activeTagFilterKeys),
      personKeys: Array.from(activePersonFilterKeys)
    });
  }

  function togglePersonFilter(name) {
    const key = normalizePersonKey(name);
    if (!key) return;
    const next = new Set(activePersonFilterKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setActivePersonFilters(Array.from(next));
    updateSearchWithActiveFilters();
    applyFilter({
      tagKeys: Array.from(activeTagFilterKeys),
      personKeys: Array.from(activePersonFilterKeys)
    });
  }

  function getFilteredProjects(tokens) {
    if (!tokens.length) return DB_ORDERED.slice();

    const strict = DB.filter((x) => {
      const hay = x._search || '';
      return tokens.every((tok) => hay.includes(tok));
    });
    if (strict.length) return strict;

    // Fallback tolerante: si no hay match estricto, mostrar coincidencias parciales
    return DB.filter((x) => {
      const hay = x._search || '';
      return tokens.some((tok) => hay.includes(tok));
    });
  }

  /* ===== Filtro que reordena (robusto) ===== */
  function applyFilter(term){
    if (filterDebounceTimer !== null) {
      clearTimeout(filterDebounceTimer);
      filterDebounceTimer = null;
    }
    updateSearchClearVisibility();
    const forcedTagKeys = Array.isArray(term)
      ? term.map((k) => normalizeTagKey(k)).filter(Boolean)
      : (term && typeof term === 'object' && !Array.isArray(term))
        ? (Array.isArray(term.tagKeys) ? term.tagKeys.map((k) => normalizeTagKey(k)).filter(Boolean) : null)
        : null;
    const forcedPersonKeys = (term && typeof term === 'object' && !Array.isArray(term))
      ? (Array.isArray(term.personKeys) ? term.personKeys.map((k) => normalizePersonKey(k)).filter(Boolean) : null)
      : null;
    const textTerm = (term && typeof term === 'object' && !Array.isArray(term))
      ? String(term.term || '')
      : String(Array.isArray(term) ? '' : (term || ''));

    const combinedFromInput = getCombinedKeysFromTerm(textTerm);
    const tagKeysFromInput = forcedTagKeys || combinedFromInput.tagKeys || [];
    const personKeysFromInput = forcedPersonKeys || combinedFromInput.personKeys || [];

    if (tagKeysFromInput.length || personKeysFromInput.length) {
      const list = filterProjectsByTagAndPersonKeys(tagKeysFromInput, personKeysFromInput);
      setActiveTagFilters(tagKeysFromInput);
      setActivePersonFilters(personKeysFromInput);
      if (list.length === 0) {
        activeList = [];
        if (activeView === 'bento') {
          camX = 0;
          camY = 0;
          applyTransform();
        }
        closeSpotlight();
        renderActiveView();
        if (count) {
          const labels = tagKeysFromInput.map((k) => prettyTag(k)).concat(personKeysFromInput.map((k) => getPersonDisplayName(k)));
          count.textContent = `${formatCountLine(0, 0)} — sin resultados para “${labels.join(' + ')}”`;
        }
        highlightActiveCategory(tagKeysFromInput.length === 1 ? tagKeysFromInput[0] : '');
        return;
      }
      activeList = list;
      highlightActiveCategory(tagKeysFromInput.length === 1 ? tagKeysFromInput[0] : '');
      if (activeView === 'bento') {
        camX = 0;
        camY = 0;
        applyTransform();
      }
      closeSpotlight();
      renderActiveView();
      syncActiveTagChips();
      syncActivePersonChips();
      return;
    }

    const q = norm(textTerm);
    const normalizedTerm = q.replace(/\s+/g, ' ').trim();
    const exactTagKey = normalizedTerm ? normalizeTagKey(normalizedTerm) : '';
    const shouldUseExactTag = isKnownTagKey(exactTagKey);
    const exactPersonKey = normalizedTerm ? normalizePersonKey(normalizedTerm) : '';
    const shouldUseExactPerson = isKnownPersonKey(exactPersonKey);
    const tokens = tokenizeSearchTerm(textTerm);
    if(q){
      const list = (shouldUseExactTag || shouldUseExactPerson)
        ? filterProjectsByTagAndPersonKeys(
            shouldUseExactTag ? [exactTagKey] : [],
            shouldUseExactPerson ? [exactPersonKey] : []
          )
        : getFilteredProjects(tokens);
      if(list.length === 0){
        activeList = [];
        setActiveTagFilters([]);
        setActivePersonFilters([]);
        if (activeView === 'bento') {
          camX = 0;
          camY = 0;
          applyTransform();
        }
        closeSpotlight();
        renderActiveView();
        if (count) {
          count.textContent = `${formatCountLine(0, 0)} — sin resultados para “${textTerm}”`;
        }
        // Limpiar highlight de categorías si no hay resultados
        highlightActiveCategory('');
        return;
      }
      activeList = list;
      setActiveTagFilters(shouldUseExactTag ? [exactTagKey] : []);
      setActivePersonFilters(shouldUseExactPerson ? [exactPersonKey] : []);
      // Sincronizar highlight de categorías si el término coincide con una categoría
      const matchingCat = shouldUseExactTag
        ? exactTagKey
        : (normalizedTerm ? canonicalTagKey(normalizedTerm) : '');
      highlightActiveCategory(matchingCat || '');
    }else{
      // Sin filtro: usar el orden reordenado inicial
      activeList = DB_ORDERED.slice();
      setActiveTagFilters([]);
      setActivePersonFilters([]);
      highlightActiveCategory('all');
    }
    if (activeView === 'bento') {
      // Evita bloqueos cuando se filtra después de desplazarse mucho en infinito.
      camX = 0;
      camY = 0;
      applyTransform();
    }
    closeSpotlight();
    renderActiveView();
    syncActiveTagChips();
    syncActivePersonChips();
  }
  if (search) {
    updateSearchClearVisibility();
    // Mostrar sugerencias al escribir o al hacer focus
    search.addEventListener('focus', () => {
      showSuggestions(search.value);
    });

    search.addEventListener('input', (e) => {
      const value = e.target.value;
      showSuggestions(value);
      updateSearchClearVisibility();
      queueFilter(value);
    });

    // Navegación con teclado en sugerencias
    search.addEventListener('keydown', (e) => {
      const items = suggestionsBox
        ? Array.from(suggestionsBox.querySelectorAll('.ref2d__suggestion-item'))
        : [];

      const isOpen = suggestionsBox && !suggestionsBox.hidden && items.length > 0;

      if (e.key === 'ArrowDown') {
        if (isOpen) {
          e.preventDefault();
          activeSuggestIndex = (activeSuggestIndex + 1) % items.length;
          updateActiveSuggestion(items);
        } else {
          // Si está cerrado, abrir y seleccionar primera
          if (search.value.trim()) {
            showSuggestions(search.value);
            const newItems = Array.from(suggestionsBox.querySelectorAll('.ref2d__suggestion-item'));
            if (newItems.length > 0) {
              activeSuggestIndex = 0;
              updateActiveSuggestion(newItems);
            }
          }
        }
      } else if (e.key === 'ArrowUp') {
        if (isOpen) {
          e.preventDefault();
          activeSuggestIndex = (activeSuggestIndex - 1 + items.length) % items.length;
          updateActiveSuggestion(items);
        }
      } else if (e.key === 'Enter') {
        if (isOpen && activeSuggestIndex >= 0 && activeSuggestIndex < items.length) {
          e.preventDefault();
          const item = items[activeSuggestIndex];
          const value = item.dataset.suggestion || item.textContent.trim();
          applySuggestion(value, item.dataset.kind || '');
        } else {
          queueFilter(search.value, true);
        }
        // Si no hay sugerencia activa, Enter funciona normal (búsqueda con texto actual)
      } else if (e.key === 'Escape') {
        if (isOpen) {
          e.preventDefault();
          closeSuggestions();
        } else {
          // Si está cerrado, limpiar búsqueda
          search.value = '';
          updateSearchClearVisibility();
          queueFilter('', true);
        }
      }
    });
  }

  if (searchClearBtn && search) {
    searchClearBtn.addEventListener('click', () => {
      search.value = '';
      updateSearchClearVisibility();
      closeSuggestions();
      queueFilter('', true);
      search.focus();
    });
  }

  // Manejar clics en las sugerencias
  if (suggestionsBox) {
    suggestionsBox.addEventListener('click', (ev) => {
      const item = ev.target.closest('.ref2d__suggestion-item');
      if (!item) return;

      const term = item.dataset.suggestion || item.textContent.trim();
      applySuggestion(term, item.dataset.kind || '');
    });
  }

  // Ocultar sugerencias al hacer clic fuera
  document.addEventListener('click', (ev) => {
    if (suggestionsBox && 
        !ev.target.closest('#ref2dSearch') &&
        !ev.target.closest('#ref2dSuggestions')) {
      closeSuggestions();
    }
  });


  /* API pública para tus proyectos reales */
  window.Refx2D = {
    add(item){
      const id = DB.length;
      const newItem = Object.assign(
        {id, src:"", srcOriginal:"", orientation:"h", span:1, tags:[], title:"—", author:"—", role:"", collab:"", area:"—", year:"—", url:""},
        item
      );
      normalizeProjectTags(newItem);
      DB.push(newItem);
      PEOPLE_BY_KEY = buildPeopleIndex(DB);
      rebuildBentoRandomSpans();
      // Reordenar DB_ORDERED cuando se agrega un nuevo proyecto
      if (USE_RANDOM_SHUFFLE) {
        DB_ORDERED = shuffleArray(DB);
      } else {
        DB_ORDERED = rotateArray(DB, 0); // Rotar sin cambiar offset (solo reordenar con el nuevo item)
      }
      if(search && search.value.trim()===""){
        activeList = DB_ORDERED.slice();
        renderActiveView();
      } else {
        applyFilter(search ? search.value : "");
      }
    }
  };

  /* Reflow al redimensionar */
  window.addEventListener('resize', ()=>{
    COL_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--colw'));
    GAP   = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap'));
    refreshViewportSize();
    resetPlaneLimits();
    const forcedViewChange = syncViewOptionsWithViewport();
    if (!forcedViewChange) {
      renderActiveView();
    }
  });

  /* ===== Panel de categorías ===== */
  // Construir estadísticas de categorías
  function buildCategoryStats(projects) {
    const stats = {};

    projects.forEach(p => {
      const keys = (p._tagKeys && p._tagKeys.length)
        ? p._tagKeys
        : (p.tags || []).map(canonicalTagKey);
    
      keys.forEach(key => {
        if (!key) return;
        if (!stats[key]) stats[key] = 0;
        stats[key] += 1;
      });
    });

    const total = projects.length;

    const list = [
      { key: 'all', label: CAT_LABELS.all || 'ALL', count: total }
    ];

    Object.entries(stats)
      .sort((a, b) => {
        // Ordenar por label normalizado, no por key
        const labelA = CAT_LABELS[a[0]] || a[0].toUpperCase();
        const labelB = CAT_LABELS[b[0]] || b[0].toUpperCase();
        return labelA.localeCompare(labelB);
      })
      .forEach(([key, count]) => {
        const label = CAT_LABELS[key] || prettyTag(key);
        list.push({ key, label, count });
      });

    return list;
  }

  // Abrir panel de categorías
  function openCatPanel() {
    if (!catPanel) return;
    catPanel.hidden = false;
    if (catToggle) catToggle.setAttribute('aria-expanded', 'true');
    if (mobileCatToggle) mobileCatToggle.setAttribute('aria-expanded', 'true');
    // Bloquear scroll del body en mobile
    if (window.innerWidth <= 768) {
      document.body.classList.add('ref2d__catPanel-open');
    }
  }

  // Cerrar panel de categorías
  function closeCatPanel() {
    if (!catPanel) return;
    catPanel.hidden = true;
    if (catToggle) catToggle.setAttribute('aria-expanded', 'false');
    if (mobileCatToggle) mobileCatToggle.setAttribute('aria-expanded', 'false');
    // Desbloquear scroll del body
    document.body.classList.remove('ref2d__catPanel-open');
  }

  // Aplicar filtro de categoría
  function applyCategoryFilter(key) {
    if (key === 'all') {
      // Limpiar búsqueda y mostrar todos
      if (search) search.value = '';
      applyFilter('');
    } else {
      if (search) search.value = prettyTag(key);
      applyFilter([key]);
    }
    highlightActiveCategory(key);
  }

  // Resaltar categoría activa
  function highlightActiveCategory(activeKey) {
    if (!catGrid) return;
    const items = catGrid.querySelectorAll('.ref2d__catItem');
    items.forEach(el => {
      el.classList.toggle(
        'ref2d__catItem--active',
        el.dataset.catKey === activeKey
      );
    });
  }

  // Inicializar panel de categorías
  function initCategoryPanel() {
    if (!catGrid) return;

    const categories = buildCategoryStats(DB);
    catGrid.innerHTML = '';

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ref2d__catItem';
      btn.dataset.catKey = cat.key;
      btn.innerHTML = `
        <span class="ref2d__catItem-label">${cat.label}</span>
        <span class="ref2d__catItem-count">${cat.count}</span>
      `;
      catGrid.appendChild(btn);
    });

    // Toggle del botón desktop
    if (catToggle) {
      catToggle.addEventListener('click', () => {
        if (catPanel && catPanel.hidden) {
          openCatPanel();
        } else {
          closeCatPanel();
        }
      });
    }

    // Toggle del botón flotante mobile
    if (mobileCatToggle) {
      mobileCatToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (catPanel && catPanel.hidden) {
          openCatPanel();
        } else {
          closeCatPanel();
        }
      });
    }

    // Click en categorías
    if (catGrid) {
      catGrid.addEventListener('click', (ev) => {
        const btn = ev.target.closest('.ref2d__catItem');
        if (!btn) return;
        const key = btn.dataset.catKey;
        if (!key) return;

        applyCategoryFilter(key);
        closeCatPanel();
      });
    }

    // Cerrar con Escape
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && catPanel && !catPanel.hidden) {
        closeCatPanel();
      }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (ev) => {
      if (catPanel && !catPanel.hidden &&
          !ev.target.closest('#ref2dCatPanel') &&
          !ev.target.closest('#ref2dCatToggle') &&
          !ev.target.closest('#ref2dMobileCatToggle')) {
        closeCatPanel();
      }
    });
  }

  function openViewMenu() {
    if (!viewMenu || !viewToggle) return;
    viewMenu.hidden = false;
    viewToggle.setAttribute('aria-expanded', 'true');
  }

  function closeViewMenu() {
    if (!viewMenu || !viewToggle) return;
    viewMenu.hidden = true;
    viewToggle.setAttribute('aria-expanded', 'false');
  }

  function isMobileViewport() {
    return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
  }

  function sanitizeViewForViewport(view) {
    if (isMobileViewport()) {
      if (!MOBILE_ALLOWED_VIEWS.has(view)) return 'grid';
      return view;
    }
    if (!DESKTOP_ALLOWED_VIEWS.has(view)) return 'bento';
    return view;
  }

  function syncViewOptionsWithViewport() {
    const mobile = isMobileViewport();
    if (viewMenu) {
      viewMenu.querySelectorAll('button[data-view]').forEach((btn) => {
        const view = btn.dataset.view;
        btn.hidden = mobile && !MOBILE_ALLOWED_VIEWS.has(view);
      });
    }
    if (mobile && !MOBILE_ALLOWED_VIEWS.has(activeView)) {
      setView('grid');
      return true;
    }
    return false;
  }

  function initViewSwitcher() {
    if (!viewToggle || !viewMenu) return;
    syncViewOptionsWithViewport();

    viewToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (viewMenu.hidden) openViewMenu();
      else closeViewMenu();
    });

    viewMenu.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-view]');
      if (!btn) return;
      setView(btn.dataset.view);
      closeViewMenu();
    });

    document.addEventListener('click', (e) => {
      if (viewMenu.hidden) return;
      if (!e.target.closest('#ref2dViewMenu') && !e.target.closest('#ref2dViewToggle')) {
        closeViewMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && viewMenu && !viewMenu.hidden) {
        closeViewMenu();
      }
    });
  }

  function openHeaderMore() {
    if (!headerMoreBtn || !headerMoreDropdown) return;
    headerMoreDropdown.hidden = false;
    headerMoreBtn.setAttribute('aria-expanded', 'true');
  }

  function closeHeaderMore() {
    if (!headerMoreBtn || !headerMoreDropdown) return;
    headerMoreDropdown.hidden = true;
    headerMoreBtn.setAttribute('aria-expanded', 'false');
  }

  function initHeaderMore() {
    if (headerMoreBtn && headerMoreDropdown) {
      headerMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (headerMoreDropdown.hidden) openHeaderMore();
        else closeHeaderMore();
      });

      document.addEventListener('click', (e) => {
        if (headerMoreDropdown.hidden) return;
        if (!e.target.closest('#ref2dHeaderMore') && !e.target.closest('#ref2dHeaderMoreDropdown')) {
          closeHeaderMore();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      closeHeaderMore();
    });
  }

  function initRandomButton() {
    const onRandomClick = () => {
      if (activeView === 'grid') {
        activeList = shuffleArray(activeList);
        renderMultiGridView();
        updateCount();
        return;
      }
    };
    if (btnRandom) btnRandom.addEventListener('click', onRandomClick);
    if (btnSearchRandom) btnSearchRandom.addEventListener('click', onRandomClick);
  }

  function initIndexSorting() {
    if (!indexList) return;
    const headers = indexList.querySelectorAll('.ref2d__indexTable th[data-sort]');
    headers.forEach((th) => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (!key) return;
        if (listSortKey === key) {
          listSortDir *= -1;
        } else {
          listSortKey = key;
          listSortDir = key === 'year' ? -1 : 1;
        }
        renderIndexListView();
        updateCount();
      });
    });
  }

  /* ===== Modal institucional (work in progress) ===== */
  const wipOverlay = $("#ref2dWipOverlay");
  const wipClose = $("#ref2dWipClose");
  
  function showWipModal(){
    if (!wipOverlay) return;
    // Verificar si ya se cerró en esta sesión
    const hasDismissed = sessionStorage.getItem("ref_wip_dismissed");
    if (hasDismissed === "1") {
      wipOverlay.setAttribute('hidden', '');
      return;
    }
    // Mostrar modal
    wipOverlay.removeAttribute('hidden');
    document.body.style.overflow = "hidden";
  }
  
  function closeWipModal(){
    if (!wipOverlay) return;
    wipOverlay.setAttribute('hidden', '');
    document.body.style.overflow = "";
    // Guardar en sessionStorage que se cerró en esta sesión
    sessionStorage.setItem("ref_wip_dismissed", "1");
  }
  
  // Cerrar con botón X
  if (wipClose) {
    wipClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeWipModal();
    });
  }
  
  // Cerrar al hacer click fuera del modal
  if (wipOverlay) {
    wipOverlay.addEventListener('click', (e) => {
      if (e.target === wipOverlay) {
        closeWipModal();
      }
    });
  }
  
  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wipOverlay && !wipOverlay.hidden) {
      closeWipModal();
    }
  });

  /* Boot */
  if (overlay) {
    overlay.setAttribute('hidden',''); // garantía extra
  }
  
  // Inicializar panel de categorías
  initCategoryPanel();
  initViewSwitcher();
  initHeaderMore();
  initRandomButton();
  initIndexSorting();
  setView(activeView);
  
  // Mostrar modal institucional al cargar (si no se ha visto antes)
  showWipModal();
})();
