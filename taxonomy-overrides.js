/* Manual overrides (safe to edit). */
window.REF2D_TAXONOMY_OVERRIDES = {
  // Mantén false para que no aparezcan en sugerencias visibles.
  importSuggestions: false,
  importProjectTags: false,

  // Redirecciones manuales: "termino usuario": "tag canonico"
  // Ejemplos:
  // "polera": "textil",
  // "poleron": "textil",
  // "remera": "textil",
  // "foto producto": "fotografia",
  // "fotito": "fotografia",
  aliases: {
    // Mantener audiovisual separado de animación
    "audiovisual": "audiovisual",
    "pieza audiovisual": "audiovisual",
    "video audiovisual": "audiovisual",

    "impreso": "impresion",
    "sitio web": "web",
    "servicio": "diseno servicio",
    "objeto": "producto",
    "redes sociales": "rrss",
    "social media": "rrss",

    // Ajustes manuales de indumentaria/textil
    "polera": "textil",
    "poleron": "textil",
    "remera": "textil",
    "camiseta": "textil"
  },

  // Solo se usarán si importSuggestions=true.
  suggestions: [],
  projectTags: []
};
