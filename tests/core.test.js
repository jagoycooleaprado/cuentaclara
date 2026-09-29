const assert = require('assert');
const CC = require('../assets/calc-core.js');
const near = (a, b, tol = 2) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

// Impuesto único vs tabla SII sept 2026
assert.strictEqual(CC.impuestoUnico(900000), 0);
near(CC.impuestoUnico(2000000), 2000000 * 0.04 - 38729.34);
near(CC.impuestoUnico(3000000), 3000000 * 0.08 - 124794.54);
near(CC.impuestoUnico(10000000), 10000000 * 0.35 - 1672533.72);
near(CC.impuestoUnico(30000000), 30000000 * 0.40 - 2784209.22);

// Sueldo 1.000.000 base, AFP Uno, Fonasa, indefinido, sin gratificación
let r = CC.sueldoLiquido({ sueldoBase: 1000000, afp: 'Uno', salud: 'fonasa', contrato: 'indefinido', gratificacion: 'no' });
assert.strictEqual(r.afp, 104600); assert.strictEqual(r.salud, 70000); assert.strictEqual(r.cesantia, 6000);
assert.strictEqual(r.impuesto, 0); assert.strictEqual(r.liquido, 819400);

// Tope imponible
r = CC.sueldoLiquido({ sueldoBase: 6000000, afp: 'Modelo', salud: 'fonasa', contrato: 'indefinido', gratificacion: 'no' });
assert.ok(r.topeAplicado); near(r.afp, Math.round(89.9 * CC.P.uf * 0.1058));

// Gratificación legal: tope 4,75 IMM / 12
near(CC.gratificacionLegal(5000000), 4.75 * 553553 / 12);

// Inversa
let b = CC.liquidoABruto({ afp: 'Habitat', salud: 'fonasa', contrato: 'indefinido', gratificacion: 'no' }, 1500000);
near(b.liquido, 1500000, 2);

// Honorarios 2026
let h = CC.honorarios(1000000, 'bruto', 0.1525); assert.strictEqual(h.liquido, 847500);
h = CC.honorarios(847500, 'liquido', 0.1525); near(h.bruto, 1000000);

// Finiquito: 3 años exactos, necesidades, sin aviso
let f = CC.finiquito({ inicio: '2023-03-01', termino: '2026-02-28', ultimaRemuneracion: 1000000, sueldoBase: 800000, diasUltimoMes: 28, diasTomados: 0, causal: 'necesidades', avisoDado: false, semana: 'lv' });
assert.strictEqual(f.meses, 36); assert.strictEqual(f.anosIndemnizables, 3);
assert.strictEqual(f.indemAnos, 3000000); assert.strictEqual(f.aviso, 1000000);
// Fracción > 6 meses cuenta como año; tope 11 años
f = CC.finiquito({ inicio: '2010-01-01', termino: '2026-09-30', ultimaRemuneracion: 1000000, sueldoBase: 1000000, diasUltimoMes: 0, diasTomados: 0, causal: 'necesidades', avisoDado: true });
assert.strictEqual(f.anosIndemnizables, 11);
// Renuncia: sin indemnización
f = CC.finiquito({ inicio: '2024-01-01', termino: '2026-06-30', ultimaRemuneracion: 900000, sueldoBase: 900000, diasUltimoMes: 30, diasTomados: 10, causal: 'renuncia' });
assert.strictEqual(f.indemAnos, 0); assert.strictEqual(f.aviso, 0); assert.strictEqual(f.sueldoPendiente, 900000);

// Dividendo: 3.000 UF, pie 20%, 30 años, 4,5%
let d = CC.dividendo({ valorUF: 3000, piePct: 20, plazoAnos: 30, tasaAnual: 4.5, segurosPct: 0 });
near(d.cuotaUF, 12.1604, 0.01);
// Horas extras (jornada 42): sueldo 900.000
let he = CC.horasExtras({ sueldoBase: 900000, jornada: 42, horas: 10 });
near(he.horaOrdinaria, 900000 / 30 * 7 / 42, 1);
console.log('OK — todos los tests pasan');
// Feriado: 6 meses desde el aniversario, 0 tomados → 7,5 días hábiles; L-V: ×7/5
f = CC.finiquito({ inicio: '2024-01-01', termino: '2025-06-30', ultimaRemuneracion: 900000, sueldoBase: 900000, diasUltimoMes: 0, diasTomados: 0, causal: 'renuncia', semana: 'lv' });
near(f.diasFeriado, 7.5, 0.01); near(f.feriado, 7.5 * 1.4 * 30000, 2);
f = CC.finiquito({ inicio: '2020-01-01', termino: '2025-06-30', ultimaRemuneracion: 900000, sueldoBase: 900000, diasUltimoMes: 0, diasPendientes: 12, causal: 'renuncia', semana: 'lv' });
near(f.diasFeriado, 12, 0.01);
console.log('OK — feriado');
