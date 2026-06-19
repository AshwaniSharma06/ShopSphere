import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles, Shield, Truck, Zap, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import productService from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

/* ─── Animation Presets ─── */
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10%' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/* ─── Particle Field Component ─── */
function ParticleField() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 10 + Math.random() * 10,
    size: 1 + Math.random() * 1.5,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-drift"
          style={{
            left: `${p.x}%`,
            bottom: '-5%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.id % 3 === 0 ? '#00D4FF' : p.id % 3 === 1 ? '#A855F7' : '#FFFFFF',
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Floating Product Image ─── */
function FloatingProduct({ src, alt, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: delay + 0.5 }}
      className={`relative ${className}`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        <div className="relative">
          <img
            src={src}
            alt={alt}
            className="h-28 w-28 sm:h-36 sm:w-36 object-contain drop-shadow-2xl"
          />
          {/* Glow beneath */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full blur-xl"
               style={{ background: 'rgba(0,212,255,0.2)' }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Section Title ─── */
function SectionTitle({ overline, title, subtitle }) {
  return (
    <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16">
      {overline && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{ background: 'rgba(0,212,255,0.08)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.15)' }}>
          <Sparkles className="h-3 w-3" />
          {overline}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-frost">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base sm:text-lg text-smoke max-w-2xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  );
}

/* ─── Review Card ─── */
function ReviewCard({ name, review, rating, active }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: active ? 1 : 0.4, scale: active ? 1 : 0.92 }}
      transition={{ duration: 0.5 }}
      className="glass-2 rounded-2xl p-6 min-w-[300px] max-w-[360px] shrink-0"
      style={{ border: active ? '1px solid rgba(0,212,255,0.15)' : '1px solid rgba(255,255,255,0.04)' }}
    >
      <Quote className="h-6 w-6 text-neon mb-3 opacity-40" />
      <p className="text-sm text-cloud leading-relaxed mb-4">"{review}"</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-frost">{name}</p>
          <div className="flex items-center gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < rating ? 'fill-amber text-amber' : 'text-ash'}`} />
            ))}
          </div>
        </div>
        <div className="text-[10px] font-mono text-smoke">Verified</div>
      </div>
    </motion.div>
  );
}

