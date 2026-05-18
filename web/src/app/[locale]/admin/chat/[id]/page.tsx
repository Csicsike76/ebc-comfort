import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin, formatDateTime } from '@/lib/admin/guard';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

interface MessageRow {
  id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
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
  profiles: { email: string; full_name: string | null } | null;
}

export default async function AdminChatTranscript({ params }: Props) {
  const { locale: localeParam, id } = await params;
  const { locale, supa } = await requireAdmin(localeParam);

  const { data: convData } = await supa
    .from('chat_conversations')
    .select(`
      id, session_token, locale, topic, started_at, ended_at,
      escalated_to_human, escalation_reason,
      profiles ( email, full_name )
    `)
    .eq('id', id)
    .single();
  if (!convData) notFound();
  const conv = convData as unknown as ConversationRow;

  const { data: messages } = await supa
    .from('chat_messages')
    .select('id, role, content, metadata, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  const msgs = (messages ?? []) as MessageRow[];

  return (
    <div className="max-w-4xl mx-auto safe-x py-10 space-y-6">
      <div>
        <Link
          href={`/${locale}/admin/chat`}
          className="text-xs text-[var(--color-muted)] hover:underline"
        >
          ← Chat session
        </Link>
        <h1 className="text-2xl font-bold mt-2">Beszélgetés</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {conv.profiles?.full_name ?? conv.profiles?.email ?? 'vendég'} ·{' '}
          {conv.locale.toUpperCase()} · indult {formatDateTime(conv.started_at)}
        </p>
        {conv.escalated_to_human && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 text-sm text-red-700">
            <span className="font-semibold">⚠️ Eszkalálva: </span>
            {conv.escalation_reason ?? 'nincs indok megadva'}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {msgs.map((m) => {
          const isUser = m.role === 'user';
          const isAssistant = m.role === 'assistant';
          const isSystem = m.role === 'system';
          return (
            <div
              key={m.id}
              className={`glass-card p-4 ${isUser ? 'ml-12' : isAssistant ? 'mr-12' : ''}`}
            >
              <div className="flex items-center justify-between mb-2 text-xs">
                <span
                  className={`font-semibold uppercase ${
                    isUser ? 'text-blue-700' : isAssistant ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
                  }`}
                >
                  {m.role}
                </span>
                <span className="text-[var(--color-muted)]">
                  {formatDateTime(m.created_at)}
                </span>
              </div>
              <p
                className={`whitespace-pre-wrap text-sm ${
                  isSystem ? 'font-mono text-xs text-[var(--color-muted)]' : ''
                }`}
              >
                {m.content}
              </p>
              {m.metadata && Object.keys(m.metadata).length > 0 && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-[var(--color-muted)]">
                    metadata
                  </summary>
                  <pre className="mt-1 p-2 bg-[var(--color-bg)] rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(m.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          );
        })}
        {msgs.length === 0 && (
          <div className="glass-card p-10 text-center text-[var(--color-muted)]">
            Üres beszélgetés.
          </div>
        )}
      </div>
    </div>
  );
}
