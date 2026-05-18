import Link from 'next/link';
import { requireAdmin, formatDateTime } from '@/lib/admin/guard';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ escalated?: string; topic?: string }>;
}

interface CallRow {
  id: string;
  call_id: string;
  agent_id: string | null;
  phone_number: string | null;
  duration_seconds: number | null;
  summary: string | null;
  topic: string | null;
  escalation_needed: boolean;
  consent_recorded: boolean;
  started_at: string;
  ended_at: string | null;
}

const TOPICS = ['order_status', 'product_info', 'support_request', 'complaint', 'other'] as const;

export default async function AdminCalls({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { escalated, topic } = await searchParams;
  const { locale, supa } = await requireAdmin(localeParam);

  let query = supa
    .from('call_logs')
    .select(
      'id, call_id, agent_id, phone_number, duration_seconds, summary, topic, escalation_needed, consent_recorded, started_at, ended_at'
    )
    .order('started_at', { ascending: false })
    .limit(200);
  if (escalated === '1') query = query.eq('escalation_needed', true);
  if (topic && (TOPICS as readonly string[]).includes(topic)) query = query.eq('topic', topic);

  const { data: calls, error } = await query;
  const rows = (calls ?? []) as CallRow[];

  function formatDuration(sec: number | null) {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  return (
    <div className="max-w-6xl mx-auto safe-x py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Telefonos hívások (Retell AI)</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {rows.length} hívás{escalated === '1' ? ' · csak eszkalált' : ''}
          {topic ? ` · téma: ${topic}` : ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href={`/${locale}/admin/calls`}
          className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
            !escalated && !topic ? 'bg-[var(--color-accent)] text-white' : ''
          }`}
        >
          Mind
        </Link>
        <Link
          href={`/${locale}/admin/calls?escalated=1`}
          className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
            escalated === '1' ? 'bg-[var(--color-accent)] text-white' : ''
          }`}
        >
          ⚠️ Eszkalált
        </Link>
        {TOPICS.map((t) => (
          <Link
            key={t}
            href={`/${locale}/admin/calls?topic=${t}`}
            className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
              topic === t ? 'bg-[var(--color-accent)] text-white' : ''
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {error && (
        <div className="glass-card p-4 text-sm text-red-600">DB hiba: {error.message}</div>
      )}

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent)]/5 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Időpont</th>
              <th className="px-4 py-3 font-semibold">Telefonszám</th>
              <th className="px-4 py-3 font-semibold">Téma</th>
              <th className="px-4 py-3 font-semibold">Hossz</th>
              <th className="px-4 py-3 font-semibold">Eszk.</th>
              <th className="px-4 py-3 font-semibold">Cons.</th>
              <th className="px-4 py-3 font-semibold">Összefoglaló</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                  {formatDateTime(c.started_at)}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{c.phone_number ?? '—'}</td>
                <td className="px-4 py-3 text-xs">{c.topic ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs">{formatDuration(c.duration_seconds)}</td>
                <td className="px-4 py-3 text-center">
                  {c.escalation_needed ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 font-semibold">
                      ⚠️
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-center">
                  {c.consent_recorded ? '✓' : <span className="text-red-600">✗</span>}
                </td>
                <td className="px-4 py-3 text-xs max-w-[300px]">
                  {c.summary ? (
                    <span className="line-clamp-2">{c.summary}</span>
                  ) : (
                    <em className="text-[var(--color-muted)]">—</em>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/${locale}/admin/calls/${c.id}`}
                    className="text-[var(--color-accent)] hover:underline"
                  >
                    Megnyit →
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  Még nincs hívás. Retell-konfiguráció után jelennek meg itt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
