import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { formatCurrency, calcDiscountedPrice } from '../../utils/format';

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

  const discountedPrice = calcDiscountedPrice(price, discountPercent);
  const mainImage = images && images.length > 0
    ? images[0]
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Stub functionality to be replaced in Phase 3 with context
    alert(`"${title}" added to wishlist!`);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Stub functionality to be replaced in Phase 3 with context
    alert(`"${title}" added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group card-hover overflow-hidden flex flex-col h-full bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl shadow-sm hover:shadow-lg"
    >
      {/* Product Image and Badges */}
      <Link to={`/product/${_id}`} className="relative block overflow-hidden aspect-[4/3] bg-surface-100 dark:bg-surface-950">
        <img
          src={mainImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="badge-danger px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wide">
              {discountPercent}% OFF
            </span>
          )}
          {isFeatured && (
            <span className="badge-primary px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wide">
              Featured
            </span>
          )}
          {isTrending && (
            <span className="badge bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wide">
              Trending
            </span>
          )}
          {stock === 0 && (
            <span className="badge bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wide">
              Out of Stock
            </span>
          )}
        </div>

        {/* Action Buttons Overlay (Desktop only) */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
          <button
            onClick={handleAddToWishlist}
            className="p-3 bg-white hover:bg-primary-50 dark:bg-surface-900 dark:hover:bg-surface-850 text-surface-700 hover:text-primary-600 dark:text-surface-300 dark:hover:text-primary-400 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
            title="Add to Wishlist"
          >
            <Heart className="h-4.5 w-4.5" />
          </button>
          <Link
            to={`/product/${_id}`}
            className="p-3 bg-white hover:bg-primary-50 dark:bg-surface-900 dark:hover:bg-surface-850 text-surface-700 hover:text-primary-600 dark:text-surface-300 dark:hover:text-primary-400 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-[50ms]"
            title="View Details"
          >
            <Eye className="h-4.5 w-4.5" />
          </Link>
          {stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="p-3 bg-white hover:bg-primary-50 dark:bg-surface-900 dark:hover:bg-surface-850 text-surface-700 hover:text-primary-600 dark:text-surface-300 dark:hover:text-primary-400 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-[100ms]"
              title="Add to Cart"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </Link>

      {/* Info Content */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          {category && (
            <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest block">
              {category.name}
            </span>
          )}
          <Link to={`/product/${_id}`} className="block">
            <h3 className="font-semibold text-surface-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(rating)
                      ? 'fill-current'
                      : 'text-surface-200 dark:text-surface-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">
              ({numReviews || 0})
            </span>
          </div>
        </div>

        {/* Price and Mobile Cart Action */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-surface-100 dark:border-surface-800/80">
          <div className="flex flex-col">
            {discountPercent > 0 ? (
              <>
                <span className="text-lg font-bold text-surface-900 dark:text-white leading-none">
                  {formatCurrency(discountedPrice)}
                </span>
                <span className="text-xs text-surface-400 line-through mt-0.5">
                  {formatCurrency(price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-surface-900 dark:text-white leading-none">
                {formatCurrency(price)}
              </span>
            )}
          </div>

          {/* Mobile Cart Button */}
          {stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="md:hidden flex items-center justify-center p-2 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/50 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 transition-colors active:scale-[0.96]"
              title="Add to Cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
