<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { isAuthenticated, userProfile } from '$lib/stores/auth';

  let drops: any[]    = [];
  let loading         = true;
  let timers: Record<string, string> = {};
  let timerInterval: ReturnType<typeof setInterval>;

  const MOCK_DROPS = [
    { id:'d1', name:'The Majestic Drop', description:'A prestige collection of hand-embroidered Agbada sets', price:250000, image:'https://i.imgur.com/7QFYTZJ.png', drop_type:'limited', start_time: new Date(Date.now() + 3600000).toISOString(), end_time: new Date(Date.now() + 3600000 * 24).toISOString(), stock:10, units_sold:7, status:'active', is_featured:true, minimum_tier:'patron' },
    { id:'d2', name:'Adire Capsule Vol.2', description:'12 exclusive Adire pieces from master dye artisans in Ibadan', price:65000, image:'https://i.imgur.com/MA123T4.png', drop_type:'timed', start_time: new Date(Date.now() + 7200000).toISOString(), end_time: new Date(Date.now() + 7200000 + 3600000*48).toISOString(), stock:25, units_sold:0, status:'upcoming', is_featured:false, minimum_tier:'citizen' },
    { id:'d3', name:'Kano Silk Edition', description:'Ultra-premium silk Kano fabric in limited 5-yard bundles', price:85000, image:'https://i.imgur.com/S4l7lKP.png', drop_type:'auction', start_time: new Date(Date.now() - 3600000).toISOString(), end_time: new Date(Date.now() + 3600000 * 12).toISOString(), stock:5, units_sold:2, status:'live', is_featured:true, minimum_tier:'curator' },
  ];

  onMount(async () => {
    const { data } = await supabase.from('drops').select('*').order('start_time', { ascending: true }).limit(20);
    drops = data?.length ? data : MOCK_DROPS;
    loading = false;
    startTimers();
  });
  onDestroy(() => clearInterval(timerInterval));

  function startTimers() {
    updateTimers();
    timerInterval = setInterval(updateTimers, 1000);
  }

  function updateTimers() {
    const now = Date.now();
    timers = Object.fromEntries(drops.map(d => {
      const target = new Date(d.status === 'upcoming' ? d.start_time : d.end_time).getTime();
      const diff = target - now;
      if (diff <= 0) return [d.id, '00:00:00'];
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return [d.id, `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`];
    }));
  }

  function canJoin(drop: any) {
    if (!$isAuthenticated) return false;
    const TIERS = ['citizen','patron','curator','vanguard','elite'];
    const userTierIdx = TIERS.indexOf($userProfile?.prestige_tier ?? 'citizen');
    const requiredIdx = TIERS.indexOf(drop.minimum_tier ?? 'citizen');
    return userTierIdx >= requiredIdx;
  }

  function stockPct(d: any) {
    return Math.round((d.units_sold / d.stock) * 100);
  }

  const STATUS_STYLES: Record<string, string> = {
    live:     'text-green-400 border-green-400/30 bg-green-400/5',
    upcoming: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
    sold_out: 'text-red-400 border-red-400/30 bg-red-400/5',
    active:   'text-green-400 border-green-400/30 bg-green-400/5',
  };
</script>

