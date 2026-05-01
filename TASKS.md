# TASKS.md — EuropaService Hub

## Task attuale

v0.5.11 completata: secondo check finale mock pre-Supabase.

## Da fare ora

- [x] Creare struttura cartelle
- [x] Creare dati mock
- [x] Creare layout pubblico
- [x] Creare layout area interna
- [x] Creare navigazione funzionante
- [x] Creare pagine pubbliche
- [x] Creare pagine dashboard
- [x] Rendere responsive mobile/desktop
- [x] Controllare errori console

## Da non fare ora

- [ ] Non collegare Supabase
- [ ] Non creare login reale
- [ ] Non creare upload reale
- [ ] Non implementare IA
- [ ] Non creare PDF
- [ ] Non creare export Excel

## Completato in v0.1

- Struttura cartelle creata in `src/components`, `src/pages/public`, `src/pages/dashboard`, `src/data`, `src/lib`, `src/styles`
- Sito pubblico mock con Home, Servizi, Cantieri, Dettaglio cantiere, Preventivo e Contatti
- Area interna mock con Dashboard, Cantieri, Documenti, Foto cantiere, Preventivi, Contabilita e Dipendenti
- Navigazione funzionante tramite hash route
- Dati mock centralizzati in `src/data/mockData.js`
- Layout mobile-first con stile professionale edilizia/cartongesso
- Verifiche eseguite: `npm run build`, `npm run lint`

## Completato in v0.2

- Aggiunti ruoli mock: admin/capo, contabilità, dipendente
- Aggiunto login mock per l'area interna
- Aggiunto selettore ruolo solo sviluppo nella sidebar dashboard
- Menu dashboard filtrato in base al ruolo selezionato
- Admin vede tutte le sezioni interne
- Contabilità vede dashboard, cantieri, documenti, preventivi e contabilità
- Dipendente vede dashboard, cantieri, documenti e foto cantiere
- Nessun backend reale, Supabase o autenticazione reale implementati
- Verifiche eseguite: `npm run build`, `npm run lint`

## Completato in v0.3

- Creato dataset centralizzato `src/data/mockCantieri.js`
- Aggiunti almeno 5 cantieri realistici: Barcelo Roma, Residenza Verdi, Negozio Centro, Hotel Interno Milano, Condominio Bianchi
- Creata lista cantieri interna con ricerca per nome/cliente/localita
- Aggiunto filtro stato: attivo, completato, sospeso, da avviare
- Ogni card mostra nome, cliente, localita, stato, responsabile, data inizio, avanzamento, documenti, foto e spese mock
- Creata pagina dettaglio cantiere interno
- Dettaglio con intestazione, dati principali, avanzamento, riepilogo economico, foto, documenti, spese, note e problemi
- Aggiunte sezioni dettaglio: Panoramica, Foto, Documenti, Spese, Note, Problemi
- Dashboard collegata alla lista cantieri
- Lista cantieri collegata al dettaglio singolo
- Nessun backend reale, Supabase, upload reale o IA reale implementati
- Verifiche eseguite: `npm run lint`, `npm run build`

## Prossima fase

v0.6 — Preparazione Supabase setup

## Completato in v0.5.5c

- Sito pubblico riscritto con tono più professionale, concreto e orientato a fiducia, precisione, organizzazione e qualità delle finiture
- Home migliorata con hero forte, micro-frasi di fiducia, servizi principali, motivi di scelta, metodo in 4 step, cantieri, settori serviti e CTA finale
- Pagina Servizi ampliata con 10 servizi completi: descrizione, approfondimento, quando serve, vantaggi, esempi, immagine e CTA
- Pagina Cantieri migliorata con introduzione professionale, filtri, card progetto più ricche, immagini, lavorazioni, tipo cliente, stato, località e CTA dettaglio
- Dettaglio cantiere pubblico trasformato in scheda portfolio con hero, informazioni principali, obiettivo, lavorazioni, fasi, galleria, risultato finale e CTA
- Pagina Settori rafforzata per privati, aziende, hotel, negozi, studi tecnici, general contractor e amministratori immobiliari
- Pagina Chi siamo riscritta con metodo, lavoro in cantiere, ordine, documentazione, qualità delle finiture, collaborazione e valori aziendali
- Pagina Preventivo ampliata con spiegazioni, form completo, allegato foto mock, preferenza contatto, consenso, riepilogo richiesta e FAQ
- Pagina Contatti migliorata con schede contatto, modulo, sopralluogo, zone servite, orari e CTA preventivo
- Aggiunto componente SEO base per title e meta description delle pagine pubbliche
- Footer pubblico completato con descrizione, link rapidi, servizi principali, contatti, CTA preventivo e area riservata
- Continuato uso di dati mock, immagini locali e SafeImage con fallback
- Nessun Supabase, backend reale, IA reale o upload reale implementato
- Area interna, ruoli, cantieri, upload, caricamenti e contabilità non modificati nella logica

