<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { onMount, tick } from 'svelte';
  import { currentLanguage } from '$lib/stores/language';
  import { userProfile } from '$lib/stores/auth';
  import { page } from '$app/stores';

  // ── State ────────────────────────────────────────────────
  let open       = false;
  let messages: { role: 'user' | 'ai'; text: string; time: string }[] = [];
  let input      = '';
  let loading    = false;
  let chatEl: HTMLDivElement;

  // ── Context-aware quick suggestions ─────────────────────
  const SUGGESTIONS_MAP: Record<string, string[]> = {
    '/':           ['Show me new arrivals', 'What\'s on limited drop?', 'I need a wedding outfit'],
    '/shop':       ['Filter by Royal Heritage', 'Find me a kaftan under ₦100k', 'Show Kano textiles'],
    '/atelier':    ['How long does bespoke take?', 'What fabrics do you recommend?', 'Help me with measurements'],
    '/auction':    ['How does bidding work?', 'When is the next auction?', 'Set a bid alert for me'],
    '/marketplace':['Who are the top vendors?', 'Find Kano textile vendors', 'Show afro urban sellers'],
    '/drops':      ['When is the next drop?', 'Am I eligible for this drop?', 'Notify me of new drops'],
    '/heritage':   ['Tell me about Agbada', 'History of Aso-Oke', 'What is Adire fabric?'],
    '/profile':    ['Track my order', 'How do I earn more XP?', 'Redeem my LEE points'],
    '/cart':       ['Apply a discount code', 'Estimate delivery time', 'Is express shipping available?'],
    '/checkout':   ['What payment methods work?', 'Is OPay secure?', 'Track my delivery'],
  };

  const LANG_GREETINGS: Record<string, string> = {
    en: "Hello! I'm Leema, your House of Daraja style guide. Ask me anything — outfits, sizing, heritage, or orders. ✦",
    ha: "Sannu! Ni Leema ce, jagoran salon Daraja. Tambaya kowane abu — sutura, girma, ko al'ada.",
    yo: "Ẹ káàárọ̀! Mo jẹ Leema, itọsọna aṣọ Daraja. Beere ohunkohun — aṣọ, iwọn, tabi itan.",
    ig: "Ndewo! Abụ m Leema, onye nduzi akpụkpọ Daraja. Jụọ ihe ọ bụla — uwe, nha, ma ọ bụ ọdịnala.",
    fr: "Bonjour! Je suis Leema, votre guide style Daraja. Posez-moi n'importe quelle question.",
    ar: "مرحباً! أنا ليما، دليلك للأزياء في دار دراجا. اسألني أي شيء عن الأزياء أو التراث.",
  };

  onMount(() => {
    const greeting = LANG_GREETINGS[$currentLanguage] ?? LANG_GREETINGS['en'];
    messages = [{ role: 'ai', text: greeting, time: now() }];
  });

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  $: activePath = $page.url.pathname;
  $: suggestions = (() => {
    for (const [key, vals] of Object.entries(SUGGESTIONS_MAP)) {
      if (activePath === key || (key !== '/' && activePath.startsWith(key))) return vals;
    }
    return SUGGESTIONS_MAP['/'];
  })();

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    input = '';

    messages = [...messages, { role: 'user', text: msg, time: now() }];
    loading = true;
    await tick();
    scrollBottom();

    try {
      const res = await fetch('/api/leema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          language: $currentLanguage,
          context: activePath,
          tier: $userProfile?.prestige_tier ?? 'citizen',
        }),
      });
      const data = await res.json();
      messages = [...messages, { role: 'ai', text: data.reply ?? '...', time: now() }];
    } catch {
      messages = [...messages, { role: 'ai', text: 'I\'m having a moment — please try again. ✦', time: now() }];
    } finally {
      loading = false;
      await tick();
      scrollBottom();
    }
  }

  function scrollBottom() {
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }
</script>

