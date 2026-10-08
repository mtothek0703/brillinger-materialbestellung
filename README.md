# Brillinger Materialbestellung

Statischer, responsiver Bestellshop mit sechs Beispielartikeln, Mengenauswahl (1–999 Verpackungseinheiten), Warenkorb und Bestellformular. Keine Installation und kein Build erforderlich.

## Bestellungen

Der Button bereitet eine E-Mail an **michael.kohler@brillinger.de** vor. Das E-Mail-Programm muss eingerichtet sein; die Person sendet die E-Mail selbst ab. Es erfolgt kein automatischer Versand und keine serverseitige Speicherung. Falls das E-Mail-Programm nicht öffnet, lässt sich der Bestelltext kopieren. Der Warenkorb bleibt während der geöffneten Seite erhalten und wird beim Neuladen geleert.

Name und Abteilung / Lieferort sind Pflichtangaben. Die Artikel sind Beispiele ohne Preise; die Menge bezeichnet die angegebene Verpackungseinheit. Artikel in `app.js` im Array `PRODUCTS` bearbeiten, Empfänger über `RECIPIENT` ändern.

## GitHub Pages

`.github/workflows/pages.yml` veröffentlicht bei Änderungen auf `main` die vier öffentlichen Dateien. Der Workflow versucht Pages zu aktivieren, sofern seine Berechtigung dafür reicht. Falls dies abgelehnt wird: **Settings → Pages → Build and deployment → Source → GitHub Actions** auswählen und den Workflow unter **Actions** erneut starten. Alternativ **Deploy from a branch → main → / (root)** wählen; die statischen Dateien funktionieren auch ohne Actions.

Erwartete Adresse: https://mtothek0703.github.io/brillinger-materialbestellung/

GitHub Pages ist öffentlich erreichbar; die Bezeichnung „intern“ ist kein Zugriffsschutz.

## Lokal ansehen

```sh
python -m http.server 8000
```

Dann http://localhost:8000 öffnen. Syntax prüfen: `node --check app.js`.
