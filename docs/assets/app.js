/* CuentaClara — interfaz de las calculadoras */
(function () {
  'use strict';
  var CC = window.CC, P = CC.P;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function parse(v) {
    if (v == null) return 0;
    var n = parseFloat(String(v).replace(/\./g, '').replace(',', '.').replace(/[^\d.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  }
  function num(id) { var el = document.getElementById(id); if (!el) return 0; var n = parseFloat(el.value); return isNaN(n) ? 0 : n; }
  function money(id) { var el = document.getElementById(id); return el ? parse(el.value) : 0; }
  function str(id) { var el = document.getElementById(id); return el ? el.value : ''; }
  function chk(id) { var el = document.getElementById(id); return !!(el && el.checked); }
  function row(label, value, cls, hint) {
    return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><th scope="row">' + label + (hint ? '<small>' + hint + '</small>' : '') + '</th><td>' + value + '</td></tr>';
  }
  function out(html) { var el = $('#resultado'); if (el) el.innerHTML = html; }

  /* Campos de dinero con separador de miles */
  function bindMoney() {
    $$('input[data-money]').forEach(function (el) {
      el.addEventListener('input', function () {
        var d = el.value.replace(/\D/g, '');
        el.value = d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
      });
    });
  }

  /* Indicadores en vivo (UF, UTM, dólar) con valores de respaldo */
  function paintIndicators() {
    $$('[data-ind]').forEach(function (el) {
      var k = el.getAttribute('data-ind');
      if (k === 'uf') el.textContent = '$' + CC.num(P.uf, 2);
      if (k === 'utm') el.textContent = CC.clp(P.utm);
      if (k === 'usd') el.textContent = '$' + CC.num(P.usd, 2);
    });
    $$('.tabla-iusc').forEach(renderIUSCTable);
  }
  function loadIndicators() {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 5000);
    return fetch('https://mindicador.cl/api', ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.uf && d.uf.valor) P.uf = d.uf.valor;
        if (d.utm && d.utm.valor) P.utm = d.utm.valor;
        if (d.dolar && d.dolar.valor) P.usd = d.dolar.valor;
      })
      .catch(function () { /* se usan los valores de respaldo */ })
      .then(function () { clearTimeout(timer); paintIndicators(); });
  }

  function renderIUSCTable(el) {
    var prev = 0, h = '<thead><tr><th>Renta líquida imponible mensual</th><th>Factor</th><th>Cantidad a rebajar</th></tr></thead><tbody>';
    P.tramosIUSC.forEach(function (t, i) {
      var rango;
      if (i === 0) rango = 'Hasta ' + CC.clp(t.hasta * P.utm);
      else if (t.hasta === Infinity) rango = 'Más de ' + CC.clp(prev * P.utm);
      else rango = 'Más de ' + CC.clp(prev * P.utm) + ' hasta ' + CC.clp(t.hasta * P.utm);
      var factor = t.factor === 0 ? 'Exento' : CC.num(t.factor * 100, (t.factor * 1000) % 10 ? 1 : 0) + '%';
      h += '<tr><td>' + rango + '</td><td>' + factor + '</td><td>' + (t.rebaja === 0 ? '$0' : CC.clp(t.rebaja * P.utm)) + '</td></tr>';
      prev = t.hasta;
    });
    el.innerHTML = h + '</tbody>';
  }

  /* ---------- Sueldo líquido ---------- */
  function initSueldo() {
    var modo = 'bruto';
    var afp = $('#s-afp');
    Object.keys(P.afp).forEach(function (k) {
      var o = document.createElement('option'); o.value = k;
      o.textContent = k + ' (' + CC.num(P.afp[k], 2) + '% comisión)'; afp.appendChild(o);
    });
    $$('.tabs [data-modo]').forEach(function (b) {
      b.addEventListener('click', function () {
        modo = b.getAttribute('data-modo');
        $$('.tabs [data-modo]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        $('#s-base-label').textContent = modo === 'bruto' ? 'Sueldo base mensual' : 'Sueldo líquido que quieres recibir';
        run();
      });
    });
    function run() {
      $('#s-plan-row').hidden = str('s-salud') !== 'isapre';
      var o = {
        afp: str('s-afp'), salud: str('s-salud'), planIsapreUF: num('s-plan'), contrato: str('s-contrato'),
        gratificacion: str('s-grat'), bonosImponibles: money('s-bonos'), colacion: money('s-col'), movilizacion: money('s-mov')
      };
      var v = money('s-base');
      if (!v) { out('<p class="vacio">Ingresa un monto para ver el detalle de tu liquidación.</p>'); return; }
      var r;
      if (modo === 'bruto') { o.sueldoBase = v; r = CC.sueldoLiquido(o); }
      else { r = CC.liquidoABruto(o, v); }
      var pct = r.totalHaberes ? Math.round(r.totalDescuentos / r.totalHaberes * 1000) / 10 : 0;
      var html = '';
      if (modo === 'liquido') html += '<div class="big"><span>Sueldo base necesario</span><strong>' + CC.clp(r.sueldoBase) + '</strong></div>';
      html += '<div class="big"><span>Sueldo líquido</span><strong>' + CC.clp(r.liquido) + '</strong></div>';
      html += '<div class="bar" role="img" aria-label="Descuentos: ' + pct + '% del total de haberes"><i style="width:' + Math.min(100, pct) + '%"></i></div>';
      html += '<p class="bar-leg">Los descuentos legales son el <b>' + CC.num(pct, 1) + '%</b> de tus haberes.</p>';
      html += '<table class="res"><tbody>';
      html += row('Sueldo base', CC.clp(r.sueldoBase));
      if (r.gratificacion) html += row('Gratificación legal', CC.clp(r.gratificacion));
      if (r.bonos) html += row('Bonos imponibles', CC.clp(r.bonos));
      html += row('Renta imponible', CC.clp(r.imponible), 'sub');
      if (r.noImponibles) html += row('Colación y movilización', CC.clp(r.noImponibles), '', 'No imponibles ni tributables');
      html += row('AFP (10% + comisión)', '-' + CC.clp(r.afp), 'neg');
      html += row('Salud', '-' + CC.clp(r.salud), 'neg');
      if (r.cesantia) html += row('Seguro de cesantía (0,6%)', '-' + CC.clp(r.cesantia), 'neg');
      html += row('Impuesto único (2ª categoría)', '-' + CC.clp(r.impuesto), 'neg', 'Sobre una base tributable de ' + CC.clp(r.baseTributable));
      html += row('Sueldo líquido', CC.clp(r.liquido), 'total');
      html += '</tbody></table>';
      if (r.topeAplicado) html += '<p class="nota">Tu renta imponible supera el tope de ' + CC.num(P.topeImponibleUF, 1) + ' UF (' + CC.clp(P.topeImponibleUF * P.uf) + '); las cotizaciones se calcularon sobre ese tope.</p>';
      out(html);
    }
    $$('#calc input, #calc select').forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
    return run;
  }

  /* ---------- Finiquito ---------- */
  function initFiniquito() {
    var hoy = new Date(); var iso = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth() + 1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2);
    $('#f-termino').value = iso;
    function run() {
      var inicio = str('f-inicio'), termino = str('f-termino');
      $('#f-inj-row').hidden = str('f-causal') !== 'necesidades';
      $('#f-aviso-row').hidden = str('f-causal') !== 'necesidades';
      if (!inicio || !termino || termino < inicio || !money('f-sueldo')) {
        out('<p class="vacio">Completa las fechas y el sueldo para calcular tu finiquito.</p>'); return;
      }
      var r = CC.finiquito({
        inicio: inicio, termino: termino, causal: str('f-causal'), sueldoBase: money('f-sueldo'),
        ultimaRemuneracion: money('f-ultima') || money('f-sueldo'), diasUltimoMes: num('f-dias'), diasTomados: num('f-tomados'), diasPendientes: str('f-pend') === '' ? undefined : num('f-pend'),
        avisoDado: chk('f-aviso'), injustificado: chk('f-inj'), semana: str('f-semana')
      });
      var html = '<div class="big"><span>Total estimado del finiquito</span><strong>' + CC.clp(r.total) + '</strong></div>';
      html += '<p class="bar-leg">Tiempo de servicio: <b>' + r.meses + ' meses y ' + r.dias + ' días</b>.</p>';
      html += '<table class="res"><tbody>';
      html += row('Sueldo por días trabajados', CC.clp(r.sueldoPendiente));
      html += row('Feriado proporcional (vacaciones)', CC.clp(r.feriado), '', CC.num(r.diasFeriado, 1) + ' días hábiles pendientes');
      if (str('f-causal') === 'necesidades') {
        html += row('Indemnización por años de servicio', CC.clp(r.indemAnos), '', r.anosIndemnizables + (r.anosIndemnizables === 1 ? ' año' : ' años') + ' × ' + CC.clp(r.baseIndemnizacion));
        if (r.recargo) html += row('Recargo por despido injustificado (30%)', CC.clp(r.recargo));
        html += row('Indemnización sustitutiva del aviso previo', CC.clp(r.aviso), '', r.aviso ? 'Un mes de remuneración' : 'Avisaste con 30 días de anticipación');
      }
      html += row('Total', CC.clp(r.total), 'total');
      html += '</tbody></table>';
      if (r.topeAplicado) html += '<p class="nota">La base de la indemnización tiene un tope de 90 UF (' + CC.clp(P.topeIndemnizacionUF * P.uf) + '), que ya se aplicó.</p>';
      if (str('f-causal') !== 'necesidades') html += '<p class="nota">Con esta causal no corresponde indemnización por años de servicio ni aviso previo (salvo que se hayan pactado por contrato o convenio).</p>';
      out(html);
    }
    $$('#calc input, #calc select').forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
    return run;
  }

  /* ---------- Boleta de honorarios ---------- */
  function initHonorarios() {
    var sel = $('#h-anio');
    Object.keys(P.retencionHonorarios).forEach(function (y) {
      var o = document.createElement('option'); o.value = y;
      o.textContent = y + ' (' + CC.num(P.retencionHonorarios[y] * 100, 2) + '%)'; sel.appendChild(o);
    });
    var modo = 'bruto';
    $$('.tabs [data-modo]').forEach(function (b) {
      b.addEventListener('click', function () {
        modo = b.getAttribute('data-modo');
        $$('.tabs [data-modo]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        $('#h-monto-label').textContent = modo === 'bruto' ? 'Monto bruto de la boleta' : 'Monto líquido que quieres recibir';
        run();
      });
    });
    function run() {
      var v = money('h-monto');
      if (!v) { out('<p class="vacio">Ingresa un monto para calcular la retención.</p>'); return; }
      var tasa = P.retencionHonorarios[str('h-anio')];
      var r = CC.honorarios(v, modo, tasa);
      var html = '<div class="big"><span>' + (modo === 'bruto' ? 'Recibes (líquido)' : 'Debes emitir por (bruto)') + '</span><strong>' + CC.clp(modo === 'bruto' ? r.liquido : r.bruto) + '</strong></div>';
      html += '<table class="res"><tbody>';
      html += row('Monto bruto', CC.clp(r.bruto));
      html += row('Retención ' + CC.num(tasa * 100, 2) + '%', '-' + CC.clp(r.retencion), 'neg', 'Se declara y paga al SII por cuenta tuya');
      html += row('Monto líquido', CC.clp(r.liquido), 'total');
      html += '</tbody></table>';
      html += '<p class="nota">La retención es un pago anticipado de tu impuesto anual. En abril, con la Operación Renta, se ajusta: si pagaste de más, se te devuelve.</p>';
      out(html);
    }
    $$('#calc input, #calc select').forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
    return run;
  }

  /* ---------- Dividendo hipotecario ---------- */
  function initDividendo() {
    function run() {
      var valor = num('d-valor');
      if (!valor) { out('<p class="vacio">Ingresa el valor de la propiedad en UF.</p>'); return; }
      var r = CC.dividendo({ valorUF: valor, piePct: num('d-pie'), plazoAnos: num('d-plazo'), tasaAnual: num('d-tasa'), segurosPct: num('d-seg') });
      $('#d-valor-clp').textContent = '≈ ' + CC.clp(valor * P.uf) + ' (UF a ' + '$' + CC.num(P.uf, 2) + ')';
      var html = '<div class="big"><span>Dividendo mensual estimado</span><strong>' + CC.clp(r.cuotaCLP) + '</strong><em>' + CC.num(r.cuotaTotalUF, 2) + ' UF</em></div>';
      html += '<table class="res"><tbody>';
      html += row('Pie a pagar', CC.num(r.pie, 1) + ' UF', '', CC.clp(r.pie * P.uf));
      html += row('Crédito hipotecario', CC.num(r.credito, 1) + ' UF', '', CC.clp(r.credito * P.uf));
      html += row('Intereses totales', CC.num(r.interesesUF, 1) + ' UF', '', CC.clp(r.interesesUF * P.uf));
      html += row('Total pagado al banco', CC.num(r.totalPagadoUF, 1) + ' UF', '', CC.clp(r.totalPagadoUF * P.uf));
      html += row('Renta líquida mínima sugerida', CC.clp(r.rentaMinima), 'total', 'Para que el dividendo no supere el 25% de tu renta');
      html += '</tbody></table>';
      html += '<details><summary>Ver evolución de la deuda</summary><table class="res mini"><thead><tr><th>Cuota</th><th>Interés (UF)</th><th>Amortización (UF)</th><th>Saldo (UF)</th></tr></thead><tbody>';
      r.filas.forEach(function (f) { html += '<tr><td>' + f.n + '</td><td>' + CC.num(f.interes, 2) + '</td><td>' + CC.num(f.amort, 2) + '</td><td>' + CC.num(f.saldo, 1) + '</td></tr>'; });
      html += '</tbody></table></details>';
      out(html);
    }
    $$('#calc input, #calc select').forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
    return run;
  }

  /* ---------- Horas extras ---------- */
  function initHoras() {
    function run() {
      var base = money('e-sueldo');
      if (!base) { out('<p class="vacio">Ingresa tu sueldo base para calcular tus horas extras.</p>'); return; }
      var r = CC.horasExtras({ sueldoBase: base, jornada: num('e-jornada'), horas: num('e-horas') });
      var html = '<div class="big"><span>Pago por horas extras</span><strong>' + CC.clp(r.total) + '</strong></div>';
      html += '<table class="res"><tbody>';
      html += row('Valor hora ordinaria', CC.clp(r.horaOrdinaria));
      html += row('Valor hora extra (+50%)', CC.clp(r.horaExtra));
      html += row('Horas extras del mes', CC.num(num('e-horas'), 1).replace(/,0$/, ''));
      html += row('Total horas extras (bruto)', CC.clp(r.total), 'total');
      html += '</tbody></table>';
      html += '<p class="nota">Las horas extras son remuneración imponible y tributable: al total se le aplican los descuentos de AFP, salud e impuesto. Pruébalo en la <a href="sueldo-liquido.html">calculadora de sueldo líquido</a> agregándolo como bono imponible.</p>';
      out(html);
    }
    $$('#calc input, #calc select').forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
    return run;
  }

  /* ---------- Impuesto único ---------- */
  function initIUSC() {
    function run() {
      var v = money('i-renta');
      if (!v) { out('<p class="vacio">Ingresa una renta líquida imponible mensual.</p>'); return; }
      var imp = CC.impuestoUnico(v, P.utm);
      var html = '<div class="big"><span>Impuesto único mensual</span><strong>' + CC.clp(imp) + '</strong></div>';
      html += '<table class="res"><tbody>';
      html += row('Renta líquida imponible', CC.clp(v));
      html += row('Impuesto único', CC.clp(imp), 'neg');
      html += row('Tasa efectiva', CC.num(v ? imp / v * 100 : 0, 2) + '%');
      html += row('Renta después del impuesto', CC.clp(v - imp), 'total');
      html += '</tbody></table>';
      out(html);
    }
    $$('#calc input').forEach(function (el) { el.addEventListener('input', run); });
    return run;
  }

  /* ---------- Comisiones AFP ---------- */
  function initAFP() {
    function run() {
      var v = money('a-sueldo');
      if (!v) { out('<p class="vacio">Ingresa tu renta imponible mensual.</p>'); return; }
      var base = Math.min(v, P.topeImponibleUF * P.uf);
      var lista = Object.keys(P.afp).map(function (k) { return { k: k, c: P.afp[k], m: Math.round(base * P.afp[k] / 100) }; }).sort(function (a, b) { return a.c - b.c; });
      var min = lista[0].m;
      var html = '<table class="res"><thead><tr><th>AFP</th><th>Comisión</th><th>Pagas al mes</th><th>Al año vs. la más barata</th></tr></thead><tbody>';
      lista.forEach(function (a, i) {
        html += '<tr' + (i === 0 ? ' class="total"' : '') + '><td>' + a.k + '</td><td>' + CC.num(a.c, 2) + '%</td><td>' + CC.clp(a.m) + '</td><td>' + (i === 0 ? 'La más barata' : '+' + CC.clp((a.m - min) * 12)) + '</td></tr>';
      });
      html += '</tbody></table><p class="nota">Además de la comisión, el 10% obligatorio va a tu cuenta de ahorro para la pensión. Las AFP también difieren en rentabilidad: compara los fondos en la web de la Superintendencia de Pensiones antes de cambiarte.</p>';
      out(html);
    }
    $$('#calc input').forEach(function (el) { el.addEventListener('input', run); });
    return run;
  }

  /* ---------- Conversor UF / UTM / USD ---------- */
  function initUF() {
    function run() {
      var unit = str('u-unidad'), v = num('u-monto');
      var valor = { uf: P.uf, utm: P.utm, usd: P.usd }[unit];
      var pesos = v * valor;
      var v2 = money('u-pesos');
      var html = '<div class="big"><span>' + CC.num(v, 2) + ' ' + unit.toUpperCase() + ' equivalen a</span><strong>' + CC.clp(pesos) + '</strong></div>';
      if (v2) {
        html += '<table class="res"><tbody>' + row(CC.clp(v2) + ' en UF', CC.num(v2 / P.uf, 4) + ' UF') + row(CC.clp(v2) + ' en UTM', CC.num(v2 / P.utm, 4) + ' UTM') + row(CC.clp(v2) + ' en dólares', 'US$ ' + CC.num(v2 / P.usd, 2)) + '</tbody></table>';
      }
      out(html);
    }
    $$('#calc input, #calc select').forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
    return run;
  }

  var tools = { sueldo: initSueldo, finiquito: initFiniquito, honorarios: initHonorarios, dividendo: initDividendo, horas: initHoras, iusc: initIUSC, afp: initAFP, uf: initUF };

  document.addEventListener('DOMContentLoaded', function () {
    bindMoney();
    paintIndicators();
    var run = null, tool = document.body.getAttribute('data-tool');
    if (tool && tools[tool]) { run = tools[tool](); run(); }
    loadIndicators().then(function () { if (run) run(); });
    $$('form').forEach(function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); }); });
    var nav = $('#menu-btn');
    if (nav) nav.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open'); nav.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();
