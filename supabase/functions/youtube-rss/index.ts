/**
 * HD Collective Media Network — YouTube RSS Ingestion Pipeline
 * Supabase Edge Function: /api/youtube/rss
 *
 * Pipeline:
 * 1. Fetch RSS from @HouseofDaraja YouTube channel
 * 2. Parse XML → structured metadata
 * 3. Upsert into media_items (dedup by youtube_id)
 * 4. Run AI enrichment via DeepSeek
 * 5. Generate multilingual titles/descriptions
 * 6. Set status = 'pending' for editorial review
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const YOUTUBE_CHANNEL_ID = 'UCxxxxxxxxxxxxxxxxxxxxxxxx'; // Replace with actual HD channel ID
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
const HD_CHANNEL_FALLBACK = 'https://www.youtube.com/@HouseofDaraja';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

const LANGUAGES = ['ha', 'yo', 'ig', 'fr', 'ar'];

const LANG_NAMES: Record<string, string> = {
  ha: 'Hausa', yo: 'Yoruba', ig: 'Igbo', fr: 'French', ar: 'Arabic',
};

// ── RSS Fetch & Parse ───────────────────────────────────────
async function fetchYouTubeRSS(): Promise<RawVideoEntry[]> {
  const res = await fetch(RSS_URL);
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();
  return parseRSSXML(xml);
}

interface RawVideoEntry {
  youtube_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  published_at: string;
  channel_id: string;
}

function parseRSSXML(xml: string): RawVideoEntry[] {
  const entries: RawVideoEntry[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? '';
    const title   = entry.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? '';
    const channelId = entry.match(/<yt:channelId>(.*?)<\/yt:channelId>/)?.[1] ?? '';
    const description = entry.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1]?.trim() ?? '';
    const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    if (videoId) entries.push({
      youtube_id: videoId,
      title: decodeXMLEntities(title),
      description: decodeXMLEntities(description),
      thumbnail_url: thumbnail,
      published_at: published,
      channel_id: channelId,
    });
  }
  return entries;
}

function decodeXMLEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// ── AI Classification ───────────────────────────────────────
async function classifyVideoWithAI(title: string, description: string, apiKey: string) {
  const prompt = `You are Leema, the HD cultural commerce AI. Analyze this African cultural video and return JSON only.

Title: "${title}"
Description: "${description.slice(0, 400)}"

Return ONLY valid JSON:
{
  "category": "one of: dandali|zare_global|co_creators|heritage|fashion",
  "cultural_summary": "1-2 sentence cultural context (luxury brand voice, no casual phrasing)",
  "emotional_tone": "one word: e.g. Majestic, Celebratory, Reverent, Inspiring",
  "region_tags": ["array", "of", "relevant", "African", "regions"],
  "fashion_category": "specific fashion area if applicable, else null",
  "artisan_relevance": 0.0,
  "commerce_recommendations": ["brief actionable recommendations"],
  "translations": {
    "ha": { "title": "Hausa title", "description": "Hausa description" },
    "yo": { "title": "Yoruba title", "description": "Yoruba description" },
    "ig": { "title": "Igbo title",   "description": "Igbo description"   },
    "fr": { "title": "French title", "description": "French description" },
    "ar": { "title": "Arabic title", "description": "Arabic description" }
  }
}`;

  const res = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://houseofdaraja.com',
      'X-Title': 'House of Daraja — Leema AI',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1200,
    }),
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? '{}';

  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { category: 'heritage', cultural_summary: title, emotional_tone: 'Inspiring', region_tags: [], artisan_relevance: 0 };
  }
}

// ── Main Handler ────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');

    // 1. Fetch RSS
    const entries = await fetchYouTubeRSS();
    const results = { ingested: 0, skipped: 0, enriched: 0, errors: [] as string[] };

    for (const entry of entries) {
      // 2. Check if already exists
      const { data: existing } = await supabase
        .from('media_items')
        .select('id, status')
        .eq('youtube_id', entry.youtube_id)
        .single();

      if (existing) { results.skipped++; continue; }

      // 3. AI enrichment
      let enrichment: any = {};
      let translations: any = {};
      let category = 'heritage';

      if (apiKey) {
        try {
          const ai = await classifyVideoWithAI(entry.title, entry.description, apiKey);
          enrichment = {
            cultural_summary: ai.cultural_summary,
            emotional_tone: ai.emotional_tone,
            region_tags: ai.region_tags,
            fashion_category: ai.fashion_category,
            artisan_relevance: ai.artisan_relevance,
            commerce_recommendations: ai.commerce_recommendations,
          };
          translations = ai.translations ?? {};
          category = ai.category ?? 'heritage';
          results.enriched++;
        } catch (e) {
          results.errors.push(`AI failed for ${entry.youtube_id}: ${e}`);
        }
      }

      // 4. Upsert media item
      const { error } = await supabase.from('media_items').insert({
        youtube_id:    entry.youtube_id,
        title:         entry.title,
        description:   entry.description,
        thumbnail_url: entry.thumbnail_url,
        channel_id:    entry.channel_id,
        category,
        status:        'pending',
        published_at:  entry.published_at,
        ai_enrichment: enrichment,
        translations,
        tags: enrichment.region_tags ?? [],
      });

      if (error) results.errors.push(error.message);
      else results.ingested++;
    }

    return new Response(JSON.stringify({
      success: true,
      total: entries.length,
      ...results,
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
