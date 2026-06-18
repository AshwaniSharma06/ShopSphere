import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, AlertTriangle, ArrowRight, TrendingUp, Clock, Sparkles } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products/vendor/stats');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching vendor dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    totalItemsSold = 0,
    commissionPaid = 0,
    netEarnings = 0,
    totalProducts = 0,
    outOfStockProducts = 0,
    recentSales = [],
  } = stats || {};

  const statCards = [
    {
      title: 'Net Earnings',
      value: formatCurrency(netEarnings),
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      description: 'Your share (after 10% commission)',
    },
    {
      title: 'Gross Revenue',
      value: formatCurrency(totalSales),
      icon: TrendingUp,
      color: 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/20',
      description: `Commission paid: ${formatCurrency(commissionPaid)}`,
    },
    {
      title: 'Active Listings',
      value: totalProducts,
      icon: Package,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      description: `${totalItemsSold} items sold so far`,
    },
    {
      title: 'Out of Stock',
      value: outOfStockProducts,
      icon: AlertTriangle,
      color: outOfStockProducts > 0 
        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse' 
        : 'bg-surface-500/10 text-surface-600 dark:text-surface-400 border-surface-500/20',
      description: 'Needs inventory replenishment',
    },
  ];

  return (
    <div className="container-custom py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary-500 animate-pulse-soft" /> Seller Dashboard
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Overview metrics, sales counts, and inventory status alerts.
          </p>
        </div>
        <div>
          <Link to="/vendor/products" className="btn-primary text-sm py-2.5 px-5 font-semibold">
            Manage Catalog Products
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary-500" /> Recent Sales
              </h3>
              <p className="text-xs text-surface-400 mt-1">Latest purchases of your store products</p>
            </div>
          </div>

          {recentSales.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-surface-400 dark:text-surface-500">No items sold yet. Start listing products to generate sales!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-800 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold">Price</th>
                    <th className="pb-3 font-semibold text-center">Qty</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-surface-50 dark:border-surface-800/60 last:border-0 text-sm hover:bg-surface-50/40 dark:hover:bg-surface-800/30 transition-colors"
                    >
                      <td className="py-3.5 font-bold text-surface-900 dark:text-white truncate max-w-[200px]">
                        {sale.title}
                      </td>
                      <td className="py-3.5 text-surface-600 dark:text-surface-300 font-medium">
                        {formatCurrency(sale.price)}
                      </td>
                      <td className="py-3.5 text-center text-surface-500 dark:text-surface-400 font-semibold">
                        {sale.quantity}
                      </td>
                      <td className="py-3.5 font-extrabold text-primary-600 dark:text-primary-400">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3.5 text-right text-surface-450 text-xs">
                        {formatDate(sale.createdAt)}
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
