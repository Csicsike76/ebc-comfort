/**
 * Voyage AI embedding client (voyage-3, 1024 dims — matches kb_chunks schema).
 * Falls through silently on placeholder key.
 * Optional Mistral fallback if VOYAGE_API_KEY missing but MISTRAL_API_KEY set.
 */

export interface EmbedResult {
  ok: boolean;
  embedding?: number[];
  model?: string;
  error?: string;
  placeholder?: boolean;
}

export function isVoyageConfigured(): boolean {
  const key = process.env.VOYAGE_API_KEY;
  return !!key && !key.includes('PLACEHOLDER');
}

export function isMistralConfigured(): boolean {
  const key = process.env.MISTRAL_API_KEY;
  return !!key && !key.includes('PLACEHOLDER');
}

export function isEmbeddingConfigured(): boolean {
  return isVoyageConfigured() || isMistralConfigured();
}

interface VoyageResponse {
  data?: { embedding: number[] }[];
  detail?: string;
}

export async function embed(
  text: string,
  inputType: 'document' | 'query' = 'document'
): Promise<EmbedResult> {
  if (!text || text.trim().length === 0) {
    return { ok: false, error: 'empty text' };
  }

  const voyageKey = process.env.VOYAGE_API_KEY;
  if (voyageKey && !voyageKey.includes('PLACEHOLDER')) {
    try {
      const res = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${voyageKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          input: [text.slice(0, 16000)],
          model: 'voyage-3',
          input_type: inputType,
          output_dimension: 1024,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        return { ok: false, error: `Voyage ${res.status}: ${txt.slice(0, 200)}` };
      }
      const data = (await res.json()) as VoyageResponse;
      const emb = data.data?.[0]?.embedding;
      if (!emb || emb.length !== 1024) {
        return { ok: false, error: 'Voyage returned no/invalid embedding' };
      }
      return { ok: true, embedding: emb, model: 'voyage-3' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'voyage network error' };
    }
  }

  // Mistral fallback (mistral-embed = 1024 dims, matches schema)
  const mistralKey = process.env.MISTRAL_API_KEY;
  if (mistralKey && !mistralKey.includes('PLACEHOLDER')) {
    try {
      const res = await fetch('https://api.mistral.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mistralKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-embed',
          input: [text.slice(0, 16000)],
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        return { ok: false, error: `Mistral ${res.status}: ${txt.slice(0, 200)}` };
      }
      const data = (await res.json()) as { data?: { embedding: number[] }[] };
      const emb = data.data?.[0]?.embedding;
      if (!emb || emb.length !== 1024) {
        return { ok: false, error: 'Mistral returned no/invalid embedding' };
      }
      return { ok: true, embedding: emb, model: 'mistral-embed' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'mistral network error' };
    }
  }

  return { ok: false, placeholder: true, error: 'No embedding API key configured' };
}

/**
 * Chunk a long markdown body into ~400-word pieces with light overlap
 * for higher recall on long articles.
 */
export function chunkText(text: string, maxWords = 400, overlap = 40): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  if (words.length <= maxWords) return [words.join(' ')];
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
    i += maxWords - overlap;
  }
  return chunks;
}
