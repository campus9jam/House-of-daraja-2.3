<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentUser, isAuthenticated } from '$lib/stores/auth';

  let orders: any[] = [];
  let loading = true;
  let activeTab: 'all' | 'active' | 'delivered' = 'all';

  const ORDER_STEPS = ['confirmed','processing','shipped','out_for_delivery','delivered'];
  const STATUS_CONFIG: Record<string, {label:string;color:string;step:number}> = {
    pending:         { label:'Pending',          color:'text-white/40',  step:0 },
    confirmed:       { label:'Confirmed',        color:'text-blue-400',  step:1 },
    processing:      { label:'Processing',       color:'text-yellow-400',step:2 },
    shipped:         { label:'Shipped',          color:'text-orange-400',step:3 },
    out_for_delivery:{ label:'Out for Delivery', color:'text-amber-400', step:4 },
    delivered:       { label:'Delivered',        color:'text-green-400', step:5 },
    cancelled:       { label:'Cancelled',        color:'text-red-400',   step:0 },
  };

  onMount(async () => {
    if (!$isAuthenticated) { goto('/auth?redirect=/orders'); return; }
    const { data } = await supabase.from('orders').select('*').eq('user_id', $currentUser!.id).order('created_at', { ascending: false });
    orders = data ?? [];
    loading = false;
  });

  $: filteredOrders = activeTab === 'all' ? orders
    : activeTab === 'delivered' ? orders.filter(o => o.status === 'delivered')
    : orders.filter(o => !['delivered','cancelled'].includes(o.status));
</script>

<svelte:head><title>My Orders — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505] py-6">
  <div class="max-w-2xl mx-auto px-4">
    <div class="mb-8">
      <p class="mono text-hd-gold/50 text-[9px] uppercase tracking-[0.4em] mb-1">Account</p>
      <h1 class="font-serif text-3xl text-white font-light">My Orders</h1>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-white/[0.06] mb-6">
      {#each [['all','All'],['active','Active'],['delivered','Delivered']] as [tab, label]}
        <button
          on:click={() => activeTab = tab}
          class="flex-1 py-3 mono text-[9px] uppercase tracking-widest border-b-2 transition-all {activeTab === tab ? 'border-hd-gold text-hd-gold' : 'border-transparent text-white/30'}"
        >{label}</button>
      {/each}
    </div>

    {#if loading}
      <div class="space-y-4">{#each Array(3) as _}<div class="h-32 bg-white/[0.03] animate-pulse"></div>{/each}</div>
    {:else if filteredOrders.length === 0}
      <div class="text-center py-20" in:fade>
        <img src="/hd-logo.png" alt="" class="w-14 h-14 mx-auto mb-5 opacity-20 object-contain" />
        <p class="font-serif text-xl text-white/30">No orders here yet</p>
        <a href="/shop" class="mono text-[9px] text-hd-gold/50 hover:text-hd-gold mt-4 block">Browse the Collection →</a>
      </div>
    {:else}
      <div class="space-y-4">
        {#each filteredOrders as order, i (order.id)}
          <div class="bg-white/[0.02] border border-white/[0.06] overflow-hidden" in:fly={{ y: 10, delay: i * 60 }}>
            <!-- Order header -->
            <div class="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.04]">
              <div>
                <p class="mono text-[8px] uppercase text-white/30 tracking-wider">Order #{order.id?.slice(0,8).toUpperCase()}</p>
                <p class="text-white/50 text-xs mt-0.5">{new Date(order.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'long', year:'numeric' })}</p>
              </div>
              <div class="text-right">
                <span class="mono text-[8px] uppercase {STATUS_CONFIG[order.status]?.color ?? 'text-white/40'}">{STATUS_CONFIG[order.status]?.label ?? order.status}</span>
                <p class="font-serif text-lg text-hd-gold mt-0.5">₦{order.total_amount?.toLocaleString()}</p>
              </div>
            </div>

            <!-- Progress tracker (for active orders) -->
            {#if !['pending','cancelled','delivered'].includes(order.status)}
              {@const step = STATUS_CONFIG[order.status]?.step ?? 0}
              <div class="px-4 py-4 border-b border-white/[0.04]">
                <div class="flex items-center">
                  {#each ORDER_STEPS as s, si}
                    <div class="flex-1 flex items-center">
                      <div class="w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all {si < step ? 'bg-hd-gold border-hd-gold' : si === step-1 ? 'border-hd-gold bg-hd-gold/20 animate-pulse' : 'border-white/20'}"></div>
                      {#if si < ORDER_STEPS.length - 1}
                        <div class="flex-1 h-px transition-all {si < step-1 ? 'bg-hd-gold' : 'bg-white/10'}"></div>
                      {/if}
                    </div>
                  {/each}
                </div>
                <div class="flex justify-between mt-2">
                  {#each ORDER_STEPS as s}
                    <span class="mono text-[6px] uppercase text-white/20 capitalize flex-1 text-center">{s.replace('_',' ')}</span>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Items preview -->
            <div class="px-4 pb-4 pt-3">
              <div class="flex gap-2 mb-3 overflow-x-auto scrollbar-none">
                {#each (order.items ?? []).slice(0,4) as item}
                  <div class="flex-shrink-0 w-12 h-14 overflow-hidden bg-white/[0.04]">
                    <img src={item.image ?? '/hd-logo.png'} alt={item.name} class="w-full h-full object-cover" />
                  </div>
                {/each}
                {#if (order.items?.length ?? 0) > 4}
                  <div class="flex-shrink-0 w-12 h-14 bg-white/[0.04] flex items-center justify-center">
                    <span class="mono text-[8px] text-white/30">+{order.items.length - 4}</span>
                  </div>
                {/if}
              </div>
              {#if order.tracking_number}
                <div class="flex items-center gap-2">
                  <span class="mono text-[8px] text-white/30 uppercase">Tracking:</span>
                  <span class="mono text-[9px] text-hd-gold/70">{order.tracking_number}</span>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
