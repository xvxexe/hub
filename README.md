# EuropaService Hub

Hub operativo per EuropaService: sito pubblico + area privata per cantieri, documenti, foto, contabilità, preventivi e gestione operativa base.

## Stato sviluppo aggiornato

La repo è nella fase **MVP interno avanzato**.

Stato corretto rispetto alla timeline:

- **Fase 1 — Sito pubblico MVP:** quasi completata.
- **Fase 2 — Area privata MVP:** in gran parte completata.
- **Fase 3 — Contabilità operativa:** in corso.
- **Fase 4 — Dipendenti:** parziale.
- **Fase 5 — PWA / uso mobile in cantiere:** da completare.
- **Fase 6 — Magazzino / attrezzature:** non ancora implementata come modulo reale.
- **Fase 7 — Sicurezza, produzione e documentazione:** in corso, ma non ancora chiusa.

Dettaglio operativo: vedere [`DEVELOPMENT_STATUS.md`](./DEVELOPMENT_STATUS.md).

## Stack

- Vite
- React
- CSS modulare per sito pubblico e area interna
- Supabase via REST/fetch manuale
- Supabase Auth
- Supabase Storage
- Google Sheets sync tramite Apps Script
- Deploy previsto su GitHub Pages con base `/hub/`

## Script

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Moduli presenti

### Sito pubblico

- Home
- Servizi
- Progetti / cantieri pubblici
- Settori
- Chi siamo
- Richiesta preventivo
- Contatti
- Modalità scura pubblica
- Header/footer responsive

### Area privata

- Login
- Dashboard
- Cantieri
- Upload
- Caricamenti
- Documenti
- Archivio Drive Docs
- Foto
- Preventivi
- Contabilità
- Report
- Dipendenti
- Impostazioni

### Ruoli

- Admin / Capo
- Contabile
- Dipendente

## Stato dati

Il progetto usa ancora una struttura ibrida:

- dati reali da Supabase operativo;
- fallback legacy/localStorage;
- alcune pagine e nomi file mantengono ancora il suffisso `Mock`, anche quando usano flussi reali;
- Google Sheets resta fonte/sync importante, ma il flusso non è ancora blindato per produzione.

## Priorità prossime

1. Stabilizzare Supabase: schema, RLS, bucket, Edge Function e variabili ambiente documentate.
2. Rafforzare la contabilità: controlli imponibile/IVA/totale, duplicati, tab lavorazioni e collegamento documento-spesa.
3. Rinominare o chiarire i componenti `Mock` ancora presenti.
4. Completare modulo dipendenti reale.
5. Preparare PWA/mobile cantiere.
6. Pianificare modulo magazzino/attrezzature.

## Note operative

Non considerare il progetto pronto produzione finché non sono verificati:

- policy Supabase/RLS;
- inviti utenti;
- upload Storage;
- import/export Google Sheets;
- coerenza totali contabili;
- comportamento mobile;
- documentazione tecnica minima.
