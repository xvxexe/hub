# MOCK_QA_BUGS.md — Registro bug QA mock

Usare questo file durante il check manuale pre-Supabase.

Gravità ammesse:
- Critica
- Alta
- Media
- Bassa

Stati ammessi:
- Da verificare
- Da correggere
- Corretto
- Rimandato

| ID | Area | Pagina | Problema | Gravità | Stato | Note |
|---|---|---|---|---|---|---|
| BUG-001 | Ruoli / Foto e documenti | `#/dashboard/foto/:id`, `#/dashboard/documenti/:id` | Il dipendente poteva salvare campi foto non consentiti e vedere un alert economico documento non necessario al suo ruolo. | Alta | Corretto | Il dettaglio foto ora consente al dipendente solo la modifica della nota sulle proprie foto ancora “Da revisionare”; metadati/pubblicazione restano admin e gli alert importi sono nascosti al dipendente. |
| BUG-002 | Navigazione ruoli | `#/dashboard/documenti/:id`, `#/dashboard/foto/:id` | Il pulsante di ritorno nei dettagli aperti dal dipendente poteva puntare a liste non autorizzate. | Media | Corretto | Per il dipendente il ritorno dai dettagli documento/foto porta a `#/dashboard/caricamenti`. |
| BUG-003 | Interazioni mock / Dashboard | `#/dashboard`, `#/dashboard/foto/:id` | Alcuni riepiloghi contabili della dashboard derivavano dai movimenti statici e l’approvazione di una foto già pubblicata poteva lasciare il flag `pubblicata` incoerente. | Media | Corretto | Dashboard admin/contabilità ora calcolano totali e alert dai documenti dello store mock; `approvePhoto` riporta `pubblicata` a `false`. |

## Esito secondo check finale v0.5.11

- Data controllo: 2026-05-01
- Bug Critica aperti: 0
- Bug Alta aperti: 0
- Nuovi bug bloccanti trovati: nessuno
- Note: build e lint puliti; controlli route/ruoli/dati mock eseguiti; smoke test browser headless su pagine pubbliche principali completato senza crash o layout bloccanti.

## Note operative

- Un bug Critica blocca Supabase.
- Un bug Alta normalmente blocca Supabase, salvo decisione esplicita.
- Bug Media/Bassa possono essere corretti in `v0.5.10` o rimandati se non bloccanti.
- Per bug di ruolo indicare sempre ruolo attivo: Admin/capo, Contabilità o Dipendente.
- Per bug mobile indicare viewport o dispositivo usato.
