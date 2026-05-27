<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentLanguage } from '$lib/stores/language';
  import { isAuthenticated, userProfile } from '$lib/stores/auth';
  import { cart } from '$lib/stores/cart';

  // ── Data ──────────────────────────────────────────────────
  let latestProducts: any[] = [];
  let liveDrops: any[]      = [];
  let heritagePosts: any[]  = [];
  let liveAuctions: any[]   = [];
  let loading               = true;

  // ── Hero slider ───────────────────────────────────────────
  let slide = 0;
  const HERO_SLIDES = [
    { dept:'Royal Heritage',  tag:'👑', label:'Heritage Collection', sub:'Traditional dress rooted in sovereignty' },
    { dept:'Afro Urban',      tag:'⚡', label:'Street × Culture',    sub:'Modern African identity in motion' },
    { dept:'Accessories',     tag:'✦', label:'Artisan Accessories',  sub:'Shoes, bags & artisan phone covers' },
    { dept:'Kano Textiles',   tag:'🧵', label:'Kano Market',         sub:'Direct from master weavers in the North' },
  ];
  const HERO_IMGS = [
    'https://i.imgur.com/7QFYTZJ.png',
    'https://i.imgur.com/MA123T4.png',
    'https://i.imgur.com/S4l7lKP.png',
    'https://i.imgur.com/jNv9WE7.png',
  ];

  // ── 4 Departments ────────────────────────────────────────
  const DEPARTMENTS = [
    { id:'royal-heritage', label:'Royal Heritage', sub:'Traditional Dress & Cultural Couture', icon:'👑', gradient:'from-amber-900/40' },
    { id:'afro-urban',     label:'Afro Urban',     sub:'Modern African Street Culture',         icon:'⚡', gradient:'from-purple-900/30' },
    { id:'accessories',    label:'Accessories',    sub:'Shoes, Bags & Phone Covers',            icon:'✦', gradient:'from-rose-900/30' },
    { id:'kano-textiles',  label:'Kano Textiles',  sub:'Premium Fabrics from Kano Vendors',     icon:'🧵', gradient:'from-emerald-900/30' },
  ];

  // ── Quick actions ─────────────────────────────────────────
  const QUICK_ACTIONS = [
    { href:'/shop',        icon:'🛍️', label:'Browse Shop' },
    { href:'/atelier',     icon:'✦',  label:'Bespoke Atelier' },
    { href:'/drops',       icon:'💎', label:'Limited Drops' },
    { href:'/auction',     icon:'⚡', label:'Live Auction' },
    { href:'/marketplace', icon:'🏛️', label:'Marketplace' },
    { href:'/heritage',    icon:'📖', label:'Heritage' },
  ];

  const MOCK_PRODUCTS = [
    { id:'1', name:'Karama Kaftan',  price:120000, images:['https://i.imgur.com/7QFYTZJ.png'], department:'royal-heritage' },
    { id:'2', name:'Ekene Dashiki',  price:50000,  images:['https://i.imgur.com/MA123T4.png'], department:'royal-heritage' },
    { id:'3', name:'Adah Dress',     price:95000,  images:['https://i.imgur.com/S4l7lKP.png'], department:'afro-urban' },
    { id:'4', name:'Emeka Jacket',   price:75000,  images:['https://i.imgur.com/jNv9WE7.png'], department:'afro-urban' },
    { id:'5', name:'Libas Bag',      price:85000,  images:['https://i.imgur.com/2Xkwv9Y.png'], department:'accessories' },
    { id:'6', name:'Aso-Oke 5 Yds', price:28000,  images:['https://i.imgur.com/7QFYTZJ.png'], department:'kano-textiles' },
  ];

  let heroInterval: any;
  onMount(async () => {
    heroInterval = setInterval(() => slide = (slide + 1) % HERO_IMGS.length, 6000);
    const [{ data: prods }, { data: drops }, { data: posts }, { data: auctions }] = await Promise.all([
      supabase.from('products').select('id,name,price,images,department').eq('status','published').limit(6),
      supabase.from('drops').select('*').in('status',['live','active']).limit(2),
      supabase.from('heritage_posts').select('id,title,image_url,category').eq('is_published',true).limit(3),
      supabase.from('auctions').select('*').eq('status','live').limit(1),
    ]);
    latestProducts = prods?.length  ? prods   : MOCK_PRODUCTS;
    liveDrops      = drops  ?? [];
    heritagePosts  = posts  ?? [];
    liveAuctions   = auctions ?? [];
    loading        = false;
    return () => clearInterval(heroInterval);
  });
</script>

<svelte:head>
  <title>House of Daraja — Wear Your Worth</title>
</svelte:head>

