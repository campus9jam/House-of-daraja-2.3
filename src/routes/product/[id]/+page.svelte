<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { cart } from '$lib/stores/cart';
  import { isAuthenticated } from '$lib/stores/auth';

  let product: any = null;
  let related: any[] = [];
  let loading = true;
  let selectedSize = '';
  let selectedImage = 0;
  let addedToCart = false;
  let inWishlist = false;

  const DEPT_LABELS: Record<string, string> = {
    'royal-heritage': '👑 Royal Heritage',
    'afro-urban': '⚡ Afro Urban',
    'accessories': '✦ Accessories',
    'kano-textiles': '🧵 Kano Textiles',
  };

  onMount(async () => {
    const id = $page.params.id;
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) {
      product = data;
      selectedSize = data.sizes?.[0] ?? '';
      // Load related
      const { data: rel } = await supabase.from('products')
        .select('id,name,price,images,department')
        .eq('department', data.department)
        .neq('id', id)
        .limit(4);
      related = rel ?? [];
    } else {
      // Fallback mock
      product = MOCK;
      selectedSize = MOCK.sizes[0];
    }
    loading = false;
  });

  function addToCartAction() {
    if (!product) return;
    cart.add({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? '',
      size: selectedSize,
      department: product.department,
    });
    addedToCart = true;
    setTimeout(() => addedToCart = false, 2500);
  }

  function buyNow() {
    addToCartAction();
    goto('/checkout');
  }

  const MOCK = {
    id: 'mock-1',
    name: 'Karama Kaftan',
    price: 120000,
    original_price: 150000,
    department: 'royal-heritage',
    description: 'A masterpiece of embroidery — the Karama Kaftan is handcrafted by our artisans in 5 layers of premium imported fabric. Each stitch tells a story of heritage.',
    images: ['https://i.imgur.com/7QFYTZJ.png','https://i.imgur.com/MA123T4.png','https://i.imgur.com/S4l7lKP.png'],
    sizes: ['M','L','XL','XXL'],
    material: '100% Premium Brocade',
    origin: 'Lagos, Nigeria',
    tags: ['kaftan','embroidered','heritage'],
  };
</script>

