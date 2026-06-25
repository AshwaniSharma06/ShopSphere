import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { formatCurrency, calcDiscountedPrice } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

/**
 * ProductCard Component.
 * Renders a premium interactive card showing product images, rating, details, and call-to-action buttons.
 * 
 * @param {object} props - Component properties.
 * @param {object} props.product - The product details object to display.
 */
export default function ProductCard({ product }) {
  const {
    _id,
    title,
    price,
    discountPercent,
    images,
    rating,
    numReviews,
    category,
    isFeatured,
    isTrending,
    stock,
  } = product;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(_id);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });

  const discountedPrice = calcDiscountedPrice(price, discountPercent);
  const mainImage = images && images.length > 0
    ? images[0]
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rotateX: (y - 0.5) * -12,
      rotateY: (x - 0.5) * 12,
    });
    setSpotlightPos({ x: x * 100, y: y * 100 });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setSpotlightPos({ x: 50, y: 50 });
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    fetch('/api/v1/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'click_event', action: 'add_to_cart', productId: _id, title })
    }).catch(() => {});

    try {
      await addToCart(product, 1);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group perspective-container h-full"
    >
      <motion.div
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative h-full flex flex-col overflow-hidden rounded-2xl transition-shadow duration-300"
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.06)',
          transformStyle: 'preserve-3d',
        }}
        whileHover={{
          boxShadow: '0 0 0 1px rgba(0,212,255,0.2), 0 8px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0,212,255,0.06)',
        }}
      >
        {/* Mouse-follow spotlight */}
        <div
          className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(350px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(0,212,255,0.06), transparent 70%)`,
          }}
        />

        {/* Product Image */}
        {/* Product Image Area */}
        <div className="relative overflow-hidden aspect-[4/3]" style={{ background: '#0A0A0A' }}>
          <Link to={`/product/${_id}`} className="block w-full h-full" onClick={() => {
            fetch('/api/v1/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'click_event', action: 'navigate_details_image', productId: _id, title })
            }).catch(() => {});
          }}>
            <img
              src={mainImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {discountPercent > 0 && (
              <span className="badge-danger px-2 py-0.5 text-[10px]">
                {discountPercent}% OFF
              </span>
            )}
            {isFeatured && (
              <span className="badge-primary px-2 py-0.5 text-[10px]">
                Featured
              </span>
            )}
            {isTrending && (
              <span className="badge-warning px-2 py-0.5 text-[10px]">
                Trending
              </span>
            )}
            {stock === 0 && (
              <span className="badge px-2 py-0.5 text-[10px]" style={{ background: 'rgba(255,255,255,0.08)', color: '#999', border: '1px solid rgba(255,255,255,0.1)' }}>
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist quick button (top-right) */}
          <button
            onClick={handleAddToWishlist}
            className="absolute top-3 right-3 z-10 p-2 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
            style={{
              background: inWishlist ? 'rgba(236,72,153,0.15)' : 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${inWishlist ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.1)'}`,
            }}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-cyber text-cyber' : 'text-frost'}`} />
          </button>

          {/* Hover overlay with actions */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-center gap-2 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto"
               style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
            <Link
              to={`/product/${_id}`}
              className="p-2.5 rounded-xl text-frost transition-all duration-200 hover:text-electric"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Link>
            {stock > 0 && (
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-obsidian transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #00D4FF, #00A3CC)', boxShadow: '0 0 15px rgba(0,212,255,0.3)' }}
                title="Add to Cart"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
            )}
          </div>
        </div>

        {/* Info Content */}
        <div className="p-4 flex-grow flex flex-col justify-between relative z-10">
          <div className="space-y-1.5">
            {category && (
              <span className="text-[10px] font-bold text-electric uppercase tracking-widest block">
                {category.name}
              </span>
            )}
            <Link to={`/product/${_id}`} className="block">
              <h3 className="font-semibold text-frost text-sm line-clamp-1 group-hover:text-electric transition-colors duration-200">
                {title}
              </h3>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(rating)
                        ? 'fill-amber text-amber'
                        : 'text-ash'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-smoke">
                ({numReviews || 0})
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mt-3 flex items-center justify-between gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-frost">
                {formatCurrency(discountedPrice)}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs text-smoke line-through">
                  {formatCurrency(price)}
                </span>
              )}
            </div>

            {/* Mobile Cart Button */}
            {stock > 0 && (
              <button
                onClick={handleAddToCart}
                className="md:hidden p-2 rounded-lg transition-all active:scale-95"
                style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }}
                title="Add to Cart"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
