<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentUser, userProfile, auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let orders: any[] = [];
  let xpEvents: any[] = [];
  let vaultItems: any[] = [];
  let activeTab: 'overview' | 'orders' | 'vault' | 'xp' = 'overview';
  let loading = true;

  const TIER_CONFIGS: Record<string, { color: string; nextTier: string; nextXP: number; gradient: string }> = {
    citizen:  { color: '#FFFFFF', nextTier: 'Patron',       nextXP: 500,   gradient: 'from-white/10 to-white/5' },
    patron:   { color: '#F59E0B', nextTier: 'Curator',      nextXP: 2000,  gradient: 'from-amber-900/30 to-amber-900/10' },
    curator:  { color: '#C5A059', nextTier: 'Vanguard',     nextXP: 7500,  gradient: 'from-hd-gold/20 to-hd-gold/5' },
    vanguard: { color: '#A855F7', nextTier: 'Daraja Elite', nextXP: 25000, gradient: 'from-purple-900/30 to-purple-900/10' },
    elite:    { color: '#C5A059', nextTier: '—',            nextXP: 99999, gradient: 'from-hd-gold/30 to-hd-earth/10' },
  };

  onMount(async () => {
    if (!$currentUser) { goto('/auth?redirect=/profile'); return; }
    const uid = $currentUser.id;

    const [{ data: ord }, { data: xp }, { data: vault }] = await Promise.all([
      supabase.from('atelier_orders').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(10),
      supabase.from('xp_events').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
      supabase.from('cultural_vault').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(12),
    ]);

    if (ord)   orders    = ord;
    if (xp)    xpEvents  = xp;
    if (vault) vaultItems = vault;
    loading = false;
  });

  $: tierConfig = TIER_CONFIGS[$userProfile?.prestige_tier ?? 'citizen'];
  $: xpProgress = $userProfile ? Math.min(($userProfile.xp / tierConfig.nextXP) * 100, 100) : 0;

  const ORDER_STATUS_COLORS: Record<string, string> = {
    submitted: 'text-blue-400', cutting: 'text-yellow-400', sewing: 'text-orange-400',
    finishing: 'text-amber-400', ready: 'text-green-400', shipped: 'text-teal-400', delivered: 'text-hd-gold',
  };

  async function handleSignOut() {
    await auth.signOut();
    goto('/');
  }
</script>

<svelte:head><title>HD Profile — Heritage Identity</title></svelte:head>

