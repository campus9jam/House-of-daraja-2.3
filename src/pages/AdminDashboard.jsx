import React, { useState, useEffect } from 'react';
import { Product, Order, Drop, HeritagePost, VendorProfile, AtelierOrder } from '../api/entities';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drops, setDrops] = useState([]);
  const [heritage, setHeritage] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [atelierOrders, setAtelierOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      Product.list(),
      Order.list(),
      Drop.list(),
      HeritagePost.list(),
      VendorProfile.list(),
      AtelierOrder.list(),
    ]).then(([p, o, d, h, v, a]) => {
      setProducts(p);
      setOrders(o);
      setDrops(d);
      setHeritage(h);
      setVendors(v);
      setAtelierOrders(a);
      setStats({
        revenue: o.reduce((s, x) => s + (x.total_amount || 0), 0),
        products: p.length,
        orders: o.length,
        vendors: v.length,
        atelier: a.length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const updateDropStatus = async (id, status) => {
    await Drop.update(id, { status });
    setDrops(d => d.map(x => x.id === id ? { ...x, status } : x));
  };

  const updatePostPublished = async (id, is_published) => {
    await HeritagePost.update(id, { is_published });
    setHeritage(h => h.map(x => x.id === id ? { ...x, is_published } : x));
  };

  const updateOrderStatus = async (id, status) => {
    await Order.update(id, { status });
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
  };

  const updateAtelierStatus = async (id, status) => {
    await AtelierOrder.update(id, { status });
    setAtelierOrders(a => a.map(x => x.id === id ? { ...x, status } : x));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-[#C5A059] animate-pulse font-serif text-xl">Loading admin panel...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="py-12 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-px bg-[#C5A059]" />
          <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">God Mode</span>
        </div>
        <h1 className="text-4xl font-serif text-white font-light mb-12">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/5 mb-12">
          {[
            { label: 'Revenue', value: `₦${stats.revenue?.toLocaleString()}`, color: 'text-[#C5A059]' },
            { label: 'Products', value: stats.products, color: 'text-white' },
            { label: 'Orders', value: stats.orders, color: 'text-white' },
            { label: 'Vendors', value: stats.vendors, color: 'text-white' },
            { label: 'Atelier', value: stats.atelier, color: 'text-white' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#0E0E0E] p-6 text-center">
              <div className={`text-3xl font-serif mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-white/30 text-xs uppercase tracking-[0.3em]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-white/5 mb-8 overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'products', label: `Products (${products.length})` },
              { id: 'orders', label: `Orders (${orders.length})` },
              { id: 'drops', label: `Drops (${drops.length})` },
              { id: 'heritage', label: `Heritage (${heritage.length})` },
              { id: 'vendors', label: `Vendors (${vendors.length})` },
              { id: 'atelier', label: `Atelier (${atelierOrders.length})` },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`pb-4 text-xs uppercase tracking-[0.3em] border-b-2 whitespace-nowrap transition-all ${
                  tab === t.id ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-white/40 hover:text-white'
                }`}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4">Recent Orders</h3>
              <div className="space-y-2">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between p-4 border border-white/5 hover:border-white/10">
                    <div>
                      <div className="text-white text-sm">₦{o.total_amount?.toLocaleString()}</div>
                      <div className="text-white/30 text-xs">{new Date(o.created_date).toLocaleDateString()}</div>
                    </div>
                    <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                      className="bg-[#0E0E0E] border border-white/10 text-white/70 text-xs px-3 py-1 focus:outline-none focus:border-[#C5A059]"
                    >
                      {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4">Pending Atelier</h3>
              <div className="space-y-2">
                {atelierOrders.filter(a => a.status === 'submitted').map(a => (
                  <div key={a.id} className="p-4 border border-[#C5A059]/20 hover:border-[#C5A059]/40">
                    <div className="text-white text-sm font-serif mb-1">#{a.serial_number}</div>
                    <div className="text-white/50 text-xs mb-3">{a.fabric} · {a.color}</div>
                    <select value={a.status} onChange={e => updateAtelierStatus(a.id, e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 text-white/70 text-xs px-3 py-2 focus:outline-none focus:border-[#C5A059]"
                    >
                      {['submitted','in_review','in_production','quality_check','shipped','delivered'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
                {atelierOrders.filter(a => a.status === 'submitted').length === 0 && (
                  <p className="text-white/20 text-sm">No pending atelier orders</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div className="space-y-2">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 border border-white/10 hover:border-white/20 transition-colors">
                {p.images?.[0] && <img src={p.images[0]} alt="" className="w-14 h-14 object-cover" />}
                <div className="flex-1">
                  <div className="text-white font-serif">{p.name}</div>
                  <div className="text-white/40 text-xs">{p.category} · {p.vendor_name}</div>
                </div>
                <div className="text-[#C5A059]">₦{p.price?.toLocaleString()}</div>
                <select
                  value={p.status}
                  onChange={async e => {
                    await Product.update(p.id, { status: e.target.value });
                    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: e.target.value } : x));
                  }}
                  className="bg-[#0E0E0E] border border-white/10 text-white/70 text-xs px-3 py-1 focus:outline-none focus:border-[#C5A059]"
                >
                  {['active','draft','sold_out','archived'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-2">
            {orders.map(o => (
              <div key={o.id} className="p-4 border border-white/10 hover:border-white/20 flex items-center justify-between">
                <div>
                  <div className="text-white font-serif">₦{o.total_amount?.toLocaleString()}</div>
                  <div className="text-white/40 text-xs mt-1">{new Date(o.created_date).toLocaleDateString()}</div>
                  {o.shipping_address && <div className="text-white/30 text-xs mt-1 truncate max-w-xs">{o.shipping_address}</div>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs uppercase px-3 py-1 ${o.payment_status === 'paid' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                    {o.payment_status}
                  </span>
                  <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                    className="bg-[#0E0E0E] border border-white/10 text-white/70 text-xs px-3 py-1 focus:outline-none focus:border-[#C5A059]"
                  >
                    {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drops */}
        {tab === 'drops' && (
          <div className="space-y-3">
            {drops.map(d => (
              <div key={d.id} className="flex items-center gap-4 p-4 border border-white/10 hover:border-white/20 transition-colors">
                {d.image && <img src={d.image} alt="" className="w-16 h-16 object-cover" />}
                <div className="flex-1">
                  <div className="text-white font-serif">{d.name}</div>
                  <div className="text-white/40 text-xs">{d.drop_type} · ₦{d.price?.toLocaleString()}</div>
                  <div className="text-white/30 text-xs">{d.units_sold}/{d.stock} sold</div>
                </div>
                <select value={d.status} onChange={e => updateDropStatus(d.id, e.target.value)}
                  className="bg-[#0E0E0E] border border-white/10 text-white/70 text-xs px-3 py-1 focus:outline-none focus:border-[#C5A059]"
                >
                  {['upcoming','live','ended','sold_out'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Heritage */}
        {tab === 'heritage' && (
          <div className="space-y-3">
            {heritage.map(h => (
              <div key={h.id} className="flex items-center gap-4 p-4 border border-white/10 hover:border-white/20 transition-colors">
                {h.image_url && <img src={h.image_url} alt="" className="w-16 h-16 object-cover" />}
                <div className="flex-1">
                  <div className="text-white font-serif">{h.title}</div>
                  <div className="text-white/40 text-xs">{h.category} · {h.views_count} views</div>
                </div>
                <button
                  onClick={() => updatePostPublished(h.id, !h.is_published)}
                  className={`text-xs uppercase tracking-[0.2em] px-4 py-2 transition-all ${
                    h.is_published ? 'bg-green-400/10 text-green-400 hover:bg-red-400/10 hover:text-red-400' : 'bg-white/5 text-white/40 hover:bg-green-400/10 hover:text-green-400'
                  }`}
                >
                  {h.is_published ? 'Published' : 'Draft'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Vendors */}
        {tab === 'vendors' && (
          <div className="space-y-3">
            {vendors.length === 0 ? (
              <p className="text-white/30 text-center py-12 font-serif text-xl">No vendors yet</p>
            ) : vendors.map(v => (
              <div key={v.id} className="p-4 border border-white/10 hover:border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {v.logo_url && <img src={v.logo_url} alt="" className="w-12 h-12 object-cover rounded-full" />}
                  <div>
                    <div className="text-white font-serif">{v.store_name}</div>
                    <div className="text-white/40 text-xs">{v.location} · {v.specialization}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {v.is_verified && <span className="text-green-400 text-xs">✓ Verified</span>}
                  <select value={v.status}
                    onChange={async e => { await VendorProfile.update(v.id, { status: e.target.value }); setVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: e.target.value } : x)); }}
                    className="bg-[#0E0E0E] border border-white/10 text-white/70 text-xs px-3 py-1 focus:outline-none focus:border-[#C5A059]"
                  >
                    {['pending','active','suspended'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Atelier */}
        {tab === 'atelier' && (
          <div className="space-y-3">
            {atelierOrders.map(a => (
              <div key={a.id} className="p-6 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-[#C5A059] text-xs uppercase tracking-[0.2em] mb-1">#{a.serial_number}</div>
                    <div className="text-white font-serif text-lg">{a.fabric} · {a.color}</div>
                  </div>
                  <select value={a.status} onChange={e => updateAtelierStatus(a.id, e.target.value)}
                    className="bg-[#0E0E0E] border border-white/10 text-white/70 text-xs px-3 py-2 focus:outline-none focus:border-[#C5A059]"
                  >
                    {['submitted','in_review','in_production','quality_check','shipped','delivered'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-xs">
                  {[
                    ['Bust', a.bust_chest],['Waist', a.waist],['Hips', a.hips],
                    ['Shoulder', a.shoulder],['Length', a.length],['Sleeve', a.sleeve_length],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div className="text-white/30 uppercase tracking-[0.2em] mb-1">{l}</div>
                      <div className="text-white/70">{v || '—'}cm</div>
                    </div>
                  ))}
                </div>
                {a.special_instructions && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="text-white/30 text-xs uppercase tracking-[0.2em] mb-1">Instructions</div>
                    <p className="text-white/60 text-sm italic">"{a.special_instructions}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
