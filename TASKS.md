# TASKS.md — EuropaService Hub

## Task attuale

Ruoli mock v0.2 completati.

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
