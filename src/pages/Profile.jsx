import React, { useState, useEffect } from 'react';
import { User, Order, WishlistItem } from '../api/entities';

const TIER_CONFIG = {
  Citizen: { color: 'text-white/60', bg: 'bg-white/10', points: 0 },
  Gold: { color: 'text-[#C5A059]', bg: 'bg-[#C5A059]/20', points: 500 },
  Platinum: { color: 'text-gray-300', bg: 'bg-gray-500/20', points: 2000 },
  'Diamond Elite': { color: 'text-blue-300', bg: 'bg-blue-500/20', points: 5000 },
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    Promise.all([
      User.me(),
      Order.list(),
      WishlistItem.list(),
    ]).then(([u, o, w]) => {
      setUser(u);
      setForm({ bio: u?.bio || '', phone: u?.phone || '', preferred_language: u?.preferred_language || 'en' });
      setOrders(o);
      setWishlist(w);
    }).finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    try {
      await User.updateMe(form);
      setUser(u => ({ ...u, ...form }));
      setEditing(false);
    } catch (e) {
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-[#C5A059] animate-pulse font-serif text-2xl">Loading profile...</div>
      </div>
    );
  }

  const tier = user?.status_tier || 'Citizen';
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.Citizen;
  const points = user?.loyalty_points || 0;

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Profile Header — 38% */}
      <div className="relative pt-16 pb-24 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059]/20 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 bg-[#C5A059]/20 border-2 border-[#C5A059]/30 flex items-center justify-center text-4xl">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#C5A059] font-serif text-3xl">
                    {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div className={`absolute -bottom-2 -right-2 ${tierConfig.bg} ${tierConfig.color} text-[9px] uppercase tracking-[0.2em] px-2 py-1 border border-current/30`}>
                {tier}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-serif text-white font-light mb-2">
                {user?.full_name || 'Sovereign Member'}
              </h1>
              <div className="text-white/40 text-sm mb-4">{user?.email}</div>

              {/* Stats */}
              <div className="flex gap-8">
                {[
                  { label: 'Points', value: points.toLocaleString() },
                  { label: 'Orders', value: orders.length },
                  { label: 'Wishlist', value: wishlist.length },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="text-2xl font-serif text-[#C5A059]">{stat.value}</div>
                    <div className="text-white/40 text-xs uppercase tracking-[0.2em]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Progress */}
            <div className="w-full md:w-64">
              <div className="text-white/40 text-xs uppercase tracking-[0.2em] mb-2">Loyalty Status</div>
              <div className={`${tierConfig.color} font-serif text-lg mb-2`}>{tier}</div>
              <div className="h-1 bg-white/10">
                <div
                  className="h-full bg-[#C5A059] transition-all"
                  style={{ width: `${Math.min(100, (points / (tierConfig.points || 5000)) * 100)}%` }}
                />
              </div>
              <div className="text-white/30 text-xs mt-1">{points} / {tierConfig.points || 5000} pts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-white/5 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex gap-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders', label: `Purchases (${orders.length})` },
            { id: 'wishlist', label: `Saved (${wishlist.length})` },
            { id: 'settings', label: 'Settings' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-4 text-xs uppercase tracking-[0.3em] border-b-2 transition-all whitespace-nowrap ${
                tab === t.id ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content — 62% */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-white/40 text-xs uppercase tracking-[0.3em] mb-6">Recent Orders</h2>
              {orders.slice(0, 3).map(order => (
                <div key={order.id} className="border border-white/10 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-light mb-1">
                      {order.items?.map(i => i.name).join(', ').slice(0, 50) || 'Order'}...
                    </div>
                    <div className="text-white/30 text-xs">₦{order.total_amount?.toLocaleString()}</div>
                  </div>
                  <div className={`text-xs uppercase tracking-[0.2em] px-3 py-1 ${
                    order.status === 'delivered' ? 'text-green-400 bg-green-400/10' :
                    order.status === 'shipped' ? 'text-blue-400 bg-blue-400/10' :
                    'text-[#C5A059] bg-[#C5A059]/10'
                  }`}>
                    {order.status}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-white/20 text-sm">No orders yet. Start shopping to build your collection.</p>
              )}
            </div>

            {/* Rewards */}
            <div className="border border-[#C5A059]/20 p-6 bg-[#C5A059]/5">
              <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-4">Rewards</div>
              <div className="text-4xl font-serif text-white mb-1">{points.toLocaleString()}</div>
              <div className="text-white/40 text-xs mb-6">Loyalty Points</div>
              <div className="space-y-3">
                {[
                  { pts: 100, reward: 'Free shipping' },
                  { pts: 500, reward: 'Gold membership' },
                  { pts: 1000, reward: 'Exclusive drop access' },
                ].map(r => (
                  <div key={r.pts} className={`flex items-center gap-3 text-xs ${points >= r.pts ? 'text-[#C5A059]' : 'text-white/30'}`}>
                    <span>{points >= r.pts ? '✓' : '○'}</span>
                    <span>{r.reward}</span>
                    <span className="ml-auto">{r.pts} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-white/30 font-serif text-xl text-center py-12">No orders yet</p>
            ) : orders.map(order => (
              <div key={order.id} className="border border-white/10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-white/30 text-xs uppercase tracking-[0.2em] mb-1">
                      {new Date(order.created_date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-white font-serif text-lg">₦{order.total_amount?.toLocaleString()}</div>
                  </div>
                  <div className={`text-xs uppercase tracking-[0.2em] px-3 py-1 ${
                    order.status === 'delivered' ? 'text-green-400 bg-green-400/10' :
                    order.status === 'shipped' ? 'text-blue-400 bg-blue-400/10' :
                    order.status === 'cancelled' ? 'text-red-400/60 bg-red-400/10' :
                    'text-[#C5A059] bg-[#C5A059]/10'
                  }`}>
                    {order.status}
                  </div>
                </div>
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-t border-white/5">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                    )}
                    <div>
                      <div className="text-white text-sm">{item.name}</div>
                      {item.size && <div className="text-white/40 text-xs">Size: {item.size}</div>}
                      <div className="text-[#C5A059] text-sm">₦{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {order.tracking_number && (
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs">
                    <span className="text-white/30 uppercase tracking-[0.2em]">Tracking: </span>
                    <span className="text-[#C5A059]">{order.tracking_number}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'wishlist' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlist.length === 0 ? (
              <div className="col-span-4 text-center py-12">
                <p className="text-white/30 font-serif text-xl">No saved items</p>
              </div>
            ) : wishlist.map(item => (
              <div key={item.id} className="group">
                <div className="aspect-[3/4] overflow-hidden mb-3 bg-[#0E0E0E]">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-white/5" />
                  )}
                </div>
                <div className="text-white text-sm font-light">{item.product_name}</div>
                <div className="text-[#C5A059] text-sm">₦{item.product_price?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'settings' && (
          <div className="max-w-lg">
            <h2 className="text-white font-serif text-2xl font-light mb-8">Profile Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Bio</label>
                {editing ? (
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-white/60 text-sm">{user?.bio || 'No bio set'}</p>
                )}
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                ) : (
                  <p className="text-white/60 text-sm">{user?.phone || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Preferred Language</label>
                {editing ? (
                  <select
                    value={form.preferred_language}
                    onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}
                    className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059]"
                  >
                    {[['en','English'],['ha','Hausa'],['yo','Yoruba'],['ig','Igbo'],['fr','Français'],['ar','العربية']].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white/60 text-sm capitalize">{form.preferred_language || 'English'}</p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                {editing ? (
                  <>
                    <button onClick={saveProfile} className="bg-[#C5A059] text-black px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors">
                      Save Changes
                    </button>
                    <button onClick={() => setEditing(false)} className="border border-white/20 text-white/50 px-6 py-3 text-xs uppercase tracking-[0.2em] hover:border-white/50 transition-colors">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="border border-[#C5A059]/30 text-[#C5A059] px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#C5A059] hover:text-black transition-all">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
