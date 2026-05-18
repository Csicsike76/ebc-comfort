import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { requireAdmin, formatMoneyCents, formatDateTime } from '@/lib/admin/guard';
import GenerateIdeasButton from '@/components/admin/GenerateIdeasButton';

interface Props {
  params: Promise<{ locale: string }>;
}

interface CampaignRow {
  id: string;
  name: string;
  channel: string | null;
  budget_cents: number | null;
  spent_cents: number | null;
  conversions: number | null;
  utm_campaign: string | null;
  started_at: string | null;
  ended_at: string | null;
  notes: string | null;
  created_at: string;
}

const CHANNELS = [
  'facebook', 'instagram', 'tiktok', 'youtube',
  'google_ads', 'email', 'influencer', 'press',
] as const;

export default async function AdminMarketing({ params }: Props) {
  const { locale: localeParam } = await params;
  const { locale, supa } = await requireAdmin(localeParam);

  const { data: campaigns, error } = await supa
    .from('marketing_campaigns')
    .select('id, name, channel, budget_cents, spent_cents, conversions, utm_campaign, started_at, ended_at, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  async function createCampaign(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa: s } = await requireAdmin(lp);
    const name = String(formData.get('name') ?? '').trim();
    const channel = String(formData.get('channel') ?? '').trim() || null;
    const budget_cents = formData.get('budget_cents') ? parseInt(String(formData.get('budget_cents')), 10) : null;
    const utm_campaign = String(formData.get('utm_campaign') ?? '').trim() || null;
    const notes = String(formData.get('notes') ?? '').trim() || null;
    if (!name) throw new Error('name kötelező');
    const { error: e } = await s.from('marketing_campaigns').insert({
      name,
      channel,
      budget_cents,
      utm_campaign,
      notes,
      started_at: new Date().toISOString(),
    });
    if (e) throw new Error(e.message);
    revalidatePath(`/${lp}/admin/marketing`);
  }

  async function deleteCampaign(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa: s } = await requireAdmin(lp);
    const id = String(formData.get('id') ?? '');
    if (!id) return;
    const { error: e } = await s.from('marketing_campaigns').delete().eq('id', id);
    if (e) throw new Error(e.message);
    revalidatePath(`/${lp}/admin/marketing`);
  }

  const rows = (campaigns ?? []) as CampaignRow[];

  return (
    <div className="max-w-6xl mx-auto safe-x py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {rows.length} kampány · tartalom-ötlet generátor + UTM-tracking
        </p>
      </div>

      <section className="glass-card p-6">
        <h2 className="text-lg font-bold mb-3">🎯 Tartalom-ötlet (Claude Haiku)</h2>
        <p className="text-sm text-[var(--color-muted)] mb-3">
          Klikkelj egy csatornára — 3 friss ötletet generál, Telegram-be is elküldi.
        </p>
        <GenerateIdeasButton />
      </section>

      <section className="glass-card p-6">
        <h2 className="text-lg font-bold mb-3">+ Új kampány</h2>
        <form action={createCampaign} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <input
            type="text"
            name="name"
            required
            placeholder="Kampány neve (pl. Q4 2026 launch IG)"
            className="sm:col-span-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          />
          <select
            name="channel"
            className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <option value="">Csatorna…</option>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            name="utm_campaign"
            placeholder="UTM kampány-kód"
            className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          />
          <input
            type="number"
            name="budget_cents"
            placeholder="Költségvetés (cent)"
            className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          />
          <textarea
            name="notes"
            placeholder="Megjegyzés"
            rows={2}
            className="sm:col-span-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          />
          <button
            type="submit"
            className="sm:col-span-2 px-4 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
          >
            Mentés
          </button>
        </form>
      </section>

      {error && (
        <div className="glass-card p-4 text-sm text-red-600">DB hiba: {error.message}</div>
      )}

      <section className="glass-card overflow-x-auto">
        <h2 className="text-lg font-bold p-5 pb-3">Kampányok</h2>
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent)]/5 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Kampány</th>
              <th className="px-4 py-3 font-semibold">Csatorna</th>
              <th className="px-4 py-3 font-semibold">UTM</th>
              <th className="px-4 py-3 font-semibold text-right">Költés</th>
              <th className="px-4 py-3 font-semibold text-right">Konverzió</th>
              <th className="px-4 py-3 font-semibold">Indulás</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3">
                  <div className="font-semibold">{c.name}</div>
                  {c.notes && (
                    <div className="text-xs text-[var(--color-muted)] line-clamp-1">{c.notes}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{c.channel ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.utm_campaign ?? '—'}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {c.spent_cents != null
                    ? `${formatMoneyCents(c.spent_cents)} / ${c.budget_cents != null ? formatMoneyCents(c.budget_cents) : '—'}`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right">{c.conversions ?? 0}</td>
                <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                  {formatDateTime(c.started_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteCampaign} className="inline">
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-600 hover:underline"
                      aria-label={`Törlés: ${c.name}`}
                    >
                      ✕
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  Még nincs kampány.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="text-xs text-[var(--color-muted)]">
        💡 UTM-tracking: minden látogató első érkezésekor az utm_source/medium/campaign/term/content
        cookie-ba kerül (30 nap). Pixel-injectálás: ha NEXT_PUBLIC_META_PIXEL_ID /
        NEXT_PUBLIC_TIKTOK_PIXEL_ID / NEXT_PUBLIC_GOOGLE_ADS_ID env vars beállítva, automatikusan
        betöltődnek a publikus oldalakon.{' '}
        <Link href={`/${locale}/admin`} className="underline">← Áttekintés</Link>
      </div>
    </div>
  );
}
