# PRE_SUPABASE_CHECKLIST.md — EuropaService Hub

Checklist manuale da completare prima di qualunque collegamento a Supabase o dati reali.

Regole del check:
- mantenere il progetto 100% mock
- non inserire dati reali o sensibili
- segnare ogni problema in `docs/MOCK_QA_BUGS.md`
- non passare a Supabase se restano bug critici o alta priorità non risolti

## A. Stato generale progetto

- [ ] `npm install` completato senza errori bloccanti
- [ ] `npm run dev` avvia il progetto
- [ ] `npm run build` termina correttamente
- [ ] Nessun errore console evidente durante navigazione base
- [ ] Sito pubblico raggiungibile da `#/`
- [ ] Area interna raggiungibile da `#/dashboard/login`
- [ ] Progetto ancora 100% mock
- [ ] Nessun Supabase/backend/API reale configurato
- [ ] Nessun upload reale attivo
- [ ] Nessuna IA/OCR/export reale attiva

## B. Check sito pubblico

Per ogni pagina pubblica verificare:
- [ ] pagina si apre
- [ ] layout mobile ok
- [ ] layout desktop ok
- [ ] nessun elemento sovrapposto
- [ ] immagini caricate o fallback funzionante
- [ ] testi leggibili
- [ ] CTA visibili
- [ ] link funzionanti
- [ ] H1 presente e unico
- [ ] SEO base presente
- [ ] nessun dato interno esposto
- [ ] form mock funzionante dove presente

Pagine:
- [ ] `#/`
- [ ] `#/servizi`
- [ ] `#/cantieri`
- [ ] `#/cantieri/:id`
- [ ] `#/settori`
- [ ] `#/chi-siamo`
- [ ] `#/preventivo`
- [ ] `#/contatti`

Controlli specifici:
- [ ] menu pubblico mobile contiene Home, Servizi, Cantieri, Settori, Chi siamo, Preventivo, Contatti, Area riservata
- [ ] header desktop chiaro e link attivi corretti
- [ ] footer completo con descrizione, link rapidi, servizi, contatti, CTA preventivo, area riservata
- [ ] preventivo pubblico mostra riepilogo dopo invio mock
- [ ] contatti pubblici mostrano conferma invio mock

## C. Check area interna

Per ogni pagina interna verificare:
- [ ] pagina si apre
- [ ] ruolo corretto può accedere
- [ ] ruolo non autorizzato viene bloccato
- [ ] mobile leggibile
- [ ] desktop leggibile
- [ ] filtri funzionano dove presenti
- [ ] card/tabelle leggibili
- [ ] dettagli apribili dove presenti
- [ ] stati visualizzati correttamente
- [ ] azioni mock funzionano dove presenti
- [ ] activity log aggiornato se previsto

Pagine:
- [ ] `#/dashboard`
- [ ] `#/dashboard/cantieri`
- [ ] `#/dashboard/cantieri/:id`
- [ ] `#/dashboard/upload`
- [ ] `#/dashboard/caricamenti`
- [ ] `#/dashboard/documenti`
- [ ] `#/dashboard/documenti/:id`
- [ ] `#/dashboard/foto`
- [ ] `#/dashboard/foto/:id`
- [ ] `#/dashboard/preventivi`
- [ ] `#/dashboard/preventivi/:id`
- [ ] `#/dashboard/contabilita`
- [ ] `#/dashboard/contabilita/:id`
- [ ] `#/dashboard/dipendenti`

## D. Check ruoli

Admin/capo:
- [ ] vede dashboard admin
- [ ] vede cantieri
- [ ] vede documenti
- [ ] vede foto
- [ ] vede preventivi
- [ ] vede contabilità
- [ ] vede dipendenti
- [ ] vede importi
- [ ] può modificare stati mock
- [ ] può approvare foto
- [ ] può gestire preventivi

Contabilità:
- [ ] vede dashboard contabile
- [ ] vede cantieri
- [ ] vede documenti
- [ ] vede contabilità
- [ ] vede movimenti
- [ ] vede preventivi se previsto
- [ ] vede alert contabili
- [ ] può modificare documenti e movimenti
- [ ] non vede funzioni inutili da admin se non previste
- [ ] non gestisce dipendenti
- [ ] non gestisce pubblicazione foto

Dipendente:
- [ ] vede dashboard semplice
- [ ] vede upload foto/documento
- [ ] vede propri caricamenti
- [ ] non vede contabilità
- [ ] non vede importi
- [ ] non vede gestione dipendenti
- [ ] non vede dati sensibili
- [ ] non cambia stati finali
- [ ] non approva foto
- [ ] non gestisce preventivi

Accesso non autorizzato:
- [ ] mostra pagina “Accesso non autorizzato”
- [ ] pulsante “Torna alla dashboard” funziona

## E. Check mobile-first

- [ ] menu pubblico mobile funziona
- [ ] menu dashboard mobile funziona
- [ ] form preventivo comodo da telefono
- [ ] form contatti comodo da telefono
- [ ] upload dipendente comodo da telefono
- [ ] dettagli documento/foto/preventivo leggibili
- [ ] contabilità non ha tabelle ingestibili su mobile
- [ ] bottoni grandi e selezionabili
- [ ] testi leggibili
- [ ] nessun elemento sovrapposto
- [ ] immagini non deformate
- [ ] CTA visibili
- [ ] card distanziate correttamente

## F. Check desktop

- [ ] layout pubblico ordinato
- [ ] layout interno professionale
- [ ] sidebar interna leggibile
- [ ] header e breadcrumb coerenti
- [ ] card allineate
- [ ] tabelle chiare
- [ ] immagini non deformate
- [ ] footer pubblico completo
- [ ] dashboard admin utile
- [ ] dashboard contabilità utile
- [ ] dashboard dipendente semplice

