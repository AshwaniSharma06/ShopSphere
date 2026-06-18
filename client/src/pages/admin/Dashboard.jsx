import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import orderService from '../../services/orderService';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await orderService.getDashboardStats();
        if (data.success) {
          setStats(data.stats);
        } else {
          setError('Failed to load dashboard statistics');
        }
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-10">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center text-red-600 dark:text-red-400">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const {
    totalSales = 0,
    totalOrders = 0,
    pendingOrders = 0,
    processingOrders = 0,
    shippedOrders = 0,
    deliveredOrders = 0,
    cancelledOrders = 0,
    totalProducts = 0,
    outOfStockProducts = 0,
    categorySales = [],
    recentOrders = [],
  } = stats || {};

  // Find percentage for categories
  const maxCategorySales = categorySales.length > 0 ? Math.max(...categorySales.map(c => c.sales)) : 1;

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalSales),
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      description: 'Sum of all paid orders',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/20',
      description: `${pendingOrders} pending, ${processingOrders} processing`,
    },
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      description: 'Current active catalog',
    },
    {
      title: 'Stock Warnings',
      value: outOfStockProducts,
      icon: AlertTriangle,
      color: outOfStockProducts > 0 
        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse' 
        : 'bg-surface-500/10 text-surface-600 dark:text-surface-400 border-surface-500/20',
      description: 'Out of stock products count',
    },
  ];

  return (
    <div className="container-custom py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary-500 animate-pulse-soft" /> Admin Portal
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Real-time analytics and management controls for ShopSphere.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/products" className="btn-secondary text-sm py-2.5 px-4 font-semibold">
            Manage Products
          </Link>
          <Link to="/admin/chats" className="btn-secondary text-sm py-2.5 px-4 font-semibold">
            Support Chats
          </Link>
          <Link to="/admin/orders" className="btn-primary text-sm py-2.5 px-4 font-semibold">
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className={`bg-white dark:bg-surface-900 border ${card.color.split(' ')[2]} rounded-2xl p-6 shadow-sm flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{card.title}</p>
                <h3 className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.color.split(' ')[0]} ${card.color.split(' ')[1]}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-4 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {card.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Analytics & Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales by Category */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1 bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6 shadow-sm flex flex-col"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-500" /> Category Revenue
            </h3>
            <p className="text-xs text-surface-400 mt-1">Distribution of sales by category</p>
          </div>

          {categorySales.length === 0 ? (
            <div className="flex-grow flex items-center justify-center py-10">
              <p className="text-sm text-surface-400 dark:text-surface-500">No category sales recorded yet</p>
            </div>
          ) : (
            <div className="space-y-5 flex-grow">
              {categorySales.map((cat) => {
                const percentage = Math.round((cat.sales / maxCategorySales) * 100);
                return (
                  <div key={cat._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-surface-700 dark:text-surface-300">{cat._id}</span>
                      <span className="text-surface-900 dark:text-white">
                        {formatCurrency(cat.sales)} <span className="text-surface-400 font-normal">({cat.quantity} sold)</span>
                      </span>
                    </div>
                    <div className="w-full bg-surface-100 dark:bg-surface-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-500" /> Recent Activity
              </h3>
              <p className="text-xs text-surface-400 mt-1">Latest 5 orders placed at ShopSphere</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
            >
              All Orders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-surface-400 dark:text-surface-500">No orders registered in the system yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-800 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-surface-50 dark:border-surface-800/60 last:border-0 text-sm hover:bg-surface-50/40 dark:hover:bg-surface-800/30 transition-colors"
                    >
                      <td className="py-3.5 font-medium text-surface-900 dark:text-white truncate max-w-[120px]">
                        <Link to={`/orders/${order._id}`} className="hover:text-primary-600 font-mono text-xs">
                          {order._id}
                        </Link>
                      </td>
                      <td className="py-3.5 text-surface-600 dark:text-surface-300 font-medium">
                        {order.user?.name || 'Guest'}
                      </td>
                      <td className="py-3.5 text-surface-500 dark:text-surface-400 text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3.5 font-bold text-surface-900 dark:text-white">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="py-3.5 text-right">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
