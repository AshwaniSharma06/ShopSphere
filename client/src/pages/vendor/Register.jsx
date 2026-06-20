import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Phone, FileText, Image, ArrowRight, ShieldCheck, Clock, RefreshCw, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
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
    <div className="relative min-h-[90vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden grid-pattern">
      {/* Decorative Blur Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-electric-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-neon-900/20 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full z-10">
        {submitted ? (
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card max-w-md w-full p-8 border border-white/[0.08] shadow-glass-lg text-center space-y-6 noise-overlay relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber via-amber-bright to-amber" />
              
              <div className="h-16 w-16 bg-amber/10 border border-amber/20 rounded-full flex items-center justify-center mx-auto text-amber-bright shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse">
                <Clock className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-frost">Application Pending</h2>
                <p className="text-xs text-amber-bright font-semibold uppercase tracking-wider font-mono">Under Review</p>
              </div>
              <p className="text-sm text-smoke leading-relaxed max-w-sm mx-auto">
                Your application to become a seller on <span className="text-electric font-semibold">ShopSphere</span> has been successfully received! Our administrators are reviewing your details. You will gain full access to the Seller Portal as soon as your store is approved.
              </p>
              <div className="border-t border-white/5 pt-4">
                <Link to="/profile" className="btn-secondary w-full py-3 rounded-xl font-bold text-sm inline-flex justify-center gap-2 items-center">
                  Back to My Profile <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left side: Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 space-y-8 text-left"
            >
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric/10 border border-electric/25 text-electric text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> Seller Portal
                </span>
                <h1 className="text-4xl font-black tracking-tight leading-none text-frost">
                  Launch Your Store on <span className="text-gradient-wide">ShopSphere</span>
                </h1>
                <p className="text-base text-smoke max-w-md leading-relaxed">
                  Join a high-performance network of vendors. List your products, track inventory, view analytics, and scale your business effortlessly.
                </p>
              </div>

              {/* Perks List */}
              <div className="space-y-5">
                {[
                  {
                    title: '0% Initial Onboarding Fee',
                    desc: 'Sign up and upload your entire catalog completely free of charge.',
                  },
                  {
                    title: 'Instant Inventory Sync',
                    desc: 'Manage quantities, descriptions, and sales from a centralized dashboard.',
                  },
                  {
                    title: 'Secure Direct Payouts',
                    desc: 'Your earnings are processed securely and credited on schedule.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-plasma/10 border border-plasma/25 flex items-center justify-center shrink-0 mt-0.5 text-plasma-bright">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-frost">{item.title}</h4>
                      <p className="text-xs text-smoke mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3 max-w-md">
                <ShieldCheck className="h-5 w-5 text-electric shrink-0 mt-0.5" />
                <p className="text-xs text-smoke leading-normal">
                  All seller applications go through review to maintain storefront authenticity and high buyer satisfaction rates.
                </p>
              </div>
            </motion.div>

            {/* Right side: Form Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-7 flex justify-center"
            >
              <div className="glass-card w-full max-w-lg p-8 border border-white/[0.08] shadow-glass-lg relative noise-overlay">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-electric via-neon to-cyber" />

                <div className="flex items-center gap-3.5 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-electric/10 border border-electric/20 flex items-center justify-center text-electric shadow-[0_0_15px_rgba(0,212,255,0.15)]">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-frost tracking-tight">Become a Seller</h2>
                    <p className="text-xs text-smoke mt-0.5">Fill in details to set up your digital shop storefront</p>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-crimson/10 border border-crimson/25 text-crimson-bright font-semibold text-xs rounded-2xl mb-5 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-crimson-bright animate-ping" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-smoke uppercase tracking-wider block">Store Name *</label>
                    <div className="relative">
                      <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke" />
                      <input
                        type="text"
                        value={formData.storeName}
                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                        placeholder="e.g. Ashwani Electronics"
                        className="input-field text-sm pl-11 py-3"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-smoke uppercase tracking-wider block">Store Description</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-smoke" />
                      <textarea
                        value={formData.storeDescription}
                        onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                        placeholder="Tell us about the products you plan to sell..."
                        rows={3}
                        className="input-field text-sm pl-11 pt-3 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-smoke uppercase tracking-wider block">Phone Contact *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke" />
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +91 9876543210"
                        className="input-field text-sm pl-11 py-3"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-smoke uppercase tracking-wider block">Store Logo URL (Optional)</label>
                    <div className="relative">
                      <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke" />
                      <input
                        type="text"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="input-field text-sm pl-11 py-3"
                      />
                    </div>
                    <p className="text-[10px] text-smoke">Direct web link to your brand icon image.</p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-glow text-obsidian"
                    >
                      {loading ? (
                        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                      ) : (
                        <>
                          Submit Application <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
