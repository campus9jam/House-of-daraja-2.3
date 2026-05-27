<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { validateImageFile, createLocalPreview, uploadMultiple } from '$lib/utils/imageUpload';

  let step = 1;
  const TOTAL_STEPS = 7;

  let form = {
    // Step 1 — Occasion
    occasion: '',
    // Step 2 — Outfit type
    outfit_type: '',
    department: 'royal-heritage',
    // Step 3 — Fabric & color
    fabric: '',
    color: '',
    // Step 4 — Style images
    style_images: [] as File[],
    style_image_urls: [] as string[],
    style_previews: [] as string[],
    // Step 5 — Fabric images
    fabric_images: [] as File[],
    fabric_image_urls: [] as string[],
    fabric_previews: [] as string[],
    // Step 6 — Measurements
    bust: '', waist: '', hips: '', shoulder: '', length: '', sleeve: '',
    // Step 7 — Instructions
    special_instructions: '',
  };

  let submitting = false;
  let submitted = false;
  let serialNumber = '';
  let errors: Record<string, string> = {};

  const OCCASIONS = ['Wedding','Naming Ceremony','Political Event','Business Formal','Cultural Festival','Graduation','Religious Ceremony','Red Carpet','Casual Luxury','Other'];
  const OUTFIT_TYPES: Record<string, string[]> = {
    'royal-heritage': ['Agbada Set','Kaftan','Babba Riga','Sen Nen (Hausa)','Iro & Buba','Ankara Suit','Adire Gown'],
    'afro-urban': ['Bomber Jacket','Dashiki Shirt','Urban Kaftan','Street Jumpsuit','Graphic Overcoat'],
    'accessories': ['Leather Shoes','Artisan Bag','Phone Cover','Belt Set','Jewelry Set'],
    'kano-textiles': ['Custom Adire','Ankara Meter','Aso-Oke Bundle','Embroidery Commission'],
  };
  const DEPARTMENTS = [
    { id: 'royal-heritage', label: '👑 Royal Heritage' },
    { id: 'afro-urban', label: '⚡ Afro Urban' },
    { id: 'accessories', label: '✦ Accessories' },
    { id: 'kano-textiles', label: '🧵 Kano Textiles' },
  ];
  const FABRICS = ['Premium Brocade','Swiss Voile','Italian Lace','Ankara Cotton','Aso-Oke','Adire','Kente Cloth','Cashmere Blend','Raw Silk','Cotton Cambric'];

  async function handleStyleImages(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    for (const f of Array.from(files)) {
      const err = validateImageFile(f);
      if (err) { errors.style_images = err; return; }
    }
    errors.style_images = '';
    form.style_images = [...form.style_images, ...Array.from(files)];
    for (const f of Array.from(files)) {
      const preview = await createLocalPreview(f);
      form.style_previews = [...form.style_previews, preview];
    }
  }

  async function handleFabricImages(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    for (const f of Array.from(files)) {
      const err = validateImageFile(f);
      if (err) { errors.fabric_images = err; return; }
    }
    errors.fabric_images = '';
    form.fabric_images = [...form.fabric_images, ...Array.from(files)];
    for (const f of Array.from(files)) {
      const preview = await createLocalPreview(f);
      form.fabric_previews = [...form.fabric_previews, preview];
    }
  }

  function removeStyleImage(idx: number) {
    form.style_images = form.style_images.filter((_, i) => i !== idx);
    form.style_previews = form.style_previews.filter((_, i) => i !== idx);
  }
  function removeFabricImage(idx: number) {
    form.fabric_images = form.fabric_images.filter((_, i) => i !== idx);
    form.fabric_previews = form.fabric_previews.filter((_, i) => i !== idx);
  }

  function next() { if (step < TOTAL_STEPS) step++; }
  function back() { if (step > 1) step--; }

  async function submit() {
    if (!$isAuthenticated) { goto('/auth?redirect=/atelier'); return; }
    submitting = true;
    try {
      // Upload images
      if (form.style_images.length > 0) {
        const results = await uploadMultiple(form.style_images, 'atelier-styles', `${$currentUser!.id}/style`);
        form.style_image_urls = results.map(r => r.url);
      }
      if (form.fabric_images.length > 0) {
        const results = await uploadMultiple(form.fabric_images, 'fabrics', `${$currentUser!.id}/fabric`);
        form.fabric_image_urls = results.map(r => r.url);
      }

      const serial = `ATL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const { data, error } = await supabase.from('atelier_orders').insert({
        user_id: $currentUser!.id,
        occasion: form.occasion,
        outfit_type: form.outfit_type,
        department: form.department,
        fabric: form.fabric,
        color: form.color,
        style_image_refs: form.style_image_urls,
        fabric_image_refs: form.fabric_image_urls,
        bust_chest: parseFloat(form.bust) || null,
        waist: parseFloat(form.waist) || null,
        hips: parseFloat(form.hips) || null,
        shoulder: parseFloat(form.shoulder) || null,
        length: parseFloat(form.length) || null,
        sleeve_length: parseFloat(form.sleeve) || null,
        special_instructions: form.special_instructions,
        status: 'submitted',
        serial_number: serial,
      }).select().single();

      if (!error) {
        serialNumber = serial;
        submitted = true;
      }
    } finally {
      submitting = false;
    }
  }

  $: progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
</script>

<svelte:head><title>Bespoke Atelier — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505] pt-16 pb-28">
  {#if submitted}
    <div class="max-w-lg mx-auto px-4 py-20 text-center" in:fade>
      <div class="w-20 h-20 mx-auto mb-8 relative">
        <img src="/hd-logo.png" alt="HD" class="w-full h-full object-contain opacity-80" />
      </div>
      <p class="mono text-hd-gold/60 text-[9px] uppercase tracking-[0.4em] mb-4">Commission Received</p>
      <h1 class="font-serif text-4xl text-white font-light mb-3">Your Atelier Order</h1>
      <p class="text-white/40 text-sm mb-2">is in the hands of our master artisans</p>
      <div class="my-8 border border-hd-gold/20 p-4 inline-block">
        <p class="mono text-[9px] text-white/30 uppercase tracking-wider mb-1">Serial Number</p>
        <p class="font-serif text-2xl text-hd-gold">{serialNumber}</p>
      </div>
      <p class="text-white/30 text-sm mb-8">You'll receive a price quote within 24–48 hours. Track your order in your profile.</p>
      <div class="flex gap-3 justify-center">
        <a href="/profile?tab=orders" class="bg-hd-gold text-black mono text-[10px] uppercase tracking-widest px-6 py-3 font-semibold">Track Order</a>
        <a href="/shop" class="border border-white/10 text-white/50 mono text-[10px] uppercase tracking-widest px-6 py-3 hover:border-hd-gold/20 transition-colors">Back to Shop</a>
      </div>
    </div>
  {:else}
    <!-- Step header -->
    <div class="max-w-2xl mx-auto px-4 pt-8 pb-4">
      <div class="flex items-center justify-between mb-2">
        <div>
          <p class="mono text-hd-gold/60 text-[9px] uppercase tracking-[0.4em]">Bespoke Commission</p>
          <h1 class="font-serif text-2xl text-white font-light mt-1">Daraja Atelier</h1>
        </div>
        <div class="text-right">
          <span class="mono text-[9px] text-white/30 uppercase">Step {step} of {TOTAL_STEPS}</span>
        </div>
      </div>
      <!-- Progress bar -->
      <div class="h-0.5 bg-white/[0.06] mt-4 overflow-hidden">
        <div class="h-full bg-hd-gold transition-all duration-500" style="width:{progressPct}%"></div>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4">
      <!-- STEP 1: Occasion -->
      {#if step === 1}
        <div in:fly={{ x: 30, duration: 350 }}>
          <h2 class="font-serif text-xl text-white mb-2 mt-6">What's the occasion?</h2>
          <p class="text-white/30 text-sm mb-6">Tell us what you need this piece for</p>
          <div class="grid grid-cols-2 gap-3">
            {#each OCCASIONS as occ}
              <button
                on:click={() => { form.occasion = occ; }}
                class="p-4 border text-left transition-all mono text-[10px] uppercase tracking-wider {form.occasion === occ ? 'border-hd-gold text-hd-gold bg-hd-gold/5' : 'border-white/10 text-white/50 hover:border-white/20'}"
              >{occ}</button>
            {/each}
          </div>
        </div>

      <!-- STEP 2: Department + Outfit type -->
      {:else if step === 2}
        <div in:fly={{ x: 30, duration: 350 }}>
          <h2 class="font-serif text-xl text-white mb-2 mt-6">Choose your department & style</h2>
          <p class="text-white/30 text-sm mb-6">Select the collection category</p>
          <div class="grid grid-cols-2 gap-3 mb-6">
            {#each DEPARTMENTS as dept}
              <button
                on:click={() => { form.department = dept.id; form.outfit_type = ''; }}
                class="p-4 border text-left transition-all mono text-[9px] uppercase tracking-wider {form.department === dept.id ? 'border-hd-gold text-hd-gold bg-hd-gold/5' : 'border-white/10 text-white/50 hover:border-white/20'}"
              >{dept.label}</button>
            {/each}
          </div>
          {#if form.department}
            <p class="text-white/40 text-sm mb-3">Now choose outfit type:</p>
            <div class="space-y-2">
              {#each (OUTFIT_TYPES[form.department] ?? []) as type}
                <button
                  on:click={() => form.outfit_type = type}
                  class="w-full p-3.5 border text-left transition-all mono text-[10px] uppercase tracking-wider {form.outfit_type === type ? 'border-hd-gold text-hd-gold bg-hd-gold/5' : 'border-white/[0.06] text-white/40 hover:border-white/20 hover:text-white/70'}"
                >{type}</button>
              {/each}
            </div>
          {/if}
        </div>

      <!-- STEP 3: Fabric & Color -->
      {:else if step === 3}
        <div in:fly={{ x: 30, duration: 350 }}>
          <h2 class="font-serif text-xl text-white mb-2 mt-6">Fabric & Colour</h2>
          <p class="text-white/30 text-sm mb-6">Choose your preferred materials</p>
          <div class="mb-6">
            <p class="mono text-[9px] uppercase text-white/40 tracking-widest mb-3">Fabric</p>
            <div class="grid grid-cols-2 gap-2">
              {#each FABRICS as f}
                <button
                  on:click={() => form.fabric = f}
                  class="p-3 border text-left transition-all mono text-[9px] uppercase tracking-wider {form.fabric === f ? 'border-hd-gold text-hd-gold bg-hd-gold/5' : 'border-white/[0.06] text-white/30 hover:border-white/20'}"
                >{f}</button>
              {/each}
            </div>
          </div>
          <div>
            <label class="mono text-[9px] uppercase text-white/40 tracking-widest block mb-2">Preferred Colour / Reference</label>
            <input
              bind:value={form.color}
              class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors placeholder-white/20"
              placeholder="e.g. Midnight black, Royal gold, Ivory..."
            />
          </div>
        </div>

      <!-- STEP 4: Style Images Upload -->
      {:else if step === 4}
        <div in:fly={{ x: 30, duration: 350 }}>
          <h2 class="font-serif text-xl text-white mb-2 mt-6">Style Reference Images</h2>
          <p class="text-white/30 text-sm mb-6">Upload images of styles you love — our artisans will use these as inspiration</p>

          <label class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 hover:border-hd-gold/30 transition-all cursor-pointer bg-white/[0.02] group">
            <input type="file" class="hidden" accept="image/*" multiple on:change={handleStyleImages} />
            <div class="text-center">
              <svg class="w-8 h-8 text-white/20 group-hover:text-hd-gold/40 transition-colors mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p class="mono text-[9px] uppercase tracking-widest text-white/30 group-hover:text-hd-gold/50 transition-colors">Upload Style Images</p>
              <p class="text-white/20 text-xs mt-1">JPEG, PNG, WebP · Max 10MB each</p>
            </div>
          </label>

          {#if errors.style_images}<p class="text-red-400 text-xs mt-2 mono">{errors.style_images}</p>{/if}

          {#if form.style_previews.length > 0}
            <div class="grid grid-cols-3 gap-3 mt-4">
              {#each form.style_previews as preview, i}
                <div class="relative aspect-square">
                  <img src={preview} alt="Style ref" class="w-full h-full object-cover border border-white/10" />
                  <button
                    on:click={() => removeStyleImage(i)}
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >✕</button>
                </div>
              {/each}
            </div>
          {/if}
          <p class="text-white/20 text-xs mt-3">Optional — you can skip if you don't have references</p>
        </div>

      <!-- STEP 5: Fabric Images Upload -->
      {:else if step === 5}
        <div in:fly={{ x: 30, duration: 350 }}>
          <h2 class="font-serif text-xl text-white mb-2 mt-6">Fabric Reference Images</h2>
          <p class="text-white/30 text-sm mb-6">Do you already have a fabric in mind? Upload a photo so our artisans can source the exact material</p>

          <label class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 hover:border-hd-gold/30 transition-all cursor-pointer bg-white/[0.02] group">
            <input type="file" class="hidden" accept="image/*" multiple on:change={handleFabricImages} />
            <div class="text-center">
              <svg class="w-8 h-8 text-white/20 group-hover:text-hd-gold/40 transition-colors mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p class="mono text-[9px] uppercase tracking-widest text-white/30 group-hover:text-hd-gold/50 transition-colors">Upload Fabric Reference</p>
              <p class="text-white/20 text-xs mt-1">From your wardrobe, Pinterest, or fabric store</p>
            </div>
          </label>

          {#if errors.fabric_images}<p class="text-red-400 text-xs mt-2 mono">{errors.fabric_images}</p>{/if}

          {#if form.fabric_previews.length > 0}
            <div class="grid grid-cols-3 gap-3 mt-4">
              {#each form.fabric_previews as preview, i}
                <div class="relative aspect-square">
                  <img src={preview} alt="Fabric ref" class="w-full h-full object-cover border border-white/10" />
                  <button
                    on:click={() => removeFabricImage(i)}
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >✕</button>
                </div>
              {/each}
            </div>
          {/if}
          <p class="text-white/20 text-xs mt-3">Optional — skip if you want our artisans to select the fabric</p>
        </div>

      <!-- STEP 6: Measurements -->
      {:else if step === 6}
        <div in:fly={{ x: 30, duration: 350 }}>
          <h2 class="font-serif text-xl text-white mb-2 mt-6">Your Measurements</h2>
          <p class="text-white/30 text-sm mb-6">All measurements in centimetres (cm). Leave blank to use your saved profile measurements.</p>
          <div class="grid grid-cols-2 gap-4">
            {#each [['bust','Bust / Chest'],['waist','Waist'],['hips','Hips'],['shoulder','Shoulder Width'],['length','Outfit Length'],['sleeve','Sleeve Length']] as [field, label]}
              <div>
                <label class="mono text-[8px] uppercase tracking-widest text-white/40 block mb-1.5">{label} (cm)</label>
                <input
                  bind:value={form[field]}
                  type="number"
                  min="0"
                  class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors placeholder-white/20"
                  placeholder="e.g. 94"
                />
              </div>
            {/each}
          </div>
        </div>

      <!-- STEP 7: Special Instructions -->
      {:else if step === 7}
        <div in:fly={{ x: 30, duration: 350 }}>
          <h2 class="font-serif text-xl text-white mb-2 mt-6">Final Instructions</h2>
          <p class="text-white/30 text-sm mb-6">Any other details our artisans should know</p>
          <textarea
            bind:value={form.special_instructions}
            rows="5"
            class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none resize-none transition-colors placeholder-white/20"
            placeholder="e.g. 'I want extra embroidery on the collar', 'No hood', 'Custom lining in red satin'..."
          ></textarea>

          <!-- Summary -->
          <div class="mt-6 bg-white/[0.02] border border-white/[0.06] p-5 space-y-2">
            <p class="mono text-[9px] uppercase tracking-widest text-white/30 mb-3">Order Summary</p>
            {#each [['Occasion', form.occasion],['Department', DEPARTMENTS.find(d=>d.id===form.department)?.label ?? form.department],['Outfit Type', form.outfit_type],['Fabric', form.fabric],['Color', form.color],['Style Images', form.style_previews.length + ' attached'],['Fabric Images', form.fabric_previews.length + ' attached']] as [label, val]}
              {#if val}
                <div class="flex justify-between text-sm">
                  <span class="text-white/30">{label}</span>
                  <span class="text-white/70">{val}</span>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}

      <!-- Nav buttons -->
      <div class="flex gap-3 mt-8 pb-8">
        {#if step > 1}
          <button on:click={back} class="flex-1 py-3.5 border border-white/10 text-white/50 mono text-[10px] uppercase tracking-widest hover:border-white/20 hover:text-white/70 transition-all">← Back</button>
        {/if}
        {#if step < TOTAL_STEPS}
          <button
            on:click={next}
            disabled={
              (step === 1 && !form.occasion) ||
              (step === 2 && (!form.department || !form.outfit_type))
            }
            class="flex-1 py-3.5 bg-hd-gold text-black mono text-[10px] uppercase tracking-widest font-semibold hover:bg-hd-gold/90 transition-all disabled:opacity-40"
          >Continue →</button>
        {:else}
          <button
            on:click={submit}
            disabled={submitting}
            class="flex-1 py-3.5 bg-hd-gold text-black mono text-[10px] uppercase tracking-widest font-semibold hover:bg-hd-gold/90 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {#if submitting}
              <div class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              Submitting Commission...
            {:else}
              ✦ Submit Commission
            {/if}
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>
