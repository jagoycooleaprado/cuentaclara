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
const favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23a8341f'/%3E%3Ctext x='32' y='45' font-size='36' text-anchor='middle' fill='white' font-family='Arial' font-weight='700'%3E%24%3C/text%3E%3C/svg%3E";

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
<meta name="theme-color" content="#f7f4ee">
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
  <a class="logo" href="index.html">cuenta<span>clara</span></a>
  <button id="menu-btn" aria-expanded="false" aria-controls="menu">Menú</button>
  ${nav(slug).replace('<nav ', '<nav id="menu" ')}
</div></header>
${body}
<footer class="site-foot"><div class="wrap">
  <div class="cols">
    <div><strong>${esc(cfg.siteName)}</strong><p>${esc(cfg.tagline)}.</p>
    <p>Las cifras son referenciales y no reemplazan la asesoría de un abogado o contador. Datos a ${P.actualizado}.</p></div>
    <div><strong>Calculadoras</strong>${pages.map(p => `<a href="${p.slug}.html">${esc(p.nav)}</a>`).join('')}</div>
    <div><strong>Información</strong><a href="sobre-nosotros.html">Sobre nosotros</a><a href="contacto.html">Contacto</a><a href="privacidad.html">Política de privacidad</a><a href="aviso-legal.html">Aviso legal</a></div>
  </div>
  <p>© ${new Date().getFullYear()} ${esc(cfg.siteName)}</p>
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
  <h1>${p.h1}</h1>
  <p class="lead">${p.lead}</p>
  <p class="meta">Cifras al ${P.actualizado}.</p>
  <div class="grid-2">
    <form class="card" id="calc" autocomplete="off" novalidate>${p.form}</form>
    <div class="card" id="resultado" aria-live="polite"><p class="vacio">Completa los datos para ver el resultado.</p></div>
  </div>
  ${adSlot('top')}
  ${affBox(p.aff)}
  <article class="prose">${p.body}</article>
  ${adSlot('middle')}
  <section class="faq prose" aria-labelledby="faq-h"><h2 id="faq-h">Preguntas frecuentes</h2>
    ${p.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
  </section>
  ${adSlot('bottom')}
  <h2>Otras calculadoras</h2>
  <ul class="related">${related.map(r => `<li><a href="${r.slug}.html">${esc(r.cardTitle)}</a></li>`).join('')}</ul>
</div></main>`;
  return layout({ slug: p.slug, title: p.title, desc: p.desc, body, tool: p.tool, jsonld: [faqLd, crumbLd] });
}

function indexPage() {
  const title = `Calculadoras de sueldo, finiquito y honorarios en Chile ${cfg.year}`;
  const desc = `Calculadoras gratuitas para Chile: sueldo líquido, finiquito, boleta de honorarios, dividendo hipotecario, horas extras, impuesto único y comisiones AFP. Datos vigentes ${cfg.year}.`;
  const body = `<main><div class="wrap">
  <section class="hero">
    <h1>Calculadoras de sueldo, finiquito e impuestos para Chile</h1>
    <p class="lead">Las cuentas que aparecen en una liquidación de sueldo, un finiquito, una boleta de honorarios o un crédito hipotecario, hechas con las cifras de este año.</p>
  </section>
  <div class="ind" aria-label="Indicadores de hoy">
    <div><small>UF</small><strong data-ind="uf">$${CC.num(P.uf, 2)}</strong></div>
    <div><small>UTM</small><strong data-ind="utm">${CC.clp(P.utm)}</strong></div>
    <div><small>Dólar</small><strong data-ind="usd">$${CC.num(P.usd, 2)}</strong></div>
    <div><small>Ingreso mínimo</small><strong>${CC.clp(P.sueldoMinimo)}</strong></div>
  </div>
  <ul class="cards">${pages.map(p => `<li><a href="${p.slug}.html"><b>${esc(p.cardTitle)}</b><span>${esc(p.cardDesc)}</span></a></li>`).join('')}</ul>
  ${adSlot('top')}
  <section class="prose">
    <h2>Antes de usarlas</h2>
    <p>Todo se calcula en tu navegador, así que lo que escribes no llega a ningún servidor. La UF, la UTM y el dólar se leen del día; los topes y las tasas anuales se cambian cuando la autoridad los actualiza.</p>
    <p>Los resultados son estimaciones. Una liquidación o un finiquito reales pueden diferir por redondeos, convenios de la empresa o el valor de la UF que use tu empleador, así que sirven para hacerse una idea y para revisar que lo que te pagan tenga sentido.</p>
    <p>Cada página explica cómo se hace el cálculo y de dónde salen las cifras.</p>
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

/* SEO y hosting */
const urls = ['index', ...pages.map(p => p.slug), 'sobre-nosotros', 'contacto', 'privacidad', 'aviso-legal'];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${cfg.domain}/${u === 'index' ? '' : u + '.html'}</loc><lastmod>${hoy}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${cfg.domain}/sitemap.xml\n`);
if (adsOn) write('ads.txt', `google.com, ${cfg.adsense.client.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`);
write('_headers', `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n\n/assets/*\n  Cache-Control: public, max-age=86400\n`);

console.log(`✔ Sitio generado en ${OUT} (${urls.length + 1} páginas)`);
if (cfg.domain.includes('github.io')) console.log('ℹ Dominio temporal de GitHub Pages: cambia config.domain cuando compres el .cl.');
if (!adsOn) console.log('ℹ AdSense desactivado (config.adsense.client vacío).');