## Completato in v0.2.1

- Creata configurazione centralizzata ruoli in `src/lib/roles.js`
- Definiti ruoli disponibili, label, permessi mock, pagine accessibili e menu per ruolo
- Separato menu admin/capo, contabilità e dipendente
- Admin/capo vede tutte le sezioni interne, inclusa Impostazioni mock
- Contabilità vede solo dashboard, cantieri, documenti, upload documenti, caricamenti documenti, preventivi e contabilità
- Dipendente vede solo dashboard semplice, upload e i miei caricamenti
- Aggiunta pagina mock "Accesso non autorizzato" per route non consentite
- Aggiornata dashboard con viste differenziate per admin, contabilità e dipendente
- Reso più chiaro il selettore ruolo come "Modalità sviluppo: scegli ruolo"
- Nessun Supabase, backend, login reale, sicurezza server-side o database reale implementato
- Verifiche eseguite: `npm run lint`, `npm run build`

## Completato in v0.4

- Creata pagina `#/dashboard/upload`
- Creata pagina `#/dashboard/caricamenti`
- Aggiunti dati mock centralizzati in `src/data/mockUploads.js`
- Aggiunto upload foto mock con cantiere, zona, lavorazione, avanzamento, file, nota, pubblicabilita, autore, data automatica e stato da revisionare
- Aggiunto upload documenti mock con cantiere, tipo documento, fornitore, data documento, importo, file, nota, autore, data automatica e stato da verificare
- Aggiunta lista foto caricate di recente
- Aggiunta lista documenti caricati di recente
- Aggiunti filtri caricamenti per cantiere, tipo e stato
- Collegati caricamenti mock alle sezioni Foto e Documenti del dettaglio cantiere
- Aggiornata navigazione dashboard con Upload e Caricamenti in base ai ruoli
- Mantenuta logica ruoli: admin completo, contabilità orientata ai documenti, dipendente con schermata più semplice
- Nessun backend reale, Supabase, upload reale, IA, OCR, PDF o export implementato
- Verifiche eseguite: `npm run lint`, `npm run build`

## Completato in v0.5

- Creato dataset centralizzato `src/data/mockMovimentiContabili.js`
- Inseriti movimenti contabili mock per Barcelo Roma, Residenza Verdi, Negozio Centro, Hotel Interno Milano e Condominio Bianchi
- Aggiunte categorie standard: Materiali, Manodopera, Non materiali, Extra / Altro, Vitto, Alloggi, FIR / Rifiuti, Bonifici / Pagamenti, Noleggi / Servizi
- Aggiunti tipi documento, stati verifica e metodi pagamento mock
- Creata pagina `#/dashboard/contabilita` per admin/capo e contabilità
- Aggiunti filtri per cantiere, categoria, stato verifica, tipo documento e ricerca
- Aggiunte card riepilogo: imponibile, IVA, totale, documenti da verificare, duplicati e bonifici/pagamenti
- Aggiunta tabella movimenti desktop e card responsive mobile
- Aggiunto riepilogo per cantiere con breakdown categorie
- Aggiunto riepilogo spese per categoria
- Aggiunti controlli contabili mock derivati dai dati
- Collegati i movimenti contabili alla sezione Spese del dettaglio cantiere
- Dipendente non vede contabilità, importi o riepiloghi economici
- Nessun Supabase, backend, upload reale, IA, OCR, pagamenti reali, PDF o export implementato
- Verifiche eseguite: `npm run lint`, `npm run build`, validazione imponibile + IVA = totale

