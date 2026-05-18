// Edge Function: gdpr-erase-data
// GDPR Article 17 — Right to Erasure ("right to be forgotten")
// Soft-deletes user PII while preserving audit-trail records (NULLifies PII columns)
// Permanently anonymizes orders, payments, etc. — financial records kept for accounting law

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getServiceClient, getUserIdFromRequest } from '../_shared/supabase-client.ts';

interface EraseRequest {
  confirm: boolean; // user must explicitly confirm
  reason?: string;
}

serve(async (req: Request) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const userId = await getUserIdFromRequest(req);
  if (!userId) return errorResponse('Unauthorized', 401);

  let body: EraseRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  if (!body.confirm) {
    return errorResponse(
      'Must confirm erasure with { "confirm": true }. This is irreversible.',
      400
    );
  }

  const supa = getServiceClient();
  const erasedAt = new Date().toISOString();

  // 1. Anonymize profile (keep id reference for FKs)
  const { error: profileError } = await supa
    .from('profiles')
    .update({
      email: `erased+${userId}@ebccomfort.invalid`,
      full_name: '[GDPR-ERASED]',
      phone: null,
      avatar_url: null,
      newsletter_opt_in: false,
      marketing_opt_in: false,
    })
    .eq('id', userId);

  if (profileError) {
    return errorResponse('Failed to anonymize profile', 500, profileError);
  }

  // 2. NULLify PII in orders (keep order_number, totals for accounting)
  await supa
    .from('orders')
    .update({
      shipping_address: { erased: true, erased_at: erasedAt },
      billing_address: null,
      notes: null,
    })
    .eq('user_id', userId);

  // 3. NULLify PII in support requests
  await supa
    .from('support_requests')
    .update({
      full_name: '[ERASED]',
      email: null,
      phone: null,
      reason: '[ERASED]',
      income_proof_url: null,
    })
    .eq('user_id', userId);

  // 4. NULLify chat content
  await supa
    .from('chat_messages')
    .update({ content: '[ERASED]' })
    .in(
      'conversation_id',
      (await supa.from('chat_conversations').select('id').eq('user_id', userId)).data?.map(
        (c: { id: string }) => c.id
      ) ?? []
    );

  // 5. NULLify call_log details
  await supa
    .from('call_logs')
    .update({
      phone_number: null,
      transcript_url: null,
      recording_url: null,
      summary: '[ERASED]',
    })
    .eq('user_id', userId);

  // 6. Unsubscribe newsletter
  await supa
    .from('newsletter_subscriptions')
    .update({ unsubscribed_at: erasedAt })
    .eq('user_id', userId);

  // 7. NULLify audit_log PII (keep action/timestamp for compliance)
  await supa
    .from('audit_log')
    .update({
      ip_address: null,
      user_agent: null,
      payload_before: null,
      payload_after: null,
    })
    .eq('user_id', userId);

  // 8. Log security event (this row is the "tombstone")
  await supa.from('security_events').insert({
    user_id: userId,
    event_type: 'gdpr_erasure',
    severity: 'warning',
    description: 'User exercised right to erasure',
    metadata: { reason: body.reason ?? null, erased_at: erasedAt },
  });

  return jsonResponse({
    ok: true,
    erased_at: erasedAt,
    user_id: userId,
    note: 'Personal data anonymized. Order/payment records retained for 8 years per accounting law. Profile email replaced with placeholder.',
  });
});
