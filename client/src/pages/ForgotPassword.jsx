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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          {sent ? (
            /* Success State */
            <div className="text-center py-4">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-7 w-7 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">
                If an account with <strong>{email}</strong> exists, we've sent password reset instructions.
              </p>
              <Link to="/login" className="btn-primary inline-block">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-4 shadow-glow">
                  <KeyRound className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                  Forgot Password
                </h1>
                <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
                  Enter your email and we'll send reset instructions
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 rounded-xl bg-danger-light dark:bg-red-900/20 text-danger dark:text-red-400 text-sm font-medium text-center"
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

              <p className="text-center mt-6 text-sm text-surface-500 dark:text-surface-400">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
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
