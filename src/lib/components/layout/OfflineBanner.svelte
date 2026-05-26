<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  let online = true;
  let showBack = false;

  onMount(() => {
    online = navigator.onLine;
    const goOffline = () => { online = false; showBack = false; };
    const goOnline  = () => { online = true; showBack = true; setTimeout(() => (showBack = false), 4000); };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => { window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline); };
  });
</script>

{#if !online}
  <div in:fly={{ y: -40 }} out:fly={{ y: -40 }} class="fixed top-0 left-0 right-0 z-50 bg-red-900/90 backdrop-blur text-white px-6 py-3 flex items-center justify-center gap-3 mono text-[9px] uppercase tracking-widest border-b border-red-700">
    <div class="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
    ARCHIVE_OFFLINE — Queued actions will sync when restored
  </div>
{:else if showBack}
  <div in:fly={{ y: -40 }} out:fly={{ y: -40 }} class="fixed top-0 left-0 right-0 z-50 bg-green-900/90 backdrop-blur text-white px-6 py-3 flex items-center justify-center gap-3 mono text-[9px] uppercase tracking-widest">
    <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
    ARCHIVE_RESTORED — Syncing queued actions
  </div>
{/if}
