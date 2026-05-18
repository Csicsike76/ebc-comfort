import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, FALLBACK_LOCALE } from '@/lib/i18n/config';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/admin/guard';
import PublicShell from '@/components/PublicShell';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kategoria?: string }>;
}

interface ArticleListRow {
  id: string;
  slug: string;
  featured_image_url: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  category_id: string | null;
  article_translations: { locale: string; title: string; excerpt: string | null }[];
}

interface CategoryRow {
  id: string;
  slug: string;
  article_category_translations: { locale: string; name: string }[];
}

export default async function EducationList({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { kategoria } = await searchParams;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const supa = await getSupabaseServerClient();

  const { data: categories } = await supa
    .from('article_categories')
    .select(`
      id, slug,
      article_category_translations ( locale, name )
    `)
    .order('display_order');

  let query = supa
    .from('articles')
    .select(`
      id, slug, featured_image_url, reading_time_minutes, published_at, category_id,
      article_translations ( locale, title, excerpt )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(60);

  if (kategoria) {
    const cat = (categories as CategoryRow[] | null)?.find((c) => c.slug === kategoria);
    if (cat) query = query.eq('category_id', cat.id);
  }

  const { data: articles } = await query;
  const rows = (articles ?? []) as unknown as ArticleListRow[];

  function catName(cat: CategoryRow): string {
    return (
      cat.article_category_translations.find((t) => t.locale === locale)?.name ??
      cat.article_category_translations.find((t) => t.locale === FALLBACK_LOCALE)?.name ??
      cat.article_category_translations[0]?.name ??
      cat.slug
    );
  }

  function articleTitle(a: ArticleListRow): string {
    return (
      a.article_translations.find((t) => t.locale === locale)?.title ??
      a.article_translations.find((t) => t.locale === FALLBACK_LOCALE)?.title ??
      a.article_translations[0]?.title ??
      a.slug
    );
  }

  function articleExcerpt(a: ArticleListRow): string | null {
    return (
      a.article_translations.find((t) => t.locale === locale)?.excerpt ??
      a.article_translations.find((t) => t.locale === FALLBACK_LOCALE)?.excerpt ??
      a.article_translations[0]?.excerpt ??
      null
    );
  }

  return (
    <PublicShell locale={locale}>
      <div className="max-w-6xl mx-auto safe-x py-12 sm:py-16">
        <div className="glass-card p-7 sm:p-10 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Edukáció</h1>
          <p className="text-base text-[var(--color-muted)] leading-relaxed">
            Női egészség, hőterápia, önmegfigyelés. Forrásokkal alátámasztott, érthető cikkek.
            EBC Wellness — független, ingyenes tudás.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 text-sm">
          <Link
            href={`/${locale}/edukacio`}
            className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
              !kategoria ? 'bg-[var(--color-accent)] text-white' : ''
            }`}
          >
            Mind
          </Link>
          {((categories ?? []) as CategoryRow[]).map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/edukacio?kategoria=${c.slug}`}
              className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
                kategoria === c.slug ? 'bg-[var(--color-accent)] text-white' : ''
              }`}
            >
              {catName(c)}
            </Link>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="glass-card p-10 text-center text-[var(--color-muted)]">
            Még nincs publikált cikk ebben a kategóriában. Iratkozz fel a hírlevélre — értesítünk!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((a) => (
              <Link
                key={a.id}
                href={`/${locale}/edukacio/${a.slug}`}
                className="glass-card p-5 hover:border-[var(--color-accent)] transition-colors"
              >
                {a.featured_image_url && (
                  <picture>
                    <img
                      src={a.featured_image_url}
                      alt={articleTitle(a)}
                      className="w-full aspect-video rounded-xl object-cover mb-4"
                    />
                  </picture>
                )}
                <h2 className="font-bold text-lg leading-snug mb-2">{articleTitle(a)}</h2>
                {articleExcerpt(a) && (
                  <p className="text-sm text-[var(--color-muted)] line-clamp-3">
                    {articleExcerpt(a)}
                  </p>
                )}
                <div className="mt-3 text-xs text-[var(--color-muted)] flex items-center gap-3">
                  {a.reading_time_minutes && <span>📖 {a.reading_time_minutes} perc</span>}
                  <span>{formatDate(a.published_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
