import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, Eye, ArrowRight, CreditCard } from 'lucide-react';
import orderService from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/format';
import Spinner from '../components/common/Spinner';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getMyOrders();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container-custom py-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-surface-500 dark:text-surface-400 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  document.title = "My Orders - ShopSphere";

  return (
    <div className="container-custom py-10">
      {/* Page header */}
      <div className="border-b border-surface-200 dark:border-surface-800 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">
          My Orders
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Review and track all your past and current purchases
        </p>
      </div>

      {error ? (
        <div className="card p-6 border border-danger/20 bg-danger-light dark:bg-red-950/20 text-danger-dark dark:text-red-400 text-sm font-semibold rounded-2xl max-w-md mx-auto text-center shadow-sm">
          {error}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto text-center py-16 px-6 card border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-sm glass-card"
            >
              <div className="h-16 w-16 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-450 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                No orders yet
              </h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-2 mb-8 max-w-xs mx-auto">
                You haven't placed any orders yet. Visit the shop page to buy our awesome goods!
              </p>
              <Link to="/shop" className="btn-primary w-full gap-2">
                Go to Shop <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 max-w-4xl mx-auto"
            >
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-5 border border-surface-200/50 dark:border-surface-800/50 hover:border-surface-300 dark:hover:border-surface-700 bg-white dark:bg-surface-900 rounded-2xl transition-all flex flex-col md:flex-row gap-5 items-stretch md:items-center justify-between"
                >
                  {/* Order metadata */}
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-extrabold text-surface-900 dark:text-white bg-surface-100 dark:bg-surface-800 px-2.5 py-1.5 rounded-xl border border-surface-200/40 dark:border-surface-700/50">
                        Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                      <span className="text-surface-400 font-medium flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(order.createdAt)}
                      </span>
                    </div>

                    {/* Badge metrics */}
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {order.isPaid ? (
                        <span className="badge-success text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Paid</span>
                      ) : (
                        <span className="badge-danger text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Unpaid</span>
                      )}

                      {order.status === 'Delivered' && (
                        <span className="badge-success text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Delivered</span>
                      )}
                      {order.status === 'Pending' && (
                        <span className="badge-warning text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Pending</span>
                      )}
                      {order.status === 'Processing' && (
                        <span className="badge-primary text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Processing</span>
                      )}
                      {order.status === 'Shipped' && (
                        <span className="badge bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Shipped</span>
                      )}
                      {order.status === 'Cancelled' && (
                        <span className="badge-danger text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Cancelled</span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex gap-2 items-center overflow-x-auto pb-1 max-w-full md:max-w-[320px]">
                    {order.orderItems.map((item, idx) => {
                      if (!item.product) return null;
                      return (
                        <div
                          key={idx}
                          title={item.product.title}
                          className="h-12 w-12 rounded-xl overflow-hidden bg-surface-50 dark:bg-surface-950 p-1 border border-surface-150 dark:border-surface-850 shrink-0 relative"
                        >
                          <img
                            src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt=""
                            className="h-full w-full object-contain rounded-lg"
                          />
                          {item.quantity > 1 && (
                            <span className="absolute bottom-0.5 right-0.5 bg-primary-600 text-[8px] font-bold text-white h-3.5 min-w-[14px] px-0.5 rounded-full flex items-center justify-center border border-white dark:border-surface-900 shadow">
                              {item.quantity}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pricing and Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 border-surface-100 dark:border-surface-800 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-surface-400 block uppercase tracking-wider">Total amount</span>
                      <span className="text-base font-extrabold text-surface-900 dark:text-white mt-0.5 block">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="btn-secondary gap-1.5 py-2 px-4.5 rounded-xl text-xs font-bold"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
