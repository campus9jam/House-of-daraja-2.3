<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { cart } from '$lib/stores/cart';

  // ── 4 Departments ────────────────────────────────────────
  const DEPARTMENTS = [
    {
      id: 'royal-heritage',
      name: 'Royal Heritage',
      subtitle: 'Traditional Dress & Cultural Couture',
      icon: '👑',
      gradient: 'from-amber-900/40 via-hd-gold/10 to-transparent',
      tags: ['agbada', 'kaftan', 'dashiki', 'gele', 'buba-skirt', 'babariga'],
    },
    {
      id: 'afro-urban',
      name: 'Afro Urban Streetwear',
      subtitle: 'Modern African Street Culture',
      icon: '⚡',
      gradient: 'from-purple-900/30 via-purple-900/5 to-transparent',
      tags: ['streetwear', 'hoodies', 'joggers', 'sneakers-collab', 'bomber'],
    },
    {
      id: 'accessories',
      name: 'Accessories',
      subtitle: 'Shoes, Bags & Phone Covers',
      icon: '✦',
      gradient: 'from-rose-900/30 via-rose-900/5 to-transparent',
      tags: ['shoes', 'bags', 'phone-covers', 'belts', 'jewelry'],
    },
    {
      id: 'kano-textiles',
      name: 'Kano Textiles Market',
      subtitle: 'Premium Fabrics from Kano Vendors',
      icon: '🧵',
      gradient: 'from-emerald-900/30 via-emerald-900/5 to-transparent',
      tags: ['adire', 'ankara', 'aso-oke', 'kente', 'kola-cotton'],
    },
  ];

  let activeDept = 'all';
  let products: any[] = [];
  let loading = true;
  let searchQuery = '';
  let sortBy = 'newest';
  let priceRange = [0, 500000];
  let showFilters = false;

  onMount(async () => {
    await loadProducts();
  });

  async function loadProducts() {
    loading = true;
    let query = supabase.from('products').select('*').eq('status', 'published');
    if (activeDept !== 'all') query = query.eq('department', activeDept);
    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);
    if (sortBy === 'newest')     query = query.order('created_at', { ascending: false });
    if (sortBy === 'price_asc')  query = query.order('price', { ascending: true });
    if (sortBy === 'price_desc') query = query.order('price', { ascending: false });
    const { data } = await query.limit(48);
    products = data ?? MOCK_PRODUCTS;
    loading = false;
  }

  $: if (activeDept || sortBy) loadProducts();

  function addToCart(p: any) {
    cart.add({
      id: p.id,
      product_id: p.id,
      name: p.name,
      price: p.price,
      image: p.images?.[0] ?? '',
      size: p.sizes?.[0],
      department: p.department ?? 'royal-heritage',
    });
  }

  const MOCK_PRODUCTS = [
    { id: '1', name: 'Karama Kaftan', price: 120000, department: 'royal-heritage', images: ['https://i.imgur.com/7QFYTZJ.png'], description: 'Luxury embroidered kaftan', sizes: ['M','L','XL'], status: 'published' },
    { id: '2', name: 'Ekene Dashiki', price: 50000, department: 'royal-heritage', images: ['https://i.imgur.com/MA123T4.png'], description: 'Hand-crafted dashiki', sizes: ['S','M','L'], status: 'published' },
    { id: '3', name: 'Adah Dress', price: 95000, department: 'afro-urban', images: ['https://i.imgur.com/S4l7lKP.png'], description: 'Contemporary Afro design', sizes: ['XS','S','M','L'], status: 'published' },
    { id: '4', name: 'Emeka Jacket', price: 75000, department: 'afro-urban', images: ['https://i.imgur.com/jNv9WE7.png'], description: 'Street-luxury jacket', sizes: ['M','L','XL','XXL'], status: 'published' },
    { id: '5', name: 'Libas Bag', price: 85000, department: 'accessories', images: ['https://i.imgur.com/2Xkwv9Y.png'], description: 'Hand-stitched leather bag', sizes: [], status: 'published' },
    { id: '6', name: 'Aso-Oke Fabric 5 Yards', price: 28000, department: 'kano-textiles', images: ['https://i.imgur.com/7QFYTZJ.png'], description: 'Premium Yoruba aso-oke', sizes: ['3yds','5yds','10yds'], status: 'published' },
  ];
</script>

