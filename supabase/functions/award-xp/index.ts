/**
 * Award XP & LEE — Supabase Edge Function
 * Called internally by other functions to update user prestige.
 * Uses atomic Postgres transactions.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface XPAwardRequest {
  user_id: string;
  event_type: string;
  reference_id?: string;
  metadata?: Record<string, any>;
}

// XP/LEE award table
const XP_TABLE: Record<string, { xp: number; lee: number }> = {
  purchase:              { xp: 50,  lee: 5.0  },
  auction_bid:           { xp: 5,   lee: 0.5  },
  auction_win:           { xp: 100, lee: 20.0 },
  commission_placed:     { xp: 30,  lee: 3.0  },
  review_submitted:      { xp: 20,  lee: 2.0  },
  cultural_contribution: { xp: 40,  lee: 4.0  },
  referral:              { xp: 100, lee: 10.0 },
  artisan_support:       { xp: 25,  lee: 2.5  },
  media_engagement:      { xp: 5,   lee: 0.25 },
  governance_vote:       { xp: 15,  lee: 1.5  },
  profile_complete:      { xp: 50,  lee: 5.0  },
  vault_upload:          { xp: 10,  lee: 1.0  },
};

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, event_type, reference_id, metadata }: XPAwardRequest = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const award = XP_TABLE[event_type] ?? { xp: 0, lee: 0 };
    if (award.xp === 0 && award.lee === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: `Unknown event: ${event_type}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Log XP event
    await supabase.from('xp_events').insert({
      user_id, event_type, xp_earned: award.xp, lee_earned: award.lee,
      reference_id, metadata: metadata ?? {},
    });

    // 2. Atomic wallet update (RPC for atomicity)
    const { data, error } = await supabase.rpc('increment_wallet', {
      p_user_id:      user_id,
      p_xp_increment: award.xp,
      p_lee_increment: award.lee,
    });

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true, user_id, event_type,
      awarded: { xp: award.xp, lee: award.lee },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
