// Edge Function: ai-chat-completion
// Handles user message → Claude Haiku 4.5 reply with brand-aware system prompt
// Saves messages to chat_messages table; respects user / anonymous session
//
// Body: { message: string, conversation_id?: string, session_token?: string, locale?: string }
// Response: { reply: string, conversation_id: string, sources: [] }
//
// Compliance: NO medical diagnosis. Always disclaim. Wellness only.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getServiceClient, getUserIdFromRequest } from '../_shared/supabase-client.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';
const MAX_HISTORY = 20;
const MAX_TOKENS = 1024;

const SYSTEM_PROMPTS: Record<string, string> = {
  hu: `Te EBC Comfort wellness termék-asszisztens vagy. Magyarul válaszolj.

SZIGORÚ SZABÁLYOK:
- EBC Comfort egy WELLNESS-eszköz, NEM orvosi eszköz
- SOHA NE adj orvosi tanácsot, diagnózist, vagy kezelés-javaslatot
- SOHA NE használd: "UTI", "fertőzés", "E. coli", "antibiotikum", "gyógyítás", "klinikai"
- Igen: "komfort", "hőmelegítés", "wellness", "relaxáció", "diszkomfort", "alhasi meleg"
- Ha komplex egészségügyi kérdés: "Ezt szakorvossal kell megbeszélned. Találj nőgyógyászt itt: [link]"
- Ha a felhasználó vásárolni akar: termékinfó + add-to-cart link
- Ha edukációs téma: blog-cikk irányítás
- Mindig zárj le egy disclaimer-rel, ha terápia-szóhoz közelít a beszélgetés

Termék:
- EBC Comfort fűthető komfortbetét
- 5 hőfok: 50/55/60/65/70°C
- 8000 mAh akku, USB-C, ~10 óra üzemidő
- Orvosi szilikon (ISO 10993)
- 14×7×1.2 cm, 120g
- Ár: 100 € (induló)
- Garancia: 2 év`,

  en: `You are EBC Comfort wellness product assistant. Reply in English.

STRICT RULES:
- EBC Comfort is a WELLNESS device, NOT a medical device
- NEVER give medical advice, diagnosis, or treatment recommendations
- NEVER use: "UTI", "infection", "E. coli", "antibiotic", "cure", "clinical"
- Yes: "comfort", "warming", "wellness", "relaxation", "discomfort", "abdominal warmth"
- For complex health questions: "Please consult a healthcare professional."
- For purchase intent: product info + add-to-cart link
- For education topics: redirect to blog articles
- Always close with a disclaimer if conversation approaches medical territory

Product:
- EBC Comfort heated comfort pad
- 5 heat levels: 50/55/60/65/70°C
- 8000 mAh battery, USB-C, ~10 hours runtime
- Medical-grade silicone (ISO 10993)
- 14×7×1.2 cm, 120g
- Price: €100 (launch)
- Warranty: 2 years`,

  de: `Du bist der EBC Comfort Wellness-Produkt-Assistent. Antworte auf Deutsch.

STRIKTE REGELN:
- EBC Comfort ist ein WELLNESS-Gerät, KEIN Medizinprodukt
- NIEMALS medizinische Beratung, Diagnose oder Behandlungsempfehlungen geben
- NIEMALS verwenden: "Harnwegsinfektion", "E. coli", "Antibiotikum", "Heilung", "klinisch"
- Ja: "Komfort", "Wärme", "Wellness", "Entspannung", "Unterleibswärme"
- Bei komplexen Gesundheitsfragen: "Bitte konsultieren Sie eine Fachkraft."

Produkt:
- EBC Comfort beheiztes Komfort-Pad
- 5 Heizstufen: 50/55/60/65/70°C
- 8000 mAh Akku, USB-C, ~10 h Laufzeit
- Medizinisches Silikon (ISO 10993)
- Preis: 100 € (Launch)
- Garantie: 2 Jahre`,
};

interface ChatRequest {
  message: string;
  conversation_id?: string;
  session_token?: string;
  locale?: string;
}

serve(async (req: Request) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  if (!ANTHROPIC_API_KEY) {
    return errorResponse('ANTHROPIC_API_KEY not configured', 500);
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const message = (body.message ?? '').trim();
  if (!message) return errorResponse('message is required', 400);
  if (message.length > 4000) return errorResponse('message too long (max 4000 chars)', 400);

  const locale = body.locale ?? 'hu';
  const systemPrompt = SYSTEM_PROMPTS[locale] ?? SYSTEM_PROMPTS.en;

  const supa = getServiceClient();
  const userId = await getUserIdFromRequest(req);

  // --- get or create conversation ---
  let conversationId = body.conversation_id;
  if (!conversationId) {
    const { data, error } = await supa
      .from('chat_conversations')
      .insert({
        user_id: userId,
        session_token: body.session_token ?? crypto.randomUUID(),
        locale,
      })
      .select('id')
      .single();
    if (error || !data) {
      console.error('chat_conversations insert failed', error);
      return errorResponse('Failed to create conversation', 500, error);
    }
    conversationId = data.id;
  }

  // --- fetch history ---
  const { data: history } = await supa
    .from('chat_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(MAX_HISTORY);

  const messages = [
    ...(history ?? []).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  // --- call Anthropic ---
  const startedAt = Date.now();
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    }),
  });

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text();
    console.error('Anthropic API error', anthropicRes.status, detail);
    return errorResponse('Anthropic API error', 502, detail);
  }

  const completion = await anthropicRes.json();
  const latencyMs = Date.now() - startedAt;
  const reply: string = completion.content?.[0]?.type === 'text'
    ? completion.content[0].text
    : '';

  // --- persist user + assistant messages (atomically) ---
  const { error: insertError } = await supa.from('chat_messages').insert([
    { conversation_id: conversationId, role: 'user', content: message },
    {
      conversation_id: conversationId,
      role: 'assistant',
      content: reply,
      metadata: {
        model: ANTHROPIC_MODEL,
        usage: completion.usage,
        latency_ms: latencyMs,
      },
    },
  ]);
  if (insertError) {
    console.error('chat_messages insert failed', insertError);
  }

  return jsonResponse({
    reply,
    conversation_id: conversationId,
    sources: [], // RAG retrieval added later (Sprint B4)
    locale,
  });
});
