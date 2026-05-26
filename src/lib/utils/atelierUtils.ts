/**
 * atelierUtils.ts
 * Neural Auto-Fill — parses natural language tailoring text
 * and extracts structured measurement data.
 */

export interface ExtractedMeasurements {
  chest?:          number;
  waist?:          number;
  hips?:           number;
  shoulder?:       number;
  sleeve?:         number;
  inseam?:         number;
  neck?:           number;
  wrist?:          number;
  thigh?:          number;
  arm_length?:     number;
  outfit_length?:  number;
  ankle?:          number;
  fitPreference?:  'slim' | 'regular' | 'relaxed' | 'oversized';
  bodyType?:       'slim' | 'athletic' | 'regular' | 'full';
}

// Measurement keyword map — supports English, Hausa abbreviations, colloquial
const FIELD_KEYWORDS: Record<keyof Omit<ExtractedMeasurements, 'fitPreference' | 'bodyType'>, string[]> = {
  chest:         ['chest', 'bust', 'ch', 'c'],
  waist:         ['waist', 'w', 'wst'],
  hips:          ['hip', 'hips', 'h'],
  shoulder:      ['shoulder', 'sh', 'shld', 'shldr'],
  sleeve:        ['sleeve', 'sl', 'slv'],
  inseam:        ['inseam', 'in', 'ins', 'inside leg'],
  neck:          ['neck', 'n', 'nk'],
  wrist:         ['wrist', 'wr', 'wrt'],
  thigh:         ['thigh', 'th'],
  arm_length:    ['arm', 'arm length', 'arml'],
  outfit_length: ['length', 'len', 'outfit length', 'total length', 'ol'],
  ankle:         ['ankle', 'ank'],
};

const FIT_KEYWORDS: Record<ExtractedMeasurements['fitPreference'] & string, string[]> = {
  slim:     ['slim', 'fitted', 'tight', 'close', 'skinny'],
  regular:  ['regular', 'normal', 'standard', 'straight'],
  relaxed:  ['relaxed', 'loose', 'comfortable', 'easy'],
  oversized:['oversized', 'baggy', 'big', 'wide', 'large'],
};

const BODY_KEYWORDS: Record<ExtractedMeasurements['bodyType'] & string, string[]> = {
  slim:     ['slim', 'thin', 'lean', 'slender'],
  athletic: ['athletic', 'muscular', 'fit', 'built'],
  regular:  ['regular', 'average', 'medium', 'normal'],
  full:     ['full', 'plus', 'big', 'heavy', 'large'],
};

/**
 * Parse measurement number — handles:
 *  "42", "42cm", "42inches", "42\"", "42in"
 */
function parseMeasure(raw: string): number | null {
  const num = parseFloat(raw.replace(/[^\d.]/g, ''));
  if (isNaN(num)) return null;
  // Convert inches to cm if unit detected
  if (/in(?:ch|ches|")?$/i.test(raw)) return Math.round(num * 2.54 * 10) / 10;
  return num;
}

/**
 * Main extraction function.
 * Input: "Chest 42 shoulder 18 sleeve 25 slim fit"
 * Output: { chest: 42, shoulder: 18, sleeve: 25, fitPreference: 'slim' }
 */
export function extractMeasurements(text: string): ExtractedMeasurements {
  const result: ExtractedMeasurements = {};
  const lower = text.toLowerCase();

  // ── Extract numeric measurements ────────────────────────
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    for (const kw of keywords) {
      // Pattern: keyword followed by optional colon/space + number
      const pattern = new RegExp(`\\b${kw}[:\\s]+([\\d.]+\\s*(?:cm|inches?|in|")?)`,'i');
      const match = lower.match(pattern);
      if (match) {
        const val = parseMeasure(match[1]);
        if (val !== null) (result as any)[field] = val;
        break;
      }
    }
  }

  // ── Detect fit preference ─────────────────────────────
  for (const [fit, keywords] of Object.entries(FIT_KEYWORDS)) {
    if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower))) {
      result.fitPreference = fit as ExtractedMeasurements['fitPreference'];
      break;
    }
  }

  // ── Detect body type ──────────────────────────────────
  for (const [bt, keywords] of Object.entries(BODY_KEYWORDS)) {
    if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower))) {
      result.bodyType = bt as ExtractedMeasurements['bodyType'];
      break;
    }
  }

  // ── AI-inconsistency detection ─────────────────────────
  // Flag if chest/waist are swapped (waist > chest is unusual)
  if (result.chest && result.waist && result.waist > result.chest + 10) {
    console.warn('HD_ATELIER: Possible chest/waist swap detected.');
  }

  return result;
}

/**
 * Validate a full measurement set and return warnings.
 */
export function validateMeasurements(m: ExtractedMeasurements): string[] {
  const warnings: string[] = [];
  if (m.chest && (m.chest < 50 || m.chest > 180))
    warnings.push('Chest measurement seems outside expected range (50–180 cm).');
  if (m.waist && m.chest && m.waist > m.chest)
    warnings.push('Waist is larger than chest — please verify.');
  if (m.shoulder && m.chest && m.shoulder > m.chest / 2)
    warnings.push('Shoulder width seems wider than expected.');
  return warnings;
}

/**
 * Format measurements for display
 */
export function formatMeasurementsSummary(m: ExtractedMeasurements): string {
  const parts: string[] = [];
  if (m.chest)    parts.push(`Chest: ${m.chest}cm`);
  if (m.waist)    parts.push(`Waist: ${m.waist}cm`);
  if (m.hips)     parts.push(`Hips: ${m.hips}cm`);
  if (m.shoulder) parts.push(`Shoulder: ${m.shoulder}cm`);
  if (m.sleeve)   parts.push(`Sleeve: ${m.sleeve}cm`);
  return parts.join(' · ');
}
