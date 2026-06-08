# Supabase Setup - EuropaService Hub

Ultimo aggiornamento: 2026-06-08

## Scopo

Questo documento raccoglie la configurazione Supabase necessaria per far funzionare correttamente l'Hub EuropaService.

La repo usa Supabase per:

- autenticazione utenti;
- profili e ruoli;
- storage documenti;
- storage foto;
- dati operativi;
- log attività;
- cancellazioni protette tramite tombstone.

## Stato attuale

Stato: IN CORSO / DA VERIFICARE

Nel codice sono già presenti:

- login con email/password;
- ripristino sessione da localStorage;
- lettura profilo utente da tabella `profiles`;
- invito utente tramite Edge Function `invite-user`;
- upload documenti su bucket `documents`;
- upload foto su bucket `site-photos`;
- lettura/scrittura store operativo via REST;
- import/export Google Sheets.

Da verificare lato Supabase:

- tabelle esistenti;
- colonne effettive;
- RLS;
- policy per ogni ruolo;
- bucket Storage;
- Edge Function `invite-user`;
- variabili ambiente;
- permessi per `activity_logs`.

## Variabili ambiente previste

Il codice legge:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_GOOGLE_SHEETS_SYNC_URL=
```

Note:

- `VITE_SUPABASE_ANON_KEY` ha priorità su `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Nel codice esiste un fallback hardcoded per progetto Supabase e chiave publishable.
- Per produzione è meglio usare variabili ambiente reali e ridurre i fallback hardcoded.

## Auth

Flusso attuale:

1. utente inserisce email/password;
2. chiamata REST a `/auth/v1/token?grant_type=password`;
3. sessione salvata in localStorage;
4. lettura profilo da `profiles`;
5. ruolo applicativo letto da `profiles.role`.

Ruoli gestiti dall'app:

- `admin`;
- `accounting`;
- `employee`.

Tabella richiesta:

```text
profiles
```

Campi usati dal codice:

```text
id
email
full_name
role
active
```

## Edge Function inviti

Funzione prevista:

```text
invite-user
```

Endpoint:

```text
/functions/v1/invite-user
```

Payload inviato:

```json
{
  "email": "utente@example.com",
  "full_name": "Nome Cognome",
  "role": "employee"
}
```

Problemi noti da controllare:

- se la funzione non è deployata, il sito mostra errore `Failed to fetch`;
- se RLS o service role sono configurati male, l'invito fallisce;
- serve controllo admin lato funzione, non solo lato frontend.

## Storage

Bucket usati:

```text
documents
site-photos
```

Path generato:

```text
<cantiere>/<data>/<entity>/<nome-file>
```

Esempio:

```text
barcelo-roma/2026-06-08/document-123/fattura-eurofer.pdf
```

Policy Storage da verificare:

- admin può caricare, leggere, eliminare;
- accounting può caricare/leggere documenti;
- employee può caricare foto/documenti assegnati;
- lettura file tramite signed URL;
- eliminazione solo per ruoli autorizzati.

## REST database

Il progetto non usa il client ufficiale Supabase JS. Usa `fetch` diretto verso:

```text
/rest/v1/<table>
```

Questo significa che:

- le policy RLS devono essere corrette;
- gli header `apikey` e `Authorization` devono essere sempre presenti;
- gli errori Supabase vanno letti dal payload REST.

## Checklist verifica Supabase

- [ ] Progetto Supabase corretto.
- [ ] URL Supabase configurato.
- [ ] Publishable/anon key configurata.
- [ ] Tabella `profiles` presente.
- [ ] Ogni utente auth ha profilo collegato.
- [ ] Ruoli coerenti: `admin`, `accounting`, `employee`.
- [ ] RLS attiva sulle tabelle operative.
- [ ] Policy testate per ogni ruolo.
- [ ] Bucket `documents` presente.
- [ ] Bucket `site-photos` presente.
- [ ] Signed URL funzionanti.
- [ ] Edge Function `invite-user` deployata.
- [ ] Import Google Sheets testato.
- [ ] Export Google Sheets testato.
- [ ] Insert `activity_logs` funzionante.

## Azione operativa successiva

Creare o aggiornare `DATABASE_SCHEMA.md` con lo schema effettivo delle tabelle e confrontarlo con il codice.
