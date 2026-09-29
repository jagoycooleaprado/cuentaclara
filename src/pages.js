/* Contenido de las páginas. Los parámetros (tasas, topes) están en assets/calc-core.js */
const CC = require('../assets/calc-core.js');
const P = CC.P;
const Y = require('../config.js').year;

const money = (id, label, extra = '', ph = 'Ej: 1.200.000') =>
  `<div class="field"><label for="${id}" id="${id}-label">${label}</label><input id="${id}" data-money inputmode="numeric" autocomplete="off" placeholder="${ph}">${extra ? `<small>${extra}</small>` : ''}</div>`;
const number = (id, label, value, step = 'any', extra = '') =>
  `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="number" inputmode="decimal" step="${step}" value="${value}" min="0">${extra ? `<small>${extra}</small>` : ''}</div>`;

const pages = [
  /* ---------------------------------------------------------------- SUELDO */
  {
    slug: 'sueldo-liquido', tool: 'sueldo', aff: 'sueldo', icon: '💵',
    nav: 'Sueldo líquido', cardTitle: 'Sueldo bruto a líquido',
    cardDesc: 'Descuentos de AFP, salud, cesantía e impuesto. También al revés: de líquido a bruto.',
    title: `Calculadora de sueldo líquido Chile ${Y}: de bruto a líquido y viceversa`,
    desc: `Calcula tu sueldo líquido en Chile con los descuentos ${Y}: AFP, salud, seguro de cesantía e impuesto único. También de líquido a bruto. Gratis y sin registro.`,
    h1: `Calculadora de sueldo líquido ${Y}`,
    lead: 'Descubre cuánto te llega realmente a la cuenta cada mes, o cuánto te deben pagar de sueldo bruto para llegar al líquido que necesitas.',
    form: `
      <div class="tabs" role="tablist"><button type="button" data-modo="bruto" aria-selected="true">Tengo el bruto</button><button type="button" data-modo="liquido" aria-selected="false">Quiero el líquido</button></div>
      ${money('s-base', 'Sueldo base mensual')}
      <div class="field"><label for="s-grat">Gratificación</label><select id="s-grat"><option value="legal">Gratificación legal (25% con tope)</option><option value="no">Sin gratificación</option></select></div>
      <div class="two">${money('s-bonos', 'Bonos imponibles', 'Comisiones, bonos de producción, etc.', '0')}${money('s-col', 'Colación', 'No imponible', '0')}</div>
      ${money('s-mov', 'Movilización', 'No imponible', '0')}
      <div class="field"><label for="s-afp">AFP</label><select id="s-afp"></select></div>
      <div class="two">
        <div class="field"><label for="s-salud">Sistema de salud</label><select id="s-salud"><option value="fonasa">Fonasa (7%)</option><option value="isapre">Isapre</option></select></div>
        <div class="field"><label for="s-contrato">Contrato</label><select id="s-contrato"><option value="indefinido">Indefinido</option><option value="plazo">Plazo fijo / por obra</option></select></div>
      </div>
      <div id="s-plan-row" hidden>${number('s-plan', 'Valor de tu plan de Isapre (UF)', '2.5', '0.01', 'Sale en tu contrato. Si es menos que el 7%, se descuenta el 7%.')}</div>`,
    body: `
      <h2>Cómo se calcula el sueldo líquido en Chile</h2>
      <p>El <strong>sueldo líquido</strong> es lo que efectivamente recibes en tu cuenta después de los descuentos legales. Parte de tu <strong>renta imponible</strong> (sueldo base + gratificación + bonos imponibles) y se restan cuatro cosas:</p>
      <ol>
        <li><strong>AFP:</strong> 10% de tu renta imponible para tu pensión, más la comisión de tu AFP (entre ${CC.num(P.afp.Uno, 2)}% y ${CC.num(P.afp.Provida, 2)}% hoy).</li>
        <li><strong>Salud:</strong> 7% de la renta imponible. Si tu plan de Isapre cuesta más, pagas la diferencia.</li>
        <li><strong>Seguro de cesantía:</strong> ${CC.num(P.cesantiaTrabajador * 100, 1)}% si tienes contrato indefinido (el empleador aporta el resto). En contratos a plazo fijo lo paga solo el empleador.</li>
        <li><strong>Impuesto único de segunda categoría:</strong> se calcula sobre la renta que queda después de las cotizaciones. Si ganas menos de ${CC.clp(13.5 * P.utm)} de base tributable, no pagas.</li>
      </ol>
      <p>A eso se suman la colación y la movilización, que no son imponibles ni tributables.</p>
      <h2>Topes y parámetros ${Y}</h2>
      <table>
        <tr><th>Parámetro</th><th>Valor</th></tr>
        <tr><td>Tope imponible AFP y salud</td><td>${CC.num(P.topeImponibleUF, 1)} UF (≈ ${CC.clp(P.topeImponibleUF * P.uf)})</td></tr>
        <tr><td>Tope seguro de cesantía</td><td>${CC.num(P.topeCesantiaUF, 1)} UF (≈ ${CC.clp(P.topeCesantiaUF * P.uf)})</td></tr>
        <tr><td>Ingreso mínimo mensual</td><td>${CC.clp(P.sueldoMinimo)}</td></tr>
        <tr><td>Gratificación legal máxima</td><td>4,75 ingresos mínimos al año (≈ ${CC.clp(4.75 * P.sueldoMinimo / 12)} al mes)</td></tr>
        <tr><td>Tramo exento de impuesto</td><td>13,5 UTM (≈ ${CC.clp(13.5 * P.utm)} al mes)</td></tr>
      </table>
      <p class="updated">Valores referenciales a ${P.actualizado}. Fuentes: <a href="https://www.spensiones.cl" rel="noopener">Superintendencia de Pensiones</a> y <a href="https://www.sii.cl" rel="noopener">SII</a>.</p>
      <h2>¿Qué no considera esta calculadora?</h2>
      <p>Es una estimación. No incluye APV, cargas familiares, préstamos, anticipos, cuotas sindicales ni convenios de tu empresa. Tu liquidación de sueldo oficial puede variar por pequeñas diferencias de redondeo o por el valor de la UF que use tu empleador.</p>`,
    faq: [
      ['¿Cuánto se descuenta de un sueldo en Chile?', `Entre AFP (10% más comisión), salud (7%) y seguro de cesantía (0,6%) se descuenta cerca del 18% de la renta imponible. Además, si tu base tributable supera ${CC.clp(13.5 * P.utm)}, se descuenta impuesto único.`],
      ['¿La gratificación se descuenta?', 'Sí. La gratificación legal es imponible y tributable, por eso aumenta tu renta imponible y también tus descuentos.'],
      ['¿Cómo calculo el bruto si sé cuánto quiero ganar líquido?', 'Usa la pestaña “Quiero el líquido”: la calculadora busca el sueldo base necesario para que, después de descuentos, te queden justo los pesos que ingresaste.'],
      ['¿Por qué mi liquidación oficial da distinto?', 'Cada empresa puede usar distintos redondeos, el valor de la UF del mes anterior para topes, o incluir descuentos voluntarios (APV, cuotas sindicales, convenios). Usa esta herramienta como referencia y compara con tu liquidación.']
    ],
    related: ['finiquito', 'horas-extras', 'impuesto-unico-segunda-categoria', 'comisiones-afp']
  },

  /* -------------------------------------------------------------- FINIQUITO */
  {
    slug: 'finiquito', tool: 'finiquito', aff: 'finiquito', icon: '📄',
    nav: 'Finiquito', cardTitle: 'Calculadora de finiquito',
    cardDesc: 'Indemnización por años de servicio, aviso previo, vacaciones y días pendientes.',
    title: `Calculadora de finiquito e indemnización Chile ${Y}`,
    desc: `Calcula tu finiquito en Chile: indemnización por años de servicio, aviso previo, feriado proporcional y días trabajados. Según la causal de término. Gratis.`,
    h1: `Calculadora de finiquito ${Y}`,
    lead: 'Estima cuánto debieras recibir al terminar tu contrato: indemnización por años de servicio, aviso previo, vacaciones proporcionales y sueldo pendiente.',
    form: `
      <div class="two">
        <div class="field"><label for="f-inicio">Fecha de inicio del contrato</label><input id="f-inicio" type="date"></div>
        <div class="field"><label for="f-termino">Fecha de término</label><input id="f-termino" type="date"></div>
      </div>
      <div class="field"><label for="f-causal">Causal de término</label><select id="f-causal">
        <option value="necesidades">Necesidades de la empresa (art. 161)</option>
        <option value="renuncia">Renuncia voluntaria (art. 159 N°2)</option>
        <option value="mutuo">Mutuo acuerdo (art. 159 N°1)</option>
        <option value="plazo">Vencimiento del plazo (art. 159 N°4)</option>
        <option value="falta">Falta grave del trabajador (art. 160)</option>
      </select></div>
      ${money('f-sueldo', 'Sueldo base mensual', 'Se usa para pagar los días trabajados y las vacaciones.')}
      ${money('f-ultima', 'Última remuneración mensual completa', 'Incluye sueldo, gratificación y asignaciones habituales. Si lo dejas vacío usamos el sueldo base.', 'Opcional')}
      <div class="two">
        ${number('f-dias', 'Días trabajados del último mes', '0', '1', 'De 0 a 30')}
        ${number('f-tomados', 'Vacaciones tomadas este año laboral', '0', '0.5', 'Días hábiles desde tu último aniversario')}
      </div>
      <div class="field"><label for="f-pend">Días de vacaciones pendientes (opcional)</label><input id="f-pend" type="number" inputmode="decimal" step="0.5" min="0" placeholder="Automático"><small>Si tienes vacaciones acumuladas de años anteriores, escribe el total de días hábiles pendientes. Si lo dejas vacío, calculamos desde tu último aniversario.</small></div>
      <div class="field"><label for="f-semana">Tu jornada semanal es de</label><select id="f-semana"><option value="lv">Lunes a viernes</option><option value="ls">Lunes a sábado</option></select></div>
      <div class="check field" id="f-aviso-row"><input type="checkbox" id="f-aviso"><label for="f-aviso">Me avisaron por escrito con 30 días de anticipación</label></div>
      <div class="check field" id="f-inj-row"><input type="checkbox" id="f-inj"><label for="f-inj">El despido fue declarado injustificado (recargo de 30%)</label></div>`,
    body: `
      <h2>Qué incluye un finiquito</h2>
      <p>El finiquito es el documento que pone término a la relación laboral y detalla lo que el empleador debe pagarte. Según la causal, puede incluir:</p>
      <ul>
        <li><strong>Sueldo por los días trabajados</strong> del último mes que aún no se han pagado.</li>
        <li><strong>Feriado proporcional:</strong> las vacaciones que acumulaste y no tomaste. Se generan 1,25 días hábiles por cada mes trabajado (15 días al año).</li>
        <li><strong>Indemnización por años de servicio:</strong> un mes de remuneración por cada año trabajado, contando como año completo una fracción superior a seis meses, con un máximo de 11 años. Solo corresponde si te despiden por necesidades de la empresa (art. 161).</li>
        <li><strong>Indemnización sustitutiva del aviso previo:</strong> si el despido fue por necesidades de la empresa y no te avisaron con 30 días de anticipación, corresponde un mes adicional de remuneración.</li>
      </ul>
      <h2>Topes que aplican</h2>
      <p>La remuneración que sirve de base para las indemnizaciones tiene un tope de <strong>90 UF</strong> (≈ ${CC.clp(90 * P.uf)}). Es decir, aunque ganes más, la indemnización se calcula sobre ese máximo. Además, las indemnizaciones por años de servicio y sustitutiva del aviso previo no llevan descuentos de cotizaciones ni impuesto dentro de los límites legales.</p>
      <h2>Renuncia, mutuo acuerdo o plazo vencido</h2>
      <p>Si renuncias, se acaba el contrato de plazo fijo o acuerdan el término de común acuerdo, no corresponde indemnización por años de servicio ni aviso previo (salvo que estén pactados en tu contrato o convenio colectivo). Igualmente tienes derecho a los días trabajados y a tus vacaciones proporcionales.</p>
      <h2>Cómo cambia si el despido es injustificado</h2>
      <p>Si un juzgado declara que el despido por necesidades de la empresa fue injustificado, la indemnización por años de servicio se incrementa en un 30%. Otras causales mal invocadas tienen recargos mayores. Tienes un plazo limitado (60 días hábiles desde la separación) para reclamar ante el Juzgado de Letras del Trabajo, por lo que conviene actuar rápido.</p>
      <p class="updated">Esta calculadora entrega una estimación referencial y no reemplaza la asesoría de un abogado laboral ni de la <a href="https://www.dt.gob.cl" rel="noopener">Dirección del Trabajo</a>. No considera vacaciones progresivas (trabajadores con más de 10 años de cotizaciones), semana corrida ni pactos especiales.</p>`,
    faq: [
      ['¿Cuánto es la indemnización por años de servicio?', 'Un mes de tu última remuneración mensual por cada año de servicio (o fracción superior a 6 meses), hasta 11 años, con la remuneración topada en 90 UF.'],
      ['¿Me corresponde indemnización si renuncio?', 'No. Al renunciar solo recibes los días trabajados, tus vacaciones proporcionales y otros montos pendientes, pero no indemnización por años de servicio.'],
      ['¿Cuántos días de vacaciones proporcionales me corresponden?', 'Se acumulan 1,25 días hábiles por mes trabajado (15 al año). Si no indicas tus días pendientes, la calculadora estima los generados desde tu último aniversario, descuenta los que ya tomaste y paga el resto considerando los días corridos que representan.'],
      ['¿Qué pasa si no firmo el finiquito?', 'Puedes no firmarlo o firmarlo con reserva de derechos. Debe ser firmado ante un ministro de fe (notario, inspector del trabajo, etc.). Si no estás de acuerdo con los montos, consulta a la Inspección del Trabajo.'],
      ['¿Cuánto tiempo tengo para reclamar un despido injustificado?', 'Tienes 60 días hábiles desde la separación para demandar ante el Juzgado de Letras del Trabajo. El reclamo ante la Inspección del Trabajo puede suspender ese plazo.']
    ],
    related: ['sueldo-liquido', 'horas-extras', 'boleta-de-honorarios']
  },

  /* -------------------------------------------------------------- HONORARIOS */
  {
    slug: 'boleta-de-honorarios', tool: 'honorarios', aff: 'honorarios', icon: '🧾',
    nav: 'Boleta de honorarios', cardTitle: 'Boleta de honorarios',
    cardDesc: `Retención ${CC.num(P.retencionHonorarios[2026] * 100, 2)}%: cuánto recibes de líquido o cuánto emitir de bruto.`,
    title: `Calculadora de boleta de honorarios ${Y}: retención 15,25%`,
    desc: `Calcula el monto líquido y la retención de tu boleta de honorarios ${Y} (15,25%). También de líquido a bruto: cuánto debes emitir para recibir lo que necesitas.`,
    h1: `Calculadora de boleta de honorarios ${Y}`,
    lead: 'Calcula cuánto te llega después de la retención del SII, o cuánto debes emitir para recibir un monto líquido exacto.',
    form: `
      <div class="tabs" role="tablist"><button type="button" data-modo="bruto" aria-selected="true">Tengo el bruto</button><button type="button" data-modo="liquido" aria-selected="false">Quiero el líquido</button></div>
      ${money('h-monto', 'Monto bruto de la boleta')}
      <div class="field"><label for="h-anio">Año de emisión</label><select id="h-anio"></select><small>La retención sube cada año según la ley.</small></div>`,
    body: `
      <h2>Retención de la boleta de honorarios</h2>
      <p>Cuando emites una boleta de honorarios a una empresa u otro contribuyente que lleva contabilidad, esa empresa debe <strong>retener un porcentaje</strong> del monto bruto y pagarlo al SII por cuenta tuya. El porcentaje sube gradualmente:</p>
      <table>
        <tr><th>Año</th><th>Retención</th><th>Recibes por cada $1.000.000 bruto</th></tr>
        <tr><td>2025</td><td>14,5%</td><td>${CC.clp(1000000 * (1 - 0.145))}</td></tr>
        <tr><td><strong>2026</strong></td><td><strong>15,25%</strong></td><td><strong>${CC.clp(1000000 * (1 - 0.1525))}</strong></td></tr>
        <tr><td>2027</td><td>16%</td><td>${CC.clp(1000000 * (1 - 0.16))}</td></tr>
        <tr><td>2028 en adelante</td><td>17%</td><td>${CC.clp(1000000 * (1 - 0.17))}</td></tr>
      </table>
      <h2>Fórmulas</h2>
      <ul>
        <li><strong>De bruto a líquido:</strong> bruto × (1 − 0,1525) = líquido.</li>
        <li><strong>De líquido a bruto:</strong> líquido ÷ 0,8475 = bruto a emitir.</li>
      </ul>
      <h2>¿Es un descuento definitivo?</h2>
      <p>No. La retención es un <strong>pago anticipado</strong> de tu impuesto anual. En abril, con la Operación Renta, el SII compara lo retenido con el impuesto que realmente te corresponde: si retuvieron de más (por ejemplo porque tus ingresos totales están bajo el tramo exento), recibes devolución; si retuvieron de menos, pagas la diferencia.</p>
      <h2>Cotizaciones de los trabajadores independientes</h2>
      <p>Quienes emiten boletas de honorarios de forma habitual deben cotizar para pensión, salud y seguros. Las cotizaciones se calculan sobre una parte de tus ingresos anuales y se pagan a través de la Operación Renta, no mes a mes. Puedes revisar el detalle en el <a href="https://www.sii.cl/destacados/boletas_honorarios/" rel="noopener">sitio del SII</a>.</p>
      <p class="updated">Referencia: Ley 21.133 sobre cotización de trabajadores independientes. Esta calculadora no reemplaza la asesoría de un contador.</p>`,
    faq: [
      ['¿Cuál es la retención de la boleta de honorarios en 2026?', 'El 15,25% del monto bruto. Sube a 16% en 2027 y a 17% desde 2028.'],
      ['¿Cómo calculo cuánto debo emitir para recibir un monto líquido?', 'Divide el monto líquido por 0,8475. Por ejemplo, para recibir $1.000.000 líquidos debes emitir por $1.180.000 aproximadamente.'],
      ['¿Siempre hay retención?', 'Se retiene cuando quien te paga es una empresa u otro contribuyente obligado a retener. Si le emites a una persona natural que no está obligada, la retención no se aplica en el momento, pero igual debes declarar el ingreso en la Operación Renta.'],
      ['¿La retención se puede recuperar?', 'Si lo retenido supera tu impuesto anual real, el SII te devuelve la diferencia en abril, tras presentar la Operación Renta.']
    ],
    related: ['impuesto-unico-segunda-categoria', 'sueldo-liquido', 'finiquito']
  },

  /* -------------------------------------------------------------- DIVIDENDO */
  {
    slug: 'dividendo-hipotecario', tool: 'dividendo', aff: 'hipotecario', icon: '🏠',
    nav: 'Dividendo hipotecario', cardTitle: 'Simulador de dividendo',
    cardDesc: 'Calcula la cuota mensual de un crédito hipotecario en UF y pesos, y la renta que necesitas.',
    title: `Simulador de crédito hipotecario Chile ${Y}: calcula tu dividendo`,
    desc: `Simula el dividendo de tu crédito hipotecario en UF y pesos: cuota mensual, intereses totales y renta mínima sugerida. Gratis, sin dejar tus datos.`,
    h1: `Simulador de dividendo hipotecario`,
    lead: 'Calcula cuánto pagarías al mes por tu crédito hipotecario, cuánto pagarás en intereses y qué renta necesitas para que te lo aprueben.',
    form: `
      ${number('d-valor', 'Valor de la propiedad (UF)', '3500', 'any')}<p class="updated" id="d-valor-clp" style="margin:-8px 0 14px"></p>
      <div class="two">${number('d-pie', 'Pie (%)', '20', 'any', 'Lo habitual es 20%')}${number('d-plazo', 'Plazo (años)', '30', '1')}</div>
      <div class="two">${number('d-tasa', 'Tasa anual (%)', '4.5', '0.01', 'Tasa del crédito')}${number('d-seg', 'Seguros (% anual)', '0.3', '0.01', 'Desgravamen e incendio (estimado)')}</div>`,
    body: `
      <h2>Cómo funciona un crédito hipotecario en Chile</h2>
      <p>Casi todos los créditos hipotecarios en Chile se pactan en <strong>UF</strong>, con cuotas fijas (sistema francés). Eso significa que tu dividendo en UF no cambia durante todo el crédito, pero en pesos sube o baja según la inflación, porque el valor de la UF se reajusta a diario.</p>
      <p>La cuota se calcula con la fórmula: <code>cuota = crédito × i ÷ (1 − (1 + i)^−n)</code>, donde <em>i</em> es la tasa mensual y <em>n</em> el número de cuotas.</p>
      <h2>Qué mirar además de la tasa</h2>
      <ul>
        <li><strong>CAE (Carga Anual Equivalente):</strong> incluye tasa, seguros y gastos. Es el indicador correcto para comparar bancos.</li>
        <li><strong>Pie:</strong> lo habitual es que el banco financie hasta el 80% del valor de la propiedad. Con pie menor, la tasa suele ser más alta.</li>
        <li><strong>Gastos operacionales:</strong> tasación, estudio de títulos, notaría, impuesto de timbres y estampillas e inscripción en el Conservador de Bienes Raíces. Suelen sumar entre 1% y 2% del valor.</li>
        <li><strong>Plazo:</strong> más años bajan la cuota, pero aumentan mucho los intereses totales. Compara 20, 25 y 30 años en el simulador.</li>
      </ul>
      <h2>¿Qué renta necesitas?</h2>
      <p>Los bancos suelen exigir que el dividendo no supere entre el 25% y el 30% de la renta líquida del hogar. Por eso el simulador te muestra una renta mínima sugerida asumiendo el 25%. Cada banco aplica su propia política de riesgo, así que úsalo como guía.</p>
      <p class="updated">La simulación es referencial: usa tasa nominal anual dividida en 12 y los seguros como porcentaje anual del crédito. Los valores finales los define la oferta formal del banco.</p>`,
    faq: [
      ['¿Cuánto es el dividendo de una propiedad de 3.000 UF a 30 años?', 'Con 20% de pie (crédito de 2.400 UF) y una tasa de 4,5% anual, la cuota es cercana a 12,2 UF al mes, sin seguros. Usa el simulador para ajustarlo a tu caso.'],
      ['¿Qué es mejor: 20 o 30 años?', 'A 20 años pagas una cuota más alta pero muchos menos intereses. A 30 años la cuota baja, pero pagas bastante más en total. Puedes elegir 30 años y prepagar cuando puedas.'],
      ['¿Qué pasa si sube la UF?', 'Tu cuota en UF se mantiene, pero en pesos aumenta con la inflación. Por eso conviene que tu renta también se reajuste.'],
      ['¿Puedo pagar el crédito antes de tiempo?', 'Sí. Las amortizaciones extraordinarias y el prepago están permitidos por ley, aunque el banco puede cobrar una comisión limitada. Consulta las condiciones antes de firmar.']
    ],
    related: ['uf-a-pesos', 'sueldo-liquido', 'impuesto-unico-segunda-categoria']
  },

  /* -------------------------------------------------------------- HORAS EXTRAS */
  {
    slug: 'horas-extras', tool: 'horas', aff: 'sueldo', icon: '⏱️',
    nav: 'Horas extras', cardTitle: 'Calculadora de horas extras',
    cardDesc: 'Valor de la hora ordinaria y extra con la jornada de 42 horas vigente en Chile.',
    title: `Calculadora de horas extras Chile ${Y} (jornada de 42 horas)`,
    desc: `Calcula el valor de tus horas extras en Chile con la jornada de 42 horas: valor hora ordinaria, recargo del 50% y total del mes. Gratis.`,
    h1: `Calculadora de horas extras ${Y}`,
    lead: 'Calcula el valor de tu hora ordinaria y extra según tu sueldo base y tu jornada semanal, y cuánto te deben pagar por las horas extras del mes.',
    form: `
      ${money('e-sueldo', 'Sueldo base mensual')}
      <div class="field"><label for="e-jornada">Jornada semanal</label><select id="e-jornada"><option value="42" selected>42 horas (vigente desde abril de 2026)</option><option value="44">44 horas (antes de abril de 2026)</option><option value="40">40 horas (desde abril de 2028)</option><option value="45">45 horas (jornada antigua)</option></select></div>
      ${number('e-horas', 'Horas extras trabajadas en el mes', '10', '0.5')}`,
    body: `
      <h2>Cómo se calculan las horas extras</h2>
      <p>Las horas extras son las que exceden la jornada ordinaria pactada o el máximo legal, y se pagan con un <strong>recargo del 50%</strong> sobre el valor de la hora ordinaria. Deben pactarse por escrito, ser temporales y no pueden superar dos horas diarias.</p>
      <p>La fórmula que usa la Dirección del Trabajo es:</p>
      <ol>
        <li><strong>Valor hora ordinaria</strong> = (sueldo base mensual ÷ 30 × 7) ÷ horas de la jornada semanal.</li>
        <li><strong>Valor hora extra</strong> = valor hora ordinaria × 1,5.</li>
      </ol>
      <p>Ejemplo con un sueldo base de $900.000 y jornada de 42 horas: la hora ordinaria vale ${CC.clp(CC.horasExtras({ sueldoBase: 900000, jornada: 42, horas: 1 }).horaOrdinaria)} y la hora extra ${CC.clp(CC.horasExtras({ sueldoBase: 900000, jornada: 42, horas: 1 }).horaExtra)}.</p>
      <h2>La reducción de la jornada laboral</h2>
      <p>La Ley 21.561 (“40 horas”) baja la jornada máxima de forma gradual: 44 horas desde abril de 2024, <strong>42 horas desde abril de 2026</strong> y 40 horas desde abril de 2028. Como una jornada más corta hace que la hora ordinaria valga más, tus horas extras también valen más.</p>
      <h2>¿Qué sueldo se usa como base?</h2>
      <p>Se usa el sueldo base pactado en el contrato, sin gratificación, colación ni movilización. Si tienes un sueldo con parte variable, consulta cómo se calcula en tu caso. Las horas extras son imponibles y tributables, así que el valor que ves es bruto y se le aplican los descuentos legales.</p>
      <p class="updated">Referencia: artículos 30 al 32 del Código del Trabajo y Ley 21.561.</p>`,
    faq: [
      ['¿Cuánto vale una hora extra en Chile?', 'Un 50% más que la hora ordinaria. Con jornada de 42 horas, el factor es aproximadamente 0,0083 × sueldo base por cada hora extra.'],
      ['¿Cuántas horas extras se pueden hacer al día?', 'Como máximo dos horas diarias, y deben pactarse por escrito para necesidades temporales de la empresa.'],
      ['¿Las horas extras se pagan con el sueldo del mes?', 'Se pagan junto con la remuneración del período en que se trabajaron, o del siguiente si así corresponde según el contrato.'],
      ['¿Los gerentes o trabajadores sin control de horario tienen horas extras?', 'No, los trabajadores que prestan servicios sin fiscalización superior inmediata (art. 22) no están sujetos a límite de jornada ni a pago de horas extras.']
    ],
    related: ['sueldo-liquido', 'finiquito']
  },

  /* -------------------------------------------------------------- IMPUESTO ÚNICO */
  {
    slug: 'impuesto-unico-segunda-categoria', tool: 'iusc', aff: 'sueldo', icon: '📊',
    nav: 'Impuesto único', cardTitle: 'Impuesto único de segunda categoría',
    cardDesc: 'Tabla del mes según la UTM vigente y calculadora del impuesto a tu sueldo.',
    title: `Tabla y calculadora del Impuesto Único de Segunda Categoría ${Y}`,
    desc: `Tabla vigente del Impuesto Único de Segunda Categoría en pesos según la UTM, con calculadora. Tramo exento, factores y cantidades a rebajar.`,
    h1: `Impuesto Único de Segunda Categoría ${Y}`,
    lead: 'La tabla del mes en pesos y una calculadora para saber cuánto impuesto se descuenta de tu sueldo.',
    form: `${money('i-renta', 'Renta líquida imponible mensual', 'Es tu renta imponible menos AFP, salud (7%) y seguro de cesantía.')}`,
    body: `
      <h2>Tabla del impuesto único del mes</h2>
      <p>Los tramos se expresan en UTM, por lo que la tabla en pesos cambia todos los meses. Esta tabla se actualiza con la UTM vigente (<strong data-ind="utm">${CC.clp(P.utm)}</strong>).</p>
      <div class="scroll prose"><table class="tabla-iusc"></table></div>
      <h2>Cómo usar la tabla</h2>
      <ol>
        <li>Toma tu renta imponible del mes (sueldo base, gratificación y bonos imponibles).</li>
        <li>Réstale las cotizaciones obligatorias: AFP, el 7% de salud y el seguro de cesantía. Lo que queda es la <strong>renta líquida imponible</strong>.</li>
        <li>Ubícala en el tramo correspondiente, multiplícala por el <em>factor</em> y réstale la <em>cantidad a rebajar</em>.</li>
      </ol>
      <p>Por ejemplo, con una renta líquida imponible de $3.000.000 (tramo del 8%): $3.000.000 × 0,08 − ${CC.clp(1.74 * P.utm)} = ${CC.clp(CC.impuestoUnico(3000000))}.</p>
      <h2>¿Quién paga este impuesto?</h2>
      <p>Lo pagan los trabajadores dependientes cuyo sueldo supera el tramo exento. Lo retiene y lo entera en el SII el empleador todos los meses. Los trabajadores con boleta de honorarios tributan con el Impuesto Global Complementario en abril, no con esta tabla.</p>
      <p class="updated">Fuente: <a href="https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm" rel="noopener">SII</a>. Tramos expresados en UTM: 13,5 · 30 · 50 · 70 · 90 · 120 · 310.</p>`,
    faq: [
      ['¿Desde qué sueldo se paga impuesto en Chile?', `Cuando la renta líquida imponible mensual supera 13,5 UTM, que hoy son ${CC.clp(13.5 * P.utm)}. Con AFP Uno, Fonasa y contrato indefinido, eso equivale a una renta imponible de unos $1.180.000.`],
      ['¿Cuál es la tasa máxima?', 'El tramo más alto es 40% para rentas líquidas imponibles mensuales superiores a 310 UTM. Es la tasa marginal, no la que pagas sobre todo tu sueldo.'],
      ['¿Por qué cambia la tabla cada mes?', 'Porque los tramos y las cantidades a rebajar están definidos en UTM, y el valor de la UTM se reajusta mensualmente con el IPC.']
    ],
    related: ['sueldo-liquido', 'boleta-de-honorarios', 'comisiones-afp']
  },

  /* -------------------------------------------------------------- AFP */
  {
    slug: 'comisiones-afp', tool: 'afp', aff: 'afp', icon: '🏦',
    nav: 'Comisiones AFP', cardTitle: 'Comisiones de las AFP',
    cardDesc: 'Compara cuánto te cobra cada AFP según tu sueldo y cuánto ahorrarías al año.',
    title: `Comisiones AFP ${Y}: compara cuánto te cobra cada una`,
    desc: `Tabla de comisiones de las 7 AFP en ${Y} y calculadora: cuánto pagas al mes y al año según tu sueldo, y cuánto ahorrarías cambiándote a la más barata.`,
    h1: `Comisiones de las AFP ${Y}`,
    lead: 'Ve cuánto te cobra cada AFP por administrar tu ahorro previsional y cuánto dinero al año te ahorrarías con una comisión menor.',
    form: `${money('a-sueldo', 'Tu renta imponible mensual', `Se aplica el tope de ${CC.num(P.topeImponibleUF, 1)} UF (≈ ${CC.clp(P.topeImponibleUF * P.uf)}).`)}`,
    body: `
      <h2>Comisiones vigentes</h2>
      <table>
        <tr><th>AFP</th><th>Comisión mensual</th><th>Total descuento (10% + comisión)</th></tr>
        ${Object.keys(P.afp).map(k => `<tr><td>${k}</td><td>${CC.num(P.afp[k], 2)}%</td><td>${CC.num(10 + P.afp[k], 2)}%</td></tr>`).join('')}
      </table>
      <p class="updated">Vigente a ${P.actualizado}. Fuente: <a href="https://www.spensiones.cl" rel="noopener">Superintendencia de Pensiones</a>.</p>
      <h2>Cómo funciona la comisión</h2>
      <p>De tu renta imponible se descuenta el 10% obligatorio, que va íntegro a tu cuenta de capitalización individual, y además una <strong>comisión</strong> que se queda la AFP por administrar tu ahorro. Solo la comisión es lo que cambia entre administradoras.</p>
      <h2>¿Conviene cambiarse a la AFP más barata?</h2>
      <p>La comisión importa, pero no es lo único. También debes mirar la <strong>rentabilidad de los fondos</strong> en el largo plazo y la calidad del servicio. Una diferencia de 1 punto de comisión sobre un sueldo de $1.500.000 son unos $15.000 al mes, casi $180.000 al año, dinero que dejas de aportar directamente a tu pensión si no compensas con una mayor rentabilidad.</p>
      <p>El cambio de AFP es gratuito, se hace en línea o presencialmente en la AFP de destino y toma efecto al mes siguiente.</p>
      <h2>Reforma de pensiones</h2>
      <p>La reforma previsional (Ley 21.735) establece que, desde agosto de 2025, el empleador realiza una cotización adicional que crece gradualmente. Ese aporte lo paga el empleador y <strong>no se descuenta de tu sueldo</strong>.</p>`,
    faq: [
      ['¿Cuál es la AFP más barata?', `Hoy, AFP Uno es la más barata con ${CC.num(P.afp.Uno, 2)}% de comisión, seguida por Modelo con ${CC.num(P.afp.Modelo, 2)}%.`],
      ['¿Cuánto pierdo por estar en una AFP más cara?', 'Depende de tu sueldo. Con la calculadora ves la diferencia anual exacta entre tu AFP y la más barata.'],
      ['¿Puedo cambiarme de AFP cuando quiera?', 'Sí, sin costo. Puedes hacerlo por internet o en una sucursal. También puedes traspasar tus fondos entre los distintos tipos de fondo (A, B, C, D y E) de tu AFP.'],
      ['¿La comisión se cobra sobre mi ahorro acumulado?', 'No. Se cobra sobre tu renta imponible del mes mientras cotizas, no sobre el saldo de tu cuenta.']
    ],
    related: ['sueldo-liquido', 'impuesto-unico-segunda-categoria', 'boleta-de-honorarios']
  },

  /* -------------------------------------------------------------- UF */
  {
    slug: 'uf-a-pesos', tool: 'uf', aff: 'hipotecario', icon: '🔁',
    nav: 'UF, UTM y dólar', cardTitle: 'Conversor UF, UTM y dólar',
    cardDesc: 'Valor de hoy de la UF, la UTM y el dólar, y conversión rápida a pesos chilenos.',
    title: `Valor UF hoy y conversor de UF a pesos chilenos`,
    desc: `Valor de la UF, la UTM y el dólar hoy en Chile. Convierte UF a pesos, UTM a pesos y dólares a pesos chilenos al instante.`,
    h1: `Valor de la UF hoy y conversor a pesos`,
    lead: 'Los indicadores del día, actualizados automáticamente, y un conversor rápido entre UF, UTM, dólares y pesos chilenos.',
    form: `
      <div class="two">${number('u-monto', 'Monto', '1', 'any')}
      <div class="field"><label for="u-unidad">Unidad</label><select id="u-unidad"><option value="uf">UF</option><option value="utm">UTM</option><option value="usd">Dólares (USD)</option></select></div></div>
      ${money('u-pesos', 'O convierte pesos a otras unidades', '', 'Ej: 50.000.000')}`,
    body: `
      <h2>Indicadores de hoy</h2>
      <div class="ind"><div><small>UF</small><strong data-ind="uf">$${CC.num(P.uf, 2)}</strong></div><div><small>UTM</small><strong data-ind="utm">${CC.clp(P.utm)}</strong></div><div><small>Dólar observado</small><strong data-ind="usd">$${CC.num(P.usd, 2)}</strong></div></div>
      <p class="updated">Los valores se cargan en línea desde mindicador.cl, que publica los datos oficiales del Banco Central de Chile y del SII.</p>
      <h2>¿Qué es la UF?</h2>
      <p>La <strong>Unidad de Fomento (UF)</strong> es una unidad de cuenta reajustable según la inflación (IPC). Su valor en pesos cambia todos los días y permite que créditos, arriendos y seguros mantengan su valor real en el tiempo. Los créditos hipotecarios, por ejemplo, se pactan en UF.</p>
      <h2>¿Qué es la UTM?</h2>
      <p>La <strong>Unidad Tributaria Mensual (UTM)</strong> es una unidad usada para multas e impuestos. Su valor lo fija el SII cada mes y se mantiene constante durante ese mes. Se usa, por ejemplo, para los tramos del impuesto único de segunda categoría.</p>
      <h2>¿Para qué sirve el conversor?</h2>
      <ul>
        <li>Saber cuánto cuesta en pesos una propiedad publicada en UF.</li>
        <li>Convertir el valor de un arriendo o un dividendo expresado en UF.</li>
        <li>Pasar montos en dólares a pesos chilenos con el dólar observado.</li>
      </ul>`,
    faq: [
      ['¿Cuánto vale la UF hoy?', `El valor de la UF hoy es de $${CC.num(P.uf, 2)} aproximadamente. En esta página se actualiza automáticamente al cargarla.`],
      ['¿Por qué la UF cambia todos los días?', 'Se reajusta diariamente según la variación del IPC del mes anterior, distribuida entre el día 10 de un mes y el día 9 del siguiente.'],
      ['¿Cómo convierto UF a pesos?', 'Multiplica la cantidad de UF por el valor de la UF del día. Por ejemplo, 3.000 UF × valor UF = precio en pesos.']
    ],
    related: ['dividendo-hipotecario', 'impuesto-unico-segunda-categoria', 'sueldo-liquido']
  }
];

module.exports = pages;
