<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentUser } from '$lib/stores/auth';
  import { subscribeToAuction, unsubscribeAuction, placeBid, sendChatMessage, liveAuction, auctionBids, auctionChat, isBidding, bidError } from '$lib/stores/auction';
  import type { Auction } from '$lib/types/database';

  let auctions: Auction[] = [];
  let selectedId: string | null = null;
  let bidAmount = '';
  let chatMsg = '';
  let autoMax = '';
  let tab: 'bid' | 'chat' | 'provenance' = 'bid';

  let countdown = '';

  onMount(async () => {
    const { data } = await supabase.from('auctions').select('*').in('status', ['live', 'upcoming']).order('end_time', { ascending: true });
    if (data) auctions = data as Auction[];
    if (auctions[0]) openAuction(auctions[0].id);
  });

  onDestroy(() => unsubscribeAuction());

  async function openAuction(id: string) {
    selectedId = id;
    await subscribeToAuction(id);
    startCountdown();
  }

  let countdownTimer: ReturnType<typeof setInterval>;
  function startCountdown() {
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      const a = $liveAuction;
      if (!a) { countdown = '—'; return; }
      const diff = new Date(a.end_time).getTime() - Date.now();
      if (diff <= 0) { countdown = 'ENDED'; clearInterval(countdownTimer); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      countdown = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }, 1000);
  }

  async function submitBid() {
    if (!bidAmount) return;
    const amt = parseFloat(bidAmount.replace(/,/g, ''));
    const res = await placeBid(selectedId!, amt);
    if (res.success) bidAmount = '';
  }

  async function submitChat() {
    if (!chatMsg.trim()) return;
    await sendChatMessage(selectedId!, chatMsg);
    chatMsg = '';
  }

  function formatNaira(n: number) {
    return '₦' + n.toLocaleString('en-NG');
  }
</script>

<svelte:head><title>HD Auction Protocol — Live Bidding</title></svelte:head>