<svelte:head>
  {#if product}
    <title>{product.name} — House of Daraja</title>
    <meta name="description" content={product.description} />
  {/if}
</svelte:head>

<div class="min-h-screen bg-[#050505] pt-16 pb-24">
  {#if loading}
    <div class="flex items-center justify-center min-h-[80vh]">
      <div class="flex gap-2">
        {#each [0,1,2] as i}
          <div class="w-2 h-2 bg-hd-gold rounded-full animate-bounce" style="animation-delay:{i*150}ms"></div>
        {/each}
      </div>
    </div>
  {:else if product}
    <div class="max-w-6xl mx-auto px-4 py-8" in:fade>
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 mb-6 text-white/30 mono text-[9px] uppercase tracking-widest">
        <a href="/" class="hover:text-hd-gold transition-colors">Home</a>
        <span>/</span>
        <a href="/shop" class="hover:text-hd-gold transition-colors">Shop</a>
        <span>/</span>
        <a href="/shop?dept={product.department}" class="hover:text-hd-gold transition-colors">{DEPT_LABELS[product.department] ?? 'Collection'}</a>
        <span>/</span>
        <span class="text-white/50">{product.name}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Images -->
        <div class="space-y-3">
          <div class="aspect-[4/5] overflow-hidden bg-white/[0.03] border border-white/[0.06] relative">
            <img
              src={product.images?.[selectedImage] ?? '/hd-logo.png'}
              alt={product.name}
              class="w-full h-full object-cover transition-opacity duration-300"
            />
            <!-- Wishlist -->
            <button
              on:click={() => inWishlist = !inWishlist}
              class="absolute top-4 right-4 w-9 h-9 bg-[#050505]/80 border border-white/10 flex items-center justify-center transition-all hover:border-hd-gold"
            >
              <svg class="w-4 h-4 {inWishlist ? 'text-hd-gold fill-hd-gold' : 'text-white/50'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
            {#if product.original_price && product.original_price > product.price}
              <div class="absolute top-4 left-4 bg-hd-gold text-black mono text-[8px] uppercase tracking-wider px-2 py-1 font-semibold">
                {Math.round((1 - product.price / product.original_price) * 100)}% OFF
              </div>
            {/if}
          </div>
          <!-- Thumbnails -->
          {#if product.images?.length > 1}
            <div class="flex gap-2 overflow-x-auto scrollbar-none">
              {#each product.images as img, i}
                <button
                  on:click={() => selectedImage = i}
                  class="flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-all {selectedImage === i ? 'border-hd-gold' : 'border-white/10 hover:border-white/30'}"
                >
                  <img src={img} alt="" class="w-full h-full object-cover" />
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Product info -->
        <div class="space-y-6" in:fly={{ x: 30, duration: 500 }}>
          <!-- Dept label -->
          <span class="mono text-[9px] uppercase tracking-[0.3em] text-hd-gold/60">
            {DEPT_LABELS[product.department] ?? 'Collection'}
          </span>

          <div>
            <h1 class="font-serif text-4xl text-white font-light leading-tight mb-3">{product.name}</h1>
            <p class="text-white/50 text-sm leading-relaxed">{product.description}</p>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3">
            <span class="font-serif text-3xl text-hd-gold">₦{product.price?.toLocaleString()}</span>
            {#if product.original_price && product.original_price > product.price}
              <span class="mono text-sm text-white/30 line-through">₦{product.original_price?.toLocaleString()}</span>
            {/if}
          </div>

          <!-- Size selector -->
          {#if product.sizes?.length > 0}
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="mono text-[10px] uppercase tracking-widest text-white/50">Size</span>
                <a href="/atelier" class="mono text-[9px] text-hd-gold/60 hover:text-hd-gold transition-colors">Need custom? → Atelier</a>
              </div>
              <div class="flex gap-2 flex-wrap">
                {#each product.sizes as size}
                  <button
                    on:click={() => selectedSize = size}
                    class="w-12 h-12 border mono text-[10px] uppercase font-medium transition-all {selectedSize === size ? 'border-hd-gold text-hd-gold bg-hd-gold/10' : 'border-white/10 text-white/50 hover:border-white/30'}"
                  >
                    {size}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Meta info -->
          <div class="grid grid-cols-2 gap-3 py-4 border-y border-white/[0.06]">
            {#if product.material}
              <div>
                <p class="mono text-[8px] uppercase text-white/30 tracking-wider mb-1">Material</p>
                <p class="text-white/70 text-sm">{product.material}</p>
              </div>
            {/if}
            {#if product.origin}
              <div>
                <p class="mono text-[8px] uppercase text-white/30 tracking-wider mb-1">Origin</p>
                <p class="text-white/70 text-sm">{product.origin}</p>
              </div>
            {/if}
          </div>

          <!-- CTA buttons -->
          <div class="space-y-3">
            <button
              on:click={addToCartAction}
              class="w-full py-4 border-2 border-hd-gold text-hd-gold mono text-[10px] uppercase tracking-widest font-semibold hover:bg-hd-gold hover:text-black transition-all {addedToCart ? 'bg-hd-gold text-black' : ''}"
            >
              {#if addedToCart}
                ✓ Added to Cart
              {:else}
                Add to Cart
              {/if}
            </button>
            <button
              on:click={buyNow}
              class="w-full py-4 bg-hd-gold text-black mono text-[10px] uppercase tracking-widest font-semibold hover:bg-hd-gold/90 transition-all"
            >
              Buy Now
            </button>
            <a
              href="/atelier"
              class="block w-full py-4 border border-white/10 text-white/50 text-center mono text-[10px] uppercase tracking-widest hover:border-hd-gold/30 hover:text-white/70 transition-all"
            >
              ✦ Commission Bespoke Version
            </a>
          </div>

          <!-- Tags -->
          {#if product.tags?.length}
            <div class="flex gap-2 flex-wrap">
              {#each product.tags as tag}
                <span class="mono text-[8px] uppercase tracking-wider border border-white/[0.06] text-white/30 px-2 py-1">#{tag}</span>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Related products -->
      {#if related.length > 0}
        <div class="mt-20">
          <div class="flex items-center gap-4 mb-8">
            <div class="h-px flex-1 bg-white/[0.06]"></div>
            <span class="mono text-[9px] uppercase tracking-[0.4em] text-white/30">You May Also Like</span>
            <div class="h-px flex-1 bg-white/[0.06]"></div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            {#each related as rel}
              <a href="/product/{rel.id}" class="group">
                <div class="aspect-[3/4] overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-hd-gold/20 transition-all">
                  <img src={rel.images?.[0] ?? '/hd-logo.png'} alt={rel.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <p class="text-white/80 text-sm mt-2 leading-snug">{rel.name}</p>
                <p class="text-hd-gold mono text-sm">₦{rel.price?.toLocaleString()}</p>
              </a>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p class="font-serif text-3xl text-white/30">Product not found</p>
      <a href="/shop" class="mono text-[10px] uppercase tracking-widest text-hd-gold hover:underline">← Back to Shop</a>
    </div>
  {/if}
</div>
