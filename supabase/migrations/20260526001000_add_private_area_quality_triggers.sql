create or replace function public.normalize_private_area_quality_fields()
returns trigger
language plpgsql
as $$
declare
  original_category text;
  tab_name text;
  delta numeric;
  is_non_fiscal_amount boolean;
begin
  original_category := coalesce(new.categoria_originale, new.categoria);
  new.categoria_originale := original_category;
  delta := round((coalesce(new.imponibile,0) + coalesce(new.iva,0) - coalesce(new.totale,0))::numeric, 2);

  if tg_table_name = 'documents' then
    tab_name := new.sheet_tab;
  elsif tg_table_name = 'accounting_movements' then
    select d.sheet_tab into tab_name from public.documents d where d.id = new.document_id;
  end if;

  if new.categoria in ('Materiali','Manodopera','Non materiali','Extra / Altro','Vitto','Alloggi','FIR / Rifiuti','Bonifici / Pagamenti','Noleggi / Servizi') then
    new.categoria := new.categoria;
  elsif new.categoria in ('Generatore','Fase 2 solaio','Docce esterne','Chiusura pilastri','Scarichi','Sotto Tettoie','Misto: Blocchi / Malta') then
    new.categoria := 'Materiali';
  elsif new.categoria = 'Lavorazione' then
    new.categoria := 'Manodopera';
  elsif new.categoria = 'Resi / Note credito' then
    new.categoria := 'Extra / Altro';
  elsif new.categoria ilike '%classificare%' then
    new.categoria := 'Extra / Altro';
  else
    new.categoria := 'Extra / Altro';
  end if;

  if original_category = 'Alloggi' or tab_name = 'Alloggi' then
    new.natura_movimento := 'Alloggio';
  elsif original_category = 'Vitto' or tab_name = 'Vitto' then
    new.natura_movimento := 'Vitto';
  elsif original_category = 'FIR / Rifiuti' or tab_name ilike '%rifiuti%' then
    new.natura_movimento := 'FIR / Rifiuti';
  elsif original_category = 'Bonifici / Pagamenti' or coalesce(new.pagamento,'') ilike '%bonifico%' or coalesce(new.descrizione,'') ilike '%bonifico%' then
    new.natura_movimento := 'Bonifico / Pagamento';
  elsif original_category = 'Resi / Note credito' or coalesce(new.totale,0) < 0 then
    new.natura_movimento := 'Nota credito / Reso';
  elsif tg_table_name = 'documents' and coalesce(new.tipo_documento,'') ilike '%fattura%' then
    new.natura_movimento := 'Fattura';
  elsif tg_table_name = 'documents' and coalesce(new.tipo_documento,'') ilike '%ricevuta%' then
    new.natura_movimento := 'Ricevuta';
  else
    new.natura_movimento := coalesce(new.natura_movimento, 'Movimento operativo');
  end if;

  is_non_fiscal_amount := coalesce(new.imponibile,0) = 0
    and coalesce(new.iva,0) = 0
    and coalesce(new.totale,0) <> 0
    and (
      original_category in ('Alloggi','Vitto','Bonifici / Pagamenti')
      or coalesce(new.pagamento,'') ilike '%bonifico%'
      or coalesce(new.descrizione,'') ilike '%bonifico%'
    );

  if abs(delta) <= 0.02 then
    new.controllo_matematico := 'OK';
  elsif is_non_fiscal_amount then
    new.controllo_matematico := 'Non applicabile';
  else
    new.controllo_matematico := 'Scarto da verificare';
  end if;

  if coalesce(new.descrizione,'') ilike '%fattura da collegare%' or coalesce(new.note,'') ilike '%fattura da collegare%' then
    new.stato_collegamento := 'Da collegare';
  elsif coalesce(new.pagamento,'') ilike '%bonifico%' and coalesce(new.imponibile,0)=0 and coalesce(new.iva,0)=0 then
    new.stato_collegamento := 'Da collegare';
  else
    new.stato_collegamento := coalesce(new.stato_collegamento, 'Collegato');
  end if;

  new.data_quality_note := nullif(concat_ws(' | ',
    case when original_category is not null and original_category <> new.categoria then 'Categoria normalizzata da: ' || original_category end,
    case when (case when tg_table_name = 'documents' then new.data_documento else new.data end) > current_date then 'Data futura/sospetta' end,
    case when coalesce(new.descrizione,'') ilike '%fattura da collegare%' or coalesce(new.note,'') ilike '%fattura da collegare%' then 'Pagamento da collegare a fattura' end,
    case when abs(delta) > 0.02 then 'Delta matematico: ' || delta::text end
  ), '');

  if (case when tg_table_name = 'documents' then new.data_documento else new.data end) > current_date
    or original_category ilike '%classificare%'
    or (new.controllo_matematico = 'Scarto da verificare') then
    new.qualita_dati := 'Da verificare';
  else
    new.qualita_dati := 'Pulito';
  end if;

  return new;
end;
$$;

drop trigger if exists normalize_documents_quality_fields on public.documents;
create trigger normalize_documents_quality_fields
before insert or update on public.documents
for each row execute function public.normalize_private_area_quality_fields();

drop trigger if exists normalize_accounting_movements_quality_fields on public.accounting_movements;
create trigger normalize_accounting_movements_quality_fields
before insert or update on public.accounting_movements
for each row execute function public.normalize_private_area_quality_fields();
