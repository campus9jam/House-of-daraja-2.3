import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product } from '../api/entities';

const CATEGORIES = ['All', 'Heritage', 'Streetwear', 'Atelier', 'Accessories', 'Textile'];
const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState('featured');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const filters = { status: 'active' };
    if (activeCategory !== 'All') filters.category = activeCategory;
    Product.filter(filters)
      .then(data => {
        let sorted = [...data];
        if (sort === 'price_asc') sorted.sort((a, b) => a.price - b.price);
        if (sort === 'price_desc') sorted.sort((a, b) => b.price - a.price);
        if (sort === 'newest') sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        setProducts(sorted);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, sort]);

  const filtered = search
    ? products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="min-h-screen bg-[#050505] pt-8">
      {/* Header */}
      <div className="px-6 md:px-16 max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-px bg-[#C5A059]" />
          <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">The Collection</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif text-white font-light">Shop</h1>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-[#050505]/95 backdrop-blur border-b border-white/5 px-6 md:px-16 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchParams(cat !== 'All' ? { category: cat } : {});
                }}
                className={`px-4 py-2 text-xs uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#C5A059] text-black font-semibold'
                    : 'text-white/50 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-sm px-4 py-2 w-40 focus:outline-none focus:border-[#C5A059] placeholder-white/30"
              />
            </div>
            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-white/5 border border-white/10 text-white/70 text-xs uppercase tracking-[0.1em] px-4 py-2 focus:outline-none focus:border-[#C5A059]"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-6 md:px-16 max-w-7xl mx-auto py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#050505] aspect-[3/4] animate-pulse bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/30 font-serif text-2xl">No pieces found</p>
            <p className="text-white/20 text-sm mt-2">Try a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/5">
            {filtered.map(product => (
              <div key={product.id} className="bg-[#050505]">
                <Link to={`/product/${product.id}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {product.is_featured && (
                      <div className="absolute top-3 right-3 bg-[#C5A059] text-black text-[9px] uppercase tracking-[0.2em] px-2 py-1">Featured</div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white/70 text-xs uppercase tracking-[0.3em]">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-[#C5A059] text-[9px] uppercase tracking-[0.3em] mb-1">{product.category} · {product.origin}</div>
                    <h3 className="text-white font-serif text-base leading-tight mb-2 group-hover:text-[#C5A059] transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-light">₦{product.price?.toLocaleString()}</span>
                      {product.rating > 0 && (
                        <span className="text-[#C5A059] text-xs">★ {product.rating}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
