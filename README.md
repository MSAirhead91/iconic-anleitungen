# ICONIC Anleitungen / Guides

Zentrale, bereinigte Kundenanleitungen mit deutscher und englischer Sprachfassung. Die Inhalte werden als eigenständige HTML-Seiten über GitHub Pages veröffentlicht.

## Öffentliche Links

- [Sprachauswahl / Choose language](https://msairhead91.github.io/iconic-anleitungen/)
- [Deutsche Übersicht](https://msairhead91.github.io/iconic-anleitungen/de/)
- [English overview](https://msairhead91.github.io/iconic-anleitungen/en/)
- [Vendor PPC – Deutsch](https://msairhead91.github.io/iconic-anleitungen/de/vendor-ppc/)
- [Vendor PPC – English](https://msairhead91.github.io/iconic-anleitungen/en/vendor-ppc/)

Der bisherige Link /vendor-ppc/ bleibt als Weiterleitung zu /de/vendor-ppc/ bestehen. Abfrageparameter und Kapitelanker werden erhalten. Alle internen Links sind relativ und funktionieren auch unter einer später eingerichteten eigenen Domain.

## Quellen und Struktur

- guides.json: Katalog mit unveränderlichem Slug, versions.de und versions.en sowie optionalen legacyPaths.
- guides/<slug>/de/Anleitung.md und en/Anleitung.md: getrennte Sprachquellen; stand.txt pro Sprache.
- guides/<slug>/screenshots/: gemeinsam verwendete, vollständig bereinigte Bilder.
- guides/<slug>/layout.local.css und screenshot-outlines.json: gemeinsame Bilddarstellung; bei Bedarf können Sprachordner eigene Konfigurationen überschreiben.
- design/: gemeinsames Design, Renderer und UI-Übersetzungen in i18n.mjs.
- scripts/: Website-Erzeugung und Ausgabe-/Linkprüfung.
- dist/: erzeugte Website; nicht in Git. Nur dieser Ordner wird veröffentlicht.

Die optionalen Titel der Markdown-Bilder dienen als stabile Darstellungsschlüssel, beispielsweise settings, employees, invitation, role und permissions. Alt-Texte sind sprachabhängig; CSS und Konturkonfiguration orientieren sich an data-shot bzw. diesen Schlüsseln.

Die englische Vendor-PPC-Anleitung enthält englische Texte und Bedienelemente. Die authentischen Screenshots zeigen derzeit die deutsche Oberfläche; dies wird in der Anleitung erklärt und die deutschen UI-Bezeichnungen werden im englischen Text angegeben. Fachliche Einstellungen entsprechen der freigegebenen deutschen Fassung.

## Lokal erstellen und prüfen

Node.js 24 verwenden:

    npm ci --ignore-scripts
    npm run build
    npm run check

Der Build erzeugt eine Sprachauswahl, je eine Übersicht unter /de/ und /en/, die Sprachfassungen unter /<sprache>/<slug>/ und notwendige Altlink-Weiterleitungen. Vor dem Veröffentlichen auch mit einem lokalen HTTP-Server unter einem Projektpräfix wie /iconic-anleitungen/ prüfen. Browser-, Mobil-, Druck-, Sprachwechsel- und Bildansichtsprüfung nach dem ICONIC-Anleitungen-Skill durchführen.

Beide Sprachfassungen eines Katalogeintrags müssen vorhanden sein. Unfertige Übersetzungen nicht als freigegebene Anleitung veröffentlichen. Eine Übersetzung übernimmt keine geänderten Berechtigungen oder Auswahlzustände ohne fachliche Freigabe.

## Veröffentlichung und stabile Kundenlinks

GitHub Settings > Pages > Build and deployment > Source: GitHub Actions ist eingerichtet. Eine eigene Domain ist noch nicht konfiguriert.

Push/Merge nach main startet den Workflow; Pull Requests prüfen Build und Links ohne Veröffentlichung. Nur freigegebene Änderungen nach main übernehmen. Slugs und Sprachpfade nach Versand eines Kundenlinks beibehalten. Frühere Routen in legacyPaths dauerhaft auf die passende Fassung weiterführen. Keine automatische Umleitung anhand der Browsersprache: Kundenlinks benennen ausdrücklich die gewünschte Sprache.

Das Quell-Repository ist öffentlich. Alle eingecheckten Dateien und die gesamte Historie müssen für Öffentlichkeit geeignet sein. Niemals unbereinigte Originale, Kontaktdaten, Konto-/Lieferantennamen, Zugangsdaten, interne Arbeitsdateien oder versteckte Bildbereiche einchecken. CSS-Zuschnitte entfernen keine Daten aus einer PNG-Datei.

Nach Veröffentlichung auf den erfolgreichen Deployment-Lauf warten und die öffentlichen URLs einschließlich Sprache, Bildern, Navigation, Vergrößerung und Altlinks tatsächlich testen. Ein gestarteter oder fehlgeschlagener Workflow ist keine erfolgreiche Veröffentlichung.