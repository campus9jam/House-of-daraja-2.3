<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentLanguage } from '$lib/stores/language';
  import type { Auction, MediaItem } from '$lib/types/database';

  const HERO_IMAGES = [
    "https://i.imgur.com/7QFYTZJ.png",
    "https://i.imgur.com/MA123T4.png",
    "https://i.imgur.com/S4l7lKP.png",
    "https://i.imgur.com/jNv9WE7.png",
    "https://i.imgur.com/2Xkwv9Y.png",
  ];

  let currentSlide = 0;
  let liveAuctions: Auction[] = [];
  let featuredMedia: MediaItem[] = [];
  let email = '';
  let subscribed = false;

  // Auto-advance hero
  onMount(() => {
    const t = setInterval(() => { currentSlide = (currentSlide + 1) % HERO_IMAGES.length; }, 8000);

    // Load live auctions
    supabase.from('auctions').select('*').eq('status', 'live').limit(3)
      .then(({ data }) => { if (data) liveAuctions = data as Auction[]; });

    // Load featured media
    supabase.from('media_items').select('*').eq('status', 'approved').order('view_count', { ascending: false }).limit(4)
      .then(({ data }) => { if (data) featuredMedia = data as MediaItem[]; });

    return () => clearInterval(t);
  });

  const PRESTIGE_TIERS = [
    { name: 'Citizen',      xp: '0',    color: '#FFFFFF', desc: 'Begin your heritage journey' },
    { name: 'Patron',       xp: '500',  color: '#F59E0B', desc: 'Elevated commerce access' },
    { name: 'Curator',      xp: '2K',   color: '#C5A059', desc: 'Exclusive drops & governance' },
    { name: 'Vanguard',     xp: '7.5K', color: '#A855F7', desc: 'Artisan grants & auction priority' },
    { name: 'Daraja Elite', xp: '25K',  color: '#C5A059', desc: 'Full sovereign privileges' },
  ];
</script>

<svelte:head>
  <title>House of Daraja — Sovereign Heritage Platform</title>
</svelte:head>

