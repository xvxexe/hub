# ROADMAP.md — EuropaService Hub

## v0.1 — Base frontend mock

Da fare:
- struttura cartelle
- sito pubblico mock
- area dashboard mock
- navigazione
- dati mock
- responsive

Da NON fare:
- backend reale
- Supabase
- IA
- upload reale

## v0.2 — Ruoli mock

Da fare:
- admin
- contabilità
- dipendente
- menu diverso per ruolo
- login mock

## v0.3 — Cantieri mock

Da fare:
- lista cantieri
- dettaglio cantiere pubblico
- dettaglio cantiere interno
- foto mock
- documenti mock

## v0.4 — Upload mock

Da fare:
- caricamento foto simulato
- caricamento documenti simulato
- stato: da verificare

## v0.5 — Contabilità mock

Da fare:
- tabella movimenti
- categorie
- imponibile
- IVA
- totale
- filtri per cantiere

## v0.5.9 — Check manuale completo pre-Supabase

Da fare prima di qualunque backend reale:
- controllo manuale sito pubblico
- controllo manuale area interna
- controllo ruoli mock
- controllo mobile
- controllo build
- controllo dati mock
- verifica nessun dato sensibile esposto
- verifica interazioni mock

## v0.5.10 — Correzione bug emersi dal check manuale

Completato mantenendo il progetto 100% mock:
- correzione bug ruoli e navigazione interna
- correzione incoerenze nelle interazioni mock
- aggiornamento registro QA
- build e controlli base puliti

## v0.5.11 — Secondo check finale mock pre-Supabase

Da fare prima di valutare Supabase:
- rieseguire checklist pubblica e interna
- verificare bug corretti in `docs/MOCK_QA_BUGS.md`
- verificare ruoli admin, contabilità e dipendente
- verificare mobile e desktop
- confermare build pulita
- approvare esplicitamente il passaggio alla progettazione Supabase

## v0.6 — Supabase setup

Bloccato finché non è completato il secondo check finale mock in v0.5.11.

Condizioni obbligatorie prima di sbloccare Supabase:
- `docs/PRE_SUPABASE_CHECKLIST.md` completata
- `docs/MOCK_QA_BUGS.md` senza bug Critica
- `docs/MOCK_QA_BUGS.md` senza bug Alta non approvati esplicitamente
- `npm run build` pulito
- ruoli verificati manualmente
- mobile verificato manualmente
- dati mock e interazioni mock verificati
- approvazione esplicita dopo v0.5.11

Da fare dopo:
- auth reale
- database
- storage file
