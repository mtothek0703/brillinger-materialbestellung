# Technische Bestandsaufnahme – Facility Management

Stand: 2026-10-16. Dieses Dokument enthält keine Zugangsdaten.

## Bestellung und Nachrichtenversand

- Der Bestellshop erzeugt lediglich Bestellvorschläge.
- Die Supabase Edge Function `facility-send-mail` nimmt die Vorschläge entgegen; der Versand erfolgt getrennt über `facility-send-digest`.
- Serverseitige Prüfung von UUID, Typ, Name, Standort, Bereich, höchstens 80 Artikeln und Mengen zwischen 1 und 1000 ist implementiert.
- Die Datenbankfunktion `facility_claim_dispatch` setzt globale Schwellen bei 3 Anfragen/Minute und 20/Stunde; `facility_spam_guard` kann auffällige Serien blockieren.
- Die Eingabe wird nur anhand mitgesendeter Stammdaten identifiziert. Es gibt keine unabhängige Benutzeranmeldung. Der HTTP-Origin-Header allein ist keine Authentifizierung.
- Produktnamen, Lieferanten und Artikelnummern stammen aus dem Browser und müssen als nicht vertrauenswürdig gelten. Ihre Längen werden serverseitig begrenzt.
- Serverseitige Sicherheitsregeln und Grenzwerte müssen bei jeder Erweiterung unverändert wirksam bleiben. Lasttests dürfen ausschließlich gegen eine Testumgebung erfolgen.

## Datenbankberechtigungen

- `facility_dispatches` und `facility_spam_alerts` haben Row Level Security aktiviert und keine öffentlichen Tabellenrichtlinien. Das ist bei ausschließlichem Service-Role-Zugriff beabsichtigt.
- `facility_statistics_summary()` ist als `SECURITY DEFINER` für `anon` und `authenticated` ausführbar; genau darauf basiert die aktuelle Statistikansicht.
- Der Security Advisor warnt zu dieser absichtlich öffentlichen Funktion. Berechtigungen nicht blind entfernen, da sonst die Übersicht ausfällt.
- Der Endpoint gibt Statistikeinträge aus den Bestell- und Leerungsdatensätzen zurück. Falls unkontrollierte Einsicht unerwünscht ist, muss die Auswertung über eine zugriffsbeschränkte API ersetzt werden.
- Der Supabase Performance Advisor hatte am 16.10.2026 keine Meldungen.

## Betrieb / Qualitätssicherung

- Die modernisierte App lädt JavaScript getrennt nach Navigation, Bestellstatistik, Leerungsstatistik und mobiler UI.
- Die ursprüngliche Reihenfolge der CSS-Deklarationen ist in `styles/base.css` und `styles/refinements.css` erhalten; neue Gestaltungswerte liegen in `styles/design-system.css`.
- Browser-Smoke-Tests dürfen niemals echte Bestellvorschläge verschicken: Test-Supabase-Aufrufe werden abgefangen.
- Vor einem Merge sind GitHub-Actions-Tests und ein echter mobiler Sichttest erforderlich, insbesondere Suchfeld, iOS-Tastatur, Kategorien und Swipe-Gesten.
- Beim Aktualisieren darf der Warenkorb nicht gelöscht werden.
- Alte automatische Resets der lokalen Statistikdaten wurden aus dem Entwicklungszweig entfernt.

## Weitere bewusste Einschränkungen

- Eine flächendeckende Bereinigung der historisch gewachsenen `!important`-Regeln bedarf visueller Regressionstests; das bloße Entfernen kann Layouts verschlechtern.
- iOS-Tastatureinblendungen lassen sich mit einem Chromium-Mobilprofil nur begrenzt nachstellen. Ein WebKit- bzw. echter iPhone-Test bleibt notwendig.
- Ohne Login sind individuelle statt globale Rate-Limits nur mit zusätzlichen Schutzsignalen zuverlässig zu realisieren.
