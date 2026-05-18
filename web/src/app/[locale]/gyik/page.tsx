import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import PublicShell from '@/components/PublicShell';

interface Props {
  params: Promise<{ locale: string }>;
}

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'Mire jó az EBC Comfort?',
    a: 'Diszkrét, hordozható hőmelegítést biztosít az alhasi régióban. Wellness-eszköz — komfort-érzés és hőterápia céljából használható. NEM orvosi eszköz.',
  },
  {
    q: 'Tényleg láthatatlan a ruha alatt?',
    a: 'Igen. Vékony szilikon felület (~12 mm), 70 mm széles, 140 mm hosszú. Fehérneműhöz rögzítve sem nadrágon, sem szoknyán nem látszik. Csendes (rezgés nélküli) működés.',
  },
  {
    q: 'Hány fokozatos? Milyen meleg lesz?',
    a: '5 hőfokozat: **50°C / 55°C / 60°C / 65°C / 70°C**. Automatikus túlmelegedés-védelem garantáltja a biztonságot. Javasolt: 20-30 perc / alkalom.',
  },
  {
    q: 'Meddig tart az akkumulátor?',
    a: '8000 mAh Li-ion akkumulátor. Alacsony fokozaton akár 10 óra, magas fokozaton ~3 óra. USB-C töltés, kb. 3 óra teljes feltöltés.',
  },
  {
    q: 'Mosható?',
    a: 'A szilikon felület cserélhető és kézzel könnyen tisztítható langyos vízzel + szappannal. A fűtő-rész NEM merülhet vízbe — csak nedves ruhával törölhető.',
  },
  {
    q: 'Mennyi a szállítási idő?',
    a: 'A termék jelenleg pre-launch fázisban van. Q3 2026-ban indul a webshop (várhatóan augusztus-szeptember). Feliratkozni a Támogatás oldalon lehet — értesítünk, amint elérhető.',
  },
  {
    q: 'Garancia?',
    a: '24 hónap gyártói garancia. Hibás termék esetén ingyenes csere vagy javítás. Visszaküldési cím + RMA-folyamat a vásárlás után, e-mailben.',
  },
  {
    q: 'Hogyan tudok támogatást kérni a programon keresztül?',
    a: 'Az alacsony jövedelmű támogatási program a Támogatás oldalon érhető el. Töltsd ki a kérvény-űrlapot — 7-14 napon belül e-mailben válaszolunk. Minden 20. fizetős rendelés után egy darabot rászorulónak adunk át.',
  },
  {
    q: 'Wellness vagy orvosi eszköz?',
    a: 'EBC Comfort **wellness-eszköz**, általános alhasi hőkomfort biztosítására. NEM orvosi eszköz, és NEM ígérünk gyógyítást vagy specifikus orvosi tünet-enyhítést. Egészségügyi panasz esetén keress fel szakorvost.',
  },
  {
    q: 'Mi az adatkezelés? GDPR?',
    a: 'EU-Frankfurt szervereken tároljuk az adatokat (Supabase). Csak az email-címedet kérjük, ha hírlevélre iratkozol. A rendelés-adatok 8 évig megőrződnek (magyar számviteli kötelezettség). Hozzáférés-kérés, törlés-kérés: hello@ebc-wellness.eu.',
  },
  {
    q: 'Milyen fizetési módok lesznek?',
    a: 'Stripe (bankkártya), SimplePay (HU), és Klarna (BNPL — részlet-fizetés) integráció Q3 2026-ban. Számlát Magyar Mária Kft.-n keresztül állítunk ki (cégalapítás folyamatban: EBC Wellness Kft.).',
  },
  {
    q: 'Hol gyártják?',
    a: 'Kínában (DongGuan) — Andrew, ellenőrzött gyártó partner. CE-LVD/EMC + RoHS + REACH minősítés. Magyar fejlesztés, magyar szabadalom, EU-disztribúció.',
  },
  {
    q: 'Hogy nézhetem meg a szabadalmat?',
    a: 'Magyar U2400230 (megadva 2024-11-15) — Szellemi Tulajdon Nemzeti Hivatala (SZTNH). PCT/IB2025/052633 — WIPO Patentscope. Részletekért: hello@ebc-wellness.eu.',
  },
];

export default async function FaqPage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  return (
    <PublicShell locale={locale}>
      <div className="max-w-3xl mx-auto safe-x py-12 sm:py-16 space-y-4">
        <div className="glass-card p-7 sm:p-10 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Gyakori kérdések</h1>
          <p className="text-base text-[var(--color-muted)] leading-relaxed">
            Ha nem találod a választ, kérdezz az AI-asszisztenstől (jobb-alsó sarok) vagy{' '}
            <a href="mailto:hello@ebc-wellness.eu" className="underline">
              írj e-mailt
            </a>
            .
          </p>
        </div>

        {FAQS.map((f, i) => (
          <details key={i} className="glass-card p-5">
            <summary className="cursor-pointer font-semibold text-base">{f.q}</summary>
            <p className="mt-3 text-sm leading-relaxed">
              {f.a.split('**').map((chunk, idx) =>
                idx % 2 === 1 ? <strong key={idx}>{chunk}</strong> : chunk
              )}
            </p>
          </details>
        ))}

        <div className="glass-card p-5 mt-6 text-xs text-[var(--color-muted)] italic text-center">
          A GY.I.K. tartalom általános tájékoztatás. EBC Comfort wellness-eszköz, NEM orvosi
          eszköz. Egészségügyi panasz esetén keress fel szakorvost.
        </div>
      </div>
    </PublicShell>
  );
}
