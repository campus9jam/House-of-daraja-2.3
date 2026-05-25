import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Order } from '../api/entities';

const OPAY_MERCHANT_ID = import.meta.env.VITE_OPAY_MERCHANT_ID || '';
const OPAY_PUBLIC_KEY = import.meta.env.VITE_OPAY_PUBLIC_KEY || '';

export default function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [step, setStep] = useState(1); // 1=details, 2=payment, 3=success
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    address: '', city: '', state: '', country: 'Nigeria',
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('hd_cart') || '[]');
    if (cart.length === 0) navigate('/shop');
    setItems(cart);
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = total >= 100000 ? 0 : 5000;
  const grandTotal = total + deliveryFee;

  const generateRef = () => `HD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const createOrder = async () => {
    const ref = generateRef();
    const order = await Order.create({
      items,
      total_amount: grandTotal,
      status: 'pending',
      payment_status: 'pending',
      payment_reference: ref,
      shipping_address: `${form.address}, ${form.city}, ${form.state}, ${form.country}`,
      notes: `Contact: ${form.phone}`,
    });
    return { order, ref };
  };

  const handleOPayCheckout = async () => {
    setProcessing(true);
    try {
      const { order, ref } = await createOrder();
      setOrderId(order.id);

      // OPay inline checkout
      const opayConfig = {
        merchantId: OPAY_MERCHANT_ID,
        reference: ref,
        amount: grandTotal * 100, // in kobo
        currency: 'NGN',
        customerName: form.full_name,
        customerEmail: form.email,
        customerPhone: form.phone,
        callbackUrl: `${window.location.origin}/checkout/verify`,
        onSuccess: async (response) => {
          // Update order on success
          await Order.update(order.id, {
            payment_status: 'paid',
            status: 'confirmed',
            payment_reference: response.reference || ref,
          });
          localStorage.removeItem('hd_cart');
          window.dispatchEvent(new Event('cartUpdated'));

          // Trigger push notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Order Confirmed ✦', {
              body: `Your order of ₦${grandTotal.toLocaleString()} has been confirmed. House of Daraja`,
              icon: '/hd-icon.png',
              badge: '/hd-icon.png',
            });
          }

          setStep(3);
        },
        onFailure: (err) => {
          Order.update(order.id, { payment_status: 'failed' });
          alert('Payment failed. Please try again.');
          setProcessing(false);
        },
        onClose: () => {
          setProcessing(false);
        },
      };

      // Load OPay SDK and initiate
      if (window.OPay) {
        window.OPay.initialize(opayConfig);
      } else {
        // Fallback: redirect to OPay hosted page
        const params = new URLSearchParams({
          merchantId: OPAY_MERCHANT_ID,
          reference: ref,
          amount: grandTotal * 100,
          currency: 'NGN',
          name: form.full_name,
          email: form.email,
          phone: form.phone,
          callbackUrl: encodeURIComponent(`${window.location.origin}/checkout/verify?ref=${ref}&orderId=${order.id}`),
        });
        window.location.href = `https://cashier.opayweb.com/checkout?${params}`;
      }
    } catch (err) {
      alert('Could not initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-[#C5A059] text-7xl mb-8">✦</div>
          <h1 className="text-4xl font-serif text-white font-light mb-4">Order Confirmed</h1>
          <p className="text-white/50 mb-4">
            Your acquisition has been received. Our atelier is preparing your order.
          </p>
          <div className="bg-[#C5A059]/10 border border-[#C5A059]/20 p-4 mb-8">
            <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-1">Order Total</div>
            <div className="text-white font-serif text-3xl">₦{grandTotal.toLocaleString()}</div>
          </div>
          <p className="text-white/30 text-sm mb-8">
            A confirmation has been sent to {form.email}. Track your order in your profile.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/orders" className="bg-[#C5A059] text-black px-8 py-3 text-xs uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors">
              Track Order
            </Link>
            <Link to="/" className="border border-white/20 text-white/60 px-8 py-3 text-xs uppercase tracking-[0.3em] hover:border-white/60 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-6xl mx-auto px-6 md:px-16 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C5A059] flex items-center justify-center">
              <span className="text-black font-serif font-bold text-sm">HD</span>
            </div>
          </Link>
          <div className="w-px h-6 bg-white/10" />
          <span className="text-white/40 text-xs uppercase tracking-[0.3em]">Checkout</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-12 mt-6">
          {[
            { n: 1, label: 'Details' },
            { n: 2, label: 'Payment' },
          ].map(({ n, label }) => (
            <React.Fragment key={n}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center text-xs font-bold ${
                  step >= n ? 'bg-[#C5A059] text-black' : 'bg-white/10 text-white/40'
                }`}>{n}</div>
                <span className={`text-xs uppercase tracking-[0.2em] ${step >= n ? 'text-white' : 'text-white/30'}`}>{label}</span>
              </div>
              {n < 2 && <div className={`flex-1 max-w-12 h-px ${step > n ? 'bg-[#C5A059]' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left — form 62% */}
          <div className="lg:col-span-3">
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <h2 className="text-2xl font-serif text-white font-light mb-8">Delivery Details</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Full Name *</label>
                      <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                        required placeholder="Your full name"
                        className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20" />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Phone *</label>
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        required placeholder="+234 xxx xxxx xxxx"
                        className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required placeholder="your@email.com"
                      className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20" />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Delivery Address *</label>
                    <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      required placeholder="Street address"
                      className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">City *</label>
                      <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        required placeholder="City"
                        className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20" />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">State *</label>
                      <input type="text" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                        required placeholder="State"
                        className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20" />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-[61.8%] bg-[#C5A059] text-black py-4 text-sm uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors mt-8">
                  Continue to Payment →
                </button>
              </form>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-serif text-white font-light mb-8">Payment</h2>

                {/* OPay badge */}
                <div className="border border-[#C5A059]/20 p-6 mb-8 bg-[#C5A059]/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#C5A059] flex items-center justify-center text-black font-bold text-xs">
                      OPay
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">OPay Secure Checkout</div>
                      <div className="text-white/40 text-xs mt-0.5">Bank transfer, card, USSD, wallets</div>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-green-400 text-xs">Secured</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-white/40">
                    {[
                      '256-bit SSL encryption',
                      'Bank-grade security by OPay',
                      'Instant confirmation',
                      'Supports OPay wallet, cards, bank transfer, USSD',
                    ].map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <span className="text-[#C5A059]">✓</span> {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order summary recap */}
                <div className="space-y-3 mb-8 p-6 bg-[#0E0E0E] border border-white/5">
                  <div className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4">Delivery to</div>
                  <div className="text-white/70 text-sm">{form.full_name}</div>
                  <div className="text-white/50 text-sm">{form.address}, {form.city}, {form.state}</div>
                  <div className="text-white/50 text-sm">{form.phone}</div>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleOPayCheckout} disabled={processing}
                    className="flex-1 bg-[#C5A059] text-black py-4 text-sm uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Initializing OPay...' : `Pay ₦${grandTotal.toLocaleString()}`}
                  </button>
                  <button onClick={() => setStep(1)} className="px-6 border border-white/20 text-white/50 text-xs uppercase tracking-[0.2em] hover:border-white/50 transition-colors">
                    ← Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right — order summary 38% */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <h3 className="text-white/40 text-xs uppercase tracking-[0.3em] mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    {item.image && (
                      <div className="relative">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                        <span className="absolute -top-2 -right-2 bg-[#C5A059] text-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-white text-sm leading-tight">{item.name}</div>
                      {item.size && <div className="text-white/40 text-xs">Size: {item.size}</div>}
                    </div>
                    <div className="text-white/70 text-sm whitespace-nowrap">₦{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Subtotal</span>
                  <span className="text-white/70">₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-400 text-sm' : 'text-white/70 text-sm'}>
                    {deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                {deliveryFee === 0 && (
                  <div className="text-[#C5A059] text-xs">✓ Free delivery on orders above ₦100,000</div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-white/50 uppercase tracking-[0.2em] text-xs">Total</span>
                <span className="text-white font-serif text-3xl">₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