<!-- ── FAB (Floating Action Button) ─────────────────────── -->
{#if !open}
  <button
    on:click={() => open = true}
    class="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full shadow-[0_8px_32px_rgba(197,160,89,0.3)] hover:shadow-[0_8px_40px_rgba(197,160,89,0.5)] transition-all hover:scale-110 active:scale-95 overflow-hidden border-2 border-hd-gold/40"
    aria-label="Open Leema AI"
    in:scale={{ duration: 300 }}
    out:scale={{ duration: 200 }}
  >
    <img src="/leema-icon.png" alt="Leema AI" class="w-full h-full object-cover" />
    <!-- Pulsing ring -->
    <div class="absolute inset-0 rounded-full border-2 border-hd-gold/30 animate-ping pointer-events-none"></div>
  </button>
{/if}

<!-- ── Chat panel ──────────────────────────────────────── -->
{#if open}
  <div
    class="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/[0.08]"
    style="height: 520px; max-height: calc(100vh - 10rem);"
    in:fly={{ y: 20, duration: 300 }}
    out:fly={{ y: 20, duration: 200 }}
  >
    <!-- Header -->
    <div class="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border-b border-white/[0.06] flex-shrink-0">
      <div class="relative w-9 h-9 rounded-full overflow-hidden border border-hd-gold/40 flex-shrink-0">
        <img src="/leema-icon.png" alt="Leema" class="w-full h-full object-cover" />
        <div class="absolute bottom-0.5 right-0.5 w-2 h-2 bg-green-400 rounded-full border border-[#0a0a0a]"></div>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-white text-sm font-medium leading-none">Leema</p>
        <p class="mono text-[8px] text-hd-gold/60 uppercase tracking-widest mt-0.5">Style AI · {$currentLanguage.toUpperCase()}</p>
      </div>
      <button
        on:click={() => open = false}
        class="text-white/30 hover:text-white transition-colors w-7 h-7 flex items-center justify-center"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Messages -->
    <div
      bind:this={chatEl}
      class="flex-1 overflow-y-auto bg-[#050505] px-4 py-4 space-y-3 scroll-smooth"
    >
      {#each messages as msg, i (i)}
        <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2" in:fly={{ y: 8, duration: 250 }}>
          {#if msg.role === 'ai'}
            <div class="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-1 border border-hd-gold/20">
              <img src="/leema-icon.png" alt="L" class="w-full h-full object-cover" />
            </div>
          {/if}
          <div class="max-w-[82%]">
            <div class="px-3 py-2.5 text-sm leading-relaxed {msg.role === 'user' ? 'bg-hd-gold text-black ml-auto' : 'bg-white/[0.06] text-white/90 border border-white/[0.06]'}">
              {msg.text}
            </div>
            <p class="mono text-[7px] text-white/20 mt-1 {msg.role === 'user' ? 'text-right' : ''}">{msg.time}</p>
          </div>
        </div>
      {/each}

      {#if loading}
        <div class="flex gap-2 items-start" in:fade>
          <div class="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-1 border border-hd-gold/20">
            <img src="/leema-icon.png" alt="L" class="w-full h-full object-cover" />
          </div>
          <div class="bg-white/[0.06] border border-white/[0.06] px-4 py-3 flex gap-1.5">
            {#each [0,1,2] as i}
              <div class="w-1.5 h-1.5 bg-hd-gold/60 rounded-full animate-bounce" style="animation-delay:{i*180}ms"></div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Quick suggestions -->
    <div class="flex-shrink-0 bg-[#050505] border-t border-white/[0.04] px-3 py-2 overflow-x-auto scrollbar-none">
      <div class="flex gap-2 w-max">
        {#each suggestions as s}
          <button
            on:click={() => sendMessage(s)}
            class="flex-shrink-0 mono text-[8px] uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-white/50 px-3 py-1.5 hover:border-hd-gold/30 hover:text-hd-gold/70 transition-all whitespace-nowrap"
          >{s}</button>
        {/each}
      </div>
    </div>

    <!-- Input -->
    <div class="flex-shrink-0 flex items-center gap-2 px-3 py-3 bg-[#0a0a0a] border-t border-white/[0.06]">
      <input
        bind:value={input}
        on:keydown={handleKey}
        placeholder="Ask Leema anything..."
        disabled={loading}
        class="flex-1 bg-white/[0.05] border border-white/[0.08] text-white text-sm px-3 py-2 focus:border-hd-gold/40 focus:outline-none placeholder-white/20 transition-colors disabled:opacity-50"
      />
      <button
        on:click={() => sendMessage()}
        disabled={!input.trim() || loading}
        class="w-9 h-9 bg-hd-gold text-black flex items-center justify-center hover:bg-hd-gold/90 transition-all disabled:opacity-40 flex-shrink-0"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </div>
  </div>
{/if}
