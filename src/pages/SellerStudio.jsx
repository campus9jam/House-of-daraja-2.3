import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../api/entities';

const CATEGORIES = ['Heritage', 'Streetwear', 'Atelier', 'Accessories', 'Footwear', 'Jewellery'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];
const MATERIALS = ['Cotton', 'Silk', 'Linen', 'Wool', 'Aso-oke', 'Ankara', 'Leather', 'Mixed'];

export default function SellerStudio() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    material: '',
    origin: '',
    sizes: [],
    tags: '',
    stock: '',
    images: [''],
    is_featured: false,
    status: 'active',
  });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const toggleSize = (size) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size],
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        original_price: parseFloat(form.original_price) || parseFloat(form.price),
        stock: parseInt(form.stock),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: form.images.filter(Boolean),
      };
      await Product.create(data);
      setSubmitted(true);
    } catch (err) {
      alert('Error creating product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-[#C5A059] text-6xl mb-6">✦</div>
          <h2 className="text-3xl font-serif text-white font-light mb-3">Product Listed</h2>
          <p className="text-white/50 mb-8">Your product has been submitted and is now live on the marketplace.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => { setSubmitted(false); setStep(1); setForm({ name:'',description:'',price:'',original_price:'',category:'',material:'',origin:'',sizes:[],tags:'',stock:'',images:[''],is_featured:false,status:'active' }); }}
              className="bg-[#C5A059] text-black px-8 py-3 text-xs uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors"
            >List Another</button>
            <button onClick={() => navigate('/vendor')}
              className="border border-white/20 text-white/60 px-8 py-3 text-xs uppercase tracking-[0.3em] hover:border-white/50 transition-colors"
            >Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-6 md:px-16 py-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-px bg-[#C5A059]" />
          <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">Seller Portal</span>
        </div>
        <h1 className="text-4xl font-serif text-white font-light">Seller Studio</h1>
        <p className="text-white/40 text-sm mt-2">List a new product on House of Daraja marketplace</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-10">
        {[{ n:1, l:'Product Info' }, { n:2, l:'Media & Variants' }, { n:3, l:'Pricing' }].map(({ n, l }) => (
          <React.Fragment key={n}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold ${step >= n ? 'bg-[#C5A059] text-black' : 'bg-white/10 text-white/40'}`}>{n}</div>
              <span className={`text-xs uppercase tracking-[0.2em] hidden md:block ${step >= n ? 'text-white' : 'text-white/30'}`}>{l}</span>
            </div>
            {n < 3 && <div className={`flex-1 max-w-8 h-px ${step > n ? 'bg-[#C5A059]' : 'bg-white/10'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Product Name *</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
              placeholder="e.g. Heritage Kaftan — Gold Edition"
              className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
            />
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Description *</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              rows={4} placeholder="Describe the piece — material, craftsmanship, heritage story..."
              className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Category *</label>
              <select value={form.category} onChange={e => update('category', e.target.value)}
                className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059]"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Material</label>
              <select value={form.material} onChange={e => update('material', e.target.value)}
                className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059]"
              >
                <option value="">Select material</option>
                {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Origin / Made In</label>
            <input type="text" value={form.origin} onChange={e => update('origin', e.target.value)}
              placeholder="e.g. Lagos, Nigeria"
              className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
            />
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Tags (comma separated)</label>
            <input type="text" value={form.tags} onChange={e => update('tags', e.target.value)}
              placeholder="heritage, luxury, kaftan, gold"
              className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
            />
          </div>
          <button onClick={() => setStep(2)} disabled={!form.name || !form.description || !form.category}
            className="w-golden bg-[#C5A059] text-black py-4 text-sm uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors disabled:opacity-40"
          >Continue →</button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Product Images (URLs)</label>
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="url" value={img} onChange={e => {
                  const imgs = [...form.images]; imgs[i] = e.target.value; update('images', imgs);
                }}
                  placeholder={`Image URL ${i + 1}`}
                  className="flex-1 bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
                />
                {i > 0 && (
                  <button onClick={() => update('images', form.images.filter((_, j) => j !== i))}
                    className="w-11 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 transition-all"
                  >✕</button>
                )}
              </div>
            ))}
            {form.images.length < 5 && (
              <button onClick={() => update('images', [...form.images, ''])}
                className="text-[#C5A059] text-xs uppercase tracking-[0.2em] hover:text-white transition-colors mt-1"
              >+ Add Image</button>
            )}
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-3">Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(s => (
                <button key={s} onClick={() => toggleSize(s)}
                  className={`px-4 py-2 text-sm border transition-all ${
                    form.sizes.includes(s) ? 'border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059]' : 'border-white/10 text-white/50 hover:border-white/30'
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`relative w-10 h-5 rounded-full cursor-pointer transition-all ${form.is_featured ? 'bg-[#C5A059]' : 'bg-white/20'}`}
              onClick={() => update('is_featured', !form.is_featured)}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.is_featured ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-white/60 text-sm">Mark as Featured Product</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="px-8 border border-white/20 text-white/50 py-4 text-xs uppercase tracking-[0.2em] hover:border-white/50 transition-colors">← Back</button>
            <button onClick={() => setStep(3)}
              className="flex-1 bg-[#C5A059] text-black py-4 text-sm uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors"
            >Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Selling Price (₦) *</label>
              <input type="number" value={form.price} onChange={e => update('price', e.target.value)}
                placeholder="e.g. 45000"
                className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Original Price (₦)</label>
              <input type="number" value={form.original_price} onChange={e => update('original_price', e.target.value)}
                placeholder="If on sale"
                className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
              />
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Stock Quantity *</label>
            <input type="number" value={form.stock} onChange={e => update('stock', e.target.value)}
              placeholder="Available units"
              className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
            />
          </div>

          {/* Review summary */}
          <div className="bg-[#0E0E0E] border border-white/5 p-6 space-y-3">
            <div className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4">Review Summary</div>
            {[
              ['Name', form.name],
              ['Category', form.category],
              ['Price', form.price ? `₦${parseInt(form.price).toLocaleString()}` : '—'],
              ['Sizes', form.sizes.join(', ') || 'None selected'],
              ['Images', `${form.images.filter(Boolean).length} added`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-white/30">{k}</span>
                <span className="text-white/70">{v || '—'}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="px-8 border border-white/20 text-white/50 py-4 text-xs uppercase tracking-[0.2em] hover:border-white/50 transition-colors">← Back</button>
            <button onClick={handleSubmit} disabled={submitting || !form.price || !form.stock}
              className="flex-1 bg-[#C5A059] text-black py-4 text-sm uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors disabled:opacity-40"
            >
              {submitting ? 'Listing...' : 'Publish Product ✦'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
