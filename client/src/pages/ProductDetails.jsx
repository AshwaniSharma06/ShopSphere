import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Heart, ShoppingCart, ChevronRight, Download,
  ArrowLeft, Minus, Plus, MessageSquare, ShieldCheck,
  Truck, RotateCcw, Sparkles,
} from 'lucide-react';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency, calcDiscountedPrice, formatDate } from '../utils/format';
import Spinner from '../components/common/Spinner';
import ProductCard from '../components/product/ProductCard';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  const inWishlist = product ? isInWishlist(product._id) : false;
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });

  // Image zoom state
  const imageRef = useRef(null);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showZoom, setShowZoom] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      if (data.success && data.product) {
        setProduct(data.product);
        if (data.product.images && data.product.images.length > 0) {
          setActiveImage(data.product.images[0]);
        }
        try {
          setRecLoading(true);
          const recData = await productService.getProductRecommendations(id);
          if (recData.success) {
            setRecommendations(recData.products || []);
          }
        } catch (recErr) {
          console.error('Error fetching recommendations:', recErr);
        } finally {
          setRecLoading(false);
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    setQuantity(1);
    setNewRating(5);
    setNewTitle('');
    setNewComment('');
    setReviewMessage({ type: '', text: '' });
  }, [id]);

  const changeQuantity = (type) => {
    if (!product) return;
    if (type === 'inc' && quantity < product.stock) setQuantity(quantity + 1);
    if (type === 'dec' && quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    toggleWishlist(product);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product, quantity);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    }
  };

  const handleDownloadQR = () => {
    if (!product || !product.qrCode) return;
    const link = document.createElement('a');
    link.href = product.qrCode;
    link.download = `${product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!newComment.trim()) {
      setReviewMessage({ type: 'error', text: 'Please enter a review comment.' });
      return;
    }
    setSubmitLoading(true);
    setReviewMessage({ type: '', text: '' });
    try {
      const data = await productService.createReview(id, { rating: newRating, title: newTitle, comment: newComment });
      if (data.success) {
        setReviewMessage({ type: 'success', text: 'Review submitted successfully!' });
        setNewComment(''); setNewTitle(''); setNewRating(5);
        await fetchProduct();
      }
    } catch (err) {
      setReviewMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit review.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleImageMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-smoke font-medium text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="max-w-md mx-auto glass-card p-8">
          <h2 className="text-2xl font-bold text-frost mb-3">Product Not Found</h2>
          <p className="text-smoke mb-6">{error || "We can't find the product you're looking for."}</p>
          <Link to="/shop" className="btn-primary w-full gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = calcDiscountedPrice(product.price, product.discountPercent);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container-custom py-8 sm:py-12"
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-smoke mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-electric transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-ash" />
        <Link to="/shop" className="hover:text-electric transition-colors">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-ash" />
            <Link to={`/shop?category=${product.category._id}`} className="hover:text-electric transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-ash" />
        <span className="text-mist truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main product grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div
            ref={imageRef}
            className="relative card overflow-hidden aspect-[4/3] flex items-center justify-center p-6 cursor-crosshair group"
            onMouseMove={handleImageMouseMove}
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            style={{ background: '#0A0A0A' }}
          >
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
              alt={product.title}
              className="max-h-full max-w-full object-contain rounded-xl transition-transform duration-300"
              style={showZoom ? { transform: 'scale(1.5)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
            />
            {/* Zoom indicator */}
            <div className={`absolute bottom-4 right-4 px-2 py-1 rounded-lg text-[10px] font-bold text-smoke transition-opacity ${showZoom ? 'opacity-100' : 'opacity-0'}`}
                 style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
              🔍 Zoom Active
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden p-1 transition-all"
                  style={{
                    background: '#111111',
                    border: activeImage === img ? '2px solid #00D4FF' : '2px solid rgba(255,255,255,0.06)',
                    boxShadow: activeImage === img ? '0 0 10px rgba(0,212,255,0.2)' : 'none',
                  }}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain rounded-lg" />
                </button>
              ))}
            </div>
          )}

          {/* QR Code */}
          {product.qrCode && (
            <div className="glass-2 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
              <div className="p-2 rounded-xl" style={{ background: '#FFFFFF' }}>
                <img src={product.qrCode} alt="QR Code" className="h-24 w-24 object-contain" />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <h3 className="text-sm font-bold text-frost">Share on Mobile</h3>
                <p className="text-xs text-smoke">Scan to view this product on your phone</p>
                <button onClick={handleDownloadQR} className="btn-secondary text-xs py-2 px-3 gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Download QR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            {product.category && (
              <span className="badge-primary text-[10px]">{product.category.name}</span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-frost tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-amber text-amber' : 'text-ash'}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-frost">{product.rating.toFixed(1)}</span>
              <span className="text-ash">|</span>
              <a href="#reviews" className="text-sm font-medium text-electric hover:underline">
                {product.numReviews} reviews
              </a>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-1">
              {product.discountPercent > 0 ? (
                <>
                  <span className="text-3xl font-extrabold text-frost">{formatCurrency(discountedPrice)}</span>
                  <span className="text-base text-smoke line-through">{formatCurrency(product.price)}</span>
                  <span className="badge-danger text-[10px]">SAVE {product.discountPercent}%</span>
                </>
              ) : (
                <span className="text-3xl font-extrabold text-frost">{formatCurrency(product.price)}</span>
              )}
            </div>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-mist uppercase tracking-widest">Product Overview</h3>
            <p className="text-sm text-cloud leading-relaxed">{product.description}</p>
          </div>

          {/* Feature Strip */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.04)' }}>
            {[
              { icon: Truck, label: 'Free Delivery', sub: 'Orders ₹499+', color: '#00D4FF' },
              { icon: ShieldCheck, label: '1 Year Warranty', sub: 'Brand assured', color: '#A855F7' },
              { icon: RotateCcw, label: 'Easy Returns', sub: '30 days', color: '#10B981' },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center text-center p-2">
                <f.icon className="h-4 w-4 mb-1.5" style={{ color: f.color }} />
                <span className="text-[10px] font-bold text-frost">{f.label}</span>
                <span className="text-[9px] text-smoke">{f.sub}</span>
              </div>
            ))}
          </div>

          {/* Quantity & CTAs */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-mist uppercase tracking-widest shrink-0">Qty</span>
              <div className="flex items-center p-1 rounded-xl" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => changeQuantity('dec')} disabled={quantity <= 1 || product.stock === 0}
                  className="p-2 text-smoke hover:text-frost disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-frost">{product.stock === 0 ? 0 : quantity}</span>
                <button onClick={() => changeQuantity('inc')} disabled={quantity >= product.stock || product.stock === 0}
                  className="p-2 text-smoke hover:text-frost disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {product.stock > 10 ? (
                <span className="badge-success text-[10px]">In Stock</span>
              ) : product.stock > 0 ? (
                <span className="badge-warning text-[10px] animate-pulse">Only {product.stock} Left!</span>
              ) : (
                <span className="badge-danger text-[10px]">Sold Out</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className="flex-1 btn-primary gap-2 py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed">
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </button>
              <button onClick={handleAddToWishlist}
                className={`btn-secondary gap-2 px-6 py-3.5 rounded-xl transition-all ${
                  inWishlist ? '!border-cyber/30 !text-cyber' : ''
                }`}
                style={inWishlist ? { background: 'rgba(236,72,153,0.08)' } : {}}>
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-cyber text-cyber' : ''}`} />
                {inWishlist ? 'Saved' : 'Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {recLoading ? (
        <div className="py-12 flex items-center justify-center"><Spinner size="md" /></div>
      ) : (
        recommendations.length > 0 && (
          <section className="mt-20">
            <div className="pb-5 mb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-2xl font-bold text-frost flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-neon animate-pulse-soft" /> You May Also Like
              </h2>
              <p className="text-sm text-smoke mt-1.5">AI-powered similarity suggestions</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <ProductCard key={rec._id} product={rec} />
              ))}
            </div>
          </section>
        )
      )}

      <div className="h-px my-16" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Reviews Section */}
      <section id="reviews" className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center justify-between pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-electric" />
            <h2 className="text-xl font-bold text-frost">Customer Reviews ({product.reviews?.length || 0})</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Write Review */}
          <div className="md:col-span-5">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-base font-bold text-frost">Write a Review</h3>

              {reviewMessage.text && (
                <div className={`px-4 py-3 rounded-xl text-xs font-semibold ${
                  reviewMessage.type === 'success' ? 'badge-success' : 'badge-danger'
                }`} style={{ display: 'block', width: '100%' }}>
                  {reviewMessage.text}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-mist uppercase tracking-wider mb-1.5">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setNewRating(star)} className="hover:scale-110 transition-transform">
                        <Star className={`h-6 w-6 ${star <= newRating ? 'fill-amber text-amber' : 'text-ash'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-mist uppercase tracking-wider mb-1.5">Title</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Sum up your experience..." className="input-field py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-mist uppercase tracking-wider mb-1.5">Comment</label>
                  <textarea rows={4} value={newComment} onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tell us what you liked or disliked..." className="input-field py-2.5 text-sm resize-none" />
                </div>
                <button type="submit" disabled={submitLoading} className="w-full btn-primary py-3 text-sm rounded-xl gap-2">
                  {submitLoading ? <><Spinner size="sm" /> Submitting...</> : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>

          {/* Review List */}
          <div className="md:col-span-7 space-y-4">
            {!product.reviews || product.reviews.length === 0 ? (
              <div className="text-center py-12 glass-card text-smoke font-medium text-sm">
                No reviews yet. Be the first to share your thoughts!
              </div>
            ) : (
              product.reviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-5 space-y-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm text-obsidian uppercase"
                           style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}>
                        {review.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-frost">{review.name}</h4>
                        <span className="text-[10px] text-smoke">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber text-amber' : 'text-ash'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="pl-12 space-y-1">
                    {review.title && <h5 className="text-sm font-bold text-frost">{review.title}</h5>}
                    <p className="text-sm text-cloud leading-relaxed">{review.comment}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
