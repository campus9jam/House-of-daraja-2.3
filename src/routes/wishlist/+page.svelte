<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { cart } from '$lib/stores/cart';

  let items: any[] = [];
  let loading = true;

  onMount(async () => {
    if (!$isAuthenticated) { goto('/auth?redirect=/wishlist'); return; }
    const { data } = await supabase
      .from('wishlist')
      .select('*, product:products(id,name,price,images,department,sizes)')
      .eq('user_id', $currentUser!.id)
      .order('created_at', { ascending: false });
    items = data ?? [];
    loading = false;
  });

  async function remove(id: string) {
    await supabase.from('wishlist').delete().eq('id', id);
    items = items.filter(i => i.id !== id);
  }

  function addToCart(item: any) {
    const p = item.product;
    if (!p) return;
    cart.add({ id: p.id, product_id: p.id, name: p.name, price: p.price, image: p.images?.[0] ?? '', size: p.sizes?.[0], department: p.department });
  }
</script>

<svelte:head><title>Saved Items — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505] py-6">
  <div class="max-w-4xl mx-auto px-4">
    <div class="mb-8">
      <p class="mono text-hd-gold/50 text-[9px] uppercase tracking-[0.4em] mb-1">Account</p>
      <h1 class="font-serif text-3xl text-white font-light">Saved Items</h1>
    </div>

    {#if loading}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each Array(4) as _}<div class="aspect-[3/4] bg-white/[0.03] animate-pulse"></div>{/each}
      </div>
    {:else if items.length === 0}
      <div class="text-center py-24" in:fade>
        <img src="/hd-logo.png" alt="" class="w-14 h-14 mx-auto mb-5 opacity-20 object-contain" />
        <p class="font-serif text-xl text-white/30">Nothing saved yet</p>
        <p class="text-white/20 text-sm mt-2">Browse the collection and save pieces you love</p>
        <a href="/shop" class="mono text-[9px] text-hd-gold/50 hover:text-hd-gold mt-6 block">Browse Shop →</a>
      </div>
    {:else}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each items as item, i (item.id)}
          <div class="group" in:fly={{ y: 10, delay: i * 50 }}>
            <div class="relative aspect-[3/4] overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-hd-gold/20 transition-all">
              <a href="/product/{item.product?.id}">
                <img src={item.product?.images?.[0] ?? '/hd-logo.png'} alt={item.product?.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </a>
              <button on:click={() => remove(item.id)} class="absolute top-2 right-2 w-7 h-7 bg-[#050505]/80 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-400/30 transition-all text-xs">✕</button>
              <button
                on:click={() => addToCart(item)}
                class="absolute bottom-2 left-2 right-2 bg-hd-gold text-black mono text-[7px] uppercase tracking-widest py-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 font-semibold"
              >Add to Cart</button>
            </div>
            <a href="/product/{item.product?.id}">
              <p class="text-white/70 text-sm mt-2 leading-snug truncate">{item.product?.name}</p>
              <p class="text-hd-gold mono text-sm">₦{item.product?.price?.toLocaleString()}</p>
            </a>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
