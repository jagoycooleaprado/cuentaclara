/* Generador del sitio estático → carpeta /site.  Uso:  node build.js */
const fs = require('fs');
const path = require('path');
const cfg = require('./config.js');
const CC = require('./assets/calc-core.js');
const pages = require('./src/pages.js');
const P = CC.P;

const OUT = path.join(__dirname, 'docs');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripTags = s => String(s).replace(/<[^>]+>/g, '');
const hoy = new Date().toISOString().slice(0, 10);
const favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Crect x='1' y='1' width='26' height='26' rx='8' fill='%2317212b'/%3E%3Cpath d='M8 11h12M8 17h8' stroke='%23f3eee3' stroke-width='2.4' stroke-linecap='round'/%3E%3Ccircle cx='20.5' cy='17' r='1.9' fill='%23e8b04a'/%3E%3C/svg%3E";

const ic = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
const ICONS = {
  'sueldo-liquido': ic('<rect x="3" y="6" width="18" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>'),
  'finiquito': ic('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>'),
  'boleta-de-honorarios': ic('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9.5 8h5M9.5 12h5"/>'),
  'dividendo-hipotecario': ic('<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>'),
  'horas-extras': ic('<circle cx="12" cy="13" r="8"/><path d="M12 8.5V13l3 2M9.5 2.5h5"/>'),
  'impuesto-unico-segunda-categoria': ic('<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9h17M9 9v11M15 9v11"/>'),
  'comisiones-afp': ic('<path d="M3 20h18M5 20V10M10 20V10M14 20V10M19 20V10M3 10l9-6 9 6"/>'),
  'uf-a-pesos': ic('<path d="M4 8h13l-3-3M20 16H7l3 3"/>')
};
const arrow = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>';
const logoMark = '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="1" y="1" width="26" height="26" rx="8" fill="currentColor"/><path d="M8 11h12M8 17h8" stroke="var(--paper)" stroke-width="2.4" stroke-linecap="round"/><circle cx="20.5" cy="17" r="1.9" fill="var(--gold)"/></svg>';
const lastWordEm = h => { const m = /^(.*\s)(\S+)$/.exec(h); return m ? m[1] + '<em>' + m[2] + '</em>' : h; };

const adsOn = !!cfg.adsense.client;
const adSlot = name => (adsOn && cfg.adsense.slots[name])
  ? `<div class="ad-slot"><ins class="adsbygoogle" style="display:block" data-ad-client="${cfg.adsense.client}" data-ad-slot="${cfg.adsense.slots[name]}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`
  : '';
const affBox = key => {
  const a = cfg.affiliates[key];
  return a && a.url ? `<aside class="cta-box"><p>${esc(a.texto)}<small>Enlace patrocinado: podemos recibir una comisión sin costo para ti.</small></p><a class="btn" href="${esc(a.url)}" rel="sponsored noopener" target="_blank">${esc(a.boton)}</a></aside>` : '';
};

const nav = current => `<nav class="nav" aria-label="Principal">${pages.map(p => `<a href="${p.slug}.html"${p.slug === current ? ' aria-current="page"' : ''}>${esc(p.nav)}</a>`).join('')}</nav>`;

