# Database Schema - EuropaService Hub

Ultimo aggiornamento: 2026-06-08

## Scopo

Questo file documenta lo schema dati atteso dal codice dell'Hub EuropaService.

Non è ancora una migrazione SQL ufficiale.
È una mappa tecnica per confrontare il database Supabase reale con il codice.

## Stato

Stato: BOZZA OPERATIVA / DA VERIFICARE CON SUPABASE

Il codice legge e scrive queste tabelle:

- `profiles`
- `cantieri`
- `documents`
- `accounting_movements`
- `photos`
- `estimates`
- `notes`
- `activity_logs`
- `deleted_records`
- `master_sheet_tabs`
- legacy/fallback: `app_store` o store remoto equivalente

---

# profiles

Uso: profili utente e ruoli applicativi.

Campi usati dal codice:

```text
id
email
full_name
role
active
```

Regole operative:

- `id` deve corrispondere all'utente Supabase Auth.
- `role` deve essere uno tra `admin`, `accounting`, `employee`.
- `active=false` blocca accesso applicativo.

---

# cantieri

Uso: cantieri operativi.

Campi usati dal codice:

```text
id
nome
cliente
localita
indirizzo
stato
avanzamento
responsabile_id
metadata
created_at
updated_at
```

Note:

- se un documento non ha cantiere, il codice usa fallback `barcelo-roma`;
- `metadata` può contenere origine import, master ufficiale e conversioni da preventivo.

---

# documents

Uso: documenti contabili e operativi.

Campi attesi:

```text
id
cantiere_id
tipo_documento
fornitore
descrizione
numero_documento
data_documento
categoria
imponibile
iva
totale
pagamento
stato_verifica
stato
file_name
storage_path
storage_bucket
mime_type
file_size
note
caricato_da
source
sheet_tab
created_at
updated_at
```

Controlli necessari:

- `imponibile + iva = totale`;
- duplicati per fornitore + numero documento + totale;
- collegamento con `accounting_movements`;
- tab/lavorazione coerente.

---

# accounting_movements

Uso: movimenti contabili normalizzati.

Campi attesi:

```text
id
document_id
cantiere_id
data
descrizione
fornitore
categoria
tipo_documento
numero_documento
imponibile
iva
totale
pagamento
stato_verifica
documento_collegato
file_name
storage_path
storage_bucket
note
source
created_by
created_at
updated_at
```

Regole operative:

- un documento caricato genera o aggiorna un movimento collegato;
- se manca `document_id`, il movimento può essere manuale o importato da Sheets;
- il totale deve sempre essere controllabile.

---

# photos

Uso: foto cantiere e materiale pubblicabile.

Campi attesi:

```text
id
cantiere_id
zona
lavorazione
avanzamento
file_name
storage_path
storage_bucket
mime_type
file_size
nota
pubblicabile
pubblicata
stato
caricato_da
source
created_at
updated_at
```

Stati usati:

```text
Da revisionare
Approvata
Pubblicata
Non pubblicabile
```

---

# estimates

Uso: richieste preventivo e preventivi interni.

Campi attesi:

```text
id
client
phone
email
city
customer_type
work_type
urgency
budget
contact_preference
priority
status
description
internal_notes
request_date
created_at
updated_at
```

Stati usati:

```text
Nuovo
Da valutare
Contattato
In attesa cliente
Accettato
Rifiutato
Archiviato
```

---

# notes

Uso: note interne collegate a entità.

Campi attesi:

```text
id
text
author
date
entity_type
entity_id
created_at
```

Entità possibili:

```text
cantieri
documents
movements
photos
estimates
```

---

# activity_logs

Uso: storico attività.

Campi attesi:

```text
id
type
entity_type
entity_id
description
actor
actor_id
created_at
```

Nota critica:

Il codice filtra gli insert su `activity_logs` mantenendo solo righe con `actor_id`.
Questo è stato fatto per ridurre errori RLS, ma la policy Supabase va comunque verificata.

---

# deleted_records

Uso: tombstone per evitare che dati cancellati tornino dopo import Google Sheets.

Campi attesi:

```text
id
entity_type
entity_id
record_snapshot
deleted_by
deleted_at
reason
```

Regola:

- se un record è cancellato nell'Hub, l'import da Sheets non deve ricrearlo automaticamente.

---

# master_sheet_tabs

Uso: metadata dei tab Google Sheets / master.

Campi attesi:

```text
id
sheet_name
sheet_index
cantiere_id
metadata
created_at
updated_at
```

Uso previsto:

- riepilogo tab lavorazioni;
- allineamento cantiere/master;
- report.

---

# Checklist schema

- [ ] Verificare che tutte le tabelle esistano.
- [ ] Verificare nomi colonne reali.
- [ ] Verificare mapping camelCase/frontend vs snake_case/database.
- [ ] Verificare RLS per ogni tabella.
- [ ] Verificare chi può leggere/scrivere/cancellare.
- [ ] Verificare vincoli numerici su imponibile, iva, totale.
- [ ] Verificare indici per cantiere, documento, data, fornitore.
- [ ] Verificare gestione duplicati.

## Prossimo step tecnico

Trasformare questa bozza in una migrazione SQL reale solo dopo aver letto lo schema effettivo da Supabase.
