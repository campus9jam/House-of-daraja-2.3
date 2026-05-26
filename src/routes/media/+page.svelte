<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentLanguage } from '$lib/stores/language';
  import type { MediaItem } from '$lib/types/database';
  import { cacheMediaItem, getCachedMedia } from '$lib/db/offline';

  let items: MediaItem[] = [];
  let filtered: MediaItem[] = [];
  let activeCategory = 'all';
  let loading = true;
  let searchQuery = '';

  const CATEGORIES = [
    { key: 'all',       label: 'All' },
    { key: 'dandali',   label: 'Dandali' },
    { key: 'zare_global', label: 'Zare Global' },
    { key: 'co_creators', label: "Co-Creators" },
    { key: 'heritage',  label: 'Heritage' },
    { key: 'fashion',   label: 'Fashion' },
  ];

  onMount(async () => {
    // Try cached first (offline)
    const cached = await getCachedMedia();
    if (cached.length > 0) {
      items = cached.map(c => c.data as MediaItem);
      filtered = items;
      loading = false;
    }

    // Fetch fresh from Supabase
    const { data } = await supabase
      .from('media_items')
      .select('*')
      .eq('status', 'approved')
      .order('published_at', { ascending: false })
      .limit(40);

    if (data) {
      items = data as MediaItem[];
      filtered = items;
      // Cache for offline
      for (const item of items) await cacheMediaItem(item.youtube_id, item as any);
    }
    loading = false;
  });

  function filterItems() {
    filtered = items.filter(item => {
      const catMatch = activeCategory === 'all' || item.category === activeCategory;
      const searchMatch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return catMatch && searchMatch;
    });
  }

  $: { activeCategory; searchQuery; if (items.length) filterItems(); }

  function getTitle(item: MediaItem) {
    const lang = $currentLanguage;
    if (lang !== 'en' && item.translations?.[lang]?.title) return item.translations[lang].title;
    return item.title;
  }

  function ytThumb(ytId: string) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  function ytUrl(ytId: string) {
    return `https://www.youtube.com/watch?v=${ytId}`;
  }
</script>

<svelte:head><title>HD Collective Media Network</title></svelte:head>

