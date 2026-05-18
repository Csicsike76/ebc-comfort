import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin, formatDateTime } from '@/lib/admin/guard';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

interface TranslationRow {
  locale: string;
  title: string;
  excerpt: string | null;
  body_markdown: string;
  meta_title: string | null;
  meta_description: string | null;
}

const STATUSES = ['draft', 'published', 'archived'] as const;

export default async function EditArticle({ params }: Props) {
  const { locale: localeParam, id } = await params;
  const { locale, supa } = await requireAdmin(localeParam, { allowEditor: true });

  const { data: article } = await supa
    .from('articles')
    .select('id, slug, status, featured_image_url, reading_time_minutes, published_at, updated_at')
    .eq('id', id)
    .single();
  if (!article) notFound();

  const { data: translations } = await supa
    .from('article_translations')
    .select('locale, title, excerpt, body_markdown, meta_title, meta_description')
    .eq('article_id', id);

  const trMap = new Map<string, TranslationRow>();
  for (const t of (translations ?? []) as TranslationRow[]) {
    trMap.set(t.locale, t);
  }

  async function updateCore(formData: FormData) {
    'use server';
    const { locale: lp, id: aid } = await params;
    const { supa: s } = await requireAdmin(lp, { allowEditor: true });
    const slug = String(formData.get('slug') ?? '').trim();
    const status = String(formData.get('status') ?? 'draft');
    const reading = formData.get('reading_time_minutes');
    const featured = String(formData.get('featured_image_url') ?? '') || null;
    if (!slug) throw new Error('slug kötelező');
    if (!(STATUSES as readonly string[]).includes(status)) throw new Error('rossz státusz');
    const patch: Record<string, unknown> = {
      slug,
      status,
      featured_image_url: featured,
      reading_time_minutes: reading ? parseInt(String(reading), 10) : null,
    };
    if (status === 'published' && !article?.published_at) {
      patch.published_at = new Date().toISOString();
    }
    const { error } = await s.from('articles').update(patch).eq('id', aid);
    if (error) throw new Error(error.message);
    revalidatePath(`/${lp}/admin/articles/${aid}`);
  }

  async function upsertTranslation(formData: FormData) {
    'use server';
    const { locale: lp, id: aid } = await params;
    const { supa: s } = await requireAdmin(lp, { allowEditor: true });
    const trLocale = String(formData.get('tr_locale') ?? '');
    const row = {
      article_id: aid,
      locale: trLocale,
      title: String(formData.get('title') ?? '').trim(),
      excerpt: String(formData.get('excerpt') ?? '') || null,
      body_markdown: String(formData.get('body_markdown') ?? ''),
      meta_title: String(formData.get('meta_title') ?? '') || null,
      meta_description: String(formData.get('meta_description') ?? '') || null,
    };
    if (!row.title || !row.body_markdown) throw new Error('title + body_markdown kötelező');
    const { error } = await s.from('article_translations').upsert(row);
    if (error) throw new Error(error.message);
    revalidatePath(`/${lp}/admin/articles/${aid}`);
  }

  async function deleteArticle() {
    'use server';
    const { locale: lp, id: aid } = await params;
    const { supa: s } = await requireAdmin(lp, { allowEditor: true });
    const { error } = await s.from('articles').delete().eq('id', aid);
    if (error) throw new Error(error.message);
    redirect(`/${lp}/admin/articles`);
  }

  return (
    <div className="max-w-5xl mx-auto safe-x py-10 space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link
            href={`/${locale}/admin/articles`}
            className="text-xs text-[var(--color-muted)] hover:underline"
          >
            ← Cikkek
          </Link>
          <h1 className="text-2xl font-bold">{article.slug}</h1>
          <p className="text-xs text-[var(--color-muted)]">
            Frissítve: {formatDateTime(article.updated_at)}
          </p>
        </div>
        <form action={deleteArticle}>
          <button
            type="submit"
            className="px-4 py-2 rounded-full border border-red-500 text-red-600 text-sm hover:bg-red-500/10"
          >
            Törlés
          </button>
        </form>
      </div>

      <form action={updateCore} className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-bold">Alap-adatok</h2>
        <Field label="Slug" name="slug" required defaultValue={article.slug} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
              Státusz
            </span>
            <select
              name="status"
              defaultValue={article.status}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Olvasási idő (perc)"
            name="reading_time_minutes"
            type="number"
            defaultValue={article.reading_time_minutes != null ? String(article.reading_time_minutes) : ''}
          />
        </div>
        <Field
          label="Kiemelt kép URL"
          name="featured_image_url"
          defaultValue={article.featured_image_url ?? ''}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
          >
            Frissítés
          </button>
        </div>
      </form>

      <section>
        <h2 className="text-lg font-bold mb-3">Fordítások</h2>
        <div className="space-y-3">
          {SUPPORTED_LOCALES.map((loc) => {
            const tr = trMap.get(loc);
            return (
              <details
                key={loc}
                open={loc === 'hu' || loc === locale}
                className="glass-card p-4"
              >
                <summary className="cursor-pointer font-semibold flex items-center justify-between">
                  <span>
                    {loc.toUpperCase()} ·{' '}
                    {tr?.title ?? <em className="text-[var(--color-muted)]">— üres —</em>}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      tr ? 'bg-green-500/15 text-green-700' : 'bg-gray-500/15 text-gray-600'
                    }`}
                  >
                    {tr ? 'kész' : 'hiányzik'}
                  </span>
                </summary>
                <form action={upsertTranslation} className="mt-3 space-y-3">
                  <input type="hidden" name="tr_locale" value={loc} />
                  <Field label="Cím" name="title" required defaultValue={tr?.title ?? ''} />
                  <Field
                    label="Kivonat (excerpt)"
                    name="excerpt"
                    defaultValue={tr?.excerpt ?? ''}
                  />
                  <label className="block">
                    <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
                      Markdown tartalom <span className="text-red-500">*</span>
                    </span>
                    <textarea
                      name="body_markdown"
                      required
                      defaultValue={tr?.body_markdown ?? ''}
                      rows={12}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-mono"
                    />
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="SEO meta title"
                      name="meta_title"
                      defaultValue={tr?.meta_title ?? ''}
                    />
                    <Field
                      label="SEO meta description"
                      name="meta_description"
                      defaultValue={tr?.meta_description ?? ''}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full bg-[var(--color-accent)] text-white text-sm"
                    >
                      Mentés ({loc})
                    </button>
                  </div>
                </form>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
      />
    </label>
  );
}
