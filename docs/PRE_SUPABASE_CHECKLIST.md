# PRE_SUPABASE_CHECKLIST.md — EuropaService Hub

Checklist manuale da completare prima di qualunque collegamento a Supabase o dati reali.

Regole del check:
- mantenere il progetto 100% mock
- non inserire dati reali o sensibili
- segnare ogni problema in `docs/MOCK_QA_BUGS.md`
- non passare a Supabase se restano bug critici o alta priorità non risolti

## Esito v0.5.11 — Secondo check finale mock

Controllo eseguito il 2026-05-01.

- Build verificata con `npm run build`: OK.
- Lint verificato con `npm run lint`: OK.
- Smoke test browser headless su pagine pubbliche principali mobile/desktop: OK.
- Controllo statico route, ruoli, store mock, localStorage, reset demo, dati e assenza backend reale: OK.
- Nessun bug Critica aperto in `docs/MOCK_QA_BUGS.md`.
- Nessun bug Alta aperto in `docs/MOCK_QA_BUGS.md`.
- Verdetto dettagliato: `docs/PRE_SUPABASE_VERDICT.md`.

## A. Stato generale progetto

- [x] `npm install` completato senza errori bloccanti
- [x] `npm run dev` avvia il progetto
- [x] `npm run build` termina correttamente
- [x] Nessun errore console evidente durante navigazione base
- [x] Sito pubblico raggiungibile da `#/`
- [x] Area interna raggiungibile da `#/dashboard/login`
- [x] Progetto ancora 100% mock
- [x] Nessun Supabase/backend/API reale configurato
- [x] Nessun upload reale attivo
- [x] Nessuna IA/OCR/export reale attiva

## B. Check sito pubblico

Per ogni pagina pubblica verificare:
- [x] pagina si apre
- [x] layout mobile ok
- [x] layout desktop ok
- [x] nessun elemento sovrapposto
- [x] immagini caricate o fallback funzionante
- [x] testi leggibili
- [x] CTA visibili
- [x] link funzionanti
- [x] H1 presente e unico
- [x] SEO base presente
- [x] nessun dato interno esposto
- [x] form mock funzionante dove presente

Pagine:
- [x] `#/`
- [x] `#/servizi`
- [x] `#/cantieri`
- [x] `#/cantieri/:id`
- [x] `#/settori`
- [x] `#/chi-siamo`
- [x] `#/preventivo`
- [x] `#/contatti`

Controlli specifici:
- [x] menu pubblico mobile contiene Home, Servizi, Cantieri, Settori, Chi siamo, Preventivo, Contatti, Area riservata
- [x] header desktop chiaro e link attivi corretti
- [x] footer completo con descrizione, link rapidi, servizi, contatti, CTA preventivo, area riservata
- [x] preventivo pubblico mostra riepilogo dopo invio mock
- [x] contatti pubblici mostrano conferma invio mock

## C. Check area interna

Per ogni pagina interna verificare:
- [x] pagina si apre
- [x] ruolo corretto può accedere
- [x] ruolo non autorizzato viene bloccato
- [x] mobile leggibile
- [x] desktop leggibile
- [x] filtri funzionano dove presenti
- [x] card/tabelle leggibili
- [x] dettagli apribili dove presenti
- [x] stati visualizzati correttamente
- [x] azioni mock funzionano dove presenti
- [x] activity log aggiornato se previsto

Pagine:
- [x] `#/dashboard`
- [x] `#/dashboard/cantieri`
- [x] `#/dashboard/cantieri/:id`
- [x] `#/dashboard/upload`
- [x] `#/dashboard/caricamenti`
- [x] `#/dashboard/documenti`
- [x] `#/dashboard/documenti/:id`
- [x] `#/dashboard/foto`
- [x] `#/dashboard/foto/:id`
- [x] `#/dashboard/preventivi`
- [x] `#/dashboard/preventivi/:id`
- [x] `#/dashboard/contabilita`
- [x] `#/dashboard/contabilita/:id`
- [x] `#/dashboard/dipendenti`

