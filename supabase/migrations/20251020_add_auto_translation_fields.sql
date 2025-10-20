-- Añadir campos para auto-traducción a service_translations
alter table public.service_translations 
add column if not exists content_hash text,
add column if not exists auto_translated_at timestamptz,
add column if not exists verified_at timestamptz,
add column if not exists translation_provider text,
add column if not exists translation_job_id text;

-- Índice para content_hash para búsquedas rápidas
create index if not exists service_translations_content_hash_idx 
on public.service_translations(content_hash);

-- Índice para job_id para tracking de colas
create index if not exists service_translations_job_id_idx 
on public.service_translations(translation_job_id);

-- Función para calcular hash del contenido fuente
create or replace function public.calculate_content_hash(
  title text,
  description text
) returns text language plpgsql as $$
begin
  return encode(digest(coalesce(title, '') || '|' || coalesce(description, ''), 'sha256'), 'hex');
end; $$;

-- Función para marcar traducciones como outdated cuando cambia el contenido fuente
create or replace function public.mark_translations_outdated()
returns trigger language plpgsql as $$
declare
  new_hash text;
begin
  -- Calcular nuevo hash del contenido
  new_hash := public.calculate_content_hash(new.title, new.description);
  
  -- Si el contenido cambió, marcar todas las traducciones como outdated
  if old.title != new.title or old.description != new.description then
    update public.service_translations 
    set status = 'outdated',
        updated_at = now()
    where service_id = new.id 
      and status in ('auto', 'verified')
      and content_hash != new_hash;
  end if;
  
  return new;
end; $$;

-- Trigger para marcar traducciones como outdated en cambios de servicios
drop trigger if exists trg_mark_translations_outdated on public.services;
create trigger trg_mark_translations_outdated
after update on public.services
for each row execute function public.mark_translations_outdated();

-- Función para crear job de traducción automática
create or replace function public.create_translation_job(
  p_service_id uuid,
  p_locale text,
  p_content_hash text,
  p_provider text default 'deepl'
) returns text language plpgsql as $$
declare
  job_id text;
begin
  job_id := p_service_id::text || '-' || p_locale || '-' || p_content_hash;
  
  -- Insertar o actualizar registro de traducción
  insert into public.service_translations (
    service_id, locale, content_hash, status, translation_provider, translation_job_id
  ) values (
    p_service_id, p_locale, p_content_hash, 'pending', p_provider, job_id
  )
  on conflict (service_id, locale) 
  do update set 
    content_hash = p_content_hash,
    status = 'pending',
    translation_provider = p_provider,
    translation_job_id = job_id,
    updated_at = now();
  
  return job_id;
end; $$;

-- Función para actualizar estado de traducción completada
create or replace function public.update_translation_completed(
  p_job_id text,
  p_translated_title text,
  p_translated_description text,
  p_status text default 'auto'
) returns boolean language plpgsql as $$
begin
  update public.service_translations 
  set title = p_translated_title,
      description = p_translated_description,
      status = p_status,
      auto_translated_at = case when p_status = 'auto' then now() else auto_translated_at end,
      updated_at = now()
  where translation_job_id = p_job_id;
  
  return found;
end; $$;

-- Función para marcar traducción como verificada por admin
create or replace function public.verify_translation(
  p_service_id uuid,
  p_locale text
) returns boolean language plpgsql as $$
begin
  update public.service_translations 
  set status = 'verified',
      verified_at = now(),
      updated_at = now()
  where service_id = p_service_id 
    and locale = p_locale;
  
  return found;
end; $$;
