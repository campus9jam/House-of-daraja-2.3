import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronRight, ChevronLeft, TrendingUp, Sparkles, Star, Gavel, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../api/entities';

const DEFAULT_HERO_IMAGES = [
  "https://i.imgur.com/7QFYTZJ.png",
  "https://i.imgur.com/MA123T4.png",
  "https://i.imgur.com/S4l7lKP.png",
  "https://i.imgur.com/jNv9WE7.png",
  "https://i.imgur.com/2Xkwv9Y.png"
];

const TAGLINES = [
  "Wear Your Worth",
  "Sovereign Heritage",
  "Neural Link Active"
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages] = useState(DEFAULT_HERO_IMAGES);
  const [latestProducts, setLatestProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [taglineIdx, setTaglineIdx] = useState(0);

  useEffect(() => {
    Product.list('-created_date', 12)
      .then(products => {
        setLatestProducts(products.slice(0, 4));
        setTrendingProducts(products.filter(p => p.is_featured).slice(0, 4));
        setTopRatedProducts([...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Hero auto-advance
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % heroImages.length), 8000);
    return () => clearInterval(t);
  }, [heroImages.length]);

  // Tagline cycle
  useEffect(() => {
    const t = setInterval(() => setTaglineIdx(p => (p + 1) % TAGLINES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const nextSlide = () => setCurrentSlide(p => (p + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide(p => (p - 1 + heroImages.length) % heroImages.length);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    alert('Identity Locked — You have been registered in the archive distribution ledger.');
    setEmail('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen pb-32 md:pb-0 overflow-hidden bg-daraja-charcoal"
    >
      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className="relative h-[90vh] flex flex-col justify-end p-8 overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={heroImages[currentSlide]}
              alt={`Heritage Slide ${currentSlide + 1}`}
              className="w-full h-full object-cover object-center brightness-75"
              referrerPolicy="no-referrer"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Prev/Next Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 glass border border-white/10 text-white hover:border-[#C5A059] hover:text-[#C5A059] transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 glass border border-white/10 text-white hover:border-[#C5A059] hover:text-[#C5A059] transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-5xl mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="w-10 h-[1.5px] bg-[#C5A059]" />
            <span className="mono-text text-[#C5A059]/80 text-[9px]">HERITAGE ARCHIVE V2.3</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="relative"
          >
            {/* Ghost watermark */}
            <h2 className="text-[12vw] md:text-[10rem] font-serif font-black text-white leading-[0.8] tracking-tighter uppercase mix-blend-overlay opacity-30 absolute -top-12 -left-4 pointer-events-none whitespace-nowrap">
              DAR<span className="italic">AJA</span>
            </h2>
            <h1 className="text-6xl md:text-[9rem] font-serif italic text-white leading-[1] relative z-10">
              <span className="text-[#C5A059] not-italic font-bold">HD</span> Heritage <br />
              <span className="ml-12 md:ml-24">Collection</span>
            </h1>
          </motion.div>

          {/* Rotating tagline */}
          <motion.div
            key={taglineIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-8 flex items-center gap-4"
          >
            <span className="text-[#C5A059]/60 mono-text text-[10px] uppercase tracking-[0.6em]">{TAGLINES[taglineIdx]}</span>
          </motion.div>

          <div className="flex gap-4 mt-10">
            <Link
              to="/shop"
              className="px-10 py-5 bg-[#C5A059] text-black font-bold mono-text text-[10px] uppercase tracking-[0.5em] hover:bg-white transition-all flex items-center gap-3"
            >
              ENTER_ARCHIVE <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/drops"
              className="px-10 py-5 border border-white/20 text-white mono-text text-[10px] uppercase tracking-[0.5em] hover:border-[#C5A059] hover:text-[#C5A059] transition-all flex items-center gap-3"
            >
              LIVE_DROPS
            </Link>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-16 right-12 flex gap-4 z-20">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-[2px] transition-all duration-1000 ${
                currentSlide === i
                  ? 'w-16 bg-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.5)]'
                  : 'w-6 bg-white/10'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── SOVEREIGN MARKET TICKER ──────────────────────── */}
      <div className="bg-[#C5A059] h-12 overflow-hidden flex whitespace-nowrap items-center border-y border-black/20">
        <div className="flex gap-24 items-center animate-ticker min-w-[200%]">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex gap-24 items-center flex-shrink-0">
              <span className="flex items-center gap-4 text-black font-bold uppercase text-[9px] tracking-[0.5em]">
                <TrendingUp className="w-3 h-3" /> VOL: 1.2M
              </span>
              <span className="flex items-center gap-4 text-black font-bold uppercase text-[9px] tracking-[0.5em]">
                <Sparkles className="w-3 h-3" /> NODES: 8.4k
              </span>
              <span className="flex items-center gap-4 text-black font-bold uppercase text-[9px] tracking-[0.5em]">
                <Clock className="w-3 h-3" /> SYNC: ACTIVE
              </span>
              <span className="text-black/30">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── LATEST PRODUCTS (62% focus) ──────────────────── */}
      <section className="px-6 md:px-12 py-24">
        <div className="flex justify-between items-end mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-[1px] bg-[#C5A059]" />
              <span className="mono-text text-[#C5A059] text-[9px] uppercase tracking-[0.5em]">LATEST_ARCHIVE</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif italic text-white">New <span className="text-[#C5A059] not-italic">Acquisitions</span></h2>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 mono-text text-[10px] text-white/40 hover:text-[#C5A059] transition-colors">
            VIEW_ALL <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="luxury-card aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(latestProducts.length > 0 ? latestProducts : [...Array(4)].map((_, i) => ({
              id: i, name: `Heritage Piece ${i + 1}`, price: 45000 + i * 10000,
              images: ["https://i.imgur.com/7QFYTZJ.png"], category: "Heritage"
            }))).map((product, i) => (
              <ProductCard key={product.id || i} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── GOLDEN GRID: FEATURED (1 large + 2 small) ───── */}
      <section className="px-6 md:px-12 py-24 bg-[#0E0E0E]">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-6 h-[1px] bg-[#C5A059]" />
          <span className="mono-text text-[#C5A059] text-[9px] uppercase tracking-[0.5em]">EDITORIAL_SELECTION</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 62% large card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-7 luxury-card overflow-hidden group cursor-pointer relative"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src="https://i.imgur.com/S4l7lKP.png"
                alt="Featured"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <span className="mono-text text-[#C5A059] text-[9px] uppercase tracking-widest">Featured_Drop</span>
              <h3 className="text-3xl font-serif italic text-white mt-2">Ancestral Sahelian Kaftan</h3>
              <p className="text-white/60 mono-text text-[10px] mt-2">₦85,000 · Heritage Series</p>
            </div>
          </motion.div>

          {/* 38% two stacked */}
          <div className="md:col-span-5 grid grid-rows-2 gap-6">
            {[
              { img: "https://i.imgur.com/jNv9WE7.png", name: "Nomadic Silhouette Vest", price: "₦62,000" },
              { img: "https://i.imgur.com/2Xkwv9Y.png", name: "Ethereal Silk Sequence", price: "₦120,000" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="luxury-card overflow-hidden group cursor-pointer relative"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[8s]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h4 className="text-lg font-serif italic text-white">{item.name}</h4>
                  <p className="text-[#C5A059] mono-text text-[9px] mt-1">{item.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING ─────────────────────────────────────── */}
      {trendingProducts.length > 0 && (
        <section className="px-6 md:px-12 py-24">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-6 h-[1px] bg-[#C5A059]" />
            <span className="mono-text text-[#C5A059] text-[9px] uppercase tracking-[0.5em]">TRENDING_NODES</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingProducts.map((p, i) => <ProductCard key={p.id || i} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* ── LIVE DROP TEASER ─────────────────────────────── */}
      <section className="px-6 md:px-12 py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://i.imgur.com/MA123T4.png" alt="" className="w-full h-full object-cover brightness-20 opacity-30" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-4 text-[#C5A059] mono-text">
            <span className="w-8 h-[1px] bg-[#C5A059]/40" />
            <span className="animate-pulse flex items-center gap-2 font-bold tracking-[0.5em] text-[10px]">
              ✦ LIMITED DROP — DROPS PAGE ✦
            </span>
            <span className="w-8 h-[1px] bg-[#C5A059]/40" />
          </div>
          <h2 className="text-5xl md:text-7xl font-serif italic text-white">Sovereign <span className="text-[#C5A059] not-italic">Drops</span></h2>
          <p className="text-white/50 font-serif italic text-lg leading-relaxed">
            Exclusive, time-limited releases from the Heritage Archive. Each drop is a singular moment.
          </p>
          <Link
            to="/drops"
            className="inline-flex items-center gap-3 px-12 py-6 bg-[#C5A059] text-black font-black mono-text text-[10px] uppercase tracking-[0.5em] hover:bg-white transition-all"
          >
            ACCESS_DROPS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── TOP RATED ────────────────────────────────────── */}
      {topRatedProducts.length > 0 && (
        <section className="px-6 md:px-12 py-24 bg-[#0E0E0E]">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-6 h-[1px] bg-[#C5A059]" />
            <span className="mono-text text-[#C5A059] text-[9px] uppercase tracking-[0.5em]">CURATOR_PICKS</span>
            <Star className="w-3 h-3 text-[#C5A059]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {topRatedProducts.map((p, i) => <ProductCard key={p.id || i} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* ── EMAIL SUBSCRIPTION ───────────────────────────── */}
      <section className="px-6 md:px-12 py-32 border-t border-white/5">
        <div className="max-w-xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-3 text-[#C5A059] mono-text text-[9px] uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            ARCHIVE_DISTRIBUTION_LEDGER
          </div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-white">Register <span className="text-[#C5A059] not-italic">Your Identity</span></h2>
          <p className="text-white/40 font-serif italic">Be the first to receive drops, heritage releases, and atelier access.</p>
          <form onSubmit={handleSubscribe} className="flex gap-0">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="archive@daraja.io"
              className="flex-1 bg-[#0E0E0E] border border-white/10 border-r-0 px-6 py-5 text-white font-mono text-sm focus:border-[#C5A059] outline-none"
            />
            <button
              type="submit"
              className="px-8 py-5 bg-[#C5A059] text-black font-black mono-text text-[9px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
            >
              LOCK <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        </div>
      </section>
    </motion.div>
  );
}

// ─── PRODUCT CARD COMPONENT ─────────────────────────────────
function ProductCard({ product, index }) {
  const img = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : "https://i.imgur.com/7QFYTZJ.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/product/${product.id}`} className="luxury-card group block overflow-hidden hover:border-[#C5A059]/40 transition-all">
        {/* Image — 62% */}
        <div className="aspect-[3/4] overflow-hidden relative">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {product.is_featured && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-[#C5A059] text-black mono-text text-[8px] uppercase tracking-widest">
              FEATURED
            </div>
          )}
        </div>
        {/* Info — 38% */}
        <div className="p-5 space-y-2">
          <p className="mono-text text-[#C5A059] text-[8px] uppercase tracking-widest">{product.category || 'Heritage'}</p>
          <h3 className="font-serif italic text-white text-lg leading-tight line-clamp-2">{product.name}</h3>
          <p className="mono-text text-white text-[11px]">₦{(product.price || 0).toLocaleString()}</p>
        </div>
      </Link>
    </motion.div>
  );
}
