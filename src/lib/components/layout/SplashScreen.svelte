<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  let logoVisible   = false;
  let taglineVisible = false;
  let barComplete   = false;
  let aiPulse       = false;

  const HD_LOGO = '/hd-logo.png';

  onMount(() => {
    // Staggered reveal
    setTimeout(() => { logoVisible   = true; }, 300);
    setTimeout(() => { taglineVisible = true; }, 900);
    setTimeout(() => { aiPulse       = true; }, 1200);
    setTimeout(() => { barComplete   = true; }, 1800);
    setTimeout(() => { dispatch('done'); },     3200);
  });
</script>

<div class="fixed inset-0 z-[999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
  <!-- Ambient gold shimmer lines -->
  <div class="absolute inset-0 overflow-hidden opacity-15 pointer-events-none">
    {#each [20, 36, 52, 68, 84] as top, i}
      <div
        class="absolute h-px bg-gradient-to-r from-transparent via-hd-gold to-transparent w-full"
        style="top: {top}%; animation: shimmer {3+i}s ease infinite; animation-delay: {i*0.4}s"
      ></div>
    {/each}
  </div>

  <!-- Logo -->
  {#if logoVisible}
    <div class="relative" in:scale={{ duration: 600, start: 0.7 }}>
      <!-- Gold glow ring -->
      <div class="absolute inset-0 -m-4 rounded-full bg-hd-gold/5 blur-2xl animate-pulse"></div>
      <div class="absolute inset-0 -m-2 border border-hd-gold/20 rounded-full animate-ping"></div>
      <img
        src={HD_LOGO}
        alt="House of Daraja"
        class="w-28 h-28 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(197,160,89,0.4)]"
      />
    </div>
  {/if}

  <!-- Brand text -->
  {#if taglineVisible}
    <div class="mt-8 text-center" in:fade={{ duration: 500 }}>
      <div class="font-serif text-white text-3xl font-light tracking-[0.35em] mb-2">House of Daraja</div>
      <div class="mono text-hd-gold/60 text-[9px] uppercase tracking-[1em]">Wear Your Worth</div>
    </div>
  {/if}

  <!-- Leema status -->
  {#if aiPulse}
    <div class="mt-10" in:fade={{ duration: 400 }}>
      <div class="flex items-center gap-3">
        <div class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
        <span class="mono text-green-400/70 text-[8px] uppercase tracking-[0.6em]">Leema AI Active</span>
      </div>
    </div>
  {/if}

  <!-- Loading bar -->
  <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-hd-gold/10 overflow-hidden">
    <div
      class="h-full bg-gradient-to-r from-hd-gold/60 via-hd-gold to-hd-gold/60 transition-all duration-[2800ms] ease-in-out"
      style="width: {barComplete ? '100%' : '0%'}"
    ></div>
  </div>

  <!-- Departments ticker (bottom) -->
  <div class="absolute bottom-6 left-0 right-0 overflow-hidden">
    <div class="flex gap-8 animate-[marquee_12s_linear_infinite] whitespace-nowrap px-8">
      {#each ['Royal Heritage', 'Afro Urban Streetwear', 'Accessories', 'Kano Textiles Market'] as dept}
        <span class="mono text-white/20 text-[8px] uppercase tracking-widest">{dept}</span>
        <span class="text-hd-gold/20 text-[8px]">✦</span>
      {/each}
      {#each ['Royal Heritage', 'Afro Urban Streetwear', 'Accessories', 'Kano Textiles Market'] as dept}
        <span class="mono text-white/20 text-[8px] uppercase tracking-widest">{dept}</span>
        <span class="text-hd-gold/20 text-[8px]">✦</span>
      {/each}
    </div>
  </div>
</div>

<style>
  @keyframes shimmer {
    0%, 100% { transform: translateX(-100%); opacity: 0; }
    50% { transform: translateX(100%); opacity: 1; }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
</style>
