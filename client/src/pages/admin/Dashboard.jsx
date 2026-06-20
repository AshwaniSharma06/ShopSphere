import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Package, AlertTriangle, ArrowRight,
  TrendingUp, Clock, Sparkles, Download, Printer, CheckCircle,
  XCircle, Store, BarChart3, Users,
} from 'lucide-react';
import orderService from '../../services/orderService';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState(null);

  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const { data } = await api.get('/auth/vendors');
      if (data.success) setVendors(data.vendors);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setVendorsError(err.response?.data?.message || 'Failed to load vendors');
    } finally {
      setVendorsLoading(false);
    }
  };

  useEffect(() => { if (activeTab === 'sellers') fetchVendors(); }, [activeTab]);

  const handleApproveVendor = async (id, approve) => {
    try {
      const { data } = await api.put(`/auth/vendor-approve/${id}`, { isApproved: approve });
      if (data.success) {
        setVendors((prev) => prev.map((v) => v._id === id
          ? { ...v, vendorProfile: { ...v.vendorProfile, isApproved: approve } } : v
        ));
      }
    } catch (err) {
      console.error('Error toggling vendor approval:', err);
      alert(err.response?.data?.message || 'Failed to update vendor status');
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await orderService.getDashboardStats();
        if (data.success) setStats(data.stats);
        else setError('Failed to load dashboard statistics');
      } catch (err) {
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
        <div className="glass-card p-6 text-center" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <p className="font-semibold text-crimson-bright">{error}</p>
        </div>
      </div>
    );
  }

  const {
    totalSales = 0, totalOrders = 0, pendingOrders = 0, processingOrders = 0,
    shippedOrders = 0, deliveredOrders = 0, cancelledOrders = 0,
    totalProducts = 0, outOfStockProducts = 0, categorySales = [], recentOrders = [],
  } = stats || {};

  const maxCategorySales = categorySales.length > 0 ? Math.max(...categorySales.map(c => c.sales)) : 1;

  const exportCSVReport = () => {
    if (!stats) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ShopSphere Admin Sales Report\n';
    csvContent += `Generated At,${new Date().toLocaleString()}\n\n`;
    csvContent += 'FINANCIAL METRICS\n';
    csvContent += `Total Revenue,INR ${totalSales.toFixed(2)}\n`;
    csvContent += `Total Orders,${totalOrders}\n`;
    csvContent += `Pending Orders,${pendingOrders}\n`;
    csvContent += `Processing Orders,${processingOrders}\n`;
    csvContent += `Shipped Orders,${shippedOrders}\n`;
    csvContent += `Delivered Orders,${deliveredOrders}\n`;
    csvContent += `Cancelled Orders,${cancelledOrders}\n`;
    csvContent += `Total Products,${totalProducts}\n`;
    csvContent += `Stock Warnings,${outOfStockProducts}\n\n`;
    csvContent += 'REVENUE BY CATEGORY\nCategory,Revenue (INR),Quantity Sold\n';
    categorySales.forEach((cat) => { csvContent += `"${cat._id}",${cat.sales.toFixed(2)},${cat.quantity}\n`; });
    csvContent += '\nRECENT ORDERS\nOrder ID,Customer,Date,Total (INR),Status\n';
    recentOrders.forEach((o) => {
      csvContent += `"${o._id}","${o.user?.name || 'Guest'}",${new Date(o.createdAt).toLocaleDateString()},${o.totalPrice.toFixed(2)},${o.status}\n`;
    });
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `shopsphere_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const statCards = [
    { title: 'Total Revenue', value: formatCurrency(totalSales), icon: DollarSign, color: '#10B981', desc: 'All-time earnings' },
    { title: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: '#00D4FF', desc: `${pendingOrders} pending, ${processingOrders} processing` },
    { title: 'Total Products', value: totalProducts, icon: Package, color: '#A855F7', desc: 'Active catalog items' },
    { title: 'Stock Alerts', value: outOfStockProducts, icon: AlertTriangle, color: outOfStockProducts > 0 ? '#EF4444' : '#666666', desc: 'Out of stock items' },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'sellers', label: 'Manage Sellers', icon: Users },
  ];

  const statusColors = {
    Delivered: { bg: 'rgba(16,185,129,0.12)', text: '#34D399', border: 'rgba(16,185,129,0.2)' },
    Shipped: { bg: 'rgba(0,212,255,0.12)', text: '#00D4FF', border: 'rgba(0,212,255,0.2)' },
    Processing: { bg: 'rgba(245,158,11,0.12)', text: '#FBBF24', border: 'rgba(245,158,11,0.2)' },
    Cancelled: { bg: 'rgba(239,68,68,0.12)', text: '#F87171', border: 'rgba(239,68,68,0.2)' },
    Pending: { bg: 'rgba(255,255,255,0.06)', text: '#999999', border: 'rgba(255,255,255,0.1)' },
  };

  return (
    <div className="container-custom py-8 sm:py-10 space-y-8 animate-fade-in">
      <style>{`@media print { header, footer, nav, button, .btn-primary, .btn-secondary { display: none !important; } body { background: white !important; color: #0A0A0A !important; } }`}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-frost flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-electric animate-pulse-soft" /> Admin Portal
          </h1>
          <p className="text-sm text-smoke mt-1">Real-time analytics and management controls</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { to: '/admin/products', label: 'Products' },
            { to: '/admin/chats', label: 'Support' },
            { to: '/admin/orders', label: 'Orders' },
          ].map((link) => (
            <Link key={link.to} to={link.to} className="btn-secondary text-xs py-2 px-3.5 rounded-xl font-bold">{link.label}</Link>
          ))}
          <button onClick={exportCSVReport} className="btn-primary text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={() => window.print()} className="btn-secondary text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5">
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 max-w-xs">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? 'text-obsidian shadow-glow'
                : 'text-smoke hover:text-frost'
            }`}
            style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #00D4FF, #A855F7)' } : {}}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass-card p-5 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                     style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-smoke">{card.title}</p>
                    <h3 className="text-2xl font-bold text-frost mt-1">{card.value}</h3>
                  </div>
                  <div className="p-2.5 rounded-xl" style={{ background: `${card.color}15`, border: `1px solid ${card.color}25` }}>
                    <card.icon className="h-4 w-4" style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-[11px] text-smoke mt-3 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {card.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Revenue */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
              className="lg:col-span-1 glass-card p-5 flex flex-col">
              <div className="mb-5">
                <h3 className="text-base font-bold text-frost flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-electric" /> Category Revenue
                </h3>
                <p className="text-[11px] text-smoke mt-1">Sales distribution by category</p>
              </div>
              {categorySales.length === 0 ? (
                <div className="flex-grow flex items-center justify-center py-10">
                  <p className="text-sm text-smoke">No data yet</p>
                </div>
              ) : (
                <div className="space-y-4 flex-grow">
                  {categorySales.map((cat) => {
                    const pct = Math.round((cat.sales / maxCategorySales) * 100);
                    return (
                      <div key={cat._id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-cloud">{cat._id}</span>
                          <span className="text-frost">{formatCurrency(cat.sales)} <span className="text-smoke font-normal">({cat.quantity})</span></span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #00D4FF, #A855F7)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Recent Orders */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 glass-card p-5">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-base font-bold text-frost flex items-center gap-2">
                    <Clock className="h-4 w-4 text-electric" /> Recent Activity
                  </h3>
                  <p className="text-[11px] text-smoke mt-1">Latest orders</p>
                </div>
                <Link to="/admin/orders" className="text-xs font-bold text-electric hover:underline inline-flex items-center gap-1">
                  All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <div className="py-12 text-center"><p className="text-sm text-smoke">No orders yet</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-smoke uppercase tracking-wider border-b border-white/10">
                        <th className="pb-3">Order</th><th className="pb-3">Customer</th><th className="pb-3">Date</th><th className="pb-3">Total</th><th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => {
                        const sc = statusColors[order.status] || statusColors.Pending;
                        return (
                          <tr key={order._id} className="text-sm hover:bg-white/2 border-b border-white/5 transition-colors">
                            <td className="py-3">
                              <Link to={`/orders/${order._id}`} className="hover:text-electric font-mono text-[11px] text-mist">{order._id.slice(-8)}</Link>
                            </td>
                            <td className="py-3 text-cloud font-medium text-xs">{order.user?.name || 'Guest'}</td>
                            <td className="py-3 text-smoke text-xs">{formatDate(order.createdAt)}</td>
                            <td className="py-3 font-bold text-frost text-xs">{formatCurrency(order.totalPrice)}</td>
                            <td className="py-3 text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold"
                                    style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </>
      ) : (
        /* Sellers Tab */
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-base font-bold text-frost flex items-center gap-2">
                <Store className="h-4 w-4 text-electric" /> Seller Applications
              </h3>
              <p className="text-[11px] text-smoke mt-1">Review and manage platform vendors</p>
            </div>
          </div>
          {vendorsLoading ? (
            <div className="py-12 flex items-center justify-center"><Spinner size="lg" /></div>
          ) : vendorsError ? (
            <div className="py-6 text-center text-crimson-bright font-semibold">{vendorsError}</div>
          ) : vendors.length === 0 ? (
            <div className="py-12 text-center text-smoke text-sm">No seller applications yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-smoke uppercase tracking-wider border-b border-white/10">
                    <th className="py-3 px-3">Store</th><th className="py-3 px-3">Seller</th><th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Status</th><th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => {
                    const profile = vendor.vendorProfile || {};
                    const logoUrl = profile.logo || 'https://images.unsplash.com/photo-1472851294608-062f824d296e?w=80';
                    const isApproved = profile.isApproved;
                    return (
                      <tr key={vendor._id} className="text-sm hover:bg-white/2 border-b border-white/5 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-3">
                          <img src={logoUrl} alt={profile.storeName} className="h-9 w-9 rounded-lg object-cover shrink-0 bg-white/5 border border-white/10" />
                          <div className="max-w-[180px]">
                            <p className="font-bold text-frost text-xs truncate">{profile.storeName || 'Unnamed'}</p>
                            <p className="text-[10px] text-smoke line-clamp-1">{profile.storeDescription || 'No description'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-frost text-xs">{vendor.name}</p>
                          <p className="text-[10px] text-smoke font-mono">{vendor.email}</p>
                        </td>
                        <td className="py-3 px-3 text-smoke font-mono text-xs">{profile.phone || 'N/A'}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
                                style={isApproved
                                  ? { background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }
                                  : { background: 'rgba(245,158,11,0.12)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.2)' }}>
                            {isApproved ? <><CheckCircle className="h-3 w-3" /> Approved</> : <><Clock className="h-3 w-3 animate-pulse" /> Pending</>}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isApproved ? (
                            <button onClick={() => handleApproveVendor(vendor._id, false)}
                              className="btn-danger text-[11px] py-1 px-2.5 rounded-lg flex items-center gap-1 ml-auto">
                              <XCircle className="h-3 w-3" /> Suspend
                            </button>
                          ) : (
                            <button onClick={() => handleApproveVendor(vendor._id, true)}
                              className="text-[11px] font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 ml-auto"
                              style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }}>
                              <CheckCircle className="h-3 w-3" /> Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
