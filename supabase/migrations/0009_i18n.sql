-- 0009_i18n.sql
-- Locales + runtime-editable translations
-- Created: 2026-05-18

create table if not exists public.locales (
  code text primary key,
  name text not null,
  is_rtl boolean default false,
  display_order int default 0,
  is_active boolean default true
);

insert into public.locales (code, name, display_order, is_active) values
  ('hu','Magyar',1,true),
  ('en','English',2,true),
  ('de','Deutsch',3,true),
  ('fr','Français',4,true),
  ('it','Italiano',5,true),
  ('es','Español',6,true),
  ('pl','Polski',7,true),
  ('ro','Română',8,true),
  ('nl','Nederlands',9,true),
  ('pt','Português',10,true),
  ('cs','Čeština',11,true),
  ('sk','Slovenčina',12,true),
  ('sv','Svenska',13,true),
  ('da','Dansk',14,true),
  ('fi','Suomi',15,true)
on conflict (code) do nothing;

create table if not exists public.i18n_keys (
  key text primary key,
  description text,
  created_at timestamptz default now() not null
);

create table if not exists public.i18n_translations (
  key text references public.i18n_keys(key) on delete cascade,
  locale text references public.locales(code) on delete cascade,
  value text not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz default now() not null,
  primary key (key, locale)
);

create index if not exists i18n_translations_locale_idx
  on public.i18n_translations (locale);
