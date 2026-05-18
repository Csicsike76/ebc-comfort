import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { verifyRetellSignature, isRetellConfigured } from '@/lib/retell';

export const runtime = 'nodejs';

interface RetellEventPayload {
  event: 'call_started' | 'call_ended' | 'call_analyzed' | string;
  call: {
    call_id: string;
    agent_id?: string;
    from_number?: string;
    to_number?: string;
    duration_ms?: number;
    transcript_url?: string;
    recording_url?: string;
    transcript?: string;
    call_status?: string;
    start_timestamp?: number;
    end_timestamp?: number;
    call_analysis?: {
      call_summary?: string;
      topic?: string;
      escalation_needed?: boolean;
      consent_recorded?: boolean;
      sentiment?: string;
    };
    metadata?: Record<string, unknown>;
  };
}

export async function POST(req: Request) {
  if (!isRetellConfigured()) {
    return NextResponse.json(
      { error: 'Retell not configured (placeholder)' },
      { status: 503 }
    );
  }

  const rawBody = await req.text();
  const sig = (await headers()).get('x-retell-signature');
  if (!verifyRetellSignature(rawBody, sig)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: RetellEventPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY missing' },
      { status: 503 }
    );
  }

  const call = event.call;
  if (!call?.call_id) {
    return NextResponse.json({ error: 'Missing call.call_id' }, { status: 400 });
  }

  const startedAt = call.start_timestamp ? new Date(call.start_timestamp).toISOString() : new Date().toISOString();
  const endedAt = call.end_timestamp ? new Date(call.end_timestamp).toISOString() : null;
  const durationSec = call.duration_ms ? Math.round(call.duration_ms / 1000) : null;

  // Upsert call_logs by call_id (handles call_started → call_ended → call_analyzed sequence)
  const { error: upsertErr } = await admin
    .from('call_logs')
    .upsert(
      {
        call_id: call.call_id,
        agent_id: call.agent_id ?? null,
        phone_number: call.from_number ?? null,
        duration_seconds: durationSec,
        transcript_url: call.transcript_url ?? null,
        recording_url: call.recording_url ?? null,
        summary: call.call_analysis?.call_summary ?? null,
        topic: call.call_analysis?.topic ?? null,
        escalation_needed: call.call_analysis?.escalation_needed ?? false,
        consent_recorded: call.call_analysis?.consent_recorded ?? false,
        started_at: startedAt,
        ended_at: endedAt,
      },
      { onConflict: 'call_id' }
    );

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  // Look up call_logs.id for event row
  const { data: logRow } = await admin
    .from('call_logs')
    .select('id')
    .eq('call_id', call.call_id)
    .single();

  if (logRow) {
    await admin.from('call_events').insert({
      call_id: logRow.id,
      event_type: event.event,
      payload: event as unknown as Record<string, unknown>,
    });
  }

  return NextResponse.json({ received: true, event: event.event });
}
