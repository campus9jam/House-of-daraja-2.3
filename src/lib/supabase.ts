import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co';
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

// Provide ws transport for Node.js < 22 (SSR / edge)
let transportOpts = {};
if (typeof WebSocket === 'undefined') {
  // dynamically import ws only in Node env
  try {
    // @ts-ignore
    const ws = await import('ws');
    transportOpts = { realtime: { transport: ws.default } };
  } catch {}
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  ...transportOpts,
});
