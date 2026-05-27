<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';

  let posts: any[]  = [];
  let loading       = true;
  let activeCategory = 'all';

  const CATEGORIES = ['all','tradition','fabric','artisan','history','style'];

  const MOCK_POSTS = [
    { id:'h1', title:'The Agbada: Power Draped in Yards', category:'tradition', image_url:'https://i.imgur.com/7QFYTZJ.png', author_name:'Daraja Editorial', views_count:1240, content:'The Agbada is more than fabric — it is a declaration. Worn by kings, politicians, and fathers at naming ceremonies, it speaks before the wearer does...', tags:['agbada','hausa','tradition'], is_published:true },
    { id:'h2', title:'Aso-Oke: The Language of Ceremony', category:'fabric', image_url:'https://i.imgur.com/MA123T4.png', author_name:'Fatima Raji', views_count:890, content:"Aso-oke, Yoruba for 'top cloth,' is handwoven on a traditional loom in strips typically 4 inches wide. Its weight tells the story of hours...", tags:['aso-oke','yoruba','fabric'], is_published:true },
    { id:'h3', title:'Adire: Tie-Dye as Cultural Memory', category:'fabric', image_url:'https://i.imgur.com/S4l7lKP.png', author_name:'Chioma Obi', views_count:674, content:'Adire fabric originated with the Yoruba people of southwestern Nigeria. The word means "tie and dye" — and each pattern carries meaning...', tags:['adire','igbo','heritage'], is_published:true },
    { id:'h4', title:'Master Weavers of Kano', category:'artisan', image_url:'https://i.imgur.com/jNv9WE7.png', author_name:'Aminu Suleiman', views_count:445, content:'Walk through the old city of Kano and you will hear the rhythmic clacking of the treadle loom long before you see the weaver...', tags:['kano','weavers','artisan'], is_published:true },
  ];

  onMount(async () => {
    const { data } = await supabase.from('heritage_posts').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(20);
    posts = data?.length ? data : MOCK_POSTS;
    loading = false;
  });

  $: filteredPosts = activeCategory === 'all' ? posts : posts.filter(p => p.category === activeCategory);
</script>

<svelte:head><title>Heritage — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505]">
  <!-- Hero -->
  <div class="relative border-b border-white/[0.04] py-16 px-4 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-amber-900/10 to-transparent"></div>
    <div class="max-w-3xl mx-auto text-center relative z-10">
      <p class="mono text-hd-gold/50 text-[9px] uppercase tracking-[0.5em] mb-4">Cultural Archive</p>
      <h1 class="font-serif text-5xl text-white font-light mb-4">HD Heritage</h1>
      <p class="text-white/40 leading-relaxed max-w-md mx-auto">Stories behind the fabric. History woven into every thread. Explore the cultural narratives that define African fashion.</p>
    </div>
  </div>

  <!-- Category filter -->
  <div class="sticky top-16 z-30 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.04]">
    <div class="max-w-5xl mx-auto px-4">
      <div class="flex overflow-x-auto scrollbar-none gap-0">
        {#each CATEGORIES as cat}
          <button
            on:click={() => activeCategory = cat}
            class="flex-shrink-0 px-5 py-4 mono text-[9px] uppercase tracking-widest border-b-2 transition-all capitalize {activeCategory === cat ? 'border-hd-gold text-hd-gold' : 'border-transparent text-white/30 hover:text-white/60'}"
          >{cat}</button>
        {/each}
      </div>
    </div>
  </div>

  <div class="max-w-5xl mx-auto px-4 py-10">
    {#if loading}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each Array(4) as _}<div class="h-72 bg-white/[0.03] animate-pulse"></div>{/each}
      </div>
    {:else}
      <!-- Featured post -->
      {#if filteredPosts[0]}
        <a href="#post-{filteredPosts[0].id}" class="group block mb-10" in:fade>
          <div class="relative aspect-[16/7] overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-hd-gold/20 transition-all">
            <img src={filteredPosts[0].image_url} alt={filteredPosts[0].title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <span class="mono text-[8px] uppercase tracking-widest text-hd-gold/70 border border-hd-gold/30 px-2 py-1 mb-3 inline-block capitalize">{filteredPosts[0].category}</span>
              <h2 class="font-serif text-3xl text-white mb-2 group-hover:text-hd-gold/90 transition-colors">{filteredPosts[0].title}</h2>
              <p class="text-white/50 text-sm leading-relaxed line-clamp-2 max-w-2xl">{filteredPosts[0].content}</p>
              <div class="flex items-center gap-4 mt-4">
                <span class="text-white/30 text-xs">{filteredPosts[0].author_name}</span>
                <span class="text-white/20 text-xs">·</span>
                <span class="text-white/30 text-xs mono">{filteredPosts[0].views_count?.toLocaleString()} reads</span>
              </div>
            </div>
          </div>
        </a>
      {/if}

      <!-- Post grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredPosts.slice(1) as post, i (post.id)}
          <article class="group cursor-pointer" in:fly={{ y: 15, delay: i * 60, duration: 350 }} id="post-{post.id}">
            <div class="aspect-[4/3] overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-hd-gold/20 transition-all mb-4">
              <img src={post.image_url ?? '/hd-logo.png'} alt={post.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <span class="mono text-[8px] uppercase tracking-widest text-hd-gold/50 capitalize">{post.category}</span>
            <h3 class="font-serif text-lg text-white mt-1 mb-2 leading-snug group-hover:text-hd-gold/80 transition-colors">{post.title}</h3>
            <p class="text-white/30 text-sm leading-relaxed line-clamp-3">{post.content}</p>
            <div class="flex items-center gap-3 mt-3">
              <span class="text-white/20 text-xs">{post.author_name}</span>
              <span class="mono text-[8px] text-white/20">{post.views_count?.toLocaleString()} reads</span>
            </div>
          </article>
        {/each}
      </div>
      {#if filteredPosts.length === 0}
        <div class="text-center py-20">
          <p class="font-serif text-2xl text-white/20">No stories in this category yet</p>
        </div>
      {/if}
    {/if}
  </div>
</div>
