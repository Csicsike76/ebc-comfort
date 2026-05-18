-- 0012_seed_data.sql
-- Initial product, articles, super_admin auto-grant
-- Created: 2026-05-18

-- =============================================================
-- DEFAULT PRODUCT: EBC Comfort
-- =============================================================
insert into public.products (id, slug, sku, status, base_price_cents, currency, vat_rate_pct, weight_grams, dimensions_mm, warranty_months, hs_code)
values (
  '00000000-0000-0000-0000-000000000001',
  'ebc-comfort',
  'EBC-C-001',
  'draft',                           -- start draft until full launch
  10000,                              -- €100.00
  'EUR',
  27.00,                              -- HU VAT
  120,                                -- 120 g
  '{"l":140,"w":70,"h":12}'::jsonb,   -- 14×7×1.2 cm
  24,                                  -- 2 years
  '8516.79'                            -- TARIC: electric heating apparatus
) on conflict (id) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, long_description)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'hu',
    'EBC Comfort — Fűthető Komfortbetét',
    'Csendes meleg, diszkréten. 5 hőfokozat. 8000 mAh akkumulátor.',
    'EBC Comfort egy diszkréten viselhető hőmelegítő eszköz, amely lokális meleget biztosít az alhasi régióban — komfort-érzet, nyugalom céljából.'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'en',
    'EBC Comfort — Heated Comfort Pad',
    'Quiet warmth, discreetly. 5 heat levels. 8000 mAh battery.',
    'EBC Comfort is a discreetly wearable heating device that provides localized warmth in the lower abdominal area for comfort and relaxation.'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'de',
    'EBC Comfort — Beheizbares Komfort-Pad',
    'Leise Wärme, diskret. 5 Heizstufen. 8000 mAh Akku.',
    'EBC Comfort ist ein diskret tragbares Wärmegerät, das lokale Wärme im Unterleibsbereich für Komfort und Entspannung bietet.'
  )
on conflict (product_id, locale) do nothing;

insert into public.inventory (product_id, stock_qty, reserved_qty, low_stock_threshold)
values ('00000000-0000-0000-0000-000000000001', 0, 0, 50)
on conflict (product_id) do nothing;

-- =============================================================
-- ARTICLE CATEGORIES
-- =============================================================
insert into public.article_categories (id, slug, display_order) values
  ('00000000-0000-0000-0000-000000000101','noi-egeszseg',1),
  ('00000000-0000-0000-0000-000000000102','hoterapia',2),
  ('00000000-0000-0000-0000-000000000103','onmegfigyeles',3),
  ('00000000-0000-0000-0000-000000000104','termek-info',4)
on conflict (id) do nothing;

insert into public.article_category_translations (category_id, locale, name, description) values
  ('00000000-0000-0000-0000-000000000101','hu','Női egészség','Általános női egészség és wellness tudnivalók'),
  ('00000000-0000-0000-0000-000000000101','en','Women''s health','General women''s health and wellness'),
  ('00000000-0000-0000-0000-000000000102','hu','Hőterápia','Hőterápia hatása és alkalmazása'),
  ('00000000-0000-0000-0000-000000000102','en','Heat therapy','Effects and use of heat therapy'),
  ('00000000-0000-0000-0000-000000000103','hu','Önmegfigyelés','A saját tested jelzéseinek megértése'),
  ('00000000-0000-0000-0000-000000000103','en','Self-observation','Understanding your body''s signals'),
  ('00000000-0000-0000-0000-000000000104','hu','Termékinformáció','EBC Comfort használata, tisztítása'),
  ('00000000-0000-0000-0000-000000000104','en','Product info','Using and cleaning EBC Comfort')
on conflict (category_id, locale) do nothing;

-- =============================================================
-- AUTO-GRANT SUPER_ADMIN to Zsolt's emails on registration
-- =============================================================
create or replace function public.auto_grant_super_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Zsolt main accounts
  if new.email in ('19perro76@gmail.com','notebooklmzsolt@gmail.com') then
    insert into public.user_roles (user_id, role, granted_by)
    values (new.id, 'super_admin', new.id)
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists auto_grant_super_admin_trigger on public.profiles;
create trigger auto_grant_super_admin_trigger
  after insert on public.profiles
  for each row execute function public.auto_grant_super_admin();

-- Retro-apply to existing profile rows (if any from earlier test logins)
do $$
declare uid uuid;
begin
  for uid in
    select id from public.profiles
    where email in ('19perro76@gmail.com','notebooklmzsolt@gmail.com')
  loop
    insert into public.user_roles (user_id, role, granted_by)
    values (uid, 'super_admin', uid)
    on conflict (user_id, role) do nothing;
  end loop;
end $$;

-- =============================================================
-- I18N STARTER KEYS (HU baseline)
-- =============================================================
insert into public.i18n_keys (key, description) values
  ('common.home','Header — Home link'),
  ('common.products','Header — Products link'),
  ('common.about','Header — About link'),
  ('common.education','Header — Education link'),
  ('common.support','Header — Support program link'),
  ('common.cart','Header — Cart link'),
  ('common.account','Header — User account link'),
  ('common.sign_in','Header — Sign in button'),
  ('common.sign_out','Header — Sign out button'),
  ('common.search','Search input placeholder'),
  ('home.hero.title','Landing hero main title'),
  ('home.hero.subtitle','Landing hero subtitle/tagline'),
  ('home.hero.cta_primary','Landing hero primary CTA button'),
  ('home.hero.cta_secondary','Landing hero secondary CTA button'),
  ('product.add_to_cart','Product page — add to cart button'),
  ('product.buy_now','Product page — buy now button'),
  ('product.specs','Product page — specs section title'),
  ('product.what_in_box','Product page — what''s in box section')
on conflict (key) do nothing;

insert into public.i18n_translations (key, locale, value) values
  ('common.home','hu','Kezdőlap'),
  ('common.home','en','Home'),
  ('common.home','de','Startseite'),
  ('common.products','hu','Termékek'),
  ('common.products','en','Products'),
  ('common.products','de','Produkte'),
  ('common.about','hu','Rólunk'),
  ('common.about','en','About'),
  ('common.about','de','Über uns'),
  ('common.education','hu','Edukáció'),
  ('common.education','en','Education'),
  ('common.education','de','Bildung'),
  ('common.support','hu','Támogatás'),
  ('common.support','en','Support'),
  ('common.support','de','Unterstützung'),
  ('common.cart','hu','Kosár'),
  ('common.cart','en','Cart'),
  ('common.cart','de','Warenkorb'),
  ('common.sign_in','hu','Bejelentkezés'),
  ('common.sign_in','en','Sign in'),
  ('common.sign_in','de','Anmelden'),
  ('home.hero.title','hu','A te tested. A te ritmusod.'),
  ('home.hero.title','en','Your body. Your rhythm.'),
  ('home.hero.title','de','Dein Körper. Dein Rhythmus.'),
  ('home.hero.subtitle','hu','Tiszta, csendes komfort. Diszkrét, szabályozható hőmelegítés.'),
  ('home.hero.subtitle','en','Clean, quiet comfort. Discreet, adjustable warming.'),
  ('home.hero.subtitle','de','Saubere, leise Wärme. Diskret, einstellbar.'),
  ('product.add_to_cart','hu','Kosárba teszem'),
  ('product.add_to_cart','en','Add to cart'),
  ('product.add_to_cart','de','In den Warenkorb')
on conflict (key, locale) do nothing;
