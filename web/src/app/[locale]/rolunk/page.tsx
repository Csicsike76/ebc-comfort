import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import PublicShell from '@/components/PublicShell';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  return (
    <PublicShell locale={locale}>
      <article className="max-w-3xl mx-auto safe-x py-12 sm:py-16 space-y-8">
        <header className="glass-card p-7 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Rólunk</h1>
          <p className="text-base text-[var(--color-muted)] leading-relaxed">
            EBC Wellness — egy magyar feltaláló, egy egyszerű ötlet, és 2,5 év fejlesztés. Az EBC
            Comfort fűthető komfortbetét a női hétköznapok diszkrét segítője.
          </p>
        </header>

        <section className="glass-card p-7 sm:p-10 space-y-4">
          <h2 className="text-2xl font-bold">A történet</h2>
          <p>
            A termék ötlete onnan született, hogy a feltaláló — Ildi — saját bőrén tapasztalta meg,
            milyen kevés diszkrét, hordozható hőterápiás megoldás létezik női használatra. Nem
            heat-pack a táskában, nem nagyméretű melegítő-párna otthon — hanem valami, ami
            <em> ott van, amikor szükség van rá</em>, és senki sem veszi észre.
          </p>
          <p>
            2,5 év fejlesztés. <strong>Magyar U2400230 használati minta-szabadalom</strong>{' '}
            megadva (2024-11-15) + <strong>PCT/IB2025/052633</strong> nemzetközi szabadalmi
            bejelentés folyamatban. Prototípus TRL 4-5 (működő, validált). Kínai gyártó-partner
            (Andrew, DongGuan) — első batch 2000 db, 2026 Q3 launch.
          </p>
        </section>

        <section className="glass-card p-7 sm:p-10 space-y-4">
          <h2 className="text-2xl font-bold">A csapat</h2>
          <ul className="space-y-3">
            <li>
              <strong>Balog Ildikó</strong> — feltaláló, vezető tervező, 66% tulajdoni hányad.
              2,5 év aktív fejlesztés a koncepciótól a prototípusig.
            </li>
            <li>
              <strong>Oláh Zsolt Péter</strong> — társalapító, üzleti operations, 33% tulajdoni
              hányad. AI-vezérelt platform, marketing, gyártó-tárgyalás.
            </li>
          </ul>
        </section>

        <section className="glass-card p-7 sm:p-10 space-y-4">
          <h2 className="text-2xl font-bold">Mit ígérünk</h2>
          <ul className="space-y-3">
            <li>
              <strong>Diszkréció</strong> — adatkezelés, csomagolás, kommunikáció. Ami nálunk van,
              ott marad.
            </li>
            <li>
              <strong>Átláthatóság</strong> — wellness-eszköz, NEM orvosi. Nem ígérünk UTI-gyógyítást
              és nem akarjuk eladni a megválaszolatlan kérdéseket.
            </li>
            <li>
              <strong>NGO-csapat</strong> — minden 20. rendelés árából egy darab a rászorulóknak. A
              modell része a brandnek, nem külön marketinges trükk.
            </li>
            <li>
              <strong>EU-gyártott bizalom</strong> — CE-LVD/EMC + RoHS + REACH + ISO 10993
              biokompatibilitás (szilikon). Magyar IP, kínai gyártás, EU-disztribúció.
            </li>
          </ul>
        </section>

        <section className="glass-card p-7 sm:p-10">
          <h2 className="text-2xl font-bold mb-4">Kapcsolat</h2>
          <ul className="space-y-2 text-sm">
            <li>
              📧 <a href="mailto:hello@ebc-wellness.eu" className="underline">hello@ebc-wellness.eu</a>
            </li>
            <li>
              🛟 Támogatási kérvény: <a href={`/${locale}/tamogatas`} className="underline">/{locale}/tamogatas</a>
            </li>
            <li>
              💬 AI-asszisztens: jobb-alsó sarokban (Claude Haiku, HU/EN/DE)
            </li>
            <li>
              🏢 Magyarország (cégalapítás folyamatban — EBC Wellness Kft.)
            </li>
          </ul>
        </section>

        <p className="text-xs text-[var(--color-muted)] italic text-center">
          EBC Comfort egy wellness-eszköz, NEM orvosi eszköz. Az oldalon közölt információk nem
          helyettesítik a szakorvosi tanácsadást.
        </p>
      </article>
    </PublicShell>
  );
}
