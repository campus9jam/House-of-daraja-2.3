<script lang="ts">
  import { page } from '$app/stores';
  import { cartCount } from '$lib/stores/cart';

  const LINKS = [
    {
      href: '/',
      label: 'Home',
      icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25'
    },
    {
      href: '/shop',
      label: 'Shop',
      icon: 'M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z'
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z',
      badge: true
    },
    {
      href: '/atelier',
      label: 'Atelier',
      icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z'
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z'
    },
  ];

  $: activePath = $page.url.pathname;
</script>

<nav class="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#050505]/96 backdrop-blur-xl border-t border-white/[0.06]" style="padding-bottom: env(safe-area-inset-bottom)">
  <div class="flex items-center justify-around h-16 px-2">
    {#each LINKS as link}
      {@const isActive = activePath === link.href || (link.href !== '/' && activePath.startsWith(link.href))}
      <a
        href={link.href}
        class="flex flex-col items-center gap-1 flex-1 py-2 transition-all relative {isActive ? 'text-hd-gold' : 'text-white/30 hover:text-white/60'}"
      >
        <!-- Active indicator -->
        {#if isActive}
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-hd-gold rounded-full"></div>
        {/if}

        <div class="relative">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d={link.icon} />
          </svg>
          {#if link.badge && $cartCount > 0}
            <span class="absolute -top-1.5 -right-1.5 bg-hd-gold text-black text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center mono">
              {$cartCount > 9 ? '9+' : $cartCount}
            </span>
          {/if}
        </div>
        <span class="mono text-[7px] uppercase tracking-widest leading-none">{link.label}</span>
      </a>
    {/each}
  </div>
</nav>
