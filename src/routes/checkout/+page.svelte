<script lang="ts">
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { cart, cartTotal } from '$lib/stores/cart';
  import { isAuthenticated, currentUser } from '$lib/stores/auth';
  import { supabase } from '$lib/supabase';

  let step: 'details' | 'payment' | 'confirm' = 'details';
  let loading = false;
  let orderId = '';

  let form = {
    name: '', email: '', phone: '', address: '', city: '', state: '', notes: ''
  };

  async function placeOrder() {
    loading = true;
    try {
      const ref = `HD-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase.from('orders').insert({
        user_id: $currentUser?.id ?? 'guest',
        items: $cart,
        total_amount: $cartTotal,
        status: 'pending',
        payment_status: 'pending',
        payment_reference: ref,
        shipping_address: { ...form },
        notes: form.notes,
      }).select().single();

      if (!error && data) {
        orderId = data.id;
        cart.clear();
        step = 'confirm';
      }
    } finally {
      loading = false;
    }
  }

  const NIGERIAN_STATES = ['Abuja','Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];
</script>

<svelte:head><title>Checkout — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505] pt-20 pb-32">
  <div class="max-w-2xl mx-auto px-4">
    <!-- Steps indicator -->
    <div class="flex items-center justify-center gap-0 mb-12">
      {#each [['details','Details'], ['payment','Payment'], ['confirm','Confirmed']] as [s, label], i}
        <div class="flex items-center">
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center mono text-[10px] font-bold transition-all {step === s ? 'border-hd-gold text-hd-gold bg-hd-gold/10' : 'border-white/20 text-white/30'}">
              {i+1}
            </div>
            <span class="mono text-[8px] uppercase tracking-wider mt-1 {step === s ? 'text-hd-gold' : 'text-white/20'}">{label}</span>
          </div>
          {#if i < 2}
            <div class="w-16 h-px bg-white/10 mx-2 mb-4"></div>
          {/if}
        </div>
      {/each}
    </div>

    {#if step === 'details'}
      <div in:fade>
        <h2 class="font-serif text-2xl text-white mb-6">Delivery Details</h2>
        <div class="space-y-4">
          {#each [['name','Full Name','text'],['email','Email Address','email'],['phone','Phone Number','tel']] as [field, label, type]}
            <div>
              <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">{label}</label>
              <input
                bind:value={form[field]}
                type={type}
                class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors placeholder-white/20"
                placeholder={label}
              />
            </div>
          {/each}
          <div>
            <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">Delivery Address</label>
            <textarea bind:value={form.address} rows="2" class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none resize-none transition-colors placeholder-white/20" placeholder="Street address..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">City</label>
              <input bind:value={form.city} class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors placeholder-white/20" placeholder="City" />
            </div>
            <div>
              <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">State</label>
              <select bind:value={form.state} class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors">
                <option value="" class="bg-[#050505]">Select State</option>
                {#each NIGERIAN_STATES as state}
                  <option value={state} class="bg-[#050505]">{state}</option>
                {/each}
              </select>
            </div>
          </div>
          <div>
            <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">Order Notes (optional)</label>
            <textarea bind:value={form.notes} rows="2" class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none resize-none transition-colors placeholder-white/20" placeholder="Special instructions..."></textarea>
          </div>
        </div>
        <button
          on:click={() => step = 'payment'}
          disabled={!form.name || !form.phone || !form.address}
          class="w-full mt-8 bg-hd-gold text-black mono text-[10px] uppercase tracking-widest py-4 font-semibold hover:bg-hd-gold/90 transition-all disabled:opacity-40"
        >
          Continue to Payment →
        </button>
      </div>

    {:else if step === 'payment'}
      <div in:fade>
        <h2 class="font-serif text-2xl text-white mb-6">Order Summary</h2>
        <div class="bg-white/[0.02] border border-white/[0.06] p-5 space-y-3 mb-6">
          {#each $cart as item}
            <div class="flex justify-between items-center text-sm">
              <span class="text-white/70">{item.name} {item.size ? `(${item.size})` : ''} × {item.quantity}</span>
              <span class="text-hd-gold mono">₦{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          {/each}
          <div class="h-px bg-white/[0.06]"></div>
          <div class="flex justify-between font-semibold">
            <span class="text-white mono text-[10px] uppercase tracking-wider">Total</span>
            <span class="font-serif text-xl text-hd-gold">₦{$cartTotal.toLocaleString()}</span>
          </div>
        </div>
        <!-- OPay placeholder -->
        <div class="bg-white/[0.02] border border-hd-gold/20 p-5 mb-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 bg-hd-gold/10 border border-hd-gold/30 flex items-center justify-center">
              <span class="text-hd-gold text-xs">₦</span>
            </div>
            <div>
              <p class="text-white text-sm font-medium">OPay Secure Checkout</p>
              <p class="text-white/40 text-xs">Cards, Bank Transfer, USSD</p>
            </div>
          </div>
          <p class="mono text-[9px] text-white/30 uppercase tracking-wider">Payment is secured by OPay. No card details stored.</p>
        </div>
        <button
          on:click={placeOrder}
          disabled={loading}
          class="w-full bg-hd-gold text-black mono text-[10px] uppercase tracking-widest py-4 font-semibold hover:bg-hd-gold/90 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
        >
          {#if loading}
            <div class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            Processing...
          {:else}
            Pay ₦{$cartTotal.toLocaleString()} via OPay
          {/if}
        </button>
        <button on:click={() => step = 'details'} class="w-full mt-2 text-white/30 text-sm mono uppercase tracking-widest py-3 hover:text-white/50 transition-colors">← Edit Details</button>
      </div>

    {:else}
      <div class="text-center py-12" in:fade>
        <div class="w-16 h-16 bg-hd-gold/10 border border-hd-gold/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-hd-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 class="font-serif text-3xl text-white mb-3">Order Confirmed</h2>
        <p class="text-white/40 text-sm mb-2">Your order has been placed successfully</p>
        {#if orderId}<p class="mono text-hd-gold/60 text-[9px] uppercase tracking-widest">Order ID: {orderId.slice(0,8).toUpperCase()}</p>{/if}
        <div class="mt-8 flex gap-3 justify-center">
          <a href="/orders" class="bg-hd-gold text-black mono text-[10px] uppercase tracking-widest px-6 py-3 font-semibold">Track Order</a>
          <a href="/shop" class="border border-white/10 text-white/60 mono text-[10px] uppercase tracking-widest px-6 py-3 hover:border-hd-gold/30 transition-colors">Shop More</a>
        </div>
      </div>
    {/if}
  </div>
</div>
