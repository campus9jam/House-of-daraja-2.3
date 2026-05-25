import React, { useState, useEffect } from 'react';
import { Product, Order, VendorProfile } from '../api/entities';

export default function VendorDashboard() {
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'Heritage', stock: '', material: '', origin: '', sizes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      VendorProfile.list(),
      Product.list(),
      Order.list(),
    ]).then(([vp, p, o]) => {
      setProfile(vp[0] || null);
      setProducts(p);
      setOrders(o);
    }).finally(() => setLoading(false));
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Product.create({
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock) || 0,
        sizes: productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()) : [],
        status: 'active',
        vendor_name: profile?.store_name || 'My Store',
      });
      Product.list().then(setProducts);
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', price: '', category: 'Heritage', stock: '', material: '', origin: '', sizes: '' });
    } catch (e) {
      alert('Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-[#C5A059] animate-pulse font-serif text-xl">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="py-12 px-6 md:px-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#C5A059]" />
              <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">Vendor Portal</span>
            </div>
            <h1 className="text-4xl font-serif text-white font-light">{profile?.store_name || 'Your Store'}</h1>
            {profile?.is_verified && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-green-400 text-xs">✓</span>
                <span className="text-green-400 text-xs uppercase tracking-[0.2em]">Verified Vendor</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-[#C5A059] text-black px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors"
          >
            + Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 mb-12">
          {[
            { label: 'Products', value: products.length, icon: '◈' },
            { label: 'Total Orders', value: orders.length, icon: '◉' },
            { label: 'Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: '◆' },
            { label: 'Rating', value: profile?.rating ? `${profile.rating}★` : '—', icon: '◇' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#0E0E0E] p-8">
              <div className="text-[#C5A059] text-xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-serif text-white mb-1">{stat.value}</div>
              <div className="text-white/30 text-xs uppercase tracking-[0.3em]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-white/5 mb-8">
          <div className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'products', label: `Products (${products.length})` },
              { id: 'orders', label: `Orders (${orders.length})` },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pb-4 text-xs uppercase tracking-[0.3em] border-b-2 transition-all ${
                  tab === t.id ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4">Recent Products</h3>
              <div className="space-y-3">
                {products.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 border border-white/5 hover:border-white/10 transition-colors">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover" />}
                    <div className="flex-1">
                      <div className="text-white text-sm">{p.name}</div>
                      <div className="text-white/40 text-xs">{p.category}</div>
                    </div>
                    <div className="text-[#C5A059] text-sm">₦{p.price?.toLocaleString()}</div>
                    <div className={`text-xs uppercase px-2 py-1 ${p.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-white/30 bg-white/5'}`}>
                      {p.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="p-4 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm">₦{o.total_amount?.toLocaleString()}</span>
                      <span className={`text-xs uppercase px-2 py-1 ${
                        o.status === 'delivered' ? 'text-green-400 bg-green-400/10' :
                        o.status === 'shipped' ? 'text-blue-400 bg-blue-400/10' :
                        'text-[#C5A059] bg-[#C5A059]/10'
                      }`}>{o.status}</span>
                    </div>
                    <div className="text-white/30 text-xs">{new Date(o.created_date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 border border-white/10 hover:border-white/20 transition-colors">
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-16 h-16 object-cover" />}
                <div className="flex-1">
                  <div className="text-white font-serif">{p.name}</div>
                  <div className="text-white/40 text-xs">{p.category} · {p.material}</div>
                  <div className="text-white/30 text-xs mt-1">Stock: {p.stock} · Orders: {p.orders_count || 0}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#C5A059] text-lg">₦{p.price?.toLocaleString()}</div>
                  <div className={`text-xs uppercase mt-1 ${p.status === 'active' ? 'text-green-400' : 'text-white/30'}`}>{p.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="p-6 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white font-serif text-lg">₦{o.total_amount?.toLocaleString()}</div>
                  <div className={`text-xs uppercase px-3 py-1 ${
                    o.status === 'delivered' ? 'text-green-400 bg-green-400/10' :
                    o.status === 'shipped' ? 'text-blue-400 bg-blue-400/10' :
                    'text-[#C5A059] bg-[#C5A059]/10'
                  }`}>{o.status}</div>
                </div>
                <div className="text-white/30 text-xs">{new Date(o.created_date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                {o.shipping_address && <div className="text-white/40 text-xs mt-2">Ship to: {o.shipping_address}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-6">
          <div className="bg-[#0E0E0E] border border-white/10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-white font-serif text-xl">Add New Product</h2>
              <button onClick={() => setShowAddProduct(false)} className="text-white/30 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={addProduct} className="p-6 space-y-4">
              {[
                { key: 'name', label: 'Product Name', required: true },
                { key: 'price', label: 'Price (₦)', type: 'number', required: true },
                { key: 'stock', label: 'Stock Quantity', type: 'number' },
                { key: 'material', label: 'Material' },
                { key: 'origin', label: 'Origin' },
                { key: 'sizes', label: 'Sizes (comma separated, e.g. S,M,L,XL)' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-white/40 text-xs uppercase tracking-[0.2em] block mb-2">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    value={productForm[field.key]}
                    onChange={e => setProductForm(f => ({ ...f, [field.key]: e.target.value }))}
                    required={field.required}
                    className="w-full bg-[#050505] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              ))}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-[0.2em] block mb-2">Category</label>
                <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-[#050505] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059]"
                >
                  {['Heritage','Streetwear','Atelier','Accessories','Textile'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-[0.2em] block mb-2">Description</label>
                <textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full bg-[#050505] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#C5A059] text-black py-3 text-xs uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Product'}
                </button>
                <button type="button" onClick={() => setShowAddProduct(false)}
                  className="px-6 border border-white/20 text-white/50 text-xs uppercase tracking-[0.2em] hover:border-white/50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
