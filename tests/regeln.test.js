// Ausführen mit:  node tests/regeln.test.js
require('../js/config.js');
var R = require('../js/regeln.js');
var assert = require('assert');
var C = KS.config;

function test(name, fn) {
  try { fn(); console.log('✔ ' + name); }
  catch (e) { console.error('✘ ' + name + '\n  ' + e.message); process.exitCode = 1; }
}

test('Gleicher Angriff: beide verlieren gleich viel', function () {
  assert.deepStrictEqual(R.werteAus('HO', 'HO').schaden, [C.schlagabtausch, C.schlagabtausch]);
  assert.deepStrictEqual(R.werteAus('FU', 'FU').schaden, [C.schlagabtausch, C.schlagabtausch]);
});

test('Hand gegen Fuß: beide verlieren gleich viel', function () {
  var e = R.werteAus('HO', 'FU');
  assert.strictEqual(e.typ, 'schlagabtausch');
  assert.strictEqual(e.schaden[0], e.schaden[1]);
});

test('Block auf richtiger Höhe: geblockt, Angreifer bekommt Konter', function () {
  var e = R.werteAus('FO', 'BO');
  assert.strictEqual(e.typ, 'geblockt');
  assert.deepStrictEqual(e.schaden, [C.konter.fuss, 0]);
  e = R.werteAus('BU', 'HU');
  assert.deepStrictEqual(e.schaden, [0, C.konter.hand]);
});

test('Block auf falscher Höhe: voller Treffer', function () {
  var e = R.werteAus('FO', 'BU');
  assert.strictEqual(e.typ, 'treffer');
  assert.deepStrictEqual(e.schaden, [0, C.schaden.fuss]);
  e = R.werteAus('BO', 'HU');
  assert.deepStrictEqual(e.schaden, [C.schaden.hand, 0]);
});

test('Block gegen Block: nichts passiert', function () {
  assert.deepStrictEqual(R.werteAus('BO', 'BU').schaden, [0, 0]);
});

test('Höchstens 3 Blocks pro Runde', function () {
  assert.ok(R.kannHinzufuegen(['BO', 'BU'], 'BO'));
  assert.ok(!R.kannHinzufuegen(['BO', 'BU', 'BO'], 'BU'));
  assert.ok(R.kannHinzufuegen(['BO', 'BU', 'BO'], 'HO'));
  assert.ok(!R.eingabeGueltig(['BO', 'BU', 'BO', 'BU', 'HO']));
  assert.ok(R.eingabeGueltig(['BO', 'BU', 'BO', 'HO', 'FU']));
});

test('Genau 5 Aktionen pro Runde', function () {
  assert.ok(!R.kannHinzufuegen(['HO', 'HO', 'HO', 'HO', 'HO'], 'HO'));
  assert.ok(!R.eingabeGueltig(['HO', 'HO']));
});

test('Spielende und Unentschieden', function () {
  assert.deepStrictEqual(R.wendeAn([5, 50], { schaden: [10, 0] }), [0, 50]);
  assert.deepStrictEqual(R.pruefeEnde([0, 50]), { vorbei: true, sieger: 1 });
  assert.deepStrictEqual(R.pruefeEnde([30, 0]), { vorbei: true, sieger: 0 });
  assert.deepStrictEqual(R.pruefeEnde([0, 0]), { vorbei: true, sieger: null });
  assert.strictEqual(R.pruefeEnde([1, 1]).vorbei, false);
});