## Completato in v0.5.5

- Home pubblica ampliata con hero, CTA, servizi, cantieri, motivi di scelta, numeri mock, processo, settori e testimonianze mock
- Pagina Servizi completata con card dettagliate e CTA preventivo
- Pagina Cantieri pubblica migliorata con filtri, card portfolio e dati pubblicabili
- Dettaglio cantiere pubblico aggiornato senza spese, documenti interni, note interne o problemi
- Pagina Preventivo ampliata con form mock completo e riepilogo conferma
- Pagina Contatti ampliata con recapiti, WhatsApp, zone, orari, sopralluogo e form mock
- Creata pagina Chi siamo
- Creata pagina Settori
- Navigazione pubblica aggiornata con Home, Servizi, Cantieri, Settori, Chi siamo, Preventivo, Contatti e Area riservata
- Aggiunti dati pubblici centralizzati in `src/data/mockPublicServices.js`, `src/data/mockPublicProjects.js`, `src/data/mockSectors.js`
- Aggiunti componenti pubblici riutilizzabili in `src/components/PublicComponents.jsx`
- Nessun backend reale, Supabase, IA o upload reale implementato
- Area interna, ruoli, cantieri, upload e contabilità mantenuti funzionanti
- Verifiche eseguite: `npm run lint`, `npm run build`

## Completato in v0.5.6

- Migliorata struttura area interna con topbar, breadcrumb, header gestionali e indicatore dati mock
- Aggiunta navigazione mobile interna tramite selettore “Vai a” basato sul ruolo corrente
- Aggiunti/migliorati componenti interni riutilizzabili: `DashboardHeader`, `StatCard`, `ActivityFeed`, `WorkflowStepper`, `DataModeBadge`, `QuickActionCard`, `AlertPanel`
- Badge di stato centralizzati con colori coerenti per documenti, foto, cantieri, preventivi, priorità e stato “Contattato”
- Dashboard admin/capo migliorata con cantieri attivi, documenti da verificare, foto recenti, preventivi, spese mock, alert, problemi e ultime attività
- Dashboard admin/capo ampliata con collegamenti rapidi a cantieri, caricamenti, preventivi e contabilità
- Dashboard contabilità migliorata con fatture da verificare, bonifici da collegare, FIR incompleti, duplicati, IVA mock, categorie, attività e alert contabili
- Dashboard dipendente semplificata con scelta cantiere, carica foto, carica documento, nota rapida e soli caricamenti propri
- Aggiunti flussi operativi mock per documenti, foto e preventivi
- Lista cantieri interna migliorata con ricerca, filtro stato, filtro responsabile, ordinamento per avanzamento/data e indicatori documenti/foto/spese/problemi
- Dettaglio cantiere interno migliorato con header più chiaro, sezioni ordinate, tab attività recenti e dati economici nascosti al dipendente
- Creata pagina documenti interna dedicata con filtri per cantiere, tipo, stato, ricerca, riepiloghi, alert e lista mobile-friendly
- Pagina caricamenti migliorata con ricerca, filtri e box per documenti da verificare e possibili duplicati
- Pagina contabilità migliorata con empty state, filtri, riepiloghi, alert, tabella desktop e card mobile
- Pagina accesso negato resa più chiara con pulsante “Torna alla dashboard”
- Nessun Supabase, backend, upload reale, IA, OCR, export o login reale implementato
- Verifiche eseguite: `npm run lint`, `npm run build`

## Completato in v0.5.7

