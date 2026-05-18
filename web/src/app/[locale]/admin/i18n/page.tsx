import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { SUPPORTED_LOCALES, Locale } from '@/lib/i18n/config';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; loc?: string }>;
}

interface KeyRow {
  key: string;
  description: string | null;
}

interface TranslationRow {
  key: string;
  locale: string;
  value: string;
}

export default async function AdminI18n({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { filter, loc } = await searchParams;
  const { locale, supa } = await requireAdmin(localeParam, { allowEditor: true });

  const activeLocale = (loc && (SUPPORTED_LOCALES as readonly string[]).includes(loc) ? loc : locale) as Locale;

  let keyQuery = supa.from('i18n_keys').select('key, description').order('key');
  if (filter) keyQuery = keyQuery.ilike('key', `%${filter}%`);
  const { data: keys } = await keyQuery;

  const { data: translations } = await supa
    .from('i18n_translations')
    .select('key, locale, value')
    .in('locale', [activeLocale, 'hu']);

  const valuesByKeyLocale = new Map<string, string>();
  for (const t of (translations ?? []) as TranslationRow[]) {
    valuesByKeyLocale.set(`${t.key}::${t.locale}`, t.value);
  }

  async function saveTranslation(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa: s, userId } = await requireAdmin(lp, { allowEditor: true });
    const key = String(formData.get('key') ?? '');
    const trLocale = String(formData.get('tr_locale') ?? '');
    const value = String(formData.get('value') ?? '');
    if (!key || !trLocale) throw new Error('key + locale kötelező');
    const { error } = await s.from('i18n_translations').upsert({
      key,
      locale: trLocale,
      value,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    revalidatePath(`/${lp}/admin/i18n`);
  }

  async function createKey(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa: s } = await requireAdmin(lp, { allowEditor: true });
    const key = String(formData.get('new_key') ?? '').trim();
    const description = String(formData.get('description') ?? '') || null;
    if (!key) throw new Error('key kötelező');
    const { error } = await s.from('i18n_keys').upsert({ key, description });
    if (error) throw new Error(error.message);
    revalidatePath(`/${lp}/admin/i18n`);
  }

  const keyRows = (keys ?? []) as KeyRow[];

  return (
    <div className="max-w-6xl mx-auto safe-x py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fordítások</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {keyRows.length} kulcs · admin-szerkesztő · 15 EU locale
        </p>
      </div>

      <form action={createKey} className="glass-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <label className="block">
          <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
            Új kulcs
          </span>
          <input
            type="text"
            name="new_key"
            required
            placeholder="pl. landing.hero.title"
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
            Leírás
          </span>
          <input
            type="text"
            name="description"
            placeholder="kontextus"
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
        >
          + Kulcs hozzáadása
        </button>
      </form>

      <form className="glass-card p-4 flex flex-wrap gap-3 items-end">
        <label className="flex-1 min-w-[200px]">
          <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
            Keresés (kulcs)
          </span>
          <input
            type="text"
            name="filter"
            defaultValue={filter ?? ''}
            placeholder="kulcs-rész..."
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
          />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
            Cél-locale
          </span>
          <select
            name="loc"
            defaultValue={activeLocale}
            className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
          >
            {SUPPORTED_LOCALES.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="px-4 py-2 rounded-full border border-[var(--color-border)] text-sm hover:bg-[var(--color-accent)]/10"
        >
          Szűr
        </button>
      </form>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent)]/5 text-left sticky top-0">
            <tr>
              <th className="px-4 py-3 font-semibold w-1/4">Kulcs</th>
              <th className="px-4 py-3 font-semibold w-1/3">HU (referencia)</th>
              <th className="px-4 py-3 font-semibold w-2/5">{activeLocale.toUpperCase()} érték</th>
            </tr>
          </thead>
          <tbody>
            {keyRows.map((k) => {
              const huValue = valuesByKeyLocale.get(`${k.key}::hu`) ?? '';
              const targetValue = valuesByKeyLocale.get(`${k.key}::${activeLocale}`) ?? '';
              return (
                <tr key={k.key} className="border-t border-[var(--color-border)] align-top">
                  <td className="px-4 py-3 font-mono text-xs">
                    {k.key}
                    {k.description && (
                      <div className="text-[var(--color-muted)] mt-1 normal-case font-sans">
                        {k.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                    {huValue || <em>— hiányzik —</em>}
                  </td>
                  <td className="px-4 py-3">
                    <form action={saveTranslation} className="flex gap-2">
                      <input type="hidden" name="key" value={k.key} />
                      <input type="hidden" name="tr_locale" value={activeLocale} />
                      <textarea
                        name="value"
                        defaultValue={targetValue}
                        rows={2}
                        className="flex-1 px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-full bg-[var(--color-accent)] text-white text-xs self-start"
                      >
                        💾
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {keyRows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  Még nincs i18n-kulcs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