<!-- Hero -->
<section class="px-6 md:px-12 py-16 border-b border-white/5">
  <div class="max-w-7xl mx-auto">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-6 h-px bg-hd-gold" />
      <span class="mono text-hd-gold text-[9px] uppercase tracking-widest">HD COLLECTIVE MEDIA NETWORK</span>
    </div>
    <div class="grid md:grid-cols-12 gap-8 items-end">
      <div class="md:col-span-7">
        <h1 class="text-4xl md:text-6xl font-serif italic text-white">Cultural <span class="text-hd-gold not-italic">Archive</span></h1>
        <p class="font-serif italic text-white/50 text-lg mt-4">AI-enriched African cultural media. Multilingual. Editorially curated. Heritage-anchored.</p>
      </div>
      <!-- Search -->
      <div class="md:col-span-5">
        <div class="relative">
          <input
            bind:value={searchQuery}
            placeholder="Search the archive..."
            class="hd-input w-full pr-12"
          />
          <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Category tabs -->
    <div class="flex gap-2 mt-10 flex-wrap">
      {#each CATEGORIES as cat}
        <button
          on:click={() => (activeCategory = cat.key)}
          class="px-5 py-2 mono text-[9px] uppercase tracking-widest transition-all border {activeCategory === cat.key ? 'bg-hd-gold text-hd-black border-hd-gold' : 'border-white/10 text-white/40 hover:border-hd-gold/30 hover:text-white'}"
        >
          {cat.label}
        </button>
      {/each}
    </div>
  </div>
</section>

<!-- Grid -->
<section class="px-6 md:px-12 py-12">
  <div class="max-w-7xl mx-auto">
    {#if loading}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each Array(8) as _}
          <div class="aspect-video bg-hd-surface animate-pulse" />
        {/each}
      </div>
    {:else if filtered.length === 0}
      <div class="text-center py-24">
        <p class="font-serif italic text-white/40 text-xl">No media found in this category.</p>
        <p class="mono text-[9px] text-white/20 mt-2 uppercase">New content is added regularly from @HouseofDaraja</p>
      </div>
    {:else}
      <!-- Featured large item -->
      {#if filtered[0]}
        <a href={ytUrl(filtered[0].youtube_id)} target="_blank" rel="noopener" class="group block mb-8 hd-card-hover overflow-hidden" in:fly={{ y: 20, duration: 500 }}>
          <div class="grid md:grid-cols-12 gap-0">
            <div class="md:col-span-7 aspect-video overflow-hidden relative">
              <img
                src={filtered[0].thumbnail_url || ytThumb(filtered[0].youtube_id)}
                alt={getTitle(filtered[0])}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="w-16 h-16 bg-hd-gold/90 flex items-center justify-center rounded-full">
                  <svg class="w-6 h-6 text-hd-black fill-hd-black ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div class="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 px-3 py-1">
                <svg class="w-3 h-3 text-white fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <span class="mono text-white text-[8px] uppercase">YouTube</span>
              </div>
            </div>
            <div class="md:col-span-5 p-8 flex flex-col justify-center space-y-4">
              <span class="mono text-hd-gold text-[9px] uppercase tracking-widest">{filtered[0].category} · Featured</span>
              <h2 class="text-2xl md:text-3xl font-serif italic text-white leading-tight">{getTitle(filtered[0])}</h2>
              {#if filtered[0].ai_enrichment?.cultural_summary}
                <p class="font-serif italic text-white/60 leading-relaxed">{filtered[0].ai_enrichment.cultural_summary}</p>
              {/if}
              {#if filtered[0].tags?.length}
                <div class="flex flex-wrap gap-2 mt-2">
                  {#each filtered[0].tags.slice(0, 4) as tag}
                    <span class="mono text-[8px] border border-white/10 text-white/40 px-3 py-1">{tag}</span>
                  {/each}
                </div>
              {/if}
              <div class="flex items-center gap-4 pt-2">
                <span class="mono text-white/30 text-[9px]">{filtered[0].view_count.toLocaleString()} views</span>
                {#if filtered[0].ai_enrichment?.emotional_tone}
                  <span class="mono text-[8px] bg-hd-gold/10 text-hd-gold px-3 py-1">{filtered[0].ai_enrichment.emotional_tone}</span>
                {/if}
              </div>
            </div>
          </div>
        </a>
      {/if}

      <!-- Grid of remaining -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each filtered.slice(1) as item, i}
          <a
            href={ytUrl(item.youtube_id)}
            target="_blank" rel="noopener"
            class="hd-card-hover overflow-hidden group block"
            in:fly={{ y: 20, duration: 400, delay: i * 50 }}
          >
            <div class="aspect-video overflow-hidden relative">
              <img
                src={item.thumbnail_url || ytThumb(item.youtube_id)}
                alt={getTitle(item)}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="w-10 h-10 bg-hd-gold/90 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-hd-black fill-hd-black ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              {#if item.ai_enrichment?.emotional_tone}
                <div class="absolute bottom-2 right-2 bg-hd-black/70 px-2 py-0.5">
                  <span class="mono text-[7px] text-hd-gold uppercase">{item.ai_enrichment.emotional_tone}</span>
                </div>
              {/if}
            </div>
            <div class="p-4 space-y-2">
              <p class="mono text-hd-gold text-[7px] uppercase">{item.category}</p>
              <h3 class="font-serif italic text-white text-sm leading-tight line-clamp-2">{getTitle(item)}</h3>
              <div class="flex items-center justify-between">
                <span class="mono text-white/30 text-[8px]">{item.view_count.toLocaleString()} views</span>
                {#if item.tags?.length}
                  <span class="mono text-[7px] text-white/20 truncate max-w-[100px]">{item.tags[0]}</span>
                {/if}
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</section>

<!-- Footer: source attribution -->
<div class="px-6 md:px-12 py-8 border-t border-white/5 text-center">
  <p class="mono text-[8px] text-white/20 uppercase tracking-widest">Content sourced from <a href="https://www.youtube.com/@HouseofDaraja" target="_blank" class="text-hd-gold hover:underline">@HouseofDaraja</a> · AI-enriched by Leema · Editorial approval required</p>
</div>
