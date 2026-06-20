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
    <div className="container-custom py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-frost flex items-center gap-2">
          <ShoppingBag className="h-7 w-7 text-electric" /> Order Fulfillment
        </h1>
        <p className="text-sm text-smoke mt-1">
          Monitor transactions, update shipping lifecycles, and view customer invoice transcripts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-electric text-electric'
                : 'border-transparent text-smoke hover:text-frost'
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
        <div className="bg-crimson/10 border border-crimson/20 rounded-2xl p-6 text-center text-crimson-bright font-semibold">
          <p>{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <AlertCircle className="h-10 w-10 text-smoke mx-auto mb-3" />
          <p className="text-sm font-semibold text-frost">No orders listed</p>
          <p className="text-xs text-smoke mt-1">No transactions fit the chosen "{activeTab}" status category</p>
        </div>
      ) : (
        <div className="glass-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-smoke uppercase tracking-wider bg-white/2">
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
                    className="border-b border-white/5 last:border-0 text-sm hover:bg-white/2 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-frost font-semibold">
                      {order._id}
                    </td>
                    <td className="py-4 px-6 text-frost font-medium">
                      {order.user?.name || 'Guest User'}
                    </td>
                    <td className="py-4 px-6 text-xs text-smoke">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-6 font-bold text-frost">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        order.isPaid
                          ? 'bg-plasma/10 border border-plasma/20 text-plasma-bright'
                          : 'bg-crimson/10 border border-crimson/20 text-crimson-bright'
                      }`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Delivered'
                          ? 'bg-plasma/10 border border-plasma/20 text-plasma-bright'
                          : order.status === 'Shipped'
                          ? 'bg-electric/10 border border-electric/20 text-electric'
                          : order.status === 'Processing'
                          ? 'bg-amber/10 border border-amber/20 text-amber-bright'
                          : order.status === 'Cancelled'
                          ? 'bg-crimson/10 border border-crimson/20 text-crimson-bright'
                          : 'bg-white/5 border border-white/10 text-frost'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-smoke hover:text-electric hover:bg-white/5 rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs font-bold"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl rounded-3xl overflow-hidden max-h-[90vh] flex flex-col z-10 glass-card border border-white/[0.08] shadow-glow-sm"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                <div>
                  <h3 className="text-lg font-bold text-frost flex items-center gap-2">
                    Order Transcript <span className="font-mono text-xs text-smoke font-normal">#{selectedOrder._id}</span>
                  </h3>
                  <p className="text-xs text-smoke mt-0.5">
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-smoke hover:bg-white/5 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {/* Status Updater */}
                <div className="p-4 bg-electric/5 border border-electric/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-electric uppercase tracking-wide">Fulfillment Phase</p>
                    <p className="text-sm text-mist">Set the order status to trigger shipping pipeline updates.</p>
                  </div>
                  <select
                    disabled={updatingStatus}
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="input-field text-sm px-4 py-2.5 min-w-[150px]"
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
                    <h4 className="text-sm font-bold text-frost flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-smoke" /> Shipping Destination
                    </h4>
                    <div className="bg-white/2 border border-white/5 rounded-2xl p-4 text-sm space-y-2 text-mist">
                      <p className="font-semibold text-frost">{selectedOrder.user?.name || 'Guest Customer'}</p>
                      <p className="text-xs text-smoke mb-2">{selectedOrder.user?.email || 'No email profile'}</p>
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                      <p>{selectedOrder.shippingAddress?.country}</p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-frost flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-smoke" /> Transaction details
                    </h4>
                    <div className="bg-white/2 border border-white/5 rounded-2xl p-4 text-sm space-y-2 text-mist">
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="font-semibold text-frost">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Payment Status:</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          selectedOrder.isPaid
                            ? 'bg-plasma/10 border border-plasma/20 text-plasma-bright'
                            : 'bg-crimson/10 border border-crimson/20 text-crimson-bright'
                        }`}>
                          {selectedOrder.isPaid ? 'Settled / Paid' : 'Pending Payment'}
                        </span>
                      </div>
                      {selectedOrder.isPaid && (
                        <div className="text-smoke space-y-1 pt-1.5 border-t border-white/5 mt-1.5">
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
                  <h4 className="text-sm font-bold text-frost flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-smoke" /> Purchased goods ({selectedOrder.orderItems?.length} items)
                  </h4>
                  <div className="border border-white/5 rounded-2xl overflow-hidden text-sm">
                    {selectedOrder.orderItems?.map((item) => {
                      const itemTitle = item.product?.title || 'Unknown Product';
                      const itemImage = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80';
                      return (
                        <div
                          key={item._id}
                          className="flex items-center justify-between gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={itemImage}
                              alt={itemTitle}
                              className="h-11 w-11 rounded-lg object-cover bg-white/5 shrink-0 border border-white/10"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-frost truncate">{itemTitle}</p>
                              <p className="text-xs text-smoke">
                                {formatCurrency(item.price)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-frost shrink-0">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 flex justify-between items-center bg-white/2">
                <div className="flex items-center gap-1 text-xs text-smoke">
                  <Clock className="h-3.5 w-3.5" /> Updated on {formatDate(selectedOrder.updatedAt)}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="btn-primary text-sm px-6 py-2.5 font-semibold rounded-xl"
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
