import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Truck, ArrowRight, Lock, MapPin, CheckCircle2, ChevronRight, ShoppingBag, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Order } from '../api/entities';

// ─── OPay payment initialiser ────────────────────────────────────────────────
async function initOPayPayment({ amount, email, name, reference }) {
  try {
    const res = await fetch('/api/opay/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // kobo
        email,
        name,
        reference,
        callback_url: window.location.origin + '/orders'
      })
    });
    const data = await res.json();
    if (data?.data?.checkoutUrl) {
      window.location.href = data.data.checkoutUrl;
      return true;
    }
    return false;
  } catch (err) {
    console.error('OPay init error', err);
    return false;
  }
}

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    encryptionKey: `IDENTITY_TX_${Math.floor(Math.random() * 9000) + 1000}`
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('hd_cart') || '[]');
      setCartItems(saved);
      if (saved.length === 0) navigate('/shop');
    } catch { navigate('/shop'); }
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalize = async () => {
    if (!formData.email || !formData.name) {
      alert('Identity fields are required.');
      return;
    }
    setIsProcessing(true);

    try {
      // 1. Create order record
      const order = await Order.create({
        items: cartItems,
        total_amount: total,
        status: 'Pending',
        payment_status: 'pending',
        payment_reference: formData.encryptionKey,
        shipping_address: formData,
      });

      // 2. Launch OPay checkout
      const opayOk = await initOPayPayment({
        amount: total,
        email: formData.email,
        name: formData.name,
        reference: formData.encryptionKey,
      });

      if (!opayOk) {
        // Fallback: mark as pending and redirect
        alert('Acquisition logged. Payment gateway unavailable — your order is saved.');
        localStorage.removeItem('hd_cart');
        navigate('/orders');
      }
    } catch (err) {
      console.error(err);
      alert('Ledger commit failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-daraja-charcoal pt-32 pb-24 px-6 md:px-12"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* ── LEFT: CHECKOUT LOGIC (62%) ────────────────── */}
        <div className="lg:col-span-8 space-y-16">
          <header className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-serif italic text-white tracking-tighter">
              Acquisition <span className="text-daraja-gold not-italic">Logic</span>
            </h1>
            <div className="flex items-center gap-4 text-daraja-text-muted text-[10px] mono-text uppercase tracking-widest">
              <span className={step >= 1 ? 'text-daraja-gold' : ''}>01 IDENTITY</span>
              <ChevronRight className="w-3 h-3" />
              <span className={step >= 2 ? 'text-daraja-gold' : ''}>02 COORDINATES</span>
              <ChevronRight className="w-3 h-3" />
              <span className={step >= 3 ? 'text-daraja-gold' : ''}>03 HANDSHAKE</span>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {/* STEP 1 — Identity */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="luxury-card p-12 space-y-8">
                  <div className="flex items-center gap-3 text-daraja-gold mono-text text-[10px]">
                    <Lock className="w-4 h-4" /> <span>ENCRYPTED_IDENTITY_FORM</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { label: 'Full_Name', name: 'name', type: 'text', placeholder: 'RESIDENT_ID_NAME' },
                      { label: 'Neural_Email', name: 'email', type: 'email', placeholder: 'archive@daraja.io' }
                    ].map(f => (
                      <div key={f.name} className="space-y-3">
                        <label className="text-[10px] mono-text text-daraja-text-muted uppercase">{f.label}</label>
                        <input
                          type={f.type} name={f.name} value={formData[f.name]} onChange={handleChange}
                          placeholder={f.placeholder}
                          className="w-full bg-daraja-charcoal border border-daraja-border p-5 text-white font-mono text-sm focus:border-daraja-gold outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="w-full py-8 bg-daraja-gold text-daraja-charcoal font-black uppercase tracking-[0.5em] text-[10px] hover:bg-white transition-all flex items-center justify-center gap-3">
                  VERIFY_IDENTITY <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2 — Coordinates */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="luxury-card p-12 space-y-8">
                  <div className="flex items-center gap-3 text-daraja-gold mono-text text-[10px]">
                    <MapPin className="w-4 h-4" /> <span>GEOLOCATION_COORDINATES</span>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] mono-text text-daraja-text-muted uppercase">Delivery_Address</label>
                      <textarea
                        name="address" value={formData.address} onChange={handleChange}
                        placeholder="SECURE_NODE_LOCATION"
                        className="w-full bg-daraja-charcoal border border-daraja-border p-5 text-white font-mono text-sm focus:border-daraja-gold outline-none min-h-[120px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      {[
                        { label: 'Primary_City', name: 'city' },
                        { label: 'Postal_Node', name: 'postalCode' }
                      ].map(f => (
                        <div key={f.name} className="space-y-3">
                          <label className="text-[10px] mono-text text-daraja-text-muted uppercase">{f.label}</label>
                          <input
                            type="text" name={f.name} value={formData[f.name]} onChange={handleChange}
                            className="w-full bg-daraja-charcoal border border-daraja-border p-5 text-white font-mono text-sm focus:border-daraja-gold outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-8 border border-daraja-border text-white mono-text text-[10px] hover:bg-white/5">BACK</button>
                  <button onClick={() => setStep(3)} className="flex-[2] py-8 bg-daraja-gold text-daraja-charcoal font-black mono-text text-[10px] hover:bg-white">COMMIT_COORDINATES</button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Handshake / OPay */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                <div className="luxury-card p-12 space-y-12 text-center">
                  <div className="flex items-center justify-center gap-3 text-daraja-gold mono-text text-[10px]">
                    <ShieldCheck className="w-4 h-4" /> <span>HANDSHAKE_PROTOCOL</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-daraja-text-muted mono-text text-[9px] uppercase">Transaction_Reference</p>
                    <p className="font-mono text-daraja-gold text-sm tracking-widest">{formData.encryptionKey}</p>
                  </div>
                  <div className="border-t border-daraja-border pt-8 space-y-4">
                    <div className="flex justify-between mono-text text-[10px] text-daraja-text-muted">
                      <span>SUBTOTAL</span>
                      <span className="text-white">₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mono-text text-[10px] text-daraja-text-muted">
                      <span>TAX (7.5%)</span>
                      <span className="text-white">₦{Math.round(tax).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mono-text text-[11px] border-t border-daraja-border pt-4">
                      <span className="text-white font-bold">TOTAL</span>
                      <span className="text-daraja-gold font-bold">₦{Math.round(total).toLocaleString()}</span>
                    </div>
                  </div>
                  {/* OPay badge */}
                  <div className="flex items-center justify-center gap-3 py-4 border border-daraja-border">
                    <CreditCard className="w-5 h-5 text-daraja-gold" />
                    <span className="mono-text text-[9px] text-white/60 uppercase tracking-widest">Secured by OPay Payment Gateway</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-8 border border-daraja-border text-white mono-text text-[10px] hover:bg-white/5">BACK</button>
                  <button
                    onClick={handleFinalize}
                    disabled={isProcessing}
                    className="flex-[2] py-8 bg-daraja-gold text-daraja-charcoal font-black mono-text text-[10px] hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? 'INITIALIZING_OPAY...' : 'RATIFY_ACQUISITION'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: ORDER SUMMARY (38%) ────────────────── */}
        <div className="lg:col-span-4 space-y-8">
          <div className="luxury-card p-10 space-y-8 sticky top-32">
            <div className="flex items-center gap-3 text-daraja-gold mono-text text-[10px]">
              <ShoppingBag className="w-4 h-4" /> <span>ACQUISITION_MANIFEST</span>
            </div>
            <div className="space-y-6 max-h-[320px] overflow-y-auto scrollbar-thin pr-2">
              {cartItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-16 h-20 flex-shrink-0 overflow-hidden">
                    <img
                      src={item.image || item.images?.[0] || "https://i.imgur.com/7QFYTZJ.png"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif italic text-white text-sm truncate">{item.name}</p>
                    <p className="mono-text text-[9px] text-daraja-text-muted mt-1">QTY: {item.qty || 1}</p>
                    <p className="mono-text text-daraja-gold text-[10px] mt-1">₦{((item.price || 0) * (item.qty || 1)).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {cartItems.length === 0 && (
                <p className="text-daraja-text-muted mono-text text-[10px] text-center py-8">CART_EMPTY</p>
              )}
            </div>
            <div className="border-t border-daraja-border pt-8 space-y-3">
              <div className="flex justify-between mono-text text-[10px] text-daraja-text-muted">
                <span>SUBTOTAL</span><span className="text-white">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mono-text text-[10px] text-daraja-text-muted">
                <span>TAX</span><span className="text-white">₦{Math.round(tax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mono-text text-[11px] border-t border-daraja-border pt-3">
                <span className="text-white font-bold">TOTAL</span>
                <span className="text-daraja-gold font-bold text-lg">₦{Math.round(total).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-daraja-text-muted mono-text text-[9px]">
              <Truck className="w-4 h-4" /> FREE_SOVEREIGN_DELIVERY ON ORDERS OVER ₦50K
            </div>
            <div className="flex items-center gap-3 text-daraja-text-muted mono-text text-[9px]">
              <ShieldCheck className="w-4 h-4 text-daraja-gold" />
              <span>256-BIT_ENCRYPTED — OPAY_SECURED</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
