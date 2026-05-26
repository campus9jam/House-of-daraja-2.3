import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Users, Plus, Search, Filter, ArrowLeft, TrendingUp, AlertCircle, Edit2, Archive, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, VendorProfile } from '../api/entities';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: '' });

  useEffect(() => {
    Promise.all([
      Product.list('-created_date', 50),
      VendorProfile.list()
    ]).then(([prods, vends]) => {
      setProducts(prods);
      setVendors(vends);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = products.filter(p => (p.stock || 0) < 5);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const created = await Product.create({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
        status: 'active'
      });
      setProducts(prev => [created, ...prev]);
      setNewProduct({ name: '', price: '', stock: '', category: '' });
      setShowAdd(false);
      alert('Product added to inventory.');
    } catch (err) {
      console.error(err);
      alert('Failed to add product.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-daraja-charcoal pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto space-y-16">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-daraja-border pb-12">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="p-4 glass border border-white/10 text-white hover:text-daraja-gold transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-daraja-gold mono-text text-[10px]">
                <Package className="w-4 h-4" /> SUPPLY_CHAIN_TERMINAL
              </div>
              <h1 className="text-5xl md:text-7xl font-serif italic text-white tracking-tighter">
                Inventory <span className="text-daraja-gold not-italic">Matrix</span>
              </h1>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-3 px-8 py-4 bg-daraja-gold text-daraja-charcoal mono-text text-[10px] font-bold hover:bg-white transition-all"
          >
            <Plus className="w-4 h-4" /> ADD_MATERIAL
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'TOTAL_SKUs', value: products.length, icon: <Package className="w-4 h-4" /> },
            { label: 'LOW_STOCK', value: lowStock.length, icon: <AlertCircle className="w-4 h-4" />, warn: true },
            { label: 'VENDOR_NODES', value: vendors.length, icon: <Users className="w-4 h-4" /> },
            { label: 'TOTAL_VALUE', value: `₦${(products.reduce((s, p) => s + (p.price * (p.stock || 0)), 0) / 1000000).toFixed(1)}M`, icon: <TrendingUp className="w-4 h-4" /> }
          ].map((stat, i) => (
            <div key={i} className={`luxury-card p-10 space-y-4 ${stat.warn && stat.value > 0 ? 'border-red-500/30' : ''}`}>
              <div className={`p-3 w-fit ${stat.warn && stat.value > 0 ? 'bg-red-500/10 text-red-400' : 'bg-daraja-gold/10 text-daraja-gold'}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[7px] mono-text text-daraja-text-muted">{stat.label}</p>
                <p className="text-4xl font-mono text-white italic mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-daraja-border">
          {['inventory', 'vendors'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 mono-text text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'text-daraja-gold border-b border-daraja-gold -mb-px' : 'text-daraja-text-muted hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-daraja-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="SEARCH_MATRIX..."
            className="w-full bg-daraja-surface border border-daraja-border pl-10 pr-6 py-3 text-white mono-text text-[10px] focus:border-daraja-gold outline-none"
          />
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {loading ? (
              [...Array(5)].map((_, i) => <div key={i} className="luxury-card h-20 animate-pulse" />)
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-daraja-text-muted mono-text text-[10px]">NO_INVENTORY_FOUND</div>
            ) : filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`luxury-card p-6 flex items-center gap-6 hover:border-daraja-gold/40 transition-all ${(product.stock || 0) < 5 ? 'border-red-500/20' : ''}`}
              >
                <div className="w-14 h-14 flex-shrink-0 overflow-hidden">
                  <img
                    src={product.images?.[0] || "https://i.imgur.com/7QFYTZJ.png"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="mono-text text-daraja-gold text-[8px] uppercase">{product.category}</p>
                  <h3 className="font-serif italic text-white text-base truncate">{product.name}</h3>
                </div>
                <div className="text-right space-y-1">
                  <p className="mono-text text-white text-sm">₦{(product.price || 0).toLocaleString()}</p>
                  <p className={`mono-text text-[9px] ${(product.stock || 0) < 5 ? 'text-red-400' : 'text-green-400'}`}>
                    STOCK: {product.stock || 0}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 border border-daraja-border text-daraja-text-muted hover:border-daraja-gold hover:text-daraja-gold transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-3 border border-daraja-border text-daraja-text-muted hover:border-red-500 hover:text-red-400 transition-all">
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendors.map((vendor, i) => (
              <div key={vendor.id} className="luxury-card p-10 space-y-6 hover:border-daraja-gold/40 transition-all">
                <div className="flex items-center gap-4">
                  {vendor.logo_url ? (
                    <img src={vendor.logo_url} alt="" className="w-12 h-12 object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-12 h-12 bg-daraja-gold/10 flex items-center justify-center text-daraja-gold">
                      <Users className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif italic text-white">{vendor.store_name}</h3>
                    <p className="mono-text text-daraja-gold text-[8px] uppercase">{vendor.specialization}</p>
                  </div>
                </div>
                <div className="space-y-3 border-t border-daraja-border pt-6">
                  {[
                    { k: 'LOCATION', v: vendor.location },
                    { k: 'PRODUCTS', v: vendor.products_count || 0 },
                    { k: 'STATUS', v: vendor.is_verified ? 'VERIFIED' : 'PENDING' }
                  ].map(({ k, v }) => v !== undefined && (
                    <div key={k} className="flex justify-between text-[9px] mono-text">
                      <span className="text-daraja-text-muted">{k}</span>
                      <span className={`text-white ${k === 'STATUS' && v === 'VERIFIED' ? 'text-green-400' : ''}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {vendors.length === 0 && !loading && (
              <div className="col-span-3 text-center py-24 text-daraja-text-muted mono-text text-[10px]">NO_VENDOR_NODES</div>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="luxury-card p-12 w-full max-w-lg space-y-8"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-serif italic text-white">Add <span className="text-daraja-gold not-italic">Product</span></h3>
              <form onSubmit={handleAddProduct} className="space-y-6">
                {[
                  { label: 'Product Name', key: 'name', type: 'text' },
                  { label: 'Price (₦)', key: 'price', type: 'number' },
                  { label: 'Stock Qty', key: 'stock', type: 'number' },
                  { label: 'Category', key: 'category', type: 'text' }
                ].map(f => (
                  <div key={f.key} className="space-y-2">
                    <label className="mono-text text-[9px] text-daraja-text-muted uppercase">{f.label}</label>
                    <input
                      type={f.type}
                      value={newProduct[f.key]}
                      onChange={e => setNewProduct(p => ({ ...p, [f.key]: e.target.value }))}
                      required
                      className="w-full bg-daraja-charcoal border border-daraja-border p-4 text-white font-mono text-sm focus:border-daraja-gold outline-none"
                    />
                  </div>
                ))}
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 border border-daraja-border text-white mono-text text-[10px] hover:bg-white/5">CANCEL</button>
                  <button type="submit" className="flex-[2] py-4 bg-daraja-gold text-daraja-charcoal font-black mono-text text-[10px] hover:bg-white">ADD_TO_MATRIX</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
