<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentUser, userProfile } from '$lib/stores/auth';
  import { currentLanguage } from '$lib/stores/language';
  import { leemaStyleRecommendations } from '$lib/services/leema';
  import { extractMeasurements, validateMeasurements, formatMeasurementsSummary } from '$lib/utils/atelierUtils';
  import { saveCommissionDraft, saveMeasurementLocal } from '$lib/db/offline';
  import type { AtelierMeasurement } from '$lib/types/database';

  // ── Wizard state ──────────────────────────────────────────
  let step = 1;
  const TOTAL_STEPS = 9;

  let form = {
    occasion: '',
    occasion_custom: '',
    outfit_type: '',
    fabric: '',
    color: '',
    embroidery: '',
    special_instructions: '',
    reference_images: [] as string[],
    artisan_id: '',
    measurements: {} as Partial<AtelierMeasurement>,
    measurement_text: '',
    fit_preference: 'regular' as string,
    body_type: 'regular' as string,
  };

  let aiSuggestions: any = null;
  let aiLoading = false;
  let artisans: any[] = [];
  let savedMeasurements: AtelierMeasurement[] = [];
  let submitting = false;
  let submitted = false;
  let orderRef = '';
  let autoFillWarnings: string[] = [];

  // ── Load artisans and saved measurements ─────────────────
  onMount(async () => {
    const [{ data: art }, { data: meas }] = await Promise.all([
      supabase.from('atelier_artisans').select('*').eq('is_verified', true).order('trust_score', { ascending: false }).limit(6),
      $currentUser ? supabase.from('atelier_measurements').select('*').eq('user_id', $currentUser.id) : Promise.resolve({ data: [] }),
    ]);
    if (art) artisans = art;
    if (meas) savedMeasurements = meas as AtelierMeasurement[];
  });

  // ── Auto-fill measurements from text ─────────────────────
  function autoFill() {
    if (!form.measurement_text) return;
    const extracted = extractMeasurements(form.measurement_text);
    const warnings = validateMeasurements(extracted);
    autoFillWarnings = warnings;
    form.measurements = { ...form.measurements, ...extracted };
    if (extracted.fitPreference) form.fit_preference = extracted.fitPreference;
    if (extracted.bodyType) form.body_type = extracted.bodyType;
  }

  // ── Get AI suggestions ────────────────────────────────────
  async function getAISuggestions() {
    aiLoading = true;
    const res = await leemaStyleRecommendations(form.occasion, {
      outfit_type: form.outfit_type, fabric: form.fabric, color: form.color,
    });
    try { aiSuggestions = JSON.parse(res.reply); } catch { aiSuggestions = { summary: res.reply }; }
    aiLoading = false;
  }

  // ── Save draft locally ────────────────────────────────────
  async function saveDraft() {
    if ($currentUser) await saveCommissionDraft($currentUser.id, step, form);
  }

  // ── Navigate steps ────────────────────────────────────────
  function next() { saveDraft(); step = Math.min(step + 1, TOTAL_STEPS); }
  function prev() { step = Math.max(step - 1, 1); }

  // ── Submit commission ─────────────────────────────────────
  async function submitOrder() {
    if (!$currentUser) return;
    submitting = true;

    // Save measurements first
    const { data: measData } = await supabase.from('atelier_measurements').insert({
      user_id: $currentUser.id,
      label: `${form.outfit_type} — ${new Date().toLocaleDateString()}`,
      ...form.measurements,
      fit_preference: form.fit_preference,
      body_type: form.body_type,
    }).select().single();

    // Create order
    const { data: order } = await supabase.from('atelier_orders').insert({
      user_id: $currentUser.id,
      artisan_id: form.artisan_id || null,
      measurement_id: measData?.id,
      occasion: form.occasion || form.occasion_custom,
      outfit_type: form.outfit_type,
      fabric: form.fabric,
      color: form.color,
      embroidery_notes: form.embroidery,
      special_instructions: form.special_instructions,
      ai_suggestions: aiSuggestions || {},
    }).select().single();

    submitting = false;
    if (order) { orderRef = order.serial_number; submitted = true; step = TOTAL_STEPS; }
  }

  const OCCASIONS = ['Wedding', 'Naming Ceremony', 'Coronation', 'Eid Celebration', 'State Function', 'Cultural Festival', 'Corporate', 'Other'];
  const OUTFIT_TYPES = [
    { name: 'Agbada', icon: '👘', desc: 'Three-piece flowing gown — supreme prestige' },
    { name: 'Kaftan',  icon: '🧥', desc: 'Embroidered Hausa excellence' },
    { name: 'Senator', icon: '🎽', desc: 'Structured modern two-piece' },
    { name: 'Boubou',  icon: '🪭', desc: 'Grand flowing Sahel wear' },
    { name: 'Dashiki', icon: '👕', desc: 'Pan-African casual prestige' },
    { name: 'Isiagu',  icon: '🦁', desc: 'Igbo heritage ceremonial' },
    { name: 'Wedding Attire', icon: '💍', desc: 'Bespoke ceremonial ensemble' },
    { name: 'Afro-fusion', icon: '✨', desc: 'Modern African innovation' },
  ];
  const FABRICS = ['Aso-Oke', 'Ankara', 'Adire', 'Kente', 'Damask', 'Lace', 'George', 'Brocade', 'Cotton Lawn', 'Silk Blend'];
  const STEP_LABELS = ['Identity', 'Occasion', 'Outfit', 'Fabric', 'AI Style', 'Measurements', 'Reference', 'Artisan', 'Review'];

  $: progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
