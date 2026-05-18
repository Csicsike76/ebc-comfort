-- 0016_reseed_legal_documents_utf8.sql
-- Re-seed 0015 with proper UTF-8 encoding (previous apply via PowerShell
-- ConvertTo-Json corrupted Hungarian/German diacritics → U+FFFD).
-- Strategy: DELETE prior corrupted v1.0 rows, then INSERT fresh v1.0
-- with explicit UTF-8 string literals.
-- Created: 2026-05-18

-- Wipe corrupted v1.0 rows (keeps schema + any post-review v1.1+ untouched)
delete from public.legal_documents where version = 'v1.0';

-- ============================================================
-- HU — ÁSZF v1.0
-- ============================================================
insert into public.legal_documents (slug, version, locale, title, body_markdown, published_at)
values (
  'aszf', 'v1.0', 'hu',
  'Általános Szerződési Feltételek (ÁSZF)',
  E'# Általános Szerződési Feltételek (ÁSZF) — v1.0\n\n**Hatályos**: 2026-05-18 (TEMPLATE — jogász review kötelező)\n\n## 1. Szolgáltató\n\nEBC Wellness Kft. *(cégalapítás folyamatban)*\nSzékhely: *(megjelölés cégalapítás után)*\nCégjegyzékszám: *(megjelölés cégalapítás után)*\nAdószám: *(megjelölés cégalapítás után)*\nE-mail: hello@ebc-wellness.eu\n\n## 2. A szerződés tárgya\n\nA jelen ÁSZF az EBC Comfort wellness-eszköz online értékesítésének feltételeit szabályozza a https://ebc-comfort.netlify.app weboldalon.\n\n## 3. Termék\n\n**EBC Comfort** — fűthető komfortbetét (wellness-eszköz, NEM orvosi eszköz). 5 hőfokozat, 8000 mAh akku, USB-C tölthető. Részletek: [Termék-oldal](/hu/termek).\n\n## 4. Megrendelés\n\nA megrendelést a weboldalon keresztül lehet leadni. A megrendelés visszaigazolása automatikus e-mail formájában történik. A szerződés a fizetés sikeres teljesítésével jön létre.\n\n## 5. Árak és fizetés\n\nAz árak EUR-ban értendők, az ÁFA 27%-ot tartalmazzák. Fizetési módok: bankkártya (Stripe), SimplePay, Klarna BNPL.\n\n## 6. Szállítás\n\nEU-szintű szállítás, 2-5 munkanap, €15 szállítási díj. Magyarországon a kézbesítés futárszolgálattal történik (GLS, DPD).\n\n## 7. Elállás (14 nap)\n\nA fogyasztói elállási jog 14 napon belül gyakorolható, indoklás nélkül. Az elállás bejelentését írásban kell megküldeni a hello@ebc-wellness.eu címre. A termék visszaküldési költsége a vásárlót terheli.\n\n**Higiéniai okból**: ha a terméket használatba vettük, az elállási jog korlátozott. A bontatlan eredeti csomagolásban visszaküldött termék mindig visszafogadható.\n\n## 8. Garancia\n\n24 hónap gyártói garancia (jótállás). Részletek: [GY.I.K. → Garancia](/hu/gyik).\n\n## 9. Adatkezelés\n\nAz adatkezelési tájékoztató külön dokumentumban: [Adatvédelem](/hu/adatvedelem).\n\n## 10. Vitarendezés\n\nVita esetén a fogyasztó a Békéltető Testülethez vagy a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhat. Vagyontárgyban okozott kár esetén a magyar bíróságok illetékesek.\n\n**FIGYELEM**: Ez a dokumentum jogász-review előtti TEMPLATE. Élesedés előtt jogászi átnézés kötelező.\n',
  now()
);

-- ============================================================
-- EN — Terms of Service v1.0
-- ============================================================
insert into public.legal_documents (slug, version, locale, title, body_markdown, published_at)
values (
  'aszf', 'v1.0', 'en',
  'Terms of Service',
  E'# Terms of Service — v1.0\n\n**Effective date**: 2026-05-18 (TEMPLATE — pending legal review)\n\n## 1. Provider\n\nEBC Wellness Kft. *(registration in progress)*\nE-mail: hello@ebc-wellness.eu\n\n## 2. Subject\n\nThese Terms govern the online sale of the EBC Comfort wellness device at https://ebc-comfort.netlify.app.\n\n## 3. Product\n\n**EBC Comfort** — heated comfort pad (wellness device, NOT a medical device). 5 heat levels, 8000 mAh battery, USB-C rechargeable.\n\n## 4-9. (template — pending legal review)\n\n## 10. Disputes\n\nEU consumer dispute resolution applies. Hungarian courts have jurisdiction.\n\n**NOTICE**: This document is a pre-legal-review TEMPLATE. Lawyer review is required before activation.\n',
  now()
);

