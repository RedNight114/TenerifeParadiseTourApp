-- Tabla de traducciones para servicios
create table if not exists public.service_translations (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  locale text not null,
  title text,
  description text,
  slug text,
  status text not null default 'pending', -- pending | auto | verified | outdated
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unicidad por servicio+locale
create unique index if not exists service_translations_service_locale_uidx
  on public.service_translations(service_id, locale);

-- Índices para búsqueda por slug y estado
create index if not exists service_translations_slug_idx on public.service_translations(slug);
create index if not exists service_translations_status_idx on public.service_translations(status);

-- Normalizar locale a minúsculas en inserts/updates
create or replace function public.normalize_locale_service_translations()
returns trigger language plpgsql as $$
begin
  new.locale := lower(split_part(new.locale, '-', 1));
  return new;
end; $$;

drop trigger if exists trg_normalize_locale_service_translations on public.service_translations;
create trigger trg_normalize_locale_service_translations
before insert or update on public.service_translations
for each row execute function public.normalize_locale_service_translations();

-- Actualizar updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_set_updated_at_service_translations on public.service_translations;
create trigger trg_set_updated_at_service_translations
before update on public.service_translations
for each row execute function public.set_updated_at();

