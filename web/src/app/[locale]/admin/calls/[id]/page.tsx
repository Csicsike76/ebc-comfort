import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin, formatDateTime } from '@/lib/admin/guard';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

interface CallDetail {
  id: string;
  call_id: string;
  agent_id: string | null;
  phone_number: string | null;
  duration_seconds: number | null;
  transcript_url: string | null;
  recording_url: string | null;
  summary: string | null;
  topic: string | null;
  escalation_needed: boolean;
  consent_recorded: boolean;
  cost_cents: number | null;
  started_at: string;
  ended_at: string | null;
}

interface CallEventRow {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export default async function AdminCallDetail({ params }: Props) {
  const { locale: localeParam, id } = await params;
  const { locale, supa } = await requireAdmin(localeParam);

  const { data: call } = await supa
    .from('call_logs')
    .select(
      'id, call_id, agent_id, phone_number, duration_seconds, transcript_url, recording_url, summary, topic, escalation_needed, consent_recorded, cost_cents, started_at, ended_at'
    )
    .eq('id', id)
    .single();
  if (!call) notFound();
  const c = call as CallDetail;

  const { data: events } = await supa
    .from('call_events')
    .select('id, event_type, payload, created_at')
    .eq('call_id', c.id)
    .order('created_at');

  return (
    <div className="max-w-4xl mx-auto safe-x py-10 space-y-6">
      <div>
        <Link
          href={`/${locale}/admin/calls`}
          className="text-xs text-[var(--color-muted)] hover:underline"
        >
          ← Hívások
        </Link>
        <h1 className="text-2xl font-bold mt-2">Hívás részletek</h1>
        <p className="text-sm text-[var(--color-muted)] font-mono">{c.call_id}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 text-sm space-y-1">
          <Row label="Indult" value={formatDateTime(c.started_at)} />
          <Row label="Befejeződött" value={formatDateTime(c.ended_at)} />
          <Row label="Hossz" value={c.duration_seconds ? `${c.duration_seconds}s` : '—'} />
          <Row label="Telefonszám" value={c.phone_number ?? '—'} mono />
          <Row label="Agent ID" value={c.agent_id ?? '—'} mono />
        </div>
        <div className="glass-card p-5 text-sm space-y-1">
          <Row label="Téma" value={c.topic ?? '—'} />
          <Row
            label="Eszkalálva"
            value={c.escalation_needed ? '⚠️ igen' : 'nem'}
          />
          <Row
            label="Beleegyezés (felvétel)"
            value={c.consent_recorded ? '✓ rögzítve' : '✗ NINCS'}
          />
          <Row
            label="Költség"
            value={c.cost_cents != null ? `${(c.cost_cents / 100).toFixed(2)} EUR` : '—'}
            mono
          />
          <div className="pt-2 flex gap-2">
            {c.recording_url && (
              <a
                href={c.recording_url}
                target="_blank"
                rel="noopener"
                className="text-xs px-3 py-1 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-accent)]/10"
              >
                🎙️ Felvétel
              </a>
            )}
            {c.transcript_url && (
              <a
                href={c.transcript_url}
                target="_blank"
                rel="noopener"
                className="text-xs px-3 py-1 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-accent)]/10"
              >
                📄 Transcript
              </a>
            )}
          </div>
        </div>
      </div>

      {c.summary && (
        <section className="glass-card p-6">
          <h2 className="font-bold mb-2">AI-összefoglaló</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.summary}</p>
        </section>
      )}

      <section className="glass-card p-6">
        <h2 className="font-bold mb-3">Event-történet ({(events ?? []).length})</h2>
        <ul className="space-y-2 text-sm">
          {((events ?? []) as CallEventRow[]).map((e) => (
            <li key={e.id} className="border-l-2 border-[var(--color-accent)] pl-3">
              <div className="flex justify-between text-xs">
                <span className="font-mono font-semibold">{e.event_type}</span>
                <span className="text-[var(--color-muted)]">{formatDateTime(e.created_at)}</span>
              </div>
              <details className="mt-1 text-xs">
                <summary className="cursor-pointer text-[var(--color-muted)]">payload</summary>
                <pre className="mt-1 p-2 bg-[var(--color-bg)] rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(e.payload, null, 2)}
                </pre>
              </details>
            </li>
          ))}
          {(events ?? []).length === 0 && (
            <li className="text-[var(--color-muted)] italic">Nincs rögzített event.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[var(--color-muted)] text-xs uppercase tracking-wider">{label}</span>
      <span className={mono ? 'font-mono text-xs' : ''}>{value}</span>
    </div>
  );
}
