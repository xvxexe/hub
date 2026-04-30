# MANUAL_TEST_SCRIPT.md — Test manuale pre-Supabase

Script operativo per verificare EuropaService Hub in modalità mock.

## 1. Avvia progetto

1. Apri terminale nella root progetto.
2. Esegui `npm run dev`.
3. Apri l’URL Vite indicato in console.
4. Verifica che il sito pubblico si apra su `#/`.

## 2. Testa sito pubblico desktop

1. Apri viewport desktop.
2. Visita:
   - `#/`
   - `#/servizi`
   - `#/cantieri`
   - un dettaglio `#/cantieri/:id`
   - `#/settori`
   - `#/chi-siamo`
   - `#/preventivo`
   - `#/contatti`
3. Controlla header, footer, immagini, CTA, testi e link.
4. Invia form preventivo mock e verifica riepilogo.
5. Invia form contatti mock e verifica conferma.

## 3. Testa sito pubblico mobile

1. Apri DevTools o dispositivo mobile.
2. Ripeti le pagine pubbliche principali.
3. Verifica menu mobile, CTA, immagini, form e footer.
4. Segna problemi in `docs/MOCK_QA_BUGS.md`.

## 4. Testa login/ruolo admin mock

1. Vai a `#/dashboard/login`.
2. Seleziona ruolo Admin/capo.
3. Entra nella dashboard.
4. Verifica badge ruolo e navigazione interna.

## 5. Testa admin dashboard

1. Vai a `#/dashboard`.
2. Controlla cantieri attivi, documenti, foto, preventivi, spese, alert e problemi.
3. Apri collegamenti rapidi.
4. Verifica che importi e contabilità siano visibili.

## 6. Testa ruolo contabilità

1. Cambia ruolo in Contabilità dalla modalità sviluppo.
2. Verifica dashboard contabile.
3. Verifica accesso a:
   - `#/dashboard/cantieri`
   - `#/dashboard/documenti`
   - `#/dashboard/caricamenti`
   - `#/dashboard/preventivi`
   - `#/dashboard/contabilita`
4. Verifica blocco su:
   - `#/dashboard/dipendenti`
   - `#/dashboard/foto`

## 7. Testa ruolo dipendente

1. Cambia ruolo in Dipendente.
2. Verifica dashboard semplice.
3. Verifica upload foto/documento.
4. Verifica “I miei caricamenti”.
5. Verifica blocco su:
   - `#/dashboard/contabilita`
   - `#/dashboard/dipendenti`
   - `#/dashboard/preventivi`
   - `#/dashboard/impostazioni`
6. Controlla che non siano visibili importi o dati sensibili.

## 8. Testa documenti

1. Torna come Admin/capo o Contabilità.
2. Apri `#/dashboard/documenti`.
3. Prova filtri, ricerca e filtri rapidi.
4. Apri un documento.
5. Cambia stato: Confermato, Incompleto, Possibile duplicato, Scartato, Da verificare.
6. Modifica dati mock.
7. Inserisci importi incoerenti e verifica alert.
8. Aggiungi nota interna.
9. Verifica storico attività.

## 9. Testa foto

1. Torna come Admin/capo.
2. Apri `#/dashboard/foto`.
3. Prova filtri stato/cantiere/pubblicabile.
4. Apri una foto.
5. Approva, segna non pubblicabile, segna pubblicabile e pubblica.
6. Modifica zona/lavorazione/descrizione pubblica.
7. Aggiungi nota.
8. Verifica activity log.
9. Controlla che Contabilità e Dipendente non possano approvare/pubblicare.

## 10. Testa preventivi

1. Apri `#/dashboard/preventivi`.
2. Prova filtri stato/urgenza/tipo cliente.
3. Apri un preventivo.
4. Cambia stato: Da valutare, Contattato, In attesa cliente, Accettato, Rifiutato, Archiviato.
5. Cambia priorità.
6. Aggiungi nota interna.
7. Verifica che “Converti in cantiere” sia solo placeholder/disabilitato.
8. Verifica che Dipendente non acceda ai preventivi.

## 11. Testa contabilità

1. Apri `#/dashboard/contabilita`.
2. Prova filtri cantiere, categoria, stato, tipo documento e ricerca.
3. Verifica riepiloghi generali, per cantiere e per categoria.
4. Apri un movimento da tabella/card.
5. Modifica dati mock e controlla alert importi.
6. Verifica formato valuta euro.
7. Verifica che Dipendente non acceda.

## 12. Testa cantieri

1. Apri `#/dashboard/cantieri`.
2. Prova ricerca, filtro stato, filtro responsabile e ordinamento.
3. Apri dettaglio cantiere.
4. Verifica tab Panoramica, Foto, Documenti, Spese, Note, Problemi, Attività recenti.
5. Apri documento/foto collegati.
6. Aggiungi nota cantiere.
7. Verifica che Dipendente non veda spese/importi.

## 13. Testa build

1. Ferma dev server se necessario.
2. Esegui `npm run build`.
3. Verifica che non ci siano errori.
4. Se ci sono errori, registrarli in `docs/MOCK_QA_BUGS.md`.

## 14. Segna problemi

1. Ogni bug va inserito in `docs/MOCK_QA_BUGS.md`.
2. Compila ID, area, pagina, problema, gravità, stato e note.
3. Se ci sono bug Critica o Alta, non passare a Supabase.
4. Pianifica correzioni in `v0.5.10`.
