<script lang="ts">
  import { page } from '$app/stores';
  import { currentLanguage, t } from '$lib/stores/language';

  const LINKS = [
    { href: '/',        icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',                     key: 'nav.home' },
    { href: '/atelier', icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121', key: 'nav.atelier' },
    { href: '/auction', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806...',               key: 'nav.auction' },
    { href: '/media',   icon: 'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554...',                       key: 'nav.media' },
    { href: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14...',          key: 'nav.profile' },
  ];

  $: activePath = $page.url.pathname;
</script>

<nav class="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-hd-black/95 backdrop-blur-xl border-t border-white/[0.06] safe-area-bottom">
  <div class="flex items-center justify-around h-16 px-4">
    {#each LINKS as link}
      {@const isActive = activePath === link.href || (link.href !== '/' && activePath.startsWith(link.href))}
      <a href={link.href} class="flex flex-col items-center gap-1 transition-all {isActive ? 'text-hd-gold' : 'text-white/30 hover:text-white/60'}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d={link.icon.split('M').slice(0,2).map(s => 'M'+s).join(' ')} />
        </svg>
        <span class="mono text-[7px] uppercase tracking-widest">{t(link.key, $currentLanguage)}</span>
      </a>
    {/each}
  </div>
</nav>
