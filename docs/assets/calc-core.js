/* CuentaClara — motor de cálculo (funciona en navegador y en Node para tests).
   Parámetros verificados en septiembre 2026. Revisar cada enero (topes, sueldo mínimo)
   y cada mes (UF/UTM se cargan en vivo desde mindicador.cl con estos valores de respaldo). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CC = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var P = {
    actualizado: 'septiembre de 2026',
    uf: 41049.01,
    utm: 71721,
    usd: 969.7,
    sueldoMinimo: 553553,
    topeImponibleUF: 89.9,      // AFP, salud y mutual (desde enero 2026)
    topeCesantiaUF: 135.1,      // Seguro de cesantía
    topeIndemnizacionUF: 90,    // Base máxima de indemnización (art. 172 Código del Trabajo)
    cesantiaTrabajador: 0.006,  // Contrato indefinido
    saludLegal: 0.07,
    afpObligatoria: 0.10,
    afp: { 'Uno': 0.46, 'Modelo': 0.58, 'PlanVital': 1.16, 'Habitat': 1.27, 'Capital': 1.44, 'Cuprum': 1.44, 'Provida': 1.45 },
    retencionHonorarios: { 2026: 0.1525, 2027: 0.16, 2028: 0.17 },
    // Impuesto Único de Segunda Categoría, expresado en UTM (se multiplica por la UTM vigente)
    tramosIUSC: [
      { hasta: 13.5, factor: 0, rebaja: 0 },
      { hasta: 30, factor: 0.04, rebaja: 0.54 },
      { hasta: 50, factor: 0.08, rebaja: 1.74 },
      { hasta: 70, factor: 0.135, rebaja: 4.49 },
      { hasta: 90, factor: 0.23, rebaja: 11.14 },
      { hasta: 120, factor: 0.304, rebaja: 17.8 },
      { hasta: 310, factor: 0.35, rebaja: 23.32 },
      { hasta: Infinity, factor: 0.4, rebaja: 38.82 }
    ]
  };

  function round(n) { return Math.round(n); }

  function impuestoUnico(base, utm) {
    utm = utm || P.utm;
    if (base <= 0) return 0;
    var enUTM = base / utm;
    for (var i = 0; i < P.tramosIUSC.length; i++) {
      var t = P.tramosIUSC[i];
      if (enUTM <= t.hasta) return Math.max(0, round((enUTM * t.factor - t.rebaja) * utm));
    }
    return 0;
  }

  function gratificacionLegal(sueldoBase) {
    var tope = 4.75 * P.sueldoMinimo / 12;
    return Math.min(0.25 * sueldoBase, tope);
  }

  /* ---------- Sueldo bruto → líquido ---------- */
  function sueldoLiquido(o) {
    var uf = o.uf || P.uf, utm = o.utm || P.utm;
    var base = +o.sueldoBase || 0;
    var gratif = o.gratificacion === 'legal' ? gratificacionLegal(base) : (o.gratificacion === 'no' || !o.gratificacion ? 0 : +o.gratificacion || 0);
    var bonos = +o.bonosImponibles || 0;
    var imponible = base + gratif + bonos;
    var tope = P.topeImponibleUF * uf;
    var baseCot = Math.min(imponible, tope);
    var baseCes = Math.min(imponible, P.topeCesantiaUF * uf);

    var comision = (P.afp[o.afp] !== undefined ? P.afp[o.afp] : P.afp['Uno']) / 100;
    var afp = round(baseCot * (P.afpObligatoria + comision));

    var salud7 = round(baseCot * P.saludLegal);
    var salud = salud7;
    if (o.salud === 'isapre') {
      var plan = (+o.planIsapreUF || 0) * uf;
      salud = Math.max(salud7, round(plan));
    }
    var cesantia = o.contrato === 'indefinido' ? round(baseCes * P.cesantiaTrabajador) : 0;

    var baseTributable = Math.max(0, imponible - afp - salud7 - cesantia);
    var impuesto = impuestoUnico(baseTributable, utm);
    var noImponibles = (+o.colacion || 0) + (+o.movilizacion || 0);
    var descuentos = afp + salud + cesantia + impuesto;
    var liquido = imponible + noImponibles - descuentos;

    return {
      sueldoBase: base, gratificacion: round(gratif), bonos: bonos, imponible: round(imponible), noImponibles: noImponibles,
      totalHaberes: round(imponible + noImponibles),
      afp: afp, salud: salud, cesantia: cesantia, impuesto: impuesto,
      baseTributable: round(baseTributable), totalDescuentos: descuentos, liquido: round(liquido),
      topeAplicado: imponible > tope
    };
  }

  /* ---------- Sueldo líquido → bruto (búsqueda binaria) ---------- */
  function liquidoABruto(o, liquidoObjetivo) {
    var lo = 0, hi = liquidoObjetivo * 3 + 1000000, mid, r;
    for (var i = 0; i < 80; i++) {
      mid = (lo + hi) / 2;
      var p = {}; for (var k in o) p[k] = o[k];
      p.sueldoBase = mid;
      r = sueldoLiquido(p);
      if (r.liquido < liquidoObjetivo) lo = mid; else hi = mid;
    }
    var p2 = {}; for (var k2 in o) p2[k2] = o[k2];
    p2.sueldoBase = Math.round(hi);
    return sueldoLiquido(p2);
  }

  /* ---------- Boleta de honorarios ---------- */
  function honorarios(monto, modo, tasa) {
    // modo: 'bruto' (monto es el bruto) | 'liquido' (monto es lo que quieres recibir)
    var bruto = modo === 'liquido' ? monto / (1 - tasa) : monto;
    var retencion = bruto * tasa;
    return { bruto: round(bruto), retencion: round(retencion), liquido: round(bruto - retencion) };
  }

  /* ---------- Finiquito ---------- */
  function diffMeses(inicio, fin) {
    // meses (con fracción) entre dos fechas ISO
    var a = new Date(inicio + 'T00:00:00'), b = new Date(fin + 'T00:00:00');
    b = new Date(b.getTime() + 86400000); // el día de término se cuenta
    var meses = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    var dias = b.getDate() - a.getDate();
    if (dias < 0) {
      meses -= 1;
      var mesAnterior = new Date(b.getFullYear(), b.getMonth(), 0).getDate();
      dias += mesAnterior;
    }
    return { meses: meses, dias: dias, total: meses + dias / 30 };
  }

  function finiquito(o) {
    var uf = o.uf || P.uf;
    var d = diffMeses(o.inicio, o.termino);
    var tope = P.topeIndemnizacionUF * uf;
    var baseIndem = Math.min(+o.ultimaRemuneracion || 0, tope);
    var valorDia = (+o.sueldoBase || 0) / 30;

    var diasTrabajados = Math.min(30, Math.max(0, +o.diasUltimoMes || 0));
    var sueldoPendiente = round(valorDia * diasTrabajados);

    // Feriado proporcional: 1,25 días hábiles por mes. Si no se informan los días pendientes,
    // se estiman desde el último aniversario del contrato (los años anteriores se suponen ya tomados).
    var mesesDesdeAniversario = d.total - Math.floor(d.total / 12) * 12;
    var pendientesHabiles = typeof o.diasPendientes === 'number' && isFinite(o.diasPendientes)
      ? Math.max(0, o.diasPendientes)
      : Math.max(0, mesesDesdeAniversario * 1.25 - (+o.diasTomados || 0));
    var factor = o.semana === 'lv' ? 7 / 5 : 7 / 6;
    var feriado = round(pendientesHabiles * factor * valorDia);

    var conIndem = o.causal === 'necesidades';
    var anos = Math.floor(d.total / 12);
    var fraccion = d.total - anos * 12;
    var anosIndem = Math.min(11, anos + (fraccion > 6 ? 1 : 0));
    var indemAnos = conIndem ? round(anosIndem * baseIndem) : 0;
    var recargo = conIndem && o.injustificado ? round(indemAnos * 0.3) : 0;
    var aviso = conIndem && !o.avisoDado ? round(baseIndem) : 0;

    var total = sueldoPendiente + feriado + indemAnos + recargo + aviso;
    return {
      meses: d.meses, dias: d.dias, mesesTotales: d.total,
      anosIndemnizables: anosIndem, baseIndemnizacion: round(baseIndem), topeAplicado: (+o.ultimaRemuneracion || 0) > tope,
      sueldoPendiente: sueldoPendiente, feriado: feriado, diasFeriado: Math.round(pendientesHabiles * 100) / 100,
      indemAnos: indemAnos, recargo: recargo, aviso: aviso, total: total
    };
  }

  /* ---------- Dividendo hipotecario (sistema francés) ---------- */
  function dividendo(o) {
    var uf = o.uf || P.uf;
    var valor = +o.valorUF, pie = (+o.piePct) / 100;
    var credito = valor * (1 - pie);
    var n = Math.round(+o.plazoAnos * 12);
    var r = (+o.tasaAnual) / 100 / 12;
    var cuota = r === 0 ? credito / n : credito * r / (1 - Math.pow(1 + r, -n));
    var seguro = credito * ((+o.segurosPct || 0) / 100) / 12; // % anual sobre el crédito, prorrateado
    var cuotaTotal = cuota + seguro;
    var totalPagado = cuotaTotal * n;
    var intereses = cuota * n - credito;
    var saldo = credito, filas = [];
    for (var i = 1; i <= n; i++) {
      var interes = saldo * r, amort = cuota - interes;
      saldo = Math.max(0, saldo - amort);
      if (i <= 12 || i % 12 === 0) filas.push({ n: i, interes: interes, amort: amort, saldo: saldo });
    }
    return {
      credito: credito, pie: valor * pie, meses: n, cuotaUF: cuota, seguroUF: seguro, cuotaTotalUF: cuotaTotal,
      cuotaCLP: round(cuotaTotal * uf), totalPagadoUF: totalPagado, interesesUF: intereses,
      rentaMinima: round(cuotaTotal * uf / 0.25), filas: filas
    };
  }

  /* ---------- Horas extras ---------- */
  function horasExtras(o) {
    var horaOrdinaria = (+o.sueldoBase / 30) * 7 / (+o.jornada);
    var horaExtra = horaOrdinaria * 1.5;
    var total = horaExtra * (+o.horas || 0);
    return { horaOrdinaria: round(horaOrdinaria), horaExtra: round(horaExtra), total: round(total) };
  }

  /* ---------- Formato ---------- */
  function clp(n) {
    n = Math.round(n || 0);
    return (n < 0 ? '-$' : '$') + Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function num(n, dec) {
    var s = (+n).toFixed(dec === undefined ? 2 : dec).split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return s.join(',');
  }

  return {
    P: P, impuestoUnico: impuestoUnico, gratificacionLegal: gratificacionLegal, sueldoLiquido: sueldoLiquido,
    liquidoABruto: liquidoABruto, honorarios: honorarios, finiquito: finiquito, diffMeses: diffMeses,
    dividendo: dividendo, horasExtras: horasExtras, clp: clp, num: num
  };
});
