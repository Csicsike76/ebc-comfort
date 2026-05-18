import type { Metadata, Viewport } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import { isValidLocale } from '@/lib/i18n/config';
import { notFound } from 'next/navigation';
import '../globals.css';
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
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EBC Comfort — Fűthető Komfortbetét',
  description:
    'Diszkrét, hordozható hőmelegítés — 5 fokozat, 8000 mAh akku, USB-C tölthető.',
  applicationName: 'EBC Comfort',
  manifest: '/manifest.json',
};

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
