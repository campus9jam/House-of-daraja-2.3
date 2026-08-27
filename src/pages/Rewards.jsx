import React, { useEffect, useState } from 'react';
import { Gift, History, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Rewards() {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { if (active) setLoading(false); return; }
      const [{ data: p }, { data: tx }] = await Promise.all([
        supabase.from('profiles').select('lee_balance, lee_lifetime_earned, lee_lifetime_spent, prestige_tier').eq('id', auth.user.id).single(),
        supabase.from('lee_transactions').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false }).limit(30),
      ]);
      if (active) { setProfile(p); setTransactions(tx || []); setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <main className="min-h-screen bg-daraja-charcoal pt-32 px-6 text-white">Loading LEE wallet...</main>;
  if (!profile) return <main className="min-h-screen bg-daraja-charcoal pt-32 px-6 text-white">Sign in to view your LEE rewards.</main>;

  return <main className="min-h-screen bg-daraja-charcoal pt-28 pb-24 px-6 md:px-12"><div className="max-w-5xl mx-auto space-y-10">
    <header><div className="flex items-center gap-2 text-daraja-gold mono-text text-[10px]"><Sparkles className="w-4 h-4" /> HOUSE_OF_DARAJA_REWARDS</div><h1 className="mt-4 text-5xl font-serif italic text-white">Your <span className="text-daraja-gold not-italic">LEE</span></h1><p className="text-white/45 mt-2">LEE is the House of Daraja reward currency. Earn it through participation, purchases, referrals and approved campaigns.</p></header>
    <section className="grid md:grid-cols-3 gap-4"><div className="luxury-card p-7 md:col-span-2"><p className="mono-text text-[9px] text-white/40 uppercase">Available LEE</p><p className="text-5xl font-serif text-daraja-gold mt-3">{Number(profile.lee_balance || 0).toLocaleString()}</p><p className="text-white/40 text-xs mt-2">Prestige: {profile.prestige_tier}</p></div><div className="luxury-card p-7"><Gift className="text-daraja-gold" /><p className="mono-text text-[9px] text-white/40 uppercase mt-5">Lifetime Earned</p><p className="text-2xl text-white mt-2">{Number(profile.lee_lifetime_earned || 0).toLocaleString()}</p><p className="mono-text text-[9px] text-white/40 uppercase mt-5">Lifetime Spent</p><p className="text-2xl text-white mt-2">{Number(profile.lee_lifetime_spent || 0).toLocaleString()}</p></div></section>
    <section className="luxury-card p-7"><div className="flex items-center gap-2 text-white"><History className="w-4 h-4 text-daraja-gold" /><h2 className="font-serif text-2xl">LEE Ledger</h2></div><div className="mt-6 divide-y divide-daraja-border">{transactions.length === 0 ? <p className="text-white/40 text-sm py-6">No LEE transactions yet.</p> : transactions.map((tx) => <div key={tx.id} className="py-4 flex justify-between gap-5"><div><p className="text-white text-sm">{tx.description || tx.event_type}</p><p className="mono-text text-[8px] text-white/35 uppercase mt-1">{new Date(tx.created_at).toLocaleString()}</p></div><span className={`mono-text text-sm ${tx.type === 'spend' || tx.type === 'expiry' ? 'text-white/60' : 'text-daraja-gold'}`}>{tx.type === 'spend' || tx.type === 'expiry' ? '-' : '+'}{Number(tx.amount).toLocaleString()} LEE</span></div>)}</div></section>
  </div></main>;
}
