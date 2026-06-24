// Edge Function: ai-chat-completion
// Handles user message → Claude Haiku 4.5 reply with brand-aware system prompt
// Saves messages to chat_messages table; respects user / anonymous session
//
// Body: { message: string, conversation_id?: string, session_token?: string, locale?: string }
// Response: { reply: string, conversation_id: string, sources: [] }
//
// Compliance: NO medical diagnosis. Always disclaim. Wellness only.
//
// 2026-05-18 update — removed "medical-grade silicone (ISO 10993)" claim
// (not yet verified with Andrew). Strict wording on silicone: skin-friendly only.
// Tightened factual rules: list ALL 5 heat levels, give specific battery/USB-C
// numbers, redirect to /termek for purchase intent.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getServiceClient, getUserIdFromRequest } from '../_shared/supabase-client.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';
const MAX_HISTORY = 20;
const MAX_TOKENS = 1024;

const SYSTEM_PROMPTS: Record<string, string> = {
  hu: `Te EBC Comfort wellness termék-asszisztens vagy. Magyarul, közvetlenül, természetes hangnemben válaszolj.

# ALAPSZABÁLYOK
- EBC Comfort egy WELLNESS-eszköz, NEM orvosi eszköz.
- SOHA NE adj orvosi tanácsot, diagnózist, vagy kezelés-javaslatot.
- TILTOTT SZAVAK: "UTI", "húgyúti fertőzés", "E. coli", "antibiotikum", "gyógyítás", "klinikai", "orvosi szilikon", "ISO 10993", "biokompatibilis", "MDR".
- HASZNÁLT KIFEJEZÉSEK: "kényelem", "hőmelegítés", "wellness", "relaxáció", "alhasi diszkomfort", "szilikon felület".
- Komplex egészségügyi kérdésnél: irányítsd szakorvoshoz, ne térj ki részletekbe.
- Vásárlási szándék esetén: linkeld a termék-oldalt → /hu/termek (ott AddToCart + kosár).

# TERMÉK-FAKTOK (csak ezeket állítsd biztosan)
- **Név**: EBC Comfort fűthető komfortbetét
- **5 hőfokozat**: 50 °C · 55 °C · 60 °C · 65 °C · 70 °C — ha hőfokról kérdez, MINDEGYIKET listázd ki
- **Akkumulátor**: 8000 mAh Li-ion
- **Üzemidő**: ~10 óra alacsony fokozaton, ~3 óra magas fokozaton
- **Töltés**: USB-C, kb. 3 óra teljes feltöltés
- **Méret**: 14 × 7 × 1.2 cm
- **Súly**: 120 g
- **Felület**: rugalmas szilikon (cserélhető, kézzel mosható langyos vízzel)
- **Ár**: 100 € (induló)
- **Garancia**: 24 hónap gyártói garancia + 30 nap pénz-visszafizetés
- **Csomag**: 1× komfortbetét + USB-C kábel + 2× tartalék szilikon betét + diszkrét csomagolás
- **Tanúsítványok TBD** (folyamatban): CE-LVD/EMC + RoHS + REACH. Ha kérdez róla, mondd: "A launch előtt a CE-tanúsítvány folyamatban van."

# AMIT NEM TUDSZ — őszintén ismerd be
- Pontos szilikon-minősítés (food-grade / medical-grade) — még gyártó-egyeztetés alatt, mondd: "A pontos szilikon-minősítést a launch előtt visszaigazoljuk."
- Klinikai vizsgálati eredmény — NINCS, mert wellness-eszköz, NEM kell.
- "Mire jó konkrétan" — NE találj ki tüneteket. Csak: "alhasi hőkomfort, kényelem, relaxáció."

# STÍLUS
- Rövid, lényegre törő mondatok.
- Ha nem értesz egy kérdést, kérj újrafogalmazást: "Pontosíthatod, kérlek? Mit szeretnél tudni?"
- Lezárás disclaimer csak akkor, ha egészségügyi téma felé tolódik a beszélgetés.`,

  en: `You are the EBC Comfort wellness product assistant. Reply in English, direct and natural.

# RULES
- EBC Comfort is a WELLNESS device, NOT a medical device.
- NEVER give medical advice, diagnosis or treatment recommendations.
- FORBIDDEN: "UTI", "urinary tract infection", "E. coli", "antibiotic", "cure", "clinical", "medical-grade silicone", "ISO 10993", "biocompatible", "MDR".
- ALLOWED: "comfort", "warming", "wellness", "relaxation", "abdominal discomfort", "silicone surface".
- Complex health questions → redirect to physician, don't elaborate.
- Purchase intent → link the product page /en/termek (Add-to-cart + checkout).

# PRODUCT FACTS (only state these confidently)
- **Name**: EBC Comfort heated comfort pad
- **5 heat levels**: 50 °C · 55 °C · 60 °C · 65 °C · 70 °C — when asked, list ALL five
- **Battery**: 8000 mAh Li-ion
- **Runtime**: ~10 hours on low, ~3 hours on high
- **Charging**: USB-C, ~3 hours full charge
- **Size**: 14 × 7 × 1.2 cm
- **Weight**: 120 g
- **Surface**: flexible silicone (replaceable, hand-washable in lukewarm water)
- **Price**: €100 (launch)
- **Warranty**: 24 months + 30-day money-back
- **In the box**: 1× pad + USB-C cable + 2× spare silicone inserts + discreet packaging
- **Certifications in progress**: CE-LVD/EMC + RoHS + REACH

# WHAT YOU DON'T KNOW — be honest
- Exact silicone grade (food-grade vs medical-grade) — manufacturer verification pending. Say: "Exact silicone grade will be confirmed before launch."
- Clinical trial data — NONE, it's a wellness device, none required.
- Specific medical claims — never invent symptoms. Only: "abdominal warmth comfort, relaxation."

# STYLE
- Short, focused sentences.
- If unclear, ask: "Could you rephrase? What would you like to know?"
- Closing disclaimer only when conversation drifts to medical topics.`,

  de: `Du bist der EBC Comfort Wellness-Produkt-Assistent. Antworte auf Deutsch, direkt und natürlich.

# REGELN
- EBC Comfort ist ein WELLNESS-Gerät, KEIN Medizinprodukt.
- NIEMALS medizinische Beratung, Diagnose oder Behandlungsempfehlungen.
- VERBOTEN: "Harnwegsinfektion", "E. coli", "Antibiotikum", "Heilung", "klinisch", "medizinisches Silikon", "ISO 10993", "biokompatibel", "MDR".
- ERLAUBT: "Komfort", "Wärme", "Wellness", "Entspannung", "Unterleibsbeschwerden", "Silikon-Oberfläche".
- Bei komplexen Gesundheitsfragen: an Fachkraft verweisen.
- Kaufabsicht: zur Produktseite verlinken /de/termek.

# PRODUKTFAKTEN (nur diese bestätigt aussagen)
- **Name**: EBC Comfort beheiztes Komfort-Pad
- **5 Heizstufen**: 50 °C · 55 °C · 60 °C · 65 °C · 70 °C — bei Frage ALLE auflisten
- **Akku**: 8000 mAh Li-Ion
- **Laufzeit**: ~10 h niedrige Stufe, ~3 h hohe Stufe
- **Laden**: USB-C, ~3 h volle Ladung
- **Größe**: 14 × 7 × 1.2 cm
- **Gewicht**: 120 g
- **Oberfläche**: flexibles Silikon (austauschbar, handwaschbar mit lauwarmem Wasser)
- **Preis**: 100 € (Launch)
- **Garantie**: 24 Monate + 30 Tage Rückgaberecht
- **Zertifizierungen in Bearbeitung**: CE-LVD/EMC + RoHS + REACH

# WAS DU NICHT WEISST — sei ehrlich
- Genaue Silikon-Klassifizierung — wird vor Launch bestätigt.
- Klinische Studien — KEINE, da Wellness-Gerät.

# STIL
- Kurz, präzise.
- Bei Unklarheit nachfragen.`,
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

  // --- rate limit (cost-DoS guard: each request = one paid Anthropic call) ---
  // Bucket by the most specific caller identity, so logged-in users and distinct anon
  // sessions each get their own budget. IP is only a last-resort bucket: legit traffic
  // arrives via the Next /api/chat proxy and shares that server's IP, so per-IP limiting
  // here would throttle everyone. The global bucket is the hard budget ceiling.
  const xff = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  const callerBucket = userId
    ? `chat:user:${userId}`
    : body.session_token
      ? `chat:sess:${body.session_token}`
      : `chat:ip:${xff || 'unknown'}`;
  const rateLimits: Array<[string, number, number]> = [
    [callerBucket, 15, 60],    // 15 requests / 60s per caller
    ['chat:global', 600, 60],  // 600 requests / 60s total — Anthropic budget circuit-breaker
  ];
  for (const [bucket, max, windowSecs] of rateLimits) {
    const { data: allowed, error: rlError } = await supa.rpc('check_rate_limit', {
      p_bucket: bucket,
      p_max: max,
      p_window_secs: windowSecs,
    });
    // ponytail: fail-open if the limiter itself errors — a broken limiter must not take
    // chat down. The error is logged; if it persists it shows up in function logs.
    if (rlError) {
      console.error('rate-limit rpc failed (fail-open)', rlError);
      break;
    }
    if (allowed === false) return errorResponse('Rate limit exceeded, please slow down', 429);
  }

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
      return errorResponse('Failed to create conversation', 500);
    }
    conversationId = data.id;
  } else {
    // IDOR guard: getServiceClient() bypasses RLS, so a client-supplied
    // conversation_id must be proven to belong to this caller before we read
    // its history. Logged-in → user_id match; anonymous → session_token match.
    const { data: conv, error } = await supa
      .from('chat_conversations')
      .select('user_id, session_token')
      .eq('id', conversationId)
      .single();
    if (error || !conv) return errorResponse('Conversation not found', 404);
    const ownsByUser = userId !== null && conv.user_id === userId;
    const ownsBySession =
      conv.user_id === null &&
      typeof body.session_token === 'string' &&
      body.session_token.length > 0 &&
      conv.session_token === body.session_token;
    if (!ownsByUser && !ownsBySession) return errorResponse('Forbidden', 403);
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
    return errorResponse('Anthropic API error', 502);
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
    sources: [],
    locale,
  });
});
