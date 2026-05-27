<script lang="ts">
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { cart, cartTotal } from '$lib/stores/cart';

  function updateQty(item: any, delta: number) {
    cart.updateQty(item.product_id, item.size, item.quantity + delta);
  }
</script>

<svelte:head><title>Cart — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505] pt-20 pb-32">
  <div class="max-w-3xl mx-auto px-4">
    <div class="flex items-center gap-4 mb-10">
      <div class="h-px flex-1 bg-white/[0.06]"></div>
      <h1 class="font-serif text-3xl text-white font-light">Your Cart</h1>
      <div class="h-px flex-1 bg-white/[0.06]"></div>
    </div>

    {#if $cart.length === 0}
      <div class="text-center py-24" in:fade>
        <img src="/hd-logo.png" alt="HD" class="w-16 h-16 object-contain mx-auto mb-6 opacity-20" />
        <p class="font-serif text-2xl text-white/30 mb-3">Your cart is empty</p>
        <p class="text-white/20 text-sm mb-8">Explore the collection and add pieces you love</p>
        <a href="/shop" class="bg-hd-gold text-black mono text-[10px] uppercase tracking-widest px-8 py-3 font-semibold hover:bg-hd-gold/90 transition-colors">Browse Shop</a>
      </div>
    {:else}
      <div class="space-y-3">
        {#each $cart as item, i (item.product_id + item.size)}
          <div class="flex gap-4 bg-white/[0.02] border border-white/[0.06] p-4 hover:border-white/10 transition-all" in:fly={{ y: 10, delay: i * 50 }}>
            <div class="w-20 h-24 flex-shrink-0 overflow-hidden bg-white/[0.04]">
              <img src={item.image || '/hd-logo.png'} alt={item.name} class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-light leading-snug truncate">{item.name}</p>
              {#if item.size}<p class="mono text-[9px] text-white/30 uppercase mt-0.5">Size: {item.size}</p>{/if}
              <p class="text-hd-gold mono text-sm mt-2">₦{item.price?.toLocaleString()}</p>
            </div>
            <div class="flex flex-col items-end justify-between">
              <button on:click={() => cart.remove(item.product_id, item.size)} class="text-white/20 hover:text-red-400 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div class="flex items-center gap-3 border border-white/10">
                <button on:click={() => updateQty(item, -1)} class="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors mono text-sm">−</button>
                <span class="mono text-sm text-white w-4 text-center">{item.quantity}</span>
                <button on:click={() => updateQty(item, 1)} class="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors mono text-sm">+</button>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Summary -->
      <div class="mt-8 bg-white/[0.02] border border-white/[0.06] p-6">
        <div class="flex justify-between items-center mb-4">
          <span class="text-white/50 mono text-[10px] uppercase tracking-widest">Subtotal</span>
          <span class="font-serif text-xl text-white">₦{$cartTotal.toLocaleString()}</span>
        </div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-white/30 text-sm">Shipping</span>
          <span class="text-white/30 text-sm">Calculated at checkout</span>
        </div>
        <div class="h-px bg-white/[0.06] my-4"></div>
        <button
          on:click={() => goto('/checkout')}
          class="w-full bg-hd-gold text-black mono text-[11px] uppercase tracking-widest py-4 font-semibold hover:bg-hd-gold/90 transition-colors"
        >
          Proceed to Checkout → ₦{$cartTotal.toLocaleString()}
        </button>
        <a href="/shop" class="block text-center mt-3 text-white/30 mono text-[9px] uppercase tracking-widest hover:text-white/50 transition-colors">Continue Shopping</a>
      </div>
    {/if}
  </div>
</div>
