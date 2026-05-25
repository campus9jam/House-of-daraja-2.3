import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, Drop, HeritagePost } from '../api/entities';
import { createPageUrl } from '../utils';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=90',
    title: 'Sovereign Heritage',
    subtitle: 'Wear Your Worth',
    cta: 'Explore Heritage',
    link: '/shop?category=Heritage',
  },
  {
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=1600&q=90',
    title: 'HD Heritage Collection',
    subtitle: 'Where tradition becomes sovereign',
    cta: 'Shop Now',
    link: '/shop',
  },
  {
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=1600&q=90',
    title: 'Urban Sovereignty',
    subtitle: 'African streetwear, redefined',
    cta: 'Explore Streetwear',
    link: '/shop?category=Streetwear',
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [liveDrop, setLiveDrop] = useState(null);
  const [heritagePosts, setHeritagePosts] = useState([]);
  const [dropTimeLeft, setDropTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    Product.filter({ is_featured: true }).then(p => setFeaturedProducts(p.slice(0, 6)));
    Drop.filter({ status: 'live' }).then(d => { if (d[0]) setLiveDrop(d[0]); });
    HeritagePost.filter({ is_published: true }).then(p => setHeritagePosts(p.slice(0, 3)));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(s => (s + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!liveDrop?.end_time) return;
    const tick = () => {
      const diff = new Date(liveDrop.end_time) - Date.now();
      if (diff <= 0) { setDropTimeLeft({ h: 0, m: 0, s: 0 }); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDropTimeLeft({ h, m, s });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [liveDrop]);

  const slide = heroSlides[currentSlide];

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* HERO — 38% viewport */}
      <section className="relative h-[62vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-[#050505]" />
        <div className="relative h-full flex flex-col justify-end pb-12 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-[#C5A059]" />
              <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em] font-medium">New Collection</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-white font-light leading-tight mb-4">
              {slide.title}
            </h1>
            <p className="text-white/60 text-lg mb-8 font-light tracking-wide">{slide.subtitle}</p>
            <Link
              to={slide.link}
              className="inline-flex items-center gap-3 bg-[#C5A059] text-black px-8 py-4 text-sm uppercase tracking-[0.2em] font-semibold hover:bg-white transition-colors"
            >
              {slide.cta}
              <span>→</span>
            </Link>
          </div>
        </div>
        {/* Slide indicators */}
        <div className="absolute bottom-6 right-16 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-px transition-all ${i === currentSlide ? 'w-8 bg-[#C5A059]' : 'w-4 bg-white/30'}`}
            />
          ))}
        </div>
      </section>

      {/* LIVE DROP BANNER */}
      {liveDrop && (
        <section className="bg-[#C5A059]/10 border-y border-[#C5A059]/20 py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
              <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">Live Drop</span>
              <span className="text-white font-serif text-lg">{liveDrop.name}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex gap-3 text-white">
                {[
                  { v: dropTimeLeft.h, l: 'H' },
                  { v: dropTimeLeft.m, l: 'M' },
                  { v: dropTimeLeft.s, l: 'S' },
                ].map(({ v, l }) => (
                  <div key={l} className="text-center">
                    <div className="text-2xl font-mono font-bold text-[#C5A059]">
                      {String(v).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase">{l}</div>
                  </div>
                ))}
              </div>
              <Link
                to="/drops"
                className="bg-[#C5A059] text-black px-6 py-2 text-xs uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors"
              >
                Join Drop
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS — 62% focus */}
      <section className="py-20 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#C5A059]" />
              <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">Latest Arrivals</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-white font-light">The Collection</h2>
          </div>
          <Link to="/shop" className="text-[#C5A059] text-sm uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2">
            View All <span>→</span>
          </Link>
        </div>

        {/* Golden ratio grid: 1 large (62%) + 2 smaller (38%) + rest */}
        {featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-white/5">
            {/* Large featured */}
            <div className="md:col-span-3 bg-[#050505]">
              <ProductCard product={featuredProducts[0]} large />
            </div>
            {/* Two stacked */}
            <div className="md:col-span-2 flex flex-col gap-px bg-white/5">
              {featuredProducts.slice(1, 3).map(p => (
                <div key={p.id} className="bg-[#050505]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remaining products in grid */}
        {featuredProducts.length > 3 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/5 mt-px">
            {featuredProducts.slice(3).map(p => (
              <div key={p.id} className="bg-[#050505]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="py-16 px-6 md:px-16 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Heritage', img: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600', desc: 'Sahelian tradition' },
            { name: 'Streetwear', img: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600', desc: 'Urban sovereignty' },
            { name: 'Atelier', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', desc: 'Bespoke tailoring' },
            { name: 'Accessories', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', desc: 'Artisan craft' },
          ].map(cat => (
            <Link
              key={cat.name}
              to={`/shop?category=${cat.name}`}
              className="group relative aspect-[3/4] overflow-hidden"
            >
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-1">{cat.desc}</div>
                <div className="text-white font-serif text-2xl">{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HERITAGE STORIES */}
      {heritagePosts.length > 0 && (
        <section className="py-20 px-6 md:px-16 max-w-7xl mx-auto border-t border-white/5">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-px bg-[#C5A059]" />
                <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">Style Stories</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-white font-light">The Archive</h2>
            </div>
            <Link to="/heritage" className="text-[#C5A059] text-sm uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2">
              Full Archive <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {heritagePosts.map(post => (
              <Link key={post.id} to="/heritage" className="group">
                <div className="aspect-[16/10] overflow-hidden mb-4">
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-2">{post.category}</div>
                <h3 className="text-white font-serif text-xl leading-tight group-hover:text-[#C5A059] transition-colors">{post.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* BRAND MANIFESTO */}
      <section className="py-24 bg-[#0E0E0E] border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center px-6">
          <div className="text-[#C5A059] text-xs uppercase tracking-[0.4em] mb-8">The Daraja Manifesto</div>
          <blockquote className="text-white font-serif text-3xl md:text-5xl font-light leading-relaxed mb-8">
            "We do not design clothes.<br />We architect sovereignty."
          </blockquote>
          <p className="text-white/40 leading-relaxed">
            House of Daraja bridges the sacred heritage of the Sahel with the living pulse of modern Africa.
            Every thread is a decision. Every pattern is a declaration.
            Wear your worth.
          </p>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, large }) {
  if (!product) return null;
  return (
    <Link to={`/product/${product.id}`} className="group block relative overflow-hidden">
      <div className={`relative overflow-hidden ${large ? 'aspect-[3/4]' : 'aspect-square'}`}>
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute top-4 left-4 bg-[#C5A059] text-black text-[10px] uppercase tracking-[0.2em] px-3 py-1">
            Only {product.stock} left
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-4 left-4 bg-white/10 backdrop-blur text-white text-[10px] uppercase tracking-[0.2em] px-3 py-1">
            Sold Out
          </div>
        )}
      </div>
      <div className="p-4 bg-[#0E0E0E]">
        <div className="text-[#C5A059] text-[10px] uppercase tracking-[0.3em] mb-1">{product.category}</div>
        <h3 className="text-white font-serif text-lg leading-tight mb-2 group-hover:text-[#C5A059] transition-colors">{product.name}</h3>
        <div className="flex items-center gap-3">
          <span className="text-white font-light text-base">₦{product.price?.toLocaleString()}</span>
          {product.original_price && (
            <span className="text-white/30 text-sm line-through">₦{product.original_price?.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
