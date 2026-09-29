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
    slug: 'sueldo-liquido', tool: 'sueldo', aff: 'sueldo',
    nav: 'Sueldo líquido', cardTitle: 'Sueldo bruto a líquido',
    cardDesc: 'Cuánto te llega después de AFP, salud, cesantía e impuesto. Sirve también al revés.',
    title: `Calculadora de sueldo líquido Chile ${Y}: de bruto a líquido y viceversa`,
    desc: `Calcula tu sueldo líquido en Chile con los descuentos ${Y}: AFP, salud, seguro de cesantía e impuesto único. También de líquido a bruto. Gratis y sin registro.`,
    h1: `Sueldo bruto a líquido`,
    lead: 'Pon tu sueldo base y mira cuánto queda después de los descuentos. Si estás negociando un trabajo, usa la otra pestaña: le dices cuánto quieres recibir y te dice qué sueldo bruto pedir.',
    form: `
      <div class="tabs" role="tablist"><button type="button" data-modo="bruto" aria-selected="true">Tengo el bruto</button><button type="button" data-modo="liquido" aria-selected="false">Quiero el líquido</button></div>
      ${money('s-base', 'Sueldo base mensual')}
      <div class="field"><label for="s-grat">Gratificación</label><select id="s-grat"><option value="legal">Gratificación legal (25% con tope)</option><option value="no">Sin gratificación</option></select></div>
      <div class="two">${money('s-bonos', 'Bonos imponibles', 'Comisiones, bonos de producción', '0')}${money('s-col', 'Colación', 'No imponible', '0')}</div>
      ${money('s-mov', 'Movilización', 'No imponible', '0')}
      <div class="field"><label for="s-afp">AFP</label><select id="s-afp"></select></div>
      <div class="two">
        <div class="field"><label for="s-salud">Salud</label><select id="s-salud"><option value="fonasa">Fonasa (7%)</option><option value="isapre">Isapre</option></select></div>
        <div class="field"><label for="s-contrato">Contrato</label><select id="s-contrato"><option value="indefinido">Indefinido</option><option value="plazo">Plazo fijo o por obra</option></select></div>
      </div>
      <div id="s-plan-row" hidden>${number('s-plan', 'Valor de tu plan de Isapre (UF)', '2.5', '0.01', 'Está en tu contrato. Si el plan cuesta menos que el 7%, se descuenta igual el 7%.')}</div>`,
    body: `
      <h2>Qué se descuenta y por qué</h2>
      <p>El punto de partida es la renta imponible: sueldo base, gratificación y bonos que cotizan. Sobre ella se descuenta la AFP (10% más la comisión de tu administradora, que hoy va entre ${CC.num(P.afp.Uno, 2)}% y ${CC.num(P.afp.Provida, 2)}%), la salud (7%, o el precio de tu plan si es mayor) y el seguro de cesantía (${CC.num(P.cesantiaTrabajador * 100, 1)}% si tienes contrato indefinido; con plazo fijo lo paga solo el empleador).</p>
      <p>Después viene el impuesto único de segunda categoría, que se calcula sobre lo que queda una vez restadas esas cotizaciones. Si esa base no supera ${CC.clp(13.5 * P.utm)}, no pagas nada. La colación y la movilización se suman al final, sin descuentos.</p>
      <h2>Los topes de ${Y}</h2>
      <table>
        <tr><th>Parámetro</th><th>Valor</th></tr>
        <tr><td>Tope imponible AFP y salud</td><td>${CC.num(P.topeImponibleUF, 1)} UF (unos ${CC.clp(P.topeImponibleUF * P.uf)})</td></tr>
        <tr><td>Tope del seguro de cesantía</td><td>${CC.num(P.topeCesantiaUF, 1)} UF (unos ${CC.clp(P.topeCesantiaUF * P.uf)})</td></tr>
        <tr><td>Ingreso mínimo mensual</td><td>${CC.clp(P.sueldoMinimo)}</td></tr>
        <tr><td>Gratificación legal máxima</td><td>4,75 ingresos mínimos al año, unos ${CC.clp(4.75 * P.sueldoMinimo / 12)} al mes</td></tr>
        <tr><td>Tramo exento de impuesto</td><td>13,5 UTM, unos ${CC.clp(13.5 * P.utm)} al mes</td></tr>
      </table>
      <p class="updated">Valores a ${P.actualizado}. Fuentes: <a href="https://www.spensiones.cl" rel="noopener">Superintendencia de Pensiones</a> y <a href="https://www.sii.cl" rel="noopener">SII</a>.</p>
      <h2>Lo que no está incluido</h2>
      <p>Es una estimación. No entran el APV, las cargas familiares, los préstamos de la empresa, los anticipos ni las cuotas sindicales. Tu liquidación puede diferir en unos pesos por redondeos, o porque tu empleador use otro valor de la UF para aplicar los topes.</p>`,
    faq: [
      ['¿Cuánto se descuenta de un sueldo en Chile?', `Entre AFP, salud y seguro de cesantía se va cerca del 18% de la renta imponible. Si además tu base tributable pasa de ${CC.clp(13.5 * P.utm)}, se suma el impuesto único.`],
      ['¿La gratificación también se descuenta?', 'Sí. La gratificación legal es imponible y tributable, así que sube tu renta imponible y también tus descuentos.'],
      ['¿Cómo saco el bruto si sé cuánto quiero recibir?', 'En la pestaña “Quiero el líquido”. La calculadora busca el sueldo base que, después de los descuentos, deja justo el monto que escribiste.'],
      ['¿Por qué mi liquidación da distinto?', 'Casi siempre por redondeos, por el valor de la UF que se usó para los topes o por descuentos voluntarios que aquí no están (APV, convenios, cuotas sindicales). Compara con tu liquidación y revisa la diferencia línea por línea.']
    ],
    related: ['finiquito', 'horas-extras', 'impuesto-unico-segunda-categoria', 'comisiones-afp']
  },

  /* -------------------------------------------------------------- FINIQUITO */
  {
    slug: 'finiquito', tool: 'finiquito', aff: 'finiquito',
    nav: 'Finiquito', cardTitle: 'Calculadora de finiquito',
    cardDesc: 'Indemnización por años de servicio, aviso previo, vacaciones y días pendientes.',
    title: `Calculadora de finiquito e indemnización Chile ${Y}`,
    desc: `Calcula tu finiquito en Chile: indemnización por años de servicio, aviso previo, feriado proporcional y días trabajados, según la causal de término. Gratis.`,
    h1: `Calculadora de finiquito`,
    lead: 'Sirve para saber, antes de firmar, si los números del finiquito que te ofrecen tienen sentido. Cambia según por qué termina el contrato, así que parte por elegir la causal.',
    form: `
      <div class="two">
        <div class="field"><label for="f-inicio">Inicio del contrato</label><input id="f-inicio" type="date"></div>
        <div class="field"><label for="f-termino">Término</label><input id="f-termino" type="date"></div>
      </div>
      <div class="field"><label for="f-causal">Causal de término</label><select id="f-causal">
        <option value="necesidades">Necesidades de la empresa (art. 161)</option>
        <option value="renuncia">Renuncia voluntaria (art. 159 N°2)</option>
        <option value="mutuo">Mutuo acuerdo (art. 159 N°1)</option>
        <option value="plazo">Vencimiento del plazo (art. 159 N°4)</option>
        <option value="falta">Falta grave del trabajador (art. 160)</option>
      </select></div>
      ${money('f-sueldo', 'Sueldo base mensual', 'Con esto se pagan los días trabajados y las vacaciones.')}
      ${money('f-ultima', 'Última remuneración mensual completa', 'Sueldo, gratificación y asignaciones habituales. Si lo dejas vacío usamos el sueldo base.', 'Opcional')}
      <div class="two">
        ${number('f-dias', 'Días trabajados del último mes', '0', '1', 'De 0 a 30')}
        ${number('f-tomados', 'Vacaciones tomadas este año laboral', '0', '0.5', 'Días hábiles desde tu último aniversario')}
      </div>
      <div class="field"><label for="f-pend">Vacaciones pendientes (opcional)</label><input id="f-pend" type="number" inputmode="decimal" step="0.5" min="0" placeholder="Automático"><small>Si tienes días acumulados de años anteriores, escribe el total de días hábiles pendientes. Si lo dejas vacío, se calculan desde tu último aniversario.</small></div>
      <div class="field"><label for="f-semana">Tu jornada es de</label><select id="f-semana"><option value="lv">Lunes a viernes</option><option value="ls">Lunes a sábado</option></select></div>
      <div class="check field" id="f-aviso-row"><input type="checkbox" id="f-aviso"><label for="f-aviso">Me avisaron por escrito con 30 días de anticipación</label></div>
      <div class="check field" id="f-inj-row"><input type="checkbox" id="f-inj"><label for="f-inj">El despido fue declarado injustificado (recargo de 30%)</label></div>`,
    body: `
      <h2>Qué puede incluir un finiquito</h2>
      <p>Siempre entran el sueldo de los días trabajados que no se han pagado y el feriado proporcional, que son las vacaciones acumuladas y no tomadas. Se generan 1,25 días hábiles por mes trabajado, o sea 15 al año.</p>
      <p>La indemnización por años de servicio, en cambio, solo corresponde cuando te despiden por necesidades de la empresa (artículo 161). Es un mes de remuneración por cada año trabajado, y una fracción de más de seis meses cuenta como año completo. El máximo son 11 años. Si además no te avisaron con 30 días de anticipación, se suma un mes más como indemnización sustitutiva del aviso previo.</p>
      <h2>El tope de 90 UF</h2>
      <p>La remuneración que sirve de base para estas indemnizaciones no puede pasar de 90 UF (unos ${CC.clp(90 * P.uf)}). Si ganas más que eso, igual se calcula con ese máximo. Dentro de ese límite, las indemnizaciones por años de servicio y por aviso previo no llevan descuentos de cotizaciones ni de impuesto.</p>
      <h2>Renuncia, mutuo acuerdo o plazo vencido</h2>
      <p>En estos casos no hay indemnización por años de servicio ni aviso previo, salvo que estén pactados en tu contrato o en un convenio colectivo. Sí te corresponden los días trabajados y las vacaciones proporcionales.</p>
      <h2>Si el despido es injustificado</h2>
      <p>Cuando un juzgado declara injustificado un despido por necesidades de la empresa, la indemnización por años de servicio sube un 30%. Otras causales mal invocadas tienen recargos mayores. El plazo para reclamar es corto, 60 días hábiles desde que termina la relación laboral, así que no conviene esperar.</p>
      <p class="updated">Estimación referencial. No reemplaza a un abogado laboral ni a la <a href="https://www.dt.gob.cl" rel="noopener">Dirección del Trabajo</a>. No considera vacaciones progresivas (para quienes tienen más de 10 años cotizando), semana corrida ni pactos especiales.</p>`,
    faq: [
      ['¿Cuánto es la indemnización por años de servicio?', 'Un mes de tu última remuneración por cada año de servicio, o fracción superior a seis meses, hasta 11 años. La remuneración se topa en 90 UF.'],
      ['¿Me corresponde indemnización si renuncio?', 'No. Al renunciar recibes los días trabajados, tus vacaciones proporcionales y otros montos pendientes, pero no indemnización por años de servicio.'],
      ['¿Cuántos días de vacaciones me pagan?', 'Se acumulan 1,25 días hábiles por mes. Si no indicas tus días pendientes, la calculadora estima los generados desde tu último aniversario, descuenta los que ya tomaste y paga el resto en días corridos.'],
      ['¿Qué pasa si no firmo el finiquito?', 'Puedes negarte a firmar o firmar dejando constancia de que reservas tus derechos. Tiene que firmarse ante un ministro de fe, como un notario o un inspector del trabajo. Si los montos no te cuadran, consulta en la Inspección del Trabajo.'],
      ['¿Cuánto tiempo tengo para reclamar un despido injustificado?', '60 días hábiles desde la separación, ante el Juzgado de Letras del Trabajo. Un reclamo previo en la Inspección del Trabajo puede suspender ese plazo.']
    ],
    related: ['sueldo-liquido', 'horas-extras', 'boleta-de-honorarios']
  },

  /* -------------------------------------------------------------- HONORARIOS */
  {
    slug: 'boleta-de-honorarios', tool: 'honorarios', aff: 'honorarios',
    nav: 'Boleta de honorarios', cardTitle: 'Boleta de honorarios',
    cardDesc: `Retención de ${CC.num(P.retencionHonorarios[2026] * 100, 2)}%: cuánto recibes, o cuánto tienes que emitir.`,
    title: `Calculadora de boleta de honorarios ${Y}: retención 15,25%`,
    desc: `Calcula el monto líquido y la retención de tu boleta de honorarios ${Y} (15,25%). También de líquido a bruto: cuánto emitir para recibir lo que necesitas.`,
    h1: `Boleta de honorarios`,
    lead: 'Calcula cuánto te llega después de la retención, o por cuánto tienes que emitir la boleta para recibir un monto exacto.',
    form: `
      <div class="tabs" role="tablist"><button type="button" data-modo="bruto" aria-selected="true">Tengo el bruto</button><button type="button" data-modo="liquido" aria-selected="false">Quiero el líquido</button></div>
      ${money('h-monto', 'Monto bruto de la boleta')}
      <div class="field"><label for="h-anio">Año de emisión</label><select id="h-anio"></select><small>La retención sube cada año por ley.</small></div>`,
    body: `
      <h2>La retención</h2>
      <p>Cuando le emites una boleta de honorarios a una empresa u otro contribuyente que lleva contabilidad, esa empresa retiene un porcentaje del monto bruto y lo paga al SII a tu nombre. Ese porcentaje sube todos los años hasta llegar a 17%:</p>
      <table>
        <tr><th>Año</th><th>Retención</th><th>Recibes por cada $1.000.000 bruto</th></tr>
        <tr><td>2025</td><td>14,5%</td><td>${CC.clp(1000000 * (1 - 0.145))}</td></tr>
        <tr><td>2026</td><td>15,25%</td><td>${CC.clp(1000000 * (1 - 0.1525))}</td></tr>
        <tr><td>2027</td><td>16%</td><td>${CC.clp(1000000 * (1 - 0.16))}</td></tr>
        <tr><td>2028 en adelante</td><td>17%</td><td>${CC.clp(1000000 * (1 - 0.17))}</td></tr>
      </table>
      <p>De bruto a líquido: bruto × 0,8475. Al revés, para saber por cuánto emitir: líquido ÷ 0,8475.</p>
      <h2>No es un descuento definitivo</h2>
      <p>La retención es un anticipo de tu impuesto anual. En abril, con la Operación Renta, el SII compara lo retenido con el impuesto que realmente te corresponde. Si retuvieron de más, por ejemplo porque tus ingresos del año quedaron bajo el tramo exento, te devuelven la diferencia. Si retuvieron de menos, la pagas tú.</p>
      <h2>Cotizaciones</h2>
      <p>Quienes emiten boletas de forma habitual también cotizan para pensión, salud y seguros. Se calculan sobre una parte de tus ingresos del año y se pagan a través de la Operación Renta, no mes a mes. El detalle está en el <a href="https://www.sii.cl/destacados/boletas_honorarios/" rel="noopener">sitio del SII</a>.</p>
      <p class="updated">Referencia: Ley 21.133. Esto no reemplaza la asesoría de un contador.</p>`,
    faq: [
      ['¿Cuál es la retención de la boleta de honorarios en 2026?', '15,25% del monto bruto. Sube a 16% en 2027 y a 17% desde 2028.'],
      ['¿Cómo calculo por cuánto emitir para recibir un monto líquido?', 'Divide lo que quieres recibir por 0,8475. Para recibir $1.000.000 líquidos tienes que emitir por unos $1.180.000.'],
      ['¿Siempre hay retención?', 'Se retiene cuando quien te paga es una empresa u otro contribuyente obligado a retener. Si le emites a una persona natural que no está obligada, no hay retención en el momento, pero igual declaras el ingreso en la Operación Renta.'],
      ['¿Se puede recuperar lo retenido?', 'Si lo retenido supera tu impuesto anual real, el SII te devuelve la diferencia en abril, después de presentar la Operación Renta.']
    ],
    related: ['impuesto-unico-segunda-categoria', 'sueldo-liquido', 'finiquito']
  },

  /* -------------------------------------------------------------- DIVIDENDO */
  {
    slug: 'dividendo-hipotecario', tool: 'dividendo', aff: 'hipotecario',
    nav: 'Dividendo hipotecario', cardTitle: 'Simulador de dividendo',
    cardDesc: 'La cuota mensual de un crédito hipotecario en UF y pesos, y la renta que te piden.',
    title: `Simulador de crédito hipotecario Chile ${Y}: calcula tu dividendo`,
    desc: `Simula el dividendo de tu crédito hipotecario en UF y pesos: cuota mensual, intereses totales y renta mínima sugerida. Gratis.`,
    h1: `Simulador de dividendo hipotecario`,
    lead: 'Para tener una idea de la cuota, de cuánto vas a pagar en intereses y de qué renta te van a pedir, antes de ir a hablar con un banco.',
    form: `
      ${number('d-valor', 'Valor de la propiedad (UF)', '3500', 'any')}<p class="updated" id="d-valor-clp" style="margin:-8px 0 14px"></p>
      <div class="two">${number('d-pie', 'Pie (%)', '20', 'any', 'Lo habitual es 20%')}${number('d-plazo', 'Plazo (años)', '30', '1')}</div>
      <div class="two">${number('d-tasa', 'Tasa anual (%)', '4.5', '0.01', 'La del crédito')}${number('d-seg', 'Seguros (% anual)', '0.3', '0.01', 'Desgravamen e incendio, estimado')}</div>`,
    body: `
      <h2>Cómo se calcula</h2>
      <p>Casi todos los créditos hipotecarios en Chile se pactan en UF y con cuota fija. Tu dividendo en UF no cambia en todo el plazo, pero en pesos sube o baja con la inflación, porque la UF se reajusta todos los días.</p>
      <p>La cuota sale de esta fórmula: <code>cuota = crédito × i ÷ (1 − (1 + i)^−n)</code>, donde <em>i</em> es la tasa mensual y <em>n</em> el número de cuotas.</p>
      <h2>Qué mirar además de la tasa</h2>
      <p>Para comparar bancos, fíjate en el CAE (Carga Anual Equivalente), que junta la tasa, los seguros y los gastos. Dos ofertas con la misma tasa pueden tener CAE distintos.</p>
      <p>Lo normal es que el banco financie hasta el 80% del valor de la propiedad, por eso el pie es 20%. Con menos pie la tasa suele subir. A eso súmale los gastos operacionales (tasación, estudio de títulos, notaría, impuesto de timbres e inscripción en el Conservador), que en total suelen andar entre 1% y 2% del valor.</p>
      <p>Sobre el plazo: más años bajan la cuota, pero los intereses totales suben bastante. Prueba con 20, 25 y 30 años y compara el total pagado.</p>
      <h2>Qué renta te van a pedir</h2>
      <p>Los bancos suelen querer que el dividendo no pase del 25% al 30% de la renta líquida del hogar. Aquí se calcula la renta mínima con el 25%. Cada banco tiene su propia política, así que tómalo como referencia.</p>
      <p class="updated">La simulación usa tasa nominal anual dividida en 12 y los seguros como porcentaje anual del crédito. Los valores finales los define la oferta formal del banco.</p>`,
    faq: [
      ['¿Cuánto es el dividendo de una propiedad de 3.000 UF a 30 años?', 'Con 20% de pie (crédito de 2.400 UF) y una tasa de 4,5% anual, la cuota es de unas 12,2 UF al mes, sin seguros.'],
      ['¿Conviene más a 20 o a 30 años?', 'A 20 años la cuota es más alta pero pagas bastante menos en intereses. A 30 años la cuota es más cómoda, y si después te sobra plata puedes prepagar.'],
      ['¿Qué pasa si sube la UF?', 'Tu cuota en UF sigue igual, pero en pesos sube con la inflación. Conviene que tu sueldo también se reajuste.'],
      ['¿Puedo pagar antes de tiempo?', 'Sí. El prepago y las amortizaciones extraordinarias están permitidos, aunque el banco puede cobrar una comisión con tope legal. Pregunta las condiciones antes de firmar.']
    ],
    related: ['uf-a-pesos', 'sueldo-liquido', 'impuesto-unico-segunda-categoria']
  },

  /* -------------------------------------------------------------- HORAS EXTRAS */
  {
    slug: 'horas-extras', tool: 'horas', aff: 'sueldo',
    nav: 'Horas extras', cardTitle: 'Calculadora de horas extras',
    cardDesc: 'Valor de la hora ordinaria y de la extra, con la jornada de 42 horas.',
    title: `Calculadora de horas extras Chile ${Y} (jornada de 42 horas)`,
    desc: `Calcula el valor de tus horas extras en Chile con la jornada de 42 horas: valor hora ordinaria, recargo del 50% y total del mes. Gratis.`,
    h1: `Calculadora de horas extras`,
    lead: 'Con tu sueldo base y tu jornada semanal, te dice cuánto vale cada hora extra y cuánto debieran pagarte por las del mes.',
    form: `
      ${money('e-sueldo', 'Sueldo base mensual')}
      <div class="field"><label for="e-jornada">Jornada semanal</label><select id="e-jornada"><option value="42" selected>42 horas (desde abril de 2026)</option><option value="44">44 horas (antes de abril de 2026)</option><option value="40">40 horas (desde abril de 2028)</option><option value="45">45 horas (jornada antigua)</option></select></div>
      ${number('e-horas', 'Horas extras trabajadas en el mes', '10', '0.5')}`,
    body: `
      <h2>Cómo se calculan</h2>
      <p>Una hora extra es la que pasa de la jornada pactada o del máximo legal, y se paga con un 50% de recargo sobre la hora ordinaria. Tienen que estar pactadas por escrito, responder a una necesidad temporal de la empresa y no pueden pasar de dos al día.</p>
      <p>La Dirección del Trabajo calcula el valor de la hora ordinaria así: sueldo base mensual ÷ 30 × 7 ÷ horas de la jornada semanal. La hora extra es eso multiplicado por 1,5.</p>
      <p>Por ejemplo, con un sueldo base de $900.000 y jornada de 42 horas, la hora ordinaria vale ${CC.clp(CC.horasExtras({ sueldoBase: 900000, jornada: 42, horas: 1 }).horaOrdinaria)} y la extra ${CC.clp(CC.horasExtras({ sueldoBase: 900000, jornada: 42, horas: 1 }).horaExtra)}.</p>
      <h2>Con la ley de 40 horas</h2>
      <p>La Ley 21.561 baja la jornada en etapas: 44 horas desde abril de 2024, 42 desde abril de 2026 y 40 desde abril de 2028. Como la jornada es más corta, cada hora ordinaria vale más, y con ella la hora extra.</p>
      <h2>Sobre qué sueldo se calcula</h2>
      <p>Sobre el sueldo base del contrato, sin gratificación, colación ni movilización. Si tu sueldo tiene una parte variable, el cálculo puede cambiar, así que consúltalo. Las horas extras son imponibles y tributables: el monto que ves es bruto y después se le aplican los descuentos legales.</p>
      <p class="updated">Referencia: artículos 30 a 32 del Código del Trabajo y Ley 21.561.</p>`,
    faq: [
      ['¿Cuánto vale una hora extra en Chile?', 'Un 50% más que la hora ordinaria. Con jornada de 42 horas equivale a más o menos 0,0083 veces el sueldo base por cada hora.'],
      ['¿Cuántas horas extras se pueden hacer al día?', 'Hasta dos, y tienen que estar pactadas por escrito para necesidades temporales de la empresa.'],
      ['¿Cuándo se pagan?', 'Junto con la remuneración del período en que se trabajaron, o con la del siguiente si así lo dice el contrato.'],
      ['¿Los gerentes o quienes no tienen control de horario cobran horas extras?', 'No. Los trabajadores que prestan servicios sin fiscalización superior inmediata (artículo 22) no tienen límite de jornada ni horas extras.']
    ],
    related: ['sueldo-liquido', 'finiquito']
  },

  /* -------------------------------------------------------------- IMPUESTO ÚNICO */
  {
    slug: 'impuesto-unico-segunda-categoria', tool: 'iusc', aff: 'sueldo',
    nav: 'Impuesto único', cardTitle: 'Impuesto único de segunda categoría',
    cardDesc: 'La tabla del mes en pesos, según la UTM, y una calculadora para tu sueldo.',
    title: `Tabla y calculadora del Impuesto Único de Segunda Categoría ${Y}`,
    desc: `Tabla vigente del Impuesto Único de Segunda Categoría en pesos según la UTM, con calculadora. Tramo exento, factores y cantidades a rebajar.`,
    h1: `Impuesto único de segunda categoría`,
    lead: 'La tabla de este mes en pesos, y una calculadora para ver cuánto impuesto te retienen del sueldo.',
    form: `${money('i-renta', 'Renta líquida imponible mensual', 'Tu renta imponible menos AFP, salud (7%) y seguro de cesantía.')}`,
    body: `
      <h2>La tabla de este mes</h2>
      <p>Los tramos están definidos en UTM, así que en pesos cambian todos los meses. Esta tabla usa la UTM vigente (<span data-ind="utm">${CC.clp(P.utm)}</span>).</p>
      <div class="scroll prose"><table class="tabla-iusc"></table></div>
      <h2>Cómo usarla</h2>
      <p>Toma tu renta imponible del mes y réstale las cotizaciones obligatorias: AFP, el 7% de salud y el seguro de cesantía. Lo que queda es la renta líquida imponible. Busca su tramo, multiplícala por el factor y réstale la cantidad a rebajar.</p>
      <p>Por ejemplo, con una renta líquida imponible de $3.000.000 (tramo del 8%): $3.000.000 × 0,08 − ${CC.clp(1.74 * P.utm)} = ${CC.clp(CC.impuestoUnico(3000000))}.</p>
      <h2>Quién lo paga</h2>
      <p>Los trabajadores dependientes cuyo sueldo pasa del tramo exento. Lo retiene el empleador cada mes y lo entera en el SII. Quienes emiten boletas de honorarios no usan esta tabla: tributan en abril con el impuesto global complementario.</p>
      <p class="updated">Fuente: <a href="https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm" rel="noopener">SII</a>. Tramos en UTM: 13,5, 30, 50, 70, 90, 120 y 310.</p>`,
    faq: [
      ['¿Desde qué sueldo se paga impuesto en Chile?', `Cuando la renta líquida imponible mensual pasa de 13,5 UTM, hoy ${CC.clp(13.5 * P.utm)}. Con AFP Uno, Fonasa y contrato indefinido, eso equivale a una renta imponible de unos $1.180.000.`],
      ['¿Cuál es la tasa máxima?', 'El tramo más alto es 40%, para rentas líquidas imponibles mensuales sobre 310 UTM. Es la tasa marginal: solo se aplica a la parte que pasa de ese monto, no a todo el sueldo.'],
      ['¿Por qué cambia la tabla todos los meses?', 'Porque los tramos y las cantidades a rebajar están en UTM, y el valor de la UTM se reajusta cada mes con el IPC.']
    ],
    related: ['sueldo-liquido', 'boleta-de-honorarios', 'comisiones-afp']
  },

  /* -------------------------------------------------------------- AFP */
  {
    slug: 'comisiones-afp', tool: 'afp', aff: 'afp',
    nav: 'Comisiones AFP', cardTitle: 'Comisiones de las AFP',
    cardDesc: 'Cuánto te cobra cada AFP según tu sueldo y cuánto ahorrarías al año.',
    title: `Comisiones AFP ${Y}: compara cuánto te cobra cada una`,
    desc: `Tabla de comisiones de las 7 AFP en ${Y} y calculadora: cuánto pagas al mes y al año según tu sueldo, y cuánto ahorrarías con la más barata.`,
    h1: `Comisiones de las AFP`,
    lead: 'Cuánto te cobra cada AFP por administrar tu ahorro, según tu sueldo, y la diferencia que hay al año entre una y otra.',
    form: `${money('a-sueldo', 'Tu renta imponible mensual', `Se aplica el tope de ${CC.num(P.topeImponibleUF, 1)} UF (unos ${CC.clp(P.topeImponibleUF * P.uf)}).`)}`,
    body: `
      <h2>Comisiones vigentes</h2>
      <table>
        <tr><th>AFP</th><th>Comisión</th><th>Descuento total (10% + comisión)</th></tr>
        ${Object.keys(P.afp).map(k => `<tr><td>${k}</td><td>${CC.num(P.afp[k], 2)}%</td><td>${CC.num(10 + P.afp[k], 2)}%</td></tr>`).join('')}
      </table>
      <p class="updated">Valores a ${P.actualizado}. Fuente: <a href="https://www.spensiones.cl" rel="noopener">Superintendencia de Pensiones</a>.</p>
      <h2>Qué se cobra y qué no</h2>
      <p>De tu renta imponible se descuenta el 10% obligatorio, que va completo a tu cuenta de ahorro para la pensión, y aparte una comisión que se queda la AFP. Solo la comisión cambia de una administradora a otra. Y se cobra sobre lo que ganas cada mes mientras cotizas, no sobre el saldo que tienes acumulado.</p>
      <h2>¿Conviene cambiarse a la más barata?</h2>
      <p>La comisión pesa, pero no es lo único. También cuenta cuánto han rentado los fondos en el largo plazo. Un punto de comisión sobre un sueldo de $1.500.000 son $15.000 al mes, unos $180.000 al año. Eso se compensa solo si la otra AFP rinde más, y eso no se sabe de antemano.</p>
      <p>Cambiarse no cuesta nada, se hace en línea o en la AFP de destino y parte al mes siguiente.</p>
      <h2>La reforma de pensiones</h2>
      <p>Con la reforma (Ley 21.735), desde agosto de 2025 el empleador hace una cotización adicional que va subiendo de a poco. La paga el empleador y no se descuenta de tu sueldo.</p>`,
    faq: [
      ['¿Cuál es la AFP más barata?', `Hoy es AFP Uno, con ${CC.num(P.afp.Uno, 2)}% de comisión, seguida de Modelo con ${CC.num(P.afp.Modelo, 2)}%.`],
      ['¿Cuánto pierdo por estar en una AFP más cara?', 'Depende de tu sueldo. Escríbelo en la calculadora y verás la diferencia anual exacta contra la más barata.'],
      ['¿Puedo cambiarme cuando quiera?', 'Sí, sin costo, por internet o en una sucursal. También puedes mover tus fondos entre los tipos A, B, C, D y E dentro de tu misma AFP.'],
      ['¿La comisión se cobra sobre mi ahorro acumulado?', 'No. Se cobra sobre tu renta imponible de cada mes mientras cotizas.']
    ],
    related: ['sueldo-liquido', 'impuesto-unico-segunda-categoria', 'boleta-de-honorarios']
  },

  /* -------------------------------------------------------------- UF */
  {
    slug: 'uf-a-pesos', tool: 'uf', aff: 'hipotecario',
    nav: 'UF, UTM y dólar', cardTitle: 'Conversor UF, UTM y dólar',
    cardDesc: 'El valor de hoy de la UF, la UTM y el dólar, y conversión a pesos.',
    title: `Valor UF hoy y conversor de UF a pesos chilenos`,
    desc: `Valor de la UF, la UTM y el dólar hoy en Chile. Convierte UF a pesos, UTM a pesos y dólares a pesos chilenos al instante.`,
    h1: `Valor de la UF hoy`,
    lead: 'Los indicadores del día y un conversor rápido entre UF, UTM, dólares y pesos.',
    form: `
      <div class="two">${number('u-monto', 'Monto', '1', 'any')}
      <div class="field"><label for="u-unidad">Unidad</label><select id="u-unidad"><option value="uf">UF</option><option value="utm">UTM</option><option value="usd">Dólares (USD)</option></select></div></div>
      ${money('u-pesos', 'O convierte pesos a otras unidades', '', 'Ej: 50.000.000')}`,
    body: `
      <h2>Indicadores de hoy</h2>
      <div class="ind"><div><small>UF</small><strong data-ind="uf">$${CC.num(P.uf, 2)}</strong></div><div><small>UTM</small><strong data-ind="utm">${CC.clp(P.utm)}</strong></div><div><small>Dólar</small><strong data-ind="usd">$${CC.num(P.usd, 2)}</strong></div></div>
      <p class="updated">Se cargan en línea desde mindicador.cl, que publica los datos del Banco Central y del SII.</p>
      <h2>Qué es la UF</h2>
      <p>La Unidad de Fomento es una unidad de cuenta que se reajusta según la inflación. Su valor en pesos cambia todos los días, y por eso sirve para que créditos, arriendos y seguros no pierdan valor con el tiempo. Los créditos hipotecarios, por ejemplo, se pactan en UF.</p>
      <h2>Qué es la UTM</h2>
      <p>La Unidad Tributaria Mensual se usa para multas e impuestos. Su valor lo fija el SII cada mes y no cambia durante ese mes. De ahí salen, por ejemplo, los tramos del impuesto único de segunda categoría.</p>
      <h2>Para qué sirve el conversor</h2>
      <p>Para saber cuánto cuesta en pesos una propiedad publicada en UF, cuánto es en pesos un arriendo o un dividendo expresado en UF, o cuántos pesos son unos dólares al valor observado de hoy.</p>`,
    faq: [
      ['¿Cuánto vale la UF hoy?', `Unos $${CC.num(P.uf, 2)}. En esta página el valor se actualiza solo al cargarla.`],
      ['¿Por qué la UF cambia todos los días?', 'Se reajusta a diario según el IPC del mes anterior, repartido entre el día 10 de un mes y el día 9 del siguiente.'],
      ['¿Cómo convierto UF a pesos?', 'Multiplicas las UF por el valor de la UF del día. Una propiedad de 3.000 UF, por ejemplo, son 3.000 por el valor de hoy.']
    ],
    related: ['dividendo-hipotecario', 'impuesto-unico-segunda-categoria', 'sueldo-liquido']
  }
];

module.exports = pages;