-- ============================================================
-- DE — AGB v1.0
-- ============================================================
insert into public.legal_documents (slug, version, locale, title, body_markdown, published_at)
values (
  'aszf', 'v1.0', 'de',
  'Allgemeine Geschäftsbedingungen (AGB)',
  E'# Allgemeine Geschäftsbedingungen (AGB) — v1.0\n\n**Gültig ab**: 2026-05-18 (VORLAGE — anwaltliche Prüfung ausstehend)\n\n## 1. Anbieter\n\nEBC Wellness Kft. *(Eintragung in Bearbeitung)*\nE-Mail: hello@ebc-wellness.eu\n\n## 2. Gegenstand\n\nDiese AGB regeln den Online-Verkauf des EBC Comfort Wellness-Geräts auf https://ebc-comfort.netlify.app.\n\n## 3. Produkt\n\n**EBC Comfort** — beheizbares Komfort-Pad (Wellness-Gerät, KEIN Medizinprodukt). 5 Heizstufen, 8000 mAh Akku, USB-C aufladbar.\n\n## 4-9. (Vorlage — anwaltliche Prüfung ausstehend)\n\n## 10. Streitbeilegung\n\nEU-Verbraucherstreitbeilegung gilt. Ungarische Gerichte sind zuständig.\n\n**HINWEIS**: Diese VORLAGE benötigt anwaltliche Prüfung vor Aktivierung.\n',
  now()
);

-- ============================================================
-- HU — Adatvédelmi tájékoztató v1.0
-- ============================================================
insert into public.legal_documents (slug, version, locale, title, body_markdown, published_at)
values (
  'adatvedelem', 'v1.0', 'hu',
  'Adatvédelmi tájékoztató',
  E'# Adatvédelmi tájékoztató — v1.0\n\n**Hatályos**: 2026-05-18 (TEMPLATE — jogász review kötelező)\n\n## 1. Adatkezelő\n\nEBC Wellness Kft. *(cégalapítás folyamatban)*\nE-mail: hello@ebc-wellness.eu\n\n## 2. Kezelt adatok kategóriái\n\n| Cél | Adatkör | Jogalap | Megőrzés |\n|-----|---------|---------|----------|\n| Webshop rendelés | név, e-mail, cím, telefon | szerződés (GDPR 6.(1)(b)) | 8 év (számviteli tv.) |\n| Hírlevél | e-mail, name | hozzájárulás (GDPR 6.(1)(a)) | visszavonásig |\n| AI chat (Claude Haiku) | beszélgetés-tartalom | jogos érdek (GDPR 6.(1)(f)) | 90 nap |\n| Telefon-AI (Retell) | hang-felvétel, transcript | hozzájárulás | 90 nap |\n| GA / Meta Pixel | cookie-azonosító, IP | hozzájárulás (cookie-banner) | 30 nap-2 év |\n\n## 3. Az érintettek jogai (GDPR 15-22. cikk)\n\n- **Hozzáférés** (GDPR 15): saját adatok lekérése\n- **Helyesbítés** (GDPR 16): hibás adatok javítása\n- **Törlés** (GDPR 17): "elfeledtetéshez való jog" — kivéve a számviteli kötelezettség alá eső adatok\n- **Korlátozás** (GDPR 18): adatkezelés szüneteltetése\n- **Adathordozhatóság** (GDPR 20): adatok JSON-export\n- **Tiltakozás** (GDPR 21): jogos érdek alapján kezelés esetén\n\nA jogok gyakorlása: hello@ebc-wellness.eu vagy az admin-felület GDPR-szekciója.\n\n## 4. Adattovábbítás 3. félnek\n\n| Szolgáltató | Cél | Lokáció | Védelem |\n|-------------|------|---------|---------|\n| Supabase | adatbázis-hosting | EU-Frankfurt | SCC + adatkezelői szerződés |\n| Stripe | fizetés | EU + USA | Standard Contractual Clauses |\n| Anthropic | Claude AI (chat) | USA | DPA + 90-nap retencio |\n| Resend | tranzakciós e-mail | EU-Dublin | DPA |\n| Voyage AI | RAG embedding | USA | Az embedding-szöveg nem PII |\n| Meta / TikTok / Google | marketing pixel | USA | cookie-banner hozzájárulás kötelező |\n| Retell + Twilio | telefon-AI | USA + EU | hang-felvétel hozzájárulás kötelező |\n\n## 5. Adatvédelmi tisztviselő\n\nA NAIH felügyeli az adatkezelést. Panasz: https://naih.hu\n\n**FIGYELEM**: Ez TEMPLATE. Jogász-review után élesedik.\n',
  now()
);

-- ============================================================
-- EN — Privacy Policy v1.0
-- ============================================================
insert into public.legal_documents (slug, version, locale, title, body_markdown, published_at)
values (
  'adatvedelem', 'v1.0', 'en',
  'Privacy Policy',
  E'# Privacy Policy — v1.0\n\n**Effective date**: 2026-05-18 (TEMPLATE)\n\n## 1. Controller\n\nEBC Wellness Kft. *(registration in progress)*\nE-mail: hello@ebc-wellness.eu\n\n## 2. Data categories\n\n| Purpose | Data | Legal basis | Retention |\n|---------|------|-------------|-----------|\n| Webshop order | name, e-mail, address, phone | contract (GDPR 6(1)(b)) | 8 years (HU accounting law) |\n| Newsletter | e-mail | consent (GDPR 6(1)(a)) | until revocation |\n| AI chat (Claude) | conversation | legitimate interest (GDPR 6(1)(f)) | 90 days |\n| Phone-AI (Retell) | recording, transcript | consent | 90 days |\n\n## 3. Data subject rights (GDPR Art. 15-22)\n\nAccess, rectification, erasure, restriction, portability, objection.\n\nContact: hello@ebc-wellness.eu or admin panel GDPR section.\n\n**NOTICE**: Pre-legal-review TEMPLATE.\n',
  now()
);

