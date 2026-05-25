import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, WishlistItem, Review } from '../api/entities';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      Product.get(id),
      Review.filter({ product_id: id }),
    ]).then(([p, r]) => {
      setProduct(p);
      setReviews(r);
      if (p?.sizes?.length > 0) setSelectedSize(p.sizes[0]);
    }).finally(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    if (!selectedSize && product?.sizes?.length > 0) {
      alert('Please select a size');
      return;
    }
    const cart = JSON.parse(localStorage.getItem('hd_cart') || '[]');
    const existing = cart.findIndex(i => i.id === product.id && i.size === selectedSize);
    if (existing >= 0) {
      cart[existing].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        size: selectedSize,
        quantity,
        category: product.category,
      });
    }
    localStorage.setItem('hd_cart', JSON.stringify(cart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const addToWishlist = async () => {
    try {
      await WishlistItem.create({
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0],
        product_price: product.price,
      });
      setWishlistAdded(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-[#C5A059] animate-pulse font-serif text-2xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 font-serif text-2xl mb-4">Product not found</p>
          <Link to="/shop" className="text-[#C5A059] text-sm uppercase tracking-[0.2em]">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'];

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-[0.2em] mb-8">
          <Link to="/" className="hover:text-[#C5A059] transition-colors">HD</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#C5A059] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-white/60">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Images — 62% */}
          <div className="lg:col-span-3">
            {/* Main image */}
            <div className="aspect-[3/4] overflow-hidden mb-3 bg-[#0E0E0E]">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 aspect-square overflow-hidden border transition-all ${
                      i === activeImage ? 'border-[#C5A059]' : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info — 38% */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">{product.category}</span>
              {product.vendor_name && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-white/40 text-xs">{product.vendor_name}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-serif text-white font-light leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={s <= Math.round(product.rating) ? 'text-[#C5A059]' : 'text-white/20'}>★</span>
                  ))}
                </div>
                <span className="text-white/40 text-sm">({reviews.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-white/10">
              <span className="text-3xl text-white font-light">₦{product.price?.toLocaleString()}</span>
              {product.original_price && (
                <span className="text-white/30 text-lg line-through">₦{product.original_price?.toLocaleString()}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-white/60 leading-relaxed mb-8 text-sm font-light">{product.description}</p>

            {/* Details */}
            <div className="space-y-3 mb-8 pb-8 border-b border-white/10">
              {product.material && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/30 uppercase tracking-[0.2em] text-xs">Material</span>
                  <span className="text-white/70">{product.material}</span>
                </div>
              )}
              {product.origin && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/30 uppercase tracking-[0.2em] text-xs">Origin</span>
                  <span className="text-white/70">{product.origin}</span>
                </div>
              )}
              {product.stock > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/30 uppercase tracking-[0.2em] text-xs">Stock</span>
                  <span className={product.stock <= 3 ? 'text-[#C5A059]' : 'text-white/70'}>
                    {product.stock <= 3 ? `Only ${product.stock} left` : 'In Stock'}
                  </span>
                </div>
              )}
            </div>

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3">Select Size</div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-[#C5A059] text-black'
                          : 'border border-white/20 text-white/60 hover:border-white/60'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <div className="text-white/40 text-xs uppercase tracking-[0.3em]">Qty</div>
              <div className="flex items-center border border-white/20">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-10 h-10 text-white/60 hover:text-white text-lg">−</button>
                <span className="w-12 text-center text-white text-sm">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q+1))} className="w-10 h-10 text-white/60 hover:text-white text-lg">+</button>
              </div>
            </div>

            {/* CTA Buttons — width = 61.8% of container */}
            <div className="space-y-3">
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className={`w-[61.8%] py-4 text-sm uppercase tracking-[0.2em] font-semibold transition-all ${
                  product.stock === 0
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : addedToCart
                    ? 'bg-white text-black'
                    : 'bg-[#C5A059] text-black hover:bg-white'
                }`}
              >
                {product.stock === 0 ? 'Sold Out' : addedToCart ? 'Added ✓' : 'Add to Cart'}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={addToWishlist}
                  className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] border transition-all ${
                    wishlistAdded
                      ? 'border-[#C5A059] text-[#C5A059]'
                      : 'border-white/20 text-white/50 hover:border-white/60 hover:text-white'
                  }`}
                >
                  {wishlistAdded ? '♥ Saved' : '♡ Wishlist'}
                </button>
                {product.category === 'Atelier' || product.category === 'Heritage' ? (
                  <Link
                    to="/atelier"
                    className="flex-1 py-4 text-xs uppercase tracking-[0.2em] border border-[#C5A059]/50 text-[#C5A059] text-center hover:bg-[#C5A059] hover:text-black transition-all"
                  >
                    Bespoke Order
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {product.tags.map(tag => (
                  <span key={tag} className="text-white/30 text-xs uppercase tracking-[0.2em] border border-white/10 px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-20 border-t border-white/10 pt-12">
            <h2 className="text-2xl font-serif text-white mb-8">Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(review => (
                <div key={review.id} className="border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-sm font-medium">{review.user_name}</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= review.rating ? 'text-[#C5A059] text-sm' : 'text-white/20 text-sm'}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{review.comment}</p>
                  {review.is_verified_purchase && (
                    <div className="mt-3 text-[#C5A059] text-xs uppercase tracking-[0.2em]">✓ Verified Purchase</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