- Creato store mock centralizzato `src/hooks/useMockStore.js` con localStorage, reset sviluppo, documenti, foto, preventivi, note e attività recenti
- Aggiunte funzioni mock per aggiornare stati e dati di documenti, foto e preventivi
- Aggiunte note interne mock per documento, foto, preventivo e cantiere
- Aggiunto storico attività centralizzato per cambi stato, modifiche e note
- Creata pagina dettaglio documento `#/dashboard/documenti/:id` con modifica dati, cambio stato, controlli importi, note e timeline
- Creata pagina foto interattiva e dettaglio foto `#/dashboard/foto/:id` con approvazione, pubblicabilità, pubblicazione mock, note e timeline
- Creata pagina preventivi interattiva e dettaglio preventivo `#/dashboard/preventivi/:id` con cambio stato, priorità, note e placeholder conversione cantiere
- Lista documenti resa interattiva con pulsante Apri, azioni rapide, filtri rapidi e alert importi da controllare
- Lista foto resa interattiva con filtri stato/cantiere/pubblicabilità e azioni rapide per admin
- Lista preventivi resa interattiva con filtri stato, urgenza, tipo cliente e azioni rapide
- Dettaglio cantiere collegato ai dettagli documento/foto, con note mock e attività recenti
- Ruoli rispettati: admin modifica tutto, contabilità gestisce documenti/contabilità, dipendente vede solo ciò che è consentito e non vede contabilità/importi
- Nessun Supabase, backend, login reale, upload reale, IA, OCR, export, email o notifiche reali implementati
- Verifiche eseguite: `npm run lint`, `npm run build`, controllo route/permessi mock e render headless

## Completato in v0.5.8

- Rifinita UX mobile-first generale con focus su bottoni, azioni, overflow testuale, tabelle e card dati
- Migliorata coerenza visuale di bottoni, stati, focus accessibile, azioni rapide e layout dettagli
- Aggiunta route dettaglio movimento contabile `#/dashboard/contabilita/:id`, collegata ai documenti/movimenti mock
- Aggiunti link “Apri” ai movimenti contabili desktop e mobile
- Verificati e mantenuti ruoli mock: admin completo, contabilità su documenti/contabilità/preventivi, dipendente senza contabilità/importi
- Rafforzata leggibilità mobile di documenti, foto, preventivi, contabilità e dettagli interattivi
- Aggiornata ROADMAP con blocco Supabase fino a check manuale completo v0.5.9
- Nessun Supabase, backend reale, login reale, upload reale, IA, OCR, export o notifiche reali implementati
- Verifiche eseguite: `npm run lint`, `npm run build`, controllo route/permessi mock e smoke test browser headless

## Completato in v0.5.9

- Creata documentazione QA pre-Supabase in `docs/PRE_SUPABASE_CHECKLIST.md`
- Creata tabella bug QA in `docs/MOCK_QA_BUGS.md`
- Creato script operativo di test manuale in `docs/MANUAL_TEST_SCRIPT.md`
- Documentati controlli su sito pubblico, area interna, ruoli, mobile, desktop, dati mock, documenti, foto, preventivi, contabilità, cantieri, accessibilità, performance e sicurezza mock
- Aggiornata ROADMAP con condizioni obbligatorie per mantenere Supabase bloccato finché il mock non è verificato
- Nessun Supabase, backend reale, login reale, upload reale, IA, OCR, export o notifiche reali implementati
- Verifiche eseguite: `npm run build`

## Completato in v0.5.10

- Corretti i permessi mock nel dettaglio foto: il dipendente può modificare solo la nota delle proprie foto ancora da revisionare
- Bloccata la modifica dipendente di zona, lavorazione, pubblicabilità e descrizione pubblica foto
- Nascosto al dipendente l'alert di incoerenza importi nel dettaglio documento
- Limitata l'aggiunta note dipendente ai propri documenti/foto ancora in stato iniziale di verifica o revisione
- Corretti i pulsanti di ritorno nei dettagli documento/foto per il ruolo dipendente, evitando link verso liste non autorizzate
- Resa coerente l'approvazione foto mock: una foto approvata non resta marcata come pubblicata
- Agganciati riepiloghi, alert e totali contabili della dashboard ai documenti dello store mock modificabile
- Aggiornato `docs/MOCK_QA_BUGS.md` con i bug corretti
- Nessun Supabase, backend reale, login reale, upload reale, IA, OCR, export o notifiche reali implementati
- Verifiche eseguite: `npm run lint`, controllo permessi mock, `npm run build`

## Completato in v0.5.11

