import React, { useState, useEffect } from 'react';
import { AtelierOrder, Product } from '../api/entities';

const FABRICS = ['Pure Damask Silk', 'Aso-Oke Blend', 'Hand-loomed Cotton', 'Linen-Silk Blend', 'Premium Ankara', 'Kente Cloth', 'Adire Fabric'];
const STATUS_MAP = {
  submitted: { label: 'Order Received', color: 'text-[#C5A059]' },
  in_review: { label: 'Under Review', color: 'text-blue-400' },
  in_production: { label: 'In Production', color: 'text-purple-400' },
  quality_check: { label: 'Quality Check', color: 'text-yellow-400' },
  shipped: { label: 'Shipped', color: 'text-green-400' },
  delivered: { label: 'Delivered', color: 'text-white' },
};

export default function Atelier() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('new');
  const [form, setForm] = useState({
    fabric: FABRICS[0], color: '', bust_chest: '', waist: '', hips: '',
    shoulder: '', length: '', sleeve_length: '', special_instructions: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    AtelierOrder.list().then(o => setOrders(o));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const serial = `HD-AT-${Date.now().toString(36).toUpperCase()}`;
      await AtelierOrder.create({
        ...form,
        bust_chest: parseFloat(form.bust_chest) || 0,
        waist: parseFloat(form.waist) || 0,
        hips: parseFloat(form.hips) || 0,
        shoulder: parseFloat(form.shoulder) || 0,
        length: parseFloat(form.length) || 0,
        sleeve_length: parseFloat(form.sleeve_length) || 0,
        serial_number: serial,
        status: 'submitted',
      });
      setSubmitted(true);
      AtelierOrder.list().then(o => setOrders(o));
    } catch (err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero */}
      <div className="relative py-24 px-6 md:px-16 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 to-[#050505]" />
        </div>
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C5A059]" />
            <span className="text-[#C5A059] text-xs uppercase tracking-[0.4em]">Bespoke Tailoring</span>
            <div className="w-8 h-px bg-[#C5A059]" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white font-light mb-6">The Atelier</h1>
          <p className="text-white/50 max-w-xl mx-auto leading-relaxed">
            Commission a piece that is uniquely yours. Our master tailors translate your measurements and vision
            into sovereign heritage garments crafted for a lifetime.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-y border-white/5 px-6 md:px-16">
        <div className="max-w-4xl mx-auto flex gap-8">
          {[
            { id: 'new', label: 'New Commission' },
            { id: 'orders', label: `My Orders (${orders.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-4 text-xs uppercase tracking-[0.3em] border-b-2 transition-all ${
                tab === t.id ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-16 py-12">
        {tab === 'new' ? (
          submitted ? (
            <div className="text-center py-16">
              <div className="text-[#C5A059] text-6xl mb-6">✦</div>
              <h2 className="text-3xl font-serif text-white font-light mb-4">Commission Received</h2>
              <p className="text-white/50 mb-8">
                Your bespoke order has been submitted to our atelier. Our master tailor will review your specifications
                and contact you with a price quote within 48 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setTab('orders'); }}
                className="text-[#C5A059] text-sm uppercase tracking-[0.3em] border border-[#C5A059]/30 px-8 py-3 hover:bg-[#C5A059] hover:text-black transition-all"
              >
                Track Your Order
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-2xl font-serif text-white font-light mb-2">Commission Details</h2>
                <p className="text-white/40 text-sm">All measurements should be in centimeters (cm)</p>
              </div>

              {/* Fabric & Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-3">Fabric *</label>
                  <select
                    value={form.fabric}
                    onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))}
                    className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-[#C5A059] text-sm"
                    required
                  >
                    {FABRICS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-3">Color / Preference *</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    placeholder="e.g. Deep Ivory with Gold accents"
                    className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-[#C5A059] text-sm placeholder-white/20"
                    required
                  />
                </div>
              </div>

              {/* Measurements */}
              <div>
                <div className="text-white/40 text-xs uppercase tracking-[0.3em] mb-6">Body Measurements (cm)</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'bust_chest', label: 'Bust / Chest' },
                    { key: 'waist', label: 'Waist' },
                    { key: 'hips', label: 'Hips' },
                    { key: 'shoulder', label: 'Shoulder Width' },
                    { key: 'length', label: 'Garment Length' },
                    { key: 'sleeve_length', label: 'Sleeve Length' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-white/30 text-xs uppercase tracking-[0.2em] block mb-2">{label}</label>
                      <input
                        type="number"
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder="cm"
                        className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-[#C5A059] text-sm placeholder-white/20"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-3">Special Instructions</label>
                <textarea
                  value={form.special_instructions}
                  onChange={e => setForm(f => ({ ...f, special_instructions: e.target.value }))}
                  placeholder="Describe your vision, any specific design elements, cultural motifs, or inspirations..."
                  rows={4}
                  className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-[#C5A059] text-sm placeholder-white/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-[61.8%] bg-[#C5A059] text-black py-4 text-sm uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Commission'}
              </button>
            </form>
          )
        ) : (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-white/30 font-serif text-2xl mb-4">No commissions yet</p>
                <button onClick={() => setTab('new')} className="text-[#C5A059] text-sm uppercase tracking-[0.2em] border border-[#C5A059]/30 px-6 py-3 hover:bg-[#C5A059] hover:text-black transition-all">
                  Start a Commission
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.submitted;
                  return (
                    <div key={order.id} className="border border-white/10 p-6 hover:border-[#C5A059]/30 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-1">#{order.serial_number}</div>
                          <div className="text-white font-serif text-lg">{order.fabric} · {order.color}</div>
                        </div>
                        <div className={`text-xs uppercase tracking-[0.2em] ${statusInfo.color}`}>
                          {statusInfo.label}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {[
                          { l: 'Bust/Chest', v: `${order.bust_chest}cm` },
                          { l: 'Waist', v: `${order.waist}cm` },
                          { l: 'Hips', v: `${order.hips}cm` },
                        ].map(({ l, v }) => (
                          <div key={l}>
                            <span className="text-white/30 text-xs uppercase tracking-[0.2em] block">{l}</span>
                            <span className="text-white/70">{v}</span>
                          </div>
                        ))}
                      </div>
                      {order.special_instructions && (
                        <p className="text-white/40 text-sm mt-4 pt-4 border-t border-white/10 italic">
                          "{order.special_instructions}"
                        </p>
                      )}
                      {order.price_quote && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-white/40 text-xs uppercase tracking-[0.2em]">Price Quote</span>
                          <span className="text-[#C5A059] font-serif text-xl">₦{order.price_quote?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
