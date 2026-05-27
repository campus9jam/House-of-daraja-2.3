<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { currentUser, isAdmin, isArtisan } from '$lib/stores/auth';
  import { validateImageFile, createLocalPreview, uploadMultiple } from '$lib/utils/imageUpload';

  let products: any[] = [];
  let loading = true;
  let showForm = false;
  let editingId: string | null = null;
  let saving = false;

  const DEPARTMENTS = [
    { id: 'royal-heritage', label: '👑 Royal Heritage' },
    { id: 'afro-urban', label: '⚡ Afro Urban Streetwear' },
    { id: 'accessories', label: '✦ Accessories (Shoes, Bags, Phone Covers)' },
    { id: 'kano-textiles', label: '🧵 Kano Textiles Market' },
  ];

  let form = {
    name: '', description: '', price: '', original_price: '',
    department: 'royal-heritage', material: '', origin: '',
    sizes: [] as string[], tags: '',
    status: 'draft',
    image_files: [] as File[],
    image_previews: [] as string[],
    image_urls: [] as string[],
    existing_images: [] as string[],
  };

  const SIZE_OPTIONS: Record<string, string[]> = {
    clothing: ['XS','S','M','L','XL','XXL','3XL'],
    shoes: ['37','38','39','40','41','42','43','44','45'],
    fabric: ['1 yard','3 yards','5 yards','10 yards'],
    accessories: ['One Size'],
  };

  onMount(async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    products = data ?? [];
    loading = false;
  });

  function resetForm() {
    form = { name:'', description:'', price:'', original_price:'', department:'royal-heritage', material:'', origin:'', sizes:[], tags:'', status:'draft', image_files:[], image_previews:[], image_urls:[], existing_images:[] };
    editingId = null;
  }

  function editProduct(p: any) {
    form.name        = p.name;
    form.description = p.description ?? '';
    form.price       = String(p.price);
    form.original_price = String(p.original_price ?? '');
    form.department  = p.department ?? 'royal-heritage';
    form.material    = p.material ?? '';
    form.origin      = p.origin ?? '';
    form.sizes       = p.sizes ?? [];
    form.tags        = (p.tags ?? []).join(', ');
    form.status      = p.status ?? 'draft';
    form.image_files = [];
    form.image_previews = [];
    form.image_urls  = [];
    form.existing_images = p.images ?? [];
    editingId = p.id;
    showForm = true;
    window.scrollTo(0, 0);
  }

  async function handleImages(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    for (const f of Array.from(files)) {
      const err = validateImageFile(f);
      if (err) { alert(err); return; }
    }
    form.image_files = [...form.image_files, ...Array.from(files)];
    for (const f of Array.from(files)) {
      const p = await createLocalPreview(f);
      form.image_previews = [...form.image_previews, p];
    }
  }

  function removeNewImage(i: number) {
    form.image_files = form.image_files.filter((_,j) => j !== i);
    form.image_previews = form.image_previews.filter((_,j) => j !== i);
  }
  function removeExistingImage(i: number) {
    form.existing_images = form.existing_images.filter((_,j) => j !== i);
  }
  function toggleSize(s: string) {
    form.sizes = form.sizes.includes(s) ? form.sizes.filter(x => x !== s) : [...form.sizes, s];
  }

  async function saveProduct() {
    saving = true;
    try {
      let uploadedUrls: string[] = [];
      if (form.image_files.length > 0) {
        const results = await uploadMultiple(form.image_files, 'products', `vendor-${$currentUser?.id}`);
        uploadedUrls = results.map(r => r.url);
      }
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        department: form.department,
        material: form.material,
        origin: form.origin,
        sizes: form.sizes,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: form.status,
        images: [...form.existing_images, ...uploadedUrls],
        vendor_id: $currentUser?.id,
      };

      if (editingId) {
        const { data } = await supabase.from('products').update(payload).eq('id', editingId).select().single();
        products = products.map(p => p.id === editingId ? data : p);
      } else {
        const { data } = await supabase.from('products').insert(payload).select().single();
        if (data) products = [data, ...products];
      }
      resetForm();
      showForm = false;
    } finally {
      saving = false;
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await supabase.from('products').delete().eq('id', id);
    products = products.filter(p => p.id !== id);
  }

  $: sizeSet = form.department === 'accessories' ? 'accessories' : form.department === 'kano-textiles' ? 'fabric' : 'clothing';
