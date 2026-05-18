import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin, formatDateTime } from '@/lib/admin/guard';

interface Props {
  params: Promise<{ locale: string }>;
}

interface ArticleRow {
  id: string;
  slug: string;
  status: string;
  published_at: string | null;
  updated_at: string;
  article_translations: { locale: string; title: string }[];
}

export default async function AdminArticles({ params }: Props) {
  const { locale: localeParam } = await params;
  const { locale, supa } = await requireAdmin(localeParam, { allowEditor: true });

  const { data: articles, error } = await supa
    .from('articles')
    .select(`
      id, slug, status, published_at, updated_at,
      article_translations ( locale, title )
    `)
    .order('updated_at', { ascending: false })
    .limit(200);

  async function createArticle(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa: s, userId } = await requireAdmin(lp, { allowEditor: true });
    const slug = String(formData.get('slug') ?? '').trim();
    if (!slug) throw new Error('slug kötelező');
    const { data, error: e } = await s
      .from('articles')
      .insert({ slug, status: 'draft', author_id: userId })
      .select('id')
      .single();
    if (e) throw new Error(e.message);
    redirect(`/${lp}/admin/articles/${data.id}`);
  }

  return (
    <div className="max-w-7xl mx-auto safe-x py-10">
      <h1 className="text-3xl font-bold mb-2">Cikkek (Edukáció)</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        {(articles ?? []).length} cikk · markdown szerkesztő, 15 locale
      </p>

      <form action={createArticle} className="glass-card p-4 mb-6 flex flex-wrap gap-2 items-end">
        <label className="flex-1 min-w-[200px]">
          <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
            Új cikk slug
          </span>
          <input
            type="text"
            name="slug"
            required
            placeholder="pl. uti-megelozes-melegterapia"
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
        >
          + Új cikk
        </button>
      </form>

      {error && (
        <div className="glass-card p-4 mb-4 text-sm text-red-600">DB hiba: {error.message}</div>
      )}

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent)]/5 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Cím ({locale})</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Státusz</th>
              <th className="px-4 py-3 font-semibold">Nyelvek</th>
              <th className="px-4 py-3 font-semibold">Publikálva</th>
              <th className="px-4 py-3 font-semibold">Frissítve</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {((articles ?? []) as ArticleRow[]).map((a) => {
              const trCurrent = a.article_translations.find((t) => t.locale === locale);
              const trHu = a.article_translations.find((t) => t.locale === 'hu');
              const title = trCurrent?.title ?? trHu?.title ?? a.article_translations[0]?.title;
              const locales = a.article_translations.map((t) => t.locale).join(', ') || '—';
              return (
                <tr key={a.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3 font-medium">
                    {title ?? <em className="text-[var(--color-muted)]">— nincs cím —</em>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{a.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        a.status === 'published'
                          ? 'bg-green-500/15 text-green-700'
                          : a.status === 'archived'
                          ? 'bg-red-500/15 text-red-700'
                          : 'bg-gray-500/15 text-gray-700'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{locales}</td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                    {formatDateTime(a.published_at)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                    {formatDateTime(a.updated_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/${locale}/admin/articles/${a.id}`}
                      className="text-[var(--color-accent)] hover:underline"
                    >
                      Szerkeszt →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {(articles ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  Még nincs cikk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
