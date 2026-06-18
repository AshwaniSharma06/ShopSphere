import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Phone, FileText, Image, ArrowRight, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    phone: '',
    logo: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // If already an approved vendor, redirect immediately to dashboard
  useEffect(() => {
    if (user?.role === 'vendor' && user?.vendorProfile?.isApproved) {
      navigate('/vendor/dashboard');
    } else if (user?.role === 'vendor' && !user?.vendorProfile?.isApproved) {
      setSubmitted(true);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.storeName || !formData.phone) {
      setError('Please provide store name and phone contact');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/auth/vendor-register', formData);
      if (data.success) {
        setSubmitted(true);
        // Force refresh local profile token or state
        if (login) {
          // If we have login method to update local storage user
          const token = localStorage.getItem('token');
          if (token) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }
        window.location.reload(); // Quick refresh to update global states
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-16 flex items-center justify-center min-h-[80vh]">
      <div className="max-w-lg w-full">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-lg text-center space-y-5"
          >
            <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-pulse">
              <Clock className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">Application Pending Approval</h2>
            <p className="text-xs text-surface-500 leading-relaxed max-w-sm mx-auto">
              Your application to become a seller on **ShopSphere** has been received! Our administrators are reviewing your details. You will gain access to the Seller Portal as soon as your store is approved.
            </p>
            <hr className="border-surface-150 dark:border-surface-850" />
            <Link to="/profile" className="btn-secondary w-full py-2.5 rounded-xl font-semibold text-xs inline-flex justify-center">
              Back to My Profile
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 border border-surface-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 rounded-2xl shadow-lg space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto text-primary-500">
                <Store className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-extrabold text-surface-900 dark:text-white uppercase tracking-wider">Become a Seller</h2>
              <p className="text-xs text-surface-500">Launch your storefront and start listing products on ShopSphere</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-surface-450 uppercase tracking-wider block">Store Name</label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="e.g. Ashwani Electronics"
                    className="input-field text-xs pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-surface-450 uppercase tracking-wider block">Store Description</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-surface-400" />
                  <textarea
                    value={formData.storeDescription}
                    onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                    placeholder="Tell us about the products you plan to sell..."
                    rows={3}
                    className="input-field text-xs pl-10 pt-3 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-surface-450 uppercase tracking-wider block">Phone Contact</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="input-field text-xs pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-surface-450 uppercase tracking-wider block">Store Logo URL (Optional)</label>
                <div className="relative">
                  <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="input-field text-xs pl-10"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-glow"
                >
                  {loading ? (
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      Submit Application <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