/* ─── Category Card ─── */
function CategoryCard({ name, icon, count, accentColor, delay }) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouseMove}
      className="group"
    >
      <Link
        to={`/shop`}
        className="block relative overflow-hidden rounded-2xl p-6 transition-all duration-300 cursor-pointer"
        style={{
          background: '#111111',
          border: `1px solid rgba(${accentColor}, 0.12)`,
        }}
      >
        {/* Spotlight effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}% ${mousePos.y}%, rgba(${accentColor}, 0.08), transparent 70%)`,
          }}
        />
        <div className="relative z-10">
          <span className="text-2xl mb-3 block">{icon}</span>
          <h3 className="text-base font-bold text-frost group-hover:text-electric transition-colors">{name}</h3>
          <p className="text-xs text-smoke mt-1">{count} products</p>
        </div>
        <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none"
             style={{ background: `radial-gradient(ellipse at bottom right, rgba(${accentColor}, 0.06) 0%, transparent 70%)` }} />
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN HOME COMPONENT
   ═══════════════════════════════════════════ */
export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReview, setActiveReview] = useState(0);

  // Hero parallax
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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

  // Review carousel auto-rotate
  const reviews = [
    { name: 'Sarah K.', review: 'Absolutely stunning quality and the fastest delivery I\'ve ever experienced. ShopSphere is leagues ahead.', rating: 5 },
    { name: 'Rahul M.', review: 'The AI recommendations are scary accurate. Found exactly what I needed without even searching.', rating: 5 },
    { name: 'Priya S.', review: 'Premium everything — from the packaging to the product. This is what online shopping should feel like.', rating: 5 },
    { name: 'Alex W.', review: 'The checkout was seamless and the interface is the most beautiful I\'ve seen. Truly next-gen.', rating: 4 },
    { name: 'Meera D.', review: 'Love the wishlist and how easy it is to track orders. Every detail has been thought through.', rating: 5 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const categories = [
    { name: 'Electronics', icon: '⚡', count: '148', accentColor: '0,212,255' },
    { name: 'Fashion', icon: '👗', count: '236', accentColor: '168,85,247' },
    { name: 'Home & Living', icon: '🏠', count: '89', accentColor: '236,72,153' },
    { name: 'Sports', icon: '🏃', count: '67', accentColor: '16,185,129' },
    { name: 'Beauty', icon: '✨', count: '124', accentColor: '245,158,11' },
    { name: 'Books & Media', icon: '📚', count: '203', accentColor: '99,102,241' },
  ];

  return (
    <div className="overflow-hidden">
      {/* ═══════════════════════════════════════════
          SECTION 1: THE AWAKENING — Hero
          ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-obsidian grid-pattern" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at top right, rgba(0,212,255,0.08) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at bottom left, rgba(168,85,247,0.06) 0%, transparent 60%)' }} />

        <ParticleField />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 container-custom text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(0,212,255,0.08)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.15)' }}>
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Shopping, Reimagined
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-display-xl font-extrabold tracking-tight leading-[0.95]"
          >
            <span className="text-frost">The Future</span>
            <br />
            <span className="text-gradient-wide">of Shopping</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-6 text-base sm:text-lg text-smoke max-w-xl mx-auto leading-relaxed"
          >
            Discover premium products in an experience built for the future.
            Smart AI, seamless checkout, unforgettable design.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/shop" className="btn-primary text-base px-8 py-3.5 gap-2 group">
              Explore Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn-secondary text-base px-8 py-3.5 gap-2">
                Create Account
              </Link>
            )}
          </motion.div>

          {/* Floating Products */}
          <div className="mt-16 flex items-center justify-center gap-8 sm:gap-16">
            <FloatingProduct
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
              alt="Headphones"
              delay={0}
            />
            <FloatingProduct
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
              alt="Watch"
              delay={0.3}
              className="hidden sm:block"
            />
            <FloatingProduct
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"
              alt="Sneakers"
              delay={0.6}
            />
          </div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-16"
          >
            <div className="w-5 h-8 rounded-full mx-auto flex items-start justify-center p-1"
                 style={{ border: '1.5px solid rgba(255,255,255,0.15)' }}>
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1 h-2 rounded-full bg-electric"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURE STRIP
          ═══════════════════════════════════════════ */}
      <section style={{ background: '#111111', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹499', color: '#00D4FF' },
              { icon: Shield, title: 'Secure Payments', desc: '100% protected checkout', color: '#A855F7' },
              { icon: ShoppingBag, title: 'Easy Returns', desc: '30-day return policy', color: '#EC4899' },
              { icon: Zap, title: 'AI Recommendations', desc: 'Smart product suggestions', color: '#10B981' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
              >
                <div className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
                     style={{ background: `${feature.color}10`, border: `1px solid ${feature.color}20` }}>
                  <feature.icon className="h-4 w-4" style={{ color: feature.color }} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-frost">{feature.title}</h3>
                  <p className="text-[11px] text-smoke">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: THE REVEAL — Featured Products
          ═══════════════════════════════════════════ */}
      {loading ? (
        <div className="py-32 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Spinner size="lg" className="mx-auto" />
            <p className="text-smoke font-medium text-sm">Loading curated selections...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-0">
          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <section className="py-20 sm:py-28 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
                   style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.03) 0%, transparent 70%)' }} />
              <div className="container-custom relative z-10">
                <SectionTitle
                  overline="Curated Collection"
                  title="Featured Products"
                  subtitle="Handpicked by our team, each item tells a story of craftsmanship and innovation"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-5%' }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
                <motion.div {...fadeUp} className="text-center mt-10">
                  <Link to="/shop?featured=true" className="btn-secondary text-sm px-6 py-3 gap-2 group">
                    View All Featured
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════
              SECTION 3: CATEGORY EXPLORER
              ═══════════════════════════════════════════ */}
          <section className="py-20 sm:py-28 relative" style={{ background: '#0A0A0A' }}>
            <div className="container-custom relative z-10">
              <SectionTitle
                overline="Browse"
                title="Explore Categories"
                subtitle="Find what speaks to you across our curated collections"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {categories.map((cat, i) => (
                  <CategoryCard key={cat.name} {...cat} delay={i * 0.08} />
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              SECTION 4: AI SHOWCASE
              ═══════════════════════════════════════════ */}
          {aiRecommendations.length > 0 && (
            <section className="py-20 sm:py-28 relative overflow-hidden">
              {/* AI neural pattern background */}
              <div className="absolute inset-0 pointer-events-none"
                   style={{ background: 'linear-gradient(180deg, rgba(168,85,247,0.03) 0%, transparent 30%, transparent 70%, rgba(0,212,255,0.03) 100%)' }} />

              <div className="container-custom relative z-10">
                <div className="glass-2 rounded-3xl p-8 sm:p-12"
                     style={{ border: '1px solid rgba(168,85,247,0.1)' }}>
                  <SectionTitle
                    overline="Powered by AI"
                    title="Selected Just For You"
                    subtitle="Our AI learns your preferences to surface products you'll actually love"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {aiRecommendations.map((product) => (
                      <div key={product._id} className="relative">
                        <span className="absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider"
                              style={{ background: 'rgba(168,85,247,0.15)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.25)' }}>
                          <Sparkles className="h-2.5 w-2.5" /> AI Pick
                        </span>
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════
              SECTION 5: SOCIAL PROOF — Reviews
              ═══════════════════════════════════════════ */}
          <section className="py-20 sm:py-28 relative" style={{ background: '#0A0A0A' }}>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse at top right, rgba(168,85,247,0.04) 0%, transparent 60%)' }} />
            <div className="container-custom relative z-10">
              <SectionTitle
                overline="Social Proof"
                title="Loved by Thousands"
                subtitle="Don't take our word for it — hear from our community"
              />

              {/* Review Cards */}
              <div className="relative">
                <div className="flex gap-6 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory">
                  {reviews.map((review, i) => (
                    <div key={i} className="snap-center">
                      <ReviewCard {...review} active={i === activeReview} />
                    </div>
                  ))}
                </div>

                {/* Dots */}
                <div className="flex items-center justify-center gap-2 mt-8">
                  {reviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveReview(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === activeReview ? 'w-6 h-2' : 'w-2 h-2'
                      }`}
                      style={{
                        background: i === activeReview ? '#00D4FF' : 'rgba(255,255,255,0.15)',
                        boxShadow: i === activeReview ? '0 0 10px rgba(0,212,255,0.3)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              TRENDING PRODUCTS
              ═══════════════════════════════════════════ */}
          {trendingProducts.length > 0 && (
            <section className="py-20 sm:py-28 relative">
              <div className="container-custom relative z-10">
                <SectionTitle
                  overline="What's Hot"
                  title="Trending Now"
                  subtitle="The hottest items making waves in our community"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingProducts.map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
                <motion.div {...fadeUp} className="text-center mt-10">
                  <Link to="/shop?trending=true" className="btn-secondary text-sm px-6 py-3 gap-2 group">
                    View All Trending
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          CTA SECTION
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ background: '#0A0A0A' }}>
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
             style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 60%)' }} />

        <motion.div {...fadeUp} className="container-custom relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-frost mb-4">
            Ready to Experience<br />
            <span className="text-gradient-wide">the Future?</span>
          </h2>
          <p className="text-smoke text-base sm:text-lg max-w-lg mx-auto mb-10">
            Join thousands who've already elevated their shopping experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/shop" className="btn-primary text-base px-10 py-4 gap-2 group">
              Start Shopping
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