- Eseguito secondo check finale mock pre-Supabase
- Verificata build produzione con `npm run build`
- Verificato lint con `npm run lint`
- Verificato che non risultano Supabase, backend reale, login reale, upload reale, IA, OCR o export reale implementati
- Verificate route pubbliche e interne principali
- Verificata matrice ruoli mock per admin/capo, contabilità e dipendente
- Verificati store mock, localStorage, reset dati demo, note interne e activity log
- Verificata coerenza ID tra cantieri, documenti, foto e movimenti
- Verificate immagini pubbliche e fallback locali
- Eseguiti smoke test browser headless mobile/desktop sulle pagine pubbliche principali
- Aggiornata `docs/PRE_SUPABASE_CHECKLIST.md`
- Aggiornato `docs/MOCK_QA_BUGS.md`
- Creato `docs/PRE_SUPABASE_VERDICT.md`
- Verdetto: `PRONTO PER v0.6 SUPABASE SETUP`

## Completato — Fix sito pubblico navbar e immagini

- Fix navbar pubblica responsive e immagini card/fallback completato
- Aggiunto menu hamburger mobile per la navigazione pubblica
- Riorganizzata la navbar desktop con voce Azienda e sottomenu per Settori e Chi siamo
- Rimossa la navigazione pubblica con scrollbar orizzontale
- Migliorate card servizi/settori con immagine pulita in alto e corpo contenuto separato
- Migliorato `SafeImage` con fallback neutro e gestione errori senza sfondi rossi
- Sostituiti i riferimenti agli asset prototipo che mostravano sfondi rossi nelle card pubbliche
- Rimossa la barra orizzontale dalla navigazione mobile/tablet dell'area riservata
- Rifinito il layout servizi su viewport intermedie per evitare colonne strette e composizioni sbilanciate
- Rese interattive le righe mock che sembrano cliccabili in dashboard, alert, attività, caricamenti e riepiloghi contabili
- Sistemato il layout “Foto recenti / Documenti recenti” evitando colonne vuote e aggiungendo empty state coerenti
- Aggiunto focus/hover chiaro alle card operative cliccabili senza duplicare azioni o introdurre backend reale
- Rifinita la lista cantieri interna con card più leggibili, metriche compatte e griglia meno caotica
- Allineate in alto le liste e le griglie operative con colonne di altezza diversa, inclusi caricamenti foto/documenti
- Limitate le liste recenti a 3 elementi iniziali con pulsante mock “Mostra altri” per caricare il resto
- Nessun Supabase, backend reale, login reale o nuova funzionalità grande implementati

## Pre-Supabase checklist

- [x] Sito pubblico mock ok
- [x] Area interna mock ok
- [x] Ruoli mock ok
- [x] Mobile-first ok per check manuale
- [x] Build ok
- [x] Dati mock centralizzati e modificabili ok
- [x] Nessun dato sensibile interno esposto nel sito pubblico
- [x] Interazioni mock documenti/foto/preventivi ok
- [x] Secondo check finale mock v0.5.11 completato prima di Supabase

## Completato — Asset pubblici e documenti pubblici

- Creata struttura cartelle `public/assets/images` per hero, servizi, cantieri, settori, team e placeholder
- Creata struttura cartelle `public/assets/documents` per documenti pubblici azienda, download ed esempi
- Aggiunti README per regole immagini stock e documenti pubblici
- Creati placeholder SVG locali professionali per hero, servizi, cantieri, settori e documenti
- Creato script `scripts/download-prototype-images.mjs` per scaricare immagini prototipo da LoremFlickr con fallback Picsum
- Aggiunto script npm `npm run download:prototype-images`
- Scaricate immagini prototipo locali in `public/assets/images`
- Creato registro immagini in `src/data/publicImages.js`
- Creato registro documenti pubblici in `src/data/publicDocuments.js`
- Aggiornati dati pubblici di servizi, cantieri e settori con image, imageAlt, seoTitle e seoDescription
- Creato componente `SafeImage` con fallback locale e alt text obbligatorio
- Collegate immagini locali alle pagine pubbliche: Home, Servizi, Cantieri, Dettaglio cantiere, Settori, Chi siamo, Preventivo e Contatti
- Aggiunta sezione “Documenti utili” nella pagina Chi siamo
- Sito pronto per usare immagini stock locali salvate in `public/assets/images`
- Documenti interni esclusi dalla cartella `public`
- Nessun Supabase, backend, upload reale, IA o gestione documenti interni reali implementata
- Verifiche eseguite: `npm run download:prototype-images`, `npm run lint`, `npm run build`
