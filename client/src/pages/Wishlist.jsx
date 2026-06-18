import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';

export default function Wishlist() {
  const { wishlist, loading } = useWishlist();

  if (loading) {
    return (
      <div className="container-custom py-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-surface-500 dark:text-surface-400 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Set page headers for SEO
  document.title = "My Wishlist - ShopSphere";

  return (
    <div className="container-custom py-10">
      {/* Title */}
      <div className="border-b border-surface-200 dark:border-surface-800 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">
          My Wishlist
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Keep track of products you love and want to purchase later
        </p>
      </div>

      <AnimatePresence mode="wait">
        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto text-center py-16 px-6 card border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-sm glass-card"
          >
            <div className="h-16 w-16 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-2 mb-8 max-w-xs mx-auto">
              Save your favorite items here so you can easily find and buy them later.
            </p>
            <Link to="/shop" className="btn-primary w-full gap-2">
              <ShoppingBag className="h-4.5 w-4.5" /> Explore Products
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {wishlist.map((product) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
