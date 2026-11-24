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

- **PC:** Maus. Beim Wählen nimmt `⌫` die letzte Aktion zurück, `Enter` heißt „fertig“. Fährt man mit der Maus über einen Button, zeigt die Figur die Pose.
- **iPhone/Tablet:** Antippen. Ein Tipp auf ein gefülltes Feld entfernt diese Aktion. Das Handy wird zwischen den Spielern weitergereicht. Gespielt wird am besten im Hochformat.
- Der Ton lässt sich mit dem Lautsprecher-Knopf rechts oben ein- und ausschalten. Ab iOS 17 spielt der Ton auch, wenn der Stummschalter am iPhone an ist. Bei älteren Versionen muss der Stummschalter aus sein.
- Mit dem 🏠-Knopf rechts oben lässt sich jederzeit abbrechen: weiterspielen, von vorn beginnen (gleiche Spieler) oder zurück zum Start.
- Die Versionsnummer steht unten am Startbildschirm. Nach einem Update die Home-Bildschirm-App ganz schließen (in der App-Übersicht nach oben wischen) und neu öffnen.

## Auf GitHub Pages veröffentlichen (fürs iPhone)

1. Auf github.com ein neues, **leeres** Repository anlegen, z. B. `kampf-arena`, ohne README. Für GitHub Pages im Gratis-Account muss das Repo **öffentlich** sein.
2. Im Projektordner:
   ```
   git remote add origin https://github.com/<dein-name>/kampf-arena.git
   git push -u origin main
   ```
3. Auf GitHub unter **Settings → Pages** bei „Source“ „Deploy from a branch“ wählen, dann Branch `main` und Ordner `/ (root)`, und auf **Save** klicken.
4. Nach ein bis zwei Minuten ist das Spiel unter `https://<dein-name>.github.io/kampf-arena/` erreichbar.
5. Am iPhone die Adresse in Safari öffnen und über **Teilen → Zum Home-Bildschirm** ein App-Symbol anlegen. Das Spiel startet dann im Vollbild ohne Safari-Leiste.

Spätere Änderungen werden einfach mit `git push` hochgeladen, die Seite aktualisiert sich danach von selbst.

## Projektstruktur

```
index.html        Bildschirme (Setup, Übergabe, Eingabe, Kampf, Ende)
css/style.css     Aussehen, Animationen, Posen, Layouts für PC/iPhone hoch/quer
fonts/            Schrift „Luckiest Guy“ (Apache-2.0, Lizenz liegt dabei)
img/              App-Symbole für Home-Bildschirm und Browser-Tab
js/config.js      Spielwerte, Aktionen, Charaktere
js/regeln.js      Kampflogik (ohne Darstellung)
js/figuren.js     Kämpfer als SVG
js/sound.js       Soundeffekte (Web Audio, ohne Audiodateien)
js/main.js        Spielablauf
tests/            Regel-Tests: node tests/regeln.test.js
```

Die Skripte sind bewusst normale `<script>`-Tags und keine ES-Module, denn über `file://` blockiert der Browser Module.
