import React, { useState, useEffect } from 'react';
import { Order } from '../api/entities';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG = {
  pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Pending' },
  confirmed: { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Confirmed' },
  processing: { color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Processing' },
  shipped: { color: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'Shipped' },
  delivered: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Delivered' },
  cancelled: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Cancelled' },
  refunded: { color: 'text-white/40', bg: 'bg-white/5', label: 'Refunded' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    Order.list().then(o => {
      setOrders(o.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="py-16 px-6 md:px-16 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-px bg-[#C5A059]" />
          <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">Purchase History</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-white font-light mb-12">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 border border-white/5">
            <div className="text-[#C5A059]/40 text-5xl mb-6">✦</div>
            <p className="text-white/30 font-serif text-2xl mb-3">No orders yet</p>
            <p className="text-white/20 text-sm mb-8">Your acquisitions will appear here</p>
            <a href="/shop" className="text-[#C5A059] text-xs uppercase tracking-[0.3em] border border-[#C5A059]/30 px-6 py-3 hover:bg-[#C5A059] hover:text-black transition-all">
              Browse Collection
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isExpanded = expandedId === order.id;
              const stepIndex = STATUS_STEPS.indexOf(order.status);

              return (
                <div key={order.id} className="border border-white/10 hover:border-white/20 transition-colors">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full p-6 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-white/30 text-xs uppercase tracking-[0.2em] mb-1">
                          {new Date(order.created_date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-white font-serif text-lg">
                          ₦{order.total_amount?.toLocaleString()}
                        </div>
                        <div className="text-white/40 text-xs mt-1">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`text-xs uppercase tracking-[0.2em] px-3 py-1 ${statusInfo.color} ${statusInfo.bg}`}>
                        {statusInfo.label}
                      </div>
                      <span className="text-white/30 transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                        ▾
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-white/5">
                      {/* Progress tracker */}
                      {order.status !== 'cancelled' && order.status !== 'refunded' && (
                        <div className="py-6 mb-6">
                          <div className="flex items-center justify-between relative">
                            <div className="absolute top-3 left-0 right-0 h-px bg-white/10" />
                            <div
                              className="absolute top-3 left-0 h-px bg-[#C5A059] transition-all"
                              style={{ width: `${stepIndex >= 0 ? (stepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                            />
                            {STATUS_STEPS.map((step, i) => (
                              <div key={step} className="relative flex flex-col items-center gap-2">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${
                                  i <= stepIndex
                                    ? 'border-[#C5A059] bg-[#C5A059] text-black'
                                    : 'border-white/20 bg-[#050505] text-white/30'
                                }`}>
                                  {i < stepIndex ? '✓' : i + 1}
                                </div>
                                <span className={`text-[9px] uppercase tracking-[0.15em] ${i <= stepIndex ? 'text-[#C5A059]' : 'text-white/20'}`}>
                                  {step}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-3 mb-6">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-4">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                            )}
                            <div className="flex-1">
                              <div className="text-white text-sm">{item.name}</div>
                              {item.size && <div className="text-white/40 text-xs">Size: {item.size}</div>}
                              <div className="text-white/40 text-xs">Qty: {item.quantity}</div>
                            </div>
                            <div className="text-[#C5A059] text-sm">₦{(item.price * item.quantity)?.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping & tracking */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-sm">
                        {order.shipping_address && (
                          <div>
                            <div className="text-white/30 text-xs uppercase tracking-[0.2em] mb-1">Ship To</div>
                            <div className="text-white/60">{order.shipping_address}</div>
                          </div>
                        )}
                        {order.tracking_number && (
                          <div>
                            <div className="text-white/30 text-xs uppercase tracking-[0.2em] mb-1">Tracking</div>
                            <div className="text-[#C5A059]">{order.tracking_number}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
