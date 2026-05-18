import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { embed, chunkText, isEmbeddingConfigured } from '@/lib/voyage';

export const runtime = 'nodejs';

type SourceType = 'article' | 'course_module' | 'faq' | 'product';

interface EmbedRequest {
  source_type: SourceType;
  source_id: string;
  locale: string;
  content: string;
  metadata?: Record<string, unknown>;
}

/**
 * POST /api/kb/embed
 * Body: { source_type, source_id, locale, content, metadata? }
 * Caller must be admin or editor.
 * Chunks content, embeds via Voyage (or Mistral), upserts kb_chunks rows
 * (deletes prior chunks for the same source first).
 */
export async function POST(req: Request) {
  // Auth check via user-bound client
  const userClient = await getSupabaseServerClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: roles } = await userClient.from('user_roles').select('role').eq('user_id', user.id);
  const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
  const allowed = roleSet.has('admin') || roleSet.has('super_admin') || roleSet.has('editor');
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden — admin/editor only' }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY missing' },
      { status: 500 }
    );
  }

  let payload: EmbedRequest;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { source_type, source_id, locale, content, metadata } = payload;
  if (!source_type || !source_id || !locale || !content) {
    return NextResponse.json(
      { error: 'source_type + source_id + locale + content required' },
      { status: 400 }
    );
  }
  if (!['article', 'course_module', 'faq', 'product'].includes(source_type)) {
    return NextResponse.json({ error: 'Invalid source_type' }, { status: 400 });
  }

  if (!isEmbeddingConfigured()) {
    return NextResponse.json({
      placeholder: true,
      skipped: true,
      reason: 'Neither VOYAGE_API_KEY nor MISTRAL_API_KEY is configured — embedding skipped.',
    });
  }

  // Delete prior chunks for this source
  await admin
    .from('kb_chunks')
    .delete()
    .eq('source_type', source_type)
    .eq('source_id', source_id)
    .eq('locale', locale);

  const chunks = chunkText(content);
  const inserted: string[] = [];
  const errors: string[] = [];
  let modelUsed: string | undefined;

  for (const chunk of chunks) {
    const result = await embed(chunk, 'document');
    if (!result.ok || !result.embedding) {
      errors.push(result.error ?? 'unknown embed error');
      continue;
    }
    modelUsed ??= result.model;
    const { data, error } = await admin
      .from('kb_chunks')
      .insert({
        source_type,
        source_id,
        locale,
        content: chunk,
        embedding: result.embedding as unknown as string,
        metadata: { ...(metadata ?? {}), model: result.model },
      })
      .select('id')
      .single();
    if (error) {
      errors.push(error.message);
      continue;
    }
    if (data) inserted.push(data.id);
  }

  return NextResponse.json({
    ok: errors.length === 0,
    chunks_inserted: inserted.length,
    chunks_total: chunks.length,
    errors,
    model: modelUsed ?? null,
  });
}
