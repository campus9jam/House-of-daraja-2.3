<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';

  const DEPT_FILTERS = [
    { id: 'all', label: 'All Vendors', icon: '✦' },
    { id: 'royal-heritage', label: 'Royal Heritage', icon: '👑' },
    { id: 'afro-urban', label: 'Afro Urban', icon: '⚡' },
    { id: 'accessories', label: 'Accessories', icon: '👜' },
    { id: 'kano-textiles', label: 'Kano Textiles', icon: '🧵' },
  ];

  let vendors: any[] = [];
  let featuredProducts: any[] = [];
  let loading = true;
  let activeDept = 'all';

  // Mock vendors for display
  const MOCK_VENDORS = [
    { id:'v1', store_name:'Kano Textiles Exclusive', department:'kano-textiles', location:'Kano, Nigeria', rating:4.9, products_count:42, logo_url:'https://i.imgur.com/7QFYTZJ.png', description:'Premium fabrics direct from Kano weavers', is_verified:true },
    { id:'v2', store_name:'Ekene Heritage Studio', department:'royal-heritage', location:'Lagos, Nigeria', rating:4.8, products_count:28, logo_url:'https://i.imgur.com/MA123T4.png', description:'Hand-crafted traditional attire', is_verified:true },
    { id:'v3', store_name:'Adah Urban Collective', department:'afro-urban', location:'Abuja, Nigeria', rating:4.7, products_count:35, logo_url:'https://i.imgur.com/S4l7lKP.png', description:'Contemporary African street fashion', is_verified:false },
    { id:'v4', store_name:'Libas Accessories House', department:'accessories', location:'Port Harcourt, Nigeria', rating:4.9, products_count:19, logo_url:'https://i.imgur.com/jNv9WE7.png', description:'Artisan bags, shoes, and accessories', is_verified:true },
    { id:'v5', store_name:'Aso-Oke Masters', department:'kano-textiles', location:'Ibadan, Nigeria', rating:4.6, products_count:55, logo_url:'https://i.imgur.com/2Xkwv9Y.png', description:'Authentic Yoruba aso-oke collections', is_verified:true },
    { id:'v6', store_name:'Babariga Palace', department:'royal-heritage', location:'Kano, Nigeria', rating:5.0, products_count:12, logo_url:'https://i.imgur.com/7QFYTZJ.png', description:'Exclusively curated Hausa royal wear', is_verified:true },
  ];

  const FEATURED_PRODUCTS = [
    { id:'p1', name:'Kano Textiles Exclusive', price:28000, images:['https://i.imgur.com/7QFYTZJ.png'], department:'kano-textiles', vendor:'Kano Textiles' },
    { id:'p2', name:'Ekene Dashiki', price:50000, images:['https://i.imgur.com/MA123T4.png'], department:'royal-heritage', vendor:'Ekene Studio' },
    { id:'p3', name:'Libas Bag', price:85000, images:['https://i.imgur.com/S4l7lKP.png'], department:'accessories', vendor:'Libas House' },
  ];

  onMount(async () => {
    const { data: v } = await supabase.from('vendor_profiles').select('*').eq('status', 'active').limit(12);
    vendors = v?.length ? v : MOCK_VENDORS;
    const { data: p } = await supabase.from('products').select('*').eq('status', 'published').limit(6);
    featuredProducts = p?.length ? p : FEATURED_PRODUCTS;
    loading = false;
  });

  $: filteredVendors = activeDept === 'all' ? vendors : vendors.filter(v => v.department === activeDept);
</script>

