/*
 * Soundeffekte – werden live mit der Web Audio API erzeugt,
 * daher braucht das Spiel keine Audiodateien.
 */
var KS = (globalThis.KS = globalThis.KS || {});

KS.sound = (function () {
  var ctx = null;
  var an = true;
  try { an = localStorage.getItem('ks-ton') !== 'aus'; } catch (e) { /* egal */ }

  // iOS 17+: Ton auch spielen, wenn der Stummschalter am iPhone an ist
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
  } catch (e) { /* älteres iOS oder anderer Browser */ }

  function erzeugeKontext() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    // iOS kennt neben 'suspended' auch 'interrupted' (z. B. nach App-Wechsel)
    if (ctx.state !== 'running') ctx.resume();
    return ctx;
  }

  function kontext() {
    if (!an) return null;
    return erzeugeKontext();
  }

  /*
   * iOS gibt Ton erst frei, wenn er direkt in einer Berührung gestartet wird.
   * Darum bei jeder Berührung: Kontext aufwecken und einen stillen Ton abspielen.
   */
  function freischalten() {
    var ac = erzeugeKontext();
    if (!ac) return;
    try {
      var buf = ac.createBuffer(1, 1, ac.sampleRate);
      var src = ac.createBufferSource();
      src.buffer = buf;
      src.connect(ac.destination);
      src.start(0);
    } catch (e) { /* egal */ }
  }
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, freischalten, { capture: true, passive: true });
  });
  // Nach dem Zurückkehren in die App wieder aufwecken
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && ctx && ctx.state !== 'running') ctx.resume();
  });

  // Einfacher Ton mit Hüllkurve; o = { typ, vol, bis (Zielfrequenz), start }
  function ton(freq, dauer, o) {
    var ac = kontext(); if (!ac) return;
    o = o || {};
    var t = ac.currentTime + (o.start || 0);
    var osc = ac.createOscillator();
    var g = ac.createGain();
    osc.type = o.typ || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.bis) osc.frequency.exponentialRampToValueAtTime(o.bis, t + dauer);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    osc.connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dauer + 0.05);
  }

  // Rauschen durch einen Filter; o = { freq, vol, typ, start, q }
  function rauschen(dauer, o) {
    var ac = kontext(); if (!ac) return;
    o = o || {};
    var t = ac.currentTime + (o.start || 0);
    var laenge = Math.floor(ac.sampleRate * dauer);
    var buf = ac.createBuffer(1, laenge, ac.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < laenge; i++) d[i] = Math.random() * 2 - 1;
    var src = ac.createBufferSource();
    src.buffer = buf;
    var filter = ac.createBiquadFilter();
    filter.type = o.typ || 'lowpass';
    filter.frequency.value = o.freq || 1000;
    filter.Q.value = o.q || 1;
    var g = ac.createGain();
    g.gain.setValueAtTime(o.vol || 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    src.connect(filter).connect(g).connect(ac.destination);
    src.start(t);
    src.stop(t + dauer + 0.05);
  }

  return {
    istAn: function () { return an; },
    umschalten: function () {
      an = !an;
      try { localStorage.setItem('ks-ton', an ? 'an' : 'aus'); } catch (e) { /* egal */ }
      if (an) this.klick();
      return an;
    },
    klick: function () { ton(700, 0.06, { typ: 'square', vol: 0.06 }); },
    fehler: function () { ton(180, 0.18, { typ: 'square', vol: 0.08, bis: 120 }); },
    bestaetigen: function () {
      ton(520, 0.1, { typ: 'triangle', vol: 0.15 });
      ton(780, 0.15, { typ: 'triangle', vol: 0.15, start: 0.08 });
    },
    aufdecken: function () { rauschen(0.18, { typ: 'bandpass', freq: 1800, q: 0.8, vol: 0.18 }); },
    schlag: function () {
      rauschen(0.12, { freq: 1400, vol: 0.5 });
      ton(160, 0.14, { vol: 0.5, bis: 60 });
    },
    tritt: function () {
      rauschen(0.2, { freq: 800, vol: 0.6 });
      ton(110, 0.25, { vol: 0.7, bis: 40 });
    },
    block: function () {
      ton(900, 0.3, { typ: 'triangle', vol: 0.2, bis: 860 });
      ton(1350, 0.25, { vol: 0.12 });
      rauschen(0.06, { typ: 'highpass', freq: 3000, vol: 0.25 });
    },
    clash: function () {
      rauschen(0.25, { freq: 1200, vol: 0.6 });
      ton(140, 0.2, { vol: 0.5, bis: 50 });
      ton(600, 0.2, { typ: 'sawtooth', vol: 0.06, bis: 300 });
    },
    nichts: function () { rauschen(0.3, { typ: 'bandpass', freq: 500, q: 0.5, vol: 0.12 }); },
    runde: function () {
      ton(440, 0.15, { typ: 'square', vol: 0.08 });
      ton(660, 0.3, { typ: 'square', vol: 0.08, start: 0.15 });
    },
    ko: function () {
      ton(300, 0.8, { typ: 'sawtooth', vol: 0.12, bis: 50 });
      rauschen(0.5, { freq: 400, vol: 0.4, start: 0.3 });
    },
    sieg: function () {
      [523, 659, 784, 1047].forEach(function (f, i) {
        ton(f, 0.25, { typ: 'triangle', vol: 0.18, start: i * 0.13 });
      });
      ton(1047, 0.7, { typ: 'triangle', vol: 0.15, start: 0.55 });
    }
  };
})();
