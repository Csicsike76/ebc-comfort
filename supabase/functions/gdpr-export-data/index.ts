// Edge Function: gdpr-export-data
// GDPR Article 15 — Right of Access
// Returns a complete JSON dump of all data tied to the calling user
// Authenticated users only — self-data only

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getServiceClient, getUserIdFromRequest } from '../_shared/supabase-client.ts';

serve(async (req: Request) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  if (req.method !== 'POST' && req.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  const userId = await getUserIdFromRequest(req);
  if (!userId) return errorResponse('Unauthorized', 401);

  const supa = getServiceClient();

  // Parallel fetch all user-related data
  const [
    profile,
    roles,
    consents,
    orders,
    payments,
    returns_,
    warranties,
    enrollments,
    quizAttempts,
    donations,
    supportRequests,
    chatConversations,
    callLogs,
    auditLog,
    npsResponses,
    newsletterSubscriptions,
    dsrRequests,
    emailSentLog,
    securityEvents,
  ] = await Promise.all([
    supa.from('profiles').select('*').eq('id', userId).single(),
    supa.from('user_roles').select('*').eq('user_id', userId),
    supa.from('consents').select('*').eq('user_id', userId),
    supa.from('orders').select('*, order_items(*)').eq('user_id', userId),
    supa.from('payments').select('*, orders!inner(user_id)').eq('orders.user_id', userId),
    supa.from('returns').select('*').eq('user_id', userId),
    supa.from('warranty_claims').select('*').eq('user_id', userId),
    supa.from('course_enrollments').select('*').eq('user_id', userId),
    supa.from('quiz_attempts').select('*').eq('user_id', userId),
    supa.from('donations').select('*').eq('donor_id', userId),
    supa.from('support_requests').select('*').eq('user_id', userId),
    supa.from('chat_conversations').select('*, chat_messages(*)').eq('user_id', userId),
    supa.from('call_logs').select('*').eq('user_id', userId),
    supa.from('audit_log').select('*').eq('user_id', userId),
    supa.from('nps_responses').select('*').eq('user_id', userId),
    // GDPR-audit gap: previously missing tables — added 2026-05-18
    supa.from('newsletter_subscriptions').select('*').eq('user_id', userId),
    supa.from('dsr_requests').select('*').eq('user_id', userId),
    supa.from('email_sent_log').select('*').eq('user_id', userId),
    supa.from('security_events').select('*').eq('user_id', userId),
  ]);

  // Audit-log this export event
  await supa.from('security_events').insert({
    user_id: userId,
    event_type: 'gdpr_export',
    severity: 'info',
    description: 'User exported personal data',
  });

  return jsonResponse({
    exported_at: new Date().toISOString(),
    user_id: userId,
    data: {
      profile: profile.data,
      roles: roles.data,
      consents: consents.data,
      orders: orders.data,
      payments: payments.data,
      returns: returns_.data,
      warranty_claims: warranties.data,
      course_enrollments: enrollments.data,
      quiz_attempts: quizAttempts.data,
      donations: donations.data,
      support_requests: supportRequests.data,
      chat_conversations: chatConversations.data,
      call_logs: callLogs.data,
      audit_log: auditLog.data,
      nps_responses: npsResponses.data,
      newsletter_subscriptions: newsletterSubscriptions.data,
      dsr_requests: dsrRequests.data,
      email_sent_log: emailSentLog.data,
      security_events: securityEvents.data,
    },
  });
});
