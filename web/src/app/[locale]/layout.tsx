import type { Metadata, Viewport } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import { isValidLocale, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/config';
import { notFound } from 'next/navigation';
import '../globals.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ebc-comfort.netlify.app';

const META_BY_LOCALE: Partial<Record<Locale, { title: string; description: string }>> = {
  hu: {
    title: 'EBC Comfort — Fűthető Komfortbetét',
    description:
      'Diszkrét, hordozható hőmelegítés — 5 fokozat (50-70 °C), 8000 mAh akku, USB-C tölthető. Wellness-eszköz alhasi komfortra.',
  },
  en: {
    title: 'EBC Comfort — Heated Comfort Pad',
    description:
      'Discreet, portable warmth — 5 levels (50-70 °C), 8000 mAh battery, USB-C charging. Wellness device for lower abdominal comfort.',
  },
  de: {
    title: 'EBC Comfort — Beheizbares Komfortpad',
    description:
      'Diskrete, tragbare Wärme — 5 Stufen (50-70 °C), 8000 mAh Akku, USB-C-Aufladung. Wellness-Gerät für Unterleibs-Komfort.',
  },
  fr: {
    title: 'EBC Comfort — Coussin chauffant',
    description:
      'Chaleur discrète et portable — 5 niveaux (50-70 °C), batterie 8000 mAh, recharge USB-C. Bien-être pour le bas-ventre.',
  },
  it: {
    title: 'EBC Comfort — Cuscinetto riscaldante',
    description:
      'Calore discreto e portatile — 5 livelli (50-70 °C), batteria 8000 mAh, ricarica USB-C. Dispositivo wellness per il basso addome.',
  },
  es: {
    title: 'EBC Comfort — Cojín térmico',
    description:
      'Calor discreto y portátil — 5 niveles (50-70 °C), batería 8000 mAh, carga USB-C. Dispositivo wellness para confort abdominal.',
  },
  pl: {
    title: 'EBC Comfort — Wkładka termiczna',
    description:
      'Dyskretne, przenośne ciepło — 5 poziomów (50-70 °C), bateria 8000 mAh, ładowanie USB-C. Wellness dla komfortu podbrzusza.',
  },
  ro: {
    title: 'EBC Comfort — Pernă încălzitoare',
    description:
      'Căldură discretă și portabilă — 5 niveluri (50-70 °C), baterie 8000 mAh, încărcare USB-C. Dispozitiv wellness pentru confort abdominal.',
  },
  nl: {
    title: 'EBC Comfort — Verwarmingskussen',
    description:
      'Discrete, draagbare warmte — 5 niveaus (50-70 °C), 8000 mAh accu, USB-C-opladen. Wellness voor onderbuik-comfort.',
  },
  pt: {
    title: 'EBC Comfort — Almofada térmica',
    description:
      'Calor discreto e portátil — 5 níveis (50-70 °C), bateria 8000 mAh, carregamento USB-C. Dispositivo wellness para conforto abdominal.',
  },
  cs: {
    title: 'EBC Comfort — Vyhřívaná podložka',
    description:
      'Diskrétní, přenosné teplo — 5 stupňů (50-70 °C), baterie 8000 mAh, nabíjení USB-C. Wellness pro pohodlí podbřišku.',
  },
  sk: {
    title: 'EBC Comfort — Vyhrievaná podložka',
    description:
      'Diskrétne, prenosné teplo — 5 stupňov (50-70 °C), batéria 8000 mAh, nabíjanie USB-C. Wellness pre pohodlie podbruška.',
  },
  sv: {
    title: 'EBC Comfort — Värmedyna',
    description:
      'Diskret, bärbar värme — 5 nivåer (50-70 °C), 8000 mAh batteri, USB-C-laddning. Wellness för komfort i nedre buken.',
  },
  da: {
    title: 'EBC Comfort — Varmepude',
    description:
      'Diskret, bærbar varme — 5 niveauer (50-70 °C), 8000 mAh batteri, USB-C-opladning. Wellness til komfort i nedre mave.',
  },
  fi: {
    title: 'EBC Comfort — Lämmityspehmuste',
    description:
      'Hillitty, kannettava lämpö — 5 tasoa (50-70 °C), 8000 mAh akku, USB-C-lataus. Wellness alavatsan mukavuuteen.',
  },
  bg: {
    title: 'EBC Comfort — Затоплящ комфортен пад',
    description:
      'Дискретна, преносима топлина — 5 нива (50-70 °C), батерия 8000 mAh, зареждане USB-C. Wellness за комфорт в долната част на корема.',
  },
  hr: {
    title: 'EBC Comfort — Grijaći jastučić udobnosti',
    description:
      'Diskretna, prijenosna toplina — 5 razina (50-70 °C), baterija 8000 mAh, USB-C punjenje. Wellness za udobnost donjeg trbuha.',
  },
  et: {
    title: 'EBC Comfort — Soojendav mugavuspadi',
    description:
      'Diskreetne, kaasaskantav soojus — 5 taset (50-70 °C), 8000 mAh aku, USB-C laadimine. Heaolu alakõhu mugavuseks.',
  },
  el: {
    title: 'EBC Comfort — Θερμαντικό μαξιλαράκι άνεσης',
    description:
      'Διακριτική, φορητή ζεστασιά — 5 επίπεδα (50-70 °C), μπαταρία 8000 mAh, φόρτιση USB-C. Συσκευή ευεξίας για άνεση κάτω κοιλιάς.',
  },
  ga: {
    title: 'EBC Comfort — Lonnán teasa compordach',
    description:
      'Teas discréideach, iniompartha — 5 leibhéal (50-70 °C), ceallraí 8000 mAh, luchtú USB-C. Folláine do chompord an bholg íochtair.',
  },
  lv: {
    title: 'EBC Comfort — Sildošais komforta spilventiņš',
    description:
      'Diskrēts, pārnēsājams siltums — 5 līmeņi (50-70 °C), 8000 mAh akumulators, USB-C uzlāde. Labsajūta vēdera apakšdaļas komfortam.',
  },
  lt: {
    title: 'EBC Comfort — Šildoma komforto pagalvėlė',
    description:
      'Diskretiškas, nešiojamas šilumos šaltinis — 5 lygiai (50-70 °C), 8000 mAh baterija, USB-C įkrovimas. Wellness apatinės pilvo srities komfortui.',
  },
  mt: {
    title: 'EBC Comfort — Imnatar tas-sħana għall-kumdità',
    description:
      'Sħana diskreta u portabbli — 5 livelli (50-70 °C), batterija 8000 mAh, iċċarġjar USB-C. Wellness għall-kumdità tan-naħa t\'isfel taż-żaqq.',
  },
  sl: {
    title: 'EBC Comfort — Grelna blazina za udobje',
    description:
      'Diskretna, prenosna toplota — 5 stopenj (50-70 °C), baterija 8000 mAh, polnjenje USB-C. Wellness za udobje spodnjega trebuha.',
  },
};
import ThemeBootstrap from '@/components/ThemeBootstrap';
import PaletteBootstrap from '@/components/PaletteBootstrap';
import GlobeLoader from '@/components/GlobeLoader';
import CornerGlobes from '@/components/CornerGlobes';
import AmbientParticles from '@/components/AmbientParticles';
import ReadingProgress from '@/components/ReadingProgress';
import BackToTop from '@/components/BackToTop';
import PaletteSync from '@/components/PaletteSync';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = (isValidLocale(locale) ? locale : 'hu') as Locale;
  const meta = META_BY_LOCALE[loc] ?? META_BY_LOCALE.hu!;

  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `${SITE}/${l}`])
  );

  return {
    title: meta.title,
    description: meta.description,
    applicationName: 'EBC Comfort',
    manifest: '/manifest.json',
    metadataBase: new URL(SITE),
    alternates: {
      canonical: `${SITE}/${loc}`,
      languages,
    },
    openGraph: {
      type: 'website',
      title: meta.title,
      description: meta.description,
      url: `${SITE}/${loc}`,
      siteName: 'EBC Comfort',
      locale: loc,
      images: [
        {
          url: `${SITE}/brand/logo-luxus.png`,
          width: 1200,
          height: 630,
          alt: 'EBC Comfort',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [`${SITE}/brand/logo-luxus.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8b7355' },
    { media: '(prefers-color-scheme: dark)', color: '#1f1a14' },
  ],
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeBootstrap />
        <PaletteBootstrap />
      </head>
      <body className="min-h-full flex flex-col">
        <PaletteSync />
        <GlobeLoader />
        <CornerGlobes />
        <AmbientParticles count={14} />
        <ReadingProgress />
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
