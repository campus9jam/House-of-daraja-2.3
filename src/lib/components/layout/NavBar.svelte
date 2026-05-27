<script lang="ts">
  import { page } from '$app/stores';
  import { isAuthenticated, userProfile } from '$lib/stores/auth';
  import { currentLanguage, setLanguage, t } from '$lib/stores/language';
  import { cartCount } from '$lib/stores/cart';
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

  const NAV_LINKS = [
    { href: '/shop',        label: 'Shop' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/drops',       label: 'Drops' },
    { href: '/atelier',     label: 'Atelier' },
    { href: '/heritage',    label: 'Heritage' },
    { href: '/auction',     label: 'Auction' },
  ];

  let menuOpen = false;
  $: activePath = $page.url.pathname;
  $: tierColor = TIER_COLORS[$userProfile?.prestige_tier ?? 'citizen'];
</script>

<nav class="fixed top-0 left-0 right-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.06]">
  <div class="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

    <!-- Logo -->
    <a href="/" class="flex items-center gap-3 group shrink-0">
      <img
        src="/hd-logo.png"
        alt="House of Daraja"
        class="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(197,160,89,0.4)] group-hover:drop-shadow-[0_0_16px_rgba(197,160,89,0.6)] transition-all"
      />
      <span class="font-serif italic text-white text-base hidden lg:block">House of Daraja</span>
    </a>

    <!-- Desktop Nav -->
    <div class="hidden md:flex items-center gap-6">
      {#each NAV_LINKS as link}
        <a
          href={link.href}
          class="mono text-[9px] uppercase tracking-widest transition-colors {activePath.startsWith(link.href) ? 'text-hd-gold' : 'text-white/40 hover:text-white'}"
        >
          {link.label}
        </a>
      {/each}
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-3">
      <!-- Language -->
      <select
        value={$currentLanguage}
        on:change={e => setLanguage(e.currentTarget.value as Language)}
        class="bg-transparent border border-white/10 text-white/50 mono text-[8px] px-2 py-1 focus:border-hd-gold outline-none cursor-pointer hover:text-white transition-all hidden sm:block"
      >
        {#each LANGS as lang}
          <option value={lang.code} class="bg-[#050505]">{lang.label}</option>
        {/each}
      </select>

      <!-- Cart -->
      <a href="/cart" class="relative text-white/50 hover:text-hd-gold transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm6.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        {#if $cartCount > 0}
          <span class="absolute -top-1.5 -right-1.5 bg-hd-gold text-black text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center mono">
            {$cartCount > 9 ? '9+' : $cartCount}
          </span>
        {/if}
      </a>

      <!-- Profile / Auth -->
      {#if $isAuthenticated}
        <a href="/profile" class="relative">
          {#if $userProfile?.avatar_url}
            <img src={$userProfile.avatar_url} alt="Profile" class="w-8 h-8 rounded-full object-cover border-2" style="border-color: {tierColor}" />
          {:else}
            <div class="w-8 h-8 rounded-full border-2 bg-hd-gold/10 flex items-center justify-center" style="border-color: {tierColor}">
              <span class="mono text-[8px] uppercase text-hd-gold">
                {$userProfile?.display_name?.charAt(0) ?? 'U'}
              </span>
            </div>
          {/if}
          <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-[#050505]"></div>
        </a>
      {:else}
        <a href="/auth" class="mono text-[9px] uppercase tracking-widest bg-hd-gold text-black px-4 py-2 hover:bg-hd-gold/90 transition-colors font-semibold">
          Sign In
        </a>
      {/if}

      <!-- Mobile menu toggle -->
      <button on:click={() => menuOpen = !menuOpen} class="md:hidden text-white/50 hover:text-white transition-colors ml-1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          {#if menuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          {/if}
        </svg>
      </button>
    </div>
  </div>

  <!-- Mobile menu -->
  {#if menuOpen}
    <div class="md:hidden bg-[#050505]/98 border-t border-white/[0.06] px-4 pb-4">
      {#each NAV_LINKS as link}
        <a
          href={link.href}
          on:click={() => menuOpen = false}
          class="flex items-center py-3 border-b border-white/[0.04] mono text-[10px] uppercase tracking-widest {activePath.startsWith(link.href) ? 'text-hd-gold' : 'text-white/50'}"
        >
          {link.label}
        </a>
      {/each}
      <div class="pt-3 flex items-center gap-2">
        <span class="mono text-[8px] text-white/30 uppercase tracking-widest">Language:</span>
        <select
          value={$currentLanguage}
          on:change={e => setLanguage(e.currentTarget.value as Language)}
          class="bg-transparent border border-white/10 text-white/50 mono text-[9px] px-2 py-1 outline-none"
        >
          {#each LANGS as lang}
            <option value={lang.code} class="bg-[#050505]">{lang.label}</option>
          {/each}
        </select>
      </div>
    </div>
  {/if}
</nav>
