import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, FALLBACK_LOCALE } from '@/lib/i18n/config';
import { getDict, tt } from '@/lib/i18n';
import { getUi } from '@/lib/i18n/ui-strings';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/admin/guard';
import { renderMarkdown } from '@/lib/markdown';
import { articleLd } from '@/lib/seo-jsonld';
import { SITE } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import PublicShell from '@/components/PublicShell';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

interface TranslationRow {
  locale: string;
  title: string;
  excerpt: string | null;
  body_markdown: string;
  meta_title: string | null;
  meta_description: string | null;
}

interface SourceRow {
  citation: string;
  url: string | null;
  display_order: number;
}

export default async function ArticleDetail({ params }: Props) {
  const { locale: localeParam, slug } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const supa = await getSupabaseServerClient();

  const { data: article } = await supa
    .from('articles')
    .select('id, slug, status, featured_image_url, reading_time_minutes, published_at')
    .eq('slug', slug)
    .single();
  if (!article || article.status !== 'published') notFound();

  const { data: translations } = await supa
    .from('article_translations')
    .select('locale, title, excerpt, body_markdown, meta_title, meta_description')
    .eq('article_id', article.id);

  const trMap = new Map<string, TranslationRow>();
  for (const t of (translations ?? []) as TranslationRow[]) {
    trMap.set(t.locale, t);
  }
  const tr = trMap.get(locale) ?? trMap.get(FALLBACK_LOCALE) ?? trMap.get('hu');
  if (!tr) notFound();

  const { data: sources } = await supa
    .from('article_sources')
    .select('citation, url, display_order')
    .eq('article_id', article.id)
    .order('display_order');

  return (
    <PublicShell locale={locale}>
      <JsonLd
        data={articleLd({
          locale,
          url: `${SITE}/${locale}/edukacio/${slug}`,
          headline: tr.title,
          description: tr.excerpt ?? tr.meta_description ?? tr.title,
          image: article.featured_image_url,
          datePublished: article.published_at,
          citations: ((sources ?? []) as SourceRow[]).map((s) => ({ name: s.citation, url: s.url })),
        })}
      />
      <article className="max-w-3xl mx-auto safe-x py-12 sm:py-16">
        <Link
          href={`/${locale}/edukacio`}
          className="text-xs text-[var(--color-muted)] hover:underline"
        >
          ← {tt(getDict(locale), 'common.education')}
        </Link>

        <header className="mt-3 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{tr.title}</h1>
          <div className="mt-3 text-xs text-[var(--color-muted)] flex flex-wrap gap-3">
            {article.reading_time_minutes && <span>📖 {article.reading_time_minutes} perc</span>}
            <span>{formatDate(article.published_at)}</span>
            {trMap.has(locale) ? null : (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700">
                {FALLBACK_LOCALE.toUpperCase()} fordítás (a {locale.toUpperCase()} még készül)
              </span>
            )}
          </div>
          {tr.excerpt && (
            <p className="mt-4 text-lg text-[var(--color-muted)] leading-relaxed italic">
              {tr.excerpt}
            </p>
          )}
        </header>

        {article.featured_image_url && (
          <picture>
            <img
              src={article.featured_image_url}
              alt={tr.title}
              className="w-full aspect-video rounded-3xl object-cover mb-8"
            />
          </picture>
        )}

        <div className="glass-card p-7 sm:p-10 text-base">{renderMarkdown(tr.body_markdown)}</div>

        {((sources ?? []) as SourceRow[]).length > 0 && (
          <section className="mt-8 glass-card p-6">
            <h2 className="font-bold mb-3">{getUi(locale).sources_heading}</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              {((sources ?? []) as SourceRow[]).map((s, i) => (
                <li key={i}>
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener"
                      className="text-[var(--color-accent-2)] hover:underline"
                    >
                      {s.citation}
                    </a>
                  ) : (
                    s.citation
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="mt-8 glass-card p-6 text-sm text-[var(--color-muted)] italic">
          {getUi(locale).article_disclaimer}
        </div>
      </article>
    </PublicShell>
  );
}
