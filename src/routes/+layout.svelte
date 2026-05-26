<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { initAuth, currentUser, userProfile, isAuthenticated } from '$lib/stores/auth';
  import { currentLanguage, isRTL, setLanguage } from '$lib/stores/language';
  import { processOfflineQueue } from '$lib/db/offline';
  import { supabase } from '$lib/supabase';
  import NavBar from '$lib/components/layout/NavBar.svelte';
  import BottomNav from '$lib/components/layout/BottomNav.svelte';
  import LeemaWidget from '$lib/components/leema/LeemaWidget.svelte';
  import SplashScreen from '$lib/components/layout/SplashScreen.svelte';
  import OfflineBanner from '$lib/components/layout/OfflineBanner.svelte';

  let splashDone = false;
  let authReady  = false;

  onMount(async () => {
    // Restore language preference
    const savedLang = localStorage.getItem('hd_lang') as any;
    if (savedLang) setLanguage(savedLang);

    // Init auth
    await initAuth();
    authReady = true;

    // Process any queued offline actions
    window.addEventListener('online', () => processOfflineQueue(supabase));
    if (navigator.onLine) processOfflineQueue(supabase);
  });

  $: dir = $isRTL ? 'rtl' : 'ltr';
  $: isAuthRoute = $page.url.pathname.startsWith('/auth');
  $: isAdminRoute = $page.url.pathname.startsWith('/admin');
</script>

<svelte:head>
  <html lang={$currentLanguage} dir={dir} />
</svelte:head>

{#if !splashDone}
  <SplashScreen on:done={() => (splashDone = true)} />
{:else}
  <div dir={dir} class="min-h-screen bg-hd-black text-white">
    <OfflineBanner />
    {#if !isAuthRoute}
      <NavBar />
    {/if}

    <main class="page-enter">
      <slot />
    </main>

    {#if !isAuthRoute && !isAdminRoute}
      <BottomNav />
      {#if $isAuthenticated}
        <LeemaWidget />
      {/if}
    {/if}
  </div>
{/if}
