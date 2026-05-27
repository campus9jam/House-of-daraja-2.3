<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fly, fade } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentUser, userProfile, auth, isAuthenticated } from '$lib/stores/auth';

  let orders: any[] = [];
  let wishlist: any[] = [];
  let xpEvents: any[] = [];
  let loading = true;
  let activeTab: 'overview' | 'orders' | 'wishlist' | 'rewards' = 'overview';
  let editMode = false;
  let editName = '';
  let savingProfile = false;

  const TIER_CONFIG: Record<string, any> = {
    citizen:  { color: '#FFFFFF', label: 'Citizen',      next: 'Patron',       nextXP: 500,   bg: 'from-white/10 to-transparent' },
    patron:   { color: '#F59E0B', label: 'Patron',       next: 'Curator',      nextXP: 2000,  bg: 'from-amber-800/30 to-transparent' },
    curator:  { color: '#C5A059', label: 'Curator',      next: 'Vanguard',     nextXP: 7500,  bg: 'from-hd-gold/20 to-transparent' },
    vanguard: { color: '#A855F7', label: 'Vanguard',     next: 'Daraja Elite', nextXP: 25000, bg: 'from-purple-800/30 to-transparent' },
    elite:    { color: '#C5A059', label: 'Daraja Elite', next: '—',            nextXP: 99999, bg: 'from-hd-gold/30 to-transparent' },
  };

  onMount(async () => {
    if (!$isAuthenticated) { goto('/auth?redirect=/profile'); return; }
    editName = $userProfile?.display_name ?? '';
    const uid = $currentUser!.id;

    const [{ data: ord }, { data: wish }, { data: xp }] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(10),
      supabase.from('wishlist').select('*,products(name,price,images)').eq('user_id', uid).limit(12),
      supabase.from('xp_events').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
    ]);

    orders   = ord   ?? [];
    wishlist = wish  ?? [];
    xpEvents = xp    ?? [];
    loading  = false;
  });

  $: tier = $userProfile?.prestige_tier ?? 'citizen';
  $: tierCfg = TIER_CONFIG[tier];
  $: xpProgress = $userProfile ? Math.min(($userProfile.xp / tierCfg.nextXP) * 100, 100) : 0;

  async function saveProfile() {
    if (!$currentUser) return;
    savingProfile = true;
    await supabase.from('profiles').update({ display_name: editName }).eq('user_id', $currentUser.id);
    savingProfile = false;
    editMode = false;
  }

  async function signOut() {
    await auth.signOut();
    goto('/');
  }

  const STATUS_MAP: Record<string, {label:string, color:string}> = {
    pending:   { label: 'Pending',   color: 'text-white/40' },
    confirmed: { label: 'Confirmed', color: 'text-blue-400' },
    shipped:   { label: 'Shipped',   color: 'text-yellow-400' },
    delivered: { label: 'Delivered', color: 'text-green-400' },
    cancelled: { label: 'Cancelled', color: 'text-red-400' },
  };
</script>

