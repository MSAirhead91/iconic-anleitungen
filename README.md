# ICONIC Anleitungen

Zentrale, bereinigte Kundenanleitungen. Markdown und Screenshots sind die Arbeitsquellen; die fertige HTML-Ausgabe wird ueber GitHub Pages veroeffentlicht.

## Struktur

- guides.json: freigegebene Anleitungen mit dauerhaftem URL-Slug.
- guides/<slug>/: Markdown, bereinigte aktive Screenshots, lokale CSS und Stand.
- design/: gemeinsames freigegebenes Design und HTML-Renderer.
- scripts/: Erzeugung und Pruefung der Website.
- dist/: erzeugte Website, nicht in Git; ausschliesslich dieser Ordner wird veroeffentlicht.

## Lokal erstellen

Node.js 24 verwenden:

    npm ci --ignore-scripts
    npm run build
    npm run check

Danach dist/index.html fuer eine Vorschau oeffnen oder dist mit einem lokalen Webserver bereitstellen. Browser- und Mobilpruefung nach dem ICONIC-Anleitungen-Skill durchfuehren. Die Quellen sind ebenfalls oeffentlich, wenn dieses Repository oeffentlich ist. Deshalb niemals unbearbeitete Originalbilder, Zugangsdaten, kundenbezogene Kontodaten, interne Arbeitsdateien oder versteckte personenbezogene Bildbereiche einchecken.

## Veroeffentlichung

GitHub Settings > Pages > Build and deployment > Source: GitHub Actions. Beim erstmaligen Einrichten einmal aktivieren; eine eigene Domain ist optional und noch nicht konfiguriert.

Push/Merge nach main startet den Workflow. Pull Requests pruefen Build und Links, veroeffentlichen aber nicht. Nur freigegebene Inhalte nach main uebernehmen. Vor einer Veroeffentlichung alle sichtbaren und eingebetteten Bildbereiche pruefen; CSS-Ausblenden entfernt keine vertraulichen Daten aus der PNG-Datei.

Stabile Kundenroute: /vendor-ppc/. Dateinamen und Slugs nach dem ersten Versand nicht mehr aendern. Der Kunde erhaelt diesen direkten Link; Datumsstaende stehen in der Anleitung statt im URL. Alte Kundenlinks nicht stilllegen.

Die erste Anleitung ist Vendor PPC, Stand 11/2026. Die konkrete Zieladresse wird nach erfolgreicher Pages-Einrichtung dokumentiert. Eine fehlgeschlagene oder noch laufende Bereitstellung darf nicht als veroeffentlicht bezeichnet werden.