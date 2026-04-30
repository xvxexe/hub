# TASKS.md — EuropaService Hub

## Task attuale

Pulizia ruoli mock v0.2.1 completata.

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

v0.5 — Contabilità mock per cantiere

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
