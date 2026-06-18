import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import orderService from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/format';
import Spinner from '../components/common/Spinner';
import paymentService from '../services/paymentService';
import StripeCardForm from '../components/checkout/StripeCardForm';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stripe Payment Gateway states
  const [paymentIntentData, setPaymentIntentData] = useState({
    clientSecret: null,
    isSimulated: false,
    loading: false,
    error: null,
  });
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const getPaymentIntent = async (orderId) => {
    try {
      setPaymentIntentData(prev => ({ ...prev, loading: true, error: null }));
      const res = await paymentService.createPaymentIntent(orderId);
      if (res.success) {
        setPaymentIntentData({
          clientSecret: res.clientSecret,
          isSimulated: res.isSimulated,
          loading: false,
          error: null,
        });
      } else {
        setPaymentIntentData(prev => ({
          ...prev,
          loading: false,
          error: res.message || 'Failed to initialize payment gateway',
        }));
      }
    } catch (err) {
      setPaymentIntentData(prev => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || err.message || 'Failed to initialize payment gateway',
      }));
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(id);
      if (data.success) {
        setOrder(data.order);
        if (!data.order.isPaid && data.order.paymentMethod === 'Card') {
          getPaymentIntent(data.order._id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handlePaymentSuccess = async (paymentResult) => {
    setIsPaying(true);
    setPayError('');
    setPaySuccess('');
    try {
      const res = await orderService.payOrder(order._id, paymentResult);
      if (res.success) {
        setPaySuccess('Payment successful!');
        // Refresh order details to show updated status
        await fetchOrder();
      }
    } catch (err) {
      setPayError(err.response?.data?.message || 'Failed to save payment status on server. Please contact support.');
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-surface-500 dark:text-surface-400 font-medium">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="max-w-md mx-auto card p-8 border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-sm glass-card">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Order Not Found</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">{error || 'We cannot find the order you are looking for.'}</p>
          <Link to="/orders" className="btn-primary w-full gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const itemsSubtotal = order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.title = `Order Details #${order._id.substring(order._id.length - 8).toUpperCase()} - ShopSphere`;

  return (
    <div className="container-custom py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-6 mb-8">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Orders
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">
            Order #{order._id.toUpperCase()}
          </h1>
          <p className="text-sm text-surface-500 mt-1.5">
            Placed on <span className="font-bold text-surface-700 dark:text-surface-300">{formatDate(order.createdAt)}</span>
          </p>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">Status:</span>
          <span className="badge-primary px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wide">
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Shipping destination details card */}
          <div className="card p-5 border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-primary-500" /> Shipping Information
            </h3>
            <div className="text-sm pl-6.5 space-y-2">
              <p className="text-surface-700 dark:text-surface-200">
                <span className="font-bold text-surface-900 dark:text-white">Customer name:</span> {order.user?.name}
              </p>
              <p className="text-surface-700 dark:text-surface-200">
                <span className="font-bold text-surface-900 dark:text-white">Email contact:</span> {order.user?.email}
              </p>
              <p className="text-surface-500 leading-relaxed pt-1">
                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
            </div>
            
            {/* Delivery Alert bar */}
            <div className={`p-3.5 pl-5 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
              order.isDelivered
                ? 'bg-success-light border-success/20 text-success-dark dark:bg-green-950/20 dark:text-green-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
            }`}>
              {order.isDelivered ? (
                <>
                  <CheckCircle2 className="h-4.5 w-4.5 fill-current shrink-0" />
                  <span>Delivered on {formatDate(order.deliveredAt)}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>Delivery status: Pending / In transit</span>
                </>
              )}
            </div>
          </div>

          {/* Payment info details card */}
          <div className="card p-5 border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-primary-500" /> Payment & Billing
            </h3>
            <div className="text-sm pl-6.5 space-y-1.5">
              <p className="text-surface-700 dark:text-surface-200">
                <span className="font-bold text-surface-900 dark:text-white">Method selection:</span> {order.paymentMethod === 'Card' ? 'Credit / Debit Card' : 'Cash on Delivery (COD)'}
              </p>
              {order.isPaid && order.paymentResult && (
                <p className="text-surface-500 text-xs">
                  <span className="font-bold text-surface-750">Transaction ID:</span> {order.paymentResult.id}
                </p>
              )}
            </div>

            {/* Paid Alert bar */}
            <div className={`p-3.5 pl-5 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
              order.isPaid
                ? 'bg-success-light border-success/20 text-success-dark dark:bg-green-950/20 dark:text-green-400'
                : 'bg-danger-light border-danger/20 text-danger-dark dark:bg-red-950/20 dark:text-red-400'
            }`}>
              {order.isPaid ? (
                <>
                  <CheckCircle2 className="h-4.5 w-4.5 fill-current shrink-0" />
                  <span>Paid on {formatDate(order.paidAt)}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>Awaiting Payment Settlement</span>
                </>
              )}
            </div>
          </div>

          {/* Items card */}
          <div className="card p-5 border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Purchased Items</h3>
            
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {order.orderItems.map((item, idx) => {
                if (!item.product) return null;
                return (
                  <div key={idx} className="py-3.5 flex items-center justify-between text-sm gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-surface-50 dark:bg-surface-950 p-1 border border-surface-150 shrink-0">
                        <img src={item.product.images?.[0]} alt="" className="h-full w-full object-contain rounded" />
                      </div>
                      <div className="min-w-0">
                        <Link to={`/product/${item.product._id}`} className="font-bold text-surface-900 dark:text-white hover:text-primary-600 truncate block">
                          {item.product.title}
                        </Link>
                        <span className="text-xs text-surface-450 block mt-0.5">{item.quantity} x {formatCurrency(item.price)}</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-surface-900 dark:text-white shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Billing summary & mock pay screen */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order sums card */}
          <div className="card p-5 border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-sm space-y-5 glass-card">
            <h3 className="text-base font-bold text-surface-900 dark:text-white">Financial Summary</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-surface-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-surface-800 dark:text-surface-200">{formatCurrency(itemsSubtotal)}</span>
              </div>
              <div className="flex justify-between text-surface-500">
                <span>Shipping Fee</span>
                <span className="font-semibold text-surface-800 dark:text-surface-200">
                  {order.shippingPrice === 0 ? <span className="text-success uppercase font-bold text-[10px]">Free</span> : formatCurrency(order.shippingPrice)}
                </span>
              </div>
              <div className="flex justify-between text-surface-500">
                <span>GST (18%)</span>
                <span className="font-semibold text-surface-800 dark:text-surface-200">{formatCurrency(order.taxPrice)}</span>
              </div>
            </div>

            <hr className="border-surface-200 dark:border-surface-800/80" />

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-surface-900 dark:text-white">Amount Total</span>
              <span className="text-lg font-extrabold text-primary-600 dark:text-primary-455">{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>

          {/* Payment module (if unpaid and Card payment method) */}
          {!order.isPaid && order.paymentMethod === 'Card' && (
            <div className="space-y-4">
              {paymentIntentData.loading ? (
                <div className="card p-5 border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-sm flex flex-col items-center justify-center py-8 space-y-3">
                  <Spinner size="md" />
                  <p className="text-xs text-surface-500">Initializing secure payment gateway...</p>
                </div>
              ) : paymentIntentData.error ? (
                <div className="card p-5 border border-danger/25 bg-danger-light/10 text-danger rounded-2xl shadow-sm space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-danger-dark">Gateway Error</p>
                  <p className="text-xs text-danger-dark">{paymentIntentData.error}</p>
                </div>
              ) : paymentIntentData.clientSecret ? (
                <div className="space-y-4">
                  {payError && (
                    <div className="p-3 bg-danger-light border border-danger/10 text-danger-dark font-semibold text-xs rounded-xl">
                      {payError}
                    </div>
                  )}
                  {paySuccess && (
                    <div className="p-3 bg-success-light border border-success/10 text-success-dark font-semibold text-xs rounded-xl">
                      {paySuccess}
                    </div>
                  )}
                  <StripeCardForm
                    clientSecret={paymentIntentData.clientSecret}
                    amount={order.totalPrice}
                    isSimulated={paymentIntentData.isSimulated}
                    onSuccess={handlePaymentSuccess}
                    onError={(err) => setPayError(err)}
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
