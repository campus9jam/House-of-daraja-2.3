<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';

  const dispatch = createEventDispatcher();
  let phase = 0;

  onMount(() => {
    setTimeout(() => (phase = 1), 600);
    setTimeout(() => (phase = 2), 1800);
    setTimeout(() => dispatch('done'), 3200);
  });
</script>

<div class="fixed inset-0 z-[999] bg-hd-black flex flex-col items-center justify-center overflow-hidden" in:fade out:fade={{ duration: 500 }}>
  <!-- Gold particle lines -->
  <div class="absolute inset-0 overflow-hidden opacity-20">
    {#each Array(5) as _, i}
      <div
        class="absolute h-px bg-gradient-to-r from-transparent via-hd-gold to-transparent"
        style="top: {20 + i * 16}%; left: 0; right: 0; animation: shimmer {3 + i}s ease infinite; animation-delay: {i * 0.4}s"
      />
    {/each}
  </div>

  <!-- Logo -->
  <div class="relative transition-all duration-700 {phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}">
    <div class="w-24 h-24 bg-hd-gold flex items-center justify-center relative">
      <span class="font-serif font-bold text-hd-black text-4xl">HD</span>
      <div class="absolute inset-0 border-2 border-hd-gold animate-ping opacity-20" />
    </div>
  </div>

  <!-- Brand name -->
  <div class="mt-8 text-center transition-all duration-700 delay-300 {phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}">
    <div class="font-serif text-white text-3xl font-light tracking-[0.3em] mb-2">House of Daraja</div>
    <div class="mono text-white/30 text-[9px] uppercase tracking-[0.8em]">Sovereign Heritage Platform</div>
  </div>

  <!-- Status -->
  <div class="mt-12 transition-all duration-500 {phase >= 2 ? 'opacity-100' : 'opacity-0'}">
    <div class="flex items-center gap-3">
      <div class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
      <span class="mono text-green-400 text-[9px] uppercase tracking-[0.5em]">Leema AI Protocol Ingestion Active</span>
    </div>
  </div>

  <!-- Progress bar -->
  <div class="absolute bottom-0 left-0 right-0 h-px bg-hd-gold/10">
    <div class="h-full bg-hd-gold transition-all duration-[3200ms] ease-linear {phase >= 0 ? 'w-full' : 'w-0'}" />
  </div>
</div>
