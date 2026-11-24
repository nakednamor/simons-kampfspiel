/*
 * Spielablauf: Setup → Übergabe → Eingabe (2×) → Kampf → nächste Runde / Ende
 */
(function () {
  'use strict';

  var C = KS.config, A = KS.aktionen, R = KS.regeln, S = KS.sound, F = KS.figuren;

  var $ = function (s) { return document.querySelector(s); };
  var warte = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  var spiel = {
    spieler: [
      { name: '', charId: 'ninja', energie: C.startEnergie, aktionen: [] },
      { name: '', charId: 'robo', energie: C.startEnergie, aktionen: [] }
    ],
    runde: 1,
    aktiv: 0,
    screen: 'screen-setup',
    laeuft: false
  };

  function zeigeScreen(id) {
    spiel.screen = id;
    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.toggle('aktiv', s.id === id);
    });
    window.scrollTo(0, 0);
  }

  function hoeheText(akt) {
    return akt.hoehe === 'oben' ? '⬆ oben' : '⬇ unten';
  }

  /* ---------- 1. Setup ---------- */

  function baueSetup() {
    [0, 1].forEach(function (nr) {
      var box = document.querySelector('.charakter-wahl[data-spieler="' + nr + '"]');
      box.innerHTML = '';
      KS.charaktere.forEach(function (ch) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'charakter-karte';
        b.dataset.id = ch.id;
        b.innerHTML = '<div class="karte-figur' + (nr === 1 ? ' gespiegelt' : '') + '">' + F.svg(ch.id) + '</div>' +
          '<strong></strong><span></span>';
        b.querySelector('strong').textContent = ch.name;
        b.querySelector('span').textContent = ch.titel;
        b.addEventListener('click', function () { waehleCharakter(nr, ch.id); });
        box.appendChild(b);
      });
    });
    aktualisiereSetup();

    var r = $('#regeln-text');
    r.innerHTML =
      '<ul>' +
      '<li>Beide wählen geheim <b>' + C.aktionenProRunde + ' Aktionen</b> pro Runde – der andere schaut weg!</li>' +
      '<li>Aktionen: Schlag, Tritt oder Block – jeweils <b>oben</b> oder <b>unten</b>. Höchstens <b>' + C.maxBlocksProRunde + ' Blocks</b> pro Runde.</li>' +
      '<li>Angriff gegen Angriff: <b>beide</b> verlieren ' + C.schlagabtausch + ' Energie.</li>' +
      '<li>Ungeblockter Treffer: Schlag ' + C.schaden.hand + ', Tritt ' + C.schaden.fuss + ' Schaden. Ein Block auf der falschen Höhe hilft nicht!</li>' +
      '<li>Block auf der richtigen Höhe: kein Schaden, der Angreifer bekommt einen Konter (Schlag ' + C.konter.hand + ', Tritt ' + C.konter.fuss + ').</li>' +
      '<li>Block gegen Block: nichts passiert.</li>' +
      '<li>Wer zuerst keine Energie mehr hat, verliert. Beide gleichzeitig auf 0 = Unentschieden.</li>' +
      '</ul>';
  }

  function waehleCharakter(nr, id) {
    if (spiel.spieler[1 - nr].charId === id) return;
    spiel.spieler[nr].charId = id;
    S.klick();
    aktualisiereSetup();
    var karte = document.querySelector('.charakter-wahl[data-spieler="' + nr + '"] .charakter-karte[data-id="' + id + '"] svg');
    F.setzePose(karte, 'sieg');
    setTimeout(function () { F.setzePose(karte, null); }, 600);
  }

  function aktualisiereSetup() {
    [0, 1].forEach(function (nr) {
      document.querySelectorAll('.charakter-wahl[data-spieler="' + nr + '"] .charakter-karte').forEach(function (k) {
        var id = k.dataset.id;
        var vergeben = spiel.spieler[1 - nr].charId === id;
        k.classList.toggle('gewaehlt', spiel.spieler[nr].charId === id);
        k.classList.toggle('vergeben', vergeben);
        k.disabled = vergeben;
        k.title = vergeben ? 'Schon vom anderen Spieler gewählt' : '';
      });
    });
  }

  function starteSpiel() {
    [0, 1].forEach(function (nr) {
      var sp = spiel.spieler[nr];
      sp.name = $('#name-' + nr).value.trim() || ('Spieler ' + (nr + 1));
      sp.energie = C.startEnergie;
      sp.aktionen = [];
    });
    if (spiel.spieler[0].name === spiel.spieler[1].name) {
      spiel.spieler[0].name += ' (1)';
      spiel.spieler[1].name += ' (2)';
    }
    spiel.runde = 1;
    S.bestaetigen();
    starteRunde();
  }

  function starteRunde() {
    spiel.spieler.forEach(function (sp) { sp.aktionen = []; });
    spiel.aktiv = 0;
    zeigeUebergabe();
  }

  /* ---------- 2. Übergabe ---------- */

  function zeigeUebergabe() {
    var sp = spiel.spieler[spiel.aktiv];
    var anderer = spiel.spieler[1 - spiel.aktiv];
    $('#uebergabe-runde').textContent = 'Runde ' + spiel.runde;
    $('#uebergabe-name').textContent = sp.name + ' ist dran!';
    $('#uebergabe-weg').textContent = anderer.name + ', bitte wegschauen! 🙈';
    $('#uebergabe-figur').innerHTML = F.svg(sp.charId);
    $('#uebergabe-figur').classList.toggle('gespiegelt', spiel.aktiv === 1);
    zeigeScreen('screen-uebergabe');
  }

  /* ---------- 3. Eingabe ---------- */

  function baueAktionsRaster() {
    var raster = $('#aktions-raster');
    KS.aktionsRaster.forEach(function (reihe) {
      reihe.forEach(function (id) {
        var akt = A[id];
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'aktion-btn aktion-' + akt.art;
        b.dataset.id = id;
        b.innerHTML = '<span class="aktion-icon">' + akt.icon + '</span>' +
          '<span class="aktion-name">' + akt.name + '</span>';
        b.addEventListener('click', function () { fuegeAktionHinzu(id); });
        // Vorschau beim Drüberfahren – nur mit Maus, nicht bei Touch
        b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hoverId = id; zeigeVorschau(id); } });
        b.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hoverId = null; zeigeVorschau(null); } });
        raster.appendChild(b);
      });
    });
  }

  var hoverId = null;
  var vorschauTimer = null;

  function zeigeVorschau(id) {
    clearTimeout(vorschauTimer);
    F.setzePose($('#eingabe-figur svg'), id);
  }

  // Pose kurz zeigen (z. B. nach dem Antippen), danach zurück
  function zeigeVorschauKurz(id) {
    zeigeVorschau(id);
    vorschauTimer = setTimeout(function () { F.setzePose($('#eingabe-figur svg'), hoverId); }, 650);
  }

  function zeigeEingabe() {
    var sp = spiel.spieler[spiel.aktiv];
    sp.aktionen = [];
    $('#eingabe-runde').textContent = 'Runde ' + spiel.runde;
    $('#eingabe-titel').textContent = sp.name + ' wählt geheim';
    $('#eingabe-figur').innerHTML = F.svg(sp.charId);
    $('#eingabe-figur').classList.toggle('gespiegelt', spiel.aktiv === 1);
    aktualisiereEingabe();
    zeigeScreen('screen-eingabe');
  }

  function fuegeAktionHinzu(id) {
    var sp = spiel.spieler[spiel.aktiv];
    if (!R.kannHinzufuegen(sp.aktionen, id)) {
      S.fehler();
      var z = $('#block-zaehler');
      z.classList.remove('wackeln'); void z.offsetWidth; z.classList.add('wackeln');
      return;
    }
    sp.aktionen.push(id);
    S.klick();
    zeigeVorschauKurz(id);
    aktualisiereEingabe();
  }

  function entferneLetzte() {
    var sp = spiel.spieler[spiel.aktiv];
    if (!sp.aktionen.length) return;
    sp.aktionen.pop();
    S.klick();
    aktualisiereEingabe();
  }

  function entferneAn(index) {
    var sp = spiel.spieler[spiel.aktiv];
    if (index >= sp.aktionen.length) return;
    sp.aktionen.splice(index, 1);
    S.klick();
    aktualisiereEingabe();
  }

  function aktualisiereEingabe() {
    var sp = spiel.spieler[spiel.aktiv];
    var slots = $('#slots');
    slots.innerHTML = '';
    for (var i = 0; i < C.aktionenProRunde; i++) {
      var d = document.createElement('button');
      d.type = 'button';
      var id = sp.aktionen[i];
      d.disabled = !id;
      d.title = id ? A[id].name + ' – antippen zum Entfernen' : '';
      d.addEventListener('click', entferneAn.bind(null, i));
      d.className = 'slot' + (id ? ' voll aktion-' + A[id].art : '') + (i === sp.aktionen.length ? ' naechster' : '');
      d.innerHTML = '<span class="slot-nr">' + (i + 1) + '</span>' +
        (id ? '<span class="aktion-icon">' + A[id].icon + '</span><span class="slot-hoehe">' + hoeheText(A[id]) + '</span>' : '');
      slots.appendChild(d);
    }
    var blocks = R.anzahlBlocks(sp.aktionen);
    $('#block-zaehler').textContent = 'Blocks: ' + blocks + ' / ' + C.maxBlocksProRunde;
    document.querySelectorAll('.aktion-btn').forEach(function (b) {
      b.disabled = !R.kannHinzufuegen(sp.aktionen, b.dataset.id);
    });
    $('#btn-zurueck').disabled = sp.aktionen.length === 0;
    $('#btn-fertig').disabled = !R.eingabeGueltig(sp.aktionen);
  }

  function eingabeFertig() {
    var sp = spiel.spieler[spiel.aktiv];
    if (!R.eingabeGueltig(sp.aktionen)) return;
    S.bestaetigen();
    if (spiel.aktiv === 0) {
      spiel.aktiv = 1;
      zeigeUebergabe();
    } else {
      starteKampf();
    }
  }

  /* ---------- 4. Kampf ---------- */

  function figur(nr) { return document.querySelector('#kaempfer-' + nr + ' svg'); }

  function baueArena() {
    [0, 1].forEach(function (nr) {
      var sp = spiel.spieler[nr];
      $('#hud-name-' + nr).textContent = sp.name;
      var k = $('#kaempfer-' + nr);
      k.classList.remove('ko', 'getroffen');
      k.querySelector('.figur-rahmen').innerHTML = F.svg(sp.charId);
      var reihe = $('#karten-' + nr);
      reihe.innerHTML = '';
      for (var i = 0; i < C.aktionenProRunde; i++) {
        var karte = document.createElement('div');
        karte.className = 'aufdeck-karte';
        karte.textContent = '?';
        reihe.appendChild(karte);
      }
    });
    $('#hud-runde').textContent = 'Runde ' + spiel.runde;
    var punkte = $('#schritt-punkte');
    punkte.innerHTML = '';
    for (var i = 0; i < C.aktionenProRunde; i++) punkte.appendChild(document.createElement('span'));
    aktualisiereEnergie();
    $('#kampf-text').textContent = '';
    $('#btn-weiter').hidden = true;
  }

  function aktualisiereEnergie() {
    [0, 1].forEach(function (nr) {
      var e = spiel.spieler[nr].energie;
      var proz = Math.max(0, e) / C.startEnergie * 100;
      var balken = $('#balken-' + nr);
      balken.style.width = proz + '%';
      balken.classList.toggle('mittel', proz <= 50 && proz > 25);
      balken.classList.toggle('niedrig', proz <= 25);
      $('#geist-' + nr).style.width = proz + '%';
      $('#hud-zahl-' + nr).textContent = e;
    });
  }

  function deckeAuf(nr, i, id) {
    var karte = $('#karten-' + nr).children[i];
    var akt = A[id];
    karte.className = 'aufdeck-karte offen aktion-' + akt.art;
    karte.innerHTML = '<span class="aktion-icon">' + akt.icon + '</span><span class="karte-hoehe">' + (akt.hoehe === 'oben' ? '⬆' : '⬇') + '</span>';
    karte.title = akt.name;
  }

  function markiereSchritt(i) {
    var punkte = $('#schritt-punkte').children;
    for (var j = 0; j < punkte.length; j++) {
      punkte[j].className = j < i ? 'fertig' : (j === i ? 'jetzt' : '');
    }
  }

  function wiederhole(el, klasse) {
    el.classList.remove(klasse);
    void el.offsetWidth; // Animation neu starten
    el.classList.add(klasse);
  }

  function zeigeZahl(nr, text, klasse) {
    var z = document.createElement('div');
    z.className = 'schwebe-text ' + (klasse || '');
    z.textContent = text;
    $('#kaempfer-' + nr).appendChild(z);
    setTimeout(function () { z.remove(); }, 1300);
  }

  function getroffen(nr, schaden) {
    wiederhole($('#kaempfer-' + nr), 'getroffen');
    zeigeZahl(nr, '−' + schaden, 'schaden');
  }

  function zeigeWirkung(erg, ids) {
    if (erg.typ === 'schlagabtausch') {
      wiederhole($('#funke'), 'zeigen');
      getroffen(0, erg.schaden[0]);
      getroffen(1, erg.schaden[1]);
      S.clash();
    } else if (erg.typ === 'treffer') {
      getroffen(erg.verteidiger, erg.schaden[erg.verteidiger]);
      if (A[ids[erg.angreifer]].art === 'fuss') S.tritt(); else S.schlag();
    } else if (erg.typ === 'geblockt') {
      wiederhole(figur(erg.verteidiger), 'blockt');
      zeigeZahl(erg.verteidiger, 'GEBLOCKT!', 'geblockt-text');
      setTimeout(function () {
        getroffen(erg.angreifer, erg.schaden[erg.angreifer]);
      }, 250);
      S.block();
    } else {
      S.nichts();
    }
  }

  function beschreibe(erg, ids) {
    var n = [spiel.spieler[0].name, spiel.spieler[1].name];
    if (erg.typ === 'schlagabtausch') {
      return 'Schlagabtausch! ' + A[ids[0]].name + ' gegen ' + A[ids[1]].name + ' – beide verlieren ' + erg.schaden[0] + '.';
    }
    if (erg.typ === 'treffer') {
      return n[erg.angreifer] + ' trifft mit ' + A[ids[erg.angreifer]].name + '! −' + erg.schaden[erg.verteidiger] + ' für ' + n[erg.verteidiger] + '.';
    }
    if (erg.typ === 'geblockt') {
      return n[erg.verteidiger] + ' blockt den ' + A[ids[erg.angreifer]].name + '! Konter: −' + erg.schaden[erg.angreifer] + ' für ' + n[erg.angreifer] + '.';
    }
    return 'Beide blocken – nichts passiert.';
  }

  async function zeigeBanner(text, dauer) {
    var b = $('#banner');
    b.textContent = text;
    wiederhole(b, 'zeigen');
    await warte(dauer || 1200);
    b.classList.remove('zeigen');
  }

  function starteKampf() {
    baueArena();
    zeigeScreen('screen-kampf');
    spieleRunde();
  }

  async function spieleRunde() {
    spiel.laeuft = true;
    S.runde();
    await zeigeBanner('Runde ' + spiel.runde + ' – Kampf!', 1300);

    var energien = [spiel.spieler[0].energie, spiel.spieler[1].energie];
    var ende = { vorbei: false, sieger: null };

    for (var i = 0; i < C.aktionenProRunde; i++) {
      var ids = [spiel.spieler[0].aktionen[i], spiel.spieler[1].aktionen[i]];
      markiereSchritt(i);
      deckeAuf(0, i, ids[0]);
      deckeAuf(1, i, ids[1]);
      S.aufdecken();
      F.setzePose(figur(0), ids[0]);
      F.setzePose(figur(1), ids[1]);
      await warte(300);

      var erg = R.werteAus(ids[0], ids[1]);
      zeigeWirkung(erg, ids);
      energien = R.wendeAn(energien, erg);
      spiel.spieler[0].energie = energien[0];
      spiel.spieler[1].energie = energien[1];
      aktualisiereEnergie();
      $('#kampf-text').textContent = beschreibe(erg, ids);

      await warte(C.schrittDauerMs * 0.55);
      F.setzePose(figur(0), null);
      F.setzePose(figur(1), null);

      ende = R.pruefeEnde(energien);
      if (ende.vorbei) break;
      await warte(C.schrittDauerMs * 0.45);
    }
    markiereSchritt(C.aktionenProRunde);
    spiel.laeuft = false;

    if (ende.vorbei) {
      await warte(400);
      [0, 1].forEach(function (nr) {
        if (spiel.spieler[nr].energie <= 0) $('#kaempfer-' + nr).classList.add('ko');
      });
      S.ko();
      await zeigeBanner('K.O.!', 1600);
      zeigeEnde(ende);
    } else {
      $('#btn-weiter').hidden = false;
      $('#btn-weiter').focus();
    }
  }

  function naechsteRunde() {
    if (spiel.laeuft) return;
    spiel.runde++;
    S.klick();
    starteRunde();
  }

  /* ---------- 5. Ende ---------- */

  function zeigeEnde(ende) {
    var box = $('#ende-figuren');
    box.innerHTML = '';
    var gewinner = ende.sieger === null ? [0, 1] : [ende.sieger];
    gewinner.forEach(function (nr) {
      var d = document.createElement('div');
      d.className = 'ende-figur' + (nr === 1 ? ' gespiegelt' : '');
      d.innerHTML = F.svg(spiel.spieler[nr].charId);
      box.appendChild(d);
      F.setzePose(d.querySelector('svg'), 'sieg');
    });
    if (ende.sieger === null) {
      $('#ende-titel').textContent = '🤝 Unentschieden!';
      $('#ende-info').textContent = 'Beide sind gleichzeitig K.O. gegangen – nach ' + spiel.runde + ' ' + (spiel.runde === 1 ? 'Runde' : 'Runden') + '.';
    } else {
      var sp = spiel.spieler[ende.sieger];
      $('#ende-titel').textContent = '🏆 ' + sp.name + ' gewinnt!';
      $('#ende-info').textContent = 'Nach ' + spiel.runde + ' ' + (spiel.runde === 1 ? 'Runde' : 'Runden') + ' mit ' + sp.energie + ' Energie übrig.';
    }
    zeigeScreen('screen-ende');
    S.sieg();
  }

  /* ---------- Start ---------- */

  function init() {
    baueSetup();
    baueAktionsRaster();

    $('#btn-start').addEventListener('click', starteSpiel);
    $('#btn-bereit').addEventListener('click', function () { S.klick(); zeigeEingabe(); });
    $('#btn-zurueck').addEventListener('click', entferneLetzte);
    $('#btn-fertig').addEventListener('click', eingabeFertig);
    $('#btn-weiter').addEventListener('click', naechsteRunde);
    $('#btn-revanche').addEventListener('click', starteSpiel);
    $('#btn-neu').addEventListener('click', function () { S.klick(); zeigeScreen('screen-setup'); });

    var ton = $('#ton-schalter');
    ton.textContent = S.istAn() ? '🔊' : '🔇';
    ton.addEventListener('click', function () { ton.textContent = S.umschalten() ? '🔊' : '🔇'; });

    document.addEventListener('keydown', function (e) {
      if (e.repeat) return;
      var s = spiel.screen;
      if (s === 'screen-eingabe') {
        if (e.key === 'Backspace') { e.preventDefault(); entferneLetzte(); }
        else if (e.key === 'Enter') { e.preventDefault(); eingabeFertig(); }
      } else if (s === 'screen-uebergabe' && e.key === 'Enter') {
        e.preventDefault(); S.klick(); zeigeEingabe();
      } else if (s === 'screen-setup' && e.key === 'Enter') {
        e.preventDefault();
        // Enter im ersten Namensfeld springt zum zweiten, im zweiten schließt es die Tastatur
        if (e.target.id === 'name-0') $('#name-1').focus();
        else if (e.target.id === 'name-1') e.target.blur();
        else starteSpiel();
      }
    });
  }

  init();
})();
