<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import { initAuth, isAuthenticated } from '$lib/stores/auth';
  import { currentLanguage, isRTL, setLanguage } from '$lib/stores/language';
  import { processOfflineQueue } from '$lib/db/offline';
  import { supabase } from '$lib/supabase';
  import NavBar from '$lib/components/layout/NavBar.svelte';
  import BottomNav from '$lib/components/layout/BottomNav.svelte';
  import LeemaWidget from '$lib/components/leema/LeemaWidget.svelte';
  import SplashScreen from '$lib/components/layout/SplashScreen.svelte';
  import OfflineBanner from '$lib/components/layout/OfflineBanner.svelte';
  import PWAInstallPrompt from '$lib/components/layout/PWAInstallPrompt.svelte';

  let splashDone = false;
  let authReady  = false;
  let swUpdateReady = false;

  onMount(async () => {
    // Language
    const savedLang = localStorage.getItem('hd_lang') as any;
    if (savedLang) setLanguage(savedLang);

    // Auth
    await initAuth();
    authReady = true;

    // Offline sync
    window.addEventListener('online', () => processOfflineQueue(supabase));
    if (navigator.onLine) processOfflineQueue(supabase);

    // SW update banner
    window.addEventListener('hd-sw-update', () => swUpdateReady = true);
  });

  $: dir          = $isRTL ? 'rtl' : 'ltr';
  $: isAuthRoute  = $page.url.pathname.startsWith('/auth');
  $: isAdminRoute = $page.url.pathname.startsWith('/admin');
  $: hideChrome   = isAuthRoute || isAdminRoute;

  function reloadForUpdate() {
    window.location.reload();
  }
</script>

<svelte:head>
  <html lang={$currentLanguage} dir={dir} />
</svelte:head>

<div dir={dir} class="min-h-screen bg-[#050505] text-white flex flex-col">
  <!-- Offline banner -->
  <OfflineBanner />

  <!-- SW update toast -->
  {#if swUpdateReady}
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0d0d0d] border border-hd-gold/30 px-4 py-3 flex items-center gap-4 shadow-xl" in:fade>
      <span class="text-white/70 text-sm">New version available</span>
      <button on:click={reloadForUpdate} class="bg-hd-gold text-black mono text-[9px] uppercase tracking-widest px-4 py-1.5 font-bold hover:bg-hd-gold/90 transition-all">Update</button>
    </div>
  {/if}

  <!-- Splash -->
  {#if !splashDone}
    <SplashScreen on:done={() => (splashDone = true)} />
  {:else}
    <!-- Sticky header -->
    {#if !hideChrome}
      <NavBar />
    {/if}

    <!-- Main content -->
    <main
      class="flex-1 {hideChrome ? '' : 'pt-16 pb-20 md:pb-4'}"
      in:fade={{ duration: 200 }}
    >
      <slot />
    </main>

    <!-- Sticky bottom nav (mobile only) -->
    {#if !hideChrome}
      <BottomNav />
    {/if}

    <!-- Leema AI FAB -->
    {#if !hideChrome && $isAuthenticated}
      <LeemaWidget />
    {/if}

    <!-- PWA Install Prompt — shows on first visit -->
    <PWAInstallPrompt />
  {/if}
</div>
