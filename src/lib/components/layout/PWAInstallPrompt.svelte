<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';

  // ── State ──────────────────────────────────────────────────
  let deferredPrompt: any = null;
  let showBanner         = false;
  let showIOSGuide       = false;
  let installed          = false;
  let dismissed          = false;
  let platform: 'android' | 'ios' | 'desktop' | 'unknown' = 'unknown';

  // ── Detect platform ─────────────────────────────────────────
  function detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua))               return 'ios';
    if (/android/.test(ua))                         return 'android';
    if (/windows|macintosh|linux/.test(ua))         return 'desktop';
    return 'unknown';
  }

  // ── Check if already installed ─────────────────────────────
  function isInstalled() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  onMount(() => {
    // Already installed as PWA — don't show anything
    if (isInstalled()) { installed = true; return; }

    // Already dismissed in this session
    const dismissedAt = localStorage.getItem('hd_pwa_dismissed');
    if (dismissedAt) {
      const age = Date.now() - parseInt(dismissedAt);
      if (age < 1000 * 60 * 60 * 24 * 3) { dismissed = true; return; } // 3 days
    }

    platform = detectPlatform();

    // Android / Desktop Chrome — listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      // Short delay so user settles on the page first
      setTimeout(() => { showBanner = true; }, 3500);
    });

    // iOS — can't auto-prompt, show manual guide
    if (platform === 'ios') {
      const ios_dismissed = localStorage.getItem('hd_ios_pwa_dismissed');
      if (!ios_dismissed) {
        setTimeout(() => { showBanner = true; }, 3500);
      }
    }

    // appinstalled event
    window.addEventListener('appinstalled', () => {
      showBanner    = false;
      showIOSGuide  = false;
      installed     = true;
      deferredPrompt = null;
    });
  });

  async function install() {
    if (platform === 'ios') {
      showIOSGuide = true;
      showBanner   = false;
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === 'accepted') {
      showBanner = false;
    } else {
      dismiss();
    }
  }

  function dismiss() {
    showBanner   = false;
    showIOSGuide = false;
    dismissed    = true;
    localStorage.setItem('hd_pwa_dismissed', String(Date.now()));
  }

  const PLATFORM_LABELS: Record<string, string> = {
    android: 'Add to Home Screen',
    ios:     'Add to Home Screen',
    desktop: 'Install App',
    unknown: 'Install App',
  };
</script>

