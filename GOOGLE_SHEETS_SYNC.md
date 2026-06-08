# Google Sheets Sync - EuropaService Hub

Ultimo aggiornamento: 2026-06-08

## Scopo

Questo documento descrive il collegamento tra EuropaService Hub, Google Sheets e Supabase.

Il flusso attuale non sostituisce ancora completamente Google Sheets.
Serve per:

- importare dati dal master;
- esportare dati operativi verso Sheets;
- mantenere una copia leggibile e controllabile;
- evitare perdita dati durante la transizione.

## Stato attuale

Stato: FUNZIONANTE MA DA STABILIZZARE

Nel codice è presente un modulo `googleSheetsSync` che gestisce:

- import da Apps Script;
- normalizzazione store;
- salvataggio su Supabase operativo;
- salvataggio legacy/fallback;
- export da Supabase verso Apps Script;
- gestione tombstone per dati cancellati.

## Fonte tecnica

Variabile ambiente prevista:

```env
VITE_GOOGLE_SHEETS_SYNC_URL=
```

Se non configurata, il codice usa un URL Apps Script hardcoded.

Azione consigliata:

- spostare sempre l'URL in variabile ambiente;
- documentare quale Apps Script è attivo;
- evitare di avere più script simili non tracciati.

## Import Google Sheets → Hub/Supabase

Flusso previsto:

1. chiamata GET verso Apps Script con `action=import`;
2. Apps Script restituisce uno `store` normalizzato;
3. il frontend controlla che ci siano documenti e movimenti;
4. lo store importato viene unito ai dati operativi esistenti;
5. vengono applicati i tombstone da `deleted_records`;
6. lo snapshot Google Sheets precedente viene sostituito;
7. i dati vengono salvati su Supabase operativo;
8. viene aggiornato anche il fallback legacy.

Controlli già presenti:

- blocco import se il parser restituisce 0 documenti;
- blocco import se il parser restituisce 0 movimenti;
- filtro record cancellati tramite tombstone.

## Export Hub/Supabase → Google Sheets

Flusso previsto:

1. carica il miglior store disponibile;
2. legge `deleted_records`;
3. invia POST ad Apps Script con `action=export`;
4. Apps Script aggiorna Google Sheets;
5. restituisce riepilogo.

Payload concettuale:

```json
{
  "action": "export",
  "store": {},
  "deletedRecords": []
}
```

## Struttura store attesa

Lo store deve contenere almeno:

```text
cantieri
documents
movements
photos
estimates
notes
activities
deletedRecords
masterSheets
```

Per import sicuro sono obbligatori:

```text
documents.length > 0
movements.length > 0
```

## Rischi principali

1. Parser Apps Script sbagliato.
2. Import con 0 righe che cancella dati buoni.
3. Duplicati tra Sheets e Supabase.
4. Cancellazioni che ritornano dopo import.
5. Totali diversi tra master e dashboard.
6. Documenti senza `cantiereId` che finiscono su fallback `barcelo-roma`.
7. URL Apps Script hardcoded non aggiornato.
8. Mancanza di log chiaro per import/export.

## Regole operative

- Google Sheets resta fonte di controllo, non unica fonte finale.
- Supabase deve diventare fonte operativa principale.
- Ogni import deve mantenere i dati non presenti in Sheets ma creati nell'Hub.
- Ogni cancellazione deve creare tombstone.
- Mai accettare import vuoto come valido.
- Ogni movimento deve restare collegabile a documento, cantiere e tab.

## Checklist test sync

- [ ] Import manuale da Google Sheets riuscito.
- [ ] Export manuale verso Google Sheets riuscito.
- [ ] Nessuna riga cancellata per errore.
- [ ] Nessuna riga duplicata dopo doppio import.
- [ ] Totale master = totale dashboard per cantiere.
- [ ] Totale documenti = totale movimenti quando previsto.
- [ ] Record cancellato non ricompare dopo import.
- [ ] Documenti senza cantiere vengono segnalati.
- [ ] Errori Apps Script mostrati chiaramente in UI.
- [ ] URL Apps Script attivo documentato.

## Priorità prossime

1. Documentare Apps Script attuale.
2. Aggiungere log visibile ultimo import/export.
3. Aggiungere validazione forte su totali.
4. Rendere esplicito quale sistema è fonte ufficiale per ogni dato.
5. Ridurre dipendenza da fallback legacy.

## Stato consigliato roadmap

La sync Sheets è da considerare:

```text
IN CORSO - usabile per MVP interno, non ancora blindata produzione
```
