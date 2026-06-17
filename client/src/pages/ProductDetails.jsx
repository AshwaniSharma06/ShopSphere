import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingCart,
  ChevronRight,
  Download,
  ArrowLeft,
  Minus,
  Plus,
  MessageSquare,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, calcDiscountedPrice, formatDate } from '../utils/format';
import Spinner from '../components/common/Spinner';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Image gallery state
  const [activeImage, setActiveImage] = useState('');
  
  // Purchase Quantity State
  const [quantity, setQuantity] = useState(1);

  // Review Submitting State
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });

  // Fetch product details
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      if (data.success && data.product) {
        setProduct(data.product);
        if (data.product.images && data.product.images.length > 0) {
          setActiveImage(data.product.images[0]);
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
    // Reset inputs
    setQuantity(1);
    setNewRating(5);
    setNewTitle('');
    setNewComment('');
    setReviewMessage({ type: '', text: '' });
  }, [id]);

  // Adjust quantity
  const changeQuantity = (type) => {
    if (!product) return;
    if (type === 'inc') {
      if (quantity < product.stock) {
        setQuantity(quantity + 1);
      }
    } else if (type === 'dec') {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    }
  };

  // Add to Wishlist
  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    alert(`"${product.title}" added to wishlist!`);
  };

  // Add to Cart
  const handleAddToCart = () => {
    alert(`"${product.title}" (${quantity} item(s)) added to cart!`);
  };

  // Download QR Code
  const handleDownloadQR = () => {
    if (!product || !product.qrCode) return;
    const link = document.createElement('a');
    link.href = product.qrCode;
    link.download = `${product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Review Form
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      setReviewMessage({ type: 'error', text: 'Please enter a review comment.' });
      return;
    }

    setSubmitLoading(true);
    setReviewMessage({ type: '', text: '' });
    try {
      const data = await productService.createReview(id, {
        rating: newRating,
        title: newTitle,
        comment: newComment,
      });

      if (data.success) {
        setReviewMessage({ type: 'success', text: 'Review submitted successfully!' });
        setNewComment('');
        setNewTitle('');
        setNewRating(5);
        // Refresh product details to see new reviews
        await fetchProduct();
      }
    } catch (err) {
      setReviewMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit review.',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-24 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-surface-500 dark:text-surface-400 font-medium">Loading product information...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="max-w-md mx-auto card p-8 border border-surface-200/50 dark:border-surface-800/50 glass-card">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">
            Product Not Found
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">
            {error || "We can't find the product details you are looking for."}
          </p>
          <Link to="/shop" className="btn-primary w-full gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = calcDiscountedPrice(product.price, product.discountPercent);

  return (
    <div className="container-custom py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-surface-450 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              to={`/shop?category=${product.category._id}`}
              className="hover:text-primary-600 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-surface-700 dark:text-surface-300 truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      {/* Main product view grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Images & QR Code */}
        <div className="lg:col-span-6 space-y-6">
          <div className="card overflow-hidden bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl shadow-sm aspect-[4/3] relative flex items-center justify-center p-4">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
              alt={product.title}
              className="max-h-full max-w-full object-contain rounded-xl"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 bg-surface-50 dark:bg-surface-950 p-1.5 transition-all ${
                    activeImage === img
                      ? 'border-primary-600 bg-primary-50/20'
                      : 'border-surface-200 dark:border-surface-800 hover:border-surface-400'
                  }`}
                >
                  <img src={img} alt={`${product.title} thumb ${idx}`} className="w-full h-full object-contain rounded-lg" />
                </button>
              ))}
            </div>
          )}

          {/* QR Code Section */}
          {product.qrCode && (
            <div className="card bg-gradient-to-br from-surface-50 to-white dark:from-surface-950 dark:to-surface-900 border border-surface-200/50 dark:border-surface-800/50 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-sm">
              <div className="bg-white p-3 rounded-2xl shadow-md border border-surface-100 dark:border-surface-800">
                <img src={product.qrCode} alt="Product QR Code" className="h-32 w-32 object-contain" />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-3.5">
                <div>
                  <h3 className="text-sm font-bold text-surface-950 dark:text-white">
                    Access on Mobile
                  </h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-1.5">
                    Scan this QR code to view and share this product instantly on your mobile device.
                  </p>
                </div>
                <button
                  onClick={handleDownloadQR}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 font-semibold text-xs border border-surface-200 dark:border-surface-700 rounded-xl shadow-sm transition-all active:scale-[0.97]"
                >
                  <Download className="h-3.5 w-3.5" /> Download QR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Product Details info */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            {product.category && (
              <span className="badge-primary px-3 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wide">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${
                        i < Math.round(product.rating)
                          ? 'fill-current'
                          : 'text-surface-200 dark:text-surface-800'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-surface-800 dark:text-surface-200 ml-1">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-surface-300 dark:text-surface-750">|</span>
              <a href="#reviews" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                {product.numReviews} Customer reviews
              </a>
            </div>

            {/* Price list */}
            <div className="flex items-baseline gap-3 pt-2">
              {product.discountPercent > 0 ? (
                <>
                  <span className="text-3xl font-extrabold text-surface-900 dark:text-white">
                    {formatCurrency(discountedPrice)}
                  </span>
                  <span className="text-lg text-surface-450 line-through font-medium">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-xs font-bold text-danger bg-danger-light dark:bg-red-950/40 dark:text-red-400 px-2.5 py-1 rounded-lg">
                    SAVE {product.discountPercent}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-extrabold text-surface-900 dark:text-white">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          </div>

          <hr className="border-surface-200 dark:border-surface-800/80" />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">
              Product Overview
            </h3>
            <p className="text-surface-650 dark:text-surface-400 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Delivery & Warranty Strip */}
          <div className="grid grid-cols-3 gap-4 py-4 px-5 bg-surface-50 dark:bg-surface-950/60 rounded-2xl border border-surface-200/40 dark:border-surface-800/40">
            <div className="flex flex-col items-center text-center p-2">
              <Truck className="h-5 w-5 text-primary-600 dark:text-primary-455 mb-1.5" />
              <span className="text-xs font-bold text-surface-800 dark:text-surface-200">Free Delivery</span>
              <span className="text-[10px] text-surface-400 mt-0.5">Order above ₹499</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <ShieldCheck className="h-5 w-5 text-primary-600 dark:text-primary-455 mb-1.5" />
              <span className="text-xs font-bold text-surface-800 dark:text-surface-200">1 Year Warranty</span>
              <span className="text-[10px] text-surface-400 mt-0.5">Brand assurance</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <RotateCcw className="h-5 w-5 text-primary-600 dark:text-primary-455 mb-1.5" />
              <span className="text-xs font-bold text-surface-800 dark:text-surface-200">Easy Returns</span>
              <span className="text-[10px] text-surface-400 mt-0.5">30 day replacement</span>
            </div>
          </div>

          {/* Quantity Selector & CTAs */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider shrink-0">
                Quantity
              </span>
              <div className="flex items-center border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 rounded-xl p-1 shrink-0">
                <button
                  onClick={() => changeQuantity('dec')}
                  disabled={quantity <= 1 || product.stock === 0}
                  className="p-2 text-surface-500 hover:text-surface-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-surface-900 dark:text-white">
                  {product.stock === 0 ? 0 : quantity}
                </span>
                <button
                  onClick={() => changeQuantity('inc')}
                  disabled={quantity >= product.stock || product.stock === 0}
                  className="p-2 text-surface-500 hover:text-surface-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              
              {/* Stock Status Badge */}
              <div>
                {product.stock > 10 ? (
                  <span className="text-xs font-bold text-success-dark bg-success-light dark:bg-green-950/45 dark:text-green-400 px-2.5 py-1.5 rounded-lg">
                    In Stock
                  </span>
                ) : product.stock > 0 ? (
                  <span className="text-xs font-bold text-warning-dark bg-warning-light dark:bg-amber-950/45 dark:text-amber-400 px-2.5 py-1.5 rounded-lg animate-pulse">
                    Only {product.stock} Left!
                  </span>
                ) : (
                  <span className="text-xs font-bold text-danger-dark bg-danger-light dark:bg-red-950/45 dark:text-red-400 px-2.5 py-1.5 rounded-lg">
                    Sold Out
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary gap-2.5 py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-glow hover:shadow-glow-lg"
              >
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className="btn-secondary gap-2 px-6 py-3.5 rounded-xl"
              >
                <Heart className="h-5 w-5 text-red-500" /> Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-surface-200 dark:border-surface-800/80 my-16" />

      {/* Review list & reviews section */}
      <section id="reviews" className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-800 pb-5">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
              Customer Reviews ({product.reviews?.length || 0})
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Write a review form */}
          <div className="md:col-span-5 space-y-6">
            <div className="card p-6 border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-surface-900 dark:text-white mb-4">
                Write a Review
              </h3>

              {reviewMessage.text && (
                <div
                  className={`px-4 py-3 rounded-xl text-xs font-semibold mb-4 ${
                    reviewMessage.type === 'success'
                      ? 'bg-success-light text-success-dark dark:bg-green-950/40 dark:text-green-400'
                      : 'bg-danger-light text-danger-dark dark:bg-red-950/40 dark:text-red-400'
                  }`}
                >
                  {reviewMessage.text}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-amber-500 hover:scale-115 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newRating ? 'fill-current' : 'text-surface-250 dark:text-surface-750'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Sum up your experience..."
                    className="input-field py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">
                    Comment
                  </label>
                  <textarea
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tell us what you liked or disliked about this product..."
                    className="input-field py-2.5 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full btn-primary py-3 text-sm rounded-xl gap-2 active:scale-[0.98]"
                >
                  {submitLoading ? (
                    <>
                      <Spinner size="sm" /> Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* List of existing reviews */}
          <div className="md:col-span-7 space-y-6">
            {!product.reviews || product.reviews.length === 0 ? (
              <div className="text-center py-10 px-4 card border border-surface-200/50 dark:border-surface-800/50 rounded-2xl shadow-sm text-surface-450 dark:text-surface-500 font-medium">
                No reviews yet. Be the first to share your thoughts!
              </div>
            ) : (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div
                    key={review._id}
                    className="card p-5 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl shadow-sm bg-white dark:bg-surface-900 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      {/* Review User Info */}
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-sm text-white uppercase shadow-sm">
                          {review.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-surface-900 dark:text-white leading-tight">
                            {review.name}
                          </h4>
                          <span className="text-[10px] text-surface-450 font-medium block mt-0.5">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex gap-0.5 text-amber-500 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating ? 'fill-current' : 'text-surface-200 dark:text-surface-850'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="space-y-1 pl-12">
                      {review.title && (
                        <h5 className="text-sm font-bold text-surface-900 dark:text-white">
                          {review.title}
                        </h5>
                      )}
                      <p className="text-sm text-surface-650 dark:text-surface-400 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