<svelte:head><title>Limited Drops — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505]">
  <!-- Hero -->
  <div class="relative border-b border-white/[0.04] py-14 px-4 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-hd-gold/8 to-transparent pointer-events-none"></div>
    <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {#each [15,35,55,75,90] as top}
        <div class="absolute h-px bg-gradient-to-r from-transparent via-hd-gold to-transparent w-full" style="top:{top}%"></div>
      {/each}
    </div>
    <div class="max-w-5xl mx-auto text-center relative z-10">
      <div class="flex items-center justify-center gap-2 mb-4">
        <div class="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
        <p class="mono text-red-400 text-[9px] uppercase tracking-[0.5em]">Limited Releases</p>
      </div>
      <h1 class="font-serif text-5xl text-white font-light mb-4">The Drop</h1>
      <p class="text-white/40 text-sm max-w-sm mx-auto">Exclusive pieces. Limited stock. First come, prestige served.</p>
    </div>
  </div>

  <div class="max-w-4xl mx-auto px-4 py-10 space-y-6">
    {#if loading}
      {#each Array(3) as _}
        <div class="h-64 bg-white/[0.03] animate-pulse border border-white/[0.04]"></div>
      {/each}
    {:else}
      {#each drops as drop, i (drop.id)}
        <div
          class="group border transition-all overflow-hidden {drop.is_featured ? 'border-hd-gold/20 hover:border-hd-gold/40' : 'border-white/[0.06] hover:border-white/10'}"
          in:fly={{ y: 20, delay: i * 80, duration: 400 }}
        >
          <div class="grid grid-cols-1 md:grid-cols-[2fr_3fr] min-h-[280px]">
            <!-- Image -->
            <div class="relative overflow-hidden bg-white/[0.03]" style="min-height:220px">
              <img src={drop.image} alt={drop.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 absolute inset-0" />
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050505] hidden md:block"></div>
              <!-- Status badge -->
              <div class="absolute top-3 left-3">
                <span class="mono text-[8px] uppercase tracking-wider border px-2 py-1 {STATUS_STYLES[drop.status] ?? 'text-white/30 border-white/10'}">
                  {drop.status === 'live' || drop.status === 'active' ? '● LIVE' : drop.status === 'upcoming' ? '◈ UPCOMING' : drop.status?.toUpperCase()}
                </span>
              </div>
              {#if drop.is_featured}
                <div class="absolute top-3 right-3">
                  <span class="mono text-[7px] bg-hd-gold text-black px-2 py-1 uppercase tracking-wider font-bold">Featured</span>
                </div>
              {/if}
            </div>

            <!-- Info -->
            <div class="p-6 flex flex-col justify-between bg-[#050505]">
              <div>
                <p class="mono text-[8px] uppercase tracking-[0.3em] text-hd-gold/50 mb-2">
                  {drop.drop_type === 'auction' ? '⚡ Auction Drop' : drop.drop_type === 'timed' ? '⏱ Timed Release' : '💎 Limited Drop'}
                </p>
                <h2 class="font-serif text-2xl text-white mb-2">{drop.name}</h2>
                <p class="text-white/40 text-sm leading-relaxed mb-4">{drop.description}</p>

                <!-- Timer -->
                <div class="mb-4">
                  <p class="mono text-[8px] uppercase text-white/30 tracking-widest mb-2">
                    {drop.status === 'upcoming' ? 'Starts In' : 'Ends In'}
                  </p>
                  <div class="font-mono text-3xl text-hd-gold tracking-widest font-light">
                    {timers[drop.id] ?? '00:00:00'}
                  </div>
                </div>

                <!-- Stock bar -->
                <div class="mb-4">
                  <div class="flex justify-between mb-1">
                    <span class="mono text-[8px] uppercase text-white/30">Stock</span>
                    <span class="mono text-[8px] text-white/50">{drop.units_sold}/{drop.stock} claimed</span>
                  </div>
                  <div class="h-1 bg-white/[0.06] overflow-hidden">
                    <div
                      class="h-full transition-all duration-1000 {stockPct(drop) >= 80 ? 'bg-red-400' : 'bg-hd-gold'}"
                      style="width:{stockPct(drop)}%"
                    ></div>
                  </div>
                </div>

                <!-- Min tier badge -->
                {#if drop.minimum_tier && drop.minimum_tier !== 'citizen'}
                  <div class="mb-4">
                    <span class="mono text-[8px] uppercase border border-amber-500/30 text-amber-400/70 px-2 py-1">
                      Requires {drop.minimum_tier} tier or above
                    </span>
                  </div>
                {/if}
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="mono text-[8px] text-white/30 uppercase mb-1">Price</p>
                  <p class="font-serif text-2xl text-hd-gold">₦{drop.price?.toLocaleString()}</p>
                </div>
                {#if drop.status !== 'sold_out'}
                  {#if canJoin(drop)}
                    <button
                      on:click={() => goto(`/product/${drop.product_id ?? drop.id}`)}
                      class="bg-hd-gold text-black mono text-[9px] uppercase tracking-widest px-6 py-3 font-semibold hover:bg-hd-gold/90 transition-all"
                    >
                      {drop.status === 'upcoming' ? 'Notify Me' : 'Join the Drop'}
                    </button>
                  {:else if !$isAuthenticated}
                    <a href="/auth?redirect=/drops" class="border border-hd-gold/40 text-hd-gold mono text-[9px] uppercase tracking-widest px-5 py-3 hover:bg-hd-gold hover:text-black transition-all">
                      Sign In to Join
                    </a>
                  {:else}
                    <div class="text-right">
                      <span class="mono text-[8px] text-red-400/70 uppercase">Tier upgrade required</span>
                      <a href="/profile?tab=rewards" class="block mono text-[8px] text-hd-gold/50 hover:text-hd-gold mt-1">Upgrade tier →</a>
                    </div>
                  {/if}
                {:else}
                  <span class="mono text-[9px] text-white/30 uppercase border border-white/10 px-5 py-3">Sold Out</span>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
