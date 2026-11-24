# ⚔️ Kampf-Arena – Simons Browser-Kampfspiel

Ein Kampfspiel für 2 Spieler an einem Gerät. Es läuft ohne Server und ohne Installation:
**`index.html` per Doppelklick öffnen.**

## Ablauf

1. Beide Spieler geben ihren Namen ein und wählen einen von 3 Kämpfern (Kenji, Blitz-Bot oder Sir Bruno).
2. Jede Runde wählt jeder Spieler **geheim 5 Aktionen**, während der andere wegschaut.
3. Danach werden die Aktionen Schritt für Schritt aufgedeckt und ausgekämpft.
4. Es wird so lange gespielt, bis ein Spieler keine Energie mehr hat.

## Regeln

| Situation | Ergebnis |
|---|---|
| Angriff gegen Angriff (Schlag oder Tritt, egal welche Höhe) | beide verlieren 10 |
| Ungeblockter Schlag / Tritt | 10 / 15 Schaden |
| Block auf der falschen Höhe | hilft nicht, voller Treffer |
| Block auf der richtigen Höhe | kein Schaden, Konter für den Angreifer: Schlag 5, Tritt 10 |
| Block gegen Block | nichts passiert |

- Startenergie 100, höchstens 3 Blocks pro Runde
- Das Spiel endet sofort bei 0, auch mitten in einer Runde. Gehen beide gleichzeitig auf 0, ist es unentschieden.

Alle Werte stehen in `js/config.js` und lassen sich dort anpassen.

## Steuerung

Gespielt wird mit der Maus oder per Touch. Beim Wählen gilt: `⌫` nimmt die letzte Aktion zurück, `Enter` heißt „fertig“.
Der Ton lässt sich mit dem Lautsprecher-Knopf rechts oben ein- und ausschalten.

## Projektstruktur

```
index.html        Bildschirme (Setup, Übergabe, Eingabe, Kampf, Ende)
css/style.css     Aussehen, Animationen, Posen der Figuren
js/config.js      Spielwerte, Aktionen, Charaktere
js/regeln.js      Kampflogik (ohne Darstellung)
js/figuren.js     Kämpfer als SVG
js/sound.js       Soundeffekte (Web Audio, ohne Audiodateien)
js/main.js        Spielablauf
tests/            Regel-Tests: node tests/regeln.test.js
```

Die Skripte sind bewusst normale `<script>`-Tags und keine ES-Module, denn über `file://` blockiert der Browser Module.
