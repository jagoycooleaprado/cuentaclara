/* ============================================================
   CONFIGURACIÓN DEL SITIO — lo único que tienes que editar
   Después de cambiar algo, ejecuta:  node build.js
   ============================================================ */
module.exports = {
  siteName: 'CuentaClara',
  tagline: 'Calculadoras de sueldo, finiquito y finanzas para Chile',
  // 1) Dominio (hoy: GitHub Pages; cuando compres el .cl, cámbialo aquí) (con https://, sin "/" final)
  domain: 'https://jagoycooleaprado.github.io/cuentaclara',
  contactEmail: '', // pon un correo real para mostrarlo en /contacto y /privacidad
  year: 2026,

  // 2) Publicidad Google AdSense (cuando te aprueben). Deja '' para no mostrar avisos.
  //    client: 'ca-pub-XXXXXXXXXXXXXXXX'
  adsense: {
    client: '',
    slots: { top: '', middle: '', bottom: '' } // IDs de bloques de anuncio (data-ad-slot)
  },

  // 3) Analítica opcional (Google Analytics 4): 'G-XXXXXXXXXX'
  gaId: '',

  // 4) Enlaces de afiliado / captación de clientes. Solo se muestran si pones la URL.
  //    Se ubican en la página relacionada. Ejemplo: url: 'https://...tu-link-de-afiliado'
  affiliates: {
    hipotecario: { url: '', texto: 'Compara y cotiza tu crédito hipotecario con distintos bancos', boton: 'Cotizar gratis' },
    finiquito:   { url: '', texto: '¿Te despidieron y tienes dudas? Consulta tu caso con un abogado laboral', boton: 'Consultar' },
    honorarios:  { url: '', texto: 'Emite tus boletas y gestiona tus impuestos con una herramienta para independientes', boton: 'Probar gratis' },
    sueldo:      { url: '', texto: 'Mejora tus finanzas: compara alternativas de ahorro e inversión', boton: 'Ver opciones' },
    afp:         { url: '', texto: 'Compara alternativas para complementar tu pensión', boton: 'Ver opciones' }
  }
};