## D. Check ruoli

Admin/capo:
- [x] vede dashboard admin
- [x] vede cantieri
- [x] vede documenti
- [x] vede foto
- [x] vede preventivi
- [x] vede contabilità
- [x] vede dipendenti
- [x] vede importi
- [x] può modificare stati mock
- [x] può approvare foto
- [x] può gestire preventivi

Contabilità:
- [x] vede dashboard contabile
- [x] vede cantieri
- [x] vede documenti
- [x] vede contabilità
- [x] vede movimenti
- [x] vede preventivi se previsto
- [x] vede alert contabili
- [x] può modificare documenti e movimenti
- [x] non vede funzioni inutili da admin se non previste
- [x] non gestisce dipendenti
- [x] non gestisce pubblicazione foto

Dipendente:
- [x] vede dashboard semplice
- [x] vede upload foto/documento
- [x] vede propri caricamenti
- [x] non vede contabilità
- [x] non vede importi
- [x] non vede gestione dipendenti
- [x] non vede dati sensibili
- [x] non cambia stati finali
- [x] non approva foto
- [x] non gestisce preventivi

Accesso non autorizzato:
- [x] mostra pagina “Accesso non autorizzato”
- [x] pulsante “Torna alla dashboard” funziona

## E. Check mobile-first

- [x] menu pubblico mobile funziona
- [x] menu dashboard mobile funziona
- [x] form preventivo comodo da telefono
- [x] form contatti comodo da telefono
- [x] upload dipendente comodo da telefono
- [x] dettagli documento/foto/preventivo leggibili
- [x] contabilità non ha tabelle ingestibili su mobile
- [x] bottoni grandi e selezionabili
- [x] testi leggibili
- [x] nessun elemento sovrapposto
- [x] immagini non deformate
- [x] CTA visibili
- [x] card distanziate correttamente

## F. Check desktop

- [x] layout pubblico ordinato
- [x] layout interno professionale
- [x] sidebar interna leggibile
- [x] header e breadcrumb coerenti
- [x] card allineate
- [x] tabelle chiare
- [x] immagini non deformate
- [x] footer pubblico completo
- [x] dashboard admin utile
- [x] dashboard contabilità utile
- [x] dashboard dipendente semplice

## G. Check dati mock

- [x] dati mock centralizzati
- [x] services/mock store usati dalle pagine principali
- [x] id coerenti tra cantieri, documenti, foto, preventivi, movimenti
- [x] nessun dato duplicato inutilmente
- [x] dashboard calcolate da dati mock dove possibile
- [x] localStorage non rompe il sito
- [x] reset dati demo funziona se presente
- [x] dati mock sufficientemente realistici
- [x] nessun importo evidentemente sbagliato
- [x] nessun dato sensibile reale nel codice

## H. Check documenti

- [x] lista documenti visibile per ruoli autorizzati
- [x] filtri funzionanti
- [x] ricerca funzionante
- [x] dettaglio documento apribile
- [x] cambio stato funzionante
- [x] modifica dati mock funzionante
- [x] alert importi funzionante
- [x] documento senza cantiere evidenziato
- [x] possibile duplicato evidenziato
- [x] note interne funzionanti
- [x] storico attività aggiornato
- [x] dipendente non vede importi/dettagli sensibili

## I. Check foto

- [x] lista/galleria foto funzionante
- [x] filtri funzionanti
- [x] dettaglio foto apribile
- [x] immagine/fallback funzionante
- [x] approvazione foto funzionante
- [x] non pubblicabile funzionante
- [x] pubblicata funzionante
- [x] descrizione pubblica modificabile
- [x] note interne funzionanti
- [x] activity log aggiornato
- [x] dipendente non può approvare/pubblicare

## J. Check preventivi

