<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentUser, userProfile, isAuthenticated } from '$lib/stores/auth';

  let transactions: any[] = [];
  let loading = true;

  onMount(async () => {
    if (!$isAuthenticated) { goto('/auth?redirect=/wallet'); return; }
    const { data } = await supabase.from('wallet_transactions').select('*').eq('user_id', $currentUser!.id).order('created_at', { ascending: false }).limit(20);
    transactions = data ?? [];
    loading = false;
  });

  const TYPE_CONFIG: Record<string, {label:string;color:string;sign:string}> = {
    credit:   { label:'Credit',   color:'text-green-400',  sign:'+' },
    debit:    { label:'Debit',    color:'text-red-400',    sign:'-' },
    refund:   { label:'Refund',   color:'text-blue-400',   sign:'+' },
    cashback: { label:'Cashback', color:'text-hd-gold',    sign:'+' },
  };
</script>

<svelte:head><title>Wallet — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505] py-6">
  <div class="max-w-md mx-auto px-4">
    <div class="mb-8">
      <p class="mono text-hd-gold/50 text-[9px] uppercase tracking-[0.4em] mb-1">Account</p>
      <h1 class="font-serif text-3xl text-white font-light">Wallet</h1>
    </div>

    <!-- Balance card -->
    <div class="bg-gradient-to-br from-hd-gold/10 via-hd-gold/5 to-transparent border border-hd-gold/20 p-6 mb-6" in:fade>
      <p class="mono text-[8px] uppercase tracking-widest text-hd-gold/50 mb-1">Available Balance</p>
      <div class="flex items-baseline gap-2 mb-1">
        <span class="font-serif text-4xl text-white">₦0.00</span>
      </div>
      <p class="mono text-[8px] text-white/20 uppercase tracking-wider">LEE Points: {$userProfile?.lee_balance ?? 0}</p>

      <div class="grid grid-cols-2 gap-3 mt-6">
        <button class="py-3 bg-hd-gold text-black mono text-[9px] uppercase tracking-widest font-semibold hover:bg-hd-gold/90 transition-all">Top Up</button>
        <button class="py-3 border border-white/10 text-white/50 mono text-[9px] uppercase tracking-widest hover:border-hd-gold/20 transition-all">Withdraw</button>
      </div>
    </div>

    <!-- Transactions -->
    <div>
      <h2 class="font-serif text-lg text-white mb-4">Transaction History</h2>
      {#if loading}
        <div class="space-y-3">{#each Array(3) as _}<div class="h-14 bg-white/[0.03] animate-pulse"></div>{/each}</div>
      {:else if transactions.length === 0}
        <div class="text-center py-16">
          <p class="text-white/30 font-serif text-lg">No transactions yet</p>
          <p class="text-white/20 text-sm mt-2">Your payment history will appear here</p>
        </div>
      {:else}
        <div class="space-y-2">
          {#each transactions as tx}
            <div class="flex justify-between items-center py-3 px-4 bg-white/[0.02] border border-white/[0.06]">
              <div>
                <p class="text-white/70 text-sm">{tx.description ?? 'Transaction'}</p>
                <p class="mono text-[8px] text-white/30 mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
              <span class="mono text-sm font-medium {TYPE_CONFIG[tx.type]?.color ?? 'text-white/50'}">
                {TYPE_CONFIG[tx.type]?.sign ?? ''}₦{tx.amount?.toLocaleString()}
              </span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