<div class="min-h-screen flex flex-col">

  <!-- Header -->
  <div class="px-6 md:px-12 py-10 border-b border-white/5">
    <div class="max-w-[1400px] mx-auto flex items-end justify-between">
      <div>
        <div class="flex items-center gap-3 mb-3">
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span class="mono text-red-400 text-[9px] uppercase tracking-widest">HD AUCTION PROTOCOL — LIVE</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-serif italic text-white">Sovereign <span class="text-hd-gold not-italic">Auction Hall</span></h1>
      </div>
      {#if $liveAuction?.status === 'live'}
        <div class="text-right">
          <p class="mono text-white/40 text-[9px] uppercase">Time Remaining</p>
          <p class="mono text-hd-gold text-4xl font-bold tracking-widest">{countdown}</p>
        </div>
      {/if}
    </div>
  </div>

  <div class="flex-1 flex max-w-[1400px] mx-auto w-full px-4 md:px-8 py-8 gap-6">

    <!-- LEFT: Auction list (38%) -->
    <div class="w-full md:w-[38%] space-y-3 overflow-y-auto scrollbar-thin pr-2">
      {#each auctions as auction}
        <button
          on:click={() => openAuction(auction.id)}
          class="w-full hd-card p-5 text-left hover:border-hd-gold/40 transition-all {selectedId === auction.id ? 'border-hd-gold' : ''} flex gap-4"
        >
          <div class="w-20 h-16 overflow-hidden flex-shrink-0">
            <img src={auction.image_url} alt={auction.title} class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              {#if auction.status === 'live'}
                <span class="mono text-[7px] bg-red-600/80 text-white px-2 py-0.5">LIVE</span>
              {:else}
                <span class="mono text-[7px] bg-white/10 text-white/50 px-2 py-0.5">UPCOMING</span>
              {/if}
              <span class="mono text-[7px] text-white/30 uppercase">{auction.category}</span>
            </div>
            <h3 class="font-serif italic text-white text-sm truncate">{auction.title}</h3>
            <div class="flex items-center justify-between mt-1">
              <span class="mono text-hd-gold text-[11px] font-bold">{formatNaira(auction.current_bid)}</span>
              <span class="mono text-white/30 text-[9px]">{auction.bid_count} bids</span>
            </div>
          </div>
        </button>
      {/each}

      {#if auctions.length === 0}
        <div class="hd-card p-8 text-center">
          <p class="font-serif italic text-white/40">No live auctions at this moment.</p>
          <p class="mono text-[9px] text-white/20 mt-2 uppercase">New auctions are announced daily</p>
        </div>
      {/if}
    </div>

    <!-- RIGHT: Live auction detail (62%) -->
    <div class="flex-1 min-w-0">
      {#if $liveAuction}
        <div class="space-y-6" in:fly={{ x: 30, duration: 400 }}>

          <!-- Auction image + bid summary -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="aspect-square overflow-hidden relative">
              <img src={$liveAuction.image_url} alt={$liveAuction.title} class="w-full h-full object-cover" />
              {#if $liveAuction.status === 'live'}
                <div class="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 px-3 py-1.5">
                  <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span class="mono text-white text-[9px] uppercase">LIVE BIDDING</span>
                </div>
              {/if}
              <div class="absolute bottom-4 right-4">
                <span class="mono text-[7px] bg-hd-black/80 border border-white/10 text-white/60 px-3 py-1 uppercase">{$liveAuction.category}</span>
              </div>
            </div>

            <div class="space-y-5">
              <div>
                <h2 class="text-2xl md:text-3xl font-serif italic text-white">{$liveAuction.title}</h2>
                <p class="font-serif italic text-white/50 mt-2 leading-relaxed">{$liveAuction.description}</p>
              </div>

              <div class="hd-card p-5 space-y-3">
                <div class="flex justify-between items-end">
                  <div>
                    <p class="hd-label mb-1">Current Bid</p>
                    <p class="mono text-hd-gold text-3xl font-bold">{formatNaira($liveAuction.current_bid)}</p>
                  </div>
                  <div class="text-right">
                    <p class="hd-label mb-1">Bids</p>
                    <p class="mono text-white text-2xl">{$liveAuction.bid_count}</p>
                  </div>
                </div>
                {#if $liveAuction.reserve_price}
                  <p class="mono text-[8px] text-white/30 uppercase">
                    Reserve: {$liveAuction.current_bid >= $liveAuction.reserve_price ? '✓ Met' : 'Not yet met'}
                  </p>
                {/if}
              </div>

              <!-- Bid history mini -->
              <div class="space-y-2 max-h-28 overflow-y-auto scrollbar-thin">
                {#each $auctionBids.slice(0, 5) as bid}
                  <div class="flex justify-between items-center py-2 border-b border-white/5">
                    <span class="mono text-white/50 text-[9px]">Bidder #{bid.bidder_id.slice(-4)}</span>
                    <span class="mono text-hd-gold text-[10px] font-bold">{formatNaira(bid.amount)}</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <!-- Tabs: Bid / Chat / Provenance -->
          <div>
            <div class="flex border-b border-white/10 mb-6">
              {#each [['bid','Place Bid'],['chat','Curator Chat'],['provenance','AI Provenance']] as [t, label]}
                <button
                  on:click={() => tab = t as any}
                  class="px-6 py-3 mono text-[9px] uppercase tracking-widest transition-all {tab === t ? 'border-b-2 border-hd-gold text-hd-gold' : 'text-white/40 hover:text-white'}"
                >
                  {label}
                </button>
              {/each}
            </div>

            <!-- BID TAB -->
            {#if tab === 'bid'}
              <div class="space-y-5" in:fly={{ x: 20, duration: 300 }}>
                {#if $currentUser}
                  {#if $bidError}
                    <div class="hd-card border-red-800/50 p-4">
                      <p class="mono text-red-400 text-[10px]">⚠ {$bidError}</p>
                    </div>
                  {/if}
                  <div class="space-y-2">
                    <label class="hd-label">Your Bid Amount (₦)</label>
                    <div class="flex gap-3">
                      <input
                        bind:value={bidAmount}
                        type="text"
                        placeholder="Enter bid above {formatNaira($liveAuction.current_bid + 500)}"
                        class="hd-input flex-1 text-lg font-mono"
                      />
                      <button
                        on:click={submitBid}
                        disabled={$isBidding || !bidAmount}
                        class="hd-btn-primary px-8 {$isBidding ? 'opacity-60 cursor-not-allowed' : ''}"
                      >
                        {$isBidding ? '...' : 'BID'}
                      </button>
                    </div>
                  </div>

                  <!-- Quick bid buttons -->
                  <div class="flex flex-wrap gap-3">
                    {#each [500, 1000, 2500, 5000] as inc}
                      <button
                        on:click={() => bidAmount = String($liveAuction.current_bid + inc)}
                        class="hd-card px-4 py-2 mono text-[9px] text-white/60 hover:border-hd-gold/40 hover:text-hd-gold transition-all"
                      >
                        +₦{inc.toLocaleString()}
                      </button>
                    {/each}
                  </div>

                  <!-- Auto-bid -->
                  <div class="hd-card p-5 space-y-3">
                    <p class="mono text-[9px] text-white/40 uppercase tracking-widest">Auto-Bid Ceiling</p>
                    <div class="flex gap-3">
                      <input bind:value={autoMax} type="text" placeholder="Maximum auto-bid (₦)" class="hd-input flex-1" />
                      <button class="hd-btn-outline text-[9px] px-5">SET AUTO</button>
                    </div>
                    <p class="mono text-[8px] text-white/20">System will auto-bid up to your ceiling. Anti-snipe: bids in final {$liveAuction.anti_snipe_extension}min extend by {$liveAuction.anti_snipe_extension}min.</p>
                  </div>
                {:else}
                  <div class="hd-card p-8 text-center">
                    <p class="font-serif italic text-white/60 mb-4">Authentication required to participate.</p>
                    <a href="/auth?redirect=/auction" class="hd-btn-primary inline-flex">AUTHENTICATE →</a>
                  </div>
                {/if}
              </div>

            <!-- CHAT TAB -->
            {:else if tab === 'chat'}
              <div class="space-y-4" in:fly={{ x: 20, duration: 300 }}>
                <div class="hd-card p-4 space-y-3 h-64 overflow-y-auto scrollbar-thin">
                  {#each $auctionChat as msg}
                    <div class="flex gap-3">
                      <div class="w-6 h-6 bg-hd-gold/20 flex-shrink-0 flex items-center justify-center text-hd-gold text-[10px] font-bold">
                        {msg.profiles?.username?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <span class="mono text-[8px] text-white/30">{msg.profiles?.username ?? 'Guest'}</span>
                        <p class="font-serif italic text-white/80 text-sm mt-0.5">{msg.message}</p>
                      </div>
                    </div>
                  {/each}
                  {#if $auctionChat.length === 0}
                    <p class="font-serif italic text-white/30 text-center mt-8">Be the first to speak in the hall.</p>
                  {/if}
                </div>
                {#if $currentUser}
                  <form on:submit|preventDefault={submitChat} class="flex gap-3">
                    <input bind:value={chatMsg} placeholder="Speak in the auction hall..." class="hd-input flex-1 text-sm" />
                    <button type="submit" class="hd-btn-primary px-5 py-3 text-[9px]">SEND</button>
                  </form>
                {/if}
              </div>

            <!-- PROVENANCE TAB -->
            {:else if tab === 'provenance'}
              <div class="hd-card p-8 space-y-6" in:fly={{ x: 20, duration: 300 }}>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-hd-gold text-hd-black flex items-center justify-center font-serif font-bold text-sm">L</div>
                  <div>
                    <p class="mono text-white text-[10px] font-bold">LEEMA PROVENANCE ENGINE</p>
                    <p class="mono text-hd-gold text-[8px] uppercase">Cultural authenticity analysis</p>
                  </div>
                </div>
                {#if $liveAuction.provenance_report && Object.keys($liveAuction.provenance_report).length > 0}
                  {@const rpt = $liveAuction.provenance_report as any}
                  <div class="grid grid-cols-2 gap-4">
                    <div class="hd-card p-4"><p class="hd-label mb-2">Cultural Origin</p><p class="font-serif italic text-white text-sm">{rpt.cultural_origin ?? '—'}</p></div>
                    <div class="hd-card p-4"><p class="hd-label mb-2">Authenticity</p><p class="font-serif italic text-hd-gold text-sm">{rpt.authenticity_confidence ? (rpt.authenticity_confidence * 100).toFixed(0) + '%' : '—'}</p></div>
                    <div class="hd-card p-4"><p class="hd-label mb-2">Textile Influence</p><p class="font-serif italic text-white text-sm">{rpt.textile_influence ?? '—'}</p></div>
                    <div class="hd-card p-4"><p class="hd-label mb-2">Rarity Estimate</p><p class="font-serif italic text-white text-sm">{rpt.rarity_estimation ?? '—'}</p></div>
                  </div>
                  {#if rpt.historical_meaning}
                    <div class="border-t border-white/5 pt-6">
                      <p class="hd-label mb-3">Historical Context</p>
                      <p class="font-serif italic text-white/70 leading-relaxed">{rpt.historical_meaning}</p>
                    </div>
                  {/if}
                {:else}
                  <p class="font-serif italic text-white/40">Leema provenance analysis is pending for this lot.</p>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="flex items-center justify-center h-full">
          <div class="text-center space-y-4">
            <div class="w-16 h-16 border border-hd-gold/20 flex items-center justify-center mx-auto text-hd-gold/40 text-3xl">⚖</div>
            <p class="font-serif italic text-white/40 text-xl">Select an auction to enter the hall</p>
          </div>
        </div>
      {/if}
    </div>

  </div>
</div>
