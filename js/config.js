/*
 * Spiel-Einstellungen.
 * Hier können Werte zum Balancen geändert werden, ohne die Spiellogik anzufassen.
 */
var KS = (globalThis.KS = globalThis.KS || {});

KS.config = {
  startEnergie: 100,
  aktionenProRunde: 5,
  maxBlocksProRunde: 3,

  // Schaden, wenn ein Angriff ungeblockt trifft
  schaden: { hand: 10, fuss: 15 },

  // Angriff gegen Angriff (egal ob Hand oder Fuß, egal welche Höhe):
  // beide verlieren gleich viel Energie
  schlagabtausch: 10,

  // Angriff wird auf der richtigen Höhe geblockt:
  // der Angreifer bekommt Konter-Schaden (Fuß = mehr Risiko)
  konter: { hand: 5, fuss: 10 },

  // Dauer eines Kampfschritts bei der Auflösung (Millisekunden)
  schrittDauerMs: 1600
};

KS.aktionen = {
  HO: { id: 'HO', typ: 'angriff', art: 'hand', hoehe: 'oben',  name: 'Schlag oben', icon: '👊' },
  HU: { id: 'HU', typ: 'angriff', art: 'hand', hoehe: 'unten', name: 'Schlag unten', icon: '👊' },
  FO: { id: 'FO', typ: 'angriff', art: 'fuss', hoehe: 'oben',  name: 'Tritt oben',  icon: '🦶' },
  FU: { id: 'FU', typ: 'angriff', art: 'fuss', hoehe: 'unten', name: 'Tritt unten', icon: '🦶' },
  BO: { id: 'BO', typ: 'block',   art: 'block', hoehe: 'oben',  name: 'Block oben',  icon: '🛡️' },
  BU: { id: 'BU', typ: 'block',   art: 'block', hoehe: 'unten', name: 'Block unten', icon: '🛡️' }
};

// Anordnung der Buttons: obere Reihe "oben", untere Reihe "unten"
KS.aktionsRaster = [
  ['HO', 'FO', 'BO'],
  ['HU', 'FU', 'BU']
];

// Die Charaktere unterscheiden sich nur im Aussehen
KS.charaktere = [
  {
    id: 'ninja', name: 'Kenji', titel: 'Der Schatten-Ninja',
    farben: { koerper: '#1e293b', akzent: '#e11d48', haut: '#f2c48d', handschuh: '#334155', fuss: '#0f172a' }
  },
  {
    id: 'robo', name: 'Blitz-Bot', titel: 'Der Kampfroboter',
    farben: { koerper: '#0284c7', akzent: '#facc15', haut: '#cbd5e1', handschuh: '#475569', fuss: '#1e3a5f' }
  },
  {
    id: 'ritter', name: 'Sir Bruno', titel: 'Der eiserne Ritter',
    farben: { koerper: '#94a3b8', akzent: '#a855f7', haut: '#f2c48d', handschuh: '#64748b', fuss: '#475569' }
  }
];

KS.charakter = function (id) {
  for (var i = 0; i < KS.charaktere.length; i++) {
    if (KS.charaktere[i].id === id) return KS.charaktere[i];
  }
  return KS.charaktere[0];
};
