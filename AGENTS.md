# AGENTS.md — EuropaService Hub

## Obiettivo

EuropaService Hub è una piattaforma per un'impresa edile/cartongesso.

Il progetto deve avere due parti:

1. Sito pubblico per clienti
2. Area interna per capo, contabilità e dipendenti

## Regola principale

Non costruire funzionalità a caso.

Prima di modificare codice, leggere:
- PROJECT_BRIEF.md
- ROADMAP.md
- TASKS.md

Lavorare sempre a piccoli step.

## Stack

- React + Vite
- Mobile-first
- UI professionale, chiara, non giocattolosa
- Futuro backend: Supabase
- Futuro storage file: Supabase Storage
- Futura IA: classificazione documenti e foto

Per ora:
- non collegare backend reale
- non implementare Supabase
- non implementare IA reale
- usare dati mock
- mantenere codice ordinato

## Parte pubblica

Pagine previste:
- Home
- Servizi
- Cantieri
- Dettaglio cantiere
- Richiesta preventivo
- Contatti

## Area interna

Pagine previste:
- Login mock
- Dashboard
- Cantieri
- Documenti
- Foto cantiere
- Preventivi
- Contabilità
- Dipendenti

## Ruoli

Admin/capo:
- vede tutto

Contabilità:
- vede cantieri, documenti, contabilità, preventivi e report

Dipendente:
- può caricare foto, documenti e note
- vede solo ciò che gli serve

## Design

Stile:
- professionale
- azienda edilizia/cartongesso
- layout pulito
- niente animazioni inutili
- testi leggibili
- responsive mobile e desktop

Colori:
- bianco
- grigio chiaro
- antracite
- blu scuro
- rame/arancio come accento

## Regole tecniche

- Non rompere navigazione esistente
- Non cambiare UI approvata se non richiesto
- Non duplicare componenti inutilmente
- Creare componenti riutilizzabili
- Usare dati mock centralizzati
- Aggiornare TASKS.md quando si completa una fase

## Prima di ogni task

1. Leggere AGENTS.md
2. Leggere PROJECT_BRIEF.md
3. Leggere ROADMAP.md
4. Leggere TASKS.md
5. Spiegare brevemente cosa verrà fatto
6. Modificare solo ciò che serve
