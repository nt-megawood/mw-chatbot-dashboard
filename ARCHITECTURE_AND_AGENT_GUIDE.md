# megawood Chatbot Dashboard: Architektur- und Agent-Guide

## Ziel der Anwendung
Das Dashboard dient als Admin-Oberflaeche fuer den Betrieb des Chatbots.

Es kombiniert:
- Live-Uebersicht ueber Konversationen
- Verlauf und manuelle Admin-Hilfe (Text + Bild)
- Analytics zu Themen, haeufigen Fragen und erkannten Wissensluecken

## Projektstruktur (Dashboard)
- src/main.tsx: React Einstiegspunkt
- src/App.tsx: Hauptseite mit Datenabruf, Chat-Ansicht und Analytics-UI
- src/styles.css: zentrales Stylesheet im megawood-Stil
- src/vite-env.d.ts: Vite/ImportMeta Typen

## Projektstruktur (Backend, relevante API-Teile)
- api/mw-chatbot-backend.py

Wichtige API-Gruppen:
- Chat:
  - POST /chat
  - POST /terrassenplaner/chat
- Konversationen:
  - GET /conversations
  - GET /conversation/{conversation_id}
  - DELETE /conversation/{conversation_id}
  - POST /conversation/{conversation_id}/admin-message
  - POST /conversation/{conversation_id}/presence
- Analytics:
  - GET /analytics/overview
  - GET /analytics/topics
  - GET /analytics/gaps
  - POST /analytics/llm-evaluation (aktuell Platzhalter/501)

## Datenfluss im Dashboard
1. Beim Laden der Seite werden parallel Konversationen und Analytics geladen.
2. Alle 30 Sekunden erfolgt ein Refresh fuer Konversationen und Analytics.
3. Bei Auswahl einer Konversation wird der Verlauf geladen.
4. Admin-Nachrichten werden ueber /admin-message gespeichert und danach Verlauf + Liste aktualisiert.

## Analytics-Konzept (aktuell)
Die aktuelle Analytics ist regelbasiert (ohne LLM):
- KPI: Anzahl Konversationen, aktive Chats, Gesamt-Nachrichten, Durchschnitt pro Chat
- Rollenverteilung: user/model/assistant/admin
- Themen: Token-basierte Haefigkeit aus User-Nachrichten
- Frage-Liste: haeufigste Kundenfragen
- Gaps: Heuristische Erkennung moeglicher unzureichender Bot-Antworten

## Geplante LLM-Erweiterung
Die Route POST /analytics/llm-evaluation ist reserviert.

Vorgeschlagener spaeterer Ablauf:
1. Vorauswahl relevanter Konversationen aus letzter Periode.
2. LLM-Klassifikation je Turn, z. B.:
   - Thema
   - Intention
   - Erfolgsgrad Antwort (gut/teilweise/schlecht)
   - erforderliche Wissensluecke
3. Aggregation der LLM-Ergebnisse in gespeicherte Kennzahlen.
4. Dashboard liest diese Daten ueber dedizierte Endpunkte.

## Guidelines fuer spaetere AI-Agents
### 1) Bestehende Konventionen respektieren
- Kein neues Designsystem einfuehren.
- Primärfarben und Card-Stil aus src/styles.css beibehalten.
- API-Aufrufe zentral in App.tsx (oder bei Refactor in klar benannten Service-Dateien) halten.

### 2) API-Contract stabil halten
- Bestehende Felder nicht entfernen oder semantisch umdeuten.
- Neue Felder additive einfuehren.
- Antwortobjekte versionieren, falls Breaking Changes notwendig werden.

### 3) Erweiterungen testbar halten
- Komplexe Auswertungslogik im Backend in kleine Helper-Funktionen aufteilen.
- Heuristiken als Konstanten und nicht hartcodiert in Route-Funktionen definieren.
- Dashboard-Rendering robust gegen leere oder unvollstaendige API-Antworten gestalten.

### 4) Performance & Betrieb
- Analytics-Endpunkte auf sinnvolle Limits begrenzen (z. B. max 1000 Konversationen).
- Bei teuren LLM-Auswertungen asynchronen Jobansatz einplanen.
- API-Fehler immer mit klaren, nutzerfreundlichen Meldungen im Dashboard behandeln.

### 5) Sicherheit
- Alle Endpunkte mit Bearer-Token schuetzen.
- Keine geheimen Schluessel im Frontend hartkodieren.
- Eingaben fuer Admin-Nachrichten serverseitig validieren.

## Refactor-Plan (empfohlen, wenn Funktionsumfang weiter waechst)
- src/api/ fuer HTTP-Client und Endpoint-Funktionen
- src/components/ fuer Analytics-, Chat- und Tabellen-Komponenten
- src/types/ fuer gemeinsame API- und UI-Typen

Dadurch bleibt die Wartbarkeit bei steigender Komplexitaet hoch.
