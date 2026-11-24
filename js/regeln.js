/*
 * Kampfregeln – reine Logik ohne Darstellung (auch mit Node testbar).
 */
var KS = (globalThis.KS = globalThis.KS || {});

KS.regeln = (function () {
  function c() { return KS.config; }
  function a(id) { return KS.aktionen[id]; }

  function anzahlBlocks(liste) {
    return liste.filter(function (id) { return a(id).typ === 'block'; }).length;
  }

  function kannHinzufuegen(liste, id) {
    if (!a(id)) return false;
    if (liste.length >= c().aktionenProRunde) return false;
    if (a(id).typ === 'block' && anzahlBlocks(liste) >= c().maxBlocksProRunde) return false;
    return true;
  }

  function eingabeGueltig(liste) {
    return liste.length === c().aktionenProRunde &&
      liste.every(function (id) { return !!a(id); }) &&
      anzahlBlocks(liste) <= c().maxBlocksProRunde;
  }

  /*
   * Wertet einen Kampfschritt aus: Aktion von Spieler 0 gegen Aktion von Spieler 1.
   * Ergebnis: { typ, schaden: [s0, s1], angreifer?, verteidiger? }
   *   typ = 'schlagabtausch' | 'treffer' | 'geblockt' | 'nichts'
   */
  function werteAus(id0, id1) {
    var x = a(id0), y = a(id1);
    var erg = { typ: 'nichts', schaden: [0, 0] };

    if (x.typ === 'angriff' && y.typ === 'angriff') {
      erg.typ = 'schlagabtausch';
      erg.schaden = [c().schlagabtausch, c().schlagabtausch];
      return erg;
    }
    if (x.typ === 'block' && y.typ === 'block') {
      return erg;
    }

    var angreifer = x.typ === 'angriff' ? 0 : 1;
    var verteidiger = 1 - angreifer;
    var ang = angreifer === 0 ? x : y;
    var ver = angreifer === 0 ? y : x;
    erg.angreifer = angreifer;
    erg.verteidiger = verteidiger;

    if (ang.hoehe === ver.hoehe) {
      erg.typ = 'geblockt';
      erg.schaden[angreifer] = c().konter[ang.art];
    } else {
      erg.typ = 'treffer';
      erg.schaden[verteidiger] = c().schaden[ang.art];
    }
    return erg;
  }

  function wendeAn(energien, erg) {
    return [
      Math.max(0, energien[0] - erg.schaden[0]),
      Math.max(0, energien[1] - erg.schaden[1])
    ];
  }

  // { vorbei: bool, sieger: 0 | 1 | null (Unentschieden) }
  function pruefeEnde(energien) {
    var leer0 = energien[0] <= 0, leer1 = energien[1] <= 0;
    if (leer0 && leer1) return { vorbei: true, sieger: null };
    if (leer0) return { vorbei: true, sieger: 1 };
    if (leer1) return { vorbei: true, sieger: 0 };
    return { vorbei: false, sieger: null };
  }

  return {
    anzahlBlocks: anzahlBlocks,
    kannHinzufuegen: kannHinzufuegen,
    eingabeGueltig: eingabeGueltig,
    werteAus: werteAus,
    wendeAn: wendeAn,
    pruefeEnde: pruefeEnde
  };
})();

if (typeof module !== 'undefined') module.exports = KS.regeln;
