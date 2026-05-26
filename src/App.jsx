import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Shop, ProductDetail, Marketplace, Drops, Heritage, Profile,
  Orders, Wishlist, Atelier, VendorDashboard, AdminDashboard,
  Rewards, Wallet, Community, LiveAuction, SellerStudio,
  Governance, CmsDashboard, AtelierAdmin, InventoryManagement
} from './pages/index';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';
import { registerServiceWorker, requestNotificationPermission, subscribeToPush } from './utils/notifications';

// ─── SPLASH SCREEN ──────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => onDone(), 3500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] bg-[#050505] flex flex-col items-center justify-center">
      {/* Animated HD logo */}
      <div className={`transition-all duration-700 ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <div className="w-20 h-20 bg-[#C5A059] flex items-center justify-center mb-8 relative">
          <span className="text-black font-serif font-bold text-3xl">HD</span>
          <div className="absolute inset-0 border border-[#C5A059] animate-ping opacity-30" />
        </div>
      </div>
      <div className={`text-center transition-all duration-700 delay-300 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="text-white font-serif text-3xl font-light tracking-widest mb-2">House of Daraja</div>
        <div className="text-white/30 text-xs uppercase tracking-[0.5em]">Sovereign Heritage Platform</div>
      </div>
      <div className={`mt-12 transition-all duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs uppercase tracking-[0.4em]">Protocol Ingestion Active</span>
        </div>
      </div>
      {/* Loading bar */}
      <div className="absolute bottom-0 left-0 h-px bg-[#C5A059]/20 w-full">
        <div className={`h-full bg-[#C5A059] transition-all duration-[3500ms] ease-linear ${phase >= 0 ? 'w-full' : 'w-0'}`} />
      </div>
    </div>
  );
}

// ─── OFFLINE BANNER ─────────────────────────────────────────────────────
function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const goOffline = () => { setOnline(false); setShowBack(false); };
    const goOnline = () => { setOnline(true); setShowBack(true); setTimeout(() => setShowBack(false), 4000); };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => { window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline); };
  }, []);

  if (online && !showBack) return null;

  return (
    <div className={`fixed top-16 left-0 right-0 z-50 py-2 px-6 text-center text-xs uppercase tracking-[0.3em] transition-all ${
      online ? 'bg-green-400/20 text-green-400 border-b border-green-400/20' : 'bg-amber-400/20 text-amber-400 border-b border-amber-400/20'
    }`}>
      {online
        ? '◈ Sovereign Link Restored — Back Online'
        : '◎ Connection Severed — Local Archival Mode Engaged'}
    </div>
  );
}