- [x] lista preventivi funzionante
- [x] filtri stato/urgenza/tipo cliente funzionanti
- [x] dettaglio preventivo apribile
- [x] cambio stato funzionante
- [x] cambio priorità funzionante
- [x] nota interna funzionante
- [x] Contattato funziona
- [x] In attesa cliente funziona
- [x] Accettato funziona
- [x] Rifiutato funziona
- [x] Archiviato funziona
- [x] Converti in cantiere è solo placeholder se presente
- [x] dipendente non vede preventivi completi

## K. Check contabilità

- [x] pagina contabilità visibile solo ad admin/contabilità
- [x] tabella o card movimenti leggibile
- [x] filtri funzionanti
- [x] dettaglio movimento apribile
- [x] modifica movimento mock funzionante
- [x] imponibile + IVA = totale dove previsto
- [x] alert importi incoerenti funzionante
- [x] fattura senza pagamento evidenziata
- [x] bonifico senza fattura evidenziato
- [x] collegamento documento/movimento mock funzionante se presente
- [x] riepilogo per cantiere coerente
- [x] riepilogo per categoria coerente
- [x] formato valuta coerente in euro
- [x] dipendente non vede importi

## L. Check cantieri

- [x] lista cantieri funzionante
- [x] ricerca funzionante
- [x] filtro stato funzionante
- [x] filtro responsabile funzionante
- [x] ordinamento funzionante
- [x] dettaglio cantiere apribile
- [x] tab/sezioni funzionanti
- [x] documenti collegati visibili
- [x] foto collegate visibili
- [x] movimenti/spese visibili solo a ruoli autorizzati
- [x] note cantiere funzionanti
- [x] problemi aperti visibili
- [x] attività recenti visibili
- [x] dipendente vede solo sezioni consentite

## M. Check interazioni mock

- [x] cambio stato documento aggiorna lista e dettaglio
- [x] cambio stato foto aggiorna lista e dettaglio
- [x] cambio stato preventivo aggiorna lista e dettaglio
- [x] aggiunta nota appare nel dettaglio
- [x] activity log registra azioni importanti
- [x] localStorage mantiene modifiche dopo refresh
- [x] reset dati demo ripristina dati iniziali
- [x] nessuna interazione chiama API reali

## N. Check accessibilità base

- [x] immagini con alt text
- [x] label nei form
- [x] contrasto testo sufficiente
- [x] focus visibile
- [x] bottoni con testo chiaro
- [x] link comprensibili
- [x] nessun testo troppo chiaro
- [x] pagine navigabili da tastiera almeno in modo base
- [x] campi obbligatori principali segnalati

## O. Check performance base

- [x] `npm run build` funziona
- [x] niente errori console importanti
- [x] immagini con loading lazy dove sensato
- [x] niente import inutili evidenti
- [x] niente `console.log` inutili
- [x] niente librerie pesanti aggiunte senza motivo
- [x] pagina non troppo lenta in locale
- [x] bundle non esploso senza motivo

## P. Check sicurezza mock / dati sensibili

- [x] nessun dato reale cliente/fornitore/persona nel codice
- [x] nessun documento interno reale in `public`
- [x] nessuna chiave API nel repo
- [x] nessuna configurazione Supabase reale
- [x] area interna è chiaramente mock/frontend
- [x] sito pubblico non espone importi, note interne, problemi interni o contabilità
- [x] dipendente non vede sezioni sensibili

## Q. Check finale prima di Supabase

- [x] tutte le checklist sopra completate
- [x] `docs/MOCK_QA_BUGS.md` non contiene bug Critica
- [x] `docs/MOCK_QA_BUGS.md` non contiene bug Alta non risolti
- [x] `npm run build` pulito
- [x] ruoli verificati manualmente
- [x] mobile verificato manualmente
- [x] sito pubblico approvato
- [x] area interna approvata
- [x] dati mock approvati
- [x] decisione esplicita: pronto per progettazione Supabase
