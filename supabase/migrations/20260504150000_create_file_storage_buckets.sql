insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('documents', 'documents', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('site-photos', 'site-photos', false, 20971520, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "documents_storage_select_authenticated" on storage.objects;
create policy "documents_storage_select_authenticated"
on storage.objects for select
to authenticated
using (bucket_id = 'documents');

drop policy if exists "documents_storage_insert_authenticated" on storage.objects;
create policy "documents_storage_insert_authenticated"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documents' and owner = auth.uid());

drop policy if exists "documents_storage_update_owner_or_admin" on storage.objects;
create policy "documents_storage_update_owner_or_admin"
on storage.objects for update
to authenticated
using (
  bucket_id = 'documents'
  and (
    owner = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.active = true and p.role = 'admin')
  )
)
with check (
  bucket_id = 'documents'
  and (
    owner = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.active = true and p.role = 'admin')
  )
);

drop policy if exists "documents_storage_delete_admin" on storage.objects;
create policy "documents_storage_delete_admin"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'documents'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.active = true and p.role = 'admin')
);

drop policy if exists "site_photos_storage_select_authenticated" on storage.objects;
create policy "site_photos_storage_select_authenticated"
on storage.objects for select
to authenticated
using (bucket_id = 'site-photos');

drop policy if exists "site_photos_storage_insert_authenticated" on storage.objects;
create policy "site_photos_storage_insert_authenticated"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-photos' and owner = auth.uid());

drop policy if exists "site_photos_storage_update_owner_or_admin" on storage.objects;
create policy "site_photos_storage_update_owner_or_admin"
on storage.objects for update
to authenticated
using (
  bucket_id = 'site-photos'
  and (
    owner = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.active = true and p.role = 'admin')
  )
)
with check (
  bucket_id = 'site-photos'
  and (
    owner = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.active = true and p.role = 'admin')
  )
);

drop policy if exists "site_photos_storage_delete_admin" on storage.objects;
create policy "site_photos_storage_delete_admin"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'site-photos'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.active = true and p.role = 'admin')
);