{#if !$userProfile}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="w-8 h-8 border-2 border-hd-gold/30 border-t-hd-gold rounded-full animate-spin" />
  </div>
{:else}
<div class="max-w-6xl mx-auto px-6 md:px-12 py-12">

  <!-- Profile Header -->
  <div class="hd-card p-8 mb-8 bg-gradient-to-br {tierConfig.gradient} relative overflow-hidden" in:fade>
    <!-- Decorative pattern -->
    <div class="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(197,160,89,0.3),transparent_60%)]" />

    <div class="relative flex flex-col md:flex-row items-start md:items-center gap-8">
      <!-- Avatar -->
      <div class="relative">
        <div
          class="w-24 h-24 border-2 overflow-hidden"
          style="border-color: {tierConfig.color}; box-shadow: 0 0 30px {tierConfig.color}40"
        >
          {#if $userProfile.avatar_url}
            <img src={$userProfile.avatar_url} alt="" class="w-full h-full object-cover" />
          {:else}
            <div class="w-full h-full bg-hd-gold/10 flex items-center justify-center font-serif text-4xl text-hd-gold font-bold">
              {$userProfile.username[0].toUpperCase()}
            </div>
          {/if}
        </div>
        <!-- Tier badge -->
        <div
          class="absolute -bottom-2 -right-2 px-3 py-1 prestige-badge"
          style="background: {tierConfig.color}20; border: 1px solid {tierConfig.color}50; color: {tierConfig.color}"
        >
          {$userProfile.prestige_tier.toUpperCase()}
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 space-y-3">
        <div>
          <h1 class="text-3xl font-serif italic text-white">{$userProfile.display_name}</h1>
          <p class="mono text-white/40 text-[10px] mt-0.5">@{$userProfile.username}</p>
        </div>
        {#if $userProfile.bio}
          <p class="font-serif italic text-white/60">{$userProfile.bio}</p>
        {/if}

        <!-- XP Progress -->
        <div class="space-y-2 max-w-sm">
          <div class="flex justify-between">
            <span class="mono text-[9px] text-white/40 uppercase">XP Progress → {tierConfig.nextTier}</span>
            <span class="mono text-[9px]" style="color:{tierConfig.color}">{$userProfile.xp.toLocaleString()} / {tierConfig.nextXP.toLocaleString()}</span>
          </div>
          <div class="h-1.5 bg-white/5 relative overflow-hidden">
            <div
              class="h-full transition-all duration-1000"
              style="width: {xpProgress}%; background: {tierConfig.color};"
            />
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-6">
        <div class="text-center">
          <p class="mono text-2xl font-bold" style="color:{tierConfig.color}">{$userProfile.xp.toLocaleString()}</p>
          <p class="mono text-[8px] text-white/30 uppercase mt-1">XP</p>
        </div>
        <div class="text-center">
          <p class="mono text-2xl font-bold text-white">{Number($userProfile.lee_balance).toFixed(2)}</p>
          <p class="mono text-[8px] text-white/30 uppercase mt-1">LEE</p>
        </div>
        <div class="text-center">
          <p class="mono text-2xl font-bold text-white">{orders.length}</p>
          <p class="mono text-[8px] text-white/30 uppercase mt-1">Orders</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="flex border-b border-white/10 mb-8">
    {#each [['overview','Overview'],['orders','Orders'],['vault','Cultural Vault'],['xp','XP Ledger']] as [tab, label]}
      <button
        on:click={() => (activeTab = tab as any)}
        class="px-6 py-4 mono text-[9px] uppercase tracking-widest transition-all {activeTab === tab ? 'border-b-2 border-hd-gold text-hd-gold' : 'text-white/30 hover:text-white'}"
      >
        {label}
      </button>
    {/each}
    <div class="flex-1" />
    <button on:click={handleSignOut} class="px-4 py-4 mono text-[9px] text-white/20 hover:text-red-400 transition-colors uppercase">Sign Out</button>
  </div>

  <!-- OVERVIEW -->
  {#if activeTab === 'overview'}
    <div in:fly={{ x: 20, duration: 300 }} class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Quick actions -->
      <div class="md:col-span-2 grid grid-cols-2 gap-4">
        <a href="/atelier" class="hd-card p-6 hover:border-hd-gold/50 transition-all group">
          <div class="text-3xl mb-4">👘</div>
          <h3 class="font-serif italic text-white mb-1">Commission Bespoke</h3>
          <p class="mono text-[9px] text-white/30 uppercase">HD Atelier →</p>
        </a>
        <a href="/auction" class="hd-card p-6 hover:border-hd-gold/50 transition-all group">
          <div class="text-3xl mb-4">⚖️</div>
          <h3 class="font-serif italic text-white mb-1">Live Auctions</h3>
          <p class="mono text-[9px] text-white/30 uppercase">Bid Now →</p>
        </a>
        <a href="/vault" class="hd-card p-6 hover:border-hd-gold/50 transition-all group">
          <div class="text-3xl mb-4">🏛️</div>
          <h3 class="font-serif italic text-white mb-1">Cultural Vault</h3>
          <p class="mono text-[9px] text-white/30 uppercase">{vaultItems.length} items →</p>
        </a>
        <a href="/governance" class="hd-card p-6 hover:border-hd-gold/50 transition-all group">
          <div class="text-3xl mb-4">🏛</div>
          <h3 class="font-serif italic text-white mb-1">Governance</h3>
          <p class="mono text-[9px] text-white/30 uppercase">Vote →</p>
        </a>
      </div>

      <!-- Profile details -->
      <div class="space-y-4">
        <div class="hd-card p-6 space-y-4">
          <h3 class="mono text-[9px] text-white/40 uppercase">Identity</h3>
          <div class="space-y-3">
            <div>
              <p class="hd-label mb-1">Role</p>
              <p class="font-serif italic text-white capitalize">{$userProfile.role}</p>
            </div>
            <div>
              <p class="hd-label mb-1">Language</p>
              <p class="font-serif italic text-white uppercase">{$userProfile.preferred_language}</p>
            </div>
            {#if $userProfile.cultural_interests?.length}
              <div>
                <p class="hd-label mb-2">Cultural Interests</p>
                <div class="flex flex-wrap gap-1.5">
                  {#each $userProfile.cultural_interests as interest}
                    <span class="mono text-[8px] border border-white/10 text-white/50 px-2 py-0.5">{interest}</span>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Prestige benefits -->
        <div class="hd-card p-6 space-y-4">
          <h3 class="mono text-[9px] text-white/40 uppercase">Tier Benefits</h3>
          {#each [
            ['Delivery Discount', $userProfile.prestige_tier === 'patron' ? '5%' : $userProfile.prestige_tier === 'curator' ? '10%' : $userProfile.prestige_tier === 'vanguard' ? '15%' : $userProfile.prestige_tier === 'elite' ? '25%' : '0%'],
            ['Auction Priority', ['curator','vanguard','elite'].includes($userProfile.prestige_tier) ? 'Active' : 'Locked'],
            ['Artisan Grants', ['vanguard','elite'].includes($userProfile.prestige_tier) ? 'Active' : 'Locked'],
            ['Governance', ['elite'].includes($userProfile.prestige_tier) ? 'Full Access' : 'Limited'],
          ] as [label, val]}
            <div class="flex justify-between">
              <span class="mono text-[9px] text-white/30 uppercase">{label}</span>
              <span class="mono text-[9px]" style="color: {val.includes('Active') || val.includes('Full') || val !== '0%' ? tierConfig.color : '#ffffff40'}">{val}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

  <!-- ORDERS -->
  {:else if activeTab === 'orders'}
    <div in:fly={{ x: 20, duration: 300 }} class="space-y-4">
      {#if orders.length === 0}
        <div class="hd-card p-16 text-center">
          <p class="font-serif italic text-white/40 text-xl">No commissions yet.</p>
          <a href="/atelier" class="hd-btn-primary inline-flex mt-8">COMMISSION NOW</a>
        </div>
      {:else}
        {#each orders as order}
          <div class="hd-card p-6 flex items-center gap-6">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="mono text-hd-gold text-[9px] font-bold">{order.serial_number}</span>
                <span class="mono text-[8px] uppercase {ORDER_STATUS_COLORS[order.status] ?? 'text-white/40'}">{order.status}</span>
              </div>
              <h3 class="font-serif italic text-white">{order.outfit_type} — {order.occasion}</h3>
              <p class="mono text-white/30 text-[9px] mt-1">{order.fabric} · {order.color}</p>
            </div>
            <div class="text-right">
              {#if order.price_quote}
                <p class="mono text-white font-bold">₦{order.price_quote.toLocaleString()}</p>
              {:else}
                <p class="mono text-white/30 text-[9px]">Awaiting quote</p>
              {/if}
              <p class="mono text-white/20 text-[8px] mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        {/each}
      {/if}
    </div>

  <!-- VAULT -->
  {:else if activeTab === 'vault'}
    <div in:fly={{ x: 20, duration: 300 }}>
      <div class="flex justify-between items-center mb-6">
        <h2 class="font-serif italic text-white text-xl">Cultural Vault <span class="mono text-white/30 text-sm">({vaultItems.length})</span></h2>
        <a href="/vault" class="hd-btn-outline text-[9px] py-2 px-5">MANAGE VAULT</a>
      </div>
      {#if vaultItems.length === 0}
        <div class="hd-card p-16 text-center">
          <p class="font-serif italic text-white/40">Your vault is empty.</p>
          <p class="mono text-[9px] text-white/20 mt-2 uppercase">Store outfit references, tailoring history, and heritage collections</p>
          <a href="/vault" class="hd-btn-primary inline-flex mt-8">OPEN VAULT</a>
        </div>
      {:else}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {#each vaultItems as item}
            <div class="hd-card overflow-hidden group">
              {#if item.thumbnail_url || item.file_url}
                <div class="aspect-square overflow-hidden">
                  <img src={item.thumbnail_url || item.file_url} alt={item.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              {:else}
                <div class="aspect-square bg-hd-surface2 flex items-center justify-center text-4xl opacity-40">🏛️</div>
              {/if}
              <div class="p-4">
                <p class="font-serif italic text-white text-sm truncate">{item.title}</p>
                <p class="mono text-[7px] text-white/30 uppercase mt-1">{item.type.replace(/_/g, ' ')}</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  <!-- XP LEDGER -->
  {:else if activeTab === 'xp'}
    <div in:fly={{ x: 20, duration: 300 }} class="space-y-3">
      {#if xpEvents.length === 0}
        <div class="hd-card p-16 text-center">
          <p class="font-serif italic text-white/40">No XP activity yet. Start engaging to earn prestige.</p>
        </div>
      {:else}
        {#each xpEvents as event}
          <div class="hd-card p-5 flex items-center justify-between">
            <div>
              <p class="mono text-white text-[10px] uppercase tracking-wider">{event.event_type.replace(/_/g, ' ')}</p>
              <p class="mono text-white/30 text-[8px] mt-1">{new Date(event.created_at).toLocaleString()}</p>
            </div>
            <div class="text-right flex gap-6">
              <div>
                <p class="mono text-hd-gold text-sm font-bold">+{event.xp_earned} XP</p>
              </div>
              {#if event.lee_earned > 0}
                <div>
                  <p class="mono text-white text-sm">+{event.lee_earned} LEE</p>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
{/if}
