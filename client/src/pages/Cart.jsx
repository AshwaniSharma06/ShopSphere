import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency, calcDiscountedPrice } from '../utils/format';
import Spinner from '../components/common/Spinner';

export default function Cart() {
  const { cart, loading, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const shippingThreshold = 1000;
  const shippingCost = cartTotal >= shippingThreshold || cartTotal === 0 ? 0 : 99;
  const taxRate = 0.18; // 18% GST
  const taxCost = cartTotal * taxRate;
  const orderTotal = cartTotal + shippingCost + taxCost;

  const handleQuantityChange = async (productId, currentQty, stock, operation) => {
    try {
      if (operation === 'inc') {
        if (currentQty < stock) {
          await updateQuantity(productId, currentQty + 1);
        }
      } else if (operation === 'dec') {
        if (currentQty > 1) {
          await updateQuantity(productId, currentQty - 1);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update quantity');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-surface-500 dark:text-surface-400 font-medium">Loading your shopping cart...</p>
        </div>
      </div>
    );
  }

  // Set page headers for SEO
  document.title = "Shopping Cart - ShopSphere";

  return (
    <div className="container-custom py-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Manage items added to your basket
          </p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-bold text-danger-dark dark:text-red-400 hover:underline inline-flex items-center gap-1.5 self-start sm:self-center"
          >
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
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto text-center py-16 px-6 card border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-sm glass-card"
          >
            <div className="h-16 w-16 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-450 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">
              Your cart is empty
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-2 mb-8 max-w-xs mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our latest catalog!
            </p>
            <Link to="/shop" className="btn-primary w-full gap-2">
              <ShoppingBag className="h-4.5 w-4.5" /> Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence>
                {cart.map((item) => {
                  if (!item.product) return null;
                  const itemPrice = calcDiscountedPrice(item.product.price, item.product.discountPercent);
                  
                  return (
                    <motion.div
                      key={item.product._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between border border-surface-200/50 dark:border-surface-800/50 hover:border-surface-300 dark:hover:border-surface-700 bg-white dark:bg-surface-900 rounded-2xl transition-all"
                    >
                      {/* Product details */}
                      <div className="flex gap-4 items-center flex-1">
                        <div className="h-20 w-20 rounded-xl overflow-hidden bg-surface-50 dark:bg-surface-950 p-1 shrink-0 border border-surface-100 dark:border-surface-800">
                          <img
                            src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt={item.product.title}
                            className="h-full w-full object-contain rounded-lg"
                          />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest block">
                            {item.product.category?.name}
                          </span>
                          <Link
                            to={`/product/${item.product._id}`}
                            className="font-bold text-sm text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1 block"
                          >
                            {item.product.title}
                          </Link>
                          
                          {/* Unit price indicator */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">
                              Unit price:
                            </span>
                            <span className="text-xs font-bold text-surface-800 dark:text-surface-200">
                              {formatCurrency(itemPrice)}
                            </span>
                            {item.product.discountPercent > 0 && (
                              <span className="text-[10px] font-bold text-danger bg-danger-light dark:bg-red-950/40 dark:text-red-400 px-1.5 py-0.5 rounded">
                                {item.product.discountPercent}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls (quantity & subtotal & remove) */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-surface-100 dark:border-surface-800">
                        {/* Quantity picker */}
                        <div className="flex items-center border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 p-1 rounded-xl">
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity, item.product.stock, 'dec')}
                            disabled={item.quantity <= 1}
                            className="p-1.5 text-surface-500 hover:text-surface-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-xs text-surface-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity, item.product.stock, 'inc')}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1.5 text-surface-500 hover:text-surface-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Total Price */}
                        <div className="text-right min-w-[80px]">
                          <span className="text-sm font-extrabold text-surface-900 dark:text-white block">
                            {formatCurrency(itemPrice * item.quantity)}
                          </span>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="p-2.5 rounded-xl text-surface-400 hover:text-danger hover:bg-danger-light dark:hover:bg-red-950/20 transition-all"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Continue Shopping Button */}
              <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline pt-2">
                <ArrowLeft className="h-4 w-4" /> Continue Shopping
              </Link>
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-4">
              <div className="card p-6 border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-sm space-y-6 sticky top-24 glass-card">
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                  Order Summary
                </h3>

                {/* Subtotals list */}
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between text-surface-600 dark:text-surface-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-surface-800 dark:text-surface-200">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-surface-600 dark:text-surface-400">
                    <span>Shipping</span>
                    <span className="font-semibold text-surface-800 dark:text-surface-200">
                      {shippingCost === 0 ? (
                        <span className="text-success font-bold uppercase text-xs">Free</span>
                      ) : (
                        formatCurrency(shippingCost)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-surface-600 dark:text-surface-400">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-surface-800 dark:text-surface-200">
                      {formatCurrency(taxCost)}
                    </span>
                  </div>

                  {/* Free shipping progress bar */}
                  {shippingCost > 0 && (
                    <div className="bg-surface-100 dark:bg-surface-950 p-3 rounded-xl space-y-2 border border-surface-150 dark:border-surface-800/80">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-surface-500">Free Shipping Goal</span>
                        <span className="text-primary-600 dark:text-primary-400">
                          {formatCurrency(shippingThreshold - cartTotal)} away
                        </span>
                      </div>
                      <div className="w-full bg-surface-200 dark:bg-surface-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(cartTotal / shippingThreshold) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <hr className="border-surface-200 dark:border-surface-800/80" />

                {/* Total */}
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-surface-900 dark:text-white">Order Total</span>
                  <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold shadow-glow hover:shadow-glow-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