<div class="min-h-screen bg-[#050505] pt-16 pb-24">
  <!-- Hero banner -->
  <div class="relative bg-gradient-to-b from-hd-gold/5 to-transparent border-b border-white/[0.04] py-12 px-4">
    <div class="max-w-6xl mx-auto text-center">
      <p class="mono text-hd-gold/60 text-[9px] uppercase tracking-[0.5em] mb-3">The Collection</p>
      <h1 class="font-serif text-4xl md:text-5xl text-white font-light mb-4">Shop House of Daraja</h1>
      <p class="text-white/40 text-sm max-w-md mx-auto">Four departments. One sovereign aesthetic.</p>
    </div>
  </div>

  <!-- Department filter tabs -->
  <div class="sticky top-16 z-30 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.04]">
    <div class="max-w-6xl mx-auto px-4 py-0">
      <div class="flex gap-0 overflow-x-auto scrollbar-none">
        <button
          on:click={() => activeDept = 'all'}
          class="flex-shrink-0 px-5 py-4 mono text-[9px] uppercase tracking-widest border-b-2 transition-all {activeDept === 'all' ? 'border-hd-gold text-hd-gold' : 'border-transparent text-white/30 hover:text-white/60'}"
        >All</button>
        {#each DEPARTMENTS as dept}
          <button
            on:click={() => activeDept = dept.id}
            class="flex-shrink-0 px-5 py-4 mono text-[9px] uppercase tracking-widest border-b-2 transition-all whitespace-nowrap {activeDept === dept.id ? 'border-hd-gold text-hd-gold' : 'border-transparent text-white/30 hover:text-white/60'}"
          >
            <span class="mr-1">{dept.icon}</span> {dept.name}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Department hero (when a dept is selected) -->
  {#if activeDept !== 'all'}
    {@const dept = DEPARTMENTS.find(d => d.id === activeDept)}
    {#if dept}
      <div class="bg-gradient-to-r {dept.gradient} py-6 px-4 border-b border-white/[0.04]" in:fade>
        <div class="max-w-6xl mx-auto flex items-center gap-4">
          <span class="text-3xl">{dept.icon}</span>
          <div>
            <h2 class="font-serif text-2xl text-white">{dept.name}</h2>
            <p class="text-white/40 text-sm">{dept.subtitle}</p>
          </div>
          <div class="ml-auto flex gap-2 flex-wrap">
            {#each dept.tags.slice(0,3) as tag}
              <span class="mono text-[7px] uppercase tracking-widest border border-hd-gold/20 text-hd-gold/50 px-2 py-1">{tag}</span>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  {/if}

  <!-- Search + sort bar -->
  <div class="max-w-6xl mx-auto px-4 py-4 flex gap-3 items-center">
    <div class="flex-1 relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
      </svg>
      <input
        bind:value={searchQuery}
        on:input={() => loadProducts()}
        placeholder="Search collections..."
        class="w-full bg-white/[0.04] border border-white/[0.08] text-white pl-9 pr-4 py-2.5 text-sm placeholder-white/20 focus:border-hd-gold/50 focus:outline-none transition-colors"
      />
    </div>
    <select bind:value={sortBy} class="bg-white/[0.04] border border-white/[0.08] text-white/60 text-sm px-3 py-2.5 focus:outline-none focus:border-hd-gold/50 mono text-[9px] uppercase">
      <option value="newest" class="bg-[#050505]">Newest</option>
      <option value="price_asc" class="bg-[#050505]">Price ↑</option>
      <option value="price_desc" class="bg-[#050505]">Price ↓</option>
    </select>
  </div>

  <!-- Products grid -->
  <div class="max-w-6xl mx-auto px-4 pb-8">
    {#if loading}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each Array(8) as _}
          <div class="aspect-[3/4] bg-white/[0.04] animate-pulse"></div>
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each products as product, i (product.id)}
          <div class="group cursor-pointer" in:fly={{ y: 20, delay: i * 40, duration: 400 }}>
            <div
              class="relative aspect-[3/4] overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-hd-gold/30 transition-all"
              on:click={() => goto(`/product/${product.id}`)}
              role="button"
              tabindex="0"
              on:keydown={e => e.key === 'Enter' && goto(`/product/${product.id}`)}
            >
              <img
                src={product.images?.[0] ?? '/hd-logo.png'}
                alt={product.name}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <!-- Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <!-- Dept badge -->
              <div class="absolute top-2 left-2">
                <span class="mono text-[7px] uppercase tracking-widest bg-[#050505]/80 text-hd-gold/80 px-2 py-1">
                  {DEPARTMENTS.find(d => d.id === product.department)?.icon ?? '✦'}
                </span>
              </div>

              <!-- Quick add button (hover) -->
              <button
                on:click|stopPropagation={() => addToCart(product)}
                class="absolute bottom-3 left-3 right-3 bg-hd-gold text-black mono text-[8px] uppercase tracking-widest py-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 font-semibold"
              >
                Add to Cart
              </button>
            </div>
            <div class="pt-3 pb-1">
              <p class="text-white text-sm font-light leading-snug">{product.name}</p>
              <p class="text-hd-gold mono text-sm mt-1">₦{product.price?.toLocaleString()}</p>
              {#if product.sizes?.length}
                <div class="flex gap-1 mt-2 flex-wrap">
                  {#each product.sizes.slice(0,4) as size}
                    <span class="mono text-[7px] border border-white/10 text-white/40 px-1.5 py-0.5">{size}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      {#if products.length === 0}
        <div class="text-center py-24">
          <p class="font-serif text-2xl text-white/30 mb-3">No items found</p>
          <p class="text-white/20 text-sm">Try a different department or search term</p>
        </div>
      {/if}
    {/if}
  </div>
</div>
