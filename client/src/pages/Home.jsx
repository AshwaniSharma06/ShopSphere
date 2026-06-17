import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles, Shield, Truck } from 'lucide-react';

export default function Home() {
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
              <Link to="/register" className="btn-secondary text-base px-8 py-3.5 gap-2">
                Create Account
              </Link>
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

      {/* Placeholder sections — will be built out in Phase 5 */}
      <section className="container-custom py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-surface-900 dark:text-white">
            Featured Products
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mt-2">
            Handpicked by our team, just for you
          </p>
        </div>
        <div className="p-16 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-3xl text-center text-surface-400">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">Product catalog coming in Phase 2</p>
          <p className="text-sm mt-1">Products will appear here once the catalog is built</p>
        </div>
      </section>
    </div>
  );
}
