import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, CheckCircle } from 'lucide-react';
import authService from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-mesh-move opacity-100"
             style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full animate-mesh-move opacity-100"
             style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.06) 0%, transparent 70%)', filter: 'blur(60px)', animationDelay: '-7s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full animate-mesh-move opacity-100"
             style={{ background: 'radial-gradient(ellipse, rgba(236,72,153,0.04) 0%, transparent 70%)', filter: 'blur(60px)', animationDelay: '-14s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8">
          {sent ? (
            /* Success State */
            <div className="text-center py-4">
              <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
                   style={{ background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.2)', boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}>
                <CheckCircle className="h-7 w-7 text-electric" />
              </div>
              <h2 className="text-2xl font-bold text-frost mb-2">
                Check Your Email
              </h2>
              <p className="text-smoke text-sm mb-6">
                If an account with <strong>{email}</strong> exists, we've sent password reset instructions.
              </p>
              <Link to="/login" className="btn-primary inline-block w-full text-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
                     style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}>
                  <KeyRound className="h-7 w-7 text-obsidian" />
                </div>
                <h1 className="text-2xl font-bold text-frost">
                  Forgot Password
                </h1>
                <p className="text-smoke mt-1 text-sm">
                  Enter your email and we'll send reset instructions
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 rounded-xl text-sm font-medium text-center"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  icon={Mail}
                  required
                />
                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Send Reset Link
                </Button>
              </form>

              <p className="text-center mt-6 text-sm text-smoke">
                Remember your password?{' '}
                <Link to="/login" className="text-electric font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
