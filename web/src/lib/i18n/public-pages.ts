/**
 * Public-page i18n for /termek, /gyik, /tamogatas, /rolunk.
 * HU + EN cover the launch market richly; other locales fall back to EN
 * (consistent with the cart.ts pattern). Native translators can replace
 * the EN fallback at any time without changing the page TSX.
 */
import type { Locale } from './config';

export interface FaqItem {
  q: string;
  a: string;
}

export interface PublicPagesDict {
  termek: {
    benefits_title: string;
    benefits: readonly string[];
    medical_disclaimer: string;
    pre_launch_note: string;
    add_to_cart: string;
    specs_title: string;
    spec_labels: {
      weight: string;
      dimensions: string;
      warranty: string;
      temp_levels: string;
      temp_accuracy: string;
      battery: string;
      runtime: string;
      charging: string;
      output: string;
      heating_element: string;
      cable: string;
      strap: string;
      gel_pad: string;
      protection: string;
      color: string;
      cert: string;
    };
    description_title: string;
  };
  gyik: {
    title: string;
    intro: string;
    intro_email_label: string;
    disclaimer: string;
    items: readonly FaqItem[];
  };
  tamogatas: {
    title: string;
    subtitle: string;
    form_section_title: string;
    field_full_name: string;
    field_email: string;
    field_phone: string;
    field_reason: string;
    submit: string;
    submitted_ok: string;
    newsletter_title: string;
    newsletter_intro: string;
    newsletter_email: string;
    newsletter_topic: string;
    newsletter_submit: string;
    program_note: string;
  };
  rolunk: {
    title: string;
    intro: string;
    story_title: string;
    story_p1: string;
    story_p2: string;
    team_title: string;
    team_ildi: string;
    team_zsolt: string;
    promise_title: string;
    promise_discretion_h: string;
    promise_discretion: string;
    promise_transparency_h: string;
    promise_transparency: string;
    promise_ngo_h: string;
    promise_ngo: string;
    promise_eu_h: string;
    promise_eu: string;
    contact_title: string;
    contact_email_label: string;
    contact_support_label: string;
    contact_ai_label: string;
    contact_hq_label: string;
    footer_disclaimer: string;
  };
}

