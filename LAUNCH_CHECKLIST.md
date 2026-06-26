# EBC Comfort webshop — LAUNCH CHECKLIST (F2/F3)

Frissítve: 2026-06-26. A kód **launch-ready, fail-closed**: kulcs nélkül semmi nem
sül el véletlenül. Élesítés = ebben a sorrendben kulcsot/env-et beállítani + migrációt
alkalmazni. Minden lépés visszafordítható az env törlésével.

---

## 0. Jogi előfeltétel (F3-at kapuzza)
- [ ] **Kft bejegyzés + ÁFA-szám** megvan. ENÉLKÜL a magyar számla érvénytelen → a
      Számlázz.hu integrációt NE élesítsd (a kód `not_live`/`config_missing`-et ad).
- [ ] Adatkezelési tájékoztató + ÁSZF él (publikus oldalon már van; cégadat-frissítés bejegyzéskor).

## 1. Supabase prod migrációk alkalmazása
A self-host/prod DB-re ezek MÉG NINCSENEK felvíve (lokálban tesztelve). Sorrendben:
- [ ] `0020_grants_self_host.sql` — GRANT authenticated/anon (self-host nélkül halott admin).
- [ ] `0021_invoices.sql` — invoices tábla (F3).
- [ ] `0022_linter_fixes.sql` — search_path + SECURITY DEFINER revoke (hosted: már OK).
- [ ] `0023_order_attribution.sql` — orders.utm_campaign/utm_source (F2 ROAS).
- Parancs: `supabase db push` (vagy `supabase migration up` lokálra). Hosted Supabase
  auto-grantol → `0020` ott no-op, self-host-on KRITIKUS.

## 2. F2 — Marketing élesítés
### 2a. Tranzakciós + newsletter email (Resend)
- [ ] `RESEND_API_KEY` beállítva. Hiányában minden email **dry-run** (`email_sent_log.status=placeholder`),
      a rendelés/szállítás folyamat NEM törik. Kulccsal a rendelés-visszaigazoló + szállítás-email él.
- [ ] Resend domain-verifikáció (SPF/DKIM) az EBC küldő-domainre.
### 2b. ROAS-attribúció (kulcs NÉLKÜL működik — tiszta DB)
- A lánc kész: `UtmTracker` (cookie, marketing-consent-gated) → checkout elmenti
  `orders.utm_campaign/utm_source` → admin/marketing ROAS-oszlop (Bevétel + ROAS=bevétel/költés).
- [ ] Élesedéskor automatikus: amint van kampány `utm_campaign`-nel + fizetett rendelés ugyanazzal
      az utm-mel, a ROAS magától számol. Teendő: a hirdetés-linkek `?utm_campaign=<kód>`-ot vigyenek,
      és a kampány `spent_cents`-e legyen kitöltve a marketing-admin-ban.
- ⚠️ Attribúció CSAK marketing-cookie-consent esetén (GDPR) — consent nélkül nincs utm → nincs ROAS-sor (szándékos).
### 2c. Pixel (opcionális)
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_TIKTOK_PIXEL_ID` / `NEXT_PUBLIC_GOOGLE_ADS_ID` — ha kell ad-retargeting.

## 3. F3 — Számlázás élesítés (CSAK a 0. jogi lépés után)
Sorrend KÖTELEZŐ — a `BILLING_LIVE=true` az UTOLSÓ:
- [ ] `BILLING_PROVIDER=szamlazzhu`
- [ ] `SZAMLAZZHU_AGENT_KEY` (Számlázz.hu fiók → Számla Agent kulcs)
- [ ] `SELLER_TAX_ID` (ÁFA-szám) + `SELLER_NAME` + `SELLER_ADDRESS`
- [ ] **SANDBOX-VALIDÁCIÓ:** Számlázz.hu Agent TESZT-fiókkal egy próba-számla. A
      `buildSzamlaXml` struktúrája + összeg-matekja unit-tesztelt, DE a Számlázz.hu élő
      validátora elutasíthat (eladó-adat, ÁFA-mód, e-számla-flag). Ezt MOST nem lehet
      kulcs nélkül ellenőrizni → a kód `BILLING_LIVE` mögött zárva marad.
- [ ] **VÉGSŐ:** `BILLING_LIVE=true` — csak ha a sandbox-próba átment. Ezelőtt a számla-akció
      `not_live` blokkolt sort rögzít (nincs téves számla).

## 4. Stripe (fizetés) — TEST → LIVE
- [ ] `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` LIVE kulcsra (most placeholder → a checkout
      `placeholder_redirect`-et ad, a rendelés `pending`-ként rögzül Stripe-session nélkül).
- [ ] `STRIPE_WEBHOOK_SECRET` + webhook-endpoint a prod URL-re (paid_at + status frissítés).
- ⚠️ A FokusMester-audit szerint a Stripe TEST→LIVE + webhook-idempotencia a tipikus launch-akna — teszteld a teljes paid-flow-t.

## 5. Élesítés utáni verifikáció
- [ ] Teszt-rendelés (LIVE Stripe, kis összeg) → `orders` row + rendelés-email + (Kft után) számla.
- [ ] UTM-es teszt-rendelés → ROAS-oszlop számol a marketing-admin-ban.
- [ ] `email_sent_log.status=sent` (nem placeholder).
- [ ] Admin dashboard mai/összes számok élnek.

---
**Kód-állapot most:** F2 ROAS-lánc kész + tsc/assert-verifikált; F3 adapter kész + fail-closed
+ XML unit-tesztelt. Minden élesítés = env-flip + migráció, NEM kódírás. Rotálatlan/kompromittált
kulcsot SOHA ne köss be (Anthropic kulcs jelenleg üres — szándékos, no_paid_services).