<svelte:head><title>Profile — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505] pt-16 pb-28">
  {#if loading}
    <div class="flex items-center justify-center min-h-[80vh]">
      <div class="flex gap-2">
        {#each [0,1,2] as i}
          <div class="w-2 h-2 bg-hd-gold rounded-full animate-bounce" style="animation-delay:{i*150}ms"></div>
        {/each}
      </div>
    </div>
  {:else if $userProfile || $currentUser}
    <!-- Profile hero card -->
    <div class="relative bg-gradient-to-b {tierCfg.bg} border-b border-white/[0.04] pt-8 pb-0" in:fade>
      <div class="max-w-2xl mx-auto px-4 pb-6">
        <div class="flex items-start gap-5">
          <!-- Avatar -->
          <div class="relative shrink-0">
            {#if $userProfile?.avatar_url}
              <img src={$userProfile.avatar_url} alt="Avatar" class="w-20 h-20 rounded-full object-cover border-2" style="border-color: {tierCfg.color}" />
            {:else}
              <div class="w-20 h-20 rounded-full border-2 flex items-center justify-center bg-white/5" style="border-color: {tierCfg.color}">
                <span class="font-serif text-2xl" style="color: {tierCfg.color}">
                  {($userProfile?.display_name ?? $currentUser?.email ?? 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            {/if}
            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#050505]"></div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            {#if editMode}
              <div class="flex gap-2 items-center">
                <input bind:value={editName} class="bg-white/[0.06] border border-hd-gold/30 text-white px-3 py-1.5 text-sm focus:outline-none flex-1" />
                <button on:click={saveProfile} disabled={savingProfile} class="bg-hd-gold text-black mono text-[8px] uppercase px-3 py-1.5 font-bold hover:bg-hd-gold/90">Save</button>
                <button on:click={() => editMode = false} class="text-white/30 text-xs hover:text-white/60">✕</button>
              </div>
            {:else}
              <div class="flex items-center gap-2">
                <h1 class="font-serif text-2xl text-white truncate">{$userProfile?.display_name ?? $currentUser?.email?.split('@')[0] ?? 'Member'}</h1>
                <button on:click={() => { editMode = true; editName = $userProfile?.display_name ?? ''; }} class="text-white/20 hover:text-hd-gold transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                </button>
              </div>
            {/if}
            <div class="flex items-center gap-2 mt-1.5">
              <span class="mono text-[9px] uppercase tracking-widest px-2 py-0.5 border" style="color:{tierCfg.color}; border-color:{tierCfg.color}30">
                {tierCfg.label}
              </span>
              <span class="text-white/30 text-xs">·</span>
              <span class="mono text-[9px] text-white/40">{($currentUser?.email ?? '')}</span>
            </div>

            <!-- XP bar -->
            <div class="mt-3">
              <div class="flex justify-between mb-1">
                <span class="mono text-[8px] text-white/30 uppercase">XP Progress → {tierCfg.next}</span>
                <span class="mono text-[8px] text-hd-gold/60">{$userProfile?.xp ?? 0} / {tierCfg.nextXP}</span>
              </div>
              <div class="h-1 bg-white/[0.06] overflow-hidden">
                <div class="h-full bg-gradient-to-r from-hd-gold to-hd-gold/60 transition-all duration-1000" style="width:{xpProgress}%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-4 gap-3 mt-6 py-4 border-y border-white/[0.05]">
          {#each [[orders.length, 'Orders'],[wishlist.length, 'Saved'],[$userProfile?.xp ?? 0, 'XP'],[$userProfile?.lee_balance ?? 0, 'LEE']] as [val, label]}
            <div class="text-center">
              <div class="font-serif text-xl text-hd-gold">{val}</div>
              <div class="mono text-[8px] uppercase text-white/30 tracking-wider mt-0.5">{label}</div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Tab nav -->
      <div class="max-w-2xl mx-auto px-4">
        <div class="flex border-b border-white/[0.06]">
          {#each [['overview','Overview'],['orders','My Orders'],['wishlist','Saved Items'],['rewards','Rewards']] as [tab, label]}
            <button
              on:click={() => activeTab = tab}
              class="flex-1 py-3 mono text-[9px] uppercase tracking-widest border-b-2 transition-all {activeTab === tab ? 'border-hd-gold text-hd-gold' : 'border-transparent text-white/30 hover:text-white/50'}"
            >{label}</button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Tab content -->
    <div class="max-w-2xl mx-auto px-4 pt-6">

      {#if activeTab === 'overview'}
        <div class="space-y-4" in:fly={{ y: 10, duration: 300 }}>
          <div class="grid grid-cols-2 gap-4">
            <a href="/atelier" class="bg-white/[0.02] border border-white/[0.06] p-5 hover:border-hd-gold/20 transition-all group">
              <div class="text-2xl mb-3">✦</div>
              <p class="text-white font-light text-sm">Bespoke Atelier</p>
              <p class="text-white/30 text-xs mt-1">Commission a piece</p>
              <span class="mono text-[8px] text-hd-gold/50 group-hover:text-hd-gold transition-colors mt-3 block uppercase tracking-wider">→ Open Atelier</span>
            </a>
            <a href="/auction" class="bg-white/[0.02] border border-white/[0.06] p-5 hover:border-hd-gold/20 transition-all group">
              <div class="text-2xl mb-3">⚡</div>
              <p class="text-white font-light text-sm">Live Auction</p>
              <p class="text-white/30 text-xs mt-1">Bid on rare pieces</p>
              <span class="mono text-[8px] text-hd-gold/50 group-hover:text-hd-gold transition-colors mt-3 block uppercase tracking-wider">→ Enter Hall</span>
            </a>
            <a href="/drops" class="bg-white/[0.02] border border-white/[0.06] p-5 hover:border-hd-gold/20 transition-all group">
              <div class="text-2xl mb-3">💎</div>
              <p class="text-white font-light text-sm">Limited Drops</p>
              <p class="text-white/30 text-xs mt-1">Exclusive releases</p>
              <span class="mono text-[8px] text-hd-gold/50 group-hover:text-hd-gold transition-colors mt-3 block uppercase tracking-wider">→ View Drops</span>
            </a>
            <a href="/heritage" class="bg-white/[0.02] border border-white/[0.06] p-5 hover:border-hd-gold/20 transition-all group">
              <div class="text-2xl mb-3">📖</div>
              <p class="text-white font-light text-sm">Heritage Stories</p>
              <p class="text-white/30 text-xs mt-1">Cultural narratives</p>
              <span class="mono text-[8px] text-hd-gold/50 group-hover:text-hd-gold transition-colors mt-3 block uppercase tracking-wider">→ Read More</span>
            </a>
          </div>
          <!-- Recent XP -->
          {#if xpEvents.length > 0}
            <div class="bg-white/[0.02] border border-white/[0.06] p-5">
              <p class="mono text-[9px] uppercase tracking-widest text-white/40 mb-3">Recent Activity</p>
              {#each xpEvents.slice(0,4) as ev}
                <div class="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
                  <span class="text-white/60 text-sm">{ev.reason ?? 'XP Earned'}</span>
                  <span class="mono text-[10px] text-hd-gold">+{ev.amount} XP</span>
                </div>
              {/each}
            </div>
          {/if}
          <!-- Sign out -->
          <button on:click={signOut} class="w-full py-3 border border-red-900/30 text-red-400/50 mono text-[9px] uppercase tracking-widest hover:border-red-500/40 hover:text-red-400 transition-all">
            Sign Out
          </button>
        </div>

      {:else if activeTab === 'orders'}
        <div in:fly={{ y: 10, duration: 300 }}>
          {#if orders.length === 0}
            <div class="text-center py-16">
              <p class="font-serif text-xl text-white/30">No orders yet</p>
              <a href="/shop" class="mono text-[9px] text-hd-gold/60 hover:text-hd-gold mt-3 block">Start Shopping →</a>
            </div>
          {:else}
            <div class="space-y-3">
              {#each orders as order}
                <div class="bg-white/[0.02] border border-white/[0.06] p-4">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <p class="mono text-[8px] uppercase text-white/30">Order #{order.id?.slice(0,8).toUpperCase()}</p>
                      <p class="font-serif text-lg text-hd-gold mt-0.5">₦{order.total_amount?.toLocaleString()}</p>
                    </div>
                    <span class="mono text-[8px] uppercase px-2 py-1 border {STATUS_MAP[order.status]?.color ?? 'text-white/40'} border-current/20">
                      {STATUS_MAP[order.status]?.label ?? order.status}
                    </span>
                  </div>
                  <p class="text-white/30 text-xs">{order.items?.length ?? 0} item(s) · {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              {/each}
            </div>
          {/if}
        </div>

      {:else if activeTab === 'wishlist'}
        <div in:fly={{ y: 10, duration: 300 }}>
          {#if wishlist.length === 0}
            <div class="text-center py-16">
              <p class="font-serif text-xl text-white/30">No saved items</p>
              <a href="/shop" class="mono text-[9px] text-hd-gold/60 hover:text-hd-gold mt-3 block">Browse Collection →</a>
            </div>
          {:else}
            <div class="grid grid-cols-2 gap-3">
              {#each wishlist as item}
                <a href="/product/{item.product_id}" class="group">
                  <div class="aspect-[3/4] bg-white/[0.03] border border-white/[0.06] group-hover:border-hd-gold/20 transition-all overflow-hidden">
                    <img src={item.products?.images?.[0] ?? '/hd-logo.png'} alt={item.products?.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p class="text-white/70 text-sm mt-2 leading-snug">{item.products?.name ?? 'Product'}</p>
                  <p class="text-hd-gold mono text-sm">₦{item.products?.price?.toLocaleString() ?? '—'}</p>
                </a>
              {/each}
            </div>
          {/if}
        </div>

      {:else if activeTab === 'rewards'}
        <div class="space-y-4" in:fly={{ y: 10, duration: 300 }}>
          <div class="bg-gradient-to-br from-hd-gold/10 to-transparent border border-hd-gold/20 p-6">
            <p class="mono text-[9px] uppercase tracking-widest text-hd-gold/60 mb-2">Your Balance</p>
            <div class="flex items-baseline gap-2">
              <span class="font-serif text-4xl text-hd-gold">{$userProfile?.lee_balance ?? 0}</span>
              <span class="mono text-[10px] text-hd-gold/50 uppercase">LEE Points</span>
            </div>
            <p class="text-white/30 text-xs mt-2">Redeem for discounts on your next purchase</p>
          </div>
          <div class="bg-white/[0.02] border border-white/[0.06] p-5">
            <p class="mono text-[9px] uppercase tracking-widest text-white/40 mb-4">How to Earn</p>
            {#each [['Make a purchase','10 LEE per ₦1,000 spent'],['Write a review','50 LEE per review'],['Refer a friend','200 LEE per referral'],['Complete profile','100 LEE one-time']] as [action, reward]}
              <div class="flex justify-between py-3 border-b border-white/[0.04] last:border-0">
                <span class="text-white/60 text-sm">{action}</span>
                <span class="mono text-[9px] text-hd-gold/70">{reward}</span>
              </div>
            {/each}
          </div>
          <a href="/rewards" class="block w-full text-center bg-hd-gold text-black mono text-[10px] uppercase tracking-widest py-3 font-semibold hover:bg-hd-gold/90 transition-all">Claim Rewards →</a>
        </div>
      {/if}
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center min-h-[80vh] gap-6" in:fade>
      <img src="/hd-logo.png" alt="HD" class="w-16 h-16 object-contain opacity-30" />
      <div class="text-center">
        <p class="font-serif text-2xl text-white mb-2">Sign in to your account</p>
        <p class="text-white/30 text-sm">Access your orders, rewards, and wishlist</p>
      </div>
      <a href="/auth" class="bg-hd-gold text-black mono text-[10px] uppercase tracking-widest px-8 py-3 font-semibold">Sign In</a>
    </div>
  {/if}
</div>
