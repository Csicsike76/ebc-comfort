-- 0015_seed_legal_documents.sql
-- Initial v1.0 templates for ASZF + Privacy + Cookie notice in HU/EN/DE.
-- These are PRE-LEGAL-REVIEW templates — Sprint 9 jogász audit kötelező mielőtt webshop launch-ra megy.
-- Created: 2026-05-18

insert into public.legal_documents (slug, version, locale, title, body_markdown, published_at)
values
(
  'aszf', 'v1.0', 'hu',
  'Általános Szerződési Feltételek (ÁSZF)',
  '# Általános Szerződési Feltételek (ÁSZF) — v1.0

**Hatályos**: 2026-05-18 (TEMPLATE — jogász review kötelező)

## 1. Szolgáltató

EBC Wellness Kft. *(cégalapítás folyamatban)*
Székhely: *(megjelölés cégalapítás után)*
Cégjegyzékszám: *(megjelölés cégalapítás után)*
Adószám: *(megjelölés cégalapítás után)*
E-mail: hello@ebc-wellness.eu

## 2. A szerződés tárgya

A jelen ÁSZF az EBC Comfort wellness-eszköz online értékesítésének feltételeit szabályozza a https://ebc-comfort.netlify.app weboldalon.

## 3. Termék

**EBC Comfort** — fűthető komfortbetét (wellness-eszköz, NEM orvosi eszköz). 5 hőfokozat, 8000 mAh akku, USB-C tölthető. Részletek: [Termék-oldal](/hu/termek).

## 4. Megrendelés

A megrendelést a weboldalon keresztül lehet leadni. A megrendelés visszaigazolása automatikus e-mail formájában történik. A szerződés a fizetés sikeres teljesítésével jön létre.

## 5. Árak és fizetés

Az árak EUR-ban értendők, az ÁFA 27%-ot tartalmazzák. Fizetési módok: bankkártya (Stripe), SimplePay, Klarna BNPL.

## 6. Szállítás

EU-szintű szállítás, 2-5 munkanap, €15 szállítási díj. Magyarországon a kézbesítés futárszolgálattal történik (GLS, DPD).

## 7. Elállás (14 nap)

A fogyasztói elállási jog 14 napon belül gyakorolható, indoklás nélkül. Az elállás bejelentését írásban kell megküldeni a hello@ebc-wellness.eu címre. A termék visszaküldési költsége a vásárlót terheli.

**Higiéniai okból**: ha a terméket használatba vettük, az elállási jog korlátozott. A bontatlan eredeti csomagolásban visszaküldött termék mindig visszafogadható.

## 8. Garancia

24 hónap gyártói garancia (jótállás). Részletek: [GY.I.K. → Garancia](/hu/gyik).

## 9. Adatkezelés

Az adatkezelési tájékoztató külön dokumentumban: [Adatvédelem](/hu/adatvedelem).

## 10. Vitarendezés

Vita esetén a fogyasztó a Békéltető Testülethez vagy a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhat. Vagyontárgyban okozott kár esetén a magyar bíróságok illetékesek.

**FIGYELEM**: Ez a dokumentum jogász-review előtti TEMPLATE. Élesedés előtt jogászi átnézés kötelező.
',
  now()
),
(
  'aszf', 'v1.0', 'en',
  'Terms of Service',
  '# Terms of Service — v1.0

**Effective date**: 2026-05-18 (TEMPLATE — pending legal review)

## 1. Provider

EBC Wellness Kft. *(registration in progress)*
E-mail: hello@ebc-wellness.eu

## 2. Subject

These Terms govern the online sale of the EBC Comfort wellness device at https://ebc-comfort.netlify.app.

## 3. Product

**EBC Comfort** — heated comfort pad (wellness device, NOT a medical device). 5 heat levels, 8000 mAh battery, USB-C rechargeable.

## 4-9. (template — pending legal review)

## 10. Disputes

EU consumer dispute resolution applies. Hungarian courts have jurisdiction.

**NOTICE**: This document is a pre-legal-review TEMPLATE. Lawyer review is required before activation.
',
  now()
),
(
  'aszf', 'v1.0', 'de',
  'Allgemeine Geschäftsbedingungen (AGB)',
  '# Allgemeine Geschäftsbedingungen (AGB) — v1.0

**Gültig ab**: 2026-05-18 (VORLAGE — anwaltliche Prüfung ausstehend)

## 1. Anbieter

EBC Wellness Kft. *(Eintragung in Bearbeitung)*
E-Mail: hello@ebc-wellness.eu

## 2. Gegenstand

Diese AGB regeln den Online-Verkauf des EBC Comfort Wellness-Geräts auf https://ebc-comfort.netlify.app.

## 3. Produkt

**EBC Comfort** — beheizbares Komfort-Pad (Wellness-Gerät, KEIN Medizinprodukt). 5 Heizstufen, 8000 mAh Akku, USB-C aufladbar.

## 4-9. (Vorlage — anwaltliche Prüfung ausstehend)

## 10. Streitbeilegung

EU-Verbraucherstreitbeilegung gilt. Ungarische Gerichte sind zuständig.

**HINWEIS**: Diese VORLAGE benötigt anwaltliche Prüfung vor Aktivierung.
',
  now()
),
(
  'adatvedelem', 'v1.0', 'hu',
  'Adatvédelmi tájékoztató',
  '# Adatvédelmi tájékoztató — v1.0

**Hatályos**: 2026-05-18 (TEMPLATE — jogász review kötelező)

## 1. Adatkezelő

EBC Wellness Kft. *(cégalapítás folyamatban)*
E-mail: hello@ebc-wellness.eu

## 2. Kezelt adatok kategóriái

| Cél | Adatkör | Jogalap | Megőrzés |
|-----|---------|---------|----------|
| Webshop rendelés | név, e-mail, cím, telefon | szerződés (GDPR 6.(1)(b)) | 8 év (számviteli tv.) |
| Hírlevél | e-mail, name | hozzájárulás (GDPR 6.(1)(a)) | visszavonásig |
| AI chat (Claude Haiku) | beszélgetés-tartalom | jogos érdek (GDPR 6.(1)(f)) | 90 nap |
| Telefon-AI (Retell) | hang-felvétel, transcript | hozzájárulás | 90 nap |
| GA / Meta Pixel | cookie-azonosító, IP | hozzájárulás (cookie-banner) | 30 nap-2 év |

## 3. Az érintettek jogai (GDPR 15-22. cikk)

- **Hozzáférés** (GDPR 15): saját adatok lekérése
- **Helyesbítés** (GDPR 16): hibás adatok javítása
- **Törlés** (GDPR 17): "elfeledtetéshez való jog" — kivéve a számviteli kötelezettség alá eső adatok
- **Korlátozás** (GDPR 18): adatkezelés szüneteltetése
- **Adathordozhatóság** (GDPR 20): adatok JSON-export
- **Tiltakozás** (GDPR 21): jogos érdek alapján kezelés esetén

A jogok gyakorlása: hello@ebc-wellness.eu vagy az admin-felület GDPR-szekciója.

## 4. Adattovábbítás 3. félnek

| Szolgáltató | Cél | Lokáció | Védelem |
|-------------|------|---------|---------|
| Supabase | adatbázis-hosting | EU-Frankfurt | SCC + adatkezelői szerződés |
| Stripe | fizetés | EU + USA | Standard Contractual Clauses |
| Anthropic | Claude AI (chat) | USA | DPA + 90-nap retencio |
| Resend | tranzakciós e-mail | EU-Dublin | DPA |
| Voyage AI | RAG embedding | USA | Az embedding-szöveg nem PII |
| Meta / TikTok / Google | marketing pixel | USA | cookie-banner hozzájárulás kötelező |
| Retell + Twilio | telefon-AI | USA + EU | hang-felvétel hozzájárulás kötelező |

## 5. Adatvédelmi tisztviselő

A NAIH felügyeli az adatkezelést. Panasz: https://naih.hu

**FIGYELEM**: Ez TEMPLATE. Jogász-review után élesedik.
',
  now()
),
(
  'adatvedelem', 'v1.0', 'en',
  'Privacy Policy',
  '# Privacy Policy — v1.0

**Effective date**: 2026-05-18 (TEMPLATE)

## 1. Controller

EBC Wellness Kft. *(registration in progress)*
E-mail: hello@ebc-wellness.eu

## 2. Data categories

| Purpose | Data | Legal basis | Retention |
|---------|------|-------------|-----------|
| Webshop order | name, e-mail, address, phone | contract (GDPR 6(1)(b)) | 8 years (HU accounting law) |
| Newsletter | e-mail | consent (GDPR 6(1)(a)) | until revocation |
| AI chat (Claude) | conversation | legitimate interest (GDPR 6(1)(f)) | 90 days |
| Phone-AI (Retell) | recording, transcript | consent | 90 days |

## 3. Data subject rights (GDPR Art. 15-22)

Access, rectification, erasure, restriction, portability, objection.

Contact: hello@ebc-wellness.eu or admin panel GDPR section.

**NOTICE**: Pre-legal-review TEMPLATE.
',
  now()
),
(
  'adatvedelem', 'v1.0', 'de',
  'Datenschutzerklärung',
  '# Datenschutzerklärung — v1.0

**Gültig ab**: 2026-05-18 (VORLAGE)

## 1. Verantwortlicher

EBC Wellness Kft. *(Eintragung in Bearbeitung)*
E-Mail: hello@ebc-wellness.eu

## 2. Datenkategorien

(Tabelle wie EN/HU)

## 3. Betroffenenrechte (DSGVO Art. 15-22)

Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch.

Kontakt: hello@ebc-wellness.eu

**HINWEIS**: Vorlage — anwaltliche Prüfung ausstehend.
',
  now()
),
(
  'cookie-tajekoztato', 'v1.0', 'hu',
  'Cookie-tájékoztató',
  '# Cookie-tájékoztató — v1.0

**Hatályos**: 2026-05-18 (TEMPLATE)

## Mit használunk?

| Kategória | Cookie-név | Cél | TTL | Hozzájárulás |
|-----------|-----------|-----|-----|--------------|
| **Szükséges** | `sb-*`, `_csrf` | bejelentkezés, biztonság | session | NEM kérdezett |
| **Funkcionális** | `ebc_theme`, `ebc_palette` | UI-beállítások | 30 nap | NEM kérdezett |
| **Analitika** | `_ga`, `_gid` (Google Analytics) | látogatottság-mérés | 2 év | **OPT-IN kötelező** |
| **Marketing** | `_fbp` (Meta Pixel), `ttq` (TikTok), `gtag` (Google Ads) | reklám-attribució | 30 nap-2 év | **OPT-IN kötelező** |
| **UTM** | `ebc_utm` | kampány-attribució (saját) | 30 nap | NEM kérdezett (anonim) |

## Hozzájárulás kezelése

A cookie-banner az első látogatáskor jelenik meg. Lehetőségek:
- **Mind elfogadom** — minden kategória aktiválás
- **Csak szükségesek** — csak technikailag szükséges cookie-k
- **Testreszabás** — kategóriánkénti opt-in

A választás bármikor módosítható a footerben a "Cookie-beállítások" linken keresztül.

## Adatok továbbítása

Az analitikai és marketing cookie-k adatait Meta, TikTok, Google szervereken (USA) dolgozzuk fel. SCC + adatfeldolgozói szerződés.

**FIGYELEM**: TEMPLATE — jogász review kötelező.
',
  now()
),
(
  'cookie-tajekoztato', 'v1.0', 'en',
  'Cookie Notice',
  '# Cookie Notice — v1.0

**Effective date**: 2026-05-18

## Categories

| Category | Examples | Purpose | TTL | Consent |
|----------|----------|---------|-----|---------|
| Necessary | `sb-*`, `_csrf` | login, security | session | none |
| Functional | `ebc_theme`, `ebc_palette` | UI prefs | 30d | none |
| Analytics | `_ga`, `_gid` | site analytics | 2 yr | **opt-in** |
| Marketing | `_fbp`, `ttq`, `gtag` | ad attribution | 30d-2yr | **opt-in** |
| UTM | `ebc_utm` | own campaign | 30d | none (anon) |

Adjust your choice anytime via the footer "Cookie settings" link.

**NOTICE**: Template — pending legal review.
',
  now()
),
(
  'cookie-tajekoztato', 'v1.0', 'de',
  'Cookie-Hinweis',
  '# Cookie-Hinweis — v1.0

**Gültig ab**: 2026-05-18

## Kategorien

(wie EN)

**HINWEIS**: Vorlage — anwaltliche Prüfung ausstehend.
',
  now()
)
on conflict (slug, version, locale) do nothing;
