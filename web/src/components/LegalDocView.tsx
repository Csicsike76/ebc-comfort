import { notFound } from 'next/navigation';
import { FALLBACK_LOCALE, Locale } from '@/lib/i18n/config';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { renderMarkdown } from '@/lib/markdown';
import { formatDateTime } from '@/lib/admin/guard';

interface Props {
  slug: 'aszf' | 'adatvedelem' | 'cookie-tajekoztato' | 'impresszum';
  locale: Locale;
}

export default async function LegalDocView({ slug, locale }: Props) {
  const supa = await getSupabaseServerClient();
  const { data: rows } = await supa
    .from('legal_documents')
    .select('id, slug, version, locale, title, body_markdown, published_at')
    .eq('slug', slug)
    .in('locale', [locale, FALLBACK_LOCALE, 'hu'])
    .not('published_at', 'is', null)
    .is('retired_at', null)
    .order('published_at', { ascending: false })
    .limit(50);

  if (!rows || rows.length === 0) notFound();

  const preferred =
    rows.find((r) => r.locale === locale) ??
    rows.find((r) => r.locale === FALLBACK_LOCALE) ??
    rows.find((r) => r.locale === 'hu') ??
    rows[0];

  const isFallback = preferred.locale !== locale;

  return (
    <article className="max-w-3xl mx-auto safe-x py-12 sm:py-16">
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold">{preferred.title}</h1>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Verzió: {preferred.version} · Hatályos: {formatDateTime(preferred.published_at)}
          {isFallback && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700">
              {preferred.locale.toUpperCase()} fordítás (a {locale.toUpperCase()} készül)
            </span>
          )}
        </p>
      </header>

      <div className="glass-card p-7 sm:p-10 text-base">
        {renderMarkdown(preferred.body_markdown)}
      </div>

      <p className="mt-6 text-xs text-[var(--color-muted)] italic">
        Korábbi verziók kérhetők: hello@ebc-wellness.eu (GDPR-audit célokra a teljes verzió-történet megőrzésre kerül).
      </p>
    </article>
  );
}