## G. Check dati mock

- [ ] dati mock centralizzati
- [ ] services/mock store usati dalle pagine principali
- [ ] id coerenti tra cantieri, documenti, foto, preventivi, movimenti
- [ ] nessun dato duplicato inutilmente
- [ ] dashboard calcolate da dati mock dove possibile
- [ ] localStorage non rompe il sito
- [ ] reset dati demo funziona se presente
- [ ] dati mock sufficientemente realistici
- [ ] nessun importo evidentemente sbagliato
- [ ] nessun dato sensibile reale nel codice

## H. Check documenti

- [ ] lista documenti visibile per ruoli autorizzati
- [ ] filtri funzionanti
- [ ] ricerca funzionante
- [ ] dettaglio documento apribile
- [ ] cambio stato funzionante
- [ ] modifica dati mock funzionante
- [ ] alert importi funzionante
- [ ] documento senza cantiere evidenziato
- [ ] possibile duplicato evidenziato
- [ ] note interne funzionanti
- [ ] storico attività aggiornato
- [ ] dipendente non vede importi/dettagli sensibili

## I. Check foto

- [ ] lista/galleria foto funzionante
- [ ] filtri funzionanti
- [ ] dettaglio foto apribile
- [ ] immagine/fallback funzionante
- [ ] approvazione foto funzionante
- [ ] non pubblicabile funzionante
- [ ] pubblicata funzionante
- [ ] descrizione pubblica modificabile
- [ ] note interne funzionanti
- [ ] activity log aggiornato
- [ ] dipendente non può approvare/pubblicare

## J. Check preventivi

- [ ] lista preventivi funzionante
- [ ] filtri stato/urgenza/tipo cliente funzionanti
- [ ] dettaglio preventivo apribile
- [ ] cambio stato funzionante
- [ ] cambio priorità funzionante
- [ ] nota interna funzionante
- [ ] Contattato funziona
- [ ] In attesa cliente funziona
- [ ] Accettato funziona
- [ ] Rifiutato funziona
- [ ] Archiviato funziona
- [ ] Converti in cantiere è solo placeholder se presente
- [ ] dipendente non vede preventivi completi

## K. Check contabilità

- [ ] pagina contabilità visibile solo ad admin/contabilità
- [ ] tabella o card movimenti leggibile
- [ ] filtri funzionanti
- [ ] dettaglio movimento apribile
- [ ] modifica movimento mock funzionante
- [ ] imponibile + IVA = totale dove previsto
- [ ] alert importi incoerenti funzionante
- [ ] fattura senza pagamento evidenziata
- [ ] bonifico senza fattura evidenziato
- [ ] collegamento documento/movimento mock funzionante se presente
- [ ] riepilogo per cantiere coerente
- [ ] riepilogo per categoria coerente
- [ ] formato valuta coerente in euro
- [ ] dipendente non vede importi

## L. Check cantieri

- [ ] lista cantieri funzionante
- [ ] ricerca funzionante
- [ ] filtro stato funzionante
- [ ] filtro responsabile funzionante
- [ ] ordinamento funzionante
- [ ] dettaglio cantiere apribile
- [ ] tab/sezioni funzionanti
- [ ] documenti collegati visibili
- [ ] foto collegate visibili
- [ ] movimenti/spese visibili solo a ruoli autorizzati
- [ ] note cantiere funzionanti
- [ ] problemi aperti visibili
- [ ] attività recenti visibili
- [ ] dipendente vede solo sezioni consentite

## M. Check interazioni mock

- [ ] cambio stato documento aggiorna lista e dettaglio
- [ ] cambio stato foto aggiorna lista e dettaglio
- [ ] cambio stato preventivo aggiorna lista e dettaglio
- [ ] aggiunta nota appare nel dettaglio
- [ ] activity log registra azioni importanti
- [ ] localStorage mantiene modifiche dopo refresh
- [ ] reset dati demo ripristina dati iniziali
- [ ] nessuna interazione chiama API reali

## N. Check accessibilità base

- [ ] immagini con alt text
- [ ] label nei form
- [ ] contrasto testo sufficiente
- [ ] focus visibile
- [ ] bottoni con testo chiaro
- [ ] link comprensibili
- [ ] nessun testo troppo chiaro
- [ ] pagine navigabili da tastiera almeno in modo base
- [ ] campi obbligatori principali segnalati

## O. Check performance base

- [ ] `npm run build` funziona
- [ ] niente errori console importanti
- [ ] immagini con loading lazy dove sensato
- [ ] niente import inutili evidenti
- [ ] niente `console.log` inutili
- [ ] niente librerie pesanti aggiunte senza motivo
- [ ] pagina non troppo lenta in locale
- [ ] bundle non esploso senza motivo

## P. Check sicurezza mock / dati sensibili

- [ ] nessun dato reale cliente/fornitore/persona nel codice
- [ ] nessun documento interno reale in `public`
- [ ] nessuna chiave API nel repo
- [ ] nessuna configurazione Supabase reale
- [ ] area interna è chiaramente mock/frontend
- [ ] sito pubblico non espone importi, note interne, problemi interni o contabilità
- [ ] dipendente non vede sezioni sensibili

## Q. Check finale prima di Supabase

- [ ] tutte le checklist sopra completate
- [ ] `docs/MOCK_QA_BUGS.md` non contiene bug Critica
- [ ] `docs/MOCK_QA_BUGS.md` non contiene bug Alta non risolti
- [ ] `npm run build` pulito
- [ ] ruoli verificati manualmente
- [ ] mobile verificato manualmente
- [ ] sito pubblico approvato
- [ ] area interna approvata
- [ ] dati mock approvati
- [ ] decisione esplicita: pronto per progettazione Supabase
