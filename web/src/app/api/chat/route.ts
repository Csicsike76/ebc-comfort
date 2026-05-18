import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { embed, isEmbeddingConfigured } from '@/lib/voyage';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface ChatRequestBody {
  message?: string;
  messages?: { role: string; content: string }[];
  locale?: string;
  rag?: boolean;
}

interface KbMatch {
  id: string;
  source_type: string;
  source_id: string;
  content: string;
  similarity: number;
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequestBody;

  // Optionally pre-fetch RAG context if Voyage/Mistral configured
  const query =
    body.message ??
    body.messages?.findLast?.((m) => m.role === 'user')?.content ??
    '';

  const locale = body.locale ?? 'hu';
  let ragContext: KbMatch[] = [];

  if (isEmbeddingConfigured() && query && body.rag !== false) {
    const emb = await embed(query, 'query');
    const admin = getSupabaseAdmin();
    if (emb.ok && emb.embedding && admin) {
      const { data } = await admin.rpc('match_kb_chunks', {
        query_embedding: emb.embedding as unknown as string,
        match_threshold: 0.7,
        match_count: 4,
        locale_filter: locale,
      });
      if (Array.isArray(data)) {
        ragContext = data as KbMatch[];
      }
    }
  }

  // Forward to Edge Function with augmented payload
  const forwardBody = {
    ...body,
    rag_context: ragContext.map((c) => ({
      content: c.content,
      source_type: c.source_type,
      source_id: c.source_id,
      similarity: c.similarity,
    })),
  };

  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat-completion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(forwardBody),
  });

  const data = await res.json();
  return NextResponse.json(
    {
      ...data,
      _rag: {
        used: ragContext.length > 0,
        match_count: ragContext.length,
        configured: isEmbeddingConfigured(),
      },
    },
    { status: res.status }
  );
}
