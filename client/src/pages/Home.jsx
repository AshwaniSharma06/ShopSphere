import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles, Shield, Truck, Flame } from 'lucide-react';
import productService from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [featuredRes, trendingRes, recommendRes] = await Promise.all([
          productService.getFeatured(4),
          productService.getTrending(4),
          productService.getRecommendations(),
        ]);
        setFeaturedProducts(featuredRes.products || []);
        setTrendingProducts(trendingRes.products || []);
        setAiRecommendations(recommendRes.products || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [isAuthenticated]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950" />
        <div className="absolute top-20 right-10 h-72 w-72 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 h-64 w-64 bg-accent-400/20 rounded-full blur-3xl" />

        <div className="relative container-custom py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Shopping Experience
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-surface-900 dark:text-white leading-tight"
            >
              Elevate Your
              <span className="text-gradient"> Shopping </span>
              Experience
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto"
            >
              Discover premium products with smart AI recommendations, voice search,
              and a seamless checkout experience. Shopping reimagined.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/shop" className="btn-primary text-base px-8 py-3.5 gap-2">
                Browse Products <ArrowRight className="h-4 w-4" />
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn-secondary text-base px-8 py-3.5 gap-2">
                  Create Account
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="border-y border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹499' },
              { icon: Shield, title: 'Secure Payments', desc: '100% protected checkout' },
              { icon: ShoppingBag, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: Sparkles, title: 'AI Recommendations', desc: 'Smart product suggestions' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                <div className="shrink-0 h-11 w-11 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Product Sections */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Spinner size="lg" className="mx-auto" />
            <p className="text-surface-500 dark:text-surface-400 font-medium">Loading recommendations...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-20 py-20">
          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <section className="container-custom">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-7 w-7 text-primary-500" /> Featured Products
                  </h2>
                  <p className="text-surface-500 dark:text-surface-400 mt-2">
                    Handpicked by our team, just for you
                  </p>
                </div>
                <Link to="/shop?featured=true" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* AI Personalized Recommendations */}
          {aiRecommendations.length > 0 && (
            <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/30 to-transparent dark:from-primary-950/10 dark:to-transparent py-12 border-y border-surface-100/80 dark:border-surface-800/40">
              <div className="container-custom">
                <div className="mb-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="h-3 w-3" /> Smart Recommendations
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">
                    Selected For You
                  </h2>
                  <p className="text-surface-500 dark:text-surface-400 mt-2">
                    Personalized AI suggestions based on your preferences
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {aiRecommendations.map((product) => (
                    <div key={product._id} className="relative">
                      {/* AI choice indicator badge */}
                      <span className="absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-white bg-primary-600 rounded-lg uppercase tracking-wide shadow-md">
                        <Sparkles className="h-2.5 w-2.5" /> AI Pick
                      </span>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Trending Products */}
          {trendingProducts.length > 0 && (
            <section className="container-custom">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white flex items-center gap-2">
                    <Flame className="h-7 w-7 text-amber-500" /> Trending Now
                  </h2>
                  <p className="text-surface-500 dark:text-surface-400 mt-2">
                    The hottest items bought by our community
                  </p>
                </div>
                <Link to="/shop?trending=true" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {trendingProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

