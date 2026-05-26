<script lang="ts">
  import { page } from '$app/stores';
  import { isAuthenticated, userProfile } from '$lib/stores/auth';
  import { currentLanguage, setLanguage, t } from '$lib/stores/language';
  import type { Language } from '$lib/types/database';

  const LANGS: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' }, { code: 'ha', label: 'HA' },
    { code: 'yo', label: 'YO' }, { code: 'ig', label: 'IG' },
    { code: 'fr', label: 'FR' }, { code: 'ar', label: 'AR' },
  ];

  const TIER_COLORS: Record<string, string> = {
    citizen: '#FFFFFF', patron: '#F59E0B', curator: '#C5A059',
    vanguard: '#A855F7', elite: '#C5A059',
  };

  let menuOpen = false;
  $: activePath = $page.url.pathname;
  $: tierColor = TIER_COLORS[$userProfile?.prestige_tier ?? 'citizen'];
</script>

<nav class="fixed top-0 left-0 right-0 z-40 bg-hd-black/90 backdrop-blur-xl border-b border-white/[0.06]">
  <div class="max-w-[1600px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-3 group">
      <div class="w-9 h-9 bg-hd-gold flex items-center justify-center relative">
        <span class="font-serif font-bold text-hd-black text-sm">HD</span>
        <div class="absolute inset-0 border border-hd-gold animate-ping opacity-20" />
      </div>
      <span class="font-serif italic text-white text-base hidden md:block">House of Daraja</span>
    </a>

    <!-- Desktop Nav Links -->
    <div class="hidden md:flex items-center gap-8">
      {#each [
        { href: '/atelier', key: 'nav.atelier' },
        { href: '/auction', key: 'nav.auction' },
        { href: '/media',   key: 'nav.media' },
        { href: '/vault',   key: 'nav.vault' },
      ] as link}
        <a
          href={link.href}
          class="mono text-[10px] uppercase tracking-widest transition-colors {activePath.startsWith(link.href) ? 'text-hd-gold' : 'text-white/50 hover:text-white'}"
        >
          {t(link.key, $currentLanguage)}
        </a>
      {/each}
    </div>

    <!-- Right: lang + profile -->
    <div class="flex items-center gap-4">
      <!-- Language picker -->
      <select
        value={$currentLanguage}
        on:change={e => setLanguage(e.currentTarget.value as Language)}
        class="bg-transparent border border-white/10 text-white/50 mono text-[9px] px-2 py-1 focus:border-hd-gold outline-none cursor-pointer hover:text-white transition-colors"
      >
        {#each LANGS as lang}
          <option value={lang.code} class="bg-hd-black">{lang.label}</option>
        {/each}
      </select>

      {#if $isAuthenticated && $userProfile}
        <a href="/profile" class="flex items-center gap-2 group">
          <div
            class="w-8 h-8 rounded-full overflow-hidden border-2 transition-all"
            style="border-color: {tierColor}"
          >
            {#if $userProfile.avatar_url}
              <img src={$userProfile.avatar_url} alt="" class="w-full h-full object-cover" />
            {:else}
              <div class="w-full h-full bg-hd-gold/20 flex items-center justify-center">
                <span class="font-serif text-hd-gold font-bold text-xs">{$userProfile.username[0].toUpperCase()}</span>
              </div>
            {/if}
          </div>
          <div class="hidden md:block">
            <p class="mono text-[8px] text-white/40 uppercase">{$userProfile.prestige_tier}</p>
            <p class="mono text-[10px] text-white">{$userProfile.username}</p>
          </div>
        </a>
      {:else}
        <a href="/auth" class="hd-btn-primary text-[9px] py-2 px-5">ENTER</a>
      {/if}

      <!-- Mobile menu toggle -->
      <button class="md:hidden p-2 text-white/60 hover:text-white" on:click={() => (menuOpen = !menuOpen)}>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if menuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          {/if}
        </svg>
      </button>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if menuOpen}
    <div class="md:hidden bg-hd-surface border-t border-white/5 px-6 py-6 space-y-4">
      {#each [
        { href: '/',        label: 'Home' },
        { href: '/atelier', label: 'Atelier' },
        { href: '/auction', label: 'Auction' },
        { href: '/media',   label: 'Media' },
        { href: '/vault',   label: 'Vault' },
        { href: '/profile', label: 'Profile' },
      ] as link}
        <a
          href={link.href}
          class="block mono text-[11px] uppercase tracking-widest py-2 border-b border-white/5 {activePath === link.href ? 'text-hd-gold' : 'text-white/60'}"
          on:click={() => (menuOpen = false)}
        >
          {link.label}
        </a>
      {/each}
    </div>
  {/if}
</nav>

<!-- Spacer -->
<div class="h-16" />