-- ============================================================
-- DE — Datenschutzerklärung v1.0
-- ============================================================
insert into public.legal_documents (slug, version, locale, title, body_markdown, published_at)
values (
  'adatvedelem', 'v1.0', 'de',
  'Datenschutzerklärung',
  E'# Datenschutzerklärung — v1.0\n\n**Gültig ab**: 2026-05-18 (VORLAGE)\n\n## 1. Verantwortlicher\n\nEBC Wellness Kft. *(Eintragung in Bearbeitung)*\nE-Mail: hello@ebc-wellness.eu\n\n## 2. Datenkategorien\n\n(Tabelle wie EN/HU)\n\n## 3. Betroffenenrechte (DSGVO Art. 15-22)\n\nAuskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch.\n\nKontakt: hello@ebc-wellness.eu\n\n**HINWEIS**: Vorlage — anwaltliche Prüfung ausstehend.\n',
  now()
);

-- ============================================================
-- HU — Cookie-tájékoztató v1.0
-- ============================================================
insert into public.legal_documents (slug, version, locale, title, body_markdown, published_at)
values (
  'cookie-tajekoztato', 'v1.0', 'hu',
  'Cookie-tájékoztató',
  E'# Cookie-tájékoztató — v1.0\n\n**Hatályos**: 2026-05-18 (TEMPLATE)\n\n## Mit használunk?\n\n| Kategória | Cookie-név | Cél | TTL | Hozzájárulás |\n|-----------|-----------|-----|-----|--------------|\n| **Szükséges** | `sb-*`, `_csrf` | bejelentkezés, biztonság | session | NEM kérdezett |\n| **Funkcionális** | `ebc_theme`, `ebc_palette` | UI-beállítások | 30 nap | NEM kérdezett |\n| **Analitika** | `_ga`, `_gid` (Google Analytics) | látogatottság-mérés | 2 év | **OPT-IN kötelező** |\n| **Marketing** | `_fbp` (Meta Pixel), `ttq` (TikTok), `gtag` (Google Ads) | reklám-attribúció | 30 nap-2 év | **OPT-IN kötelező** |\n| **UTM** | `ebc_utm` | kampány-attribúció (saját) | 30 nap | NEM kérdezett (anonim) |\n\n## Hozzájárulás kezelése\n\nA cookie-banner az első látogatáskor jelenik meg. Lehetőségek:\n- **Mind elfogadom** — minden kategória aktiválás\n- **Csak szükségesek** — csak technikailag szükséges cookie-k\n- **Testreszabás** — kategóriánkénti opt-in\n\nA választás bármikor módosítható a footerben a "Cookie-beállítások" linken keresztül.\n\n## Adatok továbbítása\n\nAz analitikai és marketing cookie-k adatait Meta, TikTok, Google szervereken (USA) dolgozzuk fel. SCC + adatfeldolgozói szerződés.\n\n**FIGYELEM**: TEMPLATE — jogász review kötelező.\n',
  now()
);

-- ============================================================
-- EN — Cookie Notice v1.0
-- ============================================================
insert into public.legal_documents (slug, version, locale, title, body_markdown, published_at)
values (
  'cookie-tajekoztato', 'v1.0', 'en',
  'Cookie Notice',
  E'# Cookie Notice — v1.0\n\n**Effective date**: 2026-05-18\n\n## Categories\n\n| Category | Examples | Purpose | TTL | Consent |\n|----------|----------|---------|-----|---------|\n| Necessary | `sb-*`, `_csrf` | login, security | session | none |\n| Functional | `ebc_theme`, `ebc_palette` | UI prefs | 30d | none |\n| Analytics | `_ga`, `_gid` | site analytics | 2 yr | **opt-in** |\n| Marketing | `_fbp`, `ttq`, `gtag` | ad attribution | 30d-2yr | **opt-in** |\n| UTM | `ebc_utm` | own campaign | 30d | none (anon) |\n\nAdjust your choice anytime via the footer "Cookie settings" link.\n\n**NOTICE**: Template — pending legal review.\n',
  now()
);

-- ============================================================
-- DE — Cookie-Hinweis v1.0
-- ============================================================
insert into public.legal_documents (slug, version, locale, title, body_markdown, published_at)
values (
  'cookie-tajekoztato', 'v1.0', 'de',
  'Cookie-Hinweis',
  E'# Cookie-Hinweis — v1.0\n\n**Gültig ab**: 2026-05-18\n\n## Kategorien\n\n(wie EN)\n\n**HINWEIS**: Vorlage — anwaltliche Prüfung ausstehend.\n',
  now()
);
