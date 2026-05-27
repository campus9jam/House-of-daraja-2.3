<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
</script>

<svelte:head><title>{$page.status} — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 text-center">
  <!-- Gold shimmer lines -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    {#each [20,40,60,80] as top}
      <div class="absolute h-px bg-gradient-to-r from-transparent via-hd-gold to-transparent w-full" style="top:{top}%"></div>
    {/each}
  </div>

  <img src="/hd-logo.png" alt="HD" class="w-16 h-16 object-contain mb-8 opacity-40" />

  <p class="font-mono text-hd-gold/40 text-6xl font-light mb-4">{$page.status}</p>

  {#if $page.status === 404}
    <h1 class="font-serif text-3xl text-white font-light mb-3">This page doesn't exist</h1>
    <p class="text-white/30 text-sm max-w-xs mb-8">The page you're looking for has moved, or was never here. Explore our collection instead.</p>
  {:else if $page.status === 500}
    <h1 class="font-serif text-3xl text-white font-light mb-3">Something went wrong</h1>
    <p class="text-white/30 text-sm max-w-xs mb-8">Our artisans are working on it. Please try again in a moment.</p>
  {:else}
    <h1 class="font-serif text-3xl text-white font-light mb-3">{$page.error?.message ?? 'Unexpected error'}</h1>
    <p class="text-white/30 text-sm max-w-xs mb-8">Something went wrong on our end.</p>
  {/if}

  <div class="flex gap-3">
    <a href="/" class="bg-hd-gold text-black mono text-[10px] uppercase tracking-widest px-6 py-3 font-semibold hover:bg-hd-gold/90 transition-all">
      ← Home
    </a>
    <a href="/shop" class="border border-white/10 text-white/50 mono text-[10px] uppercase tracking-widest px-6 py-3 hover:border-hd-gold/20 hover:text-white/70 transition-all">
      Browse Shop
    </a>
  </div>
</div>
