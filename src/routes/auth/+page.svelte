<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { fade, fly } from 'svelte/transition';

  type Mode = 'signin' | 'signup' | 'phone';
  let mode: Mode = 'signin';
  let loading = false;
  let error = '';
  let success = '';

  // Form fields
  let email = '', password = '', username = '', phone = '', otp = '';
  let otpSent = false;

  const redirect = $page.url.searchParams.get('redirect') || '/';

  async function handleEmailSubmit() {
    loading = true; error = '';
    if (mode === 'signin') {
      const { error: e } = await auth.signInEmail(email, password);
      if (e) { error = e.message; loading = false; return; }
    } else {
      if (!username) { error = 'Username is required.'; loading = false; return; }
      const { error: e } = await auth.signUpEmail(email, password, username);
      if (e) { error = e.message; loading = false; return; }
      success = 'Check your email to confirm your account.';
      loading = false; return;
    }
    loading = false;
    goto(redirect);
  }

  async function handleGoogle() {
    await auth.signInGoogle();
  }

  async function handlePhoneSubmit() {
    loading = true; error = '';
    if (!otpSent) {
      const { error: e } = await auth.signInPhone(phone);
      if (e) { error = e.message; loading = false; return; }
      otpSent = true;
    } else {
      const { error: e } = await auth.verifyOtp(phone, otp);
      if (e) { error = e.message; loading = false; return; }
      goto(redirect);
    }
    loading = false;
  }
</script>

<svelte:head><title>HD Archive — Authenticate</title></svelte:head>

<div class="min-h-screen grid md:grid-cols-2">
  <!-- Left: Visual -->
  <div class="hidden md:block relative overflow-hidden">
    <img
      src="https://i.imgur.com/7QFYTZJ.png"
      alt="Heritage"
      class="w-full h-full object-cover brightness-50"
      referrerpolicy="no-referrer"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-transparent to-hd-black/60" />
    <div class="absolute inset-0 flex flex-col justify-end p-16">
      <div class="w-12 h-12 bg-hd-gold flex items-center justify-center mb-8">
        <span class="font-serif font-bold text-hd-black text-xl">HD</span>
      </div>
      <h2 class="text-5xl font-serif italic text-white leading-tight mb-4">Your Identity<br/><span class="text-hd-gold">Awaits</span></h2>
      <p class="font-serif italic text-white/50 text-lg max-w-sm">Join Africa's sovereign heritage commerce platform. Prestige is earned, not given.</p>
      <!-- Tier preview -->
      <div class="mt-10 flex gap-2">
        {#each [['Citizen','#FFFFFF'],['Patron','#F59E0B'],['Curator','#C5A059'],['Vanguard','#A855F7'],['Elite','#C5A059']] as [name, color]}
          <div class="flex flex-col items-center gap-1.5">
            <div class="w-6 h-6 rounded-full border-2" style="border-color:{color};box-shadow:0 0 8px {color}40" />
            <span class="mono text-[7px] uppercase" style="color:{color}">{name}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Right: Form -->
  <div class="flex flex-col justify-center px-8 md:px-16 py-16 bg-hd-black min-h-screen">
    <!-- Logo (mobile) -->
    <div class="md:hidden mb-12 flex items-center gap-3">
      <div class="w-10 h-10 bg-hd-gold flex items-center justify-center">
        <span class="font-serif font-bold text-hd-black text-sm">HD</span>
      </div>
      <span class="font-serif italic text-white text-lg">House of Daraja</span>
    </div>

    <!-- Mode switcher -->
    <div class="flex mb-10 border-b border-white/10">
      {#each [['signin','Sign In'],['signup','Create Account'],['phone','Phone']] as [m, label]}
        <button
          on:click={() => { mode = m as Mode; error = ''; success = ''; }}
          class="pb-3 px-1 mr-8 mono text-[10px] uppercase tracking-widest transition-all {mode === m ? 'border-b-2 border-hd-gold text-hd-gold' : 'text-white/30 hover:text-white'}"
        >
          {label}
        </button>
      {/each}
    </div>

    <div in:fly={{ x: 20, duration: 300 }}>
      {#if error}
        <div class="mb-6 p-4 border border-red-800/50 bg-red-900/10">
          <p class="mono text-red-400 text-[10px]">{error}</p>
        </div>
      {/if}
      {#if success}
        <div class="mb-6 p-4 border border-green-800/50 bg-green-900/10">
          <p class="mono text-green-400 text-[10px]">{success}</p>
        </div>
      {/if}

      <!-- EMAIL/PASSWORD -->
      {#if mode === 'signin' || mode === 'signup'}
        <form on:submit|preventDefault={handleEmailSubmit} class="space-y-5">
          {#if mode === 'signup'}
            <div class="space-y-2">
              <label class="hd-label">Archive Username</label>
              <input bind:value={username} type="text" placeholder="sovereign_xyz" class="hd-input" required />
              <p class="mono text-[8px] text-white/20">This becomes your permanent identity on HD.</p>
            </div>
          {/if}
          <div class="space-y-2">
            <label class="hd-label">Email</label>
            <input bind:value={email} type="email" placeholder="archive@daraja.io" class="hd-input" required />
          </div>
          <div class="space-y-2">
            <label class="hd-label">Password</label>
            <input bind:value={password} type="password" placeholder="••••••••••••" class="hd-input" required minlength="8" />
          </div>
          <button
            type="submit"
            disabled={loading}
            class="hd-btn-primary w-full {loading ? 'opacity-60 cursor-not-allowed' : ''}"
          >
            {loading ? 'VERIFYING...' : mode === 'signin' ? 'ENTER ARCHIVE' : 'CREATE IDENTITY'}
          </button>
        </form>

        <div class="flex items-center gap-4 my-6">
          <div class="flex-1 h-px bg-white/10" />
          <span class="mono text-[8px] text-white/20 uppercase">or continue with</span>
          <div class="flex-1 h-px bg-white/10" />
        </div>

        <button
          on:click={handleGoogle}
          class="hd-btn-outline w-full flex items-center justify-center gap-3"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          CONTINUE WITH GOOGLE
        </button>

      <!-- PHONE -->
      {:else if mode === 'phone'}
        <form on:submit|preventDefault={handlePhoneSubmit} class="space-y-5">
          <div class="space-y-2">
            <label class="hd-label">Phone Number</label>
            <input bind:value={phone} type="tel" placeholder="+234 800 000 0000" class="hd-input" required disabled={otpSent} />
          </div>
          {#if otpSent}
            <div class="space-y-2" in:fly={{ y: 10 }}>
              <label class="hd-label">Enter OTP</label>
              <input bind:value={otp} type="text" placeholder="000000" class="hd-input tracking-[0.5em] text-center text-xl" maxlength="6" required />
            </div>
          {/if}
          <button type="submit" disabled={loading} class="hd-btn-primary w-full {loading ? 'opacity-60' : ''}">
            {loading ? '...' : otpSent ? 'VERIFY CODE' : 'SEND CODE'}
          </button>
          {#if otpSent}
            <button type="button" on:click={() => { otpSent = false; otp = ''; }} class="mono text-[9px] text-white/30 hover:text-hd-gold w-full text-center">
              Change number
            </button>
          {/if}
        </form>
      {/if}
    </div>

    {#if mode === 'signin'}
      <p class="mt-8 mono text-[9px] text-white/30 text-center">
        Not in the archive? <button on:click={() => (mode = 'signup')} class="text-hd-gold hover:underline">Create identity</button>
      </p>
    {/if}
  </div>
</div>
