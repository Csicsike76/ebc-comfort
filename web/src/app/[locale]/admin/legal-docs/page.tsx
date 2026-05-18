import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { requireAdmin, formatDateTime } from '@/lib/admin/guard';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ slug?: string }>;
}

interface DocRow {
  id: string;
  slug: string;
  version: string;
  locale: string;
  title: string;
  body_markdown: string;
  published_at: string | null;
  retired_at: string | null;
  created_at: string;
  updated_at: string;
}

const SLUGS = ['aszf', 'adatvedelem', 'cookie-tajekoztato', 'impresszum'] as const;

export default async function AdminLegalDocs({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { slug: filterSlug } = await searchParams;
  const { locale, supa, userId } = await requireAdmin(localeParam);

  let query = supa
    .from('legal_documents')
    .select('id, slug, version, locale, title, body_markdown, published_at, retired_at, created_at, updated_at')
    .order('slug')
    .order('locale')
    .order('published_at', { ascending: false, nullsFirst: false });
  if (filterSlug) query = query.eq('slug', filterSlug);

  const { data: docs, error } = await query;

  async function createDoc(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa: s, userId: uid } = await requireAdmin(lp);
    const slug = String(formData.get('slug') ?? '').trim();
    const version = String(formData.get('version') ?? '').trim();
    const trLocale = String(formData.get('locale') ?? '').trim();
    const title = String(formData.get('title') ?? '').trim();
    const body = String(formData.get('body_markdown') ?? '');
    const publish = formData.get('publish') === 'on';
    if (!slug || !version || !trLocale || !title || !body) {
      throw new Error('slug + version + locale + title + body kötelező');
    }
    const { error: e } = await s.from('legal_documents').insert({
      slug,
      version,
      locale: trLocale,
      title,
      body_markdown: body,
      published_at: publish ? new Date().toISOString() : null,
      created_by: uid,
    });
    if (e) throw new Error(e.message);
    revalidatePath(`/${lp}/admin/legal-docs`);
  }

  async function publishDoc(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa: s } = await requireAdmin(lp);
    const id = String(formData.get('id') ?? '');
    const { error: e } = await s
      .from('legal_documents')
      .update({ published_at: new Date().toISOString(), retired_at: null })
      .eq('id', id);
    if (e) throw new Error(e.message);
    revalidatePath(`/${lp}/admin/legal-docs`);
  }

  async function retireDoc(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa: s } = await requireAdmin(lp);
    const id = String(formData.get('id') ?? '');
    const { error: e } = await s
      .from('legal_documents')
      .update({ retired_at: new Date().toISOString() })
      .eq('id', id);
    if (e) throw new Error(e.message);
    revalidatePath(`/${lp}/admin/legal-docs`);
  }

  const rows = (docs ?? []) as DocRow[];

  return (
    <div className="max-w-6xl mx-auto safe-x py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jogi dokumentumok</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {rows.length} doc · ÁSZF + Adatvédelem + Cookie + Impresszum versioning
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href={`/${locale}/admin/legal-docs`}
          className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
            !filterSlug ? 'bg-[var(--color-accent)] text-white' : ''
          }`}
        >
          Mind
        </Link>
        {SLUGS.map((s) => (
          <Link
            key={s}
            href={`/${locale}/admin/legal-docs?slug=${s}`}
            className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
              filterSlug === s ? 'bg-[var(--color-accent)] text-white' : ''
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <details className="glass-card p-5">
        <summary className="cursor-pointer font-bold text-lg">+ Új verzió létrehozása</summary>
        <form action={createDoc} className="mt-4 space-y-3 text-sm">
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">Slug</span>
              <select
                name="slug"
                required
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                {SLUGS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">Verzió</span>
              <input
                type="text"
                name="version"
                required
                placeholder="v1.1"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">Locale</span>
              <select
                name="locale"
                required
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                {SUPPORTED_LOCALES.map((l) => (
                  <option key={l} value={l}>{l.toUpperCase()}</option>
                ))}
              </select>
            </label>
          </div>
          <input
            type="text"
            name="title"
            required
            placeholder="Cím"
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          />
          <textarea
            name="body_markdown"
            required
            rows={12}
            placeholder="Markdown tartalom…"
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-xs"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="publish" />
            <span>Azonnali publikálás (élesedik)</span>
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
            >
              Létrehozás
            </button>
          </div>
        </form>
      </details>

      {error && (
        <div className="glass-card p-4 text-sm text-red-600">DB hiba: {error.message}</div>
      )}

      <div className="space-y-3">
        {rows.map((d) => {
          const live = !!d.published_at && !d.retired_at;
          const retired = !!d.retired_at;
          return (
            <details key={d.id} className="glass-card p-5">
              <summary className="cursor-pointer flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="font-semibold">{d.title}</span>
                  <span className="ml-2 text-xs font-mono text-[var(--color-muted)]">
                    {d.slug} · {d.version} · {d.locale.toUpperCase()}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    live ? 'bg-green-500/15 text-green-700' :
                    retired ? 'bg-red-500/15 text-red-700' : 'bg-gray-500/15 text-gray-700'
                  }`}
                >
                  {live ? 'LIVE' : retired ? 'visszavont' : 'vázlat'}
                </span>
              </summary>
              <div className="mt-3 text-xs text-[var(--color-muted)]">
                Létrehozva: {formatDateTime(d.created_at)} · Frissítve: {formatDateTime(d.updated_at)} ·
                Publikálva: {formatDateTime(d.published_at)}
                {retired && ` · Visszavonva: ${formatDateTime(d.retired_at)}`}
              </div>
              <pre className="mt-3 p-3 bg-[var(--color-bg)] rounded-xl overflow-x-auto text-xs whitespace-pre-wrap max-h-60">
                {d.body_markdown.slice(0, 1500)}{d.body_markdown.length > 1500 && '\n…'}
              </pre>
              <div className="mt-3 flex gap-2 flex-wrap">
                {!live && (
                  <form action={publishDoc}>
                    <input type="hidden" name="id" value={d.id} />
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-full bg-green-600 text-white text-xs"
                    >
                      ✓ Publikál
                    </button>
                  </form>
                )}
                {live && (
                  <form action={retireDoc}>
                    <input type="hidden" name="id" value={d.id} />
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-full border border-red-500 text-red-600 text-xs"
                    >
                      Visszavon
                    </button>
                  </form>
                )}
              </div>
            </details>
          );
        })}
        {rows.length === 0 && (
          <div className="glass-card p-10 text-center text-[var(--color-muted)]">
            Még nincs jogi dokumentum.
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        Audit-trail kötelező GDPR-ra: minden visszavont verzió örökre meg-marad, törölni TILOS.
        Új verzió publikálása NEM törli a régit — `retired_at` mező jelzi a verzió-váltást.
        Aktor (Zsolt: <code className="font-mono">{userId.slice(0, 8)}</code>) audit_log-ba kerül.
      </p>
    </div>
  );
}