const en: PublicPagesDict = {
  termek: {
    benefits_title: 'What it does',
    benefits: [
      'Lower-abdominal warmth comfort with natural heat therapy',
      'Discreet — invisible under underwear',
      'Quiet — silent at the workplace or while travelling',
      'Replaceable silicone surface — easy to clean',
      'Overheat protection — safe for continuous use',
      'USB-C rechargeable — fast and modern',
    ],
    medical_disclaimer:
      'EBC Comfort is a wellness device, NOT a medical device. For health concerns please consult a healthcare professional. Recommended for users 18+.',
    pre_launch_note:
      'Pre-launch phase. Stripe configuration is being finalised — checkout may run in placeholder mode; real card capture starts at launch.',
    add_to_cart: 'Add to cart',
    specs_title: 'Specifications',
    spec_labels: {
      weight: 'Weight',
      dimensions: 'Dimensions',
      warranty: 'Warranty',
      temp_levels: 'Heat levels',
      temp_accuracy: 'Temperature accuracy',
      battery: 'Battery',
      runtime: 'Runtime',
      charging: 'Charging',
      output: 'Output',
      heating_element: 'Heating element',
      cable: 'Cable',
      strap: 'Strap',
      gel_pad: 'Gel pad',
      protection: 'Protection',
      color: 'Colour',
      cert: 'Certification',
    },
    description_title: 'Description',
  },
  gyik: {
    title: 'Frequently asked questions',
    intro:
      'If you don’t find the answer, ask the AI assistant (bottom-right) or',
    intro_email_label: 'send us an email',
    disclaimer:
      'The FAQ content is general information. EBC Comfort is a wellness device, NOT a medical device. For health concerns please consult a healthcare professional.',
    items: [
      { q: 'What is EBC Comfort for?', a: 'It provides discreet, portable warmth to the lower abdominal area. A wellness device — for comfort and heat-therapy purposes. NOT a medical device.' },
      { q: 'Is it really invisible under clothes?', a: 'Yes. Thin silicone surface (~12 mm), 70 mm wide, 140 mm long. Attached to your underwear, it doesn’t show under trousers or skirts. Silent operation (no vibration).' },
      { q: 'How many heat levels? How warm does it get?', a: '5 heat levels: **50°C / 55°C / 60°C / 65°C / 70°C**. Automatic overheat protection ensures safety. Recommended: 20-30 minutes per session.' },
      { q: 'How long does the battery last?', a: '8000 mAh Li-ion battery. Up to 10 hours on the lowest setting, ~3 hours on the highest. USB-C charging takes ~3 hours for a full charge.' },
      { q: 'Is it washable?', a: 'The silicone surface is replaceable and easy to hand-wash with lukewarm water and soap. The heating module CANNOT be submerged — wipe it with a damp cloth only.' },
      { q: 'What is the shipping time?', a: 'The product is currently in pre-launch. The webshop goes live in Q3 2026 (expected Aug-Sep). Subscribe on the Support page — we’ll notify you when it’s available.' },
      { q: 'Warranty?', a: '24 months EU consumer warranty (Directive 2019/771). Free replacement or repair for defective units. Return address and RMA process by email after purchase.' },
      { q: 'How can I apply for the support programme?', a: 'The low-income support programme is available on the Support page. Fill in the request form — we reply by email within 7-14 days. Every 20th paid order funds one free unit for someone in need.' },
      { q: 'Wellness or medical device?', a: 'EBC Comfort is a **wellness device** for general lower-abdominal heat comfort. NOT a medical device — we do not promise cures or specific medical symptom relief. For health concerns please consult a healthcare professional.' },
      { q: 'What about GDPR / data processing?', a: 'Data is stored on EU-Frankfurt servers (Supabase). We only ask for your email if you subscribe to the newsletter. Order data is kept for 8 years (Hungarian accounting law). Access request, deletion request: hello@ebc-wellness.eu.' },
      { q: 'What payment methods will you accept?', a: 'Stripe (cards), SimplePay (HU), and Klarna (BNPL) at Q3 2026 launch. Invoices issued through EBC Wellness Kft. (registration in progress).' },
      { q: 'Where is it manufactured?', a: 'In China (DongGuan) — verified manufacturing partner Andrew. CE-LVD/EMC + RoHS + REACH compliance. Hungarian R&D, Hungarian patent, EU distribution.' },
      { q: 'Where can I see the patent?', a: 'Hungarian U2400230 (granted 2024-11-15) — National Office for Intellectual Property (SZTNH). PCT/IB2025/052633 — WIPO Patentscope. Details: hello@ebc-wellness.eu.' },
    ],
  },
  tamogatas: {
    title: 'Support',
    subtitle:
      'Low-income support programme and newsletter sign-up. Every 20th paid order funds one free unit for someone in need.',
    form_section_title: 'Support request',
    field_full_name: 'Full name',
    field_email: 'Email',
    field_phone: 'Phone (optional)',
    field_reason: 'Reason (please describe your situation, min. 50 characters)',
    submit: 'Submit request',
    submitted_ok: 'Thank you — we’ll reply within 7-14 days.',
    newsletter_title: 'Newsletter sign-up',
    newsletter_intro: 'Pre-launch updates, launch notification, donation reports.',
    newsletter_email: 'Email',
    newsletter_topic: 'Topic',
    newsletter_submit: 'Subscribe',
    program_note:
      'Privacy: your data is stored on EU-Frankfurt servers. We never share it with third parties.',
  },
  rolunk: {
    title: 'About us',
    intro:
      'EBC Wellness — a Hungarian inventor, a simple idea, and 2.5 years of development. The EBC Comfort heated comfort pad is a discreet companion for women’s everyday life.',
    story_title: 'The story',
    story_p1:
      'The idea was born when the inventor — Ildi — experienced first-hand how few discreet, portable heat-therapy solutions exist for women. Not a heat-pack in the bag, not a large heating pillow at home — something that is there, when needed, that no one notices.',
    story_p2:
      '2.5 years of development. **Hungarian U2400230 utility model patent** granted (2024-11-15) + **PCT/IB2025/052633** international patent application pending. Prototype TRL 4-5 (working, validated). Chinese manufacturing partner (Andrew, DongGuan) — first batch 2000 units, Q3 2026 launch.',
    team_title: 'The team',
    team_ildi: '**Balog Ildikó** — inventor, lead designer, 66% ownership. 2.5 years of active development from concept to prototype.',
    team_zsolt: '**Oláh Zsolt Péter** — co-founder, business operations, 33% ownership. AI-driven platform, marketing, manufacturer negotiation.',
    promise_title: 'What we promise',
    promise_discretion_h: 'Discretion',
    promise_discretion: 'Data handling, packaging, communication. What stays with us, stays here.',
    promise_transparency_h: 'Transparency',
    promise_transparency:
      'Wellness device, NOT medical. We do not promise cures. We offer comfort, nothing else.',
    promise_ngo_h: 'NGO team',
    promise_ngo:
      'Every 20th order funds one free unit for someone in need. The model is part of the brand, not a marketing trick.',
    promise_eu_h: 'EU compliance',
    promise_eu:
      'CE-LVD/EMC + RoHS + REACH SVHC declaration. Hungarian IP, Chinese manufacturing, EU distribution.',
    contact_title: 'Contact',
    contact_email_label: 'Email',
    contact_support_label: 'Support request',
    contact_ai_label: 'AI assistant: bottom-right (Claude Haiku, HU/EN/DE)',
    contact_hq_label: 'Hungary (company registration in progress — EBC Wellness Kft.)',
    footer_disclaimer:
      'EBC Comfort is a wellness device, NOT a medical device. The information shared on this page does not replace medical advice.',
  },
};