<svelte:head><title>Marketplace — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505]">
  <!-- Hero -->
  <div class="relative border-b border-white/[0.04] py-14 px-4 bg-gradient-to-b from-hd-gold/5 to-transparent">
    <div class="max-w-5xl mx-auto text-center">
      <p class="mono text-hd-gold/50 text-[9px] uppercase tracking-[0.5em] mb-3">The Marketplace</p>
      <h1 class="font-serif text-4xl md:text-5xl text-white font-light mb-4">Curated Vendor Studios</h1>
      <p class="text-white/40 text-sm max-w-sm mx-auto">Shop directly from Nigeria's finest artisans and textile merchants</p>
    </div>
  </div>

  <!-- Dept filter -->
  <div class="sticky top-16 z-30 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.04]">
    <div class="max-w-5xl mx-auto px-4">
      <div class="flex overflow-x-auto scrollbar-none">
        {#each DEPT_FILTERS as f}
          <button
            on:click={() => activeDept = f.id}
            class="flex-shrink-0 px-5 py-4 mono text-[9px] uppercase tracking-widest border-b-2 transition-all whitespace-nowrap {activeDept === f.id ? 'border-hd-gold text-hd-gold' : 'border-transparent text-white/30 hover:text-white/60'}"
          >{f.icon} {f.label}</button>
        {/each}
      </div>
    </div>
  </div>

  <div class="max-w-5xl mx-auto px-4 py-10">
    <!-- Featured products strip -->
    {#if featuredProducts.length > 0}
      <div class="mb-12">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-serif text-xl text-white">Featured This Week</h2>
          <a href="/shop" class="mono text-[9px] text-hd-gold/60 hover:text-hd-gold uppercase tracking-widest transition-colors">View All →</a>
        </div>
        <div class="grid grid-cols-3 gap-3">
          {#each featuredProducts as p}
            <a href="/product/{p.id}" class="group">
              <div class="aspect-[3/4] overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-hd-gold/20 transition-all">
                <img src={p.images?.[0]} alt={p.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p class="text-white/70 text-sm mt-2 leading-snug truncate">{p.name}</p>
              <p class="text-hd-gold mono text-sm">₦{p.price?.toLocaleString()}</p>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Vendors grid -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-serif text-2xl text-white">
        {activeDept === 'all' ? 'All Vendors' : DEPT_FILTERS.find(d=>d.id===activeDept)?.label}
        <span class="font-sans text-base text-white/30 ml-2 font-light">{filteredVendors.length}</span>
      </h2>
    </div>

    {#if loading}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each Array(4) as _}<div class="h-36 bg-white/[0.04] animate-pulse"></div>{/each}
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each filteredVendors as vendor, i (vendor.id)}
          <div
            class="group flex gap-4 bg-white/[0.02] border border-white/[0.06] p-5 hover:border-hd-gold/20 transition-all cursor-pointer"
            in:fly={{ y: 10, delay: i * 60, duration: 350 }}
            on:click={() => goto(`/shop?vendor=${vendor.id}`)}
            role="button" tabindex="0"
            on:keydown={e => e.key === 'Enter' && goto(`/shop?vendor=${vendor.id}`)}
          >
            <div class="w-16 h-16 flex-shrink-0 overflow-hidden bg-white/[0.04] border border-white/[0.08]">
              <img src={vendor.logo_url ?? '/hd-logo.png'} alt={vendor.store_name} class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-white font-light leading-snug">{vendor.store_name}</h3>
                {#if vendor.is_verified}
                  <span class="text-hd-gold text-xs flex-shrink-0" title="Verified">✦</span>
                {/if}
              </div>
              <p class="text-white/30 text-xs mt-1 leading-snug line-clamp-2">{vendor.description}</p>
              <div class="flex items-center gap-3 mt-2">
                <span class="mono text-[8px] text-white/30 uppercase">{vendor.location}</span>
                <span class="mono text-[8px] text-hd-gold/50">{vendor.products_count} items</span>
                <span class="mono text-[8px] text-white/30">★ {vendor.rating?.toFixed(1)}</span>
              </div>
            </div>
            <div class="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-4 h-4 text-hd-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </div>
        {/each}
      </div>
      {#if filteredVendors.length === 0}
        <div class="text-center py-20">
          <p class="font-serif text-2xl text-white/30">No vendors in this category yet</p>
          <a href="/auth" class="mono text-[9px] text-hd-gold/50 hover:text-hd-gold mt-4 block">Become a Vendor →</a>
        </div>
      {/if}
    {/if}
  </div>
</div>
