import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const url = Deno.env.get('SUPABASE_URL')!;
  const publishable = Deno.env.get('SUPABASE_ANON_KEY') || JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}').default;
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || (secretKeys ? JSON.parse(secretKeys).default : undefined);
  if (!secret) return new Response(JSON.stringify({ error: 'Server reward configuration is missing' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  const userClient = createClient(url, publishable, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const body = await req.json();
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) return new Response(JSON.stringify({ error: 'Invalid LEE amount' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  const admin = createClient(url, secret);
  const { data, error } = await admin.rpc('award_lee', { p_user_id: user.id, p_amount: amount, p_event_type: String(body.event_type || 'manual_reward'), p_reference_id: body.reference_id || null, p_description: body.description || null, p_metadata: body.metadata || {} });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ wallet: data }), { headers: { 'Content-Type': 'application/json' } });
});