const hu: PublicPagesDict = {
  termek: {
    benefits_title: 'Mire jó?',
    benefits: [
      'Alhasi komfort-érzés természetes hőterápiával',
      'Diszkrét — fehérnemű alatt láthatatlan',
      'Csendes — munkahelyen vagy utazás közben sem hallható',
      'Cserélhető szilikon felület — könnyen tisztítható',
      'Túlmelegedés-védelem — biztonságos folyamatos viselet',
      'USB-C tölthető — gyors, modern',
    ],
    medical_disclaimer:
      'EBC Comfort wellness-eszköz, NEM orvosi eszköz. Egészségügyi panasz esetén keress fel szakorvost. 18+ felhasználóknak ajánlott.',
    pre_launch_note:
      'Pre-launch fázis. Stripe-konfiguráció finalizálás alatt — a fizetés a végén placeholder-üzemmódban lehet még; valós kártya-terhelés csak a launch-kor.',
    add_to_cart: 'Kosárba',
    specs_title: 'Specifikációk',
    spec_labels: {
      weight: 'Súly',
      dimensions: 'Méret',
      warranty: 'Garancia',
      temp_levels: 'Hőfokozat',
      temp_accuracy: 'Hőmérséklet-pontosság',
      battery: 'Akkumulátor',
      runtime: 'Üzemidő',
      charging: 'Töltés',
      output: 'Kimenet',
      heating_element: 'Hőelem mérete',
      cable: 'Kábel',
      strap: 'Rögzítés',
      gel_pad: 'Gél-betét',
      protection: 'Védelem',
      color: 'Szín',
      cert: 'Tanúsítvány',
    },
    description_title: 'Leírás',
  },
  gyik: {
    title: 'Gyakori kérdések',
    intro: 'Ha nem találod a választ, kérdezz az AI-asszisztenstől (jobb-alsó sarok) vagy',
    intro_email_label: 'írj e-mailt',
    disclaimer:
      'A GY.I.K. tartalom általános tájékoztatás. EBC Comfort wellness-eszköz, NEM orvosi eszköz. Egészségügyi panasz esetén keress fel szakorvost.',
    items: [
      { q: 'Mire jó az EBC Comfort?', a: 'Diszkrét, hordozható hőmelegítést biztosít az alhasi régióban. Wellness-eszköz — komfort-érzés és hőterápia céljából használható. NEM orvosi eszköz.' },
      { q: 'Tényleg láthatatlan a ruha alatt?', a: 'Igen. Vékony szilikon felület (~12 mm), 70 mm széles, 140 mm hosszú. Fehérneműhöz rögzítve sem nadrágon, sem szoknyán nem látszik. Csendes (rezgés nélküli) működés.' },
      { q: 'Hány fokozatos? Milyen meleg lesz?', a: '5 hőfokozat: **50°C / 55°C / 60°C / 65°C / 70°C**. Automatikus túlmelegedés-védelem garantáltja a biztonságot. Javasolt: 20-30 perc / alkalom.' },
      { q: 'Meddig tart az akkumulátor?', a: '8000 mAh Li-ion akkumulátor. Alacsony fokozaton akár 10 óra, magas fokozaton ~3 óra. USB-C töltés, kb. 3 óra teljes feltöltés.' },
      { q: 'Mosható?', a: 'A szilikon felület cserélhető és kézzel könnyen tisztítható langyos vízzel + szappannal. A fűtő-rész NEM merülhet vízbe — csak nedves ruhával törölhető.' },
      { q: 'Mennyi a szállítási idő?', a: 'A termék jelenleg pre-launch fázisban van. Q3 2026-ban indul a webshop (várhatóan augusztus-szeptember). Feliratkozni a Támogatás oldalon lehet — értesítünk, amint elérhető.' },
      { q: 'Garancia?', a: '24 hónap EU fogyasztói jótállás (Dir. 2019/771). Hibás termék esetén ingyenes csere vagy javítás. Visszaküldési cím + RMA-folyamat a vásárlás után, e-mailben.' },
      { q: 'Hogyan tudok támogatást kérni a programon keresztül?', a: 'Az alacsony jövedelmű támogatási program a Támogatás oldalon érhető el. Töltsd ki a kérvény-űrlapot — 7-14 napon belül e-mailben válaszolunk. Minden 20. fizetős rendelés után egy darabot rászorulónak adunk át.' },
      { q: 'Wellness vagy orvosi eszköz?', a: 'EBC Comfort **wellness-eszköz**, általános alhasi hőkomfort biztosítására. NEM orvosi eszköz, és NEM ígérünk gyógyítást vagy specifikus orvosi tünet-enyhítést. Egészségügyi panasz esetén keress fel szakorvost.' },
      { q: 'Mi az adatkezelés? GDPR?', a: 'EU-Frankfurt szervereken tároljuk az adatokat (Supabase). Csak az email-címedet kérjük, ha hírlevélre iratkozol. A rendelés-adatok 8 évig megőrződnek (magyar számviteli kötelezettség). Hozzáférés-kérés, törlés-kérés: hello@ebc-wellness.eu.' },
      { q: 'Milyen fizetési módok lesznek?', a: 'Stripe (bankkártya), SimplePay (HU), és Klarna (BNPL — részlet-fizetés) integráció Q3 2026-ban. Számlát az EBC Wellness Kft.-n keresztül állítunk ki (cégalapítás folyamatban).' },
      { q: 'Hol gyártják?', a: 'Kínában (DongGuan) — Andrew, ellenőrzött gyártó partner. CE-LVD/EMC + RoHS + REACH minősítés. Magyar fejlesztés, magyar szabadalom, EU-disztribúció.' },
      { q: 'Hogy nézhetem meg a szabadalmat?', a: 'Magyar U2400230 (megadva 2024-11-15) — Szellemi Tulajdon Nemzeti Hivatala (SZTNH). PCT/IB2025/052633 — WIPO Patentscope. Részletekért: hello@ebc-wellness.eu.' },
    ],
  },
  tamogatas: {
    title: 'Támogatás',
    subtitle:
      'Alacsony jövedelmű támogatási program és hírlevél-feliratkozás. Minden 20. fizetős rendelés egy ingyenes darabot finanszíroz egy rászorulónak.',
    form_section_title: 'Támogatási kérvény',
    field_full_name: 'Teljes név',
    field_email: 'E-mail',
    field_phone: 'Telefon (opcionális)',
    field_reason: 'Indoklás (kérlek írd le a helyzeted, min. 50 karakter)',
    submit: 'Kérvény elküldése',
    submitted_ok: 'Köszönjük — 7-14 napon belül válaszolunk.',
    newsletter_title: 'Hírlevél-feliratkozás',
    newsletter_intro: 'Pre-launch frissítések, launch-értesítés, donation-jelentések.',
    newsletter_email: 'E-mail',
    newsletter_topic: 'Téma',
    newsletter_submit: 'Feliratkozom',
    program_note:
      'Adatkezelés: az adataidat EU-Frankfurt szervereken tároljuk. Harmadik félnek SOHA nem adjuk át.',
  },
  rolunk: {
    title: 'Rólunk',
    intro:
      'EBC Wellness — egy magyar feltaláló, egy egyszerű ötlet, és 2,5 év fejlesztés. Az EBC Comfort fűthető komfortbetét a női hétköznapok diszkrét segítője.',
    story_title: 'A történet',
    story_p1:
      'A termék ötlete onnan született, hogy a feltaláló — Ildi — saját bőrén tapasztalta meg, milyen kevés diszkrét, hordozható hőterápiás megoldás létezik női használatra. Nem heat-pack a táskában, nem nagyméretű melegítő-párna otthon — hanem valami, ami ott van, amikor szükség van rá, és senki sem veszi észre.',
    story_p2:
      '2,5 év fejlesztés. **Magyar U2400230 használati minta-szabadalom** megadva (2024-11-15) + **PCT/IB2025/052633** nemzetközi szabadalmi bejelentés folyamatban. Prototípus TRL 4-5 (működő, validált). Kínai gyártó-partner (Andrew, DongGuan) — első batch 2000 db, 2026 Q3 launch.',
    team_title: 'A csapat',
    team_ildi: '**Balog Ildikó** — feltaláló, vezető tervező, 66% tulajdoni hányad. 2,5 év aktív fejlesztés a koncepciótól a prototípusig.',
    team_zsolt: '**Oláh Zsolt Péter** — társalapító, üzleti operations, 33% tulajdoni hányad. AI-vezérelt platform, marketing, gyártó-tárgyalás.',
    promise_title: 'Mit ígérünk',
    promise_discretion_h: 'Diszkréció',
    promise_discretion: 'Adatkezelés, csomagolás, kommunikáció. Ami nálunk van, ott marad.',
    promise_transparency_h: 'Átláthatóság',
    promise_transparency:
      'Wellness-eszköz, NEM orvosi eszköz. Nem ígérünk gyógyhatást. Komfortot kínálunk, semmi mást.',
    promise_ngo_h: 'NGO-csapat',
    promise_ngo:
      'Minden 20. rendelés árából egy darab a rászorulóknak. A modell része a brandnek, nem külön marketinges trükk.',
    promise_eu_h: 'EU-megfelelőség',
    promise_eu:
      'CE-LVD/EMC + RoHS + REACH SVHC nyilatkozat. Magyar IP, kínai gyártás, EU-disztribúció.',
    contact_title: 'Kapcsolat',
    contact_email_label: 'E-mail',
    contact_support_label: 'Támogatási kérvény',
    contact_ai_label: 'AI-asszisztens: jobb-alsó sarok (Claude Haiku, HU/EN/DE)',
    contact_hq_label: 'Magyarország (cégalapítás folyamatban — EBC Wellness Kft.)',
    footer_disclaimer:
      'EBC Comfort wellness-eszköz, NEM orvosi eszköz. Az oldalon közölt információk nem helyettesítik a szakorvosi tanácsadást.',
  },
};

const DICTS: Partial<Record<Locale, PublicPagesDict>> = { en, hu };

export function getPublicPagesDict(locale: Locale): PublicPagesDict {
  return DICTS[locale] ?? en;
}