<!-- ── Install Banner (Android / Desktop) ────────────────── -->
{#if showBanner && !dismissed && !installed && platform !== 'ios'}
  <div
    class="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[60]"
    in:fly={{ y: 40, duration: 500 }}
    out:fly={{ y: 40, duration: 300 }}
  >
    <div class="bg-[#0d0d0d] border border-hd-gold/25 shadow-[0_8px_40px_rgba(0,0,0,0.8)] overflow-hidden">
      <!-- Gold shimmer line -->
      <div class="h-0.5 w-full bg-gradient-to-r from-transparent via-hd-gold to-transparent"></div>

      <div class="p-4 flex gap-4 items-start">
        <!-- App icon -->
        <div class="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border border-hd-gold/20 shadow-lg">
          <img src="/hd-logo.png" alt="House of Daraja" class="w-full h-full object-cover" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-white font-medium text-sm leading-tight">House of Daraja</p>
              <p class="mono text-[8px] uppercase tracking-widest text-hd-gold/60 mt-0.5">Install for native experience</p>
            </div>
            <button
              on:click={dismiss}
              class="text-white/20 hover:text-white/50 transition-colors flex-shrink-0 mt-0.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <p class="text-white/40 text-xs mt-2 leading-relaxed">
            Get the full app experience — faster load, offline access, and home screen shortcut.
          </p>

          <!-- Benefit pills -->
          <div class="flex gap-1.5 mt-3 flex-wrap">
            {#each ['⚡ Faster','📡 Works Offline','🔔 Notifications','💎 Full Screen'] as pill}
              <span class="mono text-[7px] uppercase tracking-wider bg-white/[0.05] border border-white/[0.08] text-white/40 px-2 py-0.5">{pill}</span>
            {/each}
          </div>

          <!-- CTA -->
          <div class="flex gap-2 mt-4">
            <button
              on:click={install}
              class="flex-1 bg-hd-gold text-black mono text-[9px] uppercase tracking-widest py-2.5 font-bold hover:bg-hd-gold/90 transition-all"
            >
              {PLATFORM_LABELS[platform]}
            </button>
            <button
              on:click={dismiss}
              class="px-4 border border-white/10 text-white/30 mono text-[9px] uppercase hover:border-white/20 transition-all"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- ── iOS Install Banner ─────────────────────────────────── -->
{#if showBanner && platform === 'ios' && !dismissed && !installed}
  <div
    class="fixed bottom-24 left-4 right-4 z-[60]"
    in:fly={{ y: 40, duration: 500 }}
    out:fly={{ y: 40, duration: 300 }}
  >
    <div class="bg-[#0d0d0d] border border-hd-gold/25 shadow-[0_8px_40px_rgba(0,0,0,0.8)] overflow-hidden">
      <div class="h-0.5 w-full bg-gradient-to-r from-transparent via-hd-gold to-transparent"></div>

      <div class="p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl overflow-hidden border border-hd-gold/20">
            <img src="/hd-logo.png" alt="HD" class="w-full h-full object-cover" />
          </div>
          <div>
            <p class="text-white text-sm font-medium">Add to Home Screen</p>
            <p class="mono text-[8px] text-hd-gold/50 uppercase tracking-wider">House of Daraja</p>
          </div>
          <button on:click={dismiss} class="ml-auto text-white/20 hover:text-white/50 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="space-y-2 text-sm text-white/50">
          <div class="flex items-center gap-3 bg-white/[0.03] p-2.5 border border-white/[0.06]">
            <span class="text-lg">1️⃣</span>
            <span>Tap the <strong class="text-white/70">Share</strong> button <span class="text-hd-gold">⎙</span> at the bottom of Safari</span>
          </div>
          <div class="flex items-center gap-3 bg-white/[0.03] p-2.5 border border-white/[0.06]">
            <span class="text-lg">2️⃣</span>
            <span>Scroll down and tap <strong class="text-white/70">"Add to Home Screen"</strong></span>
          </div>
          <div class="flex items-center gap-3 bg-white/[0.03] p-2.5 border border-white/[0.06]">
            <span class="text-lg">3️⃣</span>
            <span>Tap <strong class="text-white/70">"Add"</strong> to install House of Daraja</span>
          </div>
        </div>

        <button
          on:click={dismiss}
          class="w-full mt-4 border border-white/10 text-white/40 mono text-[9px] uppercase tracking-widest py-2.5 hover:border-hd-gold/20 transition-all"
        >
          Got It
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ── iOS Manual Guide Modal ────────────────────────────── -->
{#if showIOSGuide}
  <div class="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4" in:fade>
    <div class="w-full max-w-sm bg-[#0d0d0d] border border-hd-gold/20 overflow-hidden" in:fly={{ y: 60, duration: 400 }}>
      <div class="h-0.5 bg-gradient-to-r from-transparent via-hd-gold to-transparent"></div>
      <div class="p-6">
        <div class="flex items-center gap-3 mb-5">
          <img src="/hd-logo.png" alt="HD" class="w-10 h-10 rounded-xl border border-hd-gold/20 object-cover" />
          <div>
            <h3 class="font-serif text-lg text-white">Install on iPhone</h3>
            <p class="mono text-[8px] text-hd-gold/50 uppercase tracking-wider">3 easy steps</p>
          </div>
        </div>
        <div class="space-y-3 mb-6">
          {#each [
            ['⎙', 'Tap Share', 'Bottom bar in Safari'],
            ['＋', 'Add to Home Screen', 'Scroll in the share sheet'],
            ['✓', 'Tap Add', 'Confirm the install'],
          ] as [icon, title, sub]}
            <div class="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] p-3">
              <div class="w-9 h-9 bg-hd-gold/10 border border-hd-gold/20 flex items-center justify-center text-hd-gold font-bold">{icon}</div>
              <div>
                <p class="text-white text-sm">{title}</p>
                <p class="text-white/30 text-xs">{sub}</p>
              </div>
            </div>
          {/each}
        </div>
        <button
          on:click={() => { showIOSGuide = false; dismiss(); }}
          class="w-full bg-hd-gold text-black mono text-[10px] uppercase tracking-widest py-3 font-bold hover:bg-hd-gold/90 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  </div>
{/if}
