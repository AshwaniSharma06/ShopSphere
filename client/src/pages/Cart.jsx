import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, ShoppingBag, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency, calcDiscountedPrice } from '../utils/format';
import Spinner from '../components/common/Spinner';

export default function Cart() {
  const { cart, loading, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const shippingThreshold = 1000;
  const shippingCost = cartTotal >= shippingThreshold || cartTotal === 0 ? 0 : 99;
  const taxRate = 0.18;
  const taxCost = cartTotal * taxRate;
  const orderTotal = cartTotal + shippingCost + taxCost;

  const handleQuantityChange = async (productId, currentQty, stock, operation) => {
    try {
      if (operation === 'inc' && currentQty < stock) await updateQuantity(productId, currentQty + 1);
      if (operation === 'dec' && currentQty > 1) await updateQuantity(productId, currentQty - 1);
    } catch (err) {
      alert(err.message || 'Failed to update quantity');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-smoke font-medium text-sm">Loading your cart...</p>
        </div>
      </div>
    );
  }

  document.title = "Shopping Cart — ShopSphere";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container-custom py-8 sm:py-12"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-frost">Shopping Cart</h1>
          <p className="text-sm text-smoke mt-1">
            {cart.length > 0 ? `${cart.length} item${cart.length > 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
          </p>
        </div>
        {cart.length > 0 && (
          <button onClick={clearCart}
            className="text-xs font-bold text-crimson-bright hover:text-crimson inline-flex items-center gap-1.5 self-start sm:self-center transition-colors">
            <Trash2 className="h-3.5 w-3.5" /> Clear Cart
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="max-w-md mx-auto text-center py-16 px-8 glass-card"
          >
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                 style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
              <ShoppingCart className="h-8 w-8 text-electric" />
            </div>
            <h2 className="text-xl font-bold text-frost">Your cart is empty</h2>
            <p className="text-sm text-smoke mt-2 mb-8 max-w-xs mx-auto">
              Explore our curated collection and discover products you'll love.
            </p>
            <Link to="/shop" className="btn-primary w-full gap-2">
              <ShoppingBag className="h-4 w-4" /> Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-3">
              <AnimatePresence>
                {cart.map((item) => {
                  if (!item.product) return null;
                  const itemPrice = calcDiscountedPrice(item.product.price, item.product.discountPercent);

                  return (
                    <motion.div
                      key={item.product._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
                    >
                      {/* Product details */}
                      <div className="flex gap-4 items-center flex-1">
                        <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 p-1.5"
                             style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <img
                            src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt={item.product.title}
                            className="h-full w-full object-contain rounded-lg"
                          />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-bold text-electric uppercase tracking-widest block">
                            {item.product.category?.name}
                          </span>
                          <Link to={`/product/${item.product._id}`}
                            className="font-semibold text-sm text-frost hover:text-electric transition-colors line-clamp-1 block">
                            {item.product.title}
                          </Link>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-smoke">Unit:</span>
                            <span className="text-xs font-bold text-cloud">{formatCurrency(itemPrice)}</span>
                            {item.product.discountPercent > 0 && (
                              <span className="badge-danger text-[9px] px-1.5 py-0">{item.product.discountPercent}% OFF</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0"
                           style={{ borderTop: 'none' }}>
                        {/* Quantity */}
                        <div className="flex items-center p-1 rounded-xl"
                             style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <button onClick={() => handleQuantityChange(item.product._id, item.quantity, item.product.stock, 'dec')}
                            disabled={item.quantity <= 1}
                            className="p-1.5 text-smoke hover:text-frost disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-xs text-frost">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.product._id, item.quantity, item.product.stock, 'inc')}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1.5 text-smoke hover:text-frost disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Total */}
                        <div className="text-right min-w-[80px]">
                          <span className="text-sm font-extrabold text-frost">{formatCurrency(itemPrice * item.quantity)}</span>
                        </div>

                        {/* Delete */}
                        <button onClick={() => removeFromCart(item.product._id)}
                          className="p-2 rounded-xl text-smoke hover:text-crimson-bright hover:bg-crimson/10 transition-all" title="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-electric hover:underline pt-2">
                <ArrowLeft className="h-4 w-4" /> Continue Shopping
              </Link>
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-4">
              <div className="glass-card p-6 space-y-5 sticky top-24">
                <h3 className="text-lg font-bold text-frost">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-smoke">
                    <span>Subtotal</span>
                    <span className="font-semibold text-cloud">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-smoke">
                    <span>Shipping</span>
                    <span className="font-semibold text-cloud">
                      {shippingCost === 0 ? <span className="text-plasma font-bold text-xs uppercase">Free</span> : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-smoke">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-cloud">{formatCurrency(taxCost)}</span>
                  </div>

                  {shippingCost > 0 && (
                    <div className="p-3 rounded-xl space-y-2" style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-smoke">Free Shipping Goal</span>
                        <span className="text-electric">{formatCurrency(shippingThreshold - cartTotal)} away</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((cartTotal / shippingThreshold) * 100, 100)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #00D4FF, #A855F7)' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-frost">Total</span>
                  <span className="text-2xl font-extrabold text-electric">{formatCurrency(orderTotal)}</span>
                </div>

                <button onClick={() => navigate('/checkout')}
                  className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold gap-2">
                  Proceed to Checkout
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-smoke">
                  <Lock className="h-3 w-3" /> Secured by SSL encryption
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
