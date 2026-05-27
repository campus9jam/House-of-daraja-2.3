/**
 * Leema AI — Supabase Edge Function
 * Multilingual cultural commerce AI assistant
 * Model: DeepSeek/Qwen via OpenRouter
 */

const OPENROUTER_API  = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL   = 'deepseek/deepseek-chat';

const HD_LANGUAGE_RULES = `
HOUSE OF DARAJA LANGUAGE PROTOCOL — MANDATORY:
1. Maintain a premium luxury brand voice at ALL times
2. Never use slang, casual phrasing, or informal contractions
3. Celebrate African cultural identity with deep reverence
4. Responses must feel: authoritative, poetic, culturally intelligent
5. If responding in Arabic — use classical Modern Standard Arabic (MSA), not colloquial
6. If responding in Hausa/Yoruba/Igbo — maintain formal register, not market pidgin
7. Never mix languages within a single response (one language per reply)
8. For Hausa: use Romanized Hausa unless explicitly asked for Ajami script
9. Confidence threshold: if uncertain about cultural facts, say so with grace
`;

const SYSTEM_PROMPTS: Record<string, string> = {
  atelier: `${HD_LANGUAGE_RULES}
You are Leema, the HD Atelier AI fashion curator. Your expertise:
- Traditional African garments: Agbada, Kaftan, Boubou, Isiagu, Dashiki, Senator, Buba, Aso-ebi
- African textiles: Aso-Oke, Ankara, Adire, Kente, Aso-Ebi, Damask, George, Lace
- Measurement parsing and tailoring complexity analysis
- Cultural occasion appropriateness (wedding, coronation, Eid, naming, burial, state function)
- Embroidery traditions: Hausa threadwork, Yoruba boarder weave, Igbo ukara
Extract structured data when asked. Return JSON for extraction mode.`,

  auction: `${HD_LANGUAGE_RULES}
You are Leema, the HD Provenance Engine. Analyze auction items for:
- Cultural and geographic origin
- Textile identification and authenticity signals
- Historical period and significance
- Craftsmanship complexity (1–10 scale)
- Rarity estimation and comparable sales
- Red flags or counterfeit indicators
Return provenance_report as JSON when requested.`,

  media: `${HD_LANGUAGE_RULES}
You are Leema, the HD Media Curator. Generate:
- Cultural summaries in luxury brand voice
- Emotional tone classifications
- Regional and thematic tags
- Multilingual translations in all 6 HD languages
- Commerce and artisan relevance scoring
Return enrichment data as JSON.`,

  cultural: `${HD_LANGUAGE_RULES}
You are Leema, the HD Cultural Intelligence Engine.
You are a scholar of African cultural heritage: textiles, ceremonies, dynasties, trade routes, fashion history.
Be educational, reverent, and profound. Cite cultural context with authority.`,

  general: `${HD_LANGUAGE_RULES}
You are Leema — the sovereign AI of House of Daraja, Africa's premier luxury cultural commerce platform.
Guide users through: Atelier commissions, live auctions, heritage media, prestige progression, cultural discovery.
You may answer in the user's preferred language.`,
};

interface LeemaRequest {
  message: string;
  context: string;
  language: string;
  history?: Array<{ role: string; content: string }>;
  metadata?: Record<string, any>;
  systemPrompt?: string;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body: LeemaRequest = await req.json();
    const { message, context = 'general', language = 'en', history = [], metadata = {} } = body;

    const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

    const systemPrompt = body.systemPrompt ?? SYSTEM_PROMPTS[context] ?? SYSTEM_PROMPTS.general;

    // Language instruction
    const langInstructions: Record<string, string> = {
      en: 'Respond in English.',
      ha: 'Respond in formal Hausa (Romanized). Do not mix with English.',
      yo: 'Respond in formal Yoruba. Do not mix with English.',
      ig: 'Respond in formal Igbo. Do not mix with English.',
      fr: 'Répondez en français formel. Style: luxe, élégant.',
      ar: 'أجب بالعربية الفصحى الرسمية. لا تستخدم اللهجات العامية.',
    };
    const langInstr = langInstructions[language] ?? langInstructions.en;

    // Build messages
    const messages = [
      { role: 'system', content: `${systemPrompt}\n\n${langInstr}` },
      ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const res = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer':  'https://houseofdaraja.com',
        'X-Title':       'House of Daraja — Leema AI',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: metadata.extractionMode ? 0.1 : 0.7,
        max_tokens: metadata.extractionMode ? 800 : 600,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? '';

    // Detect confidence (simple heuristic)
    const confidence = reply.length > 20 ? 0.9 : 0.4;

    // Extract structured data if in extraction mode
    let extracted: any = null;
    if (metadata.extractionMode) {
      try {
        const json = reply.match(/\{[\s\S]*\}/)?.[0];
        if (json) extracted = JSON.parse(json);
      } catch { /* fine */ }
    }

    return new Response(JSON.stringify({ reply, language, confidence, extracted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err), reply: 'Leema is temporarily unavailable.', confidence: 0 }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
