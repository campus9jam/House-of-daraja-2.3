import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, VendorProfile } from '../api/entities';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    Promise.all([
      Product.filter({ status: 'active' }),
      VendorProfile.filter({ status: 'active' }),
    ]).then(([p, v]) => {
      setProducts(p);
      setVendors(v);
    }).finally(() => setLoading(false));
  }, []);

  const displayProducts = selectedVendor
    ? products.filter(p => p.vendor_id === selectedVendor)
    : products;

  const featured = displayProducts[0];
  const secondary = displayProducts.slice(1, 3);
  const rest = displayProducts.slice(3);

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="py-16 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-px bg-[#C5A059]" />
          <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">Artisan Exchange</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif text-white font-light mb-4">Marketplace</h1>
        <p className="text-white/40 max-w-lg leading-relaxed">
          A curated exchange connecting sovereign buyers with verified African artisans and heritage brands.
        </p>
      </div>

      {/* Vendor Filter */}
      {vendors.length > 0 && (
        <div className="px-6 md:px-16 max-w-7xl mx-auto mb-12">
          <div className="text-white/30 text-xs uppercase tracking-[0.3em] mb-4">Filter by Vendor</div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedVendor(null)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                !selectedVendor ? 'bg-[#C5A059] text-black' : 'border border-white/10 text-white/50 hover:text-white'
              }`}
            >
              All Vendors
            </button>
            {vendors.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVendor(selectedVendor === v.user_id ? null : v.user_id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                  selectedVendor === v.user_id ? 'bg-[#C5A059] text-black' : 'border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {v.is_verified && <span>✓</span>}
                {v.store_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products — Golden ratio editorial layout */}
      <div className="px-6 md:px-16 max-w-7xl mx-auto pb-20">
        {loading ? (
          <div className="text-center py-24">
            <div className="text-[#C5A059] animate-pulse font-serif text-xl">Loading marketplace...</div>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/30 font-serif text-2xl">No products available</p>
          </div>
        ) : (
          <>
            {/* Editorial layout: 1 large (62%) + 2 small (38%) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-white/5 mb-px">
              {featured && (
                <div className="md:col-span-3 bg-[#050505]">
                  <Link to={`/product/${featured.id}`} className="group block">
                    <div className="aspect-[4/5] md:aspect-[3/4] overflow-hidden relative">
                      <img
                        src={featured.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'}
                        alt={featured.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8">
                        <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-2">{featured.category}</div>
                        <h2 className="text-white font-serif text-3xl font-light mb-2 group-hover:text-[#C5A059] transition-colors">
                          {featured.name}
                        </h2>
                        <div className="text-white/80 text-lg">₦{featured.price?.toLocaleString()}</div>
                        {featured.vendor_name && (
                          <div className="text-white/40 text-xs mt-2 uppercase tracking-[0.2em]">by {featured.vendor_name}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* 2 stacked (38%) */}
              <div className="md:col-span-2 flex flex-col gap-px bg-white/5">
                {secondary.map(p => (
                  <div key={p.id} className="bg-[#050505]">
                    <Link to={`/product/${p.id}`} className="group flex h-full">
                      <div className="w-1/2 overflow-hidden">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="w-1/2 p-6 flex flex-col justify-center bg-[#0A0A0A]">
                        <div className="text-[#C5A059] text-[10px] uppercase tracking-[0.3em] mb-2">{p.category}</div>
                        <h3 className="text-white font-serif text-lg leading-tight mb-3 group-hover:text-[#C5A059] transition-colors">{p.name}</h3>
                        <div className="text-white/70 text-sm">₦{p.price?.toLocaleString()}</div>
                        {p.vendor_name && <div className="text-white/30 text-xs mt-2">{p.vendor_name}</div>}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Rest in 4-col grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
                {rest.map(p => (
                  <div key={p.id} className="bg-[#050505]">
                    <Link to={`/product/${p.id}`} className="group block">
                      <div className="aspect-square overflow-hidden relative">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-[#C5A059] text-[9px] uppercase tracking-[0.3em] mb-1">{p.category}</div>
                        <h3 className="text-white text-sm font-serif leading-tight mb-1 group-hover:text-[#C5A059] transition-colors">{p.name}</h3>
                        <div className="text-white/60 text-xs">₦{p.price?.toLocaleString()}</div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
