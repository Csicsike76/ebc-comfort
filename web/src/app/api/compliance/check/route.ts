import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Hard-coded HU/EN/DE medical-claim red flags for fast pre-check
// (before calling Claude for nuance). These are forbidden in wellness-launch phase.
const FORBIDDEN_KEYWORDS = [
  // HU
  'UTI', 'húgyúti', 'húgyhólyag', 'E. coli', 'E.coli', 'baktérium',
  'antibiotikum', 'gyógyít', 'gyógyítás', 'kezel', 'kezelés',
  'orvosi eszköz', 'gyógyhatás', 'tünet enyhít', 'fertőzés', 'gyulladás',
  // EN
  'urinary', 'bladder', 'bacteria', 'antibiotic', 'cure', 'treat',
  'medical device', 'therapeutic', 'symptom relief', 'infection', 'inflammation',
  // DE
  'Harnweg', 'Blase', 'Bakterium', 'Antibiotikum', 'heilen', 'Behandlung',
  'Medizinprodukt', 'therapeutisch', 'Infektion', 'Entzündung',
];

interface RequestBody {
  text: string;
  locale?: string;
  context?: 'marketing' | 'article' | 'product' | 'general';
}

/**
 * POST /api/compliance/check
 * Admin/editor only. Pre-flight check on any user-facing text to detect
 * medical-claim violations BEFORE publishing.
 * Returns:
 *   - hits: keyword matches (hard rule)
 *   - ai_review: Claude nuance check (if available)
 *   - verdict: 'clean' | 'review_needed' | 'forbidden'
 */
export async function POST(req: Request) {
  const userClient = await getSupabaseServerClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: roles } = await userClient.from('user_roles').select('role').eq('user_id', user.id);
  const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
  if (!(roleSet.has('admin') || roleSet.has('super_admin') || roleSet.has('editor'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body: RequestBody = await req.json().catch(() => ({ text: '' }));
  const text = (body.text ?? '').trim();
  const locale = body.locale ?? 'hu';
  const context = body.context ?? 'general';

  if (!text) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }
  if (text.length > 50000) {
    return NextResponse.json({ error: 'text too long (max 50k chars)' }, { status: 400 });
  }

  // Hard-rule keyword match
  const lowerText = text.toLowerCase();
  const hits = FORBIDDEN_KEYWORDS.filter((kw) => lowerText.includes(kw.toLowerCase()));

  // AI nuance review via Edge Function
  const aiPrompt = `Te egy compliance reviewer vagy az EBC Comfort wellness-brandhez. Az EBC Comfort egy fűthető komfortbetét — WELLNESS-eszköz, NEM orvosi eszköz.

A wellness-launch alatt TILOS bármilyen utalás:
- UTI, húgyúti fertőzés, E. coli, baktérium-okozta panasz
- Antibiotikum-alternatíva, gyógyítás, kezelés
- Specifikus tünetek "enyhítése" vagy "megszüntetése"
- Orvosi eszközként pozícionálás (CE-medical kell)

MEGENGEDETT:
- "Alhasi hőkomfort", "diszkrét melegítés", "wellness", "komfort-érzés"
- "Hőterápia" mint általános koncepció (NEM specifikus betegségre)
- Tájékoztatás a termék hőfokairól, akkujáról

Kontextus: ${context}. Locale: ${locale}.

Ellenőrizd az alábbi szöveget. Válasz JSON formátumban, JSON-on kívül semmi:
{
  "verdict": "clean" | "review_needed" | "forbidden",
  "violations": [
    {"snippet": "idézett szövegrész", "issue": "miért problémás", "severity": "low|medium|high", "suggestion": "javaslat átírásra"}
  ],
  "overall_risk_score": 0-100
}

Szöveg:
"""${text.slice(0, 12000)}"""`;

  let aiReview: Record<string, unknown> | null = null;
  let aiError: string | null = null;

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat-completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ message: aiPrompt, locale: 'hu', raw_mode: true }),
    });
    if (res.ok) {
      const data = (await res.json()) as { message?: string; content?: string };
      const aiText = data.message ?? data.content ?? '';
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          aiReview = JSON.parse(jsonMatch[0]);
        } catch (e) {
          aiError = `AI returned invalid JSON: ${e instanceof Error ? e.message : 'parse error'}`;
        }
      } else {
        aiError = 'AI did not return JSON';
      }
    } else {
      aiError = `AI HTTP ${res.status}`;
    }
  } catch (e) {
    aiError = e instanceof Error ? e.message : 'AI call failed';
  }

  // Fail-CLOSED verdict logic. If keyword scan or AI nuance check find any
  // problem, we surface it. If the AI nuance check failed (network, parse,
  // invalid JSON), we DOWNGRADE to 'review_needed' so an editor sees the
  // result instead of silently approving regulated text.
  let verdict: 'clean' | 'review_needed' | 'forbidden';
  if (hits.length > 0) {
    verdict = 'forbidden';
  } else if (aiReview && (aiReview.verdict === 'forbidden' || aiReview.verdict === 'review_needed')) {
    verdict = aiReview.verdict as 'forbidden' | 'review_needed';
  } else if (!aiReview) {
    // AI nuance check did not return a usable result → fail-closed.
    verdict = 'review_needed';
  } else {
    verdict = 'clean';
  }

  // Audit-log
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'admin_action',
      resource_type: 'compliance_check',
      resource_id: null,
      payload_after: {
        context,
        locale,
        text_excerpt: text.slice(0, 500),
        text_length: text.length,
        hits,
        verdict,
        ai_verdict: aiReview?.verdict,
        ai_risk_score: aiReview?.overall_risk_score,
      },
      reason: `Compliance check (${context}/${locale}) → ${verdict}`,
    });
  }

  return NextResponse.json({
    verdict,
    keyword_hits: hits,
    ai_review: aiReview,
    ai_error: aiError,
    text_length: text.length,
  });
}
