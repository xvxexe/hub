# TASKS.md — EuropaService Hub

## Task attuale

Immagini prototipo locali scaricate e collegate al sito pubblico.

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

v0.5.7 — Flussi interni avanzati mock oppure v0.6 — Preparazione Supabase setup

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
- Aggiunti componenti interni riutilizzabili: `DashboardHeader`, `StatCard`, `ActivityFeed`, `WorkflowStepper`, `DataModeBadge`
- Badge di stato centralizzati con colori coerenti per documenti, foto, cantieri, preventivi e priorità
- Dashboard admin/capo migliorata con cantieri attivi, documenti da verificare, foto recenti, preventivi, spese mock, alert, problemi e ultime attività
- Dashboard contabilità migliorata con fatture da verificare, bonifici da collegare, FIR incompleti, duplicati, IVA mock, categorie e attività contabili
- Dashboard dipendente semplificata con scelta cantiere, carica foto, carica documento, nota rapida e soli caricamenti propri
- Aggiunti flussi operativi mock per documenti, foto e preventivi
- Lista cantieri interna migliorata con filtro responsabile, ordinamento e indicatori documenti/foto/spese/problemi
- Dettaglio cantiere interno migliorato con header più chiaro, attività recenti e dati economici nascosti al dipendente
- Pagina caricamenti migliorata con ricerca, filtri e box per documenti da verificare e possibili duplicati
- Pagina accesso negato resa più chiara con pulsante “Torna alla dashboard”
- Nessun Supabase, backend, upload reale, IA, OCR, export o login reale implementato
- Verifiche eseguite: `npm run lint`, `npm run build`

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