<div class="min-h-screen bg-[#050505]">

  <!-- ── Hero Slider ──────────────────────────────────────── -->
  <section class="relative h-[92vh] md:h-screen overflow-hidden">
    {#key slide}
      <div class="absolute inset-0" in:fade={{ duration: 1200 }}>
        <img src={HERO_IMGS[slide]} alt="HD Heritage" class="w-full h-full object-cover scale-105" />
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#050505]"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-[#050505]/60 to-transparent"></div>
      </div>
    {/key}

    <!-- Hero content -->
    <div class="absolute inset-0 flex flex-col justify-end pb-20 px-6 md:px-12 max-w-5xl">
      {#key slide}
        <div in:fly={{ y: 20, duration: 600, delay: 200 }}>
          <span class="mono text-hd-gold/70 text-[9px] uppercase tracking-[0.5em] mb-3 block">
            {HERO_SLIDES[slide].tag} {HERO_SLIDES[slide].dept}
          </span>
          <h1 class="font-serif text-5xl md:text-7xl text-white font-light leading-tight mb-4">
            {HERO_SLIDES[slide].label}
          </h1>
          <p class="text-white/50 text-base mb-8 max-w-xs">{HERO_SLIDES[slide].sub}</p>
          <div class="flex gap-3">
            <a href="/shop?dept={HERO_SLIDES[slide].dept.toLowerCase().replace(' ','-')}"
              class="bg-hd-gold text-black mono text-[10px] uppercase tracking-widest px-7 py-3.5 font-semibold hover:bg-hd-gold/90 transition-all">
              Shop Now
            </a>
            <a href="/atelier" class="border border-white/30 text-white mono text-[10px] uppercase tracking-widest px-7 py-3.5 hover:border-hd-gold/50 transition-all backdrop-blur-sm">
              Bespoke →
            </a>
          </div>
        </div>
      {/key}
    </div>

    <!-- Slide dots -->
    <div class="absolute bottom-10 right-6 flex flex-col gap-2">
      {#each HERO_IMGS as _, i}
        <button
          on:click={() => slide = i}
          class="w-1 transition-all {i === slide ? 'h-6 bg-hd-gold' : 'h-2 bg-white/20 hover:bg-white/40'}"
        ></button>
      {/each}
    </div>
  </section>

  <!-- ── Quick Actions Row ──────────────────────────────── -->
  <section class="bg-[#050505] border-y border-white/[0.04] overflow-x-auto scrollbar-none">
    <div class="flex min-w-max md:min-w-0 md:grid md:grid-cols-6 divide-x divide-white/[0.04]">
      {#each QUICK_ACTIONS as qa}
        <a href={qa.href} class="flex flex-col items-center gap-2 px-6 py-5 hover:bg-white/[0.03] transition-all group">
          <span class="text-xl">{qa.icon}</span>
          <span class="mono text-[8px] uppercase tracking-widest text-white/30 group-hover:text-hd-gold/70 transition-colors whitespace-nowrap">{qa.label}</span>
        </a>
      {/each}
    </div>
  </section>

  <!-- ── 4 Department Showcases ────────────────────────── -->
  <section class="max-w-6xl mx-auto px-4 py-16">
    <div class="flex items-center gap-4 mb-10">
      <div class="h-px flex-1 bg-white/[0.06]"></div>
      <div class="text-center">
        <p class="mono text-hd-gold/50 text-[9px] uppercase tracking-[0.5em] mb-1">The House</p>
        <h2 class="font-serif text-3xl text-white font-light">Four Departments</h2>
      </div>
      <div class="h-px flex-1 bg-white/[0.06]"></div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each DEPARTMENTS as dept, i}
        <a
          href="/shop?dept={dept.id}"
          class="group relative aspect-[3/4] overflow-hidden border border-white/[0.06] hover:border-hd-gold/30 transition-all"
          in:fly={{ y: 20, delay: i * 80, duration: 400 }}
        >
          <div class="absolute inset-0 bg-gradient-to-b {dept.gradient} via-transparent to-[#050505]"></div>
          <div class="absolute inset-0 bg-[#050505]/30 group-hover:bg-[#050505]/10 transition-all"></div>
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <span class="text-2xl block mb-2">{dept.icon}</span>
            <h3 class="font-serif text-base text-white leading-snug mb-1">{dept.label}</h3>
            <p class="text-white/40 text-[10px] leading-snug">{dept.sub}</p>
            <span class="mono text-[8px] text-hd-gold/50 group-hover:text-hd-gold mt-3 block transition-colors uppercase tracking-wider">Explore →</span>
          </div>
        </a>
      {/each}
    </div>
  </section>

  <!-- ── Latest Arrivals ───────────────────────────────── -->
  <section class="max-w-6xl mx-auto px-4 py-8 pb-16">
    <div class="flex items-center justify-between mb-8">
      <h2 class="font-serif text-2xl text-white">Latest Arrivals</h2>
      <a href="/shop" class="mono text-[9px] text-hd-gold/50 hover:text-hd-gold uppercase tracking-widest transition-colors">View All →</a>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {#each latestProducts as p, i}
        <a href="/product/{p.id}" class="group" in:fly={{ y: 15, delay: i * 60 }}>
          <div class="aspect-[3/4] overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-hd-gold/20 transition-all mb-3">
            <img src={p.images?.[0] ?? '/hd-logo.png'} alt={p.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <p class="text-white/80 text-xs leading-snug truncate">{p.name}</p>
          <p class="text-hd-gold mono text-xs mt-1">₦{p.price?.toLocaleString()}</p>
        </a>
      {/each}
    </div>
  </section>

  <!-- ── Live Drop Banner ──────────────────────────────── -->
  {#if liveDrops.length > 0}
    <section class="max-w-6xl mx-auto px-4 pb-16">
      {#each liveDrops.slice(0,1) as drop}
      <div class="relative border border-hd-gold/20 overflow-hidden" in:fade>
        <div class="absolute inset-0 bg-gradient-to-r from-hd-gold/5 to-transparent pointer-events-none"></div>
        <div class="grid grid-cols-1 md:grid-cols-2">
          <div class="aspect-[16/9] md:aspect-auto overflow-hidden">
            <img src={drop.image} alt={drop.name} class="w-full h-full object-cover" />
          </div>
          <div class="p-8 flex flex-col justify-center">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
              <span class="mono text-[8px] uppercase tracking-widest text-red-400">Limited Drop</span>
            </div>
            <h2 class="font-serif text-3xl text-white mb-3">{drop.name}</h2>
            <p class="text-white/40 text-sm mb-4">{drop.description}</p>
            <p class="font-serif text-2xl text-hd-gold mb-6">₦{drop.price?.toLocaleString()}</p>
            <a href="/drops" class="bg-hd-gold text-black mono text-[10px] uppercase tracking-widest px-7 py-3.5 font-semibold hover:bg-hd-gold/90 transition-all inline-block text-center">
              Join the Drop
            </a>
          </div>
        </div>
      </div>
      {/each}
    </section>
  {/if}

  <!-- ── Heritage Teasers ───────────────────────────────── -->
  {#if heritagePosts.length > 0}
    <section class="max-w-6xl mx-auto px-4 pb-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="font-serif text-2xl text-white">Style Stories</h2>
        <a href="/heritage" class="mono text-[9px] text-hd-gold/50 hover:text-hd-gold uppercase tracking-widest transition-colors">Read All →</a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each heritagePosts as post, i}
          <a href="/heritage" class="group" in:fly={{ y: 10, delay: i * 80 }}>
            <div class="aspect-[16/10] overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-hd-gold/10 transition-all mb-3">
              <img src={post.image_url ?? '/hd-logo.png'} alt={post.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <span class="mono text-[7px] uppercase text-hd-gold/50 tracking-widest capitalize">{post.category}</span>
            <h3 class="font-serif text-base text-white mt-1 leading-snug group-hover:text-hd-gold/80 transition-colors">{post.title}</h3>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- ── Footer ─────────────────────────────────────────── -->
  <footer class="border-t border-white/[0.06] bg-[#050505] px-6 py-12">
    <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
      <div>
        <div class="flex items-center gap-2 mb-4">
          <img src="/hd-logo.png" alt="HD" class="w-8 h-8 object-contain" />
          <span class="font-serif italic text-white">House of Daraja</span>
        </div>
        <p class="text-white/30 text-xs leading-relaxed">Luxury African cultural commerce. Sovereign heritage for the modern era.</p>
      </div>
      {#each [
        { heading:'Shop', links:[['Shop All','/shop'],['Marketplace','/marketplace'],['Drops','/drops'],['Atelier','/atelier']] },
        { heading:'Explore', links:[['Heritage','/heritage'],['Auction','/auction'],['Media','/media'],['Rewards','/rewards']] },
        { heading:'Account', links:[['Sign In','/auth'],['My Orders','/orders'],['Profile','/profile'],['Wishlist','/wishlist']] },
      ] as col}
        <div>
          <p class="mono text-[9px] uppercase tracking-widest text-white/30 mb-3">{col.heading}</p>
          <div class="space-y-2">
            {#each col.links as [label, href]}
              <a {href} class="block text-white/40 text-sm hover:text-hd-gold transition-colors">{label}</a>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    <div class="border-t border-white/[0.04] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
      <p class="mono text-[8px] uppercase text-white/20 tracking-widest">© 2026 House of Daraja · All Rights Reserved</p>
      <p class="mono text-[8px] uppercase text-white/20 tracking-widest">Wear Your Worth ✦</p>
    </div>
  </footer>
</div>