// ─── LEEMA AI WIDGET ────────────────────────────────────────────────────
function LeemaWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I am Leema. Your sovereign guide through House of Daraja. How may I serve you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('en');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch('/functions/leemaAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, language: lang, context: messages.slice(-6) }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply || 'Let me look into that for you.' }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'My neural link is momentarily disrupted. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 bg-[#C5A059] text-black flex items-center justify-center shadow-2xl hover:bg-white transition-colors"
        title="Leema AI"
      >
        {open ? <span className="text-xl leading-none">✕</span> : <span className="text-xl font-serif font-bold">L</span>}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      </button>

      {open && (
        <div className="fixed bottom-36 md:bottom-24 right-6 z-50 w-80 md:w-96 bg-[#0E0E0E] border border-white/10 shadow-2xl flex flex-col" style={{ height: '480px' }}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#050505]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#C5A059] flex items-center justify-center text-black font-serif font-bold text-sm">L</div>
              <div>
                <div className="text-white text-sm font-medium">Leema</div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs">Neural Link Active</span>
                </div>
              </div>
            </div>
            <select value={lang} onChange={e => setLang(e.target.value)}
              className="bg-white/5 border border-white/10 text-white/60 text-xs px-2 py-1 focus:outline-none"
            >
              {[['en','EN'],['ha','HA'],['yo','YO'],['ig','IG'],['fr','FR'],['ar','AR']].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/80 border border-white/10'
                }`}>{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/40 animate-pulse">
                  Leema is thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask Leema..."
                className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-4 py-2 focus:outline-none focus:border-[#C5A059] placeholder-white/20"
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()}
                className="bg-[#C5A059] text-black px-4 py-2 text-sm font-bold hover:bg-white transition-colors disabled:opacity-40"
              >→</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── PUSH NOTIFICATION PROMPT ───────────────────────────────────────────
function NotificationPrompt() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      const t = setTimeout(() => setShow(true), 8000);
      return () => clearTimeout(t);
    }
  }, []);
  const handleAllow = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') { await registerServiceWorker(); await subscribeToPush(); }
    setShow(false);
  };
  if (!show) return null;
  return (
    <div className="fixed bottom-24 md:bottom-6 left-6 z-50 max-w-xs bg-[#0E0E0E] border border-[#C5A059]/30 p-5 shadow-2xl animate-slide-up">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 bg-[#C5A059]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[#C5A059] text-sm">◈</span>
        </div>
        <div>
          <div className="text-white text-sm font-medium mb-1">Stay Sovereign</div>
          <div className="text-white/50 text-xs leading-relaxed">Get notified when drops go live and orders update.</div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={handleAllow} className="flex-1 bg-[#C5A059] text-black py-2 text-xs uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors">Enable</button>
        <button onClick={() => setShow(false)} className="px-4 border border-white/20 text-white/40 text-xs uppercase tracking-[0.2em] hover:border-white/40 transition-colors">Later</button>
      </div>
    </div>
  );
}

// ─── CART DRAWER ────────────────────────────────────────────────────────
function CartDrawer({ open, onClose }) {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const loadCart = () => setItems(JSON.parse(localStorage.getItem('hd_cart') || '[]'));
  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);
  useEffect(() => { if (open) loadCart(); }, [open]);

  const removeItem = (id, size) => {
    const cart = items.filter(i => !(i.id === id && i.size === size));
    localStorage.setItem('hd_cart', JSON.stringify(cart));
    setItems(cart);
    window.dispatchEvent(new Event('cartUpdated'));
  };
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-[#0E0E0E] border-l border-white/10 flex flex-col animate-slide-up">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-white font-serif text-xl">Cart</h2>
            <div className="text-white/30 text-xs mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white text-xl transition-colors">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-white/20 text-4xl mb-4">◈</div>
              <p className="text-white/30 font-serif text-lg">Your cart is empty</p>
              <button onClick={onClose} className="mt-6 text-[#C5A059] text-xs uppercase tracking-[0.3em] hover:text-white transition-colors">Continue Shopping</button>
            </div>
          ) : items.map((item, i) => (
            <div key={`${item.id}-${item.size}-${i}`} className="flex gap-4 p-4 border border-white/5">
              {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 object-cover" />}
              <div className="flex-1">
                <div className="text-white text-sm font-serif leading-tight mb-1">{item.name}</div>
                {item.size && <div className="text-white/40 text-xs">Size: {item.size}</div>}
                <div className="text-white/40 text-xs">Qty: {item.quantity}</div>
                <div className="text-[#C5A059] text-sm mt-1">₦{(item.price * item.quantity).toLocaleString()}</div>
              </div>
              <button onClick={() => removeItem(item.id, item.size)} className="text-white/20 hover:text-red-400 text-sm self-start transition-colors">✕</button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10">
            <div className="flex justify-between mb-6">
              <span className="text-white/50 uppercase tracking-[0.2em] text-xs">Total</span>
              <span className="text-white font-serif text-2xl">₦{total.toLocaleString()}</span>
            </div>
            <button onClick={() => { onClose(); navigate('/checkout'); }}
              className="w-full bg-[#C5A059] text-black py-4 text-sm uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors"
            >Proceed to Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NAVBAR ─────────────────────────────────────────────────────────────
function Navbar({ cartCount, onCartOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);
  useEffect(() => setMobileOpen(false), [location]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/marketplace', label: 'Market' },
    { href: '/drops', label: 'Drops' },
    { href: '/heritage', label: 'Heritage' },
    { href: '/community', label: 'Media' },
    { href: '/atelier', label: 'Atelier' },
  ];

  const hiddenPaths = ['/auth', '/checkout'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[#050505]/95 backdrop-blur border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C5A059] flex items-center justify-center">
              <span className="text-black font-serif font-bold text-sm">HD</span>
            </div>
            <span className="text-white font-serif text-lg hidden md:block">House of Daraja</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.href} to={link.href}
                className={`text-xs uppercase tracking-[0.25em] transition-colors ${location.pathname === link.href ? 'text-[#C5A059]' : 'text-white/60 hover:text-white'}`}
              >{link.label}</Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className={`text-[10px] uppercase tracking-[0.2em] ${online ? 'text-green-400' : 'text-red-400'}`}>
                {online ? 'Neural Link' : 'Offline'}
              </span>
            </div>
            <Link to="/wishlist" className="text-white/50 hover:text-white transition-colors text-lg" title="Wishlist">♡</Link>
            <button onClick={onCartOpen} className="relative text-white/50 hover:text-white transition-colors" title="Cart">
              <span className="text-lg">◈</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C5A059] text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </button>
            <Link to="/profile" className="text-white/50 hover:text-white transition-colors text-lg" title="Profile">◉</Link>
            <button onClick={() => setMobileOpen(o => !o)} className="md:hidden text-white/60 hover:text-white text-xl">
              {mobileOpen ? '✕' : '≡'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-[#050505]/98 backdrop-blur pt-16 overflow-y-auto">
          <div className="flex flex-col items-center justify-center min-h-full gap-6 py-12">
            {[
              ...navLinks,
              { href: '/profile', label: 'Profile' },
              { href: '/orders', label: 'Orders' },
              { href: '/rewards', label: 'Rewards' },
              { href: '/wallet', label: 'Wallet' },
              { href: '/wishlist', label: 'Wishlist' },
              { href: '/auth', label: 'Sign In' },
            ].map(link => (
              <Link key={link.href} to={link.href}
                className={`font-serif text-3xl font-light hover:text-[#C5A059] transition-colors ${location.pathname === link.href ? 'text-[#C5A059]' : 'text-white'}`}
              >{link.label}</Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── BOTTOM NAV ─────────────────────────────────────────────────────────
function BottomNav({ cartCount }) {
  const location = useLocation();
  const hiddenPaths = ['/auth', '/checkout'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#050505]/95 backdrop-blur border-t border-white/5">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {[
          { href: '/', icon: '⌂', label: 'Home' },
          { href: '/shop', icon: '◈', label: 'Shop' },
          { href: '/drops', icon: null, label: 'Drops', special: true },
          { href: '/community', icon: '▶', label: 'Media' },
          { href: '/profile', icon: '◉', label: 'Profile' },
        ].map(item => (
          item.special ? (
            <Link key="drops" to="/drops" className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-[#C5A059] flex items-center justify-center -mt-6 shadow-lg">
                <span className="text-black font-serif font-bold text-sm">HD</span>
              </div>
            </Link>
          ) : (
            <Link key={item.href} to={item.href}
              className={`flex flex-col items-center gap-1 ${location.pathname === item.href ? 'text-[#C5A059]' : 'text-white/40'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[9px] uppercase tracking-[0.1em]">{item.label}</span>
            </Link>
          )
        ))}
      </div>
    </div>
  );
}

// ─── FOOTER ─────────────────────────────────────────────────────────────
function Footer() {
  const location = useLocation();
  if (['/auth', '/checkout'].includes(location.pathname)) return null;

  return (
    <footer className="bg-[#050505] border-t border-white/5 py-16 px-6 md:px-16 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#C5A059] flex items-center justify-center">
                <span className="text-black font-serif font-bold text-sm">HD</span>
              </div>
              <span className="text-white font-serif text-lg">House of Daraja</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed mb-4">Sovereign heritage. African luxury. Neural link active.</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs uppercase tracking-[0.2em]">Sovereign_Link_Active</span>
            </div>
          </div>
          {[
            { title: 'Collections', links: [['Shop','/shop'],['Heritage','/heritage'],['Drops','/drops'],['Atelier','/atelier'],['Marketplace','/marketplace']] },
            { title: 'Account', links: [['Profile','/profile'],['Orders','/orders'],['Rewards','/rewards'],['Wallet','/wallet'],['Wishlist','/wishlist']] },
            { title: 'Platform', links: [['Community','/community'],['Seller Studio','/seller-studio'],['Vendor Portal','/vendor'],['Admin','/admin'],['Sign In','/auth']] },
          ].map(col => (
            <div key={col.title}>
              <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-4">{col.title}</div>
              <div className="space-y-2">
                {col.links.map(([label, href]) => (
                  <Link key={label} to={href} className="block text-white/40 text-sm hover:text-white transition-colors">{label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/20 text-xs">© 2026 House of Daraja. All rights reserved.</div>
          <div className="flex gap-6">
            {['Wear Your Worth', 'Sovereign Heritage', 'Neural Link Active'].map(tag => (
              <span key={tag} className="text-white/20 text-xs">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────
function AppContent() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const items = JSON.parse(localStorage.getItem('hd_cart') || '[]');
    setCartCount(items.reduce((s, i) => s + i.quantity, 0));
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    registerServiceWorker();
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <OfflineBanner />
      <main className="pt-16">
        <Routes>
          {/* Core Store */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/marketplace" element={<Marketplace />} />
          {/* Events & Social */}
          <Route path="/drops" element={<Drops />} />
          <Route path="/heritage" element={<Heritage />} />
          <Route path="/community" element={<Community />} />
          <Route path="/live-auction/:auctionId" element={<LiveAuction />} />
          {/* User */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/wallet" element={<Wallet />} />
          {/* Commerce */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/atelier" element={<Atelier />} />
          {/* Portals */}
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/seller-studio" element={<SellerStudio />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/atelier" element={<AtelierAdmin />} />
          <Route path="/admin/inventory" element={<InventoryManagement />} />
          <Route path="/cms" element={<CmsDashboard />} />
          <Route path="/governance" element={<Governance />} />
          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav cartCount={cartCount} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <LeemaWidget />
      <NotificationPrompt />
    </div>
  );
}

export default function App() {
  const [splash, setSplash] = useState(true);

  return (
    <Router>
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      {!splash && <AppContent />}
    </Router>
  );
}
