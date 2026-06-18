import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Eye,
  X,
  CreditCard,
  Truck,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import orderService from '../../services/orderService';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/format';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Filter Tabs
  const [activeTab, setActiveTab] = useState('All');

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError('Failed to fetch store orders');
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        // Update local state for both selections
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...res.order } : o))
        );
        setSelectedOrder((prev) => (prev ? { ...prev, ...res.order } : null));
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'All') return true;
    return order.status === activeTab;
  });

  return (
    <div className="container-custom py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="h-7 w-7 text-primary-500" /> Order Fulfillment
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Monitor transactions, update shipping lifecycles, and view customer invoice transcripts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 overflow-x-auto gap-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-surface-500 hover:text-surface-850 dark:hover:text-surface-205'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center text-red-600 dark:text-red-400">
          <p className="font-semibold">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl">
          <AlertCircle className="h-10 w-10 text-surface-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-surface-500 dark:text-surface-400">No orders listed</p>
          <p className="text-xs text-surface-400 mt-1">No transactions fit the chosen "{activeTab}" status category</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800 text-xs font-bold text-surface-400 uppercase tracking-wider bg-surface-50/50 dark:bg-surface-800/20">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Fulfillment</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-surface-50 dark:border-surface-800/60 last:border-0 text-sm hover:bg-surface-50/30 dark:hover:bg-surface-800/20 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-surface-900 dark:text-white font-semibold">
                      {order._id}
                    </td>
                    <td className="py-4 px-6 text-surface-700 dark:text-surface-300 font-medium">
                      {order.user?.name || 'Guest User'}
                    </td>
                    <td className="py-4 px-6 text-xs text-surface-500 dark:text-surface-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-6 font-bold text-surface-900 dark:text-white">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        order.isPaid
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : order.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                          : order.status === 'Processing'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                          : order.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                          : 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-300'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-surface-500 hover:text-primary-600 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs font-bold"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col m-4 z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-surface-100 dark:border-surface-800 flex justify-between items-center bg-surface-50/50 dark:bg-surface-800/10">
                <div>
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                    Order Transcript <span className="font-mono text-xs text-surface-400 font-normal">#{selectedOrder._id}</span>
                  </h3>
                  <p className="text-xs text-surface-400 mt-0.5">
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {/* Status Updater */}
                <div className="p-4 bg-primary-50/30 dark:bg-primary-950/10 border border-primary-100/50 dark:border-primary-900/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wide">Fulfillment Phase</p>
                    <p className="text-sm text-surface-600 dark:text-surface-300">Set the order status to trigger shipping pipeline updates.</p>
                  </div>
                  <select
                    disabled={updatingStatus}
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 text-sm font-semibold text-surface-900 dark:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all min-w-[150px]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-surface-400" /> Shipping Destination
                    </h4>
                    <div className="bg-surface-50/50 dark:bg-surface-800/10 border border-surface-100 dark:border-surface-800/50 rounded-2xl p-4 text-sm space-y-2 text-surface-600 dark:text-surface-300">
                      <p className="font-semibold text-surface-850 dark:text-white">{selectedOrder.user?.name || 'Guest Customer'}</p>
                      <p className="text-xs text-surface-500 mb-2">{selectedOrder.user?.email || 'No email profile'}</p>
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                      <p>{selectedOrder.shippingAddress?.country}</p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-surface-400" /> Transaction details
                    </h4>
                    <div className="bg-surface-50/50 dark:bg-surface-800/10 border border-surface-100 dark:border-surface-800/50 rounded-2xl p-4 text-sm space-y-2 text-surface-600 dark:text-surface-300">
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="font-semibold text-surface-900 dark:text-white">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Payment Status:</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          selectedOrder.isPaid
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                        }`}>
                          {selectedOrder.isPaid ? 'Settled / Paid' : 'Pending Payment'}
                        </span>
                      </div>
                      {selectedOrder.isPaid && (
                        <div className="text-xs text-surface-400 space-y-1 pt-1.5 border-t border-surface-100 dark:border-surface-800 mt-1.5">
                          <p>Paid On: {formatDate(selectedOrder.paidAt)}</p>
                          {selectedOrder.paymentResult?.id && (
                            <p className="font-mono">Intent ID: {selectedOrder.paymentResult.id}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-surface-400" /> Purchased goods ({selectedOrder.orderItems?.length} items)
                  </h4>
                  <div className="border border-surface-200/60 dark:border-surface-800/60 rounded-2xl overflow-hidden text-sm">
                    {selectedOrder.orderItems?.map((item) => {
                      const itemTitle = item.product?.title || 'Unknown Product';
                      const itemImage = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80';
                      return (
                        <div
                          key={item._id}
                          className="flex items-center justify-between gap-4 p-4 border-b border-surface-100 dark:border-surface-800/60 last:border-0 hover:bg-surface-50/20"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={itemImage}
                              alt={itemTitle}
                              className="h-11 w-11 rounded-lg object-cover bg-surface-100 shrink-0 border border-surface-200/40"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-surface-850 dark:text-white truncate">{itemTitle}</p>
                              <p className="text-xs text-surface-400">
                                {formatCurrency(item.price)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-surface-900 dark:text-white shrink-0">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-surface-100 dark:border-surface-800 flex justify-between items-center bg-surface-50/50 dark:bg-surface-800/10">
                <div className="flex items-center gap-1 text-xs text-surface-400">
                  <Clock className="h-3.5 w-3.5" /> Updated on {formatDate(selectedOrder.updatedAt)}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="btn-primary text-sm px-6 py-2.5 font-semibold"
                >
                  Close Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
