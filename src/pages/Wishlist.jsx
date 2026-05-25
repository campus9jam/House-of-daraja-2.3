import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WishlistItem } from '../api/entities';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    WishlistItem.list().then(setItems).finally(() => setLoading(false));
  }, []);

  const removeItem = async (id) => {
    await WishlistItem.delete(id);
    setItems(i => i.filter(x => x.id !== id));
  };

  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('hd_cart') || '[]');
    const exists = cart.findIndex(c => c.id === item.product_id);
    if (exists >= 0) { cart[exists].quantity += 1; }
    else {
      cart.push({ id: item.product_id, name: item.product_name, price: item.product_price, image: item.product_image, quantity: 1 });
    }
    localStorage.setItem('hd_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="py-16 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-px bg-[#C5A059]" />
          <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">Saved Pieces</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-white font-light mb-12">Wishlist</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
            {[1,2,3,4].map(i => <div key={i} className="bg-[#050505] aspect-[3/4] animate-pulse bg-white/5" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 border border-white/5">
            <div className="text-[#C5A059]/30 text-5xl mb-6">♡</div>
            <p className="text-white/30 font-serif text-2xl mb-3">Nothing saved yet</p>
            <p className="text-white/20 text-sm mb-8">Heart pieces you love while browsing</p>
            <Link to="/shop" className="text-[#C5A059] text-xs uppercase tracking-[0.3em] border border-[#C5A059]/30 px-6 py-3 hover:bg-[#C5A059] hover:text-black transition-all">
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
            {items.map(item => (
              <div key={item.id} className="bg-[#050505] group relative">
                <Link to={`/product/${item.product_id}`} className="block">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <span className="text-white/20 text-4xl">✦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-serif text-base leading-tight mb-1 group-hover:text-[#C5A059] transition-colors">{item.product_name}</h3>
                    <div className="text-[#C5A059] text-sm">₦{item.product_price?.toLocaleString()}</div>
                  </div>
                </Link>
                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => addToCart(item)}
                    className="flex-1 py-2 bg-[#C5A059] text-black text-xs uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-10 h-8 border border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/30 transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
