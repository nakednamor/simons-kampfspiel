/*
 * Kämpfer-Figuren als SVG. Alle Figuren schauen nach rechts;
 * Spieler 2 wird per CSS gespiegelt. Posen werden per CSS-Klasse
 * (pose-HO, pose-FU, ...) auf dem <svg> gesetzt.
 *
 * Gelenke (für CSS transform-origin):
 *   Schulter 100/110, Hüfte 100/185, Füße 100/270
 */
var KS = (globalThis.KS = globalThis.KS || {});

KS.figuren = (function () {
  function arm(f) {
    return '<line x1="100" y1="110" x2="100" y2="164" stroke="' + f.koerper + '" stroke-width="15" stroke-linecap="round"/>' +
      '<circle cx="100" cy="170" r="11" fill="' + f.handschuh + '" stroke="#0008" stroke-width="2"/>';
  }

  function bein(f) {
    return '<line x1="100" y1="185" x2="100" y2="258" stroke="' + f.koerper + '" stroke-width="19" stroke-linecap="round"/>' +
      '<rect x="92" y="256" width="28" height="13" rx="6" fill="' + f.fuss + '"/>';
  }

  function rumpf(f, id) {
    var s = '<rect x="78" y="98" width="44" height="94" rx="16" fill="' + f.koerper + '" stroke="#0006" stroke-width="2"/>';
    if (id === 'ninja') {
      // Gürtel
      s += '<rect x="78" y="162" width="44" height="9" fill="' + f.akzent + '"/>' +
        '<path d="M84 171 l-8 16 M90 171 l-4 18" stroke="' + f.akzent + '" stroke-width="5" stroke-linecap="round"/>';
    } else if (id === 'robo') {
      // Brustplatte mit Energiekern
      s += '<rect x="86" y="112" width="28" height="34" rx="6" fill="#0b3b5c" stroke="#7dd3fc" stroke-width="2"/>' +
        '<circle class="kern" cx="100" cy="129" r="7" fill="' + f.akzent + '"/>' +
        '<line x1="82" y1="160" x2="118" y2="160" stroke="#0b3b5c" stroke-width="3"/>' +
        '<line x1="82" y1="172" x2="118" y2="172" stroke="#0b3b5c" stroke-width="3"/>';
    } else if (id === 'ritter') {
      // Wappenrock mit Stern
      s += '<path d="M84 104 h32 v58 l-16 12 l-16 -12 z" fill="' + f.akzent + '" stroke="#0005" stroke-width="2"/>' +
        '<path d="M100 116 l4.4 9 9.9 1.4 -7.2 7 1.7 9.8 -8.8 -4.6 -8.8 4.6 1.7 -9.8 -7.2 -7 9.9 -1.4 z" fill="#fde68a"/>';
    }
    return s;
  }

  function kopf(f, id) {
    if (id === 'ninja') {
      return '<g class="kopf">' +
        '<path d="M70 62 q-22 -2 -34 10 M70 66 q-18 6 -28 22" stroke="' + f.akzent + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<circle cx="100" cy="68" r="27" fill="' + f.koerper + '" stroke="#0006" stroke-width="2"/>' +
        '<rect x="80" y="62" width="44" height="13" rx="6" fill="' + f.haut + '"/>' +
        '<rect x="74" y="50" width="52" height="8" rx="3" fill="' + f.akzent + '"/>' +
        '<ellipse cx="111" cy="68" rx="5" ry="3.5" fill="#fff"/><circle cx="113" cy="68" r="2.2" fill="#111"/>' +
        '<ellipse cx="95" cy="68" rx="4" ry="3" fill="#fff"/><circle cx="97" cy="68" r="1.8" fill="#111"/>' +
        '<path d="M106 60 l12 3 M90 61 l8 2" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>' +
        '</g>';
    }
    if (id === 'robo') {
      return '<g class="kopf">' +
        '<line x1="100" y1="40" x2="100" y2="22" stroke="#475569" stroke-width="4"/>' +
        '<circle class="antenne" cx="100" cy="19" r="6" fill="' + f.akzent + '"/>' +
        '<rect x="74" y="40" width="54" height="52" rx="10" fill="' + f.koerper + '" stroke="#0006" stroke-width="2"/>' +
        '<rect x="70" y="56" width="6" height="18" rx="2" fill="#475569"/>' +
        '<rect x="86" y="54" width="38" height="16" rx="6" fill="#0b1220"/>' +
        '<rect class="visier" x="92" y="58" width="28" height="8" rx="4" fill="#22d3ee"/>' +
        '<rect x="96" y="78" width="24" height="5" rx="2" fill="#0b3b5c"/>' +
        '</g>';
    }
    // Ritter
    return '<g class="kopf">' +
      '<path d="M96 40 q-26 -26 -46 -4 q16 -4 24 8" fill="' + f.akzent + '" stroke="#0005" stroke-width="2"/>' +
      '<path d="M73 70 q0 -32 27 -32 q27 0 27 32 v16 q-27 10 -54 0 z" fill="' + f.koerper + '" stroke="#334155" stroke-width="2.5"/>' +
      '<rect x="92" y="60" width="36" height="7" rx="3" fill="#1e293b"/>' +
      '<path d="M100 38 v20" stroke="#64748b" stroke-width="3"/>' +
      '<g fill="#475569"><circle cx="104" cy="77" r="2"/><circle cx="111" cy="77" r="2"/><circle cx="118" cy="77" r="2"/></g>' +
      '</g>';
  }

  function svg(charId) {
    var ch = KS.charakter(charId);
    var f = ch.farben;
    return '<svg class="figur figur-' + ch.id + '" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" aria-label="' + ch.name + '">' +
      '<ellipse class="schatten" cx="100" cy="272" rx="58" ry="9" fill="#0005"/>' +
      '<g class="koerper-gruppe">' +
        '<g class="glied bein bein-hinten">' + bein(f) + '</g>' +
        '<g class="glied arm arm-hinten">' + arm(f) + '</g>' +
        rumpf(f, ch.id) +
        kopf(f, ch.id) +
        '<g class="glied bein bein-vorne">' + bein(f) + '</g>' +
        '<g class="glied arm arm-vorne">' + arm(f) + '</g>' +
      '</g>' +
      '<ellipse class="schild schild-oben" cx="160" cy="88" rx="12" ry="44" fill="#7dd3fc55" stroke="#bae6fd" stroke-width="4"/>' +
      '<ellipse class="schild schild-unten" cx="160" cy="215" rx="12" ry="44" fill="#7dd3fc55" stroke="#bae6fd" stroke-width="4"/>' +
      '</svg>';
  }

  // Setzt eine Pose (Aktions-ID, 'sieg' oder null für Grundhaltung)
  function setzePose(svgEl, pose) {
    if (!svgEl) return;
    var weg = [];
    svgEl.classList.forEach(function (k) { if (k.indexOf('pose-') === 0) weg.push(k); });
    weg.forEach(function (k) { svgEl.classList.remove(k); });
    if (pose) svgEl.classList.add('pose-' + pose);
  }

  return { svg: svg, setzePose: setzePose };
})();
