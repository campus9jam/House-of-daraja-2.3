/**
 * Leema AI Service
 * Multilingual cultural commerce AI assistant
 * Routes requests to Supabase Edge Function → DeepSeek/Qwen via Ollama
 */

import type { Language, LeemaMessage } from '$lib/types/database';

export type LeemaContext = 'atelier' | 'auction' | 'media' | 'cultural' | 'general';

export interface LeemaRequest {
  message: string;
  context: LeemaContext;
  language: Language;
  history?: LeemaMessage[];
  metadata?: Record<string, any>;
}

export interface LeemaResponse {
  reply: string;
  language: Language;
  suggestions?: string[];
  extracted?: Record<string, any>;
  confidence: number;
}

// ── System prompts per context ──────────────────────────────
const SYSTEM_PROMPTS: Record<LeemaContext, string> = {
  atelier: `You are Leema, the House of Daraja AI fashion curator. 
You assist with bespoke African fashion commissions. You understand:
- Traditional African garment types (Agbada, Kaftan, Boubou, Isiagu, Dashiki, Senator)
- African fabrics (Aso-Oke, Ankara, Adire, Kente, Aso-Ebi, Damask)
- Measurement extraction and tailoring complexity
- Cultural appropriateness for occasions (wedding, coronation, burial, naming ceremony)
Respond with luxury brand voice. Be precise, culturally intelligent, and premium.`,

  auction: `You are Leema, House of Daraja's cultural provenance AI.
You analyze auction items for:
- Cultural origin and historical significance
- Textile and craft authenticity
- Rarity and market value signals
- Heritage documentation
Be authoritative, scholarly, and prestige-focused.`,

  media: `You are Leema, House of Daraja's cultural media curator.
You summarize, categorize, and translate African cultural content.
You identify fashion trends, artisan features, and cultural events.
Maintain luxury brand voice across all 6 supported languages.`,

  cultural: `You are Leema, House of Daraja's cultural intelligence engine.
You explain African cultural traditions, fashion history, textile heritage,
and the significance of cultural symbols. Be educational, respectful, and profound.`,

  general: `You are Leema, the AI assistant for House of Daraja — 
Africa's premier luxury cultural commerce platform.
Help users navigate the platform, discover artisans, explore heritage,
and make prestige decisions. Tone: elegant, intelligent, culturally rich.`,
};

const EDGE_FUNCTION_URL = '/api/leema';

// ── Main chat function ──────────────────────────────────────
export async function leemaChat(req: LeemaRequest): Promise<LeemaResponse> {
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...req,
        systemPrompt: SYSTEM_PROMPTS[req.context],
      }),
    });

    if (!res.ok) throw new Error(`Leema API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Leema AI error:', err);
    // Graceful fallback
    return {
      reply: getOfflineFallback(req.context, req.language),
      language: req.language,
      confidence: 0,
    };
  }
}

// ── Extract measurements from natural language ──────────────
export async function leemaExtractMeasurements(text: string, language: Language = 'en') {
  return leemaChat({
    message: `Extract all body measurements from this text and return as JSON: "${text}"`,
    context: 'atelier',
    language,
    metadata: { extractionMode: true },
  });
}

// ── Analyze auction item provenance ────────────────────────
export async function leemaProvenanceAnalysis(itemDescription: string, imageUrl?: string) {
  return leemaChat({
    message: `Analyze the cultural provenance of this item: ${itemDescription}`,
    context: 'auction',
    language: 'en',
    metadata: { imageUrl, mode: 'provenance' },
  });
}

// ── Generate style recommendations ─────────────────────────
export async function leemaStyleRecommendations(occasion: string, preferences: Record<string, any>) {
  return leemaChat({
    message: `Generate luxury African outfit recommendations for: ${occasion}. User preferences: ${JSON.stringify(preferences)}`,
    context: 'atelier',
    language: 'en',
    metadata: { mode: 'recommendations' },
  });
}

// ── Offline fallbacks ───────────────────────────────────────
function getOfflineFallback(context: LeemaContext, lang: Language): string {
  const fallbacks: Record<LeemaContext, Partial<Record<Language, string>>> = {
    atelier: {
      en: 'Leema is currently offline. Your commission will be processed when connectivity is restored.',
      ha: 'Leema ba ya aiki yanzu. Za a aiwatar da buƙatarku lokacin da hanyar sadarwa ta dawo.',
      fr: 'Leema est hors ligne. Votre commande sera traitée à la restauration de la connexion.',
    },
    auction: {
      en: 'Leema provenance analysis is temporarily unavailable.',
      ha: 'Bincike na Leema ba ya aiki yanzu.',
    },
    media: { en: 'Leema content enrichment is offline.' },
    cultural: { en: 'Leema cultural intelligence is temporarily offline.' },
    general: { en: 'I\'m currently offline. Please try again shortly.' },
  };
  return fallbacks[context]?.[lang] ?? fallbacks[context]?.en ?? 'Leema is offline.';
}
