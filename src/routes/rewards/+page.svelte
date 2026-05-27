<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { userProfile, isAuthenticated } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  const TIERS = [
    { id:'citizen',  label:'Citizen',      minXP:0,     color:'#FFFFFF', perks:['5% off first order','Access to public drops','Basic Leema AI'] },
    { id:'patron',   label:'Patron',       minXP:500,   color:'#F59E0B', perks:['10% discount on all orders','Priority drop access','Extended Leema AI','Free standard shipping'] },
    { id:'curator',  label:'Curator',      minXP:2000,  color:'#C5A059', perks:['15% discount','Curator-only drops','Dedicated style concierge','Express shipping included','1 free Atelier consultation/yr'] },
    { id:'vanguard', label:'Vanguard',     minXP:7500,  color:'#A855F7', perks:['20% discount','First access to all drops','Monthly gift from Daraja','VIP event invitations','Free express shipping always'] },
    { id:'elite',    label:'Daraja Elite', minXP:25000, color:'#C5A059', perks:['25% discount on everything','Private drops before anyone else','Annual bespoke piece (gifted)','Daraja Concierge hotline 24/7','Name on the House of Daraja Wall'] },
  ];

  const EARN_WAYS = [
    { action:'Make a Purchase',      reward:'10 LEE per ₦1,000',  icon:'🛍️' },
    { action:'Write a Review',       reward:'50 LEE per review',  icon:'⭐' },
    { action:'Refer a Friend',       reward:'200 LEE',            icon:'🤝' },
    { action:'Complete Profile',     reward:'100 LEE (one-time)', icon:'👤' },
    { action:'Join the Community',   reward:'25 LEE',             icon:'🏛️' },
    { action:'Share on Social',      reward:'15 LEE per share',   icon:'📢' },
    { action:'Bespoke Commission',   reward:'500 LEE',            icon:'✦' },
    { action:'Win an Auction',       reward:'300 LEE',            icon:'⚡' },
  ];

  onMount(() => { if (!$isAuthenticated) goto('/auth?redirect=/rewards'); });

  $: tier    = $userProfile?.prestige_tier ?? 'citizen';
  $: tierCfg = TIERS.find(t => t.id === tier) ?? TIERS[0];
  $: nextTier = TIERS[TIERS.findIndex(t => t.id === tier) + 1];
  $: xpProgress = $userProfile && nextTier ? Math.min(($userProfile.xp / nextTier.minXP) * 100, 100) : 100;
</script>

<svelte:head><title>Rewards — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505] py-6">
  <div class="max-w-2xl mx-auto px-4">
    <div class="mb-8">
      <p class="mono text-hd-gold/50 text-[9px] uppercase tracking-[0.4em] mb-1">Prestige System</p>
      <h1 class="font-serif text-3xl text-white font-light">LEE Rewards</h1>
    </div>

    <!-- Current tier card -->
    {#if $userProfile}
      <div class="relative border overflow-hidden mb-8 p-6" style="border-color: {tierCfg.color}30; background: linear-gradient(135deg, {tierCfg.color}08 0%, transparent 100%);" in:fade>
        <div class="flex items-start justify-between mb-6">
          <div>
            <p class="mono text-[9px] uppercase tracking-[0.3em] mb-1" style="color:{tierCfg.color}80">Current Tier</p>
            <h2 class="font-serif text-3xl text-white">{tierCfg.label}</h2>
          </div>
          <div class="text-right">
            <p class="mono text-[8px] uppercase text-white/30 mb-1">Balance</p>
            <p class="font-serif text-3xl" style="color:{tierCfg.color}">{$userProfile.lee_balance ?? 0}</p>
            <p class="mono text-[7px] text-white/20 uppercase">LEE Points</p>
          </div>
        </div>

        <!-- XP Progress -->
        {#if nextTier}
          <div class="mb-4">
            <div class="flex justify-between mb-2">
              <span class="mono text-[8px] uppercase text-white/30">Progress to {nextTier.label}</span>
              <span class="mono text-[9px]" style="color:{tierCfg.color}">{$userProfile.xp?.toLocaleString()} / {nextTier.minXP.toLocaleString()} XP</span>
            </div>
            <div class="h-1.5 bg-white/[0.06] overflow-hidden">
              <div class="h-full transition-all duration-1000" style="width:{xpProgress}%; background: {tierCfg.color}"></div>
            </div>
          </div>
        {/if}

        <!-- Current perks -->
        <div>
          <p class="mono text-[8px] uppercase text-white/30 tracking-widest mb-3">Your Perks</p>
          <div class="grid grid-cols-1 gap-1.5">
            {#each tierCfg.perks as perk}
              <div class="flex items-center gap-2">
                <span style="color:{tierCfg.color}" class="text-xs">✓</span>
                <span class="text-white/60 text-sm">{perk}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <!-- Earn section -->
    <div class="mb-8">
      <h2 class="font-serif text-xl text-white mb-4">Earn LEE Points</h2>
      <div class="space-y-2">
        {#each EARN_WAYS as way, i}
          <div class="flex items-center justify-between py-3 px-4 bg-white/[0.02] border border-white/[0.06] hover:border-hd-gold/10 transition-all" in:fly={{ y: 5, delay: i * 40 }}>
            <div class="flex items-center gap-3">
              <span class="text-lg">{way.icon}</span>
              <span class="text-white/70 text-sm">{way.action}</span>
            </div>
            <span class="mono text-[9px] text-hd-gold/70">{way.reward}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- All tiers roadmap -->
    <div class="mb-8">
      <h2 class="font-serif text-xl text-white mb-4">Prestige Tiers</h2>
      <div class="space-y-3">
        {#each TIERS as t, i}
          {@const isActive = t.id === tier}
          {@const isAchieved = TIERS.findIndex(x=>x.id===tier) >= i}
          <div class="border p-4 transition-all {isActive ? 'border-hd-gold/30 bg-hd-gold/5' : isAchieved ? 'border-white/[0.08]' : 'border-white/[0.04] opacity-50'}">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                {#if isAchieved}<span class="text-sm" style="color:{t.color}">✦</span>{:else}<span class="text-white/20 text-sm">◈</span>{/if}
                <h3 class="font-serif text-base" style="color: {isAchieved ? t.color : 'rgba(255,255,255,0.3)'}">{t.label}</h3>
                {#if isActive}<span class="mono text-[7px] bg-hd-gold text-black px-1.5 py-0.5 ml-2">Current</span>{/if}
              </div>
              <span class="mono text-[8px] text-white/30">{t.minXP.toLocaleString()} XP</span>
            </div>
            {#if isActive || isAchieved}
              <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {#each t.perks.slice(0,2) as perk}
                  <span class="text-white/40 text-xs">• {perk}</span>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Redeem CTA -->
    {#if ($userProfile?.lee_balance ?? 0) > 0}
      <div class="bg-gradient-to-r from-hd-gold/10 to-transparent border border-hd-gold/20 p-5 flex items-center justify-between">
        <div>
          <p class="text-white font-light mb-1">Ready to redeem?</p>
          <p class="text-white/40 text-sm">{$userProfile?.lee_balance} LEE available</p>
        </div>
        <a href="/checkout" class="bg-hd-gold text-black mono text-[9px] uppercase tracking-widest px-5 py-2.5 font-semibold hover:bg-hd-gold/90 transition-all">Redeem Now</a>
      </div>
    {/if}
  </div>
</div>
