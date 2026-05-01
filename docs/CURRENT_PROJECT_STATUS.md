# CURRENT_PROJECT_STATUS.md — EuropaService Hub

Aggiornato: 2026-05-01

## Fase attuale stimata

Il progetto ha completato il secondo check finale mock:

- `v0.5.7 Interazioni mock avanzate`: completata
- `v0.5.8 Rifinitura mobile-first generale e controllo qualità`: completata per stato documentato e controlli codice base
- `v0.5.9 Check manuale completo pre-Supabase`: completata
- `v0.5.10 Correzione bug emersi dal check manuale`: completata secondo `TASKS.md`, `ROADMAP.md` e registro QA
- `v0.5.11 Secondo check finale mock pre-Supabase`: completata

Fase corrente operativa consigliata: `v0.6 — Preparazione Supabase setup`.

Supabase può essere preparato solo seguendo `docs/PRE_SUPABASE_VERDICT.md` e senza migrazioni massive non pianificate.

Nota post-check: dopo il verdetto v0.5.11 sono state eseguite rifiniture mock mirate su navbar pubblica, immagini/fallback, layout area interna e liste recenti. Il progetto resta 100% frontend mock.

## Cosa è completato

- Sito pubblico mock con Home, Servizi, Cantieri, dettaglio cantiere, Settori, Chi siamo, Preventivo e Contatti.
- Area interna mock con dashboard, cantieri, documenti, foto, preventivi, contabilità, caricamenti, upload, dipendenti e impostazioni mock.
- Ruoli mock configurati in `src/lib/roles.js`: admin/capo, contabilità e dipendente.
- Route protette lato frontend mock tramite `canAccessDashboardPath`.
- Store mock centralizzato in `src/hooks/useMockStore.js` con localStorage, reset dati demo, documenti, foto, preventivi, note e activity log.
- Dettaglio documento con cambio stato, modifica dati mock, note e timeline.
- Dettaglio foto con approvazione/pubblicazione mock, pubblicabilità, note e timeline.
- Dettaglio preventivo con cambio stato, priorità, note e placeholder conversione cantiere.
- Dettaglio movimento contabile tramite route `#/dashboard/contabilita/:id`, riusando il dettaglio documento.
- Documentazione QA pre-Supabase presente:
  - `docs/PRE_SUPABASE_CHECKLIST.md`
  - `docs/MOCK_QA_BUGS.md`
  - `docs/MANUAL_TEST_SCRIPT.md`
- Build produzione verificata con successo: `npm run build`.
- Verdetto finale creato in `docs/PRE_SUPABASE_VERDICT.md`: `PRONTO PER v0.6 SUPABASE SETUP`.
- Navbar pubblica resa responsive con menu hamburger mobile e sottomenu desktop per Azienda.
- Immagini pubbliche e fallback resi neutri, senza riquadri rossi o placeholder prototipo visibili.
- Liste recenti foto/documenti rese più compatte: 3 elementi iniziali e pulsante mock “Mostra altri”.
- Card cantieri interne rese più leggibili con griglia meno densa e metriche compatte.
- Righe operative, alert e card recenti rese cliccabili quando puntano a dettagli mock esistenti.
- Griglie operative allineate in alto per evitare colonne sbilanciate quando una lista ha più elementi dell’altra.

## Cosa manca

- Preparare un piano tecnico v0.6 prima di collegare Supabase.
- Definire mapping dati mock verso tabelle reali.
- Mantenere il mock funzionante durante ogni passo di transizione.

## Problemi trovati

- Nessun errore build trovato.
- Nessun collegamento Supabase/API reale rilevato nei controlli testuali.
- Nessun OCR, IA, export Excel/PDF reale rilevato.
- Il registro `docs/MOCK_QA_BUGS.md` contiene solo bug già segnati come `Corretto`.
- Nessun bug Critica o Alta aperto.
- Rifiniture UI successive al check già registrate in `TASKS.md`.

## Prossima fase consigliata

Eseguire `v0.6 — Preparazione Supabase setup`.

Questa fase deve partire con progettazione e setup controllato. Non va sostituito il mock in blocco senza piano.

## Blocco Supabase

Supabase non è più bloccato dal check mock, ma resta vincolato al verdetto e a un piano tecnico esplicito.

Condizioni minime prima di sbloccarlo:

- checklist pre-Supabase completata manualmente
- nessun bug Critica
- nessun bug Alta non approvato esplicitamente
- build pulita
- ruoli verificati
- mobile verificato
- interazioni mock verificate
- `docs/PRE_SUPABASE_VERDICT.md` con verdetto `PRONTO PER v0.6 SUPABASE SETUP`

## Checklist breve prima del prossimo step

- [ ] Definire piano v0.6 prima di creare configurazioni reali
- [ ] Mappare dati mock verso entità Supabase
- [ ] Decidere strategia auth/storage/database
- [ ] Tenere il mock stabile durante la preparazione
- [ ] Rieseguire `npm run build` dopo ogni micro-step