</script>

<svelte:head><title>Inventory — House of Daraja</title></svelte:head>

<div class="min-h-screen bg-[#050505] pt-16 pb-24">
  <div class="max-w-4xl mx-auto px-4 py-8">

    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <p class="mono text-hd-gold/50 text-[9px] uppercase tracking-[0.4em] mb-1">Vendor Studio</p>
        <h1 class="font-serif text-3xl text-white font-light">Inventory</h1>
      </div>
      <button
        on:click={() => { resetForm(); showForm = !showForm; }}
        class="bg-hd-gold text-black mono text-[9px] uppercase tracking-widest px-5 py-2.5 font-semibold hover:bg-hd-gold/90 transition-colors flex items-center gap-2"
      >
        <span>{showForm ? '✕ Cancel' : '+ Add Item'}</span>
      </button>
    </div>

    <!-- Add/Edit Form -->
    {#if showForm}
      <div class="bg-white/[0.02] border border-hd-gold/20 p-6 mb-8" in:fly={{ y: -20, duration: 350 }}>
        <h2 class="font-serif text-xl text-white mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>

        <div class="space-y-5">
          <!-- Images -->
          <div>
            <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-3">Product Images *</label>

            <!-- Existing images -->
            {#if form.existing_images.length > 0}
              <div class="flex gap-2 flex-wrap mb-3">
                {#each form.existing_images as img, i}
                  <div class="relative w-20 h-20">
                    <img src={img} alt="" class="w-full h-full object-cover border border-white/10" />
                    <button on:click={() => removeExistingImage(i)} class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white flex items-center justify-center text-[9px] hover:bg-red-600">✕</button>
                  </div>
                {/each}
              </div>
            {/if}

            <!-- Upload zone -->
            <label class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/10 hover:border-hd-gold/30 transition-all cursor-pointer bg-white/[0.02] group">
              <input type="file" class="hidden" accept="image/*" multiple on:change={handleImages} />
              <svg class="w-7 h-7 text-white/20 group-hover:text-hd-gold/40 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p class="mono text-[8px] uppercase tracking-widest text-white/30 group-hover:text-hd-gold/40 transition-colors">Click to upload product images</p>
              <p class="text-white/20 text-[10px] mt-1">JPEG, PNG, WebP · Max 10MB · Multiple allowed</p>
            </label>

            <!-- New image previews -->
            {#if form.image_previews.length > 0}
              <div class="flex gap-2 flex-wrap mt-3">
                {#each form.image_previews as prev, i}
                  <div class="relative w-20 h-20">
                    <img src={prev} alt="" class="w-full h-full object-cover border border-hd-gold/20" />
                    <button on:click={() => removeNewImage(i)} class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white flex items-center justify-center text-[9px] hover:bg-red-600">✕</button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Name & Price row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">Product Name *</label>
              <input bind:value={form.name} class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors placeholder-white/20" placeholder="e.g. Karama Kaftan" />
            </div>
            <div>
              <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">Department *</label>
              <select bind:value={form.department} class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors">
                {#each DEPARTMENTS as d}
                  <option value={d.id} class="bg-[#050505]">{d.label}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">Price (₦) *</label>
              <input bind:value={form.price} type="number" min="0" class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors placeholder-white/20" placeholder="120000" />
            </div>
            <div>
              <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">Original Price (₦)</label>
              <input bind:value={form.original_price} type="number" min="0" class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors placeholder-white/20" placeholder="Optional" />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">Description</label>
            <textarea bind:value={form.description} rows="3" class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none resize-none transition-colors placeholder-white/20" placeholder="Describe this piece..."></textarea>
          </div>

          <!-- Material & Origin -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">Material</label>
              <input bind:value={form.material} class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors placeholder-white/20" placeholder="e.g. 100% Brocade" />
            </div>
            <div>
              <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">Origin</label>
              <input bind:value={form.origin} class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors placeholder-white/20" placeholder="e.g. Lagos, Nigeria" />
            </div>
          </div>

          <!-- Sizes -->
          <div>
            <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-2">Sizes Available</label>
            <div class="flex gap-2 flex-wrap">
              {#each SIZE_OPTIONS[sizeSet] ?? SIZE_OPTIONS.clothing as s}
                <button
                  type="button"
                  on:click={() => toggleSize(s)}
                  class="px-3 py-2 border mono text-[9px] uppercase tracking-wider transition-all {form.sizes.includes(s) ? 'border-hd-gold text-hd-gold bg-hd-gold/5' : 'border-white/10 text-white/30 hover:border-white/20'}"
                >{s}</button>
              {/each}
            </div>
          </div>

          <!-- Tags & Status -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">Tags</label>
              <input bind:value={form.tags} class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors placeholder-white/20" placeholder="kaftan, heritage, luxury" />
            </div>
            <div>
              <label class="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1.5">Status</label>
              <select bind:value={form.status} class="w-full bg-white/[0.04] border border-white/[0.08] text-white px-4 py-3 text-sm focus:border-hd-gold/50 focus:outline-none transition-colors">
                <option value="draft" class="bg-[#050505]">Draft</option>
                <option value="published" class="bg-[#050505]">Published</option>
                <option value="archived" class="bg-[#050505]">Archived</option>
              </select>
            </div>
          </div>

          <button
            on:click={saveProduct}
            disabled={saving || !form.name || !form.price}
            class="w-full py-4 bg-hd-gold text-black mono text-[10px] uppercase tracking-widest font-semibold hover:bg-hd-gold/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {#if saving}
              <div class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              Saving...
            {:else}
              {editingId ? '✓ Update Product' : '+ Publish Product'}
            {/if}
          </button>
        </div>
      </div>
    {/if}

    <!-- Products table -->
    {#if loading}
      <div class="space-y-3">
        {#each Array(5) as _}
          <div class="h-16 bg-white/[0.03] animate-pulse"></div>
        {/each}
      </div>
    {:else}
      <div class="space-y-2">
        {#each products as p, i (p.id)}
          <div class="flex items-center gap-4 bg-white/[0.02] border border-white/[0.06] p-3 hover:border-white/10 transition-all" in:fly={{ y: 5, delay: i * 30 }}>
            <div class="w-12 h-14 flex-shrink-0 overflow-hidden bg-white/[0.04]">
              <img src={p.images?.[0] ?? '/hd-logo.png'} alt={p.name} class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm font-light truncate">{p.name}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="mono text-[8px] text-hd-gold/60">₦{p.price?.toLocaleString()}</span>
                <span class="text-white/20 text-[8px]">·</span>
                <span class="mono text-[8px] text-white/30 uppercase">{p.department?.replace('-',' ')}</span>
              </div>
            </div>
            <span class="mono text-[7px] uppercase px-2 py-0.5 border {p.status === 'published' ? 'border-green-500/30 text-green-400' : p.status === 'draft' ? 'border-white/10 text-white/30' : 'border-red-500/30 text-red-400'}">
              {p.status}
            </span>
            <div class="flex gap-2">
              <button on:click={() => editProduct(p)} class="text-white/30 hover:text-hd-gold transition-colors p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
              </button>
              <button on:click={() => deleteProduct(p.id)} class="text-white/20 hover:text-red-400 transition-colors p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </div>
          </div>
        {/each}
        {#if products.length === 0}
          <div class="text-center py-16">
            <p class="font-serif text-xl text-white/30">No products yet</p>
            <p class="text-white/20 text-sm mt-2">Add your first product to get started</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
