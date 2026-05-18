import Link from 'next/link';
import { requireAdmin, formatDateTime } from '@/lib/admin/guard';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ escalated?: string }>;
}

interface ConversationRow {
  id: string;
  session_token: string | null;
  locale: string;
  topic: string | null;
  started_at: string;
  ended_at: string | null;
  escalated_to_human: boolean;
  escalation_reason: string | null;
  user_id: string | null;
  profiles: { email: string; full_name: string | null } | null;
}

export default async function AdminChatList({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { escalated } = await searchParams;
  const { locale, supa } = await requireAdmin(localeParam);

  let query = supa
    .from('chat_conversations')
    .select(`
      id, session_token, locale, topic, started_at, ended_at,
      escalated_to_human, escalation_reason, user_id,
      profiles ( email, full_name )
    `)
    .order('started_at', { ascending: false })
    .limit(300);
  if (escalated === '1') query = query.eq('escalated_to_human', true);

  const { data: conversations, error } = await query;
  const rows = (conversations ?? []) as unknown as ConversationRow[];

  return (
    <div className="max-w-6xl mx-auto safe-x py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI chat session</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {rows.length} beszélgetés{escalated === '1' ? ' · csak eszkalált' : ''}
        </p>
      </div>

      <div className="flex gap-2 text-sm">
        <Link
          href={`/${locale}/admin/chat`}
          className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
            !escalated ? 'bg-[var(--color-accent)] text-white' : ''
          }`}
        >
          Mind
        </Link>
        <Link
          href={`/${locale}/admin/chat?escalated=1`}
          className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
            escalated === '1' ? 'bg-[var(--color-accent)] text-white' : ''
          }`}
        >
          ⚠️ Eszkalált
        </Link>
      </div>

      {error && (
        <div className="glass-card p-4 text-sm text-red-600">DB hiba: {error.message}</div>
      )}

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent)]/5 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Indult</th>
              <th className="px-4 py-3 font-semibold">Felhasználó</th>
              <th className="px-4 py-3 font-semibold">Locale</th>
              <th className="px-4 py-3 font-semibold">Téma</th>
              <th className="px-4 py-3 font-semibold">Eszkalálva</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                  {formatDateTime(c.started_at)}
                </td>
                <td className="px-4 py-3">
                  {c.profiles?.full_name ?? c.profiles?.email ?? (
                    <em className="text-[var(--color-muted)]">vendég</em>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{c.locale}</td>
                <td className="px-4 py-3 text-xs">{c.topic ?? '—'}</td>
                <td className="px-4 py-3">
                  {c.escalated_to_human ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 font-semibold">
                      igen
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--color-muted)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/${locale}/admin/chat/${c.id}`}
                    className="text-[var(--color-accent)] hover:underline"
                  >
                    Megnyit →
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  Még nincs beszélgetés.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
