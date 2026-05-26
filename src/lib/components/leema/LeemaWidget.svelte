<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { currentLanguage } from '$lib/stores/language';
  import { leemaChat, type LeemaContext } from '$lib/services/leema';
  import type { LeemaMessage } from '$lib/types/database';

  let open = false;
  let input = '';
  let context: LeemaContext = 'general';
  let loading = false;
  let messages: LeemaMessage[] = [
    {
      role: 'assistant',
      content: 'Assalamu Alaikum. I am Leema — your cultural intelligence guide. Ask me anything about Heritage, Atelier, or the Archive.',
      language: 'en',
      timestamp: new Date().toISOString(),
    }
  ];

  let container: HTMLElement;

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: LeemaMessage = { role: 'user', content: input, language: $currentLanguage, timestamp: new Date().toISOString() };
    messages = [...messages, userMsg];
    const userInput = input;
    input = '';
    loading = true;

    const res = await leemaChat({
      message: userInput,
      context,
      language: $currentLanguage,
      history: messages.slice(-6),
    });

    messages = [...messages, {
      role: 'assistant',
      content: res.reply,
      language: res.language,
      timestamp: new Date().toISOString(),
    }];
    loading = false;

    // Scroll to bottom
    setTimeout(() => { if (container) container.scrollTop = container.scrollHeight; }, 50);
  }

  const CONTEXT_LABELS: Record<LeemaContext, string> = {
    general:  'General',
    atelier:  'Atelier',
    auction:  'Auction',
    media:    'Media',
    cultural: 'Heritage',
  };
</script>

<!-- FAB Button -->
<button
  on:click={() => (open = !open)}
  class="fixed bottom-20 md:bottom-8 right-6 z-50 w-14 h-14 bg-hd-gold text-hd-black flex items-center justify-center shadow-[0_20px_40px_rgba(197,160,89,0.4)] hover:scale-110 transition-all duration-300 font-serif font-bold text-sm animate-pulse-gold"
>
  {open ? '✕' : 'AI'}
</button>

<!-- Chat Panel -->
{#if open}
  <div
    in:fly={{ x: 400, duration: 400 }}
    out:fly={{ x: 400, duration: 300 }}
    class="fixed bottom-36 md:bottom-24 right-6 z-50 w-[360px] hd-card shadow-[0_40px_80px_rgba(0,0,0,0.6)] flex flex-col"
    style="max-height: 520px;"
  >
    <!-- Header -->
    <div class="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-hd-gold flex items-center justify-center text-hd-black font-serif font-bold text-xs">L</div>
        <div>
          <p class="mono text-white text-[10px] font-bold">LEEMA AI</p>
          <p class="mono text-hd-gold text-[8px] uppercase">Cultural Intelligence Active</p>
        </div>
      </div>
      <!-- Context selector -->
      <select
        bind:value={context}
        class="bg-hd-surface border border-white/10 text-white/60 mono text-[8px] px-2 py-1 focus:border-hd-gold outline-none"
      >
        {#each Object.entries(CONTEXT_LABELS) as [key, label]}
          <option value={key} class="bg-hd-black">{label}</option>
        {/each}
      </select>
    </div>

    <!-- Messages -->
    <div bind:this={container} class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin" style="min-height: 280px; max-height: 320px;">
      {#each messages as msg}
        <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
          <div
            class="max-w-[80%] px-4 py-3 text-sm font-serif italic leading-relaxed {msg.role === 'user' ? 'bg-hd-gold/20 text-white' : 'bg-white/5 text-white/80'}"
          >
            {msg.content}
          </div>
        </div>
      {/each}
      {#if loading}
        <div class="flex justify-start">
          <div class="bg-white/5 px-4 py-3 flex gap-1.5 items-center">
            {#each Array(3) as _, i}
              <div class="w-1.5 h-1.5 bg-hd-gold rounded-full animate-bounce" style="animation-delay: {i * 0.15}s" />
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Input -->
    <form on:submit|preventDefault={sendMessage} class="border-t border-white/[0.08] flex">
      <input
        bind:value={input}
        placeholder="Ask Leema anything..."
        class="flex-1 bg-transparent px-4 py-3 text-white text-sm font-serif italic focus:outline-none placeholder-white/20"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !input.trim()}
        class="px-5 text-hd-gold hover:text-white transition-colors disabled:opacity-30"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7-7 7" /></svg>
      </button>
    </form>
  </div>
{/if}