</script>

<svelte:head><title>HD Bespoke Atelier — Commission</title></svelte:head>

<!-- Header -->
<section class="px-6 md:px-16 pt-12 pb-8 border-b border-white/5">
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-6 h-px bg-hd-gold" />
      <span class="mono text-hd-gold text-[9px] uppercase tracking-widest">HD BESPOKE ATELIER</span>
    </div>
    <h1 class="text-4xl md:text-6xl font-serif italic text-white">Commission Your <span class="text-hd-gold not-italic">Masterpiece</span></h1>
  </div>
</section>

<!-- Progress bar -->
<div class="px-6 md:px-16 py-8 max-w-4xl mx-auto">
  <!-- Step labels -->
  <div class="flex justify-between mb-3 overflow-hidden">
    {#each STEP_LABELS as label, i}
      <div class="flex flex-col items-center gap-1 {step === i + 1 ? 'opacity-100' : step > i + 1 ? 'opacity-60' : 'opacity-20'}">
        <div class="w-6 h-6 rounded-full border flex items-center justify-center mono text-[8px] transition-all {step > i + 1 ? 'bg-hd-gold border-hd-gold text-hd-black' : step === i + 1 ? 'border-hd-gold text-hd-gold' : 'border-white/20 text-white/30'}">
          {step > i + 1 ? '✓' : i + 1}
        </div>
        <span class="mono text-[7px] uppercase hidden md:block">{label}</span>
      </div>
    {/each}
  </div>
  <div class="h-px bg-white/10">
    <div class="h-full bg-hd-gold transition-all duration-700" style="width: {progress}%" />
  </div>
</div>

<!-- Wizard body -->
<div class="px-6 md:px-16 pb-32 max-w-4xl mx-auto">

  <!-- STEP 1: Identity check -->
  {#if step === 1}
    <div in:fly={{ x: 40, duration: 400 }}>
      <h2 class="text-3xl font-serif italic text-white mb-2">Welcome, <span class="text-hd-gold">{$userProfile?.display_name ?? 'Sovereign'}</span></h2>
      <p class="font-serif italic text-white/50 mb-10">Your commission journey begins with a moment of clarity.</p>

      {#if !$currentUser}
        <div class="hd-card p-8 text-center space-y-4">
          <p class="font-serif italic text-white/70">Authentication required for bespoke commissions.</p>
          <a href="/auth?redirect=/atelier" class="hd-btn-primary inline-flex">AUTHENTICATE</a>
        </div>
      {:else}
        <div class="hd-card p-8 space-y-6">
          <div class="flex items-center gap-6">
            <div class="w-20 h-20 bg-hd-gold/20 border border-hd-gold/30 flex items-center justify-center font-serif text-hd-gold text-3xl font-bold">
              {$userProfile?.username?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <p class="font-serif italic text-white text-xl">{$userProfile?.display_name}</p>
              <p class="mono text-hd-gold text-[9px] uppercase tracking-widest mt-1">{$userProfile?.prestige_tier} — {$userProfile?.xp ?? 0} XP</p>
              {#if savedMeasurements.length > 0}
                <p class="mono text-white/40 text-[9px] mt-1">{savedMeasurements.length} saved measurement profile{savedMeasurements.length > 1 ? 's' : ''}</p>
              {/if}
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
            <div class="text-center"><p class="mono text-hd-gold text-lg font-bold">₦0</p><p class="mono text-white/30 text-[8px] uppercase">Active Orders</p></div>
            <div class="text-center"><p class="mono text-hd-gold text-lg font-bold">{$userProfile?.lee_balance ?? 0}</p><p class="mono text-white/30 text-[8px] uppercase">LEE Coins</p></div>
            <div class="text-center"><p class="mono text-hd-gold text-lg font-bold">{savedMeasurements.length}</p><p class="mono text-white/30 text-[8px] uppercase">Saved Profiles</p></div>
          </div>

          <button on:click={next} class="hd-btn-primary w-full">BEGIN COMMISSION →</button>
        </div>
      {/if}
    </div>

  <!-- STEP 2: Occasion -->
  {:else if step === 2}
    <div in:fly={{ x: 40, duration: 400 }}>
      <h2 class="text-3xl font-serif italic text-white mb-8">What is the <span class="text-hd-gold not-italic">occasion?</span></h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {#each OCCASIONS as occ}
          <button
            on:click={() => { form.occasion = occ; if (occ !== 'Other') next(); }}
            class="hd-card p-5 text-center font-serif italic text-sm transition-all hover:border-hd-gold/50 {form.occasion === occ ? 'border-hd-gold text-hd-gold' : 'text-white/70'}"
          >
            {occ}
          </button>
        {/each}
      </div>
      {#if form.occasion === 'Other'}
        <div class="space-y-3">
          <label class="hd-label">Describe your occasion</label>
          <input bind:value={form.occasion_custom} placeholder="e.g. Royal installation ceremony..." class="hd-input" />
          <button on:click={next} class="hd-btn-primary" disabled={!form.occasion_custom}>CONTINUE →</button>
        </div>
      {/if}
    </div>

  <!-- STEP 3: Outfit Type -->
  {:else if step === 3}
    <div in:fly={{ x: 40, duration: 400 }}>
      <h2 class="text-3xl font-serif italic text-white mb-8">Select your <span class="text-hd-gold not-italic">garment</span></h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each OUTFIT_TYPES as ot}
          <button
            on:click={() => { form.outfit_type = ot.name; next(); }}
            class="hd-card p-6 text-center space-y-3 hover:border-hd-gold/50 transition-all group {form.outfit_type === ot.name ? 'border-hd-gold' : ''}"
          >
            <div class="text-4xl">{ot.icon}</div>
            <h3 class="font-serif italic text-white text-sm group-hover:text-hd-gold transition-colors">{ot.name}</h3>
            <p class="mono text-white/30 text-[8px]">{ot.desc}</p>
          </button>
        {/each}
      </div>
    </div>

  <!-- STEP 4: Fabric -->
  {:else if step === 4}
    <div in:fly={{ x: 40, duration: 400 }}>
      <h2 class="text-3xl font-serif italic text-white mb-8">Choose your <span class="text-hd-gold not-italic">fabric</span></h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {#each FABRICS as f}
          <button
            on:click={() => { form.fabric = f; }}
            class="hd-card py-4 px-3 text-center mono text-[10px] uppercase tracking-wider hover:border-hd-gold/50 transition-all {form.fabric === f ? 'border-hd-gold text-hd-gold' : 'text-white/60'}"
          >
            {f}
          </button>
        {/each}
      </div>
      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="space-y-2">
          <label class="hd-label">Primary Color</label>
          <input bind:value={form.color} placeholder="Navy blue, Ivory, Royal gold..." class="hd-input" />
        </div>
        <div class="space-y-2">
          <label class="hd-label">Embroidery / Detail Notes</label>
          <input bind:value={form.embroidery} placeholder="Subtle gold embroidery on neckline..." class="hd-input" />
        </div>
      </div>
      <button on:click={next} disabled={!form.fabric || !form.color} class="hd-btn-primary">CONTINUE →</button>
    </div>

  <!-- STEP 5: AI Style Suggestions -->
  {:else if step === 5}
    <div in:fly={{ x: 40, duration: 400 }}>
      <h2 class="text-3xl font-serif italic text-white mb-2">Leema <span class="text-hd-gold not-italic">Style Intelligence</span></h2>
      <p class="font-serif italic text-white/50 mb-8">AI-generated recommendations based on your selections.</p>

      {#if !aiSuggestions && !aiLoading}
        <button on:click={getAISuggestions} class="hd-btn-primary mb-8">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          CONSULT LEEMA AI
        </button>
      {/if}

      {#if aiLoading}
        <div class="hd-card p-8 flex items-center gap-6">
          <div class="w-12 h-12 bg-hd-gold/20 flex items-center justify-center text-hd-gold font-serif font-bold text-lg animate-pulse">L</div>
          <div>
            <p class="font-serif italic text-white/70">Leema is analyzing your cultural context...</p>
            <div class="flex gap-1.5 mt-3">
              {#each Array(3) as _, i}
                <div class="w-2 h-2 bg-hd-gold/60 rounded-full animate-bounce" style="animation-delay: {i * 0.2}s" />
              {/each}
            </div>
          </div>
        </div>
      {:else if aiSuggestions}
        <div class="hd-card p-8 space-y-6">
          <div class="flex items-center gap-3 border-b border-white/5 pb-4">
            <div class="w-8 h-8 bg-hd-gold text-hd-black flex items-center justify-center font-serif font-bold text-sm">L</div>
            <div>
              <p class="mono text-white text-[10px] font-bold">LEEMA RECOMMENDATION</p>
              <p class="mono text-hd-gold text-[8px]">{form.outfit_type} · {form.occasion} · {form.fabric}</p>
            </div>
          </div>
          <p class="font-serif italic text-white/80 leading-relaxed text-lg">
            {aiSuggestions.summary ?? JSON.stringify(aiSuggestions)}
          </p>
          {#if aiSuggestions.fabric_recommendation}
            <div class="grid grid-cols-3 gap-4">
              <div class="hd-card p-4 text-center"><p class="mono text-[8px] text-white/40 uppercase mb-2">Fabric</p><p class="font-serif italic text-white text-sm">{aiSuggestions.fabric_recommendation}</p></div>
              <div class="hd-card p-4 text-center"><p class="mono text-[8px] text-white/40 uppercase mb-2">Complexity</p><p class="font-serif italic text-white text-sm">{aiSuggestions.complexity ?? 'Haute'}</p></div>
              <div class="hd-card p-4 text-center"><p class="mono text-[8px] text-white/40 uppercase mb-2">Est. Cost</p><p class="font-serif italic text-hd-gold text-sm">₦{aiSuggestions.cost_estimate ?? '45,000–90,000'}</p></div>
            </div>
          {/if}
          <button on:click={() => aiSuggestions = null} class="mono text-[9px] text-white/30 hover:text-hd-gold">Re-consult Leema →</button>
        </div>
      {/if}
      <div class="flex gap-4 mt-8">
        <button on:click={prev} class="hd-btn-outline">← BACK</button>
        <button on:click={next} class="hd-btn-primary flex-1">CONTINUE →</button>
      </div>
    </div>

  <!-- STEP 6: Measurements -->
  {:else if step === 6}
    <div in:fly={{ x: 40, duration: 400 }}>
      <h2 class="text-3xl font-serif italic text-white mb-2">Your <span class="text-hd-gold not-italic">Dimensions</span></h2>
      <p class="font-serif italic text-white/50 mb-8">All measurements in centimetres. Or paste WhatsApp tailoring text below.</p>

      <!-- Neural auto-fill -->
      <div class="hd-card p-6 mb-8 space-y-4">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-6 h-6 bg-hd-gold/20 flex items-center justify-center text-hd-gold text-xs">AI</div>
          <span class="mono text-[9px] uppercase tracking-widest text-white/60">Neural Auto-Fill</span>
        </div>
        <textarea
          bind:value={form.measurement_text}
          placeholder='Paste tailoring text: "Chest 42 shoulder 18 sleeve 25 slim fit"'
          class="hd-input h-20 resize-none text-sm"
        />
        {#if autoFillWarnings.length > 0}
          {#each autoFillWarnings as w}
            <p class="mono text-amber-400 text-[9px]">⚠ {w}</p>
          {/each}
        {/if}
        <button on:click={autoFill} disabled={!form.measurement_text} class="hd-btn-outline text-[9px] py-2">
          AUTO-EXTRACT MEASUREMENTS
        </button>
      </div>

      <!-- Measurement grid (animated body reference) -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {#each [
          ['chest','Chest / Bust'],['waist','Waist'],['hips','Hips'],
          ['shoulder','Shoulder Width'],['sleeve','Sleeve Length'],['inseam','Inseam'],
          ['neck','Neck'],['arm_length','Arm Length'],['outfit_length','Outfit Length'],
          ['wrist','Wrist'],['thigh','Thigh'],['ankle','Ankle'],
        ] as [field, label]}
          <div class="space-y-1">
            <label class="hd-label">{label}</label>
            <div class="relative">
              <input
                type="number"
                bind:value={(form.measurements as any)[field]}
                placeholder="—"
                class="hd-input pr-10 text-sm"
                min="0" max="300" step="0.5"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 mono text-white/30 text-[9px]">cm</span>
            </div>
          </div>
        {/each}
      </div>

      <!-- Fit preference -->
      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="space-y-2">
          <label class="hd-label">Fit Preference</label>
          <select bind:value={form.fit_preference} class="hd-input">
            {#each ['slim','regular','relaxed','oversized'] as f}
              <option value={f} class="bg-hd-black capitalize">{f}</option>
            {/each}
          </select>
        </div>
        <div class="space-y-2">
          <label class="hd-label">Body Type</label>
          <select bind:value={form.body_type} class="hd-input">
            {#each ['slim','athletic','regular','full'] as b}
              <option value={b} class="bg-hd-black capitalize">{b}</option>
            {/each}
          </select>
        </div>
      </div>

      {#if savedMeasurements.length > 0}
        <div class="mb-8">
          <p class="hd-label mb-3">Load saved profile</p>
          <div class="flex flex-wrap gap-3">
            {#each savedMeasurements as meas}
              <button
                on:click={() => { form.measurements = meas as any; form.fit_preference = meas.fit_preference; form.body_type = meas.body_type; }}
                class="hd-card px-4 py-2 mono text-[9px] text-white/60 hover:border-hd-gold/40 hover:text-hd-gold transition-all"
              >
                {meas.label}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <div class="flex gap-4">
        <button on:click={prev} class="hd-btn-outline">← BACK</button>
        <button on:click={next} class="hd-btn-primary flex-1">CONTINUE →</button>
      </div>
    </div>

  <!-- STEP 7: Reference Images -->
  {:else if step === 7}
    <div in:fly={{ x: 40, duration: 400 }}>
      <h2 class="text-3xl font-serif italic text-white mb-2">Upload <span class="text-hd-gold not-italic">References</span></h2>
      <p class="font-serif italic text-white/50 mb-8">Inspiration images, style references, or previous tailoring photos.</p>

      <div class="border-2 border-dashed border-white/10 hover:border-hd-gold/30 transition-colors p-16 text-center space-y-4 mb-8 cursor-pointer group">
        <div class="text-4xl opacity-40 group-hover:opacity-70 transition-opacity">📎</div>
        <p class="font-serif italic text-white/40 group-hover:text-white/70 transition-colors">Drag & drop or click to upload</p>
        <p class="mono text-[9px] text-white/20 uppercase">JPG, PNG, WEBP — max 10MB each</p>
      </div>

      <div class="space-y-4 mb-8">
        <label class="hd-label">Or paste image URLs</label>
        <textarea
          bind:value={form.special_instructions}
          placeholder="Special tailoring notes, cultural context, specific requirements..."
          class="hd-input h-28 resize-none text-sm"
        />
      </div>

      <div class="flex gap-4">
        <button on:click={prev} class="hd-btn-outline">← BACK</button>
        <button on:click={next} class="hd-btn-primary flex-1">CONTINUE →</button>
      </div>
    </div>

  <!-- STEP 8: Artisan Match -->
  {:else if step === 8}
    <div in:fly={{ x: 40, duration: 400 }}>
      <h2 class="text-3xl font-serif italic text-white mb-2">Select your <span class="text-hd-gold not-italic">Artisan</span></h2>
      <p class="font-serif italic text-white/50 mb-8">Leema-matched masters for your commission profile.</p>

      {#if artisans.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {#each artisans as artisan}
            <button
              on:click={() => { form.artisan_id = artisan.id; }}
              class="hd-card p-6 text-left hover:border-hd-gold/50 transition-all {form.artisan_id === artisan.id ? 'border-hd-gold' : ''}"
            >
              <div class="flex items-start gap-4">
                {#if artisan.portfolio_images?.[0]}
                  <img src={artisan.portfolio_images[0]} alt="" class="w-16 h-16 object-cover" />
                {:else}
                  <div class="w-16 h-16 bg-hd-gold/10 flex items-center justify-center text-2xl">🪡</div>
                {/if}
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="font-serif italic text-white">{artisan.store_name}</h3>
                    {#if artisan.is_verified}
                      <span class="mono text-[7px] bg-hd-gold/20 text-hd-gold px-2 py-0.5 uppercase">Verified</span>
                    {/if}
                  </div>
                  <p class="mono text-white/40 text-[9px] mt-1">{artisan.location}</p>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    {#each (artisan.specialty || []).slice(0, 3) as spec}
                      <span class="mono text-[7px] border border-white/10 px-2 py-0.5 text-white/50">{spec}</span>
                    {/each}
                  </div>
                  <div class="flex items-center gap-4 mt-3">
                    <span class="mono text-[9px] text-hd-gold">⭐ {artisan.rating}</span>
                    <span class="mono text-[9px] text-white/40">{artisan.orders_completed} orders</span>
                    <span class="mono text-[9px] text-white/40">{artisan.turnaround_days}d</span>
                  </div>
                </div>
              </div>
            </button>
          {/each}
        </div>
      {:else}
        <div class="hd-card p-8 text-center mb-8">
          <p class="font-serif italic text-white/50">Leema is matching you with the finest artisans...</p>
          <p class="mono text-[9px] text-white/30 mt-2 uppercase">Available artisans will appear here shortly.</p>
        </div>
      {/if}

      <div class="flex gap-4">
        <button on:click={prev} class="hd-btn-outline">← BACK</button>
        <button on:click={next} class="hd-btn-primary flex-1">REVIEW ORDER →</button>
      </div>
    </div>

  <!-- STEP 9: Review & Submit -->
  {:else if step === 9}
    <div in:fly={{ x: 40, duration: 400 }}>
      {#if submitted}
        <!-- SUCCESS -->
        <div class="text-center py-16 space-y-8" in:fade={{ duration: 600 }}>
          <div class="w-24 h-24 bg-hd-gold mx-auto flex items-center justify-center text-hd-black text-4xl">✓</div>
          <h2 class="text-4xl font-serif italic text-white">Commission <span class="text-hd-gold">Received</span></h2>
          <p class="font-serif italic text-white/60 max-w-md mx-auto">Your masterpiece has entered the HD Atelier production ledger. Your artisan will be in contact within 24 hours.</p>
          <div class="hd-card p-6 max-w-sm mx-auto">
            <p class="hd-label mb-2">Commission Reference</p>
            <p class="mono text-hd-gold text-xl font-bold">{orderRef}</p>
          </div>
          <div class="flex gap-4 justify-center">
            <a href="/profile" class="hd-btn-outline">VIEW ORDERS</a>
            <a href="/" class="hd-btn-primary">BACK TO ARCHIVE</a>
          </div>
        </div>
      {:else}
        <h2 class="text-3xl font-serif italic text-white mb-8">Review Your <span class="text-hd-gold not-italic">Commission</span></h2>
        <div class="hd-card p-8 space-y-6 mb-8">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            {#each [
              ['Occasion', form.occasion || form.occasion_custom],
              ['Garment', form.outfit_type],
              ['Fabric', form.fabric],
              ['Color', form.color],
              ['Embroidery', form.embroidery || '—'],
              ['Fit', form.fit_preference],
            ] as [label, val]}
              <div>
                <p class="hd-label mb-1">{label}</p>
                <p class="font-serif italic text-white capitalize">{val}</p>
              </div>
            {/each}
          </div>
          {#if Object.keys(form.measurements).length > 0}
            <div class="border-t border-white/5 pt-6">
              <p class="hd-label mb-3">Measurements</p>
              <p class="mono text-white/60 text-sm">{formatMeasurementsSummary(form.measurements as any)}</p>
            </div>
          {/if}
          {#if aiSuggestions}
            <div class="border-t border-white/5 pt-6">
              <p class="hd-label mb-3">Leema Recommendation</p>
              <p class="font-serif italic text-white/70 text-sm">{aiSuggestions.summary ?? '—'}</p>
            </div>
          {/if}
        </div>
        <div class="flex gap-4">
          <button on:click={prev} class="hd-btn-outline">← EDIT</button>
          <button
            on:click={submitOrder}
            disabled={submitting}
            class="hd-btn-primary flex-1 {submitting ? 'opacity-50 cursor-not-allowed' : ''}"
          >
            {submitting ? 'TRANSMITTING...' : 'CONFIRM & COMMISSION →'}
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>