<!-- ── HERO ─────────────────────────────────────────────────── -->
<section class="relative h-[92vh] flex flex-col justify-end p-8 overflow-hidden group">
  {#each HERO_IMAGES as img, i}
    {#if i === currentSlide}
      <div
        in:fade={{ duration: 2000 }}
        out:fade={{ duration: 1500 }}
        class="absolute inset-0"
      >
        <img
          src={img}
          alt="Heritage"
          class="w-full h-full object-cover brightness-[0.65] scale-105 transition-transform duration-[20s] group-hover:scale-100"
          referrerpolicy="no-referrer"
          loading="eager"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-hd-black via-hd-black/10 to-transparent" />
      </div>
    {/if}
  {/each}

  <!-- Copy -->
  <div class="relative z-10 max-w-5xl mb-16" in:fly={{ y: 40, duration: 1200, delay: 300 }}>
    <div class="flex items-center gap-4 mb-10">
      <div class="w-12 h-px bg-hd-gold" />
      <span class="mono text-hd-gold/80 text-[9px] uppercase tracking-[0.6em]">Heritage Archive V2.3 — Powered by Leema AI</span>
    </div>

    <!-- Ghost watermark -->
    <h2 class="absolute -top-16 -left-4 text-[14vw] font-serif font-black text-white/10 leading-none tracking-tighter uppercase pointer-events-none">
      DAR<span class="italic">AJA</span>
    </h2>

    <h1 class="text-[clamp(3rem,9vw,8rem)] font-serif italic text-white leading-[0.9] tracking-tighter relative z-10">
      <span class="text-hd-gold not-italic font-bold">HD</span> Heritage<br/>
      <span class="ml-16 md:ml-32">Collection</span>
    </h1>

    <p class="mt-8 text-white/50 font-serif italic text-xl md:text-2xl max-w-2xl leading-relaxed">
      Africa's premier luxury cultural commerce ecosystem. Bespoke commissions, live auctions, and heritage intelligence — powered by Leema AI.
    </p>

    <div class="flex flex-wrap gap-4 mt-10">
      <a href="/atelier" class="hd-btn-primary">
        Commission Bespoke
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
      </a>
      <a href="/auction" class="hd-btn-outline">
        Live Auctions
      </a>
    </div>
  </div>

  <!-- Slide indicators -->
  <div class="absolute bottom-12 right-10 z-20 flex gap-3">
    {#each HERO_IMAGES as _, i}
      <button
        on:click={() => (currentSlide = i)}
        class="h-px transition-all duration-700 {currentSlide === i ? 'w-14 bg-hd-gold shadow-[0_0_10px_rgba(197,160,89,0.5)]' : 'w-6 bg-white/20'}"
      />
    {/each}
  </div>
</section>

<!-- ── SOVEREIGN TICKER ──────────────────────────────────────── -->
<div class="bg-hd-gold h-11 overflow-hidden flex items-center border-y border-black/20">
  <div class="flex gap-20 items-center animate-ticker min-w-[200%] whitespace-nowrap">
    {#each Array(14) as _, i}
      <span class="flex items-center gap-3 text-hd-black font-bold text-[9px] mono uppercase tracking-[0.5em] flex-shrink-0">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        {i % 3 === 0 ? 'HERITAGE VOL: ₦1.2M' : i % 3 === 1 ? 'LEEMA AI: ACTIVE' : 'PRESTIGE NODES: 8.4K'}
      </span>
      <span class="text-hd-black/30 flex-shrink-0">•</span>
    {/each}
  </div>
</div>

<!-- ── LIVE AUCTIONS TEASER ──────────────────────────────────── -->
{#if liveAuctions.length > 0}
<section class="px-6 md:px-12 py-24 bg-hd-surface">
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-end mb-16">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span class="mono text-red-400 text-[9px] uppercase tracking-widest">Live Now</span>
        </div>
        <h2 class="text-4xl md:text-6xl font-serif italic text-white">Sovereign <span class="text-hd-gold not-italic">Auctions</span></h2>
      </div>
      <a href="/auction" class="hidden md:flex items-center gap-2 mono text-[10px] text-white/40 hover:text-hd-gold transition-colors uppercase tracking-widest">
        All Auctions →
      </a>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each liveAuctions as auction}
        <a href="/auction/{auction.id}" class="hd-card-hover overflow-hidden group block">
          <div class="aspect-[4/3] overflow-hidden relative">
            <img src={auction.image_url} alt={auction.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerpolicy="no-referrer" />
            <div class="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 px-3 py-1">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span class="mono text-white text-[8px] uppercase">LIVE</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black">
              <p class="mono text-hd-gold text-[8px] uppercase tracking-widest mb-1">{auction.category}</p>
              <h3 class="font-serif italic text-white text-lg">{auction.title}</h3>
              <p class="mono text-white text-sm mt-2 font-bold">₦{auction.current_bid.toLocaleString()}</p>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
{/if}

<!-- ── PRESTIGE TIERS ─────────────────────────────────────────── -->
<section class="px-6 md:px-12 py-32">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-20">
      <div class="flex items-center justify-center gap-4 mb-6">
        <div class="w-8 h-px bg-hd-gold/40" />
        <span class="mono text-hd-gold text-[9px] uppercase tracking-[0.6em]">LEE PRESTIGE PROTOCOL</span>
        <div class="w-8 h-px bg-hd-gold/40" />
      </div>
      <h2 class="text-4xl md:text-6xl font-serif italic text-white">Heritage <span class="text-hd-gold not-italic">Hierarchy</span></h2>
      <p class="text-white/40 font-serif italic text-lg mt-4 max-w-xl mx-auto">Every interaction earns XP. Every milestone unlocks a new tier of sovereign privilege.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      {#each PRESTIGE_TIERS as tier, i}
        <div class="hd-card p-8 text-center space-y-4 hover:border-hd-gold/40 transition-all group relative overflow-hidden">
          <div class="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity" style="background: {tier.color}" />
          <div class="w-10 h-10 rounded-full mx-auto border-2 flex items-center justify-center" style="border-color: {tier.color}; box-shadow: 0 0 20px {tier.color}30">
            <span class="mono text-[9px] font-bold" style="color: {tier.color}">{i + 1}</span>
          </div>
          <h3 class="font-serif italic text-white text-base">{tier.name}</h3>
          <p class="mono text-[8px] uppercase tracking-widest" style="color: {tier.color}">{tier.xp} XP</p>
          <p class="text-white/40 text-[10px] font-serif italic">{tier.desc}</p>
        </div>
      {/each}
    </div>
    <div class="text-center mt-12">
      <a href="/auth" class="hd-btn-primary inline-flex">JOIN THE ARCHIVE</a>
    </div>
  </div>
</section>

<!-- ── ATELIER SHOWCASE ──────────────────────────────────────── -->
<section class="px-6 md:px-12 py-24 bg-hd-surface">
  <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
    <!-- 38% text -->
    <div class="lg:col-span-5 space-y-8">
      <div class="flex items-center gap-3">
        <div class="w-6 h-px bg-hd-gold" />
        <span class="mono text-hd-gold text-[9px] uppercase tracking-widest">HD BESPOKE ATELIER</span>
      </div>
      <h2 class="text-4xl md:text-6xl font-serif italic text-white leading-tight">Commission <br/><span class="text-hd-gold not-italic">Your Identity</span></h2>
      <p class="text-white/50 font-serif italic text-lg leading-relaxed">
        Agbada. Kaftan. Boubou. Senator. Leema AI analyzes your occasion, body profile, and cultural context to match you with the perfect artisan and fabric.
      </p>
      <div class="space-y-4">
        {#each ['AI Style Recommendations', 'Artisan Matching Engine', 'Smart Measurement Grid', 'Cultural Context Analysis'] as feat}
          <div class="flex items-center gap-3">
            <div class="w-1.5 h-1.5 bg-hd-gold" />
            <span class="mono text-[10px] text-white/60 uppercase">{feat}</span>
          </div>
        {/each}
      </div>
      <a href="/atelier" class="hd-btn-primary inline-flex">COMMISSION NOW</a>
    </div>
    <!-- 62% image grid -->
    <div class="lg:col-span-7 grid grid-cols-2 gap-4">
      <div class="aspect-[3/4] overflow-hidden">
        <img src="https://i.imgur.com/S4l7lKP.png" alt="Atelier" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
      </div>
      <div class="space-y-4">
        <div class="aspect-square overflow-hidden">
          <img src="https://i.imgur.com/jNv9WE7.png" alt="Fabric" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
        </div>
        <div class="hd-card p-6 space-y-3">
          <span class="mono text-hd-gold text-[8px] uppercase">LEEMA AI CURATOR</span>
          <p class="font-serif italic text-white/70 text-sm">"A grand Agbada with Sahel-inspired embroidery would honour this occasion perfectly."</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── MEDIA NETWORK PREVIEW ─────────────────────────────────── -->
{#if featuredMedia.length > 0}
<section class="px-6 md:px-12 py-24">
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-end mb-16">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-6 h-px bg-hd-gold" />
          <span class="mono text-hd-gold text-[9px] uppercase tracking-widest">HD COLLECTIVE MEDIA</span>
        </div>
        <h2 class="text-4xl md:text-6xl font-serif italic text-white">Cultural <span class="text-hd-gold not-italic">Archive</span></h2>
      </div>
      <a href="/media" class="hidden md:flex items-center gap-2 mono text-[10px] text-white/40 hover:text-hd-gold transition-colors uppercase tracking-widest">View All →</a>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each featuredMedia as item}
        <a href="/media/{item.id}" class="hd-card-hover overflow-hidden group block">
          <div class="aspect-video overflow-hidden relative">
            <img src={item.thumbnail_url} alt={item.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="w-12 h-12 rounded-full bg-hd-gold/90 flex items-center justify-center">
                <svg class="w-5 h-5 text-hd-black fill-hd-black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
          <div class="p-4 space-y-2">
            <p class="mono text-hd-gold text-[8px] uppercase">{item.category}</p>
            <h3 class="font-serif italic text-white text-sm line-clamp-2">{item.title}</h3>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
{/if}

<!-- ── NEWSLETTER ─────────────────────────────────────────────── -->
<section class="px-6 md:px-12 py-32 border-t border-white/5">
  <div class="max-w-lg mx-auto text-center space-y-8">
    <div class="flex items-center justify-center gap-3 text-hd-gold mono text-[9px] uppercase tracking-widest">
      ✦ ARCHIVE DISTRIBUTION LEDGER ✦
    </div>
    <h2 class="text-4xl md:text-5xl font-serif italic text-white">Register <span class="text-hd-gold not-italic">Your Identity</span></h2>
    <p class="text-white/40 font-serif italic">Be the first. Drops. Heritage releases. Atelier access.</p>
    {#if subscribed}
      <p class="text-hd-gold mono text-[10px] uppercase tracking-widest">IDENTITY LOCKED — WELCOME TO THE ARCHIVE</p>
    {:else}
      <form on:submit|preventDefault={() => { if(email) subscribed = true; }} class="flex">
        <input
          type="email" bind:value={email} required
          placeholder="archive@daraja.io"
          class="flex-1 hd-input border-r-0 text-sm"
        />
        <button type="submit" class="px-8 bg-hd-gold text-hd-black font-bold mono text-[9px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2">
          LOCK
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7-7 7" /></svg>
        </button>
      </form>
    {/if}
  </div>
</section>
