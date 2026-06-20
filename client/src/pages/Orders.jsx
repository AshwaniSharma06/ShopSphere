import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, Eye, ArrowRight } from 'lucide-react';
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
          <p className="text-smoke font-medium text-sm">Loading your orders...</p>
        </div>
      </div>
    );
  }

  document.title = "My Orders — ShopSphere";

  return (
    <div className="container-custom py-10">
      {/* Page header */}
      <div className="pb-6 mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 className="text-3xl font-extrabold tracking-tight text-frost">
          My Orders
        </h1>
        <p className="text-sm text-smoke mt-1">
          Review and track all your past and current purchases
        </p>
      </div>

      {error ? (
        <div
          className="max-w-md mx-auto text-center p-6 rounded-2xl text-sm font-semibold"
          style={{
            background: 'rgba(239,68,68,0.1)',
            color: '#F87171',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
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
              className="max-w-md mx-auto text-center py-16 px-8 glass-card"
            >
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}
              >
                <Package className="h-8 w-8 text-electric" />
              </div>
              <h2 className="text-xl font-bold text-frost">
                No orders yet
              </h2>
              <p className="text-sm text-smoke mt-2 mb-8 max-w-xs mx-auto">
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
              {orders.map((order, orderIdx) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: orderIdx * 0.05 }}
                  className="card p-5 flex flex-col md:flex-row gap-5 items-stretch md:items-center justify-between transition-all hover:border-electric/20"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  {/* Order metadata */}
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className="font-extrabold text-frost px-2.5 py-1.5 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                      <span className="text-smoke font-medium flex items-center gap-1.5">
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
                        <span className="badge-warning text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Shipped</span>
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
                          className="h-12 w-12 rounded-xl overflow-hidden p-1 shrink-0 relative"
                          style={{
                            background: '#0A0A0A',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <img
                            src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt=""
                            className="h-full w-full object-contain rounded-lg"
                          />
                          {item.quantity > 1 && (
                            <span
                              className="absolute bottom-0.5 right-0.5 text-[8px] font-bold h-3.5 min-w-[14px] px-0.5 rounded-full flex items-center justify-center"
                              style={{
                                background: '#00D4FF',
                                color: '#0A0A0A',
                                border: '1px solid #111111',
                                boxShadow: '0 0 6px rgba(0,212,255,0.3)',
                              }}
                            >
                              {item.quantity}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pricing and Actions */}
                  <div
                    className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0"
                    style={{ borderTop: 'none' }}
                  >
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-smoke block uppercase tracking-wider">Total amount</span>
                      <span className="text-base font-extrabold text-frost mt-0.5 block">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="btn-secondary gap-1.5 py-2 px-4 rounded-xl text-xs font-bold"
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