function layout({ slug, title, desc, body, tool, jsonld = [] }) {
  const fullTitle = title.includes(cfg.siteName) ? title : `${title} | ${cfg.siteName}`;
  const url = `${cfg.domain}/${slug === 'index' ? '' : slug + '.html'}`;
  return `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<link rel="icon" href="${favicon}">
<meta name="theme-color" content="#f3eee3">
<link rel="preload" href="assets/fonts/serif.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/sans.woff2" as="font" type="font/woff2" crossorigin>
<meta property="og:type" content="website"><meta property="og:locale" content="es_CL">
<meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:site_name" content="${esc(cfg.siteName)}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="assets/style.css">
${adsOn ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.adsense.client}" crossorigin="anonymous"></script>` : ''}
${cfg.gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${cfg.gaId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${cfg.gaId}');</script>` : ''}
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body${tool ? ` data-tool="${tool}"` : ''}>
<header class="site-head"><div class="wrap">
  <a class="logo" href="index.html">${logoMark}<span>cuenta<em>clara</em></span></a>
  <button id="menu-btn" aria-expanded="false" aria-controls="menu">Menú</button>
  ${nav(slug).replace('<nav ', '<nav id="menu" ')}
</div></header>
${body}
<footer class="site-foot"><div class="wrap">
  <div class="cols">
    <div><a class="logo" href="index.html">${logoMark}<span>cuenta<em>clara</em></span></a><p>${esc(cfg.tagline)}.</p>
    <p>Las cifras son referenciales y no reemplazan la asesoría de un abogado o contador. Datos a ${P.actualizado}.</p></div>
    <div><strong>Calculadoras</strong>${pages.map(p => `<a href="${p.slug}.html">${esc(p.nav)}</a>`).join('')}</div>
    <div><strong>Información</strong><a href="sobre-nosotros.html">Sobre este sitio</a><a href="contacto.html">Contacto</a><a href="privacidad.html">Política de privacidad</a><a href="aviso-legal.html">Aviso legal</a></div>
  </div>
  <p class="copy">© ${new Date().getFullYear()} ${esc(cfg.siteName)}</p>
</div></footer>
<script src="assets/calc-core.js"></script>
<script src="assets/app.js"></script>
</body>
</html>`;
}

function toolPage(p) {
  const related = p.related.map(s => pages.find(x => x.slug === s)).filter(Boolean);
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: stripTags(a) } })) };
  const crumbLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: cfg.domain + '/' },
    { '@type': 'ListItem', position: 2, name: p.cardTitle, item: `${cfg.domain}/${p.slug}.html` }] };
  const body = `<main><div class="wrap">
  <div class="crumbs"><a href="index.html">Inicio</a> / ${esc(p.cardTitle)}</div>
  <header class="page-head"><span class="kicker">Calculadora · ${cfg.year}</span>
  <h1>${lastWordEm(p.h1)}</h1>
  <p class="lead">${p.lead}</p>
  <p class="meta">Cifras a ${P.actualizado}.</p></header>
  <div class="grid-2">
    <form class="card" id="calc" autocomplete="off" novalidate>${p.form}</form>
    <div class="card" id="resultado" aria-live="polite"><p class="vacio">Completa los datos para ver el resultado.</p></div>
  </div>
  ${adSlot('top')}
  ${affBox(p.aff)}
  <article class="prose">${p.body}</article>
  ${adSlot('middle')}
  <section class="faq prose" aria-labelledby="faq-h"><h2 id="faq-h">Preguntas <em>frecuentes</em></h2>
    ${p.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
  </section>
  ${adSlot('bottom')}
  <h2>Otras <em>calculadoras</em></h2>
  <ul class="related">${related.map(r => `<li><a href="${r.slug}.html">${esc(r.cardTitle)}</a></li>`).join('')}</ul>
</div></main>`;
  return layout({ slug: p.slug, title: p.title, desc: p.desc, body, tool: p.tool, jsonld: [faqLd, crumbLd] });
}

function receipt() {
  const r = CC.sueldoLiquido({ sueldoBase: 1500000, afp: 'Uno', salud: 'fonasa', contrato: 'indefinido', gratificacion: 'legal' });
  const ln = (t, v, neg) => `<div class="ln${neg ? ' neg' : ''}"><dt>${t}</dt><dd>${neg ? '-' : ''}${CC.clp(v)}</dd></div>`;
  return `<div class="receipt-wrap"><div class="receipt">
    <span class="stamp">Ejemplo</span>
    <h3>Liquidación <small>${cfg.year}</small></h3>
    <p class="sub">Sueldo base $1.500.000 · AFP Uno · Fonasa</p>
    <dl>${ln('Sueldo base', r.sueldoBase)}${ln('Gratificación legal', r.gratificacion)}${ln('AFP', r.afp, true)}${ln('Salud 7%', r.salud, true)}${ln('Seguro de cesantía', r.cesantia, true)}${ln('Impuesto único', r.impuesto, true)}</dl>
    <div class="tot"><span>Líquido a pagar</span><b>${CC.clp(r.liquido)}</b></div>
    <p class="foot">Calcula la tuya en <a href="sueldo-liquido.html">sueldo bruto a líquido</a>.</p>
  </div></div>`;
}

function indexPage() {
  const title = `Calculadoras de sueldo, finiquito y honorarios en Chile ${cfg.year}`;
  const desc = `Calculadoras gratuitas para Chile: sueldo líquido, finiquito, boleta de honorarios, dividendo hipotecario, horas extras, impuesto único y comisiones AFP. Datos vigentes ${cfg.year}.`;
  const body = `<main><div class="wrap">
  <section class="hero">
    <div>
      <span class="kicker">Chile · ${cfg.year}</span>
      <h1>Calculadoras para sueldos, finiquitos e impuestos en <em>Chile</em></h1>
      <p class="lead">Las cuentas que aparecen en una liquidación de sueldo, un finiquito, una boleta de honorarios o un crédito hipotecario, hechas con las cifras de este año.</p>
      <div class="btns"><a class="btn" href="sueldo-liquido.html">Calcular mi sueldo líquido ${arrow}</a><a class="btn ghost" href="finiquito.html">Calcular un finiquito</a></div>
      <div class="ind" aria-label="Indicadores de hoy">
        <div><small>UF</small><strong data-ind="uf">$${CC.num(P.uf, 2)}</strong></div>
        <div><small>UTM</small><strong data-ind="utm">${CC.clp(P.utm)}</strong></div>
        <div><small>Dólar</small><strong data-ind="usd">$${CC.num(P.usd, 2)}</strong></div>
      </div>
    </div>
    ${receipt()}
  </section>
  <div class="section-title"><h2>Las <em>calculadoras</em></h2><p>Todas gratis y sin registro.</p></div>
  <ul class="cards">${pages.map(p => `<li><a href="${p.slug}.html"><i class="ic">${ICONS[p.slug]}</i><b>${esc(p.cardTitle)}</b><span class="d">${esc(p.cardDesc)}</span><span class="go">Abrir ${arrow}</span></a></li>`).join('')}</ul>
  ${adSlot('top')}
  <section class="band">
    <div>
      <h2>Cifras oficiales, <em>a la vista</em></h2>
      <p>Cada página explica cómo se hace el cálculo, de dónde salen los números y a qué fecha están. Todo se calcula en tu navegador: lo que escribes no llega a ningún servidor.</p>
      <p>Los resultados son estimaciones. Una liquidación o un finiquito reales pueden diferir por redondeos, convenios de la empresa o el valor de la UF que use tu empleador. Sirven para hacerse una idea y para revisar que lo que te pagan tenga sentido.</p>
    </div>
    <ul>
      <li><small>01</small><span>Impuestos y valor de la UTM: <a href="https://www.sii.cl" rel="noopener">Servicio de Impuestos Internos</a></span></li>
      <li><small>02</small><span>Topes, comisiones y cotizaciones: <a href="https://www.spensiones.cl" rel="noopener">Superintendencia de Pensiones</a></span></li>
      <li><small>03</small><span>Finiquito y jornada: <a href="https://www.dt.gob.cl" rel="noopener">Dirección del Trabajo</a> y Código del Trabajo</span></li>
      <li><small>04</small><span>UF y dólar del día: <a href="https://mindicador.cl" rel="noopener">mindicador.cl</a>, con datos del Banco Central</span></li>
    </ul>
  </section>
</div></main>`;
  const ld = { '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.siteName, url: cfg.domain + '/', inLanguage: 'es-CL' };
  return layout({ slug: 'index', title: `${cfg.siteName}: ${title}`, desc, body, jsonld: [ld] });
}

function simplePage(slug, title, desc, inner) {
  const body = `<main><div class="wrap"><div class="crumbs"><a href="index.html">Inicio</a> / ${esc(title)}</div><h1>${esc(title)}</h1><div class="prose">${inner}</div></div></main>`;
  return layout({ slug, title, desc, body });
}

/* ---- Escribir archivos ---- */
const write = (name, content) => fs.writeFileSync(path.join(OUT, name), content);
write('index.html', indexPage());
pages.forEach(p => write(p.slug + '.html', toolPage(p)));

write('sobre-nosotros.html', simplePage('sobre-nosotros', 'Sobre este sitio', `Qué es ${cfg.siteName}, de dónde salen las cifras y cómo avisar de un error.`, `
  <p>${esc(cfg.siteName)} es un sitio pequeño con calculadoras para cuentas que casi todos en Chile tenemos que hacer alguna vez y que pocas veces están bien explicadas: cuánto queda de un sueldo, cuánto corresponde de finiquito, cuánto retienen de una boleta de honorarios, cuánto sería el dividendo de una casa.</p>
  <p>Las cifras salen de fuentes oficiales: el Servicio de Impuestos Internos, la Superintendencia de Pensiones, la Dirección del Trabajo y el Código del Trabajo. La UF, la UTM y el dólar se leen en línea desde mindicador.cl. Cada página indica a qué fecha están los datos.</p>
  <p>Si encuentras un error o una cifra desactualizada, cuéntalo en la página de <a href="contacto.html">contacto</a> y se corrige.</p>`));

write('contacto.html', simplePage('contacto', 'Contacto', `Cómo reportar un error o sugerir una calculadora en ${cfg.siteName}.`, `
  <p>${cfg.contactEmail ? `Escríbenos a <a href="mailto:${esc(cfg.contactEmail)}">${esc(cfg.contactEmail)}</a> para reportar un error, sugerir una calculadora o hablar de publicidad.` : 'Estamos por habilitar un correo de contacto. Mientras tanto, para consultas individuales lo mejor son los canales oficiales.'}</p>
  <p>No podemos responder consultas legales o tributarias de casos particulares. Para eso sirven la <a href="https://www.dt.gob.cl" rel="noopener">Dirección del Trabajo</a>, el <a href="https://www.sii.cl" rel="noopener">SII</a> o un abogado o contador.</p>`));

write('privacidad.html', simplePage('privacidad', 'Política de privacidad', `Cómo ${cfg.siteName} trata tus datos, cookies y publicidad.`, `
  <p class="updated">Última actualización: ${hoy}</p>
  <h2>Datos que ingresas en las calculadoras</h2>
  <p>Todos los cálculos se realizan en tu propio navegador. Los montos, fechas y demás datos que escribes en las calculadoras no se envían a nuestros servidores ni se almacenan.</p>
  <h2>Datos de navegación</h2>
  <p>${cfg.gaId ? 'Usamos Google Analytics para medir visitas de forma agregada (páginas vistas, país, tipo de dispositivo).' : 'Podemos usar herramientas de analítica para medir visitas de forma agregada.'} Estas herramientas pueden usar cookies o identificadores similares.</p>
  <h2>Publicidad</h2>
  <p>Mostramos publicidad de terceros, como Google AdSense. Estos proveedores pueden usar cookies para mostrar avisos según tus visitas a este y otros sitios. Puedes gestionar tus preferencias de publicidad personalizada en <a href="https://adssettings.google.com" rel="noopener">adssettings.google.com</a> y obtener más información sobre cómo Google usa los datos en <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com</a>.</p>
  <h2>Enlaces de afiliados</h2>
  <p>Algunos enlaces son de afiliados: si contratas un servicio a través de ellos podemos recibir una comisión, sin costo adicional para ti. Estos enlaces están identificados.</p>
  <h2>Indicadores económicos</h2>
  <p>Para mostrar la UF, la UTM y el dólar, tu navegador consulta el servicio público mindicador.cl. Esa consulta no incluye datos personales tuyos.</p>
  <h2>Tus derechos</h2>
  <p>Conforme a la legislación chilena de protección de datos personales, puedes solicitar información, rectificación o eliminación de tus datos a través de la página de <a href="contacto.html">contacto</a>.</p>`));

write('aviso-legal.html', simplePage('aviso-legal', 'Aviso legal y descargo de responsabilidad', `Alcance y limitaciones de los cálculos de ${cfg.siteName}.`, `
  <p>La información y las calculadoras de ${esc(cfg.siteName)} son <strong>referenciales</strong> y tienen fines informativos. No constituyen asesoría legal, tributaria, previsional ni financiera.</p>
  <ul>
    <li>Los resultados dependen de los datos que ingreses y de supuestos simplificados que se explican en cada página.</li>
    <li>Las liquidaciones de sueldo, finiquitos, cotizaciones, impuestos y ofertas de crédito reales pueden diferir por convenios, redondeos, situaciones particulares o cambios normativos.</li>
    <li>Aunque revisamos las cifras regularmente, no garantizamos que estén libres de errores o siempre actualizadas.</li>
    <li>${esc(cfg.siteName)} no se hace responsable por decisiones tomadas a partir de estos resultados. Ante cualquier duda, consulta con un abogado, contador o la entidad correspondiente.</li>
  </ul>
  <p>Las marcas y nombres mencionados pertenecen a sus respectivos dueños. Este sitio no está afiliado a organismos del Estado de Chile.</p>`));

write('404.html', simplePage('404', 'Página no encontrada', 'La página que buscas no existe.', `<p>No encontramos esa página. Vuelve al <a href="index.html">inicio</a> o elige una calculadora del menú.</p>`).replace('<link rel="canonical"', '<meta name="robots" content="noindex"><link rel="canonical"'));

/* Assets */
fs.mkdirSync(path.join(OUT, 'assets'));
['style.css', 'calc-core.js', 'app.js'].forEach(f => fs.copyFileSync(path.join(__dirname, 'assets', f), path.join(OUT, 'assets', f)));
fs.cpSync(path.join(__dirname, 'assets', 'fonts'), path.join(OUT, 'assets', 'fonts'), { recursive: true });

/* SEO y hosting */
const urls = ['index', ...pages.map(p => p.slug), 'sobre-nosotros', 'contacto', 'privacidad', 'aviso-legal'];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${cfg.domain}/${u === 'index' ? '' : u + '.html'}</loc><lastmod>${hoy}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${cfg.domain}/sitemap.xml\n`);
if (adsOn) write('ads.txt', `google.com, ${cfg.adsense.client.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`);
write('_headers', `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n\n/assets/*\n  Cache-Control: public, max-age=86400\n`);

console.log(`✔ Sitio generado en ${OUT} (${urls.length + 1} páginas)`);
if (cfg.domain.includes('github.io')) console.log('ℹ Dominio temporal de GitHub Pages: cambia config.domain cuando compres el .cl.');
if (!adsOn) console.log('ℹ AdSense desactivado (config.adsense.client vacío).');
